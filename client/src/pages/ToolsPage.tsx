import { useState, useMemo, useEffect, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { User } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";
import videoInterest from "@assets/Interest_1774882359570.webm";
import videoCommitment from "@assets/Commitment_1774882359568.webm";
import videoEmoji from "@assets/EMOJI_1774882359569.webm";
import videoHeatmap from "@assets/HEATMAP_1774882359569.webm";
import dashMarketSimulator from "@assets/Market_Simulator_1774881205705.avif";
import dashIdeaMap from "@assets/Idea_Map_1774881205703.avif";
import dashIdeaScore from "@assets/Idea_Score_1774881205703.avif";
import dashQuadrantChart from "@assets/Quadrant_Chart_1774881205706.avif";
import dashFilters from "@assets/Filters_1774881205696.avif";

import gamifiedRespondentImg from "@assets/IMG_8480_1768743786622.jpeg";
import emotionalAppealImg from "@assets/IMG_8482_1768743819583.jpeg";
import marketShareImg2 from "@assets/IMG_8483_1768743852255.jpeg";
import aiQualImg2 from "@assets/IMG_8492_1768744027913.jpeg";
import dashboardImg from "@assets/IMG_8494_1768744362356.jpeg";
import heatmapImg from "@assets/image_1768991760693.png";

import agileImg1 from "@assets/IMG_8495_1768760848107.jpeg";
import agileImg2 from "@assets/IMG_8498_1768760848107.jpeg";
import agileImg3 from "@assets/IMG_8500_1768760848107.jpeg";
import agileImg4 from "@assets/IMG_8497_1768760848107.jpeg";
import agileImg5 from "@assets/IMG_8496_1768760848107.jpeg";
import agileImg6 from "@assets/IMG_8501_1768760848107.jpeg";
import heroFlaskImg from "@assets/education,_healthcare___formula,_receipe,_test_tube,_medical,__1774951123255.png";
import agileImg7 from "@assets/IMG_8503_1768760848107.jpeg";
import agileImg8 from "@assets/IMG_8502_1768760848107.jpeg";
import agileImg9 from "@assets/IMG_8504_1768760848107.jpeg";
import agileImg10 from "@assets/IMG_8508_1768760848107.jpeg";
import agileImg11 from "@assets/IMG_8507_1768760848107.jpeg";
import agileImg12 from "@assets/IMG_8510_1768760848107.jpeg";
import agileImg13 from "@assets/IMG_8512_1768760848107.jpeg";
import agileImg14 from "@assets/IMG_8509_1768760848107.jpeg";
import agileImg15 from "@assets/IMG_8511_1768760848107.jpeg";
import agileImg16 from "@assets/IMG_8505_1768760848107.jpeg";
import agileImg17 from "@assets/IMG_8506_1768760848107.jpeg";
import agileImg18 from "@assets/IMG_8499_1768760848107.jpeg";

const agileDesignImages = [
  agileImg1, agileImg2, agileImg3, agileImg4, agileImg5, agileImg6,
  agileImg7, agileImg8, agileImg9, agileImg10, agileImg11, agileImg12,
  agileImg13, agileImg14, agileImg15, agileImg16, agileImg17, agileImg18
];

const BRAND = {
  violet: "#3A2FBF",
  violetLight: "#5448D8",
  coral: "#E8503A",
  cyan: "#4EC9E8",
  amber: "#F5C842",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
  darkMid: "#1A1535",
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Consult", href: "/consult" },
  { label: "Research", href: "/research" },
  { label: "Our Tools", href: "/tools" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact", href: "/contact" },
];

interface Tool {
  id: string;
  name: string;
  headlineTitle: string;
  whatText: string;
  whyText: string;
  image: string | null;
  video?: string;
  imagePosition?: string;
  isCarousel?: boolean;
  comingSoon?: boolean;
  accent: string;
}

const tools: Tool[] = [
  {
    id: "private-dashboard",
    name: "Private Dashboards",
    headlineTitle: "Intuitive, researcher-built dashboards",
    whatText: "Intuitive, researcher-built dashboards where you can watch results roll in live. Built by Dig Insights, Upsiide mirrors how insights teams actually think, explore data, and connect the dots in real time.",
    whyText: "Seeing results as they happen means faster learning, clearer stories, and quicker decisions — all powered by dashboards designed by researchers, not just developers.",
    image: dashboardImg,
    accent: BRAND.violet,
  },
  {
    id: "social-media",
    name: "Social Media Feel",
    headlineTitle: "Mobile-first, intuitive respondent experience",
    whatText: "A mobile-first, intuitive respondent experience designed to feel more like social media than a traditional survey. Simple, familiar interactions keep people engaged and moving naturally through the task.",
    whyText: "When it doesn't feel like a survey, people respond more instinctively and honestly — leading to higher engagement, faster completion, and better-quality data you can trust.",
    image: emotionalAppealImg,
    accent: BRAND.coral,
  },
  {
    id: "filtering",
    name: "Filtering",
    headlineTitle: "Powerful, interlocking filters",
    whatText: "Powerful, interlocking filters that make it easy to identify and explore your target consumer. Apply multiple filters across demographics, behaviours, and attitudes to slice results exactly the way you need.",
    whyText: "Multi-layered filtering lets you uncover sharper insights, spot meaningful differences between audiences, and make confident decisions based on the consumers that matter most.",
    image: gamifiedRespondentImg,
    accent: BRAND.cyan,
  },
  {
    id: "heatmapping",
    name: "Heat Mapping",
    headlineTitle: "Interactive heatmap engagement",
    whatText: "An interactive heatmap that lets consumers engage directly with your ideas. People highlight specific elements they like and dislike, with in-the-moment feedback tied to each interaction.",
    whyText: "The visual heatmap instantly reveals what's working and what's not, while verbatim feedback explains why — giving clear, actionable direction on what to refine, fix, or amplify.",
    image: heatmapImg,
    imagePosition: "object-left",
    accent: BRAND.amber,
  },
  {
    id: "market-simulator",
    name: "Market Share Simulator",
    headlineTitle: "Predict Market Share with Precision",
    whatText: "Proprietary, patented data modeling that converts respondent data into forecasts of share of choice, source of volume, incrementality and cannibalization.",
    whyText: "The brands that consistently outperform their categories don't take more risks — they take better-informed ones. Know your market potential before you commit a single rand.",
    image: marketShareImg2,
    accent: BRAND.violet,
  },
  {
    id: "ai-qual",
    name: "AI Qual",
    headlineTitle: "Empathy at Scale via AI Video Interview",
    whatText: "Powered by AI, an intelligent qualitative moderator that understands your information objectives and conducts a naturalistic interview — summarising the learnings with a show reel.",
    whyText: "Your team is fast. The market is faster. Innovatr's AI Qual makes sure the consumer's voice is always in the room — on demand, at the speed of business.",
    image: aiQualImg2,
    comingSoon: true,
    accent: BRAND.coral,
  },
  {
    id: "one-clique",
    name: "Cultural Context Engine",
    headlineTitle: "AI-powered cultural intelligence",
    whatText: "OneCliq harnesses the power of AI to decode tone, sentiment, and emotional context from online conversations and social media — synthesising real consumer perspectives into a clear, culturally-aware view of how your ideas are perceived.",
    whyText: "By adding real-time cultural context, OneCliq helps brands make faster, smarter decisions — understanding not just what consumers think, but how they feel and why.",
    image: dashboardImg,
    comingSoon: true,
    accent: BRAND.cyan,
  },
  {
    id: "design",
    name: "Agile Design",
    headlineTitle: "Bring your concept to life with Agile Design",
    whatText: "Creatively led, results driven. With offices and clients across the Middle East, Europe, and beyond. From artisanal brands to retail powerhouses.",
    whyText: "Our designs are not just Instagram-worthy, but also highly effective. Beautiful design that sells.",
    image: null,
    isCarousel: true,
    accent: BRAND.amber,
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 32, height: 32 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: BRAND.violet,
            position: "absolute",
            top: 2,
            left: 0,
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: BRAND.coral,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 22,
          fontWeight: 400,
          color: BRAND.dark,
          letterSpacing: "-0.01em",
        }}
      >
        Innovatr
      </span>
    </div>
  );
}

function ImageCarousel({ images }: { images: string[] }) {
  const shuffled = useMemo(() => shuffleArray(images), []);
  const duped = [...shuffled, ...shuffled, ...shuffled];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 12 }}>
      <div
        style={{
          display: "flex",
          height: "100%",
          position: "absolute",
          left: 0,
          top: 0,
          animation: "scrollLeft 25s linear infinite",
        }}
      >
        {duped.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Design portfolio"
            loading="lazy"
            style={{ height: "100%", width: "auto", flexShrink: 0, objectFit: "cover", minWidth: 200 }}
          />
        ))}
      </div>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}

function ToolCard({ tool, index, onSelect }: { tool: Tool; index: number; onSelect: (t: Tool) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-testid={`tool-card-${tool.id}`}
      onClick={() => onSelect(tool)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${BRAND.dark}08`,
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 32px rgba(13,11,31,0.10)"
          : "0 2px 8px rgba(13,11,31,0.04)",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column" as const,
      }}
    >
      <div
        style={{
          height: 200,
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${BRAND.offWhite}, #eee)`,
          borderRadius: "16px 16px 0 0",
        }}
      >
        {tool.isCarousel ? (
          <ImageCarousel images={agileDesignImages} />
        ) : tool.image ? (
          <img
            src={tool.image}
            alt={tool.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: tool.imagePosition === "object-left" ? "left center" : "center",
              transition: "transform 0.5s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : null}

        {tool.comingSoon && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: BRAND.violet,
              color: "#fff",
              fontSize: 10,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
              padding: "4px 10px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Coming Soon
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
          }}
        />
      </div>

      <div style={{ padding: "16px 20px 20px", flex: 1, display: "flex", flexDirection: "column" as const }}>
        <div
          style={{
            width: 32,
            height: 3,
            borderRadius: 2,
            background: tool.accent,
            marginBottom: 12,
          }}
        />
        <h3
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 18,
            color: BRAND.dark,
            margin: 0,
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {tool.name}
        </h3>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: `${BRAND.dark}cc`,
            margin: 0,
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {tool.headlineTitle}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: tool.accent,
              letterSpacing: "0.02em",
            }}
          >
            Learn more
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: tool.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpandedToolModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      data-testid={`modal-tool-${tool.id}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(13,11,31,0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          maxWidth: 900,
          width: "100%",
          maxHeight: "72vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(13,11,31,0.2)",
          animation: "slideUp 0.35s ease",
          position: "relative",
        }}
      >
        {/* Close button — anchored to modal box, always visible */}
        <button
          data-testid={`button-close-modal-${tool.id}`}
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BRAND.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image / video / carousel — fixed height, never scrolls */}
        {(tool.isCarousel || tool.video || tool.image) && (
          <div style={{ flexShrink: 0, position: "relative" }}>
            {tool.isCarousel ? (
              <div style={{ height: 220, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
                <ImageCarousel images={agileDesignImages} />
              </div>
            ) : tool.video ? (
              <div style={{ height: 220, borderRadius: "20px 20px 0 0", overflow: "hidden", background: "#f8f7f4" }}>
                {tool.video.includes(".gif") ? (
                  <img src={tool.video} alt={tool.name} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
                ) : (
                  <video src={tool.video} autoPlay loop muted playsInline preload="none" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }} />
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, #fff, transparent)" }} />
              </div>
            ) : (
              <div style={{ height: 220, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
                <img
                  src={tool.image ?? undefined}
                  alt={tool.name}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: tool.imagePosition === "object-left" ? "left center" : "center" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, #fff, transparent)" }} />
              </div>
            )}
            {tool.comingSoon && (
              <div style={{ position: "absolute", top: 16, left: 16, background: BRAND.violet, color: "#fff", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", padding: "5px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Coming Soon
              </div>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "32px 40px 40px" }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: tool.accent,
              marginBottom: 16,
            }}
          />

          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 32,
              color: BRAND.dark,
              margin: 0,
              marginBottom: 4,
              lineHeight: 1.2,
            }}
          >
            {tool.name}
          </h2>
          <p
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              color: `${BRAND.dark}cc`,
              margin: 0,
              marginBottom: 32,
              lineHeight: 1.3,
              fontStyle: "italic" as const,
            }}
          >
            {tool.headlineTitle}
          </p>

          <div className="ir-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  color: tool.accent,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                What
              </span>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: `${BRAND.dark}cc`,
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {tool.whatText}
              </p>
            </div>

            <div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.12em",
                  color: tool.accent,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Why It Matters
              </span>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: `${BRAND.dark}cc`,
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {tool.whyText}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              paddingTop: 24,
              borderTop: `1px solid ${BRAND.dark}08`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <a
              href="/research"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: BRAND.violet,
                textDecoration: "none",
              }}
            >
              See how we Test Ideas in 24hrs &rarr;
            </a>
            <button
              onClick={onClose}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: tool.accent,
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    id: "interest",
    label: "Interest",
    title: "Interest",
    video: videoInterest,
    bullets: [
      "Consumers encounter your innovation; in an instant they lean in or move on.",
      "Upsiide swiping reveals consumers' intuitive (or System 1 if you prefer) reaction to your ideas.",
      "This interface allows us to test many ideas in a single study.",
      "Do you have a long list of ideas? Do you want to include competitive benchmarks? No problem. And no extra cost.",
    ],
  },
  {
    id: "commitment",
    label: "Commitment",
    title: "Commitment",
    video: videoCommitment,
    bullets: [
      "Consumers need to weigh their options, choosing between your innovation or a competing alternative.",
      "Upsiide presents consumers with ideas that they find appealing and asks them to identify their favorite. Most innovation testing misses the importance of commitment and endorses ideas with broad but weak appeal. Identifying ideas that can win vs. competition is central to our test.",
    ],
  },
  {
    id: "emojis",
    label: "Emojis",
    title: "Emojis",
    video: videoEmoji,
    bullets: [
      "To understand how people feel about your innovations, we created a set of 24 emojis based on Robert Plutchik's wheel of emotions.",
      "This allows us to dig deeper into drivers of strong or weak performance of your ideas while maintaining an experience that feels like social media, not a survey.",
    ],
  },
  {
    id: "heatmap",
    label: "Heat map",
    title: "Heat map",
    video: videoHeatmap,
    bullets: [
      "Heatmap allows consumers to engage directly with your ideas. Consumers highlight specific elements that they like and that they dislike, providing feedback for each element.",
      "The resulting heatmap visualizes the strengths and weaknesses of your ideas. The verbatims provide direction on what to consider.",
    ],
  },
];

function SocialMediaSection() {
  const [activeTab, setActiveTab] = useState("interest");
  const active = FEATURES.find((f) => f.id === activeTab) || FEATURES[0];

  return (
    <div style={{ padding: "0 32px" }}>
      <div
        className="ir-two-col"
        style={{
          background: "#fff",
          borderRadius: 20,
          border: `1px solid ${BRAND.dark}08`,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
        }}
      >
          <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column" as const, justifyContent: "space-between" }}>
            <div>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.14em",
                  color: BRAND.coral,
                  display: "block",
                  marginBottom: 16,
                }}
              >
                Powered by Upsiide
              </span>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 36,
                  color: BRAND.dark,
                  margin: "0 0 8px",
                  lineHeight: 1.15,
                }}
              >
                Social media-feel.
                <br />
                Smarter innovation insights.
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: BRAND.dark,
                  margin: "20px 0 12px",
                  lineHeight: 1.5,
                }}
              >
                Upsiide delivers a social-media experience for respondents and powerful, patented data modeling for researchers.
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: `${BRAND.dark}cc`,
                  margin: "0 0 32px",
                  lineHeight: 1.7,
                }}
              >
                Our unique mix of behavioral and attitudinal data enables Upsiide to forecast the potential of your ideas in market and to identify optimization opportunities.
              </p>
            </div>
            <div>
              <a
                href="https://diginsights.com/platform/upsiide"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: BRAND.dark,
                  background: "transparent",
                  border: `1.5px solid ${BRAND.dark}`,
                  borderRadius: 8,
                  padding: "10px 24px",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "opacity 0.2s",
                }}
              >
                See the platform
              </a>
            </div>
          </div>

          <div style={{ padding: "40px 48px 48px", borderLeft: `1px solid ${BRAND.dark}06` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: `${BRAND.dark}cc`,
                  marginRight: 8,
                }}
              >
                Features:
              </span>
              {FEATURES.map((f) => (
                <button
                  key={f.id}
                  data-testid={`tab-feature-${f.id}`}
                  onClick={() => setActiveTab(f.id)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: activeTab === f.id ? 600 : 400,
                    color: activeTab === f.id ? "#fff" : BRAND.dark,
                    background: activeTab === f.id ? BRAND.dark : "transparent",
                    border: `1.5px solid ${activeTab === f.id ? BRAND.dark : `${BRAND.dark}20`}`,
                    borderRadius: 20,
                    padding: "6px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="ir-two-col" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    borderRadius: 20,
                    overflow: "hidden",
                    boxShadow: "0 16px 56px rgba(13,11,31,0.18)",
                  }}
                >
                  {active.video && (
                    <video
                      key={active.id}
                      src={active.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 24,
                    color: BRAND.dark,
                    margin: "0 0 16px",
                    lineHeight: 1.2,
                  }}
                >
                  {active.title}
                </h3>
                <ul
                  style={{
                    margin: 0,
                    padding: "0 0 0 18px",
                    listStyle: "disc",
                  }}
                >
                  {active.bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: `${BRAND.dark}cc`,
                        lineHeight: 1.65,
                        marginBottom: 10,
                      }}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

const DASHBOARD_FEATURES = [
  {
    id: "market-simulator",
    label: "Market Simulator",
    title: "Proprietary Market Simulator",
    description: "Market Simulator is Dig Insights' proprietary, patented data modeling that converts Upsiide data into forecasts of share of choice, source of volume, incrementality and cannibalization.",
    highlight: "This is the data you need to make compelling business decisions.",
    image: dashMarketSimulator,
  },
  {
    id: "idea-map",
    label: "Idea Map",
    title: "Idea Map",
    description: "The Idea Map groups ideas that were liked by the same people. When you are testing multiple ideas, it highlights innovation territories. When you are testing your ideas vs. in-market competitors, it visualizes the competitive set and source of volume.",
    highlight: "",
    image: dashIdeaMap,
  },
  {
    id: "idea-score",
    label: "Idea Score",
    title: "Idea Score",
    description: "Idea Score is a single metric derived from Interest (swipe right) and Commitment (choice between two liked ideas). Across a number of categories, Idea Score has been proven to predict in-market performance.",
    highlight: "",
    image: dashIdeaScore,
  },
  {
    id: "quadrant-chart",
    label: "Quadrant Chart",
    title: "Quadrant Chart",
    description: "The Quadrant Chart highlights the potential of your ideas in the context of all ideas tested. You can quickly understand which ideas are 'Compelling' — many people like them and are loyal to them, which are 'Niche' — they've got a small but loyal audience, which are 'Vulnerable' — a lot of people like them, but there is low loyalty, and which need a 'Rethink' — few people like them and loyalty is low.",
    highlight: "",
    image: dashQuadrantChart,
  },
  {
    id: "filters",
    label: "Filters",
    title: "Filtered",
    description: "Identifying your target consumer is easy with Upsiide's powerful interlocking filters.",
    highlight: "",
    image: dashFilters,
  },
];

function DashboardSection() {
  const [activeTab, setActiveTab] = useState("market-simulator");
  const active = DASHBOARD_FEATURES.find((f) => f.id === activeTab) || DASHBOARD_FEATURES[0];

  return (
    <div style={{ padding: "0 32px" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          border: `1px solid ${BRAND.dark}08`,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "40px 48px 0" }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase" as const,
              letterSpacing: "0.14em",
              color: BRAND.coral,
              display: "block",
              marginBottom: 10,
            }}
          >
            Research Dashboard
          </span>
          <h3
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26,
              color: BRAND.dark,
              margin: "0 0 24px",
              lineHeight: 1.2,
              maxWidth: 560,
            }}
          >
            Inspiring Data Visualizations and Modeling in Your Dashboard
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: `${BRAND.dark}cc`,
                marginRight: 8,
              }}
            >
              Features:
            </span>
            {DASHBOARD_FEATURES.map((f) => (
              <button
                key={f.id}
                data-testid={`tab-dashboard-${f.id}`}
                onClick={() => setActiveTab(f.id)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: activeTab === f.id ? 600 : 400,
                  color: activeTab === f.id ? "#fff" : BRAND.dark,
                  background: activeTab === f.id ? BRAND.dark : "transparent",
                  border: `1.5px solid ${activeTab === f.id ? BRAND.dark : `${BRAND.dark}20`}`,
                  borderRadius: 20,
                  padding: "6px 18px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="ir-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 0,
            padding: "40px 0 0",
          }}
        >
          <div style={{ padding: "0 40px 48px 48px" }}>
            <h4
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 20,
                color: BRAND.dark,
                margin: "0 0 12px",
                lineHeight: 1.2,
              }}
            >
              {active.title}
            </h4>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: `${BRAND.dark}cc`,
                margin: "0 0 12px",
                lineHeight: 1.7,
              }}
            >
              {active.description}
            </p>
            {active.highlight && (
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: BRAND.dark,
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {active.highlight}
              </p>
            )}
          </div>

          <div
            style={{
              borderRadius: "16px 0 0 0",
              overflow: "hidden",
              background: BRAND.offWhite,
              border: `1px solid ${BRAND.dark}06`,
              borderRight: "none",
              borderBottom: "none",
            }}
          >
            {active.image && (
              <img
                src={active.image}
                alt={active.title}
                loading="lazy"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
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
        @media (max-width: 768px) { .footer-top { flex-direction: column !important; gap: 32px !important; } }
      `}</style>
    </footer>
  );
}

export default function ResearchTools() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useSEO({
    title: "Consumer Research Tools",
    description: "Explore Innovatr's proprietary research tools — emoji testing, interest tracking, heatmaps, market simulation, and idea mapping — all in one platform.",
    canonicalUrl: "https://www.innovatr.co.za/tools",
  });

  return (
    <div style={{ background: BRAND.offWhite, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <PublicNavbar activePage="Our Tools" />
      <main>
      <section
        aria-label="Hero"
        style={{
          background: "#fff",
          paddingTop: 140,
          paddingBottom: 80,
          borderBottom: `1px solid ${BRAND.dark}0D`,
        }}
      >
        <div className="ir-hero-grid" style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          gap: 80,
        }}>
          {/* Left column — text */}
          <div style={{ flex: "1 1 0" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.coral}18`, border: `1px solid ${BRAND.coral}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, background: BRAND.coral, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: BRAND.coral, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                Our Tools
              </span>
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(2.8rem, 4.5vw, 4rem)",
              color: BRAND.dark,
              margin: "0 0 22px",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}>
              Transforming how insights are{" "}
              <span style={{ color: BRAND.violet }}>uncovered and measured.</span>
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 17,
              color: `${BRAND.dark}cc`,
              margin: "0 0 36px",
              lineHeight: 1.75,
              maxWidth: 480,
            }}>
              Advanced analytics and AI data visualization turn raw impulse data into predictive patterns, highlighting true in-market potential.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" as const }}>
              <a
                href="/test24-basic"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: BRAND.coral,
                  borderRadius: 8,
                  padding: "12px 28px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.transform = "scale(1.03)";
                  (e.currentTarget).style.boxShadow = `0 8px 24px ${BRAND.coral}55`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.transform = "scale(1)";
                  (e.currentTarget).style.boxShadow = "none";
                }}
              >
                See how we Test Ideas in 24hrs
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#tools-section"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: BRAND.violet,
                  background: "transparent",
                  border: `1.5px solid ${BRAND.violet}`,
                  borderRadius: 8,
                  padding: "12px 28px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}08`; }}
                onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
              >
                Explore the toolkit
              </a>
            </div>
          </div>

          {/* Right column — illustration */}
          <div className="ir-hero-img-wrap" style={{
            flex: "0 0 420px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img
              src={heroFlaskImg}
              alt="Research tools illustration"
              style={{
                width: "100%",
                maxWidth: 420,
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      <section id="tools-section" aria-label="Research tools" style={{ padding: "56px 0 64px", borderTop: `1px solid ${BRAND.dark}0D` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 48 }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.14em",
                color: BRAND.coral,
                display: "block",
                marginBottom: 12,
              }}
            >
              The Tools
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 36,
                color: BRAND.dark,
                margin: "0 0 12px",
                lineHeight: 1.2,
              }}
            >
              Turn Insights into{" "}
              <span style={{ fontWeight: 700 }}>evidence based</span> decisions.
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: `${BRAND.dark}bb`,
                margin: "0 auto",
                maxWidth: 500,
                lineHeight: 1.6,
              }}
            >
              Our proprietary toolkit accelerates every phase of research — from hypothesis to action.
            </p>
          </div>

          <div
            className="ir-tool-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
            }}
          >
            {tools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                index={index}
                onSelect={setSelectedTool}
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-label="How it works" style={{ padding: "48px 0 64px", background: BRAND.offWhite, borderTop: `1px solid ${BRAND.dark}0D` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 48, padding: "0 32px" }}>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.14em",
                color: BRAND.coral,
                display: "block",
                marginBottom: 12,
              }}
            >
              Platform Deep Dive
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 36,
                color: BRAND.dark,
                margin: "0 0 14px",
                lineHeight: 1.2,
              }}
            >
              Everything you need to go from idea to decision.
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16,
                color: `${BRAND.dark}bb`,
                margin: "0 auto",
                maxWidth: 520,
                lineHeight: 1.65,
              }}
            >
              Upsiide's platform combines a social-media-feel respondent experience with powerful proprietary analytics — so you get better data and smarter decisions, faster.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
            <SocialMediaSection />
            <DashboardSection />
          </div>
        </div>
      </section>

      <section
        aria-label="Platform highlights"
        style={{
          padding: "48px 0 64px",
          background: BRAND.offWhite,
          borderTop: `1px solid ${BRAND.dark}0D`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        <div
          className="ir-card-grid-2"
          style={{
            background: "#fff",
            borderRadius: 20,
            border: `1px solid ${BRAND.dark}08`,
            padding: "48px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.14em",
                color: BRAND.coral,
                display: "block",
                marginBottom: 12,
              }}
            >
              Powered By
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 32,
                color: BRAND.dark,
                margin: "0 0 16px",
                lineHeight: 1.2,
              }}
            >
              Built on world-class
              <br />
              research infrastructure
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: `${BRAND.dark}cc`,
                margin: "0 0 24px",
                lineHeight: 1.7,
                maxWidth: 440,
              }}
            >
              Our tools are powered by Upsiide, the innovation insights platform from Dig Insights
              — trusted by leading brands globally. Combined with our local expertise, we bring
              world-class capability to every project.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a
                href="/contact"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: BRAND.violet,
                  borderRadius: 8,
                  padding: "10px 24px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Talk to Us
              </a>
              <a
                href="/research#our-offering"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: BRAND.violet,
                  background: "transparent",
                  border: `1.5px solid ${BRAND.violet}`,
                  borderRadius: 8,
                  padding: "10px 24px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                View Pricing
              </a>
            </div>
          </div>

          <style>{`
            @keyframes stat-orbit {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            .stat-card {
              position: relative;
              padding: 3px;
              border-radius: 16px;
              overflow: hidden;
              cursor: default;
              transition: transform 0.3s ease;
            }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-glow {
              position: absolute;
              width: 160%;
              aspect-ratio: 1;
              top: 50%; left: 50%;
              translate: -50% -50%;
              border-radius: 50%;
              filter: blur(28px);
              animation: stat-orbit 6s linear infinite;
              pointer-events: none;
              z-index: 0;
              opacity: 0;
              transition: opacity 0.4s ease;
            }
            .stat-card:hover .stat-glow { opacity: 0.9; animation-duration: 3s; }
            .stat-inner {
              position: relative;
              z-index: 1;
              background: ${BRAND.offWhite};
              border-radius: 13px;
              padding: 28px 24px;
              height: 100%;
              box-sizing: border-box;
            }
            .stat-glow-violet {
              background: conic-gradient(from 0deg, ${BRAND.violet}cc, ${BRAND.coral}cc, ${BRAND.cyan}cc, ${BRAND.violet}cc, ${BRAND.violet}cc);
            }
            .stat-glow-coral {
              background: conic-gradient(from 0deg, ${BRAND.coral}cc, ${BRAND.amber}cc, ${BRAND.violet}cc, ${BRAND.coral}cc, ${BRAND.coral}cc);
            }
            .stat-glow-cyan {
              background: conic-gradient(from 0deg, ${BRAND.cyan}cc, ${BRAND.violet}cc, ${BRAND.amber}cc, ${BRAND.cyan}cc, ${BRAND.cyan}cc);
            }
            .stat-glow-amber {
              background: conic-gradient(from 0deg, ${BRAND.amber}cc, ${BRAND.cyan}cc, ${BRAND.coral}cc, ${BRAND.amber}cc, ${BRAND.amber}cc);
            }
          `}</style>
          <div className="ir-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { num: "200+", label: "Studies Delivered", bg: BRAND.violet, numColor: "#fff",        labelColor: "rgba(255,255,255,0.65)", glowClass: "stat-glow-violet" },
              { num: "25+",  label: "Markets Covered",   bg: BRAND.coral,  numColor: "#fff",        labelColor: "rgba(255,255,255,0.65)", glowClass: "stat-glow-coral"  },
              { num: "44M+", label: "Consumer Panel",    bg: BRAND.cyan,   numColor: BRAND.dark,    labelColor: `${BRAND.dark}cc`,        glowClass: "stat-glow-cyan"   },
              { num: "10+",  label: "Industries",        bg: BRAND.amber,  numColor: BRAND.dark,    labelColor: `${BRAND.dark}cc`,        glowClass: "stat-glow-amber"  },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`stat-glow ${s.glowClass}`} />
                <div className="stat-inner" style={{ background: s.bg }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: s.numColor, marginBottom: 4 }}>
                    {s.num}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: s.labelColor }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>
      </main>
      <InnovatrFooter />

      {selectedTool && (
        <ExpandedToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}
