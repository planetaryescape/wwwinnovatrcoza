import { useState, useEffect, useRef } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import { User } from "lucide-react";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";
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

const CLIENTS = [
  "Discovery Bank", "Heineken", "Rain", "Mondelez", "Revlon",
  "Tiger Brands", "DGB", "Netflorist", "ooba", "Nando's",
  "BATA Shoes", "SUNPAC", "Clover", "Rugani Juice",
  "Namibian Breweries", "Dairy Maid", "KWV",
];

const STATS = [
  { value: "200+", label: "Studies", color: BRAND.violet },
  { value: "25+",  label: "Markets", color: BRAND.coral },
  { value: "44M+", label: "Panel",   color: BRAND.cyan },
  { value: "10+",  label: "Industries", color: BRAND.amber },
];

const WHY_POINTS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Consumer intelligence that moves fast",
    body: "Proprietary frameworks + live consumer panels = insight in days, not months. Speed without sacrifice.",
    accent: BRAND.violet,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "End-to-end from strategy to shelf",
    body: "We don't hand you a report and disappear. We stay in the room through strategy, testing and launch.",
    accent: BRAND.coral,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: "Growth is the only metric that matters",
    body: "Every engagement is designed to unlock real commercial growth — not just interesting findings.",
    accent: BRAND.cyan,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "A team that's been in your seat",
    body: "Brand-side, agency-side — across global markets in Europe, the Middle East, and beyond. We understand the pressure.",
    accent: BRAND.amber,
  },
];

/* ─── Client Ticker ────────────────────────────────────────────────────── */
function ClientTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf: number;
    const step = () => {
      x += 0.5;
      if (x >= el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(-${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const repeated = [...CLIENTS, ...CLIENTS, ...CLIENTS];
  return (
    <div style={{ overflow: "hidden", position: "relative" as const, padding: "16px 0" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(to right, #fff, transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(to left, #fff, transparent)`, zIndex: 2, pointerEvents: "none" }} />
      <div ref={trackRef} style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" as const, willChange: "transform" }}>
        {repeated.map((client, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: `${BRAND.dark}99`, padding: "0 18px", letterSpacing: "0.02em" }}>{client}</span>
            <span style={{ color: `${BRAND.coral}50`, fontSize: 7 }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Left column: Why Innovatr ─────────────────────────────────────────── */
function WhySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: BRAND.dark, margin: "0 0 16px", lineHeight: 1.1 }}>
        The team behind<br />
        <span style={{ color: BRAND.violet }}>200+ growth stories.</span>
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: `${BRAND.dark}bb`, lineHeight: 1.8, margin: "0 0 32px", maxWidth: 460 }}>
        Innovatr is the decision-making infrastructure for ambitious brands — combining strategy, real consumer insights, and the power of AI to deliver decisions that drive action. Not in weeks. In 24 hours.
      </p>

      {/* 4 Why Points */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 22, marginBottom: 36 }}>
        {WHY_POINTS.map((point, i) => (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${point.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: point.accent }}>
              {point.icon}
            </div>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: BRAND.dark, margin: "0 0 3px", lineHeight: 1.3 }}>{point.title}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: `${BRAND.dark}aa`, margin: 0, lineHeight: 1.65 }}>{point.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href="https://calendly.com/richard-1220"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="button-book-demo"
        style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: BRAND.dark, background: BRAND.amber, padding: "13px 26px", borderRadius: 10, textDecoration: "none", cursor: "pointer", alignSelf: "flex-start" }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Book a 30-min intro call
      </a>
    </div>
  );
}

/* ─── Right column: Contact Form ─────────────────────────────────────────── */
function ContactForm() {
  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [form, setForm] = useState({ name: "", company: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let recaptchaToken = "";
      const grecaptcha = window.grecaptcha;
      if (grecaptcha) {
        recaptchaToken = await new Promise<string>((resolve, reject) => {
          grecaptcha.ready(async () => {
            try {
              const token = await grecaptcha.execute(SITE_KEY, { action: "contact" });
              resolve(token);
            } catch (err) {
              reject(err);
            }
          });
        });
      }
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setSubmitted(true);
      setForm({ name: "", company: "", email: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: BRAND.dark,
    background: BRAND.offWhite,
    border: `1.5px solid ${BRAND.dark}10`,
    borderRadius: 8,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: `${BRAND.dark}bb`,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  };

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${BRAND.dark}08`, padding: "44px 40px" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: BRAND.coral, display: "block", marginBottom: 10 }}>
        Send a message
      </span>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: BRAND.dark, margin: "0 0 32px", lineHeight: 1.15 }}>
        Tell us what you're working on
      </h2>

      {submitted ? (
        <div style={{ background: `${BRAND.cyan}12`, border: `1px solid ${BRAND.cyan}30`, borderRadius: 12, padding: "36px 24px", textAlign: "center" as const }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BRAND.cyan}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: BRAND.dark, margin: "0 0 8px" }}>Message received</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: `${BRAND.dark}aa`, margin: 0 }}>We'll be in touch within one business day.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="ir-card-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input data-testid="input-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Hannah Smith" style={fieldStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input data-testid="input-company" type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Your company" style={fieldStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email address</label>
            <input data-testid="input-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" style={fieldStyle} required />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>What are you working on?</label>
            <textarea
              data-testid="input-message"
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us about your innovation challenge, the question you're trying to answer, or the opportunity you're chasing..."
              rows={5}
              required
              style={{ ...fieldStyle, resize: "vertical" as const, lineHeight: 1.6 }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#dc2626" }}>
              {error}
            </div>
          )}
          <button
            data-testid="button-submit-contact"
            type="submit"
            disabled={loading}
            style={{ width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: "#fff", background: loading ? `${BRAND.violet}99` : BRAND.violet, border: "none", borderRadius: 10, padding: "15px 0", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {loading ? "Sending…" : "Send Message"}
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: `${BRAND.dark}55`, margin: "12px 0 0", textAlign: "center" as const }}>
            Protected by reCAPTCHA &mdash;{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: `${BRAND.dark}55` }}>Privacy</a>
            {" "}&amp;{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: `${BRAND.dark}55` }}>Terms</a>
          </p>
        </form>
      )}
    </div>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */
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

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function ContactUs() {
  useSEO({
    title: "Contact Us",
    description: "Get in touch with Innovatr. Ask about research packages, membership, or consulting — we'll help you find the right approach for your brand.",
    canonicalUrl: "https://www.innovatr.co.za/contact",
  });
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: BRAND.offWhite, minHeight: "100vh" }}>
      <PublicNavbar activePage="Contact" />
      <main>
        <div className="ir-contact-outer" style={{ width: "100%", padding: "116px 60px 88px", boxSizing: "border-box" as const }}>
          <div className="ir-two-col" style={{ display: "flex", flexDirection: "row" as const, gap: 60, alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <WhySection />
            </div>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <InnovatrFooter />
    </div>
  );
}
