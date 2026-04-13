import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Crown, ShoppingCart, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";

export default function CheckoutMembershipGold() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { formatPrice, formatShortPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const entryPriceZAR = 60000;
  const growthUpgradeZAR = 120000;
  const totalPriceZAR = 180000;
  const totalValueZAR = 260000;
  const basicValueZAR = 50000;
  const proValueZAR = 90000;
  const savingsZAR = totalValueZAR - totalPriceZAR;

  const growthFeatures = [
    "Everything in Starter membership",
    `10x Test24 Basic ideas included (~${formatShortPrice(basicValueZAR)} value)`,
    `2x Test24 Pro Studies included (~${formatShortPrice(proValueZAR)} value)`,
    "Priority support & faster response times",
    "Advanced analytics dashboard",
    "Quarterly strategy session",
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicNavbar />
      <style>{`
        @keyframes checkout-glow-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .checkout-cta-wrap { position: relative; border-radius: 14px; overflow: hidden; cursor: pointer; }
        .checkout-cta-glow { position: absolute; width: 220%; aspect-ratio: 1; top: 50%; left: 50%; border-radius: 50%; filter: blur(14px); background: conic-gradient(from 0deg, #3A2FBF, #E8503A, #4EC9E8, #3A2FBF); animation: checkout-glow-spin 5s linear infinite; pointer-events: none; opacity: 0.7; }
        .checkout-cta-wrap:hover .checkout-cta-glow { opacity: 1; animation-duration: 2.5s; }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation(backHref)}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Growth Membership</h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg">
                For growing businesses ready to scale their innovation testing
              </p>
            </div>

            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="text-xl">Plan Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Starter Membership Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Growth membership includes Starter benefits plus additional credits and features
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 bg-accent/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold">Starter Base</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Discounted research rates</li>
                        <li>• Private dashboard</li>
                        <li>• Trends reports</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold">Growth Upgrade</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 10 Basic credits included</li>
                        <li>• 2 Pro studies included</li>
                        <li>• ~{formatShortPrice(totalValueZAR)} total value</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h3 className="font-semibold text-accent mb-1">Included Credits</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">10x Test24 Basic ideas</span>
                      <span className="font-semibold">~{formatPrice(basicValueZAR)} value</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">2x Test24 Pro studies</span>
                      <span className="font-semibold">~{formatPrice(proValueZAR)} value</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">All Growth Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {growthFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Selected Plan</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      <p className="font-medium">Growth Membership</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Includes Starter + Growth upgrade
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="text-xs text-muted-foreground mb-2 font-medium">
                    MEMBERSHIP BREAKDOWN
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Starter Membership Base</span>
                    <span className="font-semibold" data-testid="text-entry-price">{formatPrice(entryPriceZAR)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Growth Tier Upgrade</span>
                    <span className="font-semibold" data-testid="text-gold-upgrade">{formatPrice(growthUpgradeZAR)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-accent font-medium pt-2 border-t">
                    <span>Total Package Value</span>
                    <span data-testid="text-total-value">{formatPrice(totalValueZAR)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary">
                    <span>Your Savings</span>
                    <span data-testid="text-savings">{formatPrice(savingsZAR)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Due Today</span>
                    <span className="text-primary" data-testid="text-total">
                      {formatPrice(totalPriceZAR)}
                    </span>
                  </div>
                </div>

                <div className="checkout-cta-wrap" onClick={handleCheckout} data-testid="button-proceed-checkout">
                  <div className="checkout-cta-glow" />
                  <Button className="w-full relative z-10" size="lg">
                    Proceed to Payment
                  </Button>
                </div>

                <div className="text-center pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Billed annually • Renews automatically
                  </p>
                  <p className="text-xs text-primary font-medium">
                    Best for scaling businesses
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <InnovatrFooter />
      <OrderFormDialog
        open={showOrderForm}
        onOpenChange={setShowOrderForm}
        orderItems={[
          {
            type: "membership",
            description: "Starter Membership (Annual)",
            quantity: 1,
            unitAmount: String(entryPriceZAR),
          },
          {
            type: "membership_upgrade",
            description: "Growth Tier Upgrade (10x Basic + 2x Pro)",
            quantity: 1,
            unitAmount: String(growthUpgradeZAR),
          },
        ]}
        totalAmount={totalPriceZAR}
        purchaseType="Growth Membership (Annual)"
      />
    </div>
  );
}
