import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
} from "@/components/ui/sidebar";
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
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

/* ── Innovatr Design System tokens ─────────────────────── */
const VDK  = "#1E1B3A";   // violet-dk  — sidebar/topbar bg
const VIO  = "#3A2FBF";   // violet     — primary / active
const CORAL = "#E8503A";  // coral      — CTA / active accent
const N200 = "#E2D5BF";   // border
const N300 = "#C9B99A";   // muted border
const N400 = "#A89078";   // muted text on dark
const N500 = "#8A7260";   // muted text on light
const SUCCESS = "#2A9E5C";
const CYAN_DK = "#1A8FAD";

/* Phase colours */
const EXPLORE_COLOR = VIO;
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

export default function PortalLayout({ children, showPhaseTopbar = true }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const {
    user, logout, isAuthenticated, isPaidMember, isAdmin,
    impersonation, exitImpersonation, isViewingAsCompany, viewingCompanyName,
  } = useAuth();

  const { data: trendsStatus } = useQuery<{ hasNew: boolean }>({
    queryKey: ["/api/trends/has-new"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); setLocation("/"); };

  const isDashboard = location === "/portal" || location === "/portal/dashboard";
  const isExplore   = location === "/portal/explore";
  const isTest      = location === "/portal/test";
  const isAct       = location === "/portal/act";

  const sidebarStyle = {
    "--sidebar-width": "14.5rem",
    "--sidebar-width-icon": "3rem",
  };

  const tierLabel = getTierLabel(user, isAdmin, isPaidMember);
  const initials  = getInitials(user?.name);

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ds-cream)" }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <Sidebar className="border-r-0">
          <SidebarContent
            className="flex flex-col h-full p-0 overflow-hidden"
            style={{ background: VDK, borderRight: `1px solid rgba(255,255,255,0.07)` }}
          >
            {/* Logo */}
            <div
              className="px-5 py-4 flex items-center gap-2.5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button onClick={() => setLocation("/")} className="flex items-center gap-2.5" data-testid="link-sidebar-logo">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-serif text-base flex-shrink-0"
                  style={{ background: CORAL }}
                >
                  I
                </div>
                <span className="font-serif text-base text-white tracking-wide">Innovatr</span>
              </button>
            </div>

            {/* User */}
            <div
              className="px-4 py-3 flex items-center gap-2.5 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ background: CORAL }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate" data-testid="text-member-name">
                  {user?.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs truncate" style={{ color: N400 }}>{user?.company || user?.email}</span>
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

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              <SbSection label="Research" />
              <SbNavItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
                isActive={isDashboard}
                onClick={() => setLocation("/portal/dashboard")}
                testId="menu-item-dashboard"
                badge={trendsStatus?.hasNew ? <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CORAL }} /> : undefined}
              />

              <SbSection label="3 Phases" top />
              <PhaseNavItem num="01" label="Explore" color={EXPLORE_COLOR} isActive={isExplore} onClick={() => setLocation("/portal/explore")} testId="menu-item-explore" />
              <PhaseNavItem num="02" label="Test"    color={TEST_COLOR}    isActive={isTest}    onClick={() => setLocation("/portal/test")}    testId="menu-item-test"    />
              <PhaseNavItem num="03" label="Act"     color={ACT_COLOR}     isActive={isAct}     onClick={() => setLocation("/portal/act")}     testId="menu-item-act"     />
              <PhaseNavItem num="04" label="Health"  color={HEALTH_COLOR}  isActive={location.startsWith("/portal/health")} onClick={() => setLocation("/portal/health")} testId="menu-item-health" />

              {isAdmin && !impersonation.isImpersonating && (
                <>
                  <SbSection label="System" top />
                  <SbNavItem
                    icon={<Shield className="w-4 h-4" />}
                    label="Admin"
                    isActive={location.startsWith("/portal/admin")}
                    onClick={() => setLocation("/portal/admin")}
                    testId="menu-item-admin"
                  />
                </>
              )}
            </nav>

            {/* Bottom */}
            <div className="p-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <SbNavItem icon={<Settings className="w-4 h-4" />} label="Settings" isActive={location === "/portal/settings"} onClick={() => setLocation("/portal/settings")} testId="menu-item-settings" />
              <SbNavItem icon={<LogOut className="w-4 h-4" />}   label="Log out"  isActive={false}                          onClick={handleLogout}                          testId="button-sidebar-logout" />
            </div>
          </SidebarContent>
        </Sidebar>

        {/* ── Main area ────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
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

          {/* Phase topbar — dark violet-dk */}
          {showPhaseTopbar && (
            <header
              className="h-12 px-4 flex items-center justify-between flex-shrink-0"
              style={{ background: VDK, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center">
                <PhaseTab num="1" label="Explore" color={EXPLORE_COLOR} isActive={isExplore} onClick={() => setLocation("/portal/explore")} />
                <ChevronRight className="w-3 h-3 mx-1" style={{ color: N400 }} />
                <PhaseTab num="2" label="Test"    color={TEST_COLOR}    isActive={isTest}    onClick={() => setLocation("/portal/test")}    />
                <ChevronRight className="w-3 h-3 mx-1" style={{ color: N400 }} />
                <PhaseTab num="3" label="Act"     color={ACT_COLOR}     isActive={isAct}     onClick={() => setLocation("/portal/act")}     />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs min-w-[160px]"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: N400 }}
                  data-testid="input-search"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search anything…</span>
                  <kbd className="ml-auto rounded px-1 text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.1)", color: N300, border: "1px solid rgba(255,255,255,0.12)" }}>⌘K</kbd>
                </button>
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

          <main className="flex-1 overflow-auto" style={{ background: "var(--ds-cream)" }}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function SbSection({ label, top }: { label: string; top?: boolean }) {
  return (
    <div className={`px-2 pb-1.5 text-[10px] font-bold tracking-widest uppercase ${top ? "pt-4" : "pt-1.5"}`} style={{ color: N400 }}>
      {label}
    </div>
  );
}

function SbNavItem({ icon, label, isActive, onClick, testId, badge }: {
  icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; testId?: string; badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 relative"
      style={{
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
        background: isActive ? "rgba(232,80,58,0.14)" : "transparent",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r" style={{ background: CORAL }} />
      )}
      <span style={{ color: isActive ? CORAL : "rgba(255,255,255,0.55)" }}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge}
    </button>
  );
}

function PhaseNavItem({ num, label, color, isActive, onClick, testId, locked }: {
  num: string; label: string; color: string; isActive: boolean; onClick: () => void; testId?: string; locked?: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      data-testid={testId}
      disabled={locked}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors mb-0.5 relative"
      style={{
        color: isActive ? "#ffffff" : locked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.65)",
        background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
        cursor: locked ? "not-allowed" : "pointer",
      }}
      onMouseEnter={e => { if (!isActive && !locked) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { if (!isActive && !locked) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {isActive && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r" style={{ background: color }} />
      )}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={
          isActive
            ? { background: color, color: "#fff" }
            : locked
            ? { border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.3)" }
            : { border: `1px solid ${color}40`, color: color }
        }
      >
        {num}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {locked && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />}
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
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
        borderBottomColor: isActive ? color : "transparent",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
    >
      <span
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
        style={
          isActive
            ? { background: color, color: "#fff" }
            : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }
        }
      >
        {num}
      </span>
      <span>{label}</span>
    </button>
  );
}
