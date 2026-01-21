import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ThemeToggle from "./ThemeToggle";
import { CurrencyToggle } from "./CurrencyToggle";
import { LoginDialog } from "./LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user, logout, isAuthenticated, isMember } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check for ?login=true URL parameter to open login dialog
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "true" && !isAuthenticated) {
      setShowLoginDialog(true);
      // Clean up the URL without reloading the page
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", newUrl || "/");
    }
  }, [isAuthenticated]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "scale":
        return "default";
      case "growth":
        return "secondary";
      case "starter":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-12">
              <button 
                onClick={() => setLocation("/")}
                className={`text-2xl font-serif font-bold transition-colors ${isScrolled ? 'text-[#5669ed]' : 'text-white drop-shadow-lg'}`} 
                data-testid="link-logo"
              >
                Innovatr
              </button>
              
              <div className="hidden md:flex items-center gap-8">
                <button 
                  onClick={() => scrollToSection('services')}
                  className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'}`}
                  data-testid="nav-services"
                >
                  Services
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'}`}
                  data-testid="nav-pricing"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('membership')}
                  className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'}`}
                  data-testid="nav-membership"
                >
                  Membership
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'}`}
                  data-testid="nav-contact"
                >
                  Contact
                </button>
                <button 
                  onClick={() => setLocation('/consult')}
                  className={`transition-colors ${isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-primary'}`}
                  data-testid="nav-consult"
                >
                  Consult
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <CurrencyToggle />
              <ThemeToggle />
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      data-testid="button-user-menu"
                      className={`gap-2 ${!isScrolled ? 'border-white/30 text-white hover:bg-white/10' : ''}`}
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.name}</span>
                      {user?.isAdmin ? (
                        <Badge 
                          className="ml-1 text-xs bg-primary text-primary-foreground"
                          data-testid="badge-tier-admin"
                        >
                          ADMIN
                        </Badge>
                      ) : user?.tier && (
                        <Badge 
                          variant={getTierBadgeVariant(user.tier)} 
                          className="ml-1 text-xs"
                          data-testid={`badge-tier-${user.tier}`}
                        >
                          {user.tier.toUpperCase()}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56" data-testid="menu-user-dropdown">
                    <DropdownMenuLabel data-testid="text-user-email">{user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setLocation("/portal")}
                      data-testid="menu-item-portal"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {isMember ? "Member Portal" : "Free Portal"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      data-testid="menu-item-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => setShowLoginDialog(true)}
                  data-testid="button-login"
                  className={!isScrolled ? 'border-white/30 text-white hover:bg-white/10' : ''}
                >
                  Sign In
                </Button>
              )}
            </div>

            <button
              className={`md:hidden ${!isScrolled ? 'text-white' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => scrollToSection('services')}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                data-testid="mobile-nav-services"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                data-testid="mobile-nav-pricing"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('membership')}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                data-testid="mobile-nav-membership"
              >
                Membership
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
              <button 
                onClick={() => {
                  setLocation('/consult');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
                data-testid="mobile-nav-consult"
              >
                Consult
              </button>
              
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Currency</span>
                <CurrencyToggle />
              </div>
              
              {isAuthenticated ? (
                <>
                  <div className="pt-3 border-t">
                    <div className="text-sm text-muted-foreground mb-2" data-testid="mobile-text-user">
                      {user?.email}
                    </div>
                    <Button 
                      className="w-full mb-2"
                      onClick={() => {
                        setLocation("/portal");
                        setIsMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-portal"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {isMember ? "Member Portal" : "Free Portal"}
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <div className="pt-3">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setShowLoginDialog(true);
                      setIsMobileMenuOpen(false);
                    }}
                    data-testid="mobile-button-login"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  );
}
