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

  private getBaseUrl(): string {
    return this.config?.sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  }

  private generateSignature(data: Record<string, any>): string {
    const params = new URLSearchParams();
    
    Object.keys(data)
      .sort()
      .forEach(key => {
        if (key !== "signature" && data[key] !== "") {
          params.append(key, String(data[key]));
        }
      });

    let signatureString = params.toString();
    
    if (this.config?.passphrase) {
      signatureString += `&passphrase=${encodeURIComponent(this.config.passphrase)}`;
    }
    
    return crypto.createHash("md5").update(signatureString).digest("hex");
  }

  async createPaymentIntent(order: Order, items: any[]): Promise<any> {
    return {
      orderId: order.id,
      providerKey: this.key,
      providerIntentId: order.id,
      status: "pending",
      metadata: {
        merchantId: this.config?.merchantId,
        sandbox: this.config?.sandbox,
        items,
      },
    };
  }

  async getCheckoutPayload(intent: PaymentIntent, order: Order): Promise<CheckoutPayload> {
    const returnUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/payment/return`;
    const cancelUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/payment/cancel`;
    const notifyUrl = `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/api/webhooks/payfast`;

    const formData = {
      merchant_id: this.config?.merchantId,
      merchant_key: this.config?.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      amount: order.amount,
      item_name: order.purchaseType,
      item_description: `Innovatr ${order.purchaseType}`,
      email_address: order.customerEmail,
      name_first: order.customerName?.split(" ")[0] || "",
      name_last: order.customerName?.split(" ").slice(1).join(" ") || "",
      m_payment_id: order.id,
      email_confirmation: "1",
    };

    const signature = this.generateSignature(formData);

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
