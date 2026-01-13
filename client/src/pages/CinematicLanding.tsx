import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Menu, ArrowRight, ArrowDown, Target, Lightbulb, Trophy, TrendingUp, Users, Layers, Mail } from "lucide-react";
import { SiLinkedin, SiInstagram } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";

import trendsForesightImg from "@assets/generated_images/trends_and_foresight_3d_abstract.png";
import demandSpaceImg from "@assets/generated_images/demand_space_mapping_3d_network.png";
import categoryAuditsImg from "@assets/generated_images/category_audits_3d_cubes.png";
import ideationWorkshopsImg from "@assets/generated_images/ideation_workshops_creative_explosion.png";
import endToEndDesignImg from "@assets/generated_images/end_to_end_design_flow.png";
import brandHealthImg from "@assets/generated_images/brand_health_tracking_pulse.png";

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
    description: "We help teams find focus when there are too many options. We clarify routes, align stakeholders, and build confidence in what to pursue.",
    link: "How we set direction",
    linkHref: "#"
  },
  {
    title: "INNOVATION &\nTESTING",
    description: "We design and run the tests that answer the right questions at the right time. Real evidence. Real insight. No guesswork.",
    link: "How we test ideas",
    linkHref: "#"
  },
  {
    title: "EXECUTION &\nSCALE",
    description: "We translate learnings into action — optimising launches, refining execution, and tracking performance as you grow.",
    link: "How we drive momentum",
    linkHref: "#"
  }
];

const humorLines = [
  { text: "Look, if you've made it this far...", delay: 0 },
  { text: "Either you're nosy (no shame)...", delay: 0.15 },
  { text: "...you think our work is pretty lekker...", delay: 0.3 },
  { text: "...or you're ready to chat.", delay: 0.45 },
];

function HumorSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const line1Opacity = useTransform(scrollYProgress, [0.10, 0.18, 0.26, 0.34], [0, 1, 1, 0]);
  const line2Opacity = useTransform(scrollYProgress, [0.18, 0.26, 0.34, 0.42], [0, 1, 1, 0]);
  const line3Opacity = useTransform(scrollYProgress, [0.26, 0.34, 0.42, 0.50], [0, 1, 1, 0]);
  const line4Opacity = useTransform(scrollYProgress, [0.34, 0.42, 0.50, 0.58], [0, 1, 1, 0]);

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#0a0a0f]"
      style={{ minHeight: "140vh" }}
      data-testid="section-humor"
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pr-16 text-center">
          <div className="flex flex-col items-center justify-center gap-10 sm:gap-14 md:gap-16 lg:gap-20 text-[#fafafa]">
            <motion.p
              style={{ opacity: line1Opacity }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-[#fafafa]"
              data-testid="humor-line-1"
            >
              {humorLines[0].text}
            </motion.p>
            
            <motion.p
              style={{ opacity: line2Opacity }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/70 font-light tracking-wide"
              data-testid="humor-line-2"
            >
              {humorLines[1].text}
            </motion.p>
            
            <motion.p
              style={{ opacity: line3Opacity }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-[#fafafa]"
              data-testid="humor-line-3"
            >
              {humorLines[2].text}
            </motion.p>
            
            <motion.p
              style={{ opacity: line4Opacity }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-light tracking-wide"
              data-testid="humor-line-4"
            >
              {humorLines[3].text}
            </motion.p>
          </div>
        </div>
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
  const [activePillar, setActivePillar] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const lifecycleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const userInteracted = useRef(false);

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

  useEffect(() => {
    return pillarProgress.on("change", (latest) => {
      const index = Math.min(Math.floor(latest), 3);
      setActivePillar(index);
    });
  }, [pillarProgress]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const navItems = [
    { label: "What We Do", action: () => scrollToSection("why-consult") },
    { label: "Lifecycle", action: () => scrollToSection("lifecycle") },
    { label: "Results", action: () => scrollToSection("case-studies") },
    { label: "Contact", action: () => scrollToSection("consult-contact") },
  ];

  const menuItems = [
    { label: "What We Do", action: () => scrollToSection("why-consult") },
    { label: "Lifecycle", action: () => scrollToSection("lifecycle") },
    { label: "Results", action: () => scrollToSection("case-studies") },
    { label: "Contact", action: () => scrollToSection("consult-contact") },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <CustomCursor />
      {/* Fixed Header - Always visible */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home">
            <span 
              className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide cursor-pointer hover:text-white/80 transition-colors"
              data-testid="link-logo-landing"
            >
              Innovatr
            </span>
          </Link>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-white/80 hover:text-white transition-colors text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2"
            data-testid="button-menu-open"
          >
            <Menu className="w-5 h-5" />
            Menu
          </button>
        </div>
      </header>
      {/* Vertical Right Sidebar Navigation - Desktop Only */}
      <nav className="hidden lg:flex fixed right-6 top-6 bottom-6 z-50 flex-col items-center justify-between py-4">
        {/* Nav Links */}
        <div className="flex flex-col items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="text-xs tracking-[0.2em] text-white hover:text-white/70 transition-colors font-normal lowercase"
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
            href="https://www.linkedin.com/in/richard-lawrence-innovation-72a62414"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/70 transition-colors"
            data-testid="social-linkedin"
          >
            <SiLinkedin className="w-4 h-4" />
          </a>
          <a
            href="mailto:Richard@innovatr.co.za?subject=Innovatr%20Consult%20Connect"
            className="text-white hover:text-white/70 transition-colors"
            data-testid="social-email"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href="https://www.instagram.com/innovatr1?igsh=d2V3eGM5eDZ5anhh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/70 transition-colors"
            data-testid="social-instagram"
          >
            <SiInstagram className="w-4 h-4" />
          </a>
          <Link href="/home">
            <span 
              className="text-white hover:text-white/70 transition-colors text-sm font-bold"
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
        ref={heroRef}
        className="relative min-h-screen bg-[#0a0a0f]"
      >
        {/* Plain Background */}
        <div className="absolute inset-0 bg-[#0a0a0f]" />

        {/* Hero Content - Two Column Layout */}
        <div className="relative z-10 h-screen flex items-center px-6 sm:px-10 lg:px-16">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Large Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-left"
            >
              <h1 
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-sans font-bold text-white leading-[0.95] tracking-tight uppercase"
                style={{ fontFamily: "Roboto, sans-serif" }}
                data-testid="text-headline"
                data-cursor-invert
              >
                WE BUILD<br />
                WHAT'S<br />
                MISSING
              </h1>
              <p className="mt-8 text-base sm:text-lg md:text-xl text-white/60 font-sans whitespace-nowrap">
                Launch Better Innovation through in-house data, design and testing.
              </p>
            </motion.div>
            
            {/* Right: Shift Key Video Loop */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex justify-center lg:justify-end"
            >
              <video
                className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] object-contain"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                data-testid="video-shift-key"
              >
                <source src="/video/shift-key-loop.mov" type="video/quicktime" />
                <source src="/video/shift-key-loop.mp4" type="video/mp4" />
              </video>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          </motion.div>
        </div>
      </section>
      {/* Transition Bridge */}
      <div className="h-20 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]" />
      {/* Problem / Solution Cinematic Section */}
      <ProblemSolutionSection />
      {/* What We Do Section */}
      <section id="why-consult" className="py-24 sm:py-32 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-20 sm:mb-24">
            <h2 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 italic tracking-tight"
              data-cursor-invert
              data-testid="text-what-we-do-heading"
            >
              WHAT WE DO
            </h2>
            <p className="text-lg sm:text-xl text-white/60 mb-4">
              Many paths. One goal: systematic innovation
            </p>
            <p className="text-base sm:text-lg text-white/40 max-w-2xl">
              Strategy, innovation, execution — designed to work together, or independently.
            </p>
          </div>
          
          {/* Three Columns - Granny Smith Style */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {whatWeDoCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group"
                data-testid={`card-what-we-do-${index}`}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight whitespace-pre-line tracking-tight">
                  {card.title}
                </h3>
                <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6">
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
      {/* Lifecycle Content Section */}
      <div ref={contentRef}>
        {/* The Lifecycle - Pillar Section */}
        <section 
          ref={lifecycleRef} 
          className="relative hidden lg:block"
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
                      <p className="text-sm uppercase tracking-[0.3em] mb-2 text-[#fafafa]">
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
                          <li key={idx} className="flex items-center gap-3 text-[#fafafa]">
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
        <section className="lg:hidden py-16 sm:py-20 bg-[#0d0d18]">
          <div className="max-w-lg sm:max-w-xl mx-auto px-6 sm:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-8 text-center">
              The Lifecycle
            </p>
            <div className="space-y-5">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <Card 
                    key={pillar.id}
                    className="bg-[#12121a] border-gray-800 overflow-hidden"
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="text-center sm:text-left sm:flex sm:items-start sm:gap-4">
                        <div 
                          className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 mb-4 sm:mb-0"
                          style={{ backgroundColor: `${pillar.color}20` }}
                        >
                          <IconComponent style={{ color: pillar.color }} className="w-7 h-7 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">{pillar.number}</p>
                          <h3 
                            className="text-2xl font-serif font-bold mb-2"
                            style={{ color: pillar.color }}
                          >
                            {pillar.title}
                          </h3>
                          <p className="text-gray-400 mb-4 text-sm sm:text-base">{pillar.tagline}</p>
                          <ul className="space-y-2 mb-4 text-left inline-block">
                            {pillar.bullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: pillar.color }}
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4">
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
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="py-24 bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pr-16">
            <div className="text-center mb-16">
              <h2 
                className="sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-white text-[95px]"
                data-cursor-invert
              >
                Results
              </h2>
              <p className="text-lg sm:text-xl mt-6 max-w-2xl mx-auto text-[#fafafa]">
                A showcase of impact across markets, categories & stages of growth.
                <br />
                A curated selection of work across focus, play, win & performance tracking.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {caseStudies.map((study, index) => {
                const pillarColor = pillars.find(p => p.title === study.pillar)?.color || "#4D5FF1";
                return (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-lg cursor-pointer"
                    style={{ 
                      background: "linear-gradient(180deg, #12121a 0%, #0a0a0f 100%)"
                    }}
                    data-testid={`case-study-${study.id}`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <motion.img
                        src={study.image}
                        alt={study.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <div 
                        className="absolute inset-0 opacity-40 group-hover:opacity-20 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(180deg, transparent 30%, ${pillarColor}40 100%)`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent opacity-80" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span 
                          className="inline-block text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded mb-3"
                          style={{ 
                            backgroundColor: `${pillarColor}30`,
                            color: pillarColor,
                            border: `1px solid ${pillarColor}40`
                          }}
                        >
                          {study.pillar}
                        </span>
                        <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#fafafa] transition-colors">
                          {study.title}
                        </h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                          {study.tagline}
                        </p>
                      </div>
                    </div>
                    
                    <div 
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: pillarColor }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Humorous Scroll Reveal Section */}
        <HumorSection />

        {/* Final CTA Section - Interactive Ball */}
        <section id="consult-contact" className="relative min-h-screen bg-[#0a0a0f] flex flex-col justify-center overflow-hidden">
          {/* Section Header */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-white/40 mb-8" data-testid="text-contact-subheading">
                Let's talk
              </p>
              
              <h2 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-white mb-8 leading-tight"
                data-cursor-invert
                data-testid="text-contact-heading"
              >
                Ready when you are.
              </h2>
              
              <p className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto leading-relaxed" data-testid="text-contact-intro">
                High stakes decisions deserve a thought partner.
              </p>
            </motion.div>
          </div>
          
          {/* Interactive Ball Section */}
          <div className="relative w-full flex items-center">
            {/* Large clickable ball on the left */}
            <motion.a
              href="mailto:richard@innovatr.co.za"
              initial={{ x: -200, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative flex-shrink-0 group cursor-pointer"
              data-testid="button-email-ball"
            >
              <div 
                className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full bg-white -ml-[100px] sm:-ml-[80px] md:-ml-[60px] lg:-ml-[40px] transition-transform duration-500 group-hover:scale-105 flex items-center justify-center"
              >
                <span className="text-[#0a0a0f] text-lg sm:text-xl md:text-2xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-[80px] sm:pl-[60px] md:pl-[40px] lg:pl-[20px]">
                  Let's talk
                </span>
              </div>
            </motion.a>
            
            {/* Click over here text with arrow */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex items-center ml-6 sm:ml-10 md:ml-16"
            >
              {/* Hand-drawn style curved arrow pointing left at circle */}
              <svg 
                viewBox="0 0 120 60" 
                className="w-20 h-12 sm:w-24 sm:h-14 md:w-32 md:h-16 mr-4 sm:mr-6"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M110 30 C70 30, 40 30, 10 30"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path
                  d="M10 30 L22 22 M10 30 L22 38"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 1.3 }}
                />
              </svg>
              
              <div className="text-white">
                <p 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide"
                  data-testid="text-click-over-here"
                >
                  Click over here
                </p>
              </div>
            </motion.div>
          </div>
        </section>
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
                    href="https://www.linkedin.com/in/richard-lawrence-innovation-72a62414"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    data-testid="menu-social-linkedin"
                  >
                    <SiLinkedin className="w-6 h-6" />
                  </a>
                  <a
                    href="mailto:Richard@innovatr.co.za?subject=Innovatr%20Consult%20Connect"
                    className="text-white/60 hover:text-white transition-colors"
                    data-testid="menu-social-email"
                  >
                    <Mail className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/innovatr1?igsh=d2V3eGM5eDZ5anhh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors"
                    data-testid="menu-social-instagram"
                  >
                    <SiInstagram className="w-6 h-6" />
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