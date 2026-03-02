import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Lightbulb, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import cookingGif from "@assets/RafaelVarona_Playbook_Cooking_Animation_1768339161246.gif";
import airplanesGif from "@assets/rafael-varona-airplanes_1768339161246.gif";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";

type Phase = "strategy" | "innovation" | "execution";

const gifMap: Record<string, string> = {
  cooking: cookingGif,
  airplanes: airplanesGif,
  pen: penGif,
  default: cookingGif,
};

interface CaseStudy {
  id: string;
  slug: string;
  headline: string;
  client: string;
  industry: string;
  problemShort: string;
  problem: string;
  process: string;
  results: string;
  phases: string[];
  duration: string;
  highlight: string;
  gifAsset: string;
  bgColor: string;
  isActive: boolean;
}

const phases = [
  {
    id: "strategy" as Phase,
    label: "Strategy & Direction",
    icon: Target,
    color: "#5A5EFF",
    description: "Define where to play and identify growth opportunities",
  },
  {
    id: "innovation" as Phase,
    label: "Innovation & Testing",
    icon: Lightbulb,
    color: "#ED876E",
    description: "Develop and validate winning concepts",
  },
  {
    id: "execution" as Phase,
    label: "Execution & Scale",
    icon: Rocket,
    color: "#10B981",
    description: "Launch and grow with confidence",
  },
];

export default function CaseStudiesSection() {
  const [activePhase, setActivePhase] = useState<Phase>("strategy");

  useEffect(() => {
    const handleSetPhase = (event: CustomEvent<Phase>) => {
      if (["strategy", "innovation", "execution"].includes(event.detail)) {
        setActivePhase(event.detail);
      }
    };
    window.addEventListener("setPhase", handleSetPhase as EventListener);
    return () => {
      window.removeEventListener("setPhase", handleSetPhase as EventListener);
    };
  }, []);

  const { data: allCaseStudies = [], isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies"],
  });

  const filteredCaseStudies = allCaseStudies
    .filter(cs => cs.isActive && cs.phases.includes(activePhase));

  const activePhaseData = phases.find(p => p.id === activePhase);

  return (
    <section id="case-studies" className="py-24 sm:py-32 bg-[#C5E1A5]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-4" style={{ transform: "rotate(-3deg)" }}>
            <TrendingUp
              className="w-10 h-10 mx-auto text-slate-700/70 stroke-[1.5]"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
            />
          </div>
          <p
            className="text-xs uppercase tracking-[0.35em] mb-6 text-slate-600/70"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            The Results
          </p>
          <h2
            className="text-slate-800 mb-4"
            style={{
              fontFamily: "'DM Serif Display', serif",
              letterSpacing: "0.04em",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
            }}
            data-cursor-invert
          >
            Growth is our Currency.
          </h2>
          <p
            className="text-slate-700 mb-6"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            }}
          >
            See how we transformed some of the world's most ambitious brands.
          </p>
        </motion.div>

        {/* Phase Toggle Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {phases.map(phase => {
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`
                  px-5 py-3 rounded-full transition-all duration-300
                  ${isActive ? "text-white shadow-lg scale-105" : "bg-white/60 text-slate-700 hover:bg-white/80"}
                `}
                style={{
                  backgroundColor: isActive ? phase.color : undefined,
                  fontFamily: "Roboto, sans-serif",
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

        {/* Case Studies Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-16 lg:space-y-24"
          >
            {isLoading ? (
              [1, 2].map(i => (
                <div key={i} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
                  <div className="lg:col-span-2" style={{ minHeight: "320px" }}>
                    <Skeleton className="w-full h-full rounded-lg min-h-[320px]" />
                  </div>
                  <div className="lg:col-span-3 py-6 space-y-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                  </div>
                </div>
              ))
            ) : filteredCaseStudies.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.1rem, 2vw, 1.4rem)" }}>
                  No case studies in this phase yet.
                </p>
              </div>
            ) : (
              filteredCaseStudies.map((caseStudy, index) => {
                const gifSrc = gifMap[caseStudy.gifAsset] ?? gifMap.default;
                return (
                  <motion.div
                    key={caseStudy.id}
                    className={`grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch ${
                      index % 2 === 1 ? "lg:flex-row-reverse" : ""
                    }`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: index * 0.1 }}
                    data-testid={`case-study-card-${caseStudy.slug}`}
                  >
                    {/* GIF Image */}
                    <div
                      className={`relative overflow-hidden rounded-lg lg:col-span-2 shadow-2xl shadow-black/30 ring-1 ring-white/10 h-full ${
                        index % 2 === 1 ? "lg:order-2" : "lg:order-1"
                      }`}
                      style={{ minHeight: "320px", backgroundColor: caseStudy.bgColor }}
                    >
                      <img
                        src={gifSrc}
                        alt={`${caseStudy.client} case study illustration`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Teaser Content */}
                    <div
                      className={`py-6 lg:py-4 lg:col-span-3 flex flex-col h-full ${
                        index % 2 === 1 ? "lg:order-1" : "lg:order-2"
                      }`}
                      style={{ minHeight: "320px" }}
                    >
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
                          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                        }}
                      >
                        {caseStudy.headline}
                      </h3>

                      {/* Short Problem Summary */}
                      <p
                        className="text-slate-700 leading-relaxed mb-6 flex-grow"
                        style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
                      >
                        {caseStudy.problemShort}
                      </p>

                      {/* Key Result Badge & Read More */}
                      <div className="mt-auto">
                        <div
                          className="inline-block px-4 py-2 rounded-lg mb-4"
                          style={{ backgroundColor: `${activePhaseData?.color}15` }}
                        >
                          <span className="text-xs text-slate-500 mr-2">Key Result:</span>
                          <span className="font-bold" style={{ color: activePhaseData?.color }}>
                            {caseStudy.highlight}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <Link href={`/case-study/${caseStudy.slug}`}>
                            <span
                              className="inline-flex items-center gap-2 text-slate-700 font-medium underline underline-offset-4 hover:text-slate-900 cursor-pointer transition-colors"
                              data-testid={`link-read-more-${caseStudy.slug}`}
                            >
                              Read Full Case Study
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
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
              className="bg-[#7CB342] hover:bg-[#689F38] text-white gap-2 border-0 shadow-lg"
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
