import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import AIQueryPanel from "@/components/portal/AIQueryPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sparkles, Send, MessageSquare, ChevronDown,
  CheckCircle2, ChevronRight, FileText,
  Search, AlertTriangle, BarChart2, Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ClientReport } from "@shared/schema";
import { useDigStudies, useDigRanking } from "@/lib/dig-api";
import { mapPreferredDigStudiesByReportId } from "@/lib/dig-study-selection";
import { PortalTabs } from "@/components/portal/PortalTabs";
import { PortalBreadcrumbs } from "@/components/portal/PortalBreadcrumbs";
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend as ReLegend,
} from "recharts";
import PortalLayout from "./PortalLayout";

/* ── Design System tokens ─────────────────────────────── */
const VDK      = "#1E1B3A";
const VIO      = "#3A2FBF";
const VIO_LT   = "#EAE8FF";
const CORAL    = "#E8503A";
const N200     = "#EBEBEB";
const N400     = "#A89078";
const N500     = "#8A7260";
const SUCCESS  = "#2A9E5C";
const SUC_LT   = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CYAN_DK  = "#1A8FAD";
const CYAN_LT  = "#DFF6FC";
const TEST_COLOR = SUCCESS;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const TEST_TAB_VALUES = ["studies", "assistant"] as const;
type Tab = typeof TEST_TAB_VALUES[number];
const TEST_TABS: { value: Tab; label: string; testId: string }[] = [
  { value: "studies", label: "Studies", testId: "tab-test-studies" },
  { value: "assistant", label: "Research Assistant", testId: "tab-test-assistant" },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  NEW:            { label: "Brief Submitted", bg: VIO_LT,  color: VIO      },
  AUDIENCE_LIVE:  { label: "In Field",        bg: CYAN_LT, color: CYAN_DK  },
  ANALYSING_DATA: { label: "Analysing",       bg: AMBER_LT, color: AMBER_DK },
  COMPLETED:      { label: "Complete",        bg: SUC_LT,  color: SUCCESS  },
};

const AI_PROMPTS = [
  "What drove the commitment gap?",
  "Compare energy drink vs plant snacks",
  "Generate a slide deck summary",
  "Build me a brief for next steps",
];

/* ── Map a real ClientReport to the rich study card format ── */
function mapReportToStudy(r: ClientReport, companyName?: string) {
  const idea       = r.topIdeaIdeaScore   ?? 0;
  const interest   = r.topIdeaInterest    ?? 0;
  const commitment = r.topIdeaCommitment  ?? 0;
  const lowIdea    = r.lowestIdeaIdeaScore ?? 0;
  const lowInterest= r.lowestIdeaInterest  ?? 0;
  const lowCommit  = r.lowestIdeaCommitment ?? 0;

  const metricSignal = (val: number, label: string) => {
    if (label === "COMMITMENT" && val < 60) return "Watch";
    if (val >= 75) return "Above norm";
    if (val >= 65) return "Strong";
    return null;
  };

  const metrics = [
    { label: "IDEA",        val: idea,        signal: metricSignal(idea, "IDEA"),        up: idea >= 65 },
    { label: "INTEREST",    val: interest,    signal: metricSignal(interest, "INTEREST"),    up: interest >= 65 },
    { label: "COMMITMENT",  val: commitment,  signal: metricSignal(commitment, "COMMITMENT"), up: commitment >= 60 },
    ...(r.lowestIdeaLabel ? [
      { label: "LOW IDEA",   val: lowIdea,    signal: null, up: null },
      { label: "LOW INTST",  val: lowInterest, signal: null, up: null },
      { label: "LOW CMMT",   val: lowCommit,  signal: null, up: null },
    ] : []),
  ];

  const commitGap = interest - commitment;

  const takeaways: { kind: "star" | "warn" | "chart"; text: string }[] = [];
  if (r.topIdeaLabel && idea > 0) {
    takeaways.push({ kind: "star",  text: `**${r.topIdeaLabel}** scored ${idea}% idea score — ${idea >= 75 ? "strong consumer resonance above category norms" : "concept shows promise; see next steps to improve"}.` });
  }
  if (interest > 0 && commitment > 0) {
    takeaways.push(commitGap >= 10
      ? { kind: "warn",  text: `Commitment gap of ${commitGap}pp (Interest ${interest}% → Commitment ${commitment}%) — purchase narrative needs strengthening to close the gap.` }
      : { kind: "chart", text: `Strong commitment-to-interest alignment at ${commitment}% — the concept is purchase-ready for your primary launch segment.` }
    );
  }
  if (r.lowestIdeaLabel && lowIdea > 0) {
    takeaways.push({ kind: "warn", text: `**${r.lowestIdeaLabel}** scored ${lowIdea}% — lowest concept in this study. Review positioning before further investment.` });
  }

  const nextSteps: string[] = [];
  if (idea >= 70) {
    nextSteps.push("Progress the top concept to a packaging or messaging variant test before committing to production.");
  } else {
    nextSteps.push("Refine the top concept messaging — aim to push idea score above 70% before advancing to the next phase.");
  }
  if (commitGap >= 10) {
    nextSteps.push(`Test 2–3 price or value messaging variants to close the commitment gap from ${commitment}% toward ${Math.min(commitment + 15, 85)}%+.`);
  }
  if (r.lowestIdeaLabel) {
    nextSteps.push(`Review and retool the ${r.lowestIdeaLabel} concept — consider a new positioning angle or retire it from the pipeline.`);
  }

  const studyTypeRaw = (r.studyType || "").toUpperCase();
  const isPro = studyTypeRaw.includes("PRO");

  const dateStr = r.deliveredAt
    ? new Date(r.deliveredAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : r.createdAt
      ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  return {
    id: r.id,
    title: r.title,
    company: companyName ?? "—",
    studyTypeDetail: r.studyType ?? (isPro ? "TEST24 PRO" : "TEST24 BASIC"),
    studyType: isPro ? "PRO" : "BASIC",
    respondents: null as number | null,
    date: dateStr,
    status: (r.status ?? "").toUpperCase(),
    qaVerified: r.status === "Completed",
    pdfUrl: r.pdfUrl ?? null,
    metrics,
    takeaways,
    nextSteps,
  };
}

/* ── Derive Research Assistant data from a ClientReport ── */
function buildAssistantData(r: ClientReport) {
  const idea       = r.topIdeaIdeaScore   ?? 0;
  const interest   = r.topIdeaInterest    ?? 0;
  const commitment = r.topIdeaCommitment  ?? 0;
  const lowIdea    = r.lowestIdeaIdeaScore ?? 0;
  const commitGap  = interest - commitment;

  const ideaColor = idea >= 75 ? "#2A9E5C" : idea >= 60 ? "#B8911A" : "#E8503A";
  const intColor  = interest >= 70 ? "#3B82F6" : "#B8911A";
  const cmtColor  = commitment >= 60 ? "#2A9E5C" : "#E8503A";

  const metrics = [
    { label: "Idea Score",    valStr: `${idea}%`,       sub: idea >= 75 ? "Above norm" : idea >= 60 ? "At norm" : "Below norm", color: ideaColor },
    { label: "Interest",      valStr: `${interest}%`,   sub: "",                                                                  color: intColor  },
    { label: "Commitment",    valStr: `${commitment}%`, sub: commitGap >= 10 ? "Gap flagged" : "Strong",                          color: cmtColor  },
    { label: "Lowest Concept",valStr: `${lowIdea}%`,    sub: "Watch",                                                             color: "#B8911A" },
  ].filter(m => m.valStr !== "0%");

  const drivers = [
    r.topIdeaLabel && idea > 0 ? {
      ok: true, highlight: "#2A9E5C",
      title: r.topIdeaLabel,
      sub: `Primary concept — ${idea}% idea score, ${interest}% interest rate`,
    } : null,
    interest > 0 && commitment > 0 ? {
      ok: commitGap < 10,
      highlight: commitGap < 10 ? "#3A2FBF" : "#B8911A",
      title: "Commitment alignment",
      sub: commitGap >= 10
        ? `${commitGap}pp commitment gap (Interest ${interest}% → Commitment ${commitment}%) — purchase narrative needs work`
        : `Strong alignment at ${commitment}% commitment — concept is purchase-ready`,
    } : null,
    r.lowestIdeaLabel && lowIdea > 0 ? {
      ok: false, highlight: "#B8911A",
      title: r.lowestIdeaLabel,
      sub: `Lowest concept — ${lowIdea}% idea score. Review before next investment cycle.`,
    } : null,
  ].filter((d): d is NonNullable<typeof d> => d !== null);

  return {
    title: r.title,
    type: r.studyType ?? "TEST24 BASIC",
    metrics,
    drivers,
    keyTakeout: r.topIdeaLabel
      ? `${r.topIdeaLabel} scored ${idea}% idea score and ${interest}% interest — ${idea >= 75 ? "strong performance above norms" : "promising but needs refinement before launch"}.`
      : "Review the full study report for key findings.",
    watchSignal: commitGap >= 10
      ? `Commitment gap of ${commitGap}pp detected — a price-anchoring or messaging test is the recommended next step.`
      : r.lowestIdeaLabel && lowIdea < 60
        ? `${r.lowestIdeaLabel} (${lowIdea}% idea score) is the weakest concept — review positioning before further investment.`
        : "No critical watch signals — all key metrics are tracking within acceptable ranges.",
    queries: [
      "What drove the commitment gap?",
      "Which concept should I prioritise for launch?",
      "What's the recommended next step from this study?",
      "How do these results compare to category norms?",
    ],
  };
}

function RankingMiniChart({ studyId }: { studyId: string }) {
  const { data, isLoading } = useDigRanking(studyId);

  if (isLoading) {
    return (
      <div className="px-5 py-3" style={{ borderTop: `1px solid ${N200}` }}>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const ranking = data?.ranking ?? [];

  if (ranking.length === 0) {
    return (
      <div className="px-5 py-3" style={{ borderTop: `1px solid ${N200}` }}>
        <div className="text-xs" style={{ color: N500 }}>No ranking data available yet.</div>
      </div>
    );
  }

  const sorted = [...ranking].sort((a, b) => a.rank - b.rank).slice(0, 5);
  const formatPercent = (value: number) => `${Math.round(value)}%`;
  const chartData = sorted.map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 13) + "\u2026" : c.name,
    winRate: c.win_rate ?? 0,
    interest: c.interest_rate ?? 0,
  }));

  return (
    <div className="px-5 py-3" style={{ borderTop: `1px solid ${N200}` }} data-testid="ranking-mini-chart">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: VIO }}>Concept Ranking</div>
        <div className="text-[10px]" style={{ color: N500 }}>
          Interest = initial appeal · Commitment win rate = pairwise choice
        </div>
      </div>
      <div style={{ height: Math.max(120, sorted.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
            <ReTooltip
              formatter={(v: number, _name: string, item: { dataKey?: string | number }) => [
                formatPercent(v),
                String(item.dataKey) === "winRate" ? "Commitment win rate" : "Interest",
              ]}
            />
            <Bar dataKey="winRate" name="Commitment win rate" fill="#3A2FBF" barSize={8} radius={[0, 3, 3, 0]} />
            <Bar dataKey="interest" name="Interest" fill="#3B82F6" barSize={8} radius={[0, 3, 3, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DisabledActionButton({
  label,
  icon,
  message,
  testId,
}: {
  label: string;
  icon: React.ReactNode;
  message: string;
  testId: string;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <button
              type="button"
              disabled
              className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-60"
              style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
              data-testid={testId}
            >
              {icon} {label}
            </button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function TestPage() {
  const [, setLocation]           = useLocation();
  const isMobile = useIsMobile();
  const { user }                  = useAuth();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(TEST_TAB_VALUES).withDefault("studies"),
  );
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);

  /* Research Assistant tab state */
  const [assistantInput, setAssistantInput]     = useState("");
  const [assistantMsgs, setAssistantMsgs]       = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [selectedAssistStudy, setSelectedAssistStudy] = useState("");

  /* Real client reports — scoped to this company by the server */
  const { data: clientReports = [], isLoading: isLoadingStudies } = useQuery<ClientReport[]>({
    queryKey: ["/api/member/client-reports", user?.companyId],
    queryFn: async () => {
      const response = await fetch("/api/member/client-reports");
      if (!response.ok) throw new Error("Failed to fetch client reports");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: userActivity } = useQuery<{ basicCreditsRemaining: number; proCreditsRemaining: number }>({
    queryKey: ["/api/member/activity", user?.id, user?.companyId],
    queryFn: async () => {
      const response = await fetch("/api/member/activity");
      if (!response.ok) throw new Error("Failed to fetch member activity");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: digStudiesData } = useDigStudies(!!user);
  const digStudies = digStudiesData?.studies ?? [];

  const digStudyMap = useMemo(() => {
    return mapPreferredDigStudiesByReportId(digStudies);
  }, [digStudies]);

  /* Map real ClientReports to rich study card format */
  const mappedStudies = useMemo(
    () => clientReports.map(r => mapReportToStudy(r, user?.name ?? undefined)),
    [clientReports, user?.name],
  );

  /* Auto-select first study for Research Assistant when data loads */
  useEffect(() => {
    if (!selectedAssistStudy && clientReports.length > 0) {
      setSelectedAssistStudy(clientReports[0].id);
    }
  }, [clientReports, selectedAssistStudy]);

  /* Derive Research Assistant data from the currently selected study */
  const selectedReport = useMemo(
    () => clientReports.find(r => r.id === selectedAssistStudy) ?? null,
    [clientReports, selectedAssistStudy],
  );
  const assistantData = useMemo(
    () => selectedReport ? buildAssistantData(selectedReport) : null,
    [selectedReport],
  );

  const initials = (name?: string) => {
    if (!name) return "?";
    const p = name.split(" ");
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const handleSendAssistant = () => {
    if (!assistantInput.trim()) return;
    const q = assistantInput;
    setAssistantInput("");
    setAssistantMsgs(prev => [
      ...prev,
      { role: "user", text: q },
      { role: "ai",   text: "Based on the study data, the township intent gap is driven primarily by value-for-money perception. At 52% intent vs. 84% for urban 25–34, the R12–15 price point appears to be the key unlock. An entry SKU strategy is recommended before the premium launch." },
    ]);
  };

  const mColor = (val: number, signal: string | null) => {
    if (signal === "Watch") return CORAL;
    if (val >= 75) return SUCCESS;
    if (val >= 55) return AMBER_DK;
    return CORAL;
  };

  const signalMeta = (signal: string | null, val: number) => {
    if (!signal) return null;
    if (signal === "Watch")     return { color: CORAL,    bg: "#FDECEA", arrow: "▼" };
    if (signal === "Strong")    return { color: SUCCESS,  bg: SUC_LT,    arrow: "▲" };
    return val >= 75
      ? { color: SUCCESS,  bg: SUC_LT,    arrow: "▲" }
      : { color: AMBER_DK, bg: AMBER_LT,  arrow: "▲" };
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const getStatusBadge = (status: string | null) => {
    const key = (status || "NEW").toUpperCase();
    return STATUS_MAP[key] || STATUS_MAP.NEW;
  };

  const getStudyTypeBadge = (type: string | null) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,  color: VIO     };
    return                        { label: "BASIC",  bg: CYAN_LT, color: CYAN_DK };
  };

  return (
    <PortalLayout>
      <div className="portal-workspace">
        <div className="portal-page-header flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 flex-1">
            <PortalBreadcrumbs items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Test" }]} />
            <h1 className="font-serif text-3xl leading-tight" style={{ color: VDK }}>Does my idea work?</h1>
            <p className="mt-2 max-w-none text-sm leading-relaxed" style={{ color: N500 }}>
              Use Test to launch Test24 briefs, track live studies, and review consumer evidence when results land.
            </p>
          </div>
          <button
            onClick={() => setLocation("/portal/launch")}
            data-testid="button-launch-brief"
            className="text-xs font-semibold px-4 py-2 text-white rounded-lg md:self-start"
            style={{ background: TEST_COLOR, borderRadius: 8 }}
          >
            Launch a Brief
          </button>
        </div>

        <PortalTabs value={activeTab} onValueChange={(tab) => void setActiveTab(tab)} tabs={TEST_TABS} accentColor={CORAL}>
        {/* Body */}
        <div className="portal-body">
          {/* Main */}
          <div className="portal-main-scroll">

            {/* ── STUDIES ── */}
            {activeTab === "studies" && (
              <div>
                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: N400 }} />
                    <input className="pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none w-40"
                      style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}
                      placeholder="Search studies..."
                      data-testid="input-search-studies"
                    />
                  </div>
                  <select className="rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }} data-testid="select-study-type">
                    <option>All Types</option>
                    <option>BASIC</option>
                    <option>PRO</option>
                  </select>
                  <select className="rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }} data-testid="select-study-status">
                    <option>All Statuses</option>
                    <option>Completed</option>
                    <option>In Field</option>
                    <option>Analysing</option>
                  </select>
                  <span className="text-xs ml-auto" style={{ color: N400 }}>
                    {isLoadingStudies ? "—" : `${mappedStudies.length} ${mappedStudies.length === 1 ? "study" : "studies"}`}
                  </span>
                </div>

                {/* Loading skeleton */}
                {isLoadingStudies && [1, 2].map(i => (
                  <div key={i} style={{ ...CARD, marginBottom: 20, padding: 20 }}>
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/3 mb-3" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))}

                {/* Empty state */}
                {!isLoadingStudies && mappedStudies.length === 0 && (
                  <div style={CARD} className="p-10 text-center">
                    <BarChart2 className="w-10 h-10 mx-auto mb-3" style={{ color: N400 }} />
                    <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>No studies yet</div>
                    <div className="text-xs mb-4" style={{ color: N500 }}>Launch your first brief to see study results here.</div>
                    <button onClick={() => setLocation("/portal/launch")} className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg" style={{ background: SUCCESS, borderRadius: 8 }}>
                      Launch a Brief
                    </button>
                  </div>
                )}

                {/* Real client study cards */}
                {!isLoadingStudies && mappedStudies.map(study => {
                  const digMatch = digStudyMap.get(study.id);
                  const digStatus = digMatch?.ingest_status?.toLowerCase();
                  const hasDigData = digMatch && (digStatus === "ready" || digStatus === "parsed");

                  const typeBadge = study.studyType === "PRO"
                    ? { label: "PRO",   bg: VIO_LT,  color: VIO    }
                    : { label: "BASIC", bg: CYAN_LT, color: CYAN_DK };

                  if (hasDigData && digMatch) {
                    return (
                      <div key={study.id} className="portal-card-lg overflow-hidden mb-5" data-testid={`study-card-dig-${study.id}`}>
                        <div className="flex items-start justify-between gap-3 px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EAE8FF", border: "1px solid rgba(58,47,191,0.2)" }}>
                              <BarChart2 className="w-5 h-5" style={{ color: VIO }} />
                            </div>
                            <div>
                              <div className="text-base font-semibold leading-snug" style={{ color: VDK }}>{study.title}</div>
                              <div className="text-xs mt-0.5" style={{ color: N500 }}>
                                {digMatch.concept_count} concepts · {digMatch.respondent_count} respondents · Dig Analysis
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: typeBadge.bg, color: typeBadge.color, borderRadius: 9999 }}>{typeBadge.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 flex items-center gap-1" style={{ background: "#EAE8FF", color: VIO, borderRadius: 9999 }}>
                              <BarChart2 className="w-2.5 h-2.5" /> Dig Analysis
                            </span>
                          </div>
                        </div>

                        <RankingMiniChart studyId={digMatch.id} />

                        <div className="px-5 py-3 flex gap-2" style={{ borderTop: `1px solid ${N200}`, background: "#F5F5F5" }}>
                          <button
                            onClick={() => setLocation(`/portal/reports/${study.id}`)}
                            className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg flex items-center gap-1.5"
                            style={{ background: VIO, borderRadius: 8 }}
                            data-testid={`button-view-analysis-${study.id}`}
                          >
                            <BarChart2 className="w-3 h-3" /> View full analysis
                          </button>
                          <button
                            onClick={() => setLocation(`/portal/act?tab=nextsteps&reportId=${study.id}`)}
                            className="text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                            style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
                            data-testid={`button-act-study-${study.id}`}
                          >
                            <Sparkles className="w-3 h-3" /> Analyse in Act
                          </button>
                          {study.pdfUrl ? (
                            <button
                              onClick={() => {
                                window.open(study.pdfUrl!, "_blank");
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                              style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
                              data-testid={`button-download-pdf-${study.id}`}
                            >
                              <ChevronRight className="w-3 h-3" /> Download PDF
                            </button>
                          ) : (
                            <DisabledActionButton
                              label="Download PDF"
                              icon={<ChevronRight className="w-3 h-3" />}
                              message="This report PDF is not available yet."
                              testId={`button-download-pdf-${study.id}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={study.id} className="portal-card-lg overflow-hidden mb-5" data-testid={`study-card-${study.id}`}>

                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3 px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF1ED", border: "1px solid rgba(232,80,58,0.2)" }}>
                            <BarChart2 className="w-5 h-5" style={{ color: CORAL }} />
                          </div>
                          <div>
                            <div className="text-base font-semibold leading-snug" style={{ color: VDK }}>{study.title}</div>
                            <div className="text-xs mt-0.5" style={{ color: N500 }}>
                              {study.company} · {study.studyTypeDetail} · {study.respondents != null ? `${study.respondents.toLocaleString()} respondents` : "—"} · {study.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: typeBadge.bg, color: typeBadge.color, borderRadius: 9999 }}>{typeBadge.label}</span>
                          {study.qaVerified && (
                            <span className="text-[10px] font-bold px-2 py-0.5 flex items-center gap-1" style={{ background: SUC_LT, color: SUCCESS, borderRadius: 9999 }}>
                              <CheckCircle2 className="w-2.5 h-2.5" /> QA Verified
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: SUC_LT, color: SUCCESS, borderRadius: 9999 }}>Completed</span>
                        </div>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-3" style={{ borderTop: `1px solid ${N200}` }}>
                        {study.metrics.map((m, i) => {
                          const mc = mColor(m.val, m.signal);
                          const sm = signalMeta(m.signal, m.val);
                          const tileBg = mc === SUCCESS
                            ? "linear-gradient(135deg, rgba(42,158,92,0.06) 0%, rgba(42,158,92,0.02) 100%)"
                            : mc === AMBER_DK
                            ? "linear-gradient(135deg, rgba(184,145,26,0.07) 0%, rgba(184,145,26,0.02) 100%)"
                            : "linear-gradient(135deg, rgba(232,80,58,0.07) 0%, rgba(232,80,58,0.02) 100%)";
                          return (
                            <div key={m.label} className="py-4 px-5 text-center" style={{ background: tileBg, borderRight: i < study.metrics.length - 1 ? `1px solid ${N200}` : "none", borderBottom: i < 3 ? `1px solid ${N200}` : "none" }}>
                              <div className="text-[28px] font-bold font-mono leading-none mb-0.5" style={{ color: mc }}>{m.val}%</div>
                              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: N500 }}>{m.label}</div>
                              {sm && (
                                <div className="text-[10px] font-semibold" style={{ color: sm.color }}>{sm.arrow} {m.signal}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Takeaways */}
                      <div className="px-5 py-4" style={{ borderTop: `1px solid ${N200}` }}>
                        <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: CORAL }}>Key Takeaways</div>
                        <div className="space-y-2 mb-4">
                          {study.takeaways.map((t, i) => (
                            <div key={i} className="flex gap-2.5 items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                {t.kind === "star"  && <Star className="w-3.5 h-3.5" style={{ color: CORAL }} />}
                                {t.kind === "warn"  && <AlertTriangle className="w-3.5 h-3.5" style={{ color: AMBER_DK }} />}
                                {t.kind === "chart" && <BarChart2 className="w-3.5 h-3.5" style={{ color: VIO }} />}
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: VDK }}>
                                <span dangerouslySetInnerHTML={{ __html: t.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: N400 }}>Recommended Next Steps</div>
                        <div className="space-y-1.5">
                          {study.nextSteps.map((s, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: SUCCESS }} />
                              <p className="text-xs leading-relaxed" style={{ color: N500 }}>{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 flex gap-2" style={{ borderTop: `1px solid ${N200}`, background: "#F5F5F5" }}>
                        <button
                          onClick={() => setLocation(`/portal/act?tab=nextsteps&reportId=${study.id}`)}
                          className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg flex items-center gap-1.5"
                          style={{ background: CORAL, borderRadius: 8 }}
                          data-testid={`button-act-study-${study.id}`}
                        >
                          <Sparkles className="w-3 h-3" /> Analyse in Act
                        </button>
                        {study.pdfUrl ? (
                          <button
                            onClick={() => {
                              window.open(study.pdfUrl!, "_blank");
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                            style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
                            data-testid={`button-download-pdf-${study.id}`}
                          >
                            <ChevronRight className="w-3 h-3" /> Download PDF
                          </button>
                        ) : (
                          <DisabledActionButton
                            label="Download PDF"
                            icon={<ChevronRight className="w-3 h-3" />}
                            message="This report PDF is not available yet."
                            testId={`button-download-pdf-${study.id}`}
                          />
                        )}
                        <DisabledActionButton
                          label="Build Slide Deck"
                          icon={<FileText className="w-3 h-3" />}
                          message="Slide deck export is not available yet."
                          testId={`button-slide-deck-${study.id}`}
                        />
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            {/* ── RESEARCH ASSISTANT ── */}
            {activeTab === "assistant" && (
              <div>
                {/* Empty state — no studies yet */}
                {clientReports.length === 0 && !isLoadingStudies && (
                  <div style={CARD} className="p-10 text-center">
                    <BarChart2 className="w-10 h-10 mx-auto mb-3" style={{ color: N400 }} />
                    <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>No study data available</div>
                    <div className="text-xs" style={{ color: N500 }}>Complete your first study to use the Research Assistant.</div>
                  </div>
                )}

                {/* Study selector */}
                {clientReports.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Study Results</div>
                      <select
                        value={selectedAssistStudy}
                        onChange={e => setSelectedAssistStudy(e.target.value)}
                        className="rounded-lg px-3 py-1.5 text-xs focus:outline-none max-w-[220px] truncate"
                        style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}
                        data-testid="select-assistant-study"
                      >
                        {clientReports.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>

                    {assistantData && (
                      <>
                        {/* Study header bar */}
                        <div className="px-5 py-3 rounded-xl mb-4" style={{ background: VDK }}>
                          <div className="text-[10px] font-bold tracking-widest uppercase text-white opacity-80">
                            {assistantData.title} · {assistantData.type}
                          </div>
                        </div>

                        {/* Key metrics */}
                        <div className={`grid gap-2 mb-4`} style={{ gridTemplateColumns: `repeat(${Math.min(assistantData.metrics.length, 4)}, 1fr)` }}>
                          {assistantData.metrics.map(m => (
                            <div key={m.label} style={CARD} className="p-3 text-center">
                              <div className="text-2xl font-bold font-mono leading-none mb-0.5" style={{ color: m.color }}>{m.valStr}</div>
                              <div className="text-[9px] font-bold uppercase tracking-wide leading-tight mb-0.5" style={{ color: N500 }}>{m.label}</div>
                              {m.sub && <div className="text-[9px] leading-tight" style={{ color: m.sub === "Watch" || m.sub === "Gap flagged" ? CORAL : N400 }}>{m.sub}</div>}
                            </div>
                          ))}
                        </div>

                        {/* Key Drivers */}
                        {assistantData.drivers.length > 0 && (
                          <div style={{ ...CARD, marginBottom: 16 }} className="p-5">
                            <div className="text-sm font-semibold mb-0.5" style={{ color: VDK }}>Key Drivers</div>
                            <div className="text-xs mb-4" style={{ color: N500 }}>What moved the needle in this study</div>
                            <div className="space-y-2">
                              {assistantData.drivers.map((d, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: "#F5F5F5", border: `1px solid ${N200}` }}>
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: d.highlight + "22" }}>
                                    {d.ok
                                      ? <CheckCircle2 className="w-4 h-4" style={{ color: d.highlight }} />
                                      : <AlertTriangle className="w-4 h-4" style={{ color: d.highlight }} />
                                    }
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold" style={{ color: VDK }}>{d.title}</div>
                                    <div className="text-xs" style={{ color: N500 }}>{d.sub}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key takeout */}
                        <div style={{ ...CARD, marginBottom: 16 }} className="p-5">
                          <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: CORAL }}>Strategic Takeout</div>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: VDK }}>{assistantData.keyTakeout}</p>
                          {assistantData.watchSignal && (
                            <div className="flex gap-2 items-start p-2.5 rounded-lg" style={{ background: "#FDECEA", border: "1px solid rgba(232,80,58,0.15)" }}>
                              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: CORAL }} />
                              <p className="text-xs leading-relaxed" style={{ color: CORAL }}>{assistantData.watchSignal}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Chat messages (if any sent from assistant panel) */}
                {assistantMsgs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {assistantMsgs.map((m, i) => (
                      <div key={i} className={`text-xs p-3 rounded-xl leading-relaxed ${m.role === "user" ? "ml-4" : ""}`} style={{ background: m.role === "user" ? "#EEF0FF" : "#F0FDF4", border: `1px solid ${m.role === "user" ? N200 : "rgba(42,158,92,0.15)"}`, color: VDK }}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: AI Panel — hidden on mobile */}
          {!isMobile && (
          <div className="portal-ai-rail">
            {activeTab === "assistant" ? (
              /* ── Research Assistant Panel ── */
              <div className="flex flex-col h-full">
                {/* Static analysis summary from real study */}
                {assistantData ? (
                  <div className="flex-shrink-0 px-5 py-4 space-y-3 overflow-y-auto" style={{ maxHeight: 280, borderBottom: `1px solid ${N200}` }}>
                    <div>
                      <div className="text-xs font-bold mb-1.5" style={{ color: VDK }}>Key Takeout</div>
                      <p className="text-xs leading-relaxed" style={{ color: N500 }}>{assistantData.keyTakeout}</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: AMBER_LT, border: `1px solid ${AMBER_DK}22` }}>
                      <div className="text-xs font-bold mb-1" style={{ color: AMBER_DK }}>Watch Signal</div>
                      <p className="text-xs leading-relaxed" style={{ color: N500 }}>{assistantData.watchSignal}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0 px-5 py-4" style={{ borderBottom: `1px solid ${N200}` }}>
                    <p className="text-xs" style={{ color: N400 }}>Select a study to view key findings.</p>
                  </div>
                )}
                {/* AI Query — pulls from this client's research */}
                <div className="flex-1 overflow-hidden">
                  <AIQueryPanel
                    accentColor={TEST_COLOR}
                    label="Research AI"
                    suggestedPrompts={assistantData?.queries ?? [
                      "What drove the commitment gap?",
                      "Which segment to prioritise?",
                      "What are the recommended next steps?",
                      "How do results compare to category norms?",
                    ]}
                    defaultSource="research"
                  />
                </div>
              </div>
            ) : (
              /* ── Normal Research AI Panel ── */
              <>
                <div className="flex-1 overflow-hidden">
                  <AIQueryPanel
                    accentColor={TEST_COLOR}
                    label="Research AI"
                    suggestedPrompts={AI_PROMPTS}
                    defaultSource="combined"
                  />
                </div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 transition-colors"
                  style={{ borderTop: `1px solid ${N200}`, background: "#F5F5F5" }}
                  data-testid="button-toggle-team-chat"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: N500 }}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Team Chat
                    <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>1</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChat ? "rotate-180" : ""}`} style={{ color: N500 }} />
                </button>
                {showChat && (
                  <div className="flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#fff" }}>
                    <div className="p-3 max-h-36 overflow-y-auto">
                      <TCMsg initials="SW" author="Sarah W." time="09:12" color={VIO} text="The commitment drop is the main issue to address before we go to launch." />
                    </div>
                    <div className="px-3 pb-3 flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }} placeholder="Reply… use @ to tag" data-testid="input-team-chat" />
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: TEST_COLOR }} data-testid="button-send-chat"><Send className="w-3 h-3" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          )}
        </div>
        </PortalTabs>
      </div>
    </PortalLayout>
  );
}

function TCMsg({ initials, author, time, color, text }: { initials: string; author: string; time: string; color: string; text: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: color }}>{initials}</div>
        <span className="text-xs font-semibold" style={{ color: "#1E1B3A" }}>{author}</span>
        <span className="text-[10px]" style={{ color: "#8A7260" }}>{time}</span>
      </div>
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#F5F5F5", border: "1px solid #EBEBEB", color: "#8A7260" }}>{text}</div>
    </div>
  );
}
