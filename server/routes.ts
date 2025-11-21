import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCouponClaimSchema, insertMailerSubscriptionSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { PaymentService } from "./payments/service";
import type { PaymentConfig } from "./payments/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const paymentConfig: PaymentConfig = {
    payfast: process.env.PAYFAST_MERCHANT_ID ? {
      merchantId: process.env.PAYFAST_MERCHANT_ID,
      merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
      passphrase: process.env.PAYFAST_PASSPHRASE,
      sandbox: process.env.PAYFAST_SANDBOX === "true",
    } : undefined,
    zapper: process.env.ZAPPER_MERCHANT_ID ? {
      merchantId: process.env.ZAPPER_MERCHANT_ID,
      siteId: process.env.ZAPPER_SITE_ID!,
      apiKey: process.env.ZAPPER_API_KEY!,
      sandbox: process.env.ZAPPER_SANDBOX === "true",
    } : undefined,
    applePay: process.env.APPLE_PAY_MERCHANT_ID ? {
      merchantId: process.env.APPLE_PAY_MERCHANT_ID,
      provider: "payfast",
    } : undefined,
  };

  const paymentService = new PaymentService(paymentConfig, storage);

  app.post("/api/coupon-claims", async (req, res) => {
    try {
      const validatedData = insertCouponClaimSchema.parse(req.body);
      
      const existingClaim = await storage.getCouponClaimByEmail(validatedData.email);
      if (existingClaim) {
        return res.status(200).json(existingClaim);
      }

      const claim = await storage.createCouponClaim(validatedData);
      res.status(201).json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/mailer-subscriptions", async (req, res) => {
    try {
      const validatedData = insertMailerSubscriptionSchema.parse(req.body);
      
      const existingSubscription = await storage.getMailerSubscriptionByEmail(validatedData.email);
      if (existingSubscription) {
        return res.status(200).json({ message: "Already subscribed", subscription: existingSubscription });
      }

      const subscription = await storage.createMailerSubscription(validatedData);
      res.status(201).json({ message: "Successfully subscribed to Pulse Insights", subscription });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedOrder = insertOrderSchema.parse(req.body.order);
      const validatedItems = req.body.items?.map((item: any) => insertOrderItemSchema.parse(item)) || [];

      const order = await storage.createOrder(validatedOrder);
      
      for (const itemData of validatedItems) {
        await storage.createOrderItem({
          ...itemData,
          orderId: order.id,
        });
      }

      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payment-intents", async (req, res) => {
    try {
      const { orderId, items, providerKey } = req.body;

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const intent = await paymentService.createPaymentIntent(order, items || [], providerKey);
      res.status(201).json(intent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/payment-intents/:id/checkout", async (req, res) => {
    try {
      const payload = await paymentService.getCheckoutPayload(req.params.id);
      res.json(payload);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/payment/providers", async (req, res) => {
    try {
      const currency = (req.query.currency as string) || "ZAR";
      const providers = paymentService.getAvailableProviders(currency);
      res.json({ providers });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/webhooks/payfast", async (req, res) => {
    try {
      const rawBody = (req as any).rawBody || req.body;
      await paymentService.handleWebhook("payfast", rawBody, req.headers as Record<string, string>);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("PayFast webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/webhooks/zapper", async (req, res) => {
    try {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      await paymentService.handleWebhook("zapper", rawBody, req.headers as Record<string, string>);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Zapper webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/webhooks/applepay", async (req, res) => {
    try {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      await paymentService.handleWebhook("applepay", rawBody, req.headers as Record<string, string>);
      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Apple Pay webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
