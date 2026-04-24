import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Shield,
  Eye,
  X,
  Lightbulb,
  Building2,
  ArrowRight,
  Brain,
  Palette,
  Layers,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { MobilePortalNav } from "@/components/portal/MobilePortalNav";
import { usePortalFeed, type PortalConsultOffer } from "@/lib/portal-feed";
import { cn } from "@/lib/utils";

/* ── Innovatr Design System tokens ─────────────────────── */
const VDK   = "#1E1B3A";
const CORAL  = "#E8503A";
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
  /** @deprecated topbar removed; the SidebarTrigger handles open/close. */
  showPhaseTopbar?: boolean;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();
  const {
    user, logout, isAuthenticated, isLoading, isPaidMember, isAdmin,
    impersonation, exitImpersonation, isViewingAsCompany, viewingCompanyName,
    memberships, activeCompany, switchCompany,
  } = useAuth();

  const { data: trendsStatus } = useQuery<{ hasNew: boolean }>({
    queryKey: ["/api/trends/has-new"],
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const { data: portalFeed } = usePortalFeed(isAuthenticated);
  const featuredOffer = portalFeed?.consultOffers?.[0] ?? null;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) setLocation("/");
  }, [isAuthenticated, isLoading, setLocation]);

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); setLocation("/"); };
  const handleCompanyChange = async (companyId: string) => {
    if (!companyId || companyId === activeCompany?.id) return;
    await switchCompany(companyId);
  };

  const isDashboard = location === "/portal" || location === "/portal/dashboard";
  const isExplore   =
    location === "/portal/explore" ||
    location.startsWith("/portal/explore/") ||
    location === "/portal/trends" ||
    location.startsWith("/portal/insights/");
  const isTest      =
    location === "/portal/test" ||
    location === "/portal/launch" ||
    location === "/portal/research" ||
    location.startsWith("/portal/reports/");
  const isAct       = location === "/portal/act";
  const isHealth    = location.startsWith("/portal/health") || location.startsWith("/portal/credits");

  const tierLabel = getTierLabel(user, isAdmin, isPaidMember);
  const initials  = getInitials(user?.name);
  const companyOptions = memberships.length > 0
    ? memberships.map((membership) => ({
      id: membership.companyId,
      name: membership.company.name,
    }))
    : activeCompany
      ? [{ id: activeCompany.id, name: activeCompany.name }]
      : [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        {/* ── Logo ─────────────────────────────────────────── */}
        <SidebarHeader className="border-b border-sidebar-border">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2.5 px-2 py-1 text-left min-w-0 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-md group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0"
            data-testid="link-sidebar-logo"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg font-serif text-base text-white flex-shrink-0 group-data-[collapsible=icon]:h-7 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:text-sm"
              style={{ background: CORAL }}
            >
              I
            </span>
            <span className="font-serif text-base text-white tracking-wide truncate group-data-[collapsible=icon]:hidden">
              Innovatr
            </span>
          </button>
        </SidebarHeader>

        {/* ── Nav ──────────────────────────────────────────── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Research</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isDashboard}
                  tooltip="Dashboard"
                  onClick={() => setLocation("/portal/dashboard")}
                  className={activeIndicatorClass(isDashboard)}
                  data-testid="menu-item-dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
                {trendsStatus?.hasNew && (
                  <SidebarMenuBadge>
                    <span
                      className="block w-1.5 h-1.5 rounded-full"
                      style={{ background: CORAL }}
                      aria-label="New activity"
                    />
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>3 Phases</SidebarGroupLabel>
            <SidebarMenu>
              <PhaseSidebarItem
                num="01"
                label="Explore"
                color={EXPLORE_COLOR}
                isActive={isExplore}
                onClick={() => setLocation("/portal/explore")}
                testId="menu-item-explore"
              />
              <PhaseSidebarItem
                num="02"
                label="Test"
                color={TEST_COLOR}
                isActive={isTest}
                onClick={() => setLocation("/portal/test")}
                testId="menu-item-test"
              />
              <PhaseSidebarItem
                num="03"
                label="Act"
                color={ACT_COLOR}
                isActive={isAct}
                onClick={() => setLocation("/portal/act")}
                testId="menu-item-act"
              />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Company</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isHealth}
                  tooltip="Company Health"
                  onClick={() => setLocation("/portal/health")}
                  className={activeIndicatorClass(isHealth)}
                  data-testid="menu-item-health"
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0"
                    style={{ border: `1px solid ${HEALTH_COLOR}50`, color: HEALTH_COLOR }}
                  >
                    C
                  </span>
                  <span>Company</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {isAdmin && !impersonation.isImpersonating && (
            <SidebarGroup>
              <SidebarGroupLabel>System</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.startsWith("/portal/admin")}
                    tooltip="Admin"
                    onClick={() => setLocation("/portal/admin")}
                    className={activeIndicatorClass(location.startsWith("/portal/admin"))}
                    data-testid="menu-item-admin"
                  >
                    <Shield />
                    <span>Admin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* ── Footer: consult offer · company switcher · account ── */}
        <SidebarFooter>
          {/* Consult offer (hidden in icon-only mode) */}
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarConsultOffer
              offer={featuredOffer}
              onOpen={() => setLocation("/portal/act?tab=planning")}
            />
          </div>

          {/* Company switcher (hidden in icon-only mode). Read-only display when there's only one membership. */}
          {companyOptions.length > 0 && !isViewingAsCompany && (
            <div className="group-data-[collapsible=icon]:hidden">
              {companyOptions.length === 1 ? (
                <div
                  className="flex h-auto w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left text-xs text-white"
                  data-testid="display-active-company"
                  aria-label="Active company"
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: N400 }} />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">
                    {activeCompany?.name ?? companyOptions[0].name}
                  </span>
                </div>
              ) : (
                <Select value={activeCompany?.id ?? ""} onValueChange={handleCompanyChange}>
                  <SelectTrigger
                    className="h-auto w-full items-center gap-2 rounded-lg border-white/10 bg-white/[0.04] px-2.5 py-2 text-left text-xs text-white hover:bg-white/10 focus:ring-0 focus:ring-offset-0"
                    data-testid="select-active-company"
                    aria-label="Active company"
                  >
                    <Building2 className="h-3.5 w-3.5 shrink-0" style={{ color: N400 }} />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">
                      {activeCompany?.name ?? "Select company"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {companyOptions.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Account card → dropdown (always visible; compacts to avatar in icon mode) */}
          <UserAccountMenu
            name={user?.name}
            subline={
              isViewingAsCompany
                ? viewingCompanyName ?? null
                : activeCompany?.name ?? user?.company ?? user?.email ?? null
            }
            tierLabel={tierLabel}
            initials={initials}
            onSettings={() => setLocation("/portal/settings")}
            onLogout={handleLogout}
          />
        </SidebarFooter>
      </Sidebar>

      {/* ── Main ─────────────────────────────────────────── */}
      <SidebarInset className="bg-white">
        {/* Impersonation banner */}
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
            <Button size="sm" variant="ghost" onClick={async () => { await exitImpersonation(); setLocation("/portal/admin?tab=companies"); }} data-testid="button-exit-impersonation">
              <X className="w-4 h-4 mr-1" />
              {isViewingAsCompany ? "Back to Companies" : "Exit View"}
            </Button>
          </div>
        )}

        {/* Mobile-only header containing the menu trigger */}
        <header
          className="md:hidden h-12 px-3 flex items-center gap-2 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #201B3C 0%, #2E2760 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <SidebarTrigger className="text-white hover:bg-white/10" data-testid="button-mobile-menu" />
        </header>

        <main
          className="flex-1 overflow-auto"
          style={{ background: "#FFFFFF", paddingBottom: isMobile ? 56 : 0 }}
        >
          {children}
        </main>
      </SidebarInset>

      <MobilePortalNav />
    </SidebarProvider>
  );
}

/* ── Active-state coral indicator (used on all SidebarMenuButtons) ─ */
function activeIndicatorClass(active: boolean) {
  return cn(
    "relative",
    active &&
      "before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-r before:bg-sidebar-primary before:content-[''] group-data-[collapsible=icon]:before:hidden",
  );
}

/* ── Phase nav item (colored 01/02/03 chip + label) ─────── */
function PhaseSidebarItem({
  num,
  label,
  color,
  isActive,
  onClick,
  testId,
}: {
  num: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={label}
        onClick={onClick}
        className={activeIndicatorClass(isActive)}
        data-testid={testId}
      >
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none flex-shrink-0"
          style={
            isActive
              ? { background: color, color: "#fff" }
              : { border: `1px solid ${color}40`, color }
          }
        >
          {num}
        </span>
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/* ── Sidebar Consult Offer ─────────────────────────────────── */
const CORAL_SIDEBAR = "#E8503A";

function consultOfferIcon(serviceType: string | undefined) {
  switch (serviceType) {
    case "strategy": return Brain;
    case "creative": return Palette;
    case "pricing":  return Layers;
    default:         return Lightbulb;
  }
}

function consultOfferLabel(serviceType: string | undefined) {
  switch (serviceType) {
    case "strategy": return "Strategy";
    case "creative": return "Creative";
    case "pricing":  return "Pricing";
    default:         return "Consult";
  }
}

/* ── User Account Menu (avatar trigger → Settings / Logout) ─ */
function AccountAvatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{
        width: size,
        height: size,
        background: "rgba(232,80,58,0.16)",
        color: CORAL,
        border: "1px solid rgba(232,80,58,0.32)",
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

function UserAccountMenu({
  name,
  subline,
  tierLabel,
  initials,
  onSettings,
  onLogout,
}: {
  name: string | undefined;
  subline: string | null;
  tierLabel: string;
  initials: string;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const { state, isMobile } = useSidebar();
  const iconOnly = state === "collapsed" && !isMobile;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            iconOnly
              ? "mx-auto flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              : "flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          }
          aria-label="Open account menu"
          data-testid="button-account-menu"
        >
          <AccountAvatar initials={initials} size={28} />
          {!iconOnly && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white" data-testid="text-member-name">
                  {name ?? "Account"}
                </span>
                {subline && (
                  <span className="block truncate text-[11px]" style={{ color: N400 }}>
                    {subline}
                  </span>
                )}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" style={{ color: N400 }} />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
          <AccountAvatar initials={initials} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{name ?? "Account"}</span>
            <span className="mt-0.5 flex items-center gap-1.5">
              {subline && (
                <span className="truncate text-[11px] text-muted-foreground">{subline}</span>
              )}
              <span
                className="shrink-0 rounded-sm border px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
                style={{ background: "rgba(232,80,58,0.10)", color: CORAL, borderColor: "rgba(232,80,58,0.30)" }}
                data-testid="badge-member-tier"
              >
                {tierLabel}
              </span>
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSettings} data-testid="menu-item-settings">
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onLogout}
          className="text-destructive focus:text-destructive"
          data-testid="button-sidebar-logout"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarConsultOffer({ offer, onOpen }: { offer: PortalConsultOffer | null; onOpen: () => void }) {
  const isPlaceholder = !offer;
  const Icon = consultOfferIcon(offer?.serviceType);
  const eyebrow = isPlaceholder
    ? "Consult"
    : `${consultOfferLabel(offer.serviceType)} offer`;
  const title = offer?.title ?? "Need expert help?";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left rounded-xl p-3.5 transition-all hover:-translate-y-px"
      style={{
        background: "linear-gradient(135deg, rgba(232,80,58,0.32) 0%, rgba(232,80,58,0.12) 100%)",
        border: "1px solid rgba(232,80,58,0.45)",
        boxShadow: "0 1px 14px rgba(232,80,58,0.10)",
      }}
      data-testid="sidebar-consult-offer"
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon className="w-3.5 h-3.5" style={{ color: CORAL_SIDEBAR }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: CORAL_SIDEBAR }}>
          {eyebrow}
        </span>
      </div>

      <div className="text-sm font-semibold leading-snug text-white line-clamp-2 mb-2.5">
        {title}
      </div>

      <div
        className="flex items-center gap-1 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ color: CORAL_SIDEBAR }}
      >
        {isPlaceholder ? "Talk to us" : "View offer"}
        <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
