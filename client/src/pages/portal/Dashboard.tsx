import { useMemo, useEffect } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, ArrowRight, Sparkles, TrendingUp, BarChart3, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import type { Company } from "@shared/schema";

const CORAL = "#C45A38";
const EXPLORE_COLOR = "#2563EB";
const TEST_COLOR = "#059669";
const AMBER = "#B45309";
const WARN = "#DC2626";
const HEALTH_COLOR = "#7C3AED";

interface Report {
  id: number;
  title: string;
  teaser: string;
  slug: string;
  series: string;
  category: string;
  displayCategories?: string[];
  industry: string;
  publishDate: string;
  date: string;
  status: string;
  coverImage: string;
  pdfPath: string | null;
  hasDownload: boolean;
  videoPaths: string[];
  tags: string[];
  isNew: boolean;
  access: string;
  accessLevel: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isPaidMember } = useAuth();

  useEffect(() => {
    logActivity("view_dashboard");
  }, []);

  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ["/api/member/company", user?.companyId],
    queryFn: async () => {
      const response = await fetch(`/api/member/company?companyId=${user?.companyId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.companyId,
    retry: false,
  });

  const { data: userActivity, isLoading: isLoadingActivity } = useQuery<{
    studiesCompleted: number;
    liveStudies: number;
    reportsDownloaded: number;
    discountSaved: number;
    basicCreditsRemaining: number;
    proCreditsRemaining: number;
  }>({
    queryKey: ["/api/member/activity", user?.id],
    enabled: !!user,
  });

  const { data: clientReports, isLoading: isLoadingReports } = useQuery<any[]>({
    queryKey: ["/api/member/reports", user?.companyId],
    queryFn: async () => {
      const url = user?.companyId
        ? `/api/member/reports?companyId=${user.companyId}`
        : `/api/member/reports`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: dbReports } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  const basicCredits = userActivity?.basicCreditsRemaining ?? (company as any)?.basicCreditsRemaining ?? 0;
  const proCredits = userActivity?.proCreditsRemaining ?? (company as any)?.proCreditsRemaining ?? 0;
  const studiesDone = userActivity?.studiesCompleted ?? (clientReports?.length ?? 0);
  const liveStudies = userActivity?.liveStudies ?? 0;

  const getHourOfDay = () => new Date().getHours();
  const greeting = getHourOfDay() < 12 ? "Good morning" : getHourOfDay() < 17 ? "Good afternoon" : "Good evening";

  const recentStudies = useMemo(() => {
    if (!clientReports) return [];
    return clientReports.slice(0, 3);
  }, [clientReports]);

  const formatMetric = (val: number | null | undefined, suffix = "%") => {
    if (val === null || val === undefined) return "—";
    return `${Math.round(val)}${suffix}`;
  };

  const getMetricColor = (val: number | null | undefined) => {
    if (!val) return "text-muted-foreground";
    if (val >= 75) return "text-emerald-600";
    if (val >= 55) return "text-amber-700";
    return "text-red-600";
  };

  const getStatusBadge = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "complete":
      case "completed":
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#ECFDF5", color: "#059669" }}>Complete</span>;
      case "live":
      case "in_progress":
      case "in progress":
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FFFBEB", color: "#B45309" }}>In Progress</span>;
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#F3F4F6", color: "#6B7280" }}>{status || "Draft"}</span>;
    }
  };

  return (
    <PortalLayout>
      <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-background">
        {/* Page header */}
        <div className="px-6 pt-6 pb-0">
          <div className="text-[11px] font-semibold tracking-widest uppercase flex items-center gap-1.5 mb-1.5" style={{ color: CORAL }}>
            <Sparkles className="w-3 h-3" />
            {greeting}, {user?.name?.split(" ")[0]} &middot; {isPaidMember ? (user?.membershipTier?.toUpperCase() || "STARTER") : "FREE"} Tier
          </div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your intelligence hub — trends, live studies, and strategic signals, all in one place.
          </p>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Credit strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <CreditChip
              value={isLoadingActivity ? null : basicCredits}
              label="Basic credits"
              sub="available"
              color={TEST_COLOR}
              testId="stat-basic-credits"
            />
            <CreditChip
              value={isLoadingActivity ? null : proCredits}
              label="Pro credits"
              sub="available"
              color={EXPLORE_COLOR}
              testId="stat-pro-credits"
            />
            <CreditChip
              value={isLoadingActivity ? null : studiesDone}
              label="Studies done"
              sub="this year"
              color="#57534E"
              testId="stat-studies-done"
            />
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/portal/act")}
              data-testid="button-view-recommendations"
              className="text-xs"
            >
              View recommendations
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </div>

          {/* Journey phase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <JourneyCard
              num="1"
              question="What's happening?"
              title="Explore"
              subtitle="Trends & Insights · Sandbox · Market Signals"
              stat={`${isLoadingActivity ? "—" : "12"} signals active`}
              color={EXPLORE_COLOR}
              onClick={() => setLocation("/portal/explore")}
              testId="card-journey-explore"
            />
            <JourneyCard
              num="2"
              question="Does my idea work?"
              title="Test"
              subtitle="Projects Overview · Test24 · QA Results"
              stat={`${isLoadingActivity ? "—" : liveStudies} live ${liveStudies === 1 ? "study" : "studies"}`}
              color={TEST_COLOR}
              onClick={() => setLocation("/portal/test")}
              testId="card-journey-test"
            />
            <JourneyCard
              num="3"
              question="What should I do?"
              title="Act"
              subtitle="Gaps · Recommendations · Strategic Next Steps"
              stat="4 recommendations"
              color={CORAL}
              onClick={() => setLocation("/portal/act")}
              testId="card-journey-act"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              num={isLoadingActivity ? null : 12}
              label="Signals"
              sub={<>Trends & Insights active<br />+3 overnight</>}
              cta="Explore"
              color={EXPLORE_COLOR}
              onClick={() => setLocation("/portal/explore")}
              testId="stat-card-signals"
            />
            <StatCard
              num={isLoadingActivity ? null : liveStudies}
              label="Live Studies"
              sub={<>In field now<br />{liveStudies > 0 ? "67% complete" : "None running"}</>}
              cta="Test"
              color={TEST_COLOR}
              onClick={() => setLocation("/portal/test")}
              testId="stat-card-live"
            />
            <StatCard
              num={4}
              label="Recommendations"
              sub={<>Strategic actions ready<br />2 high priority</>}
              cta="Act"
              color={CORAL}
              onClick={() => setLocation("/portal/act")}
              testId="stat-card-recommendations"
            />
            <StatCard
              num={isLoadingActivity ? null : studiesDone}
              label="Studies Done"
              sub={<>Complete this year<br />+1 this month</>}
              cta="Portfolio"
              color={HEALTH_COLOR}
              onClick={() => setLocation("/portal/test")}
              testId="stat-card-studies"
            />
          </div>

          {/* Phase preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Explore preview */}
            <PhasePreviewCard
              num="1"
              title="Explore"
              subtitle="Trends, insights & market signals"
              color={EXPLORE_COLOR}
              onOpen={() => setLocation("/portal/explore")}
              items={[
                {
                  dotColor: EXPLORE_COLOR,
                  text: "Nootropic beverages +41% search intent",
                  sub: "25–34 urban cohort · Detected overnight",
                  chip: { label: "Trend", bg: "#F5F3FF", color: HEALTH_COLOR },
                },
                {
                  dotColor: TEST_COLOR,
                  text: "Functional Beverages 2025 — new report",
                  sub: "Innovatr Inside · GROWTH+ · 3 min read",
                  chip: { label: "New", bg: "#EFF6FF", color: EXPLORE_COLOR },
                },
                {
                  dotColor: "#A8A29E",
                  text: "12 active market signals across categories",
                  sub: "Food & Bev · Beauty · FMCG",
                  chip: { label: "Signals", bg: "#EFF6FF", color: EXPLORE_COLOR },
                },
              ]}
            />

            {/* Test preview */}
            <PhasePreviewCard
              num="2"
              title="Test"
              subtitle="Live studies & projects overview"
              color={TEST_COLOR}
              onOpen={() => setLocation("/portal/test")}
              items={
                isLoadingReports
                  ? [
                      { dotColor: AMBER, text: "Loading…", sub: "" },
                    ]
                  : recentStudies.length > 0
                  ? recentStudies.map((r: any) => ({
                      dotColor: r.status?.toLowerCase().includes("complete") ? TEST_COLOR : AMBER,
                      text: r.title,
                      sub: `${r.studyType ? r.studyType.replace("_", " ") : "Study"} · ${r.status || ""}`,
                      chip: r.status?.toLowerCase().includes("complete")
                        ? { label: "Done", bg: "#ECFDF5", color: TEST_COLOR }
                        : undefined,
                    }))
                  : [
                      {
                        dotColor: AMBER,
                        text: "No studies yet",
                        sub: "Launch your first brief to get started",
                      },
                    ]
              }
            />

            {/* Act preview */}
            <PhasePreviewCard
              num="3"
              title="Act"
              subtitle="Strategic gaps & recommendations"
              color={CORAL}
              onOpen={() => setLocation("/portal/act")}
              items={[
                {
                  dotColor: CORAL,
                  text: "Energy Drink — narrative ready",
                  sub: "72% purchase intent · 3 strategic gaps identified",
                  chip: { label: "Action", bg: "#FDF2EE", color: CORAL },
                },
                {
                  dotColor: AMBER,
                  text: "Commitment gap widening — 28pt below Idea",
                  sub: "Recommend packaging/pricing bridge study",
                  chip: { label: "Watch", bg: "#FFFBEB", color: AMBER },
                },
                {
                  dotColor: TEST_COLOR,
                  text: "4 strategic recommendations available",
                  sub: "2 high priority · 2 medium priority",
                  chip: { label: "Ready", bg: "#ECFDF5", color: TEST_COLOR },
                },
              ]}
            />
          </div>

          {/* Studies portfolio */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Studies
                </span>
                <span className="text-sm text-muted-foreground font-normal">Your complete research portfolio</span>
              </div>
              <button
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: EXPLORE_COLOR }}
                onClick={() => setLocation("/portal/test")}
                data-testid="link-view-all-studies"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {isLoadingReports ? (
                [1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-card rounded-xl border border-stone-100 dark:border-border p-4">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))
              ) : recentStudies.length > 0 ? (
                recentStudies.map((study: any) => (
                  <StudyCard key={study.id} study={study} onActClick={() => setLocation("/portal/act")} />
                ))
              ) : (
                <div className="bg-white dark:bg-card rounded-xl border border-stone-100 dark:border-border p-8 text-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">No studies yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Launch your first brief to start collecting consumer insights.</p>
                  <Button
                    size="sm"
                    onClick={() => setLocation("/portal/launch")}
                    data-testid="button-launch-first-brief"
                    style={{ background: CORAL, borderColor: CORAL, color: "#fff" }}
                  >
                    Launch a Brief
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

function CreditChip({ value, label, sub, color, testId }: {
  value: number | null;
  label: string;
  sub: string;
  color: string;
  testId: string;
}) {
  return (
    <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-sm" data-testid={testId}>
      <span className="text-2xl font-bold font-mono" style={{ color }}>
        {value === null ? <Skeleton className="h-7 w-8 inline-block" /> : value}
      </span>
      <div>
        <div className="text-xs text-muted-foreground leading-tight">{label}</div>
        <div className="text-[10px] font-semibold leading-tight" style={{ color }}>{sub}</div>
      </div>
    </div>
  );
}

function JourneyCard({ num, question, title, subtitle, stat, color, onClick, testId }: {
  num: string;
  question: string;
  title: string;
  subtitle: string;
  stat: string;
  color: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl p-5 cursor-pointer text-left relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group w-full"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <div
        className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono mb-3"
        style={{ borderColor: color, color }}
      >
        {num}
      </div>
      <div className="text-xs font-semibold mb-0.5" style={{ color }}>{question}</div>
      <div className="font-serif text-xl text-foreground mb-1">{title}</div>
      <div className="text-xs text-muted-foreground mb-3 leading-relaxed">{subtitle}</div>
      <div className="text-sm font-medium" style={{ color }}>{stat}</div>
      <div
        className="absolute bottom-3.5 right-3.5 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color }}
      >
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

function StatCard({ num, label, sub, cta, color, onClick, testId }: {
  num: number | null;
  label: string;
  sub: React.ReactNode;
  cta: string;
  color: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow w-full"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="text-3xl font-bold font-mono text-foreground mb-1 leading-none">
        {num === null ? <Skeleton className="h-8 w-12 inline-block" /> : num}
      </div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-xs text-muted-foreground mb-2 leading-snug">{sub}</div>
      <span className="text-xs font-semibold flex items-center gap-1" style={{ color }}>
        {cta} <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  );
}

function PhasePreviewCard({ num, title, subtitle, color, onOpen, items }: {
  num: string;
  title: string;
  subtitle: string;
  color: string;
  onOpen: () => void;
  items: {
    dotColor: string;
    text: string;
    sub?: string;
    chip?: { label: string; bg: string; color: string };
  }[];
}) {
  return (
    <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-stone-100 dark:border-border bg-stone-50 dark:bg-sidebar flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono"
            style={{ borderColor: color, color }}
          >
            {num}
          </span>
          <div>
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <div className="text-[11px] text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <button
          className="text-xs font-semibold flex items-center gap-0.5"
          style={{ color }}
          onClick={onOpen}
        >
          Open <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-stone-50 dark:bg-sidebar rounded-md">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dotColor }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground leading-snug">{item.text}</div>
              {item.sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{item.sub}</div>}
            </div>
            {item.chip && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                style={{ background: item.chip.bg, color: item.chip.color }}
              >
                {item.chip.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudyCard({ study, onActClick }: { study: any; onActClick: () => void }) {
  const metrics = [
    { label: "Idea", val: study.topIdeaIdeaScore },
    { label: "Interest", val: study.topIdeaInterest },
    { label: "Commit", val: study.topIdeaCommitment },
    { label: "Meaning", val: study.topIdeaMeaning },
    { label: "Diff", val: study.topIdeaDifference },
    { label: "Worth", val: study.topIdeaWorth },
  ].filter((m) => m.val !== null && m.val !== undefined);

  const getMetricColor = (val: number) => {
    if (val >= 75) return "#059669";
    if (val >= 55) return "#B45309";
    return "#DC2626";
  };

  const getStudyTypeBadge = (type: string | null) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO", bg: "#F3E8FF", color: "#7E22CE" };
    return { label: "BASIC", bg: "#E0F2FE", color: "#0369A1" };
  };

  const typeBadge = getStudyTypeBadge(study.studyType);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  return (
    <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-testid={`study-card-${study.id}`}>
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-foreground mb-1">{study.title}</div>
          <div className="text-xs text-muted-foreground">
            {[study.companyName, study.industry, study.status && `${study.uploadedAt ? formatDate(study.uploadedAt) : ""}`]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider" style={{ background: typeBadge.bg, color: typeBadge.color }}>
            {typeBadge.label}
          </span>
          {study.status && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={
                study.status?.toLowerCase().includes("complete")
                  ? { background: "#ECFDF5", color: "#059669" }
                  : { background: "#FFFBEB", color: "#B45309" }
              }
            >
              {study.status?.toLowerCase().includes("complete") ? "Complete" : study.status}
            </span>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="px-5 pb-3 grid grid-cols-6 gap-1 border-b border-stone-50 dark:border-border">
          {metrics.map((m) => (
            <div key={m.label} className="text-center bg-stone-50 dark:bg-sidebar rounded py-2">
              <div className="text-base font-bold font-mono" style={{ color: getMetricColor(m.val) }}>
                {m.val}%
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 flex gap-2">
        <Button
          size="sm"
          onClick={onActClick}
          data-testid={`button-act-study-${study.id}`}
          style={{ background: CORAL, borderColor: CORAL, color: "#fff" }}
          className="text-xs h-8"
        >
          Analyse in Act
        </Button>
        {study.pdfUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(study.pdfUrl, "_blank")}
            data-testid={`button-download-study-${study.id}`}
            className="text-xs h-8"
          >
            <Download className="w-3 h-3 mr-1" />
            Download PDF
          </Button>
        )}
        {study.dashboardUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(study.dashboardUrl, "_blank")}
            data-testid={`button-dashboard-study-${study.id}`}
            className="text-xs h-8"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
