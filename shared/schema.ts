import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const couponClaims = pgTable("coupon_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  couponCode: text("coupon_code").notNull(),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
});

export const insertCouponClaimSchema = createInsertSchema(couponClaims).pick({
  name: true,
  email: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export type InsertCouponClaim = z.infer<typeof insertCouponClaimSchema>;
export type CouponClaim = typeof couponClaims.$inferSelect;
