import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  X, Sparkles, MessageSquare, Send, ArrowRight, ChevronDown, Loader2, BookOpen, Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

/* ── Design System tokens ─────────────────────────────── */
const VDK      = "#1E1B3A";
const VIO      = "#3A2FBF";
const VIO_LT   = "#EAE8FF";
const CORAL    = "#E8503A";
const N200     = "#E2D5BF";
const N400     = "#A89078";
const N500     = "#8A7260";
const SUCCESS  = "#2A9E5C";
const SUC_LT   = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CREAM    = "#FAF3E8";
const EXPLORE_COLOR = VIO;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.08)",
};

const SIGNALS = [
  { id: 1, tag: "Trend",       tagBg: VIO_LT,  tagColor: VIO,      title: "Nootropic beverages up +41% search intent",          meta: "Urban 25–34 · Food & Bev · Detected overnight",     chip: { label: "High",   bg: "#FDECEA", color: CORAL } },
  { id: 2, tag: "Opportunity", tagBg: VIO_LT,  tagColor: VIO,      title: "Township segment at 52% intent — entry SKU gap",     meta: "Energy Drink category · Township consumers",         chip: { label: "Medium", bg: AMBER_LT,  color: AMBER_DK } },
  { id: 3, tag: "Trend",       tagBg: VIO_LT,  tagColor: VIO,      title: "Sustainable packaging premium +18% WTP",             meta: "Beauty & Personal Care · 25–44 urban",               chip: { label: "Watch",  bg: AMBER_LT,  color: AMBER_DK } },
  { id: 4, tag: "New Report",  tagBg: VIO_LT,  tagColor: VIO,      title: "Functional Beverages 2025 — full category audit",    meta: "Innovatr Inside · GROWTH+ · 3 min read",             chip: { label: "New",    bg: VIO_LT,    color: VIO } },
  { id: 5, tag: "Signal",      tagBg: SUC_LT,  tagColor: SUCCESS,  title: "Plant-based protein growing in Gauteng convenience", meta: "FMCG · Convenience retail · Q1 2025",               chip: { label: "Low",    bg: SUC_LT,    color: SUCCESS } },
  { id: 6, tag: "Signal",      tagBg: SUC_LT,  tagColor: SUCCESS,  title: "Skincare ingredient transparency demand rising",      meta: "Beauty · 30–45 urban female · Digital",             chip: { label: "Watch",  bg: AMBER_LT,  color: AMBER_DK } },
];

const PERSONAS = [
  { id: "urban_pro",   label: "Urban Professionals",   sub: "25–34 · Gauteng" },
  { id: "township",    label: "Township Consumers",     sub: "18–30 · metros" },
  { id: "suburban",    label: "Suburban Families",      sub: "30–44 · all areas" },
  { id: "genz",        label: "Gen Z",                  sub: "18–25 · digital native" },
  { id: "mature",      label: "Mature Market",          sub: "45–60 · all areas" },
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
  const [activeTab, setActiveTab]           = useState<Tab>("signals");
  const [aiInput, setAiInput]               = useState("");
  const [chatMessages, setChatMessages]     = useState<any[]>(AI_MESSAGES);
  const [chatInput, setChatInput]           = useState("");
  const [showChat, setShowChat]             = useState(false);

  /* Sandbox state */
  const [sandboxIdea, setSandboxIdea]       = useState("");
  const [sandboxPersonas, setSandboxPersonas] = useState<string[]>([]);
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult]   = useState<{ interest: number; commitment: number; ideaScore: number } | null>(null);
  const runCountRef = useRef(0);

  const { data: reports } = useQuery<any[]>({ queryKey: ["/api/reports"], enabled: !!user });

  const initials = (name?: string) => {
    if (!name) return "?";
    const p = name.split(" ");
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0].toUpperCase();
  };

  const handleSendAI = () => {
    if (!aiInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { type: "user", text: aiInput },
      { type: "system", text: "I'm analysing that now. Based on your portfolio signals, here's what I see…", rec: "→ This is indicative — I'll update when I have more data." },
    ]);
    setAiInput("");
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
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <div className="flex flex-col w-full h-full">

        {/* Phase topbar */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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

        {/* Sub-tabs */}
        <div className="flex flex-shrink-0 px-5" style={{ background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {(["signals", "sandbox", "intelligence"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-explore-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.5)",
                borderBottomColor: activeTab === tab ? EXPLORE_COLOR : "transparent",
              }}
            >
              {tab === "signals" ? "Market Signals" : tab === "sandbox" ? "Sandbox" : "Intelligence Library"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: CREAM }}>

            {/* ── SIGNALS ── */}
            {activeTab === "signals" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>
                    12 Active Signals
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
                  {SIGNALS.map(signal => (
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
                <div className="mb-5">
                  <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: CORAL }}>
                    Sandbox — Idea Potential Scoring
                  </div>
                  <p className="text-sm" style={{ color: N500 }}>Describe your concept and select your target personas to get a simulated interest and commitment score before commissioning a full study.</p>
                </div>

                {/* Idea input */}
                <div style={CARD} className="p-5 mb-4">
                  <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Describe your concept or idea</label>
                  <textarea
                    className="w-full rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none resize-none mb-4"
                    rows={3}
                    style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                    placeholder="e.g. A sugar-free energy drink with nootropic ingredients, targeting urban professionals who want sustained focus without a crash. Priced at R22 per 330ml can."
                    value={sandboxIdea}
                    onChange={e => { setSandboxIdea(e.target.value); setSandboxResult(null); }}
                    data-testid="input-sandbox-concept"
                    onFocus={e => (e.target.style.borderColor = VIO)}
                    onBlur={e => (e.target.style.borderColor = N200)}
                  />

                  <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Target Personas (select all that apply)</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PERSONAS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => togglePersona(p.id)}
                        data-testid={`persona-${p.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                        style={sandboxPersonas.includes(p.id)
                          ? { background: VIO, color: "#fff", border: `1.5px solid ${VIO}` }
                          : { background: "#fff", border: `1.5px solid ${N200}`, color: N500 }
                        }
                      >
                        <span className="font-semibold">{p.label}</span>
                        <span className="ml-1 opacity-70">{p.sub}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={runSandbox}
                    disabled={!sandboxIdea.trim() || sandboxRunning}
                    data-testid="button-run-sandbox"
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 text-white rounded-lg transition-opacity"
                    style={{ background: VIO, borderRadius: 8, opacity: !sandboxIdea.trim() ? 0.5 : 1 }}
                  >
                    {sandboxRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {sandboxRunning ? "Running model…" : "Run Sandbox"}
                  </button>
                </div>

                {/* Results */}
                {sandboxResult && (
                  <div className="space-y-3 mb-6">
                    <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Sandbox Results</div>

                    {/* Interest */}
                    <div style={CARD} className="p-5" data-testid="sandbox-result-interest">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: N500 }}>Interest Score</div>
                          <div className="text-[11px]" style={{ color: N500 }}>Purchase Intent Potential &mdash; benchmark &gt;81%</div>
                        </div>
                        <div className="text-3xl font-bold font-mono" style={{ color: sandboxResult.interest >= 81 ? SUCCESS : sandboxResult.interest >= 65 ? AMBER_DK : CORAL }}>
                          {sandboxResult.interest}%
                        </div>
                      </div>
                      <BenchmarkBar value={sandboxResult.interest} benchmark={81} color={CORAL} />
                      <div className="mt-2 text-xs" style={{ color: N500 }}>
                        {sandboxResult.interest >= 81
                          ? "Above benchmark — strong interest signal. This concept resonates with your selected personas."
                          : sandboxResult.interest >= 65
                          ? "Approaching benchmark. Refining the price-value message could push this above threshold."
                          : "Below benchmark. Consider rethinking the core proposition before testing with real consumers."}
                      </div>
                    </div>

                    {/* Commitment */}
                    <div style={CARD} className="p-5" data-testid="sandbox-result-commitment">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: N500 }}>Commitment Score</div>
                          <div className="text-[11px]" style={{ color: N500 }}>Purchase Likelihood &mdash; benchmark &gt;53%</div>
                        </div>
                        <div className="text-3xl font-bold font-mono" style={{ color: sandboxResult.commitment >= 53 ? SUCCESS : sandboxResult.commitment >= 40 ? AMBER_DK : CORAL }}>
                          {sandboxResult.commitment}%
                        </div>
                      </div>
                      <BenchmarkBar value={sandboxResult.commitment} benchmark={53} color={AMBER_DK} />
                      <div className="mt-2 text-xs" style={{ color: N500 }}>
                        {sandboxResult.commitment >= 53
                          ? "Above benchmark — consumers who like this concept are likely to follow through to purchase."
                          : sandboxResult.commitment >= 40
                          ? "Interest is there but commitment lags. Price or distribution friction may be reducing purchase likelihood."
                          : "Significant gap between interest and purchase likelihood. Investigate barriers to conversion."}
                      </div>
                    </div>

                    {/* Idea Score */}
                    <div style={{ ...CARD, borderColor: sandboxResult.ideaScore >= 81 ? "rgba(42,158,92,0.3)" : N200 }} className="p-5" data-testid="sandbox-result-idea-score">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: N500 }}>Idea Score</div>
                          <div className="text-[11px]" style={{ color: N500 }}>Average of Interest + Commitment &mdash; benchmark &gt;81%</div>
                        </div>
                        <div className="text-3xl font-bold font-mono" style={{ color: sandboxResult.ideaScore >= 81 ? SUCCESS : sandboxResult.ideaScore >= 65 ? AMBER_DK : CORAL }}>
                          {sandboxResult.ideaScore}%
                        </div>
                      </div>
                      <BenchmarkBar value={sandboxResult.ideaScore} benchmark={81} color={VIO} />
                      <div className="mt-3 rounded-xl px-4 py-3" style={{ background: sandboxResult.ideaScore >= 81 ? SUC_LT : sandboxResult.ideaScore >= 65 ? AMBER_LT : "#FDECEA" }}>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: sandboxResult.ideaScore >= 81 ? SUCCESS : sandboxResult.ideaScore >= 65 ? AMBER_DK : CORAL }}>
                          {sandboxResult.ideaScore >= 81 ? "Strong — ready for a full Test24 study" : sandboxResult.ideaScore >= 65 ? "Promising — refine before testing" : "Needs work — revisit the concept first"}
                        </div>
                        <div className="text-xs" style={{ color: N500 }}>
                          {sandboxResult.ideaScore >= 81
                            ? "This idea scores above the commercialisation threshold. Commission a Test24 Brief to validate with real SA consumers."
                            : sandboxResult.ideaScore >= 65
                            ? "Approaching threshold. A second Sandbox run after concept refinement is recommended before committing to a full study."
                            : "The concept needs stronger differentiation. Use Explore signals to re-identify the unmet need before re-running."}
                        </div>
                      </div>
                    </div>

                    {sandboxResult.ideaScore >= 65 && (
                      <button
                        onClick={() => setLocation("/portal/test")}
                        className="text-sm font-semibold px-5 py-2.5 text-white rounded-lg flex items-center gap-2"
                        style={{ background: CORAL, borderRadius: 8 }}
                        data-testid="button-launch-from-sandbox"
                      >
                        Launch a Test24 Brief <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {!sandboxResult && !sandboxRunning && (
                  <div className="rounded-xl p-5" style={{ background: VIO_LT, border: `1px solid rgba(58,47,191,0.2)` }}>
                    <div className="text-sm font-semibold mb-1" style={{ color: VIO }}>When to move from Sandbox to Test</div>
                    <p className="text-sm leading-relaxed" style={{ color: N500 }}>If your Idea Score is above 81%, it's worth commissioning a Test24 Brief to validate with real SA consumers. Between 65–81%, refine your concept first. Below 65%, revisit the core proposition.</p>
                  </div>
                )}
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
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: VIO }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Explore AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: VIO }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: VIO }} />
                12 live signals
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] mb-1 flex items-center gap-1.5" style={{ color: N500 }}>
                    {msg.type === "system" ? (
                      <><div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: VIO }}><Sparkles className="w-2.5 h-2.5 text-white" /></div> Explore AI</>
                    ) : (
                      <><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: CORAL }}>{initials(user?.name)}</div> {user?.name}</>
                    )}
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded-xl" style={{
                    background: msg.type === "user" ? "#FAF3E8" : "#F8F7FF",
                    border: `1px solid ${msg.type === "user" ? N200 : "rgba(58,47,191,0.12)"}`,
                  }}>
                    <p style={{ color: VDK }}>{msg.text}</p>
                    {msg.rec && (
                      <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: VIO_LT, borderLeft: `2px solid ${VIO}`, color: VIO }}>
                        {msg.rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 px-3 py-2 flex-wrap flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#FAFAF8" }}>
              {AI_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => setAiInput(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{ background: "#fff", border: `1px solid ${N200}`, color: N500 }}
                  data-testid={`ai-prompt-${p.substring(0, 20)}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${N200}` }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendAI()}
                className="flex-1 rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none"
                style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                placeholder="Ask about signals or trends…"
                data-testid="input-ai-message"
                onFocus={e => (e.target.style.borderColor = VIO)}
                onBlur={e => (e.target.style.borderColor = N200)}
              />
              <button
                onClick={handleSendAI}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{ background: VIO }}
                data-testid="button-send-ai"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 flex items-center justify-between flex-shrink-0 transition-colors"
              style={{ borderTop: `1px solid ${N200}`, background: "#FAFAF8" }}
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
                    style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
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
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#FAF3E8", border: `1px solid #E2D5BF`, color: "#8A7260" }}>
        {text}
      </div>
    </div>
  );
}
