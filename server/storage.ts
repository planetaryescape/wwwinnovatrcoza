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
  type Company,
  type InsertCompany,
  type ClientReport,
  type InsertClientReport,
  type BriefSubmission,
  type InsertBriefSubmission,
  type BriefFile,
  type Study,
  type InsertStudy,
  type StudyStatus,
  type PasswordReset,
  type InsertPasswordReset,
  type CreditLedgerEntry,
  type InsertCreditLedger,
  type BriefFileRecord,
  type InsertBriefFile,
  type Session,
  type InsertSession,
  users,
  passwordResets,
  creditLedger,
  briefFiles,
  sessions,
  couponClaims,
  mailerSubscriptions,
  orders,
  orderItems,
  paymentIntents,
  paymentEvents,
  companies,
  reports,
  deals,
  clientReports,
  inquiries,
  subscriptions,
  briefSubmissions,
  studies,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth/password";

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
  getAllMailerSubscriptions(): Promise<MailerSubscription[]>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByEmail(email: string): Promise<Order[]>;
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

  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByName(name: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  updateCompany(id: string, updates: Partial<Company>): Promise<void>;
  deleteCompany(id: string): Promise<void>;
  getUsersByCompanyId(companyId: string): Promise<User[]>;
  
  deleteUser(id: string): Promise<void>;

  createClientReport(report: InsertClientReport): Promise<ClientReport>;
  getClientReport(id: string): Promise<ClientReport | undefined>;
  getClientReportsByCompanyId(companyId: string): Promise<ClientReport[]>;
  getAllClientReports(): Promise<ClientReport[]>;
  updateClientReport(id: string, updates: Partial<ClientReport>): Promise<void>;
  deleteClientReport(id: string): Promise<void>;

  createBriefSubmission(brief: InsertBriefSubmission): Promise<BriefSubmission>;
  getBriefSubmission(id: string): Promise<BriefSubmission | undefined>;
  getBriefSubmissionsByEmail(email: string): Promise<BriefSubmission[]>;
  getBriefSubmissionsByCompanyId(companyId: string): Promise<BriefSubmission[]>;
  getAllBriefSubmissions(): Promise<BriefSubmission[]>;
  updateBriefSubmission(id: string, updates: Partial<BriefSubmission>): Promise<void>;

  createStudy(study: InsertStudy): Promise<Study>;
  getStudy(id: string): Promise<Study | undefined>;
  getStudyByBriefId(briefId: string): Promise<Study | undefined>;
  getStudiesByCompanyId(companyId: string): Promise<Study[]>;
  getStudiesByEmail(email: string): Promise<Study[]>;
  getAllStudies(): Promise<Study[]>;
  updateStudy(id: string, updates: Partial<Study>): Promise<void>;
  updateStudyStatus(id: string, status: StudyStatus): Promise<Study | undefined>;

  createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset>;
  getPasswordResetByTokenHash(tokenHash: string): Promise<PasswordReset | undefined>;
  markPasswordResetUsed(id: string): Promise<void>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSessionByTokenHash(tokenHash: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  
  createCreditLedgerEntry(entry: InsertCreditLedger): Promise<CreditLedgerEntry>;
  getCreditLedgerByCompanyId(companyId: string): Promise<CreditLedgerEntry[]>;
  getCompanyCreditBalance(companyId: string, creditType: 'basic' | 'pro'): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  
  async seedDatabase(): Promise<void> {
    const existingCompanies = await this.getAllCompanies();
    if (existingCompanies.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with initial data...");

    const innovatrId = randomUUID();
    const ruganiId = randomUUID();
    const greenwayId = randomUUID();

    await db.insert(companies).values({
      id: innovatrId,
      name: "Innovatr",
      domain: "innovatr.co.za",
      logoUrl: null,
      industry: "Market Research",
      tier: "SCALE",
      contractStart: null,
      contractEnd: null,
      monthlyFee: null,
      basicCreditsTotal: 25,
      basicCreditsUsed: 0,
      proCreditsTotal: 4,
      proCreditsUsed: 0,
      dealDetails: null,
      notes: "Internal Innovatr team - admin access",
    });

    await db.insert(companies).values({
      id: ruganiId,
      name: "Rugani Juice",
      domain: "ruganijuice.co.za",
      logoUrl: null,
      industry: "Beverages",
      tier: "SCALE",
      contractStart: new Date("2025-12-01"),
      contractEnd: new Date("2026-11-30"),
      monthlyFee: "26250",
      basicCreditsTotal: 20,
      basicCreditsUsed: 0,
      proCreditsTotal: 4,
      proCreditsUsed: 0,
      dealDetails: {
        title: "Annual Service Agreement",
        features: [
          "2 x Test24 Pro Brand Health Audit studies (300 consumers, 10 min)",
          "2 x Test24 Pro studies (100 consumers, 10 min)", 
          "20 x Test24 Basic idea studies (100 consumers, 5 min)"
        ],
        memberRates: {
          basic: 4000,
          pro: 45000
        }
      },
      notes: "Service agreement shared between Greenway Farms (Carrots Division) and Rugani Juice. Includes 2 x Test24 Pro Brand Health Audit studies (300 consumers, 10 minute survey), 2 x Test24 Pro studies (100 consumers, 10 minute survey) and 20 x Test24 Basic idea studies (100 consumers, 5 minute surveys). Additional studies at member rates: Test24 Basic R4,000 and Test24 Pro R45,000 per 100 completes.",
    });

    await db.insert(companies).values({
      id: greenwayId,
      name: "Greenway Farms",
      domain: "greenwayfarm.co.za",
      logoUrl: null,
      industry: "Agriculture",
      tier: "SCALE",
      contractStart: new Date("2025-12-01"),
      contractEnd: new Date("2026-11-30"),
      monthlyFee: "26250",
      basicCreditsTotal: 0,
      basicCreditsUsed: 0,
      proCreditsTotal: 0,
      proCreditsUsed: 0,
      dealDetails: null,
      notes: "Linked to Rugani Juice service agreement. Greenway users have Scale report access but Rugani holds the pooled Test24 credits.",
    });

    const tempPasswordHash = await hashPassword("TempPass123!");
    const adminPasswordHash = await hashPassword("Innovatr@Admin!");

    const adminUsersData = [
      { name: "HannaH Steven", email: "hannah@innovatr.co.za", username: "hannah.steven", passwordHash: adminPasswordHash, creditsBasic: 25, creditsPro: 4 },
      { name: "Richard Lawrence", email: "richard@innovatr.co.za", username: "richard.lawrence", passwordHash: adminPasswordHash, creditsBasic: 25, creditsPro: 4 },
    ];

    for (const u of adminUsersData) {
      await db.insert(users).values({
        id: randomUUID(),
        username: u.username,
        email: u.email,
        password: "",
        passwordHash: u.passwordHash,
        name: u.name,
        company: "Innovatr",
        companyId: innovatrId,
        membershipTier: "SCALE",
        status: "ACTIVE",
        role: "ADMIN",
        creditsBasic: u.creditsBasic,
        creditsPro: u.creditsPro,
        creditsInheritedFromCompany: true,
        totalSpend: "0",
        isActive: true,
        emailVerified: true,
      });
    }

    const greenwayUsersData = [
      { name: "Duncan Buhr", email: "duncan@greenwayfarm.co.za", username: "duncan.buhr" },
      { name: "Wesley Browne", email: "Wesley@greenwayfarm.co.za", username: "wesley.browne" },
    ];

    const ruganiUsersData = [
      { name: "Simonne Fourie", email: "simonne@ruganijuice.co.za", username: "simonne.fourie" },
      { name: "Tymon Minaar", email: "tymon@ruganijuice.co.za", username: "tymon.minaar" },
    ];

    for (const u of greenwayUsersData) {
      await db.insert(users).values({
        id: randomUUID(),
        username: u.username,
        email: u.email,
        password: "",
        passwordHash: tempPasswordHash,
        name: u.name,
        company: "Greenway Farms",
        companyId: greenwayId,
        membershipTier: "SCALE",
        status: "ACTIVE",
        role: "MEMBER",
        creditsBasic: 0,
        creditsPro: 0,
        creditsInheritedFromCompany: true,
        totalSpend: "0",
        isActive: true,
        emailVerified: true,
      });
    }

    for (const u of ruganiUsersData) {
      await db.insert(users).values({
        id: randomUUID(),
        username: u.username,
        email: u.email,
        password: "",
        passwordHash: tempPasswordHash,
        name: u.name,
        company: "Rugani Juice",
        companyId: ruganiId,
        membershipTier: "SCALE",
        status: "ACTIVE",
        role: "MEMBER",
        creditsBasic: 0,
        creditsPro: 0,
        creditsInheritedFromCompany: true,
        totalSpend: "0",
        isActive: true,
        emailVerified: true,
      });
    }

    const clientReportsData = [
      {
        title: "Rugani 100% Carrot Juice Concept Test",
        category: "Launch",
        industry: "Beverages",
        teaser: "Concept testing for new carrot juice product range. Consumer insights on flavour preferences, packaging design, and brand positioning for the South African market.",
        accessLevel: "companyOnly",
        creditType: "none",
        status: "published",
        slug: "rugani-carrot-juice-concept",
        date: new Date("2025-11-15"),
        topics: ["Beverages", "Food", "FMCG"],
        clientCompanyIds: [ruganiId, greenwayId],
      },
      {
        title: "Greenway Carrots Brand Health Study",
        category: "Insights",
        industry: "Agriculture",
        teaser: "Comprehensive brand health audit tracking consumer perceptions, awareness, and purchase intent for Greenway Farm carrots in retail channels.",
        accessLevel: "companyOnly",
        creditType: "none",
        status: "published",
        slug: "greenway-carrots-brand-health",
        date: new Date("2025-11-20"),
        topics: ["Agriculture", "FMCG", "Retail"],
        clientCompanyIds: [ruganiId, greenwayId],
      },
    ];

    for (const r of clientReportsData) {
      await db.insert(reports).values({
        id: randomUUID(),
        title: r.title,
        slug: r.slug,
        category: r.category,
        industry: r.industry,
        date: r.date,
        teaser: r.teaser,
        accessLevel: r.accessLevel,
        creditType: r.creditType,
        status: r.status,
        topics: r.topics,
        clientCompanyIds: r.clientCompanyIds,
      });
    }

    const ruganiClientReportsData = [
      {
        companyId: ruganiId,
        title: "Rugani x Clicks Wellness Beverage Positioning",
        description: "Quant deep dive into how Rugani's 330 ml and 750 ml formats perform against LiquiFruit, Coke, Powerade and Red Bull in Clicks. Shows that Rugani's natural positioning fits the Clicks wellness mission and proves the role of each format in fridges, health aisles and checkout.",
        pdfUrl: "/assets/client-reports/rugani/Rugani_X_Clicks_Test24_Basic.pptx",
        tags: ["Rugani", "Clicks", "Test24 Basic", "Retail Positioning", "Beverages", "Wellness", "Category Growth"],
        uploadedAt: new Date("2025-11-07"),
      },
      {
        companyId: ruganiId,
        title: "Rugani New Key Visual Optimisation",
        description: "Evaluation of Rugani's new key visual against Sir Fruit, LiquiFruit and Rhodes among heavy juice users. Identifies where the current ad underperforms and gives a roadmap to shift from sport-only energy cues to everyday natural health and refreshment.",
        pdfUrl: "/assets/client-reports/rugani/Rugani_Test24_X_Ad_Campaign.pptx",
        tags: ["Rugani", "Creative Testing", "Key Visual", "Test24 Basic", "Juice", "Brand Communication"],
        uploadedAt: new Date("2025-11-07"),
      },
    ];

    for (const cr of ruganiClientReportsData) {
      await db.insert(clientReports).values({
        id: randomUUID(),
        companyId: cr.companyId,
        title: cr.title,
        description: cr.description,
        pdfUrl: cr.pdfUrl,
        tags: cr.tags,
        uploadedAt: cr.uploadedAt,
      });
    }

    await db.insert(deals).values({
      id: randomUUID(),
      title: "Rugani & Greenway Service Agreement",
      description: "Annual service agreement for Rugani Juice and Greenway Farms. Includes 2 x Test24 Pro Brand Health Audit studies (300 consumers, 10 min), 2 x Test24 Pro studies (100 consumers, 10 min), and 20 x Test24 Basic idea studies (100 consumers, 5 min). Additional studies available at member rates.",
      originalPrice: "630000",
      discountedPrice: "315000",
      creditsIncluded: 26,
      targetTierKeys: ["SCALE"],
      createdByUserId: "system",
      validFrom: new Date("2025-12-01"),
      validTo: new Date("2026-11-30"),
      isActive: true,
    });

    console.log("Database seeding completed successfully!");
  }

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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const result = await db
      .insert(users)
      .values({
        id,
        username: insertUser.username || `user_${Date.now()}`,
        email: insertUser.email,
        password: insertUser.password || Math.random().toString(36).slice(-10),
        passwordHash: null,
        name: insertUser.name ?? null,
        company: insertUser.company ?? null,
        companyId: (insertUser as any).companyId ?? null,
        membershipTier: insertUser.membershipTier ?? "STARTER",
        status: insertUser.status ?? "ACTIVE",
        role: (insertUser.role as any) ?? "MEMBER",
        creditsBasic: insertUser.creditsBasic ?? 0,
        creditsPro: insertUser.creditsPro ?? 0,
        creditsInheritedFromCompany: (insertUser as any).creditsInheritedFromCompany ?? true,
        totalSpend: "0",
        firstProjectDate: null,
        lastProjectDate: null,
        lastActivityDate: null,
        internalNotes: null,
        isActive: true,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      })
      .returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async createCouponClaim(insertClaim: InsertCouponClaim): Promise<CouponClaim> {
    const id = randomUUID();
    const couponCode = `TEST24-${randomUUID().substring(0, 8).toUpperCase()}`;
    const result = await db
      .insert(couponClaims)
      .values({
        id,
        name: insertClaim.name,
        email: insertClaim.email,
        couponCode,
        claimedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined> {
    const result = await db.select().from(couponClaims).where(eq(couponClaims.email, email));
    return result[0];
  }

  async createMailerSubscription(insertSubscription: InsertMailerSubscription): Promise<MailerSubscription> {
    const id = randomUUID();
    const result = await db
      .insert(mailerSubscriptions)
      .values({
        id,
        name: insertSubscription.name,
        email: insertSubscription.email,
        company: insertSubscription.company,
        industry: insertSubscription.industry,
        subscribedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getMailerSubscriptionByEmail(email: string): Promise<MailerSubscription | undefined> {
    const result = await db.select().from(mailerSubscriptions).where(eq(mailerSubscriptions.email, email));
    return result[0];
  }

  async getAllMailerSubscriptions(): Promise<MailerSubscription[]> {
    return db.select().from(mailerSubscriptions);
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
        invoiceRequested: insertOrder.invoiceRequested ?? false,
        businessRegNumber: insertOrder.businessRegNumber ?? null,
        vatNumber: insertOrder.vatNumber ?? null,
        invoiceNumber: insertOrder.invoiceNumber ?? null,
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

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.customerEmail, email));
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
    const slug = insertReport.slug ?? insertReport.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = await db.insert(reports).values({
      id,
      title: insertReport.title,
      slug,
      category: insertReport.category,
      industry: insertReport.industry ?? null,
      date: insertReport.date ?? new Date(),
      teaser: insertReport.teaser ?? null,
      body: insertReport.body ?? null,
      content: insertReport.content ?? null,
      topics: insertReport.topics ?? [],
      pdfUrl: insertReport.pdfUrl ?? null,
      thumbnailUrl: insertReport.thumbnailUrl ?? null,
      accessLevel: insertReport.accessLevel ?? "public",
      allowedTiers: insertReport.allowedTiers ?? [],
      clientCompanyIds: insertReport.clientCompanyIds ?? [],
      creditType: insertReport.creditType ?? "none",
      creditCost: insertReport.creditCost ?? 0,
      isFeatured: insertReport.isFeatured ?? false,
      status: insertReport.status ?? "published",
      isArchived: insertReport.isArchived ?? false,
    }).returning();
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
    await db.update(reports).set({ ...updates, updatedAt: new Date() }).where(eq(reports.id, id));
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(deals).values({
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
    }).returning();
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
    await db.update(deals).set({ ...updates, updatedAt: new Date() }).where(eq(deals.id, id));
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
    const result = await db.insert(subscriptions).values(insertSubscription).returning();
    return result[0];
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return result[0];
  }

  async getSubscriptionByToken(token: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.payfastToken, token));
    return result[0];
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

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(companies).values({
      id,
      name: insertCompany.name,
      domain: insertCompany.domain ?? null,
      logoUrl: (insertCompany as any).logoUrl ?? null,
      industry: insertCompany.industry ?? null,
      tier: insertCompany.tier ?? "STARTER",
      contractStart: insertCompany.contractStart ?? null,
      contractEnd: insertCompany.contractEnd ?? null,
      monthlyFee: insertCompany.monthlyFee ?? null,
      basicCreditsTotal: insertCompany.basicCreditsTotal ?? 0,
      basicCreditsUsed: insertCompany.basicCreditsUsed ?? 0,
      proCreditsTotal: insertCompany.proCreditsTotal ?? 0,
      proCreditsUsed: insertCompany.proCreditsUsed ?? 0,
      dealDetails: (insertCompany as any).dealDetails ?? null,
      notes: insertCompany.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id));
    return result[0];
  }

  async getCompanyByName(name: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.name, name));
    return result[0];
  }

  async getAllCompanies(): Promise<Company[]> {
    return db.select().from(companies);
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<void> {
    await db.update(companies).set({ ...updates, updatedAt: new Date() }).where(eq(companies.id, id));
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  async getUsersByCompanyId(companyId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.companyId, companyId));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createClientReport(insertReport: InsertClientReport & { uploadedAt?: Date }): Promise<ClientReport> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(clientReports).values({
      id,
      companyId: insertReport.companyId,
      title: insertReport.title,
      description: insertReport.description ?? null,
      pdfUrl: insertReport.pdfUrl ?? null,
      thumbnailUrl: insertReport.thumbnailUrl ?? null,
      tags: insertReport.tags ?? [],
      uploadedAt: insertReport.uploadedAt ?? now,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getClientReport(id: string): Promise<ClientReport | undefined> {
    const result = await db.select().from(clientReports).where(eq(clientReports.id, id));
    return result[0];
  }

  async getClientReportsByCompanyId(companyId: string): Promise<ClientReport[]> {
    return db.select().from(clientReports).where(eq(clientReports.companyId, companyId));
  }

  async getAllClientReports(): Promise<ClientReport[]> {
    return db.select().from(clientReports);
  }

  async updateClientReport(id: string, updates: Partial<ClientReport>): Promise<void> {
    await db.update(clientReports).set({ ...updates, updatedAt: new Date() }).where(eq(clientReports.id, id));
  }

  async deleteClientReport(id: string): Promise<void> {
    await db.delete(clientReports).where(eq(clientReports.id, id));
  }

  async createBriefSubmission(insertBrief: InsertBriefSubmission): Promise<BriefSubmission> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(briefSubmissions).values({
      id,
      submittedByName: insertBrief.submittedByName,
      submittedByEmail: insertBrief.submittedByEmail,
      submittedByContact: insertBrief.submittedByContact ?? null,
      companyId: insertBrief.companyId ?? null,
      companyName: insertBrief.companyName,
      companyBrand: insertBrief.companyBrand ?? null,
      studyType: insertBrief.studyType,
      numIdeas: insertBrief.numIdeas ?? 1,
      researchObjective: insertBrief.researchObjective,
      regions: insertBrief.regions ?? [],
      ages: insertBrief.ages ?? [],
      genders: insertBrief.genders ?? [],
      incomes: insertBrief.incomes ?? [],
      industry: insertBrief.industry ?? null,
      competitors: insertBrief.competitors ?? [],
      projectFileUrls: insertBrief.projectFileUrls ?? [],
      files: insertBrief.files ?? [],
      concepts: insertBrief.concepts ?? [],
      paymentMethod: insertBrief.paymentMethod ?? "online",
      basicCreditsUsed: insertBrief.basicCreditsUsed ?? 0,
      proCreditsUsed: insertBrief.proCreditsUsed ?? 0,
      status: insertBrief.status ?? "new",
      notes: insertBrief.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getBriefSubmission(id: string): Promise<BriefSubmission | undefined> {
    const result = await db.select().from(briefSubmissions).where(eq(briefSubmissions.id, id));
    return result[0];
  }

  async getBriefSubmissionsByEmail(email: string): Promise<BriefSubmission[]> {
    return db.select().from(briefSubmissions).where(eq(briefSubmissions.submittedByEmail, email));
  }

  async getBriefSubmissionsByCompanyId(companyId: string): Promise<BriefSubmission[]> {
    return db.select().from(briefSubmissions).where(eq(briefSubmissions.companyId, companyId));
  }

  async getAllBriefSubmissions(): Promise<BriefSubmission[]> {
    return db.select().from(briefSubmissions);
  }

  async updateBriefSubmission(id: string, updates: Partial<BriefSubmission>): Promise<void> {
    await db.update(briefSubmissions).set({ ...updates, updatedAt: new Date() }).where(eq(briefSubmissions.id, id));
  }

  async createStudy(insertStudy: InsertStudy): Promise<Study> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(studies).values({
      id,
      companyId: insertStudy.companyId ?? null,
      companyName: insertStudy.companyName,
      briefId: insertStudy.briefId ?? null,
      clientReportId: insertStudy.clientReportId ?? null,
      title: insertStudy.title,
      description: insertStudy.description ?? null,
      studyType: insertStudy.studyType,
      isTest24: insertStudy.isTest24 ?? true,
      tags: insertStudy.tags ?? [],
      status: insertStudy.status ?? "NEW",
      statusUpdatedAt: now,
      reportUrl: insertStudy.reportUrl ?? null,
      deliveryDate: insertStudy.deliveryDate ?? null,
      submittedByEmail: insertStudy.submittedByEmail,
      submittedByName: insertStudy.submittedByName ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async getStudy(id: string): Promise<Study | undefined> {
    const result = await db.select().from(studies).where(eq(studies.id, id));
    return result[0];
  }

  async getStudyByBriefId(briefId: string): Promise<Study | undefined> {
    const result = await db.select().from(studies).where(eq(studies.briefId, briefId));
    return result[0];
  }

  async getStudiesByCompanyId(companyId: string): Promise<Study[]> {
    return db.select().from(studies).where(eq(studies.companyId, companyId));
  }

  async getStudiesByEmail(email: string): Promise<Study[]> {
    return db.select().from(studies).where(eq(studies.submittedByEmail, email));
  }

  async getAllStudies(): Promise<Study[]> {
    return db.select().from(studies);
  }

  async updateStudy(id: string, updates: Partial<Study>): Promise<void> {
    await db.update(studies).set({ ...updates, updatedAt: new Date() }).where(eq(studies.id, id));
  }

  async updateStudyStatus(id: string, status: StudyStatus): Promise<Study | undefined> {
    const now = new Date();
    const result = await db.update(studies).set({
      status,
      statusUpdatedAt: now,
      updatedAt: now,
    }).where(eq(studies.id, id)).returning();
    return result[0];
  }

  async createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(passwordResets).values({
      id,
      userId: reset.userId,
      tokenHash: reset.tokenHash,
      expiresAt: reset.expiresAt,
      usedAt: null,
      createdAt: now,
    }).returning();
    return result[0];
  }

  async getPasswordResetByTokenHash(tokenHash: string): Promise<PasswordReset | undefined> {
    const result = await db.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHash));
    return result[0];
  }

  async markPasswordResetUsed(id: string): Promise<void> {
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, id));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(sessions).values({
      id,
      userId: session.userId,
      companyId: session.companyId ?? null,
      tokenHash: session.tokenHash,
      ipAddress: session.ipAddress ?? null,
      userAgent: session.userAgent ?? null,
      expiresAt: session.expiresAt,
      createdAt: now,
      lastActiveAt: now,
    }).returning();
    return result[0];
  }

  async getSessionByTokenHash(tokenHash: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash));
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async createCreditLedgerEntry(entry: InsertCreditLedger): Promise<CreditLedgerEntry> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(creditLedger).values({
      id,
      companyId: entry.companyId,
      userId: entry.userId ?? null,
      creditType: entry.creditType,
      transactionType: entry.transactionType,
      amount: entry.amount,
      balanceAfter: entry.balanceAfter,
      description: entry.description ?? null,
      orderId: entry.orderId ?? null,
      briefId: entry.briefId ?? null,
      metadata: entry.metadata ?? null,
      createdAt: now,
    }).returning();
    return result[0];
  }

  async getCreditLedgerByCompanyId(companyId: string): Promise<CreditLedgerEntry[]> {
    return db.select().from(creditLedger).where(eq(creditLedger.companyId, companyId));
  }

  async getCompanyCreditBalance(companyId: string, creditType: 'basic' | 'pro'): Promise<number> {
    const entries = await this.getCreditLedgerByCompanyId(companyId);
    const filtered = entries.filter(e => e.creditType === creditType);
    if (filtered.length === 0) return 0;
    const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted[0].balanceAfter;
  }
}

const databaseStorage = new DatabaseStorage();
databaseStorage.seedDatabase().catch(console.error);

export const storage = databaseStorage;
