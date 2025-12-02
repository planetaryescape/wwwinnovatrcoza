import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Gem } from "lucide-react";
import { useLocation } from "wouter";

const membershipPlans = [
  {
    name: "Entry",
    icon: Star,
    price: "R60k",
    priceBreakdown: null,
    totalPrice: "R60k",
    period: "per year",
    monthly: "R5k/month",
    badge: null,
    description: "For startups & small teams",
    savings: "Save up to 40%",
    features: [
      "Trends Report Access",
      "Discounted Research",
      "Test24 Basic: R5,000 per idea",
      "Test24 Pro: R45,000 per study",
      "Private Dashboard Access",
    ],
    value: null,
  },
  {
    name: "Growth",
    icon: Crown,
    price: "R180k",
    priceBreakdown: "Entry (R60k) + Growth (R120k)",
    totalPrice: "R180k",
    period: "per year",
    monthly: null,
    badge: "Most Popular",
    description: "For growing businesses",
    savings: "Best for scale",
    features: [
      "Everything in Entry",
      "x10 Test24 Basic ideas / year",
      "x2 Test24 Pro Studies / year",
    ],
    value: "~R260k value",
  },
  {
    name: "Scale",
    icon: Gem,
    price: "R255k",
    priceBreakdown: "Entry (R60k) + Scale (R195k)",
    totalPrice: "R255k",
    period: "per year",
    monthly: null,
    badge: "Best Value",
    description: "Enterprise-level insights",
    savings: "Maximum value",
    features: [
      "Everything in Entry",
      "x15 Test24 Basic ideas / year",
      "x3 Test24 Pro Studies / year",
      "Dedicated Insights Support",
    ],
    value: "~R360k value",
  },
];

export default function MembershipSection() {
  const [, setLocation] = useLocation();

  const handleBecomeMember = (planName: string) => {
    if (planName === "Entry") {
      setLocation("/checkout/membership-entry");
    } else if (planName === "Growth") {
      setLocation("/checkout/membership-growth");
    } else if (planName === "Scale") {
      setLocation("/checkout/membership-scale");
    }
  };

  return (
    <section id="membership" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            05 — Memberships
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6" style={{ color: '#4D5FF1' }}>Join the Club & Save</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your research. Save up to 50%.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {membershipPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`hover-elevate transition-all duration-300 relative flex flex-col ${
                plan.badge ? 'border-primary shadow-lg' : ''
              }`}
              data-testid={`membership-card-${index}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <div className="w-12 h-12 mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.priceBreakdown ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {plan.priceBreakdown}
                      </div>
                      <div>
                        <span className="text-4xl font-bold text-primary">{plan.totalPrice}</span>
                        <span className="text-muted-foreground ml-2">{plan.period}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                      {plan.monthly && (
                        <div className="text-sm text-muted-foreground mt-1">{plan.monthly}</div>
                      )}
                    </div>
                  )}
                </div>
                {plan.value && (
                  <div className="text-sm font-semibold text-accent mt-2">{plan.value}</div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col flex-1">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-auto" 
                  size="lg"
                  variant={plan.badge ? "default" : "outline"}
                  onClick={() => handleBecomeMember(plan.name)}
                  data-testid={`button-membership-${index}`}
                >
                  Become a Member
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
