import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BookOpen, FlaskConical, Layers, ChevronDown, ChevronUp, ExternalLink, Lightbulb, ListChecks, Quote, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const VDK   = "#1E1B3A";
const VIO   = "#3A2FBF";
const CORAL = "#E8503A";
const N200  = "#E2D5BF";
const N400  = "#A89078";
const N500  = "#8A7260";
const CREAM = "#FAF3E8";

const SERIES_COLOR: Record<string, string> = {
  IRL: "#3A2FBF",
  Insights: "#2A9E5C",
  Launch: "#E8503A",
  Public: "#1A8FAD",
  "My Research": "#B8911A",
};

type Source = "trends" | "research" | "combined";

interface AIFinding { text: string; sourceTitle: string; series: string; }
interface AICitation { id: string; title: string; series: string; excerpt: string; url: string; score: number; }
interface AIResponse {
  query: string;
  sources: Source;
  summary: string;
  findings: AIFinding[];
  citations: AICitation[];
  recommendations: string[];
  reportsAnalysed: number;
  sectionsReviewed: number;
}

interface ChatMessage {
  role: "user" | "ai";
  text?: string;
  response?: AIResponse;
  error?: string;
}

interface Props {
  accentColor?: string;
  suggestedPrompts?: string[];
  label?: string;
  defaultSource?: Source;
  // companyId is deliberately excluded — the server resolves the company
  // from the authenticated session, preventing cross-client data leakage
}

const SOURCE_OPTIONS: { value: Source; label: string; icon: any; desc: string }[] = [
  { value: "trends",   label: "Trend Library",  icon: BookOpen,     desc: "All IRL, Insights & Launch reports" },
  { value: "research", label: "My Research",     icon: FlaskConical, desc: "Your linked studies & results" },
  { value: "combined", label: "Combined",        icon: Layers,       desc: "Trend + research sources" },
];

function SourceBadge({ series }: { series: string }) {
  const color = SERIES_COLOR[series] ?? "#8A7260";
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
      style={{ background: color + "20", color, border: `1px solid ${color}40` }}
    >
      {series}
    </span>
  );
}

function CitationCard({ c }: { c: AICitation }) {
  const [open, setOpen] = useState(false);
  const color = SERIES_COLOR[c.series] ?? "#8A7260";
  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ border: `1px solid ${N200}`, background: "#fff" }}
    >
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        onClick={() => setOpen(o => !o)}
        data-testid={`citation-${c.id}`}
      >
        <Quote className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        <span className="text-xs font-semibold flex-1 leading-snug" style={{ color: VDK }}>{c.title}</span>
        <SourceBadge series={c.series} />
        {open ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: N400 }} /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: N400 }} />}
      </button>
      {open && (
        <div className="px-3 pb-3" style={{ borderTop: `1px solid ${N200}` }}>
          <p className="text-xs leading-relaxed mt-2" style={{ color: N500 }}>{c.excerpt}</p>
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold"
            style={{ color: VIO }}
          >
            View Full Report <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function AIResponseCard({ response }: { response: AIResponse }) {
  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Meta banner */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px]"
        style={{ background: VIO + "10", border: `1px solid ${VIO}25` }}
      >
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: VIO }} />
        <span style={{ color: VIO }}>
          <strong>{response.reportsAnalysed}</strong> {response.reportsAnalysed === 1 ? "report" : "reports"} analysed ·{" "}
          <strong>{response.sectionsReviewed}+</strong> sections reviewed
        </span>
        <span className="ml-auto rounded-full px-2 py-0.5 font-semibold" style={{ background: SERIES_COLOR[response.sources === "trends" ? "IRL" : response.sources === "research" ? "My Research" : "IRL"] + "20", color: SERIES_COLOR[response.sources === "trends" ? "IRL" : response.sources === "research" ? "My Research" : "IRL"] }}>
          {response.sources === "trends" ? "Trend Library" : response.sources === "research" ? "My Research" : "Combined"}
        </span>
      </div>

      {/* Summary */}
      <div
        className="rounded-md px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${VDK} 0%, #2D2660 100%)` }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Summary</span>
        </div>
        <p className="text-sm leading-relaxed text-white/90">{response.summary}</p>
      </div>

      {/* Key findings */}
      {response.findings.length > 0 && (
        <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${N200}`, background: CREAM }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${N200}` }}>
            <ListChecks className="w-3.5 h-3.5" style={{ color: VIO }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: VDK }}>Key Findings</span>
          </div>
          <div className="flex flex-col divide-y" style={{ "--tw-divide-opacity": 1 } as any}>
            {response.findings.map((f, i) => (
              <div key={i} className="flex gap-2.5 px-3 py-2.5 items-start">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: SERIES_COLOR[f.series] ?? VIO }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug" style={{ color: VDK }}>{f.text}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <SourceBadge series={f.series} />
                    <span className="text-[10px]" style={{ color: N400 }}>{f.sourceTitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source citations */}
      {response.citations.length > 0 && (
        <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${N200}` }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: CREAM, borderBottom: `1px solid ${N200}` }}>
            <BookOpen className="w-3.5 h-3.5" style={{ color: CORAL }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: VDK }}>Source Reports</span>
            <span className="ml-auto text-[10px]" style={{ color: N400 }}>{response.citations.length} matched</span>
          </div>
          <div className="flex flex-col gap-1 p-2">
            {response.citations.map(c => <CitationCard key={c.id} c={c} />)}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {response.recommendations.length > 0 && (
        <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${N200}`, background: "#fff" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#FFF8F0", borderBottom: `1px solid ${N200}` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: CORAL }}>Recommendations</span>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {response.recommendations.map((r, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span
                  className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white"
                  style={{ background: CORAL }}
                >
                  {i + 1}
                </span>
                <p className="text-xs leading-relaxed" style={{ color: VDK }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIQueryPanel({
  accentColor = VIO,
  suggestedPrompts = [],
  label = "Insights AI",
  defaultSource = "combined",
}: Props) {
  const [source, setSource]       = useState<Source>(defaultSource);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [showSources, setShowSources] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const query = useMutation({
    mutationFn: async ({ q, src }: { q: string; src: Source }) => {
      const res = await apiRequest("POST", "/api/ai/query", {
        query: q,
        sources: src,
      });
      return res.json() as Promise<AIResponse>;
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", text: q };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await query.mutateAsync({ q, src: source });
      setMessages(prev => [...prev, { role: "ai", response }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "ai", error: e?.message ?? "Something went wrong." }]);
    }
  };

  const currentOption = SOURCE_OPTIONS.find(s => s.value === source)!;
  const Icon = currentOption.icon;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
        style={{ background: VDK, borderBottom: `1px solid rgba(255,255,255,0.08)` }}
      >
        <div
          className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor }}
        >
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-semibold text-white flex-1">{label}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: accentColor + "30", color: "#fff" }}>
          AI
        </span>
      </div>

      {/* Source selector */}
      <div className="flex-shrink-0" style={{ background: "#F5EFE4", borderBottom: `1px solid ${N200}` }}>
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-left"
          onClick={() => setShowSources(o => !o)}
          data-testid="button-ai-source-toggle"
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentColor }} />
          <span className="text-[11px] font-semibold flex-1" style={{ color: VDK }}>
            Source: <span style={{ color: accentColor }}>{currentOption.label}</span>
          </span>
          <span className="text-[10px]" style={{ color: N400 }}>{currentOption.desc}</span>
          {showSources ? <ChevronUp className="w-3 h-3" style={{ color: N400 }} /> : <ChevronDown className="w-3 h-3" style={{ color: N400 }} />}
        </button>
        {showSources && (
          <div className="px-2 pb-2 flex flex-col gap-1">
            {SOURCE_OPTIONS.map(opt => {
              const OIcon = opt.icon;
              const active = source === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setSource(opt.value); setShowSources(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-left w-full transition-colors"
                  style={{
                    background: active ? accentColor + "15" : "transparent",
                    border: `1px solid ${active ? accentColor + "40" : "transparent"}`,
                  }}
                  data-testid={`button-ai-source-${opt.value}`}
                >
                  <OIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? accentColor : N400 }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold" style={{ color: active ? accentColor : VDK }}>{opt.label}</div>
                    <div className="text-[10px]" style={{ color: N500 }}>{opt.desc}</div>
                  </div>
                  {active && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3" style={{ background: CREAM }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold" style={{ color: VDK }}>Ask anything about your research</p>
            <p className="text-[11px]" style={{ color: N500 }}>
              Pulls insights from{" "}
              {source === "trends" ? "Innovatr trend reports" : source === "research" ? "your research studies" : "trend reports + your research"}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div
                className="max-w-[85%] px-3 py-2 rounded-xl text-sm text-white"
                style={{ background: accentColor }}
                data-testid={`ai-user-message-${i}`}
              >
                {msg.text}
              </div>
            ) : (
              <div className="w-full">
                {msg.error ? (
                  <div
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{ background: "#FDECEA", color: "#E8503A", border: "1px solid #FBBEBE" }}
                  >
                    {msg.error}
                  </div>
                ) : msg.response ? (
                  <AIResponseCard response={msg.response} />
                ) : null}
              </div>
            )}
          </div>
        ))}

        {query.isPending && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit" style={{ background: "#fff", border: `1px solid ${N200}` }}>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ color: accentColor }} />
            <span className="text-xs" style={{ color: N500 }}>Analysing reports…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && messages.length === 0 && (
        <div
          className="flex-shrink-0 px-3 py-2 flex flex-wrap gap-1.5"
          style={{ background: "#F5EFE4", borderTop: `1px solid ${N200}` }}
        >
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{ background: "#fff", border: `1px solid ${N200}`, color: N500 }}
              data-testid={`ai-prompt-${i}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ background: "#fff", borderTop: `1px solid ${N200}` }}
      >
        <input
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: VDK }}
          placeholder={`Ask ${label}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !query.isPending && handleSend()}
          disabled={query.isPending}
          data-testid="input-ai-query"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || query.isPending}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: accentColor }}
          data-testid="button-send-ai-query"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
