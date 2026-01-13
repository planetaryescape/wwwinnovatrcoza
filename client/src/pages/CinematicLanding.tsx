import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu, ArrowRight, Target, Lightbulb, Trophy, TrendingUp, Mail } from "lucide-react";
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
import consultBackgroundGif from "@assets/test_1768331395403.gif";
import cookingGif from "@assets/RafaelVarona_Playbook_Cooking_Animation_1768339161246.gif";
import airplanesGif from "@assets/rafael-varona-airplanes_1768339161246.gif";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";

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
  { text: "...you think our work is pretty cool..", delay: 0.3 },
  { text: "...or you're ready to chat.", delay: 0.45 },
];

function HumorSection() {
  return (
    <section 
      className="relative py-24 sm:py-32 bg-gradient-to-b from-[#0D1598] via-[#0A1290] to-[#080E80]"
      data-testid="section-humor"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pr-16 text-center">
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 text-[#fafafa]">
          <p
            style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
            className="font-light tracking-wide text-white/90"
            data-testid="humor-line-1"
          >
            {humorLines[0].text}
          </p>
          
          <p
            style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
            className="text-white/90 font-light tracking-wide"
            data-testid="humor-line-2"
          >
            {humorLines[1].text}
          </p>
          
          <p
            style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
            className="font-light tracking-wide text-white/90"
            data-testid="humor-line-3"
          >
            {humorLines[2].text}
          </p>
          
          <p
            style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
            className="text-white font-light tracking-wide"
            data-testid="humor-line-4"
          >
            {humorLines[3].text}
          </p>
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
  const [gifLoaded, setGifLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const userInteracted = useRef(false);

  const handleGifLoad = useCallback(() => {
    setGifLoaded(true);
  }, []);

  // Scroll-based dive animation for hero section
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
    layoutEffect: false
  });

  // Fish zoom: starts at 1x and zooms to 2.5x as you scroll
  const fishScale = useTransform(heroScrollProgress, [0, 0.8], [1, 2.5]);
  // Fish moves toward center as it zooms
  const fishX = useTransform(heroScrollProgress, [0, 0.8], ["0%", "-25%"]);
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

  const navItems = [
    { label: "The Problem", action: () => scrollToSection("problem-solution") },
    { label: "The Process", action: () => scrollToSection("why-consult") },
    { label: "The Results", action: () => scrollToSection("case-studies") },
    { label: "Contact Us", action: () => scrollToSection("consult-contact") },
  ];

  const menuItems = [
    { label: "The Problem", action: () => scrollToSection("problem-solution") },
    { label: "The Process", action: () => scrollToSection("why-consult") },
    { label: "The Results", action: () => scrollToSection("case-studies") },
    { label: "Contact Us", action: () => scrollToSection("consult-contact") },
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
          <Link href="/home">
            <span 
              className="text-2xl font-serif font-bold text-white cursor-pointer hover:text-white/80 transition-colors"
              data-testid="link-logo-landing"
            >
              Innovatr
            </span>
          </Link>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-white/80 hover:text-white transition-colors text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            data-testid="button-menu-open"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span>Menu</span>
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
      {/* Hero Section with Dive Animation */}
      <section 
        ref={heroSectionRef}
        className="relative h-[200vh]"
      >
        {/* Sticky hero container */}
        <motion.div 
          ref={heroRef}
          className="sticky top-0 h-screen overflow-hidden"
          style={{ opacity: heroOpacity }}
        >
          {/* Fish GIF Background - positioned right with zoom animation */}
          <div className="absolute inset-0 bg-[#5A5EFF]">
            {!gifLoaded && (
              <div className="absolute inset-0 bg-[#5A5EFF] animate-pulse" />
            )}
            <motion.img
              src={consultBackgroundGif}
              alt="Animated underwater fish illustration"
              className={`absolute -right-8 lg:-right-12 top-1/2 h-[85%] w-auto max-w-[65%] object-contain transition-opacity duration-700 origin-center ${gifLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                scale: fishScale, 
                x: fishX,
                y: "-50%"
              }}
              onLoad={handleGifLoad}
              data-testid="img-consult-background"
            />
          </div>

          {/* Hero Content - Two Column Layout: Text Left, Fish Right */}
          <motion.div 
            className="relative z-10 h-screen flex items-center px-6 sm:px-10 lg:px-16 bg-[#4444ff]"
            style={{ opacity: textOpacity }}
          >
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-left"
              >
                <h1 
                  className="font-serif font-bold text-white leading-[0.95] uppercase drop-shadow-lg"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif", 
                    letterSpacing: "0.06em",
                    fontSize: "clamp(3rem, 8vw, 9rem)",
                    textShadow: "0 4px 30px rgba(0,0,0,0.3)"
                  }}
                  data-testid="text-headline"
                  data-cursor-invert
                >
                  WE BUILD<br />
                  WHAT'S<br />
                  MISSING
                </h1>
                <p 
                  className="mt-8 font-sans text-white/95 drop-shadow-md max-w-md"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}
                >
                  Launch Better Innovation through in-house data, design & testing.
                </p>
              </motion.div>
              
              {/* Right: Empty space where fish shows through background */}
              <div className="hidden lg:block" />
            </div>
          </motion.div>

          {/* Animated Bubbles Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-end gap-2"
            style={{ opacity: textOpacity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="rounded-full bg-white/30 border border-white/40"
                style={{
                  width: i === 1 ? 12 : 8,
                  height: i === 1 ? 12 : 8,
                }}
                animate={{
                  y: [0, -20, -40, -20, 0],
                  opacity: [0.3, 0.6, 0.8, 0.6, 0.3],
                  scale: [1, 1.1, 1.2, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>
      {/* Problem / Solution Cinematic Section */}
      <ProblemSolutionSection />
      {/* What We Do Section */}
      <section id="why-consult" className="py-24 sm:py-32 bg-gradient-to-b from-[#3D4DE8] via-[#2D3DD8] to-[#1D2DC8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-20 sm:mb-24">
            <h2 
              className="font-serif font-bold text-white mb-6"
              style={{ 
                fontFamily: "'DM Serif Display', serif", 
                letterSpacing: "0.06em",
                fontSize: "clamp(2.5rem, 7vw, 6rem)"
              }}
              data-cursor-invert
              data-testid="text-what-we-do-heading"
            >
              THE PROCESS
            </h2>
            <p 
              className="mb-4 text-white/90"
              style={{ fontSize: "clamp(1.125rem, 2vw, 1.25rem)" }}
            >
              Many paths. One goal: systematic innovation.
            </p>
            <p 
              className="max-w-2xl text-white/90 leading-relaxed"
              style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
            >
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
                <h3 
                  className="font-bold text-white mb-6 leading-tight whitespace-pre-line"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {card.title}
                </h3>
                <p 
                  className="leading-relaxed mb-6 text-white/95"
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
      {/* Content Sections */}
      <div ref={contentRef}>
        {/* Case Studies Section - Alternating Layout */}
        <section id="case-studies" className="py-24 sm:py-32 bg-gradient-to-b from-[#1D2DC8] via-[#1520B0] to-[#0D1598]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 lg:pr-20">
            {/* Section Header */}
            <div className="mb-20 sm:mb-28">
              <h2 
                className="font-serif font-bold text-white"
                style={{ 
                  fontFamily: "'DM Serif Display', serif", 
                  letterSpacing: "0.06em",
                  fontSize: "clamp(2.5rem, 7vw, 6rem)"
                }}
                data-cursor-invert
              >
                THE RESULTS
              </h2>
            </div>
            
            {/* Case Study 1 - Image Left, Text Right */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-32 sm:mb-44"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              data-testid="case-study-1"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#FFE8D8] lg:col-span-2">
                <img 
                  src={cookingGif}
                  alt="Animated cooking illustration"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="py-4 lg:col-span-3">
                <span 
                  className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 block"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Consumer Insights
                </span>
                <h3 
                  className="font-serif text-white mb-6 leading-[1.1]"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: "italic",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
                  }}
                >
                  How a Local Beverage Brand Discovered a R40M Untapped Market
                </h3>
                <p 
                  className="text-white/80 leading-relaxed mb-8"
                  style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
                >
                  Deep consumer research revealed hidden demand in peri-urban markets. Within 18 months, the brand expanded distribution to 200+ new outlets.
                </p>
                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>Featured in Business Day</span>
                  <span className="underline underline-offset-4 hover:text-white/80 cursor-pointer transition-colors">3 minute read</span>
                </div>
              </div>
            </motion.div>

            {/* Case Study 2 - Image Right, Text Left */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center mb-32 sm:mb-44"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              data-testid="case-study-2"
            >
              <div className="py-4 lg:col-span-3 order-2 lg:order-1">
                <span 
                  className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 block"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Innovation Strategy
                </span>
                <h3 
                  className="font-serif text-white mb-6 leading-[1.1]"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: "italic",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
                  }}
                >
                  From Concept to Shelf in 90 Days — A Retail Innovation Sprint
                </h3>
                <p 
                  className="text-white/80 leading-relaxed mb-8"
                  style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
                >
                  We partnered with a heritage food brand to fast-track product development. Test24 validated concepts in real-time, cutting launch risk by 60%.
                </p>
                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>Finalist, Retail Innovation Awards</span>
                  <span className="underline underline-offset-4 hover:text-white/80 cursor-pointer transition-colors">4 minute read</span>
                </div>
              </div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#E8F0FF] lg:col-span-2 order-1 lg:order-2">
                <img 
                  src={airplanesGif}
                  alt="Animated airplanes illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>

            {/* Case Study 3 - Image Left, Text Right */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              data-testid="case-study-3"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#FFE4D8] lg:col-span-2">
                <img 
                  src={penGif}
                  alt="Animated pen illustration"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="py-4 lg:col-span-3">
                <span 
                  className="text-xs uppercase tracking-[0.25em] text-white/60 mb-6 block"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                >
                  Performance Tracking
                </span>
                <h3 
                  className="font-serif text-white mb-6 leading-[1.1]"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif",
                    fontStyle: "italic",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
                  }}
                >
                  The Dashboard That Saved a Brand R8M in Wasted Media Spend
                </h3>
                <p 
                  className="text-white/80 leading-relaxed mb-8"
                  style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
                >
                  Real-time performance tracking identified underperforming channels early. The client pivoted mid-campaign, reallocating budget to high-ROI touchpoints.
                </p>
                <div className="flex items-center justify-between text-sm text-white/50">
                  <span>Case Study with Permission</span>
                  <span className="underline underline-offset-4 hover:text-white/80 cursor-pointer transition-colors">2 minute read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Humorous Scroll Reveal Section */}
        <HumorSection />

        {/* Final CTA Section - Interactive Ball */}
        <section id="consult-contact" className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-b from-[#0D1598] via-[#080E80] to-[#030868]">
          {/* Section Header */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm uppercase tracking-[0.3em] mb-8 text-[#ffffff]" data-testid="text-contact-subheading">
                Let's talk
              </p>
              
              <h2 
                className="font-serif font-semibold text-white mb-8 leading-tight"
                style={{ 
                  fontFamily: "'DM Serif Display', serif", 
                  letterSpacing: "0.06em",
                  fontSize: "clamp(2rem, 6vw, 5rem)"
                }}
                data-cursor-invert
                data-testid="text-contact-heading"
              >
                Ready when you are.
              </h2>
              
              <p 
                className="max-w-xl mx-auto leading-relaxed text-white/95" 
                style={{ fontSize: "clamp(1.125rem, 2vw, 1.25rem)" }}
                data-testid="text-contact-intro"
              >
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
              className="relative flex-shrink-0 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#080E80] rounded-full"
              aria-label="Send email to discuss your project"
              data-testid="button-email-ball"
            >
              <div 
                className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full bg-white -ml-[100px] sm:-ml-[80px] md:-ml-[60px] lg:-ml-[40px] transition-transform duration-500 group-hover:scale-105 flex items-center justify-center"
              >
                <span className="text-[#5A5EFF] text-lg sm:text-xl md:text-2xl font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-[80px] sm:pl-[60px] md:pl-[40px] lg:pl-[20px]">
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
                  className="font-light tracking-wide"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
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