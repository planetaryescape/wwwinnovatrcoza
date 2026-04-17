import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientButtonWrap } from "@/components/GradientButtonWrap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Zap, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import basicCharacter from "@assets/Poll3_1769022875574.png";
import proCharacter from "@assets/Poll1_1769022986706.png";

// Prices in ZAR (base currency)
const pricingPlans = {
  payg: [
    {
      name: "Test24 Basic",
      icon: Zap,
      priceZAR: 10000,
      unit: "per concept",
      description: "24hr Pay Per Concept Testing",
      features: [
        "100 consumer sample",
        "5 min lite survey",
        "Automated briefing",
        "24hr report delivery",
        "Pay only when you test",
      ],
    },
    {
      name: "Test24 Pro",
      icon: Target,
      priceZAR: 50000,
      unit: "per survey",
      description: "Custom Quant & AI Qual",
      features: [
        "100+ custom audience",
        "10-15 min full survey",
        "AI Qual VOC videos",
        "Strategic recommendations",
        "Enterprise-grade insights",
      ],
    },
  ],
  members: [
    {
      name: "Test24 Basic",
      icon: Zap,
      priceZAR: 5000,
      unit: "per concept",
      description: "24hr Pay Per Concept Testing",
      badge: "50% OFF",
      features: [
        "100 consumer sample",
        "5 min lite survey",
        "Automated briefing",
        "24hr report delivery",
        "Priority member support",
      ],
    },
    {
      name: "Test24 Pro",
      icon: Target,
      priceZAR: 45000,
      unit: "per survey",
      description: "Custom Quant & AI Qual",
      badge: "10% OFF",
      features: [
        "100+ custom audience",
        "10-15 min full survey",
        "AI Qual VOC videos",
        "Strategic recommendations",
        "Enterprise-grade insights",
      ],
    },
  ],
};

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("members");
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();
  
  const handleBuyNow = (planName: string) => {
    if (activeTab === "payg") {
      if (planName === "Test24 Basic") {
        setLocation("/checkout/basic-payg");
      } else if (planName === "Test24 Pro") {
        setLocation("/checkout/pro-payg");
      }
    } else {
      if (planName === "Test24 Basic") {
        setLocation("/checkout/basic-members");
      } else if (planName === "Test24 Pro") {
        setLocation("/checkout/pro-members");
      }
    }
  };

  return (
    <section id="pricing" className="py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-sm font-semibold text-black mb-4 uppercase tracking-wider">
            04 — Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>Flexible pricing for any business</h2>
          <div className="flex justify-center mt-4">
            <CurrencyToggle />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="payg" data-testid="tab-payg">Pay-As-You-Go</TabsTrigger>
            <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="payg">
            <div className="grid md:grid-cols-2 gap-8">
              {pricingPlans.payg.map((plan, index) => (
                <Card 
                  key={index}
                  className="hover-elevate transition-all duration-300 bg-white"
                  data-testid={`payg-card-${index}`}
                >
                  <CardHeader>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                        <CardDescription className="text-base">{plan.description}</CardDescription>
                        <div className="mt-4 flex flex-col md:flex-row md:items-baseline">
                          <span className="text-4xl font-bold text-primary">{formatPrice(plan.priceZAR)}</span>
                          <span className="text-muted-foreground md:ml-2">{plan.unit}</span>
                        </div>
                      </div>
                      {plan.name === "Test24 Basic" && (
                        <img 
                          src={basicCharacter} 
                          alt="Test24 Basic character" 
                          className="w-32 h-32 md:w-40 md:h-40 object-contain flex-shrink-0 -mr-2 md:mr-0"
                        />
                      )}
                      {plan.name === "Test24 Pro" && (
                        <img 
                          src={proCharacter} 
                          alt="Test24 Pro character" 
                          className="w-32 h-32 md:w-40 md:h-40 object-contain flex-shrink-0 -mr-2 md:mr-0"
                        />
                      )}
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
                    <GradientButtonWrap variant="violet" className="w-full">
                      <Button 
                        className="w-full relative z-10" 
                        size="lg"
                        onClick={() => handleBuyNow(plan.name)}
                        data-testid={`button-buy-${index}`}
                      >
                        Buy Now
                      </Button>
                    </GradientButtonWrap>
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
                  className="hover-elevate transition-all duration-300 relative border-primary bg-white"
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
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                        <CardDescription className="text-base">{plan.description}</CardDescription>
                        <div className="mt-4 flex flex-col md:flex-row md:items-baseline">
                          <span className="text-4xl font-bold text-primary">{formatPrice(plan.priceZAR)}</span>
                          <span className="text-muted-foreground md:ml-2">{plan.unit}</span>
                        </div>
                      </div>
                      {plan.name === "Test24 Basic" && (
                        <img 
                          src={basicCharacter} 
                          alt="Test24 Basic character" 
                          className="w-32 h-32 md:w-40 md:h-40 object-contain flex-shrink-0 -mr-2 md:mr-0"
                        />
                      )}
                      {plan.name === "Test24 Pro" && (
                        <img 
                          src={proCharacter} 
                          alt="Test24 Pro character" 
                          className="w-32 h-32 md:w-40 md:h-40 object-contain flex-shrink-0 -mr-2 md:mr-0"
                        />
                      )}
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
                    <GradientButtonWrap variant="violet" className="w-full">
                      <Button 
                        className="w-full relative z-10" 
                        size="lg"
                        onClick={() => handleBuyNow(plan.name)}
                        data-testid={`button-buy-member-${index}`}
                      >
                        Get Member Pricing
                      </Button>
                    </GradientButtonWrap>
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
