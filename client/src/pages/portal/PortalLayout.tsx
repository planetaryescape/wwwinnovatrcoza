import { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  CreditCard,
  Archive,
  Gift,
  Settings,
  LogOut,
  Lock,
  Shield,
  Eye,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Dashboard",
    url: "/portal",
    icon: LayoutDashboard,
    lockedForFree: true,
    adminOnly: false,
  },
  {
    title: "Trends & Insights",
    url: "/portal/trends",
    icon: TrendingUp,
    lockedForFree: false,
    adminOnly: false,
  },
  {
    title: "Launch New Brief",
    url: "/portal/launch",
    icon: FileText,
    lockedForFree: false,
    adminOnly: false,
  },
  {
    title: "Credits & Billing",
    url: "/portal/credits",
    icon: CreditCard,
    lockedForFree: false,
    adminOnly: false,
  },
  {
    title: "My Research",
    url: "/portal/research",
    icon: Archive,
    lockedForFree: true,
    adminOnly: false,
  },
  {
    title: "Member Deals",
    url: "/portal/deals",
    icon: Gift,
    lockedForFree: true,
    adminOnly: false,
  },
  {
    title: "Admin",
    url: "/portal/admin",
    icon: Shield,
    lockedForFree: false,
    adminOnly: true,
  },
  {
    title: "Settings",
    url: "/portal/settings",
    icon: Settings,
    lockedForFree: false,
    adminOnly: false,
  },
];

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isMember, isAdmin, isFreeUser, isPaidMember, impersonation, exitImpersonation, isViewingAsCompany, viewingCompanyName } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleMenuClick = (url: string) => {
    setLocation(url);
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "scale":
        return "bg-primary text-primary-foreground";
      case "growth":
        return "bg-accent text-accent-foreground";
      case "starter":
        return "bg-primary/60 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <div className="px-4 py-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <button 
                    onClick={() => setLocation("/")}
                    className="text-xl font-serif font-bold text-primary"
                    data-testid="link-sidebar-logo"
                  >
                    Innovatr
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium" data-testid="text-member-name">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mb-2" data-testid="text-member-company">
                    {user?.company || user?.email}
                  </p>
                  {(() => {
                    // Get tier from membershipTier (uppercase) or tier (lowercase) 
                    const displayTier = (user?.membershipTier || user?.tier || "").toUpperCase();
                    
                    return (
                      <Badge 
                        className={`${isAdmin ? 'bg-primary text-primary-foreground' : isPaidMember ? getTierColor(displayTier) : 'bg-muted text-muted-foreground'} text-xs`}
                        data-testid={`badge-member-tier-${isAdmin ? 'admin' : displayTier.toLowerCase() || 'free'}`}
                      >
                        {isAdmin ? 'ADMIN' : isPaidMember ? `${displayTier} Member` : 'FREE TIER'}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
              <SidebarGroupLabel data-testid="label-portal-menu">Portal Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    // Hide admin items for non-admins AND during impersonation mode
                    if (item.adminOnly && (!isAdmin || impersonation.isImpersonating)) return null;
                    // Paid members have full access - no locks (uses isPaidMember from AuthContext)
                    const isLocked = !isPaidMember && item.lockedForFree;
                    const isActive = item.url === "/portal" 
                      ? (location === "/portal" || location === "/portal/dashboard")
                      : location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          data-testid={`menu-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <button 
                            onClick={() => handleMenuClick(item.url)}
                            className="w-full"
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1 text-left">{item.title}</span>
                            {isLocked && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
                data-testid="button-sidebar-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          {impersonation.isImpersonating && (
            <div 
              className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between"
              data-testid="impersonation-bar"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isViewingAsCompany ? (
                    <>Viewing: <strong>{viewingCompanyName || user?.company}</strong> - You&apos;re viewing this company&apos;s portal as an admin</>
                  ) : (
                    <>Viewing as: <strong>{user?.name || user?.email}</strong>
                    {user?.company && <span className="ml-1">({user.company})</span>}</>
                  )}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  // Clear impersonation state and navigate back to Admin → Companies tab
                  exitImpersonation();
                  // Navigate to admin portal with companies tab active
                  setLocation("/portal/admin?tab=companies");
                }}
                className="text-amber-950 hover:bg-amber-600 hover:text-amber-950"
                data-testid="button-exit-impersonation"
              >
                <X className="w-4 h-4 mr-1" />
                {isViewingAsCompany ? "Back to Companies" : "Exit View"}
              </Button>
            </div>
          )}
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
