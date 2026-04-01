import { useState } from "react";
import { useLocation } from "wouter";
import { X, Sparkles, Send, MessageSquare, ChevronDown, Download, ExternalLink, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
const CYAN_DK  = "#1A8FAD";
const CYAN_LT  = "#DFF6FC";
const CREAM    = "#FAF3E8";
const TEST_COLOR = SUCCESS;

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid ${N200}`,
  borderRadius: 14,
  boxShadow: "0 1px 4px rgba(58,47,191,.08)",
};

type Tab = "brief" | "studies" | "assistant";

const STUDY_TYPE_CARDS = [
  { name: "Test24 Basic", desc: "100 consumers · 5 min · 24hr turnaround · 1 Basic credit",    price: "R5,000",     id: "basic" },
  { name: "Test24 Pro",   desc: "100+ consumers · 10–15 min · 24hr · AI Qual included",        price: "From R45,000", id: "pro"   },
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
  const [, setLocation]           = useLocation();
  const { user }                  = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("studies");
  const [selectedStudyType, setSelectedStudyType] = useState("basic");
  const [aiInput, setAiInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);

  const { data: clientReports, isLoading: isLoadingReports } = useQuery<any[]>({
    queryKey: ["/api/member/reports", user?.companyId],
    queryFn: async () => {
      const url = user?.companyId ? `/api/member/reports?companyId=${user.companyId}` : `/api/member/reports`;
      const r = await fetch(url);
      if (!r.ok) return [];
      return r.json();
    },
    enabled: !!user,
  });

  const { data: userActivity } = useQuery<{ basicCreditsRemaining: number; proCreditsRemaining: number }>({
    queryKey: ["/api/member/activity", user?.id],
    enabled: !!user,
  });

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
      { type: "system", text: "Based on your study portfolio, here's what I can see from that angle…", rec: "→ I'll need more study data to give a definitive answer, but this direction looks strong." },
    ]);
    setAiInput("");
  };

  const getMetricColor = (val: number | null) => {
    if (!val) return N500;
    if (val >= 75) return SUCCESS;
    if (val >= 55) return AMBER_DK;
    return CORAL;
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const getStudyTypeBadge = (type: string | null) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,  color: VIO     };
    return                        { label: "BASIC",  bg: CYAN_LT, color: CYAN_DK };
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <div className="flex flex-col w-full h-full">

        {/* Phase topbar */}
        <div className="flex items-center justify-between flex-shrink-0 px-5" style={{ minHeight: 52, background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1" style={{ background: "rgba(42,158,92,0.2)", color: "#86EFAC", border: "1px solid rgba(42,158,92,0.4)", borderRadius: 6 }}>
              PHASE 02
            </span>
            <h1 className="font-serif text-xl text-white">Test</h1>
            <span className="text-sm hidden sm:block" style={{ color: N400 }}>Put your ideas in front of real consumers.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("brief")}
              data-testid="button-launch-brief"
              className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
              style={{ background: TEST_COLOR, borderRadius: 8 }}
            >
              Launch a Brief
            </button>
            <button
              onClick={() => setLocation("/portal/dashboard")}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
              data-testid="button-close-test"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-shrink-0 px-5" style={{ background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {(["brief", "studies", "assistant"] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-testid={`tab-test-${tab}`}
              className="px-4 py-3 text-sm font-medium transition-colors border-b-2"
              style={{
                color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.5)",
                borderBottomColor: activeTab === tab ? TEST_COLOR : "transparent",
              }}
            >
              {tab === "brief" ? "Launch a Brief" : tab === "studies" ? "Studies" : "Research Assistant"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main */}
          <div className="flex-1 overflow-y-auto p-6" style={{ background: CREAM }}>

            {activeTab === "brief" && (
              <div style={{ ...CARD, maxWidth: 680 }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: VDK }}>AI Briefing Assistant</div>
                    <div className="text-xs" style={{ color: N500 }}>Answer a few questions and we'll build your complete Upsiide survey brief automatically</div>
                  </div>
                </div>

                <div className="flex overflow-x-auto px-5" style={{ borderBottom: `1px solid ${N200}` }}>
                  {["1 Objectives", "2 Audience", "3 Concepts", "4 Billing", "5 Review"].map((step, i) => (
                    <div
                      key={step}
                      className="px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors"
                      style={i === 0 ? { borderBottomColor: TEST_COLOR, color: TEST_COLOR } : { borderBottomColor: "transparent", color: N500 }}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-sm font-semibold" style={{ color: VDK }}>1 Research Objectives</div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: N500 }}>Brief / Project Name <span style={{ color: CORAL }}>*</span></label>
                    <input
                      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                      style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                      placeholder="e.g. Energy Drink Concept Test Q2 2026"
                      data-testid="input-brief-name"
                      onFocus={e => (e.target.style.borderColor = VIO)}
                      onBlur={e => (e.target.style.borderColor = N200)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: N500 }}>Research Objective <span style={{ color: CORAL }}>*</span></label>
                    <textarea
                      className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none"
                      style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                      rows={3}
                      placeholder="Be as specific as possible. This drives the entire survey structure."
                      data-testid="input-brief-objective"
                      onFocus={e => (e.target.style.borderColor = VIO)}
                      onBlur={e => (e.target.style.borderColor = N200)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Study Type <span style={{ color: CORAL }}>*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                      {STUDY_TYPE_CARDS.map(card => (
                        <button
                          key={card.id}
                          onClick={() => setSelectedStudyType(card.id)}
                          data-testid={`study-type-${card.id}`}
                          className="border-2 rounded-xl p-4 text-left transition-all"
                          style={selectedStudyType === card.id
                            ? { borderColor: TEST_COLOR, background: SUC_LT }
                            : { borderColor: N200, background: "#fff" }
                          }
                        >
                          <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{card.name}</div>
                          <div className="text-xs mb-2 leading-relaxed" style={{ color: N500 }}>{card.desc}</div>
                          <div className="text-sm font-bold" style={{ color: TEST_COLOR }}>{card.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2" style={{ borderTop: `1px solid ${N200}` }}>
                    <button className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }} data-testid="button-brief-back">← Back</button>
                    <button
                      onClick={() => setLocation("/portal/launch")}
                      className="text-xs font-semibold px-4 py-2 text-white rounded-lg"
                      style={{ background: TEST_COLOR, borderRadius: 8 }}
                      data-testid="button-brief-next"
                    >
                      Continue in full form →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "studies" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>
                    {isLoadingReports ? "Loading…" : `${clientReports?.length ?? 0} Studies`}
                  </span>
                  <div className="flex gap-2">
                    <select className="rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>
                      <option>All statuses</option>
                      <option>Complete</option>
                      <option>In Progress</option>
                    </select>
                    <button
                      onClick={() => setActiveTab("brief")}
                      className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
                      style={{ background: TEST_COLOR, borderRadius: 8 }}
                      data-testid="button-new-brief"
                    >
                      + New Brief
                    </button>
                  </div>
                </div>

                {isLoadingReports
                  ? [1, 2, 3].map(i => <div key={i} style={{ ...CARD, marginBottom: 12, padding: 20 }}><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-3 w-1/3" /></div>)
                  : clientReports && clientReports.length > 0
                    ? clientReports.map((study: any) => {
                        const metrics = [
                          { label: "Idea",     val: study.topIdeaIdeaScore },
                          { label: "Interest", val: study.topIdeaInterest },
                          { label: "Commit",   val: study.topIdeaCommitment },
                          { label: "Meaning",  val: study.topIdeaMeaning },
                          { label: "Diff",     val: study.topIdeaDifference },
                          { label: "Worth",    val: study.topIdeaWorth },
                        ].filter(m => m.val !== null && m.val !== undefined);

                        const badge = getStudyTypeBadge(study.studyType);

                        return (
                          <div key={study.id} style={{ ...CARD, marginBottom: 12 }} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`study-card-${study.id}`}>
                            <div className="px-5 py-4 flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="text-base font-semibold mb-0.5" style={{ color: VDK }}>{study.title}</div>
                                <div className="text-xs" style={{ color: N500 }}>
                                  {[study.companyName, study.industry, study.uploadedAt ? formatDate(study.uploadedAt) : ""].filter(Boolean).join(" · ")}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: badge.bg, color: badge.color, borderRadius: 9999 }}>{badge.label}</span>
                                {study.status && (
                                  <span className="text-[10px] font-bold px-2 py-0.5" style={
                                    study.status?.toLowerCase().includes("complete")
                                      ? { background: SUC_LT, color: SUCCESS, borderRadius: 9999 }
                                      : { background: AMBER_LT, color: AMBER_DK, borderRadius: 9999 }
                                  }>{study.status?.toLowerCase().includes("complete") ? "Complete" : study.status}</span>
                                )}
                              </div>
                            </div>

                            {metrics.length > 0 && (
                              <div className="px-5 pb-3 grid grid-cols-6 gap-1.5" style={{ borderBottom: `1px solid ${N200}` }}>
                                {metrics.map(m => (
                                  <div key={m.label} className="text-center rounded-lg py-2" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
                                    <div className="text-base font-bold font-mono" style={{ color: getMetricColor(m.val) }}>{m.val}%</div>
                                    <div className="text-[9px] mt-0.5" style={{ color: N500 }}>{m.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="px-5 py-3 flex gap-2">
                              <button
                                onClick={() => setLocation("/portal/act")}
                                className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
                                style={{ background: CORAL, borderRadius: 8 }}
                                data-testid={`button-act-study-${study.id}`}
                              >
                                Analyse in Act
                              </button>
                              {study.pdfUrl && (
                                <button onClick={() => window.open(study.pdfUrl, "_blank")} className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }} data-testid={`button-download-study-${study.id}`}>
                                  <Download className="w-3 h-3" /> PDF
                                </button>
                              )}
                              {study.dashboardUrl && (
                                <button onClick={() => window.open(study.dashboardUrl, "_blank")} className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }} data-testid={`button-dashboard-study-${study.id}`}>
                                  <ExternalLink className="w-3 h-3" /> Dashboard
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    : (
                      <div style={CARD} className="p-10 text-center">
                        <p className="text-sm font-semibold mb-1" style={{ color: VDK }}>No studies yet</p>
                        <p className="text-xs mb-4" style={{ color: N500 }}>Launch your first brief to start collecting consumer insights.</p>
                        <button onClick={() => setActiveTab("brief")} className="text-sm font-semibold px-5 py-2 text-white rounded-lg" style={{ background: TEST_COLOR, borderRadius: 8 }} data-testid="button-start-first-brief">
                          Launch a Brief
                        </button>
                      </div>
                    )
                }
              </div>
            )}

            {activeTab === "assistant" && (
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: CORAL }}>Research Assistant</div>
                <p className="text-sm mb-4" style={{ color: N500 }}>Your AI-powered research partner. Ask questions about your studies, generate summaries, or build your next brief.</p>
                <div style={{ ...CARD, padding: 0 }}>
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: VIO }}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      Research AI
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: N500 }}>Analysing {clientReports?.length ?? 0} studies in your portfolio</div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs" style={{ color: N500 }}>Ask me anything about your study results, gaps, or what to test next.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="w-80 min-w-[320px] flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: `1px solid ${N200}` }}>
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${N200}` }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: VDK }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: TEST_COLOR }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Research AI
              </div>
              <div className="text-[11px] mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: TEST_COLOR }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEST_COLOR }} />
                {clientReports?.length ?? 0} studies indexed
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.type === "user" ? "ml-4" : ""}>
                  <div className="text-[10px] mb-1 flex items-center gap-1.5" style={{ color: N500 }}>
                    {msg.type === "system"
                      ? <><div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ background: TEST_COLOR }}><Sparkles className="w-2.5 h-2.5 text-white" /></div> Research AI</>
                      : <><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: CORAL }}>{initials(user?.name)}</div> {user?.name}</>
                    }
                  </div>
                  <div className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: msg.type === "user" ? "#FAF3E8" : "#F0FDF4", border: `1px solid ${msg.type === "user" ? N200 : "rgba(42,158,92,0.15)"}` }}>
                    <p style={{ color: VDK, whiteSpace: "pre-line" }}>{msg.text}</p>
                    {msg.rec && (
                      <div className="mt-2 pl-2 py-1.5 text-xs font-medium rounded-r" style={{ background: SUC_LT, borderLeft: `2px solid ${TEST_COLOR}`, color: TEST_COLOR }}>
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
                placeholder="Ask about your studies…"
                data-testid="input-ai-message"
                onFocus={e => (e.target.style.borderColor = TEST_COLOR)}
                onBlur={e => (e.target.style.borderColor = N200)}
              />
              <button onClick={handleSendAI} className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: TEST_COLOR }} data-testid="button-send-ai">
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
                <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: CORAL }}>1</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChat ? "rotate-180" : ""}`} style={{ color: N500 }} />
            </button>

            {showChat && (
              <div className="flex-shrink-0" style={{ borderTop: `1px solid ${N200}`, background: "#fff" }}>
                <div className="p-3 max-h-36 overflow-y-auto">
                  <TCMsg initials="SW" author="Sarah W." time="09:12" color={VIO} text="The commitment drop is the main issue to address before we go to launch." />
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }} placeholder="Reply… use @ to tag" data-testid="input-team-chat" />
                  <button className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: TEST_COLOR }} data-testid="button-send-chat"><Send className="w-3 h-3" /></button>
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
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ background: color }}>{initials}</div>
        <span className="text-xs font-semibold" style={{ color: "#1E1B3A" }}>{author}</span>
        <span className="text-[10px]" style={{ color: "#8A7260" }}>{time}</span>
      </div>
      <div className="ml-6 px-3 py-2 text-xs rounded-xl leading-snug" style={{ background: "#FAF3E8", border: "1px solid #E2D5BF", color: "#8A7260" }}>{text}</div>
    </div>
  );
}
