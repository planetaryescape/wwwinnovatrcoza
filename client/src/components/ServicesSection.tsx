import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Zap, Target, Rocket } from "lucide-react";

const services = [
  {
    icon: Zap,
    number: "1",
    title: "Innovatr Test24 Basic",
    description: "24hr Pay Per Idea Quant Testing",
    price: "R10,000 / idea",
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
    price: "From R50,000 / study",
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
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            02 — Our Offering
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover-elevate transition-all duration-300 relative overflow-hidden"
              data-testid={`service-card-${index}`}
            >
              <div className="absolute top-0 right-0 text-[120px] font-serif font-bold text-primary/5 leading-none p-4">
                {service.number}
              </div>
              <CardHeader>
                <div className="w-12 h-12 mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif">{service.title}</CardTitle>
                <CardDescription className="text-base">{service.description}</CardDescription>
                <div className="text-lg font-bold text-primary pt-2">{service.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
