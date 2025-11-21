import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, Rocket, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { UnderlineScribble, SquiggleScribble, HighlighterScribble, ArrowScribble, StarScribble, BracketScribble } from "@/components/Scribbles";

const services = [
  {
    icon: Zap,
    number: "1",
    title: "Innovatr Test24 Basic",
    description: "24hr Pay Per Idea Quant Testing",
    price: "R5,000 / idea",
    link: "/test24-basic",
    features: [
      "Lite Testing (x100 consumers)",
      "Automated briefing & reporting",
      "24hr turnaround",
    ],
    color: "#ED876E",
    isNew: true,
  },
  {
    icon: Target,
    number: "2",
    title: "Innovatr Test24 Pro",
    description: "24hr Custom Quant & AI Qual",
    price: "From R45,000 / study",
    link: "/test24-pro",
    features: [
      "Full Testing (+100)",
      "Custom Audience",
      "Quant + AI Qual",
    ],
    color: "#4D5FF1",
    isNew: false,
  },
  {
    icon: TrendingUp,
    number: "3",
    title: "Innovatr Intelligence",
    description: "Bi-weekly insights, trends and reports",
    price: "R5,000 / month",
    link: "/innovatr-intelligence",
    features: [
      "Monitor trends & competitor launch alerts",
      "Opportunity identification",
      "Bi-weekly curated insights",
    ],
    color: "#D4B7F7",
    isNew: true,
  },
  {
    icon: Rocket,
    number: "4",
    title: "Innovatr Consult",
    description: "Enterprise Level Strategic Problem Solving",
    price: "Custom Pricing",
    link: "/innovatr-consult",
    features: [
      "Idea to Market Consulting",
      "Strategy, Design, Testing & Go to Market",
    ],
    color: "#4D5FF1",
    isNew: false,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            03 — Our Offering
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 relative inline-block" style={{ color: '#4D5FF1' }}>
            <span className="relative inline-block">
              <span className="relative">Test</span>
              <SquiggleScribble 
                className="absolute -top-8 -right-4 scribble-wiggle" 
                color="#4D5FF1" 
                opacity={0.7} 
              />
            </span>
            , Learn,{" "}
            <span className="relative inline-block scribble-bold">
              <span className="relative z-10">Iterate</span>
              <UnderlineScribble 
                className="absolute -bottom-2 left-0 right-0" 
                color="#87CEEB" 
                opacity={1} 
              />
            </span>
            .
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300 relative overflow-hidden flex flex-col"
              data-testid={`service-card-${index}`}
            >
              <div className="absolute top-0 right-0 text-[120px] font-serif font-bold leading-none p-4" style={{ color: service.color, opacity: index === 2 ? 0.15 : 0.05 }}>
                {service.number}
              </div>
              {service.isNew && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    className="font-semibold text-xs px-2 py-1"
                    style={{ backgroundColor: service.color, color: 'white' }}
                    data-testid={`badge-new-${index}`}
                  >
                    NEW
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div 
                  className="w-12 h-12 mb-4 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <service.icon className="w-6 h-6" style={{ color: service.color }} />
                </div>
                <CardTitle className="text-2xl font-serif" style={{ color: service.color }}>
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base relative">
                  {index === 1 && (
                    <>
                      <BracketScribble 
                        className="absolute -left-3 top-0 bottom-0 w-6" 
                        color="#4D5FF1" 
                        opacity={0.6} 
                      />
                      <BracketScribble 
                        className="absolute -right-3 top-0 bottom-0 w-6 scale-x-[-1]" 
                        color="#4D5FF1" 
                        opacity={0.6} 
                      />
                    </>
                  )}
                  {service.description}
                </CardDescription>
                <div className="text-lg font-bold pt-2 relative inline-block" style={{ color: service.color }}>
                  {index === 0 && (
                    <HighlighterScribble 
                      className="scribble-bold" 
                      color="#FFF59D" 
                      opacity={0.4} 
                    />
                  )}
                  <span className="relative z-10">{service.price}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-2 flex-1">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm relative">
                      <span className="mt-1" style={{ color: service.color }}>•</span>
                      <span className="relative">
                        {index === 0 && fIndex === 2 && (
                          <ArrowScribble 
                            className="absolute -left-12 -top-2 scribble-bold" 
                            color="#ED876E" 
                            opacity={0.8} 
                          />
                        )}
                        {index === 1 && fIndex === 2 && (
                          <StarScribble 
                            className="absolute -left-8 -top-1 scribble-bold" 
                            color="#ED876E" 
                            opacity={0.9} 
                          />
                        )}
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {service.link && (
                  <Link href={service.link}>
                    <Button 
                      variant="outline" 
                      className="w-full group"
                      data-testid={`button-learn-more-${index}`}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
