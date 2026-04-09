const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
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

export function InnovatrFooter() {
  return (
    <footer style={{
      background: BRAND.dark,
      color: "#fff",
      padding: "36px 32px 24px",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 32,
          paddingBottom: 24,
          flexWrap: "wrap",
        }} className="innovatr-footer-top">
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <img src="/Innovatr_logo-01.png" alt="Innovatr" style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }} />
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
                { label: "Test24 Basic", href: "/checkout/test24-basic" },
                { label: "Test24 Pro", href: "/checkout/test24-pro" },
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
                { label: "Terms of Use", href: "/terms-of-use" },
                { label: "Cookie Policy", href: "/cookie-policy" },
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
          .innovatr-footer-top {
            flex-direction: column !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </footer>
  );
}
