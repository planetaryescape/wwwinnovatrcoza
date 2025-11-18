import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-12">
            <a href="/" className="text-2xl font-serif font-bold text-primary" data-testid="link-logo">
              Innovatr
            </a>
            
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
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => scrollToSection('contact')}
              data-testid="nav-button-test"
              className={!isScrolled ? 'border-white/30 text-white hover:bg-white/10' : ''}
            >
              Get in Touch
            </Button>
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
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('membership')}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Membership
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-2 text-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
            <div className="pt-3">
              <Button 
                className="w-full"
                onClick={() => scrollToSection('contact')}
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
