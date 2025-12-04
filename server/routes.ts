import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { insertCouponClaimSchema, insertMailerSubscriptionSchema, insertOrderSchema, insertOrderItemWithoutOrderIdSchema, insertReportSchema, insertDealSchema, insertInquirySchema } from "@shared/schema";
import { PaymentService } from "./payments/service";
import type { PaymentConfig } from "./payments/types";
import * as emailService from "./emails/email-service";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation, sendContactFormMessage, sendInvoiceRequestNotification, sendBriefConfirmationEmail, sendBriefAdminNotification } from "./emails/email-service";
import { uploadFile, downloadFile, deleteFile, listFiles, fileExists } from "./app-storage";
import { generateInvoicePdf } from "./invoices/generator";

// Multer for handling multipart/form-data (PayFast webhooks and file uploads)
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

// Multer for brief file uploads - supports wider range of file types
const briefFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4", "video/quicktime", "video/webm",
      "audio/mpeg", "audio/mp4", "audio/mp4a-latm",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "image/jpeg", "image/png", "image/gif", "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Supported types: PDF, DOCX, XLSX, PPTX, TXT, images, videos, and audio.`));
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

  // User registration endpoint - creates new users with STARTER tier
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, company } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      // Create user with default STARTER tier and MEMBER role
      const newUser = await storage.createUser({
        username: email.split("@")[0] + "_" + Date.now(), // Generate unique username from email
        email,
        password, // In production, this should be hashed
        name: name || email.split("@")[0],
        company: company || null,
        membershipTier: "STARTER", // All new signups start as STARTER
        status: "ACTIVE",
        role: "MEMBER",
        creditsBasic: 0,
        creditsPro: 0,
      });
      
      // Return user without password
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In production, compare hashed passwords
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      // Return user without password
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

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

  app.get("/api/admin/mailer-subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllMailerSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  /**
   * Invoice Order Flow:
   * - Creates an order with invoiceRequested = true and status = "pending"
   * - Sends email notification to richard@innovatr.co.za and hannah@innovatr.co.za
   * - Does NOT open payment gateway
   * - Credits are only activated when admin manually updates status to "paid"
   */
  app.post("/api/invoice-orders", async (req, res) => {
    try {
      const { customerName, customerEmail, customerCompany, amount, currency, purchaseType, items, businessRegNumber, vatNumber, companyAddress } = req.body;

      // Validate required fields
      if (!customerName || !customerEmail || !customerCompany || !amount || !purchaseType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create order with invoiceRequested = true and status = "pending" (awaiting payment)
      const validatedOrder = insertOrderSchema.parse({
        customerName,
        customerEmail,
        customerCompany,
        amount,
        currency: currency || "ZAR",
        purchaseType,
        status: "pending", // Will change to "paid" when payment is received
        invoiceRequested: true, // Mark this as an invoice request
        businessRegNumber: businessRegNumber || null,
        vatNumber: vatNumber || null,
        companyAddress: companyAddress || null,
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

      // Send invoice request notification to admin team
      try {
        await sendInvoiceRequestNotification({
          orderId: order.id,
          customerName: order.customerName || "Unknown",
          customerEmail: order.customerEmail || "No email provided",
          customerCompany: order.customerCompany || "Company Not Provided",
          packDescription: order.purchaseType || "Credit Pack",
          totalAmount: `R${Number(order.amount).toLocaleString()}`,
          orderItems: validatedItems.map((item: any) => ({
            type: item.type,
            description: item.description || "",
            quantity: item.quantity,
          })),
        });
      } catch (emailError) {
        console.error("Failed to send invoice request notification:", emailError);
        // Don't fail the order creation if email fails
      }

      res.status(201).json(order);
    } catch (error: any) {
      console.error("Invoice order creation failed:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get user's orders (for Credits & Billing page)
  app.get("/api/user-orders", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const orders = await storage.getOrdersByEmail(email);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      const { customerName, customerEmail, customerCompany, amount, currency, purchaseType, items, providerKey, subscription, invoiceRequested, businessRegNumber, vatNumber, companyAddress } = req.body;
      
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
        companyAddress: companyAddress || null,
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
                companyAddress: order.companyAddress || undefined,
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

  // User lookup endpoint for login
  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error: any) {
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

  app.get("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...safeUser } = user;
      res.json(safeUser);
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

  // Public reports endpoint (excludes company-only reports)
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      // Filter to only published, non-archived reports for public access
      // Exclude any reports with clientCompanyIds (those are company-specific)
      const publicReports = reports.filter(r => 
        r.status === "published" && 
        !r.isArchived &&
        (!r.clientCompanyIds || r.clientCompanyIds.length === 0)
      );
      res.json(publicReports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Member reports endpoint (authenticated, includes client-specific reports)
  app.get("/api/member/reports", async (req, res) => {
    try {
      // Get user from query param (for simplicity) - in production this should be from session
      const { email } = req.query;
      
      if (!email) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Look up user to get their companyId
      const user = await storage.getUserByEmail(email as string);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const userCompanyId = user.companyId;
      const reports = await storage.getAllReports();
      
      // Filter reports based on access rules
      const filteredReports = reports.filter(r => {
        // Must be published and not archived
        if (r.status !== "published" || r.isArchived) return false;
        
        // If report has no client restrictions, it's publicly accessible
        if (!r.clientCompanyIds || r.clientCompanyIds.length === 0) return true;
        
        // For reports with clientCompanyIds, only show to users from those companies
        return userCompanyId && r.clientCompanyIds.includes(userCompanyId);
      });
      
      res.json(filteredReports);
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

  // Get orders for the current user by email
  app.get("/api/member/orders", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const orders = await storage.getOrdersByEmail(email);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Company management endpoints
  app.get("/api/admin/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/companies", async (req, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.status(201).json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      await storage.updateCompany(id, req.body);
      const updated = await storage.getCompany(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/companies/:id/users", async (req, res) => {
    try {
      const { id } = req.params;
      const users = await storage.getUsersByCompanyId(id);
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/companies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      await storage.deleteCompany(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Company logo upload
  app.post("/api/admin/companies/:id/logo", fileUpload.single("logo"), async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const filename = `${id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `company_logos/${filename}`;
      
      await uploadFile(req.file.buffer, filePath);
      await storage.updateCompany(id, { logoUrl: `/assets/${filePath}` });
      
      const updated = await storage.getCompany(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.deleteUser(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Client Reports CRUD endpoints
  app.get("/api/admin/client-reports", async (req, res) => {
    try {
      const reports = await storage.getAllClientReports();
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/client-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getClientReport(id);
      if (!report) {
        return res.status(404).json({ error: "Client report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/client-reports", async (req, res) => {
    try {
      const report = await storage.createClientReport(req.body);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/client-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getClientReport(id);
      if (!report) {
        return res.status(404).json({ error: "Client report not found" });
      }
      await storage.updateClientReport(id, req.body);
      const updated = await storage.getClientReport(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/client-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getClientReport(id);
      if (!report) {
        return res.status(404).json({ error: "Client report not found" });
      }
      await storage.deleteClientReport(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Client report PDF upload
  app.post("/api/admin/client-reports/:id/pdf", fileUpload.single("pdf"), async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getClientReport(id);
      if (!report) {
        return res.status(404).json({ error: "Client report not found" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const filename = `${id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `client_reports/${filename}`;
      
      await uploadFile(req.file.buffer, filePath);
      await storage.updateClientReport(id, { pdfUrl: `/assets/${filePath}` });
      
      const updated = await storage.getClientReport(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get client reports by company (for member portal)
  // Two Rugani projects added and linked by companyId.
  // Access is restricted to company users (by companyId) and admins (via isAdminUser).
  app.get("/api/member/client-reports", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Admin users (@innovatr.co.za) can see all client reports
      if (isAdminUser(email as string)) {
        const allReports = await storage.getAllClientReports();
        return res.json(allReports);
      }
      
      const user = await storage.getUserByEmail(email as string);
      if (!user || !user.companyId) {
        return res.json([]);
      }
      
      const reports = await storage.getClientReportsByCompanyId(user.companyId);
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/companies/:companyId/client-reports", async (req, res) => {
    try {
      const { companyId } = req.params;
      const reports = await storage.getClientReportsByCompanyId(companyId);
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get company by user's companyId (for member portal)
  app.get("/api/member/company", async (req, res) => {
    try {
      const { companyId } = req.query;
      if (!companyId) {
        return res.status(400).json({ error: "companyId is required" });
      }
      const company = await storage.getCompany(companyId as string);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
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

  // Client report PDF upload endpoint
  app.post("/api/upload/client-report", fileUpload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Invalid file type. Only PDF files are allowed." });
      }

      const companyId = req.body.companyId || "unknown";
      const timestamp = Date.now();
      const originalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `client_reports/${companyId}/${timestamp}-${originalName}`;

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
      console.error("Client report upload error:", error);
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

  // Generate sample invoice PDF for preview
  app.post("/api/invoice/sample", async (req, res) => {
    try {
      const { customerName, customerEmail, customerCompany, businessRegNumber, vatNumber, companyAddress, orderItems, totalAmount } = req.body;
      
      // Generate sample invoice number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const sampleInvoiceNumber = `INV-${year}${month}${day}-SAMPLE`;

      const invoicePdf = await generateInvoicePdf({
        invoiceNumber: sampleInvoiceNumber,
        invoiceDate: now,
        customerName: customerName || "Sample Customer",
        customerEmail: customerEmail || "sample@example.com",
        customerCompany: customerCompany || "Sample Company (Pty) Ltd",
        businessRegNumber: businessRegNumber || "2024/123456/07",
        vatNumber: vatNumber || "4123456789",
        companyAddress: companyAddress || "123 Sample Street, City, 1234",
        orderItems: orderItems || [
          { type: "membership", description: "Entry Membership", quantity: 1, unitAmount: "5000" },
          { type: "addon", description: "Premium Support", quantity: 1, unitAmount: "2000" },
        ],
        currency: "ZAR",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Innovatr-Sample-Invoice-${sampleInvoiceNumber}.pdf"`);
      res.send(invoicePdf);
    } catch (error: any) {
      console.error("Sample invoice generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ======= Brief Submission Endpoints =======

  // Upload files for brief submission
  app.post("/api/briefs/upload", briefFileUpload.array("files", 5), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadResults = [];

      for (const file of files) {
        // Generate a safe storage key: briefs/{uuid}-{sanitized-filename}
        const fileId = randomUUID();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
        const storagePath = `briefs/${fileId}-${sanitizedName}`;

        // Upload to Replit Object Storage
        const uploadResult = await uploadFile(Buffer.from(file.buffer), storagePath);

        if (!uploadResult.ok) {
          console.error(`Failed to upload file ${file.originalname}:`, uploadResult.error);
          // Continue with other files, but log the failure
          continue;
        }

        // Build file metadata
        const fileMetadata = {
          id: fileId,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          url: `/api/files/${storagePath}`,
          uploadedAt: new Date().toISOString(),
        };

        uploadResults.push(fileMetadata);
      }

      if (uploadResults.length === 0) {
        return res.status(500).json({ error: "Failed to upload any files" });
      }

      res.json({ success: true, files: uploadResults });
    } catch (error: any) {
      console.error("Brief file upload error:", error);
      res.status(500).json({ error: error.message || "File upload failed" });
    }
  });

  // Helper function to generate unique ID for file upload
  function randomUUID(): string {
    return crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }

  // Create a new brief submission
  app.post("/api/briefs", async (req, res) => {
    try {
      const { z } = await import("zod");
      
      const briefFileSchema = z.object({
        id: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        url: z.string(),
        uploadedAt: z.string(),
      });

      const briefSchema = z.object({
        submittedByName: z.string().min(1, "Name is required"),
        submittedByEmail: z.string().email("Valid email is required"),
        submittedByContact: z.string().optional(),
        companyName: z.string().min(1, "Company name is required"),
        companyBrand: z.string().optional(),
        studyType: z.string().min(1, "Study type is required"),
        numIdeas: z.number().min(1).default(1),
        researchObjective: z.string().min(1, "Research objective is required"),
        regions: z.array(z.string()).default([]),
        ages: z.array(z.string()).default([]),
        genders: z.array(z.string()).default([]),
        incomes: z.array(z.string()).default([]),
        industry: z.string().optional(),
        competitors: z.array(z.string()).default([]),
        projectFileUrls: z.array(z.string()).default([]),
        files: z.array(briefFileSchema).default([]),
        // Payment and credits fields
        billingPreference: z.enum(["online", "invoice", "credits"]).optional(),
        paymentMethod: z.enum(["online", "invoice", "credits"]).optional(),
        basicCreditsUsed: z.number().default(0),
        proCreditsUsed: z.number().default(0),
        companyId: z.number().nullable().optional(),
        userId: z.number().nullable().optional(),
        concepts: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          fileCount: z.number().optional(),
        })).optional(),
      });

      const validated = briefSchema.parse(req.body);

      // Server-side credit calculation - derive from brief data, don't trust client
      const creditsRequired = validated.numIdeas; // 1 credit per concept
      const isBasicStudy = validated.studyType.toLowerCase().includes("basic");
      let finalBasicCreditsUsed = 0;
      let finalProCreditsUsed = 0;
      let companyIdStr: string | null = null;

      // Handle credit deduction if using credits payment method
      if (validated.paymentMethod === "credits") {
        // Early validation: must have company for credits payment
        if (!validated.companyId) {
          return res.status(400).json({ 
            success: false, 
            error: "Company account required for credit payments" 
          });
        }

        companyIdStr = String(validated.companyId);
        
        // Refetch company to get current credit state (prevents race conditions)
        const company = await storage.getCompany(companyIdStr);
        if (!company) {
          return res.status(400).json({ success: false, error: "Company not found" });
        }

        // Calculate available credits based on current database state
        const basicAvailable = (company.basicCreditsTotal || 0) - (company.basicCreditsUsed || 0);
        const proAvailable = (company.proCreditsTotal || 0) - (company.proCreditsUsed || 0);

        // Determine which credit bucket to use based on study type (server-side decision)
        if (isBasicStudy) {
          if (basicAvailable < creditsRequired) {
            return res.status(400).json({ 
              success: false, 
              error: `Insufficient Basic credits. Available: ${basicAvailable}, Required: ${creditsRequired}` 
            });
          }
          finalBasicCreditsUsed = creditsRequired;
        } else {
          if (proAvailable < creditsRequired) {
            return res.status(400).json({ 
              success: false, 
              error: `Insufficient Pro credits. Available: ${proAvailable}, Required: ${creditsRequired}` 
            });
          }
          finalProCreditsUsed = creditsRequired;
        }

        // Atomic deduction: compute new values based on current DB state
        const newBasicUsed = (company.basicCreditsUsed || 0) + finalBasicCreditsUsed;
        const newProUsed = (company.proCreditsUsed || 0) + finalProCreditsUsed;
        
        await storage.updateCompany(companyIdStr, {
          basicCreditsUsed: newBasicUsed,
          proCreditsUsed: newProUsed,
        });

        console.log(`Credits deducted for company ${validated.companyId}: Basic ${finalBasicCreditsUsed}, Pro ${finalProCreditsUsed}`);
      }

      // Create brief submission with server-computed credit values
      const brief = await storage.createBriefSubmission({
        ...validated,
        concepts: validated.concepts || [],
        companyId: companyIdStr || (validated.companyId ? String(validated.companyId) : null),
        paymentMethod: validated.paymentMethod || "online",
        basicCreditsUsed: finalBasicCreditsUsed,
        proCreditsUsed: finalProCreditsUsed,
        status: "new",
      });

      // Get files array for emails (cast to expected type)
      const briefFiles = (brief.files || []) as Array<{
        id: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        uploadedAt: string;
      }>;

      // Send client confirmation email
      try {
        await sendBriefConfirmationEmail({
          submittedByName: brief.submittedByName,
          submittedByEmail: brief.submittedByEmail,
          companyName: brief.companyName,
          studyType: brief.studyType,
          numIdeas: brief.numIdeas,
          researchObjective: brief.researchObjective,
          files: briefFiles,
        });
      } catch (emailError) {
        console.error("Failed to send brief confirmation email:", emailError);
      }

      // Send admin notification email
      try {
        await sendBriefAdminNotification({
          id: brief.id,
          submittedByName: brief.submittedByName,
          submittedByEmail: brief.submittedByEmail,
          submittedByContact: brief.submittedByContact,
          companyName: brief.companyName,
          companyBrand: brief.companyBrand,
          studyType: brief.studyType,
          numIdeas: brief.numIdeas,
          researchObjective: brief.researchObjective,
          regions: brief.regions ?? [],
          ages: brief.ages ?? [],
          genders: brief.genders ?? [],
          incomes: brief.incomes ?? [],
          industry: brief.industry,
          competitors: brief.competitors ?? [],
          projectFileUrls: brief.projectFileUrls ?? [],
          files: briefFiles,
          createdAt: brief.createdAt,
        });
      } catch (emailError) {
        console.error("Failed to send brief admin notification:", emailError);
      }

      res.status(201).json({ success: true, brief });
    } catch (error: any) {
      console.error("Brief submission error:", error);
      if (error.name === "ZodError") {
        const firstError = error.errors?.[0]?.message || "Invalid input";
        return res.status(400).json({ success: false, error: firstError });
      }
      res.status(500).json({ success: false, error: "Failed to submit brief. Please try again." });
    }
  });

  // Get all brief submissions (admin only)
  app.get("/api/admin/briefs", async (req, res) => {
    try {
      const briefs = await storage.getAllBriefSubmissions();
      res.json(briefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single brief submission
  app.get("/api/admin/briefs/:id", async (req, res) => {
    try {
      const brief = await storage.getBriefSubmission(req.params.id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      res.json(brief);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update brief submission (admin only - for status updates, notes)
  app.patch("/api/admin/briefs/:id", async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      const brief = await storage.getBriefSubmission(req.params.id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }

      const updates: Record<string, any> = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      await storage.updateBriefSubmission(req.params.id, updates);
      
      const updated = await storage.getBriefSubmission(req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Studies Routes ====================
  // Studies represent the unified view of research projects linking briefs to completed reports
  
  // Get studies for logged-in member (by email or companyId)
  app.get("/api/member/studies", async (req, res) => {
    try {
      const email = req.query.email as string;
      const companyId = req.query.companyId as string;
      
      let studies;
      if (companyId) {
        studies = await storage.getStudiesByCompanyId(companyId);
      } else if (email) {
        studies = await storage.getStudiesByEmail(email);
      } else {
        return res.status(400).json({ error: "Email or companyId required" });
      }
      
      res.json(studies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all studies (admin only)
  app.get("/api/admin/studies", async (req, res) => {
    try {
      const studies = await storage.getAllStudies();
      res.json(studies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new study from a brief (admin only)
  app.post("/api/admin/studies", async (req, res) => {
    try {
      const studySchema = z.object({
        briefId: z.string().optional(),
        companyId: z.string().optional(),
        companyName: z.string().min(1, "Company name required"),
        title: z.string().min(1, "Title required"),
        description: z.string().optional(),
        studyType: z.enum(["basic", "pro"]),
        status: z.enum(["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA", "COMPLETED"]).default("NEW"),
        isTest24: z.boolean().default(true),
        tags: z.array(z.string()).default([]),
        submittedByEmail: z.string().email("Valid email required"),
        submittedByName: z.string().optional(),
      });

      const validated = studySchema.parse(req.body);
      const study = await storage.createStudy(validated);
      
      res.status(201).json(study);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Create a study from an existing brief (admin only)
  app.post("/api/admin/studies/from-brief/:briefId", async (req, res) => {
    try {
      const brief = await storage.getBriefSubmission(req.params.briefId);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }

      // Check if a study already exists for this brief
      const existingStudy = await storage.getStudyByBriefId(brief.id);
      if (existingStudy) {
        return res.status(400).json({ error: "A study already exists for this brief", study: existingStudy });
      }

      // Create study from brief data
      const study = await storage.createStudy({
        briefId: brief.id,
        companyName: brief.companyName,
        title: `${brief.companyBrand || brief.companyName} - ${brief.studyType === "basic" ? "Test24 Basic" : "Test24 Pro"}`,
        description: brief.researchObjective.slice(0, 200),
        studyType: brief.studyType as "basic" | "pro",
        status: "NEW",
        isTest24: true,
        tags: [brief.companyName, brief.studyType, brief.industry || ""].filter(Boolean),
        submittedByEmail: brief.submittedByEmail,
        submittedByName: brief.submittedByName,
      });

      res.status(201).json(study);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single study (admin only)
  app.get("/api/admin/studies/:id", async (req, res) => {
    try {
      const study = await storage.getStudy(req.params.id);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      res.json(study);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update study (admin only - for general updates)
  app.patch("/api/admin/studies/:id", async (req, res) => {
    try {
      const study = await storage.getStudy(req.params.id);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }

      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        reportUrl: z.string().optional(),
        clientReportId: z.string().optional(),
      });

      const validated = updateSchema.parse(req.body);
      await storage.updateStudy(req.params.id, validated);

      const updated = await storage.getStudy(req.params.id);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update study status (admin only - optionally triggers email notifications)
  app.patch("/api/admin/studies/:id/status", async (req, res) => {
    try {
      const study = await storage.getStudy(req.params.id);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }

      const statusSchema = z.object({
        status: z.enum(["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA", "COMPLETED"]),
        reportUrl: z.string().optional(), // For COMPLETED status
        sendNotification: z.boolean().optional().default(true), // Whether to send email notification
      });

      const { status, reportUrl, sendNotification } = statusSchema.parse(req.body);
      const previousStatus = study.status;

      // Update the status
      const updatedStudy = await storage.updateStudyStatus(req.params.id, status);

      // If report URL provided with COMPLETED status, update it
      if (status === "COMPLETED" && reportUrl) {
        await storage.updateStudy(req.params.id, { 
          reportUrl, 
          deliveryDate: new Date() 
        });
      }

      // Send email notifications for status changes (if enabled)
      if (updatedStudy && previousStatus !== status && sendNotification) {
        try {
          if (status === "AUDIENCE_LIVE") {
            // Send "Your Test24 study is live" email
            await emailService.sendStudyLiveNotification({
              clientEmail: study.submittedByEmail,
              clientName: study.submittedByName || "Valued Client",
              studyTitle: study.title,
              studyType: study.studyType === "basic" ? "Test24 Basic" : "Test24 Pro",
              companyName: study.companyName,
            });
          } else if (status === "COMPLETED") {
            // Send "Your Test24 results are ready" email
            await emailService.sendStudyCompletedNotification({
              clientEmail: study.submittedByEmail,
              clientName: study.submittedByName || "Valued Client",
              studyTitle: study.title,
              studyType: study.studyType === "basic" ? "Test24 Basic" : "Test24 Pro",
              companyName: study.companyName,
              reportUrl: reportUrl || undefined,
            });
          }
        } catch (emailError) {
          // Log email error but don't fail the status update
          console.error("Failed to send study status notification email:", emailError);
        }
      }

      const finalStudy = await storage.getStudy(req.params.id);
      res.json(finalStudy);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
