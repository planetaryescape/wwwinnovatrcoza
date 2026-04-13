import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Star, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";

const starterFeaturesBase = [
  "Trends Report Access",
  "Discounted Research Pricing",
  "Private Dashboard Access",
  "Priority Email Support",
  "Monthly Industry Insights",
];

export default function CheckoutMembershipEntry() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const [paymentType, setPaymentType] = useState<"monthly" | "annual">("annual");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const monthlyPriceZAR = 5000;
  const annualPriceZAR = 60000;
  const basicPriceZAR = 5000;
  const proPriceZAR = 45000;
  const totalDueTodayZAR = paymentType === "monthly" ? monthlyPriceZAR : annualPriceZAR;
  
  const starterFeatures = [
    ...starterFeaturesBase,
    `Test24 Basic: ${formatPrice(basicPriceZAR)} per concept (50% off)`,
    `Test24 Pro: ${formatPrice(proPriceZAR)} per survey (10% off)`,
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
                <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Starter Membership</h1>
                  <p className="text-muted-foreground">
                    {paymentType === "monthly" ? "Monthly Plan" : "Annual Plan"}
                  </p>
                </div>
              </div>
              <p className="text-lg">
                For startups & small teams seeking affordable research insights
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Choose Your Payment Option</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentType("monthly")}
                    className={`border-2 rounded-lg p-6 text-left transition-all hover-elevate active-elevate-2 ${
                      paymentType === "monthly"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    data-testid="button-payment-monthly"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Monthly</h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "monthly" ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {paymentType === "monthly" && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(monthlyPriceZAR)}
                      </span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Flexible monthly billing • Cancel anytime
                    </p>
                  </button>

                  <button
                    onClick={() => setPaymentType("annual")}
                    className={`border-2 rounded-lg p-6 text-left transition-all hover-elevate active-elevate-2 ${
                      paymentType === "annual"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    data-testid="button-payment-annual"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">Annual</h3>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentType === "annual" ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {paymentType === "annual" && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(annualPriceZAR)}
                      </span>
                      <span className="text-muted-foreground ml-1">/year</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      One payment • Full year access
                    </p>
                  </button>
                </div>

                {paymentType === "annual" && (
                  <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-accent">
                      Save with annual billing - just {formatPrice(monthlyPriceZAR)}/month equivalent
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Save up to 40% on Research</h3>
                    <p className="text-sm text-muted-foreground">
                      Get member-only discounted rates on all Test24 services throughout the year
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Test24 Basic</h4>
                      <p className="text-2xl font-bold text-primary">{formatPrice(basicPriceZAR)}</p>
                      <p className="text-sm text-muted-foreground">per concept (50% off PAYG)</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Test24 Pro</h4>
                      <p className="text-2xl font-bold text-primary">{formatPrice(proPriceZAR)}</p>
                      <p className="text-sm text-muted-foreground">per survey (10% off PAYG)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {starterFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-semibold">See Your Private Dashboard in Action</h4>
                  <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                    <iframe
                      src="https://player.vimeo.com/video/1138121972?badge=0&autopause=0&player_id=0&app_id=58479"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%"
                      }}
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      title="Private Research Dashboard Demo"
                      data-testid="video-dashboard-entry"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Selected Plan</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium">Starter Membership</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {paymentType === "monthly" ? "Monthly billing" : "Annual billing"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  {paymentType === "monthly" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Price</span>
                        <span data-testid="text-monthly-price" className="font-semibold">
                          {formatPrice(monthlyPriceZAR)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total for 12 months</span>
                        <span className="text-accent" data-testid="text-12-month-total">
                          {formatPrice(monthlyPriceZAR * 12)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Due Today</span>
                        <span className="text-primary" data-testid="text-total">
                          {formatPrice(totalDueTodayZAR)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Price</span>
                        <span data-testid="text-annual-price" className="font-semibold">
                          {formatPrice(annualPriceZAR)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Equivalent</span>
                        <span className="text-accent">{formatPrice(monthlyPriceZAR)}/month</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total Due Today</span>
                        <span className="text-primary" data-testid="text-total">
                          {formatPrice(totalDueTodayZAR)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="checkout-cta-wrap" onClick={handleCheckout} data-testid="button-proceed-checkout">
                  <div className="checkout-cta-glow" />
                  <Button className="w-full relative z-10" size="lg">
                    Proceed to Payment
                  </Button>
                </div>

                <div className="text-center pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {paymentType === "monthly"
                      ? "Billed monthly • Cancel anytime"
                      : "Billed annually • Renews automatically"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All prices include VAT where applicable
                  </p>
                  <p className="text-xs text-primary font-medium">
                    Start saving on research today
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
            description: `Starter Membership (${paymentType === "monthly" ? "Monthly" : "Annual"})`,
            quantity: 1,
            unitAmount: String(totalDueTodayZAR),
          },
        ]}
        totalAmount={totalDueTodayZAR}
        purchaseType={`Starter Membership (${paymentType === "monthly" ? "Monthly" : "Annual"})`}
        subscriptionOptions={paymentType === "monthly" ? {
          enabled: true,
          subscriptionType: 1, // Fixed subscription
          frequency: 3, // Monthly
          cycles: 12, // 12 months
          recurringAmount: monthlyPriceZAR,
        } : undefined}
      />
    </div>
  );
}
