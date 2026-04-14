import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { User } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import foldersImg from "@assets/Case_Studies_1774880110115.png";
import dgbImg from "@assets/case-study-dgb.png";
import namibianImg from "@assets/case-study-namibian.png";
import discoveryImg from "@assets/case-study-discovery.png";
import rainImg from "@assets/case-study-rain.png";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  cyan: "#4EC9E8",
  amber: "#F5C842",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Consult", href: "/consult" },
  { label: "Research", href: "/research" },
  { label: "Our Tools", href: "/tools" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact", href: "/contact" },
];

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);
  return scrolled;
}

const PHASE_CONFIG = [
  {
    id: "all",
    label: "All Work",
    color: BRAND.dark,
  },
  {
    id: "strategy",
    label: "Strategy & Direction",
    color: BRAND.violet,
  },
  {
    id: "innovation",
    label: "Innovation & Testing",
    color: BRAND.coral,
  },
  {
    id: "execution",
    label: "Execution & Scale",
    color: BRAND.cyan,
  },
];

const PHASE_DESCRIPTIONS: Record<string, string> = {
  all: "200+ studies. 25+ markets. Every engagement built on real consumer intelligence and a genuine drive to make growth happen — not just to deliver a report.",
  strategy: "Define where to play and identify growth opportunities before a single resource is committed.",
  innovation: "Develop and validate winning concepts with consumers — so only the best ideas move forward.",
  execution: "Launch and grow with confidence, knowing every decision is grounded in evidence.",
};

interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  headline: string;
  problemShort: string;
  results: string;
  phases: string[];
  duration: string;
  highlight: string;
  accentColor: string;
  visualType: "bars" | "waves" | "nodes" | "curve";
  image?: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "dgb",
    client: "DGB",
    industry: "Alcohol",
    headline: "Transforming a Business for Growth with a Disruptive 3-Year Pipeline",
    problemShort:
      "Portfolio lacked clear direction across demand spaces, limiting growth potential against modern competitors.",
    results:
      "7 distinct innovation projects approved for the development pipeline. Robust 18–36 month innovation planning secured. Client requested Innovatr to lead end-to-end NPD execution.",
    phases: ["strategy", "innovation"],
    duration: "70 Days",
    highlight: "7 Pipeline Projects",
    accentColor: BRAND.coral,
    visualType: "bars",
    image: dgbImg,
  },
  {
    slug: "namibian-breweries",
    client: "Namibian Breweries",
    industry: "Beverages",
    headline: "Launching & Landing the Non-Alcoholic Category in Namibia",
    problemShort:
      "Emerging category with undefined positioning and consumer ambiguity in a crowded market.",
    results:
      "Full launch campaign executed with complete Through-The-Line creative toolkit. Established regional benchmark for cross-brand portfolio launches.",
    phases: ["strategy", "execution"],
    duration: "27 Days",
    highlight: "Regional Benchmark",
    accentColor: BRAND.cyan,
    visualType: "waves",
    image: namibianImg,
  },
  {
    slug: "rain",
    client: "Rain",
    industry: "Telecommunications",
    headline: "Defining Winning Market Entry Strategy Through Consumer Intelligence",
    problemShort:
      "Market dominated by established players with high barriers to entry and unclear value proposition.",
    results:
      "Clear pathway identified to capture substantial market position. Strategic category positioning validated through comprehensive consumer research with innovation development guidance.",
    phases: ["strategy"],
    duration: "3 Months",
    highlight: "Market Entry Roadmap",
    accentColor: BRAND.violet,
    visualType: "nodes",
    image: rainImg,
  },
  {
    slug: "discovery",
    client: "Discovery Bank",
    industry: "Financial Services",
    headline: "Unlocking Dormant Customer Value Through Engagement Research",
    problemShort:
      "Significant portion of inactive accounts with customers using bank for limited needs only.",
    results:
      "Strong emotional brand leadership confirmed vs competitors. High-potential product concepts validated as activation drivers with clear strategic roadmap delivered.",
    phases: ["strategy"],
    duration: "Comprehensive",
    highlight: "Emotional Leadership",
    accentColor: BRAND.amber,
    visualType: "curve",
    image: discoveryImg,
  },
];

const STATS = [
  { value: "27", unit: "days", label: "Fastest full TTL campaign launch" },
  { value: "7", unit: "projects", label: "Pipeline secured in a single engagement" },
  { value: "4", unit: "industries", label: "Sectors transformed with consumer intelligence" },
  { value: "200+", unit: "respondents", label: "Average consumer validation per project" },
];

function VisualBars({ accent }: { accent: string }) {
  const heights = [55, 80, 45, 95, 65, 75, 50, 88];
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={12 + i * 24}
          y={120 - h}
          width={14}
          height={h}
          rx={4}
          fill={i % 2 === 0 ? accent : `${accent}55`}
        />
      ))}
    </svg>
  );
}

function VisualWaves({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <path
        d="M0 80 Q25 50 50 70 T100 55 T150 65 T200 40 L200 120 L0 120 Z"
        fill={`${accent}30`}
      />
      <path
        d="M0 90 Q25 65 50 80 T100 70 T150 75 T200 55 L200 120 L0 120 Z"
        fill={`${accent}55`}
      />
      <path
        d="M0 60 Q50 30 100 55 T200 35"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {[0, 50, 100, 150, 200].map((x, i) => {
        const y = [60, 30, 55, 35, 35][i];
        return <circle key={i} cx={x} cy={y} r="4" fill={accent} />;
      })}
    </svg>
  );
}

function VisualNodes({ accent }: { accent: string }) {
  const nodes = [
    { x: 100, y: 60 },
    { x: 40, y: 30 },
    { x: 160, y: 30 },
    { x: 30, y: 90 },
    { x: 170, y: 90 },
    { x: 100, y: 110 },
  ];
  const lines = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 3], [2, 4],
  ];
  return (
    <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke={`${accent}40`}
          strokeWidth="1.5"
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === 0 ? 12 : 7}
          fill={i === 0 ? accent : `${accent}55`}
        />
      ))}
    </svg>
  );
}

function VisualCurve({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <path
        d="M10 100 Q50 90 80 70 T140 40 T190 15"
        fill="none"
        stroke={`${accent}40`}
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M10 100 Q50 90 80 70 T140 40 T190 15"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={190} cy={15} r={8} fill={accent} />
      <circle cx={80} cy={70} r={5} fill={`${accent}99`} />
      <circle cx={140} cy={40} r={5} fill={`${accent}99`} />
    </svg>
  );
}

function CaseStudyVisual({
  type,
  accent,
  client,
  industry,
  image,
}: {
  type: CaseStudy["visualType"];
  accent: string;
  client: string;
  industry: string;
  image?: string;
}) {
  if (image) {
    return (
      <div
        style={{
          borderRadius: 20,
          height: "100%",
          minHeight: 360,
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt={`${client} case study`}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 360,
            objectFit: "cover",
            display: "block",
          }}
        />
        {/* Gradient overlay for label legibility */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(13,11,31,0.72) 0%, transparent 55%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 24,
          left: 28,
          zIndex: 2,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.14em",
            color: accent,
            margin: "0 0 4px",
          }}>
            {industry}
          </p>
          <p style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 20,
            color: "#fff",
            margin: 0,
            lineHeight: 1.2,
          }}>
            {client}
          </p>
        </div>
      </div>
    );
  }

  const bg = `${accent}10`;
  return (
    <div
      style={{
        background: bg,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        height: "100%",
        minHeight: 360,
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: `${accent}12` }} />
      <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${accent}08` }} />
      <div style={{ width: "80%", maxWidth: 200, position: "relative" as const, zIndex: 1 }}>
        {type === "bars" && <VisualBars accent={accent} />}
        {type === "waves" && <VisualWaves accent={accent} />}
        {type === "nodes" && <VisualNodes accent={accent} />}
        {type === "curve" && <VisualCurve accent={accent} />}
      </div>
      <div style={{ marginTop: 24, textAlign: "center" as const, position: "relative" as const, zIndex: 1 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: accent, margin: "0 0 6px" }}>
          {industry}
        </p>
        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: BRAND.dark, margin: 0, lineHeight: 1.2 }}>
          {client}
        </p>
      </div>
    </div>
  );
}

function CaseStudyCard({
  cs,
  index,
  activePhase,
}: {
  cs: CaseStudy;
  index: number;
  activePhase: string;
}) {
  const isReversed = index % 2 === 1;
  const phaseColor =
    activePhase !== "all"
      ? PHASE_CONFIG.find((p) => p.id === activePhase)?.color ?? BRAND.violet
      : cs.accentColor;

  return (
    <div
      data-testid={`case-study-card-${cs.slug}`}
      className="ir-case-card"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 48,
        alignItems: "center",
        padding: "56px 0",
        borderBottom: `1px solid ${BRAND.dark}08`,
      }}
    >
      <div style={{ order: isReversed ? 2 : 1 }}>
        <CaseStudyVisual
          type={cs.visualType}
          accent={cs.accentColor}
          client={cs.client}
          industry={cs.industry}
          image={cs.image}
        />
      </div>

      <div style={{ order: isReversed ? 1 : 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.14em",
              color: cs.accentColor,
            }}
          >
            {cs.client}
          </span>
          <span style={{ color: `${BRAND.dark}30`, fontSize: 12 }}>•</span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: BRAND.dark,
              background: `${BRAND.dark}08`,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {cs.industry}
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: `${BRAND.dark}aa`,
              background: `${BRAND.dark}05`,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {cs.duration}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 32,
            fontStyle: "italic",
            color: BRAND.dark,
            lineHeight: 1.15,
            margin: "0 0 20px",
          }}
        >
          {cs.headline}
        </h2>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: `${BRAND.dark}cc`,
            lineHeight: 1.75,
            margin: "0 0 20px",
          }}
        >
          {cs.problemShort}
        </p>

        <div
          style={{
            background: `${cs.accentColor}10`,
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 4,
              height: 40,
              borderRadius: 2,
              background: cs.accentColor,
              flexShrink: 0,
              marginTop: 2,
            }}
          />
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.1em",
                color: `${BRAND.dark}99`,
                margin: "0 0 4px",
              }}
            >
              Key Result
            </p>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 22,
                color: cs.accentColor,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {cs.highlight}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href={`/case-study/${cs.slug}`}
            data-testid={`link-read-more-${cs.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: BRAND.dark,
              textDecoration: "none",
              borderBottom: `2px solid ${cs.accentColor}`,
              paddingBottom: 2,
              cursor: "pointer",
            }}
          >
            Read Full Case Study
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <div style={{ display: "flex", gap: 6 }}>
            {cs.phases.map((p) => {
              const phaseData = PHASE_CONFIG.find((pc) => pc.id === p);
              return (
                <span
                  key={p}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    color: phaseData?.color ?? BRAND.dark,
                    background: `${phaseData?.color ?? BRAND.dark}15`,
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  {phaseData?.label ?? p}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      aria-label="Hero"
      style={{
        background: BRAND.offWhite,
        padding: "140px 32px 56px",
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      {/* Light radial accents */}
      <div style={{ position: "absolute", top: -120, right: "5%", width: 600, height: 600, background: `radial-gradient(ellipse, ${BRAND.coral}08 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: "10%", width: 500, height: 500, background: `radial-gradient(ellipse, ${BRAND.violet}06 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          position: "relative" as const,
          zIndex: 1,
        }}
      >
        <div className="ir-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 500px", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.coral}18`, border: `1px solid ${BRAND.coral}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, background: BRAND.coral, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: BRAND.coral, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                The Results
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 68,
                lineHeight: 1.0,
                color: BRAND.dark,
                margin: "0 0 28px",
              }}
            >
              The proof is
              <br />
              <span style={{ color: BRAND.coral }}>always in</span>
              <br />
              the pudding.
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: `${BRAND.dark}bb`,
                margin: "0 0 40px",
                maxWidth: 480,
              }}
            >
              We don't lead with credentials. We lead with results. Every engagement
              we run is designed to unlock growth — and these are the stories that
              prove it.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
              <a
                href="#case-studies"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: BRAND.coral,
                  padding: "13px 28px",
                  borderRadius: 8,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Explore Case Studies
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: BRAND.dark,
                  background: "transparent",
                  padding: "13px 28px",
                  borderRadius: 8,
                  textDecoration: "none",
                  border: `1.5px solid ${BRAND.dark}22`,
                  cursor: "pointer",
                }}
              >
                Work With Us
              </a>
            </div>
          </div>

          <div className="ir-hero-img-wrap" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={foldersImg}
              alt="Consumer research data organised and ready"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseStudiesBody() {
  const [activePhase, setActivePhase] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab && ["strategy", "innovation", "execution"].includes(tab) ? tab : "all";
  });

  const filtered = CASE_STUDIES.filter(
    (cs) => activePhase === "all" || cs.phases.includes(activePhase)
  );

  return (
    <>
      {/* Header — white background for contrast */}
      <section aria-label="Filter controls" style={{ background: "#fff", borderBottom: `1px solid ${BRAND.dark}08` }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "100px 80px 52px",
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 44,
              color: BRAND.dark,
              margin: "0 0 16px",
              lineHeight: 1.1,
            }}
          >
            See how we transformed some of the world's
            <br />
            most ambitious brands.
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: `${BRAND.dark}bb`,
              margin: "0 0 40px",
              maxWidth: 500,
              lineHeight: 1.7,
            }}
          >
            {PHASE_DESCRIPTIONS[activePhase]}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, justifyContent: "center" }}>
            {PHASE_CONFIG.map((phase) => {
              const isActive = activePhase === phase.id;
              return (
                <button
                  key={phase.id}
                  data-testid={`toggle-phase-${phase.id}`}
                  onClick={() => setActivePhase(phase.id)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#fff" : BRAND.dark,
                    background: isActive ? phase.color : BRAND.offWhite,
                    border: `1.5px solid ${isActive ? phase.color : `${BRAND.dark}15`}`,
                    borderRadius: 24,
                    padding: "8px 22px",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    boxShadow: isActive ? `0 4px 16px ${phase.color}30` : "none",
                  }}
                >
                  {phase.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cards — white background */}
      <section id="case-studies" aria-label="Case study list" style={{ background: "#fff", paddingBottom: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 80px 0" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center" as const,
                padding: "80px 0",
                color: `${BRAND.dark}99`,
              }}
            >
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22 }}>
                No case studies in this phase yet.
              </p>
            </div>
          ) : (
            filtered.map((cs, i) => (
              <CaseStudyCard key={cs.slug} cs={cs} index={i} activePhase={activePhase} />
            ))
          )}
        </div>
      </section>
    </>
  );
}

function CTASection() {
  return (
    <section
      aria-label="Call to action"
      style={{
        background: "#fff",
        borderTop: `1px solid ${BRAND.dark}08`,
        padding: "96px 0",
      }}
    >
      <div
        className="ir-two-col"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 80px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.18em",
              color: BRAND.coral,
              display: "block",
              marginBottom: 14,
            }}
          >
            Want results like these?
          </span>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 42,
              color: BRAND.dark,
              margin: "0 0 14px",
              lineHeight: 1.1,
            }}
          >
            Let's build your growth story.
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: `${BRAND.dark}aa`,
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Every case study started with a single conversation. Yours can too.
          </p>
        </div>

        <div className="cta-btn-col" style={{ display: "flex", flexDirection: "column" as const, gap: 12, flexShrink: 0 }}>
          <a
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: BRAND.coral,
              padding: "14px 36px",
              borderRadius: 8,
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.transform = "scale(1.03)";
              (e.currentTarget).style.boxShadow = `0 8px 24px ${BRAND.coral}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.transform = "scale(1)";
              (e.currentTarget).style.boxShadow = "none";
            }}
            data-testid="button-cta-contact"
          >
            Get in Touch
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://calendly.com/richard-1220"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: BRAND.violet,
              padding: "14px 36px",
              borderRadius: 8,
              textDecoration: "none",
              cursor: "pointer",
              whiteSpace: "nowrap" as const,
              transition: "transform 0.18s, box-shadow 0.18s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.transform = "scale(1.03)";
              (e.currentTarget).style.boxShadow = `0 8px 24px ${BRAND.violet}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.transform = "scale(1)";
              (e.currentTarget).style.boxShadow = "none";
            }}
          >
            Book a Live Demo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="/research#membership"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: BRAND.violet,
              background: "transparent",
              padding: "14px 36px",
              borderRadius: 8,
              textDecoration: "none",
              cursor: "pointer",
              border: `1.5px solid ${BRAND.violet}`,
              whiteSpace: "nowrap" as const,
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}08`; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
          >
            Explore Memberships
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerNav = [
    { label: "Home", href: "/" },
    { label: "Consult", href: "/consult" },
    { label: "Research", href: "/research" },
    { label: "Tools", href: "/tools" },
    { label: "Contact", href: "/contact" },
  ];
  const socials = [
    { label: "Facebook", href: "https://web.facebook.com/innovatr1", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/innovatr/", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
    { label: "Instagram", href: "https://www.instagram.com/innovatr1/", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" },
  ];
  return (
    <footer style={{ background: BRAND.dark, color: "#fff", padding: "36px 32px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, paddingBottom: 24, flexWrap: "wrap" as const }} className="footer-top">
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src="/Innovatr_logo-01.png" alt="Innovatr" style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }} />
            </div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 22px" }}>
              Smart research in 24 hours. Built for brands that can't afford to guess.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 18 }}>Navigation</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {footerNav.map((link) => (
                <a key={link.label} href={link.href} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{link.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 18 }}>Offerings</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {[
                { label: "Test24 Basic", href: "/test24-basic" },
                { label: "Test24 Pro", href: "/test24-pro" },
                { label: "Intelligence", href: "/portal/trends" },
                { label: "Consult", href: "/consult" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{link.label}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 18 }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Use", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{link.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 28 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            © 2026 Innovatr. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
            <span style={{ fontFamily: '"DM Sans", monospace', fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>System Operational</span>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-top { flex-direction: column !important; gap: 32px !important; }
          .cta-btn-col { width: 100% !important; }
          .cta-btn-col > a { width: 100% !important; box-sizing: border-box !important; }
        }
      `}</style>
    </footer>
  );
}

export default function CaseStudies() {
  useSEO({
    title: "Client Case Studies",
    description: "See how Innovatr helped DGB, Namibian Breweries, Rain, and Discovery Bank unlock growth through fast, data-driven consumer research.",
    canonicalUrl: "https://www.innovatr.co.za/case-studies",
  });
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: BRAND.offWhite }}>
      <PublicNavbar activePage="Case Studies" />
      <main>
        <CaseStudiesBody />
        <CTASection />
      </main>
      <InnovatrFooter />
    </div>
  );
}
