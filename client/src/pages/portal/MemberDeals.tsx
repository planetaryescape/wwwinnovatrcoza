import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Clock, TrendingUp, Crown, Lock, ArrowRight } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExclusiveDeal {
  id: number;
  title: string;
  descriptionTemplate: string;
  savingsZAR: number;
  expires: string;
  badge: string;
  ctaText: string;
}

interface MonthlyOffer {
  id: number;
  title: string;
  description: string;
  valueZAR: number | null;
  valueText: string | null;
  price: string;
  icon: typeof TrendingUp;
}

const exclusiveDealsData: ExclusiveDeal[] = [
  {
    id: 1,
    title: "Buy 3 Test24 Basic, Get 1 Free",
    descriptionTemplate: "Perfect for testing multiple concepts. Save {savings} instantly.",
    savingsZAR: 5000,
    expires: "5 days",
    badge: "Limited Time",
    ctaText: "Claim Deal",
  },
  {
    id: 2,
    title: "Pro Study Bundle - 3x",
    descriptionTemplate: "Save {savings} on 3 Test24 Pro studies. Ideal for quarterly campaigns.",
    savingsZAR: 15000,
    expires: "This month",
    badge: "Best Value",
    ctaText: "Get Bundle",
  },
  {
    id: 3,
    title: "Upgrade to Scale",
    descriptionTemplate: "Unlock 15 Basic + 3 Pro studies annually. Best ROI for active teams.",
    savingsZAR: 40000,
    expires: "30 days",
    badge: "Premium",
    ctaText: "Upgrade Now",
  },
];

const monthlyOffersData: MonthlyOffer[] = [
  {
    id: 4,
    title: "December Special: Industry Reports Bundle",
    description: "Access all Q4 2024 trend reports across 5 industries.",
    valueZAR: 25000,
    valueText: null,
    price: "Free for members",
    icon: TrendingUp,
  },
  {
    id: 5,
    title: "Early Access: AI Qual Beta Features",
    description: "Be first to test new VOC analysis tools launching in January.",
    valueZAR: null,
    valueText: "Beta access",
    price: "Growth+ members",
    icon: Sparkles,
  },
  {
    id: 6,
    title: "Year-End Consultation Credit",
    description: "30-min strategy session with Innovatr insights team included.",
    valueZAR: 5000,
    valueText: null,
    price: "All members",
    icon: Crown,
  },
];

const upcomingDeals = [
  {
    title: "January Bundle Preview",
    description: "New year package with 20% off all credit purchases",
    date: "Coming Jan 1",
  },
  {
    title: "Loyalty Rewards Program",
    description: "Earn points on every study, redeem for free credits",
    date: "Coming Q1 2025",
  },
];

export default function MemberDeals() {
  const [, setLocation] = useLocation();
  const { isFreeUser } = useAuth();
  const { formatPrice, formatShortPrice } = useCurrency();

  // Format exclusive deals with currency context
  const displayDeals = exclusiveDealsData.map(deal => ({
    ...deal,
    savings: formatPrice(deal.savingsZAR),
    description: deal.descriptionTemplate.replace("{savings}", formatPrice(deal.savingsZAR)),
  }));

  // Format monthly offers with currency context
  const monthlyOffers = monthlyOffersData.map(offer => ({
    ...offer,
    value: offer.valueZAR ? `${formatShortPrice(offer.valueZAR)} value` : offer.valueText,
  }));

  // Full locked page for free users
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
                        <h4 className="font-semibold">Credit Bundles</h4>
                        <p className="text-sm text-muted-foreground">Save up to {formatShortPrice(40000)} on research credits</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Early Access</h4>
                        <p className="text-sm text-muted-foreground">Beta features before anyone else</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Exclusive Perks</h4>
                        <p className="text-sm text-muted-foreground">Consultation credits and more</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Become an Innovatr member to unlock exclusive deals, discounts, and member-only perks.
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10 text-primary" />
            Member Deals
          </h1>
          <p className="text-lg text-muted-foreground">
            Exclusive offers and discounts for Innovatr members
          </p>
        </div>

        {/* Featured Exclusive Deals */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-4">Exclusive Member Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayDeals.map((deal) => (
              <Card
                key={deal.id}
                className="border-primary hover-elevate relative overflow-hidden"
                data-testid={`deal-card-${deal.id}`}
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground">
                    {deal.badge}
                  </Badge>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl pr-20">{deal.title}</CardTitle>
                  <CardDescription className="text-base">
                    {deal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">You Save</p>
                    <p className="text-3xl font-bold text-accent">{deal.savings}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {deal.expires}</span>
                  </div>
                  <Button className="w-full" size="lg" data-testid={`button-claim-${deal.id}`}>
                    {deal.ctaText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Monthly Member Perks */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-4">This Month's Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monthlyOffers.map((offer) => (
              <Card
                key={offer.id}
                className="hover-elevate"
                data-testid={`perk-card-${offer.id}`}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center mb-3">
                    <offer.icon className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Value:</span>
                    <span className="font-semibold text-primary">{offer.value}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold text-accent">{offer.price}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid={`button-access-${offer.id}`}
                  >
                    Access Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Get ready for these upcoming member benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeals.map((deal, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                  data-testid={`upcoming-deal-${index}`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{deal.title}</h3>
                    <p className="text-sm text-muted-foreground">{deal.description}</p>
                  </div>
                  <Badge variant="outline">{deal.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Banner */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-serif font-bold">
              Want Even More Value?
            </h2>
            <p className="text-lg opacity-90">
              Upgrade to Scale for maximum savings and exclusive features
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLocation("/checkout/membership-scale")}
                data-testid="button-upgrade-platinum"
              >
                View Scale Benefits
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white/10"
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
