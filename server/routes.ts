import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import { insertCouponClaimSchema, insertMailerSubscriptionSchema, insertOrderSchema, insertOrderItemWithoutOrderIdSchema, insertReportSchema, insertDealSchema, insertInquirySchema } from "@shared/schema";
import { PaymentService } from "./payments/service";
import type { PaymentConfig } from "./payments/types";
import * as emailService from "./emails/email-service";
import { sendAdminOrderNotification, sendCustomerOrderConfirmation, sendContactFormMessage, sendInvoiceRequestNotification, sendBriefConfirmationEmail, sendBriefAdminNotification } from "./emails/email-service";
import { uploadFile, downloadFile, deleteFile, listFiles, fileExists } from "./app-storage";
import { generateInvoicePdf } from "./invoices/generator";
import { createAndUploadPlaceholderPDF } from "./pdf-generator";
import { hashPassword, verifyPassword, validatePasswordStrength, generateResetToken, hashResetToken, getResetTokenExpiry, generateSessionToken, getSessionExpiry, isExpired, hashSessionToken } from "./auth/password";
import { requireAuth, requireAdmin, redactUser, redactUsers, isAdminUser as isAdminUserMiddleware, apiError, type AuthenticatedRequest } from "./middleware";

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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max per file
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

// Demo accounts list - used for minimum credit display
const DEMO_ACCOUNTS = ["hannah@innovatr.co.za", "richard@innovatr.co.za"];
const DEMO_MIN_BASIC_CREDITS = 25;
const DEMO_MIN_PRO_CREDITS = 4;

// Helper function to apply demo minimum credits to user response
function applyDemoUserCredits(user: any) {
  if (!user || !DEMO_ACCOUNTS.includes(user.email)) {
    return user;
  }
  
  // For demo accounts, show minimum credits directly on user object
  return {
    ...user,
    creditsBasic: Math.max(user.creditsBasic ?? 0, DEMO_MIN_BASIC_CREDITS),
    creditsPro: Math.max(user.creditsPro ?? 0, DEMO_MIN_PRO_CREDITS),
  };
}

// Helper function to apply demo minimum credits to company
function applyDemoCredits(company: any, userEmail?: string) {
  if (!company || !userEmail || !DEMO_ACCOUNTS.includes(userEmail)) {
    return company;
  }
  
  return {
    ...company,
    basicCreditsTotal: Math.max(company.basicCreditsTotal ?? 0, DEMO_MIN_BASIC_CREDITS + (company.basicCreditsUsed ?? 0)),
    proCreditsTotal: Math.max(company.proCreditsTotal ?? 0, DEMO_MIN_PRO_CREDITS + (company.proCreditsUsed ?? 0)),
  };
}

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
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ 
          message: "Password does not meet requirements",
          details: passwordValidation.errors 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      // Hash the password BEFORE creating user (never store plaintext)
      const passwordHash = await hashPassword(password);
      
      // Create user with empty password field (security: never store plaintext)
      const newUser = await storage.createUser({
        username: email.split("@")[0] + "_" + Date.now(),
        email,
        password: "", // Security: never store plaintext passwords
        name: name || email.split("@")[0],
        company: company || null,
        membershipTier: "STARTER",
        status: "ACTIVE",
        role: "MEMBER",
        creditsBasic: 0,
        creditsPro: 0,
      });
      
      // Atomically set passwordHash (required for all new accounts)
      await storage.updateUser(newUser.id, { 
        passwordHash,
        emailVerified: false 
      });
      
      // Send welcome email to new user
      try {
        await emailService.sendAccountCreatedEmail(email, name || email.split("@")[0]);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail signup if email fails
      }
      
      // Return user without sensitive fields
      const { password: _, passwordHash: __, ...safeUser } = { ...newUser, passwordHash };
      res.status(201).json(safeUser);
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // User login endpoint with bcrypt password verification and session cookie
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled. Please contact support." });
      }
      
      // Verify password using bcrypt (passwordHash is required for all accounts)
      let passwordValid = false;
      
      if (user.passwordHash) {
        // Use bcrypt for hashed passwords (preferred path)
        passwordValid = await verifyPassword(password, user.passwordHash);
      } else if (user.password && user.password !== "") {
        // Legacy migration path: compare plaintext and migrate to bcrypt
        passwordValid = user.password === password;
        
        // If valid, migrate to hashed password immediately
        if (passwordValid) {
          const newHash = await hashPassword(password);
          await storage.updateUser(user.id, { 
            passwordHash: newHash,
            password: "" // Clear plaintext after migration
          });
        }
      }
      // Note: if both passwordHash and password are empty/null, login fails
      
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate session token
      const { token, tokenHash } = generateSessionToken();
      const expiresAt = getSessionExpiry(30); // 30 days
      
      // Create session in storage
      await storage.createSession({
        userId: user.id,
        companyId: user.companyId || undefined,
        tokenHash,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.get("User-Agent") || undefined,
        expiresAt,
      });
      
      // Update last login
      await storage.updateUser(user.id, { 
        lastLoginAt: new Date(),
        lastActivityDate: new Date()
      });
      
      // Set HTTP-only secure cookie
      res.cookie("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        path: "/",
      });
      
      // Return user without password fields, with demo credits applied
      const { password: _, passwordHash: __, ...safeUser } = user;
      
      // Apply demo minimum credits for demo accounts
      const userWithDemoCredits = applyDemoUserCredits(safeUser);
      res.json(userWithDemoCredits);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get current user session - uses HTTP-only session cookie
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Get session token from cookie
      const sessionToken = req.cookies?.session;
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Hash the token to look up the session
      const tokenHash = hashSessionToken(sessionToken);
      const session = await storage.getSessionByTokenHash(tokenHash);
      
      if (!session) {
        // Clear invalid cookie
        res.clearCookie("session", { path: "/" });
        return res.status(401).json({ message: "Session expired or invalid" });
      }
      
      // Check if session has expired
      if (isExpired(session.expiresAt)) {
        // Delete expired session and clear cookie
        await storage.deleteSession(session.id);
        res.clearCookie("session", { path: "/" });
        return res.status(401).json({ message: "Session expired" });
      }
      
      // Get user from session
      const user = await storage.getUser(session.userId);
      if (!user) {
        await storage.deleteSession(session.id);
        res.clearCookie("session", { path: "/" });
        return res.status(401).json({ message: "User not found" });
      }
      
      // Update session last active time
      // (Could be optimized to update less frequently)
      
      // Return user without password fields, with demo credits applied
      const { password: _, passwordHash: __, ...safeUser } = user;
      const userWithDemoCredits = applyDemoUserCredits(safeUser);
      res.json(userWithDemoCredits);
    } catch (error: any) {
      console.error("Auth check error:", error);
      res.status(400).json({ message: error.message });
    }
  });
  
  // Logout endpoint - destroys session and clears cookie
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies?.session;
      
      if (sessionToken) {
        // Hash the token to find and delete the session
        const tokenHash = hashSessionToken(sessionToken);
        const session = await storage.getSessionByTokenHash(tokenHash);
        
        if (session) {
          await storage.deleteSession(session.id);
        }
      }
      
      // Clear the cookie regardless
      res.clearCookie("session", { path: "/" });
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear the cookie even if there's an error
      res.clearCookie("session", { path: "/" });
      res.json({ message: "Logged out" });
    }
  });

  // Request password reset
  app.post("/api/auth/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If an account exists with this email, you will receive a password reset link." });
      }
      
      // Generate reset token
      const { token, tokenHash } = generateResetToken();
      const expiresAt = getResetTokenExpiry();
      
      // Store hashed token in database
      await storage.createPasswordReset({
        userId: user.id,
        tokenHash,
        expiresAt,
      });
      
      // Send reset email (construct reset URL using FRONTEND_URL)
      const resetUrl = `${emailService.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Send email via Resend
      try {
        await emailService.sendPasswordResetEmail(user.email, user.name || 'User', resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        // Continue anyway - don't reveal if email was sent
      }
      
      res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Confirm password reset
  app.post("/api/auth/password-reset/confirm", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: "Email, token, and new password are required" });
      }
      
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ 
          error: "Password does not meet requirements",
          details: passwordValidation.errors 
        });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }
      
      // Hash the token and find the reset record
      const tokenHash = hashResetToken(token);
      const resetRecord = await storage.getPasswordResetByTokenHash(tokenHash);
      
      if (!resetRecord) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }
      
      // Check if token is for this user
      if (resetRecord.userId !== user.id) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }
      
      // Check if token was already used
      if (resetRecord.usedAt) {
        return res.status(400).json({ error: "This reset link has already been used" });
      }
      
      // Check if token is expired
      if (isExpired(resetRecord.expiresAt)) {
        return res.status(400).json({ error: "Reset link has expired. Please request a new one." });
      }
      
      // Hash new password and update user
      const passwordHash = await hashPassword(newPassword);
      await storage.updateUser(user.id, { 
        passwordHash,
        password: "***reset***"
      });
      
      // Mark token as used
      await storage.markPasswordResetUsed(resetRecord.id);
      
      // Send password reset success email
      try {
        await emailService.sendPasswordResetSuccessEmail(user.email, user.name || 'User');
      } catch (emailError) {
        console.error("Failed to send password reset success email:", emailError);
        // Don't fail the reset if email fails
      }
      
      res.json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error: any) {
      console.error("Password reset confirm error:", error);
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
      
      // Send subscription confirmation email
      try {
        await emailService.sendSubscriptionConfirmedEmail(validatedData.email, validatedData.name || undefined);
      } catch (emailError) {
        console.error("Failed to send subscription confirmation email:", emailError);
        // Don't fail the subscription if email fails
      }
      
      res.status(201).json({ message: "Successfully subscribed to Pulse Insights", subscription });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/mailer-subscriptions", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  // Get user's orders (for Credits & Billing page) - protected with session auth
  app.get("/api/user-orders", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can optionally query by email
      if (isAdminUser(sessionUser.email) && req.query.email) {
        const orders = await storage.getOrdersByEmail(req.query.email as string);
        return res.json(orders);
      }
      
      // Regular users get their own orders
      const orders = await storage.getOrdersByEmail(sessionUser.email);
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

      // Handle brief payments - check if this payment is for a brief
      if (intent && orderCreated) {
        const metadata = intent.metadata as Record<string, any> | null;
        const pendingOrder = metadata?.pendingOrder as Record<string, any> | undefined;
        
        if (pendingOrder?.briefId) {
          console.log("=== Processing Brief Payment ===");
          console.log("Brief ID:", pendingOrder.briefId);
          
          // Update brief payment status to completed
          const brief = await storage.getBriefSubmission(pendingOrder.briefId);
          if (brief) {
            await storage.updateBriefSubmission(pendingOrder.briefId, {
              paymentStatus: "completed",
            });
            console.log("Brief payment status updated to completed");
            
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
              console.log("Brief confirmation email sent to:", brief.submittedByEmail);
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
              console.log("Brief admin notification sent");
            } catch (emailError) {
              console.error("Failed to send brief admin notification:", emailError);
            }
          } else {
            console.error("Brief not found for ID:", pendingOrder.briefId);
          }
          
          console.log("================================");
        }
      }
      
      // Send emails only after successful payment and order creation (for non-brief orders)
      // Skip this block if this was a brief payment - those emails are handled above
      if (intent && orderCreated) {
        const intentMetadata = intent.metadata as Record<string, any> | null;
        const intentPendingOrder = intentMetadata?.pendingOrder as Record<string, any> | undefined;
        
        // Only send generic order emails if this is NOT a brief payment
        if (!intentPendingOrder?.briefId) {
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
      }

      // Handle failed/cancelled brief payments - clean up uploaded files
      if (intent && !orderCreated && eventType) {
        const failedPaymentEvents = ["payment.failed", "payment.cancelled", "payment.declined"];
        if (failedPaymentEvents.includes(eventType)) {
          const metadata = intent.metadata as Record<string, any> | null;
          const pendingOrder = metadata?.pendingOrder as Record<string, any> | undefined;
          
          if (pendingOrder?.briefId) {
            console.log("=== Processing Failed Brief Payment - Cleaning Up Files ===");
            console.log("Brief ID:", pendingOrder.briefId);
            console.log("Event Type:", eventType);
            
            const brief = await storage.getBriefSubmission(pendingOrder.briefId);
            if (brief) {
              // Update brief payment status to failed
              await storage.updateBriefSubmission(pendingOrder.briefId, {
                paymentStatus: "failed",
              });
              console.log("Brief payment status updated to failed");
              
              // Delete uploaded files from object storage
              const briefFiles = (brief.files || []) as Array<{
                id: string;
                fileName: string;
                fileSize: number;
                mimeType: string;
                url: string;
                uploadedAt: string;
              }>;
              
              if (briefFiles.length > 0) {
                console.log(`Deleting ${briefFiles.length} files from failed brief...`);
                for (const file of briefFiles) {
                  // Extract storage path from URL (e.g., "/api/files/briefs/uuid-filename" -> "briefs/uuid-filename")
                  const storagePath = file.url.replace("/api/files/", "");
                  try {
                    const deleted = await deleteFile(storagePath);
                    if (deleted) {
                      console.log(`Deleted file: ${storagePath}`);
                    } else {
                      console.warn(`Failed to delete file: ${storagePath}`);
                    }
                  } catch (deleteError) {
                    console.error(`Error deleting file ${storagePath}:`, deleteError);
                  }
                }
                
                // Clear the files array from the brief record
                await storage.updateBriefSubmission(pendingOrder.briefId, {
                  files: [],
                });
                console.log("Brief files array cleared");
              }
            } else {
              console.error("Brief not found for cleanup:", pendingOrder.briefId);
            }
            
            console.log("=== End Failed Brief Cleanup ===");
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

  // Brief payment checkout endpoint - creates PayFast checkout for pending brief payments
  app.post("/api/briefs/:briefId/checkout", async (req, res) => {
    try {
      const { briefId } = req.params;
      const { providerKey = "payfast" } = req.body;

      // Get the brief
      const brief = await storage.getBriefSubmission(briefId);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }

      // Verify the brief is pending payment
      if (brief.paymentMethod !== "online" || brief.paymentStatus !== "pending") {
        return res.status(400).json({ error: "Brief does not require online payment or has already been paid" });
      }

      // Check if user is logged in to determine pricing tier
      let isMember = false;
      const sessionToken = req.cookies?.session;
      if (sessionToken) {
        try {
          const tokenHash = hashSessionToken(sessionToken);
          const session = await storage.getSessionByTokenHash(tokenHash);
          if (session && !isExpired(session.expiresAt)) {
            isMember = true;
          }
        } catch (e) {
          // Session check failed, treat as non-member
        }
      }

      // Calculate the payment amount - member vs standard pricing
      const isBasicStudy = brief.studyType.toLowerCase().includes("basic");
      const BASIC_PRICE_STANDARD = 5500;  // R5,500 for non-members
      const BASIC_PRICE_MEMBER = 5000;    // R5,000 for members
      const PRO_PRICE_STANDARD = 50000;   // R50,000 for non-members
      const PRO_PRICE_MEMBER = 45000;     // R45,000 for members
      
      const basicPrice = isMember ? BASIC_PRICE_MEMBER : BASIC_PRICE_STANDARD;
      const proPrice = isMember ? PRO_PRICE_MEMBER : PRO_PRICE_STANDARD;
      const pricePerConcept = isBasicStudy ? basicPrice : proPrice;
      const totalAmount = pricePerConcept * brief.numIdeas;

      // Create checkout with brief metadata
      const pendingOrderData = {
        customerName: brief.submittedByName,
        customerEmail: brief.submittedByEmail,
        customerCompany: brief.companyName,
        amount: totalAmount.toFixed(2),
        currency: "ZAR",
        purchaseType: `${brief.studyType} - ${brief.numIdeas} concept${brief.numIdeas > 1 ? "s" : ""}`,
        items: [{
          type: "brief_payment",
          description: `${brief.studyType} Research Study`,
          quantity: brief.numIdeas,
          unitAmount: pricePerConcept.toFixed(2),
        }],
        briefId: briefId, // Store briefId in metadata for webhook processing
      };

      const checkout = await paymentService.createCheckoutWithPendingOrder(
        pendingOrderData,
        providerKey
      );

      // Update brief with payment intent ID for tracking
      await storage.updateBriefSubmission(briefId, {
        paymentIntentId: checkout.intentId || null,
      });

      res.status(201).json(checkout);
    } catch (error: any) {
      console.error("Brief checkout error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // User lookup endpoint - requires admin access
  app.get("/api/users/email/:email", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(redactUser(user));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin API endpoints - All require admin authentication
  app.get("/api/admin/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(redactUsers(users));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(redactUser(user));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(redactUser(user));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.get("/api/admin/overview", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  // Comprehensive admin analytics endpoint
  app.get("/api/admin/analytics", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { period } = req.query;
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Fetch all data
      const [users, companies, orders, studies, briefs, subscriptions, deals] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllCompanies(),
        storage.getAllOrders(),
        storage.getAllStudies(),
        storage.getAllBriefSubmissions(),
        storage.getAllSubscriptions(),
        storage.getAllDeals(),
      ]);

      // Filter data by period
      const filterByDate = <T extends { createdAt: Date | string }>(items: T[]) => 
        items.filter((i: T) => new Date(i.createdAt) >= startDate);

      const periodUsers = filterByDate(users);
      const periodOrders = filterByDate(orders);
      const periodBriefs = filterByDate(briefs);
      const periodStudies = filterByDate(studies);

      // Calculate metrics (exclude Innovatr's fictional credits from totals)
      const realCompanies = companies.filter(c => c.name !== "Innovatr");
      const totalBasicCredits = realCompanies.reduce((sum: number, c) => sum + (c.basicCreditsTotal || 0), 0);
      const usedBasicCredits = realCompanies.reduce((sum: number, c) => sum + (c.basicCreditsUsed || 0), 0);
      const totalProCredits = realCompanies.reduce((sum: number, c) => sum + (c.proCreditsTotal || 0), 0);
      const usedProCredits = realCompanies.reduce((sum: number, c) => sum + (c.proCreditsUsed || 0), 0);

      const orderTotals = periodOrders.reduce((sum: number, o) => sum + parseFloat(String(o.amount) || "0"), 0);
      
      // Studies by company for bar chart
      const studiesByCompany = companies.map((c) => ({
        name: c.name,
        studies: studies.filter((s) => s.companyId === c.id).length,
        basicCredits: c.basicCreditsUsed || 0,
        proCredits: c.proCreditsUsed || 0,
      })).filter((c) => c.studies > 0 || c.basicCredits > 0 || c.proCredits > 0);

      // Orders by month for trend chart
      const ordersByMonth: Record<string, { month: string; orders: number; revenue: number }> = {};
      orders.forEach((o) => {
        const date = new Date(o.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!ordersByMonth[key]) {
          ordersByMonth[key] = { month: key, orders: 0, revenue: 0 };
        }
        ordersByMonth[key].orders++;
        ordersByMonth[key].revenue += parseFloat(String(o.amount) || "0");
      });
      const orderTrend = Object.values(ordersByMonth).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

      // Studies by month
      const studiesByMonth: Record<string, number> = {};
      studies.forEach((s) => {
        const date = new Date(s.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        studiesByMonth[key] = (studiesByMonth[key] || 0) + 1;
      });
      const studyTrend = Object.entries(studiesByMonth)
        .map(([month, count]) => ({ month, studies: count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-12);

      // Study stats for Research Snapshot (using studies table, not briefs)
      const briefStats = {
        new: studies.filter((s) => s.status === "NEW" || s.status === "new").length,
        inProgress: studies.filter((s) => 
          ["in_progress", "IN_PROGRESS", "AUDIENCE_LIVE", "ANALYSING_DATA"].includes(s.status)
        ).length,
        completed: studies.filter((s) => 
          s.status === "COMPLETED" || s.status === "completed" || s.status === "complete"
        ).length,
        onHold: studies.filter((s) => s.status === "ON_HOLD" || s.status === "on_hold").length,
      };

      // Credits by company for prediction
      const creditUsageRate = studiesByCompany.map((c) => {
        const company = companies.find((co) => co.name === c.name);
        if (!company) return null;
        const remaining = (company.basicCreditsTotal || 0) - (company.basicCreditsUsed || 0);
        return {
          name: c.name,
          remaining,
          used: c.basicCredits,
          rate: c.basicCredits / Math.max(1, studies.filter((s) => s.companyId === company.id).length),
        };
      }).filter(Boolean) as { name: string; remaining: number; used: number; rate: number }[];

      // Find company most likely to run out
      const nextToRunOut = creditUsageRate
        .filter((c) => c.remaining > 0 && c.rate > 0)
        .sort((a, b) => a.remaining / a.rate - b.remaining / b.rate)[0];

      // Get Test24 studies - all studies marked as Test24
      const test24Studies = studies
        .filter((s) => s.isTest24)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          title: s.title,
          companyName: s.companyName,
          status: s.status,
          studyType: s.studyType,
          isTest24: s.isTest24,
          submittedByName: s.submittedByName || "Unknown",
          createdAt: s.createdAt,
          deliveryDate: s.deliveryDate,
        }));

      // Get all reports for free reports library (only PUBLIC access level)
      const reports = await storage.getAllReports();
      const freeReports = reports
        .filter((r) => r.status === "published" && !r.isArchived && (r.accessLevel === "PUBLIC" || r.accessLevel === "public"))
        .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
        .map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || "General",
          accessLevel: r.accessLevel,
          status: r.status,
          date: r.date || r.createdAt,
          topics: r.topics || [],
        }));

      // Calculate "this month" metrics
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const usersThisMonth = users.filter((u) => new Date(u.createdAt) >= thisMonthStart).length;
      const companiesThisMonth = companies.filter((c) => new Date(c.createdAt) >= thisMonthStart).length;
      
      // Count PUBLIC reports (truly free to all)
      const freeReportsCount = reports.filter((r) => 
        r.status === "published" && 
        !r.isArchived && 
        (r.accessLevel === "PUBLIC" || r.accessLevel === "public")
      ).length;

      // Test24 tracker stats
      const test24BasicTotal = studies.filter((s) => s.isTest24 && s.studyType === "basic").length;
      const test24ProTotal = studies.filter((s) => s.isTest24 && s.studyType === "pro").length;
      const test24ThisMonth = studies.filter((s) => s.isTest24 && new Date(s.createdAt) >= thisMonthStart);
      const test24BasicThisMonth = test24ThisMonth.filter((s) => s.studyType === "basic").length;
      const test24ProThisMonth = test24ThisMonth.filter((s) => s.studyType === "pro").length;
      const test24InProgress = studies.filter((s) => 
        s.isTest24 && 
        (s.status === "in_progress" || s.status === "AUDIENCE_LIVE" || s.status === "ANALYSING_DATA" || s.status === "IN_PROGRESS")
      ).length;
      const test24CompletedBasic = studies.filter((s) => s.isTest24 && s.studyType === "basic" && s.status === "COMPLETED").length;
      const test24CompletedPro = studies.filter((s) => s.isTest24 && s.studyType === "pro" && s.status === "COMPLETED").length;
      const test24Completed = test24CompletedBasic + test24CompletedPro;

      res.json({
        metrics: {
          totalUsers: users.length,
          totalCompanies: companies.length,
          activeSubscriptions: subscriptions.filter((s) => s.status === "active").length,
          activeStudies: studies.filter((s) => s.status === "in_progress" || s.status === "AUDIENCE_LIVE" || s.status === "ANALYSING_DATA").length,
          briefsThisPeriod: periodBriefs.length,
          reportsPublished: reports.filter((r) => r.status === "published").length,
          freeReportsCount,
          creditsRemaining: {
            basic: totalBasicCredits - usedBasicCredits,
            pro: totalProCredits - usedProCredits,
          },
          newUsersThisMonth: usersThisMonth,
          newCompaniesThisMonth: companiesThisMonth,
        },
        test24Stats: {
          totalBasic: test24BasicTotal,
          totalPro: test24ProTotal,
          completedBasic: test24CompletedBasic,
          completedPro: test24CompletedPro,
          completed: test24Completed,
          basicThisMonth: test24BasicThisMonth,
          proThisMonth: test24ProThisMonth,
          inProgress: test24InProgress,
          briefsInPipeline: briefs.filter((b) => b.status !== "completed").length,
        },
        people: {
          newUsers: periodUsers.length,
          newCompanies: filterByDate(companies).length,
          topActiveCompany: studiesByCompany.sort((a, b) => b.studies - a.studies)[0]?.name || "N/A",
          usersByTier: {
            starter: users.filter((u) => u.membershipTier === "STARTER").length,
            growth: users.filter((u) => u.membershipTier === "GROWTH").length,
            scale: users.filter((u) => u.membershipTier === "SCALE").length,
          },
        },
        revenue: {
          ordersThisPeriod: periodOrders.length,
          totalOrderValue: orderTotals,
          averageOrderValue: periodOrders.length > 0 ? orderTotals / periodOrders.length : 0,
          creditsPurchased: totalBasicCredits + totalProCredits,
          creditsUsed: usedBasicCredits + usedProCredits,
          nextToRunOut: nextToRunOut?.name || "N/A",
        },
        pipeline: {
          totalBriefs: studies.length,
          briefStats,
          activeStudies: studies.filter((s) => s.status !== "complete" && s.status !== "COMPLETED").length,
          studyTrend,
        },
        charts: {
          studiesByCompany,
          orderTrend,
          studyTrend,
        },
        test24Studies,
        freeReports,
        activeDeals: deals.filter((d) => d.isActive).length,
        timestamp: new Date(),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Orders endpoints
  app.get("/api/admin/orders", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.patch("/api/admin/orders/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.get("/api/member/reports", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const userCompanyId = sessionUser.companyId;
      const reports = await storage.getAllReports();
      
      // Admin users can see ALL published reports (including all client-specific reports)
      if (isAdminUser(sessionUser.email)) {
        const allPublishedReports = reports.filter(r => 
          r.status === "published" && !r.isArchived
        );
        return res.json(allPublishedReports);
      }
      
      // Filter reports based on access rules for regular users
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
  app.get("/api/admin/reports", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/reports", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/reports/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.get("/api/admin/deals", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/deals", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/deals/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.get("/api/member/deals", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // All authenticated users can see deals (filtered by their membership tier if needed)
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get orders for the authenticated user
  app.get("/api/member/orders", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can optionally query by email
      if (isAdminUser(sessionUser.email) && req.query.email) {
        const orders = await storage.getOrdersByEmail(req.query.email as string);
        return res.json(orders);
      }
      
      // Regular users get their own orders
      const orders = await storage.getOrdersByEmail(sessionUser.email);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get company by ID - requires authentication
  app.get("/api/companies/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const { id } = req.params;
      
      // Only allow admin or users belonging to the company to view it
      if (!isAdminUser(sessionUser.email) && sessionUser.companyId !== id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      // Apply demo minimum credits for Hannah and Richard
      const adjustedCompany = applyDemoCredits(company, sessionUser.email);
      res.json(adjustedCompany);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Company management endpoints
  app.get("/api/admin/companies", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/companies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.post("/api/admin/companies", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.status(201).json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/companies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.get("/api/admin/companies/:id/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const users = await storage.getUsersByCompanyId(id);
      res.json(redactUsers(users));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/companies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.post("/api/admin/companies/:id/logo", requireAdmin, fileUpload.single("logo"), async (req: AuthenticatedRequest, res) => {
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
  app.delete("/api/admin/users/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.get("/api/admin/client-reports", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const reports = await storage.getAllClientReports();
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/client-reports/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.post("/api/admin/client-reports", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const report = await storage.createClientReport(req.body);
      res.status(201).json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/client-reports/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.delete("/api/admin/client-reports/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.post("/api/admin/client-reports/:id/pdf", requireAdmin, fileUpload.single("pdf"), async (req: AuthenticatedRequest, res) => {
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
      const filePath = `client_reports/${report.companyId}/${filename}`;
      
      await uploadFile(req.file.buffer, filePath);
      await storage.updateClientReport(id, { pdfUrl: `/api/files/${filePath}` });
      
      const updated = await storage.getClientReport(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Generate placeholder PDF for a client report
  app.post("/api/admin/client-reports/:id/generate-pdf", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getClientReport(id);
      if (!report) {
        return res.status(404).json({ error: "Client report not found" });
      }

      const company = await storage.getCompany(report.companyId);
      const companyName = company?.name || "Unknown Company";

      const storagePath = `client_reports/${report.companyId}/${id}_${Date.now()}.pdf`;
      const result = await createAndUploadPlaceholderPDF(
        {
          title: report.title,
          companyName,
          description: report.description || undefined,
          reportType: report.tags?.includes("Test24 Pro") ? "Test24 Pro Report" : "Test24 Basic Report",
          date: report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString("en-ZA") : undefined,
        },
        storagePath
      );

      if (result.success && result.url) {
        await storage.updateClientReport(id, { pdfUrl: result.url });
        const updated = await storage.getClientReport(id);
        res.json({ success: true, report: updated });
      } else {
        res.status(500).json({ error: result.error || "Failed to generate PDF" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Regenerate placeholder PDFs for all client reports that have invalid paths
  app.post("/api/admin/client-reports/regenerate-all-pdfs", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const reports = await storage.getAllClientReports();
      const companies = await storage.getAllCompanies();
      const companyMap = new Map(companies.map(c => [c.id, c.name]));

      const results: { id: string; title: string; success: boolean; error?: string }[] = [];

      for (const report of reports) {
        // Skip reports without pdfUrl or with valid /api/files paths that exist
        if (!report.pdfUrl || report.pdfUrl.startsWith("/api/files/")) {
          // Check if file exists for /api/files paths
          if (report.pdfUrl?.startsWith("/api/files/")) {
            const filePath = report.pdfUrl.replace("/api/files/", "");
            const exists = await fileExists(filePath);
            if (exists) {
              results.push({ id: report.id, title: report.title, success: true });
              continue;
            }
          }
        }

        // Generate new PDF for reports with invalid paths
        if (report.pdfUrl && !report.pdfUrl.startsWith("/api/files/")) {
          const companyName = companyMap.get(report.companyId) || "Unknown Company";
          const storagePath = `client_reports/${report.companyId}/${report.id}_${Date.now()}.pdf`;
          
          const result = await createAndUploadPlaceholderPDF(
            {
              title: report.title,
              companyName,
              description: report.description || undefined,
              reportType: report.tags?.includes("Test24 Pro") ? "Test24 Pro Report" : "Test24 Basic Report",
              date: report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString("en-ZA") : undefined,
            },
            storagePath
          );

          if (result.success && result.url) {
            await storage.updateClientReport(report.id, { pdfUrl: result.url });
            results.push({ id: report.id, title: report.title, success: true });
          } else {
            results.push({ id: report.id, title: report.title, success: false, error: result.error });
          }
        }
      }

      res.json({ 
        success: true, 
        message: `Processed ${results.length} reports`,
        results 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get client reports for the authenticated user's company
  app.get("/api/member/client-reports", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const queryCompanyId = req.query.companyId as string | undefined;
      
      // Admin users (@innovatr.co.za) can see reports for a specific company or all
      if (isAdminUser(sessionUser.email)) {
        if (queryCompanyId) {
          // Admin viewing a specific company's reports
          const company = await storage.getCompany(queryCompanyId);
          const reports = await storage.getClientReportsByCompanyId(queryCompanyId);
          const enrichedReports = reports.map((report) => ({
            ...report,
            companyName: company?.name || "Unknown Company",
          }));
          return res.json(enrichedReports);
        }
        
        // Admin viewing all reports
        const allReports = await storage.getAllClientReports();
        const enrichedReports = await Promise.all(
          allReports.map(async (report) => {
            const company = await storage.getCompany(report.companyId);
            return {
              ...report,
              companyName: company?.name || "Unknown Company",
            };
          })
        );
        return res.json(enrichedReports);
      }
      
      // Regular users get their own company's reports
      if (!sessionUser.companyId) {
        return res.json([]);
      }
      
      // For regular users, get their company name to include in reports
      const company = await storage.getCompany(sessionUser.companyId);
      const reports = await storage.getClientReportsByCompanyId(sessionUser.companyId);
      const enrichedReports = reports.map((report) => ({
        ...report,
        companyName: company?.name || "Unknown Company",
      }));
      res.json(enrichedReports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/companies/:companyId/client-reports", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const reports = await storage.getClientReportsByCompanyId(companyId);
      res.json(reports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get company for the authenticated user (for member portal)
  app.get("/api/member/company", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can optionally query by companyId
      if (isAdminUser(sessionUser.email) && req.query.companyId) {
        const company = await storage.getCompany(req.query.companyId as string);
        if (!company) {
          return res.status(404).json({ error: "Company not found" });
        }
        return res.json(company);
      }
      
      // For regular users, get their own company
      if (!sessionUser.companyId) {
        return res.status(404).json({ error: "User not associated with a company" });
      }
      
      const company = await storage.getCompany(sessionUser.companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      // Apply demo credits for Hannah and Richard
      const adjustedCompany = applyDemoCredits(company, sessionUser.email);
      res.json(adjustedCompany);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get briefs for the authenticated user
  app.get("/api/member/briefs", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can see all briefs
      if (isAdminUser(sessionUser.email)) {
        const allBriefs = await storage.getAllBriefSubmissions();
        return res.json(allBriefs);
      }
      
      // For regular users, get briefs by their email and optionally their company
      let briefs = await storage.getBriefSubmissionsByEmail(sessionUser.email);
      
      // If user has a company, also include company briefs
      if (sessionUser.companyId) {
        const companyBriefs = await storage.getBriefSubmissionsByCompanyId(sessionUser.companyId);
        // Merge and deduplicate by ID
        const briefIds = new Set(briefs.map(b => b.id));
        for (const brief of companyBriefs) {
          if (!briefIds.has(brief.id)) {
            briefs.push(brief);
          }
        }
        // Sort by createdAt descending
        briefs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      res.json(briefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get credit ledger history for the authenticated user's company
  app.get("/api/member/credit-ledger", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can optionally query by companyId
      if (isAdminUser(sessionUser.email) && req.query.companyId) {
        const ledgerEntries = await storage.getCreditLedgerByCompanyId(req.query.companyId as string);
        return res.json(ledgerEntries);
      }
      
      // For regular users, get their company's credit ledger
      if (!sessionUser.companyId) {
        return res.json([]); // No company, no credit history
      }
      
      const ledgerEntries = await storage.getCreditLedgerByCompanyId(sessionUser.companyId);
      res.json(ledgerEntries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Subscription management endpoints
  app.get("/api/admin/subscriptions", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/subscriptions/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  app.patch("/api/admin/subscriptions/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

  // User subscription endpoints - require authentication
  app.get("/api/subscriptions/email/:email", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const { email } = req.params;
      
      // Only allow admin or the user themselves to view subscriptions
      if (!isAdminUser(sessionUser.email) && sessionUser.email !== email) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const subscriptions = await storage.getSubscriptionsByEmail(email);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/subscriptions/user/:userId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const { userId } = req.params;
      
      // Only allow admin or the user themselves to view subscriptions
      if (!isAdminUser(sessionUser.email) && sessionUser.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const subscriptions = await storage.getSubscriptionsByUserId(userId);
      res.json(subscriptions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Cancel subscription endpoint - require authentication and ownership verification
  app.post("/api/subscriptions/:id/cancel", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const { id } = req.params;
      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Verify ownership: user must own the subscription or be an admin
      if (!isAdminUser(sessionUser.email) && 
          subscription.customerEmail !== sessionUser.email && 
          subscription.userId !== sessionUser.id) {
        return res.status(403).json({ error: "Access denied" });
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

  // File upload endpoints for App Storage - require admin access
  app.post("/api/upload/thumbnail", requireAdmin, fileUpload.single("file"), async (req: AuthenticatedRequest, res) => {
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

  app.post("/api/upload/pdf", requireAdmin, fileUpload.single("file"), async (req: AuthenticatedRequest, res) => {
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

  // Client report PDF upload endpoint - require admin access
  app.post("/api/upload/client-report", requireAdmin, fileUpload.single("file"), async (req: AuthenticatedRequest, res) => {
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

  // Serve files from App Storage - require authentication with access control
  app.get("/api/files/*", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const filePath = (req.params as Record<string, string>)[0];
      
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      // Access control: check if user is allowed to view this file
      // Admins can access all files; regular users can only access:
      // - Public files (thumbnails, general pdfs)
      // - Their own company's client reports
      if (!isAdminUser(sessionUser.email)) {
        // Check if this is a client report - restrict to company owner
        if (filePath.startsWith("client_reports/")) {
          const pathParts = filePath.split("/");
          const companyId = pathParts[1]; // client_reports/{companyId}/{file}
          if (sessionUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
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
  app.delete("/api/files/*", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.get("/api/admin/files", requireAdmin, async (req: AuthenticatedRequest, res) => {
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

      // Determine if this is an online payment that needs checkout redirect
      const isOnlinePayment = validated.paymentMethod === "online";
      
      // Check if user is logged in to determine pricing tier
      let isMember = false;
      const sessionToken = req.cookies?.session;
      if (sessionToken) {
        try {
          const tokenHash = hashSessionToken(sessionToken);
          const session = await storage.getSessionByTokenHash(tokenHash);
          if (session && !isExpired(session.expiresAt)) {
            isMember = true;
          }
        } catch (e) {
          // Session check failed, treat as non-member
        }
      }
      
      // Calculate price for online payments - member vs standard pricing
      const BASIC_PRICE_STANDARD = 5500;  // R5,500 for non-members
      const BASIC_PRICE_MEMBER = 5000;    // R5,000 for members
      const PRO_PRICE_STANDARD = 50000;   // R50,000 for non-members
      const PRO_PRICE_MEMBER = 45000;     // R45,000 for members
      
      const basicPrice = isMember ? BASIC_PRICE_MEMBER : BASIC_PRICE_STANDARD;
      const proPrice = isMember ? PRO_PRICE_MEMBER : PRO_PRICE_STANDARD;
      const pricePerConcept = isBasicStudy ? basicPrice : proPrice;
      const totalAmount = pricePerConcept * creditsRequired;

      // Create brief submission with server-computed credit values
      const brief = await storage.createBriefSubmission({
        ...validated,
        concepts: validated.concepts || [],
        companyId: companyIdStr || (validated.companyId ? String(validated.companyId) : null),
        paymentMethod: validated.paymentMethod || "online",
        paymentStatus: isOnlinePayment ? "pending" : null,
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

      // For online payments, don't send confirmation emails yet - wait for payment success
      if (!isOnlinePayment) {
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
      }

      // For online payments, return payment details for checkout redirect
      if (isOnlinePayment) {
        res.status(201).json({ 
          success: true, 
          brief,
          requiresPayment: true,
          payment: {
            briefId: brief.id,
            amount: totalAmount.toFixed(2),
            currency: "ZAR",
            description: `${brief.studyType} - ${creditsRequired} concept${creditsRequired > 1 ? 's' : ''}`,
            customerName: brief.submittedByName,
            customerEmail: brief.submittedByEmail,
            customerCompany: brief.companyName,
          }
        });
      } else {
        res.status(201).json({ success: true, brief });
      }
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
  app.get("/api/admin/briefs", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const briefs = await storage.getAllBriefSubmissions();
      res.json(briefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single brief submission
  app.get("/api/admin/briefs/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.patch("/api/admin/briefs/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  
  // Get studies for the authenticated user
  app.get("/api/member/studies", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      // Admin users can see all studies or filter by companyId
      if (isAdminUser(sessionUser.email)) {
        if (req.query.companyId) {
          const studies = await storage.getStudiesByCompanyId(req.query.companyId as string);
          return res.json(studies);
        }
        const allStudies = await storage.getAllStudies();
        return res.json(allStudies);
      }
      
      // For regular users, get studies by their email or company
      let studies = await storage.getStudiesByEmail(sessionUser.email);
      
      // If user has a company, also include company studies
      if (sessionUser.companyId) {
        const companyStudies = await storage.getStudiesByCompanyId(sessionUser.companyId);
        // Merge and deduplicate by ID
        const studyIds = new Set(studies.map(s => s.id));
        for (const study of companyStudies) {
          if (!studyIds.has(study.id)) {
            studies.push(study);
          }
        }
        // Sort by createdAt descending
        studies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      res.json(studies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all studies (admin only)
  app.get("/api/admin/studies", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studies = await storage.getAllStudies();
      res.json(studies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new study from a brief (admin only)
  app.post("/api/admin/studies", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.post("/api/admin/studies/from-brief/:briefId", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.get("/api/admin/studies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.patch("/api/admin/studies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
  app.patch("/api/admin/studies/:id/status", requireAdmin, async (req: AuthenticatedRequest, res) => {
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
