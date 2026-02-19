import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(), // Legacy field - will be deprecated
  passwordHash: text("password_hash"), // New bcrypt hashed password
  name: text("name"),
  surname: text("surname"),
  company: text("company"),
  industry: text("industry"),
  referralSource: text("referral_source"),
  wantsContact: boolean("wants_contact").default(false),
  companyId: varchar("company_id"),
  membershipTier: varchar("membership_tier", { length: 20 })
    .notNull()
    .default("FREE"),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
  role: varchar("role", { length: 20 }).notNull().default("MEMBER"),
  memberType: varchar("member_type", { length: 20 }).notNull().default("companyUser"), // 'companyUser' or 'independent'
  isPaidSeat: boolean("is_paid_seat").notNull().default(false), // Whether this user is a paid seat vs free team member
  creditsBasic: integer("credits_basic").notNull().default(0),
  creditsPro: integer("credits_pro").notNull().default(0),
  creditsInheritedFromCompany: boolean("credits_inherited_from_company").notNull().default(true),
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).default("0"),
  firstProjectDate: timestamp("first_project_date"),
  lastProjectDate: timestamp("last_project_date"),
  lastActivityDate: timestamp("last_activity_date"),
  internalNotes: text("internal_notes"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  pulseSubscribed: boolean("pulse_subscribed").notNull().default(true),
  trendsLastSeenAt: timestamp("trends_last_seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    passwordHash: true,
  })
  .extend({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    name: z.string().optional(),
    membershipTier: z.enum(["FREE", "STARTER", "GROWTH", "SCALE", "ADMIN"]).default("FREE"),
    memberType: z.enum(["companyUser", "independent"]).default("companyUser"),
    role: z.enum(["ADMIN", "DEAL_ADMIN", "MEMBER"]).default("MEMBER"),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Password reset tokens table
export const passwordResets = pgTable("password_resets", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tokenHash: text("token_hash").notNull(), // Hashed token for security
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"), // Null until token is used
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
export type PasswordReset = typeof passwordResets.$inferSelect;

// Credit ledger for tracking all credit transactions
export const creditLedger = pgTable("credit_ledger", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userId: varchar("user_id"), // Who initiated the transaction
  creditType: varchar("credit_type", { length: 20 }).notNull(), // 'basic' or 'pro'
  transactionType: varchar("transaction_type", { length: 20 }).notNull(), // 'purchase', 'use', 'adjustment', 'refund'
  amount: integer("amount").notNull(), // Positive for credit, negative for debit
  balanceAfter: integer("balance_after").notNull(), // Running balance after transaction
  description: text("description"),
  orderId: varchar("order_id"), // Link to order if this was a purchase
  briefId: varchar("brief_id"), // Link to brief if this was usage
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditLedgerSchema = createInsertSchema(creditLedger).omit({
  id: true,
  createdAt: true,
});

export type InsertCreditLedger = z.infer<typeof insertCreditLedgerSchema>;
export type CreditLedgerEntry = typeof creditLedger.$inferSelect;

// Brief file attachments table
export const briefFiles = pgTable("brief_files", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  briefId: varchar("brief_id").notNull(),
  userId: varchar("user_id"), // Who uploaded the file
  companyId: varchar("company_id"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  storagePath: text("storage_path").notNull(), // Path in object storage
  url: text("url"), // Public URL if available
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBriefFileSchema = createInsertSchema(briefFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertBriefFile = z.infer<typeof insertBriefFileSchema>;
export type BriefFileRecord = typeof briefFiles.$inferSelect;

// User sessions table for proper session management
export const sessions = pgTable("sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyId: varchar("company_id"),
  tokenHash: text("token_hash").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export const couponClaims = pgTable("coupon_claims", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  couponCode: text("coupon_code").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export const insertCouponClaimSchema = createInsertSchema(couponClaims)
  .pick({
    name: true,
    email: true,
  })
  .extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
  });

export type InsertCouponClaim = z.infer<typeof insertCouponClaimSchema>;
export type CouponClaim = typeof couponClaims.$inferSelect;

export const mailerSubscriptions = pgTable("mailer_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company: text("company").notNull(),
  industry: text("industry").notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertMailerSubscriptionSchema = createInsertSchema(
  mailerSubscriptions,
)
  .pick({
    name: true,
    email: true,
    company: true,
    industry: true,
  })
  .extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
    industry: z.string().min(1, "Please select an industry"),
  });

export type InsertMailerSubscription = z.infer<
  typeof insertMailerSubscriptionSchema
>;
export type MailerSubscription = typeof mailerSubscriptions.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("ZAR"),
  purchaseType: varchar("purchase_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email").notNull(),
  customerCompany: text("customer_company"),
  invoiceRequested: boolean("invoice_requested").notNull().default(false),
  businessRegNumber: text("business_reg_number"),
  vatNumber: text("vat_number"),
  companyAddress: text("company_address"),
  invoiceNumber: text("invoice_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  referenceId: varchar("reference_id"),
  quantity: integer("quantity").notNull().default(1),
  unitAmount: decimal("unit_amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertOrderItemWithoutOrderIdSchema = createInsertSchema(
  orderItems,
).omit({
  id: true,
  orderId: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertOrderItemWithoutOrderId = z.infer<
  typeof insertOrderItemWithoutOrderIdSchema
>;
export type OrderItem = typeof orderItems.$inferSelect;

export const paymentIntents = pgTable("payment_intents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  providerKey: varchar("provider_key", { length: 20 }).notNull(),
  providerIntentId: text("provider_intent_id"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentIntentSchema = createInsertSchema(
  paymentIntents,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPaymentIntent = z.infer<typeof insertPaymentIntentSchema>;
export type PaymentIntent = typeof paymentIntents.$inferSelect;

export const paymentEvents = pgTable("payment_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  intentId: varchar("intent_id").notNull(),
  providerEventId: text("provider_event_id"),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payload: jsonb("payload").notNull(),
  verifiedSignature: boolean("verified_signature").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentEventSchema = createInsertSchema(paymentEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertPaymentEvent = z.infer<typeof insertPaymentEventSchema>;
export type PaymentEvent = typeof paymentEvents.$inferSelect;

// Companies schema - For client accounts with pooled credits
export const companies = pgTable("companies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain"),
  logoUrl: text("logo_url"),
  industry: text("industry"),
  tier: varchar("tier", { length: 20 }).notNull().default("FREE"),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  basicCreditsTotal: integer("basic_credits_total").notNull().default(0),
  basicCreditsUsed: integer("basic_credits_used").notNull().default(0),
  proCreditsTotal: integer("pro_credits_total").notNull().default(0),
  proCreditsUsed: integer("pro_credits_used").notNull().default(0),
  companySize: text("company_size"),
  dealDetails: jsonb("deal_details"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    name: z.string().min(1, "Company name is required"),
    tier: z.enum(["FREE", "STARTER", "GROWTH", "SCALE", "ADMIN"]).default("FREE"),
  });

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Helper functions for credit calculations
export function getBasicCreditsRemaining(company: Company): number {
  return (company.basicCreditsTotal ?? 0) - (company.basicCreditsUsed ?? 0);
}

export function getProCreditsRemaining(company: Company): number {
  return (company.proCreditsTotal ?? 0) - (company.proCreditsUsed ?? 0);
}

// Reports schema - Aligned with reports.json structure
export const reports = pgTable("reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug"),
  category: varchar("category", { length: 50 }).notNull(),
  series: varchar("series", { length: 50 }),
  industry: text("industry"),
  date: timestamp("date").defaultNow().notNull(),
  teaser: text("teaser"),
  body: text("body"),
  content: jsonb("content"),
  topics: text("topics").array().default([]),
  videoPaths: text("video_paths").array().default([]),
  pdfUrl: text("pdf_url"),
  thumbnailUrl: text("thumbnail_url"),
  coverImageUrl: text("cover_image_url"),
  dashboardUrl: text("dashboard_url"),
  accessLevel: varchar("access_level", { length: 20 })
    .notNull()
    .default("public"),
  allowedTiers: text("allowed_tiers").array().default([]),
  clientCompanyIds: text("client_company_ids").array().default([]),
  creditType: varchar("credit_type", { length: 20 }).default("none"),
  creditCost: integer("credit_cost").default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("published"),
  viewCount: integer("view_count").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  // Scheduling fields for automated publishing
  publishAt: timestamp("publish_at"),
  unpublishAt: timestamp("unpublish_at"),
  // Tagging system for related content
  industryTag: varchar("industry_tag", { length: 50 }),
  themeTags: text("theme_tags").array().default([]),
  methodTags: text("method_tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reports)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    viewCount: true,
    downloadCount: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    category: z.enum(["Insights", "Launch", "Inside", "IRL"]),
    teaser: z.string().optional(),
    accessLevel: z.enum(["public", "member", "tier", "paid", "companyOnly"]).default("public"),
    creditType: z.enum(["none", "basic", "pro"]).default("none"),
    status: z.enum(["draft", "scheduled", "published", "archived"]).default("published"),
    date: z.date().optional(),
    // Scheduling fields
    publishAt: z.date().nullable().optional(),
    unpublishAt: z.date().nullable().optional(),
    // Tag fields for related content
    industryTag: z.string().nullable().optional(),
    themeTags: z.array(z.string()).optional().default([]),
    methodTags: z.array(z.string()).optional().default([]),
  });

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Deals schema
export const deals = pgTable("deals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  headlineOffer: text("headline_offer"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
  discountPercent: integer("discount_percent").default(0),
  creditsIncluded: integer("credits_included").notNull().default(0),
  targetTierKeys: text("target_tier_keys").array().default([]),
  targetUserIds: text("target_user_ids").array().default([]),
  ownerCompanyId: varchar("owner_company_id"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDealSchema = createInsertSchema(deals)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    headlineOffer: z.string().optional(),
    createdByUserId: z.string(),
  });

export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

// Client Reports - Past Research delivered to specific companies
export const clientReports = pgTable("client_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  studyType: varchar("study_type", { length: 50 }).default("Test24 Basic"),
  industry: varchar("industry", { length: 100 }),
  status: varchar("status", { length: 20 }).default("Completed"),
  deliveredAt: timestamp("delivered_at"),
  primaryContactEmail: text("primary_contact_email"),
  pdfUrl: text("pdf_url"),
  dashboardUrl: text("dashboard_url"),
  upsiideUrl: text("upsiide_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().default([]),
  // Top performing idea metadata
  topIdeaLabel: text("top_idea_label"),
  topIdeaIdeaScore: integer("top_idea_idea_score"),
  topIdeaInterest: integer("top_idea_interest"),
  topIdeaCommitment: integer("top_idea_commitment"),
  // Lowest performing idea metadata
  lowestIdeaLabel: text("lowest_idea_label"),
  lowestIdeaIdeaScore: integer("lowest_idea_idea_score"),
  lowestIdeaInterest: integer("lowest_idea_interest"),
  lowestIdeaCommitment: integer("lowest_idea_commitment"),
  // Consumer verbatims
  verbatim1: text("verbatim_1"),
  verbatim2: text("verbatim_2"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClientReportSchema = createInsertSchema(clientReports)
  .omit({
    id: true,
    uploadedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    companyId: z.string().min(1, "Company ID is required"),
    studyType: z.string().optional(),
    industry: z.string().optional(),
    status: z.string().optional(),
    deliveredAt: z.string().or(z.date()).optional(),
    primaryContactEmail: z.string().email().optional().or(z.literal("")),
    dashboardUrl: z.string().url().optional().or(z.literal("")),
    upsiideUrl: z.string().url().optional().or(z.literal("")),
    // Top idea fields
    topIdeaLabel: z.string().optional(),
    topIdeaIdeaScore: z.number().min(0).max(100).optional().nullable(),
    topIdeaInterest: z.number().min(0).max(100).optional().nullable(),
    topIdeaCommitment: z.number().min(0).max(100).optional().nullable(),
    // Lowest idea fields
    lowestIdeaLabel: z.string().optional(),
    lowestIdeaIdeaScore: z.number().min(0).max(100).optional().nullable(),
    lowestIdeaInterest: z.number().min(0).max(100).optional().nullable(),
    lowestIdeaCommitment: z.number().min(0).max(100).optional().nullable(),
    // Verbatims
    verbatim1: z.string().optional(),
    verbatim2: z.string().optional(),
  });

export type InsertClientReport = z.infer<typeof insertClientReportSchema>;
export type ClientReport = typeof clientReports.$inferSelect;

export const inquiries = pgTable("inquiries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerCompany: text("customer_company").notNull(),
  purchaseType: varchar("purchase_type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  payfastToken: text("payfast_token").unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerCompany: text("customer_company"),
  planType: varchar("plan_type", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("ZAR"),
  frequency: integer("frequency").notNull().default(3),
  cyclesTotal: integer("cycles_total").notNull().default(12),
  cyclesCompleted: integer("cycles_completed").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  nextBillingDate: timestamp("next_billing_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Brief File metadata type
export interface BriefFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

// Brief Submissions - For storing Launch New Brief form submissions
export const briefSubmissions = pgTable("brief_submissions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  submittedByName: text("submitted_by_name").notNull(),
  submittedByEmail: text("submitted_by_email").notNull(),
  submittedByContact: text("submitted_by_contact"),
  companyId: varchar("company_id"),
  companyName: text("company_name").notNull(),
  companyBrand: text("company_brand"),
  studyType: varchar("study_type", { length: 50 }).notNull(),
  numIdeas: integer("num_ideas").notNull().default(1),
  researchObjective: text("research_objective").notNull(),
  regions: text("regions").array().default([]),
  ages: text("ages").array().default([]),
  genders: text("genders").array().default([]),
  incomes: text("incomes").array().default([]),
  industry: text("industry"),
  competitors: text("competitors").array().default([]),
  projectFileUrls: text("project_file_urls").array().default([]),
  files: jsonb("files").default([]),
  concepts: jsonb("concepts").default([]),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("online"),
  paymentStatus: varchar("payment_status", { length: 20 }),
  paymentIntentId: varchar("payment_intent_id"),
  basicCreditsUsed: integer("basic_credits_used").notNull().default(0),
  proCreditsUsed: integer("pro_credits_used").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schema for brief file validation
const briefFileSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string(),
  uploadedAt: z.string(),
});

// Zod schema for concept validation
const conceptSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  fileCount: z.number().optional(),
});

export const insertBriefSubmissionSchema = createInsertSchema(briefSubmissions)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    submittedByName: z.string().min(1, "Name is required"),
    submittedByEmail: z.string().email("Valid email is required"),
    companyName: z.string().min(1, "Company name is required"),
    studyType: z.string().min(1, "Study type is required"),
    researchObjective: z.string().min(1, "Research objective is required"),
    status: z.enum(["new", "in_progress", "completed", "on_hold", "cancelled"]).default("new"),
    files: z.array(briefFileSchema).default([]),
    concepts: z.array(conceptSchema).default([]),
    paymentMethod: z.enum(["online", "invoice", "credits"]).default("online"),
    paymentStatus: z.enum(["pending", "completed", "failed"]).nullable().optional(),
    paymentIntentId: z.string().nullable().optional(),
    basicCreditsUsed: z.number().default(0),
    proCreditsUsed: z.number().default(0),
  });

export type InsertBriefSubmission = z.infer<typeof insertBriefSubmissionSchema>;
export type BriefSubmission = typeof briefSubmissions.$inferSelect;

// Study status enum for the research lifecycle
export const STUDY_STATUS = {
  NEW: "NEW",
  AUDIENCE_LIVE: "AUDIENCE_LIVE",
  ANALYSING_DATA: "ANALYSING_DATA",
  COMPLETED: "COMPLETED",
} as const;

export type StudyStatus = typeof STUDY_STATUS[keyof typeof STUDY_STATUS];

// Studies table - Unified view of research projects (links briefs to completed reports)
export const studies = pgTable("studies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  companyName: text("company_name").notNull(),
  briefId: varchar("brief_id"),
  clientReportId: varchar("client_report_id"),
  title: text("title").notNull(),
  description: text("description"),
  studyType: varchar("study_type", { length: 50 }).notNull(),
  isTest24: boolean("is_test24").notNull().default(true),
  tags: text("tags").array().default([]),
  status: varchar("status", { length: 20 }).notNull().default("NEW"),
  statusUpdatedAt: timestamp("status_updated_at").defaultNow().notNull(),
  reportUrl: text("report_url"),
  deliveryDate: timestamp("delivery_date"),
  submittedByEmail: text("submitted_by_email").notNull(),
  submittedByName: text("submitted_by_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStudySchema = createInsertSchema(studies)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    statusUpdatedAt: true,
  })
  .extend({
    title: z.string().min(1, "Title is required"),
    companyName: z.string().min(1, "Company name is required"),
    studyType: z.enum(["basic", "pro"]),
    status: z.enum(["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA", "COMPLETED"]).default("NEW"),
    submittedByEmail: z.string().email("Valid email is required"),
  });

export type InsertStudy = z.infer<typeof insertStudySchema>;
export type Study = typeof studies.$inferSelect;

// Report Analytics - Individual events for views and downloads
export const reportEvents = pgTable("report_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(),
  userId: varchar("user_id"), // Null for anonymous/guest viewers
  sessionId: text("session_id"), // Track anonymous sessions
  eventType: varchar("event_type", { length: 20 }).notNull(), // 'view' or 'download'
  actorType: varchar("actor_type", { length: 20 }).notNull(), // 'member' or 'guest'
  memberTier: varchar("member_tier", { length: 20 }), // e.g., 'STARTER', 'GROWTH', 'SCALE'
  metadata: jsonb("metadata"), // Additional context (device, referrer, etc.)
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
});

export const insertReportEventSchema = createInsertSchema(reportEvents).omit({
  id: true,
});

export type InsertReportEvent = z.infer<typeof insertReportEventSchema>;
export type ReportEvent = typeof reportEvents.$inferSelect;

// Track who viewed what reports (last viewed timestamp per user/report)
export const reportLastViewed = pgTable("report_last_viewed", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name"),
  userEmail: text("user_email"),
  memberTier: varchar("member_tier", { length: 20 }),
  companyName: text("company_name"),
  viewCount: integer("view_count").notNull().default(1),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
  firstViewedAt: timestamp("first_viewed_at").defaultNow().notNull(),
});

export const insertReportLastViewedSchema = createInsertSchema(reportLastViewed).omit({
  id: true,
});

export type InsertReportLastViewed = z.infer<typeof insertReportLastViewedSchema>;
export type ReportLastViewed = typeof reportLastViewed.$inferSelect;

export const reportRequests = pgTable("report_requests", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name"),
  industry: text("industry").notNull(),
  topic: text("topic").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  userId: varchar("user_id"),
  companyId: varchar("company_id"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertReportRequestSchema = createInsertSchema(reportRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertReportRequest = z.infer<typeof insertReportRequestSchema>;
export type ReportRequest = typeof reportRequests.$inferSelect;
