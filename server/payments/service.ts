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
      metadata: intentData.metadata as Record<string, unknown>,
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

  // New method: Create checkout with pending order data (order created on webhook success)
  async createCheckoutWithPendingOrder(
    pendingOrderData: {
      customerName: string;
      customerEmail: string;
      customerCompany: string;
      amount: string;
      currency: string;
      purchaseType: string;
      items: any[];
    },
    providerKey: string = "payfast"
  ) {
    const provider = this.getProvider(providerKey);
    if (!provider) {
      throw new Error(`Payment provider ${providerKey} not available`);
    }

    // Generate a unique ID for this pending payment
    const pendingId = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create a mock order object for the provider (not saved to DB)
    const mockOrder: Order = {
      id: pendingId,
      userId: null,
      amount: pendingOrderData.amount,
      currency: pendingOrderData.currency,
      purchaseType: pendingOrderData.purchaseType,
      status: "pending",
      customerName: pendingOrderData.customerName,
      customerEmail: pendingOrderData.customerEmail,
      customerCompany: pendingOrderData.customerCompany,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store pending order data in payment intent metadata
    const insertIntent: InsertPaymentIntent = {
      orderId: pendingId, // Use pending ID, will be updated on success
      providerKey: providerKey,
      providerIntentId: pendingId,
      status: "pending",
      metadata: {
        pendingOrder: pendingOrderData,
        isPending: true,
      } as Record<string, unknown>,
    };

    const intent = await this.storage.createPaymentIntent(insertIntent);

    // Get checkout payload using mock order
    const checkoutPayload = await provider.getCheckoutPayload(intent, mockOrder);

    return checkoutPayload;
  }

  async handleWebhook(
    providerKey: string,
    rawBody: string | Buffer | Record<string, any>,
    headers: Record<string, string>
  ): Promise<{ intent: PaymentIntent | null; orderCreated: boolean }> {
    const provider = this.getProvider(providerKey);
    if (!provider) {
      throw new Error(`Payment provider ${providerKey} not available`);
    }

    const result = await provider.handleWebhook(rawBody, headers);

    const intent = await this.storage.getPaymentIntentByProviderIntentId(result.intentId);
    if (!intent) {
      throw new Error("Payment intent not found");
    }

    // Parse payload - handle JSON, URL-encoded, or already-parsed object
    let payload: Record<string, any>;
    if (typeof rawBody === "object" && !Buffer.isBuffer(rawBody)) {
      // Already parsed object
      payload = rawBody as Record<string, any>;
    } else {
      const bodyStr = typeof rawBody === "string" ? rawBody : rawBody.toString();
      try {
        payload = JSON.parse(bodyStr);
      } catch {
        // If not JSON, parse as URL-encoded (PayFast uses this format)
        payload = Object.fromEntries(new URLSearchParams(bodyStr));
      }
    }

    const event: InsertPaymentEvent = {
      intentId: intent.id,
      providerEventId: result.intentId,
      eventType: result.eventType,
      payload,
      verifiedSignature: result.verified,
    };

    await this.storage.createPaymentEvent(event);

    let orderCreated = false;

    if (result.verified && result.status === "succeeded") {
      await this.storage.updatePaymentIntent(intent.id, { status: "succeeded" });
      
      // Check if this is a pending order that needs to be created
      const metadata = intent.metadata as Record<string, unknown> | null;
      if (metadata?.isPending && metadata?.pendingOrder) {
        const pendingOrder = metadata.pendingOrder as {
          customerName: string;
          customerEmail: string;
          customerCompany: string;
          amount: string;
          currency: string;
          purchaseType: string;
          items: any[];
        };

        // NOW create the actual order
        const order = await this.storage.createOrder({
          customerName: pendingOrder.customerName,
          customerEmail: pendingOrder.customerEmail,
          customerCompany: pendingOrder.customerCompany,
          amount: pendingOrder.amount,
          currency: pendingOrder.currency,
          purchaseType: pendingOrder.purchaseType,
          status: "completed",
        });

        // Create order items
        for (const item of pendingOrder.items) {
          await this.storage.createOrderItem({
            orderId: order.id,
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitAmount: item.unitAmount,
          });
        }

        // Update intent with real order ID
        await this.storage.updatePaymentIntent(intent.id, { 
          orderId: order.id,
          metadata: { ...metadata, isPending: false, actualOrderId: order.id },
        });

        orderCreated = true;
      } else {
        // Legacy flow - update existing order
        await this.storage.updateOrder(intent.orderId, { status: "completed" });
      }
    } else if (result.verified && result.status === "failed") {
      await this.storage.updatePaymentIntent(intent.id, { status: "failed" });
      
      const metadata = intent.metadata as Record<string, unknown> | null;
      if (!metadata?.isPending) {
        await this.storage.updateOrder(intent.orderId, { status: "failed" });
      }
    }

    return { intent, orderCreated };
  }
}
