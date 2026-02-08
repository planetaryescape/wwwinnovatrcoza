import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Clock, TrendingUp, Crown, Lock, ArrowRight, Heart, Zap, Users, BookOpen, Eye } from "lucide-react";
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
  icon: typeof Heart;
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
    title: "Valentine's Bundle",
    subtitle: "Love Your Research",
    description: "2 Pro studies + 2 Basic studies in one package. The ultimate quarterly research kit for teams serious about consumer insight.",
    termsNote: "Includes 2 Pro credits and 2 Basic credits. Member pricing applied.",
    totalSlots: 3,
    claimedSlots: 1,
    expiresLabel: "28 Feb",
    badge: "2 Left",
    ctaText: "Reserve My Bundle",
    priceZAR: 90000,
    originalPriceZAR: 100000,
    icon: Heart,
  },
  {
    id: 2,
    title: "Pro Taster",
    subtitle: "First-Time Pro Access",
    description: "Get 2 full Test24 Pro studies at an introductory rate. Reserved for companies who haven't run Pro before.",
    termsNote: "One-time offer for first-time Pro buyers only. 2 Pro credits included.",
    totalSlots: 3,
    claimedSlots: 0,
    expiresLabel: "28 Feb",
    badge: "3 Left",
    ctaText: "Unlock Pro Access",
    priceZAR: 80000,
    originalPriceZAR: 90000,
    icon: Zap,
  },
  {
    id: 3,
    title: "Credit Top-Up Bonus",
    subtitle: "Bulk Commitment Reward",
    description: "Purchase 5 Basic credits and we'll add a 6th on us. Lock in your research pipeline for the quarter.",
    termsNote: "Bonus credit added within 24 hours of purchase.",
    totalSlots: 3,
    claimedSlots: 2,
    expiresLabel: "28 Feb",
    badge: "1 Left",
    ctaText: "Claim Last Spot",
    priceZAR: 25000,
    originalPriceZAR: 30000,
    icon: Gift,
  },
];

const monthlyPerksData: MonthlyPerk[] = [
  {
    id: 4,
    title: "Free Membership Month",
    description: "New companies signing up in February get their first month's seat fee waived. Share this with a colleague or partner business.",
    eligibility: "New sign-ups only",
    ctaText: "Share Invite Link",
    icon: Crown,
  },
  {
    id: 5,
    title: "Refer a Company",
    description: "Know a business that could benefit from Test24? Refer them and receive 1 free Basic credit when they sign up and run their first study.",
    eligibility: "All members",
    ctaText: "Get Referral Link",
    icon: Users,
  },
  {
    id: 6,
    title: "February Trends Unlocked",
    description: "All members get complimentary access to our latest consumer sentiment reports this month. Explore what's shaping your industry.",
    eligibility: "All members",
    ctaText: "Explore Trends",
    icon: BookOpen,
  },
];

const marchTeasers: MarchTeaser[] = [
  {
    title: "Quarterly Research Sprint",
    hint: "A structured package for companies planning Q2 campaigns...",
    availableDate: "1 March",
  },
  {
    title: "Insights Masterclass",
    hint: "Exclusive live session with Innovatr's research leads...",
    availableDate: "1 March",
  },
  {
    title: "Team Expansion Offer",
    hint: "Something special for growing research teams...",
    availableDate: "1 March",
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
                Member Deals
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
                        <p className="text-sm text-muted-foreground">Only 3 slots per deal each month</p>
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
                        <p className="text-sm text-muted-foreground">See next month's deals before anyone else</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Become an Innovatr member to unlock exclusive deals, limited drops, and member-only perks.
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
            <Badge variant="outline" className="text-xs font-normal">February 2026</Badge>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10 text-primary" />
            Member Deals
          </h1>
          <p className="text-lg text-muted-foreground">
            Limited monthly drops reserved exclusively for Innovatr members
          </p>
        </div>

        {/* Exclusive Deals with Scarcity */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-serif font-bold">February Exclusives</h2>
            <Badge variant="secondary" className="text-xs">
              Only 3 spots per deal
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
          <h2 className="text-2xl font-serif font-bold mb-4">February Perks</h2>
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

        {/* March Preview - Teaser Cards */}
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="text-2xl font-serif font-bold">March Deal Drop</h2>
            <Badge variant="outline" className="text-xs font-normal">
              Preview
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marchTeasers.map((teaser, index) => (
              <Card
                key={index}
                className="relative border-dashed"
                data-testid={`march-teaser-${index}`}
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
              Deals are limited to 3 spots each. Upgrade to Scale for priority access and maximum savings.
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
