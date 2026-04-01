import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Send, MessageSquare, ChevronDown, Download, ExternalLink, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const TEST_COLOR = "#059669";
const CORAL = "#C45A38";
const EXPLORE_COLOR = "#2563EB";
const HEALTH_COLOR = "#7C3AED";
const AMBER = "#B45309";
const WARN = "#DC2626";

type Tab = "brief" | "studies" | "assistant";

const STUDY_TYPE_CARDS = [
  {
    name: "Test24 Basic",
    desc: "100 consumers · 5 min · 24hr turnaround · 1 Basic credit",
    price: "R5,000",
    id: "basic",
  },
  {
    name: "Test24 Pro",
    desc: "100+ consumers · 10–15 min · 24hr · AI Qual included",
    price: "From R45,000",
    id: "pro",
  },
];

const AI_MESSAGES = [
  {
    type: "system",
    text: "Project Aurum — Key Finding: The commitment gap (Interest 67% → Commit 54%) is the critical issue. A 43-point drop — among the widest in your library.",
    rec: "→ Investigate price anchoring. The gap closes when price message is explicit.",
  },
];

const AI_PROMPTS = [
  "What drove the commitment gap?",
  "Compare energy drink vs plant snacks",
  "Generate a slide deck summary",
  "Build me a brief for next steps",
];

export default function TestPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("studies");
  const [selectedStudyType, setSelectedStudyType] = useState<string>("basic");
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const { data: clientReports, isLoading: isLoadingReports } = useQuery<any[]>({
    queryKey: ["/api/member/reports", user?.companyId],
    queryFn: async () => {
      const url = user?.companyId
        ? `/api/member/reports?companyId=${user.companyId}`
        : `/api/member/reports`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: userActivity } = useQuery<{
    basicCreditsRemaining: number;
    proCreditsRemaining: number;
  }>({
    queryKey: ["/api/member/activity", user?.id],
    enabled: !!user,
  });

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
      {
        type: "system",
        text: "Based on your study portfolio, here's what I can see from that angle…",
        rec: "→ I'll need more study data to give a definitive answer, but this direction looks strong.",
      },
    ]);
    setAiInput("");
  };

  const getMetricColor = (val: number | null) => {
    if (!val) return "text-muted-foreground";
    if (val >= 75) return "#059669";
    if (val >= 55) return "#B45309";
    return "#DC2626";
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const getStudyTypeBadge = (type: string | null) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO", bg: "#F3E8FF", color: "#7E22CE" };
    return { label: "BASIC", bg: "#E0F2FE", color: "#0369A1" };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-background">
      <div className="flex flex-col w-full h-full">
        {/* Phase topbar */}
        <div className="bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex items-center justify-between flex-shrink-0" style={{ minHeight: "52px" }}>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded"
              style={{ background: "#ECFDF5", color: TEST_COLOR, border: `1px solid #A7F3D0` }}
            >
              PHASE 02
            </span>
            <h1 className="font-serif text-xl text-foreground">Test</h1>
            <span className="text-sm text-muted-foreground ml-2 hidden sm:block">
              Put your ideas in front of real consumers.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setActiveTab("brief")}
              style={{ background: TEST_COLOR, borderColor: TEST_COLOR, color: "#fff" }}
              data-testid="button-launch-brief"
              className="text-xs h-8"
            >
              Launch a Brief
            </Button>
            <button
              onClick={() => setLocation("/portal/dashboard")}
              className="w-8 h-8 bg-stone-100 dark:bg-sidebar border border-stone-200 dark:border-border rounded-full flex items-center justify-center text-sm text-muted-foreground hover:bg-stone-200 transition-colors"
              data-testid="button-close-test"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="bg-white dark:bg-card border-b border-stone-100 dark:border-border px-5 flex gap-0 flex-shrink-0">
          {(["brief", "studies", "assistant"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-test-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={
                activeTab === tab
                  ? { borderBottomColor: TEST_COLOR, color: TEST_COLOR }
                  : { borderBottomColor: "transparent", color: "hsl(var(--muted-foreground))" }
              }
            >
              {tab === "brief" ? "Launch a Brief" : tab === "studies" ? "Studies" : "Research Assistant"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "brief" && (
              <div className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm max-w-2xl">
                <div className="px-5 py-4 border-b border-stone-100 dark:border-border bg-stone-50 dark:bg-sidebar flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-foreground">AI Briefing Assistant</div>
                    <div className="text-xs text-muted-foreground">Answer a few questions and we'll build your complete Upsiide survey brief automatically</div>
                  </div>
                </div>

                <div className="flex border-b border-stone-100 dark:border-border overflow-x-auto px-5">
                  {["1 Objectives", "2 Audience", "3 Concepts", "4 Billing", "5 Review"].map((step, i) => (
                    <div
                      key={step}
                      className="px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors"
                      style={i === 0 ? { borderBottomColor: TEST_COLOR, color: TEST_COLOR } : { borderBottomColor: "transparent", color: "hsl(var(--muted-foreground))" }}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-sm font-semibold text-foreground">1 Research Objectives</div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                      Brief / Project Name <span style={{ color: CORAL }}>*</span>
                    </label>
                    <input
                      className="w-full bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-400 placeholder:text-muted-foreground"
                      placeholder="e.g. Energy Drink Concept Test Q2 2026"
                      data-testid="input-brief-name"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                      Research Objective <span style={{ color: CORAL }}>*</span>
                    </label>
                    <textarea
                      className="w-full bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-400 placeholder:text-muted-foreground resize-none"
                      rows={3}
                      placeholder="Be as specific as possible. This drives the entire survey structure."
                      data-testid="input-brief-objective"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Study Type <span style={{ color: CORAL }}>*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {STUDY_TYPE_CARDS.map((card) => (
                        <button
                          key={card.id}
                          onClick={() => setSelectedStudyType(card.id)}
                          data-testid={`study-type-${card.id}`}
                          className="border-2 rounded-xl p-4 text-left transition-all"
                          style={
                            selectedStudyType === card.id
                              ? { borderColor: TEST_COLOR, background: "#ECFDF5" }
                              : { borderColor: "#E2DDD6", background: "white" }
                          }
                        >
                          <div className="text-sm font-semibold text-foreground mb-1">{card.name}</div>
                          <div className="text-xs text-muted-foreground mb-2 leading-relaxed">{card.desc}</div>
                          <div className="text-sm font-bold" style={{ color: TEST_COLOR }}>{card.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-stone-100 dark:border-border mt-2">
                    <Button variant="outline" size="sm" className="text-xs" data-testid="button-brief-back">
                      ← Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setLocation("/portal/launch")}
                      style={{ background: TEST_COLOR, borderColor: TEST_COLOR, color: "#fff" }}
                      className="text-xs"
                      data-testid="button-brief-next"
                    >
                      Continue in full form →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "studies" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                    {isLoadingReports ? "Loading…" : `${clientReports?.length ?? 0} Studies`}
                  </span>
                  <div className="flex gap-2">
                    <select
                      className="bg-white dark:bg-card border border-stone-200 dark:border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
                      data-testid="filter-study-type"
                    >
                      <option>All Types</option>
                      <option>Test24 Basic</option>
                      <option>Test24 Pro</option>
                    </select>
                    <select
                      className="bg-white dark:bg-card border border-stone-200 dark:border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
                      data-testid="filter-study-status"
                    >
                      <option>All Statuses</option>
                      <option>Completed</option>
                      <option>In Progress</option>
                    </select>
                  </div>
                </div>

                {isLoadingReports ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white dark:bg-card rounded-xl border border-stone-100 dark:border-border p-4">
                        <Skeleton className="h-5 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    ))}
                  </div>
                ) : clientReports && clientReports.length > 0 ? (
                  <div className="space-y-3">
                    {clientReports.map((study: any) => {
                      const typeBadge = getStudyTypeBadge(study.studyType);
                      const metrics = [
                        { label: "Idea", val: study.topIdeaIdeaScore },
                        { label: "Interest", val: study.topIdeaInterest },
                        { label: "Commit", val: study.topIdeaCommitment },
                        { label: "Meaning", val: study.topIdeaMeaning },
                        { label: "Diff", val: study.topIdeaDifference },
                        { label: "Worth", val: study.topIdeaWorth },
                      ].filter((m) => m.val !== null && m.val !== undefined);

                      return (
                        <div
                          key={study.id}
                          className="bg-white dark:bg-card border border-stone-100 dark:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          data-testid={`study-card-${study.id}`}
                        >
                          <div className="px-5 py-4 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="text-base font-semibold text-foreground mb-1">{study.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {[study.companyName, study.industry, study.uploadedAt ? formatDate(study.uploadedAt) : ""].filter(Boolean).join(" · ")}
                              </div>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider" style={{ background: typeBadge.bg, color: typeBadge.color }}>
                                {typeBadge.label}
                              </span>
                              {study.status && (
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={
                                    study.status?.toLowerCase().includes("complete")
                                      ? { background: "#ECFDF5", color: TEST_COLOR }
                                      : { background: "#FFFBEB", color: AMBER }
                                  }
                                >
                                  {study.status?.toLowerCase().includes("complete") ? "Completed" : study.status}
                                </span>
                              )}
                            </div>
                          </div>

                          {metrics.length > 0 && (
                            <div className="px-5 pb-3 grid grid-cols-6 gap-1 border-b border-stone-50 dark:border-border">
                              {metrics.map((m) => (
                                <div key={m.label} className="text-center bg-stone-50 dark:bg-sidebar rounded py-2">
                                  <div className="text-base font-bold font-mono" style={{ color: getMetricColor(m.val) }}>
                                    {m.val}%
                                  </div>
                                  <div className="text-[9px] text-muted-foreground mt-0.5">{m.label}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="px-5 py-3 flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setLocation("/portal/act")}
                              style={{ background: CORAL, borderColor: CORAL, color: "#fff" }}
                              className="text-xs h-8"
                              data-testid={`button-act-${study.id}`}
                            >
                              Analyse in Act
                            </Button>
                            {study.pdfUrl && (
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => window.open(study.pdfUrl, "_blank")}>
                                <Download className="w-3 h-3 mr-1" />
                                Download PDF
                              </Button>
                            )}
                            {study.dashboardUrl && (
                              <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => window.open(study.dashboardUrl, "_blank")}>
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Dashboard
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card rounded-xl border border-stone-100 dark:border-border p-10 text-center">
                    <div className="text-muted-foreground mb-3">
                      <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium text-foreground mb-1">No studies yet</p>
                      <p className="text-xs text-muted-foreground">Launch your first brief to start collecting consumer insights.</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab("brief")}
                      style={{ background: TEST_COLOR, borderColor: TEST_COLOR, color: "#fff" }}
                      size="sm"
                      className="mt-4 text-xs"
                      data-testid="button-start-brief"
                    >
                      Launch a Brief
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "assistant" && (
              <div className="max-w-2xl">
                <div className="rounded-xl p-4 mb-4" style={{ background: "#ECFDF5", border: `1px solid #A7F3D0` }}>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Key Takeout:</strong> Urban Males 25–34 at 84% purchase intent are your primary launch cohort. Lead with dual-claim messaging in the R18–25 price band.
                    <br /><br />
                    <strong className="text-foreground">Watch Signal:</strong> Township segment at 52% intent — a R12–15 entry SKU could unlock significant volume.
                    <br /><br />
                    <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: "#EFF6FF", borderLeft: `2px solid ${EXPLORE_COLOR}`, color: EXPLORE_COLOR }}>
                      → Concept is launch-ready for urban 25–34. Prioritise packaging variants testing before rollout.
                    </div>
                  </div>
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
                    className="flex-1 bg-white dark:bg-card border border-stone-200 dark:border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400"
                    placeholder="Ask about your studies…"
                    data-testid="input-assistant-message"
                  />
                  <button
                    onClick={handleSendAI}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ background: TEST_COLOR }}
                    data-testid="button-send-assistant"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Research AI */}
          <div className="w-80 min-w-[320px] border-l border-stone-100 dark:border-border flex flex-col bg-white dark:bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 dark:border-border flex-shrink-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px]" style={{ background: TEST_COLOR }}>
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
                Research AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1" style={{ color: TEST_COLOR }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Active study insights
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={(msg as any).type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                    {(msg as any).type === "system" ? (
                      <>
                        <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px]" style={{ background: TEST_COLOR }}>
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                        Research AI
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
                        style={{ background: "#ECFDF5", borderLeft: `2px solid ${TEST_COLOR}`, color: TEST_COLOR }}
                      >
                        {(msg as any).rec}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-stone-100 dark:border-border flex gap-2 flex-shrink-0">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAI()}
                className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400 resize-none"
                placeholder="Ask about results…"
                data-testid="input-research-ai"
              />
              <button
                onClick={handleSendAI}
                className="w-8 h-8 rounded-md flex items-center justify-center text-white flex-shrink-0"
                style={{ background: TEST_COLOR }}
                data-testid="button-send-research-ai"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2.5 border-t border-stone-100 dark:border-border flex items-center justify-between bg-stone-50 dark:bg-sidebar hover:bg-stone-100 transition-colors flex-shrink-0"
              data-testid="button-toggle-team-chat"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                Team Chat
                <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>
                  1
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
                      <span className="text-[10px] text-muted-foreground">11:02</span>
                    </div>
                    <div className="ml-6 bg-stone-50 dark:bg-sidebar border border-stone-100 dark:border-border rounded rounded-tl-none px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold" style={{ color: EXPLORE_COLOR }}>@{user?.name?.split(" ")[0] || "You"}</span> — commitment gap is exactly what client raised. Needs to be clear in the deck.
                    </div>
                  </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-stone-50 dark:bg-sidebar border border-stone-200 dark:border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Reply…"
                    data-testid="input-team-chat-test"
                  />
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: TEST_COLOR }}
                    data-testid="button-send-team-chat"
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
