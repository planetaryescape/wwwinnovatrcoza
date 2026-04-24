import { asc, eq, sql } from "drizzle-orm";
import { consultOfferTemplates, type ClientReport, type Report, type Study } from "@shared/schema";
import { db } from "./db";
import { resolveIndustryGroups } from "./pdf-library";
import type { IStorage } from "./storage";

const VIO = "#3A2FBF";
const VIO_LT = "#EAE8FF";
const CORAL = "#E8503A";
const CORAL_LT = "#FDECEA";
const SUCCESS = "#2A9E5C";
const SUCCESS_LT = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CYAN_DK = "#1A8FAD";
const CYAN_LT = "#DFF6FC";

const LIVE_STUDY_STATUSES = ["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA"];

type PortalContext = {
  companyId?: string | null;
  email: string;
  isAdmin: boolean;
};

type EnrichedClientReport = ClientReport & {
  companyName?: string;
};

type DraftGap = {
  key: string;
  severity: "high" | "medium" | "opportunity";
  title: string;
  desc: string;
  cta: string | null;
  ctaAction: string | null;
  ctaHref?: string | null;
};

type DraftStep = {
  key: string;
  title: string;
  desc: string;
  action: string;
  primary: boolean;
  href?: string | null;
};

type PersistedGap = {
  id: string;
  severity?: "high" | "medium" | "opportunity";
  title: string;
  desc: string;
  cta?: string | null;
  ctaAction?: string | null;
  ctaHref?: string | null;
  conceptId?: string | null;
};

type PersistedNextStep = {
  id: string;
  title: string;
  desc: string;
  action?: string | null;
  primary?: boolean;
  href?: string | null;
  conceptId?: string | null;
};

export type PortalSignal = {
  id: string;
  reportId: string;
  slug: string | null;
  tag: string;
  tagBg: string;
  tagColor: string;
  title: string;
  meta: string;
  chip: { label: string; bg: string; color: string };
};

export type PortalRecommendationGap = {
  id: string;
  priority: number;
  title: string;
  chip: { label: string; bg: string; color: string };
  desc: string;
  cta: string | null;
  ctaAction: string | null;
  ctaHref?: string | null;
  priorityStyle: { bg: string; color: string };
};

export type PortalRecommendationStep = {
  id: string;
  num: number;
  title: string;
  desc: string;
  cta: { label: string; action: string; primary: boolean; href?: string | null } | null;
  locked: boolean;
  lockedReason?: string;
};

export type PortalCoverageItem = {
  id: string;
  category: string;
  chip: { label: string; bg: string; color: string };
};

export type PortalConsultOffer = {
  id: string;
  serviceType: string;
  title: string;
  desc: string;
  note: string | null;
  badgeLabel: string;
};

export type PortalFeed = {
  signals: PortalSignal[];
  gaps: PortalRecommendationGap[];
  nextSteps: PortalRecommendationStep[];
  coverage: PortalCoverageItem[];
  planningPrompts: string[];
  consultOffers: PortalConsultOffer[];
};

function truncateText(value: string | null | undefined, max: number) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function formatShortDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStudyType(value: string | null | undefined) {
  if (!value) return "study";
  const key = value.toLowerCase();
  if (key === "basic" || key.includes("basic")) return "Test24 Basic";
  if (key === "pro" || key.includes("pro")) return "Test24 Pro";
  return value.replace(/_/g, " ");
}

function formatStudyStatus(value: string) {
  switch (value) {
    case "AUDIENCE_LIVE":
      return "in field";
    case "ANALYSING_DATA":
      return "analysing";
    case "COMPLETED":
      return "completed";
    case "NEW":
      return "new";
    default:
      return value.toLowerCase().replace(/_/g, " ");
  }
}

function resolveReportAudience(reportIndustry: string | null | undefined): string[] {
  if (!reportIndustry) return ["cross-industry"];
  const key = reportIndustry.toLowerCase().trim();
  if (/bank|financ|fintech|insur/.test(key)) return ["finance"];
  if (/^fmcg$/.test(key)) return ["fmcg", "food", "beverage", "qsr", "retail"];
  if (/^food$|food manufactur|food prod/.test(key)) return ["food", "beverage", "fmcg"];
  if (/beverag|drink|wine|spirit|brew|alco/.test(key)) return ["beverage", "food", "fmcg"];
  if (/beauty|cosmetic|skincare|hair/.test(key)) return ["beauty"];
  if (/personal care/.test(key)) return ["beauty", "health"];
  if (/health|wellness|pharma|medical|nutrition|fitness/.test(key)) return ["health", "beauty"];
  if (/retail|ecommerce|e-commerce|supermarket|grocery/.test(key)) return ["retail", "food", "beverage"];
  if (/agri|farm|crop/.test(key)) return ["food"];
  if (/restaurant|qsr|quick service|fast food/.test(key)) return ["qsr", "food", "beverage"];
  return ["cross-industry"];
}

function getSignalTagStyle(category: string | null | undefined) {
  switch (category) {
    case "Launch":
      return { bg: CORAL_LT, color: CORAL };
    case "Inside":
      return { bg: SUCCESS_LT, color: SUCCESS };
    case "IRL":
      return { bg: CYAN_LT, color: CYAN_DK };
    default:
      return { bg: VIO_LT, color: VIO };
  }
}

function getSignalChip(report: Report) {
  const publishedRecently = Date.now() - new Date(report.date).getTime() <= 1000 * 60 * 60 * 24 * 14;
  if (report.isFeatured) {
    return { label: "Featured", bg: CORAL_LT, color: CORAL };
  }
  if (publishedRecently) {
    return { label: "New", bg: SUCCESS_LT, color: SUCCESS };
  }
  if ((report.viewCount ?? 0) >= 10) {
    return { label: "Popular", bg: AMBER_LT, color: AMBER_DK };
  }
  return { label: report.category ?? "Report", bg: VIO_LT, color: VIO };
}

function buildSignalMeta(report: Report) {
  const teaser = truncateText(report.teaser, 110);
  if (teaser) return teaser;

  const parts = [report.industry, report.category, formatShortDate(report.date)].filter(Boolean);
  return parts.join(" · ");
}

function getGapStyle(severity: DraftGap["severity"]) {
  if (severity === "high") {
    return {
      chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
      priorityStyle: { bg: CORAL_LT, color: CORAL },
    };
  }
  if (severity === "medium") {
    return {
      chip: { label: "Attention", bg: AMBER_LT, color: AMBER_DK },
      priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
    };
  }
  return {
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    priorityStyle: { bg: VIO_LT, color: VIO },
  };
}

function buildReportHref(reportId: string | null | undefined, conceptId?: string | null) {
  if (!reportId) return null;
  const params = new URLSearchParams({ tab: "concepts" });
  if (conceptId) params.set("concept", conceptId);
  return `/portal/reports/${reportId}?${params.toString()}`;
}

async function buildPersistedRecommendations(ctx: PortalContext) {
  if (!ctx.isAdmin && !ctx.companyId) {
    return { gaps: [], nextSteps: [] };
  }

  const scopeSql = ctx.isAdmin
    ? sql`TRUE`
    : sql`si.company_id = ${ctx.companyId!}`;

  const rawRows = await db.execute<{
    project_id: string;
    project_name: string;
    company_name: string;
    report_id: string | null;
    market_gaps: PersistedGap[] | null;
    next_steps: PersistedNextStep[] | null;
    created_at: string;
  }>(sql`
    SELECT DISTINCT ON (s.public_project_id)
      s.public_project_id AS project_id,
      p.name AS project_name,
      c.name AS company_name,
      cr.id AS report_id,
      si.market_gaps,
      si.next_steps,
      s.created_at
    FROM dig.study_insights si
    JOIN dig.studies s
      ON s.id = si.dig_study_id
    JOIN public.projects p
      ON p.id = s.public_project_id
    JOIN public.companies c
      ON c.id = p.company_id
    LEFT JOIN LATERAL (
      SELECT cr.id
      FROM public.client_reports cr
      WHERE cr.id = s.public_client_report_id
        OR (
          s.public_client_report_id IS NULL
          AND cr.project_id = s.public_project_id
          AND cr.company_id = s.company_id
          AND cr.is_archived = false
        )
      ORDER BY
        CASE WHEN cr.id = s.public_client_report_id THEN 0 ELSE 1 END,
        COALESCE(cr.delivered_at, cr.uploaded_at, cr.created_at) DESC
      LIMIT 1
    ) cr ON TRUE
    WHERE ${scopeSql}
    ORDER BY s.public_project_id, s.created_at DESC
  `);
  const rows = Array.from(rawRows as Iterable<{
    project_id: string;
    project_name: string;
    company_name: string;
    report_id: string | null;
    market_gaps: PersistedGap[] | null;
    next_steps: PersistedNextStep[] | null;
    created_at: string;
  }>);

  const gaps: PortalRecommendationGap[] = [];
  const nextSteps: PortalRecommendationStep[] = [];

  for (const row of rows) {
    for (const gap of row.market_gaps ?? []) {
      if (gaps.some((existing) => existing.id === gap.id)) continue;
      const style = getGapStyle(gap.severity ?? "medium");
      const evidenceHref = gap.ctaHref ?? buildReportHref(row.report_id, gap.conceptId);
      const isLegacyTestCta =
        (gap.ctaAction ?? "").toLowerCase() === "test" ||
        (gap.cta ?? "").toLowerCase() === "open test";
      gaps.push({
        id: gap.id,
        priority: gaps.length + 1,
        title: gap.title,
        chip: style.chip,
        desc: gap.desc,
        cta: evidenceHref ? "View evidence" : isLegacyTestCta ? null : gap.cta ?? null,
        ctaAction: evidenceHref ? "evidence" : isLegacyTestCta ? null : gap.ctaAction ?? null,
        ctaHref: evidenceHref,
        priorityStyle: style.priorityStyle,
      });
    }

    for (const step of row.next_steps ?? []) {
      if (nextSteps.some((existing) => existing.id === step.id)) continue;
      const primary = step.primary ?? nextSteps.length === 0;
      const evidenceHref = step.href ?? buildReportHref(row.report_id, step.conceptId);
      nextSteps.push({
        id: step.id,
        num: nextSteps.length + 1,
        title: step.title,
        desc: step.desc,
        cta: {
          label: evidenceHref ? "View evidence →" : primary ? "Open Test →" : "View Test →",
          action: evidenceHref ? "evidence" : step.action ?? "test",
          primary,
          href: evidenceHref,
        },
        locked: false,
      });
    }
  }

  return {
    gaps: gaps.slice(0, 4),
    nextSteps: nextSteps.slice(0, 4),
  };
}

async function getScopedReports(storage: IStorage, ctx: PortalContext) {
  const reports = await storage.getAllReports();

  if (ctx.isAdmin) {
    return reports.filter((report) => report.status === "published" && !report.isArchived);
  }

  const company = ctx.companyId ? await storage.getCompany(ctx.companyId) : null;
  const industryGroups = resolveIndustryGroups(company?.industry ?? null);

  return reports.filter((report) => {
    if (report.status !== "published" || report.isArchived) return false;

    if (report.clientCompanyIds && report.clientCompanyIds.length > 0) {
      return !!(ctx.companyId && report.clientCompanyIds.includes(ctx.companyId));
    }

    const audience = resolveReportAudience(report.industry);
    if (audience.includes("cross-industry")) return true;
    if (!industryGroups) return true;
    return audience.some((tag) => industryGroups.includes(tag));
  });
}

async function getScopedStudies(storage: IStorage, ctx: PortalContext) {
  if (ctx.isAdmin) {
    return storage.getAllStudies();
  }

  const scopedStudies = await storage.getStudiesByEmail(ctx.email);
  if (!ctx.companyId) return scopedStudies;

  const companyStudies = await storage.getStudiesByCompanyId(ctx.companyId);
  const seenIds = scopedStudies.map((study) => study.id);

  for (const study of companyStudies) {
    if (!seenIds.includes(study.id)) {
      scopedStudies.push(study);
      seenIds.push(study.id);
    }
  }

  return scopedStudies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function getScopedClientReports(storage: IStorage, ctx: PortalContext): Promise<EnrichedClientReport[]> {
  if (ctx.isAdmin) {
    const [allReports, companies] = await Promise.all([
      storage.getAllClientReports(),
      storage.getAllCompanies(),
    ]);
    const companyMap: Record<string, string> = {};
    for (const company of companies) {
      companyMap[company.id] = company.name;
    }
    return allReports.map((report) => ({
      ...report,
      companyName: companyMap[report.companyId] ?? "Unknown Company",
    }));
  }

  if (!ctx.companyId) return [];

  const [reports, company] = await Promise.all([
    storage.getClientReportsByCompanyId(ctx.companyId),
    storage.getCompany(ctx.companyId),
  ]);

  return reports.map((report) => ({
    ...report,
    companyName: company?.name ?? "Unknown Company",
  }));
}

function buildSignals(reports: Report[]): PortalSignal[] {
  const signalReports = reports
    .filter((report) => !report.clientCompanyIds || report.clientCompanyIds.length === 0)
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    });

  return signalReports.map((report) => {
    const tagStyle = getSignalTagStyle(report.category);
    return {
      id: report.id,
      reportId: report.id,
      slug: report.slug ?? null,
      tag: report.category ?? "Insights",
      tagBg: tagStyle.bg,
      tagColor: tagStyle.color,
      title: report.title,
      meta: buildSignalMeta(report),
      chip: getSignalChip(report),
    };
  });
}

function buildRecommendations(studies: Study[], clientReports: EnrichedClientReport[]) {
  const liveStudies = studies
    .filter((study) => LIVE_STUDY_STATUSES.includes(study.status))
    .sort((a, b) => new Date(b.statusUpdatedAt).getTime() - new Date(a.statusUpdatedAt).getTime());

  const completedReports = [...clientReports].sort((a, b) => {
    const aDate = new Date(a.deliveredAt ?? a.uploadedAt ?? a.createdAt).getTime();
    const bDate = new Date(b.deliveredAt ?? b.uploadedAt ?? b.createdAt).getTime();
    return bDate - aDate;
  });

  const draftGaps: DraftGap[] = [];
  const draftSteps: DraftStep[] = [];
  const gapKeys: string[] = [];
  const stepKeys: string[] = [];

  const pushGap = (gap: DraftGap) => {
    if (gapKeys.includes(gap.key)) return;
    gapKeys.push(gap.key);
    draftGaps.push(gap);
  };

  const pushStep = (step: DraftStep) => {
    if (stepKeys.includes(step.key)) return;
    stepKeys.push(step.key);
    draftSteps.push(step);
  };

  for (const study of liveStudies.slice(0, 2)) {
    pushGap({
      key: `live-study:${study.id}`,
      severity: "medium",
      title: `${study.title} is still in field`,
      desc: `${study.companyName} has a ${formatStudyType(study.studyType)} currently ${formatStudyStatus(study.status)}. Hold downstream decisions until the results land.`,
      cta: "Open Test",
      ctaAction: "test",
    });

    pushStep({
      key: `monitor-study:${study.id}`,
      title: `Monitor ${study.title} until fieldwork closes`,
      desc: `Keep this ${formatStudyType(study.studyType)} moving and review the output as soon as it is ready so the next brief is driven by evidence, not assumption.`,
      action: "test",
      primary: false,
    });
  }

  for (const report of completedReports.slice(0, 6)) {
    const sourceTitle = report.companyName ? `${report.companyName} — ${report.title}` : report.title;
    const topIdeaLabel = report.topIdeaLabel || "the leading concept";
    const topIdeaScore = report.topIdeaIdeaScore ?? null;
    const interest = report.topIdeaInterest ?? null;
    const commitment = report.topIdeaCommitment ?? null;
    const lowestIdeaLabel = report.lowestIdeaLabel || "the weakest concept";
    const lowestIdeaScore = report.lowestIdeaIdeaScore ?? null;

    if (interest !== null && commitment !== null && interest - commitment >= 10) {
      const gap = interest - commitment;
      pushGap({
        key: `commitment-gap:${report.id}`,
        severity: "high",
        title: `Commitment gap on ${sourceTitle}`,
        desc: `${topIdeaLabel} is at ${interest}% interest but ${commitment}% commitment. People like it, but the purchase case is not landing yet.`,
        cta: "View evidence",
        ctaAction: "evidence",
        ctaHref: buildReportHref(report.id),
      });

      pushStep({
        key: `close-gap:${report.id}`,
        title: `Close the ${gap}pt commitment gap on ${topIdeaLabel}`,
        desc: `Run a follow-up test on pricing, pack, or messaging variants for ${sourceTitle} before moving this concept further into market.`,
        action: "evidence",
        primary: true,
        href: buildReportHref(report.id),
      });
    }

    if (topIdeaScore !== null && topIdeaScore >= 70) {
      pushStep({
        key: `progress-winner:${report.id}`,
        title: `Progress ${topIdeaLabel} from validation to execution`,
        desc: `${sourceTitle} already has a ${topIdeaScore}% idea score. Move it into packaging, execution, or launch messaging validation while the signal is strong.`,
        action: "evidence",
        primary: draftSteps.length === 0,
        href: buildReportHref(report.id),
      });
    }

    if (lowestIdeaScore !== null && lowestIdeaScore <= 55) {
      pushGap({
        key: `weakest-concept:${report.id}`,
        severity: "medium",
        title: `${lowestIdeaLabel} is underperforming`,
        desc: `${sourceTitle} shows ${lowestIdeaLabel} at ${lowestIdeaScore}%. Review or retire it before it absorbs more time and budget.`,
        cta: "View evidence",
        ctaAction: "evidence",
        ctaHref: buildReportHref(report.id),
      });
    }
  }

  if (draftGaps.length === 0) {
    if (completedReports.length > 0) {
      const mostRecent = completedReports[0];
      pushGap({
        key: "portfolio-follow-through",
        severity: "opportunity",
        title: "Your latest research needs a clear next move",
        desc: `${mostRecent.companyName ? `${mostRecent.companyName} — ` : ""}${mostRecent.title} is complete. Convert the result into a concrete follow-up before the learning goes stale.`,
        cta: "View evidence",
        ctaAction: "evidence",
        ctaHref: buildReportHref(mostRecent.id),
      });
    } else {
      pushGap({
        key: "no-research-yet",
        severity: "high",
        title: "No completed research in this portfolio yet",
        desc: "There is nothing persisted yet to turn into recommendations. The next move is to launch or finish a real study first.",
        cta: "Launch a Brief",
        ctaAction: "launch",
      });
    }
  }

  if (draftSteps.length === 0) {
    if (completedReports.length > 0) {
      const mostRecent = completedReports[0];
      pushStep({
        key: "review-latest-report",
        title: `Review ${mostRecent.title} and brief the next test`,
        desc: "Use the strongest and weakest concepts in your latest report to define the next validation question instead of starting cold.",
        action: "evidence",
        primary: true,
        href: buildReportHref(mostRecent.id),
      });
    } else {
      pushStep({
        key: "launch-first-brief",
        title: "Launch your first Test24 brief",
        desc: "You need one real study in the system before the portal can surface evidence-based next steps.",
        action: "launch",
        primary: true,
      });
    }
  }

  const gaps = draftGaps.slice(0, 4).map((gap, index) => {
    const style = getGapStyle(gap.severity);
    return {
      id: gap.key,
      priority: index + 1,
      title: gap.title,
      chip: style.chip,
      desc: gap.desc,
      cta: gap.cta,
      ctaAction: gap.ctaAction,
      ctaHref: gap.ctaHref ?? null,
      priorityStyle: style.priorityStyle,
    };
  });

  const nextSteps = draftSteps.slice(0, 4).map((step, index) => ({
    id: step.key,
    num: index + 1,
    title: step.title,
    desc: step.desc,
    cta: {
      label: step.href ? "View evidence →" : step.action === "launch" ? "Launch a Brief →" : step.primary ? "Open Test →" : "View Test →",
      action: step.action,
      primary: step.primary,
      href: step.href ?? null,
    },
    locked: false,
  }));

  return { gaps, nextSteps };
}

function buildCoverage(
  signals: PortalSignal[],
  studies: Study[],
  clientReports: EnrichedClientReport[],
  recommendations: { gaps: PortalRecommendationGap[]; nextSteps: PortalRecommendationStep[] },
): PortalCoverageItem[] {
  const activeStudies = studies.filter((study) => LIVE_STUDY_STATUSES.includes(study.status)).length;
  const completedStudies = studies.filter((study) => study.status === "COMPLETED").length;
  const reportCount = clientReports.length;
  const nextStepCount = recommendations.nextSteps.filter((step) => !step.locked).length;

  return [
    {
      id: "signals-library",
      category: "Signals library",
      chip: signals.length > 0
        ? { label: `${signals.length} live`, bg: VIO_LT, color: VIO }
        : { label: "Empty", bg: "#F5F5F5", color: "#8A7260" },
    },
    {
      id: "live-fieldwork",
      category: "Live fieldwork",
      chip: activeStudies > 0
        ? { label: `${activeStudies} active`, bg: AMBER_LT, color: AMBER_DK }
        : { label: "Idle", bg: "#F5F5F5", color: "#8A7260" },
    },
    {
      id: "reports-memory",
      category: "Reports in memory",
      chip: reportCount > 0
        ? { label: `${reportCount} stored`, bg: CYAN_LT, color: CYAN_DK }
        : { label: "None", bg: "#F5F5F5", color: "#8A7260" },
    },
    {
      id: "action-playbook",
      category: "Action playbook",
      chip: nextStepCount > 0
        ? { label: `${nextStepCount} ready`, bg: SUCCESS_LT, color: SUCCESS }
        : recommendations.gaps.length > 0
          ? { label: `${recommendations.gaps.length} gaps`, bg: CORAL_LT, color: CORAL }
          : { label: "Waiting", bg: "#F5F5F5", color: "#8A7260" },
    },
    {
      id: "completed-studies",
      category: "Completed studies",
      chip: completedStudies > 0
        ? { label: `${completedStudies} complete`, bg: SUCCESS_LT, color: SUCCESS }
        : { label: "None", bg: "#F5F5F5", color: "#8A7260" },
    },
  ].slice(0, 4);
}

function buildPlanningPrompts(
  studies: Study[],
  clientReports: EnrichedClientReport[],
  recommendations: { gaps: PortalRecommendationGap[]; nextSteps: PortalRecommendationStep[] },
): string[] {
  const prompts: string[] = [];
  const liveStudy = studies.find((study) => LIVE_STUDY_STATUSES.includes(study.status));
  const recentCompletedStudy = [...studies]
    .filter((study) => study.status === "COMPLETED")
    .sort((a, b) => new Date(b.statusUpdatedAt ?? b.deliveryDate ?? b.createdAt).getTime() - new Date(a.statusUpdatedAt ?? a.deliveryDate ?? a.createdAt).getTime())[0];
  const recentReport = [...clientReports]
    .sort((a, b) => new Date(b.deliveredAt ?? b.uploadedAt ?? b.createdAt).getTime() - new Date(a.deliveredAt ?? a.uploadedAt ?? a.createdAt).getTime())[0];

  const push = (value: string | null | undefined) => {
    if (!value) return;
    if (prompts.includes(value)) return;
    prompts.push(value);
  };

  push(recommendations.nextSteps[0] ? `Draft a brief for: ${recommendations.nextSteps[0].title}` : null);
  push(recommendations.gaps[0] ? `How do we close this gap: ${recommendations.gaps[0].title}?` : null);
  push(liveStudy ? `What should we monitor on ${liveStudy.title} while it is still live?` : null);
  push(recentCompletedStudy ? `What is the smartest follow-up after ${recentCompletedStudy.title}?` : null);
  push(recentReport ? `Summarise the biggest decision in ${recentReport.title} and what to test next.` : null);

  if (prompts.length === 0) {
    push("What should we learn first before launching the next study?");
    push("How should we sequence our next two pieces of research?");
  }

  return prompts.slice(0, 4);
}

function hasKeyword(items: string[], pattern: RegExp) {
  return items.some((item) => pattern.test(item));
}

function buildConsultContext(
  serviceType: string,
  studies: Study[],
  recommendations: { gaps: PortalRecommendationGap[]; nextSteps: PortalRecommendationStep[] },
): string {
  const liveStudy = studies.find((study) => LIVE_STUDY_STATUSES.includes(study.status));
  const texts = [
    ...recommendations.gaps.map((gap) => `${gap.title} ${gap.desc}`),
    ...recommendations.nextSteps.map((step) => `${step.title} ${step.desc}`),
  ];

  if (serviceType === "pricing") {
    const pricingGap = recommendations.gaps.find((gap) => /price|pricing|value|premium|worth/i.test(`${gap.title} ${gap.desc}`));
    const pricingStep = recommendations.nextSteps.find((step) => /price|pricing|value|premium|worth/i.test(`${step.title} ${step.desc}`));
    const target = pricingGap ?? pricingStep;
    if (target) return `Right now the sharpest value signal is: ${target.title}.`;
  }

  if (serviceType === "creative") {
    const creativeGap = recommendations.gaps.find((gap) => /pack|packaging|message|messag|creative|campaign|design|claim/i.test(`${gap.title} ${gap.desc}`));
    const creativeStep = recommendations.nextSteps.find((step) => /pack|packaging|message|messag|creative|campaign|design|claim/i.test(`${step.title} ${step.desc}`));
    const target = creativeGap ?? creativeStep;
    if (target) return `The clearest creative unlock in the portfolio is: ${target.title}.`;
  }

  if (serviceType === "strategy") {
    const target = recommendations.gaps[0] ?? recommendations.nextSteps[0];
    if (target) return `The highest-priority portfolio issue today is: ${target.title}.`;
  }

  if (serviceType === "execution" && liveStudy) {
    return `${liveStudy.title} is still live, so this is the right moment to line up execution work before results land.`;
  }

  if (liveStudy) {
    return `${liveStudy.title} is still active, which gives you a live decision window to plan around.`;
  }

  if (texts.length > 0) {
    return `This offer is matched to the current study and recommendation mix already in your portfolio.`;
  }

  return `This offer is matched to the current portfolio context now stored in the system.`;
}

async function buildConsultOffers(
  studies: Study[],
  clientReports: EnrichedClientReport[],
  recommendations: { gaps: PortalRecommendationGap[]; nextSteps: PortalRecommendationStep[] },
): Promise<PortalConsultOffer[]> {
  const templates = await db
    .select()
    .from(consultOfferTemplates)
    .where(eq(consultOfferTemplates.isActive, true))
    .orderBy(asc(consultOfferTemplates.sortOrder), asc(consultOfferTemplates.title));

  if (templates.length === 0) return [];

  const liveStudyCount = studies.filter((study) => LIVE_STUDY_STATUSES.includes(study.status)).length;
  const sourceTexts = [
    ...recommendations.gaps.map((gap) => `${gap.title} ${gap.desc}`),
    ...recommendations.nextSteps.map((step) => `${step.title} ${step.desc}`),
    ...studies.map((study) => `${study.title} ${study.description ?? ""} ${study.studyType}`),
    ...clientReports.map((report) => `${report.title} ${report.description ?? ""} ${report.studyType ?? ""}`),
  ];

  const derivedTags = new Set<string>();
  if (recommendations.gaps.length > 0) derivedTags.add("gap");
  if (recommendations.nextSteps.length > 0) derivedTags.add("strategy");
  if (clientReports.length > 0 || studies.length > 0) derivedTags.add("portfolio");
  if (liveStudyCount > 0) derivedTags.add("live");
  if (hasKeyword(sourceTexts, /commitment|chosen|decision|position|narrative/i)) derivedTags.add("commitment");
  if (hasKeyword(sourceTexts, /price|pricing|value|premium|worth/i)) derivedTags.add("pricing");
  if (hasKeyword(sourceTexts, /price|pricing|value|premium|worth/i)) derivedTags.add("value");
  if (hasKeyword(sourceTexts, /pack|packaging|message|messag|creative|campaign|design|claim/i)) derivedTags.add("creative");
  if (hasKeyword(sourceTexts, /pack|packaging/i)) derivedTags.add("pack");
  if (hasKeyword(sourceTexts, /message|messag|claim/i)) derivedTags.add("message");

  const scored = templates
    .map((template) => {
      const matches = (template.triggerTags ?? []).filter((tag) => derivedTags.has(tag));
      return { template, score: matches.length };
    })
    .filter(({ score }) => score > 0);

  const selected = (scored.length > 0 ? scored : templates.map((template) => ({ template, score: 0 })))
    .sort((a, b) => b.score - a.score || a.template.sortOrder - b.template.sortOrder)
    .slice(0, 2);

  return selected.map(({ template }) => ({
    id: template.id,
    serviceType: template.serviceType,
    title: template.title,
    desc: template.descriptionTemplate.replace("{context}", buildConsultContext(template.serviceType, studies, recommendations)),
    note: template.note ?? null,
    badgeLabel: template.badgeLabel,
  }));
}

export async function getPortalFeedData(storage: IStorage, ctx: PortalContext): Promise<PortalFeed> {
  const [reports, studies, clientReports] = await Promise.all([
    getScopedReports(storage, ctx),
    getScopedStudies(storage, ctx),
    getScopedClientReports(storage, ctx),
  ]);

  const signals = buildSignals(reports);
  const persistedRecommendations = await buildPersistedRecommendations(ctx);
  const recommendations =
    persistedRecommendations.gaps.length > 0 || persistedRecommendations.nextSteps.length > 0
      ? persistedRecommendations
      : buildRecommendations(studies, clientReports);
  const coverage = buildCoverage(signals, studies, clientReports, recommendations);
  const planningPrompts = buildPlanningPrompts(studies, clientReports, recommendations);
  const consultOffers = await buildConsultOffers(studies, clientReports, recommendations);

  return {
    signals,
    gaps: recommendations.gaps,
    nextSteps: recommendations.nextSteps,
    coverage,
    planningPrompts,
    consultOffers,
  };
}
