import { useEffect, useRef, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { Compass, Lightbulb, Rocket, User } from "lucide-react";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import heroFunnel from "@assets/data_management___funnel,_search,_result,_shapes,_produce,_pro_1774886183451.png";
import mascotProblem from "@assets/The_Problem_1774943930461.png";
import mascotSolution from "@assets/The_Solution_1774943930463.png";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

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


const processCards = [
  {
    title: "Strategy & Direction",
    leadIn: "Understand and anticipate the market through:",
    bullets: ["Trends and foresight", "Segmentation", "Brand & Category Health", "Demand Mapping"],
    accent: BRAND.violet,
    Icon: Compass,
    caseStudyTab: "strategy",
  },
  {
    title: "Innovation & Testing",
    leadIn: "Identify growth opportunities and build a business case via:",
    bullets: ["Idea screening & optimization", "Portfolio management", "Preliminary share, source of volume and cannibalization", "Price pack architecture"],
    accent: BRAND.coral,
    Icon: Lightbulb,
    caseStudyTab: "innovation",
  },
  {
    title: "Execution & Scale",
    leadIn: "Track launch effectiveness & market dynamics via:",
    bullets: ["Innovation launch monitoring", "Promotion tracking", "Brand and category health tracking"],
    accent: BRAND.cyan,
    Icon: Rocket,
    caseStudyTab: "execution",
  },
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

function HeroSection() {
  return (
    <section style={{
      background: BRAND.offWhite,
      paddingTop: 140,
      paddingBottom: 100,
      padding: "140px 32px 100px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: -120,
        right: "5%",
        width: 600,
        height: 600,
        background: `radial-gradient(ellipse, ${BRAND.coral}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: -100,
        left: "10%",
        width: 500,
        height: 500,
        background: `radial-gradient(ellipse, ${BRAND.violet}06 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div className="ir-hero-grid" style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 80,
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.coral}18`, border: `1px solid ${BRAND.coral}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, background: BRAND.coral, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 600, color: BRAND.coral, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Consult
            </span>
          </div>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "clamp(3.2rem, 6vw, 5.5rem)",
            fontWeight: 400,
            color: BRAND.dark,
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            margin: "0 0 28px",
          }}>
            We Build<br />
            What's{" "}
            <span style={{ color: BRAND.coral }}>Missing.</span>
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 18,
            fontWeight: 400,
            color: `${BRAND.dark}bb`,
            lineHeight: 1.7,
            maxWidth: 440,
            margin: "0 0 36px",
          }}>
            Launch Better Innovation<br />
            through expert strategy, design &amp; testing.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#process" style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: BRAND.coral,
              border: "none",
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
              Our Process
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="https://calendly.com/richard-1220" target="_blank" rel="noopener noreferrer" style={{
              fontFamily: '"DM Sans", sans-serif',
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
              onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}10`; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
            >
              Book a consult call
            </a>
          </div>
        </div>

        <div className="ir-hero-img-wrap" style={{
          flex: "0 0 460px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img
            src={heroFunnel}
            alt="Data funnel illustration"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function ProblemSolutionSection() {
  const cards = [
    {
      label: "The Problem",
      labelColor: BRAND.coral,
      glowDelay: "0s",
      heading: <>Innovation is too important to{" "}<span style={{ color: BRAND.coral }}>fail.</span></>,
      body: "So why does it feel so risky every time? Projects drag on, spend escalates, and past failures make every new idea feel like a gamble.",
      mascot: mascotProblem,
    },
    {
      label: "The Solution",
      labelColor: BRAND.violet,
      glowDelay: "-3s",
      heading: <>Trust Expert{" "}<span style={{ color: BRAND.cyan }}>Do-ers</span>, not fluffy consultants.</>,
      body: "Idea to market. Agile in-house strategy, research, design and go-to-market experts all in one team.",
      mascot: mascotSolution,
    },
  ];

  return (
    <section style={{
      background: "#fff",
      padding: "60px 32px 100px",
    }}>
      <style>{`
        @keyframes ps-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ps-wrap {
          flex: 1;
          position: relative;
          padding: 3px;
          border-radius: 22px;
          overflow: hidden;
          cursor: default;
          transition: transform 0.3s ease;
        }
        .ps-wrap:hover {
          transform: translateY(-6px);
        }
        .ps-glow {
          position: absolute;
          width: 150%;
          aspect-ratio: 1;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          background: conic-gradient(
            from 0deg,
            ${BRAND.violet}cc,
            ${BRAND.coral}cc,
            ${BRAND.cyan}cc,
            ${BRAND.amber}cc,
            ${BRAND.violet}cc
          );
          border-radius: 50%;
          filter: blur(40px);
          animation: ps-orbit 6s linear infinite;
          pointer-events: none;
          z-index: 0;
          opacity: 0.45;
          transition: opacity 0.4s ease;
        }
        .ps-wrap:hover .ps-glow {
          opacity: 0.75;
          animation-duration: 3s;
        }
        .ps-inner {
          position: relative;
          z-index: 1;
          background: #fff;
          border-radius: 19px;
          padding: 44px 40px 40px;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="ir-two-col" style={{ display: "flex", gap: 28, alignItems: "stretch" }}>
          {cards.map((card, i) => (
            <div key={i} className="ps-wrap">
              <div
                className="ps-glow"
                style={{ animationDelay: card.glowDelay }}
              />
              <div className="ps-inner">
                {/* Mascot — bottom-right, decorative */}
                <img
                  src={card.mascot}
                  alt=""
                  style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    width: 170,
                    height: 170,
                    objectFit: "contain",
                    objectPosition: "bottom right",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />

                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: card.labelColor,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 20,
                }}>
                  {card.label}
                </span>
                <h2 style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: "clamp(1.8rem, 2.8vw, 2.5rem)",
                  fontWeight: 400,
                  color: BRAND.dark,
                  margin: "0 0 20px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  maxWidth: "75%",
                }}>
                  {card.heading}
                </h2>
                <p style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 16,
                  fontWeight: 400,
                  color: `${BRAND.dark}85`,
                  lineHeight: 1.75,
                  margin: 0,
                  maxWidth: "80%",
                }}>
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="process" style={{
      background: BRAND.amber,
      padding: "80px 32px 100px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(13,11,31,0.75)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 12,
          }}>
            The Process
          </span>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 400,
            color: BRAND.dark,
            margin: "0 auto 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            maxWidth: 600,
          }}>
            Move from Where to Play to{" "}
            <span style={{ color: BRAND.violet }}>How to Win</span>, seamlessly.
          </h2>
        </div>

        <div className="ir-card-grid-3" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {processCards.map((card, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "32px 28px 28px",
                position: "relative",
                border: `1px solid ${BRAND.dark}08`,
                cursor: "default",
                transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.transform = "translateY(-4px)";
                (e.currentTarget).style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
                (e.currentTarget).style.borderColor = `${card.accent}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
                (e.currentTarget).style.borderColor = `${BRAND.dark}08`;
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${card.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <card.Icon size={24} color={card.accent} strokeWidth={1.7} />
                </div>
              </div>

              <h3 style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 28,
                fontWeight: 400,
                color: BRAND.dark,
                margin: "0 0 14px",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                {card.title}
              </h3>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 15,
                fontWeight: 400,
                color: `${BRAND.dark}cc`,
                lineHeight: 1.6,
                margin: "0 0 10px",
              }}>
                {card.leadIn}
              </p>
              <ul style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 15,
                fontWeight: 400,
                color: `${BRAND.dark}cc`,
                lineHeight: 1.75,
                margin: "0 0 24px",
                padding: 0,
                listStyle: "none",
              }}>
                {card.bullets.map((bullet: string, bi: number) => (
                  <li key={bi} style={{ display: "flex", gap: 7 }}>
                    <span style={{ color: card.accent, fontWeight: 600, flexShrink: 0 }}>–</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`/case-studies?tab=${card.caseStudyTab}`}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13,
                  color: `${BRAND.dark}aa`,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  letterSpacing: "0.01em",
                  display: "inline-block",
                  marginTop: "auto",
                }}
              >
                View Case Study
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  return (
    <section id="contact" style={{
      background: "#fff",
      borderTop: `1px solid ${BRAND.dark}08`,
      padding: "96px 32px",
    }}>
      <div style={{
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 11,
          fontWeight: 700,
          color: BRAND.coral,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 14,
        }}>
          Work With Us
        </span>
        <h2 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: "clamp(2rem, 4vw, 2.8rem)",
          fontWeight: 400,
          color: BRAND.dark,
          margin: "0 0 16px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}>
          Your next launch deserves a real plan.
        </h2>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 17,
          color: `${BRAND.dark}cc`,
          lineHeight: 1.7,
          margin: "0 0 40px",
        }}>
          From market diagnosis to go-to-market, we embed strategy, research and design into one agile team — so your ideas move faster and land harder.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
          <a href="https://calendly.com/richard-1220" target="_blank" rel="noopener noreferrer" style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: BRAND.violet,
            border: "none",
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
              (e.currentTarget).style.boxShadow = `0 8px 24px ${BRAND.violet}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.transform = "scale(1)";
              (e.currentTarget).style.boxShadow = "none";
            }}
          >
            Book a consult call
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="/contact" style={{
            fontFamily: '"DM Sans", sans-serif',
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
            transition: "background 0.18s",
          }}
            onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}08`; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
          >
            Email us
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
        @media (max-width: 768px) { .footer-top { flex-direction: column !important; gap: 32px !important; } }
      `}</style>
    </footer>
  );
}

export default function WhatWeDo() {
  useSEO({
    title: "Strategic Brand Consulting",
    description: "Innovatr consulting helps brands find focus, develop opportunities, optimise offerings, and track what's working — grounded in real consumer data.",
    canonicalUrl: "https://www.innovatr.co.za/consult",
  });
  return (
    <div style={{ minHeight: "100vh", background: BRAND.offWhite }}>
      <PublicNavbar activePage="Consult" />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <ProcessSection />
        <CTASection />
      </main>
      <InnovatrFooter />
    </div>
  );
}
