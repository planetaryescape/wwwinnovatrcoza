import type { PaymentProvider, CheckoutPayload, PaymentConfig } from "../types";
import type { Order, PaymentIntent } from "@shared/schema";
import { PayFastProvider } from "./payfast";

export class ApplePayProvider implements PaymentProvider {
  readonly key = "applepay";
  readonly name = "Apple Pay";
  readonly supportedCurrencies = ["ZAR", "USD", "EUR", "GBP"];
  readonly supportsSubscriptions = false;

  private config: PaymentConfig["applePay"];
  private delegateProvider: PaymentProvider;

  constructor(config: PaymentConfig["applePay"], payfastConfig: PaymentConfig["payfast"]) {
    this.config = config;
    
    if (config.provider === "payfast") {
      this.delegateProvider = new PayFastProvider(payfastConfig);
    } else {
      throw new Error(`Apple Pay provider ${config.provider} not yet implemented`);
    }
  }

  async createPaymentIntent(order: Order, items: any[]): Promise<any> {
    const intent = await this.delegateProvider.createPaymentIntent(order, items);
    const metadata = (intent.metadata as Record<string, any>) || {};
    return {
      ...intent,
      providerKey: this.key,
      metadata: {
        ...metadata,
        applePayMerchantId: this.config.merchantId,
        delegateProvider: this.config.provider,
      },
    };
  }

  async getCheckoutPayload(intent: PaymentIntent, order: Order): Promise<CheckoutPayload> {
    return {
      type: "applepay",
      data: {
        merchantId: this.config.merchantId,
        countryCode: "ZA",
        currencyCode: order.currency,
        total: {
          label: `Innovatr ${order.purchaseType}`,
          amount: order.amount,
        },
      },
    };
  }

  async handleWebhook(rawBody: string | Buffer, headers: Record<string, string>): Promise<{
    intentId: string;
    status: string;
    eventType: string;
    verified: boolean;
  }> {
    return this.delegateProvider.handleWebhook(rawBody, headers);
  }
}
