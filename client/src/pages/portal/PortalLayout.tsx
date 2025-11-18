import { useState } from "react";
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
  memberData?: {
    name: string;
    company: string;
    tier: "Entry" | "Gold" | "Platinum";
  };
}

export default function PortalLayout({ children, memberData }: PortalLayoutProps) {
  const [location, setLocation] = useLocation();

  // Mock member data - in production this would come from auth/session
  const member = memberData || {
    name: "Richard",
    company: "Innovatr",
    tier: "Gold" as const,
  };

  const handleLogout = () => {
    // Navigate back to home page
    setLocation("/");
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-primary text-primary-foreground";
      case "Gold":
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
                  <a href="/" className="text-xl font-serif font-bold text-primary">
                    Innovatr
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{member.company}</p>
                  <Badge className={`${getTierColor(member.tier)} text-xs`}>
                    {member.tier} Member
                  </Badge>
                </div>
              </div>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Portal Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <a href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
