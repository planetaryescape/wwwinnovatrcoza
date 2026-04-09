import { useEffect, useRef, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Timer, ClipboardCheck, BrainCircuit, Globe, User } from "lucide-react";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import mascotBasic from "@assets/Basic_1774944576263.png";
import mascotMember from "@assets/Member_1774944576265.png";
import mascotStarter from "@assets/Starter_1774884250090.png";
import mascotGrowth from "@assets/Growth_1774884250087.png";
import mascotScale from "@assets/Scale_1774884250090.png";
import personaTM from "@assets/personas/persona_tm.png";
import personaJK from "@assets/personas/persona_jk.png";
import personaNP from "@assets/personas/persona_np.png";
import personaDR from "@assets/personas/persona_dr.png";
import personaLW from "@assets/personas/persona_lw.png";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  cyan: "#4EC9E8",
  amber: "#F5C842",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
  darkMid: "#1A1535",
  violetLight: "#5448D8",
  violetMuted: "#3A2FBF22",
};

const CLIENTS = [
  "Nando's",
  "Rain",
  "DGB",
  "Tiger Brands",
  "Revlon",
  "SUNPAC",
  "ooba",
  "Netflorist",
  "Rugani Juice",
  "Clover",
  "Namibian Breweries",
  "Dairy Maid",
  "KWV",
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Consult", href: "/consult" },
  { label: "Research", href: "/research" },
  { label: "Our Tools", href: "/tools" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Contact", href: "/contact" },
];

const STATS = [
  { number: "200+", label: "Studies Delivered" },
  { number: "25+", label: "Markets" },
  { number: "44M+", label: "Consumer Panel" },
  { number: "10+", label: "Industries" },
];

function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useCountUp(target: number, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function Avatar({ initials, color, size = 44, style: extraStyle }: { initials: string; color: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"DM Sans", sans-serif',
      fontSize: size * 0.36,
      fontWeight: 700,
      color: "#fff",
      flexShrink: 0,
      border: `2.5px solid ${BRAND.offWhite}`,
      boxShadow: `0 2px 8px ${color}40`,
      ...extraStyle,
    }}>
      {initials}
    </div>
  );
}

function PersonaWithBubble({ src, color, size, message, direction = "left", bubbleDelay = 0 }: {
  src: string;
  color: string;
  size: number;
  message: string;
  direction?: "left" | "right";
  bubbleDelay?: number;
}) {
  return (
    <div style={{ position: "relative", display: "inline-block", paddingTop: 44 }}>
      {/* Chat bubble — single-line, pops in/out in sequence */}
      <div style={{
        position: "absolute",
        top: 0,
        ...(direction === "right" ? { left: -6 } : { right: -6 }),
        background: color,
        color: "#fff",
        borderRadius: direction === "right" ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
        padding: "7px 14px",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: '"DM Sans", sans-serif',
        whiteSpace: "nowrap",
        boxShadow: `0 4px 18px ${color}55`,
        lineHeight: 1.3,
        zIndex: 10,
        opacity: 1,
      }}>
        {message}
      </div>
      {/* Profile photo circle — always visible */}
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `3px solid ${BRAND.offWhite}`,
        boxShadow: `0 4px 18px ${color}35`,
        background: `${color}18`,
        position: "relative",
        zIndex: 2,
      }}>
        <img
          src={src}
          alt="persona"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
      </div>
    </div>
  );
}

function ResearchIllustration() {
  return (
    <svg viewBox="0 0 420 420" width="420" height="420" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0.18 }}>
      <circle cx="210" cy="210" r="180" fill="none" stroke={BRAND.violet} strokeWidth="0.8" strokeDasharray="6 4" />
      <circle cx="210" cy="210" r="130" fill="none" stroke={BRAND.cyan} strokeWidth="0.6" strokeDasharray="4 6" />
      <circle cx="210" cy="210" r="80" fill="none" stroke={BRAND.coral} strokeWidth="0.5" />

      <rect x="150" y="260" width="14" height="60" rx="3" fill={BRAND.violet} opacity="0.5" />
      <rect x="172" y="240" width="14" height="80" rx="3" fill={BRAND.cyan} opacity="0.5" />
      <rect x="194" y="220" width="14" height="100" rx="3" fill={BRAND.coral} opacity="0.5" />
      <rect x="216" y="250" width="14" height="70" rx="3" fill={BRAND.amber} opacity="0.5" />
      <rect x="238" y="230" width="14" height="90" rx="3" fill={BRAND.violet} opacity="0.4" />
      <rect x="260" y="260" width="14" height="60" rx="3" fill={BRAND.cyan} opacity="0.4" />

      <path d="M120 190 Q170 120 210 150 Q250 180 300 110" fill="none" stroke={BRAND.coral} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="120" cy="190" r="3" fill={BRAND.coral} />
      <circle cx="210" cy="150" r="3" fill={BRAND.coral} />
      <circle cx="300" cy="110" r="3" fill={BRAND.coral} />

      <circle cx="210" cy="210" r="20" fill={`${BRAND.violet}15`} stroke={BRAND.violet} strokeWidth="0.8" />
      <path d="M202 210 l5 5 10-10" stroke={BRAND.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SocialProofVisual() {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 520,
      height: 480,
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 320,
        height: 320,
        background: `radial-gradient(ellipse, ${BRAND.violet}12 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(50px)",
        pointerEvents: "none",
      }} />

      <ResearchIllustration />

      {/* Persona pods — left-side bubbles point RIGHT, right-side bubbles point LEFT */}
      {/* Each bubble pops in 1s apart; all stay visible, then cycle restarts */}

      {/* TM — coral — upper-left → bubble RIGHT */}
      <div style={{ position: "absolute", top: 52, left: 28, animation: "floatBubble6 6s ease-in-out infinite", zIndex: 2 }}>
        <PersonaWithBubble src={personaTM} color={BRAND.coral} size={56} message="Predict real market share" direction="right" bubbleDelay={0} />
      </div>

      {/* JK — cyan — upper-right → bubble LEFT */}
      <div style={{ position: "absolute", top: 10, left: 342, animation: "floatBubble5 5.5s ease-in-out 0.5s infinite", zIndex: 2 }}>
        <PersonaWithBubble src={personaJK} color={BRAND.cyan} size={52} message="We got fast results in 24hrs" direction="left" bubbleDelay={1} />
      </div>

      {/* DR — dark — right-middle → bubble LEFT */}
      <div style={{ position: "absolute", top: 180, left: 376, animation: "floatBubble3 5.8s ease-in-out 0.3s infinite", zIndex: 2 }}>
        <PersonaWithBubble src={personaDR} color={`${BRAND.dark}DD`} size={48} message="We were able to filter our data by sub-group" direction="left" bubbleDelay={2} />
      </div>

      {/* LW — amber — lower-right → bubble LEFT */}
      <div style={{ position: "absolute", top: 310, left: 310, animation: "floatBubble2 5.5s ease-in-out 0.8s infinite", zIndex: 2 }}>
        <PersonaWithBubble src={personaLW} color={BRAND.amber} size={54} message="You only pay for what you test" direction="left" bubbleDelay={3} />
      </div>

      {/* NP — violet — left-middle → bubble RIGHT */}
      <div style={{ position: "absolute", top: 262, left: 36, animation: "floatBubble1 5s ease-in-out 1s infinite", zIndex: 2 }}>
        <PersonaWithBubble src={personaNP} color={BRAND.violet} size={50} message="We get access to a private secure dashboard" direction="right" bubbleDelay={4} />
      </div>

      {/* Small accent avatars — inner ring fill */}
      <div style={{ position: "absolute", top: 140, left: 130, animation: "floatBubble4 6.5s ease-in-out 2s infinite", zIndex: 1 }}>
        <Avatar initials="SK" color={`${BRAND.dark}40`} size={30} />
      </div>
      <div style={{ position: "absolute", top: 330, left: 188, animation: "floatBubble6 5s ease-in-out 1.5s infinite", zIndex: 1 }}>
        <Avatar initials="AM" color={`${BRAND.coral}70`} size={26} />
      </div>
    </div>
  );
}

function HeroSection({ onPlayVideo }: { onPlayVideo: () => void }) {
  return (
    <section style={{
      minHeight: "100dvh",
      background: BRAND.offWhite,
      display: "flex",
      alignItems: "center",
      padding: "0 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Soft off-white ambient glow accents */}
      <div style={{
        position: "absolute",
        top: -80,
        right: "5%",
        width: 560,
        height: 560,
        background: `radial-gradient(ellipse, ${BRAND.violet}12 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute",
        bottom: -60,
        left: "10%",
        width: 340,
        height: 340,
        background: `radial-gradient(ellipse, ${BRAND.coral}10 0%, transparent 70%)`,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div className="ir-hero-grid" style={{
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 60,
        paddingTop: 80,
        paddingBottom: 60,
        position: "relative",
        zIndex: 1,
      }}>
        {/* Left content */}
        <div style={{ flex: 1, maxWidth: 600 }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
            fontWeight: 400,
            color: BRAND.dark,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
          }}>
            Stop Guessing.<br />
            <span style={{ color: BRAND.coral }}>Launch Better</span><br />
            Innovation.
          </h1>

          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            fontWeight: 400,
            color: `${BRAND.dark}cc`,
            lineHeight: 1.7,
            margin: "0 0 40px",
            maxWidth: 480,
          }}>
            Through Smart 24hr Research & Growth Consulting — we turn your insights into real growth.
          </p>

          <style>{`
            @keyframes hero-btn-orbit {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to   { transform: translate(-50%, -50%) rotate(360deg); }
            }
            .hero-btn-wrap {
              position: relative;
              padding: 2px;
              border-radius: 10px;
              overflow: hidden;
              display: inline-flex;
              cursor: pointer;
              transition: transform 0.22s ease;
            }
            .hero-btn-wrap:hover { transform: translateY(-2px); }
            .hero-btn-glow {
              position: absolute;
              width: 220%;
              aspect-ratio: 1;
              top: 50%; left: 50%;
              border-radius: 50%;
              filter: blur(12px);
              animation: hero-btn-orbit 5s linear infinite;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.35s ease;
            }
            .hero-btn-wrap:hover .hero-btn-glow { opacity: 1; animation-duration: 2.5s; }
            .hero-btn-inner {
              position: relative;
              z-index: 1;
              border-radius: 8px;
              padding: 14px 32px;
              font-family: "DM Sans", sans-serif;
              font-size: 15px;
              font-weight: 700;
              letter-spacing: 0.01em;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #fff;
            }
            .hero-btn-glow-research {
              background: conic-gradient(from 0deg, ${BRAND.violet}, ${BRAND.coral}, ${BRAND.cyan}, ${BRAND.violet});
            }
            .hero-btn-glow-consult {
              background: conic-gradient(from 0deg, ${BRAND.coral}, ${BRAND.amber}, ${BRAND.violet}, ${BRAND.coral});
            }
          `}</style>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div className="hero-btn-wrap">
              <div className="hero-btn-glow hero-btn-glow-research" />
              <a href="/research" className="hero-btn-inner" style={{ background: BRAND.violet }}>
                Explore Research
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <div className="hero-btn-wrap">
              <div className="hero-btn-glow hero-btn-glow-consult" />
              <a href="/consult" className="hero-btn-inner" style={{ background: BRAND.coral }}>
                Explore Consult
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Video trigger chip */}
            <button
              onClick={onPlayVideo}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `1.5px solid ${BRAND.dark}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
                transition: "background 0.2s, border-color 0.2s",
                flexShrink: 0,
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.background = BRAND.violet;
                  (e.currentTarget).style.borderColor = BRAND.violet;
                  (e.currentTarget as HTMLElement).querySelector("svg")?.setAttribute("stroke", "#fff");
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.background = "#fff";
                  (e.currentTarget).style.borderColor = `${BRAND.dark}25`;
                  (e.currentTarget as HTMLElement).querySelector("svg")?.setAttribute("stroke", BRAND.dark);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke={BRAND.dark} strokeWidth="0">
                  <polygon points="5,3 14,8 5,13" fill={BRAND.dark} />
                </svg>
              </span>
              <span style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                fontWeight: 500,
                color: `${BRAND.dark}bb`,
              }}>
                Watch a 2 min overview
              </span>
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex",
            gap: 0,
            marginTop: 44,
            flexWrap: "wrap",
          }}>
            {[
              { val: "200+", label: "Studies" },
              { val: "25+", label: "Markets" },
              { val: "44M+", label: "Panel" },
              { val: "10+", label: "Industries" },
            ].map((item, i) => (
              <div key={item.val} style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
              }}>
                <div style={{ textAlign: "center", padding: "0 20px" }}>
                  <div style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: 24,
                    color: BRAND.violet,
                    fontWeight: 400,
                    lineHeight: 1.1,
                  }}>
                    {item.val}
                  </div>
                  <div style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 11,
                    color: `${BRAND.dark}cc`,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}>
                    {item.label}
                  </div>
                </div>
                {i < 3 && (
                  <div style={{
                    width: 1,
                    height: 28,
                    background: `${BRAND.violet}20`,
                    flexShrink: 0,
                  }} />
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Right visual — floating testimonial bubbles */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", maxWidth: 520, minHeight: 480 }} className="hero-visual ir-hide-mobile">
          <SocialProofVisual />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes floatBubble1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes floatBubble2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
        @keyframes floatBubble3 { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(1deg); } }
        @keyframes floatBubble4 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(6px); } }
        @keyframes floatBubble5 { 0%,100% { transform: translateY(0px) rotate(0.5deg); } 50% { transform: translateY(-8px) rotate(-0.5deg); } }
        @keyframes floatBubble6 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(10px); } }
        @keyframes bubbleConvo {
          0%   { opacity: 0; transform: scale(0.55) translateY(6px); }
          7%   { opacity: 1; transform: scale(1.07) translateY(0); }
          14%  { opacity: 1; transform: scale(1)    translateY(0); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @media (max-width: 900px) {
          .hero-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function BrandStrip() {
  const doubled = [...CLIENTS, ...CLIENTS];
  const hoverColors = [BRAND.violet, BRAND.coral, BRAND.cyan, BRAND.amber];

  return (
    <section style={{
      background: BRAND.offWhite,
      borderTop: `1px solid ${BRAND.violet}10`,
      borderBottom: `1px solid ${BRAND.violet}10`,
      padding: "40px 0",
      overflow: "hidden",
    }}>
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <span style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 15,
          fontWeight: 700,
          color: BRAND.violet,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}>
          Trusted by the world's most ambitious brands
        </span>
      </div>

      <div style={{ position: "relative", overflow: "hidden", height: 56 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 56,
          animation: "marquee 32s linear infinite",
          width: "max-content",
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        }}>
          {doubled.map((client, i) => (
            <span
              key={`${client}-${i}`}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: `${BRAND.dark}35`,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                cursor: "default",
                transition: "color 0.25s ease, transform 0.25s ease",
              }}
              onMouseEnter={(e) => {
                const color = hoverColors[i % hoverColors.length];
                (e.currentTarget).style.color = color;
                (e.currentTarget).style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.color = `${BRAND.dark}35`;
                (e.currentTarget).style.transform = "scale(1)";
              }}
            >
              {client}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateY(-50%) translateX(0); }
          to { transform: translateY(-50%) translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

function StatCard({ number, label, active }: { number: string; label: string; active: boolean }) {
  const numericPart = parseInt(number.replace(/\D/g, ""));
  const suffix = number.replace(/[0-9]/g, "");
  const count = useCountUp(numericPart, 1800, active);

  return (
    <div style={{
      textAlign: "center",
      padding: "32px 24px",
      flex: "1 1 200px",
      position: "relative",
    }}>
      <div style={{
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontSize: "clamp(2.8rem, 4.5vw, 4rem)",
        fontWeight: 400,
        color: BRAND.violet,
        lineHeight: 1,
        marginBottom: 10,
        letterSpacing: "-0.02em",
      }}>
        {active ? `${count}${suffix}` : number}
      </div>
      <div style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 14,
        fontWeight: 500,
        color: `${BRAND.dark}cc`,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  );
}

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{
      background: BRAND.offWhite,
      padding: "80px 32px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: BRAND.coral,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 12,
          }}>
            By the numbers
          </span>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 400,
            color: BRAND.dark,
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Built for scale. Proven across markets.
          </h2>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0,
          borderTop: `2px solid ${BRAND.violet}15`,
          borderBottom: `2px solid ${BRAND.violet}15`,
        }}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={{
              flex: "1 1 200px",
              borderRight: i < STATS.length - 1 ? `1px solid ${BRAND.violet}12` : "none",
            }}>
              <StatCard number={stat.number} label={stat.label} active={active} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsSection() {
  const steps = [
    {
      label: "SPEED",
      subtitle: "24hr Turn-Around",
      description: "Brief in the morning, results by the next day.",
      accent: BRAND.coral,
      Icon: Timer,
    },
    {
      label: "EASY",
      subtitle: "Automated Briefing",
      description: "You brief, we handle methodology and analysis.",
      accent: BRAND.cyan,
      Icon: ClipboardCheck,
    },
    {
      label: "SMART",
      subtitle: "PREDICT MARKET SHARE",
      description: "Balancing interest and commitment helps us predict true market share potential.",
      accent: BRAND.violet,
      Icon: BrainCircuit,
    },
    {
      label: "+25 MARKETS",
      subtitle: "44M Consumer Panel",
      description: "Global reach with local cultural intelligence.",
      accent: BRAND.amber,
      Icon: Globe,
    },
  ];

  return (
    <section id="services" style={{
      background: `linear-gradient(180deg, ${BRAND.offWhite} 0%, #F0EFE9 100%)`,
      padding: "100px 32px",
    }}>
      <div className="ir-two-col" style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        gap: 64,
        alignItems: "center",
      }}>
        {/* Left — heading + text */}
        <div style={{ flex: "0 0 380px", maxWidth: 420 }}>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 400,
            color: BRAND.dark,
            margin: "0 0 20px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Turn insights into{" "}
            <span style={{ color: BRAND.violet }}>evidence based decisions.</span>
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 16,
            fontWeight: 400,
            color: `${BRAND.dark}bb`,
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}>
            Test any creative with the right audience to predict your share potential.
          </p>
          <a href="#pricing" style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: BRAND.violet,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "gap 0.2s ease",
          }}
            onMouseEnter={(e) => { (e.currentTarget).style.gap = "10px"; }}
            onMouseLeave={(e) => { (e.currentTarget).style.gap = "6px"; }}
          >
            See our pricing
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke={BRAND.violet} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Right — 2x2 grid of light cards */}
        <div className="ir-card-grid-2" style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          {steps.map((step) => (
            <div
              key={step.label}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "28px 24px 24px",
                position: "relative",
                border: `1px solid ${BRAND.dark}08`,
                cursor: "default",
                transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.transform = "translateY(-4px)";
                (e.currentTarget).style.boxShadow = `0 12px 40px rgba(0,0,0,0.08)`;
                (e.currentTarget).style.borderColor = `${step.accent}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
                (e.currentTarget).style.borderColor = `${BRAND.dark}08`;
              }}
            >
              {/* Icon */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${step.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <step.Icon size={22} color={step.accent} strokeWidth={1.7} />
                </div>
              </div>

              <div style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 21,
                fontWeight: 400,
                color: BRAND.dark,
                marginBottom: 2,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                {step.label}
              </div>

              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: step.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}>
                {step.subtitle}
              </div>

              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                fontWeight: 400,
                color: `${BRAND.dark}cc`,
                lineHeight: 1.55,
                margin: 0,
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [activeTab, setActiveTab] = useState<"payg" | "members">("members");

  const plans = {
    payg: [
      {
        name: "Test24 Basic",
        price: "R10,000",
        unit: "per concept",
        description: "24hr Pay Per Concept Testing",
        features: [
          "100 consumer sample",
          "5 min lite survey",
          "Automated briefing",
          "24hr report delivery",
          "Pay only when you test",
        ],
        accent: BRAND.cyan,
        href: "/checkout/basic-payg?ref=home-pricing",
        mascot: mascotBasic,
      },
      {
        name: "Test24 Pro",
        price: "R50,000",
        unit: "per survey",
        description: "Custom Quant & AI Qual",
        features: [
          "100+ custom audience",
          "10-15 min full survey",
          "AI Qual VOC videos",
          "Strategic recommendations",
          "Enterprise-grade insights",
        ],
        accent: BRAND.coral,
        href: "/checkout/pro-payg?ref=home-pricing",
        popular: true,
        mascot: mascotMember,
      },
    ],
    members: [
      {
        name: "Test24 Basic",
        price: "R5,000",
        unit: "per concept",
        description: "24hr Pay Per Concept Testing",
        badge: "50% OFF",
        features: [
          "100 consumer sample",
          "5 min lite survey",
          "Automated briefing",
          "24hr report delivery",
          "Priority member support",
        ],
        accent: BRAND.cyan,
        href: "/checkout/basic-members?ref=home-pricing",
        mascot: mascotBasic,
      },
      {
        name: "Test24 Pro",
        price: "R45,000",
        unit: "per survey",
        description: "Custom Quant & AI Qual",
        badge: "10% OFF",
        features: [
          "100+ custom audience",
          "10-15 min full survey",
          "AI Qual VOC videos",
          "Strategic recommendations",
          "Enterprise-grade insights",
        ],
        accent: BRAND.coral,
        href: "/checkout/pro-members?ref=home-pricing",
        popular: true,
        mascot: mascotMember,
      },
    ],
  };

  const currentPlans = plans[activeTab];

  return (
    <section id="pricing" style={{
      background: BRAND.offWhite,
      padding: "60px 32px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 400,
            color: BRAND.dark,
            margin: "0 auto 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Don't Guess.{" "}
            <span style={{ color: BRAND.violet }}>Test.</span>
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 16,
            fontWeight: 400,
            color: `${BRAND.dark}bb`,
            lineHeight: 1.7,
            margin: "0 auto 36px",
            maxWidth: 480,
          }}>
            Legacy research is expensive, slow, and built for another era. Innovatr delivers the same consumer depth at a fraction of the cost — in a fraction of the time.
          </p>

          {/* Tabs */}
          <div style={{
            display: "inline-flex",
            background: `${BRAND.dark}08`,
            borderRadius: 12,
            padding: 4,
            gap: 0,
          }}>
            {(["payg", "members"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "10px 28px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: activeTab === tab ? "#fff" : "transparent",
                  color: activeTab === tab ? BRAND.dark : `${BRAND.dark}aa`,
                  boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab === "payg" ? "Once-Off" : "Memberships"}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="ir-card-grid-2" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          maxWidth: 800,
          margin: "0 auto",
        }}>
          {currentPlans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "40px 36px",
                position: "relative",
                border: plan.popular ? `2px solid ${BRAND.violet}` : `1px solid ${BRAND.dark}10`,
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.transform = "translateY(-4px)";
                (e.currentTarget).style.boxShadow = "0 20px 60px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
              }}
            >
              {/* Mascot — top right */}
              <img
                src={plan.mascot}
                alt=""
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 88,
                  height: 88,
                  objectFit: "contain",
                  objectPosition: "top right",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />

              {/* Badge */}
              {"badge" in plan && plan.badge && (
                <div style={{
                  position: "absolute",
                  top: 82,
                  right: 16,
                  background: `${BRAND.coral}15`,
                  color: BRAND.coral,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Popular tag */}
              {plan.popular && activeTab === "payg" && (
                <div style={{
                  position: "absolute",
                  top: 82,
                  right: 16,
                  background: `${BRAND.violet}15`,
                  color: BRAND.violet,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 100,
                  letterSpacing: "0.04em",
                }}>
                  POPULAR
                </div>
              )}

              <div style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 22,
                fontWeight: 400,
                color: BRAND.dark,
                marginBottom: 4,
              }}>
                {plan.name}
              </div>
              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                color: `${BRAND.dark}aa`,
                marginBottom: 24,
              }}>
                {plan.description}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 28 }}>
                <span style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: 40,
                  fontWeight: 400,
                  color: BRAND.violet,
                  letterSpacing: "-0.02em",
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  color: `${BRAND.dark}99`,
                  marginLeft: 8,
                }}>
                  {plan.unit}
                </span>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 32 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill={`${plan.accent}18`} />
                      <path d="M5 8l2 2 4-4" stroke={plan.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 14,
                      color: `${BRAND.dark}85`,
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buy Now button */}
              <a
                href={plan.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  color: plan.popular ? "#fff" : BRAND.violet,
                  background: plan.popular ? BRAND.violet : "transparent",
                  border: plan.popular ? "none" : `2px solid ${BRAND.violet}`,
                  borderRadius: 12,
                  padding: "14px 0",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.transform = "scale(1.02)";
                  (e.currentTarget).style.boxShadow = plan.popular
                    ? `0 8px 24px ${BRAND.violet}40`
                    : `0 4px 16px ${BRAND.violet}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.transform = "scale(1)";
                  (e.currentTarget).style.boxShadow = "none";
                }}
              >
                {activeTab === "members" ? "Get Member Pricing" : "Buy Now"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const homeMembershipPlans = [
  {
    name: "Starter",
    description: "For startups & small teams",
    price: "R60K",
    monthly: "R5K/month" as string | null,
    value: null as string | null,
    breakdown: null as string | null,
    savings: "Save up to 40%",
    badge: null as string | null,
    accent: BRAND.coral,
    mascot: mascotStarter,
    href: "/checkout/membership-entry?ref=home-membership",
    features: [
      "Trends Report Access",
      "Discounted Research",
      "Private Dashboard Access",
      "Test24 Basic: R5,000 per concept",
      "Test24 Pro: R45,000 per survey",
    ],
  },
  {
    name: "Growth",
    description: "For growing businesses",
    price: "R180K",
    monthly: null as string | null,
    value: "~R260K value" as string | null,
    breakdown: "Starter (R60K) + Growth (R120K)" as string | null,
    savings: "Best for scale",
    badge: "Most Popular" as string | null,
    accent: BRAND.violet,
    mascot: mascotGrowth,
    href: "/checkout/membership-growth?ref=home-membership",
    features: [
      "Everything in Starter",
      "x10 Test24 Basic ideas / year",
      "x2 Test24 Pro Studies / year",
    ],
  },
  {
    name: "Scale",
    description: "Enterprise-level insights",
    price: "R255K",
    monthly: null as string | null,
    value: "~R360K value" as string | null,
    breakdown: "Starter (R60K) + Scale (R195K)" as string | null,
    savings: "Maximum value",
    badge: "Best Value" as string | null,
    accent: BRAND.violet,
    mascot: mascotScale,
    href: "/checkout/membership-scale?ref=home-membership",
    features: [
      "Everything in Starter",
      "x15 Test24 Basic ideas / year",
      "x3 Test24 Pro Studies / year",
      "Dedicated Insights Support",
    ],
  },
];

function HomeMembershipSection() {
  return (
    <section id="membership" style={{ background: BRAND.coral, padding: "60px 32px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.14em", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>
            Memberships
          </span>
          <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)", fontWeight: 400, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Join the Club &{" "}<span style={{ color: BRAND.amber }}>Save</span>
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, fontWeight: 400, color: "#fff", lineHeight: 1.6, maxWidth: 460, margin: "0 auto" }}>
            Scale your research. Save up to 50%.
          </p>
        </div>
        <div className="ir-card-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {homeMembershipPlans.map((plan, index) => (
            <div
              key={plan.name}
              style={{ background: "#fff", borderRadius: 16, padding: "32px 28px 28px", position: "relative", cursor: "default", transition: "transform 0.22s ease, box-shadow 0.22s ease", border: index === 1 ? `2px solid ${BRAND.violet}` : `1px solid ${BRAND.dark}08`, display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { (e.currentTarget).style.transform = "translateY(-4px)"; (e.currentTarget).style.boxShadow = "0 16px 48px rgba(0,0,0,0.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget).style.transform = "translateY(0)"; (e.currentTarget).style.boxShadow = "none"; }}
            >
              {plan.badge && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", fontFamily: '"DM Sans", sans-serif', fontSize: 10, fontWeight: 700, color: "#fff", background: plan.accent, borderRadius: 100, padding: "4px 14px", letterSpacing: "0.06em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, fontWeight: 400, color: plan.accent, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{plan.name}</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: `${BRAND.dark}cc`, margin: 0 }}>{plan.description}</p>
                </div>
                <img src={plan.mascot} alt={plan.name} style={{ width: 96, height: 96, objectFit: "contain", display: "block", flexShrink: 0 }} />
              </div>
              {plan.breakdown && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: `${BRAND.dark}99`, marginBottom: 4 }}>{plan.breakdown}</div>}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, fontWeight: 400, color: BRAND.dark, letterSpacing: "-0.02em" }}>{plan.price}</span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: `${BRAND.dark}99`, marginLeft: 6 }}>per year</span>
              </div>
              {plan.monthly && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: `${BRAND.dark}99`, marginBottom: 8 }}>{plan.monthly}</div>}
              {plan.value && <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 600, color: BRAND.coral, marginBottom: 8 }}>{plan.value}</div>}
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 600, color: plan.accent, marginBottom: 20 }}>{plan.savings}</div>
              <div style={{ borderTop: `1px solid ${BRAND.dark}06`, paddingTop: 16, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M3 8l4 4 6-7" stroke={plan.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: `${BRAND.dark}bb`, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href={plan.href}
                style={{ display: "block", fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 600, color: "#fff", background: plan.accent, borderRadius: 7, padding: "10px 0", textDecoration: "none", textAlign: "center" as const, transition: "transform 0.18s, box-shadow 0.18s", marginTop: "auto" }}
                onMouseEnter={(e) => { (e.currentTarget).style.transform = "scale(1.02)"; (e.currentTarget).style.boxShadow = `0 6px 20px ${plan.accent}50`; }}
                onMouseLeave={(e) => { (e.currentTarget).style.transform = "scale(1)"; (e.currentTarget).style.boxShadow = "none"; }}
              >
                Become a Member
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} defaultSignup={false} />
      <section style={{ padding: "48px 0", background: "#fff", borderTop: `1px solid ${BRAND.dark}08` }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" as const, padding: "0 24px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: BRAND.coral }}>
            Subscribe to Trends and Insights
          </span>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: BRAND.dark, margin: "10px 0 12px", lineHeight: 1.2 }}>
            Your competitors are already reading it.
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: `${BRAND.dark}cc`, margin: "0 0 20px", lineHeight: 1.65 }}>
            Bi-weekly Pulse Insights — <strong style={{ fontWeight: 600, color: BRAND.dark }}>free</strong>. Market shifts, category trends, and launch intelligence straight to your inbox.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            {user ? (
              <a
                href="/portal/explore"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", background: BRAND.violet, border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                View Trends
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <a
                href="/portal/trends"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", background: BRAND.violet, border: "none", borderRadius: 8, padding: "11px 24px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                Subscribe Now
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
            {!user && (
              <button
                onClick={() => setLoginOpen(true)}
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, color: BRAND.dark, background: "transparent", border: `1.5px solid ${BRAND.dark}22`, borderRadius: 8, padding: "11px 24px", cursor: "pointer" }}
              >
                Already a member? Log in
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer style={{
      background: BRAND.dark,
      color: "#fff",
      padding: "36px 32px 24px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Brand + tagline row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 32,
          paddingBottom: 24,
          flexWrap: "wrap",
        }} className="footer-top">
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img
                src="/Innovatr_logo-01.png"
                alt="Innovatr"
                style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }}
              />
            </div>
            <p style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              margin: "0 0 22px",
            }}>
              Smart research in 24 hours. Built for brands that can't afford to guess.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Facebook", href: "https://web.facebook.com/innovatr1", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "LinkedIn", href: "https://www.linkedin.com/company/innovatr/", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
                { label: "Instagram", href: "https://www.instagram.com/innovatr1/", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition: "background 0.18s",
                  textDecoration: "none",
                }}
                  onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}50`; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.06)"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Nav links — mirroring top navigation exactly */}
          <div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}>
              Navigation
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Services links */}
          <div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}>
              Offerings
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Test24 Basic", href: "/test24-basic" },
                { label: "Test24 Pro", href: "/test24-pro" },
                { label: "Intelligence", href: "/portal/trends" },
                { label: "Consult", href: "/consult" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal links */}
          <div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}>
              Legal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Use", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ].map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, marginBottom: 28 }} />

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 28,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
          }}>
            © 2026 Innovatr. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 8,
              height: 8,
              background: "#22c55e",
              borderRadius: "50%",
              display: "inline-block",
              boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
            }} />
            <span style={{
              fontFamily: '"DM Sans", monospace',
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
            }}>
              System Operational
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-top {
            flex-direction: column !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}

export default function InnovatrHome() {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, []);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', background: BRAND.offWhite }}>
      <PublicNavbar activePage="Home" />
      <section id="home"><HeroSection onPlayVideo={() => setVideoOpen(true)} /></section>
      {videoOpen && (
        <div
          onClick={() => setVideoOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(13,11,31,0.88)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 860,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              aspectRatio: "16/9",
              background: "#000",
            }}
          >
            <iframe
              src="https://player.vimeo.com/video/1138122776?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
              title="Innovatr Overview"
              allow="autoplay; fullscreen; picture-in-picture"
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
            <button
              onClick={() => setVideoOpen(false)}
              style={{
                position: "absolute", top: 12, right: 12,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <p style={{ position: "absolute", bottom: 28, fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Click anywhere outside to close
          </p>
        </div>
      )}
      <BrandStrip />
      <InsightsSection />
      <PricingSection />
      <section id="tools" style={{ display: "none" }} />
      <section id="consult" style={{ display: "none" }} />
      <section id="contact" style={{ display: "none" }} />
      <HomeMembershipSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
