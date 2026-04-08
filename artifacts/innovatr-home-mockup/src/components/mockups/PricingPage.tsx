import { useState } from "react";
import { Zap, Target, TrendingUp, Rocket } from "lucide-react";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import pricingHeroCoins from "@assets/statistics___graph,_chart,_analytics,_presentation,_dashboard,_1774885935393.png";
import mascotStarter from "@assets/Starter_1774884250090.png";
import mascotGrowth from "@assets/Growth_1774884250087.png";
import mascotScale from "@assets/Scale_1774884250090.png";

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
  { label: "Home", href: "/preview/InnovatrHome" },
  { label: "Consult", href: "/preview/WhatWeDo" },
  { label: "Research", href: "/preview/PricingPage" },
  { label: "Our Tools", href: "/preview/ResearchTools" },
  { label: "Case Studies", href: "/preview/CaseStudies" },
  { label: "Contact", href: "/preview/ContactUs" },
];

const offerings = [
  {
    title: "Innovatr Test24 Basic",
    subtitle: "24hr Pay Per Concept Quant Testing",
    price: "R5,000",
    priceSuffix: "/ concept",
    accent: BRAND.coral,
    badge: "NEW",
    features: [
      "Lite Testing (x100 consumers) 5min",
      "Automated briefing & reporting",
      "24hr turnaround",
    ],
    cta: "Learn More",
    href: "/test24-basic",
    Icon: Zap,
  },
  {
    title: "Innovatr Test24 Pro",
    subtitle: "24hr Custom Quant & AI Qual",
    price: "From R45,000",
    priceSuffix: "/ survey",
    accent: BRAND.violet,
    badge: null,
    features: [
      "Full Testing (+100 consumers) 15min",
      "Custom Audience",
      "Quant + AI Qual",
    ],
    cta: "Learn More",
    href: "/test24-pro",
    Icon: Target,
  },
  {
    title: "Innovatr Intelligence",
    subtitle: "Bi-weekly insights, trends and reports",
    price: "Free",
    priceSuffix: "/ limited access",
    accent: "#6BBF59",
    badge: "NEW",
    features: [
      "Monitor trends & competitor launch alerts",
      "Opportunity identification",
      "Bi-weekly curated insights",
    ],
    cta: "Explore Trends",
    href: "/portal/trends",
    Icon: TrendingUp,
  },
  {
    title: "Innovatr Consult",
    subtitle: "Enterprise Level Strategic Problem Solving",
    price: "Custom",
    priceSuffix: "pricing",
    accent: BRAND.cyan,
    badge: null,
    features: [
      "Idea to Market Consulting",
      "Strategy, Design, Testing & Go to Market",
    ],
    cta: "Explore Consult",
    href: "/consult",
    Icon: Rocket,
  },
];

const membershipPlans = [
  {
    name: "Starter",
    mascot: mascotStarter,
    price: "R60K",
    monthly: "R5K/month",
    breakdown: null as string | null,
    description: "For startups & small teams",
    savings: "Save up to 40%",
    accent: BRAND.coral,
    features: [
      "Trends Report Access",
      "Discounted Research",
      "Private Dashboard Access",
      "Test24 Basic: R5,000 per concept",
      "Test24 Pro: R45,000 per survey",
    ],
    href: "/checkout/membership-entry",
  },
  {
    name: "Growth",
    mascot: mascotGrowth,
    price: "R180K",
    monthly: null as string | null,
    breakdown: "Starter (R60K) + Growth (R120K)" as string | null,
    description: "For growing businesses",
    savings: "Best for scale",
    accent: BRAND.violet,
    badge: "Most Popular",
    value: "~R260K value",
    features: [
      "Everything in Starter",
      "x10 Test24 Basic ideas / year",
      "x2 Test24 Pro Studies / year",
    ],
    href: "/checkout/membership-growth",
  },
  {
    name: "Scale",
    mascot: mascotScale,
    price: "R255K",
    monthly: null as string | null,
    breakdown: "Starter (R60K) + Scale (R195K)" as string | null,
    description: "Enterprise-level insights",
    savings: "Maximum value",
    accent: BRAND.violet,
    badge: "Best Value",
    value: "~R360K value",
    features: [
      "Everything in Starter",
      "x15 Test24 Basic ideas / year",
      "x3 Test24 Pro Studies / year",
      "Dedicated Insights Support",
    ],
    href: "/checkout/membership-scale",
  },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 40), { passive: true });
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "background 0.35s ease, box-shadow 0.35s ease, border-bottom 0.35s ease",
        background: scrolled ? "rgba(248,247,244,0.92)" : "rgba(248,247,244,0.6)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? `1px solid ${BRAND.violet}18` : `1px solid ${BRAND.violet}08`,
        boxShadow: scrolled ? "0 2px 32px rgba(58,47,191,0.07)" : "none",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 72, gap: 16 }}>
          <a href="/" style={{ textDecoration: "none", marginRight: "auto", display: "flex", alignItems: "center" }}>
            <img src={innovatrLogo} alt="Innovatr" style={{ height: 38, width: "auto", display: "block" }} />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: link.label === "Research" ? 600 : 500,
                  color: link.label === "Research" ? BRAND.coral : BRAND.dark,
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = BRAND.coral;
                  (e.target as HTMLElement).style.background = `${BRAND.coral}12`;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = link.label === "Research" ? BRAND.coral : BRAND.dark;
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="/portal" style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: BRAND.violet,
              background: "transparent",
              border: `1.5px solid ${BRAND.violet}`,
              borderRadius: 8,
              padding: "8px 20px",
              cursor: "pointer",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = `${BRAND.violet}10`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              onClick={(e) => { e.preventDefault(); setIsLoggedIn(!isLoggedIn); }}
            >
              {isLoggedIn ? "Login" : "Sign Up"}
            </a>
            <a href="/book-demo" style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: BRAND.coral,
              border: "none",
              borderRadius: 8,
              padding: "8px 22px",
              cursor: "pointer",
              transition: "transform 0.18s, box-shadow 0.18s",
              textDecoration: "none",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.03)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px ${BRAND.coral}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              Book Demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{
      background: "#fff",
      padding: "120px 32px 100px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        {/* Left: text */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${BRAND.coral}18`, border: `1px solid ${BRAND.coral}40`, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, background: BRAND.coral, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 600, color: BRAND.coral, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Research
            </span>
          </div>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
            fontWeight: 400,
            color: BRAND.dark,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
          }}>
            World-class research,{" "}
            <span style={{ color: BRAND.violet }}>without the enterprise price tag.</span>
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 17,
            fontWeight: 400,
            color: `${BRAND.dark}cc`,
            lineHeight: 1.7,
            margin: "0 0 36px",
            maxWidth: 480,
          }}>
            Enterprise-grade consumer insight at a fraction of the agency cost. Real results in 24 hours, not 6 weeks — so your team always has what it needs to decide with confidence.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#offerings" style={{
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
              See our plans
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#membership" style={{
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
              onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}08`; }}
              onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
            >
              Explore memberships
            </a>
          </div>
        </div>

        {/* Right: hero image */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <img
            src={pricingHeroCoins}
            alt="Pricing illustration"
            style={{
              width: "100%",
              maxWidth: 520,
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}

function OfferingsSection() {
  return (
    <section id="offerings" style={{
      background: BRAND.offWhite,
      borderTop: `1px solid ${BRAND.dark}0D`,
      padding: "100px 32px",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        gap: 64,
        alignItems: "flex-start",
      }}>
        <div style={{ flex: "0 0 360px", maxWidth: 400, position: "sticky", top: 120 }}>
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
            Our Offering
          </span>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 400,
            color: BRAND.dark,
            margin: "0 0 20px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            Test, Learn,{" "}
            <span style={{ color: BRAND.violet }}>Iterate.</span>
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 16,
            fontWeight: 400,
            color: `${BRAND.dark}cc`,
            lineHeight: 1.7,
            margin: "0 0 28px",
          }}>
            From quick concept tests to full-scale strategic consulting — choose the level of depth your decision needs.
          </p>
          <a href="#membership" style={{
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
            Save with a membership
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke={BRAND.violet} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          {offerings.map((item) => (
            <div
              key={item.title}
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
                (e.currentTarget).style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
                (e.currentTarget).style.borderColor = `${item.accent}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
                (e.currentTarget).style.borderColor = `${BRAND.dark}08`;
              }}
            >
              {item.badge && (
                <div style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  background: item.accent,
                  borderRadius: 6,
                  padding: "3px 8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {item.badge}
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${item.accent}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <item.Icon size={22} color={item.accent} strokeWidth={1.8} />
                </div>
              </div>

              <div style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 22,
                fontWeight: 400,
                color: BRAND.dark,
                marginBottom: 2,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                {item.title}
              </div>

              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: item.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}>
                {item.subtitle}
              </div>

              <div style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 28,
                fontWeight: 400,
                color: BRAND.dark,
                marginBottom: 4,
                letterSpacing: "-0.02em",
              }}>
                {item.price}
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13,
                  fontWeight: 400,
                  color: `${BRAND.dark}99`,
                  marginLeft: 6,
                }}>
                  {item.priceSuffix}
                </span>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.dark}06`,
                paddingTop: 14,
                marginTop: 14,
                marginBottom: 16,
              }}>
                {item.features.map((f) => (
                  <div key={f} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 0",
                  }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: item.accent,
                      flexShrink: 0,
                      opacity: 0.6,
                    }} />
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 13,
                      color: `${BRAND.dark}aa`,
                      lineHeight: 1.4,
                    }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <a href={item.href} style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: item.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "gap 0.2s ease",
              }}
                onMouseEnter={(e) => { (e.currentTarget).style.gap = "9px"; }}
                onMouseLeave={(e) => { (e.currentTarget).style.gap = "5px"; }}
              >
                {item.cta}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke={item.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  return (
    <section id="membership" style={{
      background: BRAND.cyan,
      padding: "100px 32px",
      position: "relative",
      overflow: "hidden",
    }}>

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: BRAND.dark,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "block",
            marginBottom: 12,
          }}>
            Memberships
          </span>
          <h2 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 400,
            color: "#fff",
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}>
            Join the Club &{" "}
            <span style={{ color: BRAND.amber }}>Save</span>
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 17,
            fontWeight: 400,
            color: "#fff",
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "0 auto",
          }}>
            Scale your research. Save up to 50%.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {membershipPlans.map((plan, index) => (
            <div
              key={plan.name}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "32px 28px 28px",
                position: "relative",
                cursor: "default",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                border: index === 1 ? `2px solid ${BRAND.violet}` : `1px solid ${BRAND.dark}08`,
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget).style.transform = "translateY(-6px)";
                (e.currentTarget).style.boxShadow = "0 20px 60px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget).style.transform = "translateY(0)";
                (e.currentTarget).style.boxShadow = "none";
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  background: plan.accent,
                  borderRadius: 100,
                  padding: "5px 16px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: 28,
                    fontWeight: 400,
                    color: plan.accent,
                    margin: "0 0 4px",
                    letterSpacing: "-0.01em",
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 13,
                    color: `${BRAND.dark}99`,
                    margin: 0,
                  }}>
                    {plan.description}
                  </p>
                </div>
                <img
                  src={plan.mascot}
                  alt={plan.name}
                  style={{
                    width: 96,
                    height: 96,
                    objectFit: "contain",
                    display: "block",
                    flexShrink: 0,
                  }}
                />
              </div>

              {plan.breakdown && (
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: `${BRAND.dark}99`, marginBottom: 4 }}>
                  {plan.breakdown}
                </div>
              )}
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: 32,
                  fontWeight: 400,
                  color: BRAND.dark,
                  letterSpacing: "-0.02em",
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13,
                  color: `${BRAND.dark}99`,
                  marginLeft: 6,
                }}>
                  per year
                </span>
              </div>
              {plan.monthly && (
                <div style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 12,
                  color: `${BRAND.dark}99`,
                  marginBottom: 8,
                }}>
                  {plan.monthly}
                </div>
              )}
              {plan.value && (
                <div style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: BRAND.coral,
                  marginBottom: 8,
                }}>
                  {plan.value}
                </div>
              )}

              <div style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: plan.accent,
                marginBottom: 20,
              }}>
                {plan.savings}
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.dark}06`,
                paddingTop: 16,
                marginBottom: 24,
              }}>
                {plan.features.map((f) => (
                  <div key={f} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "7px 0",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <path d="M3 8l4 4 6-7" stroke={plan.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 13,
                      color: `${BRAND.dark}bb`,
                      lineHeight: 1.5,
                    }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <a href={plan.href} style={{
                display: "block",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                background: plan.accent,
                borderRadius: 8,
                padding: "12px 0",
                textDecoration: "none",
                textAlign: "center",
                transition: "transform 0.18s, box-shadow 0.18s",
                marginTop: "auto",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.transform = "scale(1.02)";
                  (e.currentTarget).style.boxShadow = `0 6px 20px ${plan.accent}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.transform = "scale(1)";
                  (e.currentTarget).style.boxShadow = "none";
                }}
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
  return (
    <section style={{ padding: "88px 0", background: "#fff", borderTop: `1px solid ${BRAND.dark}08` }}>
      <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" as const, padding: "0 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${BRAND.violet}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BRAND.violet} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: BRAND.coral }}>
          Subscribe to Trends and Insights
        </span>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: BRAND.dark, margin: "14px 0 18px", lineHeight: 1.2 }}>
          Stay Ahead of the Shift
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: `${BRAND.dark}cc`, margin: "0 0 32px", lineHeight: 1.65 }}>
          Subscribe to Trends and Insights and get <strong style={{ fontWeight: 600, color: BRAND.dark }}>free</strong> bi-weekly trend analysis, market shifts, and launch insights delivered to your inbox.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
          <a
            href="/portal/trends"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", background: BRAND.violet, border: "none", borderRadius: 8, padding: "13px 28px", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Subscribe Now
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="/?login=true"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 15, color: BRAND.dark, background: "transparent", border: `1.5px solid ${BRAND.dark}22`, borderRadius: 8, padding: "13px 28px", cursor: "pointer", textDecoration: "none" }}
          >
            Already a member? Log in
          </a>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: `${BRAND.dark}99`, margin: "22px 0 0", lineHeight: 1.6 }}>
          Create an account to subscribe. Full trends library access available with an Innovatr Membership.
        </p>
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
    { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
    { label: "Twitter", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
    { label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z" },
  ];
  return (
    <footer style={{ background: BRAND.dark, color: "#fff", padding: "36px 32px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, paddingBottom: 24, flexWrap: "wrap" as const }} className="footer-top">
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "inline-block", width: 28, height: 28, background: BRAND.violet, borderRadius: 6, position: "relative" as const, overflow: "hidden", flexShrink: 0 }}>
                <span style={{ position: "absolute" as const, bottom: 5, right: 5, width: 10, height: 10, background: BRAND.coral, borderRadius: "50%" }} />
              </span>
              <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, fontWeight: 400, color: "#fff" }}>Innovatr</span>
            </div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 22px" }}>
              Smart research in 24 hours. Built for brands that can't afford to guess.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {socials.map((s) => (
                <a key={s.label} href="#" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none" }}>
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

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: BRAND.offWhite }}>
      <Navbar />
      <HeroSection />
      <OfferingsSection />
      <MembershipSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
