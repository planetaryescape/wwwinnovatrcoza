import { 
  type User, 
  type InsertUser, 
  type CouponClaim, 
  type InsertCouponClaim, 
  type MailerSubscription, 
  type InsertMailerSubscription,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type PaymentIntent,
  type InsertPaymentIntent,
  type PaymentEvent,
  type InsertPaymentEvent,
  type Report,
  type InsertReport,
  type Deal,
  type InsertDeal,
  type Inquiry,
  type InsertInquiry,
  type Subscription,
  type InsertSubscription,
  orders,
  orderItems,
  paymentIntents,
  paymentEvents,
  inquiries,
  subscriptions,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<void>;
  createCouponClaim(claim: InsertCouponClaim): Promise<CouponClaim>;
  getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined>;
  createMailerSubscription(subscription: InsertMailerSubscription): Promise<MailerSubscription>;
  getMailerSubscriptionByEmail(email: string): Promise<MailerSubscription | undefined>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  updateOrder(id: string, updates: Partial<Order>): Promise<void>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  
  createPaymentIntent(intent: InsertPaymentIntent): Promise<PaymentIntent>;
  getPaymentIntent(id: string): Promise<PaymentIntent | undefined>;
  getPaymentIntentByProviderIntentId(providerIntentId: string): Promise<PaymentIntent | undefined>;
  updatePaymentIntent(id: string, updates: Partial<PaymentIntent>): Promise<void>;
  
  createPaymentEvent(event: InsertPaymentEvent): Promise<PaymentEvent>;
  getPaymentEvents(intentId: string): Promise<PaymentEvent[]>;

  createReport(report: InsertReport): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  updateReport(id: string, updates: Partial<Report>): Promise<void>;

  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeal(id: string): Promise<Deal | undefined>;
  getAllDeals(): Promise<Deal[]>;
  updateDeal(id: string, updates: Partial<Deal>): Promise<void>;

  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAllInquiries(): Promise<Inquiry[]>;

  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByToken(token: string): Promise<Subscription | undefined>;
  getSubscriptionsByEmail(email: string): Promise<Subscription[]>;
  getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<void>;
  getAllSubscriptions(): Promise<Subscription[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private couponClaims: Map<string, CouponClaim>;
  private mailerSubscriptions: Map<string, MailerSubscription>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private paymentIntents: Map<string, PaymentIntent>;
  private paymentEvents: Map<string, PaymentEvent>;
  private reports: Map<string, Report>;
  private deals: Map<string, Deal>;
  private inquiriesMap: Map<string, Inquiry>;
  private subscriptionsMap: Map<string, Subscription>;

  constructor() {
    this.users = new Map();
    this.couponClaims = new Map();
    this.mailerSubscriptions = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.paymentIntents = new Map();
    this.paymentEvents = new Map();
    this.reports = new Map();
    this.deals = new Map();
    this.inquiriesMap = new Map();
    this.subscriptionsMap = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      username: insertUser.username || `user_${Date.now()}`,
      email: insertUser.email,
      password: insertUser.password || Math.random().toString(36).slice(-10),
      name: insertUser.name ?? null,
      company: insertUser.company ?? null,
      membershipTier: insertUser.membershipTier ?? "STARTER",
      status: insertUser.status ?? "ACTIVE",
      role: (insertUser.role as any) ?? "MEMBER",
      creditsBasic: insertUser.creditsBasic ?? 0,
      creditsPro: insertUser.creditsPro ?? 0,
      totalSpend: "0",
      firstProjectDate: null,
      lastProjectDate: null,
      lastActivityDate: null,
      internalNotes: null,
      createdAt: now,
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, ...updates });
    }
  }

  async createCouponClaim(insertClaim: InsertCouponClaim): Promise<CouponClaim> {
    const id = randomUUID();
    const couponCode = `TEST24-${randomUUID().substring(0, 8).toUpperCase()}`;
    const claim: CouponClaim = {
      ...insertClaim,
      id,
      couponCode,
      claimedAt: new Date(),
    };
    this.couponClaims.set(id, claim);
    return claim;
  }

  async getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined> {
    return Array.from(this.couponClaims.values()).find(
      (claim) => claim.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createMailerSubscription(insertSubscription: InsertMailerSubscription): Promise<MailerSubscription> {
    const id = randomUUID();
    const subscription: MailerSubscription = {
      ...insertSubscription,
      id,
      subscribedAt: new Date(),
    };
    this.mailerSubscriptions.set(id, subscription);
    return subscription;
  }

  async getMailerSubscriptionByEmail(email: string): Promise<MailerSubscription | undefined> {
    return Array.from(this.mailerSubscriptions.values()).find(
      (sub) => sub.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(orders)
      .values({
        id,
        userId: insertOrder.userId ?? null,
        amount: insertOrder.amount,
        currency: insertOrder.currency ?? "ZAR",
        purchaseType: insertOrder.purchaseType,
        status: insertOrder.status ?? "pending",
        customerName: insertOrder.customerName ?? null,
        customerEmail: insertOrder.customerEmail,
        customerCompany: insertOrder.customerCompany ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const result = await db
      .insert(orderItems)
      .values({
        id,
        orderId: insertItem.orderId,
        type: insertItem.type,
        referenceId: insertItem.referenceId ?? null,
        quantity: insertItem.quantity ?? 1,
        unitAmount: insertItem.unitAmount,
        description: insertItem.description ?? null,
      })
      .returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createPaymentIntent(insertIntent: InsertPaymentIntent): Promise<PaymentIntent> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(paymentIntents)
      .values({
        id,
        orderId: insertIntent.orderId,
        providerKey: insertIntent.providerKey,
        providerIntentId: insertIntent.providerIntentId ?? null,
        status: insertIntent.status ?? "pending",
        metadata: insertIntent.metadata ?? {},
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | undefined> {
    const result = await db.select().from(paymentIntents).where(eq(paymentIntents.id, id));
    return result[0];
  }

  async getPaymentIntentByProviderIntentId(providerIntentId: string): Promise<PaymentIntent | undefined> {
    const result = await db
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.providerIntentId, providerIntentId));
    return result[0];
  }

  async updatePaymentIntent(id: string, updates: Partial<PaymentIntent>): Promise<void> {
    await db
      .update(paymentIntents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentIntents.id, id));
  }

  async createPaymentEvent(insertEvent: InsertPaymentEvent): Promise<PaymentEvent> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(paymentEvents)
      .values({
        id,
        intentId: insertEvent.intentId,
        providerEventId: insertEvent.providerEventId ?? null,
        eventType: insertEvent.eventType,
        payload: insertEvent.payload,
        verifiedSignature: insertEvent.verifiedSignature ?? false,
        createdAt: now,
      })
      .returning();
    return result[0];
  }

  async getPaymentEvents(intentId: string): Promise<PaymentEvent[]> {
    return db.select().from(paymentEvents).where(eq(paymentEvents.intentId, intentId));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const now = new Date();
    const slug = insertReport.slug ?? insertReport.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const report: Report = {
      id,
      title: insertReport.title,
      slug,
      category: insertReport.category,
      industry: insertReport.industry ?? null,
      date: insertReport.date ?? now,
      previewText: insertReport.previewText ?? null,
      bodyContent: insertReport.bodyContent ?? null,
      topics: insertReport.topics ?? [],
      tags: insertReport.tags ?? [],
      pdfUrl: insertReport.pdfUrl ?? null,
      accessLevel: insertReport.accessLevel ?? "public",
      allowedTiers: insertReport.allowedTiers ?? [],
      creditType: insertReport.creditType ?? "none",
      creditCost: insertReport.creditCost ?? 0,
      isFeatured: insertReport.isFeatured ?? false,
      status: insertReport.status ?? "published",
      publishAt: insertReport.publishAt ?? null,
      unpublishAt: insertReport.unpublishAt ?? null,
      viewCount: 0,
      uniqueViewCount: 0,
      downloadCount: 0,
      upgradeInfluenceScore: 0,
      isArchived: insertReport.isArchived ?? false,
      lastUpdatedBy: insertReport.lastUpdatedBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.reports.set(id, report);
    return report;
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<void> {
    const report = this.reports.get(id);
    if (report) {
      this.reports.set(id, { ...report, ...updates, updatedAt: new Date() });
    }
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const now = new Date();
    const deal: Deal = {
      id,
      title: insertDeal.title,
      description: insertDeal.description ?? null,
      headlineOffer: insertDeal.headlineOffer ?? null,
      originalPrice: insertDeal.originalPrice ?? null,
      discountedPrice: insertDeal.discountedPrice ?? null,
      discountPercent: insertDeal.discountPercent ?? 0,
      creditsIncluded: insertDeal.creditsIncluded ?? 0,
      targetTierKeys: insertDeal.targetTierKeys ?? [],
      targetUserIds: insertDeal.targetUserIds ?? [],
      ownerCompanyId: insertDeal.ownerCompanyId ?? null,
      createdByUserId: insertDeal.createdByUserId,
      validFrom: insertDeal.validFrom,
      validTo: insertDeal.validTo ?? null,
      isActive: insertDeal.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.deals.set(id, deal);
    return deal;
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getAllDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values());
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
    const deal = this.deals.get(id);
    if (deal) {
      this.deals.set(id, { ...deal, ...updates, updatedAt: new Date() });
    }
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const result = await db
      .insert(inquiries)
      .values({
        id,
        customerName: insertInquiry.customerName,
        customerEmail: insertInquiry.customerEmail,
        customerCompany: insertInquiry.customerCompany,
        purchaseType: insertInquiry.purchaseType,
        amount: insertInquiry.amount,
        items: insertInquiry.items,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async getSubscriptionByToken(token: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.payfastToken, token));
    return subscription;
  }

  async getSubscriptionsByEmail(email: string): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.customerEmail, email));
  }

  async getSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    await db.update(subscriptions).set({ ...updates, updatedAt: new Date() }).where(eq(subscriptions.id, id));
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return db.select().from(subscriptions);
  }
}

export const storage = new MemStorage();
