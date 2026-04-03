import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
  Eye,
  X,
  Search,
  ChevronRight,
  Lock,
  BarChart2,
  FlaskConical,
  Lightbulb,
  Building2,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { MobilePortalNav } from "@/components/portal/MobilePortalNav";
import { PortalThemeToggle } from "@/components/portal/PortalThemeToggle";
import { usePortalTheme } from "@/hooks/usePortalTheme";

/* ── Innovatr Design System tokens ─────────────────────── */
const VDK   = "#1E1B3A";
const CORAL  = "#E8503A";
const N300   = "#C9B99A";
const N400   = "#A89078";
const SUCCESS = "#2A9E5C";

const EXPLORE_COLOR = "#3A2FBF";
const TEST_COLOR    = SUCCESS;
const ACT_COLOR     = CORAL;
const HEALTH_COLOR  = "#4EC9E8";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function getTierLabel(user: any, isAdmin: boolean, isPaidMember: boolean) {
  if (isAdmin) return "ADMIN";
  if (isPaidMember) return user?.membershipTier?.toUpperCase() || "STARTER";
  return "FREE";
}

interface PortalLayoutProps {
  children: React.ReactNode;
  showPhaseTopbar?: boolean;
}

/* ── useBreakpoint: simple responsive hook ─────────────── */
function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">(() => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 768) return "mobile";
    if (window.innerWidth < 1024) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      if (w < 768) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return bp;
}

export default function PortalLayout({ children, showPhaseTopbar = true }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const {
    user, logout, isAuthenticated, isPaidMember, isAdmin,
    impersonation, exitImpersonation, isViewingAsCompany, viewingCompanyName,
  } = useAuth();
  const { theme } = usePortalTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const bp = useBreakpoint();
  const isMobile  = bp === "mobile";
  const isTablet  = bp === "tablet";
  const isDesktop = bp === "desktop";

  const { data: trendsStatus } = useQuery<{ hasNew: boolean }>({
    queryKey: ["/api/trends/has-new"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  /* Cmd+K / Ctrl+K listener */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(open => !open);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Body scroll lock when mobile drawer is open */
  useEffect(() => {
    if (isMobile && mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, mobileDrawerOpen]);

  /* Close drawer on route change */
  useEffect(() => { setMobileDrawerOpen(false); }, [location]);

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); setLocation("/"); };

  const isDashboard = location === "/portal" || location === "/portal/dashboard";
  const isExplore   = location === "/portal/explore";
  const isTest      = location === "/portal/test";
  const isAct       = location === "/portal/act";
  const isHealth    = location.startsWith("/portal/health");

  const sidebarStyle = {
    "--sidebar-width": isTablet ? "3rem" : "14.5rem",
    "--sidebar-width-icon": "3rem",
  };

  const tierLabel = getTierLabel(user, isAdmin, isPaidMember);
  const initials  = getInitials(user?.name);

  /* Sidebar content — shared between desktop/tablet and mobile drawer */
  const SidebarInner = () => (
    <div className="flex flex-col h-full" style={{ background: "var(--pt-sidebar-bg)" }}>
      {/* Logo */}
      <div
        className="px-4 py-4 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--pt-sidebar-border)" }}
      >
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2.5 min-w-0"
          data-testid="link-sidebar-logo"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-serif text-base flex-shrink-0"
            style={{ background: CORAL }}
          >
            I
          </div>
          {(!isTablet || isMobile) && (
            <span className="font-serif text-base tracking-wide truncate" style={{ color: "var(--pt-logo-text-color)" }}>Innovatr</span>
          )}
        </button>
        {isMobile && (
          <button
            className="ml-auto w-7 h-7 flex items-center justify-center"
            style={{ color: "var(--pt-nav-btn-color)" }}
            onClick={() => setMobileDrawerOpen(false)}
            data-testid="button-close-drawer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User badge */}
      {(!isTablet || isMobile) && (
        <div
          className="px-4 py-3 flex items-center gap-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--pt-sidebar-border)", background: "rgba(128,128,128,0.05)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ background: CORAL }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--pt-sb-item-active)" }} data-testid="text-member-name">
              {user?.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs truncate" style={{ color: "var(--pt-sb-section-color)" }}>{user?.company || user?.email}</span>
              <span
                className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm flex-shrink-0"
                style={{ background: "rgba(232,80,58,0.18)", color: CORAL, border: `1px solid rgba(232,80,58,0.35)` }}
                data-testid="badge-member-tier"
              >
                {tierLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {(!isTablet || isMobile) && <SbSection label="Research" />}
        <SbNavItem
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          isActive={isDashboard}
          onClick={() => setLocation("/portal/dashboard")}
          testId="menu-item-dashboard"
          iconOnly={isTablet && !isMobile}
          tooltip="Dashboard"
          badge={trendsStatus?.hasNew ? <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CORAL }} /> : undefined}
        />

        {(!isTablet || isMobile) && <SbSection label="3 Phases" top />}
        {isTablet && !isMobile && <div className="h-3" />}
        <PhaseNavItem num="01" label="Explore" color={EXPLORE_COLOR} isActive={isExplore} onClick={() => setLocation("/portal/explore")} testId="menu-item-explore" iconOnly={isTablet && !isMobile} tooltip="Explore" />
        <PhaseNavItem num="02" label="Test"    color={TEST_COLOR}    isActive={isTest}    onClick={() => setLocation("/portal/test")}    testId="menu-item-test"    iconOnly={isTablet && !isMobile} tooltip="Test"    />
        <PhaseNavItem num="03" label="Act"     color={ACT_COLOR}     isActive={isAct}     onClick={() => setLocation("/portal/act")}     testId="menu-item-act"     iconOnly={isTablet && !isMobile} tooltip="Act"     />

        {(!isTablet || isMobile) && <SbSection label="Company" top />}
        {isTablet && !isMobile && <div className="h-3" />}
        <SbNavItem
          icon={<span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full flex-shrink-0" style={{ border: `1px solid ${HEALTH_COLOR}50`, color: HEALTH_COLOR }}>C</span>}
          label="Company"
          isActive={isHealth}
          onClick={() => setLocation("/portal/health")}
          testId="menu-item-health"
          iconOnly={isTablet && !isMobile}
          tooltip="Company Health"
        />

        {isAdmin && !impersonation.isImpersonating && (
          <>
            {(!isTablet || isMobile) && <SbSection label="System" top />}
            {isTablet && !isMobile && <div className="h-3" />}
            <SbNavItem
              icon={<Shield className="w-4 h-4" />}
              label="Admin"
              isActive={location.startsWith("/portal/admin")}
              onClick={() => setLocation("/portal/admin")}
              testId="menu-item-admin"
              iconOnly={isTablet && !isMobile}
              tooltip="Admin"
            />
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-2 flex-shrink-0" style={{ borderTop: "1px solid var(--pt-sidebar-border)" }}>
        <SbNavItem icon={<Settings className="w-4 h-4" />} label="Settings" isActive={location === "/portal/settings"} onClick={() => setLocation("/portal/settings")} testId="menu-item-settings" iconOnly={isTablet && !isMobile} tooltip="Settings" />
        <SbNavItem icon={<LogOut className="w-4 h-4" />}   label="Log out"  isActive={false}                          onClick={handleLogout}                          testId="button-sidebar-logout"  iconOnly={isTablet && !isMobile} tooltip="Log out"  />
      </div>
    </div>
  );

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="portal-root flex h-screen w-full overflow-hidden" data-portal-theme={theme} style={{ background: "var(--pt-canvas-bg)" }}>

        {/* ── Desktop / Tablet Sidebar ────────────────────────── */}
        {!isMobile && (
          <aside
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: isTablet ? "3rem" : "14.5rem",
              borderRight: "1px solid var(--pt-sidebar-border)",
              transition: "width 0.2s ease",
            }}
          >
            <SidebarInner />
          </aside>
        )}

        {/* ── Mobile backdrop ────────────────────────────────── */}
        {isMobile && mobileDrawerOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setMobileDrawerOpen(false)}
            data-testid="mobile-drawer-backdrop"
          />
        )}

        {/* ── Mobile drawer — full screen slide-over ─────────── */}
        {isMobile && (
          <aside
            className="fixed inset-0 z-50 overflow-hidden"
            style={{
              transform: mobileDrawerOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.22s ease",
            }}
          >
            <SidebarInner />
          </aside>
        )}

        {/* ── Main area ────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Impersonation bar */}
          {impersonation.isImpersonating && (
            <div
              className="px-4 py-2 flex items-center justify-between flex-shrink-0"
              style={{ background: "var(--ds-amber)", color: VDK }}
              data-testid="impersonation-bar"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Eye className="w-4 h-4" />
                {isViewingAsCompany ? <>Viewing: <strong>{viewingCompanyName || user?.company}</strong></> : <>Viewing as: <strong>{user?.name || user?.email}</strong></>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => { exitImpersonation(); setLocation("/portal/admin?tab=companies"); }} data-testid="button-exit-impersonation">
                <X className="w-4 h-4 mr-1" />
                {isViewingAsCompany ? "Back to Companies" : "Exit View"}
              </Button>
            </div>
          )}

          {/* Phase topbar — gradient */}
          {showPhaseTopbar && (
            <header
              className="h-12 px-4 flex items-center justify-between flex-shrink-0"
              style={{ background: "var(--pt-topbar-bg)", borderBottom: "1px solid var(--pt-topbar-border)" }}
            >
              <div className="flex items-center">
                {/* Hamburger for mobile */}
                {isMobile && (
                  <button
                    className="mr-2 w-8 h-8 flex items-center justify-center rounded-md"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                    onClick={() => setMobileDrawerOpen(true)}
                    data-testid="button-mobile-menu"
                    aria-label="Open menu"
                  >
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                      <rect y="0"  width="18" height="2" rx="1" fill="currentColor"/>
                      <rect y="6"  width="18" height="2" rx="1" fill="currentColor"/>
                      <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
                    </svg>
                  </button>
                )}
                <PhaseTab num="1" label="Explore" color={EXPLORE_COLOR} isActive={isExplore} onClick={() => setLocation("/portal/explore")} />
                <ChevronRight className="w-3 h-3 mx-1" style={{ color: N400 }} />
                <PhaseTab num="2" label="Test"    color={TEST_COLOR}    isActive={isTest}    onClick={() => setLocation("/portal/test")}    />
                <ChevronRight className="w-3 h-3 mx-1" style={{ color: N400 }} />
                <PhaseTab num="3" label="Act"     color={ACT_COLOR}     isActive={isAct}     onClick={() => setLocation("/portal/act")}     />
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs min-w-[160px]"
                    style={{ background: "var(--pt-nav-btn-bg)", border: "1px solid var(--pt-nav-btn-border)", color: "var(--pt-text-tertiary)" }}
                    data-testid="input-search"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search anything…</span>
                    <kbd className="ml-auto rounded px-1 text-[10px] font-mono" style={{ background: "var(--pt-nav-btn-bg)", color: "var(--pt-text-tertiary)", border: "1px solid var(--pt-nav-btn-border)" }}>⌘K</kbd>
                  </button>
                )}
                {isMobile && (
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-md"
                    style={{ color: "var(--pt-nav-btn-color)" }}
                    onClick={() => setSearchOpen(true)}
                    data-testid="input-search"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
                <PortalThemeToggle />
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-pointer flex-shrink-0"
                  style={{ background: CORAL }}
                  data-testid="button-user-avatar"
                >
                  {initials}
                </div>
              </div>
            </header>
          )}

          <main
            className="flex-1 overflow-auto"
            style={{ background: "var(--pt-canvas-bg)", paddingBottom: isMobile ? "56px" : 0 }}
          >
            {children}
          </main>

        </div>
      </div>

      {/* ── Mobile fixed bottom nav (shared component) ──────── */}
      <MobilePortalNav />

      {/* ── Global ⌘K Search Dialog ──────────────────────── */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages, features…" data-testid="input-search-dialog" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/dashboard"); }} data-testid="search-item-dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />Dashboard
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/explore"); }} data-testid="search-item-explore">
              <FlaskConical className="mr-2 h-4 w-4" />Explore — Market Signals & Sandbox
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/test"); }} data-testid="search-item-test">
              <BarChart2 className="mr-2 h-4 w-4" />Test — Studies & Briefs
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/act"); }} data-testid="search-item-act">
              <Lightbulb className="mr-2 h-4 w-4" />Act — Planning & Gaps
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/health"); }} data-testid="search-item-company">
              <Building2 className="mr-2 h-4 w-4" />Company Health
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/settings"); }} data-testid="search-item-settings">
              <Settings className="mr-2 h-4 w-4" />Settings
            </CommandItem>
            {isAdmin && (
              <CommandItem onSelect={() => { setSearchOpen(false); setLocation("/portal/admin"); }} data-testid="search-item-admin">
                <Shield className="mr-2 h-4 w-4" />Admin Panel
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function SbSection({ label, top }: { label: string; top?: boolean }) {
  return (
    <div className={`px-2 pb-1.5 text-[10px] font-bold tracking-widest uppercase ${top ? "pt-4" : "pt-1.5"}`} style={{ color: "var(--pt-sb-section-color)" }}>
      {label}
    </div>
  );
}

function SbNavItem({ icon, label, isActive, onClick, testId, badge, iconOnly, tooltip }: {
  icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; testId?: string; badge?: React.ReactNode; iconOnly?: boolean; tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      title={iconOnly ? tooltip : undefined}
      className="w-full flex items-center px-2.5 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 relative"
      style={{
        gap: iconOnly ? "0" : "0.625rem",
        justifyContent: iconOnly ? "center" : "flex-start",
        color: isActive ? "var(--pt-sb-item-active)" : "var(--pt-sb-item-color)",
        background: isActive ? "var(--pt-sb-active-bg)" : "transparent",
        minHeight: "44px",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--pt-sb-hover-bg)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {isActive && !iconOnly && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r" style={{ background: "var(--pt-step-active-bubble)" }} />
      )}
      <span style={{ color: isActive ? "var(--pt-step-active-bubble)" : "var(--pt-sb-item-color)", flexShrink: 0 }}>{icon}</span>
      {!iconOnly && <span className="flex-1 text-left">{label}</span>}
      {!iconOnly && badge}
      {iconOnly && isActive && (
        <span
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--pt-step-active-bubble)" }}
        />
      )}
    </button>
  );
}

function PhaseNavItem({ num, label, color, isActive, onClick, testId, locked, iconOnly, tooltip }: {
  num: string; label: string; color: string; isActive: boolean; onClick: () => void; testId?: string; locked?: boolean; iconOnly?: boolean; tooltip?: string;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      data-testid={testId}
      disabled={locked}
      title={iconOnly ? tooltip : undefined}
      className="w-full flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors mb-0.5 relative"
      style={{
        gap: iconOnly ? "0" : "0.625rem",
        justifyContent: iconOnly ? "center" : "flex-start",
        color: isActive ? "var(--pt-sb-item-active)" : locked ? "var(--pt-nav-btn-disabled)" : "var(--pt-sb-item-color)",
        background: isActive ? "var(--pt-sb-active-bg)" : "transparent",
        cursor: locked ? "not-allowed" : "pointer",
        minHeight: "44px",
      }}
      onMouseEnter={e => { if (!isActive && !locked) (e.currentTarget as HTMLElement).style.background = "var(--pt-sb-hover-bg)"; }}
      onMouseLeave={e => { if (!isActive && !locked) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {isActive && !iconOnly && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r" style={{ background: "var(--pt-step-active-bubble)" }} />
      )}
      {/* Dot indicator for active phase (icon-only mode) */}
      {isActive && iconOnly && (
        <span
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--pt-step-active-bubble)" }}
        />
      )}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={
          isActive
            ? { background: "var(--pt-step-active-bubble)", color: "#fff" }
            : locked
            ? { border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.3)" }
            : { border: "1px solid var(--pt-step-bubble-border)", color: "var(--pt-sb-item-color)" }
        }
      >
        {num}
      </span>
      {!iconOnly && <span className="flex-1 text-left">{label}</span>}
      {!iconOnly && locked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />}
    </button>
  );
}

function PhaseTab({ num, label, color, isActive, onClick }: {
  num: string; label: string; color: string; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 h-12 text-sm font-medium transition-colors border-b-2"
      style={{
        color: isActive ? "var(--pt-title-color)" : "var(--pt-step-idle-color)",
        borderBottomColor: isActive ? color : "transparent",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--pt-nav-btn-color)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--pt-step-idle-color)"; }}
    >
      <span
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
        style={
          isActive
            ? { background: color, color: "#fff" }
            : { background: "var(--pt-step-active-bg)", color: "var(--pt-step-bubble-idle-color)" }
        }
      >
        {num}
      </span>
      <span>{label}</span>
    </button>
  );
}

