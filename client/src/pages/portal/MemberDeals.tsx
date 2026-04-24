import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { logActivity } from "@/lib/activityLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Sparkles, Clock, TrendingUp, Crown, Lock, ArrowRight, BarChart2, Users, BookOpen, Eye, Lightbulb } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  headlineOffer: string | null;
  originalPrice: string | null;
  discountedPrice: string | null;
  creditsIncluded: number;
  dealType: string;
  slotsTotal: number | null;
  slotsRemaining: number | null;
  sortOrder: number;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
}

const PERK_ICONS: Record<string, typeof Gift> = {
  "Q2 Research Planning Session": Crown,
  "Refer a Company": Users,
  "March Trends Unlocked": BookOpen,
};

const OFFER_ICONS: Record<string, typeof Gift> = {
  "Research Clarity Sprint": Lightbulb,
  "LITE Brand Health Track": TrendingUp,
  "Full Brand Health Study": BarChart2,
};

function getOfferIcon(title: string): typeof Gift {
  return OFFER_ICONS[title] ?? Gift;
}

function getPerkIcon(title: string): typeof Gift {
  return PERK_ICONS[title] ?? Gift;
}

function SlotIndicator({ id, total, remaining }: { id: string; total: number; remaining: number }) {
  const claimed = total - remaining;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${i < claimed ? "bg-muted-foreground/40" : "bg-primary"}`}
            data-testid={`slot-dot-${id}-${i}`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-muted-foreground" data-testid={`text-remaining-${id}`}>
        {remaining === 0 ? "Fully claimed" : `${remaining} of ${total} remaining`}
      </span>
    </div>
  );
}

function formatValidTo(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function formatValidFrom(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function getCurrentMonthLabel() {
  return new Date().toLocaleString("default", { month: "long", year: "numeric" });
}

function getNextMonthLabel() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleString("default", { month: "long" });
}

export default function MemberDeals() {
  const [, setLocation] = useLocation();
  const { user, isFreeUser } = useAuth();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    logActivity("view_deals");
  }, []);

  const { data: allDeals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/member/deals", user?.companyId],
    queryFn: async () => {
      const response = await fetch("/api/member/deals");
      if (!response.ok) throw new Error("Failed to fetch deals");
      return response.json();
    },
    enabled: !!user,
  });

  const now = new Date();

  const exclusiveOffers = allDeals
    .filter(d => d.dealType === "exclusive_offer" && d.isActive && new Date(d.validFrom) <= now)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const perks = allDeals
    .filter(d => d.dealType === "perk" && d.isActive && new Date(d.validFrom) <= now)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const teasers = allDeals
    .filter(d => d.dealType === "teaser" && new Date(d.validFrom) > now)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (isFreeUser) {
    return (
      <PortalLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="max-w-2xl text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-bold text-foreground">Member Offers</h1>
              <p className="text-xl text-muted-foreground">Exclusive offers reserved for Innovatr Members</p>
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
                      <Button size="lg" onClick={() => setLocation("/#membership")} data-testid="button-become-member">
                        View Membership Plans
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => setLocation("/portal/explore/trends")} data-testid="button-browse-free-content">
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
            <Badge variant="outline" className="text-xs font-normal">{getCurrentMonthLabel()}</Badge>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <Gift className="w-10 h-10 text-primary" />
            Member Offers
          </h1>
          <p className="text-lg text-muted-foreground">
            Limited monthly drops reserved exclusively for Innovatr members
          </p>
        </div>

        {/* Exclusive Offers */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-2xl font-serif font-bold">{getCurrentMonthLabel().split(" ")[0]} Exclusives</h2>
            {exclusiveOffers.some(d => d.slotsTotal != null) && (
              <Badge variant="secondary" className="text-xs">Limited slots</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : exclusiveOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No exclusive offers available this month. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exclusiveOffers.map(deal => {
                const remaining = deal.slotsRemaining ?? null;
                const total = deal.slotsTotal ?? null;
                const isClaimed = total != null && remaining != null && remaining <= 0;
                const Icon = getOfferIcon(deal.title);
                return (
                  <Card
                    key={deal.id}
                    className={`relative ${isClaimed ? "opacity-75" : "border-primary hover-elevate"}`}
                    data-testid={`deal-card-${deal.id}`}
                  >
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant={isClaimed ? "secondary" : remaining === 1 ? "destructive" : "default"}
                      >
                        {isClaimed
                          ? "Fully Claimed"
                          : total != null && remaining != null
                          ? `${remaining} Left`
                          : "Available"}
                      </Badge>
                    </div>
                    <CardHeader className="pt-8 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-primary" />
                        {deal.headlineOffer && (
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {deal.headlineOffer}
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-xl pr-16">{deal.title}</CardTitle>
                      {deal.description && (
                        <CardDescription className="text-sm leading-relaxed">
                          {deal.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {deal.discountedPrice && (
                        <div className="flex items-baseline gap-3">
                          <span className="text-2xl font-bold text-foreground" data-testid={`text-price-${deal.id}`}>
                            {formatPrice(Number(deal.discountedPrice))}
                          </span>
                          {deal.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${deal.id}`}>
                              {formatPrice(Number(deal.originalPrice))}
                            </span>
                          )}
                        </div>
                      )}

                      {total != null && remaining != null && (
                        <SlotIndicator id={deal.id} total={total} remaining={remaining} />
                      )}

                      {deal.validTo && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expires {formatValidTo(deal.validTo)}</span>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="lg"
                        disabled={isClaimed}
                        data-testid={`button-claim-${deal.id}`}
                      >
                        {isClaimed ? "Fully Claimed" : "Reserve a Spot"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Perks */}
        {(isLoading || perks.length > 0) && (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4">{getCurrentMonthLabel().split(" ")[0]} Perks</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {perks.map(perk => {
                  const Icon = getPerkIcon(perk.title);
                  return (
                    <Card key={perk.id} className="hover-elevate" data-testid={`perk-card-${perk.id}`}>
                      <CardHeader>
                        <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center mb-3">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                        <CardTitle className="text-lg">{perk.title}</CardTitle>
                        {perk.description && (
                          <CardDescription className="leading-relaxed">{perk.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {perk.headlineOffer && (
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">Reward:</span>
                            <Badge variant="outline" className="text-xs" data-testid={`text-perk-reward-${perk.id}`}>{perk.headlineOffer}</Badge>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          className="w-full"
                          data-testid={`button-perk-${perk.id}`}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Teasers - Next Month */}
        {(isLoading || teasers.length > 0) && (
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h2 className="text-2xl font-serif font-bold">{getNextMonthLabel()} Offer Drop</h2>
              <Badge variant="outline" className="text-xs font-normal">Preview</Badge>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="border-dashed">
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teasers.map(teaser => (
                  <Card
                    key={teaser.id}
                    className="relative border-dashed"
                    data-testid={`teaser-card-${teaser.id}`}
                  >
                    <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center">
                      <div className="text-center space-y-2 px-4">
                        <Eye className="w-6 h-6 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium text-muted-foreground">
                          Available {formatValidFrom(teaser.validFrom)}
                        </p>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{teaser.title}</CardTitle>
                      {teaser.description && (
                        <CardDescription className="leading-relaxed">{teaser.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Details revealed {formatValidFrom(teaser.validFrom)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Banner */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-serif font-bold">Don't Miss Out</h2>
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
