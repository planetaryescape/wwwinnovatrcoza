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
  type ReportEvent,
  type InsertReportEvent,
  type ReportLastViewed,
  type InsertReportLastViewed,
  type ReportRequest,
  type InsertReportRequest,
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
  reportEvents,
  reportLastViewed,
  reportRequests,
} from "@shared/schema";
import { eq, and, lte, gte, desc, sql } from "drizzle-orm";
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
  deleteReport(id: string): Promise<void>;
  processScheduledReports(): Promise<{ published: number; unpublished: number }>;

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
  deleteBriefSubmission(id: string): Promise<void>;

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
  
  // Report Analytics
  createReportEvent(event: InsertReportEvent): Promise<ReportEvent>;
  getReportEvents(reportId: string, options?: { eventType?: string; startDate?: Date; endDate?: Date }): Promise<ReportEvent[]>;
  getReportAnalytics(reportId: string, range: 'today' | '30d' | '12m'): Promise<{
    totalViews: number;
    memberViews: number;
    guestViews: number;
    totalDownloads: number;
    memberDownloads: number;
    guestDownloads: number;
  }>;
  upsertReportLastViewed(data: { reportId: string; userId: string; userName?: string; userEmail?: string; memberTier?: string; companyName?: string }): Promise<ReportLastViewed>;
  getReportViewers(reportId: string): Promise<ReportLastViewed[]>;
  getGlobalReportEngagement(): Promise<{
    totalViews: number;
    totalDownloads: number;
    viewsThisMonth: number;
    downloadsThisMonth: number;
    mostPopularReport: { id: string; title: string; views: number } | null;
  }>;
  
  // User Activity Stats
  getUserReportDownloadCount(userId: string): Promise<number>;

  // Report Requests
  createReportRequest(request: InsertReportRequest): Promise<ReportRequest>;
  getReportRequest(id: string): Promise<ReportRequest | undefined>;
  getAllReportRequests(): Promise<ReportRequest[]>;
  updateReportRequest(id: string, updates: Partial<ReportRequest>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  
  async seedDatabase(): Promise<void> {
    const existingCompanies = await this.getAllCompanies();
    if (existingCompanies.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with initial data...");

    // Generate company IDs
    const innovatrId = randomUUID();
    const ruganiId = randomUUID();
    const greenwayId = randomUUID();
    const nandosId = randomUUID();
    const dgbId = randomUUID();
    const revlonId = randomUUID();
    const mitchumId = randomUUID();
    const elizabethArdenId = randomUUID();

    // Create all companies per specification
    const companiesData = [
      {
        id: innovatrId,
        name: "Innovatr",
        domain: "innovatr.co.za",
        industry: "Market Research",
        tier: "SCALE",
        basicCreditsTotal: 25,
        basicCreditsUsed: 0,
        proCreditsTotal: 4,
        proCreditsUsed: 0,
        notes: "Internal Innovatr team - admin access",
      },
      {
        id: ruganiId,
        name: "Rugani Juice",
        domain: "ruganijuice.co.za",
        industry: "Beverages",
        tier: "GROWTH",
        contractStart: new Date("2025-12-01"),
        contractEnd: new Date("2026-11-30"),
        basicCreditsTotal: 10,
        basicCreditsUsed: 2,
        proCreditsTotal: 2,
        proCreditsUsed: 0,
        notes: "Parent company: Greenway Farms. Has 2 client reports. Originally 10 Basic, 2 Pro - used 2 Basic.",
      },
      {
        id: greenwayId,
        name: "Greenway Farms",
        domain: "greenwayfarm.co.za",
        industry: "Agriculture",
        tier: "GROWTH",
        contractStart: new Date("2025-12-01"),
        contractEnd: new Date("2026-11-30"),
        basicCreditsTotal: 10,
        basicCreditsUsed: 0,
        proCreditsTotal: 2,
        proCreditsUsed: 0,
        notes: "Parent group includes Rugani Juice. Scale report access.",
      },
      {
        id: nandosId,
        name: "Nando's South Africa",
        domain: "nandos.co.za",
        industry: "Quick Service Restaurant",
        tier: "GROWTH",
        basicCreditsTotal: 5,
        basicCreditsUsed: 5,
        proCreditsTotal: 0,
        proCreditsUsed: 0,
        notes: "Used all 5 Basic credits on one Test24 Basic project. 1 active study ongoing.",
      },
      {
        id: dgbId,
        name: "DGB",
        domain: "dgb.co.za",
        industry: "Wine & Spirits",
        tier: "STARTER",
        basicCreditsTotal: 1,
        basicCreditsUsed: 1,
        proCreditsTotal: 0,
        proCreditsUsed: 0,
        notes: "Durbanville Hills pilot project. 1 completed Test24 Basic report.",
      },
      {
        id: revlonId,
        name: "Revlon",
        domain: "revlon.com",
        industry: "Beauty & Cosmetics",
        tier: "SCALE",
        basicCreditsTotal: 0,
        basicCreditsUsed: 0,
        proCreditsTotal: 0,
        proCreditsUsed: 0,
        notes: "Scale company. No contacts or reports yet.",
      },
      {
        id: mitchumId,
        name: "Mitchum",
        domain: "mitchum.com",
        industry: "Personal Care",
        tier: "SCALE",
        basicCreditsTotal: 0,
        basicCreditsUsed: 0,
        proCreditsTotal: 0,
        proCreditsUsed: 0,
        notes: "Scale company. No contacts or reports yet.",
      },
      {
        id: elizabethArdenId,
        name: "Elizabeth Arden",
        domain: "elizabetharden.com",
        industry: "Beauty & Cosmetics",
        tier: "SCALE",
        basicCreditsTotal: 0,
        basicCreditsUsed: 0,
        proCreditsTotal: 0,
        proCreditsUsed: 0,
        notes: "Scale company. No contacts or reports yet.",
      },
    ];

    for (const c of companiesData) {
      await db.insert(companies).values({
        id: c.id,
        name: c.name,
        domain: c.domain,
        logoUrl: null,
        industry: c.industry,
        tier: c.tier,
        contractStart: (c as any).contractStart || null,
        contractEnd: (c as any).contractEnd || null,
        monthlyFee: null,
        basicCreditsTotal: c.basicCreditsTotal,
        basicCreditsUsed: c.basicCreditsUsed,
        proCreditsTotal: c.proCreditsTotal,
        proCreditsUsed: c.proCreditsUsed,
        dealDetails: null,
        notes: c.notes,
      });
    }

    const tempPasswordHash = await hashPassword("TempPass123!");
    const adminPasswordHash = await hashPassword("Innovatr@Admin!");

    // Admin users - Innovatr
    const adminUsersData = [
      { name: "HannaH Steven", email: "hannah@innovatr.co.za", username: "hannah.steven", passwordHash: adminPasswordHash },
      { name: "Richard Lawrence", email: "richard@innovatr.co.za", username: "richard.lawrence", passwordHash: adminPasswordHash },
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
        creditsBasic: 0,
        creditsPro: 0,
        creditsInheritedFromCompany: true,
        totalSpend: "0",
        isActive: true,
        emailVerified: true,
      });
    }

    // Nando's user - Simone Kakana
    const simoneId = randomUUID();
    await db.insert(users).values({
      id: simoneId,
      username: "simone.kakana",
      email: "simone.kakana@nandos.co.za",
      password: "",
      passwordHash: tempPasswordHash,
      name: "Simone Kakana",
      company: "Nando's South Africa",
      companyId: nandosId,
      membershipTier: "GROWTH",
      status: "ACTIVE",
      role: "MEMBER",
      creditsBasic: 0,
      creditsPro: 0,
      creditsInheritedFromCompany: true,
      totalSpend: "0",
      isActive: true,
      emailVerified: true,
    });

    // Rugani users - Tymon and Simonne
    const tymonId = randomUUID();
    await db.insert(users).values({
      id: tymonId,
      username: "tymon",
      email: "tymon@rugani.co.za",
      password: "",
      passwordHash: tempPasswordHash,
      name: "Tymon",
      company: "Rugani Juice",
      companyId: ruganiId,
      membershipTier: "GROWTH",
      status: "ACTIVE",
      role: "MEMBER",
      creditsBasic: 0,
      creditsPro: 0,
      creditsInheritedFromCompany: true,
      totalSpend: "0",
      isActive: true,
      emailVerified: true,
    });

    const simonneId = randomUUID();
    await db.insert(users).values({
      id: simonneId,
      username: "simonne",
      email: "simonne@rugani.co.za",
      password: "",
      passwordHash: tempPasswordHash,
      name: "Simonne",
      company: "Rugani Juice",
      companyId: ruganiId,
      membershipTier: "GROWTH",
      status: "ACTIVE",
      role: "MEMBER",
      creditsBasic: 0,
      creditsPro: 0,
      creditsInheritedFromCompany: true,
      totalSpend: "0",
      isActive: true,
      emailVerified: true,
    });

    // Greenway users
    const greenwayUsersData = [
      { name: "Duncan Buhr", email: "duncan@greenwayfarm.co.za", username: "duncan.buhr" },
      { name: "Wesley Browne", email: "Wesley@greenwayfarm.co.za", username: "wesley.browne" },
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
        membershipTier: "GROWTH",
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

    // Create Test24 Studies
    // Nando's Menu Test - Test24 Basic (active)
    const nandosStudyId = randomUUID();
    await db.insert(studies).values({
      id: nandosStudyId,
      companyId: nandosId,
      companyName: "Nando's South Africa",
      title: "Nando's Menu Test",
      description: "Testing new menu items with 5 concepts for consumer feedback.",
      studyType: "basic",
      isTest24: true,
      status: "AUDIENCE_LIVE",
      submittedByEmail: "simone.kakana@nandos.co.za",
      submittedByName: "Simone Kakana",
      tags: ["Menu", "QSR", "Test24 Basic"],
    });

    // Rugani Study 1 - Clicks Wellness (completed) - Test24 Pro
    const ruganiStudy1Id = randomUUID();
    await db.insert(studies).values({
      id: ruganiStudy1Id,
      companyId: ruganiId,
      companyName: "Rugani Juice",
      title: "Rugani x Clicks Wellness Beverage Positioning",
      description: "Quant deep dive into how Rugani's formats perform against competitors in Clicks.",
      studyType: "pro",
      isTest24: true,
      status: "COMPLETED",
      submittedByEmail: "tymon@rugani.co.za",
      submittedByName: "Tymon",
      tags: ["Beverages", "Retail", "Test24 Pro"],
      deliveryDate: new Date("2025-11-07"),
    });

    // Rugani Study 2 - Key Visual (completed) - Test24 Pro
    const ruganiStudy2Id = randomUUID();
    await db.insert(studies).values({
      id: ruganiStudy2Id,
      companyId: ruganiId,
      companyName: "Rugani Juice",
      title: "Rugani New Key Visual Optimisation",
      description: "Evaluation of Rugani's new key visual against competitors.",
      studyType: "pro",
      isTest24: true,
      status: "COMPLETED",
      submittedByEmail: "tymon@rugani.co.za",
      submittedByName: "Tymon",
      tags: ["Creative Testing", "Key Visual", "Test24 Pro"],
      deliveryDate: new Date("2025-11-07"),
    });

    // DGB Pilot Study (completed)
    const dgbStudyId = randomUUID();
    await db.insert(studies).values({
      id: dgbStudyId,
      companyId: dgbId,
      companyName: "DGB",
      title: "Durbanville Hills Test24 Basic Pilot",
      description: "Pilot Test24 Basic project for Durbanville Hills wine brand.",
      studyType: "basic",
      isTest24: true,
      status: "COMPLETED",
      submittedByEmail: "pilot@dgb.co.za",
      submittedByName: "DGB Team",
      tags: ["Wine", "Pilot", "Test24 Basic"],
      deliveryDate: new Date("2025-10-15"),
    });

    // Create Brief Submissions
    // Simone Kakana - Nando's - Test24 Basic - 5 ideas - Completed
    const nandosBriefId = randomUUID();
    await db.insert(briefSubmissions).values({
      id: nandosBriefId,
      submittedByName: "Simone Kakana",
      submittedByEmail: "simone.kakana@nandos.co.za",
      companyId: nandosId,
      companyName: "Nando's South Africa",
      studyType: "test24_basic",
      numIdeas: 5,
      researchObjective: "Test new menu items for consumer appeal and purchase intent.",
      regions: ["Gauteng", "Western Cape", "KwaZulu-Natal"],
      ages: ["18-24", "25-34", "35-44"],
      genders: ["Male", "Female"],
      industry: "Quick Service Restaurant",
      paymentMethod: "credits",
      basicCreditsUsed: 5,
      status: "completed",
    });

    // Tymon - Rugani - Test24 Basic - 2 ideas - In Progress
    const ruganiBriefId = randomUUID();
    await db.insert(briefSubmissions).values({
      id: ruganiBriefId,
      submittedByName: "Tymon",
      submittedByEmail: "tymon@rugani.co.za",
      companyId: ruganiId,
      companyName: "Rugani Juice",
      studyType: "test24_basic",
      numIdeas: 2,
      researchObjective: "Test new packaging concepts for juice range.",
      regions: ["Gauteng", "Western Cape"],
      ages: ["25-34", "35-44", "45-54"],
      genders: ["Male", "Female"],
      industry: "Beverages",
      paymentMethod: "credits",
      basicCreditsUsed: 2,
      status: "in_progress",
    });

    // Create Orders
    // Nando's membership order
    const nandosOrderId = randomUUID();
    await db.insert(orders).values({
      id: nandosOrderId,
      userId: simoneId,
      amount: "45000",
      currency: "ZAR",
      purchaseType: "Growth Membership",
      status: "completed",
      customerName: "Simone Kakana",
      customerEmail: "simone.kakana@nandos.co.za",
      customerCompany: "Nando's South Africa",
    });

    await db.insert(orderItems).values({
      id: randomUUID(),
      orderId: nandosOrderId,
      type: "membership",
      description: "Nando's South Africa – Growth Membership (includes 5 Test24 Basic credits)",
      quantity: 1,
      unitAmount: "45000",
    });

    // DGB pilot order
    const dgbOrderId = randomUUID();
    await db.insert(orders).values({
      id: dgbOrderId,
      amount: "4000",
      currency: "ZAR",
      purchaseType: "Test24 Basic Pilot",
      status: "completed",
      customerName: "DGB Team",
      customerEmail: "pilot@dgb.co.za",
      customerCompany: "DGB",
    });

    await db.insert(orderItems).values({
      id: randomUUID(),
      orderId: dgbOrderId,
      type: "test24_basic",
      description: "DGB – Test24 Basic Pilot",
      quantity: 1,
      unitAmount: "4000",
    });

    // Create Client Reports
    // Rugani's 2 reports - Test24 Pro
    await db.insert(clientReports).values({
      id: randomUUID(),
      companyId: ruganiId,
      title: "Rugani x Clicks Wellness Beverage Positioning",
      description: "Quant deep dive into how Rugani's 330 ml and 750 ml formats perform against LiquiFruit, Coke, Powerade and Red Bull in Clicks.",
      pdfUrl: "/assets/client-reports/rugani/Rugani_X_Clicks_Test24_Pro.pptx",
      tags: ["Rugani", "Clicks", "Test24 Pro", "Retail Positioning", "Beverages"],
      uploadedAt: new Date("2025-11-07"),
    });

    await db.insert(clientReports).values({
      id: randomUUID(),
      companyId: ruganiId,
      title: "Rugani New Key Visual Optimisation",
      description: "Evaluation of Rugani's new key visual against Sir Fruit, LiquiFruit and Rhodes among heavy juice users.",
      pdfUrl: "/assets/client-reports/rugani/Rugani_Test24_X_Ad_Campaign.pptx",
      tags: ["Rugani", "Creative Testing", "Key Visual", "Test24 Pro"],
      uploadedAt: new Date("2025-11-07"),
    });

    // Nando's live report
    await db.insert(clientReports).values({
      id: randomUUID(),
      companyId: nandosId,
      title: "Nando's Menu Innovation Study - Live Results",
      description: "Ongoing Test24 Basic study tracking consumer response to new menu concepts. Results updating in real-time.",
      pdfUrl: null,
      tags: ["Nando's", "Menu", "Test24 Basic", "Live", "QSR"],
      uploadedAt: new Date("2025-12-01"),
    });

    // DGB pilot report
    await db.insert(clientReports).values({
      id: randomUUID(),
      companyId: dgbId,
      title: "Innovatr x Durbanville Hills Test24 Basic Report",
      description: "Completed pilot Test24 Basic study for Durbanville Hills wine brand under DGB.",
      pdfUrl: "/assets/client-reports/dgb/Durbanville_Hills_Test24_Basic.pptx",
      tags: ["DGB", "Durbanville Hills", "Wine", "Test24 Basic", "Pilot"],
      uploadedAt: new Date("2025-10-15"),
    });

    // Create deals
    await db.insert(deals).values({
      id: randomUUID(),
      title: "Rugani & Greenway Service Agreement",
      description: "Annual service agreement for Rugani Juice and Greenway Farms.",
      originalPrice: "630000",
      discountedPrice: "315000",
      creditsIncluded: 26,
      targetTierKeys: ["GROWTH", "SCALE"],
      createdByUserId: "system",
      validFrom: new Date("2025-12-01"),
      validTo: new Date("2026-11-30"),
      isActive: true,
    });

    // Seed Reports (Trends & Insights Library)
    const reportsData = [
      {
        title: "Fairness Is the New Flex",
        slug: "fairness-is-the-new-flex",
        category: "IRL",
        industry: "Services",
        date: new Date("2025-08-01"),
        teaser: "Fairness has become a quiet form of currency in South Africa. People want brands that make sense, speak simply and treat them with respect.",
        topics: ["Fairness", "Trust", "Consumer Behaviour", "Transparency"],
        pdfUrl: "/api/files/reports/fairness-is-the-new-flex.pdf",
        thumbnailUrl: "/assets/covers/irl-cover.png",
        accessLevel: "STARTER",
        status: "published",
      },
      {
        title: "Banking Monogamy Is Dead",
        slug: "banking-monogamy-is-dead",
        category: "Insights",
        industry: "Banking",
        date: new Date("2025-08-12"),
        teaser: "Loyalty in banking is fading fast and South Africans are mixing, matching and experimenting across platforms.",
        topics: ["Financial Services", "Consumer Loyalty", "Digital Banking"],
        pdfUrl: "/api/files/reports/banking-monogamy-is-dead.pdf",
        thumbnailUrl: "/assets/covers/insights-cover.png",
        accessLevel: "STARTER",
        status: "published",
      },
      {
        title: "Cadbury Pocket-Sized Joy",
        slug: "cadbury-pocket-sized-joy",
        category: "Launch",
        industry: "FMCG",
        date: new Date("2025-08-19"),
        teaser: "Cadbury is shrinking the moment but not the joy. South Africans are embracing small format treats that feel playful, affordable and instantly rewarding.",
        topics: ["Confectionery", "Format Innovation", "Micro Indulgence"],
        pdfUrl: "/api/files/reports/cadbury-pocket-sized-joy.pdf",
        thumbnailUrl: "/assets/covers/launch-cover.png",
        accessLevel: "PUBLIC",
        status: "published",
      },
      {
        title: "Innovatr Inside: AI Qual",
        slug: "ai-qual",
        category: "Inside",
        industry: "Services",
        date: new Date("2025-08-01"),
        teaser: "AI Qual is our new way of hearing the unfiltered voice of your audience. It turns hours of reading into moments of clarity.",
        topics: ["AI Qual", "Qualitative Research", "Innovatr Tools"],
        pdfUrl: null,
        thumbnailUrl: "/assets/covers/inside-cover.png",
        accessLevel: "PUBLIC",
        status: "published",
      },
      {
        title: "Believability Is the New Branding",
        slug: "believability-is-the-new-branding",
        category: "IRL",
        industry: "FMCG",
        date: new Date("2025-09-02"),
        teaser: "People are tired of polished perfection. They want brands that feel real and honest, not overly staged.",
        topics: ["Believability", "Trust", "Authenticity", "Brand Strategy"],
        pdfUrl: "/api/files/reports/believability-is-the-new-branding.pdf",
        thumbnailUrl: "/assets/covers/irl-cover.png",
        accessLevel: "STARTER",
        status: "published",
      },
      {
        title: "The New Non-Negotiable Treat",
        slug: "the-new-non-negotiable-treat",
        category: "Insights",
        industry: "FMCG",
        date: new Date("2025-09-09"),
        teaser: "South Africans refuse to cut back on the small thing that makes their day feel better.",
        topics: ["FMCG", "Snacking", "Consumer Behaviour", "Emotional Economy"],
        pdfUrl: "/api/files/reports/cutting-back-but-not-on-snacks.pdf",
        thumbnailUrl: "/assets/covers/insights-cover.png",
        accessLevel: "STARTER",
        status: "published",
      },
      {
        title: "The Oat-Based Breakfast Revolution",
        slug: "oat-based-breakfast-revolution",
        category: "Launch",
        industry: "Food",
        date: new Date("2025-09-16"),
        teaser: "Oat based breakfasts are rising fast as people look for clean energy, slow release fullness and easy versatility.",
        topics: ["Launch", "Functional Food", "Breakfast", "Beverages"],
        pdfUrl: "/api/files/reports/the-oat-based-breakfast-revolution.pdf",
        thumbnailUrl: "/assets/covers/launch-cover.png",
        accessLevel: "PUBLIC",
        status: "published",
      },
      {
        title: "Innovatr Inside: Storyteller",
        slug: "storyteller",
        category: "Inside",
        industry: "Services",
        date: new Date("2025-08-01"),
        teaser: "Storyteller transforms raw data into something people actually want to read. It turns charts into insight, patterns into meaning.",
        topics: ["Storyteller", "Insight Communication", "Data Storytelling"],
        pdfUrl: null,
        thumbnailUrl: "/assets/covers/inside-cover.png",
        accessLevel: "PUBLIC",
        status: "published",
      },
    ];

    for (const r of reportsData) {
      await db.insert(reports).values({
        id: randomUUID(),
        title: r.title,
        slug: r.slug,
        category: r.category,
        industry: r.industry,
        date: r.date,
        teaser: r.teaser,
        topics: r.topics,
        pdfUrl: r.pdfUrl,
        thumbnailUrl: r.thumbnailUrl,
        accessLevel: r.accessLevel,
        status: r.status,
        isFeatured: false,
        isArchived: false,
      });
    }

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
        industry: (insertUser as any).industry ?? null,
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
      industryTag: insertReport.industryTag ?? null,
      themeTags: insertReport.themeTags ?? [],
      methodTags: insertReport.methodTags ?? [],
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

  async deleteReport(id: string): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async processScheduledReports(): Promise<{ published: number; unpublished: number }> {
    const now = new Date();
    let publishedCount = 0;
    let unpublishedCount = 0;

    // Find reports that are scheduled and should be published
    const scheduledReports = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.status, "scheduled"),
          lte(reports.publishAt, now)
        )
      );

    // Publish scheduled reports
    for (const report of scheduledReports) {
      await db
        .update(reports)
        .set({ status: "published", updatedAt: now })
        .where(eq(reports.id, report.id));
      publishedCount++;
    }

    // Find reports that are published and should be unpublished
    const toUnpublishReports = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.status, "published"),
          lte(reports.unpublishAt, now)
        )
      );

    // Unpublish reports that have passed their unpublish date
    for (const report of toUnpublishReports) {
      await db
        .update(reports)
        .set({ status: "archived", updatedAt: now })
        .where(eq(reports.id, report.id));
      unpublishedCount++;
    }

    return { published: publishedCount, unpublished: unpublishedCount };
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
      studyType: insertReport.studyType ?? "Test24 Basic",
      industry: insertReport.industry ?? null,
      status: insertReport.status ?? "Completed",
      deliveredAt: insertReport.deliveredAt ? new Date(insertReport.deliveredAt) : null,
      primaryContactEmail: insertReport.primaryContactEmail ?? null,
      pdfUrl: insertReport.pdfUrl ?? null,
      dashboardUrl: insertReport.dashboardUrl ?? null,
      upsiideUrl: insertReport.upsiideUrl ?? null,
      thumbnailUrl: insertReport.thumbnailUrl ?? null,
      tags: insertReport.tags ?? [],
      // Structured metadata fields
      topIdeaLabel: insertReport.topIdeaLabel ?? null,
      topIdeaIdeaScore: insertReport.topIdeaIdeaScore ?? null,
      topIdeaInterest: insertReport.topIdeaInterest ?? null,
      topIdeaCommitment: insertReport.topIdeaCommitment ?? null,
      lowestIdeaLabel: insertReport.lowestIdeaLabel ?? null,
      lowestIdeaIdeaScore: insertReport.lowestIdeaIdeaScore ?? null,
      lowestIdeaInterest: insertReport.lowestIdeaInterest ?? null,
      lowestIdeaCommitment: insertReport.lowestIdeaCommitment ?? null,
      verbatim1: insertReport.verbatim1 ?? null,
      verbatim2: insertReport.verbatim2 ?? null,
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
      paymentStatus: insertBrief.paymentStatus ?? null,
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

  async deleteBriefSubmission(id: string): Promise<void> {
    await db.delete(briefSubmissions).where(eq(briefSubmissions.id, id));
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

  // Report Analytics Methods
  async createReportEvent(event: InsertReportEvent): Promise<ReportEvent> {
    const id = randomUUID();
    const result = await db.insert(reportEvents).values({
      id,
      reportId: event.reportId,
      userId: event.userId ?? null,
      sessionId: event.sessionId ?? null,
      eventType: event.eventType,
      actorType: event.actorType,
      memberTier: event.memberTier ?? null,
      metadata: event.metadata ?? null,
      occurredAt: event.occurredAt ?? new Date(),
    }).returning();
    return result[0];
  }

  async getReportEvents(reportId: string, options?: { eventType?: string; startDate?: Date; endDate?: Date }): Promise<ReportEvent[]> {
    let query = db.select().from(reportEvents).where(eq(reportEvents.reportId, reportId));
    
    const events = await query;
    
    // Filter in memory for flexibility
    let filtered = events;
    if (options?.eventType) {
      filtered = filtered.filter(e => e.eventType === options.eventType);
    }
    if (options?.startDate) {
      filtered = filtered.filter(e => new Date(e.occurredAt) >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(e => new Date(e.occurredAt) <= options.endDate!);
    }
    
    return filtered.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  async getReportAnalytics(reportId: string, range: 'today' | '30d' | '12m'): Promise<{
    totalViews: number;
    memberViews: number;
    guestViews: number;
    totalDownloads: number;
    memberDownloads: number;
    guestDownloads: number;
  }> {
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '12m':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    const events = await this.getReportEvents(reportId, { startDate });
    
    const views = events.filter(e => e.eventType === 'view');
    const downloads = events.filter(e => e.eventType === 'download');
    
    return {
      totalViews: views.length,
      memberViews: views.filter(e => e.actorType === 'member').length,
      guestViews: views.filter(e => e.actorType === 'guest').length,
      totalDownloads: downloads.length,
      memberDownloads: downloads.filter(e => e.actorType === 'member').length,
      guestDownloads: downloads.filter(e => e.actorType === 'guest').length,
    };
  }

  async upsertReportLastViewed(data: { reportId: string; userId: string; userName?: string; userEmail?: string; memberTier?: string; companyName?: string }): Promise<ReportLastViewed> {
    // Check if record exists
    const existing = await db.select().from(reportLastViewed)
      .where(and(
        eq(reportLastViewed.reportId, data.reportId),
        eq(reportLastViewed.userId, data.userId)
      ));
    
    if (existing.length > 0) {
      // Update existing record
      const result = await db.update(reportLastViewed)
        .set({
          userName: data.userName ?? existing[0].userName,
          userEmail: data.userEmail ?? existing[0].userEmail,
          memberTier: data.memberTier ?? existing[0].memberTier,
          companyName: data.companyName ?? existing[0].companyName,
          viewCount: existing[0].viewCount + 1,
          lastViewedAt: new Date(),
        })
        .where(eq(reportLastViewed.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new record
      const id = randomUUID();
      const now = new Date();
      const result = await db.insert(reportLastViewed).values({
        id,
        reportId: data.reportId,
        userId: data.userId,
        userName: data.userName ?? null,
        userEmail: data.userEmail ?? null,
        memberTier: data.memberTier ?? null,
        companyName: data.companyName ?? null,
        viewCount: 1,
        lastViewedAt: now,
        firstViewedAt: now,
      }).returning();
      return result[0];
    }
  }

  async getReportViewers(reportId: string): Promise<ReportLastViewed[]> {
    return db.select().from(reportLastViewed)
      .where(eq(reportLastViewed.reportId, reportId))
      .orderBy(desc(reportLastViewed.lastViewedAt));
  }

  async getGlobalReportEngagement(): Promise<{
    totalViews: number;
    totalDownloads: number;
    viewsThisMonth: number;
    downloadsThisMonth: number;
    mostPopularReport: { id: string; title: string; views: number } | null;
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all report events
    const allEvents = await db.select().from(reportEvents);
    
    // Calculate totals
    const totalViews = allEvents.filter(e => e.eventType === 'view').length;
    const totalDownloads = allEvents.filter(e => e.eventType === 'download').length;
    
    // Calculate this month's stats
    const viewsThisMonth = allEvents.filter(e => 
      e.eventType === 'view' && new Date(e.createdAt) >= monthStart
    ).length;
    const downloadsThisMonth = allEvents.filter(e => 
      e.eventType === 'download' && new Date(e.createdAt) >= monthStart
    ).length;
    
    // Find most popular report this month (by views)
    const thisMonthViews = allEvents.filter(e => 
      e.eventType === 'view' && new Date(e.createdAt) >= monthStart
    );
    
    const viewsByReport: Record<string, number> = {};
    thisMonthViews.forEach(e => {
      viewsByReport[e.reportId] = (viewsByReport[e.reportId] || 0) + 1;
    });
    
    let mostPopularReport: { id: string; title: string; views: number } | null = null;
    
    if (Object.keys(viewsByReport).length > 0) {
      const topReportId = Object.entries(viewsByReport)
        .sort((a, b) => b[1] - a[1])[0][0];
      const topViews = viewsByReport[topReportId];
      
      // Get report title
      const report = await this.getReport(topReportId);
      if (report) {
        mostPopularReport = {
          id: topReportId,
          title: report.title,
          views: topViews,
        };
      }
    }
    
    return {
      totalViews,
      totalDownloads,
      viewsThisMonth,
      downloadsThisMonth,
      mostPopularReport,
    };
  }
  
  async getUserReportDownloadCount(userId: string): Promise<number> {
    const downloads = await db
      .select()
      .from(reportEvents)
      .where(and(
        eq(reportEvents.userId, userId),
        eq(reportEvents.eventType, 'download')
      ));
    return downloads.length;
  }

  async createReportRequest(request: InsertReportRequest): Promise<ReportRequest> {
    const [created] = await db.insert(reportRequests).values(request).returning();
    return created;
  }

  async getReportRequest(id: string): Promise<ReportRequest | undefined> {
    const [request] = await db.select().from(reportRequests).where(eq(reportRequests.id, id));
    return request;
  }

  async getAllReportRequests(): Promise<ReportRequest[]> {
    return db.select().from(reportRequests).orderBy(desc(reportRequests.createdAt));
  }

  async updateReportRequest(id: string, updates: Partial<ReportRequest>): Promise<void> {
    await db.update(reportRequests).set({ ...updates, updatedAt: new Date() }).where(eq(reportRequests.id, id));
  }
}

const databaseStorage = new DatabaseStorage();
databaseStorage.seedDatabase().catch(console.error);

export const storage = databaseStorage;
