import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Zap, Target } from "lucide-react";

const pricingPlans = {
  payg: [
    {
      name: "Test24 Basic",
      icon: Zap,
      price: "R10,000",
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
  ],
  members: [
    {
      name: "Test24 Basic",
      icon: Zap,
      price: "R5,000",
      unit: "per idea",
      description: "24hr Pay Per Idea Testing",
      badge: "50% OFF",
      features: [
        "Lite quant testing (100 consumers)",
        "Automated briefing",
        "24hr report delivery",
        "Member discount included",
        "Priority support",
      ],
    },
    {
      name: "Test24 Pro",
      icon: Target,
      price: "R45,000",
      unit: "per study",
      description: "Custom Quant & AI Qual",
      badge: "10% OFF",
      features: [
        "Custom audiences",
        "Full quant surveys (10-15 min)",
        "100+ AI Qual VOC videos",
        "Strategic recommendations",
        "Enterprise-grade insights",
      ],
    },
  ],
};

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("payg");
  
  const handleBuyNow = (plan: string) => {
    console.log(`Buy ${plan} clicked`);
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-serif font-bold mb-4">Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flexible pricing for every business
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="payg" data-testid="tab-payg">Pay-As-You-Go</TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="payg">
            <div className="grid md:grid-cols-2 gap-8">
              {pricingPlans.payg.map((plan, index) => (
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
          </TabsContent>

          <TabsContent value="members">
            <div className="grid md:grid-cols-2 gap-8">
              {pricingPlans.members.map((plan, index) => (
                <Card 
                  key={index}
                  className="hover-elevate transition-all duration-300 relative border-primary"
                  data-testid={`member-card-${index}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-4">
                      <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                        {plan.badge}
                      </div>
                    </div>
                  )}
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
                      data-testid={`button-buy-member-${index}`}
                    >
                      Get Member Pricing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
