import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Target, Rocket, ArrowRight } from "lucide-react";
import { Link } from "wouter";

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
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>
            Idea to Market.
          </h2>
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            02 — Our Offering
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300 relative overflow-hidden flex flex-col"
              data-testid={`service-card-${index}`}
            >
              <div className="absolute top-0 right-0 text-[80px] font-serif font-bold text-primary/5 leading-none p-2">
                {service.number}
              </div>
              <CardHeader className="pb-3">
                <div className="w-10 h-10 mb-3 rounded-md bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-serif leading-tight">{service.title}</CardTitle>
                <CardDescription className="text-sm leading-snug">{service.description}</CardDescription>
                <div className="text-base font-bold text-primary pt-1">{service.price}</div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-3 pt-0">
                <ul className="space-y-1.5 flex-1">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-1.5 text-xs">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {service.link && (
                  <Link href={service.link}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full group"
                      data-testid={`button-learn-more-${index}`}
                    >
                      Learn More
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
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
