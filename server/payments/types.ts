import type { Order, PaymentIntent } from "@shared/schema";

export interface CheckoutPayload {
  type: "form" | "redirect" | "qr" | "applepay";
  data: any;
}

export interface PaymentProvider {
  readonly key: string;
  readonly name: string;
  readonly supportedCurrencies: string[];
  readonly supportsSubscriptions: boolean;

  createPaymentIntent(order: Order, items: any[]): Promise<PaymentIntent>;
  getCheckoutPayload(intent: PaymentIntent, order: Order): Promise<CheckoutPayload>;
  handleWebhook(rawBody: string | Buffer | Record<string, any>, headers: Record<string, string>): Promise<{
    intentId: string;
    status: string;
    eventType: string;
    verified: boolean;
  }>;
  refund?(intentId: string, amount?: number): Promise<void>;
}

export interface PaymentConfig {
  payfast?: {
    merchantId: string;
    merchantKey: string;
    passphrase?: string;
    sandbox: boolean;
    sandboxMerchantId?: string;
    sandboxMerchantKey?: string;
    sandboxPassphrase?: string;
  };
  zapper?: {
    merchantId: string;
    siteId: string;
    apiKey: string;
    sandbox: boolean;
  };
  applePay?: {
    merchantId: string;
    provider: "payfast" | "paystack";
  };
}
