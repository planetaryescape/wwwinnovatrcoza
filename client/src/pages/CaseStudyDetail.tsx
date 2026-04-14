import { useEffect, useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import PublicNavbar from "@/components/PublicNavbar";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
import { ArrowLeft, Target, Lightbulb, Rocket, Clock, Award, TrendingUp, User } from "lucide-react";
import cookingGif from "@assets/RafaelVarona_Playbook_Cooking_Animation_1768339161246.gif";
import airplanesGif from "@assets/rafael-varona-airplanes_1768339161246.gif";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  dark: "#1E1B3A",
  offWhite: "#F8F7F4",
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

const gifMap: Record<string, string> = {
  cooking: cookingGif,
  airplanes: airplanesGif,
  pen: penGif,
  default: cookingGif,
};

interface CaseStudy {
  id: string;
  slug: string;
  headline: string;
  client: string;
  industry: string;
  problemShort: string;
  problem: string;
  process: string;
  results: string;
  phases: string[];
  duration: string;
  highlight: string;
  gifAsset: string;
  bgColor: string;
}

const phases = [
  { id: "strategy", label: "Strategy & Direction", icon: Target, color: BRAND.violet },
  { id: "innovation", label: "Innovation & Testing", icon: Lightbulb, color: BRAND.coral },
  { id: "execution", label: "Execution & Scale", icon: Rocket, color: "#4EC9E8" },
];


export default function CaseStudyDetail() {
  const params = useParams<{ id: string }>();
  const slug = params.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: caseStudy, isLoading, isError } = useQuery<CaseStudy>({
    queryKey: ["/api/case-studies", slug],
    queryFn: async () => {
      const res = await fetch(`/api/case-studies/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    retry: false,
  });

  useSEO({
    title: caseStudy ? `${caseStudy.client} Case Study` : "Case Study",
    description: caseStudy?.problemShort ?? "Real-world consumer research case studies from Innovatr, showing how brands in South Africa unlock growth through data.",
    canonicalUrl: `https://www.innovatr.co.za/case-study/${slug}`,
    jsonLd: caseStudy ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.innovatr.co.za" },
        { "@type": "ListItem", "position": 2, "name": "Case Studies", "item": "https://www.innovatr.co.za/case-studies" },
        { "@type": "ListItem", "position": 3, "name": caseStudy.client, "item": `https://www.innovatr.co.za/case-study/${slug}` },
      ],
    } as Record<string, unknown> : undefined,
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: BRAND.offWhite }}>
        <PublicNavbar activePage="Case Studies" />
        <main>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 32px 48px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
              <div style={{ aspectRatio: "1", background: `${BRAND.dark}08`, borderRadius: 16 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16 }}>
                <div style={{ height: 20, width: "40%", background: `${BRAND.dark}08`, borderRadius: 6 }} />
                <div style={{ height: 48, width: "100%", background: `${BRAND.dark}08`, borderRadius: 6 }} />
                <div style={{ height: 48, width: "75%", background: `${BRAND.dark}08`, borderRadius: 6 }} />
                <div style={{ height: 80, width: "100%", background: `${BRAND.dark}08`, borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !caseStudy) {
    return (
      <div style={{ minHeight: "100vh", background: BRAND.offWhite, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PublicNavbar activePage="Case Studies" />
        <main style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: BRAND.dark, marginBottom: 16 }}>
            Case Study Not Found
          </h1>
          <a
            href="/case-studies"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 14,
              fontWeight: 600,
              color: BRAND.violet,
              textDecoration: "none",
              border: `1.5px solid ${BRAND.violet}`,
              borderRadius: 8,
              padding: "10px 24px",
            }}
          >
            <ArrowLeft size={16} />
            Back to Case Studies
          </a>
        </main>
      </div>
    );
  }

  const primaryPhase = phases.find(p => p.id === caseStudy.phases[0]);
  const gifSrc = gifMap[caseStudy.gifAsset] ?? gifMap.default;

  return (
    <div style={{ minHeight: "100vh", background: BRAND.offWhite, fontFamily: '"DM Sans", sans-serif' }}>
      <PublicNavbar activePage="Case Studies" />
      <main>
      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>
        {/* Back Link */}
        <div style={{ paddingTop: 96, paddingBottom: 8 }}>
          <a
            href="/case-studies"
            data-testid="button-back"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: '"DM Sans", sans-serif',
              fontSize: 13,
              fontWeight: 500,
              color: `rgba(30,27,58,0.5)`,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.color = BRAND.violet; }}
            onMouseLeave={(e) => { (e.currentTarget).style.color = `rgba(30,27,58,0.5)`; }}
          >
            <ArrowLeft size={14} />
            Back to Case Studies
          </a>
        </div>

        {/* Hero Section */}
        <section aria-label="Case study overview" style={{ padding: "32px 0 64px" }}>
          <div className="ir-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
            {/* Left - GIF */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                position: "relative",
                aspectRatio: "1",
                overflow: "hidden",
                borderRadius: 16,
                boxShadow: "0 12px 48px rgba(30,27,58,0.12)",
                backgroundColor: caseStudy.bgColor,
              }}
            >
              <img
                src={gifSrc}
                alt={`${caseStudy.client} case study`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </motion.div>

            {/* Right - Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ paddingTop: 8 }}
            >
              {/* Industry + Duration badges */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  background: primaryPhase?.color ?? BRAND.violet,
                  letterSpacing: "0.02em",
                }}>
                  {caseStudy.industry}
                </span>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  color: BRAND.dark,
                  background: `${BRAND.dark}0A`,
                  border: `1px solid ${BRAND.dark}12`,
                }}>
                  <Clock size={13} />
                  {caseStudy.duration}
                </span>
              </div>

              {/* Client name */}
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: BRAND.coral,
                marginBottom: 12,
              }}>
                {caseStudy.client}
              </p>

              {/* Headline */}
              <h1 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: BRAND.dark,
                lineHeight: 1.15,
                marginBottom: 24,
              }}>
                {caseStudy.headline}
              </h1>

              {/* Phase badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                {caseStudy.phases.map(phaseId => {
                  const phaseInfo = phases.find(p => p.id === phaseId);
                  const Icon = phaseInfo?.icon || Target;
                  return (
                    <span
                      key={phaseId}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#fff",
                        background: phaseInfo?.color ?? BRAND.violet,
                      }}
                    >
                      <Icon size={13} />
                      {phaseInfo?.label}
                    </span>
                  );
                })}
              </div>

              {/* Key result highlight */}
              <div style={{
                background: "#fff",
                border: `1px solid ${BRAND.dark}0E`,
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 2px 12px rgba(30,27,58,0.06)",
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: `${primaryPhase?.color ?? BRAND.violet}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Award size={20} style={{ color: primaryPhase?.color ?? BRAND.violet }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: `rgba(30,27,58,0.4)`, marginBottom: 4 }}>
                    Key Result
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: primaryPhase?.color ?? BRAND.violet, lineHeight: 1.2 }}>
                    {caseStudy.highlight}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content sections */}
        <section aria-label="Research details" style={{ paddingBottom: 64 }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BRAND.dark}0E`, boxShadow: "0 2px 16px rgba(30,27,58,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: `${BRAND.coral}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <TrendingUp size={18} style={{ color: BRAND.coral, transform: "rotate(180deg)" }} />
                    </div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: BRAND.dark, margin: 0 }}>
                      The Problem
                    </h2>
                  </div>
                  <p style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", color: `rgba(30,27,58,0.75)`, lineHeight: 1.8, margin: 0 }}>
                    {caseStudy.problem}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Process */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BRAND.dark}0E`, boxShadow: "0 2px 16px rgba(30,27,58,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: `${BRAND.violet}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Lightbulb size={18} style={{ color: BRAND.violet }} />
                    </div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: BRAND.dark, margin: 0 }}>
                      The Process
                    </h2>
                  </div>
                  <p style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", color: `rgba(30,27,58,0.75)`, lineHeight: 1.8, margin: 0 }}>
                    {caseStudy.process}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* The Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BRAND.dark}0E`, boxShadow: "0 2px 16px rgba(30,27,58,0.05)", overflow: "hidden" }}>
                <div style={{ padding: "36px 40px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: "#10B98118", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <TrendingUp size={18} style={{ color: "#10B981" }} />
                    </div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: BRAND.dark, margin: 0 }}>
                      The Results
                    </h2>
                  </div>
                  <p style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", color: `rgba(30,27,58,0.75)`, lineHeight: 1.8, margin: 0 }}>
                    {caseStudy.results}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-label="Call to action" style={{ paddingBottom: 80 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              background: BRAND.dark,
              borderRadius: 16,
              padding: "56px 48px",
              textAlign: "center",
              maxWidth: 860,
              margin: "0 auto",
              boxShadow: "0 8px 48px rgba(30,27,58,0.18)",
            }}>
              <h3 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#fff",
                marginBottom: 12,
              }}>
                Want results like these?
              </h3>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 15,
                color: "rgba(255,255,255,0.65)",
                marginBottom: 32,
                maxWidth: 460,
                margin: "0 auto 32px",
                lineHeight: 1.7,
              }}>
                Get in touch to discuss how we can help transform your business.
              </p>
              <div className="cta-buttons" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
                <a
                  href="/contact"
                  data-testid="button-cta-start-project"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    background: BRAND.coral,
                    padding: "14px 36px",
                    borderRadius: 8,
                    textDecoration: "none",
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
                  Start Your Project
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/case-studies"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.75)",
                    background: "rgba(255,255,255,0.08)",
                    padding: "14px 28px",
                    borderRadius: 8,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.15)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.background = "rgba(255,255,255,0.08)"; }}
                >
                  View More Case Studies
                </a>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      </main>
      {/* Footer */}
      <footer aria-label="Site footer" style={{ background: BRAND.dark, color: "#fff", padding: "36px 32px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
            <img src={innovatrLogo} alt="Innovatr" style={{ height: 30, filter: "brightness(0) invert(1)" }} />
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              © 2026 Innovatr. All rights reserved.
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              <span style={{ fontFamily: '"DM Sans", monospace', fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>System Operational</span>
            </div>
          </div>
        </div>
      </footer>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .cta-buttons a { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
