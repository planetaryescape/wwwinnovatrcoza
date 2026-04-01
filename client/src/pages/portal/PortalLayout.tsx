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

const CORAL = "#C45A38";
const EXPLORE_COLOR = "#2563EB";
const TEST_COLOR = "#059669";
const HEALTH_COLOR = "#7C3AED";

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
  const { user, logout, isAuthenticated, isPaidMember, isAdmin, impersonation, exitImpersonation, isViewingAsCompany, viewingCompanyName } = useAuth();

  const { data: trendsStatus } = useQuery<{ hasNew: boolean }>({
    queryKey: ["/api/trends/has-new"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const isDashboard = location === "/portal" || location === "/portal/dashboard";
  const isExplore = location === "/portal/explore";
  const isTest = location === "/portal/test";
  const isAct = location === "/portal/act";

  const style = {
    "--sidebar-width": "14.5rem",
    "--sidebar-width-icon": "3rem",
  };

  const tierLabel = getTierLabel(user, isAdmin, isPaidMember);
  const initials = getInitials(user?.name);

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden bg-stone-50 dark:bg-background">
        <Sidebar className="border-r border-stone-200 dark:border-border">
          <SidebarContent className="flex flex-col h-full p-0 overflow-hidden bg-white dark:bg-sidebar">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-stone-100 dark:border-sidebar-border flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-2.5"
                data-testid="link-sidebar-logo"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-serif text-base flex-shrink-0"
                  style={{ background: CORAL }}
                >
                  I
                </div>
                <span className="font-serif text-base text-foreground">Innovatr</span>
              </button>
            </div>

            {/* User section */}
            <div className="px-4 py-3 border-b border-stone-100 dark:border-sidebar-border flex items-center gap-2.5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ background: CORAL }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate" data-testid="text-member-name">
                  {user?.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">{user?.company || user?.email}</span>
                  <span
                    className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-sm flex-shrink-0"
                    style={{ background: "#FDF2EE", color: CORAL, border: `1px solid #F2C4B4` }}
                    data-testid={`badge-member-tier`}
                  >
                    {tierLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {/* Research section */}
              <div className="px-2 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Research
              </div>
              <SidebarNavItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Dashboard"
                isActive={isDashboard}
                onClick={() => setLocation("/portal/dashboard")}
                testId="menu-item-dashboard"
                badge={trendsStatus?.hasNew ? (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                ) : undefined}
              />

              {/* 3 Phases */}
              <div className="px-2 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                3 Phases
              </div>
              <PhaseNavItem
                num="01"
                label="Explore"
                color={EXPLORE_COLOR}
                isActive={isExplore}
                onClick={() => setLocation("/portal/explore")}
                testId="menu-item-explore"
              />
              <PhaseNavItem
                num="02"
                label="Test"
                color={TEST_COLOR}
                isActive={isTest}
                onClick={() => setLocation("/portal/test")}
                testId="menu-item-test"
              />
              <PhaseNavItem
                num="03"
                label="Act"
                color={CORAL}
                isActive={isAct}
                onClick={() => setLocation("/portal/act")}
                testId="menu-item-act"
              />
              <PhaseNavItem
                num="04"
                label="Health"
                color={HEALTH_COLOR}
                isActive={false}
                onClick={() => {}}
                testId="menu-item-health"
                locked
              />

              {/* Company & System */}
              {isAdmin && !impersonation.isImpersonating && (
                <>
                  <div className="px-2 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                    System
                  </div>
                  <SidebarNavItem
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
            <div className="border-t border-stone-100 dark:border-sidebar-border p-2 flex-shrink-0">
              <SidebarNavItem
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                isActive={location === "/portal/settings"}
                onClick={() => setLocation("/portal/settings")}
                testId="menu-item-settings"
              />
              <SidebarNavItem
                icon={<LogOut className="w-4 h-4" />}
                label="Log out"
                isActive={false}
                onClick={handleLogout}
                testId="button-sidebar-logout"
              />
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Impersonation bar */}
          {impersonation.isImpersonating && (
            <div
              className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between flex-shrink-0"
              data-testid="impersonation-bar"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isViewingAsCompany ? (
                    <>Viewing: <strong>{viewingCompanyName || user?.company}</strong></>
                  ) : (
                    <>Viewing as: <strong>{user?.name || user?.email}</strong></>
                  )}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  exitImpersonation();
                  setLocation("/portal/admin?tab=companies");
                }}
                className="text-amber-950"
                data-testid="button-exit-impersonation"
              >
                <X className="w-4 h-4 mr-1" />
                {isViewingAsCompany ? "Back to Companies" : "Exit View"}
              </Button>
            </div>
          )}

          {/* Topbar with phase tabs */}
          {showPhaseTopbar && (
            <header className="h-12 bg-white dark:bg-sidebar border-b border-stone-100 dark:border-border px-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <PhaseTab
                  num="1"
                  label="Explore"
                  color={EXPLORE_COLOR}
                  isActive={isExplore}
                  onClick={() => setLocation("/portal/explore")}
                />
                <ChevronRight className="w-3 h-3 text-stone-300 mx-1" />
                <PhaseTab
                  num="2"
                  label="Test"
                  color={TEST_COLOR}
                  isActive={isTest}
                  onClick={() => setLocation("/portal/test")}
                />
                <ChevronRight className="w-3 h-3 text-stone-300 mx-1" />
                <PhaseTab
                  num="3"
                  label="Act"
                  color={CORAL}
                  isActive={isAct}
                  onClick={() => setLocation("/portal/act")}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 bg-stone-100 dark:bg-sidebar-accent border border-stone-200 dark:border-sidebar-border rounded-md px-3 py-1.5 text-xs text-muted-foreground cursor-text min-w-[160px]"
                  data-testid="input-search"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search anything…</span>
                  <kbd className="ml-auto bg-white dark:bg-sidebar border border-stone-200 dark:border-sidebar-border rounded px-1 text-[10px] font-mono">⌘K</kbd>
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

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function SidebarNavItem({
  icon,
  label,
  isActive,
  onClick,
  testId,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  testId?: string;
  badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors mb-0.5 relative ${
        isActive
          ? "bg-stone-100 dark:bg-sidebar-accent text-foreground"
          : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-sidebar-accent/50 hover:text-foreground"
      }`}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
          style={{ background: "#C45A38" }}
        />
      )}
      <span className={`flex-shrink-0 ${isActive ? "text-[#C45A38]" : ""}`}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge}
    </button>
  );
}

function PhaseNavItem({
  num,
  label,
  color,
  isActive,
  onClick,
  testId,
  locked,
}: {
  num: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
  testId?: string;
  locked?: boolean;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      data-testid={testId}
      disabled={locked}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors mb-0.5 relative ${
        isActive
          ? "bg-stone-100 dark:bg-sidebar-accent text-foreground"
          : locked
          ? "opacity-50 cursor-not-allowed text-muted-foreground"
          : "text-muted-foreground hover:bg-stone-50 dark:hover:bg-sidebar-accent/50 hover:text-foreground"
      }`}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
          style={{ background: color }}
        />
      )}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border"
        style={
          isActive
            ? { borderColor: color, color: color }
            : { borderColor: "#D4CEC6", color: "#A8A29E" }
        }
      >
        {num}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {locked && <Lock className="w-3 h-3 flex-shrink-0" />}
    </button>
  );
}

function PhaseTab({
  num,
  label,
  color,
  isActive,
  onClick,
}: {
  num: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-1 h-12 text-sm font-medium transition-colors border-b-2 ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground border-transparent"
      }`}
      style={isActive ? { borderBottomColor: color } : { borderBottomColor: "transparent" }}
    >
      <span
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold"
        style={
          isActive
            ? { background: color, color: "#fff" }
            : { background: "#EAE6E0", color: "#A8A29E" }
        }
      >
        {num}
      </span>
      <span style={isActive ? { color } : {}}>{label}</span>
    </button>
  );
}
