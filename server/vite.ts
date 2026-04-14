import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const CANONICAL_BASE = "https://www.innovatr.co.za";

const PUBLIC_ROUTES: Record<string, string> = {
  "/": CANONICAL_BASE + "/",
  "/research": CANONICAL_BASE + "/research",
  "/consult": CANONICAL_BASE + "/consult",
  "/tools": CANONICAL_BASE + "/tools",
  "/case-studies": CANONICAL_BASE + "/case-studies",
  "/contact": CANONICAL_BASE + "/contact",
  "/test24-basic": CANONICAL_BASE + "/test24-basic",
  "/test24-pro": CANONICAL_BASE + "/test24-pro",
  "/consult/where-to-focus": CANONICAL_BASE + "/consult/where-to-focus",
  "/consult/how-to-play": CANONICAL_BASE + "/consult/how-to-play",
  "/consult/how-to-win": CANONICAL_BASE + "/consult/how-to-win",
  "/consult/whats-working": CANONICAL_BASE + "/consult/whats-working",
  "/case-study/dgb": CANONICAL_BASE + "/case-study/dgb",
  "/case-study/namibian-breweries": CANONICAL_BASE + "/case-study/namibian-breweries",
  "/case-study/rain": CANONICAL_BASE + "/case-study/rain",
  "/case-study/discovery": CANONICAL_BASE + "/case-study/discovery",
  "/privacy-policy": CANONICAL_BASE + "/privacy-policy",
  "/terms-of-use": CANONICAL_BASE + "/terms-of-use",
  "/cookie-policy": CANONICAL_BASE + "/cookie-policy",
};

function injectCanonical(html: string, requestPath: string): string {
  const cleanPath = requestPath.split("?")[0].replace(/\/+$/, "") || "/";
  const canonical = PUBLIC_ROUTES[cleanPath];
  if (canonical) {
    return html.replace(
      '<link rel="canonical" href="https://www.innovatr.co.za" />',
      `<link rel="canonical" href="${canonical}" />`,
    );
  }
  return html;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      template = injectCanonical(template, url);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");
    html = injectCanonical(html, req.originalUrl);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}
