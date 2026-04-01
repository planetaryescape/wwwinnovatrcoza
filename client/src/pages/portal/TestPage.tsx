import { useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  X, Sparkles, Send, MessageSquare, ChevronDown, ExternalLink,
  ArrowRight, Loader2, Upload, CheckCircle2, ChevronRight, FileText,
} from "lucide-react";
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
type BriefMode = "choose" | "standard" | "ai";
type AiStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STUDY_TYPE_CARDS = [
  { name: "Test24 Basic", desc: "100 consumers · 5 min · 24hr turnaround · 1 Basic credit",    price: "R5,000",     id: "basic" },
  { name: "Test24 Pro",   desc: "100+ consumers · 10–15 min · 24hr · AI Qual included",        price: "From R45,000", id: "pro"   },
];

const AGE_CHIPS    = ["18–24", "25–34", "35–44", "45–54", "55+"];
const GENDER_CHIPS = ["Male", "Female", "Non-binary", "All"];
const INCOME_CHIPS = ["LSM 1–4", "LSM 5–7", "LSM 8–10", "All LSM"];
const REGION_CHIPS = ["Gauteng", "Western Cape", "KZN", "Eastern Cape", "Limpopo", "All provinces"];

const AI_STEPS = [
  { q: "What product or concept are you testing?" },
  { q: "What is the primary research objective for this study?" },
  { q: "Who is your target audience? Select the demographics that apply." },
  { q: "Which study type do you need?" },
  { q: "How many concepts or stimuli are you testing, and do you have creative materials to upload?" },
  { q: "Any specific competitors or market context we should know about?" },
  { q: "Here is your brief summary. Review and submit for approval." },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  NEW:            { label: "Brief Submitted", bg: VIO_LT,  color: VIO      },
  AUDIENCE_LIVE:  { label: "In Field",        bg: CYAN_LT, color: CYAN_DK  },
  ANALYSING_DATA: { label: "Analysing",       bg: AMBER_LT, color: AMBER_DK },
  COMPLETED:      { label: "Complete",        bg: SUC_LT,  color: SUCCESS  },
};

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
  const [briefMode, setBriefMode] = useState<BriefMode>("choose");
  const [aiInput, setAiInput]     = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(AI_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat]   = useState(false);

  /* AI brief assistant state */
  const [aiStep, setAiStep]                 = useState<AiStep>(0);
  const [aiAnswers, setAiAnswers]           = useState<Record<string, any>>({});
  const [aiCurrentInput, setAiCurrentInput] = useState("");
  const [agesSelected, setAgesSelected]     = useState<string[]>([]);
  const [gendersSelected, setGenders]       = useState<string[]>([]);
  const [incomesSelected, setIncomes]       = useState<string[]>([]);
  const [regionsSelected, setRegions]       = useState<string[]>([]);
  const [studyTypeAI, setStudyTypeAI]       = useState("basic");
  const [numConceptsAI, setNumConceptsAI]   = useState(1);
  const [uploadedFiles, setUploadedFiles]   = useState<File[]>([]);
  const [briefSubmitted, setBriefSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Standard brief quick-form state */
  const [selectedStudyType, setSelectedStudyType] = useState("basic");

  const { data: studies, isLoading: isLoadingStudies } = useQuery<any[]>({
    queryKey: ["/api/member/studies"],
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

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const getStatusBadge = (status: string | null) => {
    const key = (status || "NEW").toUpperCase();
    return STATUS_MAP[key] || STATUS_MAP.NEW;
  };

  const getStudyTypeBadge = (type: string | null) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,  color: VIO     };
    return                        { label: "BASIC",  bg: CYAN_LT, color: CYAN_DK };
  };

  /* AI brief step helpers */
  const toggleChip = (val: string, arr: string[], setArr: (v: string[]) => void) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const advanceAiStep = () => {
    const step = aiStep;
    let updated = { ...aiAnswers };

    if (step === 0) updated.concept = aiCurrentInput;
    if (step === 1) updated.objective = aiCurrentInput;
    if (step === 2) updated.ages = agesSelected; updated.genders = gendersSelected; updated.incomes = incomesSelected; updated.regions = regionsSelected;
    if (step === 3) updated.studyType = studyTypeAI;
    if (step === 4) { updated.numConcepts = numConceptsAI; updated.files = uploadedFiles.map(f => f.name); }
    if (step === 5) updated.context = aiCurrentInput;

    setAiAnswers(updated);
    setAiCurrentInput("");
    if (step < 6) setAiStep((step + 1) as AiStep);
  };

  const submitAiBrief = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/ai-brief/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedByName:  user?.name || "Portal User",
          submittedByEmail: user?.email || "",
          companyName:      user?.companyName || "Unknown Company",
          concept:          aiAnswers.concept || "",
          objective:        aiAnswers.objective || "",
          ages:             aiAnswers.ages || [],
          genders:          aiAnswers.genders || [],
          incomes:          aiAnswers.incomes || [],
          regions:          aiAnswers.regions || [],
          studyType:        aiAnswers.studyType || "basic",
          numConcepts:      aiAnswers.numConcepts || 1,
          context:          aiAnswers.context || "",
          files:            aiAnswers.files || [],
        }),
      });
      setBriefSubmitted(true);
    } catch (e) {
      console.error("AI brief submit error", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAiBrief = () => {
    setAiStep(0);
    setAiAnswers({});
    setAiCurrentInput("");
    setAgesSelected([]);
    setGenders([]);
    setIncomes([]);
    setRegions([]);
    setStudyTypeAI("basic");
    setNumConceptsAI(1);
    setUploadedFiles([]);
    setBriefSubmitted(false);
    setBriefMode("choose");
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
              onClick={() => { setActiveTab("brief"); setBriefMode("choose"); }}
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
              onClick={() => { setActiveTab(tab); if (tab === "brief") setBriefMode("choose"); }}
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

            {/* ── LAUNCH A BRIEF ── */}
            {activeTab === "brief" && (
              <div>
                {briefMode === "choose" && (
                  <div>
                    <div className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: CORAL }}>How would you like to submit your brief?</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                      {/* Standard form */}
                      <button
                        onClick={() => setBriefMode("standard")}
                        data-testid="button-choose-standard-brief"
                        className="text-left rounded-2xl p-5 transition-all hover:shadow-md"
                        style={{ background: "#fff", border: `2px solid ${N200}` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: SUC_LT }}>
                          <FileText className="w-5 h-5" style={{ color: TEST_COLOR }} />
                        </div>
                        <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>Standard Brief Form</div>
                        <div className="text-xs leading-relaxed" style={{ color: N500 }}>Fill out the full structured brief form — objectives, audience, concepts, billing and review in one flow.</div>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: TEST_COLOR }}>
                          Go to brief form <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>

                      {/* AI Assistant */}
                      <button
                        onClick={() => { setBriefMode("ai"); setAiStep(0); setBriefSubmitted(false); }}
                        data-testid="button-choose-ai-brief"
                        className="text-left rounded-2xl p-5 transition-all hover:shadow-md"
                        style={{ background: "#fff", border: `2px solid ${N200}` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: VIO_LT }}>
                          <Sparkles className="w-5 h-5" style={{ color: VIO }} />
                        </div>
                        <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>AI Brief Assistant</div>
                        <div className="text-xs leading-relaxed" style={{ color: N500 }}>Answer a few conversational questions and the AI will design your survey questionnaire and send it to hannah@innovatr.co.za for approval.</div>
                        <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: VIO }}>
                          Start AI assistant <ChevronRight className="w-3 h-3" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {briefMode === "standard" && (
                  <div style={{ ...CARD, maxWidth: 680 }}>
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: VDK }}>Research Brief</div>
                        <div className="text-xs" style={{ color: N500 }}>Complete the structured brief form to launch your study</div>
                      </div>
                      <button onClick={() => setBriefMode("choose")} className="text-xs" style={{ color: N500 }}>← Back</button>
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
                        <button onClick={() => setBriefMode("choose")} className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }}>← Back</button>
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

                {briefMode === "ai" && (
                  <div style={{ ...CARD, maxWidth: 680 }}>
                    {/* AI brief header */}
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: VIO }}>
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: VDK }}>AI Brief Assistant</div>
                          <div className="text-xs" style={{ color: N500 }}>Once complete, a survey questionnaire is sent to hannah@innovatr.co.za for approval</div>
                        </div>
                      </div>
                      <button onClick={() => setBriefMode("choose")} className="text-xs" style={{ color: N500 }}>← Back</button>
                    </div>

                    {/* Step progress */}
                    {!briefSubmitted && (
                      <div className="flex px-5 py-2 gap-1" style={{ borderBottom: `1px solid ${N200}`, background: "#FAFAF8" }}>
                        {AI_STEPS.map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full"
                            style={{ background: i < aiStep ? VIO : i === aiStep ? VIO : N200, opacity: i <= aiStep ? 1 : 0.4 }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="p-5">
                      {briefSubmitted ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: SUCCESS }} />
                          <div className="text-base font-semibold mb-2" style={{ color: VDK }}>Brief submitted for approval</div>
                          <p className="text-sm mb-6" style={{ color: N500 }}>
                            A survey questionnaire has been generated from your brief and sent to hannah@innovatr.co.za for review and approval. You'll hear back within 24 hours.
                          </p>
                          <div className="space-y-2 text-left rounded-xl p-4 mb-6" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
                            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: CORAL }}>Brief Summary</div>
                            {aiAnswers.concept && <div className="text-xs"><span className="font-semibold" style={{ color: VDK }}>Concept: </span><span style={{ color: N500 }}>{aiAnswers.concept}</span></div>}
                            {aiAnswers.objective && <div className="text-xs"><span className="font-semibold" style={{ color: VDK }}>Objective: </span><span style={{ color: N500 }}>{aiAnswers.objective}</span></div>}
                            {aiAnswers.studyType && <div className="text-xs"><span className="font-semibold" style={{ color: VDK }}>Study type: </span><span style={{ color: N500 }}>{aiAnswers.studyType === "basic" ? "Test24 Basic" : "Test24 Pro"}</span></div>}
                            {aiAnswers.numConcepts && <div className="text-xs"><span className="font-semibold" style={{ color: VDK }}>Concepts: </span><span style={{ color: N500 }}>{aiAnswers.numConcepts}</span></div>}
                          </div>
                          <button onClick={resetAiBrief} className="text-sm font-semibold px-5 py-2.5 text-white rounded-lg" style={{ background: TEST_COLOR, borderRadius: 8 }} data-testid="button-brief-done">
                            Done
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* AI question bubble */}
                          <div className="mb-4">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-sm flex items-center justify-center" style={{ background: VIO }}><Sparkles className="w-3 h-3 text-white" /></div>
                              <span className="text-[11px] font-semibold" style={{ color: VIO }}>Brief Assistant · Step {aiStep + 1} of {AI_STEPS.length}</span>
                            </div>
                            <div className="text-sm font-medium leading-relaxed p-4 rounded-xl" style={{ background: "#F8F7FF", border: `1px solid rgba(58,47,191,0.15)`, color: VDK }}>
                              {AI_STEPS[aiStep].q}
                            </div>
                          </div>

                          {/* Step 0: Concept */}
                          {aiStep === 0 && (
                            <textarea
                              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none"
                              rows={3}
                              style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                              placeholder="e.g. A premium energy drink with adaptogens, targeting health-conscious urban professionals aged 25–34"
                              value={aiCurrentInput}
                              onChange={e => setAiCurrentInput(e.target.value)}
                              onFocus={e => (e.target.style.borderColor = VIO)}
                              onBlur={e => (e.target.style.borderColor = N200)}
                              data-testid="input-ai-concept"
                            />
                          )}

                          {/* Step 1: Objective */}
                          {aiStep === 1 && (
                            <textarea
                              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none"
                              rows={3}
                              style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                              placeholder="e.g. Determine whether the concept drives sufficient purchase intent to justify launch investment in Gauteng"
                              value={aiCurrentInput}
                              onChange={e => setAiCurrentInput(e.target.value)}
                              onFocus={e => (e.target.style.borderColor = VIO)}
                              onBlur={e => (e.target.style.borderColor = N200)}
                              data-testid="input-ai-objective"
                            />
                          )}

                          {/* Step 2: Demographics */}
                          {aiStep === 2 && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Age groups</label>
                                <div className="flex flex-wrap gap-2">
                                  {AGE_CHIPS.map(c => (
                                    <button key={c} onClick={() => toggleChip(c, agesSelected, setAgesSelected)} className="px-3 py-1 text-xs rounded-lg" data-testid={`chip-age-${c}`}
                                      style={agesSelected.includes(c) ? { background: VIO, color: "#fff", border: `1px solid ${VIO}` } : { background: "#fff", border: `1px solid ${N200}`, color: N500 }}>
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Gender</label>
                                <div className="flex flex-wrap gap-2">
                                  {GENDER_CHIPS.map(c => (
                                    <button key={c} onClick={() => toggleChip(c, gendersSelected, setGenders)} className="px-3 py-1 text-xs rounded-lg" data-testid={`chip-gender-${c}`}
                                      style={gendersSelected.includes(c) ? { background: VIO, color: "#fff", border: `1px solid ${VIO}` } : { background: "#fff", border: `1px solid ${N200}`, color: N500 }}>
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Income (LSM)</label>
                                <div className="flex flex-wrap gap-2">
                                  {INCOME_CHIPS.map(c => (
                                    <button key={c} onClick={() => toggleChip(c, incomesSelected, setIncomes)} className="px-3 py-1 text-xs rounded-lg" data-testid={`chip-income-${c}`}
                                      style={incomesSelected.includes(c) ? { background: VIO, color: "#fff", border: `1px solid ${VIO}` } : { background: "#fff", border: `1px solid ${N200}`, color: N500 }}>
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Region</label>
                                <div className="flex flex-wrap gap-2">
                                  {REGION_CHIPS.map(c => (
                                    <button key={c} onClick={() => toggleChip(c, regionsSelected, setRegions)} className="px-3 py-1 text-xs rounded-lg" data-testid={`chip-region-${c}`}
                                      style={regionsSelected.includes(c) ? { background: VIO, color: "#fff", border: `1px solid ${VIO}` } : { background: "#fff", border: `1px solid ${N200}`, color: N500 }}>
                                      {c}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Study type */}
                          {aiStep === 3 && (
                            <div className="grid grid-cols-2 gap-3">
                              {STUDY_TYPE_CARDS.map(card => (
                                <button
                                  key={card.id}
                                  onClick={() => setStudyTypeAI(card.id)}
                                  data-testid={`ai-study-type-${card.id}`}
                                  className="border-2 rounded-xl p-4 text-left transition-all"
                                  style={studyTypeAI === card.id ? { borderColor: TEST_COLOR, background: SUC_LT } : { borderColor: N200, background: "#fff" }}
                                >
                                  <div className="text-sm font-semibold mb-1" style={{ color: VDK }}>{card.name}</div>
                                  <div className="text-xs mb-2 leading-relaxed" style={{ color: N500 }}>{card.desc}</div>
                                  <div className="text-sm font-bold" style={{ color: TEST_COLOR }}>{card.price}</div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Step 4: Concepts + file upload */}
                          {aiStep === 4 && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>How many concepts are you testing?</label>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setNumConceptsAI(Math.max(1, numConceptsAI - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>−</button>
                                  <span className="text-xl font-bold font-mono" style={{ color: VDK }}>{numConceptsAI}</span>
                                  <button onClick={() => setNumConceptsAI(Math.min(5, numConceptsAI + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>+</button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-semibold mb-2 block" style={{ color: N500 }}>Upload creative materials (optional — images, PDFs, video thumbnails)</label>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={e => setUploadedFiles(Array.from(e.target.files || []))}
                                  data-testid="input-brief-files"
                                />
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg"
                                  style={{ border: `1.5px dashed ${N200}`, color: N500, background: "#FAFAF8" }}
                                  data-testid="button-upload-creative"
                                >
                                  <Upload className="w-4 h-4" />
                                  {uploadedFiles.length > 0 ? `${uploadedFiles.length} file${uploadedFiles.length > 1 ? "s" : ""} selected` : "Choose files to upload"}
                                </button>
                                {uploadedFiles.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {uploadedFiles.map((f, i) => (
                                      <div key={i} className="text-xs flex items-center gap-2 py-1" style={{ color: N500 }}>
                                        <FileText className="w-3 h-3" /> {f.name}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Step 5: Context */}
                          {aiStep === 5 && (
                            <textarea
                              className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none"
                              rows={3}
                              style={{ background: "#FAF3E8", border: `1.5px solid ${N200}`, color: VDK }}
                              placeholder="e.g. Main competitors are Monster Energy and Red Bull. The product will retail at R22 per unit in Pick n Pay and Woolworths."
                              value={aiCurrentInput}
                              onChange={e => setAiCurrentInput(e.target.value)}
                              onFocus={e => (e.target.style.borderColor = VIO)}
                              onBlur={e => (e.target.style.borderColor = N200)}
                              data-testid="input-ai-context"
                            />
                          )}

                          {/* Step 6: Review */}
                          {aiStep === 6 && (
                            <div className="space-y-3">
                              <div className="rounded-xl p-4" style={{ background: "#FAFAF8", border: `1px solid ${N200}` }}>
                                <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: CORAL }}>Brief Summary</div>
                                {[
                                  { label: "Concept",    value: aiAnswers.concept },
                                  { label: "Objective",  value: aiAnswers.objective },
                                  { label: "Ages",       value: (aiAnswers.ages || []).join(", ") || "Not specified" },
                                  { label: "Genders",    value: (aiAnswers.genders || []).join(", ") || "Not specified" },
                                  { label: "Income",     value: (aiAnswers.incomes || []).join(", ") || "Not specified" },
                                  { label: "Regions",    value: (aiAnswers.regions || []).join(", ") || "Not specified" },
                                  { label: "Study type", value: studyTypeAI === "basic" ? "Test24 Basic" : "Test24 Pro" },
                                  { label: "Concepts",   value: String(numConceptsAI) },
                                  { label: "Files",      value: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(", ") : "None" },
                                  { label: "Context",    value: aiAnswers.context || "None" },
                                ].map(row => (
                                  <div key={row.label} className="flex gap-3 mb-2">
                                    <span className="text-xs font-semibold w-24 flex-shrink-0" style={{ color: VDK }}>{row.label}</span>
                                    <span className="text-xs" style={{ color: N500 }}>{row.value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="text-xs rounded-xl p-3" style={{ background: VIO_LT, border: `1px solid rgba(58,47,191,0.2)`, color: VIO }}>
                                <span className="font-semibold">What happens next: </span>The AI will generate a custom Upsiide survey questionnaire from your brief and send it to hannah@innovatr.co.za for review and approval. You'll be notified once approved.
                              </div>
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${N200}` }}>
                            {aiStep > 0
                              ? <button onClick={() => setAiStep((aiStep - 1) as AiStep)} className="text-xs font-semibold px-4 py-2 rounded-lg" style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }}>← Back</button>
                              : <div />
                            }
                            {aiStep < 6 ? (
                              <button
                                onClick={advanceAiStep}
                                disabled={
                                  (aiStep === 0 && !aiCurrentInput.trim()) ||
                                  (aiStep === 1 && !aiCurrentInput.trim()) ||
                                  (aiStep === 5 && false)
                                }
                                data-testid={`button-ai-next-${aiStep}`}
                                className="text-xs font-semibold px-5 py-2 text-white rounded-lg"
                                style={{ background: VIO, borderRadius: 8 }}
                              >
                                Continue →
                              </button>
                            ) : (
                              <button
                                onClick={submitAiBrief}
                                disabled={isSubmitting}
                                data-testid="button-submit-ai-brief"
                                className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 text-white rounded-lg"
                                style={{ background: TEST_COLOR, borderRadius: 8 }}
                              >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isSubmitting ? "Submitting…" : "Submit for Approval"}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STUDIES ── */}
            {activeTab === "studies" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: CORAL }}>
                    {isLoadingStudies ? "Loading…" : `${studies?.length ?? 0} ${studies?.length === 1 ? "Study" : "Studies"}`}
                  </span>
                  <div className="flex gap-2">
                    <select className="rounded-lg px-3 py-1.5 text-xs focus:outline-none" style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}>
                      <option>All statuses</option>
                      <option>Complete</option>
                      <option>In Field</option>
                      <option>Analysing</option>
                    </select>
                    <button
                      onClick={() => { setActiveTab("brief"); setBriefMode("choose"); }}
                      className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
                      style={{ background: TEST_COLOR, borderRadius: 8 }}
                      data-testid="button-new-brief"
                    >
                      + New Brief
                    </button>
                  </div>
                </div>

                {isLoadingStudies
                  ? [1, 2, 3].map(i => (
                      <div key={i} style={{ ...CARD, marginBottom: 12, padding: 20 }}>
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-1/3 mb-3" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))
                  : studies && studies.length > 0
                    ? studies.map((study: any) => {
                        const statusBadge = getStatusBadge(study.status);
                        const typeBadge   = getStudyTypeBadge(study.studyType);

                        return (
                          <div key={study.id} style={{ ...CARD, marginBottom: 12 }} className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`study-card-${study.id}`}>
                            <div className="px-5 py-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-base font-semibold mb-0.5" style={{ color: VDK }}>{study.title}</div>
                                  <div className="text-xs flex flex-wrap gap-2" style={{ color: N500 }}>
                                    {study.companyName && <span>{study.companyName}</span>}
                                    {study.submittedByName && <span>· {study.submittedByName}</span>}
                                    {study.createdAt && <span>· {formatDate(study.createdAt)}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: typeBadge.bg, color: typeBadge.color, borderRadius: 9999 }}>{typeBadge.label}</span>
                                  <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: statusBadge.bg, color: statusBadge.color, borderRadius: 9999 }}>{statusBadge.label}</span>
                                </div>
                              </div>

                              {study.description && (
                                <div className="text-xs leading-relaxed mb-3 px-3 py-2 rounded-lg" style={{ background: "#FAFAF8", border: `1px solid ${N200}`, color: N500 }}>
                                  <span className="font-semibold" style={{ color: VDK }}>Research objective: </span>{study.description}
                                </div>
                              )}

                              {study.tags && study.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {study.tags.map((tag: string) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: VIO_LT, color: VIO }}>{tag}</span>
                                  ))}
                                </div>
                              )}

                              {study.deliveryDate && (
                                <div className="text-xs mb-2" style={{ color: N500 }}>
                                  <span className="font-semibold" style={{ color: VDK }}>Est. delivery: </span>{formatDate(study.deliveryDate)}
                                </div>
                              )}
                            </div>

                            <div className="px-5 py-3 flex gap-2" style={{ borderTop: `1px solid ${N200}` }}>
                              <button
                                onClick={() => setLocation("/portal/act")}
                                className="text-xs font-semibold px-4 py-1.5 text-white rounded-lg"
                                style={{ background: CORAL, borderRadius: 8 }}
                                data-testid={`button-act-study-${study.id}`}
                              >
                                Analyse in Act
                              </button>
                              {study.reportUrl && (
                                <button
                                  onClick={() => window.open(study.reportUrl, "_blank")}
                                  className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1 rounded-lg"
                                  style={{ border: `1px solid ${N200}`, color: N500, background: "#fff", borderRadius: 8 }}
                                  data-testid={`button-report-study-${study.id}`}
                                >
                                  <ExternalLink className="w-3 h-3" /> View Report
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
                        <button
                          onClick={() => { setActiveTab("brief"); setBriefMode("choose"); }}
                          className="text-sm font-semibold px-5 py-2 text-white rounded-lg"
                          style={{ background: TEST_COLOR, borderRadius: 8 }}
                          data-testid="button-start-first-brief"
                        >
                          Launch a Brief
                        </button>
                      </div>
                    )
                }
              </div>
            )}

            {/* ── RESEARCH ASSISTANT ── */}
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
                    <div className="text-xs mt-0.5" style={{ color: N500 }}>Analysing {studies?.length ?? 0} studies in your portfolio</div>
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
                {studies?.length ?? 0} studies indexed
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
