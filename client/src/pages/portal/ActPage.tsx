import { useState } from "react";
import { useLocation } from "wouter";
import { X, Sparkles, Send, MessageSquare, ChevronDown, ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/* ── Design System tokens ─────────────────────────────── */
const VDK      = "#1E1B3A";
const VIO      = "#3A2FBF";
const VIO_LT   = "#EAE8FF";
const CORAL    = "#E8503A";
const CORAL_LT = "#FDECEA";
const N200     = "#E2D5BF";
const N400     = "#A89078";
const N500     = "#8A7260";
const SUCCESS  = "#2A9E5C";
const SUC_LT   = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CREAM    = "#FAF3E8";
const ACT_COLOR = CORAL;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.08)",
};

type Tab = "gaps" | "nextsteps" | "planning";

const GAPS = [
  {
    priority: 1,
    title: "Commitment gap — Township segment",
    chip: { label: "High Priority", bg: CORAL_LT, color: CORAL },
    desc: "Energy Drink: 52% purchase intent in township vs 84% urban. Price friction at R22+ is the primary barrier. A R12–15 entry SKU could close 15pp of this gap and unlock meaningful volume.",
    cta: "See Next Steps",
    ctaAction: "nextsteps",
    priorityStyle: { bg: CORAL_LT, color: CORAL },
  },
  {
    priority: 2,
    title: "Value perception lag — 18–24 cohort",
    chip: { label: "Medium Priority", bg: AMBER_LT, color: AMBER_DK },
    desc: "Purchase intent sits at 65%, but value-for-money scores at 58% — 13pp below the study average. Messaging must shift to emphasise accessible value, not aspirational positioning.",
    cta: null,
    ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
  {
    priority: 3,
    title: "Nootropic whitespace — unclaimed territory",
    chip: { label: "Opportunity", bg: VIO_LT, color: VIO },
    desc: "Cognitive-performance beverages are up 41% in search intent among urban 25–34 professionals. No local brand has moved to own this space. First-mover window is open — and narrowing.",
    cta: "Explore Trend",
    ctaAction: "explore",
    priorityStyle: { bg: VIO_LT, color: VIO },
  },
  {
    priority: 4,
    title: "Skincare — repositioning not landing in 35–49",
    chip: { label: "Preliminary", bg: "#F3F4F6", color: "#6B7280" },
    desc: "Preliminary data (67% field complete) shows the new brand story resonates in 25–34 but fails to convert the 35–49 segment. A dual-message strategy is recommended before full launch.",
    cta: null,
    ctaAction: null,
    priorityStyle: { bg: AMBER_LT, color: AMBER_DK },
  },
];

const NEXT_STEPS = [
  { num: 1, title: "Test packaging variants — Energy Drink",    desc: "Concept scored 72% purchase intent. Test 3–4 packaging variants with the 25–34 urban cohort before committing to production.", cta: { label: "Launch Packaging Brief →", action: "test",    primary: true  }, locked: false },
  { num: 2, title: "Sandbox — price-entry SKU for Township",    desc: "Before investing a full study, pressure-test a R12–15 entry SKU concept in the Sandbox. The 52% intent gap suggests the volume is there.", cta: { label: "Open Sandbox →",          action: "explore", primary: false }, locked: false },
  { num: 3, title: "Read the Nootropic Beverage trend report",  desc: "41% search intent growth with no dominant local player. Understanding the category before building a brief will sharpen your methodology.", cta: { label: "Browse Trend Reports →",  action: "explore", primary: false }, locked: false },
  { num: 4, title: "Qual deep-dive — Skincare 35–49 segment",   desc: "Once the Pro study completes, run AI-moderated qual interviews with 20 respondents in the 35–49 group.", cta: null, locked: true, lockedReason: "Unlocks when Skincare study completes" },
];

const COVERAGE = [
  { category: "Food & Beverage",     chip: { label: "Strong",      bg: SUC_LT,  color: SUCCESS  } },
  { category: "Beauty & Personal Care", chip: { label: "In Progress", bg: AMBER_LT, color: AMBER_DK } },
  { category: "Retail / FMCG",      chip: { label: "Gap",         bg: CORAL_LT, color: CORAL   } },
];

const AI_MESSAGES = [
  { type: "user",   text: "What do I still need to test before launching the Energy Drink?" },
  { type: "system", text: "Energy Drink — pre-launch sequence:\n\n1. Packaging Variants Test (1 Basic Credit) — test 3–4 options with 25–34 urban cohort.\n2. Price Sensitivity — Township (Sandbox, no credits) — model R12, R14, R16 price points.\n3. Channel Strategy Signal (optional, 1 Pro Credit) — if considering multiple channels.", rec: "→ Want me to draft a brief for step 1 now?" },
];

const AI_PROMPTS = [
  "What are my biggest gaps?",
  "Draft next brief",
  "Plan my next 6-month research cycle",
  "What's my biggest commercial risk?",
];

export default function ActPage() {
  const [, setLocation]           = useLocation();
  const { user }                  = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("gaps");
  const [aiInput, setAiInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);

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
      { type: "system", text: "Based on your strategic portfolio, here are the priority moves I'd recommend…", rec: "→ Let me know which area you'd like to sequence first." },
    ]);
    setAiInput("");
  };

  const handleCtaAction = (action: string | null) => {
    if (!action) return;
    if (action === "test") setLocation("/portal/test");
    else if (action === "explore") setLocation("/portal/explore");
    else if (action === "nextsteps") setActiveTab("nextsteps");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <div className="flex flex-col w-full h-full">

        {/* Phase topbar */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1" style={{ background: "rgba(232,80,58,0.2)", color: "#FCA5A5", border: "1px solid rgba(232,80,58,0.4)", borderRadius: 6 }}>
              PHASE 03
            </span>
            <h1 className="font-serif text-xl text-white">Act</h1>
            <span className="text-sm hidden sm:block" style={{ color: N400 }}>Where to move next.</span>
          </div>
          <button
            onClick={() => setLocation("/portal/dashboard")}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            data-testid="button-close-act"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-shrink-0 px-5" style={{ background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {(["gaps", "nextsteps", "planning"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-act-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.5)",
                borderBottomColor: activeTab === tab ? ACT_COLOR : "transparent",
              }}
            >
              {tab === "gaps" ? "Gaps" : tab === "nextsteps" ? "Next Steps" : "Planning Assistant"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: CREAM }}>

            {activeTab === "gaps" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Strategic Gaps</span>
                  <span className="text-sm" style={{ color: N500 }}>4 identified</span>
                </div>

                <div style={{ ...CARD, marginBottom: 20, overflow: "hidden", padding: 0 }}>
                  {GAPS.map((gap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-5 py-4"
                      style={i < GAPS.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}}
                      data-testid={`gap-item-${gap.priority}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border-2"
                        style={{ background: gap.priorityStyle.bg, color: gap.priorityStyle.color, borderColor: gap.priorityStyle.color }}
                      >
                        {gap.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: VDK }}>{gap.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: gap.chip.bg, color: gap.chip.color, borderRadius: 9999 }}>
                            {gap.chip.label}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: N500 }}>{gap.desc}</p>
                        {gap.cta && (
                          <button onClick={() => handleCtaAction(gap.ctaAction)} className="text-xs font-semibold flex items-center gap-1" style={{ color: ACT_COLOR }}>
                            {gap.cta} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: CORAL }}>Research Coverage</div>
                <div style={{ ...CARD, overflow: "hidden", padding: 0 }}>
                  {COVERAGE.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3" style={i < COVERAGE.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}}>
                      <span className="text-sm font-medium" style={{ color: VDK }}>{item.category}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: item.chip.bg, color: item.chip.color, borderRadius: 9999 }}>
                        {item.chip.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "nextsteps" && (
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: CORAL }}>Next Moves</div>
                <div style={{ ...CARD, overflow: "hidden", padding: 0 }}>
                  {NEXT_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 px-5 py-4"
                      style={{
                        ...(i < NEXT_STEPS.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}),
                        opacity: step.locked ? 0.55 : 1,
                      }}
                      data-testid={`next-step-${step.num}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 font-mono"
                        style={step.locked
                          ? { background: "#F5F0E8", color: N400, border: `1px solid ${N200}` }
                          : { background: CORAL_LT, color: CORAL, border: `1.5px solid ${CORAL}` }
                        }
                      >
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{step.title}</div>
                        <p className="text-xs leading-relaxed mb-3" style={{ color: N500 }}>{step.desc}</p>
                        {step.locked && (step as any).lockedReason && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: N400 }}>
                            <Lock className="w-3 h-3" /> {(step as any).lockedReason}
                          </div>
                        )}
                        {step.cta && !step.locked && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCtaAction(step.cta!.action)}
                              className="text-xs font-semibold px-4 py-1.5 rounded-lg"
                              style={step.cta.primary
                                ? { background: CORAL, color: "#fff", borderRadius: 8 }
                                : { border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }
                              }
                            >
                              {step.cta.label}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "planning" && (
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: CORAL }}>Planning Assistant</div>
                <p className="text-sm mb-5" style={{ color: N500 }}>Build a structured 6-month research plan around your commercial objectives and existing data gaps.</p>
                <div style={{ ...CARD, padding: 20 }}>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: VDK }}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: CORAL }}>
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    Insights Query
                  </div>
                  <p className="text-xs" style={{ color: N500 }}>Ask me to draft a brief, sequence your next research cycle, or identify your biggest commercial risk before launch.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: `1px solid ${N200}` }}>
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: ACT_COLOR }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Insights Query
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: ACT_COLOR }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACT_COLOR }} />
                4 strategic gaps
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] mb-1 flex items-center gap-1.5" style={{ color: N500 }}>
                    {msg.type === "system"
                      ? <><div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: ACT_COLOR }}><Sparkles className="w-2.5 h-2.5 text-white" /></div> Insights Query</>
                      : <><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: VIO }}>{initials(user?.name)}</div> {user?.name}</>
                    }
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: msg.type === "user" ? "#FAF3E8" : "#FFF5F4", border: `1px solid ${msg.type === "user" ? N200 : "rgba(232,80,58,0.15)"}` }}>
                    <p style={{ color: VDK, whiteSpace: "pre-line" }}>{msg.text}</p>
                    {msg.rec && (
                      <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: CORAL_LT, borderLeft: `2px solid ${CORAL}`, color: CORAL }}>
                        {msg.rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 px-3 py-2 flex-wrap flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#FAFAF8" }}>
              {AI_PROMPTS.map(p => (
                <button key={p} onClick={() => setAiInput(p)} className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: "#fff", border: `1px solid ${N200}`, color: N500 }} data-testid={`ai-prompt-${p.substring(0, 20)}`}>{p}</button>
              ))}
            </div>

            <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${N200}` }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendAI()}
                className="flex-1 rounded-lg px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none"
                style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                placeholder="Ask about gaps or next moves…"
                data-testid="input-ai-message"
                onFocus={e => (e.target.style.borderColor = CORAL)}
                onBlur={e => (e.target.style.borderColor = N200)}
              />
              <button onClick={handleSendAI} className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: ACT_COLOR }} data-testid="button-send-ai">
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
                <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>3</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChat ? "rotate-180" : ""}`} style={{ color: N500 }} />
            </button>

            {showChat && (
              <div className="flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#fff" }}>
                <div className="p-3 max-h-36 overflow-y-auto space-y-3">
                  <TCMsg initials="SW" author="Sarah W." time="11:02" color={VIO}   text="The township entry SKU is our biggest volume lever — should be number one priority." />
                  <TCMsg initials="JS" author="James S."  time="11:08" color={CORAL} text="Agreed. I've briefed the packaging concepts — we'll have options by Thursday." />
                  <TCMsg initials="TM" author="Thabo M."  time="11:14" color={SUCCESS} text={`@${user?.name?.split(" ")[0] || "You"} can you review the nootropic brief before we commission?`} />
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }} placeholder="Reply… use @ to tag" data-testid="input-team-chat" />
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: CORAL }} data-testid="button-send-chat"><Send className="w-3 h-3" /></button>
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
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: color }}>{initials}</div>
        <span className="text-xs font-semibold" style={{ color: "#1E1B3A" }}>{author}</span>
        <span className="text-[10px]" style={{ color: "#8A7260" }}>{time}</span>
      </div>
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#FAF3E8", border: "1px solid #E2D5BF", color: "#8A7260" }}>{text}</div>
    </div>
  );
}
