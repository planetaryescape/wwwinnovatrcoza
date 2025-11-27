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
      recurringAmount?: number;
    },
    providerKey: string = "payfast",
    subscriptionOptions?: {
      subscriptionType?: number;
      frequency?: number;
      cycles?: number;
      recurringAmount?: number;
      billingDate?: number;
    }
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

    // Store pending order data in payment intent metadata (including subscription info)
    const insertIntent: InsertPaymentIntent = {
      orderId: pendingId, // Use pending ID, will be updated on success
      providerKey: providerKey,
      providerIntentId: pendingId,
      status: "pending",
      metadata: {
        pendingOrder: { ...pendingOrderData, isSubscription: !!subscriptionOptions },
        isPending: true,
        subscriptionOptions,
      } as Record<string, unknown>,
    };

    const intent = await this.storage.createPaymentIntent(insertIntent);

    // Get checkout payload using mock order, passing subscription options if present
    // PayFast provider accepts subscription options as third parameter
    const checkoutPayload = await (provider as any).getCheckoutPayload(intent, mockOrder, subscriptionOptions);

    return checkoutPayload;
  }

  async handleWebhook(
    providerKey: string,
    rawBody: string | Buffer | Record<string, any>,
    headers: Record<string, string>
  ): Promise<{ 
    intent: PaymentIntent | null; 
    orderCreated: boolean;
    subscriptionData?: {
      token?: string;
      billingDate?: string;
      cyclesCompleted?: number;
      cyclesRemaining?: number;
      amount?: number;
      customerEmail?: string;
      customerName?: string;
    };
    eventType?: string;
  }> {
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
      // Already parsed object - convert to plain object (multer returns [Object: null prototype])
      payload = { ...rawBody as Record<string, any> };
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

        // SECURITY CHECK: Validate payment amount matches expected amount
        const expectedAmount = parseFloat(pendingOrder.amount);
        const paidAmount = parseFloat(payload.amount_gross || "0");
        const amountValid = Math.abs(expectedAmount - paidAmount) <= 0.01;
        
        console.log("=== Payment Amount Validation ===");
        console.log("Expected amount:", expectedAmount);
        console.log("Paid amount (amount_gross):", paidAmount);
        console.log("Amount valid:", amountValid);
        console.log("================================");

        if (!amountValid) {
          console.error("Payment amount mismatch! Expected:", expectedAmount, "Received:", paidAmount);
          await this.storage.updatePaymentIntent(intent.id, { status: "failed" });
          throw new Error(`Payment amount mismatch: expected ${expectedAmount}, received ${paidAmount}`);
        }

        await this.storage.updatePaymentIntent(intent.id, { status: "succeeded" });

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

        // Update local intent object with real order ID for return
        intent.orderId = order.id;
        orderCreated = true;
      } else {
        // Legacy flow - update existing order
        const existingOrder = await this.storage.getOrder(intent.orderId);
        if (existingOrder) {
          // Validate payment amount for existing orders too
          const expectedAmount = parseFloat(String(existingOrder.amount));
          const paidAmount = parseFloat(payload.amount_gross || "0");
          const amountValid = Math.abs(expectedAmount - paidAmount) <= 0.01;
          
          console.log("=== Payment Amount Validation (Legacy) ===");
          console.log("Expected amount:", expectedAmount);
          console.log("Paid amount (amount_gross):", paidAmount);
          console.log("Amount valid:", amountValid);
          console.log("==========================================");

          if (!amountValid) {
            console.error("Payment amount mismatch! Expected:", expectedAmount, "Received:", paidAmount);
            await this.storage.updatePaymentIntent(intent.id, { status: "failed" });
            await this.storage.updateOrder(intent.orderId, { status: "failed" });
            throw new Error(`Payment amount mismatch: expected ${expectedAmount}, received ${paidAmount}`);
          }
        }
        
        await this.storage.updatePaymentIntent(intent.id, { status: "succeeded" });
        await this.storage.updateOrder(intent.orderId, { status: "completed" });
      }
    } else if (result.verified && result.status === "failed") {
      await this.storage.updatePaymentIntent(intent.id, { status: "failed" });
      
      const metadata = intent.metadata as Record<string, unknown> | null;
      if (!metadata?.isPending) {
        await this.storage.updateOrder(intent.orderId, { status: "failed" });
      }
    }

    // Return subscription data if available (from PayFast provider)
    const subscriptionData = (result as any).subscriptionData;

    return { 
      intent, 
      orderCreated,
      subscriptionData,
      eventType: result.eventType,
    };
  }
}
