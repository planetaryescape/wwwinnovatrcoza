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
  useDarkText?: boolean;
}

const services: Service[] = [
  {
    icon: Zap,
    number: "1",
    title: "Innovatr Test24 Basic",
    description: "24hr Pay Per Concept Quant Testing",
    priceZAR: 5000,
    priceSuffix: " / concept",
    link: "/test24-basic",
    features: [
      "Lite Testing (x100 consumers) 5min",
      "Automated briefing & reporting",
      "24hr turnaround",
    ],
    color: "#FF7F6E",
    isNew: true,
  },
  {
    icon: Target,
    number: "2",
    title: "Innovatr Test24 Pro",
    description: "24hr Custom Quant & AI Qual",
    priceZAR: 45000,
    pricePrefix: "From ",
    priceSuffix: " / survey",
    link: "/test24-pro",
    features: [
      "Full Testing (+100 consumers) 15min",
      "Custom Audience",
      "Quant + AI Qual",
    ],
    color: "#DDA0DD",
    isNew: false,
  },
  {
    icon: TrendingUp,
    number: "3",
    title: "Innovatr Intelligence",
    description: "Bi-weekly insights, trends and reports",
    priceZAR: 5000,
    priceSuffix: " / month",
    link: "/#membership",
    features: [
      "Monitor trends & competitor launch alerts",
      "Opportunity identification",
      "Bi-weekly curated insights",
    ],
    color: "#6BBF59",
    isNew: true,
    useDarkText: false,
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
    color: "#7EC8E3",
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
    <section id="services" className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
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
              className={`hover-elevate relative overflow-hidden flex flex-col border-0 ${
                service.isPremium ? 'shadow-2xl ring-1 ring-slate-300/30' : ''
              }`}
              style={{ 
                backgroundColor: service.color,
              }}
              data-testid={`service-card-${index}`}
            >
              {/* NEW badge */}
              {service.isNew && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge 
                    className={`font-semibold text-xs px-2 py-1 ${
                      service.useDarkText 
                        ? 'bg-slate-800/20 text-slate-800 border-slate-800/30' 
                        : 'bg-white/20 text-white border-white/30'
                    }`}
                    data-testid={`badge-new-${index}`}
                  >
                    NEW
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2">
                {/* Icon */}
                <div className="mb-4">
                  <service.icon className={`w-8 h-8 ${service.useDarkText ? 'text-slate-800' : 'text-white'}`} />
                </div>
                
                {/* Title */}
                <CardTitle className={`text-2xl font-serif mb-2 ${service.useDarkText ? 'text-slate-800' : 'text-white'}`}>
                  {service.title}
                </CardTitle>
                
                {/* Description */}
                <CardDescription className={`text-base ${service.useDarkText ? 'text-slate-700' : 'text-white/80'}`}>{service.description}</CardDescription>
                
                {/* Price */}
                <div className={`text-xl font-bold pt-2 ${service.useDarkText ? 'text-slate-800' : 'text-white'}`}>{getDisplayPrice(service)}</div>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-1">
                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className={`flex items-start gap-2 text-sm ${service.useDarkText ? 'text-slate-700' : 'text-white/90'}`}>
                      <span className={`mt-1 ${service.useDarkText ? 'text-slate-800' : 'text-white'}`}>•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                {service.link && (
                  <Link href={service.link}>
                    <Button 
                      variant="outline"
                      className={`w-full border-0 ${
                        service.useDarkText 
                          ? 'bg-slate-800/10 text-slate-800' 
                          : 'bg-white/10 text-white'
                      }`}
                      data-testid={`button-learn-more-${index}`}
                    >
                      {service.isPremium ? 'Explore Consult' : 'Learn More'}
                      <ArrowRight className="w-4 h-4 ml-2" />
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
