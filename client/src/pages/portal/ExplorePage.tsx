import { useState, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import {
  X, MessageSquare, Send, ArrowRight, ChevronDown, Loader2, BookOpen, Lock, Zap, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AIQueryPanel from "@/components/portal/AIQueryPanel";
import type { SandboxRun } from "@shared/schema";
import { useIndustryGroups } from "@/hooks/useIndustryGroups";
import { filterByIndustry } from "@/lib/industry-groups";
import { ALL_SIGNALS, ALL_MARKET_GAPS } from "@/lib/portal-content";
import { MobilePortalNav } from "@/components/portal/MobilePortalNav";

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
const CREAM    = "#FFFFFF";
const EXPLORE_COLOR = VIO;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};


const PERSONAS = [
  { id: "urban_pro",   label: "Urban Professionals",   sub: "25–34 · Gauteng" },
  { id: "township",    label: "Township Consumers",     sub: "18–30 · metros" },
  { id: "suburban",    label: "Suburban Families",      sub: "30–44 · all areas" },
  { id: "genz",        label: "Gen Z",                  sub: "18–25 · digital native" },
  { id: "mature",      label: "Mature Market",          sub: "45–60 · all areas" },
];

const RECENT_RUNS = [
  { id: "run-1", title: "RTD Energy — Concept A",    date: "28/03/2026", respondents: "1 200", intent: 73 },
  { id: "run-2", title: "Skincare Relaunch Pack B",  date: "22/03/2026", respondents: "800",   intent: 48 },
];


const AI_MESSAGES = [
  {
    type: "system" as const,
    text: "Based on your category focus, I've surfaced 12 signals this week. The nootropic trend in 25–34 urban males is the strongest first-mover opportunity in your portfolio — no local brand has claimed this space.",
    rec: "→ Run a Sandbox model first, then commission a Test24 Brief if intent exceeds 65%.",
  },
];

const AI_PROMPTS = [
  "What's the biggest trend in my category?",
  "Which signals have commercial potential?",
  "Run a sandbox on nootropics",
  "Summarise this week's signals",
];

type Tab = "signals" | "sandbox" | "intelligence";

function scoreFromSeed(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return Math.round(min + (x - Math.floor(x)) * (max - min));
}

function BenchmarkBar({ value, benchmark, color }: { value: number; benchmark: number; color: string }) {
  const atBench = value >= benchmark;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1" style={{ color: N500 }}>
        <span>0%</span>
        <span style={{ color }}>Benchmark {benchmark}%</span>
        <span>100%</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F0EBE0", position: "relative" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: atBench ? SUCCESS : color }} />
      </div>
      <div className="relative h-0" style={{ marginTop: -11 }}>
        <div className="absolute top-0 w-0.5 h-3.5" style={{ left: `${benchmark}%`, background: N400 }} />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const { user }        = useAuth();
  const queryClient     = useQueryClient();
  const [activeTab, setActiveTab]           = useState<Tab>("signals");
  const [chatInput, setChatInput]           = useState("");
  const [showChat, setShowChat]             = useState(false);

  /* Industry personalisation */
  const { industryGroups } = useIndustryGroups();
  const signals    = useMemo(() => filterByIndustry(ALL_SIGNALS,      industryGroups), [industryGroups]);
  const marketGaps = useMemo(() => filterByIndustry(ALL_MARKET_GAPS,  industryGroups), [industryGroups]);

  /* Sandbox state */
  const [sandboxIdea, setSandboxIdea]       = useState("");
  const [sandboxPersonas, setSandboxPersonas] = useState<string[]>([]);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult]   = useState<{ interest: number; commitment: number; ideaScore: number } | null>(null);
  const runCountRef = useRef(0);

  const { data: reports } = useQuery<any[]>({ queryKey: ["/api/member/reports"], enabled: !!user });

  /* Sandbox run history */
  const { data: sandboxHistory = [] } = useQuery<SandboxRun[]>({
    queryKey: ["/api/member/sandbox-runs"],
    enabled: !!user,
  });

  const saveSandboxRun = useMutation({
    mutationFn: (run: { concept: string; personas: string[]; interestScore: number; commitmentScore: number; ideaScore: number }) =>
      apiRequest("POST", "/api/member/sandbox-runs", run),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/member/sandbox-runs"] }),
  });

  const initials = (name?: string) => {
    if (!name) return "?";
    const p = name.split(" ");
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const togglePersona = (id: string) => {
    setSandboxPersonas(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const runSandbox = () => {
    if (!sandboxIdea.trim()) return;
    setSandboxRunning(true);
    setSandboxResult(null);
    const seed = runCountRef.current++;
    const ideaSeed = sandboxIdea.length + seed * 7;

    setTimeout(() => {
      const interest    = scoreFromSeed(ideaSeed * 1.3,  52, 91);
      const commitment  = scoreFromSeed(ideaSeed * 2.7,  38, 71);
      const ideaScore   = Math.round((interest + commitment) / 2);
      setSandboxResult({ interest, commitment, ideaScore });
      setSandboxRunning(false);
      saveSandboxRun.mutate({
        concept: sandboxIdea,
        personas: sandboxPersonas,
        interestScore: interest,
        commitmentScore: commitment,
        ideaScore,
      });
    }, 2200);
  };

  const accessColor = (access: string) => {
    const a = (access || "").toLowerCase();
    if (a.includes("scale") || a.includes("platinum")) return { bg: VIO_LT,  color: VIO,      label: "SCALE" };
    if (a.includes("growth") || a.includes("gold"))    return { bg: AMBER_LT, color: AMBER_DK, label: "GROWTH" };
    if (a.includes("entry") || a.includes("starter"))  return { bg: SUC_LT,   color: SUCCESS,  label: "STARTER" };
    return { bg: "#F0EBE0", color: N500, label: "ALL" };
  };

  return (
    <div className="portal-root flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <MobilePortalNav />
      <div className="flex flex-col w-full h-full">

        {/* Phase topbar */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: "linear-gradient(135deg, #201B3C 0%, #2E2760 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1"
              style={{ background: "rgba(58,47,191,0.3)", color: VIO_LT, border: `1px solid rgba(58,47,191,0.5)`, borderRadius: 6 }}
            >
              PHASE 01
            </span>
            <h1 className="font-serif text-xl text-white">Explore</h1>
            <span className="text-sm hidden sm:block" style={{ color: N400 }}>Discover trends, signals &amp; market intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/portal/test")}
              data-testid="button-launch-brief"
              className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
              style={{ background: CORAL, borderRadius: 8 }}
            >
              Launch a Brief
            </button>
            <button
              onClick={() => setLocation("/portal/dashboard")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              data-testid="button-close-explore"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs — sticky white bar */}
        <div className="flex flex-shrink-0 px-5 sticky-tab-bar border-b" style={{ borderColor: N200 }}>
          {(["signals", "sandbox", "intelligence"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-explore-${tab}`}
              className="flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap"
              style={{
                color: activeTab === tab ? VDK : N500,
                borderBottomColor: activeTab === tab ? CORAL : "transparent",
                background: "transparent",
              }}
            >
              {tab === "signals" ? "Market Signals" : tab === "sandbox" ? "Sandbox" : "Intelligence Library"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-6" style={{ background: CREAM }}>

            {/* ── SIGNALS ── */}
            {activeTab === "signals" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>
                    {signals.length} Active Signals
                  </span>
                  <div className="flex gap-2">
                    {["All", "Trends", "Opportunities", "Reports"].map((f, i) => (
                      <button
                        key={f}
                        className="px-3 py-1 text-xs font-medium rounded-lg"
                        style={i === 0
                          ? { background: VDK, color: "#fff", border: `1px solid ${VDK}` }
                          : { background: "#fff", border: `1px solid ${N200}`, color: N500 }
                        }
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {signals.map(signal => (
                    <div key={signal.id} style={CARD} className="p-4 cursor-pointer hover:shadow-md transition-shadow" data-testid={`signal-card-${signal.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5" style={{ background: signal.tagBg, color: signal.tagColor, borderRadius: 9999 }}>
                          {signal.tag}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5" style={{ background: signal.chip.bg, color: signal.chip.color, borderRadius: 9999 }}>
                          {signal.chip.label}
                        </span>
                      </div>
                      <div className="text-sm font-semibold mb-1 leading-snug" style={{ color: VDK }}>{signal.title}</div>
                      <div className="text-xs" style={{ color: N500 }}>{signal.meta}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SANDBOX ── */}
            {activeTab === "sandbox" && (
              <div>
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

                  {/* LEFT: Recent runs + Market Gaps */}
                  <div className="space-y-5">

                    {/* Recent Sandbox Runs */}
                    <div style={CARD} className="p-5">
                      <div className="mb-4">
                        <div className="text-sm font-semibold" style={{ color: VDK }}>Recent Sandbox Runs</div>
                        <div className="text-xs" style={{ color: N500 }}>Your simulations · no credits used</div>
                      </div>
                      <div className="space-y-0">
                        {sandboxHistory.length === 0 ? (
                          <div className="text-xs py-4 text-center" style={{ color: N500 }}>
                            No runs yet — simulate a concept below to see results here.
                          </div>
                        ) : sandboxHistory.map((run, i) => {
                          const dateStr = new Date(run.createdAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
                          return (
                            <div key={run.id} className="flex items-center justify-between py-3" style={{ borderBottom: i < sandboxHistory.length - 1 ? `1px solid ${N200}` : "none" }} data-testid={`sandbox-run-row-${run.id}`}>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: VDK }}>{run.concept}</div>
                                <div className="text-xs mt-0.5" style={{ color: N500 }}>{dateStr} · synthetic model</div>
                              </div>
                              <div className="text-sm font-bold font-mono flex-shrink-0 ml-4" style={{ color: run.interestScore >= 65 ? SUCCESS : AMBER_DK }}>
                                {run.interestScore}% interest
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Market Gaps to Watch */}
                    <div>
                      <div className="mb-3">
                        <div className="text-base font-semibold" style={{ color: VDK }}>Market Gaps to Watch</div>
                        <div className="text-xs" style={{ color: N500 }}>AI-identified white spaces — ranked by opportunity score</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {marketGaps.map(gap => (
                          <div key={gap.id} style={CARD} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFF1ED", border: "1px solid rgba(232,80,58,0.15)" }}>
                                  {gap.useZap
                                    ? <Zap className="w-4 h-4" style={{ color: CORAL }} />
                                    : <Sparkles className="w-4 h-4" style={{ color: CORAL }} />
                                  }
                                </div>
                                <div>
                                  <div className="text-sm font-semibold leading-snug" style={{ color: VDK }}>{gap.title}</div>
                                  <div className="text-xs" style={{ color: N500 }}>{gap.meta}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-2xl font-bold font-mono" style={{ color: VIO }}>{gap.score}</div>
                                <div className="text-[10px]" style={{ color: N500 }}>Gap Score</div>
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed mb-3" style={{ color: N500 }}>{gap.desc}</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: gap.priorityBg, color: gap.priorityColor }}>{gap.priority}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: gap.priorityBg, color: gap.priorityColor }}>{gap.potential}</span>
                            </div>
                            <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: "#F0EBE0" }}>
                              <div className="h-full rounded-full" style={{ width: `${gap.barPct}%`, background: gap.priorityColor }} />
                            </div>
                            <button
                              onClick={() => { setSandboxIdea(gap.concept); setSandboxResult(null); }}
                              className="w-full text-xs font-semibold py-2.5 rounded-lg text-white flex items-center justify-center gap-1.5"
                              style={{ background: CORAL }}
                              data-testid={`button-gap-sandbox-${gap.id}`}
                            >
                              Run Sandbox Test <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: New Sandbox Run form */}
                  <div>
                    <div style={{ ...CARD, position: "sticky", top: 20 }}>
                      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${N200}` }}>
                        <div className="text-sm font-semibold" style={{ color: VDK }}>New Sandbox Run</div>
                        <div className="text-xs mt-0.5" style={{ color: N500 }}>No credits consumed</div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="text-xs font-semibold mb-1.5 block" style={{ color: N500 }}>Concept Description</label>
                          <textarea
                            className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none"
                            rows={5}
                            style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }}
                            placeholder="Describe the product, positioning, price point, and target consumer..."
                            value={sandboxIdea}
                            onChange={e => { setSandboxIdea(e.target.value); setSandboxResult(null); }}
                            data-testid="input-sandbox-concept"
                            onFocus={e => (e.target.style.borderColor = VIO)}
                            onBlur={e => (e.target.style.borderColor = N200)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: N500 }}>Target Audience</label>
                            <select className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>
                              <option>Urban SA · 25–34</option>
                              <option>Urban SA · 18–24</option>
                              <option>Township · 25–34</option>
                              <option>Suburban · 30–44</option>
                              <option>Gen Z · 18–24</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold mb-1.5 block" style={{ color: N500 }}>Category</label>
                            <select className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>
                              <option>Beverages</option>
                              <option>Food</option>
                              <option>Beauty &amp; Personal Care</option>
                              <option>Financial Services</option>
                              <option>Tech &amp; Electronics</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={runSandbox}
                          disabled={!sandboxIdea.trim() || sandboxRunning}
                          data-testid="button-run-sandbox"
                          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 text-white rounded-lg transition-opacity"
                          style={{ background: CORAL, borderRadius: 8, opacity: !sandboxIdea.trim() ? 0.5 : 1 }}
                        >
                          {sandboxRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {sandboxRunning ? "Running model…" : "Run Simulation →"}
                        </button>
                      </div>

                      {/* Simulation Results */}
                      {sandboxResult && (
                        <div className="px-5 pb-5 space-y-0" style={{ borderTop: `1px solid ${N200}` }}>
                          <div className="text-[10px] font-bold tracking-widest uppercase pt-4 mb-3" style={{ color: CORAL }}>Simulation Results</div>
                          {[
                            { label: "IDEA SCORE",  val: sandboxResult.ideaScore,  bench: 81, isGood: (v: number) => v >= 81 },
                            { label: "INTEREST",    val: sandboxResult.interest,   bench: 81, isGood: (v: number) => v >= 81 },
                            { label: "COMMITMENT",  val: sandboxResult.commitment, bench: 53, isGood: (v: number) => v >= 53 },
                          ].map((m, i, arr) => {
                            const c = m.isGood(m.val) ? SUCCESS : m.val >= m.bench * 0.8 ? AMBER_DK : CORAL;
                            return (
                              <div key={m.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < arr.length - 1 ? `1px solid ${N200}` : "none" }}>
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: N500 }}>{m.label}</div>
                                  <div className="text-[10px]" style={{ color: N400 }}>Benchmark &gt;{m.bench}%</div>
                                </div>
                                <div className="text-xl font-bold font-mono" style={{ color: c }}>{m.val}%</div>
                              </div>
                            );
                          })}
                          {sandboxResult.ideaScore >= 65 && (
                            <button
                              onClick={() => setLocation("/portal/test")}
                              className="w-full text-xs font-semibold py-2.5 rounded-lg text-white mt-3 flex items-center justify-center gap-1.5"
                              style={{ background: SUCCESS }}
                              data-testid="button-launch-from-sandbox"
                            >
                              Launch a Test24 Brief <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {!sandboxResult && !sandboxRunning && (
                        <div className="px-5 pb-5">
                          <div className="rounded-xl p-4" style={{ background: VIO_LT, border: `1px solid rgba(58,47,191,0.2)` }}>
                            <div className="text-xs font-semibold mb-1" style={{ color: VIO }}>When to move from Sandbox to Test</div>
                            <p className="text-xs leading-relaxed" style={{ color: N500 }}>Idea Score above 81% means it's worth commissioning a Test24 Brief. Between 65–81%, refine first. Below 65%, revisit the core proposition.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── INTELLIGENCE LIBRARY ── */}
            {activeTab === "intelligence" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Intelligence Library</span>
                  <button className="text-xs font-semibold flex items-center gap-1" style={{ color: VIO }} onClick={() => setLocation("/portal/trends")}>
                    Browse all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {(!reports || reports.length === 0) ? (
                  <div style={CARD} className="p-10 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: N400 }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: VDK }}>No reports available yet</p>
                    <p className="text-xs" style={{ color: N500 }}>Trends reports will appear here as they are published.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {reports.map((r: any, i: number) => {
                      const badge = accessColor(r.access || r.accessLevel || "");
                      const teaser = r.teaser || r.summary || r.description || "";
                      const truncated = teaser.length > 160 ? teaser.slice(0, 160) + "…" : teaser;
                      const isLocked = (r.access || r.accessLevel || "").toLowerCase().includes("scale") || (r.access || r.accessLevel || "").toLowerCase().includes("platinum");

                      return (
                        <div
                          key={r.id || i}
                          style={CARD}
                          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex"
                          onClick={() => r.slug ? setLocation(`/portal/insights/${r.slug}`) : setLocation("/portal/trends")}
                          data-testid={`report-card-${i}`}
                        >
                          {/* Cover image */}
                          {r.coverImage || r.imageUrl ? (
                            <div className="w-32 flex-shrink-0 relative overflow-hidden" style={{ minHeight: 120 }}>
                              <img
                                src={r.coverImage || r.imageUrl}
                                alt={r.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-32 flex-shrink-0 flex items-center justify-center" style={{ background: VIO_LT, minHeight: 120 }}>
                              <BookOpen className="w-8 h-8" style={{ color: VIO }} />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-4 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="text-sm font-semibold leading-snug" style={{ color: VDK }}>{r.title}</div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: badge.bg, color: badge.color, borderRadius: 9999 }}>{badge.label}</span>
                                {isLocked && <Lock className="w-3 h-3" style={{ color: N400 }} />}
                              </div>
                            </div>
                            {(r.series || r.category) && (
                              <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: CORAL }}>{r.series || r.category}</div>
                            )}
                            {truncated && (
                              <p className="text-xs leading-relaxed" style={{ color: N500 }}>{truncated}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {r.date && <span className="text-[10px]" style={{ color: N400 }}>{new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                              {r.readTime && <span className="text-[10px]" style={{ color: N400 }}>{r.readTime}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: `1px solid ${N200}` }}>
            {/* AI Query Panel */}
            <div className="flex-1 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
              <AIQueryPanel
                accentColor={VIO}
                label="Explore AI"
                suggestedPrompts={AI_PROMPTS}
                defaultSource="combined"
              />
            </div>

            {/* Team Chat collapsible */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 transition-colors"
              style={{ borderTop: `1px solid ${N200}`, background: "#F5F5F5" }}
              data-testid="button-toggle-team-chat"
            >
              <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: N500 }}>
                <MessageSquare className="w-3.5 h-3.5" />
                Team Chat
                <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>2</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChat ? "rotate-180" : ""}`} style={{ color: N500 }} />
            </button>

            {showChat && (
              <div className="flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#fff" }}>
                <div className="p-3 max-h-40 overflow-y-auto space-y-3">
                  <TCMsg initials="SW" author="Sarah W." time="10:34" color={VIO}  text="These nootropic signals are interesting — should we brief a sandbox run?" />
                  <TCMsg initials="JS" author="James S." time="10:41" color={CORAL} text={`@${user?.name?.split(" ")[0] || "You"} — let's validate the township SKU gap first, higher priority.`} />
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }}
                    placeholder="Reply… use @ to tag"
                    data-testid="input-team-chat"
                  />
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: VIO }} data-testid="button-send-chat">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TCMsg({ initials, author, time, color, text }: { initials: string; author: string; time: string; color: string; text: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0" style={{ background: color }}>{initials}</div>
        <span className="text-xs font-semibold" style={{ color: "#1E1B3A" }}>{author}</span>
        <span className="text-[10px]" style={{ color: "#8A7260" }}>{time}</span>
      </div>
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#F5F5F5", border: `1px solid #EBEBEB`, color: "#8A7260" }}>
        {text}
      </div>
    </div>
  );
}
