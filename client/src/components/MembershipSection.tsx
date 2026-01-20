import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Gem } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

interface MembershipPlan {
  name: string;
  icon: typeof Star;
  priceZAR: number;
  starterPriceZAR?: number;
  additionalPriceZAR?: number;
  monthlyZAR?: number;
  badge: string | null;
  description: string;
  savings: string;
  features: string[];
  valueZAR?: number;
  basicPriceZAR: number;
  proPriceZAR: number;
}

const membershipPlansData: MembershipPlan[] = [
  {
    name: "Starter",
    icon: Star,
    priceZAR: 60000,
    monthlyZAR: 5000,
    badge: null,
    description: "For startups & small teams",
    savings: "Save up to 40%",
    features: [
      "Trends Report Access",
      "Discounted Research",
      "Private Dashboard Access",
    ],
    basicPriceZAR: 5000,
    proPriceZAR: 45000,
  },
  {
    name: "Growth",
    icon: Crown,
    priceZAR: 180000,
    starterPriceZAR: 60000,
    additionalPriceZAR: 120000,
    badge: "Most Popular",
    description: "For growing businesses",
    savings: "Best for scale",
    features: [
      "Everything in Starter",
      "x10 Test24 Basic ideas / year",
      "x2 Test24 Pro Studies / year",
    ],
    valueZAR: 260000,
    basicPriceZAR: 5000,
    proPriceZAR: 45000,
  },
  {
    name: "Scale",
    icon: Gem,
    priceZAR: 255000,
    starterPriceZAR: 60000,
    additionalPriceZAR: 195000,
    badge: "Best Value",
    description: "Enterprise-level insights",
    savings: "Maximum value",
    features: [
      "Everything in Starter",
      "x15 Test24 Basic ideas / year",
      "x3 Test24 Pro Studies / year",
      "Dedicated Insights Support",
    ],
    valueZAR: 360000,
    basicPriceZAR: 5000,
    proPriceZAR: 45000,
  },
];

export default function MembershipSection() {
  const [, setLocation] = useLocation();
  const { formatPrice, formatShortPrice } = useCurrency();

  const handleBecomeMember = (planName: string) => {
    if (planName === "Starter") {
      setLocation("/checkout/membership-entry");
    } else if (planName === "Growth") {
      setLocation("/checkout/membership-growth");
    } else if (planName === "Scale") {
      setLocation("/checkout/membership-scale");
    }
  };

  const getFeatures = (plan: MembershipPlan) => {
    if (plan.name === "Starter") {
      return [
        ...plan.features,
        `Test24 Basic: ${formatPrice(plan.basicPriceZAR)} per idea`,
        `Test24 Pro: ${formatPrice(plan.proPriceZAR)} per study`,
      ];
    }
    return plan.features;
  };

  return (
    <section id="membership" className="py-20 bg-[#696fa3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">
            05 — Memberships
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-white">Join the Club & Save</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Scale your research. Save up to 50%.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {membershipPlansData.map((plan, index) => (
            <Card 
              key={index}
              className={`hover-elevate relative flex flex-col border-0 ${
                plan.badge 
                  ? 'bg-white text-slate-900 shadow-2xl' 
                  : 'bg-white/10 text-white backdrop-blur-sm'
              }`}
              data-testid={`membership-card-${index}`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#ED876E] text-white px-4 py-1 shadow-lg">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <div className={`w-12 h-12 mb-4 rounded-md flex items-center justify-center ${
                  plan.badge ? 'bg-[#4D5FF1]/10' : 'bg-white/10'
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.badge ? 'text-[#4D5FF1]' : 'text-white'}`} />
                </div>
                <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                <CardDescription className={`text-base ${plan.badge ? 'text-slate-600' : 'text-white/70'}`}>{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.starterPriceZAR && plan.additionalPriceZAR ? (
                    <div className="space-y-2">
                      <div className={`text-sm ${plan.badge ? 'text-slate-500' : 'text-white/50'}`}>
                        Starter ({formatShortPrice(plan.starterPriceZAR)}) + {plan.name} ({formatShortPrice(plan.additionalPriceZAR)})
                      </div>
                      <div>
                        <span className={`text-4xl font-bold ${plan.badge ? 'text-[#4D5FF1]' : 'text-white'}`}>{formatShortPrice(plan.priceZAR)}</span>
                        <span className={`ml-2 ${plan.badge ? 'text-slate-500' : 'text-white/50'}`}>per year</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-4xl font-bold ${plan.badge ? 'text-[#4D5FF1]' : 'text-white'}`}>{formatShortPrice(plan.priceZAR)}</span>
                      <span className={`ml-2 ${plan.badge ? 'text-slate-500' : 'text-white/50'}`}>per year</span>
                      {plan.monthlyZAR && (
                        <div className={`text-sm mt-1 ${plan.badge ? 'text-slate-500' : 'text-white/50'}`}>{formatShortPrice(plan.monthlyZAR)}/month</div>
                      )}
                    </div>
                  )}
                </div>
                {plan.valueZAR && (
                  <div className="text-sm font-semibold mt-2 text-[#ED876E]">~{formatShortPrice(plan.valueZAR)} value</div>
                )}
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col flex-1">
                <ul className="space-y-3 flex-1">
                  {getFeatures(plan).map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.badge ? 'text-[#4D5FF1]' : 'text-[#ED876E]'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-auto ${
                    plan.badge 
                      ? 'bg-[#4D5FF1] text-white' 
                      : 'bg-white/10 border-white/30 text-white'
                  }`}
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
