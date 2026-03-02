import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Target, Lightbulb, Rocket, Clock, Award, TrendingUp } from "lucide-react";
import cookingGif from "@assets/RafaelVarona_Playbook_Cooking_Animation_1768339161246.gif";
import airplanesGif from "@assets/rafael-varona-airplanes_1768339161246.gif";
import penGif from "@assets/RafaelVarona_Playbook_Pen_1768339161246.gif";

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
}

const phases = [
  { id: "strategy", label: "Strategy & Direction", icon: Target, color: "#5A5EFF" },
  { id: "innovation", label: "Innovation & Testing", icon: Lightbulb, color: "#ED876E" },
  { id: "execution", label: "Execution & Scale", icon: Rocket, color: "#10B981" },
];

export default function CaseStudyDetail() {
  const params = useParams<{ id: string }>();
  const slug = params.id;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: caseStudy, isLoading, isError } = useQuery<CaseStudy>({
    queryKey: ["/api/case-studies", slug],
    queryFn: async () => {
      const res = await fetch(`/api/case-studies/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#C5E1A5] to-[#A8D58C] pt-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !caseStudy) {
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
  const gifSrc = gifMap[caseStudy.gifAsset] ?? gifMap.default;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C5E1A5] to-[#A8D58C]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#C5E1A5]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a
            href="/consult#case-studies"
            onClick={e => {
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
                src={gifSrc}
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
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
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
                    <p className="text-2xl font-bold" style={{ color: primaryPhase?.color }}>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#EF444420" }}>
                      <TrendingUp className="w-5 h-5 text-red-500" style={{ transform: "rotate(180deg)" }} />
                    </div>
                    <h2
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Problem
                    </h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F59E0B20" }}>
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <h2
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Process
                    </h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}>
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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#10B98120" }}>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h2
                      className="text-xl font-bold text-slate-800 uppercase tracking-wider"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
                      The Results
                    </h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed" style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}>
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
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
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

      <div className="h-16" />
    </div>
  );
}
