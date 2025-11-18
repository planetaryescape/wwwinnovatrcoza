import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Zap, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const creditPackages = [
  {
    id: "1x",
    credits: 1,
    price: 10000,
    discount: 0,
    popular: false,
  },
  {
    id: "10x",
    credits: 10,
    price: 90000,
    originalPrice: 100000,
    discount: 10,
    popular: true,
  },
  {
    id: "20x",
    credits: 20,
    price: 170000,
    originalPrice: 200000,
    discount: 15,
    popular: false,
  },
];

const features = [
  "24hr turnaround for rapid validation",
  "Flexible idea volume with no minimum",
  "X100 Consumer Reach, 5min Survey",
  "Automated brief upload portal saving you time",
  "Final Reports emailed 24hrs later",
];

export default function CheckoutBasicPAYG() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState("10x");

  const handleCheckout = () => {
    console.log("Proceeding to checkout with package:", selectedPackage);
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Test24 Basic</h1>
                  <p className="text-muted-foreground">Pay As You Go</p>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Choose Your Credit Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPackage === pkg.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                    data-testid={`package-${pkg.id}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPackage === pkg.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {selectedPackage === pkg.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">
                              {pkg.credits}x Idea Credit{pkg.credits > 1 ? "s" : ""}
                            </h3>
                            {pkg.discount > 0 && (
                              <p className="text-sm text-accent font-semibold">
                                Save {pkg.discount}%
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">
                          {pkg.credits === 1
                            ? "Perfect for testing a single concept"
                            : `Test ${pkg.credits} ideas at a discounted rate`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(pkg.price)}
                        </div>
                        {pkg.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(pkg.originalPrice)}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatPrice(Math.round(pkg.price / pkg.credits))} per credit
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
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
            <Card className="sticky top-4 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Selected Package</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium">
                      {creditPackages.find((p) => p.id === selectedPackage)?.credits}x Test24 Basic Credits
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay As You Go
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatPrice(
                        creditPackages.find((p) => p.id === selectedPackage)?.price || 0
                      )}
                    </span>
                  </div>
                  {(creditPackages.find((p) => p.id === selectedPackage)?.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Discount ({creditPackages.find((p) => p.id === selectedPackage)?.discount}%)</span>
                      <span>
                        -{formatPrice(
                          (creditPackages.find((p) => p.id === selectedPackage)?.originalPrice || 0) -
                          (creditPackages.find((p) => p.id === selectedPackage)?.price || 0)
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(
                        creditPackages.find((p) => p.id === selectedPackage)?.price || 0
                      )}
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

                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Secure payment processing
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Credits never expire
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
