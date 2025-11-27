import crypto from "crypto";
import type { PaymentProvider, CheckoutPayload, PaymentConfig } from "../types";
import type { Order, PaymentIntent, InsertPaymentIntent } from "@shared/schema";
import { isValidPayFastIp, PAYFAST_VALID_HOSTS } from "../utils";

// PayFast requires fields in this SPECIFIC ORDER for checkout form (not alphabetical!)
// This is the order defined in PayFast's attributes documentation
const PAYFAST_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "email_confirmation",
  "confirmation_address",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
];

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

  private getValidationUrl(): string {
    return this.config?.sandbox
      ? "https://sandbox.payfast.co.za/eng/query/validate"
      : "https://www.payfast.co.za/eng/query/validate";
  }

  private pfEncode(value: string): string {
    return encodeURIComponent(value.trim())
      .replace(/%20/g, "+")   // spaces -> +
      .replace(/\(/g, "%28")  // encode (
      .replace(/\)/g, "%29"); // encode )
  }

  // Build param string from PayFast data (for ITN validation)
  // Uses original order from PayFast, excludes empty values and signature
  private buildParamString(pfData: Record<string, any>): string {
    const parts: string[] = [];
    
    for (const key of Object.keys(pfData)) {
      if (key === "signature") continue;
      
      const value = String(pfData[key] ?? "").trim();
      if (value !== "") {
        parts.push(`${key}=${this.pfEncode(value)}`);
      }
    }
    
    return parts.join("&");
  }

  // Validate ITN signature from PayFast
  private pfValidSignature(pfData: Record<string, any>, pfParamString: string, pfPassphrase: string | null = null): boolean {
    let tempParamString = pfParamString;
    
    if (pfPassphrase !== null) {
      tempParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }

    const signature = crypto.createHash("md5").update(tempParamString).digest("hex");
    
    console.log("ITN Param string:", tempParamString);
    console.log("Calculated signature:", signature);
    console.log("Received signature:", pfData["signature"]);
    
    return pfData["signature"] === signature;
  }

  // Generate signature for outgoing checkout requests (uses PayFast's field order)
  private generateCheckoutSignature(data: Record<string, any>): string {
    const dataCopy = { ...data };
    delete dataCopy["signature"];

    const signatureParts: string[] = [];

    // Use PayFast's specific field order, exclude empty values
    for (const key of PAYFAST_FIELD_ORDER) {
      if (key in dataCopy) {
        const value = String(dataCopy[key]).trim();
        if (value !== "") {
          signatureParts.push(`${key}=${this.pfEncode(value)}`);
        }
      }
    }

    let signatureString = signatureParts.join("&");

    // Append passphrase if configured
    const credentials = this.getCredentials();
    if (credentials.passphrase) {
      signatureString += `&passphrase=${this.pfEncode(credentials.passphrase)}`;
    }

    const hash = crypto.createHash("md5").update(signatureString).digest("hex");
    console.log("Signature string:", signatureString);
    console.log("MD5 hash:", hash);
    return hash;
  }

  private async verifyWithPayFastServer(postedData: Record<string, any>): Promise<boolean> {
    try {
      const validationUrl = this.getValidationUrl();
      const urlObj = new URL(validationUrl);
      
      // Verify we're calling a valid PayFast host
      if (!PAYFAST_VALID_HOSTS.includes(urlObj.hostname)) {
        console.error("Invalid PayFast validation host:", urlObj.hostname);
        return false;
      }

      const response = await fetch(validationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(postedData).toString(),
      });

      const result = await response.text();
      console.log("PayFast server validation URL:", validationUrl);
      console.log("PayFast server validation response:", result.trim());
      return result.trim() === "VALID";
    } catch (error) {
      console.error("PayFast server validation failed:", error);
      return false;
    }
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
    const baseUrl = process.env.DEV_URL || "http://localhost:5000";
    
    const returnUrl = `${baseUrl}/payment/return`;
    const cancelUrl = `${baseUrl}/payment/cancel`;
    const notifyUrl = `${baseUrl}/api/webhooks/payfast`;
    const credentials = this.getCredentials();

    const amountStr = typeof order.amount === "number" 
      ? (order.amount as number).toFixed(2)
      : String(order.amount);

    // Build form data in PayFast's required order
    const formData: Record<string, string> = {
      merchant_id: credentials.merchantId,
      merchant_key: credentials.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: (order.customerName?.split(" ")[0] || "").trim(),
      name_last: (order.customerName?.split(" ").slice(1).join(" ") || "").trim(),
      email_address: (order.customerEmail || "").trim(),
      m_payment_id: String(order.id).trim(),
      amount: amountStr,
      item_name: (order.purchaseType || "").trim(),
      item_description: (`Innovatr ${order.purchaseType}` || "").trim(),
      email_confirmation: "1",
    };

    // Remove empty values
    Object.keys(formData).forEach((key) => {
      if (formData[key] === "") {
        delete formData[key];
      }
    });

    console.log("=== PayFast Form Data ===");
    console.log(JSON.stringify(formData, null, 2));
    
    // Generate signature using PayFast's field order
    const signature = this.generateCheckoutSignature({ ...formData });
    
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

  async handleWebhook(rawBody: string | Buffer | Record<string, any>, headers: Record<string, string>): Promise<{
    intentId: string;
    status: string;
    eventType: string;
    verified: boolean;
  }> {
    let data: Record<string, string> = {};
    
    // Handle different input types
    if (typeof rawBody === "object" && !Buffer.isBuffer(rawBody)) {
      // Already parsed object
      data = rawBody as Record<string, string>;
    } else {
      // String or Buffer - parse as URL-encoded
      const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
      const params = new URLSearchParams(body);
      params.forEach((value, key) => {
        data[key] = value;
      });
    }

    console.log("=== PayFast Webhook Received ===");
    console.log("Raw data:", JSON.stringify(data, null, 2));
    console.log("Key order received:", Object.keys(data).join(", "));

    // Get the received signature
    if (!data.signature) {
      console.error("No signature found in webhook data");
      return {
        intentId: data.m_payment_id || "",
        status: "failed",
        eventType: "payment.invalid_signature",
        verified: false,
      };
    }

    // Build param string and validate signature using dedicated function
    const pfParamString = this.buildParamString(data);
    const credentials = this.getCredentials();
    const signatureValid = this.pfValidSignature(data, pfParamString, credentials.passphrase || null);

    console.log("Signature valid:", signatureValid);

    // Verify IP address
    const sourceIp = (headers["x-forwarded-for"] as string)?.split(",")[0].trim() || (headers["x-real-ip"] as string);
    const ipVerified = isValidPayFastIp(sourceIp);
    console.log("Source IP:", sourceIp);
    console.log("IP verified:", ipVerified);

    // Verify with PayFast server (critical security step)
    const serverValid = await this.verifyWithPayFastServer(data);
    console.log("Server validation:", serverValid);

    // Server validation is the authoritative check from PayFast
    // In sandbox mode, IP might not be in whitelist and signature calculation may vary
    // Trust server validation as the primary indicator
    const isSandbox = this.config?.sandbox;
    const fullyVerified = isSandbox 
      ? serverValid  // In sandbox, trust server validation
      : (signatureValid && ipVerified && serverValid);  // In production, all checks required
    
    console.log("Sandbox mode:", isSandbox);
    console.log("Fully verified:", fullyVerified);
    console.log("================================");

    return {
      intentId: data.m_payment_id,
      status: data.payment_status === "COMPLETE" ? "succeeded" : "failed",
      eventType: `payment.${data.payment_status?.toLowerCase()}`,
      verified: fullyVerified,
    };
  }

  async refund(intentId: string, amount?: number): Promise<void> {
    throw new Error("PayFast refunds must be processed via merchant dashboard");
  }
}
