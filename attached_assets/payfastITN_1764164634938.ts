import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import express from "express";
import bodyParser from "body-parser";
import { db } from "./firebase";
import crypto from "crypto";
import axios from "axios";

const app = express();

// PayFast sends: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// PAYFAST VALIDATION URL
const PAYFAST_VALIDATION_URL = "https://sandbox.payfast.co.za/eng/query/validate";

const PASS_PHRASE = "";

/**
 * Generate PayFast signature
 */
const generateSignature = (data: Record<string, any>): string => {
  delete data["signature"];
  delete data["pf_signature"];

  const sortedKeys = Object.keys(data).sort();

  const signatureString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const finalString = PASS_PHRASE
    ? signatureString + `&passphrase=${encodeURIComponent(PASS_PHRASE).replace(/%20/g, "+")}`
    : signatureString;

  return crypto.createHash("md5").update(finalString).digest("hex");
};

/**
 * Validate signature from PayFast
 */
const isSignatureValid = (postedData: Record<string, any>): boolean => {
  const receivedSignature = postedData["pf_signature"];
  if (!receivedSignature) return false;

  const calculatedSignature = generateSignature(postedData);
  return receivedSignature === calculatedSignature;
};

/**
 * Validate against PayFast server
 */
const verifyWithPayFastServer = async (postedData: Record<string, any>): Promise<boolean> => {
  try {
    const response = await axios.post(
      PAYFAST_VALIDATION_URL,
      new URLSearchParams(postedData).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return response.data === "VALID";
  } catch (error) {
    console.error("PayFast server validation failed:", error);
    return false;
  }
};

app.post("/", async (req, res) => {
  try {
    console.log("RAW ITN:", req.body);
    const postedData = req.body;

    if (!isSignatureValid(postedData)) {
      console.error("INVALID SIGNATURE");
      return res.status(400).send("Invalid signature");
    }

    const serverValid = await verifyWithPayFastServer(postedData);
    if (!serverValid) {
      console.error("SERVER VALIDATION FAILED");
      return res.status(400).send("Validation failed");
    }

    const userId = req.body["custom_str1"];
    const paymentStatus = req.body["payment_status"];
    const pfSubscriptionId = req.body["token"];

    if (!userId) {
      console.error("Missing custom_str1 (userId)");
      return res.status(400).send("Missing userId");
    }

    let mappedStatus = "INACTIVE";

    if (paymentStatus === "COMPLETE" || paymentStatus === "ACTIVE") {
      mappedStatus = "ACTIVE";
    } else if (paymentStatus === "CANCELLED") {
      mappedStatus = "CANCELLED";
    } else if (paymentStatus === "FAILED") {
      mappedStatus = "FAILED";
    }

    await db
      .collection("subscriptions")
      .doc(userId)
      .set(
        {
          status: mappedStatus,
          pf_subscription_id: pfSubscriptionId || null,
          raw: req.body,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log("Subscription updated:", userId);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("ITN ERROR:", error);
    return res.status(500).send("FAIL");
  }
});

export const payfastITN = onRequest(
  { region: "europe-west1", invoker: "public" },
  app
);
