import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Lightbulb, Rocket, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import caseStudiesPdf from "@assets/innovatr_case_studies_20260119131201_1768828402299.pdf";

type Phase = "strategy" | "innovation" | "execution";

interface CaseStudy {
  id: string;
  headline: string;
  client: string;
  industry: string;
  problem: string;
  process: string;
  results: string;
  phases: Phase[];
  duration: string;
  highlight: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "dgb",
    headline: "Transforming a Business for Growth with a Disruptive 3-Year Pipeline",
    client: "DGB",
    industry: "Alcohol",
    problem: "Portfolio lacked clear direction across demand spaces, limiting growth potential. Traditional wines significantly underperformed against modern RTD competitors with limited understanding of consumer needs.",
    process: "Comprehensive 3-phase Demand Space Mapping methodology analyzing Connecting, Relaxing, and Socializing demand spaces. Applied Jobs-to-be-Done framework to identify Total Addressable Problems and validate consumer needs.",
    results: "7 distinct innovation projects approved for the development pipeline. Robust 18-36 month innovation planning secured. Client requested Innovatr to lead end-to-end NPD execution.",
    phases: ["strategy", "innovation"],
    duration: "70 Days",
    highlight: "7 Pipeline Projects"
  },
  {
    id: "namibian-breweries",
    headline: "Launching & Landing the Non-Alcoholic Category in Namibia",
    client: "Namibian Breweries",
    industry: "Beverages",
    problem: "Emerging category with undefined positioning territories and consumer ambiguity. Need for differentiated messaging and clear visual identity in a crowded market.",
    process: "Rapid 27-day sprint developing positioning territories, category manifesto, and Visual Identity. Consumer validation with 200+ respondents followed by TTL creative rollout.",
    results: "Full launch campaign executed with complete Through-The-Line creative toolkit. Established regional benchmark for cross-brand portfolio launches.",
    phases: ["strategy", "execution"],
    duration: "27 Days",
    highlight: "Regional Benchmark"
  },
  {
    id: "rain",
    headline: "Defining Winning Market Entry Strategy Through Consumer Intelligence",
    client: "Rain",
    industry: "Telecommunications",
    problem: "Market dominated by established players with high barriers to entry. Undefined category positioning and unclear value proposition within new market territory.",
    process: "Comprehensive four-phase quantitative research methodology with extensive consumer analysis. Explored category opportunities using proprietary frameworks and developed strategic positioning.",
    results: "Clear pathway identified to capture substantial market position. Strategic category positioning validated through comprehensive consumer research with innovation development guidance.",
    phases: ["strategy"],
    duration: "3 Months",
    highlight: "Market Entry Roadmap"
  },
  {
    id: "discovery",
    headline: "Unlocking Dormant Customer Value Through Engagement Research",
    client: "Discovery Bank",
    industry: "Financial Services",
    problem: "Significant portion of inactive accounts with many customers using bank for limited needs only. Multi-banking behavior persists with barriers including perceived fee structures and security concerns.",
    process: "Proprietary engagement measurement using Interest-Commitment scoring. Deep segmentation into Highly Engaged, Low Engaged, and Disengaged audiences with concept testing for activation strategies.",
    results: "Strong emotional brand leadership confirmed vs competitors. High-potential product concepts validated as activation drivers with clear strategic roadmap delivered.",
    phases: ["strategy"],
    duration: "Comprehensive",
    highlight: "Emotional Leadership"
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
            const Icon = phase.icon;
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300
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
                <Icon className="w-4 h-4" />
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

        {/* Case Studies Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 lg:gap-10"
          >
            {filteredCaseStudies.map((caseStudy, index) => (
              <Card 
                key={caseStudy.id}
                className="overflow-hidden border-0 shadow-xl bg-white/95"
                data-testid={`case-study-card-${caseStudy.id}`}
              >
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: activePhaseData?.color }}
                        >
                          {caseStudy.industry}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          {caseStudy.duration}
                        </span>
                        {caseStudy.phases.length > 1 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Multi-Phase
                          </span>
                        )}
                      </div>
                      <p 
                        className="text-xs uppercase tracking-[0.2em] text-slate-500"
                        style={{ fontFamily: "Roboto, sans-serif" }}
                      >
                        {caseStudy.client}
                      </p>
                    </div>
                    <div 
                      className="px-4 py-2 rounded-lg text-center"
                      style={{ backgroundColor: `${activePhaseData?.color}15` }}
                    >
                      <p className="text-xs text-slate-500 mb-1">Key Result</p>
                      <p 
                        className="font-bold text-lg"
                        style={{ color: activePhaseData?.color }}
                      >
                        {caseStudy.highlight}
                      </p>
                    </div>
                  </div>
                  
                  {/* Headline */}
                  <h3 
                    className="text-slate-800 mb-6 leading-tight"
                    style={{ 
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "clamp(1.5rem, 3vw, 2rem)"
                    }}
                  >
                    {caseStudy.headline}
                  </h3>
                  
                  {/* Three Column Layout */}
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Problem */}
                    <div>
                      <h4 
                        className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2"
                        style={{ fontFamily: "Roboto, sans-serif" }}
                      >
                        <span className="w-6 h-px bg-slate-300"></span>
                        Problem
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {caseStudy.problem}
                      </p>
                    </div>
                    
                    {/* Process */}
                    <div>
                      <h4 
                        className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2"
                        style={{ fontFamily: "Roboto, sans-serif" }}
                      >
                        <span className="w-6 h-px bg-slate-300"></span>
                        Process
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {caseStudy.process}
                      </p>
                    </div>
                    
                    {/* Results */}
                    <div>
                      <h4 
                        className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-2"
                        style={{ fontFamily: "Roboto, sans-serif" }}
                      >
                        <span className="w-6 h-px bg-slate-300"></span>
                        Results
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {caseStudy.results}
                      </p>
                    </div>
                  </div>
                  
                  {/* Phase Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 mr-2">Phases:</span>
                    {caseStudy.phases.map(phaseId => {
                      const phaseInfo = phases.find(p => p.id === phaseId);
                      return (
                        <span 
                          key={phaseId}
                          className="px-2 py-1 rounded text-xs font-medium text-white/90"
                          style={{ backgroundColor: phaseInfo?.color }}
                        >
                          {phaseInfo?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Download Full Case Studies */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-slate-600 mb-6" style={{ fontFamily: "Roboto, sans-serif" }}>
            Want the full story? Download our complete case studies portfolio.
          </p>
          <a 
            href={caseStudiesPdf}
            download="Innovatr_Case_Studies_Portfolio.pdf"
            className="inline-block"
          >
            <Button 
              size="lg"
              className="bg-slate-800 hover:bg-slate-900 text-white gap-2"
              data-testid="button-download-case-studies"
            >
              <Download className="w-4 h-4" />
              Download Case Studies PDF
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
