import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowDown, Target, Lightbulb, Trophy, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const pillars = [
  {
    id: "where-to-focus",
    number: "01",
    title: "Where to focus",
    tagline: "Understand the market before you place your bets.",
    description: "We help you identify where growth genuinely exists — grounded in people, behaviour & category dynamics — so you're solving the right problem before moving forward.",
    icon: Target,
    color: "#4D5FF1",
    bullets: [
      "Trends & foresight analysis",
      "Need states & jobs-to-be-done",
      "Audience segmentation & prioritisation",
      "Category & competitive audits",
      "Business & brand health diagnostics",
      "Customer & shopper journey mapping",
      "Opportunity sizing & white-space identification"
    ]
  },
  {
    id: "how-to-play",
    number: "02",
    title: "How to play",
    tagline: "Turn opportunity spaces into ideas worth backing.",
    description: "Once the focus is clear, we design & develop routes to market — shaping ideas, propositions & experiences that are strategically sound & creatively strong.",
    icon: Lightbulb,
    color: "#ED876E",
    bullets: [
      "Ideation & innovation workshops",
      "Design sprints & rapid concept development",
      "Idea & proposition generation",
      "Early-stage concept framing & positioning",
      "Creative territories & platform development",
      "Exploration of formats, features & experiences"
    ]
  },
  {
    id: "how-to-win",
    number: "03",
    title: "How to win",
    tagline: "Choose the strongest route, optimise it & build the commercial case.",
    description: "This is where decisions get real. We help you compare options, make trade-offs visible & confidently commit to the ideas that will perform in market.",
    icon: Trophy,
    color: "#10B981",
    bullets: [
      "Idea & concept screening",
      "Concept optimisation & refinement",
      "Portfolio management & prioritisation",
      "Volumetric forecasting & scenario modelling",
      "Cannibalisation & source-of-volume analysis",
      "Price-pack architecture",
      "Packaging, branding & end-to-end design support"
    ]
  },
  {
    id: "whats-working",
    number: "04",
    title: "What's working",
    tagline: "Track what's changing so you can keep winning after launch.",
    description: "Markets don't stand still. We help you monitor performance, understand shifts & adapt intelligently — turning learning into ongoing advantage.",
    icon: TrendingUp,
    color: "#8B5CF6",
    bullets: [
      "Innovation tracking",
      "Promotion & activation tracking",
      "Brand & category health tracking",
      "Competitive monitoring",
      "Post-launch optimisation & learning loops",
      "Performance diagnostics over time"
    ]
  }
];

const clientLogos = [
  "Nando's",
  "Revlon",
  "Greenway Farms",
  "DGB",
  "Rugani Juice",
  "Mitchum"
];

const filterTags = [
  "Corporate Innovation",
  "Corporate Ventures",
  "Startup Studio & Investments"
];

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ConsultPage() {
  const [, setLocation] = useLocation();
  const [activePillar, setActivePillar] = useState(0);
  const lifecycleRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle hash navigation for direct links to sections
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: lifecycleRef,
    offset: ["start start", "end end"]
  });

  const pillarProgress = useTransform(scrollYProgress, [0, 1], [0, 3]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    return pillarProgress.on("change", (latest) => {
      const index = Math.min(Math.floor(latest), 3);
      setActivePillar(index);
    });
  }, [pillarProgress]);

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4D5FF1]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6]/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[#4D5FF1] mb-6 font-medium">
              Consult
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-8 leading-tight">
              Decision-grade insight for{" "}
              <span className="bg-gradient-to-r from-[#4D5FF1] to-[#8B5CF6] bg-clip-text text-transparent">
                complex growth challenges
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-4">
              We partner with ambitious teams to shape direction, create opportunities, 
              optimise routes to market & track what's changing.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-12">
              Built for phased programmes, high-stakes choices & senior stakeholders who need clarity, not noise.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={scrollToResults}
                className="bg-transparent border border-[#4D5FF1]/50 hover:bg-[#4D5FF1]/10 text-white px-8 group"
                data-testid="button-explore-lifecycle"
              >
                Explore the lifecycle
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => {
                  const contactSection = document.getElementById("consult-contact");
                  contactSection?.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="button-book-call"
              >
                Book a consult call
              </Button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* TRACK RECORD Section */}
      <section className="py-32 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-12">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white uppercase tracking-tight text-center">
              Track Record
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1} className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-2xl sm:text-3xl text-white font-medium mb-6">
              700+ projects delivered.<br />
              50+ startups created.<br />
              Numerous innovations built, launched & scaled.
            </p>
            <p className="text-lg text-gray-400">
              We work with global organisations, fast-growing brands & ambitious teams to solve complex decisions — across categories, markets & stages of growth.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.15} className="flex flex-wrap justify-center gap-3 mb-16">
            {filterTags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
              {clientLogos.map((logo, index) => (
                <div 
                  key={index}
                  className="text-gray-500 text-lg font-medium tracking-wide opacity-60 hover:opacity-100 transition-opacity"
                >
                  {logo}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* RESULTS Section - Title + Subheading */}
      <section ref={resultsRef} className="pt-32 pb-16 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white uppercase tracking-tight mb-10">
              Results
            </h2>
          </ScrollReveal>
          
          <ScrollReveal delay={0.15}>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto" style={{ opacity: 0.9 }}>
              Four phases that connect, overlap, and adapt. Designed to work together or independently.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* The Lifecycle - Pillar Section (directly under RESULTS) */}
      <section 
        ref={lifecycleRef} 
        className="relative min-h-[500vh]"
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
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">
                      Phase {pillars[activePillar].number}
                    </p>
                    <h2 
                      className="text-4xl sm:text-5xl font-serif font-bold mb-4 uppercase"
                      style={{ color: pillars[activePillar].color }}
                    >
                      {pillars[activePillar].title}
                    </h2>
                    <p className="text-xl text-gray-300 mb-4">
                      {pillars[activePillar].tagline}
                    </p>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      {pillars[activePillar].description}
                    </p>
                    
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-4">Includes:</p>
                      <ul className="space-y-2">
                        {pillars[activePillar].bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                            <div 
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: pillars[activePillar].color }}
                            />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
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
                  
                  <div className="hidden lg:flex justify-center items-center">
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
        
        {/* Scroll anchors for each pillar */}
        {pillars.map((pillar, index) => (
          <div 
            key={pillar.id} 
            id={`pillar-${pillar.id}`}
            className="min-h-[125vh]"
            style={{ marginTop: index === 0 ? "-100vh" : 0 }}
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
                        <p className="text-sm text-gray-500 mb-1">Phase {pillar.number}</p>
                        <h3 
                          className="text-2xl font-serif font-bold mb-2 uppercase"
                          style={{ color: pillar.color }}
                        >
                          {pillar.title}
                        </h3>
                        <p className="text-gray-300 mb-2">{pillar.tagline}</p>
                        <p className="text-gray-500 text-sm mb-4">{pillar.description}</p>
                        <Link href={`/consult/${pillar.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/5 p-0"
                          >
                            Explore {pillar.title}
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

      {/* Final CTA Section */}
      <section id="consult-contact" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6">
              Facing a complex decision?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="text-xl text-gray-400 mb-10">
              If the stakes are high & you want a thought partner, let's talk.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white px-8"
                onClick={() => setLocation("/#contact")}
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
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
