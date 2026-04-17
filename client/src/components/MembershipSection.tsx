import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { trackLinkedInConversion } from "@/lib/linkedin-tracking";
import { Button } from "@/components/ui/button";
import { GradientButtonWrap } from "@/components/GradientButtonWrap";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

import starterCharacter from "@assets/appie-hero_1769022090062.png";
import growthCharacter from "@assets/IMG_8567_1769018823712.jpeg";
import scaleCharacter from "@assets/IMG_8569_1769018870308.jpeg";

interface MembershipPlan {
  name: string;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.5 });

  const handleBecomeMember = () => {
    trackLinkedInConversion();
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
        `Test24 Basic: ${formatPrice(plan.basicPriceZAR)} per concept`,
        `Test24 Pro: ${formatPrice(plan.proPriceZAR)} per survey`,
      ];
    }
    return plan.features;
  };

  const isStarter = plan.name === "Starter";
  const isActive = isInView;

  return (
    <Card 
      ref={cardRef}
      className="group hover-elevate relative flex flex-col border-0 bg-white text-slate-900 shadow-xl overflow-visible pt-6"
      data-testid={`membership-card-${index}`}
    >
      {/* Character Image Area with Animated Elements */}
      <div className="relative h-48 overflow-visible flex items-end justify-center bg-white">
        {/* Character image - animate on scroll */}
        <motion.img 
          src={plan.characterImage}
          alt={`${plan.name} membership character`}
          width={176}
          height={176}
          className="h-44 w-auto object-contain z-10"
          animate={isActive ? { y: -8 } : { y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          data-testid={`img-membership-character-${index}`}
        />
      </div>
      <CardHeader className="pt-4 pb-2 text-left">
        <CardTitle className="text-3xl font-serif mb-2" style={{ color: plan.accentColor }}>{plan.name}</CardTitle>
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
      <CardContent className="space-y-4 flex flex-col flex-1 pt-0 text-left">
        <ul className="space-y-2 flex-1">
          {getFeatures().map((feature, fIndex) => (
            <li key={fIndex} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: plan.accentColor }} />
              <span className="text-sm text-slate-700 text-left">{feature}</span>
            </li>
          ))}
        </ul>
        <GradientButtonWrap variant={isStarter ? "coral" : "violet"} className="w-full">
          <Button 
            className={`w-full relative z-10 ${isStarter ? 'bg-[#ED876E] border-[#ED876E]' : 'bg-[#4D5FF1] border-[#4D5FF1]'}`}
            size="lg"
            onClick={handleBecomeMember}
            data-testid={`button-membership-${index}`}
          >
            Become a Member
          </Button>
        </GradientButtonWrap>
      </CardContent>
    </Card>
  );
}

export default function MembershipSection() {
  return (
    <section id="membership" className="py-12 sm:py-20 bg-[#fd8067]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
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
