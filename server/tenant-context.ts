import type { Company, CompanyMembership, User } from "@shared/schema";
import { storage } from "./storage";

export type MembershipWithCompany = CompanyMembership & {
  company: Company;
};

export interface TenantContext {
  memberships: MembershipWithCompany[];
  activeMembership: MembershipWithCompany | null;
  activeCompany: Company | null;
}

export async function resolveTenantContext(
  userId: string,
  preferredCompanyId?: string | null,
): Promise<TenantContext> {
  const memberships = await storage.getActiveCompanyMembershipsByUserId(userId);
  const membershipsWithCompanies: MembershipWithCompany[] = [];

  for (const membership of memberships) {
    const company = await storage.getCompany(membership.companyId);
    if (company) {
      membershipsWithCompanies.push({ ...membership, company });
    }
  }

  const activeMembership =
    membershipsWithCompanies.find((membership) => membership.companyId === preferredCompanyId) ??
    membershipsWithCompanies[0] ??
    null;

  return {
    memberships: membershipsWithCompanies,
    activeMembership,
    activeCompany: activeMembership?.company ?? null,
  };
}

export function applyTenantContextToUser<T extends Partial<User>>(
  user: T,
  context: TenantContext,
): T & {
  companyId: string | null;
  company: string | null;
  activeCompany: Company | null;
  memberships: MembershipWithCompany[];
} {
  const activeCompany = context.activeCompany;
  return {
    ...user,
    companyId: activeCompany?.id ?? null,
    company: activeCompany?.name ?? user.company ?? null,
    membershipTier: (activeCompany?.tier ?? user.membershipTier) as T["membershipTier"],
    activeCompany,
    memberships: context.memberships,
  };
}
