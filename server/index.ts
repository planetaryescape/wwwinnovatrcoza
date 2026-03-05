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
