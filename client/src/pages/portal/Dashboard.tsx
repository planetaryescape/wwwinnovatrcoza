import { useMemo, useEffect, useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, Sparkles, BarChart3,
  Search, AlertTriangle,
} from "lucide-react";
import insightsCover1 from "@assets/category-insights.webp";
import insightsCover2 from "@assets/category-insights-2.webp";
import insightsCover3 from "@assets/category-insights-3.webp";
import foodCover from "@assets/industry-food.webp";
import beveragesCover from "@assets/industry-beverages.webp";
import alcoholCover from "@assets/industry-alcohol.webp";
import financialCover from "@assets/industry-financial.webp";
import fmcgCover from "@assets/industry-fmcg.webp";
import beautyCover from "@assets/industry-beauty.webp";

const INDUSTRY_COVERS: Record<string, string> = {
  food: foodCover,
  beverages: beveragesCover,
  alcohol: alcoholCover,
  financial: financialCover,
  finance: financialCover,
  fmcgs: fmcgCover,
  fmcg: fmcgCover,
  beauty: beautyCover,
};
const FALLBACK_COVERS = [insightsCover1, insightsCover2, insightsCover3];

function getStudyCover(study: any): string {
  if (study.thumbnailUrl) return study.thumbnailUrl;
  const ind = (study.industry || "").toLowerCase().trim();
  if (INDUSTRY_COVERS[ind]) return INDUSTRY_COVERS[ind];
  // Stable fallback based on id
  const idStr = String(study.id || study.title || "");
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) | 0;
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
}
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import type { Company } from "@shared/schema";
import { useIndustryGroups } from "@/hooks/useIndustryGroups";
import { filterByIndustry } from "@/lib/industry-groups";
import { ALL_SIGNALS, ALL_STRATEGIC_GAPS, ALL_NEXT_STEPS } from "@/lib/portal-content";

/* ── Design tokens ──────────────────────────────────────── */
const VDK        = "#1E1B3A";
const BLUE       = "#4860FA";
const VIO        = "#3A2FBF";
const VIO_LT     = "#EAE8FF";
const BLUE_LT    = "#E6EAFF";
const CORAL      = "#E8503A";
const CORAL_LT   = "#FDECEA";
const CYAN_DK    = "#1A8FAD";
const CYAN_LT    = "#DFF6FC";
const AMBER_DK   = "#B8911A";
const AMBER_LT   = "#FEF6D6";
const N200       = "#EBEBEB";
const N400       = "#9C9AB0";
const N500       = "#8A7260";
const SUCCESS    = "#2A9E5C";
const SUCCESS_LT = "#D1FAE5";
const CREAM      = "#FFFFFF";

/* Phase accent colors used for thin top accent line / small chip only */
const EXPLORE_COLOR = BLUE;
const TEST_COLOR    = VIO;
const ACT_COLOR     = CORAL;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

/* ── Helpers ──────────────────────────────────────────────── */
function DonutSVG({ value, size = 72, stroke = 6, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const dash = Math.min(value / (value > 20 ? value * 1.2 : 20), 1) * c;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
    </svg>
  );
}

function metricColor(v: number) {
  if (v >= 75) return SUCCESS;
  if (v >= 55) return AMBER_DK;
  return CORAL;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isPaidMember, isAdmin } = useAuth();
  const [studySearch, setStudySearch] = useState("");
  const [studyScope, setStudyScope] = useState<"mine" | "company">("mine");
  const [adminCompanyId, setAdminCompanyId] = useState<string>("");

  const { data: adminCompanies = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ["/api/admin/companies"],
    queryFn: async () => {
      const r = await fetch("/api/admin/companies");
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!isAdmin,
  });

  useEffect(() => { logActivity("view_dashboard"); }, []);

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/member/company", user?.companyId],
    queryFn: async () => {
      const r = await fetch(`/api/member/company?companyId=${user?.companyId}`);
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!user?.companyId,
    retry: false,
  });

  const { data: userActivity, isLoading: loadingAct } = useQuery<{
    studiesCompleted: number; liveStudies: number; reportsDownloaded: number;
    discountSaved: number; basicCreditsRemaining: number; proCreditsRemaining: number;
  }>({ queryKey: ["/api/member/activity", user?.id], enabled: !!user });

  const { data: clientReports, isLoading: loadingReports } = useQuery<any[]>({
    queryKey: ["/api/member/studies", isAdmin ? `admin:${adminCompanyId || "all"}` : studyScope],
    queryFn: async () => {
      const url = isAdmin
        ? (adminCompanyId ? `/api/member/studies?companyId=${encodeURIComponent(adminCompanyId)}` : "/api/member/studies")
        : `/api/member/studies?scope=${studyScope}`;
      const r = await fetch(url);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
  });

  const basicCredits = userActivity?.basicCreditsRemaining ?? (company as any)?.basicCreditsRemaining ?? 0;
  const proCredits   = userActivity?.proCreditsRemaining  ?? (company as any)?.proCreditsRemaining  ?? 0;
  const studiesDone  = userActivity?.studiesCompleted ?? 0;
  const liveStudies  = userActivity?.liveStudies ?? 0;

  const { industryGroups } = useIndustryGroups();
  const signalCount = useMemo(() => filterByIndustry(ALL_SIGNALS, industryGroups).length, [industryGroups]);
  const gapCount    = useMemo(() => filterByIndustry(ALL_STRATEGIC_GAPS, industryGroups).length, [industryGroups]);
  const recsCount   = useMemo(() => filterByIndustry(ALL_NEXT_STEPS, industryGroups).length, [industryGroups]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const recentStudies = useMemo(() => (clientReports ?? []).slice(0, 3), [clientReports]);
  const filteredStudies = useMemo(() =>
    recentStudies.filter(s => !studySearch || s.title?.toLowerCase().includes(studySearch.toLowerCase())),
    [recentStudies, studySearch]
  );

  return (
    <PortalLayout>
      <div className="flex-1 overflow-y-auto" style={{ background: CREAM }}>
        <div className="p-6 space-y-5">

          {/* ── Hero card ── */}
          <div
            className="rounded-2xl p-6"
            style={CARD}
            data-testid="hero-card"
          >
            <div className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-2" style={{ color: N500 }}>
              <Sparkles className="w-3 h-3" style={{ color: BLUE }} />
              {greeting}, {user?.name?.split(" ")[0]} &middot;&nbsp;
              {isPaidMember ? (user?.membershipTier?.toUpperCase() || "STARTER") : "FREE"} TIER
            </div>
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <h1 className="font-serif text-4xl leading-none" style={{ color: VDK }}>Dashboard</h1>
              <div className="flex items-center gap-6 flex-shrink-0 flex-wrap">
                {[
                  { val: loadingAct ? null : basicCredits, label: "Basic credits" },
                  { val: loadingAct ? null : proCredits,   label: "Pro credits"   },
                  { val: loadingAct ? null : studiesDone,  label: "Studies done"  },
                ].map((s, i, arr) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="text-center" data-testid={`hero-stat-${i}`}>
                      <div className="text-3xl font-bold font-mono leading-none" style={{ color: VDK }}>
                        {s.val === null ? <Skeleton className="h-8 w-8 inline-block" /> : s.val}
                      </div>
                      <div className="text-xs mt-1.5" style={{ color: N500 }}>{s.label}</div>
                    </div>
                    {i < arr.length - 1 && <div className="w-px h-10 self-center" style={{ background: N200 }} />}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed mt-4" style={{ color: N500 }}>
              Your intelligence hub — trends, live studies, and strategic signals, all in one place.
            </p>
          </div>

          {/* ── Low credit warning ── */}
          {!loadingAct && basicCredits <= 2 && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap" style={CARD} data-testid="banner-low-credits">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: AMBER_DK }} />
              <span className="badge-medium flex-shrink-0">Low credits</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm" style={{ color: VDK }}>
                  You have <strong>{basicCredits}</strong> Basic credit{basicCredits !== 1 ? "s" : ""} remaining.
                  {proCredits <= 0 && " Pro credits are also at zero."} Top up to keep researching.
                </span>
              </div>
              <button
                onClick={() => setLocation("/portal/credits")}
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: BLUE, color: "#fff", borderRadius: 8 }}
                data-testid="button-manage-credits-warn"
              >
                Manage Credits →
              </button>
            </div>
          )}

          {/* ── Journey phase cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <JourneyCard
              num="1" tag="EXPLORE" question="What's happening?" subtitle="Trends & Insights · Sandbox · Market Signals"
              stat={`${signalCount} signal${signalCount === 1 ? "" : "s"} active`} accentColor={EXPLORE_COLOR} onClick={() => setLocation("/portal/explore")} testId="card-journey-explore"
            />
            <JourneyCard
              num="2" tag="TEST" question="Does my idea work?" subtitle="Projects Overview · Test24 · QA Results"
              stat={`${liveStudies} live ${liveStudies === 1 ? "study" : "studies"}`} accentColor={TEST_COLOR} onClick={() => setLocation("/portal/test")} testId="card-journey-test"
            />
            <JourneyCard
              num="3" tag="ACT" question="What should I do?" subtitle="Gaps · Recommendations · Strategic Next Steps"
              stat={`${recsCount} recommendation${recsCount === 1 ? "" : "s"}`} accentColor={ACT_COLOR} onClick={() => setLocation("/portal/act")} testId="card-journey-act"
            />
          </div>

          {/* ── Stat cards with donut ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DonutStatCard num={signalCount}                     label="Signals"         sub="Trends & Insights active"   highlight={`${signalCount} for your industry`} cta="EXPLORE"   color={BLUE} onClick={() => setLocation("/portal/explore")} testId="stat-card-signals"          />
            <DonutStatCard num={loadingAct ? null : liveStudies} label="Live Studies"    sub="In field now"               highlight={liveStudies > 0 ? `${liveStudies} in progress` : "None right now"} cta="TEST"      color={BLUE} onClick={() => setLocation("/portal/test")}    testId="stat-card-live"            />
            <DonutStatCard num={recsCount}                       label="Recommendations" sub="Strategic actions ready"     highlight={`${gapCount} gap${gapCount === 1 ? "" : "s"} identified`} cta="ACT"   color={BLUE} onClick={() => setLocation("/portal/act")}     testId="stat-card-recommendations"  />
            <DonutStatCard num={loadingAct ? null : studiesDone} label="Studies Done"    sub="Complete this year"         highlight={studiesDone > 0 ? `${studiesDone} completed` : "Launch your first"} cta="PORTFOLIO" color={BLUE} onClick={() => setLocation("/portal/test")}    testId="stat-card-studies"         />
          </div>

          {/* ── Phase preview feed ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PhasePreviewCard
              num="1" title="Explore" subtitle="Trends, insights & market signals" color={EXPLORE_COLOR} onOpen={() => setLocation("/portal/explore")}
              items={[
                { dotColor: BLUE,    text: "Nootropic beverages +41% search intent",    sub: "25–34 urban cohort · Detected overnight · High relevance", chip: { label: "Trend",   bg: BLUE_LT,   color: BLUE    } },
                { dotColor: SUCCESS, text: "Functional Beverages 2025 — new report",    sub: "Innovatr Inside · GROWTH+ · 3 min read",                  chip: { label: "New",     bg: SUCCESS_LT, color: SUCCESS } },
                { dotColor: N400,    text: `${signalCount} active market signals across categories`, sub: "Food & Bev · Beauty · FMCG",                              chip: { label: "Signals", bg: BLUE_LT,   color: BLUE    } },
              ]}
            />
            <PhasePreviewCard
              num="2" title="Test" subtitle="Live studies & projects overview" color={TEST_COLOR} onOpen={() => setLocation("/portal/test")}
              items={loadingReports
                ? [{ dotColor: N400, text: "Loading…", sub: "" }]
                : recentStudies.length > 0
                  ? recentStudies.map((r: any) => ({
                      dotColor: r.status?.toLowerCase().includes("complete") ? SUCCESS : AMBER_DK,
                      text: r.title,
                      sub: `${r.studyType?.replace("_", " ") || "Study"} · ${r.status || ""}`,
                      chip: r.status?.toLowerCase().includes("complete")
                        ? { label: "Done", bg: SUCCESS_LT, color: SUCCESS }
                        : undefined,
                    }))
                  : [{ dotColor: N400, text: "No studies yet", sub: "Launch your first brief to get started" }]
              }
            />
            <PhasePreviewCard
              num="3" title="Act" subtitle="Strategic gaps & recommendations" color={ACT_COLOR} onOpen={() => setLocation("/portal/act")}
              items={[
                { dotColor: CORAL,   text: "Energy Drink — autonomous narrative r…",      sub: "72% purchase intent · 3 strategic gaps identified",  chip: { label: "Action", bg: CORAL_LT,   color: CORAL    } },
                { dotColor: AMBER_DK,text: "Commitment gap widening — 28pt belo…",         sub: "Recommend packaging/pricing bridge study",            chip: { label: "Watch",  bg: AMBER_LT,  color: AMBER_DK } },
                { dotColor: SUCCESS, text: `${recsCount} strategic recommendations available`,  sub: `${gapCount} gaps · ${recsCount} next steps`,          chip: { label: "Ready",  bg: SUCCESS_LT, color: SUCCESS  } },
              ]}
            />
          </div>

          {/* ── Studies portfolio ── */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold" style={{ color: VDK }}>Studies</div>
                <div className="text-xs" style={{ color: N500 }}>Your complete research portfolio</div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: N500 }} />
                  <input
                    value={studySearch}
                    onChange={e => setStudySearch(e.target.value)}
                    className="rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none"
                    style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK, width: 160 }}
                    placeholder="Search…"
                    data-testid="input-study-search"
                  />
                </div>
                {isAdmin ? (
                  <select
                    value={adminCompanyId}
                    onChange={(e) => setAdminCompanyId(e.target.value)}
                    data-testid="select-admin-company"
                    className="rounded-lg px-3 py-2 text-xs focus:outline-none"
                    style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}
                  >
                    <option value="">All companies</option>
                    {adminCompanies
                      .slice()
                      .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                ) : (
                  <div className="inline-flex rounded-lg p-0.5" style={{ background: "#fff", border: `1px solid ${N200}` }}>
                    <button
                      onClick={() => setStudyScope("mine")}
                      data-testid="button-scope-mine"
                      className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                      style={studyScope === "mine"
                        ? { background: BLUE, color: "#fff" }
                        : { background: "transparent", color: N500 }}
                    >
                      My studies
                    </button>
                    {user?.companyId && (
                      <button
                        onClick={() => setStudyScope("company")}
                        data-testid="button-scope-company"
                        className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                        style={studyScope === "company"
                          ? { background: BLUE, color: "#fff" }
                          : { background: "transparent", color: N500 }}
                      >
                        My company
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    if (isAdmin) {
                      setLocation(adminCompanyId
                        ? `/portal/test?companyId=${encodeURIComponent(adminCompanyId)}`
                        : "/portal/test");
                    } else {
                      setLocation(`/portal/test?scope=${studyScope}`);
                    }
                  }}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: BLUE }}
                  data-testid="link-view-all-studies"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {loadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} style={CARD} className="p-5">
                    <Skeleton className="h-5 w-2/3 mb-2" /><Skeleton className="h-3 w-1/2 mb-4" />
                    <Skeleton className="h-8 w-full mb-2" /><Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredStudies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredStudies.map((study: any) => (
                  <StudyCard key={study.id} study={study} onClick={() => setLocation("/portal/test")} />
                ))}
              </div>
            ) : (
              <div style={CARD} className="p-10 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: N500 }} />
                <p className="text-sm font-semibold mb-1" style={{ color: VDK }}>No studies yet</p>
                <p className="text-xs mb-4" style={{ color: N500 }}>Launch your first brief to start collecting consumer insights.</p>
                <button onClick={() => setLocation("/portal/launch")} data-testid="button-launch-first-brief" className="text-sm font-semibold px-5 py-2 text-white rounded-lg" style={{ background: BLUE }}>
                  Launch a Brief
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

/* ── Journey Card ─────────────────────────────────────────── */
function JourneyCard({ num, tag, question, subtitle, stat, accentColor, onClick, testId }: {
  num: string; tag: string; question: string; subtitle: string; stat: string;
  accentColor: string; onClick: () => void; testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="text-left w-full rounded-2xl p-5 relative overflow-hidden group hover-elevate"
      style={{ ...CARD, minHeight: 180 }}
    >
      {/* Thin top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accentColor }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono"
            style={{ background: accentColor, color: "#fff" }}
          >
            {num}
          </div>
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{ background: "#F5F5F5", color: VDK }}
          >
            {tag}
          </span>
        </div>
        <div className="font-serif text-2xl mb-1 leading-snug" style={{ color: VDK }}>{question}</div>
        <div className="text-xs mb-4 leading-relaxed" style={{ color: N500 }}>{subtitle}</div>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "#F5F5F5", color: VDK }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
            {stat}
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "#F5F5F5" }}
          >
            <ArrowRight className="w-3.5 h-3.5" style={{ color: VDK }} />
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Donut Stat Card ──────────────────────────────────────── */
function DonutStatCard({ num, label, sub, highlight, cta, color, onClick, testId }: {
  num: number | null; label: string; sub: string; highlight: string; cta: string;
  color: string; onClick: () => void; testId: string;
}) {
  return (
    <button onClick={onClick} data-testid={testId} className="text-left w-full rounded-2xl p-5" style={CARD}>
      <div className="flex items-center justify-center mb-3 relative">
        <DonutSVG value={num ?? 0} size={80} stroke={7} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color: VDK }}>
            {num === null ? <Skeleton className="h-6 w-7 inline-block" /> : num}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold mb-0.5" style={{ color: VDK }}>{label}</div>
        <div className="text-xs mb-1" style={{ color: N500 }}>{sub}</div>
        <div className="text-xs font-medium mb-2" style={{ color: N500 }}>{highlight}</div>
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded" style={{ background: "#F5F5F5", color: VDK }}>
          {cta}
        </span>
      </div>
    </button>
  );
}

/* ── Phase Preview Card ───────────────────────────────────── */
function PhasePreviewCard({ num, title, subtitle, color, onOpen, items }: {
  num: string; title: string; subtitle: string; color: string; onOpen: () => void;
  items: { dotColor: string; text: string; sub?: string; chip?: { label: string; bg: string; color: string } }[];
}) {
  return (
    <div className="portal-card-lg overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid #EBEBEB`, background: "#FAFAFA" }}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono" style={{ border: `2px solid ${color}`, color }}>
            {num}
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: VDK }}>{title}</div>
            <div className="text-[11px]" style={{ color: N500 }}>{subtitle}</div>
          </div>
        </div>
        <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color }} onClick={onOpen} data-testid={`phase-open-${num}`}>
          Open <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: "#F5F5F5", border: `1px solid #EBEBEB` }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dotColor }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs leading-snug font-medium" style={{ color: VDK }}>{item.text}</div>
              {item.sub && <div className="text-[11px] mt-0.5 leading-snug" style={{ color: N500 }}>{item.sub}</div>}
            </div>
            {item.chip && (
              <span className="text-[10px] font-bold px-2 py-0.5 flex-shrink-0 rounded-full" style={{ background: item.chip.bg, color: item.chip.color }}>
                {item.chip.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Study Card ───────────────────────────────────────────── */
function StudyCard({ study, onClick }: { study: any; onClick: () => void }) {
  const typeBadge = (() => {
    const t = study.studyType?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,  color: VIO };
    return                        { label: "BASIC", bg: CYAN_LT, color: CYAN_DK };
  })();

  const isComplete = study.status?.toLowerCase().includes("complete");

  const bigMetrics = [
    { label: "IDEA",       val: study.topIdeaIdeaScore   },
    { label: "INTEREST",   val: study.topIdeaInterest    },
    { label: "COMMITMENT", val: study.topIdeaCommitment  },
  ].filter(m => m.val !== null && m.val !== undefined);

  const cover = getStudyCover(study);

  return (
    <button
      onClick={onClick}
      data-testid={`study-card-${study.id}`}
      className="text-left portal-card-lg overflow-hidden flex flex-col hover-elevate active-elevate-2"
    >
      {/* Cover image with gradient wash */}
      <div
        className="relative w-full"
        style={{
          height: 160,
          backgroundImage: `url(${cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark wash for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(30,27,58,0.15) 0%, rgba(30,27,58,0.55) 60%, rgba(30,27,58,0.85) 100%)" }}
        />
        {/* Top-right badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
            style={{ background: typeBadge.bg, color: typeBadge.color }}
          >
            {typeBadge.label}
          </span>
          {isComplete && (
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
              style={{ background: SUCCESS_LT, color: SUCCESS }}
            >
              Complete
            </span>
          )}
        </div>
        {/* Title + meta over image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="font-serif text-lg leading-snug text-white mb-1 line-clamp-2">
            {study.title}
          </div>
          <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.75)" }}>
            {[study.companyName, study.industry].filter(Boolean).join(" · ") || "Study"}
            {study.respondentCount ? ` · ${study.respondentCount} resp.` : ""}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      {bigMetrics.length > 0 ? (
        <div className="px-4 py-4 grid grid-cols-3 gap-2 mt-auto">
          {bigMetrics.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-2xl font-bold font-mono leading-none" style={{ color: VDK }}>{m.val}%</div>
              <div className="text-[9px] font-bold tracking-widest mt-1.5" style={{ color: N500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 flex items-center justify-between mt-auto">
          <span className="text-xs" style={{ color: N500 }}>Tap to view results</span>
          <ArrowRight className="w-4 h-4" style={{ color: BLUE }} />
        </div>
      )}
    </button>
  );
}
