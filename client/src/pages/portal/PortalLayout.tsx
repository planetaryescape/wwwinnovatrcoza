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
} from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import FreeTierPortal from "./FreeTierPortal";

const menuItems = [
  {
    title: "Dashboard",
    url: "/portal",
    icon: LayoutDashboard,
  },
  {
    title: "Trends & Insights",
    url: "/portal/trends",
    icon: TrendingUp,
  },
  {
    title: "Launch New Brief",
    url: "/portal/launch",
    icon: FileText,
  },
  {
    title: "Credits & Billing",
    url: "/portal/credits",
    icon: CreditCard,
  },
  {
    title: "Past Research",
    url: "/portal/research",
    icon: Archive,
  },
  {
    title: "Member Deals",
    url: "/portal/deals",
    icon: Gift,
  },
  {
    title: "Settings",
    url: "/portal/settings",
    icon: Settings,
  },
];

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isMember } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (!isMember) {
    return <FreeTierPortal />;
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-primary text-primary-foreground";
      case "gold":
        return "bg-accent text-accent-foreground";
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
                  <Badge 
                    className={`${getTierColor(user?.tier || 'entry')} text-xs`}
                    data-testid={`badge-member-tier-${user?.tier}`}
                  >
                    {user?.tier?.toUpperCase()} Member
                  </Badge>
                </div>
              </div>
              <SidebarGroupLabel data-testid="label-portal-menu">Portal Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        data-testid={`menu-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <button onClick={() => setLocation(item.url)}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
