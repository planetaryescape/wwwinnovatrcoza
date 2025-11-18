import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Rocket, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const features = [
  "24hr Turnaround",
  "Custom audience, reach & question flexibility",
  "+100 Consumer Reach, 10-15 min Survey",
  "+100 AI Qual Voice of the Consumer Videos",
  "Robust Report with unlimited Filtering",
  "Strategic Recommendations from AI + Human Experts",
];

export default function CheckoutProPAYG() {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const pricePerStudy = 50000;

  const handleCheckout = () => {
    console.log("Proceeding to checkout with quantity:", quantity);
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const totalPrice = pricePerStudy * quantity;

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
                <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Test24 Pro</h1>
                  <p className="text-muted-foreground">Pay As You Go</p>
                </div>
              </div>
              <p className="text-lg">
                Enterprise Level, Quant & Qual Testing in 24hrs
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Select Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Number of Studies</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        data-testid="button-decrease-quantity"
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 text-center"
                        data-testid="input-quantity"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        data-testid="button-increase-quantity"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatPrice(pricePerStudy)} per study
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm font-medium">💡 Need multiple studies?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider our membership plans for better rates and included credits
                    </p>
                    <Button
                      variant="ghost"
                      className="p-0 h-auto mt-2 hover:bg-transparent text-primary"
                      onClick={() => setLocation("/#membership")}
                    >
                      View Membership Options →
                    </Button>
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
                  <h3 className="font-semibold mb-2">Selected Service</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium">Test24 Pro</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quantity} {quantity === 1 ? "Study" : "Studies"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatPrice(pricePerStudy)} × {quantity}
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
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
                    Custom pricing for 10+ studies
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
