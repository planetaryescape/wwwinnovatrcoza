import { type User, type InsertUser, type CouponClaim, type InsertCouponClaim } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createCouponClaim(claim: InsertCouponClaim): Promise<CouponClaim>;
  getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private couponClaims: Map<string, CouponClaim>;

  constructor() {
    this.users = new Map();
    this.couponClaims = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createCouponClaim(insertClaim: InsertCouponClaim): Promise<CouponClaim> {
    const id = randomUUID();
    const couponCode = `TEST24-${randomUUID().substring(0, 8).toUpperCase()}`;
    const claim: CouponClaim = {
      ...insertClaim,
      id,
      couponCode,
      claimedAt: new Date(),
    };
    this.couponClaims.set(id, claim);
    return claim;
  }

  async getCouponClaimByEmail(email: string): Promise<CouponClaim | undefined> {
    return Array.from(this.couponClaims.values()).find(
      (claim) => claim.email.toLowerCase() === email.toLowerCase(),
    );
  }
}

export const storage = new MemStorage();
