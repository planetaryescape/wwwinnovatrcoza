import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AIQueryPanel from "@/components/portal/AIQueryPanel";
import { useLocation } from "wouter";
import {
  X, Sparkles, TrendingUp, TrendingDown, Activity,
  MessageSquare, Star, DollarSign, Eye, Clock, AlertTriangle,
  Search, Table2, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { ClientReport } from "@shared/schema";

/* ── Design System ───────────────────────────────────────── */
const VDK      = "#1E1B3A";
const VIO      = "#3A2FBF";
const N200     = "#E2D5BF";
const N400     = "#A89078";
const N500     = "#8A7260";
const SUCCESS  = "#2A9E5C";
const SUC_LT   = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CYAN     = "#4EC9E8";
const CORAL    = "#E8503A";
const CORAL_LT = "#FDECEA";
const CREAM    = "#FAF3E8";

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.06)",
};

/* ── Helpers ─────────────────────────────────────────────── */
function avg(arr: (number | null | undefined)[]): number {
  const v = arr.filter((x): x is number => x != null && !isNaN(x));
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
}

function scoreColor(v: number) {
  if (v >= 70) return SUCCESS;
  if (v >= 50) return AMBER_DK;
  return CORAL;
}

function trendLabel(idea: number, interest: number, commit: number) {
  if (idea >= 70 && interest >= 65 && commit >= 55) return { label: "Strong",  bg: SUC_LT,   color: SUCCESS  };
  if (idea < 50 || interest < 45 || commit < 35)    return { label: "Weak",    bg: CORAL_LT, color: CORAL   };
  return                                                    { label: "Mixed",   bg: AMBER_LT, color: AMBER_DK };
}

/* ── Circular progress SVG ───────────────────────────────── */
function CircleProgress({ value, size = 60, strokeWidth = 5, color, bg }: {
  value: number; size?: number; strokeWidth?: number; color: string; bg: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(value, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Horizontal bar row for Score Over Time ──────────────── */
function ScoreRow({ label, color, delta, deltaColor, points }: {
  label: string; color: string; delta: string; deltaColor: string; points: number[];
}) {
  return (
    <div className="py-5" style={{ borderBottom: `1px solid ${N200}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-sm font-medium" style={{ color: VDK }}>{label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: deltaColor }}>{delta}</span>
      </div>
      <div className="space-y-1">
        {points.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 h-4 rounded-full overflow-hidden relative" style={{ background: "#F0EBE0" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(Math.max(0, Math.min(p, 100)) / 100) * 100}%`, background: color, opacity: 0.9 - i * 0.15 }} />
            </div>
            <span className="text-xs w-6 text-right font-mono" style={{ color: N500 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: VIO + "15" }}>
        <Activity className="w-6 h-6" style={{ color: VIO }} />
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: VDK }}>No studies yet</h3>
      <p className="text-sm max-w-xs" style={{ color: N500 }}>
        Once your first research study is completed and delivered, your health metrics will appear here.
      </p>
    </div>
  );
}

export default function HealthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: rawReports = [], isLoading } = useQuery<ClientReport[]>({
    queryKey: ["/api/member/client-reports"],
    enabled: !!user,
  });

  /* ── Derive all computed values from real data ─────────── */
  const completed = useMemo(() =>
    rawReports
      .filter(r => r.status === "Completed" && r.topIdeaIdeaScore != null)
      .sort((a, b) =>
        new Date(a.deliveredAt ?? a.createdAt).getTime() -
        new Date(b.deliveredAt ?? b.createdAt).getTime()
      ),
    [rawReports]
  );

  const avgIdea     = useMemo(() => avg(completed.map(r => r.topIdeaIdeaScore)), [completed]);
  const avgInterest = useMemo(() => avg(completed.map(r => r.topIdeaInterest)),  [completed]);
  const avgCommit   = useMemo(() => avg(completed.map(r => r.topIdeaCommitment)), [completed]);

  const latest = completed[completed.length - 1];
  const prev   = completed[completed.length - 2];
  const deltaIdea     = latest && prev ? (latest.topIdeaIdeaScore  ?? 0) - (prev.topIdeaIdeaScore  ?? 0) : 0;
  const deltaInterest = latest && prev ? (latest.topIdeaInterest   ?? 0) - (prev.topIdeaInterest   ?? 0) : 0;
  const deltaCommit   = latest && prev ? (latest.topIdeaCommitment ?? 0) - (prev.topIdeaCommitment ?? 0) : 0;

  /* Score history — last 3 data points per metric */
  const histSlice    = completed.slice(-3);
  const histLabels   = histSlice.length === 0 ? [] : histSlice.length === 1 ? ["Latest"] : histSlice.length === 2 ? ["Study 1", "Latest"] : ["Study 1", "Study 2", "Latest"];
  const ideaPoints   = histSlice.map(r => r.topIdeaIdeaScore  ?? 0);
  const intPoints    = histSlice.map(r => r.topIdeaInterest   ?? 0);
  const comPoints    = histSlice.map(r => r.topIdeaCommitment ?? 0);
  const mdwPoints    = histSlice.map(r => avg([r.topIdeaIdeaScore, r.topIdeaInterest, r.topIdeaCommitment]));

  const scoreHistory = [
    { label: "Idea Score",   color: "#2A9E5C", delta: deltaIdea     > 0 ? `+${deltaIdea}`   : String(deltaIdea),     deltaColor: deltaIdea     >= 0 ? SUCCESS : CORAL, points: ideaPoints  },
    { label: "Interest",     color: "#5b50d9", delta: deltaInterest > 0 ? `+${deltaInterest}` : String(deltaInterest), deltaColor: deltaInterest >= 0 ? SUCCESS : CORAL, points: intPoints   },
    { label: "Commitment",   color: "#E8503A", delta: deltaCommit   > 0 ? `+${deltaCommit}`  : String(deltaCommit),   deltaColor: deltaCommit   >= 0 ? SUCCESS : CORAL, points: comPoints   },
    { label: "MDW Overall",  color: VIO,       delta: "Avg",         deltaColor: N400, points: mdwPoints   },
  ].filter(row => row.points.length > 0);

  /* Brand Pillars — derived from IIC averages */
  const brandPillars = useMemo(() => {
    const minPillar = Math.min(avgIdea, avgInterest, avgCommit);
    return [
      {
        label: "Meaning", sub: "Brand resonance & purpose",
        value: avgIdea, icon: MessageSquare, color: "#3A2FBF", barColor: "#3A2FBF",
        tags: `Idea strength ${avgIdea}% · Top concept resonance`,
        isWeakest: avgIdea === minPillar,
      },
      {
        label: "Difference", sub: "Distinctiveness & uniqueness",
        value: avgInterest, icon: Star, color: "#E8503A", barColor: "#E8503A",
        tags: `Interest score ${avgInterest}% · Audience curiosity`,
        isWeakest: avgInterest === minPillar,
      },
      {
        label: "Worth", sub: "Perceived value & premium",
        value: avgCommit, icon: DollarSign, color: "#2A9E5C", barColor: "#2A9E5C",
        tags: `Commitment ${avgCommit}% · Purchase intent driver`,
        isWeakest: avgCommit === minPillar,
      },
    ];
  }, [avgIdea, avgInterest, avgCommit]);

  /* Study rows for scores table */
  const studyRows = useMemo(() =>
    completed.map(r => {
      const idea     = r.topIdeaIdeaScore  ?? 0;
      const interest = r.topIdeaInterest   ?? 0;
      const commit   = r.topIdeaCommitment ?? 0;
      const { label, bg, color } = trendLabel(idea, interest, commit);
      return { id: r.id, name: r.title, idea, interest, commit, trend: label, tBg: bg, tColor: color };
    }),
    [completed]
  );

  /* Gaps — derived from score patterns */
  const gaps = useMemo(() => {
    const g: { title: string; level: string; levelBg: string; levelColor: string; detail: string; value: string }[] = [];
    const ciGap = avgInterest - avgCommit;
    if (ciGap >= 8) {
      g.push({
        title: "Commitment–Interest Gap",
        level: ciGap >= 20 ? "HIGH" : "MEDIUM",
        levelBg: ciGap >= 20 ? CORAL_LT : AMBER_LT,
        levelColor: ciGap >= 20 ? CORAL : AMBER_DK,
        detail: `Interest ${avgInterest}% → Commitment ${avgCommit}%`,
        value: `${ciGap} pts`,
      });
    }
    const diffDeficit = avgIdea - avgInterest;
    if (diffDeficit >= 8) {
      g.push({
        title: "Differentiation Deficit",
        level: "MEDIUM",
        levelBg: AMBER_LT,
        levelColor: AMBER_DK,
        detail: `Idea resonance ${avgIdea}% vs Interest ${avgInterest}%`,
        value: `${diffDeficit} pts`,
      });
    }
    const weakStudy = completed.find(r => (r.topIdeaCommitment ?? 100) < 35);
    if (weakStudy) {
      g.push({
        title: `Low commitment — ${weakStudy.title}`,
        level: "HIGH",
        levelBg: CORAL_LT,
        levelColor: CORAL,
        detail: `Commitment below 35% threshold — needs urgent attention`,
        value: `${weakStudy.topIdeaCommitment}%`,
      });
    }
    if (g.length === 0) {
      g.push({
        title: "Portfolio looking healthy",
        level: "OK",
        levelBg: SUC_LT,
        levelColor: SUCCESS,
        detail: "No critical gaps detected in current study set",
        value: "—",
      });
    }
    return g;
  }, [completed, avgIdea, avgInterest, avgCommit]);

  /* Strategic takeaways — derived from patterns */
  const takeaways = useMemo(() => {
    const t: { icon: string; bold: string; rest: string }[] = [];
    if (completed.length === 0) return t;
    if (avgIdea >= 75) t.push({ icon: "💡", bold: "Idea traction strong", rest: ` — concept scores average ${avgIdea}% across your portfolio, confirming robust unmet-need signals.` });
    if (avgCommit < avgInterest - 15) t.push({ icon: "⚠️", bold: "Commitment gap widening", rest: ` — Commitment trails Interest by ${avgInterest - avgCommit} pts. Pricing narrative and CTA clarity are the primary levers.` });
    if (deltaInterest > 0 && completed.length >= 2) t.push({ icon: "📈", bold: "Interest momentum building", rest: ` — Interest Score up +${deltaInterest} pts vs last study. Audience curiosity is growing.` });
    const weakestPillar = brandPillars.reduce((a, b) => a.value < b.value ? a : b);
    if (weakestPillar.value < 60) t.push({ icon: "🔍", bold: `${weakestPillar.label} pillar is weakest`, rest: ` at ${weakestPillar.value}% — this is the area most in need of focused research investment.` });
    if (t.length === 0) t.push({ icon: "✅", bold: "Portfolio healthy", rest: ` — All three pillars are scoring above 60%. Continue building on this momentum.` });
    return t;
  }, [completed, avgIdea, avgInterest, avgCommit, deltaInterest, brandPillars]);

  /* Score Cards config */
  const scoreCards = [
    { label: "IDEA SCORE",       value: avgIdea,     delta: deltaIdea,     icon: Clock,    gradient: "linear-gradient(135deg, #2A9E5C 0%, #1e7a46 100%)", circleColor: "rgba(255,255,255,0.5)", circleBg: "rgba(255,255,255,0.15)" },
    { label: "INTEREST SCORE",   value: avgInterest, delta: deltaInterest, icon: Eye,      gradient: "linear-gradient(135deg, #3A2FBF 0%, #5b50d9 100%)", circleColor: "rgba(255,255,255,0.5)", circleBg: "rgba(255,255,255,0.15)" },
    { label: "COMMITMENT SCORE", value: avgCommit,   delta: deltaCommit,   icon: Sparkles, gradient: "linear-gradient(135deg, #E8503A 0%, #c23a26 50%, #b8360a 100%)", circleColor: "rgba(255,255,255,0.5)", circleBg: "rgba(255,255,255,0.15)" },
  ];

  const hasData = completed.length > 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <div className="flex flex-col w-full h-full">

        {/* ── Topbar ── */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1" style={{ background: "rgba(78,201,232,0.2)", color: CYAN, border: "1px solid rgba(78,201,232,0.4)", borderRadius: 6 }}>
              PHASE 04
            </span>
            <h1 className="font-serif text-xl text-white">Company</h1>
            <span className="text-sm hidden sm:block" style={{ color: N400 }}>Track overall health across all studies</span>
          </div>
          <button
            onClick={() => setLocation("/portal/dashboard")}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            data-testid="button-close-health"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Main content ── */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: CREAM }}>

            {/* Page header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: SUCCESS }}>Overall Health</div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: VDK }}>Company Health Centre</h2>
                <p className="text-sm" style={{ color: N500 }}>Track overall health, idea traction, and commitment signals across all studies.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {isLoading ? (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: N400 }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading data…
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SUCCESS }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: SUCCESS }} />
                    {completed.length} {completed.length === 1 ? "study" : "studies"} analysed
                  </div>
                )}
              </div>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: VIO }} />
                <p className="text-sm" style={{ color: N500 }}>Loading your health data…</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !hasData && <EmptyState />}

            {/* ── Data content ── */}
            {!isLoading && hasData && (
              <>
                {/* ── 3 Score Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {scoreCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: card.gradient }} data-testid={`health-score-card-${i}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-white opacity-80 mb-2">{card.label}</div>
                            <div className="flex items-end gap-1">
                              <span className="text-4xl font-bold text-white">{card.value}</span>
                              <span className="text-2xl font-bold text-white opacity-80 mb-1">%</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {card.delta > 0 ? <TrendingUp  className="w-3.5 h-3.5 text-white opacity-80" />
                               : card.delta < 0 ? <TrendingDown className="w-3.5 h-3.5 text-white opacity-80" />
                               : null}
                              <span className="text-xs font-medium text-white opacity-80">
                                {completed.length >= 2
                                  ? `${card.delta > 0 ? `+${card.delta}` : card.delta} vs last study`
                                  : "First study baseline"}
                              </span>
                            </div>
                          </div>
                          <CircleProgress value={card.value} size={56} strokeWidth={5} color={card.circleColor} bg={card.circleBg} />
                        </div>
                        <div className="absolute bottom-3 right-4 opacity-15">
                          <Icon className="w-16 h-16 text-white" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Brand Pillars ── */}
                <div style={{ ...CARD, marginBottom: 20 }} className="p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: VIO }} />
                      <span className="text-sm font-semibold" style={{ color: VDK }}>Brand Pillars</span>
                    </div>
                    <div className="text-xs" style={{ color: N500 }}>Meaning · Difference · Worth</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {brandPillars.map((p, i) => {
                      const Icon = p.icon;
                      const weakColor = p.isWeakest ? "#C0392B" : p.color;
                      return (
                        <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${p.isWeakest ? "#fca5a5" : N200}`, background: p.isWeakest ? "#FFF8F8" : "#FAFAF8" }}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: weakColor + "18", border: `1px solid ${weakColor}22` }}>
                                <Icon className="w-4 h-4" style={{ color: weakColor }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold" style={{ color: VDK }}>{p.label}</span>
                                  {p.isWeakest && <AlertTriangle className="w-3 h-3" style={{ color: weakColor }} />}
                                </div>
                                <div className="text-xs" style={{ color: N500 }}>{p.sub}</div>
                              </div>
                            </div>
                            <span className="text-xl font-bold font-mono" style={{ color: weakColor }}>{p.value}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "#F0EBE0" }}>
                            <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.isWeakest ? weakColor : p.barColor }} />
                          </div>
                          <div className="text-[10px]" style={{ color: N500 }}>{p.tags}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Score Over Time ── */}
                {histSlice.length >= 2 && (
                  <div style={{ ...CARD, marginBottom: 20 }} className="p-5">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" style={{ color: VIO }} />
                        <span className="text-sm font-semibold" style={{ color: VDK }}>Score Over Time</span>
                      </div>
                      <span className="text-xs" style={{ color: N500 }}>Across {completed.length} studies</span>
                    </div>
                    <div>
                      {scoreHistory.map((row, i) => <ScoreRow key={i} {...row} />)}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      {histLabels.map((l, i) => (
                        <span key={i} className="text-xs" style={{ color: N500 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Strategic Takeaways + Gaps ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

                  {/* Strategic Takeaways */}
                  <div className="rounded-2xl p-5" style={{ background: VDK }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-white opacity-70" />
                        <span className="text-sm font-semibold text-white">Strategic Takeaways</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: VIO, color: "#fff" }}>AI Generated</span>
                    </div>
                    <div className="space-y-4">
                      {takeaways.map((t, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-lg leading-none flex-shrink-0 mt-0.5">{t.icon}</span>
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                            <strong className="text-white">{t.bold}</strong>{t.rest}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaps to Bridge */}
                  <div style={CARD} className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: CORAL }} />
                        <span className="text-sm font-semibold" style={{ color: VDK }}>Gaps to Bridge</span>
                      </div>
                      <span className="text-xs" style={{ color: N500 }}>{gaps.length} identified</span>
                    </div>
                    <div className="space-y-0">
                      {gaps.map((gap, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: i < gaps.length - 1 ? `1px solid ${N200}` : "none" }} data-testid={`gap-row-${i}`}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{gap.title}</div>
                            <div className="text-xs" style={{ color: N500 }}>{gap.detail}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: gap.levelBg, color: gap.levelColor }}>{gap.level}</span>
                            <span className="text-sm font-bold font-mono" style={{ color: VDK }}>{gap.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Study Scores table ── */}
                <div style={CARD} className="p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Table2 className="w-4 h-4" style={{ color: VIO }} />
                    <span className="text-sm font-semibold" style={{ color: VDK }}>Study Scores</span>
                    <span className="text-xs ml-1" style={{ color: N500 }}>({studyRows.length} {studyRows.length === 1 ? "study" : "studies"})</span>
                  </div>
                  <table className="w-full text-sm" data-testid="table-study-scores">
                    <thead>
                      <tr>
                        {["STUDY", "IDEA", "INTEREST", "COMMIT", "TREND"].map(h => (
                          <th key={h} className="text-left text-[10px] font-bold tracking-widest uppercase pb-3 pr-4" style={{ color: N500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {studyRows.map((s, i) => (
                        <tr
                          key={s.id}
                          className="cursor-pointer hover-elevate"
                          style={{ borderTop: `1px solid ${N200}` }}
                          data-testid={`study-row-${i}`}
                          onClick={() => setLocation("/portal/test")}
                        >
                          <td className="py-3 pr-4 font-semibold" style={{ color: VDK }}>{s.name}</td>
                          <td className="py-3 pr-4 font-bold font-mono" style={{ color: scoreColor(s.idea) }}>{s.idea}%</td>
                          <td className="py-3 pr-4 font-bold font-mono" style={{ color: scoreColor(s.interest) }}>{s.interest}%</td>
                          <td className="py-3 pr-4 font-bold font-mono" style={{ color: scoreColor(s.commit) }}>{s.commit}%</td>
                          <td className="py-3">
                            <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: s.tBg, color: s.tColor }}>{s.trend}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>

          {/* ── Right: AI Panel ── */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ borderLeft: `1px solid ${N200}` }}>
            <AIQueryPanel
              accentColor={SUCCESS}
              label="Health AI"
              suggestedPrompts={[
                "What's driving the commitment gap?",
                "Which study needs urgent attention?",
                "How do I improve the Difference pillar?",
                "Compare my brand pillars vs benchmark",
              ]}
              defaultSource="research"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
