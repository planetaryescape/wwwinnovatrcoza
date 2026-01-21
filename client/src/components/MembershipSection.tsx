import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Gem } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

import starterCharacter from "@assets/download_(1)_1768985238001.png";
import growthCharacter from "@assets/download_(3)_1768985238001.png";
import scaleCharacter from "@assets/download_(4)_1768985238001.png";

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
  characterImage: string;
  accentColor: string;
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
    characterImage: starterCharacter,
    accentColor: "#ED876E",
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
    characterImage: growthCharacter,
    accentColor: "#4D5FF1",
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
    characterImage: scaleCharacter,
    accentColor: "#4D5FF1",
  },
];

function MembershipCard({ plan, index }: { plan: MembershipPlan; index: number }) {
  const [, setLocation] = useLocation();
  const { formatPrice, formatShortPrice } = useCurrency();

  const handleBecomeMember = () => {
    if (plan.name === "Starter") {
      setLocation("/checkout/membership-entry");
    } else if (plan.name === "Growth") {
      setLocation("/checkout/membership-growth");
    } else if (plan.name === "Scale") {
      setLocation("/checkout/membership-scale");
    }
  };

  const getFeatures = () => {
    if (plan.name === "Starter") {
      return [
        ...plan.features,
        `Test24 Basic: ${formatPrice(plan.basicPriceZAR)} per idea`,
        `Test24 Pro: ${formatPrice(plan.proPriceZAR)} per study`,
      ];
    }
    return plan.features;
  };

  const isStarter = plan.name === "Starter";

  return (
    <Card 
      className="group hover-elevate relative flex flex-col border-0 bg-white text-slate-900 shadow-xl overflow-hidden"
      data-testid={`membership-card-${index}`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-[#ED876E] text-white px-4 py-1 shadow-lg">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      {/* Character Image Area with Animated Elements */}
      <div className="relative h-48 bg-gradient-to-b from-slate-50 to-white overflow-hidden flex items-end justify-center">
        {/* Floating decorative elements */}
        <div 
          className="absolute top-4 left-4 w-3 h-3 rounded-full opacity-60 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:translate-x-1"
          style={{ backgroundColor: plan.accentColor }}
        />
        <div 
          className="absolute top-8 right-6 w-2 h-2 rounded-full opacity-40 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-3 group-hover:-translate-x-2"
          style={{ backgroundColor: plan.accentColor }}
        />
        <div 
          className="absolute top-12 left-8 w-4 h-4 rotate-45 opacity-30 transition-all duration-600 ease-out group-hover:rotate-90 group-hover:-translate-y-2"
          style={{ backgroundColor: plan.accentColor }}
        />
        <div 
          className="absolute top-6 right-12 w-2.5 h-2.5 rounded-full opacity-50 transition-all duration-500 ease-out group-hover:scale-110 group-hover:translate-y-1 group-hover:translate-x-2"
          style={{ backgroundColor: plan.accentColor }}
        />
        <div 
          className="absolute bottom-16 left-6 w-2 h-2 rounded-full opacity-40 transition-all duration-800 ease-out group-hover:scale-125 group-hover:-translate-y-4"
          style={{ backgroundColor: plan.accentColor }}
        />
        <div 
          className="absolute bottom-20 right-8 w-3 h-3 rotate-12 opacity-30 transition-all duration-600 ease-out group-hover:rotate-45 group-hover:-translate-y-3 group-hover:translate-x-1"
          style={{ backgroundColor: plan.accentColor }}
        />
        
        {/* Star shapes */}
        <svg 
          className="absolute top-10 right-4 w-4 h-4 opacity-40 transition-all duration-500 ease-out group-hover:scale-125 group-hover:-translate-y-2 group-hover:rotate-45"
          viewBox="0 0 24 24" 
          fill={plan.accentColor}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <svg 
          className="absolute bottom-24 left-4 w-3 h-3 opacity-30 transition-all duration-700 ease-out group-hover:scale-150 group-hover:-translate-y-3 group-hover:-rotate-12"
          viewBox="0 0 24 24" 
          fill={plan.accentColor}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        
        {/* Character image */}
        <img 
          src={plan.characterImage}
          alt={`${plan.name} membership character`}
          width={176}
          height={176}
          loading="lazy"
          className="h-44 w-auto object-contain transition-all duration-500 ease-out drop-shadow-md group-hover:-translate-y-2 group-hover:drop-shadow-lg group-focus-within:-translate-y-2 group-focus-within:drop-shadow-lg z-10"
          data-testid={`img-membership-character-${index}`}
        />
      </div>
      
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${plan.accentColor}15` }}
          >
            <plan.icon className="w-5 h-5" style={{ color: plan.accentColor }} />
          </div>
          <CardTitle className="text-xl font-serif">{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-slate-600 text-sm">{plan.description}</CardDescription>
        <div className="mt-3">
          {plan.starterPriceZAR && plan.additionalPriceZAR ? (
            <div className="space-y-1">
              <div className="text-xs text-slate-500">
                Starter ({formatShortPrice(plan.starterPriceZAR)}) + {plan.name} ({formatShortPrice(plan.additionalPriceZAR)})
              </div>
              <div>
                <span className="text-3xl font-bold" style={{ color: plan.accentColor }}>{formatShortPrice(plan.priceZAR)}</span>
                <span className="ml-2 text-slate-500 text-sm">per year</span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-3xl font-bold" style={{ color: plan.accentColor }}>{formatShortPrice(plan.priceZAR)}</span>
              <span className="ml-2 text-slate-500 text-sm">per year</span>
              {plan.monthlyZAR && (
                <div className="text-xs mt-1 text-slate-500">{formatShortPrice(plan.monthlyZAR)}/month</div>
              )}
            </div>
          )}
        </div>
        {plan.valueZAR && (
          <div className="text-sm font-semibold mt-2 text-[#ED876E]">~{formatShortPrice(plan.valueZAR)} value</div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col flex-1 pt-0">
        <ul className="space-y-2 flex-1">
          {getFeatures().map((feature, fIndex) => (
            <li key={fIndex} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.accentColor }} />
              <span className="text-sm text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full mt-auto ${isStarter ? 'bg-[#ED876E] border-[#ED876E]' : 'bg-[#4D5FF1] border-[#4D5FF1]'}`}
          size="lg"
          onClick={handleBecomeMember}
          data-testid={`button-membership-${index}`}
        >
          Become a Member
        </Button>
      </CardContent>
    </Card>
  );
}

export default function MembershipSection() {
  return (
    <section id="membership" className="py-20 bg-[#fd8067]">
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
            <MembershipCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
