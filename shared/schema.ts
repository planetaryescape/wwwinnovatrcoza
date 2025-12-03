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
  password: text("password").notNull(),
  name: text("name"),
  company: text("company"),
  companyId: varchar("company_id"),
  membershipTier: varchar("membership_tier", { length: 20 })
    .notNull()
    .default("STARTER"),
  status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
  role: varchar("role", { length: 20 }).notNull().default("MEMBER"),
  creditsBasic: integer("credits_basic").notNull().default(0),
  creditsPro: integer("credits_pro").notNull().default(0),
  creditsInheritedFromCompany: boolean("credits_inherited_from_company").notNull().default(true),
  totalSpend: decimal("total_spend", { precision: 10, scale: 2 }).default("0"),
  firstProjectDate: timestamp("first_project_date"),
  lastProjectDate: timestamp("last_project_date"),
  lastActivityDate: timestamp("last_activity_date"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    lastLoginAt: true,
  })
  .extend({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    name: z.string().optional(),
    membershipTier: z.enum(["STARTER", "GROWTH", "SCALE"]).default("STARTER"),
    role: z.enum(["ADMIN", "DEAL_ADMIN", "MEMBER"]).default("MEMBER"),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  tier: varchar("tier", { length: 20 }).notNull().default("STARTER"),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  monthlyFee: decimal("monthly_fee", { precision: 10, scale: 2 }),
  basicCreditsTotal: integer("basic_credits_total").notNull().default(0),
  basicCreditsUsed: integer("basic_credits_used").notNull().default(0),
  proCreditsTotal: integer("pro_credits_total").notNull().default(0),
  proCreditsUsed: integer("pro_credits_used").notNull().default(0),
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
    tier: z.enum(["STARTER", "GROWTH", "SCALE"]).default("STARTER"),
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
  industry: text("industry"),
  date: timestamp("date").defaultNow().notNull(),
  teaser: text("teaser"),
  body: text("body"),
  content: jsonb("content"),
  topics: text("topics").array().default([]),
  pdfUrl: text("pdf_url"),
  thumbnailUrl: text("thumbnail_url"),
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
  pdfUrl: text("pdf_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags").array().default([]),
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
