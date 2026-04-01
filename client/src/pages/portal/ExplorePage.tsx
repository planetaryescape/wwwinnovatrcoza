import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  X,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Send,
  ArrowRight,
  Lightbulb,
  ChevronDown,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import reportsData from "@/data/reports.json";

const EXPLORE_COLOR = "#2563EB";
const CORAL = "#C45A38";
const HEALTH_COLOR = "#7C3AED";
const TEST_COLOR = "#059669";
const AMBER = "#B45309";
const WARN = "#DC2626";

const SIGNALS = [
  {
    id: 1,
    tag: "Trend",
    tagBg: "#F5F3FF",
    tagColor: HEALTH_COLOR,
    title: "Nootropic beverages up +41% search intent",
    meta: "Urban 25–34 · Food & Bev · Detected overnight",
    chip: { label: "High", bg: "#FEF2F2", color: WARN },
  },
  {
    id: 2,
    tag: "Opportunity",
    tagBg: "#EFF6FF",
    tagColor: EXPLORE_COLOR,
    title: "Township segment at 52% intent — entry SKU gap",
    meta: "Energy Drink category · Township consumers",
    chip: { label: "Medium", bg: "#FFFBEB", color: AMBER },
  },
  {
    id: 3,
    tag: "Trend",
    tagBg: "#F5F3FF",
    tagColor: HEALTH_COLOR,
    title: "Sustainable packaging premium +18% WTP",
    meta: "Beauty & Personal Care · 25–44 urban",
    chip: { label: "Watch", bg: "#FFFBEB", color: AMBER },
  },
  {
    id: 4,
    tag: "New Report",
    tagBg: "#EFF6FF",
    tagColor: EXPLORE_COLOR,
    title: "Functional Beverages 2025 — full category audit",
    meta: "Innovatr Inside · GROWTH+ · 3 min read",
    chip: { label: "New", bg: "#EFF6FF", color: EXPLORE_COLOR },
  },
  {
    id: 5,
    tag: "Signal",
    tagBg: "#ECFDF5",
    tagColor: TEST_COLOR,
    title: "Plant-based protein growing in Gauteng convenience",
    meta: "FMCG · Convenience retail · Q1 2025",
    chip: { label: "Low", bg: "#ECFDF5", color: TEST_COLOR },
  },
  {
    id: 6,
    tag: "Signal",
    tagBg: "#ECFDF5",
    tagColor: TEST_COLOR,
    title: "Skincare ingredient transparency demand rising",
    meta: "Beauty · 30–45 urban female · Digital",
    chip: { label: "Watch", bg: "#FFFBEB", color: AMBER },
  },
];

const SANDBOX_ITEMS = [
  { label: "Energy Drink — R12 Entry SKU", intent: "52%", intentColor: AMBER },
  { label: "Nootropic Concept — Exec audience", intent: "71%", intentColor: TEST_COLOR },
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

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("signals");
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const { data: reports } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  const latestReports = (reports || (reportsData as any[]))
    .slice(0, 4)
    .map((r: any) => ({
      title: r.title,
      series: r.series || r.category || "",
      date: r.publishDate || r.date || "",
    }));

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
      { type: "user" as any, text: aiInput, author: user?.name },
      { type: "system", text: "I'm analysing that now. Based on your portfolio signals, here's what I see…", rec: "→ This is indicative — I'll update when I have more data." },
    ]);
    setAiInput("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-background">
      {/* Phase modal container */}
      <div className="flex flex-col w-full h-full">
        {/* Phase topbar */}
        <div
          className="h-13 bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex items-center justify-between flex-shrink-0"
          style={{ minHeight: "52px" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded"
              style={{ background: "#EFF6FF", color: EXPLORE_COLOR, border: `1px solid #BFDBFE` }}
            >
              PHASE 01
            </span>
            <h1 className="font-serif text-xl text-foreground">Explore</h1>
            <span className="text-sm text-muted-foreground ml-2 hidden sm:block">
              Discover trends, signals & market intelligence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setLocation("/portal/test")}
              style={{ background: EXPLORE_COLOR, borderColor: EXPLORE_COLOR, color: "#fff" }}
              data-testid="button-launch-brief"
              className="text-xs h-8"
            >
              Launch a Brief
            </Button>
            <button
              onClick={() => setLocation("/portal/dashboard")}
              className="w-8 h-8 bg-stone-100 dark:bg-sidebar border border-stone-200 dark:border-border rounded-full flex items-center justify-center text-sm text-muted-foreground hover:bg-stone-200 dark:hover:bg-sidebar-accent transition-colors"
              data-testid="button-close-explore"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div
          className="bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex gap-0 flex-shrink-0"
          style={{ "--phase-col": EXPLORE_COLOR } as any}
        >
          {(["signals", "sandbox", "intelligence"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-explore-${tab}`}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
              style={activeTab === tab ? { borderBottomColor: EXPLORE_COLOR, color: EXPLORE_COLOR } : { borderBottomColor: "transparent" }}
            >
              {tab === "signals" ? "Market Signals" : tab === "sandbox" ? "Sandbox" : "Intelligence Library"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "signals" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    12 Active Signals
                  </span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-foreground text-background text-xs font-medium rounded-md border border-transparent">All</button>
                    <button className="px-3 py-1 bg-white dark:bg-sidebar border border-stone-200 dark:border-border text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">Trends</button>
                    <button className="px-3 py-1 bg-white dark:bg-sidebar border border-stone-200 dark:border-border text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">Opportunities</button>
                    <button className="px-3 py-1 bg-white dark:bg-sidebar border border-stone-200 dark:border-border text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">Reports</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SIGNALS.map((signal) => (
                    <div
                      key={signal.id}
                      className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl p-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                      data-testid={`signal-card-${signal.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                          style={{ background: signal.tagBg, color: signal.tagColor }}
                        >
                          {signal.tag}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded"
                          style={{ background: signal.chip.bg, color: signal.chip.color }}
                        >
                          {signal.chip.label}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-foreground mb-1 leading-snug">{signal.title}</div>
                      <div className="text-xs text-muted-foreground">{signal.meta}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "sandbox" && (
              <div>
                <div className="mb-4">
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">Sandbox — Quick Intent Modelling</div>
                  <p className="text-sm text-muted-foreground">Model purchase intent before commissioning a full study. No credits required.</p>
                </div>

                <div className="flex gap-3 mb-5">
                  <input
                    className="flex-1 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-400"
                    placeholder="Describe your concept or product idea…"
                    data-testid="input-sandbox-concept"
                  />
                  <Button
                    style={{ background: EXPLORE_COLOR, borderColor: EXPLORE_COLOR, color: "#fff" }}
                    className="h-10"
                    data-testid="button-run-sandbox"
                  >
                    Run Model
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-2 mb-6">
                  {SANDBOX_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-colors"
                      data-testid={`sandbox-item-${i}`}
                    >
                      <span className="text-sm text-foreground">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono" style={{ color: item.intentColor }}>
                          {item.intent}
                        </span>
                        <span className="text-xs text-muted-foreground">intent</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl p-4"
                  style={{ background: "#EFF6FF", border: `1px solid #BFDBFE` }}
                >
                  <div className="text-sm font-semibold mb-1" style={{ color: EXPLORE_COLOR }}>
                    When to move from Sandbox to Test
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If Sandbox intent is above 55%, it's worth commissioning a Test24 Brief to validate with real SA consumers. Below 55%, refine your concept first.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setLocation("/portal/launch")}
                    style={{ background: EXPLORE_COLOR, borderColor: EXPLORE_COLOR, color: "#fff" }}
                    data-testid="button-launch-from-sandbox"
                  >
                    Launch a Brief →
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "intelligence" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    Intelligence Library
                  </span>
                  <button
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: EXPLORE_COLOR }}
                    onClick={() => setLocation("/portal/trends")}
                  >
                    Browse all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {latestReports.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setLocation("/portal/trends")}
                      data-testid={`report-card-${i}`}
                    >
                      <div className="text-sm font-semibold text-foreground mb-1">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.series}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="w-80 min-w-[320px] border-l border-stone-100 dark:border-border flex flex-col bg-white dark:bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-border flex-shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px]" style={{ background: EXPLORE_COLOR }}>
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
                Explore AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: EXPLORE_COLOR }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                12 live signals
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`${(msg as any).type === "user" ? "ml-4" : ""}`}>
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                    {(msg as any).type === "system" ? (
                      <>
                        <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px]" style={{ background: EXPLORE_COLOR }}>
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        Explore AI
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
                    className={`text-xs leading-relaxed p-3 rounded-lg border ${
                      (msg as any).type === "user"
                        ? "bg-stone-50 dark:bg-sidebar border-stone-100 dark:border-border rounded-tr-none"
                        : "bg-white dark:bg-card border-stone-100 dark:border-border rounded-tl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {(msg as any).rec && (
                      <div
                        className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r"
                        style={{
                          background: "#EFF6FF",
                          borderLeft: `2px solid ${EXPLORE_COLOR}`,
                          color: EXPLORE_COLOR,
                        }}
                      >
                        {(msg as any).rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex gap-1.5 px-3 py-2 border-t border-stone-100 dark:border-border flex-wrap"
              style={{ background: "#F9FAFB" }}
            >
              {AI_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAiInput(p)}
                  className="text-[11px] px-2.5 py-1 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-full text-muted-foreground hover:text-foreground hover:bg-stone-50 transition-colors whitespace-nowrap"
                  data-testid={`ai-prompt-${p.substring(0, 20)}`}
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
                className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Ask about signals or trends…"
                data-testid="input-ai-message"
              />
              <button
                onClick={handleSendAI}
                className="w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0"
                style={{ background: EXPLORE_COLOR }}
                data-testid="button-send-ai"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Team chat toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 border-t border-stone-100 dark:border-border flex items-center justify-between bg-stone-50 dark:bg-sidebar hover:bg-stone-100 dark:hover:bg-sidebar-accent transition-colors flex-shrink-0"
              data-testid="button-toggle-team-chat"
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
                <div className="p-3 max-h-40 overflow-y-auto space-y-3">
                  <TeamChatMessage
                    initials="SW"
                    author="Sarah W."
                    time="10:34"
                    color={HEALTH_COLOR}
                    text="These nootropic signals are interesting — should we brief a sandbox run?"
                  />
                  <TeamChatMessage
                    initials="JS"
                    author="James S."
                    time="10:41"
                    color={EXPLORE_COLOR}
                    text={`@${user?.name?.split(" ")[0] || "You"} — let's validate the township SKU gap first, higher priority.`}
                  />
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Reply… use @ to tag"
                    data-testid="input-team-chat"
                  />
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: EXPLORE_COLOR }}
                    data-testid="button-send-chat"
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

function TeamChatMessage({ initials, author, time, color, text }: {
  initials: string;
  author: string;
  time: string;
  color: string;
  text: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0" style={{ background: color }}>
          {initials}
        </div>
        <span className="text-xs font-semibold text-foreground">{author}</span>
        <span className="text-[10px] text-muted-foreground">{time}</span>
      </div>
      <div className="ml-6 bg-stone-50 dark:bg-sidebar border border-stone-100 dark:border-border rounded rounded-tl-none px-3 py-2 text-xs text-muted-foreground leading-snug">
        {text}
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
