import request from "supertest";
import crypto from "crypto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../../server/db";
import {
  companies,
  companyMemberships,
  companyInvites,
  clientReports,
  reports,
  briefSubmissions,
  briefFiles,
  studies,
  deals,
  sessions,
  users,
} from "../../shared/schema";
import { createTestApp } from "./app";

const runId = `tenant_${Date.now()}`;
const emailDomain = `${runId.replace(/_/g, "-")}.test`;
const password = "TenantPass123!";

async function ensureTenantTables() {
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
}

async function cleanupTenantRows() {
  const emailPattern = `%@${emailDomain}`;
  const companyPattern = `${runId}%`;
  await db.delete(sessions).where(
    sql`${sessions.userId} in (select id from users where email like ${emailPattern})`,
  );
  await db.delete(clientReports).where(
    sql`${clientReports.companyId} in (select id from companies where name like ${companyPattern})`,
  );
  await db.delete(reports).where(like(reports.title, `${runId}%`));
  await db.delete(studies).where(
    sql`${studies.companyId} in (select id from companies where name like ${companyPattern})`,
  );
  await db.delete(briefSubmissions).where(
    sql`${briefSubmissions.companyId} in (select id from companies where name like ${companyPattern})`,
  );
  await db.delete(briefFiles).where(
    sql`${briefFiles.companyId} in (select id from companies where name like ${companyPattern})`,
  );
  await db.delete(deals).where(like(deals.title, `${runId}%`));
  await db.delete(companyInvites).where(like(companyInvites.email, emailPattern));
  await db.delete(companyMemberships).where(
    sql`${companyMemberships.userId} in (select id from users where email like ${emailPattern})`,
  );
  await db.delete(users).where(like(users.email, emailPattern));
  await db.delete(companies).where(like(companies.name, companyPattern));
}

describe("tenant membership isolation", () => {
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    await ensureTenantTables();
    app = await createTestApp();
  });

  afterEach(async () => {
    await cleanupTenantRows();
  });

  it("creates a separate company when signup uses an existing company name", async () => {
    const companyName = `${runId} Acme`;
    const existingCompany = await db
      .insert(companies)
      .values({ name: companyName, tier: "GROWTH", industry: "Food" })
      .returning();

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: `new-user@${emailDomain}`,
        password,
        name: "New User",
        company: companyName,
        industry: "Food",
      });

    expect(response.status).toBe(201);
    expect(response.body.companyId).not.toBe(existingCompany[0].id);

    const matchingCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.name, companyName));
    expect(matchingCompanies).toHaveLength(2);

    const newUserMemberships = await db
      .select()
      .from(companyMemberships)
      .where(and(eq(companyMemberships.userId, response.body.id), eq(companyMemberships.role, "OWNER")));

    expect(newUserMemberships).toHaveLength(1);
    expect(newUserMemberships[0].companyId).toBe(response.body.companyId);
  });

  it("returns memberships and active company from the logged-in session", async () => {
    const agent = request.agent(app);
    const signup = await agent.post("/api/auth/signup").send({
      email: `session-user@${emailDomain}`,
      password,
      name: "Session User",
      company: `${runId} Session Co`,
      industry: "Retail",
    });

    expect(signup.status).toBe(201);

    const login = await agent.post("/api/auth/login").send({
      email: `session-user@${emailDomain}`,
      password,
    });

    expect(login.status).toBe(200);

    const me = await agent.get("/api/auth/me");

    expect(me.status).toBe(200);
    expect(me.body.activeCompany).toMatchObject({
      id: signup.body.companyId,
      name: `${runId} Session Co`,
    });
    expect(me.body.memberships).toEqual([
      expect.objectContaining({
        companyId: signup.body.companyId,
        role: "OWNER",
        status: "ACTIVE",
        company: expect.objectContaining({ name: `${runId} Session Co` }),
      }),
    ]);
  });

  it("switches active company and scopes member reports to the selected company", async () => {
    const agent = request.agent(app);
    const email = `switch-user@${emailDomain}`;
    const signup = await agent.post("/api/auth/signup").send({
      email,
      password,
      name: "Switch User",
      company: `${runId} Alpha`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const betaCompany = await db
      .insert(companies)
      .values({ name: `${runId} Beta`, tier: "GROWTH", industry: "Retail" })
      .returning();
    await db.insert(companyMemberships).values({
      userId: signup.body.id,
      companyId: betaCompany[0].id,
      role: "MEMBER",
      status: "ACTIVE",
    });

    await db.insert(clientReports).values([
      {
        companyId: signup.body.companyId,
        title: "Alpha Research",
        description: "Alpha only",
        status: "Completed",
      },
      {
        companyId: betaCompany[0].id,
        title: "Beta Research",
        description: "Beta only",
        status: "Completed",
      },
    ]);

    const login = await agent.post("/api/auth/login").send({ email, password });
    expect(login.status).toBe(200);

    const alphaReports = await agent.get("/api/member/client-reports");
    expect(alphaReports.status).toBe(200);
    expect(alphaReports.body.map((report: { title: string }) => report.title)).toEqual([
      "Alpha Research",
    ]);

    const switchResponse = await agent
      .post("/api/member/active-company")
      .send({ companyId: betaCompany[0].id });
    expect(switchResponse.status).toBe(200);
    expect(switchResponse.body.activeCompany).toMatchObject({
      id: betaCompany[0].id,
      name: `${runId} Beta`,
    });

    const betaReports = await agent.get("/api/member/client-reports");
    expect(betaReports.status).toBe(200);
    expect(betaReports.body.map((report: { title: string }) => report.title)).toEqual([
      "Beta Research",
    ]);
  });

  it("does not include same-user briefs or studies from inactive companies", async () => {
    const agent = request.agent(app);
    const email = `same-user@${emailDomain}`;
    const signup = await agent.post("/api/auth/signup").send({
      email,
      password,
      name: "Same User",
      company: `${runId} Active`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const inactiveCompany = await db
      .insert(companies)
      .values({ name: `${runId} Inactive`, tier: "GROWTH", industry: "Retail" })
      .returning();
    await db.insert(companyMemberships).values({
      userId: signup.body.id,
      companyId: inactiveCompany[0].id,
      role: "MEMBER",
      status: "ACTIVE",
    });

    await db.insert(briefSubmissions).values([
      {
        submittedByName: "Same User",
        submittedByEmail: email,
        companyId: signup.body.companyId,
        companyName: `${runId} Active`,
        studyType: "basic",
        researchObjective: "Alpha objective",
        status: "new",
      },
      {
        submittedByName: "Same User",
        submittedByEmail: email,
        companyId: inactiveCompany[0].id,
        companyName: `${runId} Inactive`,
        studyType: "basic",
        researchObjective: "Beta objective",
        status: "new",
      },
    ]);
    await db.insert(studies).values([
      {
        companyId: signup.body.companyId,
        companyName: `${runId} Active`,
        title: "Active Study",
        studyType: "basic",
        status: "NEW",
        submittedByEmail: email,
        submittedByName: "Same User",
      },
      {
        companyId: inactiveCompany[0].id,
        companyName: `${runId} Inactive`,
        title: "Inactive Study",
        studyType: "basic",
        status: "NEW",
        submittedByEmail: email,
        submittedByName: "Same User",
      },
    ]);

    const login = await agent.post("/api/auth/login").send({ email, password });
    expect(login.status).toBe(200);

    const briefs = await agent.get("/api/member/briefs");
    expect(briefs.status).toBe(200);
    expect(briefs.body.map((brief: { researchObjective: string }) => brief.researchObjective)).toEqual([
      "Alpha objective",
    ]);

    const userStudies = await agent.get("/api/member/studies");
    expect(userStudies.status).toBe(200);
    expect(userStudies.body.map((study: { title: string }) => study.title)).toEqual([
      "Active Study",
    ]);
  });

  it("returns only active deals available to the active company and user", async () => {
    const agent = request.agent(app);
    const email = `deals-user@${emailDomain}`;
    const signup = await agent.post("/api/auth/signup").send({
      email,
      password,
      name: "Deals User",
      company: `${runId} Deals Alpha`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const betaCompany = await db
      .insert(companies)
      .values({ name: `${runId} Deals Beta`, tier: "GROWTH", industry: "Retail" })
      .returning();

    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    await db.insert(deals).values([
      {
        title: `${runId} Alpha Deal`,
        description: "Visible to active company",
        headlineOffer: "Alpha",
        createdByUserId: signup.body.id,
        ownerCompanyId: signup.body.companyId,
        validFrom: past,
        validTo: future,
        isActive: true,
      },
      {
        title: `${runId} Beta Deal`,
        description: "Wrong company",
        headlineOffer: "Beta",
        createdByUserId: signup.body.id,
        ownerCompanyId: betaCompany[0].id,
        validFrom: past,
        validTo: future,
        isActive: true,
      },
      {
        title: `${runId} Other User Deal`,
        description: "Wrong user target",
        headlineOffer: "Target",
        createdByUserId: signup.body.id,
        ownerCompanyId: signup.body.companyId,
        targetUserIds: ["some-other-user"],
        validFrom: past,
        validTo: future,
        isActive: true,
      },
      {
        title: `${runId} Expired Deal`,
        description: "Expired",
        headlineOffer: "Expired",
        createdByUserId: signup.body.id,
        ownerCompanyId: signup.body.companyId,
        validFrom: past,
        validTo: past,
        isActive: true,
      },
    ]);

    const login = await agent.post("/api/auth/login").send({ email, password });
    expect(login.status).toBe(200);

    const response = await agent.get("/api/member/deals");

    expect(response.status).toBe(200);
    const tenantDealTitles = response.body
      .map((deal: { title: string }) => deal.title)
      .filter((title: string) => title.startsWith(runId));
    expect(tenantDealTitles).toEqual([`${runId} Alpha Deal`]);
  });

  it("accepts email-bound invites once and enforces company roles", async () => {
    const owner = request.agent(app);
    const ownerEmail = `owner@${emailDomain}`;
    const invitedEmail = `invited@${emailDomain}`;
    const wrongEmail = `wrong@${emailDomain}`;

    const ownerSignup = await owner.post("/api/auth/signup").send({
      email: ownerEmail,
      password,
      name: "Owner",
      company: `${runId} Invite Co`,
      industry: "Retail",
    });
    expect(ownerSignup.status).toBe(201);
    expect((await owner.post("/api/auth/login").send({ email: ownerEmail, password })).status).toBe(200);

    const invite = await owner.post("/api/member/invites").send({
      email: invitedEmail,
      role: "MEMBER",
    });
    expect(invite.status, JSON.stringify(invite.body)).toBe(201);
    expect(invite.body.token).toEqual(expect.any(String));

    const wrongUser = request.agent(app);
    expect((await wrongUser.post("/api/auth/signup").send({
      email: wrongEmail,
      password,
      name: "Wrong User",
      company: `${runId} Wrong Co`,
      industry: "Retail",
    })).status).toBe(201);
    expect((await wrongUser.post("/api/auth/login").send({ email: wrongEmail, password })).status).toBe(200);
    const wrongAccept = await wrongUser.post("/api/member/invites/accept").send({ token: invite.body.token });
    expect(wrongAccept.status).toBe(403);

    const invitedUser = request.agent(app);
    expect((await invitedUser.post("/api/auth/signup").send({
      email: invitedEmail,
      password,
      name: "Invited User",
      company: `${runId} Invited Own Co`,
      industry: "Retail",
    })).status).toBe(201);
    expect((await invitedUser.post("/api/auth/login").send({ email: invitedEmail, password })).status).toBe(200);

    const accepted = await invitedUser.post("/api/member/invites/accept").send({ token: invite.body.token });
    expect(accepted.status).toBe(200);
    expect(accepted.body.activeCompany).toMatchObject({
      id: ownerSignup.body.companyId,
      name: `${runId} Invite Co`,
    });
    expect(accepted.body.memberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          companyId: ownerSignup.body.companyId,
          role: "MEMBER",
        }),
      ]),
    );

    const usedAgain = await invitedUser.post("/api/member/invites/accept").send({ token: invite.body.token });
    expect(usedAgain.status).toBe(400);

    const memberInvite = await invitedUser.post("/api/member/invites").send({
      email: `member-created@${emailDomain}`,
      role: "MEMBER",
    });
    expect(memberInvite.status).toBe(403);

    const expiredToken = "expired-token";
    await db.insert(companyInvites).values({
      companyId: ownerSignup.body.companyId,
      email: invitedEmail,
      role: "MEMBER",
      tokenHash: crypto.createHash("sha256").update(expiredToken).digest("hex"),
      invitedByUserId: ownerSignup.body.id,
      expiresAt: new Date(Date.now() - 60_000),
    });

    const expiredAccept = await invitedUser.post("/api/member/invites/accept").send({ token: expiredToken });
    expect(expiredAccept.status).toBe(400);
  });

  it("denies brief file paths whose DB owner is another company", async () => {
    const agent = request.agent(app);
    const email = `file-user@${emailDomain}`;
    const signup = await agent.post("/api/auth/signup").send({
      email,
      password,
      name: "File User",
      company: `${runId} File Active`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const otherCompany = await db
      .insert(companies)
      .values({ name: `${runId} File Other`, tier: "GROWTH", industry: "Retail" })
      .returning();

    const activeSegment = `${runId} File Active`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
    const storagePath = `briefs/${activeSegment}/leak.pdf`;

    await db.insert(briefFiles).values({
      briefId: "test-brief",
      userId: signup.body.id,
      companyId: otherCompany[0].id,
      fileName: "leak.pdf",
      fileSize: 10,
      mimeType: "application/pdf",
      storagePath,
    });

    expect((await agent.post("/api/auth/login").send({ email, password })).status).toBe(200);

    const response = await agent.get(`/api/files/${storagePath}`);
    expect(response.status).toBe(403);
  });

  it("denies client report files when the DB owner does not match the active company", async () => {
    const agent = request.agent(app);
    const signup = await agent.post("/api/auth/signup").send({
      email: `client-file-owner@${emailDomain}`,
      password,
      name: "Client File Owner",
      company: `${runId} File Active`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const otherCompany = await db
      .insert(companies)
      .values({ name: `${runId} File Other`, tier: "GROWTH", industry: "Retail" })
      .returning();
    const spoofedPath = `client_reports/${signup.body.companyId}/spoofed.pdf`;
    await db.insert(clientReports).values({
      companyId: otherCompany[0].id,
      title: `${runId} Spoofed Client Report`,
      status: "Completed",
      pdfUrl: `/api/files/${spoofedPath}`,
    });

    expect((await agent.post("/api/auth/login").send({ email: `client-file-owner@${emailDomain}`, password })).status).toBe(200);

    const response = await agent.get(`/api/files/${spoofedPath}`);
    expect(response.status).toBe(403);
  });

  it("default-denies unknown authenticated file prefixes", async () => {
    const agent = request.agent(app);
    const email = `unknown-file-prefix@${emailDomain}`;
    const signup = await agent.post("/api/auth/signup").send({
      email,
      password,
      name: "Unknown File Prefix",
      company: `${runId} Unknown File Prefix`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);
    expect((await agent.post("/api/auth/login").send({ email, password })).status).toBe(200);

    const response = await agent.get("/api/files/unowned/private.pdf");
    expect(response.status).toBe(403);
  });

  it("denies library report files assigned to another company", async () => {
    const agent = request.agent(app);
    const signup = await agent.post("/api/auth/signup").send({
      email: `library-file-owner@${emailDomain}`,
      password,
      name: "Library File Owner",
      company: `${runId} Library File Active`,
      industry: "Retail",
    });
    expect(signup.status).toBe(201);

    const otherCompany = await db
      .insert(companies)
      .values({ name: `${runId} Library File Other`, tier: "GROWTH", industry: "Retail" })
      .returning();
    await db.insert(reports).values({
      title: `${runId} Private Library Report`,
      slug: `${runId}-private-library-report`,
      category: "Insights",
      industry: "Retail",
      status: "published",
      pdfUrl: "/api/files/reports/private-library-report.pdf",
      clientCompanyIds: [otherCompany[0].id],
    });

    expect((await agent.post("/api/auth/login").send({ email: `library-file-owner@${emailDomain}`, password })).status).toBe(200);

    const response = await agent.get("/api/files/reports/private-library-report.pdf");
    expect(response.status).toBe(403);
  });

  it("uses server-side admin company context for member report views", async () => {
    const admin = request.agent(app);
    const adminEmail = `admin@${emailDomain}`;
    const adminSignup = await admin.post("/api/auth/signup").send({
      email: adminEmail,
      password,
      name: "Admin User",
      company: `${runId} Admin Own`,
      industry: "Retail",
    });
    expect(adminSignup.status).toBe(201);
    await db.update(users).set({ role: "ADMIN" }).where(eq(users.id, adminSignup.body.id));

    const companyA = await db
      .insert(companies)
      .values({ name: `${runId} Admin A`, tier: "GROWTH", industry: "Retail" })
      .returning();
    const companyB = await db
      .insert(companies)
      .values({ name: `${runId} Admin B`, tier: "GROWTH", industry: "Retail" })
      .returning();
    await db.insert(clientReports).values([
      {
        companyId: companyA[0].id,
        title: `${runId} Admin A Report`,
        status: "Completed",
      },
      {
        companyId: companyB[0].id,
        title: `${runId} Admin B Report`,
        status: "Completed",
      },
    ]);

    expect((await admin.post("/api/auth/login").send({ email: adminEmail, password })).status).toBe(200);

    const beforeViewAs = await admin.get("/api/member/client-reports");
    expect(beforeViewAs.body.map((report: { title: string }) => report.title).filter((title: string) => title.startsWith(runId))).toEqual([]);

    const viewAs = await admin.post("/api/admin/session-company").send({ companyId: companyA[0].id });
    expect(viewAs.status).toBe(200);

    const scopedReports = await admin.get("/api/member/client-reports");
    expect(scopedReports.body.map((report: { title: string }) => report.title).filter((title: string) => title.startsWith(runId))).toEqual([
      `${runId} Admin A Report`,
    ]);
  });
});
