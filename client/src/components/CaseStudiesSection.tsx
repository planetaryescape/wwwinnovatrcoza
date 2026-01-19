import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Lightbulb, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import cookingGif from "@assets/RafaelVarona_Playbook_Cooking_Animation_1768339161246.gif";
import airplanesGif from "@assets/rafael-varona-airplanes_1768339161246.gif";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";

type Phase = "strategy" | "innovation" | "execution";

interface CaseStudy {
  id: string;
  headline: string;
  client: string;
  industry: string;
  problemShort: string;
  problem: string;
  process: string;
  results: string;
  phases: Phase[];
  duration: string;
  highlight: string;
  gif: string;
  bgColor: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "dgb",
    headline: "Transforming a Business for Growth with a Disruptive 3-Year Pipeline",
    client: "DGB",
    industry: "Alcohol",
    problemShort: "Portfolio lacked clear direction across demand spaces, limiting growth potential against modern competitors.",
    problem: "Portfolio lacked clear direction across demand spaces, limiting growth potential. Traditional wines significantly underperformed against modern RTD competitors with limited understanding of consumer needs.",
    process: "Comprehensive 3-phase Demand Space Mapping methodology analyzing Connecting, Relaxing, and Socializing demand spaces. Applied Jobs-to-be-Done framework to identify Total Addressable Problems and validate consumer needs.",
    results: "7 distinct innovation projects approved for the development pipeline. Robust 18-36 month innovation planning secured. Client requested Innovatr to lead end-to-end NPD execution.",
    phases: ["strategy", "innovation"],
    duration: "70 Days",
    highlight: "7 Pipeline Projects",
    gif: cookingGif,
    bgColor: "#FFE8D8"
  },
  {
    id: "namibian-breweries",
    headline: "Launching & Landing the Non-Alcoholic Category in Namibia",
    client: "Namibian Breweries",
    industry: "Beverages",
    problemShort: "Emerging category with undefined positioning and consumer ambiguity in a crowded market.",
    problem: "Emerging category with undefined positioning territories and consumer ambiguity. Need for differentiated messaging and clear visual identity in a crowded market.",
    process: "Rapid 27-day sprint developing positioning territories, category manifesto, and Visual Identity. Consumer validation with 200+ respondents followed by TTL creative rollout.",
    results: "Full launch campaign executed with complete Through-The-Line creative toolkit. Established regional benchmark for cross-brand portfolio launches.",
    phases: ["strategy", "execution"],
    duration: "27 Days",
    highlight: "Regional Benchmark",
    gif: airplanesGif,
    bgColor: "#E8F0FF"
  },
  {
    id: "rain",
    headline: "Defining Winning Market Entry Strategy Through Consumer Intelligence",
    client: "Rain",
    industry: "Telecommunications",
    problemShort: "Market dominated by established players with high barriers to entry and unclear value proposition.",
    problem: "Market dominated by established players with high barriers to entry. Undefined category positioning and unclear value proposition within new market territory.",
    process: "Comprehensive four-phase quantitative research methodology with extensive consumer analysis. Explored category opportunities using proprietary frameworks and developed strategic positioning.",
    results: "Clear pathway identified to capture substantial market position. Strategic category positioning validated through comprehensive consumer research with innovation development guidance.",
    phases: ["strategy"],
    duration: "3 Months",
    highlight: "Market Entry Roadmap",
    gif: penGif,
    bgColor: "#FFE4D8"
  },
  {
    id: "discovery",
    headline: "Unlocking Dormant Customer Value Through Engagement Research",
    client: "Discovery Bank",
    industry: "Financial Services",
    problemShort: "Significant portion of inactive accounts with customers using bank for limited needs only.",
    problem: "Significant portion of inactive accounts with many customers using bank for limited needs only. Multi-banking behavior persists with barriers including perceived fee structures and security concerns.",
    process: "Proprietary engagement measurement using Interest-Commitment scoring. Deep segmentation into Highly Engaged, Low Engaged, and Disengaged audiences with concept testing for activation strategies.",
    results: "Strong emotional brand leadership confirmed vs competitors. High-potential product concepts validated as activation drivers with clear strategic roadmap delivered.",
    phases: ["strategy"],
    duration: "Comprehensive",
    highlight: "Emotional Leadership",
    gif: cookingGif,
    bgColor: "#E8FFE8"
  }
];

const phases = [
  {
    id: "strategy" as Phase,
    label: "Strategy & Direction",
    icon: Target,
    color: "#5A5EFF",
    description: "Define where to play and identify growth opportunities"
  },
  {
    id: "innovation" as Phase,
    label: "Innovation & Testing",
    icon: Lightbulb,
    color: "#ED876E",
    description: "Develop and validate winning concepts"
  },
  {
    id: "execution" as Phase,
    label: "Execution & Scale",
    icon: Rocket,
    color: "#10B981",
    description: "Launch and grow with confidence"
  }
];

export default function CaseStudiesSection() {
  const [activePhase, setActivePhase] = useState<Phase>("strategy");
  
  const filteredCaseStudies = caseStudies.filter(cs => cs.phases.includes(activePhase));
  const activePhaseData = phases.find(p => p.id === activePhase);

  return (
    <section id="case-studies" className="py-24 sm:py-32 bg-[#C5E1A5]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="mb-4" style={{ transform: "rotate(-3deg)" }}>
            <TrendingUp className="w-10 h-10 mx-auto text-slate-700/70 stroke-[1.5]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
          </div>
          <p 
            className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-600/70"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Results
          </p>
          <h2 
            className="text-slate-800 mb-6"
            style={{ 
              fontFamily: "'DM Serif Display', serif", 
              letterSpacing: "0.04em",
              fontSize: "clamp(2rem, 5vw, 3.5rem)"
            }}
            data-cursor-invert
          >
            Growth is our Currency. See how we transformed some of the world's most ambitious brands.
          </h2>
        </div>
        
        {/* Phase Toggle Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {phases.map((phase) => {
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`
                  px-5 py-3 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-slate-700 hover:bg-white/80'
                  }
                `}
                style={{ 
                  backgroundColor: isActive ? phase.color : undefined,
                  fontFamily: "Roboto, sans-serif"
                }}
                data-testid={`toggle-phase-${phase.id}`}
              >
                <span className="text-sm font-medium">{phase.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Phase Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activePhase}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="text-center text-slate-600 mb-12 max-w-xl mx-auto"
            style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
          >
            {activePhaseData?.description}
          </motion.p>
        </AnimatePresence>

        {/* Case Studies Grid - GIF Left, Teaser Right */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-16 lg:space-y-24"
          >
            {filteredCaseStudies.map((caseStudy, index) => (
              <motion.div 
                key={caseStudy.id}
                className={`grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                data-testid={`case-study-card-${caseStudy.id}`}
              >
                {/* GIF Image - Left on desktop (alternates) */}
                <div 
                  className={`relative overflow-hidden rounded-lg lg:col-span-2 shadow-2xl shadow-black/30 ring-1 ring-white/10 ${
                    index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                  }`}
                  style={{ backgroundColor: caseStudy.bgColor, height: "320px" }}
                >
                  <img 
                    src={caseStudy.gif}
                    alt={`${caseStudy.client} case study illustration`}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Teaser Card - Right on desktop */}
                <div className={`py-4 lg:col-span-3 ${
                  index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                }`}>
                  {/* Client & Industry */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span 
                      className="text-xs uppercase tracking-[0.25em] text-slate-600/80"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      {caseStudy.client}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: activePhaseData?.color }}
                    >
                      {caseStudy.industry}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                      {caseStudy.duration}
                    </span>
                  </div>
                  
                  {/* Headline */}
                  <h3 
                    className="font-serif text-slate-800 mb-4 leading-[1.1]"
                    style={{ 
                      fontFamily: "'DM Serif Display', serif",
                      fontStyle: "italic",
                      fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
                    }}
                  >
                    {caseStudy.headline}
                  </h3>
                  
                  {/* Short Problem Summary */}
                  <p 
                    className="text-slate-700 leading-relaxed mb-6"
                    style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
                  >
                    {caseStudy.problemShort}
                  </p>
                  
                  {/* Key Result Badge */}
                  <div 
                    className="inline-block px-4 py-2 rounded-lg mb-6"
                    style={{ backgroundColor: `${activePhaseData?.color}15` }}
                  >
                    <span className="text-xs text-slate-500 mr-2">Key Result:</span>
                    <span 
                      className="font-bold"
                      style={{ color: activePhaseData?.color }}
                    >
                      {caseStudy.highlight}
                    </span>
                  </div>
                  
                  {/* Read More Link */}
                  <div className="flex items-center gap-4">
                    <Link href={`/case-study/${caseStudy.id}`}>
                      <span 
                        className="inline-flex items-center gap-2 text-slate-700 font-medium underline underline-offset-4 hover:text-slate-900 cursor-pointer transition-colors"
                        data-testid={`link-read-more-${caseStudy.id}`}
                      >
                        Read Full Case Study
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* See More CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-slate-600 mb-6" style={{ fontFamily: "Roboto, sans-serif" }}>
            Want to see how we can help your brand grow?
          </p>
          <Link href="/#contact">
            <Button 
              size="lg"
              className="bg-slate-800 hover:bg-slate-900 text-white gap-2"
              data-testid="button-see-more-contact"
            >
              See More
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
