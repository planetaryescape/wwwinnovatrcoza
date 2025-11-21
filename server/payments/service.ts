import type { PaymentProvider, PaymentConfig } from "./types";
import type { Order, PaymentIntent, InsertPaymentIntent, InsertPaymentEvent } from "@shared/schema";
import { PayFastProvider } from "./providers/payfast";
import { ZapperProvider } from "./providers/zapper";
import { ApplePayProvider } from "./providers/applepay";
import type { IStorage } from "../storage";

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();
  private storage: IStorage;

  constructor(config: PaymentConfig, storage: IStorage) {
    this.storage = storage;
    
    if (config.payfast?.merchantId) {
      const provider = new PayFastProvider(config.payfast);
      this.providers.set(provider.key, provider);
    }

    if (config.zapper?.merchantId) {
      const provider = new ZapperProvider(config.zapper);
      this.providers.set(provider.key, provider);
    }

    if (config.applePay?.merchantId && config.payfast?.merchantId) {
      const provider = new ApplePayProvider(config.applePay, config.payfast);
      this.providers.set(provider.key, provider);
    }
  }

  getAvailableProviders(currency: string = "ZAR"): string[] {
    const available: string[] = [];
    
    Array.from(this.providers.entries()).forEach(([key, provider]) => {
      if (provider.supportedCurrencies.includes(currency)) {
        available.push(key);
      }
    });

    return available;
  }

  getProvider(key: string): PaymentProvider | undefined {
    return this.providers.get(key);
  }

  selectProvider(order: Order, preferredProvider?: string): PaymentProvider {
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (provider.supportedCurrencies.includes(order.currency)) {
        return provider;
      }
    }

    const availableProviders = this.getAvailableProviders(order.currency);
    
    if (availableProviders.length === 0) {
      throw new Error(`No payment provider available for currency ${order.currency}`);
    }

    if (order.currency === "ZAR") {
      if (availableProviders.includes("payfast")) {
        return this.providers.get("payfast")!;
      }
      if (availableProviders.includes("zapper")) {
        return this.providers.get("zapper")!;
      }
    }

    return this.providers.get(availableProviders[0])!;
  }

  async createPaymentIntent(
    order: Order, 
    items: any[], 
    providerKey?: string
  ): Promise<PaymentIntent> {
    const provider = this.selectProvider(order, providerKey);
    
    const intentData = await provider.createPaymentIntent(order, items);
    
    const insertIntent: InsertPaymentIntent = {
      orderId: intentData.orderId,
      providerKey: intentData.providerKey,
      providerIntentId: intentData.providerIntentId,
      status: intentData.status,
      metadata: intentData.metadata,
    };

    const intent = await this.storage.createPaymentIntent(insertIntent);
    
    return intent;
  }

  async getCheckoutPayload(intentId: string) {
    const intent = await this.storage.getPaymentIntent(intentId);
    if (!intent) {
      throw new Error("Payment intent not found");
    }

    const order = await this.storage.getOrder(intent.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const provider = this.getProvider(intent.providerKey);
    if (!provider) {
      throw new Error(`Payment provider ${intent.providerKey} not available`);
    }

    return provider.getCheckoutPayload(intent, order);
  }

  async handleWebhook(
    providerKey: string,
    rawBody: string | Buffer,
    headers: Record<string, string>
  ): Promise<void> {
    const provider = this.getProvider(providerKey);
    if (!provider) {
      throw new Error(`Payment provider ${providerKey} not available`);
    }

    const result = await provider.handleWebhook(rawBody, headers);

    const intent = await this.storage.getPaymentIntentByProviderIntentId(result.intentId);
    if (!intent) {
      throw new Error("Payment intent not found");
    }

    const event: InsertPaymentEvent = {
      intentId: intent.id,
      providerEventId: result.intentId,
      eventType: result.eventType,
      payload: typeof rawBody === "string" ? JSON.parse(rawBody) : JSON.parse(rawBody.toString()),
      verifiedSignature: result.verified,
    };

    await this.storage.createPaymentEvent(event);

    if (result.verified && result.status === "succeeded") {
      await this.storage.updatePaymentIntent(intent.id, { status: "succeeded" });
      await this.storage.updateOrder(intent.orderId, { status: "completed" });
    } else if (result.verified && result.status === "failed") {
      await this.storage.updatePaymentIntent(intent.id, { status: "failed" });
      await this.storage.updateOrder(intent.orderId, { status: "failed" });
    }
  }
}
