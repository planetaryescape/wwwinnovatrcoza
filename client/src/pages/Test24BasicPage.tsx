import { ArrowLeft, Clock, CheckCircle2, Users, Zap, Target, Download, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSEO } from "@/hooks/use-seo";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  cyan: "#4EC9E8",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
  cardBg: "#FFFFFF",
  border: "#E5E3DE",
  borderLight: "#EDEBE7",
  textPrimary: "#0D0B1F",
  textSecondary: "#4A4862",
  textTertiary: "#8A879A",
};

const responsiveStyles = `
  @media (max-width: 768px) {
    .t24b-grid-3 { grid-template-columns: 1fr !important; }
    .t24b-grid-2 { grid-template-columns: 1fr !important; }
    .t24b-cta-row { flex-direction: column !important; }
  }
`;

const features = [
  { title: "24hr turnaround for rapid validation", desc: "Get insights fast when speed matters" },
  { title: "Flexible idea volume with no minimum", desc: "Test as many or as few ideas as you need" },
  { title: "X100 Consumer Reach, 5min Survey", desc: "Quick, focused feedback from real consumers" },
  { title: "Automated brief upload portal saving you time", desc: "Simple, streamlined briefing process" },
  { title: "Final Reports emailed 24hrs later", desc: "Actionable insights delivered on time" },
];

const useCases = [
  "Testing a social media post before launch",
  "Checking two packaging designs or thumbnails",
  "Quick validation of a new product name",
  "Understanding which claim or benefit feels strongest",
  "Early concept screening for rough ideas or low fidelity designs",
];

export default function Test24BasicPage() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const { formatPrice } = useCurrency();

  useSEO({
    title: "Test24 Basic — 24-Hour Consumer Research",
    description: "Run a 24-hour consumer research test with real South Africans. Test24 Basic delivers brand recall, purchase intent, and message reaction — results by tomorrow.",
    canonicalUrl: "https://www.innovatr.co.za/test24-basic",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Test24 Basic",
      "description": "A 24-hour consumer research report covering brand recall, purchase intent, and emotional reaction — ideal for campaign and product testing in South Africa.",
      "provider": { "@type": "Organization", "name": "Innovatr", "url": "https://www.innovatr.co.za" },
      "serviceType": "Consumer Research",
      "areaServed": { "@type": "Country", "name": "South Africa" },
      "url": "https://www.innovatr.co.za/test24-basic",
    } as Record<string, unknown>,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BRAND.offWhite, color: BRAND.textPrimary, fontFamily: '"DM Sans", sans-serif' }}>
      <style>{responsiveStyles}</style>
      <PublicNavbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Back button */}
        <button
          onClick={() => setLocation(backHref)}
          data-testid="button-back"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "none", border: "none", color: BRAND.textTertiary,
            cursor: "pointer", fontSize: 14, fontFamily: "inherit",
            marginBottom: 40, padding: "4px 0", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textPrimary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textTertiary; }}
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              background: `${BRAND.coral}14`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Clock size={28} color={BRAND.coral} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.coral, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                Test24 Basic
              </div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0, color: BRAND.dark, letterSpacing: "-0.02em" }}>
                Innovatr Test24 Basic
              </h1>
            </div>
          </div>
          <p style={{ fontSize: 18, color: BRAND.textSecondary, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            24hr Pay Per Concept Testing — {formatPrice(5000)} per concept (members). Idea, Design, Creative rapid testing in any format.
          </p>
        </div>

        {/* 3 summary cards */}
        <div className="t24b-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Users size={18} color={BRAND.coral} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Ideal For</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Agencies", "Product Leads", "Startups"].map((tag) => (
                <span key={tag} style={{
                  background: `${BRAND.coral}10`, color: BRAND.coral,
                  fontSize: 12, fontWeight: 600, padding: "4px 12px",
                  borderRadius: 100, display: "inline-block",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.coral}30`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Zap size={18} color={BRAND.coral} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Pain Point</span>
            </div>
            <p style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.6, margin: 0 }}>
              Teams wanting faster concept testing with flexibility to only pay per concept — flexibility &amp; affordability unlocked.
            </p>
          </div>

          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Target size={18} color={BRAND.coral} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Utilised For</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Fast creative checks", "Quick design validation", "Early stage concept screening", "Rapid decision support"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: BRAND.coral, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: BRAND.textSecondary }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div style={{
          background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
          borderRadius: 16, padding: 32, marginBottom: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <CheckCircle2 size={22} color={BRAND.coral} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: 0 }}>Key Features</h2>
          </div>
          <div className="t24b-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: BRAND.dark, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: BRAND.textTertiary, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Demo Materials */}
        <div style={{
          background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
          borderRadius: 16, padding: 32, marginBottom: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: "0 0 6px" }}>
            Download Demo Materials
          </h2>
          <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: "0 0 20px" }}>
            See what your reports and questionnaire will look like
          </p>
          <div className="t24b-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <a
              href="/assets/reports/Test24-Basic-Demo.pdf"
              download
              data-testid="button-download-demo-report"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: `1.5px solid ${BRAND.border}`, borderRadius: 10,
                padding: "12px 20px", color: BRAND.textPrimary,
                fontWeight: 600, fontSize: 14, textDecoration: "none",
                fontFamily: "inherit", background: BRAND.offWhite,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.coral; (e.currentTarget as HTMLElement).style.background = `${BRAND.coral}06`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.border; (e.currentTarget as HTMLElement).style.background = BRAND.offWhite; }}
            >
              <Download size={15} color={BRAND.coral} />
              Download Demo Report
            </a>
            <a
              href="/assets/reports/Test24-Basic-Questionnaire.docx"
              download
              data-testid="button-download-demo-questionnaire"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: `1.5px solid ${BRAND.border}`, borderRadius: 10,
                padding: "12px 20px", color: BRAND.textPrimary,
                fontWeight: 600, fontSize: 14, textDecoration: "none",
                fontFamily: "inherit", background: BRAND.offWhite,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.coral; (e.currentTarget as HTMLElement).style.background = `${BRAND.coral}06`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.border; (e.currentTarget as HTMLElement).style.background = BRAND.offWhite; }}
            >
              <Download size={15} color={BRAND.coral} />
              Download Demo Questionnaire
            </a>
          </div>
        </div>

        {/* Respondent Experience Video */}
        <div style={{
          background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
          borderRadius: 16, padding: 32, marginBottom: 48,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: "0 0 6px" }}>
            Respondent Experience Video
          </h2>
          <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: "0 0 20px" }}>
            See what consumers experience when answering a survey
          </p>
          <div style={{ padding: "56.25% 0 0 0", position: "relative", borderRadius: 10, overflow: "hidden" }}>
            <iframe
              src="https://player.vimeo.com/video/1138122312?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="Respondent Experience Video"
              data-testid="video-respondent-experience"
            />
          </div>
        </div>

        {/* When to use */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, color: BRAND.dark, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            When to use Test24 Basic
          </h2>
          <p style={{ fontSize: 16, color: BRAND.textSecondary, lineHeight: 1.6, margin: "0 0 24px" }}>
            Perfect for the moments when you need a fast signal, a simple yes or no, or a quick comparison before you invest more time or budget.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px" }}>Typical Basic use cases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {useCases.map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, color: BRAND.textSecondary, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: BRAND.coral, margin: 0 }}>
            Short, sharp, and made for speed.
          </p>
        </div>

        {/* CTA Banner */}
        <div style={{
          background: BRAND.dark, borderRadius: 18, padding: "48px 40px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at 70% 50%, ${BRAND.coral}20 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Ready to test your ideas?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", margin: "0 0 28px" }}>
              Get started with Test24 Basic and validate your concepts in just 24 hours.
            </p>
            <div className="t24b-cta-row" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <a
                href="/#pricing"
                data-testid="button-get-started"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: BRAND.coral, color: "#fff",
                  padding: "13px 28px", borderRadius: 10,
                  fontWeight: 700, fontSize: 15, textDecoration: "none",
                  fontFamily: "inherit", transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                Get Started
                <ArrowRight size={15} />
              </a>
              <a
                href="/#pricing"
                data-testid="button-learn-more"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff",
                  padding: "13px 28px", borderRadius: 10,
                  fontWeight: 600, fontSize: 15, textDecoration: "none",
                  fontFamily: "inherit", background: "rgba(255,255,255,0.06)",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <InnovatrFooter />
    </div>
  );
}
