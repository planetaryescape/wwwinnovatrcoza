import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu, ArrowRight, Target, Lightbulb, Trophy, TrendingUp, Mail, GitBranch } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import ToolsSection from "@/components/ToolsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";

import trendsForesightImg from "@assets/generated_images/trends_and_foresight_3d_abstract.png";
import demandSpaceImg from "@assets/generated_images/demand_space_mapping_3d_network.png";
import categoryAuditsImg from "@assets/generated_images/category_audits_3d_cubes.png";
import ideationWorkshopsImg from "@assets/generated_images/ideation_workshops_creative_explosion.png";
import endToEndDesignImg from "@assets/generated_images/end_to_end_design_flow.png";
import brandHealthImg from "@assets/generated_images/brand_health_tracking_pulse.png";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";
import processGif from "@assets/3033FB85-DA2A-414B-B13D-A981E92AF90D_1768887098863.gif";

const pillars = [
  {
    id: "where-to-focus",
    number: "01",
    title: "Where to focus",
    tagline: "Understand and anticipate the market before you place your bets.",
    icon: Target,
    color: "#5A5EFF",
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
    id: "trends-foresight",
    title: "Trends & Foresight",
    pillar: "Where to focus",
    image: trendsForesightImg,
    tagline: "See what's coming before your competitors do"
  },
  {
    id: "demand-space",
    title: "Demand Space Mapping",
    pillar: "Where to focus",
    image: demandSpaceImg,
    tagline: "Map the white space where growth lives"
  },
  {
    id: "category-audits",
    title: "Category Audits",
    pillar: "Where to focus",
    image: categoryAuditsImg,
    tagline: "Know exactly where you stand"
  },
  {
    id: "ideation-workshops",
    title: "Ideation Workshops",
    pillar: "How to play",
    image: ideationWorkshopsImg,
    tagline: "Turn opportunity into breakthrough ideas"
  },
  {
    id: "end-to-end-design",
    title: "End to End Design",
    pillar: "How to win",
    image: endToEndDesignImg,
    tagline: "From concept to shelf-ready execution"
  },
  {
    id: "brand-health",
    title: "Brand & Category Health",
    pillar: "What's working",
    image: brandHealthImg,
    tagline: "Track what matters, act on what works"
  }
];

const whatWeDoCards = [
  {
    title: "STRATEGY &\nDIRECTION",
    description: "Understand and anticipate the market through:\n- Trends and foresight\n- Segmentation\n- Brand & Category Health\n- Demand Mapping",
    link: "How we set direction",
    linkHref: "#"
  },
  {
    title: "INNOVATION &\nTESTING",
    description: "Identify growth opportunities and build a business case via:\n- Idea screening & optimization\n- Portfolio management\n- Preliminary share, source of volume and cannibalization\n- Price pack architecture",
    link: "How we test ideas",
    linkHref: "#"
  },
  {
    title: "EXECUTION &\nSCALE",
    description: "Track launch effectiveness & market dynamics via:\n- Innovation launch monitoring\n- Promotion tracking\n- Brand and category health tracking",
    link: "How we drive momentum",
    linkHref: "#"
  }
];

function ClosingSection() {
  return (
    <section 
      id="consult-contact"
      className="relative min-h-screen flex flex-col justify-center bg-gradient-to-b from-[#0D1598] via-[#080E80] to-[#050960] overflow-hidden"
      data-testid="section-closing"
    >
      {/* Ambient floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/15 rounded-full"
            style={{
              left: `${15 + (i * 10)}%`,
              top: `${25 + (i * 6) % 50}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 lg:pr-20 py-24 sm:py-32">
        {/* Section header and messaging - centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
          data-testid="closing-line-1"
        >
          <p 
            className="text-xs uppercase tracking-[0.35em] mb-6 text-white/50"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            Your Future
          </p>
          <h2 
            className="font-serif text-white leading-tight mb-8"
            style={{ 
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontStyle: "italic"
            }}
          >
            Ready to Unlock Real Growth?
            <br />
            <span className="text-white/60">Let's make it happen.</span>
          </h2>
          <p 
            className="text-white/85 leading-relaxed mb-4"
            style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.25rem)" }}
            data-testid="closing-line-2"
          >
            Your next big move starts with a <span className="text-white font-medium">conversation</span>.
          </p>
        </motion.div>
        
        {/* Contact options - centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center gap-5 max-w-md mx-auto"
        >
            {/* WhatsApp Link */}
            <a 
              href="https://wa.me/27823012433"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 transition-all duration-300 hover:opacity-80"
              data-testid="button-whatsapp-contact"
            >
              <SiWhatsapp className="w-6 h-6 text-[#25D366]" />
              <span 
                className="text-white text-base"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                WhatsApp Us at 082 301 2433
              </span>
            </a>

            {/* Email Link */}
            <a 
              href="mailto:richard@innovatr.co.za?subject=Let's%20Talk%20-%20Innovatr%20Consult"
              className="group flex items-center gap-3 transition-all duration-300 hover:opacity-80"
              data-testid="button-email-simple"
            >
              <Mail className="w-6 h-6 text-[#5A5EFF]" />
              <span 
                className="text-white text-base"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Send us an email
              </span>
            </a>
        </motion.div>
      </div>
    </section>
  );
}

export default function CinematicLanding() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const userInteracted = useRef(false);


  // Scroll-based dive animation for hero section
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  // Text fades out quickly
  const textOpacity = useTransform(heroScrollProgress, [0, 0.3], [1, 0]);
  // Overall hero opacity for transition
  const heroOpacity = useTransform(heroScrollProgress, [0.7, 1], [1, 0]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const tryPlayVideo = () => {
    if (!videoRef.current || videoError) return;
    videoRef.current.play().catch((err) => {
      console.log("[Video] Autoplay blocked:", err.message);
    });
  };

  useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted.current) {
        userInteracted.current = true;
        tryPlayVideo();
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [videoError]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const menuItems = [
    { label: "The Problem", action: () => scrollToSection("problem-solution") },
    { label: "The Process", action: () => scrollToSection("why-consult") },
    { label: "The Tools", action: () => scrollToSection("consult-tools") },
    { label: "The Results", action: () => scrollToSection("case-studies") },
  ];

  return (
    <div className="min-h-screen bg-[#5A5EFF] text-white" style={{ backgroundColor: 'transparent' }}>
      <CustomCursor />
      {/* Skip to main content link for accessibility */}
      <a 
        href="#problem-solution" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-[#5A5EFF] focus:rounded-md focus:font-medium"
      >
        Skip to main content
      </a>
      {/* Fixed Header - Always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span 
              className="text-2xl font-serif font-bold text-slate-800 cursor-pointer hover:text-slate-600 transition-colors"
              data-testid="link-logo-landing"
            >
              Innovatr
            </span>
          </Link>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-slate-700 hover:text-slate-900 transition-colors text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            data-testid="button-menu-open"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      {/* Vertical Right Sidebar Navigation - Desktop Only */}
      <nav 
        className="hidden lg:flex fixed right-6 top-6 bottom-6 z-50 flex-col items-center justify-between py-4"
        aria-label="Page sections"
      >
        {/* Nav Links */}
        <div className="flex flex-col items-center gap-10">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-xs tracking-[0.2em] text-slate-600 hover:text-slate-800 transition-colors font-normal lowercase"
              style={{ 
                writingMode: "vertical-rl",
                fontFamily: "Roboto, sans-serif"
              }}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {item.label.toLowerCase()}
            </button>
          ))}
        </div>
        
        {/* Social Icons - Vertical */}
        <div className="flex flex-col items-center gap-5">
          <a
            href="https://wa.me/27823012433"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-800 transition-colors"
            data-testid="social-whatsapp"
          >
            <SiWhatsapp className="w-4 h-4" />
          </a>
          <a
            href="mailto:Richard@innovatr.co.za?subject=Innovatr%20Consult%20Connect"
            className="text-slate-600 hover:text-slate-800 transition-colors"
            data-testid="social-email"
          >
            <Mail className="w-4 h-4" />
          </a>
          <Link href="/">
            <span 
              className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-bold"
              style={{ fontFamily: "Roboto, sans-serif" }}
              data-testid="nav-24"
            >
              24
            </span>
          </Link>
        </div>
      </nav>
      {/* Hero Section */}
      <section 
        ref={heroSectionRef}
        className="relative"
      >
        {/* Hero container */}
        <div 
          ref={heroRef}
          className="min-h-screen overflow-visible"
        >
          {/* Solid background */}
          <div className="absolute inset-0 bg-[#FFF5EE]" />

          {/* Hero Content */}
          <div 
            className="relative z-10 min-h-screen flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 bg-[#ffe7de]"
          >
            {/* Two-column layout for desktop */}
            <div className="w-full max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                {/* Text content - Left side */}
                <motion.div
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-left lg:flex-1"
                >
                  <h1 
                    className="font-serif font-bold text-slate-800 leading-[0.95] uppercase"
                    style={{ 
                      fontFamily: "'DM Serif Display', serif", 
                      letterSpacing: "0.06em",
                      fontSize: "clamp(2rem, 4.8vw, 4.4rem)"
                    }}
                    data-testid="text-headline"
                    data-cursor-invert
                  >
                    WE BUILD<br />
                    WHAT'S<br />
                    MISSING.
                  </h1>
                  <p 
                    className="mt-6 font-sans text-slate-600 max-w-md"
                    style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                  >
                    Launch Better Innovation<br />through expert strategy, design & testing.
                  </p>
                  
                  {/* Animated pen GIF - below subtitle on mobile */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-4 -mx-6 sm:mx-0 lg:hidden"
                  >
                    <img 
                      src={penGif}
                      alt="Animated pen illustration"
                      className="w-screen sm:w-full sm:max-w-md h-auto object-contain"
                      data-testid="img-hero-pen-mobile"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Animated pen GIF - Right side on desktop, aligned with headline */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end"
                >
                  <img 
                    src={penGif}
                    alt="Animated pen illustration"
                    className="w-full max-w-lg xl:max-w-xl h-auto object-contain"
                    data-testid="img-hero-pen"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Problem / Solution Cinematic Section */}
      <ProblemSolutionSection />
      {/* What We Do Section */}
      <section id="why-consult" className="py-24 sm:py-32 bg-[#FF7F6E]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <motion.div 
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="mb-4" style={{ transform: "rotate(2deg)" }}>
              <GitBranch className="w-10 h-10 mx-auto text-white/70 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.1))" }} />
            </div>
            <p 
              className="text-xs uppercase tracking-[0.35em] mb-6 text-white/50"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              The Process
            </p>
            <h2 
              className="text-white mb-6"
              style={{ 
                fontFamily: "'DM Serif Display', serif", 
                letterSpacing: "0.04em",
                fontSize: "clamp(2rem, 5vw, 3.5rem)"
              }}
              data-cursor-invert
              data-testid="text-what-we-do-heading"
            >
              Move from Where to Play to How to Win, seamlessly.
            </h2>
          </motion.div>
          
          {/* Three Columns - Granny Smith Style */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {whatWeDoCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group text-center"
                data-testid={`card-what-we-do-${index}`}
              >
                <h3 
                  className="font-bold text-white mb-6 leading-tight whitespace-pre-line"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {card.title}
                </h3>
                <p 
                  className="leading-relaxed mb-6 text-white/95 whitespace-pre-line"
                  style={{ fontSize: "clamp(0.875rem, 1.2vw, 1rem)" }}
                >
                  {card.description}
                </p>
                <a 
                  href={card.linkHref}
                  className="inline-block text-white/70 text-sm underline underline-offset-4 hover:text-white transition-colors"
                  data-testid={`link-what-we-do-${index}`}
                >
                  {card.link}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated GIF Section - Between Process and Tools - Mobile only */}
      <section className="bg-[#5A5EFF] lg:hidden">
        <div className="w-full">
          <motion.img
            src={processGif}
            alt="Innovation process in action"
            className="w-full h-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </section>

      {/* Tools Section */}
      <ToolsSection />


      {/* Content Sections */}
      <div ref={contentRef}>
        {/* Case Studies Section with Toggle System */}
        <CaseStudiesSection />


        {/* Closing & Contact Section */}
        <ClosingSection />
      </div>
      {/* Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#5A5EFF]/95 backdrop-blur-xl"
            data-testid="menu-overlay"
          >
            <div className="h-full flex flex-col">
              <div className="px-6 py-6 flex items-center justify-between">
                <span className="text-2xl font-serif font-bold text-white tracking-wide">
                  Innovatr
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 -m-2"
                  aria-label="Close navigation menu"
                  data-testid="button-menu-close"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex-1 flex flex-col items-center justify-center gap-6" aria-label="Main navigation">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        item.action();
                      }}
                      className="text-2xl sm:text-3xl text-white/80 hover:text-white transition-colors font-light cursor-pointer"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                      data-testid={`menu-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
                
                {/* Mobile Social Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: menuItems.length * 0.1 }}
                  className="flex items-center gap-6 mt-8 pt-8 border-t border-white/20"
                >
                  <a
                    href="https://wa.me/27823012433"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    data-testid="menu-social-whatsapp"
                  >
                    <SiWhatsapp className="w-6 h-6" />
                  </a>
                  <a
                    href="mailto:Richard@innovatr.co.za?subject=Innovatr%20Consult%20Connect"
                    className="text-white/60 hover:text-white transition-colors"
                    data-testid="menu-social-email"
                  >
                    <Mail className="w-6 h-6" />
                  </a>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}