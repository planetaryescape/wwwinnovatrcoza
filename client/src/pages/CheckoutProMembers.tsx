import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Check, Rocket, ShoppingCart, Star, Users, AlertCircle, Info } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const reachPricing = [
  { reach: 100, memberPrice: 45000, regularPrice: 50000, label: "100 Consumers" },
  { reach: 200, memberPrice: 85500, regularPrice: 95000, label: "200 Consumers" },
  { reach: 500, memberPrice: 202500, regularPrice: 225000, label: "500 Consumers" },
];

const features = [
  "24hr Turnaround",
  "Custom audience, reach & question flexibility",
  "Custom Consumer Reach per Study",
  "AI Qual Voice of the Consumer Videos",
  "Private Results Dashboard Access (members)",
  "Robust Report with unlimited Filtering",
  "Strategic Recommendations from AI + Human Experts",
  "Priority member support",
];

export default function CheckoutProMembers() {
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedReach, setSelectedReach] = useState(100);
  const [hasEntryPlan, setHasEntryPlan] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    console.log("Proceeding to checkout:", { quantity, reach: selectedReach, totalConsumers, finalTotal, hasEntryPlan });
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const pricePerStudy = useMemo(() => {
    const tier = reachPricing.find((r) => r.reach === selectedReach);
    return tier?.memberPrice || reachPricing[0].memberPrice;
  }, [selectedReach]);

  const regularPricePerStudy = useMemo(() => {
    const tier = reachPricing.find((r) => r.reach === selectedReach);
    return tier?.regularPrice || reachPricing[0].regularPrice;
  }, [selectedReach]);

  const subtotal = useMemo(() => {
    return pricePerStudy * quantity;
  }, [pricePerStudy, quantity]);

  const hasVolumeDiscount = quantity >= 3;
  const volumeDiscountAmount = useMemo(() => {
    return hasVolumeDiscount ? subtotal * 0.1 : 0;
  }, [hasVolumeDiscount, subtotal]);

  const finalTotal = useMemo(() => {
    return subtotal - volumeDiscountAmount;
  }, [subtotal, volumeDiscountAmount]);

  const totalConsumers = useMemo(() => {
    return quantity * selectedReach;
  }, [quantity, selectedReach]);

  const memberSavings = useMemo(() => {
    return (regularPricePerStudy - pricePerStudy) * quantity;
  }, [regularPricePerStudy, pricePerStudy, quantity]);

  const entryPlanCost = hasEntryPlan ? 0 : 60000;
  const grandTotal = entryPlanCost + finalTotal;

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
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <p className="text-accent font-semibold">Member Pricing</p>
                  </div>
                </div>
              </div>
              <p className="text-lg mb-4">
                Enterprise Level, Quant & Qual Testing in 24hrs
              </p>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm font-medium">
                  Save 10% with member pricing - {formatPrice(regularPricePerStudy - pricePerStudy)} off per study
                </p>
              </div>
            </div>

            <Card className="mb-6 border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Entry Plan Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm">
                    To access member pricing on Test24 Pro studies, you need an active Entry Membership plan.
                  </p>
                  
                  <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <Checkbox 
                      id="has-entry-plan" 
                      checked={hasEntryPlan}
                      onCheckedChange={(checked) => setHasEntryPlan(checked as boolean)}
                      data-testid="checkbox-has-entry-plan"
                    />
                    <div className="flex-1">
                      <label 
                        htmlFor="has-entry-plan" 
                        className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I already have an active Entry Plan membership
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Check this if you purchased an Entry Plan within the last 12 months
                      </p>
                    </div>
                  </div>

                  {!hasEntryPlan && (
                    <>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">Entry Membership</h3>
                            <p className="text-sm text-muted-foreground">One-time annual fee</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">R60,000/year</div>
                            <div className="text-xs text-muted-foreground">or R5,000/month</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t">
                          <Check className="w-4 h-4 text-primary" />
                          <span>10% discount on all Test24 Pro studies</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span>Access to Trends Reports & Priority Support</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild variant="outline" className="flex-1" data-testid="button-learn-more-entry">
                          <Link href="/#membership">
                            Learn More About Entry Plan
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}

                  {hasEntryPlan && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-5 h-5 text-primary" />
                        <p className="font-semibold text-primary">Existing Member</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You'll only be charged for the studies. Your Entry Plan membership remains active and you'll continue to enjoy 10% member discounts.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Configure Your Study</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="quantity">Number of Studies</Label>
                      {hasVolumeDiscount && (
                        <span className="text-sm text-primary font-medium">
                          10% volume discount applied!
                        </span>
                      )}
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
                                  ~{formatPrice(Math.round(tier.memberPrice / tier.reach))} per consumer
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-accent fill-accent" />
                                <div className="text-xl font-bold text-primary">
                                  {formatPrice(tier.memberPrice)}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(tier.regularPrice)}
                              </div>
                              <div className="text-xs text-accent font-medium">
                                Save {formatPrice(tier.regularPrice - tier.memberPrice)}
                              </div>
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

                  {hasVolumeDiscount && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-primary">
                        Volume Discount Applied: 10% off for 3+ studies
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Additional savings: {formatPrice(volumeDiscountAmount)}
                      </p>
                    </div>
                  )}

                  {memberSavings > 0 && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <p className="text-sm font-medium text-accent">
                          Member Savings: {formatPrice(memberSavings)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You're saving 10% compared to PAYG pricing
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
            <Card className="sticky top-4 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Your Order</h3>
                  
                  <div className="space-y-3">
                    {!hasEntryPlan && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">Entry Membership</p>
                          <p className="font-bold text-primary">{formatPrice(60000)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Annual plan - One-time fee for 12 months</p>
                      </div>
                    )}

                    {hasEntryPlan && (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-accent" />
                          <p className="font-semibold text-accent">Active Entry Membership</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Enjoying 10% member discount on all studies</p>
                      </div>
                    )}

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Test24 Pro Studies</p>
                        <p className="font-bold">{formatPrice(finalTotal)}</p>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Studies</span>
                        <span className="font-medium" data-testid="text-studies-count">{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Reach per Study</span>
                        <span className="font-medium" data-testid="text-reach-per-study">{selectedReach}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Total Consumers</span>
                        <span className="font-bold text-accent" data-testid="text-summary-total-consumers">
                          {totalConsumers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <p className="text-xs text-accent font-medium">10% Member Discount Applied</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  {!hasEntryPlan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entry Plan (12 months)</span>
                      <span>{formatPrice(60000)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pro Studies ({quantity}x)</span>
                    <span data-testid="text-subtotal">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-grand-total">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  {hasEntryPlan && (
                    <p className="text-xs text-accent text-center pt-2 font-medium">
                      No Entry Plan fee - You're already a member!
                    </p>
                  )}
                  {!hasEntryPlan && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {formatPrice(Math.round(grandTotal / totalConsumers))} per consumer (all studies combined)
                    </p>
                  )}
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
                    <p className="text-xs text-primary mt-1 font-medium">
                      Add {3 - quantity} more {3 - quantity === 1 ? "study" : "studies"} for 10% volume discount
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Exclusive member benefits included
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
