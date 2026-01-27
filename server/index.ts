import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

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
})();
