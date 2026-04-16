import { ArrowLeft, Rocket, CheckCircle2, Building2, Target, Download, ArrowRight, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
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
    .t24p-grid-3 { grid-template-columns: 1fr !important; }
    .t24p-grid-2 { grid-template-columns: 1fr !important; }
    .t24p-cta-row { flex-direction: column !important; }
  }
`;

const features = [
  { title: "24hr Turnaround", desc: "Enterprise-grade insights at startup speed" },
  { title: "Custom audience, reach & question flexibility", desc: "Tailor every aspect to your needs" },
  { title: "+100 Consumer Reach, 10-15 min Survey", desc: "Deep insights from comprehensive surveys" },
  { title: "+100 AI Qual Voice of the Consumer Videos", desc: "Qualitative depth at quantitative scale" },
  { title: "Private Results Dashboard Access (members)", desc: "Real-time access to your data" },
  { title: "Robust Report with unlimited Filtering", desc: "Analyze data from every angle" },
  { title: "Strategic Recommendations from AI + Human Experts", desc: "Actionable insights backed by expertise" },
];

const useCases = [
  "Brand health audit for your full portfolio",
  "Testing a full creative route or campaign territory",
  "Validation of new product concepts across multiple audiences",
  "Understanding messaging or benefit ladders at scale",
  "Pre launch testing for a major pack redesign or product relaunch",
];

export default function Test24ProPage() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';

  useSEO({
    title: "Test24 Pro — Advanced Consumer Research",
    description: "Get deeper consumer intelligence with Test24 Pro. Audience segmentation, competitor benchmarking, and strategic recommendations — all in 24 hours.",
    canonicalUrl: "https://www.innovatr.co.za/test24-pro",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Test24 Pro",
      "description": "Advanced 24-hour consumer research with audience segmentation, competitor benchmarking, and strategic recommendations — delivered overnight in South Africa.",
      "provider": { "@type": "Organization", "name": "Innovatr", "url": "https://www.innovatr.co.za" },
      "serviceType": "Consumer Research",
      "areaServed": { "@type": "Country", "name": "South Africa" },
      "url": "https://www.innovatr.co.za/test24-pro",
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
              background: `${BRAND.violet}14`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Rocket size={28} color={BRAND.violet} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.violet, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                Test24 Pro
              </div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, margin: 0, color: BRAND.dark, letterSpacing: "-0.02em" }}>
                Innovatr Test24 Pro
              </h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Star size={14} color={BRAND.violet} fill={BRAND.violet} />
            <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.violet }}>Member Pricing Available</span>
          </div>
          <p style={{ fontSize: 18, color: BRAND.textSecondary, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            Enterprise Level, Quant &amp; Qual Testing in 24hrs — Custom Quant Surveys with AI Qual Included.
          </p>
        </div>

        {/* 3 summary cards */}
        <div className="t24p-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Building2 size={18} color={BRAND.violet} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Ideal For</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Enterprise Teams", "Corporate Brands", "Large Agencies"].map((tag) => (
                <span key={tag} style={{
                  background: `${BRAND.violet}10`, color: BRAND.violet,
                  fontSize: 12, fontWeight: 600, padding: "4px 12px",
                  borderRadius: 100, display: "inline-block",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.violet}30`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Rocket size={18} color={BRAND.violet} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Pain Point</span>
            </div>
            <p style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.6, margin: 0 }}>
              24hr Quant Validation with Qual Empathy at Scale with full flexibility — at price points unheard of.
            </p>
          </div>

          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
            borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Target size={18} color={BRAND.violet} />
              <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Utilised For</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Deep quant validation", "Behavioural testing with full diagnostics", "Decision making for product, brand, and creative investments", "Market ready research with AI Qual included"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: BRAND.violet, flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.5 }}>{item}</span>
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
            <CheckCircle2 size={22} color={BRAND.violet} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: 0 }}>Key Features</h2>
          </div>
          <div className="t24p-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color={BRAND.violet} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: BRAND.dark, marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: BRAND.textTertiary, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Demo Report */}
        <div style={{
          background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
          borderRadius: 16, padding: 32, marginBottom: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: "0 0 6px" }}>
            Download Demo Report
          </h2>
          <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: "0 0 20px" }}>
            See what your Pro report will look like
          </p>
          <a
            href="/assets/reports/Test24-Pro-Demo.pdf"
            download
            data-testid="button-download-demo-report"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              border: `1.5px solid ${BRAND.border}`, borderRadius: 10,
              padding: "12px 24px", color: BRAND.textPrimary,
              fontWeight: 600, fontSize: 14, textDecoration: "none",
              fontFamily: "inherit", background: BRAND.offWhite,
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.violet; (e.currentTarget as HTMLElement).style.background = `${BRAND.violet}06`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BRAND.border; (e.currentTarget as HTMLElement).style.background = BRAND.offWhite; }}
          >
            <Download size={15} color={BRAND.violet} />
            Download Demo Report
          </a>
        </div>

        {/* Dashboard Experience Video */}
        <div style={{
          background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
          borderRadius: 16, padding: 32, marginBottom: 48,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark, margin: "0 0 6px" }}>
            Dashboard Experience Video
          </h2>
          <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: "0 0 20px" }}>
            See how Pro users can filter &amp; explore results on their private dashboard
          </p>
          <div style={{ padding: "56.25% 0 0 0", position: "relative", borderRadius: 10, overflow: "hidden" }}>
            <iframe
              src="https://player.vimeo.com/video/1138121972?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="Dashboard Experience Video"
              data-testid="video-dashboard-experience"
            />
          </div>
        </div>

        {/* When to use */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, color: BRAND.dark, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            When to use Test24 Pro
          </h2>
          <p style={{ fontSize: 16, color: BRAND.textSecondary, lineHeight: 1.6, margin: "0 0 24px" }}>
            Best for when you need structure, statistical confidence, full audience tailoring, and a report that can land with leadership or guide a major business decision.
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px" }}>Typical Pro use cases</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {useCases.map((item) => (
              <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color={BRAND.violet} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 15, color: BRAND.textSecondary, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: BRAND.violet, margin: 0 }}>
            Comprehensive, enterprise grade, and designed for bigger decisions.
          </p>
        </div>

        {/* CTA Banner */}
        <div style={{
          background: BRAND.dark, borderRadius: 18, padding: "48px 40px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(ellipse at 30% 50%, ${BRAND.violet}30 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontFamily: '"Playfair Display", serif', fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Ready for enterprise-grade testing?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", margin: "0 0 28px" }}>
              Get the depth of qualitative research with the scale of quantitative data.
            </p>
            <div className="t24p-cta-row" style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <a
                href="/#pricing"
                data-testid="button-get-started"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: BRAND.violet, color: "#fff",
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
                  transition: "background 0.2s",
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
