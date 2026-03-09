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
  type CaseStudy,
  type InsertCaseStudy,
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
  type ActivityEvent,
  type InsertActivityEvent,
  type InsightMailer,
  type InsertInsightMailer,
  type AdminPreferences,
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
  caseStudies,
  clientReports,
  inquiries,
  subscriptions,
  briefSubmissions,
  studies,
  reportEvents,
  reportLastViewed,
  reportRequests,
  activityEvents,
  insightMailers,
  adminPreferences,
} from "@shared/schema";
import { eq, and, lte, gte, desc, sql, or, inArray } from "drizzle-orm";
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
  deleteDeal(id: string): Promise<void>;

  getCaseStudies(): Promise<CaseStudy[]>;
  getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: string, updates: Partial<CaseStudy>): Promise<void>;
  deleteCaseStudy(id: string): Promise<void>;

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
  getGlobalReportEngagement(since?: Date): Promise<{
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

  // Activity Events
  createActivityEvent(event: InsertActivityEvent): Promise<ActivityEvent>;
  getActivityEventsByCompany(companyId: string, from: Date, to: Date): Promise<ActivityEvent[]>;
  getActivityEventsByUser(userId: string, from: Date, to: Date): Promise<ActivityEvent[]>;
  getActivityEventsSince(since: Date): Promise<ActivityEvent[]>;

  // Insight Mailers
  getAllInsightMailers(): Promise<InsightMailer[]>;
  getInsightMailer(id: string): Promise<InsightMailer | undefined>;
  createInsightMailer(mailer: InsertInsightMailer): Promise<InsightMailer>;
  updateInsightMailer(id: string, updates: Partial<InsightMailer>): Promise<void>;
  deleteInsightMailer(id: string): Promise<void>;
  getPulseSubscribersByIndustry(industry: string): Promise<{ email: string; name: string }[]>;

  // Admin Preferences
  getAdminPreferences(userId: string): Promise<AdminPreferences | undefined>;
  upsertAdminPreferences(userId: string, prefs: Partial<AdminPreferences>): Promise<AdminPreferences>;
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
        surname: (insertUser as any).surname ?? null,
        company: insertUser.company ?? null,
        industry: (insertUser as any).industry ?? null,
        referralSource: (insertUser as any).referralSource ?? null,
        wantsContact: (insertUser as any).wantsContact ?? false,
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
        pulseSubscribed: (insertUser as any).pulseSubscribed ?? true,
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

  async deleteDeal(id: string): Promise<void> {
    await db.delete(deals).where(eq(deals.id, id));
  }

  async getCaseStudies(): Promise<CaseStudy[]> {
    return db.select().from(caseStudies).orderBy(caseStudies.sortOrder);
  }

  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined> {
    const result = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug));
    return result[0];
  }

  async createCaseStudy(insertCs: InsertCaseStudy): Promise<CaseStudy> {
    const id = randomUUID();
    const now = new Date();
    const result = await db.insert(caseStudies).values({
      id,
      slug: insertCs.slug,
      client: insertCs.client,
      industry: insertCs.industry,
      headline: insertCs.headline,
      problemShort: insertCs.problemShort,
      problem: insertCs.problem,
      process: insertCs.process,
      results: insertCs.results,
      phases: insertCs.phases ?? [],
      duration: insertCs.duration,
      highlight: insertCs.highlight,
      bgColor: insertCs.bgColor ?? "#F5F5F5",
      gifAsset: insertCs.gifAsset ?? "default",
      sortOrder: insertCs.sortOrder ?? 0,
      isActive: insertCs.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return result[0];
  }

  async updateCaseStudy(id: string, updates: Partial<CaseStudy>): Promise<void> {
    await db.update(caseStudies).set({ ...updates, updatedAt: new Date() }).where(eq(caseStudies.id, id));
  }

  async deleteCaseStudy(id: string): Promise<void> {
    await db.delete(caseStudies).where(eq(caseStudies.id, id));
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

  async getGlobalReportEngagement(since?: Date): Promise<{
    totalViews: number;
    totalDownloads: number;
    viewsThisMonth: number;
    downloadsThisMonth: number;
    mostPopularReport: { id: string; title: string; views: number } | null;
  }> {
    const periodStart = since ?? new Date(0);

    const allEvents = await db.select().from(reportEvents);
    
    const totalViews = allEvents.filter(e => e.eventType === 'view').length;
    const totalDownloads = allEvents.filter(e => e.eventType === 'download').length;
    
    const periodEvents = allEvents.filter(e => new Date(e.createdAt) >= periodStart);
    const viewsThisMonth = periodEvents.filter(e => e.eventType === 'view').length;
    const downloadsThisMonth = periodEvents.filter(e => e.eventType === 'download').length;
    
    const periodViews = periodEvents.filter(e => e.eventType === 'view');
    const viewsByReport: Record<string, number> = {};
    periodViews.forEach(e => {
      viewsByReport[e.reportId] = (viewsByReport[e.reportId] || 0) + 1;
    });
    
    let mostPopularReport: { id: string; title: string; views: number } | null = null;
    
    if (Object.keys(viewsByReport).length > 0) {
      const topReportId = Object.entries(viewsByReport)
        .sort((a, b) => b[1] - a[1])[0][0];
      const topViews = viewsByReport[topReportId];
      const report = await this.getReport(topReportId);
      if (report) {
        mostPopularReport = { id: topReportId, title: report.title, views: topViews };
      }
    }
    
    return { totalViews, totalDownloads, viewsThisMonth, downloadsThisMonth, mostPopularReport };
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

  async createActivityEvent(event: InsertActivityEvent): Promise<ActivityEvent> {
    const id = randomUUID();
    const result = await db.insert(activityEvents).values({
      id,
      userId: event.userId,
      companyId: event.companyId ?? null,
      actionType: event.actionType,
      entityType: event.entityType ?? null,
      entityId: event.entityId ?? null,
      entityName: event.entityName ?? null,
      metadata: event.metadata ?? null,
      createdAt: new Date(),
    }).returning();
    return result[0];
  }

  async getActivityEventsByCompany(companyId: string, from: Date, to: Date): Promise<ActivityEvent[]> {
    // Fetch all user IDs belonging to this company so we can also catch events
    // that were stored with a null companyId (e.g. login events logged before the
    // user was assigned to a company, or early sessions).
    const companyUsers = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.companyId, companyId));
    const userIds = companyUsers.map(u => u.id);

    const timeFilter = and(
      gte(activityEvents.createdAt, from),
      lte(activityEvents.createdAt, to),
    );

    if (userIds.length === 0) {
      // No users in company — just use companyId filter
      return db.select().from(activityEvents)
        .where(and(eq(activityEvents.companyId, companyId), timeFilter!))
        .orderBy(desc(activityEvents.createdAt));
    }

    // Match by companyId OR by userId (handles events with null/missing companyId)
    return db.select().from(activityEvents)
      .where(and(
        or(
          eq(activityEvents.companyId, companyId),
          inArray(activityEvents.userId, userIds),
        ),
        timeFilter!,
      ))
      .orderBy(desc(activityEvents.createdAt));
  }

  async getActivityEventsByUser(userId: string, from: Date, to: Date): Promise<ActivityEvent[]> {
    return db.select().from(activityEvents)
      .where(and(
        eq(activityEvents.userId, userId),
        gte(activityEvents.createdAt, from),
        lte(activityEvents.createdAt, to),
      ))
      .orderBy(desc(activityEvents.createdAt));
  }

  async getActivityEventsSince(since: Date): Promise<ActivityEvent[]> {
    return db.select().from(activityEvents)
      .where(gte(activityEvents.createdAt, since))
      .orderBy(desc(activityEvents.createdAt));
  }

  async getAllInsightMailers(): Promise<InsightMailer[]> {
    return db.select().from(insightMailers).orderBy(insightMailers.scheduledDate);
  }

  async getInsightMailer(id: string): Promise<InsightMailer | undefined> {
    const results = await db.select().from(insightMailers).where(eq(insightMailers.id, id));
    return results[0];
  }

  async createInsightMailer(mailer: InsertInsightMailer): Promise<InsightMailer> {
    const [result] = await db.insert(insightMailers).values(mailer).returning();
    return result;
  }

  async updateInsightMailer(id: string, updates: Partial<InsightMailer>): Promise<void> {
    await db.update(insightMailers).set({ ...updates, updatedAt: new Date() }).where(eq(insightMailers.id, id));
  }

  async deleteInsightMailer(id: string): Promise<void> {
    await db.delete(insightMailers).where(eq(insightMailers.id, id));
  }

  async getPulseSubscribersByIndustry(industry: string): Promise<{ email: string; name: string }[]> {
    const allUsers = await db.select().from(users);
    const allCompanies = await db.select().from(companies);
    const companyMap = new Map(allCompanies.map((c) => [c.id, c]));
    const result: { email: string; name: string }[] = [];
    for (const u of allUsers) {
      if (!u.pulseSubscribed || !u.email) continue;
      const effectiveIndustry = u.pulseIndustry || (u.companyId ? companyMap.get(u.companyId)?.pulseIndustry : null);
      if (effectiveIndustry === industry) {
        result.push({ email: u.email, name: u.name || "" });
      }
    }
    return result;
  }

  async getAdminPreferences(userId: string): Promise<AdminPreferences | undefined> {
    const [prefs] = await db.select().from(adminPreferences).where(eq(adminPreferences.userId, userId));
    return prefs;
  }

  async upsertAdminPreferences(userId: string, prefs: Partial<AdminPreferences>): Promise<AdminPreferences> {
    const existing = await this.getAdminPreferences(userId);
    if (existing) {
      await db.update(adminPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(adminPreferences.userId, userId));
      const [updated] = await db.select().from(adminPreferences).where(eq(adminPreferences.userId, userId));
      return updated;
    } else {
      const [created] = await db.insert(adminPreferences)
        .values({
          userId,
          dailyDigest: prefs.dailyDigest ?? true,
          newOrderAlerts: prefs.newOrderAlerts ?? true,
          newUserAlerts: prefs.newUserAlerts ?? true,
          lowCreditAlerts: prefs.lowCreditAlerts ?? true,
        })
        .returning();
      return created;
    }
  }
}

const databaseStorage = new DatabaseStorage();
databaseStorage.seedDatabase().catch(console.error);

async function seedInsightMailers() {
  const existing = await databaseStorage.getAllInsightMailers();
  if (existing.length > 0) return;

  console.log("Seeding insight mailers...");

  const mailerData: InsertInsightMailer[] = [
    {
      mailerNumber: 1,
      month: "March",
      scheduledDate: new Date("2026-03-26T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Predictive Modelling",
      subjectLine: 'Why "I Like It" Is a Dangerous Metric',
      previewText: "The difference between appeal and actual demand.",
      bodyContent: `Most ideas fail for one reason: They were liked but they weren't chosen. There's a massive difference. Traditional concept testing often asks people to rate ideas in isolation. On a scale. In theory. Without trade-offs. But markets are not rating exercises. They are competitive environments. People don't ask: "Do I like this?" They ask: "Which one do I choose instead of the others?" That is where predictive modelling changes the game.

When ideas compete head-to-head, you see: Substitution patterns. Demand shift. Who steals share. Who collapses under pressure. An idea can score well on appeal and still lose when real choice is introduced. That's why Innovatr focuses on behavioural competition, not opinion.

Learning takeaway: If your research doesn't simulate choice, it overestimates success. Before your next launch, ask one question: Have we tested preference or just politeness?

If you're running launches this year and want to know which concepts will actually convert in market, there's a reason ambitious brands run their ideas through predictive testing first. It's not about being thorough. It's about being right.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 2,
      month: "July",
      scheduledDate: new Date("2026-07-30T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Data Storytelling",
      subjectLine: "Insights Don't Win Meetings. Stories Do.",
      previewText: "How Innovatr turns data into decisions.",
      bodyContent: `Data doesn't persuade. Clarity does. Modern research shouldn't end in a spreadsheet or a 70 slide download nobody reads. It should move people. At Innovatr, we translate behavioural data into structured narratives: what changed, why it matters, what to do next. Our reporting engine transforms patterns into strategic direction. Not just results. Direction. Because insight without action is noise. The best decisions happen when everyone in the room understands where the opportunity is, what the risk is, and what move makes sense.

Learning takeaway: Faster alignment. Stronger confidence. Less debate theatre. If your last study didn't move thinking in the room, the storytelling probably needs work.

The brands we work with often tell us the same thing: They didn't realise how much time they were losing translating research into strategy. When insight and narrative work together, that conversation changes. If you'd like to see how your next study could land differently in the room, we're here for that conversation.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 3,
      month: "May",
      scheduledDate: new Date("2026-05-29T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Concept Testing Mistakes",
      subjectLine: "Not All Concept Tests Are Equal",
      previewText: "Why most concept tests overestimate success.",
      bodyContent: `Concept testing has a reputation problem. Too often it becomes validation theatre. Run a survey. Get decent scores. Move on. But great concept testing should do more than confirm what you hope is true.

Here are five common mistakes that distort results: Testing in isolation (consumers don't buy in a vacuum). Overloading the concept (people can't process what matters). Measuring "liking" instead of strength (liking is emotional warmth, strength is purchase intent under pressure). Ignoring clarity (an unclear idea can test badly even if the core proposition is strong). Treating scores as absolute (scores only make sense in comparison).

At Innovatr, we design tests to measure appeal, clarity, differentiation, competitive performance, and emotional response. Because good testing reduces commercial uncertainty.

Learning takeaway: A concept test should tell you what to fix, not just whether to proceed. If your last test didn't change your thinking, it wasn't designed properly.

The teams that get the most value from testing are the ones asking the hardest questions upfront. When you know what you actually need to learn, the test design changes. If you're planning a launch and want to start with the right test questions, let's talk about what you're really trying to figure out.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 4,
      month: "September",
      scheduledDate: new Date("2026-09-24T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "AI in Innovation",
      subjectLine: "AI Is Powerful. But It's Not Strategy.",
      previewText: "How to use AI without outsourcing your thinking.",
      bodyContent: `AI is extraordinary at pattern detection, theme clustering, speed, and draft generation. It is not extraordinary at context, cultural nuance, commercial judgement, and portfolio strategy. That's where teams get confused. AI can surface thousands of open-ended themes in minutes. But deciding which tension matters commercially? That's human work. At Innovatr, AI accelerates analysis but strategic framing still happens at the expert level. The danger is not using AI. The danger is mistaking automation for insight.

Learning takeaway: Use AI to expand visibility. Use expertise to decide direction. The future is not human versus AI. It is human plus AI.

The most interesting question isn't whether to use AI in research. It's how to use it in a way that actually makes your team smarter, not just faster. If you're curious about what good AI integration looks like in practice, we've got case studies that show the difference between speed and strategy.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 5,
      month: "April",
      scheduledDate: new Date("2026-04-30T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Agile Research Advantage",
      subjectLine: "Why Waiting Six Weeks Is No Longer Acceptable",
      previewText: "Research built for modern decision speed.",
      bodyContent: `Traditional research was built for a slower world. Today, decisions move at the speed of WhatsApp. Research should too. Agile research means shorter cycles, iterative learning, live optimisation, and clear outputs. At Innovatr, our studies are structured to give you answers quickly without compromising rigour. You test. You learn. You refine. You move. No bottlenecks. No endless email threads.

Learning takeaway: Momentum. The brands winning aren't necessarily smarter. They're faster at learning.

If you've ever felt stuck waiting for research when decisions needed to happen last week, you know the cost of slow insights. The shift to agile research isn't about rushing. It's about learning in rhythm with how your business actually operates. If your current research cadence feels out of step with your decision making, that's a solvable problem.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 6,
      month: "June",
      scheduledDate: new Date("2026-06-25T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Respondent Experience",
      subjectLine: "If People Hate Your Survey, Your Insights Suffer",
      previewText: "Why boring research creates boring data.",
      bodyContent: `Most surveys are still built like it's 2008. Long grids. Repetitive scales. Essay questions that feel like homework. The result? People disengage. And when people disengage, your data quality collapses. Here's a truth that most research programs ignore: The experience you create determines the honesty you receive.

When a respondent sees a traditional matrix with forty rating scales, their brain switches off. They're no longer thinking critically. They're clicking. They're doing the minimum. The data you collect from that fatigue looks clean on the surface but it's not honest.

At Innovatr, we think about this differently. The respondent experience is not a design nicety. It's a data quality imperative. Our behavioural testing model removes friction. Instead of rating scales, people make quick, intuitive trade-offs that mirror real choice. Mobile-first design. Frictionless flow. No distractions. The result? Respondents actually think. They reveal preference instead of politeness.

Learning takeaway: You cannot separate insight quality from respondent experience. The best research platforms make the experience so natural that honesty becomes effortless.

Every research team knows the difference between data that feels clean and data that actually means something. The gap usually comes down to how engaged people were when they were answering. If you're curious about what that looks like in practice, we can walk you through how a better respondent experience actually changes the insights you get.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 7,
      month: "August",
      scheduledDate: new Date("2026-08-27T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Innovation Systems",
      subjectLine: "Why One-Off Launches Don't Build Futures. Systems Do.",
      previewText: "How the best companies turned innovation into a repeatable engine.",
      bodyContent: `Every team launches something new. Most hope it works. The best companies know it will because they've built a system. Apple didn't dream up the iPhone and hope. Steve Jobs built a culture where experts make fast decisions grounded in craft and vision. Starbucks didn't stumble onto the Pumpkin Spice Latte. They systematically listen to customer ideas and test them. Google didn't get lucky with Gmail. They built a structure that turned side projects into billion-dollar products.

Each system shares three things: Clear decision criteria (you know what winning means before you start). Regular testing gates (innovation moves through defined stages with consumer data at each one). Portfolio discipline (you're not innovating one SKU, you're building a portfolio).

Traditional research approaches innovation as an event. Modern innovation works differently. It's continuous learning. Small tests. Rapid iteration. Scaled wins.

Learning takeaway: If your innovation process isn't documented and repeatable, you're innovating by accident. That's expensive. The brands winning aren't smarter. They're more systematic.

The interesting shift we see happening right now is teams moving from asking "Will this work?" to asking "How do we build a system where winning ideas are obvious?" That's a different kind of question, and it requires a different kind of research partner. If you're thinking about how to structure your innovation work differently, that's worth exploring.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 8,
      month: "October",
      scheduledDate: new Date("2026-10-29T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Market Mapping",
      subjectLine: "Not All Empty Space Is Opportunity. Here's How to Tell the Difference.",
      previewText: "Why positioning based on competitor absence is a bet, not a strategy.",
      bodyContent: `Every brand wants to find white space. It sounds smart. It sounds like freedom. It sounds like a blue ocean. But here's the uncomfortable truth: Some white space is empty because nobody wants it.

Market mapping isn't just about spotting gaps. It's about identifying viable demand clusters. When done right, it reveals where consumers genuinely need something but supply is falling short. When done wrong, it shows you a category gap that was empty for a reason.

Real market mapping asks three questions: Where do consumer aspirations cluster? Where are functional benefits underserved? Where is supply weak relative to stated demand? That's your sweet spot.

When you skip mapping and just chase white space, you're guessing. When you do it properly, you're reading the category.

Learning takeaway: Opportunity lives at the intersection of unmet need and commercial viability. If your positioning is based solely on competitor absence, you haven't done the work.

The teams that nail positioning are the ones who do the unglamorous work of actually understanding how the category is structured in peoples minds. If you've got a positioning challenge where you need to see the real opportunity, not just the obvious gaps, that's a conversation worth having.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 9,
      month: "November",
      scheduledDate: new Date("2026-11-26T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Emotional Drivers",
      subjectLine: "Consumers Justify With Logic. They Stick With Emotion.",
      previewText: "Why strong products perform. Why strong brands resonate. Why you need both.",
      bodyContent: `Here's a testing trap that catches smart brands all the time: A product launches. It scores well on functional performance. Taste, texture, performance, usability all solid. Consumers rate it as good. The team launches confident. Six months later, it underperforms. Shelf life is short. Repeat purchase is weak.

The team is confused. The product tested well.

The problem: They measured how people perform. They didn't measure how people feel.

Functional benefits answer: Does this do what I need it to do?
Emotional drivers answer: Does this say something about who I am?

In competitive categories, functional parity is almost universal. The differentiator isn't function. It's feeling. It's belonging. It's a version of self. That emotional resonance is what drives stickiness. It's what builds loyalty. It's what justifies premium pricing.

At Innovatr, we layer behavioural testing with AI-assisted emotional theme analysis. We measure both how something performs and how it makes people feel.

Learning takeaway: A product can test well functionally and still fail emotionally. If your last study didn't make you think about emotion, about identity and belonging, you've only measured half the decision.

The cleanest way to know if you're missing something is simple: If your research told you what performs but didn't tell you what resonates, there's a gap. When you add emotional truth to performance data, the whole conversation shifts. If you want to see what that looks like for your category, we can show you.`,
      status: "scheduled",
      channel: "inside",
    },
    {
      mailerNumber: 10,
      month: "December",
      scheduledDate: new Date("2026-12-30T10:00:00"),
      day: "Wednesday",
      sendTime: "10:00 AM",
      topic: "Packaging Performance",
      subjectLine: "Your Pack Doesn't Just Sit on Shelf. It Competes.",
      previewText: "How smart packaging design converts choice into purchase.",
      bodyContent: `Here's a question that separates good packaging teams from great ones: Is this design beautiful or is it effective?

The answer should be both. But when they conflict, effective wins every time.

Packaging design isn't decoration. It's communication under pressure. It's a consumer walking down a shelf with thirty options competing for three seconds of attention. It's a moment where your design either signals clarity, trust, quality, or belonging, or signals confusion.

Smart packaging signals quality (material and finish say something). Signals clarity (people understand what this is in two seconds). Signals value (is this worth what I'm paying?). Signals belonging (does choosing this say something good about me?). Signals differentiation (in a sea of similar products, your pack is the deciding factor).

Most brands test packaging by asking: Do you like it? That's useless. Liking and buying are different. At Innovatr, we test packaging the way consumers encounter it. In context. In competition. Under time pressure. We measure: Does it grab attention? Does it signal what you think it signals? Would you choose it over the alternative?

Learning takeaway: Design decisions are commercial decisions. If your packaging test focused on aesthetics rather than commercial performance, you tested the wrong thing.

The packaging conversations that matter most happen when you have real data on what actually drives choice, not just preference. If you're planning a pack refresh and want to know which direction actually wins in market, that's where good testing changes everything.`,
      status: "scheduled",
      channel: "inside",
    },
  ];

  for (const mailer of mailerData) {
    await databaseStorage.createInsightMailer(mailer);
  }
  console.log("Seeded 10 insight mailers");
}

seedInsightMailers().catch(console.error);

async function seedDealsAndCaseStudies() {
  const [existingDeals, existingCaseStudies, allUsers] = await Promise.all([
    databaseStorage.getAllDeals(),
    databaseStorage.getCaseStudies(),
    databaseStorage.getAllUsers(),
  ]);

  const adminUser = allUsers.find(u => u.email === "hannah@innovatr.co.za" || u.email === "richard@innovatr.co.za");
  const adminId = adminUser?.id ?? "system";

  if (existingDeals.length === 0) {
    console.log("Seeding deals...");
    const dealsToSeed = [
      {
        title: "Research Clarity Sprint",
        description: "3 Test24 Basic credits paired with a dedicated 2-hour strategy workshop facilitated by the Innovatr team. Walk away with a prioritised research agenda and live studies ready to launch.",
        headlineOffer: "Strategy Workshop + Fieldwork Bundle",
        originalPrice: "52000",
        discountedPrice: "42000",
        discountPercent: 19,
        creditsIncluded: 3,
        dealType: "exclusive_offer" as const,
        slotsTotal: 3,
        slotsRemaining: 3,
        sortOrder: 1,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-03-31"),
        isActive: true,
      },
      {
        title: "LITE Brand Health Track",
        description: "4 Basic credits configured as a lightweight, repeatable brand health tracker. Monitor awareness, consideration, and preference — with a structured research calendar built for you.",
        headlineOffer: "Structured Brand Measurement",
        originalPrice: "60000",
        discountedPrice: "48000",
        discountPercent: 20,
        creditsIncluded: 4,
        dealType: "exclusive_offer" as const,
        slotsTotal: 3,
        slotsRemaining: 2,
        sortOrder: 2,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-03-31"),
        isActive: true,
      },
      {
        title: "Full Brand Health Study",
        description: "1 Test24 Pro credit deployed as a comprehensive brand health study — with enhanced deliverables including competitive benchmarking, segment-level analysis, and a strategic debrief session.",
        headlineOffer: "Pro-Level Brand Intelligence",
        originalPrice: "72000",
        discountedPrice: "58000",
        discountPercent: 19,
        creditsIncluded: 1,
        dealType: "exclusive_offer" as const,
        slotsTotal: 3,
        slotsRemaining: 3,
        sortOrder: 3,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        validTo: new Date("2026-03-31"),
        isActive: true,
      },
      {
        title: "Q2 Research Planning Session",
        description: "All active members this month get a complimentary 45-minute Q2 research planning call with a senior Innovatr strategist. Map your pipeline before the quarter begins.",
        headlineOffer: "45-min Strategy Call",
        creditsIncluded: 0,
        dealType: "perk" as const,
        sortOrder: 1,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        isActive: true,
      },
      {
        title: "Refer a Company",
        description: "Know a business that could benefit from Test24? Refer them and receive 3 free Basic credits when they sign up and run their first study.",
        headlineOffer: "3 Free Basic Credits",
        creditsIncluded: 3,
        dealType: "perk" as const,
        sortOrder: 2,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        isActive: true,
      },
      {
        title: "March Trends Unlocked",
        description: "All members get complimentary access to our latest consumer sentiment and category reports this month. See what's shaping your market right now.",
        headlineOffer: "Complimentary Report Access",
        creditsIncluded: 0,
        dealType: "perk" as const,
        sortOrder: 3,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-03-01"),
        isActive: true,
      },
      {
        title: "New Product Pipeline Tracker",
        description: "A structured innovation research programme designed to pressure-test your Q3 pipeline before committing to production.",
        headlineOffer: "Q3 Pipeline Intelligence",
        creditsIncluded: 0,
        dealType: "teaser" as const,
        sortOrder: 1,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-04-01"),
        isActive: true,
      },
      {
        title: "Scale Team Package",
        description: "Something built for organisations running research across multiple teams or markets — more breadth, more control, more insight.",
        headlineOffer: "Multi-Team Research Suite",
        creditsIncluded: 0,
        dealType: "teaser" as const,
        sortOrder: 2,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-04-01"),
        isActive: true,
      },
      {
        title: "Brand Pulse Check-In",
        description: "A quarterly pulse study — fast, focused, and built around what matters to your brand right now.",
        headlineOffer: "Quarterly Brand Monitor",
        creditsIncluded: 0,
        dealType: "teaser" as const,
        sortOrder: 3,
        targetTierKeys: [],
        targetUserIds: [],
        createdByUserId: adminId,
        validFrom: new Date("2026-04-01"),
        isActive: true,
      },
    ];
    for (const deal of dealsToSeed) {
      await databaseStorage.createDeal(deal as any);
    }
    console.log(`Seeded ${dealsToSeed.length} deals`);
  }

  if (existingCaseStudies.length === 0) {
    console.log("Seeding case studies...");
    const caseStudiesToSeed = [
      {
        slug: "dgb",
        client: "DGB",
        industry: "Alcohol",
        headline: "Transforming a Business for Growth with a Disruptive 3-Year Pipeline",
        problemShort: "Portfolio lacked clear direction across demand spaces, limiting growth potential against modern competitors.",
        problem: "Portfolio lacked clear direction across demand spaces, limiting growth potential. Traditional wines significantly underperformed against modern RTD competitors with limited understanding of consumer needs.",
        process: "Comprehensive 3-phase Demand Space Mapping methodology analyzing Connecting, Relaxing, and Socializing demand spaces. Applied Jobs-to-be-Done framework to identify Total Addressable Problems and validate consumer needs.",
        results: "7 distinct innovation projects approved for the development pipeline. Robust 18-36 month innovation planning secured. Client requested Innovatr to lead end-to-end NPD execution.",
        phases: ["strategy", "innovation"],
        duration: "70 Days",
        highlight: "7 Pipeline Projects",
        bgColor: "#FFE8D8",
        gifAsset: "cooking",
        sortOrder: 1,
        isActive: true,
      },
      {
        slug: "namibian-breweries",
        client: "Namibian Breweries",
        industry: "Beverages",
        headline: "Launching & Landing the Non-Alcoholic Category in Namibia",
        problemShort: "Emerging category with undefined positioning and consumer ambiguity in a crowded market.",
        problem: "Emerging category with undefined positioning territories and consumer ambiguity. Need for differentiated messaging and clear visual identity in a crowded market.",
        process: "Rapid 27-day sprint developing positioning territories, category manifesto, and Visual Identity. Consumer validation with 200+ respondents followed by TTL creative rollout.",
        results: "Full launch campaign executed with complete Through-The-Line creative toolkit. Established regional benchmark for cross-brand portfolio launches.",
        phases: ["strategy", "execution"],
        duration: "27 Days",
        highlight: "Regional Benchmark",
        bgColor: "#E8F0FF",
        gifAsset: "airplanes",
        sortOrder: 2,
        isActive: true,
      },
      {
        slug: "rain",
        client: "Rain",
        industry: "Telecommunications",
        headline: "Defining Winning Market Entry Strategy Through Consumer Intelligence",
        problemShort: "Market dominated by established players with high barriers to entry and unclear value proposition.",
        problem: "Market dominated by established players with high barriers to entry. Undefined category positioning and unclear value proposition within new market territory.",
        process: "Comprehensive four-phase quantitative research methodology with extensive consumer analysis. Explored category opportunities using proprietary frameworks and developed strategic positioning.",
        results: "Clear pathway identified to capture substantial market position. Strategic category positioning validated through comprehensive consumer research with innovation development guidance.",
        phases: ["strategy"],
        duration: "3 Months",
        highlight: "Market Entry Roadmap",
        bgColor: "#FFE4D8",
        gifAsset: "pen",
        sortOrder: 3,
        isActive: true,
      },
      {
        slug: "discovery",
        client: "Discovery Bank",
        industry: "Financial Services",
        headline: "Unlocking Dormant Customer Value Through Engagement Research",
        problemShort: "Significant portion of inactive accounts with customers using bank for limited needs only.",
        problem: "Significant portion of inactive accounts with many customers using bank for limited needs only. Multi-banking behavior persists with barriers including perceived fee structures and security concerns.",
        process: "Proprietary engagement measurement using Interest-Commitment scoring. Deep segmentation into Highly Engaged, Low Engaged, and Disengaged audiences with concept testing for activation strategies.",
        results: "Strong emotional brand leadership confirmed vs competitors. High-potential product concepts validated as activation drivers with clear strategic roadmap delivered.",
        phases: ["strategy"],
        duration: "Comprehensive",
        highlight: "Emotional Leadership",
        bgColor: "#E8FFE8",
        gifAsset: "cooking",
        sortOrder: 4,
        isActive: true,
      },
    ];
    for (const cs of caseStudiesToSeed) {
      await databaseStorage.createCaseStudy(cs as any);
    }
    console.log(`Seeded ${caseStudiesToSeed.length} case studies`);
  }
}

seedDealsAndCaseStudies().catch(console.error);

export const storage = databaseStorage;
