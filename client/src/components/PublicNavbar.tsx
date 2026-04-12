import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { LayoutDashboard, LogOut, User } from "lucide-react";
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

interface PublicNavbarProps {
  activePage?: string;
}

export default function PublicNavbar({ activePage }: PublicNavbarProps) {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginDefaultSignup, setLoginDefaultSignup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const openSignup = () => { setLoginDefaultSignup(true); setLoginOpen(true); };
  const openLogin = () => { setLoginDefaultSignup(false); setLoginOpen(true); };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "";
  const firstName = user?.name ? user.name.split(" ")[0] : "";

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    window.location.href = "/";
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} defaultSignup={loginDefaultSignup} />
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

            {/* Logo */}
            <a href="/" style={{ textDecoration: "none", marginRight: "auto", display: "flex", alignItems: "center" }}>
              <img src={innovatrLogo} alt="Innovatr" style={{ height: 38, width: "auto", display: "block" }} />
            </a>

            {/* Desktop nav links */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="pnav-desktop">
              {NAV_LINKS.map((link) => {
                const isActive = activePage === link.label;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? BRAND.coral : BRAND.dark,
                      textDecoration: "none",
                      padding: "6px 12px",
                      borderRadius: 6,
                      transition: "color 0.2s, background 0.2s",
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = BRAND.coral;
                      (e.currentTarget as HTMLElement).style.background = `${BRAND.coral}12`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = isActive ? BRAND.coral : BRAND.dark;
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            {/* Desktop CTAs */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="pnav-desktop">
              {isAuthenticated ? (
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    data-testid="button-user-menu"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 2px",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: BRAND.violet,
                      color: "#fff",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 13,
                      fontWeight: 700,
                      flexShrink: 0,
                      letterSpacing: "0.02em",
                    }}>
                      {initials || <User size={16} />}
                    </div>
                    <span style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      color: BRAND.dark,
                      whiteSpace: "nowrap",
                    }}>
                      Welcome, <strong>{firstName}</strong>
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div
                      data-testid="menu-user-dropdown"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        background: "#fff",
                        borderRadius: 10,
                        boxShadow: "0 8px 32px rgba(58,47,191,0.12), 0 2px 8px rgba(0,0,0,0.08)",
                        border: `1px solid ${BRAND.violet}14`,
                        minWidth: 220,
                        overflow: "hidden",
                        zIndex: 1010,
                      }}
                    >
                      <div style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #F0EEF8",
                        background: "#FAFAF8",
                      }}>
                        <div style={{ fontFamily: '"DM Sans"', fontSize: 11, color: "#8A8A9A", marginBottom: 2 }}>
                          Signed in as
                        </div>
                        <div style={{
                          fontFamily: '"DM Sans"',
                          fontSize: 13,
                          fontWeight: 600,
                          color: BRAND.dark,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {user?.email}
                        </div>
                      </div>

                      <button
                        data-testid="menu-item-portal"
                        onClick={() => { setDropdownOpen(false); navigate("/portal/dashboard"); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "11px 16px",
                          fontFamily: '"DM Sans"',
                          fontSize: 14,
                          fontWeight: 500,
                          color: BRAND.dark,
                          textDecoration: "none",
                          transition: "background 0.15s",
                          borderBottom: "1px solid #F0EEF8",
                          background: "transparent",
                          border: "none",
                          borderRadius: 0,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F5FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LayoutDashboard size={15} style={{ color: BRAND.violet, flexShrink: 0 }} />
                        Go to Portal
                      </button>

                      <button
                        data-testid="menu-item-logout"
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "11px 16px",
                          fontFamily: '"DM Sans"',
                          fontSize: 14,
                          fontWeight: 500,
                          color: BRAND.coral,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#FFF5F3")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <LogOut size={15} style={{ flexShrink: 0 }} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    data-testid="button-login"
                    onClick={openLogin}
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      color: BRAND.dark,
                      background: "transparent",
                      border: "none",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "color 0.2s",
                      letterSpacing: "0.01em",
                    }}
                  >
                    Login
                  </button>
                  <button
                    data-testid="button-signup"
                    onClick={openSignup}
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
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="pnav-mobile-btn"
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
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

          {/* Mobile menu */}
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

              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${BRAND.violet}12`,
              }}>
                {isAuthenticated ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: BRAND.violet,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: '"DM Sans"',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {initials || <User size={16} />}
                      </div>
                      <div>
                        <div style={{ fontFamily: '"DM Sans"', fontSize: 13, fontWeight: 600, color: BRAND.dark }}>
                          Welcome, {firstName}
                        </div>
                        <div style={{ fontFamily: '"DM Sans"', fontSize: 12, color: "#8A8A9A" }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        data-testid="link-mobile-portal"
                        onClick={() => { setMobileOpen(false); navigate("/portal/dashboard"); }}
                        style={{
                          flex: 1,
                          fontFamily: '"DM Sans"',
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#fff",
                          background: BRAND.violet,
                          border: "none",
                          borderRadius: 8,
                          padding: "9px 16px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        Go to Portal
                      </button>
                      <button
                        data-testid="mobile-button-logout"
                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                        style={{
                          flex: 1,
                          fontFamily: '"DM Sans"',
                          fontWeight: 500,
                          fontSize: 14,
                          color: BRAND.coral,
                          background: "transparent",
                          border: `1.5px solid ${BRAND.coral}`,
                          borderRadius: 8,
                          padding: "9px 16px",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      data-testid="button-mobile-login"
                      onClick={() => { openLogin(); setMobileOpen(false); }}
                      style={{
                        flex: 1,
                        fontFamily: '"DM Sans"',
                        fontWeight: 500,
                        fontSize: 14,
                        color: BRAND.violet,
                        background: "transparent",
                        border: `1.5px solid ${BRAND.violet}`,
                        borderRadius: 8,
                        padding: "9px 16px",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      Login
                    </button>
                    <button
                      data-testid="button-mobile-signup"
                      onClick={() => { openSignup(); setMobileOpen(false); }}
                      style={{
                        flex: 1,
                        fontFamily: '"DM Sans"',
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#fff",
                        background: BRAND.coral,
                        border: "none",
                        borderRadius: 8,
                        padding: "9px 16px",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @media (max-width: 768px) {
            .pnav-desktop { display: none !important; }
            .pnav-mobile-btn { display: block !important; }
          }
        `}</style>
      </nav>
    </>
  );
}
