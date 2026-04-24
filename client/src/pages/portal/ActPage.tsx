import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import {
  MessageSquare, ChevronDown, ArrowRight, Lock, Send,
  FlaskConical, Layers, Lightbulb, CheckCircle2, Gift, Brain, Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AIQueryPanel from "@/components/portal/AIQueryPanel";
import { PortalTabs } from "@/components/portal/PortalTabs";
import { PortalBreadcrumbs } from "@/components/portal/PortalBreadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Study } from "@shared/schema";
import { usePortalFeed } from "@/lib/portal-feed";
import PortalLayout from "./PortalLayout";

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
const ACT_COLOR = CORAL;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const ACT_TAB_VALUES = ["gaps", "nextsteps", "planning"] as const;
type Tab = typeof ACT_TAB_VALUES[number];
const ACT_TABS: { value: Tab; label: string; testId: string }[] = [
  { value: "gaps", label: "Gaps", testId: "tab-act-gaps" },
  { value: "nextsteps", label: "Next Steps", testId: "tab-act-nextsteps" },
  { value: "planning", label: "Planning Assistant", testId: "tab-act-planning" },
];

const PLANNING_GREETING = "Loading your portfolio context…";

const LIVE_STUDY_STATUSES = new Set(["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA"]);

function formatStudyStatus(status: string) {
  return LIVE_STUDY_STATUSES.has(status) ? "Active" : "Complete";
}

function offerMeta(serviceType: string) {
  switch (serviceType) {
    case "strategy":
      return { Icon: Brain, label: "Strategy" };
    case "creative":
      return { Icon: Palette, label: "Creative" };
    case "pricing":
      return { Icon: Layers, label: "Pricing" };
    default:
      return { Icon: Lightbulb, label: "Consult" };
  }
}

function buildPlanningReply(
  studies: Study[],
  gaps: { title: string; desc: string }[],
  nextSteps: { title: string; desc: string }[],
) {
  const lines: string[] = [];
  const liveStudies = studies.filter((study) => LIVE_STUDY_STATUSES.has(study.status));

  if (nextSteps.length > 0) {
    lines.push("Based on the studies and recommendations already in your portfolio, here is the best sequence right now:");
    lines.push("");
    nextSteps.slice(0, 3).forEach((step, index) => {
      lines.push(`${index + 1}. ${step.title}`);
      lines.push(step.desc);
      lines.push("");
    });
  } else if (gaps.length > 0) {
    lines.push("There is not a full next-step sequence yet, but the clearest gap to act on is:");
    lines.push("");
    lines.push(`1. ${gaps[0].title}`);
    lines.push(gaps[0].desc);
    lines.push("");
  } else if (liveStudies.length > 0) {
    lines.push("You have live work in field, so the right move is to stay disciplined until results land:");
    lines.push("");
    liveStudies.slice(0, 2).forEach((study, index) => {
      lines.push(`${index + 1}. Monitor ${study.title}`);
      lines.push(`Status: ${formatStudyStatus(study.status)}. Hold downstream decisions until this evidence is back in the system.`);
      lines.push("");
    });
  } else {
    lines.push("There is not enough persisted portfolio evidence yet to sequence a precise recommendation.");
    lines.push("");
    lines.push("Start with one live study or upload one completed project so the planning assistant has something real to work with.");
    lines.push("");
  }

  if (gaps[0]) {
    lines.push(`Priority gap: ${gaps[0].title}`);
    lines.push("");
  }

  lines.push("Want me to turn the highest-priority move into a brief?");
  return lines.join("\n").trim();
}

export default function ActPage() {
  const [, setLocation]           = useLocation();
  const isMobile = useIsMobile();
  const { user }                  = useAuth();
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(ACT_TAB_VALUES).withDefault("gaps"),
  );
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);
  const [planningInput, setPlanningInput] = useState("");
  const [offerState, setOfferState] = useState<Record<string, "idle" | "accepted" | "declined">>({});
  const { data: portalFeed } = usePortalFeed(!!user);
  const gaps = portalFeed?.gaps ?? [];
  const nextSteps = portalFeed?.nextSteps ?? [];
  const planningPrompts = portalFeed?.planningPrompts ?? [];
  const coverageItems = portalFeed?.coverage ?? [];
  const consultOffers = portalFeed?.consultOffers ?? [];

  /* ── Real study data ── */
  const { data: studies = [] } = useQuery<Study[]>({
    queryKey: ["/api/member/studies", user?.companyId],
    queryFn: async () => {
      const response = await fetch("/api/member/studies");
      if (!response.ok) throw new Error("Failed to fetch studies");
      return response.json();
    },
    enabled: !!user,
  });

  const connectedStudies = useMemo(
    () => [...studies]
      .sort((a, b) => {
        const aIsLive = LIVE_STUDY_STATUSES.has(a.status);
        const bIsLive = LIVE_STUDY_STATUSES.has(b.status);
        if (aIsLive !== bIsLive) return aIsLive ? -1 : 1;

        const aDate = new Date(a.statusUpdatedAt ?? a.deliveryDate ?? a.createdAt).getTime();
        const bDate = new Date(b.statusUpdatedAt ?? b.deliveryDate ?? b.createdAt).getTime();
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((study) => {
        const isLive = LIVE_STUDY_STATUSES.has(study.status);
        return {
          name: study.title,
          status: formatStudyStatus(study.status),
          statusColor: isLive ? AMBER_DK : SUCCESS,
          statusBg: isLive ? AMBER_LT : SUC_LT,
        };
      }),
    [studies],
  );
  const activeStudyCount = useMemo(
    () => studies.filter((study) => LIVE_STUDY_STATUSES.has(study.status)).length,
    [studies],
  );
  const connectedStudyCount = studies.length;
  const availableNextStepCount = nextSteps.filter((step) => !step.locked).length;

  const planningGreeting = useMemo(() => {
    const firstName = user?.name?.split(" ")[0] || "there";
    const count = studies.length;
    if (count === 0) return `Hi ${firstName}. No studies in your portfolio yet. Once you launch your first brief, I'll have data to work with. Ask me anything to get started.`;
    return `Hi ${firstName}. I've reviewed your ${count} ${count === 1 ? "study" : "studies"}. Ask me anything — or pick a prompt below to get started.`;
  }, [studies, user]);

  const [planningMsgs, setPlanningMsgs] = useState<{ role: "user" | "ai"; text: string }[]>(() => [
    { role: "ai", text: PLANNING_GREETING },
  ]);

  /* Update greeting when real data loads */
  useEffect(() => {
    setPlanningMsgs(prev => {
      if (prev.length === 1 && prev[0].role === "ai") {
        return [{ role: "ai", text: planningGreeting }];
      }
      return prev;
    });
  }, [planningGreeting]);

  const handleSendPlanning = () => {
    const msg = planningInput.trim();
    if (!msg) return;
    setPlanningMsgs(prev => [
      ...prev,
      { role: "user", text: msg },
      { role: "ai", text: buildPlanningReply(studies, gaps, nextSteps) },
    ]);
    setPlanningInput("");
  };

  const handleCtaAction = (action: string | null, href?: string | null) => {
    if (href) {
      setLocation(href);
      return;
    }
    if (!action) return;
    if (action === "test")       setLocation("/portal/test");
    else if (action === "launch") setLocation("/portal/launch");
    else if (action === "evidence") return;
    else if (action === "explore") setLocation("/portal/explore");
    else if (action === "nextsteps") void setActiveTab("nextsteps");
  };

  return (
    <PortalLayout>
      <div className="portal-workspace">
            {/* In-page header */}
            <div className="portal-page-header">
              <PortalBreadcrumbs items={[{ label: "Dashboard", href: "/portal/dashboard" }, { label: "Act" }]} />
              <h1 className="font-serif text-3xl leading-tight" style={{ color: VDK }}>What should we do next?</h1>
              <p className="mt-2 max-w-none text-sm leading-relaxed" style={{ color: N500 }}>
                Use Act after evidence exists, when you need gaps, recommendations, and planning prompts for the next move.
              </p>
            </div>

            <PortalTabs value={activeTab} onValueChange={(tab) => void setActiveTab(tab)} tabs={ACT_TABS} accentColor={ACT_COLOR}>

            <div className="portal-body">
              <div className="portal-main-scroll">

            {/* ── GAPS TAB ── */}
            {activeTab === "gaps" && (
              <div className="flex flex-col lg:flex-row gap-5">
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
                          {gap.cta && (gap.ctaAction !== "evidence" || gap.ctaHref) && (
                            <button onClick={() => handleCtaAction(gap.ctaAction, gap.ctaHref)} className="text-xs font-semibold flex items-center gap-1" style={{ color: ACT_COLOR }}>
                              {gap.cta} <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: CORAL }}>Research Coverage</div>
                  <div style={{ ...CARD, overflow: "hidden", padding: 0 }}>
                    {coverageItems.length === 0 ? (
                      <div className="px-5 py-4 text-xs" style={{ color: N500 }}>
                        No persisted portfolio coverage yet.
                      </div>
                    ) : coverageItems.map((item, i) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-3" style={i < coverageItems.length - 1 ? { borderBottom: `1px solid ${N200}` } : {}}>
                        <span className="text-sm font-medium" style={{ color: VDK }}>{item.category}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: item.chip.bg, color: item.chip.color }}>
                          {item.chip.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── NEXT STEPS TAB ── */}
            {activeTab === "nextsteps" && (
              <div className="flex flex-col lg:flex-row gap-5">

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
                            {step.cta && (step.cta.action !== "evidence" || step.cta.href) && (
                              <button
                                onClick={() => handleCtaAction(step.cta!.action, step.cta!.href)}
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

                {/* Right: Planning Assistant mini panel — hidden on mobile */}
                {!isMobile && (
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
                        I've sequenced your {availableNextStepCount} current next {availableNextStepCount === 1 ? "step" : "steps"} based on the studies and reports already in the system. Want me to help you draft a brief for the highest-priority one?
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={planningInput}
                          onChange={e => setPlanningInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { handleSendPlanning(); void setActiveTab("planning"); } }}
                          className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none"
                          style={{ background: "#F5F5F5", border: `1.5px solid ${N200}`, color: VDK }}
                          placeholder="e.g. Help me write a brief for the packaging…"
                          data-testid="input-planning-mini"
                          onFocus={e => (e.target.style.borderColor = VIO)}
                          onBlur={e => (e.target.style.borderColor = N200)}
                        />
                        <button
                          onClick={() => { handleSendPlanning(); void setActiveTab("planning"); }}
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
                )}
              </div>
            )}

            {/* ── PLANNING ASSISTANT TAB ── */}
            {activeTab === "planning" && (
              <div className="flex flex-col lg:flex-row gap-5">

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
                          <div className="text-xs" style={{ color: N500 }}>
                            {connectedStudyCount} {connectedStudyCount === 1 ? "study" : "studies"} connected
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: SUCCESS }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: SUCCESS }} />
                        {activeStudyCount} {activeStudyCount === 1 ? "study" : "studies"} active
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

                {/* Right: full scrollable panel — hidden on mobile */}
                {!isMobile && (
                <div className="w-80 min-w-[300px] flex-shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>

                  {/* Suggested Prompts */}
                  <div className="portal-card p-5">
                    <div className="text-sm font-semibold mb-3" style={{ color: VDK }}>Suggested Planning Prompts</div>
                    <div className="space-y-2">
                      {planningPrompts.length === 0 ? (
                        <div className="rounded-xl px-3 py-3 text-xs" style={{ background: "#F5F5F5", border: `1px solid ${N200}`, color: N500 }}>
                          Add studies or ingested projects to generate real planning prompts.
                        </div>
                      ) : planningPrompts.map(q => (
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
                    {connectedStudies.length === 0 ? (
                      <div className="text-xs" style={{ color: N500 }}>
                        No studies connected yet.
                      </div>
                    ) : (
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
                    )}
                  </div>

                  {/* ── Recommended Research ── */}
                  <div className="portal-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FlaskConical className="w-4 h-4" style={{ color: VIO }} />
                      <div className="text-sm font-semibold" style={{ color: VDK }}>Recommended Research</div>
                    </div>
                    <div className="space-y-3">
                      {nextSteps.length === 0 ? (
                        <div className="rounded-xl p-3 text-[11px]" style={{ background: "#F5F5F5", border: `1px solid ${N200}`, color: N500 }}>
                          No persisted research recommendations yet. Once a project has an ingest, the next-step playbook will show here.
                        </div>
                      ) : nextSteps.map((step, i) => (
                        <div key={step.id} className="rounded-xl p-3" style={{ background: "#F5F5F5", border: `1px solid ${N200}` }} data-testid={`research-rec-${i}`}>
                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: VIO_LT, color: VIO }}>
                              {step.cta?.action === "explore" ? "Explore" : "Test24"}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: step.cta?.primary ? CORAL_LT : SUC_LT, color: step.cta?.primary ? CORAL : SUCCESS }}>
                              {step.cta?.primary ? "Primary" : "Queued"}
                            </span>
                          </div>
                          <div className="text-xs font-semibold mb-1" style={{ color: VDK }}>{step.title}</div>
                          <p className="text-[11px] leading-relaxed mb-2" style={{ color: N500 }}>{step.desc}</p>
                          {step.cta && (step.cta.action !== "evidence" || step.cta.href) && (
                            <button
                              onClick={() => handleCtaAction(step.cta!.action, step.cta!.href)}
                              className="text-[11px] font-semibold flex items-center gap-1"
                              style={{ color: step.cta.primary ? CORAL : VIO }}
                            >
                              {step.cta.label} <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
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
                      {consultOffers[0] && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(232,80,58,0.8)" }}>
                          {consultOffers[0].badgeLabel}
                        </span>
                      )}
                    </div>

                    {/* Offer body */}
                    <div className="bg-white p-4 space-y-3" data-testid="consult-offer">
                      <p className="text-xs leading-relaxed" style={{ color: N500 }}>
                        These offers are matched against the studies, gaps, and next steps already in your portfolio. Accept any offer below and the team can turn it into a scoped proposal.
                      </p>

                      {consultOffers.length === 0 ? (
                        <div className="rounded-xl p-4 text-[11px]" style={{ background: "#F5F5F5", border: `1px solid ${N200}`, color: N500 }}>
                          No portfolio-matched consult offers yet. Once more project evidence is in the system, relevant offers will show here automatically.
                        </div>
                      ) : consultOffers.map(offer => {
                        const state = offerState[offer.id];
                        const { Icon, label } = offerMeta(offer.serviceType);
                        return (
                          <div key={offer.id} className="rounded-xl p-4" style={{ background: "#F5F5F5", border: `1px solid ${N200}` }} data-testid={`consult-offer-${offer.id}`}>
                            <div className="flex items-start gap-2.5 mb-2">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: VIO }}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold" style={{ color: VDK }}>{label}</span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: CORAL_LT, color: CORAL }}>{offer.badgeLabel}</span>
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

                            {offer.note && (
                              <div className="text-[10px] text-center mt-2" style={{ color: N400 }}>
                                {offer.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
                )}
              </div>
            )}

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
              {!isMobile && activeTab === "gaps" && (
                <div className="portal-ai-rail">
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
              )}
            </div>
            </PortalTabs>
      </div>
    </PortalLayout>
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
