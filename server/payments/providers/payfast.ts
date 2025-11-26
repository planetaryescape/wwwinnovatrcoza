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
    // Generate signature exactly as PayFast expects - with specific key ordering
    const keys = Object.keys(data).sort();
    let pfOutput = "";
    
    console.log("=== PayFast Signature Generation Debug ===");
    console.log("Sorted keys:", keys);
    console.log("Data object:", data);
    
    for (const key of keys) {
      if (data.hasOwnProperty(key)) {
        const value = String(data[key]).trim();
        if (value !== "") {
          const encoded = encodeURIComponent(value).replace(/%20/g, "+");
          console.log(`  ${key}: "${value}" -> encoded: "${encoded}"`);
          pfOutput += `${key}=${encoded}&`;
        }
      }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    
    const credentials = this.getCredentials();
    if (credentials.passphrase) {
      const encodedPassphrase = encodeURIComponent(credentials.passphrase.trim()).replace(/%20/g, "+");
      console.log(`  passphrase: "${credentials.passphrase.trim()}" -> encoded: "${encodedPassphrase}"`);
      getString += `&passphrase=${encodedPassphrase}`;
    }

    console.log("Final signature string:", getString);
    const signature = crypto.createHash("md5").update(getString).digest("hex");
    console.log("Generated MD5 signature:", signature);
    console.log("========================================\n");

    return signature;
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
    const returnUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/payment/return`;
    const cancelUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/payment/cancel`;
    const notifyUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/api/webhooks/payfast`;
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
      item_name: order.purchaseType || "",
      item_description: `Innovatr ${order.purchaseType}` || "",
      email_address: order.customerEmail || "",
      name_first: (order.customerName?.split(" ")[0] || "").trim(),
      name_last: (order.customerName?.split(" ").slice(1).join(" ") || "").trim(),
      m_payment_id: String(order.id),
      email_confirmation: "1",
    };

    console.log("\n=== PayFast Checkout Form Data ===");
    console.log("Merchant ID:", credentials.merchantId);
    console.log("Merchant Key:", credentials.merchantKey);
    console.log("Sandbox Mode:", this.config?.sandbox);
    console.log("Amount:", amountStr);
    console.log("Order ID:", order.id);
    console.log("Customer Email:", order.customerEmail);
    console.log("Customer Name:", order.customerName);
    console.log("Form Data:", formData);
    const signature = this.generateSignature(formData);
    console.log("Final Form Data with signature:", { ...formData, signature });

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
    console.log("\n=== PayFast Webhook Received ===");
    console.log("Raw body:", body);
    
    const params = new URLSearchParams(body);
    const data: Record<string, string> = {};
    
    params.forEach((value, key) => {
      data[key] = value;
    });

    const receivedSignature = data.signature;
    console.log("Received signature:", receivedSignature);
    
    delete data.signature;
    console.log("Data for signature verification:", data);

    const calculatedSignature = this.generateSignature(data);
    const verified = receivedSignature === calculatedSignature;
    console.log("Signature match:", verified);
    console.log("===============================\n");

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
