import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface ServiceGroup {
  title: string;
  items: { name: string; description?: string }[];
}

interface PillarData {
  id: string;
  title: string;
  purpose: string;
  color: string;
  bestFor: string[];
  serviceGroups: ServiceGroup[];
  process: string[];
  caseStudy: {
    client: string;
    challenge: string;
    approach: string;
    outcome: string;
  };
}

const pillarData: Record<string, PillarData> = {
  "where-to-focus": {
    id: "where-to-focus",
    title: "Where to focus",
    purpose: "Understand and anticipate the market before you commit investment.",
    color: "#4D5FF1",
    bestFor: [
      "You need clarity on growth opportunities and category direction",
      "You are entering a new category or segment",
      "You need sharper target definition",
      "You need an objective view of brand or category health"
    ],
    serviceGroups: [
      {
        title: "Market clarity",
        items: [
          { name: "Trends and foresight", description: "Identify emerging patterns and future market dynamics" },
          { name: "Category audits", description: "Comprehensive analysis of competitive landscape" },
          { name: "Business health", description: "Objective assessment of brand performance metrics" }
        ]
      },
      {
        title: "Consumer and context",
        items: [
          { name: "Need states", description: "Uncover unmet consumer needs and motivations" },
          { name: "Segmentation", description: "Define actionable consumer segments" },
          { name: "Journey mapping", description: "Map the complete consumer decision journey" }
        ]
      }
    ],
    process: [
      "Define decision",
      "Map category context",
      "Identify needs and segments",
      "Build opportunity map",
      "Prioritise focus areas"
    ],
    caseStudy: {
      client: "Leading National Retailer",
      challenge: "Needed clarity on where growth would come from in a changing category.",
      approach: "Category scan, need state mapping, segmentation and journey mapping.",
      outcome: "Clear opportunity map and a prioritised growth roadmap for the next planning cycle."
    }
  },
  "how-to-play": {
    id: "how-to-play",
    title: "How to play",
    purpose: "Create opportunity routes and turn them into concepts worth testing.",
    color: "#ED876E",
    bestFor: [
      "You have ambition but need routes and ideas",
      "You want better ideation and sharper concept direction",
      "You need a repeatable innovation pipeline"
    ],
    serviceGroups: [
      {
        title: "Concept development",
        items: [
          { name: "Ideation workshops", description: "Facilitated sessions to generate breakthrough ideas" },
          { name: "Design sprints", description: "Rapid prototyping and concept development" },
          { name: "Idea generation", description: "Structured approaches to create diverse concepts" }
        ]
      }
    ],
    process: [
      "Frame opportunity",
      "Generate options",
      "Shape concepts",
      "Align internally",
      "Prepare for testing and optimisation"
    ],
    caseStudy: {
      client: "Premium FMCG Brand",
      challenge: "Had ambition but lacked clear routes to innovation.",
      approach: "Facilitated ideation workshops and design sprints to generate 40+ concepts.",
      outcome: "Three breakthrough concepts advanced to development phase."
    }
  },
  "how-to-win": {
    id: "how-to-win",
    title: "How to win",
    purpose: "Optimise your offer and build the business case with confidence.",
    color: "#10B981",
    bestFor: [
      "You have multiple routes and need to choose",
      "You need to optimise concepts or packaging",
      "You need to model volume, cannibalisation, pricing, portfolio trade-offs"
    ],
    serviceGroups: [
      {
        title: "Optimisation",
        items: [
          { name: "Idea screening", description: "Rapidly evaluate and prioritise concepts" },
          { name: "Idea optimisation", description: "Refine and strengthen winning concepts" },
          { name: "Packaging and branding", description: "Develop and test visual identity" },
          { name: "End to end design", description: "Complete product development support" }
        ]
      },
      {
        title: "Commercial confidence",
        items: [
          { name: "Portfolio management", description: "Optimise your product range for market success" },
          { name: "Preliminary share, source of volume and cannibalisation", description: "Model market impact" },
          { name: "Volumetric forecasting", description: "Project sales volumes with confidence" },
          { name: "Price pack architecture", description: "Optimise pricing and pack strategy" }
        ]
      }
    ],
    process: [
      "Screen options",
      "Optimise winners",
      "Model commercial impact",
      "Build business case",
      "Recommend route forward"
    ],
    caseStudy: {
      client: "International Beverage Company",
      challenge: "Multiple product routes needed to be prioritised with limited budget.",
      approach: "Idea screening, optimisation testing, and volumetric forecasting.",
      outcome: "Data-backed business case securing executive sign-off and launch budget."
    }
  },
  "whats-working": {
    id: "whats-working",
    title: "What's working",
    purpose: "Track market dynamics, learn fast, and keep improving post-launch.",
    color: "#8B5CF6",
    bestFor: [
      "You need always-on monitoring",
      "You want to track innovation and promotions",
      "You need brand/category health pulses"
    ],
    serviceGroups: [
      {
        title: "Tracking solutions",
        items: [
          { name: "Innovation tracking", description: "Monitor new product performance in market" },
          { name: "Promotion tracking", description: "Evaluate promotional effectiveness" },
          { name: "Brand and category health tracking", description: "Ongoing health pulse measurements" }
        ]
      }
    ],
    process: [
      "Define KPIs",
      "Set cadence",
      "Track signals",
      "Interpret changes",
      "Feed learning back into pipeline"
    ],
    caseStudy: {
      client: "Regional Food Manufacturer",
      challenge: "Post-launch tracking was fragmented and reactive.",
      approach: "Set up always-on innovation and promotion tracking dashboard.",
      outcome: "Real-time visibility into market dynamics, enabling faster response to competitors."
    }
  }
};

const pillarOrder = ["where-to-focus", "how-to-play", "how-to-win", "whats-working"];

export default function ConsultPillarPage() {
  const [, params] = useRoute("/consult/:pillarId");
  const [, setLocation] = useLocation();
  const pillarId = params?.pillarId || "";
  const data = pillarData[pillarId];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pillarId]);

  useSEO({
    title: data ? `${data.title} — Brand Consulting` : "Brand Consulting",
    description: data?.purpose ?? "Strategic brand consulting from Innovatr, grounded in real consumer data and 24-hour research.",
    canonicalUrl: `https://www.innovatr.co.za/consult/${pillarId}`,
    jsonLd: data ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.innovatr.co.za" },
        { "@type": "ListItem", "position": 2, "name": "Consult", "item": "https://www.innovatr.co.za/consult" },
        { "@type": "ListItem", "position": 3, "name": data.title, "item": `https://www.innovatr.co.za/consult/${pillarId}` },
      ],
    } as Record<string, unknown> : undefined,
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pillar not found</h1>
          <Button onClick={() => setLocation("/consult")}>
            Back to Consult
          </Button>
        </div>
      </div>
    );
  }

  const currentIndex = pillarOrder.indexOf(pillarId);
  const prevPillar = currentIndex > 0 ? pillarOrder[currentIndex - 1] : null;
  const nextPillar = currentIndex < pillarOrder.length - 1 ? pillarOrder[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navigation />
      <main>
      {/* Consult Sub-Navigation */}
      <nav aria-label="Consult sub-navigation" className="sticky top-16 z-40 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
            <Link href="/consult">
              <span className="text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">
                Overview
              </span>
            </Link>
            {pillarOrder.map((id) => (
              <Link key={id} href={`/consult/${id}`}>
                <span 
                  className={`text-sm whitespace-nowrap cursor-pointer transition-colors ${
                    id === pillarId 
                      ? "text-white font-medium" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {pillarData[id].title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section aria-label="Hero" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#0d0d18]" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ backgroundColor: data.color }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/consult">
              <Button 
                variant="ghost" 
                className="mb-8 text-gray-400 hover:text-white hover:bg-white/5"
                data-testid="button-back-consult"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Consult
              </Button>
            </Link>
            
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6"
              style={{ color: data.color }}
            >
              {data.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl">
              {data.purpose}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Best For Section */}
      <section aria-label="Best for when" className="py-16 bg-[#0d0d18]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-8 text-white">Best for when...</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.bestFor.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-[#12121a] border border-gray-800"
              >
                <CheckCircle2 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: data.color }}
                />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section aria-label="Services" className="py-16 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-8 text-white">Services</h2>
          <div className="space-y-8">
            {data.serviceGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{ color: data.color }}
                >
                  {group.title}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {group.items.map((item, itemIndex) => (
                    <Card 
                      key={itemIndex}
                      className="bg-[#12121a] border-gray-800"
                    >
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-white mb-2">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-400">{item.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section aria-label="How we work" className="py-16 bg-[#0d0d18]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-8 text-white">How we work</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {data.process.map((step, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="px-5 py-3 rounded-full border text-sm"
                  style={{ borderColor: data.color, color: data.color }}
                >
                  {step}
                </div>
                {index < data.process.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-2 text-gray-600 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section aria-label="Case study" className="py-16 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold mb-8 text-white">Case study</h2>
          <Card className="bg-[#12121a] border-gray-800 overflow-hidden">
            <div 
              className="h-1"
              style={{ backgroundColor: data.color }}
            />
            <CardContent className="p-8">
              <p className="text-sm text-gray-500 mb-6">{data.caseStudy.client}</p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Challenge</p>
                  <p className="text-lg text-gray-200">{data.caseStudy.challenge}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Approach</p>
                  <p className="text-gray-400">{data.caseStudy.approach}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Outcome</p>
                  <p className="text-lg text-white font-medium">{data.caseStudy.outcome}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation between pillars */}
      <section aria-label="Pillar navigation" className="py-12 bg-[#0d0d18] border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {prevPillar ? (
              <Link href={`/consult/${prevPillar}`}>
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {pillarData[prevPillar].title}
                </Button>
              </Link>
            ) : (
              <div />
            )}
            {nextPillar ? (
              <Link href={`/consult/${nextPillar}`}>
                <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
                  {pillarData[nextPillar].title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-label="Call to action" className="py-16 bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-8">
            Let's discuss how we can help with your {data.title.toLowerCase()} challenges.
          </p>
          <Button
            size="lg"
            className="bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white"
            onClick={() => setLocation("/#contact")}
            data-testid="button-contact"
          >
            Book a consult call
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
