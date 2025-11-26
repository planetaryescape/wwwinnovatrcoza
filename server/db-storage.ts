import { db } from "./db";
import { 
  users, 
  couponClaims, 
  mailerSubscriptions,
  orders,
  orderItems,
  paymentIntents,
  paymentEvents,
  reports,
  deals,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import type {
  User,
  InsertUser,
  CouponClaim,
  InsertCouponClaim,
  MailerSubscription,
  InsertMailerSubscription,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  PaymentIntent,
  InsertPaymentIntent,
  PaymentEvent,
  InsertPaymentEvent,
  Report,
  InsertReport,
  Deal,
  InsertDeal,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(users)
      .values({
        id,
        username: user.username || `user_${Date.now()}`,
        email: user.email,
        password: user.password || Math.random().toString(36).slice(-10),
        name: user.name ?? null,
        company: user.company ?? null,
        membershipTier: user.membershipTier ?? "STARTER",
        status: user.status ?? "ACTIVE",
        role: user.role ?? "MEMBER",
        creditsBasic: user.creditsBasic ?? 0,
        creditsPro: user.creditsPro ?? 0,
        createdAt: now,
        lastLoginAt: null,
      })
      .returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await db.update(users).set({ ...updates, lastLoginAt: new Date() }).where(eq(users.id, id));
  }

  async createCouponClaim(claim: InsertCouponClaim): Promise<CouponClaim> {
    const id = randomUUID();
    const couponCode = `TEST24-${randomUUID().substring(0, 8).toUpperCase()}`;
    const result = await db
      .insert(couponClaims)
      .values({
        id,
        name: claim.name,
        email: claim.email,
        couponCode,
        claimedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined> {
    const result = await db
      .select()
      .from(couponClaims)
      .where(eq(couponClaims.email, email));
    return result[0];
  }

  async createMailerSubscription(subscription: InsertMailerSubscription): Promise<MailerSubscription> {
    const id = randomUUID();
    const result = await db
      .insert(mailerSubscriptions)
      .values({
        id,
        email: subscription.email,
        subscribedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getMailerSubscriptionByEmail(email: string): Promise<MailerSubscription | undefined> {
    const result = await db
      .select()
      .from(mailerSubscriptions)
      .where(eq(mailerSubscriptions.email, email));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(orders)
      .values({
        id,
        userId: order.userId ?? null,
        amount: order.amount,
        currency: order.currency ?? "ZAR",
        purchaseType: order.purchaseType,
        status: order.status ?? "pending",
        customerName: order.customerName ?? null,
        customerEmail: order.customerEmail,
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

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const result = await db
      .insert(orderItems)
      .values({
        id,
        orderId: item.orderId,
        type: item.type,
        referenceId: item.referenceId ?? null,
        quantity: item.quantity ?? 1,
        unitAmount: item.unitAmount,
        description: item.description ?? null,
      })
      .returning();
    return result[0];
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createPaymentIntent(intent: InsertPaymentIntent): Promise<PaymentIntent> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(paymentIntents)
      .values({
        id,
        orderId: intent.orderId,
        providerKey: intent.providerKey,
        providerIntentId: intent.providerIntentId ?? null,
        status: intent.status ?? "pending",
        metadata: intent.metadata ?? {},
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

  async createPaymentEvent(event: InsertPaymentEvent): Promise<PaymentEvent> {
    const id = randomUUID();
    const result = await db
      .insert(paymentEvents)
      .values({
        id,
        intentId: event.intentId,
        providerEventId: event.providerEventId ?? null,
        eventType: event.eventType,
        payload: event.payload,
        verifiedSignature: event.verifiedSignature ?? false,
        createdAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getPaymentEvents(intentId: string): Promise<PaymentEvent[]> {
    return db.select().from(paymentEvents).where(eq(paymentEvents.intentId, intentId));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(reports)
      .values({
        id,
        title: report.title,
        category: report.category,
        industry: report.industry ?? null,
        date: report.date ?? now,
        teaser: report.teaser ?? null,
        topics: report.topics ?? [],
        body: report.body ?? null,
        pdfUrl: report.pdfUrl ?? null,
        accessLevel: report.accessLevel ?? "PUBLIC",
        isArchived: report.isArchived ?? false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async getReport(id: string): Promise<Report | undefined> {
    const result = await db.select().from(reports).where(eq(reports.id, id));
    return result[0];
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports);
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<void> {
    await db
      .update(reports)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reports.id, id));
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(deals)
      .values({
        id,
        title: deal.title,
        description: deal.description ?? null,
        headlineOffer: deal.headlineOffer ?? null,
        originalPrice: deal.originalPrice ?? null,
        discountedPrice: deal.discountedPrice ?? null,
        discountPercent: deal.discountPercent ?? 0,
        creditsIncluded: deal.creditsIncluded ?? 0,
        targetTierKeys: deal.targetTierKeys ?? [],
        targetUserIds: deal.targetUserIds ?? [],
        ownerCompanyId: deal.ownerCompanyId ?? null,
        createdByUserId: deal.createdByUserId,
        validFrom: deal.validFrom,
        validTo: deal.validTo ?? null,
        isActive: deal.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return result[0];
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const result = await db.select().from(deals).where(eq(deals.id, id));
    return result[0];
  }

  async getAllDeals(): Promise<Deal[]> {
    return db.select().from(deals);
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<void> {
    await db
      .update(deals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(deals.id, id));
  }
}
