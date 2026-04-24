import { and, eq, sql } from "drizzle-orm";
import { db } from "../server/db";
import { companies, companyMemberships, users } from "../shared/schema";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS company_memberships (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id varchar NOT NULL,
      company_id varchar NOT NULL,
      role varchar(20) NOT NULL DEFAULT 'MEMBER',
      status varchar(20) NOT NULL DEFAULT 'ACTIVE',
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS company_memberships_user_company_active_idx
      ON company_memberships (user_id, company_id)
      WHERE status = 'ACTIVE'
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS company_invites (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL,
      email text NOT NULL,
      role varchar(20) NOT NULL DEFAULT 'MEMBER',
      token_hash text NOT NULL UNIQUE,
      invited_by_user_id varchar NOT NULL,
      expires_at timestamp NOT NULL,
      accepted_at timestamp,
      revoked_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);

  const allUsers = await db.select().from(users);
  const allCompanies = await db.select().from(companies);
  let inserted = 0;

  for (const company of allCompanies) {
    const companyUsers = allUsers
      .filter((user) => user.companyId === company.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    for (const [index, user] of companyUsers.entries()) {
      const existing = await db
        .select({ id: companyMemberships.id })
        .from(companyMemberships)
        .where(
          and(
            eq(companyMemberships.userId, user.id),
            eq(companyMemberships.companyId, company.id),
            eq(companyMemberships.status, "ACTIVE"),
          ),
        )
        .limit(1);
      if (existing.length > 0) continue;

      await db.insert(companyMemberships).values({
        userId: user.id,
        companyId: company.id,
        role: index === 0 ? "OWNER" : "MEMBER",
        status: "ACTIVE",
      });
      inserted += 1;
    }
  }

  let adminGrants = 0;
  const hannah = allUsers.find((user) => user.email?.toLowerCase() === "hannah@innovatr.co.za");
  if (hannah) {
    for (const company of allCompanies) {
      const [existing] = await db
        .select({ id: companyMemberships.id, role: companyMemberships.role })
        .from(companyMemberships)
        .where(
          and(
            eq(companyMemberships.userId, hannah.id),
            eq(companyMemberships.companyId, company.id),
            eq(companyMemberships.status, "ACTIVE"),
          ),
        )
        .limit(1);

      if (existing) {
        if (existing.role !== "ADMIN") {
          await db
            .update(companyMemberships)
            .set({ role: "ADMIN", updatedAt: new Date() })
            .where(eq(companyMemberships.id, existing.id));
          adminGrants += 1;
        }
        continue;
      }

      await db.insert(companyMemberships).values({
        userId: hannah.id,
        companyId: company.id,
        role: "ADMIN",
        status: "ACTIVE",
      });
      adminGrants += 1;
    }
  } else {
    console.log("Hannah admin user not found; skipped all-company admin membership grant.");
  }

  const suspicious = allUsers.filter((user) => user.companyId && !allCompanies.some((company) => company.id === user.companyId));
  console.log(`Backfilled ${inserted} company memberships.`);
  console.log(`Granted/updated ${adminGrants} Hannah admin company memberships.`);
  if (suspicious.length > 0) {
    console.log("Users with missing legacy companyId:");
    for (const user of suspicious) {
      console.log(`- ${user.email}: ${user.companyId}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  process.exit(process.exitCode ?? 0);
});
