import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../../server/routes";

export async function createTestApp(): Promise<Express> {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  await registerRoutes(app);
  return app;
}
