import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Target, Rocket, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Service {
  icon: typeof Zap;
  number: string;
  title: string;
  description: string;
  priceZAR: number | null;
  pricePrefix?: string;
  priceSuffix?: string;
  customPrice?: string;
  link: string;
  features: string[];
  color: string;
  isNew: boolean;
  isPremium?: boolean;
}

const services: Service[] = [
  {
    icon: Zap,
    number: "1",
    title: "Innovatr Test24 Basic",
    description: "24hr Pay Per Idea Quant Testing",
    priceZAR: 5000,
    priceSuffix: " / idea",
    link: "/test24-basic",
    features: [
      "Lite Testing (x100 consumers) 5min",
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
    priceZAR: 45000,
    pricePrefix: "From ",
    priceSuffix: " / study",
    link: "/test24-pro",
    features: [
      "Full Testing (+100) 15min",
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
    priceZAR: 5000,
    priceSuffix: " / month",
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
    priceZAR: null,
    customPrice: "Custom Pricing",
    link: "/consult",
    features: [
      "Idea to Market Consulting",
      "Strategy, Design, Testing & Go to Market",
    ],
    color: "#4D5FF1",
    isNew: false,
    isPremium: true,
  },
];

export default function ServicesSection() {
  const { formatPrice } = useCurrency();
  
  const getDisplayPrice = (service: Service) => {
    if (service.customPrice) return service.customPrice;
    if (service.priceZAR === null) return "Custom Pricing";
    const prefix = service.pricePrefix || "";
    const suffix = service.priceSuffix || "";
    return `${prefix}${formatPrice(service.priceZAR)}${suffix}`;
  };
  
  return (
    <section id="services" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            03 — Our Offering
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>
            Test, Learn, Iterate.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`hover-elevate transition-all duration-300 relative overflow-hidden flex flex-col ${
                service.isPremium 
                  ? 'bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-[#4D5FF1]/20 shadow-[0_8px_32px_rgba(77,95,241,0.1)] ring-1 ring-[#4D5FF1]/10' 
                  : ''
              }`}
              data-testid={`service-card-${index}`}
            >
              {service.isPremium && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#4D5FF1]/5 via-transparent to-[#8B5CF6]/5 pointer-events-none" />
              )}
              <div className="absolute top-0 right-0 text-[120px] font-serif font-bold leading-none p-4" style={{ color: service.color, opacity: service.isPremium ? 0.12 : (index === 2 ? 0.15 : 0.05) }}>
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
                <CardDescription className={`text-base ${service.isPremium ? 'text-gray-600 dark:text-gray-300' : ''}`}>{service.description}</CardDescription>
                <div className="text-lg font-bold pt-2" style={{ color: service.color }}>{getDisplayPrice(service)}</div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <ul className="space-y-2 flex-1">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className={`flex items-start gap-2 text-sm ${service.isPremium ? 'text-gray-600 dark:text-gray-300' : ''}`}>
                      <span className="mt-1" style={{ color: service.color }}>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {service.link && (
                  <Link href={service.link}>
                    <Button 
                      variant={service.isPremium ? "default" : "outline"}
                      className={`w-full group ${service.isPremium ? 'bg-[#4D5FF1] hover:bg-[#4D5FF1]/90 text-white border-0' : ''}`}
                      data-testid={`button-learn-more-${index}`}
                    >
                      {service.isPremium ? 'Explore Consult' : 'Learn More'}
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
