import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { sendDailyAdminDigest } from "./emails/email-service";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Cookie parser for session management
app.use(cookieParser());

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: false,
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Idempotent: create solo companies for Shakira and Claire Braithwaite if they lack one
  (async () => {
    try {
      const allUsers = await storage.getAllUsers();
      const soloTargets = allUsers.filter(
        (u) =>
          !u.companyId &&
          u.name &&
          (u.name.toLowerCase().includes("shakira") ||
            u.name.toLowerCase().includes("claire braithwaite") ||
            (u.name.toLowerCase().includes("claire") && u.surname?.toLowerCase().includes("braithwaite")))
      );
      for (const u of soloTargets) {
        const displayName = [u.name, u.surname].filter(Boolean).join(" ") || u.email;
        const newCompany = await storage.createCompany({ name: displayName, tier: "FREE" });
        await storage.updateUser(u.id, { companyId: newCompany.id, memberType: "companyUser" });
        log(`Created solo company "${displayName}" for user ${u.email}`);
      }
    } catch (err) {
      console.error("Failed to seed solo companies:", err);
    }
  })();

  // Idempotent: seed "Home Is the New Bar" report if not yet present
  (async () => {
    try {
      const allReports = await storage.getAllReports();
      const exists = allReports.some((r) => r.slug === "home-is-the-new-bar");
      if (!exists) {
        await storage.createReport({
          title: "Home Is the New Bar (Again, But Smarter)",
          slug: "home-is-the-new-bar",
          category: "Insights",
          industry: "alcohol",
          industryTag: "bev",
          date: new Date(),
          status: "draft",
          isFeatured: true,
          accessLevel: "member",
          teaser: "Drinking occasions are shifting into the home. Consumers are going out less often, but upgrading the quality of their at-home social moments.",
          body: `For years, alcohol culture revolved around going out. Bars. Restaurants. Events. Social occasions built around venues.\n\nBut over the past few years, that behaviour has shifted. South Africans are still socialising. They're still drinking. But increasingly, they're doing it at home.\n\nWhat started as a necessity during pandemic restrictions has quietly evolved into a lasting habit — one that is reshaping how alcohol brands are consumed.\n\n**The shift, in numbers**\n\n72% of alcohol consumption occasions now happen at home rather than at licensed venues. 58% say they go out for drinks less frequently than they did two years ago. Among urban professionals, 47% report hosting friends at home at least once per month. 44% say they are drinking less often but choosing higher-quality drinks. Premium mixer purchases have increased, with 39% of under-35s buying premium mixers in the past three months.\n\nFrequency may be moderating. But the quality of the occasion is increasing.\n\n**The rise of the home host**\n\nAt-home drinking is no longer about convenience alone. Consumers are actively upgrading the experience — better glassware, better mixers, ice moulds, cocktail kits, carefully curated drinks selections.\n\nHosting has become part of the ritual. Instead of multiple rounds at a venue, people create a smaller, more controlled social moment at home — where the environment, budget, and timing all feel easier to manage.\n\nThis shift is particularly visible among younger urban consumers who balance social lives with rising living costs. Hosting offers the same connection, but with greater flexibility.\n\n**What this means for alcohol brands**\n\nFor many brands, the mental model of drinking occasions still centres on venues. But when occasions move home, the role of the product changes. At a bar, the venue curates the experience. At home, the product becomes the experience.\n\nPackaging, mixers, serving suggestions, and occasion cues all start to matter more. Brands that equip the host — not just the drinker — gain relevance.\n\n**Innovatr's takeaway**\n\nThe future of alcohol occasions is not defined by where people drink. It's defined by how intentional the moment becomes. Consumers are drinking slightly less frequently, but with greater attention to the experience around the drink. In that environment, brands that focus only on volume risk missing the opportunity. The real growth sits inside the occasion.`,
          topics: ["Alcohol", "Social Occasions", "Premiumisation", "Hosting Culture", "Consumer Behaviour"],
          pdfUrl: "/reports/home-is-the-new-bar.pdf",
          coverImageUrl: "/reports/home-is-the-new-bar.jpg",
          thumbnailUrl: "/reports/home-is-the-new-bar.jpg",
          isArchived: false,
        });
        log(`Seeded report: "Home Is the New Bar"`);
      }
    } catch (err) {
      console.error("Failed to seed report:", err);
    }
  })();

  // Run scheduled report publishing on startup
  storage.processScheduledReports().then((result) => {
    if (result.published > 0 || result.unpublished > 0) {
      log(`Scheduled reports processed: ${result.published} published, ${result.unpublished} archived`);
    }
  }).catch((err) => {
    console.error("Failed to process scheduled reports on startup:", err);
  });

  // Idempotent: seed 4 additional Trends & Insights reports
  (async () => {
    try {
      const allReports = await storage.getAllReports();
      const existingSlugs = new Set(allReports.map((r) => r.slug));

      const newReports = [
        {
          slug: "cash-is-king-again",
          title: "The \"Cash Is King Again\" Comeback",
          category: "Insights" as const,
          industry: "financial",
          industryTag: "financial",
          teaser: "Cash isn't back because tech failed. It's back because invisible spending feels unsafe — and South Africans are choosing control over convenience.",
          body: `For a decade we were told cash is dying. Banks went mobile-first. Fintechs went wallet-crazy. Everyone acted like notes and coins were basically a museum exhibit.\n\nThen 2026 happened. And South Africans quietly did the opposite.\n\nDigital payments are still growing — but behaviour is splitting. People are reaching for cash again. Not because they hate tech. Because they hate invisible spending.\n\n**The cash comeback, in numbers**\n\n61% say they use cash for day-to-day spending because it "helps me control my budget" (LSM 5–7: 68%). 49% of urban consumers say they feel less in control spending digitally. 73% use digital for fixed monthly bills — but 58% deliberately switch to cash for groceries and discretionary spend. That's not "cash-only". That's cash-on-purpose.\n\n**What changed? Invisibility became stressful**\n\nTwo big pressures are colliding: subscription creep (57% say they've been surprised by a debit order or subscription charge in the last six months, rising to 64% among under-35s) and fraud anxiety (SABRIC's 2024 crime stats showed digital banking fraud incidents up 86% year-on-year, with losses up 74% to R1.888bn).\n\nSo consumers are doing the simplest risk hack available: use cash when it matters most. Cash creates a boundary.\n\n**The real insight: friction is now a feature**\n\nCash isn't "better". It's just more felt. It forces a pause. It makes spending real. And right now, that's the point.\n\n**Innovatr's takeaway**\n\nThe next fintech advantage isn't more convenience. It's more control. If your digital experience can't make money movement feel visible, deliberate, and easy to manage, cash will keep winning the emotional battle — even while digital wins the infrastructure war. Convenience is expected. Control is reassuring.`,
          topics: ["Financial Services", "Payments", "Consumer Behaviour", "Budgeting", "Risk & Trust"],
          pdfUrl: "/reports/cash-is-king-again.pdf",
          coverImageUrl: "/reports/cash-is-king-again.jpg",
          thumbnailUrl: "/reports/cash-is-king-again.jpg",
        },
        {
          slug: "township-beauty-economy",
          title: "The Township Beauty Economy Is Formalising",
          category: "Insights" as const,
          industry: "beauty",
          industryTag: "beauty",
          teaser: "Beauty is shifting off the shelf. Home salons and service providers are becoming micro-brands — and a real channel retailers can't ignore.",
          body: `South Africa's beauty market isn't slowing down. It's just moving off the shelf.\n\nFor years, beauty had two worlds: retail (Clicks, malls, counters) and informal (home salons, mobile techs, the girl with the ring light). In 2026, that "informal" world isn't underground anymore. It's formalising fast — and it's starting to look like a real distribution channel.\n\n**The shift, in numbers**\n\n42% of women aged 18–34 buy beauty products directly from a service provider (nails, lashes, hair) at least once a quarter. In township and peri-urban areas, 38% of beauty spend now happens outside formal retail. 59% of Gen Z say TikTok/Instagram influenced their last beauty purchase. And 46% trust product recommendations from their personal beauty service provider more than in-store consultants.\n\n**Why this channel wins**\n\nTownship beauty entrepreneurs are building micro-brands with four things retail can't replicate easily: proximity (ten minutes away beats parking and queues), proof (before-and-after content, reviews, DMs — constant social verification), personalisation (they tailor the look, the routine, the price), and payment flexibility (split payments, package deals, monthly touch-ups).\n\nAnd it's not just services anymore. Some are importing directly, sourcing wholesale, reselling, and even developing private-label products. This isn't hustle culture. It's micro-commerce with an audience.\n\n**Innovatr's takeaway**\n\nIn 2026, the future of beauty isn't only in malls. It's in spare rooms with ring lights. The brands that win won't just chase shelf space — they'll build credibility inside communities where trust is already earned.`,
          topics: ["Beauty", "Retail", "Township Economy", "Creator Commerce", "Informal Trade"],
          pdfUrl: "/reports/township-beauty-economy.pdf",
          coverImageUrl: "/reports/township-beauty-economy.jpg",
          thumbnailUrl: "/reports/township-beauty-economy.jpg",
        },
        {
          slug: "clinic-vs-clicks-vs-creator",
          title: "Clinic vs Clicks vs Creator",
          category: "Insights" as const,
          industry: "health",
          industryTag: "health",
          teaser: "Health authority is fragmenting. Doctors still lead, but creators, reviews and pharmacists now shape the purchase journey.",
          body: `Health advice used to be simple. You got sick. You saw a doctor. You followed instructions.\n\nIn 2026, that hierarchy doesn't exist anymore. Consumers now build their own health "panel". They Google symptoms, watch TikTok explainers, read product reviews, ask a pharmacist at Clicks, and only then decide what to do next. Authority hasn't disappeared. It's fragmented.\n\n**The trust landscape, in numbers**\n\n71% of South Africans research health information online before consulting a healthcare professional. 63% consult two or more sources before buying a health or wellness product. Trust levels break down like this: Doctors: 78%. Pharmacists: 74%. Online reviews: 52%. Influencers/creators: 41% (rising to 58% among Gen Z).\n\nThat last number matters. Creators aren't replacing doctors. They're becoming part of the decision process. And increasingly, they're making the purchase happen first.\n\n**The supplement economy is accelerating this shift**\n\nSouth Africa's supplement market is now worth $1.06 billion and growing at nearly 10% annually. 62% of South Africans now take vitamins or supplements. 54% of under-35s say they have purchased a health product based on a creator recommendation.\n\nThis category sits in the grey space between medicine and lifestyle. Doctors treat illness. Creators talk about optimisation. Consumers want both. So they triangulate: doctor for credibility, pharmacist for accessibility, creator for relatability.\n\n**Innovatr's takeaway**\n\nHealth authority in South Africa hasn't collapsed. It's decentralised. The brands that win won't rely on one voice. They'll show up everywhere trust is being built.`,
          topics: ["Health", "Wellness", "Supplements", "Trust", "Consumer Behaviour"],
          pdfUrl: "/reports/clinic-vs-clicks-vs-creator.pdf",
          coverImageUrl: "/reports/clinic-vs-clicks-vs-creator.jpg",
          thumbnailUrl: "/reports/clinic-vs-clicks-vs-creator.jpg",
        },
        {
          slug: "price-memory-is-brutal",
          title: "Price Memory Is Becoming Brutal",
          category: "Insights" as const,
          industry: "food",
          industryTag: "food",
          teaser: "Consumers now remember what products should cost. When prices cross that mental line, brand loyalty disappears quickly.",
          body: `For years, brands relied on a quiet assumption: consumers didn't really know what things cost. Prices could creep up. Pack sizes could shrink. Promotions could rotate. Most shoppers felt inflation — but they didn't track it precisely.\n\nThat assumption no longer holds. In 2026, South African consumers have developed something new: price memory. They know what bread used to cost. They know what yoghurt should cost. They know what chicken portions are supposed to be. And when a product crosses that invisible line, it gets punished.\n\n**The shift, in numbers**\n\n68% of households now say they actively compare food prices across retailers before buying. 61% have switched a food brand in the past three months because of price increases. Private label penetration has reached 57% nationally, with 44% saying they buy house brands regularly. 64% say they now wait for promotions before buying certain food categories. 49% report deliberately choosing smaller pack sizes to manage weekly cash flow.\n\nPrice sensitivity isn't new. What's new is how precise it has become. Consumers are no longer reacting emotionally to "expensive". They're reacting to specific numbers that feel wrong.\n\n**Why this is happening now**\n\nTwo forces are sharpening price awareness: sustained inflation (food inflation has been a constant presence for years, forcing households to watch spending closely) and digital comparison (consumers now check multiple retailers, apps, and catalogues before shopping, reinforcing mental benchmarks).\n\nOnce those benchmarks form, they stick. A price increase that once went unnoticed now feels like a betrayal.\n\n**Innovatr's takeaway**\n\nPrice has always mattered. But in 2026, price memory is becoming structural. Consumers are not just asking "Can I afford this?" They're asking "Is this still worth what it used to be?" The brands that survive this shift won't simply compete on price. They will compete on visible value.`,
          topics: ["Food", "Pricing", "Inflation", "Consumer Behaviour", "Retail"],
          pdfUrl: "/reports/price-memory-is-brutal.pdf",
          coverImageUrl: "/reports/price-memory-is-brutal.jpg",
          thumbnailUrl: "/reports/price-memory-is-brutal.jpg",
        },
      ];

      const MAILER_SLUGS = new Set(["cash-is-king-again", "township-beauty-economy", "clinic-vs-clicks-vs-creator", "price-memory-is-brutal"]);

      for (const r of newReports) {
        if (!existingSlugs.has(r.slug)) {
          await storage.createReport({
            ...r,
            date: new Date(),
            status: MAILER_SLUGS.has(r.slug) ? "draft" : "published",
            isFeatured: true,
            accessLevel: "member",
            isArchived: false,
          });
          log(`Seeded report: "${r.title}" (${MAILER_SLUGS.has(r.slug) ? "draft — publishes on send" : "published"})`);
        }
      }
    } catch (err) {
      console.error("Failed to seed additional reports:", err);
    }
  })();

  // Idempotent: seed 5 InsightMailer Content Schedule entries for Tue 10 March 09:30 SAST
  (async () => {
    try {
      const scheduledDate = new Date("2026-03-10T07:30:00.000Z"); // 09:30 SAST
      const existingMailers = await storage.getAllInsightMailers();

      const mailerSeeds = [
        {
          targetIndustry: "bev",
          topic: "Home Is the New Bar (Again, But Smarter)",
          subjectLine: "Home Is the New Bar (Again, But Smarter)",
          previewText: "South Africans Aren't Going Out Less. They're Drinking Differently.",
          bodyContent: "Drinking occasions are shifting into the home. 72% of occasions happen at home vs licensed venues. 58% go out less often. 47% host at home monthly. Brands that equip the host — not just the drinker — gain relevance.",
          coverImagePath: "/reports/home-is-the-new-bar.jpg",
          mailerNumber: 1,
        },
        {
          targetIndustry: "financial",
          topic: "The \"Cash Is King Again\" Comeback",
          subjectLine: "Why South Africans Are Taking Cash Back from the Banks",
          previewText: "Digital fatigue is real. And it's reshaping how people spend.",
          bodyContent: "Cash isn't back because tech failed. It's back because invisible spending feels unsafe. 61% use cash to budget. 49% feel less in control digitally. 73% use digital only for fixed bills.",
          coverImagePath: "/reports/cash-is-king-again.jpg",
          mailerNumber: 2,
        },
        {
          targetIndustry: "beauty",
          topic: "The Township Beauty Economy Is Formalising",
          subjectLine: "Your Next Beauty Influencer Might Live Next Door",
          previewText: "Informal entrepreneurs are becoming micro-brands — and retail is watching.",
          bodyContent: "42% of women aged 18-34 buy beauty products directly from service providers. 38% of township beauty spend happens outside retail. The informal channel is formalising fast.",
          coverImagePath: "/reports/township-beauty-economy.jpg",
          mailerNumber: 3,
        },
        {
          targetIndustry: "health",
          topic: "Clinic vs Clicks vs Creator",
          subjectLine: "Who Do South Africans Actually Trust for Health Advice?",
          previewText: "Doctors still lead. But they're no longer alone.",
          bodyContent: "71% research health online before consulting a professional. 63% consult 2+ sources. Creators are becoming part of the decision process — especially for supplements.",
          coverImagePath: "/reports/clinic-vs-clicks-vs-creator.jpg",
          mailerNumber: 4,
        },
        {
          targetIndustry: "food",
          topic: "Price Memory Is Becoming Brutal",
          subjectLine: "South Africans Now Know Exactly What Things Should Cost",
          previewText: "When prices move, consumers notice immediately.",
          bodyContent: "68% of households actively compare food prices. 61% switched brands due to price increases. 49% chose smaller pack sizes to manage cash flow. Price memory is now structural.",
          coverImagePath: "/reports/price-memory-is-brutal.jpg",
          mailerNumber: 5,
        },
      ];

      for (const seed of mailerSeeds) {
        const alreadyExists = existingMailers.some(
          (m) => (m as any).targetIndustry === seed.targetIndustry && m.month === "March 2026"
        );
        if (!alreadyExists) {
          await storage.createInsightMailer({
            ...seed,
            month: "March 2026",
            scheduledDate,
            day: "Tuesday",
            sendTime: "09:30",
            channel: "insights",
            status: "scheduled",
            attachmentType: "report",
          });
          log(`Seeded InsightMailer: "${seed.topic}"`);
        }
      }
    } catch (err) {
      console.error("Failed to seed insight mailers:", err);
    }
  })();

  // 09:30 SAST (07:30 UTC) industry mailer scheduler
  function getMillisecondsUntilNext0930Sast(): number {
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(7, 30, 0, 0);
    if (target <= now) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
    return target.getTime() - now.getTime();
  }

  async function runIndustryMailerCheck() {
    try {
      const now = new Date();
      const allMailers = await storage.getAllInsightMailers();
      const due = allMailers.filter(
        (m) => m.status === "scheduled" && (m as any).targetIndustry && new Date(m.scheduledDate) <= now
      );
      if (due.length > 0) {
        log(`Industry mailer check: ${due.length} due mailer(s) found — triggering batch send`);
        const INDUSTRY_ORDER = ["financial", "beauty", "health", "food", "bev"];
        const { sendFinancialPulseMailer, sendBeautyPulseMailer, sendHealthPulseMailer, sendFoodPulseMailer, sendPulseMailer: sendBevMailer } = await import("./emails/email-service");
        const mailerFnMap: Record<string, (to: string, firstName: string) => Promise<any>> = {
          financial: sendFinancialPulseMailer,
          beauty: sendBeautyPulseMailer,
          health: sendHealthPulseMailer,
          food: sendFoodPulseMailer,
          bev: sendBevMailer,
        };
        const seenEmails = new Set<string>();
        for (const industry of INDUSTRY_ORDER) {
          const subs = await storage.getPulseSubscribersByIndustry(industry);
          for (const sub of subs) {
            const email = sub.email.toLowerCase();
            if (seenEmails.has(email)) continue;
            seenEmails.add(email);
            const rawFirst = sub.name?.split(" ")[0] || "there";
            const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
            try { await mailerFnMap[industry](sub.email, firstName); } catch (e) { console.error(`Failed sending to ${sub.email}:`, e); }
          }
        }
        for (const m of due) {
          await storage.updateInsightMailer(m.id, { status: "sent" });
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
            log(`Published report: "${report.title}"`);
          }
        }

        log(`Industry batch mailer complete. ${seenEmails.size} unique recipients.`);
      }
    } catch (err) {
      console.error("Industry mailer check error:", err);
    }
    const msUntilNext = getMillisecondsUntilNext0930Sast();
    setTimeout(runIndustryMailerCheck, msUntilNext);
  }

  const msUntilFirst0930 = getMillisecondsUntilNext0930Sast();
  setTimeout(runIndustryMailerCheck, msUntilFirst0930);
  const first0930 = new Date(Date.now() + msUntilFirst0930);
  log(`Industry mailer scheduler started (09:30 SAST daily, next: ${first0930.toLocaleString()})`);

  // Calculate milliseconds until next 5am or 5pm
  function getMillisecondsUntilNext5() {
    const now = new Date();
    const currentHour = now.getHours();
    const target = new Date(now);
    
    if (currentHour < 5) {
      target.setHours(5, 0, 0, 0);
    } else if (currentHour < 17) {
      target.setHours(17, 0, 0, 0);
    } else {
      target.setDate(target.getDate() + 1);
      target.setHours(5, 0, 0, 0);
    }
    
    return target.getTime() - now.getTime();
  }

  // Schedule automatic publishing at 5am and 5pm
  async function runScheduledPublishing() {
    try {
      const result = await storage.processScheduledReports();
      if (result.published > 0 || result.unpublished > 0) {
        log(`Scheduled reports processed: ${result.published} published, ${result.unpublished} archived`);
      }
    } catch (err) {
      console.error("Scheduler error processing scheduled reports:", err);
    }
    
    // Schedule next run
    const msUntilNext = getMillisecondsUntilNext5();
    setTimeout(runScheduledPublishing, msUntilNext);
    const nextRun = new Date(Date.now() + msUntilNext);
    log(`Next scheduled publish check at ${nextRun.toLocaleString()}`);
  }

  // Start the scheduler
  const msUntilFirst = getMillisecondsUntilNext5();
  setTimeout(runScheduledPublishing, msUntilFirst);
  const firstRun = new Date(Date.now() + msUntilFirst);
  log(`Report scheduler started (runs at 5am and 5pm, next: ${firstRun.toLocaleString()})`);

  // In-process dedup guard: tracks the UTC date of the last successful digest send.
  // Prevents the same process from firing twice if the timer is somehow called again.
  let lastDigestSentDate: string | null = null;

  // Daily admin digest email scheduler - runs at 4pm weekdays (SAST / server time)
  function getMillisecondsUntilNext4pm(): number {
    const now = new Date();
    const target = new Date(now);
    target.setHours(16, 0, 0, 0);
    
    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }
    
    // Skip Saturday (6) and Sunday (0) - advance to Monday
    while (target.getDay() === 0 || target.getDay() === 6) {
      target.setDate(target.getDate() + 1);
    }
    
    return target.getTime() - now.getTime();
  }

  async function runDailyDigest() {
    try {
      const now = new Date();

      // ── Layer 1: in-process dedup ──────────────────────────────────────────
      // Guards against the same Node process calling this twice (edge case).
      const todayUTC = now.toISOString().slice(0, 10);
      if (lastDigestSentDate === todayUTC) {
        log("Daily digest already sent today (in-process guard), skipping.");
        return;
      }

      // ── Layer 2: cross-process DB dedup ───────────────────────────────────
      // Guards against two overlapping processes (e.g. tsx hot-restart) both
      // firing near 4 pm. We write a sentinel activity event after a successful
      // send and check for it before sending.
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const recentAll = await storage.getActivityEventsSince(twelveHoursAgo);
      const alreadySentInDB = recentAll.some(e => e.actionType === "digest_sent");
      if (alreadySentInDB) {
        log("Daily digest already sent today (DB guard), skipping.");
        return;
      }

      const dayOfWeek = now.getDay();
      const isMonday = dayOfWeek === 1;
      
      // Monday: look back to Friday 4pm (covers weekend)
      // Other weekdays: look back 24 hours
      const hoursBack = isMonday ? 72 : 24;
      const since = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
      
      const periodLabel = isMonday
        ? `Weekend + Monday (${since.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })} – ${now.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })})`
        : `${now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;
      
      const allEvents = await storage.getActivityEventsSince(since);
      const allUsers = await storage.getAllUsers();
      const allCompanies = await storage.getAllCompanies();
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      const companyMap = new Map(allCompanies.map(c => [c.id, c.name]));
      
      const adminUserIds = new Set(allUsers.filter(u => u.role === "ADMIN").map(u => u.id));
      // Also exclude the SYSTEM sentinel events from all user-facing stats
      const events = allEvents.filter(e => !adminUserIds.has(e.userId) && e.userId !== "SYSTEM");
      
      const newUsers = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= since && u.role !== "ADMIN");
      
      const loginEvents = events.filter(e => e.actionType === "login");
      const uniqueLoginUserIds = new Set(loginEvents.map(e => e.userId));
      // Active users = anyone with ANY event in the period (including existing-session visits)
      const activeUserIds = new Set(events.map(e => e.userId));

      // ── T002 fix: resolve null companyId via user record ──────────────────
      // Login events (and some other early events) may have companyId = null
      // if the user was added to a company after their first login. Build a
      // fallback lookup from the already-fetched users list (no extra DB call).
      const userToCompany = new Map(
        allUsers.filter(u => u.companyId).map(u => [u.id, u.companyId!])
      );

      // Enrich each event with an effectiveCompanyId (stored value takes priority)
      const enrichedEvents = events.map(e => ({
        ...e,
        effectiveCompanyId: e.companyId ?? userToCompany.get(e.userId) ?? null,
      }));

      const companyActivity = Array.from(
        new Set(enrichedEvents.filter(e => e.effectiveCompanyId).map(e => e.effectiveCompanyId!))
      )
        .map(cId => ({
          companyName: companyMap.get(cId) ?? "Unknown",
          totalActions: enrichedEvents.filter(e => e.effectiveCompanyId === cId).length,
          uniqueUsers: new Set(enrichedEvents.filter(e => e.effectiveCompanyId === cId).map(e => e.userId)).size,
        }))
        .sort((a, b) => b.totalActions - a.totalActions);
      
      const recentEvents = enrichedEvents.slice(0, 30).map(e => ({
        userName: userMap.get(e.userId)?.name ?? "Unknown",
        userEmail: userMap.get(e.userId)?.email ?? "",
        companyName: e.effectiveCompanyId ? companyMap.get(e.effectiveCompanyId) ?? "" : "",
        actionType: e.actionType,
        entityName: e.entityName,
        createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
      }));

      const reportViewDetails = events
        .filter(e => e.actionType === "view_report")
        .map(e => ({
          userName: userMap.get(e.userId)?.name ?? "Unknown",
          reportName: e.entityName ?? "Unknown report",
        }));
      const reportDownloadDetails = events
        .filter(e => e.actionType === "download_report" || e.actionType === "download_client_report")
        .map(e => ({
          userName: userMap.get(e.userId)?.name ?? "Unknown",
          reportName: e.entityName ?? "Unknown report",
        }));
      
      await sendDailyAdminDigest({
        isMonday,
        periodLabel,
        newUsers: newUsers.map(u => ({
          name: u.name || "",
          surname: u.surname || "",
          email: u.email,
          company: u.companyId ? companyMap.get(u.companyId) ?? "No company" : "No company",
        })),
        activeUsers: activeUserIds.size,
        freshLogins: loginEvents.length,
        totalLogins: loginEvents.length,
        uniqueLoginUsers: uniqueLoginUserIds.size,
        reportViews: reportViewDetails.length,
        reportDownloads: reportDownloadDetails.length,
        reportViewDetails,
        reportDownloadDetails,
        briefLaunches: events.filter(e => e.actionType === "launch_brief").length,
        totalEvents: events.length,
        companyActivity,
        recentEvents,
      });

      // Mark as sent — both in-process and in DB
      lastDigestSentDate = todayUTC;
      storage.createActivityEvent({
        userId: "SYSTEM",
        companyId: null,
        actionType: "digest_sent",
      }).catch(err => console.error("Failed to record digest_sent sentinel:", err));
      
      log(`Daily admin digest sent for period: ${periodLabel}`);
    } catch (err) {
      console.error("Failed to send daily admin digest:", err);
    }
    
    // Schedule next run
    const msUntilNext4pm = getMillisecondsUntilNext4pm();
    setTimeout(runDailyDigest, msUntilNext4pm);
    const nextDigest = new Date(Date.now() + msUntilNext4pm);
    log(`Next daily digest at ${nextDigest.toLocaleString()}`);
  }

  // Start the daily digest scheduler
  const msUntilFirst4pm = getMillisecondsUntilNext4pm();
  setTimeout(runDailyDigest, msUntilFirst4pm);
  const firstDigest = new Date(Date.now() + msUntilFirst4pm);
  log(`Daily digest scheduler started (4pm weekdays, next: ${firstDigest.toLocaleString()})`);
})();
