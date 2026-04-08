import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { useLocation } from "wouter";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
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
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function InnovatrNavbar() {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginDefaultSignup, setLoginDefaultSignup] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const openSignup = () => { setLoginDefaultSignup(true); setLoginOpen(true); };
  const openLogin = () => { setLoginDefaultSignup(false); setLoginOpen(true); };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease, border-bottom 0.35s ease",
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

            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="innovatr-desktop-nav">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: 14,
                    fontWeight: 500,
                    color: BRAND.dark,
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: 6,
                    transition: "color 0.2s, background 0.2s",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = BRAND.coral;
                    (e.target as HTMLElement).style.background = `${BRAND.coral}12`;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = BRAND.dark;
                    (e.target as HTMLElement).style.background = "transparent";
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="innovatr-desktop-nav">
              {user ? (
                <a
                  href="/portal/dashboard"
                  style={{
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
                    letterSpacing: "0.01em",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}10`; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
                >
                  Dashboard
                </a>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      color: BRAND.dark,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 12px",
                      borderRadius: 8,
                      letterSpacing: "0.01em",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.color = BRAND.violet; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.color = BRAND.dark; }}
                  >
                    Login
                  </button>
                  <button
                    onClick={openSignup}
                    style={{
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
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}10`; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
                  >
                    Sign Up
                  </button>
                </>
              )}
              <a
                href="https://calendly.com/richard-1220"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: BRAND.coral,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 22px",
                  cursor: "pointer",
                  transition: "transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.18s",
                  letterSpacing: "0.01em",
                  textDecoration: "none",
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
                Book Demo
              </a>
            </div>

            <button
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}
              className="innovatr-mobile-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BRAND.dark} strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <><path d="M3 6h18M3 12h18M3 18h18" /></>
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <div style={{
              background: "rgba(248,247,244,0.97)",
              backdropFilter: "blur(20px)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: 15,
                  fontWeight: 500,
                  color: BRAND.dark,
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: 8,
                }}>
                  {link.label}
                </a>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                {user ? (
                  <a href="/portal/dashboard" style={{ flex: 1, fontFamily: '"DM Sans"', fontWeight: 500, fontSize: 14, color: BRAND.violet, background: "transparent", border: `1.5px solid ${BRAND.violet}`, borderRadius: 8, padding: "9px 16px", cursor: "pointer", textDecoration: "none", textAlign: "center" }}>Dashboard</a>
                ) : (
                  <button onClick={openSignup} style={{ flex: 1, fontFamily: '"DM Sans"', fontWeight: 500, fontSize: 14, color: BRAND.violet, background: "transparent", border: `1.5px solid ${BRAND.violet}`, borderRadius: 8, padding: "9px 16px", cursor: "pointer" }}>Sign Up</button>
                )}
                <a href="https://calendly.com/richard-1220" target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontFamily: '"DM Sans"', fontWeight: 600, fontSize: 14, color: "#fff", background: BRAND.coral, border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer", textDecoration: "none", textAlign: "center" }}>Book Demo</a>
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .innovatr-desktop-nav { display: none !important; }
            .innovatr-mobile-btn { display: block !important; }
          }
        `}</style>
      </nav>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        defaultSignup={loginDefaultSignup}
        returnTo="/portal/dashboard"
      />
    </>
  );
}
