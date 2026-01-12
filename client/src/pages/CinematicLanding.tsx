import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Menu, ArrowRight, ArrowDown, Target, Lightbulb, Trophy, TrendingUp, Users, Layers } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

const pillars = [
  {
    id: "where-to-focus",
    number: "01",
    title: "Where to focus",
    tagline: "Understand and anticipate the market before you place your bets.",
    icon: Target,
    color: "#4D5FF1",
    bullets: [
      "Trends and foresight",
      "Need states",
      "Segmentation",
      "Category audits"
    ]
  },
  {
    id: "how-to-play",
    number: "02",
    title: "How to play",
    tagline: "Turn opportunity spaces into ideas worth backing.",
    icon: Lightbulb,
    color: "#ED876E",
    bullets: [
      "Ideation workshops",
      "Design sprints",
      "Idea generation"
    ]
  },
  {
    id: "how-to-win",
    number: "03",
    title: "How to win",
    tagline: "Choose the strongest route, optimise it, and build the commercial case.",
    icon: Trophy,
    color: "#10B981",
    bullets: [
      "Idea screening",
      "Idea optimisation",
      "Portfolio management",
      "Volumetric forecasting"
    ]
  },
  {
    id: "whats-working",
    number: "04",
    title: "What's working",
    tagline: "Track what's changing so you can keep winning after launch.",
    icon: TrendingUp,
    color: "#8B5CF6",
    bullets: [
      "Innovation tracking",
      "Promotion tracking",
      "Brand and category health tracking"
    ]
  }
];

const caseStudies = [
  {
    pillar: "Where to focus",
    client: "Leading National Retailer",
    challenge: "Needed clarity on where growth would come from in a changing category.",
    approach: "Category scan, need state mapping, segmentation and journey mapping.",
    outcome: "Clear opportunity map and a prioritised growth roadmap for the next planning cycle."
  },
  {
    pillar: "How to play",
    client: "Premium FMCG Brand",
    challenge: "Had ambition but lacked clear routes to innovation.",
    approach: "Facilitated ideation workshops and design sprints to generate 40+ concepts.",
    outcome: "Three breakthrough concepts advanced to development phase."
  },
  {
    pillar: "How to win",
    client: "International Beverage Company",
    challenge: "Multiple product routes needed to be prioritised with limited budget.",
    approach: "Idea screening, optimisation testing, and volumetric forecasting.",
    outcome: "Data-backed business case securing executive sign-off and launch budget."
  },
  {
    pillar: "What's working",
    client: "Regional Food Manufacturer",
    challenge: "Post-launch tracking was fragmented and reactive.",
    approach: "Set up always-on innovation and promotion tracking dashboard.",
    outcome: "Real-time visibility into market dynamics, enabling faster response to competitors."
  }
];

const valueCards = [
  {
    icon: Layers,
    title: "Phased programmes",
    description: "From direction to optimisation to tracking."
  },
  {
    icon: Target,
    title: "Decision confidence",
    description: "Clarity on trade-offs and what to do next."
  },
  {
    icon: Users,
    title: "Senior-ready delivery",
    description: "Workshops, alignment, and executive-ready outputs."
  }
];

export default function CinematicLanding() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const lifecycleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef(0);
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: lifecycleScrollProgress } = useScroll({
    target: lifecycleRef,
    offset: ["start start", "end end"]
  });

  const pillarProgress = useTransform(lifecycleScrollProgress, [0, 0.85], [0, 3.99]);

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
    if (reducedMotion || !videoRef.current) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateVideoTime = () => {
      if (!videoRef.current) return;
      
      currentTimeRef.current = lerp(currentTimeRef.current, targetTimeRef.current, 0.1);
      
      if (Math.abs(currentTimeRef.current - targetTimeRef.current) > 0.01) {
        videoRef.current.currentTime = currentTimeRef.current;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateVideoTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateVideoTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const unsubscribe = heroScrollProgress.on("change", (latest) => {
      if (videoRef.current) {
        const duration = videoRef.current.duration || 8;
        targetTimeRef.current = latest * duration;
        
        const fadeStart = 0.85;
        if (latest > fadeStart) {
          const fadeProgress = (latest - fadeStart) / (1 - fadeStart);
          setHeroOpacity(1 - fadeProgress * 0.3);
        } else {
          setHeroOpacity(1);
        }
      }
    });

    return unsubscribe;
  }, [heroScrollProgress, reducedMotion]);

  useEffect(() => {
    return pillarProgress.on("change", (latest) => {
      const index = Math.min(Math.floor(latest), 3);
      setActivePillar(index);
    });
  }, [pillarProgress]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const menuItems = [
    { label: "Explore our work", action: () => scrollToContent() },
    { label: "Services", href: "/home#services" },
    { label: "Pricing", href: "/home#pricing" },
    { label: "Membership", href: "/home#membership" },
    { label: "Contact", href: "/home#contact" },
    { label: "Sign in", href: "/home?login=true" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white cursor-none">
      <CustomCursor />
      
      {/* Fixed Header - Always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

      {/* Video Scroll-Scrub Zone */}
      <section 
        ref={heroRef}
        className="relative"
        style={{ height: "280vh" }}
      >
        {/* Sticky Video Container */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Video Background */}
          {!reducedMotion ? (
            <motion.div 
              className="absolute inset-0"
              style={{ opacity: heroOpacity }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  setVideoLoaded(true);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                  }
                }}
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%230a0a0f' width='1920' height='1080'/%3E%3C/svg%3E"
                data-testid="video-background"
              >
                <source src="/video/consult-landing.mp4" type="video/mp4" />
              </video>
            </motion.div>
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]"
              data-testid="poster-fallback"
            />
          )}

          {/* Cinematic Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)"
            }}
          />
          {/* Subtle film grain overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat"
            }}
          />

          {/* Hero Content */}
          <motion.div 
            className="relative z-10 h-full flex flex-col items-center justify-center px-6"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-white leading-tight mb-10"
                data-testid="text-headline"
              >
                More than research.
                <br />
                <span className="text-white/90">Built for decisions.</span>
              </h1>

              <Button 
                size="lg"
                onClick={scrollToContent}
                className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white px-8 py-6 text-base sm:text-lg font-medium rounded-lg shadow-[0_0_30px_rgba(77,95,241,0.3)] hover:shadow-[0_0_40px_rgba(77,95,241,0.5)] transition-all duration-300"
                data-testid="button-explore-work"
              >
                Explore our work
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
            >
              <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Transition Bridge */}
      <div className="h-20 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]" />

      {/* Lifecycle Content Section */}
      <div ref={contentRef}>
        {/* The Lifecycle - Pillar Section */}
        <section 
          ref={lifecycleRef} 
          className="relative"
          style={{ minHeight: "calc(100vh * 5.5)" }}
          id="lifecycle"
        >
          <div className="sticky top-0 h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]" />
            
            {/* Progress indicator */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-20">
              {pillars.map((pillar, index) => (
                <button
                  key={pillar.id}
                  onClick={() => {
                    const element = document.getElementById(`pillar-${pillar.id}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activePillar === index 
                      ? "w-8 bg-white" 
                      : "bg-gray-600 hover:bg-gray-400"
                  }`}
                  data-testid={`progress-${pillar.id}`}
                />
              ))}
            </div>
            
            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-24"
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">
                        The Lifecycle
                      </p>
                      <p 
                        className="text-6xl font-bold mb-4 opacity-20"
                        style={{ color: pillars[activePillar].color }}
                      >
                        {pillars[activePillar].number}
                      </p>
                      <h2 
                        className="text-4xl sm:text-5xl font-serif font-bold mb-6"
                        style={{ color: pillars[activePillar].color }}
                      >
                        {pillars[activePillar].title}
                      </h2>
                      <p className="text-xl text-gray-300 mb-8">
                        {pillars[activePillar].tagline}
                      </p>
                      <ul className="space-y-3 mb-8">
                        {pillars[activePillar].bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-gray-400">
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: pillars[activePillar].color }}
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <Link href={`/consult/${pillars[activePillar].id}`}>
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/5 p-0 group"
                          data-testid={`link-explore-${pillars[activePillar].id}`}
                        >
                          Explore {pillars[activePillar].title}
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="hidden lg:flex justify-center">
                      <div 
                        className="w-64 h-64 rounded-full opacity-30 blur-3xl"
                        style={{ backgroundColor: pillars[activePillar].color }}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Scroll anchors for each pillar - taller sections for smoother scrolling */}
          {pillars.map((pillar, index) => (
            <div 
              key={pillar.id}
              id={`pillar-${pillar.id}`}
              style={{ 
                height: "150vh",
                marginTop: index === 0 ? "-100vh" : 0
              }}
            />
          ))}
        </section>

        {/* Mobile Pillars (stacked cards) */}
        <section className="lg:hidden py-20 bg-[#0d0d18]">
          <div className="max-w-4xl mx-auto px-4">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-8 text-center">
              The Lifecycle
            </p>
            <div className="space-y-6">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <Card 
                    key={pillar.id}
                    className="bg-[#12121a] border-gray-800 overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${pillar.color}20` }}
                        >
                          <IconComponent style={{ color: pillar.color }} className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">{pillar.number}</p>
                          <h3 
                            className="text-2xl font-serif font-bold mb-2"
                            style={{ color: pillar.color }}
                          >
                            {pillar.title}
                          </h3>
                          <p className="text-gray-400 mb-4">{pillar.tagline}</p>
                          <ul className="space-y-2 mb-4">
                            {pillar.bullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                <div 
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: pillar.color }}
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                          <Link href={`/consult/${pillar.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/5 p-0"
                            >
                              Explore
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Consult Section */}
        <section className="py-24 bg-[#0a0a0f]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.3em] text-[#4D5FF1] mb-4">
                Why Consult
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6">
                More than research.{" "}
                <span className="text-gray-400">Built for decisions.</span>
              </h2>
              <div className="max-w-3xl mx-auto space-y-4 text-gray-400">
                <p>
                  Test24 is designed for fast, high-quality testing.
                </p>
                <p>
                  Consult is for when the decision is bigger: multiple routes, multiple stakeholders, multiple phases.
                </p>
                <p>
                  We design the learning agenda, run the work, and translate it into clear actions.
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {valueCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-[#12121a] border-gray-800 hover:border-[#4D5FF1]/30 transition-colors"
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 rounded-xl bg-[#4D5FF1]/10 flex items-center justify-center mx-auto mb-6">
                        <IconComponent className="w-7 h-7 text-[#4D5FF1]" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">{card.title}</h3>
                      <p className="text-gray-400">{card.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="py-24 bg-[#0d0d18]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
                Case Studies
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold">
                Real results, real clients
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {caseStudies.map((study, index) => (
                <Card 
                  key={index}
                  className="bg-[#12121a] border-gray-800 hover:border-gray-700 transition-colors overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div 
                      className="h-1"
                      style={{ backgroundColor: pillars.find(p => p.title === study.pillar)?.color || "#4D5FF1" }}
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span 
                          className="text-xs uppercase tracking-wider px-2 py-1 rounded"
                          style={{ 
                            backgroundColor: `${pillars.find(p => p.title === study.pillar)?.color}20`,
                            color: pillars.find(p => p.title === study.pillar)?.color
                          }}
                        >
                          {study.pillar}
                        </span>
                        <span className="text-sm text-gray-500">{study.client}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Challenge</p>
                          <p className="text-gray-300">{study.challenge}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Approach</p>
                          <p className="text-gray-400 text-sm">{study.approach}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Outcome</p>
                          <p className="text-gray-300 font-medium">{study.outcome}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="consult-contact" className="py-24 bg-[#0a0a0f]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6">
              Facing a complex decision?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              If the stakes are high and you want a thought partner, let's talk.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white px-8"
                onClick={() => setLocation("/home#contact")}
                data-testid="button-book-consult"
              >
                Book a consult call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/5"
                asChild
              >
                <a href="mailto:richard@innovatr.co.za" data-testid="link-email-us">
                  Email us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />

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
                    {item.action ? (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          item.action();
                        }}
                        className="text-2xl sm:text-3xl text-white/80 hover:text-white transition-colors font-light cursor-pointer"
                        data-testid={`menu-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link 
                        href={item.href!}
                        onClick={() => setMenuOpen(false)}
                      >
                        <span 
                          className="text-2xl sm:text-3xl text-white/80 hover:text-white transition-colors font-light cursor-pointer"
                          data-testid={`menu-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    )}
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