import type { Express, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import crypto from "crypto";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { storage } from "./storage";
import { insertCouponClaimSchema, insertMailerSubscriptionSchema, insertOrderSchema, insertOrderItemWithoutOrderIdSchema, insertReportSchema, insertDealSchema, insertCaseStudySchema, insertInquirySchema, insertSandboxRunSchema, type BriefSubmission } from "@shared/schema";
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

// Multer for report file uploads - supports PDF and PPTX
const reportFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max for reports
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "image/jpeg", "image/png", "image/gif", "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Supported types: PDF, PowerPoint (PPTX, PPT), and images.`));
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

  // User registration endpoint - creates new users with FREE tier
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, surname, company, industry, referralSource, wantsContact, subscribeNewsletter } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      if (!company || !company.trim()) {
        return res.status(400).json({ message: "Company name is required" });
      }
      
      if (!industry || !industry.trim()) {
        return res.status(400).json({ message: "Industry is required" });
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
      
      // Handle company creation/linking
      let companyId: string | null = null;
      const companyName = company.trim();
      const userIndustry = industry.trim();
      
      // Check if company already exists
      const allCompanies = await storage.getAllCompanies();
      const existingCompany = allCompanies.find(c => 
        c.name.toLowerCase() === companyName.toLowerCase()
      );
      
      if (existingCompany) {
        // Link to existing company, update industry if not set
        companyId = existingCompany.id;
        if (!existingCompany.industry && userIndustry) {
          await storage.updateCompany(existingCompany.id, { industry: userIndustry });
        }
      } else {
        // Create a new FREE tier company with industry
        const newCompany = await storage.createCompany({
          name: companyName,
          tier: "FREE",
          industry: userIndustry || null,
          basicCreditsTotal: 0,
          basicCreditsUsed: 0,
          proCreditsTotal: 0,
          proCreditsUsed: 0,
        });
        companyId = newCompany.id;
      }
      
      // Create user with FREE tier (never STARTER for new signups)
      // If no company is provided, they are an independent member
      const newUser = await storage.createUser({
        username: email.split("@")[0] + "_" + Date.now(),
        email,
        password: "", // Security: never store plaintext passwords
        name: name || email.split("@")[0],
        surname: surname || null,
        company: companyName || null,
        industry: userIndustry || null,
        referralSource: referralSource || null,
        wantsContact: wantsContact || false,
        companyId: companyId,
        membershipTier: "FREE",
        memberType: companyId ? "companyUser" : "independent",
        status: "ACTIVE",
        role: "MEMBER",
        creditsBasic: 0,
        creditsPro: 0,
        pulseSubscribed: subscribeNewsletter !== false,
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
        storage.createActivityEvent({
          userId: user.id,
          companyId: user.companyId ?? null,
          actionType: "login_failed",
          metadata: { reason: "account_disabled" },
        }).catch(err => console.error("Failed to log disabled account login:", err));
        
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
        storage.createActivityEvent({
          userId: user.id,
          companyId: user.companyId ?? null,
          actionType: "login_failed",
          metadata: { reason: "invalid_password", ip: req.ip || req.socket.remoteAddress },
        }).catch(err => console.error("Failed to log failed login:", err));
        
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

      // Log login activity
      storage.createActivityEvent({
        userId: user.id,
        companyId: user.companyId ?? null,
        actionType: "login",
      }).catch(err => console.error("Failed to log login activity:", err));
      
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
      
      // Auto-downgrade: check if company membership has expired
      if (user.companyId && user.membershipTier && user.membershipTier !== "FREE") {
        try {
          const company = await storage.getCompany(user.companyId);
          if (company && company.tier !== "FREE") {
            const contractEnd = company.contractEnd 
              ? new Date(company.contractEnd) 
              : (company.contractStart ? new Date(new Date(company.contractStart).getTime() + 365 * 24 * 60 * 60 * 1000) : null);
            if (contractEnd && contractEnd < new Date()) {
              await storage.updateCompany(company.id, { tier: "FREE" });
              const companyUsers = await storage.getUsersByCompanyId(company.id);
              for (const cu of companyUsers) {
                if (cu.membershipTier !== "FREE" && cu.role !== "ADMIN") {
                  await storage.updateUser(cu.id, { membershipTier: "FREE" });
                }
              }
              user.membershipTier = "FREE";
            }
          }
        } catch (e) {
          console.error("Auto-downgrade check failed:", e);
        }
      }
      
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
      
      // Send reset email (construct reset URL using current request origin)
      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      
      // Send email via Resend
      try {
        await emailService.sendPasswordResetEmail(user.email, user.name || 'User', resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
      
      storage.createActivityEvent({
        userId: user.id,
        companyId: user.companyId ?? null,
        actionType: "password_reset_requested",
      }).catch(err => console.error("Failed to log password reset request:", err));
      
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
      
      storage.createActivityEvent({
        userId: user.id,
        companyId: user.companyId ?? null,
        actionType: "password_reset_completed",
      }).catch(err => console.error("Failed to log password reset completion:", err));
      
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

  // Change password (while logged in)
  app.post("/api/auth/change-password", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ 
          error: "Password does not meet requirements",
          details: passwordValidation.errors 
        });
      }
      
      // Get the current user
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.passwordHash) {
        return res.status(400).json({ error: "User not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Hash new password and update user
      const passwordHash = await hashPassword(newPassword);
      await storage.updateUser(user.id, { 
        passwordHash,
        password: "***changed***"
      });
      
      // Send password change success email
      try {
        await emailService.sendPasswordResetSuccessEmail(user.email, user.name || 'User');
      } catch (emailError) {
        console.error("Failed to send password change success email:", emailError);
      }
      
      res.json({ message: "Password has been changed successfully." });
    } catch (error: any) {
      console.error("Password change error:", error);
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

  app.post("/api/orders", requireAuth, async (req: AuthenticatedRequest, res) => {
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

      // reCAPTCHA v3 verification
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY not configured");
        return res.status(500).json({ error: "Server configuration error." });
      }
      const recaptchaToken = req.body.recaptchaToken;
      if (!recaptchaToken) {
        return res.status(400).json({ error: "reCAPTCHA verification required." });
      }
      const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(recaptchaToken)}`,
      });
      const verifyData = await verifyResponse.json() as { success: boolean; score: number; action: string };
      if (!verifyData.success || verifyData.score < 0.5 || verifyData.action !== "contact") {
        return res.status(400).json({ error: "reCAPTCHA verification failed. Please try again." });
      }

      const contactSchema = z.object({
        name: z.string().min(1, "Name is required").max(100, "Name is too long"),
        email: z.string().email("Please provide a valid email address"),
        company: z.string().max(100, "Company name is too long").optional(),
        message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message is too long"),
        recaptchaToken: z.string().optional(),
      });

      const validated = contactSchema.parse(req.body);

      await sendContactFormMessage({
        name: validated.name,
        email: validated.email,
        company: validated.company || "",
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
      // SECURITY: Only process if intent.status === "failed" since that's only set after
      // verified payment failure (see PaymentService.handleWebhook line 370-371)
      // This prevents unverified webhooks from triggering file deletion
      if (intent && !orderCreated && intent.status === "failed") {
        const failedPaymentEvents = ["payment.failed", "payment.cancelled", "payment.declined"];
        const isFailedByEventType = eventType && failedPaymentEvents.includes(eventType);
        
        // Log if intent.status is failed but eventType doesn't match expected failure events
        if (!isFailedByEventType) {
          console.log(`Note: Intent ${intent.id} marked failed but eventType='${eventType}' is not a known failure event`);
        }
        
        // Proceed with cleanup since intent.status === "failed" implies verified failure
        {
          const metadata = intent.metadata as Record<string, any> | null;
          const pendingOrder = metadata?.pendingOrder as Record<string, any> | undefined;
          
          // Validate briefId exists and is a valid UUID format
          const briefId = pendingOrder?.briefId;
          if (briefId && typeof briefId === "string" && briefId.match(/^[0-9a-f-]{36}$/i)) {
            console.log("=== Processing Failed Brief Payment - Cleaning Up Files ===");
            console.log("Brief ID:", briefId);
            console.log("Event Type:", eventType);
            
            const brief = await storage.getBriefSubmission(briefId);
            if (brief) {
              // Only process if brief payment is still pending (prevents duplicate processing)
              if (brief.paymentStatus === "pending") {
                // Update brief payment status to failed first
                await storage.updateBriefSubmission(briefId, {
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
                  console.log(`Attempting to delete ${briefFiles.length} files from failed brief...`);
                  const successfullyDeleted: string[] = [];
                  const failedToDelete: string[] = [];
                  
                  for (const file of briefFiles) {
                    // Extract storage path and validate it starts with "briefs/" (security check)
                    const storagePath = file.url.replace("/api/files/", "");
                    
                    // Security: Only delete files under the briefs/ prefix to prevent path traversal
                    if (!storagePath.startsWith("briefs/") || storagePath.includes("..")) {
                      console.warn(`Skipping invalid file path: ${storagePath}`);
                      failedToDelete.push(file.fileName);
                      continue;
                    }
                    
                    try {
                      const deleted = await deleteFile(storagePath);
                      if (deleted) {
                        console.log(`Deleted file: ${storagePath}`);
                        successfullyDeleted.push(file.id);
                      } else {
                        console.warn(`Failed to delete file: ${storagePath}`);
                        failedToDelete.push(file.fileName);
                      }
                    } catch (deleteError) {
                      console.error(`Error deleting file ${storagePath}:`, deleteError);
                      failedToDelete.push(file.fileName);
                    }
                  }
                  
                  // Only remove successfully deleted files from brief record
                  // Keep references to files that failed to delete for manual cleanup
                  if (successfullyDeleted.length > 0) {
                    const remainingFiles = briefFiles.filter(f => !successfullyDeleted.includes(f.id));
                    await storage.updateBriefSubmission(briefId, {
                      files: remainingFiles,
                    });
                    console.log(`Cleaned up ${successfullyDeleted.length} files, ${remainingFiles.length} remaining`);
                  }
                  
                  if (failedToDelete.length > 0) {
                    console.warn(`Failed to delete ${failedToDelete.length} files - manual cleanup may be needed:`, failedToDelete);
                  }
                }
              } else {
                console.log(`Brief ${briefId} payment status is already ${brief.paymentStatus}, skipping cleanup`);
              }
            } else {
              console.error("Brief not found for cleanup:", briefId);
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
  app.get("/api/admin/engagement-stats", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const companies = await storage.getAllCompanies();
      const allStudies = await storage.getAllStudies();
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const nonAdminUsers = users.filter(u => u.role !== "ADMIN");
      const activeUsers30d = nonAdminUsers.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) >= thirtyDaysAgo).length;
      const neverLoggedIn = nonAdminUsers.filter(u => !u.lastLoginAt).length;
      
      let totalReportViews = 0;
      try {
        const adminUserIds = new Set(users.filter(u => u.role === "ADMIN").map(u => u.id));
        const allEvents = await storage.getActivityEventsSince(new Date(0));
        totalReportViews = allEvents.filter((e: any) => 
          (e.actionType === "view_report" || e.actionType === "view_client_report" || e.actionType === "report_view") &&
          !adminUserIds.has(e.userId)
        ).length;
      } catch (e) {
        // fallback
      }
      
      res.json({
        totalUsers: nonAdminUsers.length,
        activeUsers30d,
        totalCompanies: companies.filter(c => c.name !== "Innovatr").length,
        totalBriefs: allStudies.length,
        neverLoggedIn,
        totalReportViews,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

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
      const { membershipTier, status, role, creditsBasic, creditsPro, companyId, company, name, memberType, email, phone, isPaidSeat } = req.body;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate email if being changed
      if (email && email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "Email is already in use by another user" });
        }
      }

      // Determine if this is an independent member
      const isIndependentType = memberType === "independent";
      const isIndependentCompany = companyId === "none" || companyId === "independent" || companyId === null;
      
      // Validate company exists if provided and not independent
      if (companyId && !isIndependentType && !isIndependentCompany) {
        const companyRecord = await storage.getCompany(companyId);
        if (!companyRecord) {
          return res.status(400).json({ error: "Company not found" });
        }
      }

      await storage.updateUser(id, {
        membershipTier: membershipTier || user.membershipTier,
        status: status || user.status,
        role: role || user.role,
        creditsBasic: creditsBasic !== undefined ? creditsBasic : user.creditsBasic,
        creditsPro: creditsPro !== undefined ? creditsPro : user.creditsPro,
        companyId: isIndependentType ? null : (isIndependentCompany ? null : (companyId !== undefined ? companyId : user.companyId)),
        company: isIndependentType ? null : (isIndependentCompany ? null : (company !== undefined ? company : user.company)),
        name: name !== undefined ? name : user.name,
        email: email || user.email,
        phone: phone !== undefined ? phone : user.phone,
        memberType: memberType || user.memberType || "companyUser",
        isPaidSeat: isPaidSeat !== undefined ? isPaidSeat : user.isPaidSeat,
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
      
      let periodLabel: string;
      switch (period) {
        case "1d":
          startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
          periodLabel = "Last 24 hrs";
          break;
        case "3d":
          startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          periodLabel = "Last 3 days";
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          periodLabel = "Last 7 days";
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          periodLabel = "Last 30 days";
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          periodLabel = "This year";
          break;
        case "all":
          startDate = new Date(0);
          periodLabel = "All time";
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          periodLabel = "Last 30 days";
      }

      // Fetch all data
      const [users, companies, orders, initialStudies, briefs, subscriptions, deals] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllCompanies(),
        storage.getAllOrders(),
        storage.getAllStudies(),
        storage.getAllBriefSubmissions(),
        storage.getAllSubscriptions(),
        storage.getAllDeals(),
      ]);

      // Backfill: auto-create studies for briefs that don't have one yet
      const existingBriefIds = new Set(initialStudies.filter(s => s.briefId).map(s => s.briefId));
      for (const brief of briefs) {
        if (!existingBriefIds.has(brief.id)) {
          try {
            const isBasic = brief.studyType?.toLowerCase().includes("basic");
            await storage.createStudy({
              briefId: brief.id,
              companyId: brief.companyId || undefined,
              companyName: brief.companyName,
              title: `${brief.companyBrand || brief.companyName} - ${isBasic ? "Test24 Basic" : "Test24 Pro"}`,
              description: brief.researchObjective?.slice(0, 200) || "",
              studyType: isBasic ? "basic" : "pro",
              status: brief.status === "in_progress" ? "AUDIENCE_LIVE" : "NEW",
              isTest24: true,
              tags: [brief.companyName, isBasic ? "basic" : "pro", brief.industry || ""].filter(Boolean),
              submittedByEmail: brief.submittedByEmail,
              submittedByName: brief.submittedByName || undefined,
            });
          } catch (e) {
            // Skip if study creation fails (e.g. duplicate)
          }
        }
      }
      // Re-fetch studies after backfill
      const studies = await storage.getAllStudies();
      const allClientReports = await storage.getAllClientReports();
      const companyMap = new Map(companies.map(c => [c.id, c.name]));

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

      // Get Test24 studies - all studies marked as Test24, sorted: in-progress first, then completed
      const statusOrder: Record<string, number> = {
        "AUDIENCE_LIVE": 0, "ANALYSING_DATA": 1, "IN_PROGRESS": 2, "NEW": 3, "COMPLETED": 4
      };
      const test24Studies = studies
        .filter((s) => s.isTest24)
        .sort((a, b) => {
          const oa = statusOrder[a.status] ?? 5;
          const ob = statusOrder[b.status] ?? 5;
          if (oa !== ob) return oa - ob;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
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
          clientReportId: s.clientReportId || null,
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

      // Calendar "this month" for absolute counters (always calendar-month, not period-dependent)
      const calendarMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const usersThisMonth = users.filter((u) => new Date(u.createdAt) >= calendarMonthStart).length;
      const companiesThisMonth = companies.filter((c) => new Date(c.createdAt) >= calendarMonthStart).length;
      
      // Period-based "new" counters for sub-labels that respond to period selector
      const newUsersInPeriod = users.filter((u) => new Date(u.createdAt) >= startDate).length;
      const newCompaniesInPeriod = companies.filter((c) => new Date(c.createdAt) >= startDate).length;
      
      // Count PUBLIC reports (truly free to all)
      const freeReportsCount = reports.filter((r) => 
        r.status === "published" && 
        !r.isArchived && 
        (r.accessLevel === "PUBLIC" || r.accessLevel === "public")
      ).length;

      // Combined "My Research" — all studies + standalone client_reports (not already linked via study.clientReportId)
      const linkedClientReportIds = new Set(studies.map(s => s.clientReportId).filter(Boolean));
      const standaloneClientReports = allClientReports.filter(cr => !linkedClientReportIds.has(cr.id));
      
      const allResearchItems: {
        id: string; title: string; companyName: string; status: string;
        studyType: string | null; clientReportId: string | null;
        deliveryDate: Date | string | null; kind: "study" | "report";
      }[] = [
        ...studies.map(s => ({
          id: s.id, title: s.title, companyName: s.companyName || "",
          status: s.status, studyType: s.studyType || null,
          clientReportId: s.clientReportId || null,
          deliveryDate: s.deliveryDate || null, kind: "study" as const,
        })),
        ...standaloneClientReports.map(cr => ({
          id: cr.id, title: cr.title,
          companyName: cr.companyId ? (companyMap.get(cr.companyId) || "") : "",
          status: cr.status || "Completed",
          studyType: cr.studyType || null, clientReportId: null,
          deliveryDate: cr.deliveredAt || null, kind: "report" as const,
        })),
      ].sort((a, b) => {
        const activeStatuses = ["AUDIENCE_LIVE","ANALYSING_DATA","IN_PROGRESS","NEW","Brief Submitted","In Progress"];
        const aActive = activeStatuses.some(s => a.status?.includes(s));
        const bActive = activeStatuses.some(s => b.status?.includes(s));
        if (aActive !== bActive) return aActive ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
      
      const researchStats = {
        total: allResearchItems.length,
        active: allResearchItems.filter(i => {
          const s = i.status?.toLowerCase();
          return s && !s.includes("complet") && s !== "";
        }).length,
        completed: allResearchItems.filter(i => i.status?.toLowerCase().includes("complet")).length,
      };

      // Test24 tracker stats — all-time totals stay all-time; period stats use startDate
      const test24BasicTotal = studies.filter((s) => s.isTest24 && s.studyType === "basic").length;
      const test24ProTotal = studies.filter((s) => s.isTest24 && s.studyType === "pro").length;
      const test24InPeriod = studies.filter((s) => s.isTest24 && new Date(s.createdAt) >= startDate);
      const test24BasicThisMonth = test24InPeriod.filter((s) => s.studyType === "basic").length;
      const test24ProThisMonth = test24InPeriod.filter((s) => s.studyType === "pro").length;
      const test24InProgress = studies.filter((s) => 
        s.isTest24 && 
        (s.status === "in_progress" || s.status === "AUDIENCE_LIVE" || s.status === "ANALYSING_DATA" || s.status === "IN_PROGRESS")
      ).length;
      const test24CompletedBasic = studies.filter((s) => s.isTest24 && s.studyType === "basic" && s.status === "COMPLETED").length;
      const test24CompletedPro = studies.filter((s) => s.isTest24 && s.studyType === "pro" && s.status === "COMPLETED").length;
      const test24Completed = test24CompletedBasic + test24CompletedPro;

      // Activity metrics — now use startDate so they respond to the selected period
      const recentActivity = await storage.getActivityEventsSince(startDate);
      const loginFailures = recentActivity.filter(a => a.actionType === "login_failed").length;
      const passwordResetRequests = recentActivity.filter(a => a.actionType === "password_reset_requested").length;
      const passwordResetCompletions = recentActivity.filter(a => a.actionType === "password_reset_completed").length;
      const totalLogins = recentActivity.filter(a => a.actionType === "login").length;
      
      const activeUsersInPeriod = new Set(
        recentActivity.filter(a => a.actionType === "login").map(a => a.userId)
      ).size;
      
      const usersNeverLoggedIn = users.filter(u => !u.lastLoginAt).length;
      const usersInactive30Days = users.filter(u => {
        if (!u.lastLoginAt) return true;
        const lastLogin = new Date(u.lastLoginAt);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return lastLogin < thirtyDaysAgo;
      }).length;

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
          newUsersInPeriod,
          newCompaniesInPeriod,
        },
        authActivity: {
          loginsThisMonth: totalLogins,
          loginFailuresThisMonth: loginFailures,
          passwordResetRequestsThisMonth: passwordResetRequests,
          passwordResetCompletionsThisMonth: passwordResetCompletions,
          activeUsersThisMonth: activeUsersInPeriod,
          usersNeverLoggedIn,
          usersInactive30Days,
        },
        periodLabel,
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
            custom: users.filter((u) => u.membershipTier === "CUSTOM").length,
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
        allResearchItems,
        researchStats,
        freeReports,
        activeDeals: deals.filter((d) => d.isActive).length,
        reportEngagement: await storage.getGlobalReportEngagement(startDate),
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

      const validStatuses = ["pending", "processing", "completed", "paid", "failed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }

      await storage.updateOrder(id, { status });

      // Auto-allocate credits when order is marked as completed or paid (idempotent - only on first transition)
      if ((status === "completed" || status === "paid") && order.status !== "completed" && order.status !== "paid") {
        try {
          // Find the user's company to credit
          let companyId: string | null = null;
          if (order.userId) {
            const orderUser = await storage.getUser(order.userId);
            if (orderUser?.companyId) {
              companyId = orderUser.companyId;
            }
          }
          // If no userId, try to find user by email
          if (!companyId && order.customerEmail) {
            const users = await storage.getAllUsers();
            const matchedUser = users.find(u => u.email === order.customerEmail);
            if (matchedUser?.companyId) {
              companyId = matchedUser.companyId;
            }
          }

          // Parse credit info from order items or purchase type
          if (companyId) {
            const orderItems = await storage.getOrderItems(order.id);
            const purchaseDesc = (order.purchaseType || "").toLowerCase();
            
            for (const item of orderItems) {
              const desc = (item.description || "").toLowerCase();
              const qty = item.quantity || 1;
              
              if (desc.includes("basic") && desc.includes("credit")) {
                const company = await storage.getCompany(companyId);
                if (company) {
                  const newTotal = (company.basicCreditsTotal || 0) + qty;
                  await storage.updateCompany(companyId, { basicCreditsTotal: newTotal });
                  await storage.createCreditLedgerEntry({
                    companyId,
                    creditType: "basic",
                    transactionType: "purchase",
                    amount: qty,
                    balanceAfter: newTotal - (company.basicCreditsUsed || 0),
                    description: `Order ${order.id.slice(0, 8)}: ${item.description}`,
                    userId: order.userId || null,
                  });
                }
              } else if (desc.includes("pro") && desc.includes("credit")) {
                const company = await storage.getCompany(companyId);
                if (company) {
                  const newTotal = (company.proCreditsTotal || 0) + qty;
                  await storage.updateCompany(companyId, { proCreditsTotal: newTotal });
                  await storage.createCreditLedgerEntry({
                    companyId,
                    creditType: "pro",
                    transactionType: "purchase",
                    amount: qty,
                    balanceAfter: newTotal - (company.proCreditsUsed || 0),
                    description: `Order ${order.id.slice(0, 8)}: ${item.description}`,
                    userId: order.userId || null,
                  });
                }
              }
            }

            // Fallback: check purchase type if no items matched
            if (orderItems.length === 0 && companyId) {
              if (purchaseDesc.includes("basic") && purchaseDesc.includes("credit")) {
                const company = await storage.getCompany(companyId);
                if (company) {
                  const newTotal = (company.basicCreditsTotal || 0) + 1;
                  await storage.updateCompany(companyId, { basicCreditsTotal: newTotal });
                  await storage.createCreditLedgerEntry({
                    companyId,
                    creditType: "basic",
                    transactionType: "purchase",
                    amount: 1,
                    balanceAfter: newTotal - (company.basicCreditsUsed || 0),
                    description: `Order ${order.id.slice(0, 8)}: ${order.purchaseType}`,
                    userId: order.userId || null,
                  });
                }
              } else if (purchaseDesc.includes("pro") && purchaseDesc.includes("credit")) {
                const company = await storage.getCompany(companyId);
                if (company) {
                  const newTotal = (company.proCreditsTotal || 0) + 1;
                  await storage.updateCompany(companyId, { proCreditsTotal: newTotal });
                  await storage.createCreditLedgerEntry({
                    companyId,
                    creditType: "pro",
                    transactionType: "purchase",
                    amount: 1,
                    balanceAfter: newTotal - (company.proCreditsUsed || 0),
                    description: `Order ${order.id.slice(0, 8)}: ${order.purchaseType}`,
                    userId: order.userId || null,
                  });
                }
              }
            }
          }
        } catch (creditError) {
          console.error("Auto-credit allocation failed:", creditError);
        }
      }

      const updatedOrder = await storage.getOrder(id);
      res.json(updatedOrder);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Public reports endpoint (excludes company-only reports)
  app.get("/api/reports", async (req, res) => {
    try {
      // Auto-process scheduled reports before returning results
      await storage.processScheduledReports();
      
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

  // Get single report by slug (public endpoint - excludes client-specific reports)
  app.get("/api/reports/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const reports = await storage.getAllReports();
      const report = reports.find(r => 
        r.slug === slug && 
        r.status === "published" && 
        !r.isArchived &&
        (!r.clientCompanyIds || r.clientCompanyIds.length === 0)
      );
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Check if there are new trends/reports since user's last visit
  app.get("/api/trends/has-new", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const reports = await storage.getAllReports();
      const publishedReports = reports.filter(r => r.status === "published" && !r.isArchived);
      
      if (publishedReports.length === 0) {
        return res.json({ hasNew: false });
      }
      
      const latestReportDate = publishedReports.reduce((latest, r) => {
        const d = new Date(r.date);
        return d > latest ? d : latest;
      }, new Date(0));

      const userLastSeen = sessionUser.trendsLastSeenAt ? new Date(sessionUser.trendsLastSeenAt) : null;
      const hasNew = !userLastSeen || latestReportDate > userLastSeen;
      
      res.json({ hasNew });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Mark trends as seen (update user's last seen timestamp)
  app.post("/api/trends/mark-seen", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      await storage.updateUser(sessionUser.id, { trendsLastSeenAt: new Date() });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Member single report by slug (authenticated, includes client-specific reports for user's company)
  app.get("/api/member/reports/:slug", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { slug } = req.params;
      const sessionUser = req.user!;
      const userCompanyId = sessionUser.companyId;
      const reports = await storage.getAllReports();
      
      // Admin users can see any published report
      if (isAdminUser(sessionUser.email)) {
        const report = reports.find(r => 
          r.slug === slug && 
          r.status === "published" && 
          !r.isArchived
        );
        if (!report) {
          return res.status(404).json({ error: "Report not found" });
        }
        return res.json(report);
      }
      
      // Regular members can see public reports and their company's client reports
      const report = reports.find(r => {
        if (r.slug !== slug || r.status !== "published" || r.isArchived) {
          return false;
        }
        // Public report (no client company IDs)
        if (!r.clientCompanyIds || r.clientCompanyIds.length === 0) {
          return true;
        }
        // Client-specific report for user's company
        return userCompanyId && r.clientCompanyIds.includes(userCompanyId);
      });
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      res.json(report);
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
      
      // Resolve the user's industry groups for trend-report filtering
      const { resolveIndustryGroups } = await import("./pdf-library");
      const company = userCompanyId ? await storage.getCompany(userCompanyId) : null;
      const industryGroups = resolveIndustryGroups(company?.industry ?? null);

      /**
       * Maps a report's `industry` field to the set of audience tags whose members
       * should see it. "cross-industry" means everyone can see it.
       */
      function resolveReportAudience(reportIndustry: string | null | undefined): string[] {
        if (!reportIndustry) return ["cross-industry"];
        const k = reportIndustry.toLowerCase().trim();
        if (/bank|financ|fintech|insur/.test(k))           return ["finance"];
        if (/^fmcg$/.test(k))                              return ["fmcg", "food", "beverage", "qsr", "retail"];
        if (/^food$|food manufactur|food prod/.test(k))    return ["food", "beverage", "fmcg"];
        if (/beverag|drink|wine|spirit|brew|alco/.test(k)) return ["beverage", "food", "fmcg"];
        if (/beauty|cosmetic|skincare|hair/.test(k))       return ["beauty"];
        if (/personal care/.test(k))                       return ["beauty", "health"];
        if (/health|wellness|pharma|medical|nutrition|fitness/.test(k)) return ["health", "beauty"];
        if (/retail|ecommerce|e-commerce|supermarket|grocery/.test(k)) return ["retail", "food", "beverage"];
        if (/agri|farm|crop/.test(k))                      return ["food"];
        if (/restaurant|qsr|quick service|fast food/.test(k)) return ["qsr", "food", "beverage"];
        // Services, Inside, IRL, general / unrecognised → cross-industry (everyone)
        return ["cross-industry"];
      }
      
      // Filter reports based on access rules for regular users
      const filteredReports = reports.filter(r => {
        // Must be published and not archived
        if (r.status !== "published" || r.isArchived) return false;
        
        // Client-specific reports: only show to the linked company
        if (r.clientCompanyIds && r.clientCompanyIds.length > 0) {
          return !!(userCompanyId && r.clientCompanyIds.includes(userCompanyId));
        }
        
        // Public trend reports: filter by industry audience
        const audience = resolveReportAudience(r.industry);
        // "cross-industry" audience → show to everyone
        if (audience.includes("cross-industry")) return true;
        // Innovatr staff (null groups) → see everything
        if (!industryGroups) return true;
        // Show only if user's groups overlap with the report's target audience
        return audience.some(tag => industryGroups.includes(tag));
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

  // Publish report immediately
  app.post("/api/admin/reports/:id/publish-now", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      await storage.updateReport(id, { status: "published", publishAt: null });
      res.json({ success: true, message: "Report published successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Process scheduled reports (auto-publish and auto-unpublish)
  app.post("/api/admin/reports/process-scheduled", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const result = await storage.processScheduledReports();
      res.json({ 
        success: true, 
        published: result.published, 
        unpublished: result.unpublished,
        message: `Processed ${result.published} published, ${result.unpublished} unpublished`
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report file upload endpoint (PDF, PPTX, images)
  app.post("/api/admin/reports/upload", requireAdmin, reportFileUpload.single("file"), async (req: AuthenticatedRequest, res) => {
    try {
      const file = req.file;
      const fileType = req.body.fileType || "pdf"; // "pdf", "thumbnail", "cover"
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const timestamp = Date.now();
      const originalName = file.originalname;
      const lastDotIndex = originalName.lastIndexOf(".");
      const baseName = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName;
      const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex) : "";
      
      // Sanitize filename
      const sanitizedBaseName = baseName
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 100);
      
      // Determine storage path based on file type
      let storagePath: string;
      if (fileType === "thumbnail" || fileType === "cover") {
        storagePath = `reports/images/${sanitizedBaseName}_${timestamp}${extension}`;
      } else {
        storagePath = `reports/${sanitizedBaseName}_${timestamp}${extension}`;
      }

      // Upload to object storage
      await uploadFile(file.buffer, storagePath);

      // Return the URL path
      const fileUrl = `/api/files/${storagePath}`;
      
      res.json({
        success: true,
        url: fileUrl,
        fileName: originalName,
        fileSize: file.size,
        mimeType: file.mimetype,
      });
    } catch (error: any) {
      console.error("Report file upload error:", error);
      res.status(500).json({ error: error.message || "File upload failed" });
    }
  });

  // Delete report
  app.delete("/api/admin/reports/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Permanently delete the report
      await storage.deleteReport(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Report Analytics Endpoints
  app.get("/api/admin/reports/:id/analytics", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const range = (req.query.range as 'today' | '30d' | '12m') || '30d';
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      const analytics = await storage.getReportAnalytics(id, range);
      res.json(analytics);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/reports/:id/viewers", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      const viewers = await storage.getReportViewers(id);
      res.json(viewers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Record report event (public endpoint with optional authentication)
  app.post("/api/reports/:id/events", async (req, res) => {
    try {
      const { id } = req.params;
      const { eventType, sessionId, metadata } = req.body;
      
      if (!eventType || !['view', 'download'].includes(eventType)) {
        return res.status(400).json({ error: "Invalid event type" });
      }
      
      const report = await storage.getReport(id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      // Determine if this is a member or guest
      let userId: string | null = null;
      let actorType: 'member' | 'guest' = 'guest';
      let memberTier: string | null = null;
      let userName: string | null = null;
      let userEmail: string | null = null;
      let companyName: string | null = null;
      
      // Check for session cookie
      const sessionToken = req.cookies?.session;
      if (sessionToken) {
        const { hashSessionToken } = await import("./auth/password");
        const tokenHash = hashSessionToken(sessionToken);
        const session = await storage.getSessionByTokenHash(tokenHash);
        if (session) {
          const user = await storage.getUser(session.userId);
          if (user) {
            userId = user.id;
            actorType = 'member';
            memberTier = user.membershipTier;
            userName = user.name || null;
            userEmail = user.email;
            if (user.companyId) {
              const company = await storage.getCompany(user.companyId);
              companyName = company?.name || null;
            }
          }
        }
      }
      
      // Create the event
      const event = await storage.createReportEvent({
        reportId: id,
        userId,
        sessionId: sessionId || null,
        eventType,
        actorType,
        memberTier,
        metadata: metadata || null,
      });
      
      // Increment view/download count on the report
      if (eventType === 'view') {
        await storage.updateReport(id, { viewCount: (report.viewCount || 0) + 1 });
      } else if (eventType === 'download') {
        await storage.updateReport(id, { downloadCount: (report.downloadCount || 0) + 1 });
      }

      // If member viewed, also update the last viewed record
      if (userId && eventType === 'view') {
        await storage.upsertReportLastViewed({
          reportId: id,
          userId,
          userName: userName || undefined,
          userEmail: userEmail || undefined,
          memberTier: memberTier || undefined,
          companyName: companyName || undefined,
        });
      }
      
      res.json({ success: true, eventId: event.id });
    } catch (error: any) {
      console.error("Report event tracking error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Report Requests endpoints
  app.post("/api/report-requests", async (req, res) => {
    try {
      const { name, email, industry, topic, reason, companyName } = req.body;
      
      if (!name || !email || !industry || !topic || !reason) {
        return res.status(400).json({ error: "Name, email, industry, topic, and reason are required" });
      }

      let userId: string | undefined;
      let companyId: string | undefined;
      let resolvedCompanyName = companyName;

      const sessionToken = req.cookies?.session;
      if (sessionToken) {
        const { hashSessionToken } = await import("./auth/password");
        const tokenHash = hashSessionToken(sessionToken);
        const session = await storage.getSessionByTokenHash(tokenHash);
        if (session) {
          const user = await storage.getUser(session.userId);
          if (user) {
            userId = user.id;
            companyId = user.companyId || undefined;
            if (user.companyId) {
              const company = await storage.getCompany(user.companyId);
              resolvedCompanyName = company?.name || companyName;
            }
          }
        }
      }

      const request = await storage.createReportRequest({
        name,
        email,
        companyName: resolvedCompanyName || null,
        industry,
        topic,
        reason,
        status: "pending",
        userId: userId || null,
        companyId: companyId || null,
        adminNotes: null,
      });

      try {
        await emailService.sendReportRequestNotification({ name, email, companyName: resolvedCompanyName, industry, topic, reason });
      } catch (emailErr) {
        console.error("Failed to send report request notification email:", emailErr);
      }

      res.status(201).json({ success: true, id: request.id });
    } catch (error: any) {
      console.error("Report request error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/report-requests", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const requests = await storage.getAllReportRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/report-requests/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getReportRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Report request not found" });
      }

      const { status, adminNotes } = req.body;
      await storage.updateReportRequest(id, { ...(status && { status }), ...(adminNotes !== undefined && { adminNotes }) });

      if (status === "received") {
        try {
          await emailService.sendReportRequestConfirmation(request.email, request.name, request.topic);
        } catch (emailErr) {
          console.error("Failed to send report request confirmation:", emailErr);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Insight Mailers endpoints
  app.get("/api/admin/insight-mailers", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const mailers = await storage.getAllInsightMailers();
      res.json(mailers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/insight-mailers/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const mailer = await storage.getInsightMailer(req.params.id);
      if (!mailer) return res.status(404).json({ error: "Mailer not found" });
      res.json(mailer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/insight-mailers/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const mailer = await storage.getInsightMailer(req.params.id);
      if (!mailer) return res.status(404).json({ error: "Mailer not found" });
      const updateSchema = z.object({
        status: z.enum(["scheduled", "sent", "draft"]).optional(),
        subjectLine: z.string().optional(),
        previewText: z.string().optional(),
        bodyContent: z.string().optional(),
        topic: z.string().optional(),
        channel: z.enum(["inside", "insights", "launch", "irl"]).optional(),
        attachmentType: z.enum(["video", "gif", "infographic", "report"]).nullable().optional(),
      });
      const validated = updateSchema.parse(req.body);
      await storage.updateInsightMailer(req.params.id, validated);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send a preview mailer to a single address (for internal testing)
  app.post("/api/admin/send-preview-mailer", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { type, to } = req.body;
      const recipient = to || "hannah@innovatr.co.za";
      const firstName = "Hannah";
      let response: any;
      if (type === "predictive-modelling") {
        response = await emailService.sendPredictiveModellingMailer(recipient, firstName);
      } else {
        return res.status(400).json({ error: "Unknown preview type" });
      }
      res.json({ success: true, response });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send full industry batch mailer (all 5 industries, deduplicated)
  app.post("/api/admin/send-industry-mailer-batch", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const INDUSTRY_ORDER = ["financial", "beauty", "health", "food", "bev"];
      const mailerFnMap: Record<string, (to: string, firstName: string) => Promise<any>> = {
        financial: emailService.sendFinancialPulseMailer,
        beauty: emailService.sendBeautyPulseMailer,
        health: emailService.sendHealthPulseMailer,
        food: emailService.sendFoodPulseMailer,
        bev: emailService.sendPulseMailer,
      };

      const seenEmails = new Set<string>();
      const summary: Record<string, number> = {};
      let totalSent = 0;
      let totalSkipped = 0;

      for (const industry of INDUSTRY_ORDER) {
        const subscribers = await storage.getPulseSubscribersByIndustry(industry);
        let sent = 0;
        for (const sub of subscribers) {
          const email = sub.email.toLowerCase();
          if (seenEmails.has(email)) { totalSkipped++; continue; }
          seenEmails.add(email);
          const rawFirst = sub.name?.split(" ")[0] || "there";
          const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
          await mailerFnMap[industry](sub.email, firstName);
          sent++;
          totalSent++;
        }
        summary[industry] = sent;
      }

      // Mark all scheduled insight mailer entries as sent
      const allMailers = await storage.getAllInsightMailers();
      for (const m of allMailers) {
        if (m.targetIndustry && INDUSTRY_ORDER.includes(m.targetIndustry) && m.status === "scheduled") {
          await storage.updateInsightMailer(m.id, { status: "sent" });
        }
      }

      // Auto-publish the associated reports now that the mailers have been sent
      const INDUSTRY_SLUG_MAP: Record<string, string> = {
        financial: "cash-is-king-again",
        beauty: "township-beauty-economy",
        health: "clinic-vs-clicks-vs-creator",
        food: "price-memory-is-brutal",
        bev: "home-is-the-new-bar",
      };
      const allReports = await storage.getAllReports();
      for (const [, slug] of Object.entries(INDUSTRY_SLUG_MAP)) {
        const report = allReports.find((r) => r.slug === slug);
        if (report && report.status === "draft") {
          await storage.updateReport(report.id, { status: "published" });
        }
      }

      res.json({ success: true, sent: totalSent, skipped: totalSkipped, byIndustry: summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send all 5 industry mailers to a single test address
  app.post("/api/admin/send-all-test-mailers", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const to: string = req.body?.to || "hannah@innovatr.co.za";
      const firstName: string = req.body?.firstName || "Hannah";
      const results: Record<string, any> = {};
      const mailerFnMap: Record<string, (to: string, firstName: string) => Promise<any>> = {
        financial: emailService.sendFinancialPulseMailer,
        beauty: emailService.sendBeautyPulseMailer,
        health: emailService.sendHealthPulseMailer,
        food: emailService.sendFoodPulseMailer,
        bev: emailService.sendPulseMailer,
      };
      for (const [industry, fn] of Object.entries(mailerFnMap)) {
        try {
          const r = await fn(to, firstName);
          results[industry] = { success: true, messageId: (r as any)?.data?.id };
        } catch (err: any) {
          results[industry] = { success: false, error: err.message };
        }
      }
      res.json({ success: true, to, results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send Pulse industry mailer
  app.post("/api/admin/send-pulse-mailer", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const to: string = req.body?.to || "hannah@innovatr.co.za";
      const allUsers = await storage.getAllUsers();
      const recipient = allUsers.find((u) => u.email?.toLowerCase() === to.toLowerCase());
      const rawFirst = recipient?.name?.split(" ")[0] || "there";
      const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
      const result = await emailService.sendPulseMailer(to, firstName);
      res.json({ success: true, messageId: (result as any)?.data?.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  app.delete("/api/admin/deals/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      await storage.deleteDeal(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/member/deals", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Case Studies - public routes
  app.get("/api/case-studies", async (req, res) => {
    try {
      const all = await storage.getCaseStudies();
      res.json(all.filter(cs => cs.isActive));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/case-studies/:slug", async (req, res) => {
    try {
      const cs = await storage.getCaseStudyBySlug(req.params.slug);
      if (!cs) return res.status(404).json({ error: "Case study not found" });
      res.json(cs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Case Studies - admin routes
  app.get("/api/admin/case-studies", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const all = await storage.getCaseStudies();
      res.json(all);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/case-studies", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCaseStudySchema.parse(req.body);
      const cs = await storage.createCaseStudy(validatedData);
      res.status(201).json(cs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/case-studies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.updateCaseStudy(id, req.body);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/case-studies/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCaseStudy(id);
      res.json({ success: true });
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
      const [companies, allUsers, allActivity, allStudies, allClientReports] = await Promise.all([
        storage.getAllCompanies(),
        storage.getAllUsers(),
        storage.getActivityEventsSince(new Date(0)),
        storage.getAllStudies(),
        storage.getAllClientReports(),
      ]);

      // Build a name→id map for matching studies (which store companyName, not companyId)
      const companyNameToId = new Map(companies.map(c => [c.name?.toLowerCase().trim(), c.id]));

      const companiesWithStats = companies.map((company) => {
          // Members in this company
          const companyUsers = allUsers.filter(u => u.companyId === company.id);
          const memberCount = companyUsers.length;
          const companyUserIds = new Set(companyUsers.map(u => u.id));

          // Activity events for this company (by companyId OR by user membership)
          const companyEvents = allActivity.filter(e =>
            e.companyId === company.id || companyUserIds.has(e.userId || "")
          );

          // Last active: most recent activity event timestamp, falling back to lastLoginAt
          const eventTimestamps = companyEvents.map(e => new Date(e.createdAt).getTime()).filter(t => t > 0);
          const loginTimestamps = companyUsers
            .map(u => u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : 0)
            .filter(t => t > 0);
          const allTimestamps = [...eventTimestamps, ...loginTimestamps];
          const lastActivityAt = allTimestamps.length > 0
            ? new Date(Math.max(...allTimestamps)).toISOString()
            : null;

          // Login count
          const totalLogins = companyEvents.filter(e => e.actionType === "login").length;

          // Client reports delivered to this company
          const companyClientReports = allClientReports.filter(cr => cr.companyId === company.id);
          const reportsAccessed = companyClientReports.length;

          // Studies for this company (matched by companyName since studies don't store companyId)
          const companyStudies = allStudies.filter(s =>
            s.companyName && companyNameToId.get(s.companyName.toLowerCase().trim()) === company.id
          );
          const studyCount = companyStudies.length;

          return {
            ...company,
            studyCount,
            memberCount,
            lastActivityAt,
            totalLogins,
            reportsAccessed,
          };
        });

      res.json(companiesWithStats);
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

  // Create company with initial user and send password setup email
  app.post("/api/admin/companies/with-user", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { company: companyData, user: userData } = req.body;
      
      if (!companyData?.name) {
        return res.status(400).json({ error: "Company name is required" });
      }
      if (!userData?.email) {
        return res.status(400).json({ error: "User email is required" });
      }
      if (!userData?.name) {
        return res.status(400).json({ error: "User name is required" });
      }
      
      // Check if user email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "A user with this email already exists" });
      }
      
      // Check if company name already exists
      const existingCompany = await storage.getCompanyByName(companyData.name);
      if (existingCompany) {
        return res.status(409).json({ error: "A company with this name already exists" });
      }
      
      // Create the company - convert date strings to Date objects
      const company = await storage.createCompany({
        name: companyData.name,
        domain: companyData.domain || null,
        tier: companyData.tier || "STARTER",
        contractStart: companyData.contractStart ? new Date(companyData.contractStart) : null,
        contractEnd: companyData.contractEnd ? new Date(companyData.contractEnd) : null,
        monthlyFee: companyData.monthlyFee || null,
        basicCreditsTotal: companyData.basicCreditsTotal || 0,
        proCreditsTotal: companyData.proCreditsTotal || 0,
        notes: companyData.notes || null,
      });
      
      // Create the user with a temporary placeholder password 
      // Following the same pattern as signup: create with temp password, then update with hash
      const placeholderPassword = `PENDING_SETUP_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      const placeholderPasswordHash = await hashPassword(placeholderPassword);
      
      const user = await storage.createUser({
        email: userData.email,
        name: userData.name,
        username: userData.email.split('@')[0] + '_' + Date.now(),
        password: "", // Empty password during creation
        membershipTier: companyData.tier || "STARTER",
        memberType: userData.memberType || "companyUser",
        status: "ACTIVE",
        role: "MEMBER",
      } as any);
      
      // Update the user with the hashed password and company link (matches signup flow)
      await storage.updateUser(user.id, {
        passwordHash: placeholderPasswordHash,
        password: "", // Clear plaintext password field
        companyId: company.id,
        phone: userData.phone || null,
      });
      
      // Generate password reset token for initial setup
      const { token, tokenHash } = generateResetToken();
      const expiresAt = getResetTokenExpiry();
      
      // Store hashed token in database
      await storage.createPasswordReset({
        userId: user.id,
        tokenHash,
        expiresAt,
      });
      
      // Send welcome email with password setup link
      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      const setupUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(userData.email)}`;
      
      try {
        await emailService.sendWelcomeWithPasswordSetup(
          userData.email,
          userData.name,
          company.name,
          setupUrl
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue - the user can still request a password reset manually
      }
      
      res.status(201).json({ 
        company, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
        },
        message: "Company and user created. Password setup email sent."
      });
    } catch (error: any) {
      console.error("Create company with user error:", error);
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

  const PULSE_INDUSTRIES = ["food", "bev", "financial", "beauty", "health", "other", null];

  app.patch("/api/admin/companies/:id/pulse-industry", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { industry } = req.body;
      if (industry !== null && !PULSE_INDUSTRIES.includes(industry)) {
        return res.status(400).json({ error: "Invalid industry value" });
      }
      const company = await storage.getCompany(id);
      if (!company) return res.status(404).json({ error: "Company not found" });
      await storage.updateCompany(id, { pulseIndustry: industry ?? null });
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id/pulse-industry", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { industry } = req.body;
      if (industry !== null && !PULSE_INDUSTRIES.includes(industry)) {
        return res.status(400).json({ error: "Invalid industry value" });
      }
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ error: "User not found" });
      await storage.updateUser(id, { pulseIndustry: industry ?? null });
      res.json({ success: true });
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

  // Get users available to assign to a company (unassigned or from other companies)
  app.get("/api/admin/users/available-for-company/:companyId", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.params;
      const allUsers = await storage.getAllUsers();
      // Filter to users not already in this company
      const availableUsers = allUsers.filter(u => u.companyId !== companyId);
      res.json(redactUsers(availableUsers));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Assign existing user to a company
  app.post("/api/admin/companies/:id/assign-user", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user's company assignment
      await storage.updateUser(userId, { 
        companyId: id,
        memberType: "companyUser"
      });
      
      const updated = await storage.getUser(userId);
      res.json(redactUser(updated!));
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
      await storage.updateCompany(id, { logoUrl: `/api/files/${filePath}` });
      
      const updated = await storage.getCompany(id);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Create user (admin)
  app.post("/api/admin/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email, phone, companyId, membershipTier, memberType, sendWelcomeEmail } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "A user with this email already exists" });
      }
      
      // Get company name if companyId provided
      let companyName = "Innovatr";
      if (companyId) {
        const company = await storage.getCompany(companyId);
        if (company) {
          companyName = company.name;
        }
      }
      
      // Create the user with a temporary placeholder password 
      const placeholderPassword = `PENDING_SETUP_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
      const placeholderPasswordHash = await hashPassword(placeholderPassword);
      
      const user = await storage.createUser({
        email,
        name,
        username: email.split('@')[0] + '_' + Date.now(),
        password: "", // Empty password during creation
        membershipTier: membershipTier || "FREE",
        memberType: memberType || (companyId ? "companyUser" : "independent"),
        status: "ACTIVE",
        role: "MEMBER",
      } as any);
      
      // Update the user with the hashed password and company link
      await storage.updateUser(user.id, {
        passwordHash: placeholderPasswordHash,
        password: "", // Clear plaintext password field
        companyId: companyId || null,
        phone: phone || null,
      });
      
      // Send welcome email with password setup link if requested
      if (sendWelcomeEmail !== false) {
        // Generate password reset token for initial setup
        const { token, tokenHash } = generateResetToken();
        const expiresAt = getResetTokenExpiry();
        
        // Store hashed token in database
        await storage.createPasswordReset({
          userId: user.id,
          tokenHash,
          expiresAt,
        });
        
        // Send welcome email with password setup link
        const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
        const setupUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        
        try {
          await emailService.sendWelcomeWithPasswordSetup(
            email,
            name,
            companyName,
            setupUrl
          );
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Continue - the user can still request a password reset manually
        }
      }
      
      // Fetch the updated user
      const createdUser = await storage.getUser(user.id);
      
      res.status(201).json({ 
        user: {
          id: createdUser?.id,
          email: createdUser?.email,
          name: createdUser?.name,
          companyId: createdUser?.companyId,
          membershipTier: createdUser?.membershipTier,
          memberType: createdUser?.memberType,
        },
        message: sendWelcomeEmail !== false ? "Member created. Password setup email sent." : "Member created."
      });
    } catch (error: any) {
      console.error("Create user error:", error);
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

  // Serve video assets from attached_assets folder (public access for demo videos)
  app.get("/api/assets/videos/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const fs = await import("fs/promises");
      const path = await import("path");
      
      // Validate filename to prevent path traversal
      if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      
      const filePath = path.resolve(process.cwd(), "attached_assets", filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: "Video not found" });
      }
      
      const stat = await fs.stat(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      // Handle range requests for video streaming
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        
        const { createReadStream } = await import("fs");
        const file = createReadStream(filePath, { start, end });
        
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });
        
        const { createReadStream } = await import("fs");
        createReadStream(filePath).pipe(res);
      }
    } catch (error: any) {
      console.error("Video serve error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Brief files endpoint - requires authentication and company ownership check
  // Brief files are stored as: briefs/{companyName}/{filename}
  app.get("/api/public/brief-files/*", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      const filePath = (req.params as Record<string, string>)[0];
      
      if (!filePath) {
        return res.status(400).json({ error: "File path required" });
      }

      // Validate this is a brief file path (security: only allow access to brief files)
      if (!filePath.startsWith("briefs/")) {
        return res.status(403).json({ error: "Access denied - invalid file path" });
      }

      // Non-admins must own the company whose files they are requesting
      if (!isAdminUser(sessionUser.email)) {
        if (!sessionUser.companyId) {
          return res.status(403).json({ error: "Access denied" });
        }
        const company = await storage.getCompany(sessionUser.companyId);
        if (!company) {
          return res.status(403).json({ error: "Access denied" });
        }
        const sanitizedCompanyName = company.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50) || "unknown";
        const pathParts = filePath.split("/");
        const fileCompanySegment = pathParts[1]; // briefs/{company-name}/{file}
        if (fileCompanySegment !== sanitizedCompanyName) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      const exists = await fileExists(filePath);
      if (!exists) {
        console.log(`Brief file not found: ${filePath}`);
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
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        txt: "text/plain",
      };

      // Extract original filename from path for Content-Disposition
      const originalFileName = filePath.split("/").pop() || "download";
      
      res.setHeader("Content-Type", contentTypes[ext || ""] || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${originalFileName}"`);
      res.setHeader("Cache-Control", "private, max-age=3600"); // 1 hour cache
      res.send(fileBuffer);
    } catch (error: any) {
      console.error("Brief file serve error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Public endpoint for report cover images (no auth required for library display)
  app.get("/api/files/reports/images/*", async (req, res) => {
    try {
      const imageName = (req.params as Record<string, string>)[0];
      if (!imageName) {
        return res.status(400).json({ error: "Image path required" });
      }
      
      const filePath = `reports/images/${imageName}`;
      
      if (filePath.includes("..") || !imageName.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        return res.status(400).json({ error: "Invalid image path" });
      }

      const exists = await fileExists(filePath);
      if (!exists) {
        return res.status(404).json({ error: "Image not found" });
      }

      const fileBuffer = await downloadFile(filePath);
      if (!fileBuffer) {
        return res.status(500).json({ error: "Failed to download image" });
      }

      const ext = filePath.split(".").pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      };

      res.setHeader("Content-Type", contentTypes[ext || ""] || "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.send(fileBuffer);
    } catch (error: any) {
      console.error("Public report image serve error:", error);
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
      // - Their own company's brief files
      if (!isAdminUser(sessionUser.email)) {
        // Check if this is a client report - restrict to company owner
        if (filePath.startsWith("client_reports/")) {
          const pathParts = filePath.split("/");
          const companyId = pathParts[1]; // client_reports/{companyId}/{file}
          if (sessionUser.companyId !== companyId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }

        // Check if this is a brief file - restrict to owning company
        if (filePath.startsWith("briefs/")) {
          // Brief files are stored as: briefs/{sanitized-company-name}/{filename}
          // We verify ownership by looking up the user's company and comparing the sanitized name
          if (!sessionUser.companyId) {
            return res.status(403).json({ error: "Access denied" });
          }
          const company = await storage.getCompany(sessionUser.companyId);
          if (!company) {
            return res.status(403).json({ error: "Access denied" });
          }
          const sanitizedCompanyName = company.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 50) || "unknown";
          const pathParts = filePath.split("/");
          const fileCompanySegment = pathParts[1]; // briefs/{company-name}/{file}
          if (fileCompanySegment !== sanitizedCompanyName) {
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
      
      // Support custom download filename via query parameter
      // Usage: /api/files/path/to/file.pdf?download=My%20Report%20Name.pdf
      const downloadName = req.query.download as string | undefined;
      if (downloadName) {
        // Sanitize filename for Content-Disposition header
        const sanitizedName = downloadName.replace(/[^\w\s.-]/g, '').trim() || 'download';
        const finalName = sanitizedName.endsWith(`.${ext}`) ? sanitizedName : `${sanitizedName}.${ext}`;
        res.setHeader("Content-Disposition", `attachment; filename="${finalName}"`);
      }
      
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
  app.post("/api/briefs/upload", requireAuth, briefFileUpload.array("files", 5), async (req: AuthenticatedRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const companyName = req.body.companyName || "unknown";
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadResults = [];
      
      // Sanitize company name for folder path (replace spaces and special chars with hyphens)
      const sanitizedCompanyName = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50) || "unknown";

      for (const file of files) {
        // Generate timestamp for unique filename
        const timestamp = Date.now();
        const fileId = randomUUID();
        
        // Get original filename parts
        const originalName = file.originalname;
        const lastDotIndex = originalName.lastIndexOf(".");
        const baseName = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName;
        const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex) : "";
        
        // Sanitize base name (keep readable but safe for storage)
        const sanitizedBaseName = baseName
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .slice(0, 80);
        
        // Build new filename: {original-name}_{timestamp}{extension}
        const newFileName = `${sanitizedBaseName}_${timestamp}${extension}`;
        
        // Storage path: briefs/{company-name}/{filename}
        const storagePath = `briefs/${sanitizedCompanyName}/${newFileName}`;

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
        numConsumers: z.number().min(100).default(100),
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
        companyId: z.string().nullable().optional(),
        userId: z.string().nullable().optional(),
        concepts: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          fileCount: z.number().optional(),
        })).optional(),
      });

      const validated = briefSchema.parse(req.body);

      // Normalize studyType to canonical form for Test24 types
      const lowerStudyType = validated.studyType.toLowerCase();
      if (lowerStudyType.includes("basic") || lowerStudyType.includes("pro")) {
        validated.studyType = lowerStudyType.includes("basic") ? "Test24 Basic" : "Test24 Pro";
      }

      // Server-side credit calculation - derive from brief data, don't trust client
      const creditsRequired = validated.numIdeas; // 1 credit per concept
      const isBasicStudy = validated.studyType.toLowerCase().includes("basic");
      let finalBasicCreditsUsed = 0;
      let finalProCreditsUsed = 0;
      let companyIdStr: string | null = null;

      // Determine credit deduction requirement
      // - "credits" payment: deduction required, reject if insufficient
      // - "invoice" payment with a companyId: attempt deduction, proceed if insufficient
      // - "online" payment: no credit deduction
      const isOnlinePayment = validated.paymentMethod === "online";

      if (validated.paymentMethod === "credits" && !validated.companyId) {
        return res.status(400).json({
          success: false,
          error: "Company account required for credit payments",
        });
      }

      if (validated.companyId) {
        companyIdStr = String(validated.companyId);
      }

      // Verify company exists when a company ID is provided
      if (companyIdStr && validated.paymentMethod === "credits") {
        const company = await storage.getCompany(companyIdStr);
        if (!company) {
          return res.status(400).json({ success: false, error: "Company not found" });
        }
      }

      // Determine credit deduction payload for the transaction
      const creditType = isBasicStudy ? 'basic' : 'pro';
      const isCreditsPayment = validated.paymentMethod === "credits";
      const isInvoicePayment = validated.paymentMethod === "invoice";

      // For invoice path we still try to deduct, but insufficient credits won't block submission.
      // The transaction method throws with code INSUFFICIENT_CREDITS if deduction fails;
      // we only surface that error for the "credits" payment method.
      const creditDeductionPayload = (isCreditsPayment || isInvoicePayment) && companyIdStr ? {
        companyId: companyIdStr,
        creditType,
        amount: creditsRequired,
        description: `Brief launch${isInvoicePayment ? " (invoice billing)" : ""}: ${validated.studyType} study (${creditsRequired} concept${creditsRequired > 1 ? 's' : ''})`,
        userId: validated.userId || null,
      } : null;

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

      // Execute the entire brief submission inside a single DB transaction:
      // credit deduction + ledger entry + brief creation + study creation are atomic.
      // If any step fails the entire transaction is rolled back.
      let brief: BriefSubmission;
      let submissionCreditsDeducted = false;

      try {
        const result = await storage.submitBriefWithCredits({
          briefData: {
            ...validated,
            concepts: validated.concepts || [],
            companyId: companyIdStr || null,
            paymentMethod: validated.paymentMethod || "online",
            paymentStatus: isOnlinePayment ? "pending" : null,
            basicCreditsUsed: isBasicStudy && creditDeductionPayload ? creditsRequired : 0,
            proCreditsUsed: !isBasicStudy && creditDeductionPayload ? creditsRequired : 0,
            status: "new",
          },
          studyData: {
            briefId: undefined, // assigned inside transaction from the created brief
            companyId: companyIdStr || undefined,
            companyName: validated.companyName,
            title: `${validated.companyBrand || validated.companyName} - ${isBasicStudy ? "Test24 Basic" : "Test24 Pro"}`,
            description: validated.researchObjective?.slice(0, 200) || "",
            studyType: isBasicStudy ? "basic" : "pro",
            status: "NEW",
            isTest24: true,
            tags: [validated.companyName, isBasicStudy ? "basic" : "pro", validated.industry || ""].filter(Boolean),
            submittedByEmail: validated.submittedByEmail,
            submittedByName: validated.submittedByName || undefined,
          },
          creditDeduction: creditDeductionPayload,
        });
        brief = result.brief;
        submissionCreditsDeducted = result.creditsDeducted;
        if (submissionCreditsDeducted) {
          if (isBasicStudy) finalBasicCreditsUsed = creditsRequired;
          else finalProCreditsUsed = creditsRequired;
          console.log(`Credits deducted in transaction for company ${companyIdStr}: Basic ${finalBasicCreditsUsed}, Pro ${finalProCreditsUsed}`);
        }
      } catch (txError: any) {
        // If insufficient credits and payment method requires them, return a user-friendly error
        if (txError.code === 'INSUFFICIENT_CREDITS' && isCreditsPayment) {
          return res.status(400).json({
            success: false,
            error: `Insufficient ${isBasicStudy ? "Basic" : "Pro"} credits. Required: ${creditsRequired}`,
          });
        }
        // For invoice path, insufficient credits just means we proceed without deducting —
        // re-run the transaction without credit deduction
        if (txError.code === 'INSUFFICIENT_CREDITS' && isInvoicePayment) {
          const result2 = await storage.submitBriefWithCredits({
            briefData: {
              ...validated,
              concepts: validated.concepts || [],
              companyId: companyIdStr || null,
              paymentMethod: validated.paymentMethod || "online",
              paymentStatus: isOnlinePayment ? "pending" : null,
              basicCreditsUsed: 0,
              proCreditsUsed: 0,
              status: "new",
            },
            studyData: {
              briefId: undefined,
              companyId: companyIdStr || undefined,
              companyName: validated.companyName,
              title: `${validated.companyBrand || validated.companyName} - ${isBasicStudy ? "Test24 Basic" : "Test24 Pro"}`,
              description: validated.researchObjective?.slice(0, 200) || "",
              studyType: isBasicStudy ? "basic" : "pro",
              status: "NEW",
              isTest24: true,
              tags: [validated.companyName, isBasicStudy ? "basic" : "pro", validated.industry || ""].filter(Boolean),
              submittedByEmail: validated.submittedByEmail,
              submittedByName: validated.submittedByName || undefined,
            },
            creditDeduction: null,
          });
          brief = result2.brief;
        } else {
          throw txError;
        }
      }

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

  // Delete brief submission (admin only)
  app.delete("/api/admin/briefs/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const brief = await storage.getBriefSubmission(req.params.id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }

      // Delete any associated files from object storage
      if (brief.projectFileUrls && brief.projectFileUrls.length > 0) {
        for (const url of brief.projectFileUrls) {
          // Extract the file path from the URL (e.g., /api/files/briefs/... -> briefs/...)
          const match = url.match(/\/api\/files\/(.+)$/);
          if (match) {
            try {
              await deleteFile(match[1]);
            } catch (e) {
              console.warn(`Failed to delete file: ${match[1]}`, e);
            }
          }
        }
      }

      await storage.deleteBriefSubmission(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== Studies Routes ====================
  // Studies represent the unified view of research projects linking briefs to completed reports
  
  // Get studies for the authenticated user
  // AI Brief Assistant submission — generates a questionnaire and emails hannah@innovatr.co.za
  app.post("/api/ai-brief/submit", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const {
        submittedByName, submittedByEmail, companyName,
        concept, objective, ages, genders, incomes, regions,
        studyType, numConcepts, context, files,
      } = req.body;

      if (!concept || !objective) {
        return res.status(400).json({ error: "Concept and objective are required" });
      }

      const briefId = `AI-${Date.now()}`;
      const studyLabel = (studyType || "basic").toLowerCase().includes("pro") ? "Test24 Pro" : "Test24 Basic";

      const questionnaire = `
SUGGESTED UPSIIDE SURVEY QUESTIONNAIRE
Generated by AI Brief Assistant · ${new Date().toLocaleDateString("en-GB")}

SECTION 1 — SCREENING
Q1. Are you the primary grocery/household shopper in your home?
Q2. How often do you purchase products in this category? (Daily / Weekly / Monthly / Rarely)

SECTION 2 — CONCEPT EXPOSURE
[Show concept stimulus: ${concept}]

SECTION 3 — INTEREST (Swipe right = interested, left = not interested)
Q3. How interested are you in this product/concept?
→ UPSIIDE SPLIT TEST: ${numConcepts || 1} concept${(numConcepts || 1) > 1 ? "s" : ""} · Purchase Intent Potential benchmark >81%

SECTION 4 — COMMITMENT
Q4. How likely would you be to buy this if it were available in-store at a competitive price?
→ Purchase Likelihood benchmark >53%

SECTION 5 — DIAGNOSTICS
Q5. What did you like most about this concept?
Q6. What, if anything, would make you hesitant to buy?
Q7. How does this compare to other products you currently buy in this category?

SECTION 6 — DEMOGRAPHICS (confirmation)
Age: ${(ages || []).join(", ") || "All"} · Gender: ${(genders || []).join(", ") || "All"}
Income: ${(incomes || []).join(", ") || "All"} · Region: ${(regions || []).join(", ") || "All"}
`;

      await sendBriefAdminNotification({
        id: briefId,
        submittedByName: submittedByName || "Portal User",
        submittedByEmail: submittedByEmail || "",
        submittedByContact: null,
        companyName: companyName || "Unknown Company",
        companyBrand: concept,
        studyType: studyLabel,
        numIdeas: numConcepts || 1,
        researchObjective: `${objective}\n\n${questionnaire}${context ? `\n\nAdditional context: ${context}` : ""}`,
        regions: regions || [],
        ages: ages || [],
        genders: genders || [],
        incomes: incomes || [],
        industry: null,
        competitors: [],
        projectFileUrls: [],
        files: (files || []).map((name: string) => ({
          id: name,
          fileName: name,
          fileSize: 0,
          mimeType: "application/octet-stream",
          url: "",
          uploadedAt: new Date().toISOString(),
        })),
        createdAt: new Date(),
      });

      res.json({ success: true, briefId });
    } catch (error: any) {
      console.error("AI brief submit error:", error);
      res.status(500).json({ error: error.message || "Failed to submit brief" });
    }
  });

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

  // Get user activity stats (personal stats for the logged-in user)
  app.get("/api/member/activity", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      
      const userStudies = await storage.getStudiesByEmail(sessionUser.email);
      const completedStudies = userStudies.filter(s => s.status === "COMPLETED");
      const liveStudies = userStudies.filter(s => s.status === "IN_PROGRESS" || s.status === "SUBMITTED" || s.status === "NEW");
      
      const reportsDownloaded = await storage.getUserReportDownloadCount(sessionUser.id);
      
      let discountSaved = 0;
      for (const study of completedStudies) {
        if (study.studyType === "basic") {
          discountSaved += 5000;
        } else if (study.studyType === "pro") {
          discountSaved += 5000;
        }
      }

      let basicCreditsRemaining = 0;
      let proCreditsRemaining = 0;
      if (sessionUser.companyId) {
        const company = await storage.getCompany(sessionUser.companyId);
        if (company) {
          basicCreditsRemaining = (company.basicCreditsTotal || 0) - (company.basicCreditsUsed || 0);
          proCreditsRemaining = (company.proCreditsTotal || 0) - (company.proCreditsUsed || 0);
        }
      }
      
      res.json({
        studiesCompleted: completedStudies.length,
        liveStudies: liveStudies.length,
        reportsDownloaded,
        discountSaved,
        basicCreditsRemaining,
        proCreditsRemaining,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sandbox Runs
  app.get("/api/member/sandbox-runs", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      if (!sessionUser.companyId) return res.json([]);
      const runs = await storage.getSandboxRunsByCompanyId(sessionUser.companyId);
      res.json(runs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/member/sandbox-runs", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionUser = req.user!;
      if (!sessionUser.companyId) return res.status(400).json({ error: "No company associated with account" });
      const parsed = insertSandboxRunSchema.parse({
        ...req.body,
        companyId: sessionUser.companyId,
        userId: sessionUser.id,
      });
      const run = await storage.createSandboxRun(parsed);
      res.status(201).json(run);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  // ========================================
  // Admin Reports Audit Endpoint (Read-Only)
  // ========================================
  app.get("/api/admin/reports-audit", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      // Load reports.json for videoPaths data
      const fs = await import("fs").then(m => m.promises);
      const path = await import("path");
      let reportsJsonData: any[] = [];
      try {
        const jsonPath = path.join(process.cwd(), "client/src/data/reports.json");
        const jsonContent = await fs.readFile(jsonPath, "utf-8");
        reportsJsonData = JSON.parse(jsonContent);
      } catch (e) {
        console.log("Could not load reports.json, will rely on database only");
      }

      // Create a slug-to-videoPaths map from reports.json
      const videoPathsMap = new Map<string, string[]>();
      for (const r of reportsJsonData) {
        if (r.slug && r.videoPaths) {
          videoPathsMap.set(r.slug, r.videoPaths);
        }
      }

      // Get all reports from database (library reports only - exclude companyOnly)
      const allReports = await storage.getAllReports();
      const libraryReports = allReports.filter((r: any) => 
        r.accessLevel !== "companyOnly"
      );

      // Expected titles from user's audit request
      const expectedInsideTitles = [
        "Fairness Is the New Flex",
        "The Age of Effortless",
        "Believability Is the New Branding",
        "Indulgence Without Guilt",
        "Simplicity Has Status",
        "The New Non-Negotiable Treat",
        "From Vegan to Vital",
        "Banking Monogamy Is Dead",
        "The Oat Based Breakfast Revolution",
        "Cadbury Pocket Sized Joy",
        "The Return of the Third Place",
      ];

      const expectedOtherTitles = [
        "Wine Without Bottles",
        "Craft Cues",
        "Greenway Carrots Brand Health Study",
        "Rugani 100% Carrot Juice Concept Test",
      ];

      const allExpectedTitles = [...expectedInsideTitles, ...expectedOtherTitles];

      // Audit each library report
      interface AuditIssue {
        id: string;
        title: string;
        slug: string | null;
        category: string;
        problems: string[];
      }

      interface MissingExpected {
        title: string;
        expectedCategory: string;
        problem: string;
      }

      const issues: AuditIssue[] = [];
      const insideReports: any[] = [];
      const otherLibraryReports: any[] = [];

      for (const report of libraryReports) {
        const problems: string[] = [];
        const isInside = report.category === "Inside";
        
        if (isInside) {
          insideReports.push(report);
        } else {
          otherLibraryReports.push(report);
        }

        // Check for full content
        const hasBody = report.body && report.body.trim().length > 0;
        const hasContent = report.content && typeof report.content === "object";
        const hasFullContent = hasBody || hasContent;

        if (!hasFullContent) {
          problems.push("Missing full content (no body or content object)");
        }

        if (isInside) {
          // Inside reports need video
          const videoPaths = videoPathsMap.get(report.slug || "") || [];
          const hasVideo = videoPaths.length > 0;
          if (!hasVideo) {
            problems.push("Missing video (no videoPaths in reports.json)");
          }
        } else {
          // Non-Inside reports need PDF
          const hasPdf = report.pdfUrl && report.pdfUrl.trim().length > 0;
          if (!hasPdf) {
            problems.push("Missing attached PDF/report file");
          }
        }

        if (problems.length > 0) {
          issues.push({
            id: report.id,
            title: report.title,
            slug: report.slug,
            category: report.category,
            problems,
          });
        }
      }

      // Check for missing expected titles
      const missingExpected: MissingExpected[] = [];
      
      for (const title of allExpectedTitles) {
        // Normalize comparison - handle variations like "Oat Based" vs "Oat-Based"
        const normalizedTitle = title.toLowerCase().replace(/-/g, " ");
        const found = libraryReports.some((r: any) => {
          const reportTitle = r.title.toLowerCase().replace(/-/g, " ");
          return reportTitle.includes(normalizedTitle.substring(0, 20)) || 
                 normalizedTitle.includes(reportTitle.substring(0, 20));
        });
        
        if (!found) {
          const expectedCategory = expectedInsideTitles.includes(title) ? "Inside" : "Other (Insights/Launch/IRL)";
          missingExpected.push({
            title,
            expectedCategory,
            problem: "Not found in library reports (may be missing or mis-categorised as client report)",
          });
        }
      }

      // Build audit summary
      const okCount = libraryReports.length - issues.length;
      const auditResult = {
        summary: {
          totalLibraryReports: libraryReports.length,
          insideReports: insideReports.length,
          otherLibraryReports: otherLibraryReports.length,
          ok: okCount,
          issues: issues.length,
        },
        issues,
        missingExpected,
        // Additional detail for debugging
        categoryBreakdown: {
          Inside: insideReports.length,
          Insights: libraryReports.filter((r: any) => r.category === "Insights").length,
          Launch: libraryReports.filter((r: any) => r.category === "Launch").length,
          IRL: libraryReports.filter((r: any) => r.category === "IRL").length,
        },
        videoPathsFromJson: {
          totalMapped: videoPathsMap.size,
          withVideos: Array.from(videoPathsMap.entries()).filter(([_, v]) => v.length > 0).length,
        },
      };

      // Log full audit to console
      console.log("\n========================================");
      console.log("LIBRARY REPORTS AUDIT RESULTS");
      console.log("========================================\n");
      console.log("SUMMARY:");
      console.log(`  Total library reports: ${auditResult.summary.totalLibraryReports}`);
      console.log(`  Inside reports: ${auditResult.summary.insideReports}`);
      console.log(`  Other library reports: ${auditResult.summary.otherLibraryReports}`);
      console.log(`  OK (no issues): ${auditResult.summary.ok}`);
      console.log(`  With issues: ${auditResult.summary.issues}`);
      console.log("\nCATEGORY BREAKDOWN:");
      console.log(`  Inside: ${auditResult.categoryBreakdown.Inside}`);
      console.log(`  Insights: ${auditResult.categoryBreakdown.Insights}`);
      console.log(`  Launch: ${auditResult.categoryBreakdown.Launch}`);
      console.log(`  IRL: ${auditResult.categoryBreakdown.IRL}`);
      console.log(`\nVIDEO PATHS FROM reports.json:`);
      console.log(`  Total slugs mapped: ${auditResult.videoPathsFromJson.totalMapped}`);
      console.log(`  With videos: ${auditResult.videoPathsFromJson.withVideos}`);
      
      if (issues.length > 0) {
        console.log("\n========================================");
        console.log("ISSUES FOUND:");
        console.log("========================================");
        for (const issue of issues) {
          console.log(`\n[${issue.category}] ${issue.title}`);
          console.log(`  Slug: ${issue.slug || "(no slug)"}`);
          console.log(`  Problems:`);
          for (const p of issue.problems) {
            console.log(`    - ${p}`);
          }
        }
      }

      if (missingExpected.length > 0) {
        console.log("\n========================================");
        console.log("MISSING EXPECTED TITLES:");
        console.log("========================================");
        for (const missing of missingExpected) {
          console.log(`\n  "${missing.title}"`);
          console.log(`    Expected category: ${missing.expectedCategory}`);
          console.log(`    Problem: ${missing.problem}`);
        }
      }

      console.log("\n========================================");
      console.log("END OF AUDIT");
      console.log("========================================\n");

      res.json(auditResult);
    } catch (error: any) {
      console.error("Reports audit error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Activity Events - log user actions
  const activityBodySchema = z.object({
    actionType: z.string().min(1).max(50),
    entityType: z.string().max(50).optional().nullable(),
    entityId: z.string().optional().nullable(),
    entityName: z.string().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
  });

  app.post("/api/activity", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const parsed = activityBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid activity data", details: parsed.error.flatten() });
      }
      const { actionType, entityType, entityId, entityName, metadata } = parsed.data;
      const event = await storage.createActivityEvent({
        userId: user.id,
        companyId: user.companyId ?? null,
        actionType,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        entityName: entityName ?? null,
        metadata: metadata ?? null,
      });
      res.json(event);
    } catch (error: any) {
      console.error("Activity event error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get company activity events
  app.get("/api/admin/companies/:id/activity", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const events = await storage.getActivityEventsByCompany(id, from, to);
      const users = await storage.getUsersByCompanyId(id);
      const userMap = new Map(users.map(u => [u.id, { name: u.name, email: u.email, surname: u.surname }]));
      
      const missingUserIds = new Set(
        events.filter(e => e.userId && !userMap.has(e.userId)).map(e => e.userId)
      );
      if (missingUserIds.size > 0) {
        const allUsers = await storage.getAllUsers();
        for (const u of allUsers) {
          if (missingUserIds.has(u.id)) {
            userMap.set(u.id, { name: u.name, email: u.email, surname: u.surname });
          }
        }
      }
      
      const enriched = events.map(e => ({
        ...e,
        userName: userMap.get(e.userId)?.name ?? "Unknown",
        userSurname: userMap.get(e.userId)?.surname ?? "",
        userEmail: userMap.get(e.userId)?.email ?? "",
      }));
      res.json(enriched);
    } catch (error: any) {
      console.error("Company activity error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get company activity summary
  app.get("/api/admin/companies/:id/activity-summary", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const events = await storage.getActivityEventsByCompany(id, from, to);
      const users = await storage.getUsersByCompanyId(id);
      const userMap = new Map(users.map(u => [u.id, { name: u.name, email: u.email, surname: u.surname }]));
      
      const missingUserIds = new Set(
        events.filter(e => e.userId && !userMap.has(e.userId)).map(e => e.userId)
      );
      if (missingUserIds.size > 0) {
        const allUsers = await storage.getAllUsers();
        for (const u of allUsers) {
          if (missingUserIds.has(u.id)) {
            userMap.set(u.id, { name: u.name, email: u.email, surname: u.surname });
          }
        }
      }

      const reportViewTypes = ["view_report", "view_client_report"];
      const reportDownloadTypes = ["download_report", "download_client_report"];
      const summary = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        logins: events.filter(e => e.actionType === "login").length,
        reportViews: events.filter(e => reportViewTypes.includes(e.actionType)).length,
        reportDownloads: events.filter(e => reportDownloadTypes.includes(e.actionType)).length,
        trendsViews: events.filter(e => e.actionType === "view_trends").length,
        pastResearchViews: events.filter(e => e.actionType === "view_past_research").length,
        briefLaunches: events.filter(e => e.actionType === "launch_brief").length,
        dealsViews: events.filter(e => e.actionType === "view_deals").length,
        byUser: Array.from(new Set(events.map(e => e.userId))).map(userId => {
          const userEvents = events.filter(e => e.userId === userId);
          const u = userMap.get(userId);
          return {
            userId,
            userName: u?.name ?? "Unknown",
            userSurname: u?.surname ?? "",
            userEmail: u?.email ?? "",
            totalActions: userEvents.length,
            logins: userEvents.filter(e => e.actionType === "login").length,
            reportViews: userEvents.filter(e => reportViewTypes.includes(e.actionType)).length,
            reportDownloads: userEvents.filter(e => reportDownloadTypes.includes(e.actionType)).length,
            lastActive: userEvents[0]?.createdAt ?? null,
          };
        }),
        from: from.toISOString(),
        to: to.toISOString(),
      };
      res.json(summary);
    } catch (error: any) {
      console.error("Activity summary error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get global activity summary (for daily email / dashboard)
  app.get("/api/admin/activity-summary", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const events = await storage.getActivityEventsSince(since);
      const allUsers = await storage.getAllUsers();
      const allCompanies = await storage.getAllCompanies();
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      const companyMap = new Map(allCompanies.map(c => [c.id, c.name]));

      const newUsers = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= since);

      const summary = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.userId)).size,
        logins: events.filter(e => e.actionType === "login").length,
        reportViews: events.filter(e => ["view_report", "view_client_report"].includes(e.actionType)).length,
        reportDownloads: events.filter(e => ["download_report", "download_client_report"].includes(e.actionType)).length,
        briefLaunches: events.filter(e => e.actionType === "launch_brief").length,
        newUsers: newUsers.map(u => ({
          name: u.name,
          surname: u.surname ?? "",
          email: u.email,
          company: u.companyId ? companyMap.get(u.companyId) ?? "Unknown" : "No company",
        })),
        byCompany: Array.from(new Set(events.filter(e => e.companyId).map(e => e.companyId!))).map(cId => ({
          companyId: cId,
          companyName: companyMap.get(cId) ?? "Unknown",
          totalActions: events.filter(e => e.companyId === cId).length,
          uniqueUsers: new Set(events.filter(e => e.companyId === cId).map(e => e.userId)).size,
        })),
        recentEvents: events.slice(0, 50).map(e => ({
          ...e,
          userName: userMap.get(e.userId)?.name ?? "Unknown",
          userEmail: userMap.get(e.userId)?.email ?? "",
          companyName: e.companyId ? companyMap.get(e.companyId) ?? "" : "",
        })),
        since: since.toISOString(),
      };
      res.json(summary);
    } catch (error: any) {
      console.error("Global activity summary error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/preferences", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const prefs = await storage.getAdminPreferences(req.user!.id);
      res.json(prefs || {
        dailyDigest: true,
        newOrderAlerts: true,
        newUserAlerts: true,
        lowCreditAlerts: true,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const adminPreferencesSchema = z.object({
    dailyDigest: z.boolean().default(true),
    newOrderAlerts: z.boolean().default(true),
    newUserAlerts: z.boolean().default(true),
    lowCreditAlerts: z.boolean().default(true),
  });

  app.put("/api/admin/preferences", requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = adminPreferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid preferences data", details: parsed.error.flatten() });
      }
      const prefs = await storage.upsertAdminPreferences(req.user!.id, parsed.data);
      res.json(prefs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ─── AI Query endpoint ───────────────────────────────────────────────────
  const aiQuerySchema = z.object({
    query:   z.string().min(1).max(500),
    sources: z.enum(["trends", "research", "combined"]).default("combined"),
    // companyId is intentionally NOT accepted from the client — research is
    // always scoped to the authenticated user's company via req.user.companyId
  });

  app.post("/api/ai/query", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = aiQuerySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      }

      const { query, sources } = parsed.data;

      // Research is ALWAYS scoped to the authenticated user's own company.
      // We never trust a client-supplied companyId — this prevents one client
      // from requesting another client's private research data.
      const studies: any[] = [];
      if ((sources === "research" || sources === "combined") && req.user?.companyId) {
        try {
          const rawStudies = await storage.getMemberStudies(req.user.companyId);
          for (const s of rawStudies.slice(0, 8)) {
            studies.push({
              title: s.title,
              status: s.status,
              type: s.studyType ?? undefined,
              description: s.description ?? undefined,
              scores: s.scores as Record<string, number> ?? undefined,
            });
          }
        } catch { /* studies remain empty */ }
      }

      // Resolve which trend-report industry groups this client may access.
      // We look up the company's industry from the DB (never from the client)
      // and map it to permitted report groups via resolveIndustryGroups().
      let allowedIndustries: string[] | null = null;
      if (req.user?.companyId) {
        try {
          const { resolveIndustryGroups } = await import("./pdf-library");
          const company = await storage.getCompany(req.user.companyId);
          allowedIndustries = resolveIndustryGroups(company?.industry ?? null);
        } catch { /* fall back to no restriction */ }
      }

      const { processAIQuery } = await import("./ai-query-handler");
      const response = await processAIQuery(query, sources, studies, allowedIndustries);
      res.json(response);
    } catch (error: any) {
      console.error("AI query error:", error);
      res.status(500).json({ error: "Query processing failed", message: error.message });
    }
  });

  // ── Dig Direct SQL Routes ──────────────────────────────
  // These routes query the dig.* schema directly (same Neon Postgres database).
  // Tenant isolation is enforced by WHERE company_id = companyId on EVERY query/subquery.
  // Response shapes match client/src/lib/dig-api.types.ts contracts exactly.

  interface DigStudyRow {
    id: string;
    company_id: string;
    study_name: string;
    public_client_report_id: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    concept_count: number;
    respondent_count: number;
  }

  const digError = (res: Response, code: string, message: string, status = 500) =>
    res.status(status).json({ error: { code, message } });

  async function verifyStudyForTenant(studyId: string, companyId: string): Promise<DigStudyRow | null> {
    const rows = await db.execute(sql`
      SELECT id, company_id,
             COALESCE(title, source_study_name, id) AS study_name,
             public_client_report_id,
             ingest_status AS status,
             concept_count, respondent_count,
             created_at, updated_at
      FROM dig.studies
      WHERE id = ${studyId} AND company_id = ${companyId}
      LIMIT 1
    `) as unknown as DigStudyRow[];
    return rows.length > 0 ? rows[0] : null;
  }

  // 1. List studies → { studies: DigStudy[] }
  app.get("/api/member/dig/studies", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    try {
      const studies = await db.execute(sql`
        SELECT id, company_id,
               COALESCE(title, source_study_name, id) AS study_name,
               public_client_report_id,
               ingest_status AS status,
               concept_count, respondent_count,
               created_at, updated_at
        FROM dig.studies
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `);
      res.json({ studies });
    } catch (err) {
      console.error("dig.studies query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 2. Single study → DigStudyDetail (flat, with concepts[])
  app.get("/api/member/dig/studies/:studyId", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    try {
      const study = await verifyStudyForTenant(req.params.studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface ConceptLabelRow { id: string; label: string; }
      const conceptLabels = await db.execute(sql`
        SELECT id, COALESCE(name, id) AS label
        FROM dig.concepts
        WHERE dig_study_id = ${req.params.studyId} AND company_id = ${companyId}
        ORDER BY name ASC
      `) as unknown as ConceptLabelRow[];

      res.json({ ...study, concepts: conceptLabels });
    } catch (err) {
      console.error("dig.studies/:id query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 3. Concepts for study → DigConcept[]
  app.get("/api/member/dig/studies/:studyId/concepts", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    try {
      const study = await verifyStudyForTenant(req.params.studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      const studyId = req.params.studyId;
      interface ConceptRow {
        id: string; label: string;
        interest_sample: number; interested_yes: number;
        wins: number; losses: number;
      }
      const rows = await db.execute(sql`
        SELECT
          c.id,
          COALESCE(c.name, c.id) AS label,
          COUNT(DISTINCT si.id)::int AS interest_sample,
          COUNT(DISTINCT si.id) FILTER (WHERE si.interested)::int AS interested_yes,
          (SELECT COUNT(*)::int FROM dig.screening_commitment sc
            WHERE sc.won_concept_id = c.id AND sc.company_id = ${companyId}
              AND sc.dig_study_id = ${studyId}) AS wins,
          (SELECT COUNT(*)::int FROM dig.screening_commitment sc
            WHERE sc.lost_concept_id = c.id AND sc.company_id = ${companyId}
              AND sc.dig_study_id = ${studyId}) AS losses
        FROM dig.concepts c
        LEFT JOIN dig.screening_interest si ON si.concept_id = c.id
          AND si.company_id = ${companyId} AND si.dig_study_id = ${studyId}
        WHERE c.dig_study_id = ${studyId}
          AND c.company_id = ${companyId}
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
      `) as unknown as ConceptRow[];

      const concepts = rows.map((r) => {
        const commitmentSample = r.wins + r.losses;
        return {
          id: r.id,
          study_id: studyId,
          label: r.label,
          idea_score: null,
          interest_score: r.interest_sample > 0 ? Math.round((r.interested_yes / r.interest_sample) * 100) : null,
          commitment_score: commitmentSample > 0 ? Math.round((r.wins / commitmentSample) * 100) : null,
          emotions: {} as Record<string, number>,
          agreement: {} as Record<string, Record<string, number>>,
          themes: [] as string[],
          sample_verbatims: [] as string[],
        };
      });

      res.json(concepts);
    } catch (err) {
      console.error("dig concepts query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 4. Single concept detail → DigConceptDetail
  app.get("/api/member/dig/studies/:studyId/concepts/:conceptId", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    const studyId = req.params.studyId;
    const conceptId = req.params.conceptId;
    try {
      const study = await verifyStudyForTenant(studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface ConceptMetaRow { id: string; label: string; }
      const conceptRows = await db.execute(sql`
        SELECT id, COALESCE(name, id) AS label
        FROM dig.concepts
        WHERE id = ${conceptId} AND dig_study_id = ${studyId} AND company_id = ${companyId}
        LIMIT 1
      `) as unknown as ConceptMetaRow[];
      if (conceptRows.length === 0) return digError(res, "CONCEPT_NOT_FOUND", "Concept not found", 404);

      interface EmotionRow { emotion: string; percentage: number; }
      interface AgreementRow { question_group: string; statement: string; agree_percentage: number; }
      interface ThemeRow { theme_category: string; }
      interface VerbatimRow { comment: string; }
      interface InterestRow { interest_sample: number; interested_yes: number; }
      interface CommitRow { wins: number; losses: number; }

      const [emotionRows, agreementRows, themeRows, verbatimRows, interestRows, commitRows] = await Promise.all([
        db.execute(sql`
          SELECT
            ee.emotion,
            (COUNT(*) FILTER (WHERE ee.selected)::float / NULLIF(COUNT(*), 0) * 100)::float AS percentage
          FROM dig.eval_emotions ee
          JOIN dig.evaluations e ON e.id = ee.evaluation_id
          WHERE e.concept_id = ${conceptId}
            AND e.dig_study_id = ${studyId}
            AND e.company_id = ${companyId}
          GROUP BY ee.emotion
          ORDER BY percentage DESC
        `) as unknown as EmotionRow[],

        db.execute(sql`
          SELECT
            ea.question_group,
            ea.statement,
            (COUNT(*) FILTER (WHERE ea.response_code >= 4)::float / NULLIF(COUNT(*), 0) * 100)::float AS agree_percentage
          FROM dig.eval_agreements ea
          JOIN dig.evaluations e ON e.id = ea.evaluation_id
          WHERE e.concept_id = ${conceptId}
            AND e.dig_study_id = ${studyId}
            AND e.company_id = ${companyId}
          GROUP BY ea.question_group, ea.statement
          ORDER BY ea.question_group ASC, ea.statement ASC
        `) as unknown as AgreementRow[],

        db.execute(sql`
          SELECT DISTINCT theme_category
          FROM dig.open_ended_themes
          WHERE concept_id = ${conceptId}
            AND dig_study_id = ${studyId}
            AND company_id = ${companyId}
          ORDER BY theme_category ASC
        `) as unknown as ThemeRow[],

        db.execute(sql`
          SELECT e.clarity_comment AS comment
          FROM dig.evaluations e
          WHERE e.concept_id = ${conceptId}
            AND e.dig_study_id = ${studyId}
            AND e.company_id = ${companyId}
            AND e.clarity_comment IS NOT NULL
            AND e.clarity_comment <> ''
          ORDER BY e.created_at DESC
          LIMIT 5
        `) as unknown as VerbatimRow[],

        db.execute(sql`
          SELECT
            COUNT(*)::int AS interest_sample,
            COUNT(*) FILTER (WHERE interested)::int AS interested_yes
          FROM dig.screening_interest
          WHERE concept_id = ${conceptId}
            AND dig_study_id = ${studyId}
            AND company_id = ${companyId}
        `) as unknown as InterestRow[],

        db.execute(sql`
          SELECT
            (SELECT COUNT(*)::int FROM dig.screening_commitment
              WHERE won_concept_id = ${conceptId} AND dig_study_id = ${studyId}
                AND company_id = ${companyId}) AS wins,
            (SELECT COUNT(*)::int FROM dig.screening_commitment
              WHERE lost_concept_id = ${conceptId} AND dig_study_id = ${studyId}
                AND company_id = ${companyId}) AS losses
        `) as unknown as CommitRow[],
      ]);

      const emotions: Record<string, number> = {};
      for (const e of emotionRows) emotions[e.emotion] = Math.round(e.percentage);

      const agreement: Record<string, Record<string, number>> = {};
      for (const a of agreementRows) {
        if (!agreement[a.question_group]) agreement[a.question_group] = {};
        agreement[a.question_group][a.statement] = Math.round(a.agree_percentage);
      }

      const ir = interestRows[0];
      const cr = commitRows[0];
      const commitmentSample = (cr?.wins ?? 0) + (cr?.losses ?? 0);

      res.json({
        id: conceptRows[0].id,
        study_id: studyId,
        label: conceptRows[0].label,
        idea_score: null,
        interest_score: ir && ir.interest_sample > 0 ? Math.round((ir.interested_yes / ir.interest_sample) * 100) : null,
        commitment_score: commitmentSample > 0 ? Math.round(((cr?.wins ?? 0) / commitmentSample) * 100) : null,
        emotions,
        agreement,
        themes: themeRows.map((t) => t.theme_category),
        sample_verbatims: verbatimRows.map((v) => v.comment),
        heatmap_url: null,
      });
    } catch (err) {
      console.error("dig concept detail query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 5. Heatmap → DigHeatmap
  app.get("/api/member/dig/studies/:studyId/concepts/:conceptId/heatmap", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    const studyId = req.params.studyId;
    const conceptId = req.params.conceptId;
    try {
      const study = await verifyStudyForTenant(studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface ConceptCheckRow { id: string; }
      const conceptCheck = await db.execute(sql`
        SELECT id FROM dig.concepts
        WHERE id = ${conceptId} AND dig_study_id = ${studyId} AND company_id = ${companyId}
        LIMIT 1
      `) as unknown as ConceptCheckRow[];
      if (conceptCheck.length === 0) return digError(res, "CONCEPT_NOT_FOUND", "Concept not found", 404);

      interface ClickRow { x_coord: number; y_coord: number; }
      const clicks = await db.execute(sql`
        SELECT h.x_coord, h.y_coord
        FROM dig.eval_heatmap_clicks h
        JOIN dig.evaluations e ON e.id = h.evaluation_id
        WHERE e.concept_id = ${conceptId}
          AND e.dig_study_id = ${studyId}
          AND e.company_id = ${companyId}
        ORDER BY h.click_order
      `) as unknown as ClickRow[];

      const zones = clicks.map((c) => ({
        x: c.x_coord,
        y: c.y_coord,
        radius: 20,
        intensity: 1,
      }));

      res.json({
        concept_id: conceptId,
        image_url: null,
        zones,
      });
    } catch (err) {
      console.error("dig heatmap query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 6. Ranking → DigRanking
  app.get("/api/member/dig/studies/:studyId/ranking", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    const studyId = req.params.studyId;
    try {
      const study = await verifyStudyForTenant(studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface RankRow {
        id: string; label: string;
        interest_sample: number; interested_yes: number;
        wins: number; losses: number;
      }
      const rows = await db.execute(sql`
        SELECT
          c.id,
          COALESCE(c.name, c.id) AS label,
          COUNT(DISTINCT si.id)::int AS interest_sample,
          COUNT(DISTINCT si.id) FILTER (WHERE si.interested)::int AS interested_yes,
          (SELECT COUNT(*)::int FROM dig.screening_commitment sc
            WHERE sc.won_concept_id = c.id AND sc.company_id = ${companyId}
              AND sc.dig_study_id = ${studyId}) AS wins,
          (SELECT COUNT(*)::int FROM dig.screening_commitment sc
            WHERE sc.lost_concept_id = c.id AND sc.company_id = ${companyId}
              AND sc.dig_study_id = ${studyId}) AS losses
        FROM dig.concepts c
        LEFT JOIN dig.screening_interest si ON si.concept_id = c.id
          AND si.company_id = ${companyId} AND si.dig_study_id = ${studyId}
        WHERE c.dig_study_id = ${studyId}
          AND c.company_id = ${companyId}
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
      `) as unknown as RankRow[];

      const mapped = rows.map((r) => {
        const commitmentSample = r.wins + r.losses;
        return {
          concept_id: r.id,
          label: r.label,
          idea_score: 0,
          interest_score: r.interest_sample > 0 ? Math.round((r.interested_yes / r.interest_sample) * 100) : 0,
          commitment_score: commitmentSample > 0 ? Math.round((r.wins / commitmentSample) * 100) : 0,
          _sortKey: commitmentSample > 0 ? r.wins / commitmentSample : -1,
        };
      });

      mapped.sort((a, b) => {
        if (b._sortKey !== a._sortKey) return b._sortKey - a._sortKey;
        return a.label.localeCompare(b.label);
      });

      const concepts = mapped.map((c, i) => ({
        concept_id: c.concept_id,
        label: c.label,
        idea_score: c.idea_score,
        interest_score: c.interest_score,
        commitment_score: c.commitment_score,
        rank: i + 1,
      }));

      res.json({ study_id: studyId, concepts });
    } catch (err) {
      console.error("dig ranking query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 7. Demographics → DigDemographics
  app.get("/api/member/dig/studies/:studyId/demographics", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    const studyId = req.params.studyId;
    try {
      const study = await verifyStudyForTenant(studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface LabelCountRow { label: string; count: number; }
      interface AgeRow { age: number | null; }

      const AGE_BUCKETS = [
        { bucket: "18-24", min: 18, max: 24 },
        { bucket: "25-34", min: 25, max: 34 },
        { bucket: "35-44", min: 35, max: 44 },
        { bucket: "45-54", min: 45, max: 54 },
        { bucket: "55-64", min: 55, max: 64 },
        { bucket: "65+",   min: 65, max: 200 },
      ];

      const [genderRows, provinceRows, ageRows] = await Promise.all([
        db.execute(sql`
          SELECT gender_label AS label, COUNT(*)::int AS count
          FROM dig.respondents
          WHERE dig_study_id = ${studyId} AND company_id = ${companyId}
          GROUP BY gender_label ORDER BY count DESC
        `) as unknown as LabelCountRow[],

        db.execute(sql`
          SELECT province_label AS label, COUNT(*)::int AS count
          FROM dig.respondents
          WHERE dig_study_id = ${studyId} AND company_id = ${companyId}
          GROUP BY province_label ORDER BY count DESC
        `) as unknown as LabelCountRow[],

        db.execute(sql`
          SELECT age FROM dig.respondents
          WHERE dig_study_id = ${studyId} AND company_id = ${companyId}
        `) as unknown as AgeRow[],
      ]);

      const gender: Record<string, number> = {};
      for (const r of genderRows) gender[r.label ?? "Unknown"] = r.count;

      const age_buckets: Record<string, number> = {};
      for (const b of AGE_BUCKETS) {
        age_buckets[b.bucket] = ageRows.filter((r) => r.age !== null && r.age >= b.min && r.age <= b.max).length;
      }

      const provinces: Record<string, number> = {};
      for (const r of provinceRows) provinces[r.label ?? "Unknown"] = r.count;

      res.json({ study_id: studyId, gender, age_buckets, provinces });
    } catch (err) {
      console.error("dig demographics query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 8. Themes → DigThemesResponse
  app.get("/api/member/dig/studies/:studyId/themes", requireAuth, async (req: AuthenticatedRequest, res) => {
    const companyId = req.user?.companyId;
    if (!companyId) return digError(res, "UNAUTHORIZED", "No company context", 401);
    const studyId = req.params.studyId;
    try {
      const study = await verifyStudyForTenant(studyId, companyId);
      if (!study) return digError(res, "STUDY_NOT_FOUND", "Study not found or access denied", 404);

      interface ThemeRow { theme_category: string; positive: number; negative: number; neutral: number; }
      const themeRows = await db.execute(sql`
        SELECT
          t.theme_category,
          SUM(CASE WHEN t.sentiment = 'positive' THEN t.mention_count ELSE 0 END)::int AS positive,
          SUM(CASE WHEN t.sentiment = 'negative' THEN t.mention_count ELSE 0 END)::int AS negative,
          SUM(CASE WHEN t.sentiment = 'neutral' THEN t.mention_count ELSE 0 END)::int AS neutral
        FROM dig.open_ended_themes t
        WHERE t.dig_study_id = ${studyId}
          AND t.company_id = ${companyId}
        GROUP BY t.theme_category
        ORDER BY (SUM(t.mention_count)) DESC, t.theme_category ASC
      `) as unknown as ThemeRow[];

      const themes = themeRows.map((t) => ({
        theme_category: t.theme_category,
        positive: t.positive,
        neutral: t.neutral,
        negative: t.negative,
        sample_verbatims: [] as string[],
      }));

      res.json({ study_id: studyId, themes });
    } catch (err) {
      console.error("dig themes query failed:", err);
      digError(res, "INTERNAL", "Database error");
    }
  });

  // 9. Search → DigSearchResponse (stub)
  app.post("/api/member/dig/studies/:studyId/search", requireAuth, async (req: AuthenticatedRequest, res) => {
    res.json({
      study_id: req.params.studyId,
      query: req.body?.query ?? "",
      results: [],
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
