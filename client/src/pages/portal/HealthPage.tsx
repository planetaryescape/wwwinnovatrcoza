import { useState } from "react";
import { useLocation } from "wouter";
import {
  X, Sparkles, Send, TrendingUp, TrendingDown, Activity,
  MessageSquare, Star, DollarSign, Eye, Clock, AlertTriangle,
  Search, Table2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ── Design System ───────────────────────────────────────── */
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
const CREAM    = "#FAF3E8";

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.06)",
};

/* ── Mock data ───────────────────────────────────────────── */
const SCORE_CARDS = [
  {
    label: "IDEA SCORE",
    value: 82,
    delta: +4,
    icon: Clock,
    gradient: "linear-gradient(135deg, #2A9E5C 0%, #1e7a46 100%)",
    circleColor: "rgba(255,255,255,0.5)",
    circleBg: "rgba(255,255,255,0.15)",
  },
  {
    label: "INTEREST SCORE",
    value: 67,
    delta: +9,
    icon: Eye,
    gradient: "linear-gradient(135deg, #3A2FBF 0%, #5b50d9 100%)",
    circleColor: "rgba(255,255,255,0.5)",
    circleBg: "rgba(255,255,255,0.15)",
  },
  {
    label: "COMMITMENT SCORE",
    value: 54,
    delta: -3,
    icon: Sparkles,
    gradient: "linear-gradient(135deg, #E8503A 0%, #c23a26 50%, #b8360a 100%)",
    circleColor: "rgba(255,255,255,0.5)",
    circleBg: "rgba(255,255,255,0.15)",
  },
];

const BRAND_PILLARS = [
  {
    label: "Meaning",
    sub: "Brand resonance & purpose",
    value: 78,
    icon: MessageSquare,
    color: "#3A2FBF",
    barColor: "#3A2FBF",
    tags: "Relevance 81% · Emotional 74% · Trust 79%",
  },
  {
    label: "Difference",
    sub: "Distinctiveness & uniqueness",
    value: 63,
    icon: Star,
    color: "#E8503A",
    barColor: "#E8503A",
    tags: "Unique 65% · Innovative 59% · Modern 64%",
  },
  {
    label: "Worth",
    sub: "Perceived value & premium",
    value: 71,
    icon: DollarSign,
    color: "#2A9E5C",
    barColor: "#2A9E5C",
    tags: "Price fair 73% · Premium 68% · Value 72%",
  },
];

const SCORE_HISTORY = [
  {
    label: "Idea Score",
    color: "#2A9E5C",
    delta: "+4",
    deltaColor: SUCCESS,
    points: [78, 80, 82],
  },
  {
    label: "Interest",
    color: "#5b50d9",
    delta: "+9",
    deltaColor: SUCCESS,
    points: [58, 64, 67],
  },
  {
    label: "Commitment",
    color: "#E8503A",
    delta: "−3",
    deltaColor: CORAL,
    points: [57, 57, 54],
  },
  {
    label: "MDW Overall",
    color: VIO,
    delta: "0",
    deltaColor: N400,
    points: [68, 71, 71],
  },
];
const HISTORY_LABELS = ["Study 1", "Study 2", "Latest"];

const STRATEGIC_TAKEAWAYS = [
  {
    icon: "💡",
    bold: "Idea traction strong",
    rest: " — concept scores above 80% in 3 of 5 studies, confirming robust unmet-need signals across portfolio.",
  },
  {
    icon: "⚠️",
    bold: "Commitment gap widening",
    rest: " — Commitment trails Idea by 28 pts on average. Pricing narrative and CTA clarity are the primary levers.",
  },
  {
    icon: "📈",
    bold: "Interest momentum building",
    rest: " — Interest Score up +9 pts vs last study, driven by Discovery Bank Banking and Rugani × Clicks results.",
  },
  {
    icon: "🔍",
    bold: "Difference pillar weakest",
    rest: " at 63% — distinctiveness below Meaning (78%) and Worth (71%). Brand differentiation work needed across both clients.",
  },
];

const GAPS = [
  {
    title: "Commitment–Interest Gap",
    level: "MEDIUM",
    levelBg: AMBER_LT,
    levelColor: AMBER_DK,
    detail: "Interest 67% → Commitment 54%",
    value: "13 pts",
  },
  {
    title: "Differentiation Deficit",
    level: "MEDIUM",
    levelBg: AMBER_LT,
    levelColor: AMBER_DK,
    detail: "Worth 71% vs Difference 63%",
    value: "8 pts",
  },
  {
    title: "Rugani Packaging Commitment",
    level: "HIGH",
    levelBg: "#FDECEA",
    levelColor: CORAL,
    detail: "Well below 40% threshold — urgent",
    value: "20.6%",
  },
];

const STUDIES = [
  { name: "Project Aurum",  idea: 97, interest: 67, commit: 54, trend: "Strong",  tBg: SUC_LT,   tColor: SUCCESS  },
  { name: "Low/No Audit",  idea: 98, interest: 95, commit: 77, trend: "Strong",  tBg: SUC_LT,   tColor: SUCCESS  },
  { name: "Meta Creative", idea: 74, interest: 54, commit: 41, trend: "Mixed",   tBg: AMBER_LT, tColor: AMBER_DK },
  { name: "Rugani Ad",     idea: 68, interest: 54, commit: 21, trend: "Weak",    tBg: "#FDECEA", tColor: CORAL   },
  { name: "Rugani × Clicks",idea:92, interest: 81, commit: 54, trend: "Strong",  tBg: SUC_LT,   tColor: SUCCESS  },
];

function scoreColor(v: number) {
  if (v >= 80) return SUCCESS;
  if (v >= 65) return AMBER_DK;
  return CORAL;
}

/* ── Circular progress SVG ───────────────────────────────── */
function CircleProgress({ value, size = 60, strokeWidth = 5, color, bg }: {
  value: number; size?: number; strokeWidth?: number; color: string; bg: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
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
  const max = 100;
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
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(p / max) * 100}%`, background: color, opacity: 0.9 - i * 0.15 }} />
            </div>
            <span className="text-xs w-6 text-right font-mono" style={{ color: N500 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ type: "system" | "user"; text: string; rec?: string }[]>([
    {
      type: "system",
      text: "Your portfolio is showing strong idea traction at 82% but a widening commitment gap. The Difference pillar at 63% is the primary lever to address. Two clients show urgent gaps.",
      rec: "→ Prioritise pricing narrative clarity and CTA sharpness in next round of creative.",
    },
  ]);

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
      { type: "system", text: "Based on your portfolio data, the commitment gap is the most urgent area to address. Focus on pricing narrative and purchase trigger clarity across your next round of concepts.", rec: "→ Commission a dedicated commitment-lift test on Rugani to arrest the decline." },
    ]);
    setAiInput("");
  };

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
                <select className="rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }} data-testid="select-company-filter">
                  <option>All Companies</option>
                  <option>Rugani Juice</option>
                  <option>Discovery Bank</option>
                  <option>Meta</option>
                </select>
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SUCCESS }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: SUCCESS }} />
                  Live data
                </div>
              </div>
            </div>

            {/* ── 3 Score Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {SCORE_CARDS.map((card, i) => {
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
                          {card.delta > 0
                            ? <TrendingUp className="w-3.5 h-3.5 text-white opacity-80" />
                            : card.delta < 0
                            ? <TrendingDown className="w-3.5 h-3.5 text-white opacity-80" />
                            : null
                          }
                          <span className="text-xs font-medium text-white opacity-80">
                            {card.delta > 0 ? `+${card.delta}` : card.delta} vs last study
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
                {BRAND_PILLARS.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <div key={i} className="rounded-xl p-4" style={{ border: `1px solid ${N200}`, background: "#FAFAF8" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: p.color + "18", border: `1px solid ${p.color}22` }}>
                            <Icon className="w-4 h-4" style={{ color: p.color }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: VDK }}>{p.label}</div>
                            <div className="text-xs" style={{ color: N500 }}>{p.sub}</div>
                          </div>
                        </div>
                        <span className="text-xl font-bold font-mono" style={{ color: p.color }}>{p.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "#F0EBE0" }}>
                        <div className="h-full rounded-full" style={{ width: `${p.value}%`, background: p.barColor }} />
                      </div>
                      <div className="text-[10px]" style={{ color: N500 }}>{p.tags}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Score Over Time ── */}
            <div style={{ ...CARD, marginBottom: 20 }} className="p-5">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: VIO }} />
                  <span className="text-sm font-semibold" style={{ color: VDK }}>Score Over Time</span>
                </div>
                <span className="text-xs" style={{ color: N500 }}>Across all studies</span>
              </div>
              <div>
                {SCORE_HISTORY.map((row, i) => (
                  <ScoreRow key={i} {...row} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                {HISTORY_LABELS.map((l, i) => (
                  <span key={i} className="text-xs" style={{ color: N500 }}>{l}</span>
                ))}
              </div>
            </div>

            {/* ── Strategic Takeaways + Gaps to Bridge (side by side on large) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

              {/* Strategic Takeaways — dark card */}
              <div className="rounded-2xl p-5" style={{ background: VDK }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-white opacity-70" />
                    <span className="text-sm font-semibold text-white">Strategic Takeaways</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: VIO, color: "#fff" }}>AI Generated</span>
                </div>
                <div className="space-y-4">
                  {STRATEGIC_TAKEAWAYS.map((t, i) => (
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
                  <span className="text-xs" style={{ color: N500 }}>3 identified</span>
                </div>
                <div className="space-y-0">
                  {GAPS.map((gap, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: i < GAPS.length - 1 ? `1px solid ${N200}` : "none" }} data-testid={`gap-row-${i}`}>
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
                  {STUDIES.map((s, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${N200}` }} data-testid={`study-row-${i}`}>
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

          </div>

          {/* ── Right: AI Panel ── */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: `1px solid ${N200}` }}>
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: SUCCESS }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Health AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: SUCCESS }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: SUCCESS }} />
                5 studies · live portfolio
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] mb-1 flex items-center gap-1.5" style={{ color: N500 }}>
                    {msg.type === "system"
                      ? <><div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: SUCCESS }}><Sparkles className="w-2.5 h-2.5 text-white" /></div> Health AI</>
                      : <><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: CORAL }}>{initials(user?.name)}</div> {user?.name}</>
                    }
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: msg.type === "user" ? "#FAF3E8" : SUC_LT, border: `1px solid ${msg.type === "user" ? N200 : "rgba(42,158,92,0.2)"}` }}>
                    <p style={{ color: VDK }}>{msg.text}</p>
                    {msg.rec && (
                      <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: "#D1FAE5", borderLeft: `2px solid ${SUCCESS}`, color: SUCCESS }}>
                        {msg.rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick queries */}
            <div className="flex gap-1.5 px-3 py-2 flex-wrap flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#FAFAF8" }}>
              {["What's driving the commitment gap?", "Which study needs urgent attention?", "How do I improve the Difference pillar?"].map(q => (
                <button key={q} onClick={() => setAiInput(q)} className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: "#fff", border: `1px solid ${N200}`, color: N500 }} data-testid={`health-query-${q.substring(0, 15)}`}>{q}</button>
              ))}
            </div>

            <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${N200}` }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendAI()}
                className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                placeholder="Ask about your portfolio…"
                data-testid="input-health-ai"
                onFocus={e => (e.target.style.borderColor = SUCCESS)}
                onBlur={e => (e.target.style.borderColor = N200)}
              />
              <button onClick={handleSendAI} className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: SUCCESS }} data-testid="button-send-health-ai">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
