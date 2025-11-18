import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Target } from "lucide-react";

const payAsYouGoPlans = [
  {
    name: "Test24 Basic",
    icon: Zap,
    price: "R5,000",
    unit: "per idea",
    description: "24hr Pay Per Idea Testing",
    features: [
      "Lite quant testing (100 consumers)",
      "Automated briefing",
      "24hr report delivery",
      "Simple, affordable",
      "Pay only when you test",
    ],
  },
  {
    name: "Test24 Pro",
    icon: Target,
    price: "R50,000",
    unit: "per study",
    description: "Custom Quant & AI Qual",
    features: [
      "Custom audiences",
      "Full quant surveys (10-15 min)",
      "100+ AI Qual VOC videos",
      "Strategic recommendations",
      "Enterprise-grade insights",
    ],
  },
];

export default function PricingSection() {
  const handleBuyNow = (plan: string) => {
    console.log(`Buy ${plan} clicked`);
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif font-bold mb-4">Pay-As-You-Go</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible pricing. No commitment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {payAsYouGoPlans.map((plan, index) => (
            <Card 
              key={index}
              className="hover-elevate transition-all duration-300"
              data-testid={`payg-card-${index}`}
            >
              <CardHeader>
                <div className="w-12 h-12 mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.unit}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleBuyNow(plan.name)}
                  data-testid={`button-buy-${index}`}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
