import { useState } from "react";
import { useLocation } from "wouter";
import { X, Sparkles, Send, TrendingUp, TrendingDown, Minus, BarChart3, Users, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
const CYAN     = "#4EC9E8";
const CYAN_DK  = "#1A8FAD";
const CYAN_LT  = "#DFF6FC";
const CREAM    = "#FAF3E8";

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.08)",
};

const HEALTH_METRICS = [
  {
    id: "awareness",
    label: "Unaided Awareness",
    icon: Eye,
    value: 34,
    prev: 29,
    benchmark: 40,
    desc: "% of target consumers who recall your brand without prompting",
    wave: "Wave 3 · Q1 2026",
    color: VIO,
    bgLight: VIO_LT,
  },
  {
    id: "consideration",
    label: "Brand Consideration",
    icon: Heart,
    value: 51,
    prev: 47,
    benchmark: 55,
    desc: "% who would consider your brand when making a purchase in-category",
    wave: "Wave 3 · Q1 2026",
    color: CYAN_DK,
    bgLight: CYAN_LT,
  },
  {
    id: "purchase_intent",
    label: "Purchase Intent",
    icon: ShoppingCart,
    value: 43,
    prev: 45,
    benchmark: 50,
    desc: "% who intend to purchase your brand in the next 30 days",
    wave: "Wave 3 · Q1 2026",
    color: SUCCESS,
    bgLight: SUC_LT,
  },
  {
    id: "nps",
    label: "Net Promoter Score",
    icon: Users,
    value: 28,
    prev: 22,
    benchmark: 35,
    desc: "Likelihood to recommend your brand minus detractors",
    wave: "Wave 3 · Q1 2026",
    color: AMBER_DK,
    bgLight: AMBER_LT,
  },
];

const BRAND_PERCEPTIONS = [
  { label: "Premium quality",   score: 62, prev: 58 },
  { label: "Good value",        score: 44, prev: 47 },
  { label: "Innovative",        score: 55, prev: 49 },
  { label: "Trustworthy",       score: 71, prev: 68 },
  { label: "South African",     score: 83, prev: 81 },
  { label: "Recommended",       score: 39, prev: 34 },
];

const WAVE_HISTORY = [
  { wave: "Wave 1 · Q3 2025", awareness: 22, consideration: 38, intent: 31, nps: 14 },
  { wave: "Wave 2 · Q4 2025", awareness: 29, consideration: 47, intent: 45, nps: 22 },
  { wave: "Wave 3 · Q1 2026", awareness: 34, consideration: 51, intent: 43, nps: 28 },
];

const AI_MESSAGES = [
  {
    type: "system" as const,
    text: "Your brand health is trending positively. Unaided awareness is up +5pts vs Wave 2, and consideration is at 51% — just 4pts below benchmark. The dip in purchase intent (−2pts) is worth watching, likely driven by category price sensitivity.",
    rec: "→ Commission a concept test to address the value-perception gap and arrest the intent decline.",
  },
];

type Tab = "overview" | "perceptions" | "history";

function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function HealthPage() {
  const [, setLocation]           = useLocation();
  const { user }                  = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [aiInput, setAiInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(AI_MESSAGES);

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
      { type: "system", text: "Your brand health data suggests this is an important area to monitor. The most recent wave shows an improving trend in awareness and consideration.", rec: "→ Continue tracking quarterly to measure the impact of any campaign activity." },
    ]);
    setAiInput("");
  };

  const delta = (cur: number, prev: number) => cur - prev;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <div className="flex flex-col w-full h-full">

        {/* Phase topbar */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1" style={{ background: "rgba(78,201,232,0.2)", color: CYAN, border: "1px solid rgba(78,201,232,0.4)", borderRadius: 6 }}>
              PHASE 04
            </span>
            <h1 className="font-serif text-xl text-white">Health</h1>
            <span className="text-sm hidden sm:block" style={{ color: N400 }}>Track your brand health over time</span>
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

        {/* Sub-tabs */}
        <div className="flex flex-shrink-0 px-5" style={{ background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {(["overview", "perceptions", "history"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-health-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.5)",
                borderBottomColor: activeTab === tab ? CYAN : "transparent",
              }}
            >
              {tab === "overview" ? "Overview" : tab === "perceptions" ? "Brand Perceptions" : "Wave History"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: CREAM }}>

            {activeTab === "overview" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Brand Health Scorecard</span>
                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: CYAN_LT, color: CYAN_DK }}>Wave 3 · Q1 2026 · n=500</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {HEALTH_METRICS.map(metric => {
                    const d = delta(metric.value, metric.prev);
                    const atBenchmark = metric.value >= metric.benchmark;
                    return (
                      <div key={metric.id} style={CARD} className="p-5" data-testid={`health-metric-${metric.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: CORAL }}>{metric.wave}</div>
                            <div className="text-sm font-semibold" style={{ color: VDK }}>{metric.label}</div>
                            <div className="text-xs mt-0.5 leading-snug" style={{ color: N500 }}>{metric.desc}</div>
                          </div>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: metric.bgLight }}>
                            <BarChart3 className="w-4 h-4" style={{ color: metric.color }} />
                          </div>
                        </div>

                        <div className="flex items-end gap-3">
                          <span className="text-3xl font-bold font-mono" style={{ color: atBenchmark ? SUCCESS : metric.color }}>{metric.value}%</span>
                          <div className="flex flex-col gap-0.5 mb-1">
                            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: d >= 0 ? SUCCESS : CORAL }}>
                              {d > 0 ? <TrendingUp className="w-3 h-3" /> : d < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              {d > 0 ? "+" : ""}{d}pts vs Wave 2
                            </div>
                            <div className="text-[10px]" style={{ color: N500 }}>Benchmark: {metric.benchmark}%{atBenchmark ? " ✓" : ""}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1" style={{ color: N500 }}>
                            <span>0</span><span style={{ color: metric.color }}>Benchmark {metric.benchmark}%</span><span>100</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EBE0" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${metric.value}%`, background: atBenchmark ? SUCCESS : metric.color }} />
                          </div>
                          <div className="relative h-0" style={{ marginTop: -9 }}>
                            <div className="absolute top-0 w-0.5 h-3" style={{ left: `${metric.benchmark}%`, background: N400 }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={CARD} className="p-5">
                  <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: CORAL }}>Key Insights · Wave 3</div>
                  <div className="space-y-3">
                    {[
                      { title: "Awareness momentum", body: "Unaided awareness grew +5pts to 34% — the strongest wave-on-wave increase yet. Urban 25–34 female segment is leading the recovery.", color: SUCCESS },
                      { title: "Intent dip warrants attention", body: "Purchase intent fell −2pts to 43%, likely driven by price sensitivity following Q4 category price increases. A concept test on value messaging is recommended.", color: AMBER_DK },
                      { title: "NPS improving steadily", body: "NPS reached 28 (+6pts), indicating improving word-of-mouth dynamics. Loyalist segment (45–55) is driving recommendation scores.", color: CYAN_DK },
                    ].map((ins, i) => (
                      <div key={i} className="pl-3 py-2 rounded-r-xl text-xs" style={{ borderLeft: `3px solid ${ins.color}`, background: "#FAFAF8" }}>
                        <div className="font-semibold mb-0.5" style={{ color: VDK }}>{ins.title}</div>
                        <div style={{ color: N500 }}>{ins.body}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "perceptions" && (
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Brand Perception Drivers</span>
                  <p className="text-xs mt-1" style={{ color: N500 }}>% of consumers who associate each attribute with your brand (n=500)</p>
                </div>
                <div style={CARD} className="p-5">
                  <div className="space-y-4">
                    {BRAND_PERCEPTIONS.map((p, i) => {
                      const d = p.score - p.prev;
                      return (
                        <div key={i} data-testid={`perception-${i}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium" style={{ color: VDK }}>{p.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color: d >= 0 ? SUCCESS : CORAL }}>
                                {d > 0 ? "+" : ""}{d}pts
                              </span>
                              <span className="text-sm font-bold font-mono" style={{ color: VDK }}>{p.score}%</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EBE0" }}>
                            <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.score >= 60 ? SUCCESS : p.score >= 40 ? CYAN_DK : VIO }} />
                          </div>
                          <div className="text-[10px] mt-1" style={{ color: N500 }}>Wave 2: {p.prev}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div>
                <div className="mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Wave History</span>
                  <p className="text-xs mt-1" style={{ color: N500 }}>Longitudinal tracking across all health waves</p>
                </div>
                <div className="space-y-3">
                  {WAVE_HISTORY.map((w, i) => (
                    <div key={i} style={CARD} className="p-5" data-testid={`wave-row-${i}`}>
                      <div className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color: CORAL }}>{w.wave}</div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Awareness",    val: w.awareness,    color: VIO      },
                          { label: "Consideration",val: w.consideration, color: CYAN_DK  },
                          { label: "Intent",       val: w.intent,        color: SUCCESS  },
                          { label: "NPS",          val: w.nps,           color: AMBER_DK },
                        ].map(m => (
                          <div key={m.label} className="text-center rounded-xl py-3" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
                            <div className="text-xl font-bold font-mono" style={{ color: m.color }}>{m.val}%</div>
                            <div className="text-[9px] mt-0.5 font-medium uppercase tracking-wide" style={{ color: N500 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ ...CARD, marginTop: 16, padding: 20 }}>
                  <div className="text-sm font-semibold mb-3" style={{ color: VDK }}>Request Wave 4</div>
                  <p className="text-xs mb-4" style={{ color: N500 }}>Schedule your next brand health wave to maintain continuous tracking momentum. Recommended cadence: quarterly.</p>
                  <div className="flex gap-2">
                    <button
                      className="text-sm font-semibold px-4 py-2 text-white rounded-lg"
                      style={{ background: CYAN_DK, borderRadius: 8 }}
                      data-testid="button-request-wave"
                    >
                      Request Wave 4
                    </button>
                    <button className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }} data-testid="button-download-health-report">
                      Download Wave 3 Report
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: `1px solid ${N200}` }}>
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: CYAN_DK }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Health AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: CYAN_DK }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN_DK }} />
                Wave 3 analysed
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] mb-1 flex items-center gap-1.5" style={{ color: N500 }}>
                    {msg.type === "system"
                      ? <><div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: CYAN_DK }}><Sparkles className="w-2.5 h-2.5 text-white" /></div> Health AI</>
                      : <><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: CORAL }}>{initials(user?.name)}</div> {user?.name}</>
                    }
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: msg.type === "user" ? "#FAF3E8" : "#EFF9FC", border: `1px solid ${msg.type === "user" ? N200 : "rgba(78,201,232,0.2)"}` }}>
                    <p style={{ color: VDK }}>{msg.text}</p>
                    {msg.rec && (
                      <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: CYAN_LT, borderLeft: `2px solid ${CYAN_DK}`, color: CYAN_DK }}>
                        {msg.rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${N200}` }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendAI()}
                className="flex-1 rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none"
                style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                placeholder="Ask about your brand health…"
                data-testid="input-health-ai"
                onFocus={e => (e.target.style.borderColor = CYAN_DK)}
                onBlur={e => (e.target.style.borderColor = N200)}
              />
              <button
                onClick={handleSendAI}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{ background: CYAN_DK }}
                data-testid="button-send-health-ai"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
