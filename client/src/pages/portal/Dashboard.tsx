import { useMemo, useEffect, useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download, ArrowRight, Sparkles, BarChart3,
  Zap, CreditCard, Home, Search, AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import type { Company } from "@shared/schema";

/* ── Design tokens ──────────────────────────────────────── */
const VDK        = "#1E1B3A";
const VIO        = "#3A2FBF";
const VIO_LT     = "#EAE8FF";
const CORAL      = "#E8503A";
const CORAL_LT   = "#FDECEA";
const CYAN_DK    = "#1A8FAD";
const CYAN_LT    = "#DFF6FC";
const AMBER_DK   = "#B8911A";
const AMBER_LT   = "#FEF6D6";
const N200       = "#EBEBEB";
const N400       = "#A89078";
const N500       = "#8A7260";
const SUCCESS    = "#2A9E5C";
const SUCCESS_LT = "#D1FAE5";
const CREAM      = "#FFFFFF";

const EXPLORE_GRADIENT = "linear-gradient(135deg, #3A2FBF 0%, #5b50d9 55%, #7B70F0 100%)";
const TEST_GRADIENT    = "linear-gradient(135deg, #D94A28 0%, #E8643A 50%, #EF8A4E 100%)";
const ACT_GRADIENT     = "linear-gradient(135deg, #1A7A45 0%, #2A9E5C 55%, #3DBF72 100%)";

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
  const { user, isPaidMember } = useAuth();
  const [studySearch, setStudySearch] = useState("");

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
    queryKey: ["/api/member/reports", user?.companyId],
    queryFn: async () => {
      const url = user?.companyId ? `/api/member/reports?companyId=${user.companyId}` : `/api/member/reports`;
      const r = await fetch(url);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
  });

  const basicCredits = userActivity?.basicCreditsRemaining ?? (company as any)?.basicCreditsRemaining ?? 0;
  const proCredits   = userActivity?.proCreditsRemaining  ?? (company as any)?.proCreditsRemaining  ?? 0;
  const studiesDone  = userActivity?.studiesCompleted ?? (clientReports?.length ?? 0);
  const liveStudies  = userActivity?.liveStudies ?? 0;

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
            className="rounded-2xl p-6 flex items-start justify-between gap-6 flex-wrap"
            style={{ background: `linear-gradient(135deg, ${VDK} 0%, #2A2660 60%, #3A3575 100%)` }}
            data-testid="hero-card"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-2" style={{ color: CORAL }}>
                <Sparkles className="w-3 h-3" />
                {greeting}, {user?.name?.split(" ")[0]} &middot;&nbsp;
                {isPaidMember ? (user?.membershipTier?.toUpperCase() || "STARTER") : "FREE"} TIER
              </div>
              <h1 className="font-serif text-4xl text-white mb-1.5">Dashboard</h1>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                Your intelligence hub — trends, live studies, and strategic signals, all in one place.
              </p>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0 flex-wrap">
              {[
                { val: loadingAct ? null : basicCredits, label: "Basic credits" },
                { val: loadingAct ? null : proCredits,   label: "Pro credits"   },
                { val: loadingAct ? null : studiesDone,  label: "Studies done"  },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-center" data-testid={`hero-stat-${i}`}>
                    <div className="text-4xl font-bold font-mono text-white leading-none">
                      {s.val === null ? <Skeleton className="h-9 w-8 inline-block bg-white/20" /> : s.val}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-10 self-center" style={{ background: "rgba(255,255,255,0.15)" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Low credit warning ── */}
          {!loadingAct && basicCredits <= 2 && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: AMBER_LT, border: `1px solid ${AMBER_DK}33` }} data-testid="banner-low-credits">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: AMBER_DK }} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold" style={{ color: AMBER_DK }}>Low credits — </span>
                <span className="text-sm" style={{ color: "#7a5c10" }}>
                  You have <strong>{basicCredits}</strong> Basic credit{basicCredits !== 1 ? "s" : ""} remaining.
                  {proCredits <= 0 && " Pro credits are also at zero."} Top up to keep researching.
                </span>
              </div>
              <button
                onClick={() => setLocation("/portal/credits")}
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: AMBER_DK, color: "#fff", borderRadius: 8 }}
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
              stat="12 signals active" gradient={EXPLORE_GRADIENT} onClick={() => setLocation("/portal/explore")} testId="card-journey-explore"
            />
            <JourneyCard
              num="2" tag="TEST" question="Does my idea work?" subtitle="Projects Overview · Test24 · QA Results"
              stat={`${liveStudies} live ${liveStudies === 1 ? "study" : "studies"}`} gradient={TEST_GRADIENT} onClick={() => setLocation("/portal/test")} testId="card-journey-test"
            />
            <JourneyCard
              num="3" tag="ACT" question="What should I do?" subtitle="Gaps · Recommendations · Strategic Next Steps"
              stat="4 recommendations" gradient={ACT_GRADIENT} onClick={() => setLocation("/portal/act")} testId="card-journey-act"
            />
          </div>

          {/* ── Stat cards with donut ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DonutStatCard num={loadingAct ? null : 12}         label="Signals"         sub="Trends & Insights active"   highlight="+3 overnight"   cta="EXPLORE"   color={VIO}      onClick={() => setLocation("/portal/explore")} testId="stat-card-signals"          />
            <DonutStatCard num={loadingAct ? null : liveStudies} label="Live Studies"    sub="In field now"               highlight="~ 67% complete" cta="TEST"      color={AMBER_DK} onClick={() => setLocation("/portal/test")}    testId="stat-card-live"            />
            <DonutStatCard num={4}                               label="Recommendations" sub="Strategic actions ready"    highlight="~ 2 high priority" cta="ACT"   color={CORAL}    onClick={() => setLocation("/portal/act")}     testId="stat-card-recommendations"  />
            <DonutStatCard num={loadingAct ? null : studiesDone} label="Studies Done"    sub="Complete this year"         highlight="+1 this month"  cta="PORTFOLIO" color="#8B5CF6"  onClick={() => setLocation("/portal/test")}    testId="stat-card-studies"         />
          </div>

          {/* ── Phase preview feed ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PhasePreviewCard
              num="1" title="Explore" subtitle="Trends, insights & market signals" color={VIO} onOpen={() => setLocation("/portal/explore")}
              items={[
                { dotColor: VIO,     text: "Nootropic beverages +41% search intent",    sub: "25–34 urban cohort · Detected overnight · High relevance", chip: { label: "Trend",   bg: VIO_LT,    color: VIO     } },
                { dotColor: SUCCESS, text: "Functional Beverages 2025 — new report",    sub: "Innovatr Inside · GROWTH+ · 3 min read",                  chip: { label: "New",     bg: SUCCESS_LT, color: SUCCESS } },
                { dotColor: N400,    text: "12 active market signals across categories", sub: "Food & Bev · Beauty · FMCG",                              chip: { label: "Signals", bg: VIO_LT,    color: VIO     } },
              ]}
            />
            <PhasePreviewCard
              num="2" title="Test" subtitle="Live studies & projects overview" color={SUCCESS} onOpen={() => setLocation("/portal/test")}
              items={loadingReports
                ? [{ dotColor: AMBER_DK, text: "Loading…", sub: "" }]
                : recentStudies.length > 0
                  ? recentStudies.map((r: any) => ({
                      dotColor: r.status?.toLowerCase().includes("complete") ? SUCCESS : AMBER_DK,
                      text: r.title,
                      sub: `${r.studyType?.replace("_", " ") || "Study"} · ${r.status || ""}`,
                      chip: r.status?.toLowerCase().includes("complete")
                        ? { label: "Done", bg: SUCCESS_LT, color: SUCCESS }
                        : undefined,
                    }))
                  : [{ dotColor: AMBER_DK, text: "No studies yet", sub: "Launch your first brief to get started" }]
              }
            />
            <PhasePreviewCard
              num="3" title="Act" subtitle="Strategic gaps & recommendations" color={CORAL} onOpen={() => setLocation("/portal/act")}
              items={[
                { dotColor: CORAL,   text: "Energy Drink — autonomous narrative r…",      sub: "72% purchase intent · 3 strategic gaps identified",  chip: { label: "Action", bg: CORAL_LT,   color: CORAL    } },
                { dotColor: AMBER_DK,text: "Commitment gap widening — 28pt belo…",         sub: "Recommend packaging/pricing bridge study",            chip: { label: "Watch",  bg: AMBER_LT,  color: AMBER_DK } },
                { dotColor: SUCCESS, text: "4 strategic recommendations available",         sub: "2 high priority · 2 medium priority",                 chip: { label: "Ready",  bg: SUCCESS_LT, color: SUCCESS  } },
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
                <select className="rounded-lg px-3 py-2 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }} data-testid="select-client-filter">
                  <option>All Clients</option>
                  <option>Rugani Juice</option>
                  <option>Discovery Bank</option>
                  <option>Meta</option>
                </select>
                <button onClick={() => setLocation("/portal/test")} className="text-xs font-semibold flex items-center gap-1" style={{ color: VIO }} data-testid="link-view-all-studies">
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
                  <StudyCard key={study.id} study={study} onActClick={() => setLocation("/portal/act")} />
                ))}
              </div>
            ) : (
              <div style={CARD} className="p-10 text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: N500 }} />
                <p className="text-sm font-semibold mb-1" style={{ color: VDK }}>No studies yet</p>
                <p className="text-xs mb-4" style={{ color: N500 }}>Launch your first brief to start collecting consumer insights.</p>
                <button onClick={() => setLocation("/portal/launch")} data-testid="button-launch-first-brief" className="text-sm font-semibold px-5 py-2 text-white rounded-lg" style={{ background: CORAL }}>
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
function JourneyCard({ num, tag, question, subtitle, stat, gradient, onClick, testId }: {
  num: string; tag: string; question: string; subtitle: string; stat: string;
  gradient: string; onClick: () => void; testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="text-left w-full rounded-2xl p-5 relative overflow-hidden group"
      style={{ background: gradient, minHeight: 180 }}
    >
      {/* Subtle circle decoration */}
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "#fff", transform: "translate(30%, 30%)" }} />
      <div className="absolute top-6 right-6 w-24 h-24 rounded-full opacity-5" style={{ background: "#fff" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono text-white" style={{ border: "2px solid rgba(255,255,255,0.5)" }}>
            {num}
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}>
            {tag}
          </span>
        </div>
        <div className="font-serif text-2xl text-white mb-1 leading-snug">{question}</div>
        <div className="text-xs mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{subtitle}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
            {stat}
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
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
        <div className="text-xs font-medium mb-2" style={{ color: color }}>{highlight}</div>
        <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded" style={{ background: `${color}18`, color }}>
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
    <div style={CARD} className="overflow-hidden">
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
function StudyCard({ study, onActClick }: { study: any; onActClick: () => void }) {
  const typeBadge = (() => {
    const t = study.studyType?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: "#EAE8FF", color: VIO };
    return                        { label: "BASIC",  bg: "#DFF6FC", color: CYAN_DK };
  })();

  const isComplete = study.status?.toLowerCase().includes("complete");

  const bigMetrics = [
    { label: "IDEA",       val: study.topIdeaIdeaScore   },
    { label: "INTEREST",   val: study.topIdeaInterest    },
    { label: "COMMITMENT", val: study.topIdeaCommitment  },
  ].filter(m => m.val !== null && m.val !== undefined);

  const smallMetrics = [
    { label: "MEANING",    val: study.topIdeaMeaning     },
    { label: "DIFFERENCE", val: study.topIdeaDifference  },
    { label: "WORTH",      val: study.topIdeaWorth       },
  ].filter(m => m.val !== null && m.val !== undefined);

  // Pick an icon based on study name/type
  const Icon = (() => {
    const t = (study.title || "").toLowerCase();
    if (t.includes("campaign") || t.includes("ad") || t.includes("creative")) return Zap;
    if (t.includes("bank") || t.includes("audit") || t.includes("finance"))   return CreditCard;
    return Home;
  })();

  const iconBg = (() => {
    const t = (study.title || "").toLowerCase();
    if (t.includes("campaign") || t.includes("ad"))  return "linear-gradient(135deg, #2A9E5C, #3DBF72)";
    if (t.includes("bank") || t.includes("audit"))   return "linear-gradient(135deg, #3A2FBF, #5b50d9)";
    return "linear-gradient(135deg, #E85A3A, #EF8A4E)";
  })();

  return (
    <div style={CARD} className="overflow-hidden flex flex-col" data-testid={`study-card-${study.id}`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3" style={{ borderBottom: `1px solid ${N200}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug mb-1" style={{ color: VDK }}>{study.title}</div>
          <div className="text-[11px]" style={{ color: N500 }}>
            {[study.companyName, study.industry].filter(Boolean).join(" · ")}
            {study.respondentCount ? ` · ${study.respondentCount} respondents` : ""}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: typeBadge.bg, color: typeBadge.color }}>
            {typeBadge.label}
          </span>
          {isComplete && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: SUCCESS_LT, color: SUCCESS }}>
              Complete
            </span>
          )}
        </div>
      </div>

      {/* Big metrics (Idea / Interest / Commitment) */}
      {bigMetrics.length > 0 && (
        <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-2">
          {bigMetrics.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-2xl font-bold font-mono leading-none" style={{ color: metricColor(m.val) }}>{m.val}%</div>
              <div className="text-[9px] font-bold tracking-widest mt-1" style={{ color: N500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Small metrics (Meaning / Difference / Worth) */}
      {smallMetrics.length > 0 && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          {smallMetrics.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-base font-bold font-mono leading-none" style={{ color: N400 }}>{m.val}%</div>
              <div className="text-[9px] font-bold tracking-widest mt-0.5" style={{ color: N500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2 mt-auto" style={{ borderTop: `1px solid ${N200}` }}>
        <button
          onClick={onActClick}
          data-testid={`button-act-study-${study.id}`}
          className="flex-1 text-xs font-semibold py-2 text-white rounded-lg"
          style={{ background: VIO }}
        >
          Analyse in Act
        </button>
        {study.pdfUrl && (
          <button
            onClick={() => window.open(study.pdfUrl, "_blank")}
            data-testid={`button-download-study-${study.id}`}
            className="flex-1 text-xs font-semibold py-2 flex items-center justify-center gap-1 rounded-lg"
            style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }}
          >
            <Download className="w-3 h-3" /> Download PDF
          </button>
        )}
      </div>
    </div>
  );
}
