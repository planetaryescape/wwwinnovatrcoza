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
          status: "published",
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
