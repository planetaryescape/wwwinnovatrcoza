import { useMemo, useEffect } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, ArrowRight, Sparkles, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import type { Company } from "@shared/schema";

/* ── Design System tokens ─────────────────────────────── */
const VDK        = "#1E1B3A";
const VIO        = "#3A2FBF";
const VIO_LT     = "#EAE8FF";
const CORAL      = "#E8503A";
const CORAL_LT   = "#FDECEA";
const CYAN_DK    = "#1A8FAD";
const CYAN_LT    = "#DFF6FC";
const AMBER_DK   = "#B8911A";
const AMBER_LT   = "#FEF6D6";
const N200       = "#E2D5BF";
const N500       = "#8A7260";
const SUCCESS    = "#2A9E5C";
const SUCCESS_LT = "#D1FAE5";
const CREAM      = "#FAF3E8";

/* Phase colours */
const EXPLORE_COLOR = VIO;
const TEST_COLOR    = SUCCESS;
const ACT_COLOR     = CORAL;
const HEALTH_COLOR  = "#4EC9E8";

const CARD_STYLE: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.08)",
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isPaidMember } = useAuth();

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

  const { data: userActivity, isLoading: isLoadingActivity } = useQuery<{
    studiesCompleted: number; liveStudies: number; reportsDownloaded: number;
    discountSaved: number; basicCreditsRemaining: number; proCreditsRemaining: number;
  }>({ queryKey: ["/api/member/activity", user?.id], enabled: !!user });

  const { data: clientReports, isLoading: isLoadingReports } = useQuery<any[]>({
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

  return (
    <PortalLayout>
      <div className="flex-1 overflow-y-auto" style={{ background: CREAM }}>
        {/* Page header */}
        <div className="px-7 pt-7 pb-0">
          <div
            className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1.5"
            style={{ color: CORAL }}
          >
            <Sparkles className="w-3 h-3" />
            {greeting}, {user?.name?.split(" ")[0]} &middot;{" "}
            {isPaidMember ? (user?.membershipTier?.toUpperCase() || "STARTER") : "FREE"} Tier
          </div>
          <h1 className="font-serif text-4xl mb-1" style={{ color: VDK }}>Dashboard</h1>
          <p className="text-sm mb-7" style={{ color: N500 }}>
            Your intelligence hub — trends, live studies, and strategic signals, all in one place.
          </p>
        </div>

        <div className="px-7 pb-7 space-y-5">
          {/* Credit strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <CreditChip value={isLoadingActivity ? null : basicCredits} label="Basic credits" sub="available" color={TEST_COLOR}    testId="stat-basic-credits" />
            <CreditChip value={isLoadingActivity ? null : proCredits}   label="Pro credits"   sub="available" color={EXPLORE_COLOR} testId="stat-pro-credits"   />
            <CreditChip value={isLoadingActivity ? null : studiesDone}  label="Studies done"  sub="this year" color={N500}          testId="stat-studies-done"  />
            <div className="flex-1" />
            <button
              onClick={() => setLocation("/portal/act")}
              data-testid="button-view-recommendations"
              className="text-xs font-semibold flex items-center gap-1.5 px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: VIO, color: "#fff", borderRadius: 8 }}
            >
              View recommendations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Journey phase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <JourneyCard num="1" question="What's happening?"  title="Explore" subtitle="Trends & Insights · Sandbox · Market Signals"      stat={`12 signals active`}          color={EXPLORE_COLOR} onClick={() => setLocation("/portal/explore")} testId="card-journey-explore" />
            <JourneyCard num="2" question="Does my idea work?" title="Test"    subtitle="Projects Overview · Test24 · QA Results"            stat={`${liveStudies} live ${liveStudies === 1 ? "study" : "studies"}`} color={TEST_COLOR}    onClick={() => setLocation("/portal/test")}    testId="card-journey-test"    />
            <JourneyCard num="3" question="What should I do?"  title="Act"    subtitle="Gaps · Recommendations · Strategic Next Steps"       stat="4 recommendations"            color={ACT_COLOR}     onClick={() => setLocation("/portal/act")}     testId="card-journey-act"     />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard num={isLoadingActivity ? null : 12}          label="Signals"         sub={<>Trends & Insights active<br />+3 overnight</>}              cta="Explore"   color={EXPLORE_COLOR} onClick={() => setLocation("/portal/explore")} testId="stat-card-signals"         />
            <StatCard num={isLoadingActivity ? null : liveStudies}  label="Live Studies"    sub={<>In field now<br />{liveStudies > 0 ? "67% complete" : "None running"}</>}  cta="Test"      color={TEST_COLOR}    onClick={() => setLocation("/portal/test")}    testId="stat-card-live"           />
            <StatCard num={4}                                        label="Recommendations" sub={<>Strategic actions ready<br />2 high priority</>}            cta="Act"       color={ACT_COLOR}     onClick={() => setLocation("/portal/act")}     testId="stat-card-recommendations" />
            <StatCard num={isLoadingActivity ? null : studiesDone}  label="Studies Done"    sub={<>Complete this year<br />+1 this month</>}                   cta="Portfolio" color={HEALTH_COLOR}  onClick={() => setLocation("/portal/test")}    testId="stat-card-studies"        />
          </div>

          {/* Phase preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PhasePreviewCard
              num="1" title="Explore" subtitle="Trends, insights & market signals" color={EXPLORE_COLOR} onOpen={() => setLocation("/portal/explore")}
              items={[
                { dotColor: EXPLORE_COLOR, text: "Nootropic beverages +41% search intent",    sub: "25–34 urban cohort · Detected overnight", chip: { label: "Trend",   bg: VIO_LT,    color: VIO     } },
                { dotColor: TEST_COLOR,    text: "Functional Beverages 2025 — new report",    sub: "Innovatr Inside · GROWTH+ · 3 min read",  chip: { label: "New",     bg: "#D1FAE5", color: SUCCESS } },
                { dotColor: N500,          text: "12 active market signals across categories", sub: "Food & Bev · Beauty · FMCG",              chip: { label: "Signals", bg: VIO_LT,    color: VIO     } },
              ]}
            />
            <PhasePreviewCard
              num="2" title="Test" subtitle="Live studies & projects overview" color={TEST_COLOR} onOpen={() => setLocation("/portal/test")}
              items={isLoadingReports
                ? [{ dotColor: AMBER_DK, text: "Loading…", sub: "" }]
                : recentStudies.length > 0
                  ? recentStudies.map((r: any) => ({
                      dotColor: r.status?.toLowerCase().includes("complete") ? TEST_COLOR : AMBER_DK,
                      text: r.title, sub: `${r.studyType?.replace("_", " ") || "Study"} · ${r.status || ""}`,
                      chip: r.status?.toLowerCase().includes("complete") ? { label: "Done", bg: SUCCESS_LT, color: SUCCESS } : undefined,
                    }))
                  : [{ dotColor: AMBER_DK, text: "No studies yet", sub: "Launch your first brief to get started" }]
              }
            />
            <PhasePreviewCard
              num="3" title="Act" subtitle="Strategic gaps & recommendations" color={ACT_COLOR} onOpen={() => setLocation("/portal/act")}
              items={[
                { dotColor: ACT_COLOR,  text: "Energy Drink — narrative ready",             sub: "72% purchase intent · 3 strategic gaps identified", chip: { label: "Action", bg: CORAL_LT, color: CORAL }     },
                { dotColor: AMBER_DK,  text: "Commitment gap widening — 28pt below Idea",   sub: "Recommend packaging/pricing bridge study",           chip: { label: "Watch",  bg: AMBER_LT, color: AMBER_DK }  },
                { dotColor: TEST_COLOR, text: "4 strategic recommendations available",       sub: "2 high priority · 2 medium priority",               chip: { label: "Ready",  bg: SUCCESS_LT, color: SUCCESS }  },
              ]}
            />
          </div>

          {/* Studies portfolio */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Studies</span>
                <span className="text-sm" style={{ color: N500 }}>Your complete research portfolio</span>
              </div>
              <button className="text-xs font-semibold flex items-center gap-1" style={{ color: VIO }} onClick={() => setLocation("/portal/test")} data-testid="link-view-all-studies">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              {isLoadingReports
                ? [1, 2].map(i => (
                    <div key={i} style={CARD_STYLE} className="p-5">
                      <Skeleton className="h-5 w-1/2 mb-2" /><Skeleton className="h-3 w-1/3" />
                    </div>
                  ))
                : recentStudies.length > 0
                  ? recentStudies.map((study: any) => (
                      <StudyCard key={study.id} study={study} onActClick={() => setLocation("/portal/act")} />
                    ))
                  : (
                    <div style={CARD_STYLE} className="p-10 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: N500 }} />
                      <p className="text-sm font-semibold mb-1" style={{ color: VDK }}>No studies yet</p>
                      <p className="text-xs mb-4" style={{ color: N500 }}>Launch your first brief to start collecting consumer insights.</p>
                      <button
                        onClick={() => setLocation("/portal/launch")}
                        data-testid="button-launch-first-brief"
                        className="text-sm font-semibold px-5 py-2 text-white rounded-lg"
                        style={{ background: CORAL, borderRadius: 8 }}
                      >
                        Launch a Brief
                      </button>
                    </div>
                  )
              }
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

/* ── Sub-components ──────────────────────────────────────── */

function CreditChip({ value, label, sub, color, testId }: { value: number | null; label: string; sub: string; color: string; testId: string }) {
  return (
    <div style={CARD_STYLE} className="flex items-center gap-3 px-5 py-3" data-testid={testId}>
      <span className="text-2xl font-bold font-mono" style={{ color }}>
        {value === null ? <Skeleton className="h-7 w-8 inline-block" /> : value}
      </span>
      <div>
        <div className="text-xs" style={{ color: N500 }}>{label}</div>
        <div className="text-[10px] font-bold" style={{ color }}>{sub}</div>
      </div>
    </div>
  );
}

function JourneyCard({ num, question, title, subtitle, stat, color, onClick, testId }: {
  num: string; question: string; title: string; subtitle: string; stat: string; color: string; onClick: () => void; testId: string;
}) {
  return (
    <button onClick={onClick} data-testid={testId} className="text-left w-full relative overflow-hidden group transition-shadow hover:shadow-md" style={{ ...CARD_STYLE }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
      <div className="p-5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono mb-3" style={{ border: `2px solid ${color}`, color }}>
          {num}
        </div>
        <div className="text-xs font-bold mb-1" style={{ color }}>{question}</div>
        <div className="font-serif text-xl mb-1" style={{ color: VDK }}>{title}</div>
        <div className="text-xs mb-3 leading-relaxed" style={{ color: N500 }}>{subtitle}</div>
        <div className="text-sm font-semibold" style={{ color }}>{stat}</div>
        <div className="absolute bottom-4 right-4 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
          Open <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}

function StatCard({ num, label, sub, cta, color, onClick, testId }: {
  num: number | null; label: string; sub: React.ReactNode; cta: string; color: string; onClick: () => void; testId: string;
}) {
  return (
    <button onClick={onClick} data-testid={testId} className="text-left w-full transition-shadow hover:shadow-md" style={{ ...CARD_STYLE, borderTop: `3px solid ${color}` }}>
      <div className="p-4">
        <div className="text-3xl font-bold font-mono mb-1 leading-none" style={{ color: VDK }}>
          {num === null ? <Skeleton className="h-8 w-12 inline-block" /> : num}
        </div>
        <div className="text-sm mb-1" style={{ color: N500 }}>{label}</div>
        <div className="text-xs mb-2 leading-snug" style={{ color: N500 }}>{sub}</div>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color }}>
          {cta} <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  );
}

function PhasePreviewCard({ num, title, subtitle, color, onOpen, items }: {
  num: string; title: string; subtitle: string; color: string; onOpen: () => void;
  items: { dotColor: string; text: string; sub?: string; chip?: { label: string; bg: string; color: string } }[];
}) {
  return (
    <div style={CARD_STYLE} className="overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono" style={{ border: `2px solid ${color}`, color }}>
            {num}
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: VDK }}>{title}</div>
            <div className="text-[11px]" style={{ color: N500 }}>{subtitle}</div>
          </div>
        </div>
        <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color }} onClick={onOpen}>
          Open <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dotColor }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs leading-snug" style={{ color: VDK }}>{item.text}</div>
              {item.sub && <div className="text-[11px] mt-0.5" style={{ color: N500 }}>{item.sub}</div>}
            </div>
            {item.chip && (
              <span className="text-[10px] font-semibold px-2 py-0.5 flex-shrink-0" style={{ background: item.chip.bg, color: item.chip.color, borderRadius: 9999 }}>
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
    { label: "Idea",    val: study.topIdeaIdeaScore },
    { label: "Interest",val: study.topIdeaInterest },
    { label: "Commit",  val: study.topIdeaCommitment },
    { label: "Meaning", val: study.topIdeaMeaning },
    { label: "Diff",    val: study.topIdeaDifference },
    { label: "Worth",   val: study.topIdeaWorth },
  ].filter(m => m.val !== null && m.val !== undefined);

  const getMetricColor = (val: number) => val >= 75 ? SUCCESS : val >= 55 ? AMBER_DK : CORAL;

  const typeBadge = (() => {
    const t = study.studyType?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,    color: VIO };
    return                        { label: "BASIC",  bg: CYAN_LT,   color: CYAN_DK };
  })();

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); } catch { return d; }
  };

  return (
    <div style={CARD_STYLE} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`study-card-${study.id}`}>
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold mb-1" style={{ color: VDK }}>{study.title}</div>
          <div className="text-xs" style={{ color: N500 }}>
            {[study.companyName, study.industry, study.uploadedAt ? formatDate(study.uploadedAt) : ""].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 tracking-wider" style={{ background: typeBadge.bg, color: typeBadge.color, borderRadius: 9999 }}>
            {typeBadge.label}
          </span>
          {study.status && (
            <span className="text-[10px] font-bold px-2 py-0.5" style={
              study.status?.toLowerCase().includes("complete")
                ? { background: SUCCESS_LT, color: SUCCESS, borderRadius: 9999 }
                : { background: AMBER_LT,   color: AMBER_DK, borderRadius: 9999 }
            }>
              {study.status?.toLowerCase().includes("complete") ? "Complete" : study.status}
            </span>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="px-5 pb-3 grid grid-cols-6 gap-1.5" style={{ borderBottom: `1px solid ${N200}` }}>
          {metrics.map(m => (
            <div key={m.label} className="text-center rounded-lg py-2" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
              <div className="text-base font-bold font-mono" style={{ color: getMetricColor(m.val) }}>{m.val}%</div>
              <div className="text-[9px] mt-0.5" style={{ color: N500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 flex gap-2">
        <button
          onClick={onActClick}
          data-testid={`button-act-study-${study.id}`}
          className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
          style={{ background: CORAL, borderRadius: 8 }}
        >
          Analyse in Act
        </button>
        {study.pdfUrl && (
          <button
            onClick={() => window.open(study.pdfUrl, "_blank")}
            data-testid={`button-download-study-${study.id}`}
            className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1 rounded-lg"
            style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
          >
            <Download className="w-3 h-3" /> Download PDF
          </button>
        )}
        {study.dashboardUrl && (
          <button
            onClick={() => window.open(study.dashboardUrl, "_blank")}
            data-testid={`button-dashboard-study-${study.id}`}
            className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1 rounded-lg"
            style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
          >
            <ExternalLink className="w-3 h-3" /> Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

