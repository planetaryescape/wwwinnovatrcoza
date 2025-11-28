import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { insertCouponClaimSchema, insertMailerSubscriptionSchema, insertOrderSchema, insertOrderItemWithoutOrderIdSchema, insertReportSchema, insertDealSchema, insertInquirySchema } from "@shared/schema";
import { PaymentService } from "./payments/service";
import type { PaymentConfig } from "./payments/types";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation, sendContactFormMessage } from "./emails/email-service";
import { uploadFile, downloadFile, deleteFile, listFiles, fileExists } from "./app-storage";
import { generateInvoicePdf } from "./invoices/generator";

// Multer for handling multipart/form-data (PayFast webhooks)
const upload = multer();

// Multer for file uploads with memory storage
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WebP, GIF, and PDF files are allowed."));
    }
  },
});

// Helper to check if user is admin
const isAdminUser = (email?: string) => {
  return email === "hannah@innovatr.co.za" || email === "richard@innovatr.co.za";
};

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Determine PayFast credentials - support both generic and sandbox/production-specific
  const isSandbox = process.env.PAYFAST_SANDBOX === "true";
  const payfastMerchantId = isSandbox 
    ? process.env.PAYFAST_SANDBOX_MERCHANT_ID || process.env.PAYFAST_MERCHANT_ID
    : process.env.PAYFAST_PRODUCTION_MERCHANT_ID || process.env.PAYFAST_MERCHANT_ID;
  const payfastMerchantKey = isSandbox
    ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY || process.env.PAYFAST_MERCHANT_KEY
    : process.env.PAYFAST_PRODUCTION_MERCHANT_KEY || process.env.PAYFAST_MERCHANT_KEY;
  const payfastPassphrase = isSandbox
    ? process.env.PAYFAST_SANDBOX_PASSPHRASE || process.env.PAYFAST_PASSPHRASE
    : process.env.PAYFAST_PRODUCTION_PASSPHRASE || process.env.PAYFAST_PASSPHRASE;

  const paymentConfig: PaymentConfig = {
    payfast: payfastMerchantId ? {
      merchantId: payfastMerchantId,
      merchantKey: payfastMerchantKey!,
      passphrase: payfastPassphrase,
      sandbox: isSandbox,
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
      const validatedItems = req.body.items?.map((item: any) => insertOrderItemWithoutOrderIdSchema.parse(item)) || [];

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

  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedInquiry = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedInquiry);
      res.status(201).json(inquiry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const { z } = await import("zod");
      
      const contactSchema = z.object({
        name: z.string().min(1, "Name is required").max(100, "Name is too long"),
        email: z.string().email("Please provide a valid email address"),
        company: z.string().min(1, "Company is required").max(100, "Company name is too long"),
        message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
      });

      const validated = contactSchema.parse(req.body);

      await sendContactFormMessage({
        name: validated.name,
        email: validated.email,
        company: validated.company,
        message: validated.message,
      });
      
      res.status(200).json({ success: true, message: "Message sent successfully" });
    } catch (error: any) {
      console.error("Contact form error:", error);
      if (error.name === "ZodError") {
        const firstError = error.errors?.[0]?.message || "Invalid input";
        return res.status(400).json({ error: firstError });
      }
      res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
  });

  // Manual order endpoint: creates order immediately and sends emails
  app.post("/api/manual-orders", async (req, res) => {
    try {
      const { customerName, customerEmail, customerCompany, amount, currency, purchaseType, items } = req.body;

      // Create order with "pending" status (awaiting manual payment processing)
      const validatedOrder = insertOrderSchema.parse({
        customerName,
        customerEmail,
        customerCompany,
        amount,
        currency: currency || "ZAR",
        purchaseType,
        status: "pending",
      });

      const order = await storage.createOrder(validatedOrder);

      // Create order items
      const validatedItems = items?.map((item: any) => insertOrderItemWithoutOrderIdSchema.parse(item)) || [];
      for (const itemData of validatedItems) {
        await storage.createOrderItem({
          ...itemData,
          orderId: order.id,
        });
      }

      // Send admin email notification
      try {
        await sendAdminOrderNotification({
          customerName: order.customerName || "Unknown",
          customerEmail: order.customerEmail || "No email provided",
          customerCompany: order.customerCompany || "Company Not Provided",
          orderDescription: order.purchaseType || "Order placed",
          orderTotal: `R${Number(order.amount).toLocaleString()}`,
          orderItems: validatedItems.map((item: any) => ({
            type: item.type,
            description: item.description || "",
            quantity: item.quantity,
          })),
        });
      } catch (emailError) {
        console.error("Failed to send admin email notification:", emailError);
      }

      // Send customer order confirmation email
      try {
        await sendCustomerOrderConfirmation({
          customerName: order.customerName || "Valued Customer",
          customerEmail: order.customerEmail,
          customerCompany: order.customerCompany || "Your Company",
          orderDescription: order.purchaseType || "Order",
          orderTotal: `R${Number(order.amount).toLocaleString()}`,
          orderItems: validatedItems.map((item: any) => ({
            type: item.type,
            description: item.description || "",
            quantity: item.quantity,
          })),
        });
      } catch (emailError) {
        console.error("Failed to send customer order confirmation:", emailError);
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

  // New endpoint: Create checkout without creating order first
  // Order will be created on successful payment webhook
  app.post("/api/payment/checkout", async (req, res) => {
    try {
      const { customerName, customerEmail, customerCompany, amount, currency, purchaseType, items, providerKey, subscription, invoiceRequested, businessRegNumber, vatNumber } = req.body;
      
      // Store order data in payment intent metadata for later creation
      const pendingOrderData = {
        customerName,
        customerEmail,
        customerCompany,
        amount,
        currency: currency || "ZAR",
        purchaseType,
        items,
        recurringAmount: subscription?.recurringAmount,
        invoiceRequested: invoiceRequested || false,
        businessRegNumber: businessRegNumber || null,
        vatNumber: vatNumber || null,
      };

      const checkout = await paymentService.createCheckoutWithPendingOrder(
        pendingOrderData, 
        providerKey || "payfast",
        subscription ? {
          subscriptionType: subscription.subscriptionType || 1,
          frequency: subscription.frequency || 3,
          cycles: subscription.cycles || 12,
          recurringAmount: subscription.recurringAmount,
        } : undefined
      );
      res.status(201).json(checkout);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/webhooks/payfast", upload.none(), async (req, res) => {
    try {
      console.log("=== Webhook Debug ===");
      console.log("Content-Type:", req.headers["content-type"]);
      console.log("req.body type:", typeof req.body);
      console.log("req.body:", req.body);
      
      // With multer, form fields are in req.body as an object
      const formData = req.body;
      
      const { intent, orderCreated, subscriptionData, eventType } = await paymentService.handleWebhook("payfast", formData, req.headers as Record<string, string>);
      
      // Handle subscription events
      if (subscriptionData?.token && eventType) {
        console.log("=== Processing Subscription Event ===");
        console.log("Event Type:", eventType);
        console.log("Token:", subscriptionData.token);
        
        if (eventType === "subscription.created" || eventType === "subscription.payment") {
          // Check if subscription already exists
          const existingSubscription = await storage.getSubscriptionByToken(subscriptionData.token);
          
          if (existingSubscription) {
            // Update existing subscription with new payment (only for subsequent payments, not first)
            if (eventType === "subscription.payment") {
              const cyclesCompleted = (existingSubscription.cyclesCompleted || 0) + 1;
              const nextBillingDate = new Date();
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              
              await storage.updateSubscription(existingSubscription.id, {
                cyclesCompleted,
                nextBillingDate,
                status: cyclesCompleted >= existingSubscription.cyclesTotal ? "completed" : "active",
              });
              
              console.log("Subscription updated - Cycles completed:", cyclesCompleted);
            }
          } else if (intent) {
            // Create new subscription record on first payment or subscription.created event
            const metadata = intent.metadata as Record<string, any> | null;
            const pendingOrder = metadata?.pendingOrder as Record<string, any> | undefined;
            const subscriptionOptions = metadata?.subscriptionOptions as Record<string, any> | undefined;
            
            const nextBillingDate = new Date();
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            
            const newSubscription = await storage.createSubscription({
              userId: pendingOrder?.userId || null,
              payfastToken: subscriptionData.token,
              customerName: subscriptionData.customerName || pendingOrder?.customerName || "Unknown",
              customerEmail: subscriptionData.customerEmail || pendingOrder?.customerEmail || "",
              customerCompany: pendingOrder?.customerCompany || null,
              planType: pendingOrder?.purchaseType || "entry_membership",
              amount: String(subscriptionData.amount || pendingOrder?.recurringAmount || subscriptionOptions?.recurringAmount || 5000),
              currency: "ZAR",
              frequency: subscriptionOptions?.frequency || 3, // Monthly
              cyclesTotal: subscriptionOptions?.cycles || 12, // 12 months
              cyclesCompleted: 1, // First payment just completed
              status: "active",
              nextBillingDate,
              startDate: new Date(),
            });
            
            console.log("New subscription created:", newSubscription.id, "for:", subscriptionData.customerEmail || pendingOrder?.customerEmail);
          }
        } else if (eventType === "subscription.cancelled") {
          // Handle subscription cancellation
          const existingSubscription = await storage.getSubscriptionByToken(subscriptionData.token);
          if (existingSubscription) {
            await storage.updateSubscription(existingSubscription.id, {
              status: "cancelled",
              cancelledAt: new Date(),
            });
            console.log("Subscription cancelled:", existingSubscription.id);
          }
        }
        
        console.log("=====================================");
      }
      
      // Send emails only after successful payment and order creation
      if (intent && orderCreated) {
        const order = await storage.getOrder(intent.orderId);
        if (order) {
          const items = await storage.getOrderItems(order.id);
          
          // Send admin email notification
          try {
            await sendAdminOrderNotification({
              customerName: order.customerName || "Unknown",
              customerEmail: order.customerEmail || "No email provided",
              customerCompany: order.customerCompany || "Company Not Provided",
              orderDescription: order.purchaseType || "Order placed via checkout",
              orderTotal: `R${Number(order.amount).toLocaleString()}`,
              orderItems: items.map((item) => ({
                type: item.type,
                description: item.description || "",
                quantity: item.quantity,
              })),
            });
          } catch (emailError) {
            console.error("Failed to send admin email notification:", emailError);
          }

          // Send customer order confirmation email (with invoice if requested)
          try {
            let invoiceAttachment: { filename: string; content: Buffer } | undefined;
            
            if (order.invoiceRequested && order.invoiceNumber) {
              console.log("Generating invoice PDF for:", order.invoiceNumber);
              const invoicePdf = await generateInvoicePdf({
                invoiceNumber: order.invoiceNumber,
                invoiceDate: order.createdAt,
                customerName: order.customerName || "Valued Customer",
                customerEmail: order.customerEmail,
                customerCompany: order.customerCompany || "Company",
                businessRegNumber: order.businessRegNumber || undefined,
                vatNumber: order.vatNumber || undefined,
                orderItems: items.map((item) => ({
                  type: item.type,
                  description: item.description || item.type,
                  quantity: item.quantity,
                  unitAmount: String(item.unitAmount),
                })),
                currency: order.currency,
              });
              
              invoiceAttachment = {
                filename: `Innovatr-Tax-Invoice-${order.invoiceNumber}.pdf`,
                content: invoicePdf,
              };
              console.log("Invoice PDF generated successfully");
            }

            await sendCustomerOrderConfirmation({
              customerName: order.customerName || "Valued Customer",
              customerEmail: order.customerEmail,
              customerCompany: order.customerCompany || "Your Company",
              orderDescription: order.purchaseType || "Order",
              orderTotal: `R${Number(order.amount).toLocaleString()}`,
              orderItems: items.map((item) => ({
                type: item.type,
                description: item.description || "",
                quantity: item.quantity,
              })),
              invoiceAttachment,
            });
          } catch (emailError) {
            console.error("Failed to send customer order confirmation:", emailError);
          }
        }
      }
      
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

  // Admin API endpoints
  app.get("/api/admin/users", async (req, res) => {
    try {
      // In a real app, check session/auth header
      // For now, just return all users
      const users = await storage.getAllUsers();
      // Don't expose passwords
      const safeUsers = users.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { membershipTier, status, role, creditsBasic, creditsPro } = req.body;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUser(id, {
        membershipTier: membershipTier || user.membershipTier,
        status: status || user.status,
        role: role || user.role,
        creditsBasic: creditsBasic !== undefined ? creditsBasic : user.creditsBasic,
        creditsPro: creditsPro !== undefined ? creditsPro : user.creditsPro,
      });

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/overview", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const starterCount = users.filter(u => u.membershipTier === "STARTER").length;
      const growthCount = users.filter(u => u.membershipTier === "GROWTH").length;
      const scaleCount = users.filter(u => u.membershipTier === "SCALE").length;
      
      // Get active subscriptions count
      const subscriptions = await storage.getAllSubscriptions();
      const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
      
      res.json({
        totalUsers: users.length,
        starterMembers: starterCount,
        growthMembers: growthCount,
        scaleMembers: scaleCount,
        activeDeals: 0,
        activeSubscriptions,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Orders endpoints
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => ({
          ...order,
          items: await storage.getOrderItems(order.id),
        }))
      );
      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const validStatuses = ["pending", "processing", "completed", "failed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }

      await storage.updateOrder(id, { status });
      const updatedOrder = await storage.getOrder(id);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Public reports endpoint (for member portal)
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      // Filter to only published, non-archived reports for public access
      const publicReports = reports.filter(r => 
        r.status === "published" && !r.isArchived
      );
      res.json(publicReports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Reports endpoints
  app.get("/api/admin/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/reports", async (req, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      await storage.updateReport(id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Deals endpoints
  app.get("/api/admin/deals", async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/deals", async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/deals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      await storage.updateDeal(id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/member/deals", async (req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Subscription management endpoints
  app.get("/api/admin/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      res.json(subscription);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/subscriptions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      await storage.updateSubscription(id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User subscription endpoints (for viewing own subscriptions)
  app.get("/api/subscriptions/email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const subscriptions = await storage.getSubscriptionsByEmail(email);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const subscriptions = await storage.getSubscriptionsByUserId(userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/subscriptions/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Update subscription status to cancelled
      await storage.updateSubscription(id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });
      
      // Note: In production, you would also need to cancel with PayFast API
      // using the subscription token to stop future billing
      console.log(`Subscription ${id} marked as cancelled. PayFast token: ${subscription.payfastToken}`);
      
      res.json({ success: true, message: "Subscription cancelled successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // File upload endpoints for App Storage
  app.post("/api/upload/thumbnail", fileUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed." });
      }

      const ext = req.file.originalname.split(".").pop() || "jpg";
      const timestamp = Date.now();
      const fileName = `thumbnails/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const result = await uploadFile(req.file.buffer, fileName);

      if (result.ok && result.path) {
        res.json({ 
          success: true, 
          path: result.path,
          url: `/api/files/${result.path}`
        });
      } else {
        res.status(500).json({ error: result.error || "Upload failed" });
      }
    } catch (error: any) {
      console.error("Thumbnail upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/upload/pdf", fileUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Invalid file type. Only PDF files are allowed." });
      }

      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `pdfs/${timestamp}-${originalName}`;

      const result = await uploadFile(req.file.buffer, fileName);

      if (result.ok && result.path) {
        res.json({ 
          success: true, 
          path: result.path,
          url: `/api/files/${result.path}`
        });
      } else {
        res.status(500).json({ error: result.error || "Upload failed" });
      }
    } catch (error: any) {
      console.error("PDF upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve files from App Storage
  app.get("/api/files/*", async (req, res) => {
    try {
      const filePath = (req.params as Record<string, string>)[0];
      
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      const exists = await fileExists(filePath);
      if (!exists) {
        return res.status(404).json({ error: "File not found" });
      }

      const fileBuffer = await downloadFile(filePath);
      if (!fileBuffer) {
        return res.status(500).json({ error: "Failed to download file" });
      }

      // Set content type based on file extension
      const ext = filePath.split(".").pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        pdf: "application/pdf",
      };

      res.setHeader("Content-Type", contentTypes[ext || ""] || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(fileBuffer);
    } catch (error: any) {
      console.error("File serve error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete file from App Storage (admin only)
  app.delete("/api/files/*", async (req, res) => {
    try {
      const filePath = (req.params as Record<string, string>)[0];
      
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      const success = await deleteFile(filePath);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete file" });
      }
    } catch (error: any) {
      console.error("File delete error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // List files in App Storage
  app.get("/api/admin/files", async (req, res) => {
    try {
      const prefix = req.query.prefix as string | undefined;
      const files = await listFiles(prefix);
      res.json({ files });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
