import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  X, MessageSquare, ChevronDown, ArrowRight, Lock, Send,
  FlaskConical, Layers, Lightbulb, CheckCircle2, Gift, Brain, Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AIQueryPanel from "@/components/portal/AIQueryPanel";
import { MobilePortalNav } from "@/components/portal/MobilePortalNav";
import { PhaseTopbar } from "@/components/portal/PhaseTopbar";
import { usePortalTheme } from "@/hooks/usePortalTheme";
import type { ClientReport } from "@shared/schema";
import { useIndustryGroups } from "@/hooks/useIndustryGroups";
import { filterByIndustry } from "@/lib/industry-groups";
import {
  ALL_STRATEGIC_GAPS, ALL_NEXT_STEPS, ALL_RESEARCH_RECS,
  ALL_PLANNING_PROMPTS, ALL_COVERAGE,
} from "@/lib/portal-content";

/* ── Design System tokens ─────────────────────────────── */
const VDK      = "#1E1B3A";
const VIO      = "#3A2FBF";
const VIO_LT   = "#EAE8FF";
const CORAL    = "#E8503A";
const CORAL_LT = "#FDECEA";
const N200     = "#EBEBEB";
const N400     = "#A89078";
const N500     = "#8A7260";
const SUCCESS  = "#2A9E5C";
const SUC_LT   = "#D1FAE5";
const AMBER_DK = "#B8911A";
const AMBER_LT = "#FEF6D6";
const CYAN_DK  = "#1A8FAD";
const CREAM    = "#FFFFFF";
const ACT_COLOR = CORAL;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

type Tab = "gaps" | "nextsteps" | "planning";

/* ── Fallback connected studies (pre-real-data) ─────────── */
const FALLBACK_CONNECTED_STUDIES = [
  { name: "Energy Drink Concept Test",  status: "Active",  statusColor: SUCCESS,  statusBg: SUC_LT   },
  { name: "Plant-Based Snack Range",    status: "Active",  statusColor: SUCCESS,  statusBg: SUC_LT   },
  { name: "Skincare Repositioning",     status: "Active",  statusColor: AMBER_DK, statusBg: AMBER_LT },
];

const CONSULT_OFFERS = [
  {
    id: "strategy",
    Icon: Brain,
    type: "Strategy",
    title: "Brand Positioning Strategy Session",
    desc: "Translate your research findings into a clear positioning platform and go-to-market narrative. Includes a written positioning brief and category landscape framing.",
    discount: "10% off",
    note: "Custom proposal sent offline",
  },
  {
    id: "design",
    Icon: Palette,
    type: "Design",
    title: "Creative Concepts & Design Sprint",
    desc: "Commission packaging, campaign creative, or brand identity concepts to run alongside your next study — designed before fielding so findings directly validate the work.",
    discount: "10% off",
    note: "Custom proposal sent offline",
  },
];

const PLANNING_GREETING = "Hi Jane. I've reviewed your 3 active studies. Ask me anything — or pick a prompt below to get started.";
const PLANNING_AI_RESPONSE = `Energy Drink — pre-launch research sequence

Based on your current data (72% intent, packaging as a top driver), here's what still needs validation before market:

1. Packaging Variants Test (1 Basic Credit)
Test 3–4 packaging options with the 25–34 urban cohort. Focus on "premium but accessible" perception. Your current concept sets this up well — the pack design needs to close it.

2. Price Sensitivity — Township (Sandbox, no credits)
Model R12, R14, and R16 price points before committing to a full SKU brief. Takes 30 minutes in Sandbox.

3. Channel Strategy Signal (optional, 1 Pro Credit)
If you're considering multiple channels (convenience, grocery, online), a channel-preference study will reduce launch risk significantly.

Want me to draft a brief for step 1 now?`;

export default function ActPage() {
  const [, setLocation]           = useLocation();
  const { user }                  = useAuth();
  const { theme }                 = usePortalTheme();
  const [activeTab, setActiveTab] = useState<Tab>("gaps");
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);
  const [planningInput, setPlanningInput] = useState("");
  const [offerState, setOfferState] = useState<Record<string, "idle" | "accepted" | "declined">>({ strategy: "idle", design: "idle" });

  /* ── Industry personalisation ── */
  const { industryGroups } = useIndustryGroups();
  const gaps          = useMemo(() => filterByIndustry(ALL_STRATEGIC_GAPS, industryGroups), [industryGroups]);
  const nextSteps     = useMemo(() => filterByIndustry(ALL_NEXT_STEPS,     industryGroups), [industryGroups]);
  const researchRecs  = useMemo(() => filterByIndustry(ALL_RESEARCH_RECS,  industryGroups), [industryGroups]);
  const planningPrompts = useMemo(
    () => filterByIndustry(ALL_PLANNING_PROMPTS, industryGroups).map(p => p.text),
    [industryGroups],
  );
  const coverageItems = useMemo(() => filterByIndustry(ALL_COVERAGE, industryGroups), [industryGroups]);

  /* ── Real study data ── */
  const { data: clientReports = [] } = useQuery<ClientReport[]>({
    queryKey: ["/api/member/client-reports"],
    enabled: !!user,
  });

  const liveStudies = useMemo(() => {
    const completed = clientReports.filter(r => r.status === "Completed");
    const inProgress = clientReports.filter(r => r.status !== "Completed");
    return [...inProgress, ...completed].slice(0, 5);
  }, [clientReports]);

  const connectedStudies = useMemo(() => {
    if (liveStudies.length === 0) return FALLBACK_CONNECTED_STUDIES;
    return liveStudies.map(r => {
      const isCompleted = r.status === "Completed";
      return {
        name: r.title,
        status: isCompleted ? "Complete" : "Active",
        statusColor: isCompleted ? SUCCESS : AMBER_DK,
        statusBg: isCompleted ? SUC_LT : AMBER_LT,
      };
    });
  }, [liveStudies]);

  const planningGreeting = useMemo(() => {
    const firstName = user?.name?.split(" ")[0] || "there";
    const count = clientReports.length;
    if (count === 0) return `Hi ${firstName}. No studies in your portfolio yet. Once you launch your first brief, I'll have data to work with. Ask me anything to get started.`;
    return `Hi ${firstName}. I've reviewed your ${count} ${count === 1 ? "study" : "studies"}. Ask me anything — or pick a prompt below to get started.`;
  }, [user, clientReports]);

  const [planningMsgs, setPlanningMsgs] = useState<{ role: "user" | "ai"; text: string }[]>(() => [
    { role: "ai", text: PLANNING_GREETING },
  ]);

  /* Update greeting when real data loads */
  useEffect(() => {
    if (clientReports.length > 0) {
      setPlanningMsgs(prev => {
        if (prev.length === 1 && prev[0].role === "ai") {
          return [{ role: "ai", text: planningGreeting }];
        }
        return prev;
      });
    }
  }, [planningGreeting, clientReports.length]);

  const handleSendPlanning = () => {
    const msg = planningInput.trim();
    if (!msg) return;
    setPlanningMsgs(prev => [
      ...prev,
      { role: "user", text: msg },
      { role: "ai", text: "I've reviewed your portfolio data and here's my recommendation based on your current studies and gaps. Would you like me to draft a brief for the highest-priority action now?" },
    ]);
    setPlanningInput("");
  };

  const handleCtaAction = (action: string | null) => {
    if (!action) return;
    if (action === "test")       setLocation("/portal/test");
    else if (action === "explore") setLocation("/portal/explore");
    else if (action === "nextsteps") setActiveTab("nextsteps");
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "gaps",      label: "Gaps" },
    { key: "nextsteps", label: "Next Steps" },
    { key: "planning",  label: "Planning Assistant" },
  ];

  return (
    <div className="portal-root flex h-screen overflow-hidden" data-portal-theme={theme} style={{ background: "var(--pt-canvas-bg)" }}>
      <MobilePortalNav />
      <div className="flex flex-col w-full h-full">

        {/* ── Phase topbar ── */}
        <PhaseTopbar
          currentPhase="act"
          description="Turn insights into strategy and execution plans"
        />

        {/* ── Main scrollable body ── */}
        <div className="flex-1 overflow-y-auto pb-20 sm:pb-0" style={{ background: "var(--pt-canvas-bg)" }}>

            {/* In-page header */}
            <div className="px-6 pt-6 pb-2">
              <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: N400 }}>
                03 · ACT
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: VDK }}>Where to move next</h2>
            </div>

            {/* In-page tabs — sticky */}
            <div className="sticky-tab-bar flex gap-0 px-6 border-b" style={{ borderColor: N200 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  data-testid={`tab-act-${t.key}`}
                  className="flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap"
                  style={{
                    color: activeTab === t.key ? VDK : N500,
                    borderBottomColor: activeTab === t.key ? ACT_COLOR : "transparent",
                    background: "transparent",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-6 pt-5 pb-2">

            {/* ── GAPS TAB ── */}
            {activeTab === "gaps" && (
              <div className="flex gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>Strategic Gaps</span>
                    <span className="text-sm" style={{ color: N500 }}>{gaps.length} identified</span>
                  </div>
                  <div style={{ ...CARD, overflow: "hidden", padding: 0, marginBottom: 20 }}>
                    {gaps.map((gap, i) => (
                      <div
                        key={gap.id}
                        className="flex items-start gap-3 px-5 py-4"
                        style={i < gaps.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}}
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
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: gap.chip.bg, color: gap.chip.color }}>
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
                    {coverageItems.map((item, i) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-3" style={i < coverageItems.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}}>
                        <span className="text-sm font-medium" style={{ color: VDK }}>{item.category}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: item.chip.bg, color: item.chip.color }}>
                          {item.chip.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps right panel: AI Query */}
                <div className="w-80 min-w-[300px] flex-shrink-0">
                  <div className="flex flex-col overflow-hidden rounded-2xl" style={{ border: `1px solid ${N200}`, height: 480 }}>
                    <AIQueryPanel
                      accentColor={ACT_COLOR}
                      label="Act AI"
                      suggestedPrompts={[
                        "What's the biggest strategic gap in my category?",
                        "Which pillar should I address first?",
                        "How do I close the commitment gap?",
                        "Find trends on indulgence and snacking",
                      ]}
                      defaultSource="combined"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── NEXT STEPS TAB ── */}
            {activeTab === "nextsteps" && (
              <div className="flex gap-5">

                {/* Left: step cards */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: CORAL }}>Next Moves</div>
                  <div className="space-y-3">
                    {nextSteps.filter(s => !s.locked).map((step) => (
                      <div
                        key={step.id}
                        className="rounded-xl px-5 py-4 relative"
                        style={{
                          background: "#fff",
                          border: `1px solid ${N200}`,
                          borderTop: step.cta?.primary ? `3px solid ${CORAL}` : `1px solid ${N200}`,
                          opacity: step.locked ? 0.55 : 1,
                        }}
                        data-testid={`next-step-${step.num}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 font-mono mt-0.5"
                            style={{ background: CORAL_LT, color: CORAL, border: `1.5px solid ${CORAL}` }}
                          >
                            {step.num}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{step.title}</div>
                            <p className="text-xs leading-relaxed mb-3" style={{ color: N500 }}>{step.desc}</p>
                            {step.cta && (
                              <button
                                onClick={() => handleCtaAction(step.cta!.action)}
                                className="text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
                                style={step.cta.primary
                                  ? { background: CORAL, color: "#fff" }
                                  : { background: "#F5F5F5", color: N500, border: `1px solid ${N200}` }
                                }
                                data-testid={`step-cta-${step.num}`}
                              >
                                {step.cta.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Locked steps */}
                    {nextSteps.filter(s => s.locked).map((step) => (
                      <div
                        key={step.id}
                        className="rounded-xl px-5 py-4 opacity-50"
                        style={{ background: "#fff", border: `1px solid ${N200}` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 font-mono mt-0.5" style={{ background: "#F0F0F0", color: N400, border: `1px solid ${N200}` }}>
                            {step.num}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{step.title}</div>
                            <p className="text-xs leading-relaxed mb-2" style={{ color: N500 }}>{step.desc}</p>
                            {(step as any).lockedReason && (
                              <div className="flex items-center gap-1.5 text-xs" style={{ color: N400 }}>
                                <Lock className="w-3 h-3" /> {(step as any).lockedReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Planning Assistant mini panel */}
                <div className="w-80 min-w-[300px] flex-shrink-0">
                  <div className="portal-card overflow-hidden">
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${N200}` }}>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: VIO }}>
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: VDK }}>Planning Assistant</div>
                          <div className="text-xs" style={{ color: N500 }}>Ask me how to sequence your next moves</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs leading-relaxed p-4 rounded-xl mb-3" style={{ background: "#F5F5F5", border: `1px solid ${N200}`, color: VDK }}>
                        I've sequenced your 4 next steps above in order of strategic momentum. Packaging variants should come first — concept scores are strong enough that the brand story is working. The Township SKU is your biggest volume unlock. Want me to help you draft a brief for any of these?
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={planningInput}
                          onChange={e => setPlanningInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { handleSendPlanning(); setActiveTab("planning"); } }}
                          className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }}
                          placeholder="e.g. Help me write a brief for the packaging…"
                          data-testid="input-planning-mini"
                          onFocus={e => (e.target.style.borderColor = VIO)}
                          onBlur={e => (e.target.style.borderColor = N200)}
                        />
                        <button
                          onClick={() => { handleSendPlanning(); setActiveTab("planning"); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: VIO }}
                          data-testid="button-send-planning-mini"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PLANNING ASSISTANT TAB ── */}
            {activeTab === "planning" && (
              <div className="flex gap-5">

                {/* Left: full chat panel */}
                <div className="flex-1 min-w-0">
                  <div style={{ ...CARD, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 540 }}>
                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: VIO }}>
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: VDK }}>Planning Assistant</div>
                          <div className="text-xs" style={{ color: N500 }}>3 active studies connected</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SUCCESS }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: SUCCESS }} />
                        3 studies active
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                      {planningMsgs.map((m, i) => (
                        <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                          {m.role === "user" ? (
                            <div
                              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm text-white"
                              style={{ background: VIO }}
                              data-testid={`planning-user-msg-${i}`}
                            >
                              {m.text}
                            </div>
                          ) : (
                            <div
                              className="max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                              style={{ background: "#F9F8FF", border: `1px solid ${N200}`, color: VDK, whiteSpace: "pre-line" }}
                              data-testid={`planning-ai-msg-${i}`}
                            >
                              {m.text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="px-5 py-4 flex gap-2 flex-shrink-0" style={{ borderTop: `1px solid ${N200}` }}>
                      <input
                        value={planningInput}
                        onChange={e => setPlanningInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSendPlanning()}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }}
                        placeholder="e.g. Help me write a brief for the packaging variants test"
                        data-testid="input-planning-assistant"
                        onFocus={e => (e.target.style.borderColor = VIO)}
                        onBlur={e => (e.target.style.borderColor = N200)}
                      />
                      <button
                        onClick={handleSendPlanning}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: VIO }}
                        data-testid="button-send-planning"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: full scrollable panel */}
                <div className="w-80 min-w-[300px] flex-shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>

                  {/* Suggested Prompts */}
                  <div className="portal-card p-5">
                    <div className="text-sm font-semibold mb-3" style={{ color: VDK }}>Suggested Planning Prompts</div>
                    <div className="space-y-2">
                      {planningPrompts.map(q => (
                        <button
                          key={q}
                          onClick={() => { setPlanningInput(q); }}
                          className="w-full text-left text-xs px-3 py-3 rounded-lg"
                          style={{ background: "#F9F8FF", border: `1px solid ${N200}`, color: VDK }}
                          data-testid={`prompt-${q.substring(0, 15)}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Connected Studies */}
                  <div className="portal-card p-5">
                    <div className="text-sm font-semibold mb-3" style={{ color: VDK }}>Connected Studies</div>
                    <div className="space-y-0">
                      {connectedStudies.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2.5"
                          style={{ borderBottom: i < connectedStudies.length - 1 ? `1px solid ${N200}` : "none" }}
                          data-testid={`connected-study-${i}`}
                        >
                          <span className="text-xs font-medium" style={{ color: VDK }}>{s.name}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-[10px]" style={{ color: s.statusColor, background: s.statusBg }}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Recommended Research ── */}
                  <div className="portal-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FlaskConical className="w-4 h-4" style={{ color: VIO }} />
                      <div className="text-sm font-semibold" style={{ color: VDK }}>Recommended Research</div>
                    </div>
                    <div className="space-y-3">
                      {researchRecs.map((rec, i) => (
                        <div key={rec.id} className="rounded-xl p-3" style={{ background: "#F5F5F5", border: `1px solid ${N200}` }} data-testid={`research-rec-${i}`}>
                          {/* Method + Priority row */}
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: rec.methodBg, color: rec.methodColor }}>
                              {rec.method}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: rec.priorityBg, color: rec.priorityColor }}>
                              {rec.priority}
                            </span>
                          </div>
                          {/* Title */}
                          <div className="text-xs font-semibold mb-1" style={{ color: VDK }}>{rec.title}</div>
                          {/* Research type tags */}
                          <div className="flex gap-1 flex-wrap mb-1.5">
                            {rec.types.map(t => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: VIO_LT, color: VIO }}>
                                {t}
                              </span>
                            ))}
                          </div>
                          {/* Description */}
                          <p className="text-[11px] leading-relaxed" style={{ color: N500 }}>{rec.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Tailored Consult Offer ── */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid #D4B896` }}>
                    {/* Offer header */}
                    <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #2A1F6B 0%, #3A2FBF 100%)" }}>
                      <Gift className="w-4 h-4 text-white opacity-80" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">Tailored Consult Offer</div>
                        <div className="text-[10px] opacity-70 text-white">Available for your portfolio</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(232,80,58,0.8)" }}>
                        10% off
                      </span>
                    </div>

                    {/* Offer body */}
                    <div className="bg-white p-4 space-y-3" data-testid="consult-offer">
                      <p className="text-xs leading-relaxed" style={{ color: N500 }}>
                        Based on your research portfolio, we can offer tailored consulting to convert your insights into strategic action and creative output. Accept any offer below — we'll build a custom proposal and send it separately.
                      </p>

                      {CONSULT_OFFERS.map(offer => {
                        const state = offerState[offer.id];
                        const { Icon } = offer;
                        return (
                          <div key={offer.id} className="rounded-xl p-4" style={{ background: "#F5F5F5", border: `1px solid ${N200}` }} data-testid={`consult-offer-${offer.id}`}>
                            <div className="flex items-start gap-2.5 mb-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: VIO }}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold" style={{ color: VDK }}>{offer.type}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: CORAL_LT, color: CORAL }}>10% off</span>
                                </div>
                                <div className="text-xs font-semibold mt-0.5" style={{ color: VDK }}>{offer.title}</div>
                              </div>
                            </div>
                            <p className="text-[11px] leading-relaxed mb-3" style={{ color: N500 }}>{offer.desc}</p>

                            {state === "accepted" ? (
                              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: SUC_LT }}>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: SUCCESS }} />
                                <div>
                                  <div className="text-xs font-semibold" style={{ color: SUCCESS }}>Offer accepted!</div>
                                  <div className="text-[10px]" style={{ color: SUCCESS }}>We'll send your custom proposal shortly.</div>
                                </div>
                              </div>
                            ) : state === "declined" ? (
                              <div className="text-[11px] text-center py-1" style={{ color: N500 }}>
                                Offer noted — you can revisit this anytime.
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setOfferState(prev => ({ ...prev, [offer.id]: "accepted" }))}
                                  className="flex-1 text-xs font-semibold py-2 rounded-lg text-white"
                                  style={{ background: VIO }}
                                  data-testid={`accept-offer-${offer.id}`}
                                >
                                  Accept Offer
                                </button>
                                <button
                                  onClick={() => setOfferState(prev => ({ ...prev, [offer.id]: "declined" }))}
                                  className="flex-1 text-xs font-semibold py-2 rounded-lg"
                                  style={{ background: "#F5F5F5", color: N500, border: `1px solid ${N200}` }}
                                  data-testid={`decline-offer-${offer.id}`}
                                >
                                  Not now
                                </button>
                              </div>
                            )}

                            <div className="text-[10px] text-center mt-2" style={{ color: N400 }}>
                              {offer.note}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Team Chat (bottom sticky only for non-planning tabs) */}
          {activeTab !== "planning" && (
            <div className="mx-6 mb-4 mt-2">
              <div className="portal-card overflow-hidden">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full px-4 py-2.5 flex items-center justify-between"
                  style={{ background: "#F5F5F5" }}
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
                  <div style={{ borderTop: `1px solid ${N200}`, background: "#fff" }}>
                    <div className="p-3 max-h-36 overflow-y-auto space-y-3">
                      <TCMsg initials="SW" author="Sarah W." time="11:02" color={VIO}   text="The township entry SKU is our biggest volume lever — should be number one priority." />
                      <TCMsg initials="JS" author="James S."  time="11:08" color={CORAL} text="Agreed. I've briefed the packaging concepts — we'll have options by Thursday." />
                      <TCMsg initials="TM" author="Thabo M."  time="11:14" color={SUCCESS} text={`@${user?.name?.split(" ")[0] || "You"} can you review the nootropic brief before we commission?`} />
                    </div>
                    <div className="px-3 pb-3 flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }} placeholder="Reply… use @ to tag" data-testid="input-team-chat" />
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: CORAL }} data-testid="button-send-chat"><Send className="w-3 h-3" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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
        <span className="text-xs font-semibold" style={{ color: VDK }}>{author}</span>
        <span className="text-[10px]" style={{ color: N500 }}>{time}</span>
      </div>
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#F5F5F5", border: "1px solid #EBEBEB", color: N500 }}>{text}</div>
    </div>
  );
}
