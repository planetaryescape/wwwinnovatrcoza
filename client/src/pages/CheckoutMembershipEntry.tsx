import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Star, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const entryFeatures = [
  "Trends Report Access",
  "Discounted Research Pricing",
  "Test24 Basic: R5,000 per idea (50% off)",
  "Test24 Pro: R45,000 per study (10% off)",
  "Private Dashboard Access",
  "Priority Email Support",
  "Monthly Industry Insights",
];

export default function CheckoutMembershipEntry() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    console.log("Proceeding to checkout with Entry membership");
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const annualPrice = 60000;
  const monthlyEquivalent = 5000;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/#membership")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Membership Plans
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Entry Membership</h1>
                  <p className="text-muted-foreground">Annual Plan</p>
                </div>
              </div>
              <p className="text-lg">
                For startups & small teams seeking affordable research insights
              </p>
            </div>

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
                      <p className="text-2xl font-bold text-primary">R5,000</p>
                      <p className="text-sm text-muted-foreground">per idea (50% off PAYG)</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-1">Test24 Pro</h4>
                      <p className="text-2xl font-bold text-primary">R45,000</p>
                      <p className="text-sm text-muted-foreground">per study (10% off PAYG)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {entryFeatures.map((feature, index) => (
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
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium">Entry Membership</p>
                    <p className="text-sm text-muted-foreground mt-1">Annual billing</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Price</span>
                    <span data-testid="text-annual-price">{formatPrice(annualPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Equivalent</span>
                    <span className="text-accent">{formatPrice(monthlyEquivalent)}/month</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Due Today</span>
                    <span className="text-primary" data-testid="text-total">
                      {formatPrice(annualPrice)}
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
                  <p className="text-xs text-primary font-medium">
                    Start saving on research today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
