import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const membershipPlans = [
  {
    name: "Entry Membership",
    price: "R60k",
    period: "per year",
    monthly: "R5k/month",
    badge: null,
    description: "Perfect for startups and small teams",
    savings: "Save up to 50% on research",
    features: [
      "Unlimited Trend Reports (growing monthly)",
      "Test24 Basic: R5k per idea (50% off)",
      "Test24 Pro: R45k per study (10% off)",
      "Private Dashboard Access",
      "Personal Member Portal",
      "Submit briefs directly",
      "Buy research credits",
      "Instant access to reports",
      "View past results",
    ],
    value: null,
  },
  {
    name: "Gold Membership",
    price: "R120k",
    period: "per year",
    monthly: null,
    badge: "Most Popular",
    description: "Best for growing businesses",
    savings: "Up to R200k value",
    features: [
      "Everything in Entry",
      "10 Test24 Basic ideas included",
      "1 dedicated insights expert",
      "Priority support",
      "Quarterly strategy sessions",
      "Custom trend reports",
    ],
    value: "~R200k value",
  },
  {
    name: "Platinum Membership",
    price: "R195k",
    period: "per year",
    monthly: null,
    badge: "Best Value",
    description: "Enterprise-level insights",
    savings: "Up to R300k value",
    features: [
      "Everything in Entry",
      "15 Test24 Basic ideas included",
      "3x Test24 Pro studies included",
      "1 dedicated insights expert",
      "White-glove support",
      "Monthly strategy sessions",
      "Custom research design",
    ],
    value: "~R300k value",
  },
];

export default function MembershipSection() {
  const handleBecomeMember = (plan: string) => {
    console.log(`Become ${plan} member clicked`);
  };

  return (
    <section id="membership" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Membership Plans</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Unlock up to 40% savings with a membership
          </p>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Members save up to 40% on research
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {membershipPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`hover-elevate transition-all duration-300 relative ${
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
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                  {plan.monthly && (
                    <div className="text-sm text-muted-foreground mt-1">{plan.monthly}</div>
                  )}
                </div>
                {plan.value && (
                  <div className="text-sm font-semibold text-primary mt-2">{plan.value}</div>
                )}
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
