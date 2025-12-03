// Test24 Pro public checkout
// - Detects if the logged in user has an active Entry Membership
// - Applies member Test24 Pro pricing automatically for existing members
// - For non members, allows adding Entry Membership to unlock member pricing on this and future Pro studies
// - Anonymous visitors see standard pricing with a prompt to log in for member pricing

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Rocket, ShoppingCart, Star, Users, AlertCircle, Info, LogIn, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import OrderFormDialog from "@/components/OrderFormDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";

const reachPricing = [
  { reach: 100, memberPrice: 45000, regularPrice: 50000, label: "100 Consumers" },
  { reach: 200, memberPrice: 85500, regularPrice: 95000, label: "200 Consumers" },
  { reach: 500, memberPrice: 202500, regularPrice: 225000, label: "500 Consumers" },
];

const ENTRY_PLAN_COST = 60000;

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
  const { user, isAuthenticated, isMember, membershipTier } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedReach, setSelectedReach] = useState(100);
  const [addMembership, setAddMembership] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isLoggedIn = isAuthenticated && user !== null;
  const hasActiveEntryMembership = Boolean(
    isLoggedIn && isMember && membershipTier && membershipTier !== "STARTER"
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const memberPricePerStudy = useMemo(() => {
    const tier = reachPricing.find((r) => r.reach === selectedReach);
    return tier?.memberPrice || reachPricing[0].memberPrice;
  }, [selectedReach]);

  const regularPricePerStudy = useMemo(() => {
    const tier = reachPricing.find((r) => r.reach === selectedReach);
    return tier?.regularPrice || reachPricing[0].regularPrice;
  }, [selectedReach]);

  const effectiveIsMember = hasActiveEntryMembership || addMembership;
  const pricePerStudy = effectiveIsMember ? memberPricePerStudy : regularPricePerStudy;

  const subtotal = useMemo(() => {
    return pricePerStudy * quantity;
  }, [pricePerStudy, quantity]);

  const hasVolumeDiscount = quantity >= 3;
  const volumeDiscountAmount = useMemo(() => {
    return hasVolumeDiscount ? subtotal * 0.1 : 0;
  }, [hasVolumeDiscount, subtotal]);

  const studiesTotal = useMemo(() => {
    return subtotal - volumeDiscountAmount;
  }, [subtotal, volumeDiscountAmount]);

  const totalConsumers = useMemo(() => {
    return quantity * selectedReach;
  }, [quantity, selectedReach]);

  const memberSavings = useMemo(() => {
    return (regularPricePerStudy - memberPricePerStudy) * quantity;
  }, [regularPricePerStudy, memberPricePerStudy, quantity]);

  const entryPlanCost = hasActiveEntryMembership ? 0 : (addMembership ? ENTRY_PLAN_COST : 0);
  const grandTotal = entryPlanCost + studiesTotal;

  const getTierLabel = (tier: string | undefined) => {
    switch (tier) {
      case "GROWTH": return "Growth";
      case "SCALE": return "Scale";
      default: return "Member";
    }
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
                <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Test24 Pro</h1>
                  {hasActiveEntryMembership ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-accent" />
                      <p className="text-accent font-semibold">Member Pricing Applied</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <p className="text-accent font-semibold">Member Pricing Available</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-lg mb-4">
                Enterprise Level, Quant & Qual Testing in 24hrs
              </p>
              
              {hasActiveEntryMembership ? (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-5 h-5 text-accent" />
                    <p className="font-semibold text-accent">Member pricing applied</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You already have an active {getTierLabel(membershipTier)} Membership. Your Test24 Pro price includes the member discount.
                  </p>
                </div>
              ) : isLoggedIn ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <p className="font-semibold text-primary">Save with member pricing</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Become a member today and save {formatPrice(regularPricePerStudy - memberPricePerStudy)} on every Test24 Pro study.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 border rounded-lg p-4">
                  <p className="text-sm font-medium">
                    Members save {formatPrice(regularPricePerStudy - memberPricePerStudy)} per Test24 Pro study
                  </p>
                </div>
              )}
            </div>

            <Card className="mb-6 border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  {hasActiveEntryMembership ? "Membership Status" : "Entry Plan Membership"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {hasActiveEntryMembership ? (
                    <>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-accent text-accent-foreground">
                          <Check className="w-3 h-3 mr-1" />
                          Status: Active member
                        </Badge>
                        <Badge variant="outline">{getTierLabel(membershipTier)}</Badge>
                      </div>
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                        <p className="text-sm">
                          Your {getTierLabel(membershipTier)} Membership is active, so you qualify for member pricing on all Test24 Pro studies.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          You will only be billed for the Test24 Pro study shown in your order summary.
                        </p>
                      </div>
                    </>
                  ) : isLoggedIn ? (
                    <>
                      <p className="text-sm">
                        To access member pricing on Test24 Pro studies, you need an active Entry Membership plan.
                      </p>
                      
                      <RadioGroup
                        value={addMembership ? "add" : "without"}
                        onValueChange={(value) => setAddMembership(value === "add")}
                        className="space-y-3"
                      >
                        <div
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            addMembership
                              ? "border-primary bg-primary/5"
                              : "border-border hover-elevate"
                          }`}
                          onClick={() => setAddMembership(true)}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              value="add"
                              id="add-membership"
                              className="mt-1"
                              data-testid="radio-add-membership"
                            />
                            <div className="flex-1">
                              <Label htmlFor="add-membership" className="cursor-pointer font-semibold text-base">
                                Add Entry Membership and unlock member pricing
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                One annual fee. Member pricing on all Test24 Pro studies.
                              </p>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="text-lg font-bold text-primary">{formatPrice(ENTRY_PLAN_COST)}/year</div>
                                <div className="text-xs text-accent font-medium">
                                  Save {formatPrice(memberSavings)} on this order
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            !addMembership
                              ? "border-primary bg-primary/5"
                              : "border-border hover-elevate"
                          }`}
                          onClick={() => setAddMembership(false)}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem
                              value="without"
                              id="without-membership"
                              className="mt-1"
                              data-testid="radio-without-membership"
                            />
                            <div className="flex-1">
                              <Label htmlFor="without-membership" className="cursor-pointer font-semibold text-base">
                                Continue without membership
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Pay the standard Test24 Pro rate for this study only.
                              </p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>

                      {addMembership && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-accent" />
                            <p className="font-medium text-accent">Entry Membership added</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Member pricing will apply to this study and all future Test24 Pro studies for 12 months.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                        <LogIn className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Log in or create an account to unlock member pricing on Test24 Pro.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Members save {formatPrice(regularPricePerStudy - memberPricePerStudy)} per Test24 Pro study.
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowLoginDialog(true)}
                        data-testid="button-login-member-pricing"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Log in for member pricing
                      </Button>
                    </>
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
                      {reachPricing.map((tier) => {
                        const displayPrice = effectiveIsMember ? tier.memberPrice : tier.regularPrice;
                        return (
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
                                    ~{formatPrice(Math.round(displayPrice / tier.reach))} per consumer
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {effectiveIsMember ? (
                                  <>
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
                                  </>
                                ) : (
                                  <>
                                    <div className="text-xl font-bold text-primary">
                                      {formatPrice(tier.regularPrice)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">per study</div>
                                    <div className="text-xs text-accent font-medium">
                                      {formatPrice(tier.memberPrice)} for members
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

                  {effectiveIsMember && memberSavings > 0 && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <p className="text-sm font-medium text-accent">
                          Member Savings: {formatPrice(memberSavings)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You're saving 10% compared to standard pricing
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
                    {hasActiveEntryMembership && (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-accent" />
                          <p className="font-semibold text-accent">Active {getTierLabel(membershipTier)} Membership</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Member discount applied to all studies</p>
                      </div>
                    )}

                    {!hasActiveEntryMembership && addMembership && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">Entry Membership</p>
                          <p className="font-bold text-primary">{formatPrice(ENTRY_PLAN_COST)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Annual plan - One-time fee for 12 months</p>
                      </div>
                    )}

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Test24 Pro Studies</p>
                        <p className="font-bold">{formatPrice(studiesTotal)}</p>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Studies</span>
                        <span className="font-medium" data-testid="text-studies-count">{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Reach per Study</span>
                        <span className="font-medium" data-testid="text-reach-per-study">{selectedReach}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Price per Study</span>
                        <span className="font-medium">{formatPrice(pricePerStudy)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground">Total Consumers</span>
                        <span className="font-bold text-accent" data-testid="text-summary-total-consumers">
                          {totalConsumers.toLocaleString()}
                        </span>
                      </div>
                      
                      {effectiveIsMember && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <p className="text-xs text-accent font-medium">Member discount applied</p>
                        </div>
                      )}

                      {!effectiveIsMember && isLoggedIn && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            You are paying the standard Test24 Pro rate. Add an Entry Membership to unlock member pricing.
                          </p>
                        </div>
                      )}
                    </div>

                    {effectiveIsMember && (
                      <div className="text-sm p-3 bg-muted/30 rounded-lg">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Standard rate</span>
                          <span className="line-through">{formatPrice(regularPricePerStudy)} per study</span>
                        </div>
                        <div className="flex justify-between font-medium text-accent">
                          <span>Member rate</span>
                          <span>{formatPrice(memberPricePerStudy)} per study</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  {!hasActiveEntryMembership && addMembership && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entry Plan (12 months)</span>
                      <span>{formatPrice(ENTRY_PLAN_COST)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pro Studies ({quantity}x)</span>
                    <span data-testid="text-subtotal">{formatPrice(studiesTotal)}</span>
                  </div>
                  {hasVolumeDiscount && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Volume Discount (10%)</span>
                      <span>-{formatPrice(volumeDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-grand-total">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                  {hasActiveEntryMembership && (
                    <p className="text-xs text-accent text-center pt-2 font-medium">
                      No Entry Plan fee - You're already a member!
                    </p>
                  )}
                  {!hasActiveEntryMembership && addMembership && (
                    <p className="text-xs text-accent text-center pt-2 font-medium">
                      Entry Membership added. Member pricing will apply.
                    </p>
                  )}
                  {!effectiveIsMember && (
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
                  {effectiveIsMember && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Exclusive member benefits included
                    </p>
                  )}
                  {!effectiveIsMember && !isLoggedIn && (
                    <p className="text-xs text-accent mt-1 font-medium">
                      Log in to access member pricing
                    </p>
                  )}
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
          ...(!hasActiveEntryMembership && addMembership ? [{
            type: "membership",
            description: "Entry Membership (Annual)",
            quantity: 1,
            unitAmount: String(ENTRY_PLAN_COST),
          }] : []),
          {
            type: "study_pro",
            description: `${quantity}x Test24 Pro Study (${selectedReach} consumers each)`,
            quantity: quantity,
            unitAmount: String(pricePerStudy),
          },
        ]}
        totalAmount={grandTotal}
        purchaseType={effectiveIsMember ? "Test24 Pro Study (Member)" : "Test24 Pro Study (Pay As You Go)"}
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
}
