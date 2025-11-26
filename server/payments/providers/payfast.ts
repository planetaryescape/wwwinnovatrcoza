import crypto from "crypto";
import type { PaymentProvider, CheckoutPayload, PaymentConfig } from "../types";
import type { Order, PaymentIntent, InsertPaymentIntent } from "@shared/schema";
import { isValidPayFastIp } from "../utils";

export class PayFastProvider implements PaymentProvider {
  readonly key = "payfast";
  readonly name = "PayFast";
  readonly supportedCurrencies = ["ZAR"];
  readonly supportsSubscriptions = true;

  private config: PaymentConfig["payfast"];

  constructor(config: PaymentConfig["payfast"]) {
    this.config = config;
  }

  private getCredentials() {
    // Return the credentials that were passed in
    // (they're already environment-specific from routes.ts)
    return {
      merchantId: this.config?.merchantId || "",
      merchantKey: this.config?.merchantKey || "",
      passphrase: this.config?.passphrase,
    };
  }

  private getBaseUrl(): string {
    return this.config?.sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  private generateSignature(data: Record<string, any>): string {
    // Generate signature exactly as PayFast expects
    // Build string in order: key=encodedvalue&key2=encodedvalue2...&passphrase=encodedpassphrase
    let pfOutput = "";
    
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        const value = String(data[key]).trim();
        // Only add non-empty values
        if (value !== "") {
          const encoded = encodeURIComponent(value).replace(/%20/g, "+");
          pfOutput += `${key}=${encoded}&`;
        }
      }
    }

    // Remove trailing ampersand
    let getString = pfOutput.slice(0, -1);
    
    const credentials = this.getCredentials();
    if (credentials.passphrase) {
      const encodedPassphrase = encodeURIComponent(credentials.passphrase.trim()).replace(/%20/g, "+");
      getString += `&passphrase=${encodedPassphrase}`;
    }

    const hash = crypto.createHash("md5").update(getString).digest("hex");
    console.log("Signature string:", getString);
    console.log("MD5 hash:", hash);
    return hash;
  }

  async createPaymentIntent(order: Order, items: any[]): Promise<any> {
    const credentials = this.getCredentials();
    return {
      orderId: order.id,
      providerKey: this.key,
      providerIntentId: order.id,
      status: "pending",
      metadata: {
        merchantId: credentials.merchantId,
        sandbox: this.config?.sandbox,
        items,
      },
    };
  }

  async getCheckoutPayload(intent: PaymentIntent, order: Order): Promise<CheckoutPayload> {
    // Build base URL - use DEV_URL environment variable, fall back to localhost
    const baseUrl = process.env.DEV_URL || "http://localhost:5000";
    
    const returnUrl = `${baseUrl}/payment/return`;
    const cancelUrl = `${baseUrl}/payment/cancel`;
    const notifyUrl = `${baseUrl}/api/webhooks/payfast`;
    const credentials = this.getCredentials();

    // Ensure amount is a string and properly formatted
    const amountStr = typeof order.amount === "number" 
      ? (order.amount as number).toFixed(2)
      : String(order.amount);

    const formData = {
      merchant_id: credentials.merchantId,
      merchant_key: credentials.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      amount: amountStr,
      item_name: (order.purchaseType || "").trim(),
      item_description: (`Innovatr ${order.purchaseType}` || "").trim(),
      email_address: (order.customerEmail || "").trim(),
      name_first: (order.customerName?.split(" ")[0] || "").trim(),
      name_last: (order.customerName?.split(" ").slice(1).join(" ") || "").trim(),
      m_payment_id: String(order.id).trim(),
      email_confirmation: "1",
    };

    console.log("=== PayFast Form Data ===");
    console.log(JSON.stringify(formData, null, 2));
    const signature = this.generateSignature(formData);
    console.log("Generated signature:", signature);
    console.log("========================");

    return {
      type: "form",
      data: {
        action: this.getBaseUrl(),
        fields: { ...formData, signature },
      },
    };
  }

  async handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<{
    intentId: string;
    status: string;
    eventType: string;
    verified: boolean;
  }> {
    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    
    params.forEach((value, key) => {
      data[key] = value;
    });

    const receivedSignature = data.signature;
    delete data.signature;

    const calculatedSignature = this.generateSignature(data);
    const verified = receivedSignature === calculatedSignature;

    const sourceIp = (headers["x-forwarded-for"] as string)?.split(",")[0].trim() || (headers["x-real-ip"] as string);
    const ipVerified = isValidPayFastIp(sourceIp);

    return {
      intentId: data.m_payment_id,
      status: data.payment_status === "COMPLETE" ? "succeeded" : "failed",
      eventType: `payment.${data.payment_status?.toLowerCase()}`,
      verified: verified && !!ipVerified,
    };
  }

  async refund(intentId: string, amount?: number): Promise<void> {
    throw new Error("PayFast refunds must be processed via merchant dashboard");
  }
}
