import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCouponClaimSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.post("/api/coupon-claims", async (req, res) => {
    try {
      const validatedData = insertCouponClaimSchema.parse(req.body);
      
      const existingClaim = await storage.getCouponClaimByEmail(validatedData.email);
      if (existingClaim) {
        return res.status(200).json(existingClaim);
      }

      const claim = await storage.createCouponClaim(validatedData);
      res.status(201).json(claim);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
