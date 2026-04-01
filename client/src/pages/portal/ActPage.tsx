import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Send, MessageSquare, ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CORAL = "#C45A38";
const EXPLORE_COLOR = "#2563EB";
const TEST_COLOR = "#059669";
const HEALTH_COLOR = "#7C3AED";
const AMBER = "#B45309";
const WARN = "#DC2626";

type Tab = "gaps" | "nextsteps" | "planning";

const GAPS = [
  {
    priority: 1,
    title: "Commitment gap — Township segment",
    chip: { label: "High Priority", bg: "#FEF2F2", color: WARN },
    desc: "Energy Drink: 52% purchase intent in township vs 84% urban. Price friction at R22+ is the primary barrier. A R12–15 entry SKU could close 15pp of this gap and unlock meaningful volume.",
    cta: "See Next Steps",
    ctaAction: "nextsteps",
    priorityStyle: { bg: "#FEF2F2", color: WARN, border: WARN },
  },
  {
    priority: 2,
    title: "Value perception lag — 18–24 cohort",
    chip: { label: "Medium Priority", bg: "#FFFBEB", color: AMBER },
    desc: "Purchase intent sits at 65%, but value-for-money scores at 58% — 13pp below the study average. Messaging must shift to emphasise accessible value, not aspirational positioning.",
    cta: null,
    ctaAction: null,
    priorityStyle: { bg: "#FFFBEB", color: AMBER, border: AMBER },
  },
  {
    priority: 3,
    title: "Nootropic whitespace — unclaimed territory",
    chip: { label: "Opportunity", bg: "#EFF6FF", color: EXPLORE_COLOR },
    desc: "Cognitive-performance beverages are up 41% in search intent among urban 25–34 professionals. No local brand has moved to own this space. First-mover window is open — and narrowing.",
    cta: "Explore Trend",
    ctaAction: "explore",
    priorityStyle: { bg: "#EFF6FF", color: EXPLORE_COLOR, border: EXPLORE_COLOR },
  },
  {
    priority: 4,
    title: "Skincare — repositioning not landing in 35–49",
    chip: { label: "Preliminary", bg: "#F3F4F6", color: "#6B7280" },
    desc: "Preliminary data (67% field complete) shows the new brand story resonates in 25–34 but fails to convert the 35–49 segment. A dual-message strategy is recommended before full launch.",
    cta: null,
    ctaAction: null,
    priorityStyle: { bg: "#FFFBEB", color: AMBER, border: AMBER },
  },
];

const NEXT_STEPS = [
  {
    num: 1,
    title: "Test packaging variants — Energy Drink",
    desc: "Concept scored 72% purchase intent. Test 3–4 packaging variants with the 25–34 urban cohort before committing to production. Design drives 'premium but accessible' perception.",
    cta: { label: "Launch Packaging Brief →", action: "test", primary: true },
    locked: false,
  },
  {
    num: 2,
    title: "Sandbox — price-entry SKU for Township",
    desc: "Before investing a full study, pressure-test a R12–15 entry SKU concept in the Sandbox. The 52% intent gap suggests the volume is there.",
    cta: { label: "Open Sandbox →", action: "explore", primary: false },
    locked: false,
  },
  {
    num: 3,
    title: "Read the Nootropic Beverage trend report",
    desc: "41% search intent growth with no dominant local player. Understanding the category before building a brief will sharpen your methodology significantly.",
    cta: { label: "Browse Trend Reports →", action: "explore", primary: false },
    locked: false,
  },
  {
    num: 4,
    title: "Qual deep-dive — Skincare 35–49 segment",
    desc: "Once the Pro study completes, run AI-moderated qual interviews with 20 respondents in the 35–49 group.",
    cta: null,
    locked: true,
    lockedReason: "Unlocks when Skincare study completes",
  },
];

const COVERAGE = [
  { category: "Food & Beverage", chip: { label: "Strong", bg: "#ECFDF5", color: TEST_COLOR } },
  { category: "Beauty & Personal Care", chip: { label: "In Progress", bg: "#FFFBEB", color: AMBER } },
  { category: "Retail / FMCG", chip: { label: "Gap", bg: "#FEF2F2", color: WARN } },
];

const AI_MESSAGES = [
  {
    type: "user",
    text: "What do I still need to test before launching the Energy Drink?",
  },
  {
    type: "system",
    text: "Energy Drink — pre-launch sequence:\n\n1. Packaging Variants Test (1 Basic Credit) — test 3–4 options with 25–34 urban cohort.\n2. Price Sensitivity — Township (Sandbox, no credits) — model R12, R14, R16 price points.\n3. Channel Strategy Signal (optional, 1 Pro Credit) — if considering multiple channels.",
    rec: "→ Want me to draft a brief for step 1 now?",
  },
];

const AI_PROMPTS = ["What are my biggest gaps?", "Draft next brief", "Plan my next 6-month research cycle", "What's my biggest commercial risk?"];

export default function ActPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("gaps");
  const [activeGapsTab] = useState("gaps");
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const handleSendAI = () => {
    if (!aiInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { type: "user", text: aiInput },
      {
        type: "system",
        text: "Based on your strategic portfolio, here are the priority moves I'd recommend…",
        rec: "→ Let me know which area you'd like to sequence first.",
      } as any,
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
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-background">
      <div className="flex flex-col w-full h-full">
        {/* Phase topbar */}
        <div className="bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex items-center justify-between flex-shrink-0" style={{ minHeight: "52px" }}>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded"
              style={{ background: "#FDF2EE", color: CORAL, border: `1px solid #F2C4B4` }}
            >
              PHASE 03
            </span>
            <h1 className="font-serif text-xl text-foreground">Act</h1>
            <span className="text-sm text-muted-foreground ml-2 hidden sm:block">Where to move next.</span>
          </div>
          <button
            onClick={() => setLocation("/portal/dashboard")}
            className="w-8 h-8 bg-stone-100 dark:bg-sidebar border border-stone-200 dark:border-border rounded-full flex items-center justify-center text-sm text-muted-foreground hover:bg-stone-200 transition-colors"
            data-testid="button-close-act"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex gap-0 flex-shrink-0">
          {(["gaps", "nextsteps", "planning"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-act-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={
                activeTab === tab
                  ? { borderBottomColor: CORAL, color: CORAL }
                  : { borderBottomColor: "transparent", color: "hsl(var(--muted-foreground))" }
              }
            >
              {tab === "gaps" ? "Gaps" : tab === "nextsteps" ? "Next Steps" : "Planning Assistant"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "gaps" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">Strategic Gaps</span>
                    <span className="text-sm text-muted-foreground ml-2">4 identified</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm mb-5">
                  {GAPS.map((gap, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-4 py-4 ${i < GAPS.length - 1 ? "border-b border-stone-50 dark:border-border" : ""}`}
                      data-testid={`gap-item-${gap.priority}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border-2"
                        style={{ background: gap.priorityStyle.bg, color: gap.priorityStyle.color, borderColor: gap.priorityStyle.border }}
                      >
                        {gap.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{gap.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: gap.chip.bg, color: gap.chip.color }}>
                            {gap.chip.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{gap.desc}</p>
                        {gap.cta && (
                          <button
                            onClick={() => handleCtaAction(gap.ctaAction)}
                            className="text-xs font-semibold flex items-center gap-1"
                            style={{ color: CORAL }}
                          >
                            {gap.cta} <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">Research Coverage</div>
                <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm">
                  {COVERAGE.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3 ${i < COVERAGE.length - 1 ? "border-b border-stone-50 dark:border-border" : ""}`}
                    >
                      <span className="text-sm font-medium text-foreground">{item.category}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: item.chip.bg, color: item.chip.color }}>
                        {item.chip.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "nextsteps" && (
              <div>
                <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">Next Moves</div>

                <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm">
                  {NEXT_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 px-4 py-4 ${i < NEXT_STEPS.length - 1 ? "border-b border-stone-50 dark:border-border" : ""} ${step.locked ? "opacity-60" : ""}`}
                      data-testid={`next-step-${step.num}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 border font-mono"
                        style={step.locked ? { background: "#F2EFEB", color: "#A8A29E", borderColor: "#D4CEC6" } : { background: "#F2EFEB", color: "#57534E", borderColor: "#D4CEC6" }}
                      >
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">{step.title}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.desc}</p>
                        {step.cta && !step.locked && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCtaAction(step.cta!.action)}
                              className="text-xs h-8"
                              style={step.cta.primary ? { background: CORAL, borderColor: CORAL, color: "#fff" } : {}}
                              variant={step.cta.primary ? "default" : "outline"}
                              data-testid={`button-next-step-${step.num}`}
                            >
                              {step.cta.label}
                            </Button>
                          </div>
                        )}
                        {step.locked && step.lockedReason && (
                          <span className="text-xs text-muted-foreground bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border px-2 py-1 rounded">
                            {step.lockedReason}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "planning" && (
              <div className="max-w-2xl">
                <div className="rounded-xl p-4 mb-4" style={{ background: "#FDF2EE", border: `1px solid #F2C4B4` }}>
                  <div className="text-sm font-semibold mb-2" style={{ color: CORAL }}>Planning Assistant</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I've sequenced your 4 next steps above in order of strategic momentum. Packaging variants should come first — concept scores are strong enough. The Township SKU is your biggest volume unlock. Want me to help you draft a brief for any of these?
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap mb-4">
                  {AI_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAiInput(p)}
                      className="text-xs px-3 py-1.5 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendAI()}
                    className="flex-1 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Ask how to sequence your next moves…"
                    data-testid="input-planning-message"
                    style={{ outlineColor: CORAL }}
                  />
                  <button
                    onClick={handleSendAI}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: CORAL }}
                    data-testid="button-send-planning"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Planning AI + Team Chat */}
          <div className="w-80 min-w-[320px] border-l border-stone-100 dark:border-border flex flex-col bg-white dark:bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-border flex-shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px]" style={{ background: CORAL }}>
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
                Insights Query
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: CORAL }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                3 studies connected
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={(msg as any).type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                    {(msg as any).type === "system" ? (
                      <>
                        <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px]" style={{ background: CORAL }}>
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        Planning AI
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]" style={{ background: CORAL }}>
                          {getInitials(user?.name)}
                        </div>
                        {user?.name}
                      </>
                    )}
                  </div>
                  <div
                    className={`text-xs leading-relaxed p-3 rounded-lg border whitespace-pre-line ${
                      (msg as any).type === "user"
                        ? "bg-stone-50 dark:bg-sidebar border-stone-100 dark:border-border rounded-tr-none"
                        : "bg-white dark:bg-card border-stone-100 dark:border-border rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {(msg as any).rec && (
                      <div
                        className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r"
                        style={{ background: "#FDF2EE", borderLeft: `2px solid ${CORAL}`, color: CORAL }}
                      >
                        {(msg as any).rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 px-3 py-2 border-t border-stone-100 dark:border-border flex-wrap bg-stone-50 dark:bg-sidebar">
              {["What are my biggest gaps?", "Draft next brief"].map((p) => (
                <button
                  key={p}
                  onClick={() => setAiInput(p)}
                  className="text-[11px] px-2.5 py-1 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-full text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-stone-100 dark:border-border flex gap-2 flex-shrink-0">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAI()}
                className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
                placeholder="Ask about your strategy…"
                data-testid="input-insights-query"
              />
              <button
                onClick={handleSendAI}
                className="w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0"
                style={{ background: CORAL }}
                data-testid="button-send-insights"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 border-t border-stone-100 dark:border-border flex items-center justify-between bg-stone-50 dark:bg-sidebar hover:bg-stone-100 transition-colors flex-shrink-0"
              data-testid="button-toggle-team-chat-act"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                Team Chat
                <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>
                  2
                </span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showChat ? "rotate-180" : ""}`} />
            </button>

            {showChat && (
              <div className="border-t border-stone-100 dark:border-border bg-white dark:bg-card flex-shrink-0">
                <div className="p-3 max-h-36 overflow-y-auto space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: HEALTH_COLOR }}>SW</div>
                      <span className="text-xs font-semibold">Sarah W.</span>
                      <span className="text-[10px] text-muted-foreground">10:34</span>
                    </div>
                    <div className="ml-6 bg-stone-50 dark:bg-sidebar border border-stone-100 dark:border-border rounded rounded-tl-none px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold" style={{ color: EXPLORE_COLOR }}>@{user?.name?.split(" ")[0] || "You"}</span> — I've tagged this insight. Move it to Act for the client strategy deck?
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: AMBER }}>MK</div>
                      <span className="text-xs font-semibold">Mike K.</span>
                      <span className="text-[10px] text-muted-foreground">10:51</span>
                    </div>
                    <div className="ml-6 bg-stone-50 dark:bg-sidebar border border-stone-100 dark:border-border rounded rounded-tl-none px-3 py-2 text-xs text-muted-foreground">
                      Township SKU gap is high priority. Let's run the sandbox before the client call Friday.
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Reply… use @ to tag"
                    data-testid="input-team-chat-act"
                  />
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: CORAL }}
                    data-testid="button-send-team-chat-act"
                  >
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

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}
