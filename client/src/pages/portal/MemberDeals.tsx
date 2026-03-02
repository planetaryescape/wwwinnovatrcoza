import { useEffect } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Clock, TrendingUp, Crown, Lock, ArrowRight, BarChart2, Users, BookOpen, Eye, Lightbulb } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExclusiveDeal {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  termsNote: string;
  totalSlots: number;
  claimedSlots: number;
  expiresLabel: string;
  badge: string;
  ctaText: string;
  priceZAR: number;
  originalPriceZAR: number;
  icon: typeof Gift;
}

interface MonthlyPerk {
  id: number;
  title: string;
  description: string;
  eligibility: string;
  ctaText: string;
  icon: typeof TrendingUp;
}

interface MarchTeaser {
  title: string;
  hint: string;
  availableDate: string;
}

const exclusiveDealsData: ExclusiveDeal[] = [
  {
    id: 1,
    title: "Research Clarity Sprint",
    subtitle: "Strategy Workshop + Fieldwork Bundle",
    description: "3 Test24 Basic credits paired with a dedicated 2-hour strategy workshop facilitated by the Innovatr team. Walk away with a prioritised research agenda and live studies ready to launch.",
    termsNote: "Includes 3 Basic credits and one facilitated 2-hour strategy workshop. Workshop to be scheduled within 60 days of purchase.",
    totalSlots: 3,
    claimedSlots: 0,
    expiresLabel: "31 Mar",
    badge: "3 Left",
    ctaText: "Reserve My Sprint",
    priceZAR: 42000,
    originalPriceZAR: 52000,
    icon: Lightbulb,
  },
  {
    id: 2,
    title: "LITE Brand Health Track",
    subtitle: "Structured Brand Measurement",
    description: "4 Basic credits configured as a lightweight, repeatable brand health tracker. Monitor awareness, consideration, and preference — with a structured research calendar built for you.",
    termsNote: "Includes 4 Basic credits structured as a LITE Brand Health programme. Research calendar setup and tracking template included.",
    totalSlots: 3,
    claimedSlots: 1,
    expiresLabel: "31 Mar",
    badge: "2 Left",
    ctaText: "Start Tracking",
    priceZAR: 48000,
    originalPriceZAR: 60000,
    icon: TrendingUp,
  },
  {
    id: 3,
    title: "Full Brand Health Study",
    subtitle: "Pro-Level Brand Intelligence",
    description: "1 Test24 Pro credit deployed as a comprehensive brand health study — with enhanced deliverables including competitive benchmarking, segment-level analysis, and a strategic debrief session.",
    termsNote: "Includes 1 Pro credit with full Brand Health configuration, competitive benchmarking, and a 1-hour strategic debrief with Innovatr research leads.",
    totalSlots: 3,
    claimedSlots: 0,
    expiresLabel: "31 Mar",
    badge: "3 Left",
    ctaText: "Claim This Study",
    priceZAR: 58000,
    originalPriceZAR: 72000,
    icon: BarChart2,
  },
];

const monthlyPerksData: MonthlyPerk[] = [
  {
    id: 4,
    title: "Q2 Research Planning Session",
    description: "All active members this month get a complimentary 45-minute Q2 research planning call with a senior Innovatr strategist. Map your pipeline before the quarter begins.",
    eligibility: "Active members",
    ctaText: "Book My Session",
    icon: Crown,
  },
  {
    id: 5,
    title: "Refer a Company",
    description: "Know a business that could benefit from Test24? Refer them and receive 3 free Basic credits when they sign up and run their first study.",
    eligibility: "All members",
    ctaText: "Get Referral Link",
    icon: Users,
  },
  {
    id: 6,
    title: "March Trends Unlocked",
    description: "All members get complimentary access to our latest consumer sentiment and category reports this month. See what's shaping your market right now.",
    eligibility: "All members",
    ctaText: "Explore Trends",
    icon: BookOpen,
  },
];

const aprilTeasers: MarchTeaser[] = [
  {
    title: "New Product Pipeline Tracker",
    hint: "A structured innovation research programme designed to pressure-test your Q3 pipeline...",
    availableDate: "1 April",
  },
  {
    title: "Scale Team Package",
    hint: "Something built for organisations running research across multiple teams or markets...",
    availableDate: "1 April",
  },
  {
    title: "Brand Pulse Check-In",
    hint: "A quarterly pulse study — fast, focused, and built around what matters to your brand...",
    availableDate: "1 April",
  },
];

function SlotIndicator({ dealId, total, claimed }: { dealId: number; total: number; claimed: number }) {
  const remaining = total - claimed;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < claimed
                ? "bg-muted-foreground/40"
                : "bg-primary"
            }`}
            data-testid={`slot-dot-${dealId}-${i}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground" data-testid={`text-remaining-${dealId}`}>
        {remaining === 0
          ? "Fully claimed"
          : `${remaining} of ${total} remaining`}
      </span>
    </div>
  );
}

export default function MemberDeals() {
  const [, setLocation] = useLocation();
  const { isFreeUser } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    logActivity("view_deals");
  }, []);

  if (isFreeUser) {
    return (
      <PortalLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="max-w-2xl text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-bold text-foreground">
                Member Offers
              </h1>
              <p className="text-xl text-muted-foreground">
                Exclusive offers reserved for Innovatr Members
              </p>
            </div>

            <Card className="bg-card/50 border-border">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <Gift className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Limited Drops</h4>
                        <p className="text-sm text-muted-foreground">Only 3 slots per offer each month</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Member-Only Perks</h4>
                        <p className="text-sm text-muted-foreground">Free credits, referral rewards, and more</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Early Access</h4>
                        <p className="text-sm text-muted-foreground">See next month's offers before anyone else</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Become an Innovatr member to unlock exclusive offers, limited drops, and member-only perks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        size="lg" 
                        onClick={() => setLocation("/#membership")} 
                        data-testid="button-become-member"
                      >
                        View Membership Plans
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setLocation("/portal/trends")}
                        data-testid="button-browse-free-content"
                      >
                        Browse Free Content
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-normal">March 2026</Badge>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10 text-primary" />
            Member Offers
          </h1>
          <p className="text-lg text-muted-foreground">
            Limited monthly drops reserved exclusively for Innovatr members
          </p>
        </div>

        {/* Exclusive Offers with Scarcity */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-serif font-bold">March Exclusives</h2>
            <Badge variant="secondary" className="text-xs">
              Only 3 spots per offer
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exclusiveDealsData.map((deal) => {
              const isClaimed = deal.claimedSlots >= deal.totalSlots;
              const remaining = deal.totalSlots - deal.claimedSlots;
              return (
                <Card
                  key={deal.id}
                  className={`relative ${isClaimed ? "opacity-75" : "border-primary hover-elevate"}`}
                  data-testid={`deal-card-${deal.id}`}
                >
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant={isClaimed ? "secondary" : "default"}
                      className={isClaimed ? "" : remaining === 1 ? "bg-destructive text-destructive-foreground" : ""}
                    >
                      {isClaimed ? "Fully Claimed" : deal.badge}
                    </Badge>
                  </div>
                  <CardHeader className="pt-8 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <deal.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {deal.subtitle}
                      </span>
                    </div>
                    <CardTitle className="text-xl pr-16">{deal.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {deal.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-bold text-foreground" data-testid={`text-price-${deal.id}`}>
                        {formatPrice(deal.priceZAR)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${deal.id}`}>
                        {formatPrice(deal.originalPriceZAR)}
                      </span>
                    </div>

                    <SlotIndicator dealId={deal.id} total={deal.totalSlots} claimed={deal.claimedSlots} />

                    <p className="text-xs text-muted-foreground italic">
                      {deal.termsNote}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Expires {deal.expiresLabel}</span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={isClaimed}
                      data-testid={`button-claim-${deal.id}`}
                    >
                      {isClaimed ? "Fully Claimed" : deal.ctaText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Monthly Member Perks */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-4">March Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monthlyPerksData.map((perk) => (
              <Card
                key={perk.id}
                className="hover-elevate"
                data-testid={`perk-card-${perk.id}`}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center mb-3">
                    <perk.icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{perk.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {perk.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Who:</span>
                    <Badge variant="outline" className="text-xs" data-testid={`text-eligibility-${perk.id}`}>{perk.eligibility}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (perk.id === 6) setLocation("/portal/trends");
                      if (perk.id === 4) setLocation("/#membership");
                      if (perk.id === 5) {/* referral link - future feature */}
                    }}
                    data-testid={`button-perk-${perk.id}`}
                  >
                    {perk.ctaText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* April Preview - Teaser Cards */}
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-2xl font-serif font-bold">April Offer Drop</h2>
            <Badge variant="outline" className="text-xs font-normal">
              Preview
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aprilTeasers.map((teaser, index) => (
              <Card
                key={index}
                className="relative border-dashed"
                data-testid={`april-teaser-${index}`}
              >
                <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center">
                  <div className="text-center space-y-2 px-4">
                    <Eye className="w-6 h-6 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Available {teaser.availableDate}
                    </p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{teaser.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {teaser.hint}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Details revealed {teaser.availableDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-serif font-bold">
              Don't Miss Out
            </h2>
            <p className="text-lg opacity-90">
              Offers are limited to 3 spots each. Upgrade to Scale for priority access and maximum savings.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLocation("/checkout/membership-scale")}
                data-testid="button-upgrade-scale"
              >
                View Scale Benefits
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground"
                onClick={() => setLocation("/portal/credits")}
                data-testid="button-browse-credits"
              >
                Browse Credit Packs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
