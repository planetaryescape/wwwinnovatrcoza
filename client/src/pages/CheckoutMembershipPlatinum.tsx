import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Gem, ShoppingCart, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function CheckoutMembershipPlatinum() {
  const [, setLocation] = useLocation();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { formatPrice, formatShortPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const entryPriceZAR = 60000;
  const scaleUpgradeZAR = 195000;
  const totalPriceZAR = 255000;
  const totalValueZAR = 360000;
  const basicValueZAR = 75000;
  const proValueZAR = 135000;
  const savingsZAR = totalValueZAR - totalPriceZAR;

  const scaleFeatures = [
    "Everything in Starter membership",
    `15x Test24 Basic ideas included (~${formatShortPrice(basicValueZAR)} value)`,
    `3x Test24 Pro Studies included (~${formatShortPrice(proValueZAR)} value)`,
    "Dedicated Insights Support Team",
    "White-label reporting options",
    "Custom audience segmentation",
    "Bi-weekly strategy calls",
    "Early access to new features",
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/research#membership")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Memberships
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center">
                  <Gem className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Scale Membership</h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg">
                Enterprise-level insights with maximum value and dedicated support
              </p>
            </div>

            <Card className="mb-6 border-accent">
              <CardHeader>
                <CardTitle className="text-xl">Plan Includes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Starter Membership Required</h3>
                    <p className="text-sm text-muted-foreground">
                      Scale membership includes Starter benefits plus extensive credits and enterprise features
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
                        <li>• Priority support</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4 bg-accent/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Gem className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold">Scale Upgrade</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 15 Basic credits included</li>
                        <li>• 3 Pro studies included</li>
                        <li>• Dedicated support team</li>
                        <li>• ~{formatShortPrice(totalValueZAR)} total value</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold text-primary mb-1">Included Credits</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">15x Test24 Basic ideas</span>
                      <span className="font-semibold">~{formatPrice(basicValueZAR)} value</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm">3x Test24 Pro studies</span>
                      <span className="font-semibold">~{formatPrice(proValueZAR)} value</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 pt-2 border-t">
                      <span className="text-sm font-medium">Total Credits Value</span>
                      <span className="font-bold text-primary">~{formatPrice(basicValueZAR + proValueZAR)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">All Scale Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {scaleFeatures.map((feature, index) => (
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
            <Card className="sticky top-4 border-accent">
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
                      <Gem className="w-4 h-4 text-accent" />
                      <p className="font-medium">Scale Membership</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Includes Starter + Scale upgrade
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
                    <span className="text-muted-foreground">Scale Tier Upgrade</span>
                    <span className="font-semibold" data-testid="text-platinum-upgrade">{formatPrice(scaleUpgradeZAR)}</span>
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  data-testid="button-proceed-checkout"
                >
                  Proceed to Payment
                </Button>

                <div className="text-center pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Billed annually • Renews automatically
                  </p>
                  <p className="text-xs text-accent font-medium">
                    Maximum value for enterprises
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
            description: "Scale Tier Upgrade (15x Basic + 3x Pro)",
            quantity: 1,
            unitAmount: String(scaleUpgradeZAR),
          },
        ]}
        totalAmount={totalPriceZAR}
        purchaseType="Scale Membership (Annual)"
      />
    </div>
  );
}
