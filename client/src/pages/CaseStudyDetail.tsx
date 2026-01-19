import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Target, Lightbulb, Rocket, Clock, Award, TrendingUp } from "lucide-react";
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
  { id: "strategy" as Phase, label: "Strategy & Direction", icon: Target, color: "#5A5EFF" },
  { id: "innovation" as Phase, label: "Innovation & Testing", icon: Lightbulb, color: "#ED876E" },
  { id: "execution" as Phase, label: "Execution & Scale", icon: Rocket, color: "#10B981" }
];

export default function CaseStudyDetail() {
  const params = useParams<{ id: string }>();
  const caseStudy = caseStudies.find(cs => cs.id === params.id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!caseStudy) {
    return (
      <div className="min-h-screen bg-[#C5E1A5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-slate-800 mb-4">Case Study Not Found</h1>
          <Link href="/consult">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Consult
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryPhase = phases.find(p => p.id === caseStudy.phases[0]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5E1A5] to-[#A8D58C]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#C5E1A5]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a 
            href="/consult#case-studies"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/consult#case-studies";
            }}
          >
            <Button variant="ghost" className="gap-2 text-slate-700 hover:text-slate-900" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
          </a>
          <Link href="/">
            <span 
              className="text-xl font-serif font-bold text-slate-800 tracking-wide cursor-pointer"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Innovatr
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - GIF */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative aspect-square overflow-hidden rounded-2xl shadow-2xl shadow-black/20"
              style={{ backgroundColor: caseStudy.bgColor }}
            >
              <img 
                src={caseStudy.gif}
                alt={`${caseStudy.client} case study`}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Right - Header Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="pt-4"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span 
                  className="px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: primaryPhase?.color }}
                >
                  {caseStudy.industry}
                </span>
                <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/80 text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {caseStudy.duration}
                </span>
              </div>

              {/* Client Name */}
              <p 
                className="text-sm uppercase tracking-[0.3em] text-slate-600 mb-4"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                {caseStudy.client}
              </p>

              {/* Headline */}
              <h1 
                className="text-slate-800 mb-6 leading-tight"
                style={{ 
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)"
                }}
              >
                {caseStudy.headline}
              </h1>

              {/* Phase Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {caseStudy.phases.map(phaseId => {
                  const phaseInfo = phases.find(p => p.id === phaseId);
                  const Icon = phaseInfo?.icon || Target;
                  return (
                    <span 
                      key={phaseId}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                      style={{ backgroundColor: phaseInfo?.color }}
                    >
                      <Icon className="w-4 h-4" />
                      {phaseInfo?.label}
                    </span>
                  );
                })}
              </div>

              {/* Key Result Highlight */}
              <Card className="border-0 bg-white/90 shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryPhase?.color}20` }}
                  >
                    <Award className="w-6 h-6" style={{ color: primaryPhase?.color }} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Key Result</p>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: primaryPhase?.color }}
                    >
                      {caseStudy.highlight}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12">
            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 bg-white/95 shadow-xl overflow-hidden">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#EF444420" }}
                    >
                      <TrendingUp className="w-5 h-5 text-red-500" style={{ transform: "rotate(180deg)" }} />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Problem
                    </h2>
                  </div>
                  <p 
                    className="text-slate-700 leading-relaxed"
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
                  >
                    {caseStudy.problem}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* The Process */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-0 bg-white/95 shadow-xl overflow-hidden">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#F59E0B20" }}
                    >
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Process
                    </h2>
                  </div>
                  <p 
                    className="text-slate-700 leading-relaxed"
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
                  >
                    {caseStudy.process}
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* The Results */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 bg-white/95 shadow-xl overflow-hidden">
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "#10B98120" }}
                    >
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h2 
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Results
                    </h2>
                  </div>
                  <p 
                    className="text-slate-700 leading-relaxed"
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
                  >
                    {caseStudy.results}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-0 bg-slate-800 shadow-2xl overflow-hidden">
              <div className="p-8 lg:p-12 text-center">
                <h3 
                  className="text-white mb-4"
                  style={{ 
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)"
                  }}
                >
                  Want results like these?
                </h3>
                <p className="text-white/70 mb-8 max-w-lg mx-auto">
                  Get in touch to discuss how we can help transform your business.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/consult#contact">
                    <Button size="lg" className="gap-2 bg-[#C5E1A5] text-slate-800 hover:bg-[#A8D58C]">
                      Start Your Project
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="h-16" />
    </div>
  );
}
