import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Check, Rocket, ShoppingCart, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";

const reachPricing = [
  { reach: 100, price: 50000, label: "100 Consumers" },
  { reach: 200, price: 95000, label: "200 Consumers" },
  { reach: 500, price: 225000, label: "500 Consumers" },
];

const features = [
  "24hr Turnaround",
  "Custom audience, reach & question flexibility",
  "Custom Consumer Reach per Study",
  "AI Qual Voice of the Consumer Videos",
  "Robust Report with unlimited Filtering",
  "Strategic Recommendations from AI + Human Experts",
];

export default function CheckoutProPAYG() {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedReach, setSelectedReach] = useState(100);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    console.log("Proceeding to checkout:", { quantity, reach: selectedReach, totalConsumers, finalTotal });
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const pricePerStudy = useMemo(() => {
    const tier = reachPricing.find((r) => r.reach === selectedReach);
    return tier?.price || reachPricing[0].price;
  }, [selectedReach]);

  const subtotal = useMemo(() => {
    return pricePerStudy * quantity;
  }, [pricePerStudy, quantity]);

  const hasDiscount = quantity >= 3;
  const discountAmount = useMemo(() => {
    return hasDiscount ? subtotal * 0.1 : 0;
  }, [hasDiscount, subtotal]);

  const finalTotal = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const totalConsumers = useMemo(() => {
    return quantity * selectedReach;
  }, [quantity, selectedReach]);

  const pricePerConsumer = useMemo(() => {
    return Math.round(pricePerStudy / selectedReach);
  }, [pricePerStudy, selectedReach]);

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
                <CardTitle className="text-xl">Configure Your Study</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="quantity">Number of Studies</Label>
                      <span className="text-sm text-primary font-medium">
                        10% discount for 3 or more
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
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
                  </div>

                  <div>
                    <Label>Reach per Study</Label>
                    <RadioGroup
                      value={selectedReach.toString()}
                      onValueChange={(value) => setSelectedReach(parseInt(value))}
                      className="mt-3 space-y-3"
                    >
                      {reachPricing.map((tier) => (
                        <div
                          key={tier.reach}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            selectedReach === tier.reach
                              ? "border-primary bg-primary/5"
                              : "border-border hover-elevate"
                          }`}
                          onClick={() => setSelectedReach(tier.reach)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem
                                value={tier.reach.toString()}
                                id={`reach-${tier.reach}`}
                                data-testid={`radio-reach-${tier.reach}`}
                              />
                              <div>
                                <Label
                                  htmlFor={`reach-${tier.reach}`}
                                  className="cursor-pointer font-semibold"
                                >
                                  {tier.label}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  ~{formatPrice(Math.round(tier.price / tier.reach))} per consumer
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary">
                                {formatPrice(tier.price)}
                              </div>
                              <div className="text-xs text-muted-foreground">per study</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-accent" />
                      <p className="font-semibold text-accent">Total Consumers Reached</p>
                    </div>
                    <p className="text-3xl font-bold" data-testid="text-total-consumers">
                      {totalConsumers.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quantity} {quantity === 1 ? "study" : "studies"} × {selectedReach} consumers
                    </p>
                  </div>

                  {hasDiscount && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-primary">
                        Volume Discount Applied: 10% off for 3+ studies
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You're saving {formatPrice(discountAmount)}
                      </p>
                    </div>
                  )}
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
                  <h3 className="font-semibold mb-2">Selected Configuration</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Studies</span>
                      <span className="font-medium" data-testid="text-studies-count">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reach per Study</span>
                      <span className="font-medium" data-testid="text-reach-per-study">{selectedReach}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-muted-foreground">Total Consumers</span>
                      <span className="font-bold text-accent" data-testid="text-summary-total-consumers">
                        {totalConsumers.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatPrice(pricePerStudy)} × {quantity}
                    </span>
                    <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Volume Discount (10%)</span>
                      <span data-testid="text-discount">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-final-total">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {formatPrice(Math.round(finalTotal / totalConsumers))} per consumer
                  </p>
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
                  {quantity < 3 && (
                    <p className="text-xs text-accent mt-1 font-medium">
                      Add {3 - quantity} more {3 - quantity === 1 ? "study" : "studies"} for 10% off
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
