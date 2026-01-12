import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicLanding() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (videoRef.current && !reducedMotion) {
      videoRef.current.play().catch(() => {
        console.log("Autoplay prevented");
      });
    }
  }, [reducedMotion, videoLoaded]);

  const menuItems = [
    { label: "Explore our work", href: "/consult" },
    { label: "Services", href: "/home#services" },
    { label: "Pricing", href: "/home#pricing" },
    { label: "Membership", href: "/home#membership" },
    { label: "Contact", href: "/home#contact" },
    { label: "Sign in", href: "/home?login=true" },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0f]">
      {/* Video Background */}
      {!reducedMotion ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%230a0a0f' width='1920' height='1080'/%3E%3C/svg%3E"
          data-testid="video-background"
        >
          <source src="/video/innovatr-landing.mp4" type="video/mp4" />
        </video>
      ) : (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]"
          data-testid="poster-fallback"
        />
      )}

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)"
        }}
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation("/home")}
            className="text-2xl font-serif font-bold text-white tracking-wide"
            data-testid="link-logo-landing"
          >
            Innovatr
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="text-white/80 hover:text-white transition-colors text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2"
            data-testid="button-menu-open"
          >
            <Menu className="w-5 h-5" />
            Menu
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-white leading-tight mb-6"
            data-testid="text-headline"
          >
            Strategic innovation for high-stakes decisions
          </h1>
          
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light">
            Consulting-led strategy and research across every stage of the business lifecycle.
          </p>

          <Link href="/consult">
            <Button 
              size="lg"
              className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white px-8 py-6 text-base sm:text-lg font-medium rounded-lg shadow-[0_0_30px_rgba(77,95,241,0.3)] hover:shadow-[0_0_40px_rgba(77,95,241,0.5)] transition-all duration-300"
              data-testid="button-explore-work"
            >
              Explore our work
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#0a0a0f]/95 backdrop-blur-xl"
            data-testid="menu-overlay"
          >
            <div className="h-full flex flex-col">
              <div className="px-6 py-6 flex items-center justify-between">
                <span className="text-2xl font-serif font-bold text-white tracking-wide">
                  Innovatr
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  data-testid="button-menu-close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col items-center justify-center gap-6">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span 
                        className="text-2xl sm:text-3xl text-white/80 hover:text-white transition-colors font-light cursor-pointer"
                        data-testid={`menu-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}