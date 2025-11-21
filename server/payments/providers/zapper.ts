import type { PaymentProvider, CheckoutPayload, PaymentConfig } from "../types";
import type { Order, PaymentIntent } from "@shared/schema";

export class ZapperProvider implements PaymentProvider {
  readonly key = "zapper";
  readonly name = "Zapper";
  readonly supportedCurrencies = ["ZAR"];
  readonly supportsSubscriptions = false;

  private config: PaymentConfig["zapper"];

  constructor(config: PaymentConfig["zapper"]) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return this.config.sandbox
      ? "https://sandbox.zapper.com/api/v1"
      : "https://api.zapper.com/v1";
  }

  async createPaymentIntent(order: Order, items: any[]): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        merchantId: this.config.merchantId,
        merchantSiteId: this.config.siteId,
        amount: parseFloat(order.amount),
        currency: order.currency,
        reference: order.id,
        description: `Innovatr ${order.purchaseType}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zapper API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      orderId: order.id,
      providerKey: this.key,
      providerIntentId: data.invoiceId || data.id,
      status: "pending",
      metadata: {
        qrCode: data.qrCode,
        paymentUrl: data.paymentUrl,
        items,
      },
    };
  }

  async getCheckoutPayload(intent: PaymentIntent, order: Order): Promise<CheckoutPayload> {
    const metadata = intent.metadata as any;
    
    return {
      type: "qr",
      data: {
        qrCode: metadata.qrCode,
        paymentUrl: metadata.paymentUrl,
        invoiceId: intent.providerIntentId,
        amount: order.amount,
        currency: order.currency,
      },
    };
  }

  async handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<{
    intentId: string;
    status: string;
    eventType: string;
    verified: boolean;
  }> {
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString("utf-8"));

    const verified = true;

    return {
      intentId: body.reference || body.merchantReference,
      status: body.status === "paid" ? "succeeded" : body.status === "cancelled" ? "canceled" : "pending",
      eventType: `payment.${body.status}`,
      verified,
    };
  }

  async checkPaymentStatus(invoiceId: string): Promise<string> {
    const response = await fetch(`${this.getBaseUrl()}/invoice/${invoiceId}/status`, {
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Zapper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.status;
  }
}
