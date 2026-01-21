import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";
import { useCurrency } from "@/contexts/CurrencyContext";

import starterCharacter from "@assets/IMG_8566_1769018545430.jpeg";
import growthCharacter from "@assets/IMG_8567_1769018823712.jpeg";
import scaleCharacter from "@assets/download_(4)_1768985238001.png";

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
  const isActive = isInView;

  return (
    <Card 
      ref={cardRef}
      className="group hover-elevate relative flex flex-col border-0 bg-white text-slate-900 shadow-xl overflow-visible pt-6"
      data-testid={`membership-card-${index}`}
    >
      {plan.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Badge className="bg-[#ED876E] text-white px-4 py-1.5 shadow-lg text-sm">
            {plan.badge}
          </Badge>
        </div>
      )}
      
      {/* Character Image Area with Animated Elements */}
      <div className="relative h-48 bg-gradient-to-b from-slate-50 to-white overflow-visible flex items-end justify-center">
        {/* Floating decorative elements - animate on scroll or hover */}
        <motion.div 
          className="absolute top-8 left-12 w-5 h-5 rounded-full opacity-60"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { scale: 1.25, y: -12, x: 8 } : { scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute top-12 right-14 w-4 h-4 rounded-full opacity-50"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { scale: 1.5, y: -16, x: -8 } : { scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute top-20 left-16 w-6 h-6 opacity-35"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { rotate: 90, y: -12 } : { rotate: 45, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute top-16 right-16 w-4 h-4 rounded-full opacity-45"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { scale: 1.1, y: 8, x: 8 } : { scale: 1, y: 0, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-12 left-14 w-4 h-4 rounded-full opacity-50"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { scale: 1.25, y: -20 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-16 right-12 w-5 h-5 opacity-40"
          style={{ backgroundColor: plan.accentColor }}
          animate={isActive ? { rotate: 45, y: -16, x: 8 } : { rotate: 12, y: 0, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        
        {/* Character image - animate on scroll */}
        <motion.img 
          src={plan.characterImage}
          alt={`${plan.name} membership character`}
          width={176}
          height={176}
          loading="lazy"
          className="h-44 w-auto object-contain drop-shadow-md z-10"
          animate={isActive ? { y: -8, filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.1))" } : { y: 0, filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          data-testid={`img-membership-character-${index}`}
        />
      </div>
      
      <CardHeader className="pt-4 pb-2 text-center">
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
          className={`w-full ${isStarter ? 'bg-[#ED876E] border-[#ED876E]' : 'bg-[#4D5FF1] border-[#4D5FF1]'}`}
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
