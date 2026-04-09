// Test24 Basic public checkout with member pricing
// - Detects if the logged in user has an active Entry Membership
// - Applies member Test24 Basic pricing automatically for existing members
// - For non members, allows adding Entry Membership to unlock member pricing
// - Anonymous visitors see a prompt to log in for member pricing

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Zap, ShoppingCart, Star, AlertCircle, Info, LogIn, Crown } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import OrderFormDialog from "@/components/OrderFormDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const MEMBER_PRICE_PER_CREDIT = 5000;
const REGULAR_PRICE_PER_CREDIT = 5500;
const ENTRY_PLAN_COST = 60000;

const creditPackages = [
  {
    id: "1x",
    credits: 1,
    memberPrice: 5000,
    regularPrice: 5500,
    popular: false,
  },
  {
    id: "10x",
    credits: 10,
    memberPrice: 50000,
    regularPrice: 55000,
    popular: true,
  },
  {
    id: "20x",
    credits: 20,
    memberPrice: 100000,
    regularPrice: 110000,
    popular: false,
  },
];

const featuresBase = [
  "24hr turnaround for rapid validation",
  "Flexible idea volume with no minimum",
  "X100 Consumer Reach, 5min Survey",
  "Automated brief upload portal saving you time",
  "Final Reports emailed 24hrs later",
  "{memberRate} per concept member rate",
  "Priority support",
];

export default function CheckoutBasicMembers() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : '/research#our-offering';
  const { user, isAuthenticated, isMember, membershipTier } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [selectedPackage, setSelectedPackage] = useState("10x");
  const [addMembership, setAddMembership] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const isLoggedIn = isAuthenticated && user !== null;
  const hasActiveEntryMembership = Boolean(
    isLoggedIn && isMember && membershipTier && membershipTier !== "STARTER"
  );

  // Generate features with formatted currency
  const features = featuresBase.map(f => 
    f.replace("{memberRate}", formatPrice(MEMBER_PRICE_PER_CREDIT))
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const getTierLabel = (tier: string | undefined) => {
    switch (tier) {
      case "GROWTH": return "Growth";
      case "SCALE": return "Scale";
      default: return "Member";
    }
  };

  const effectiveIsMember = hasActiveEntryMembership || addMembership;
  
  const selectedPkg = creditPackages.find((p) => p.id === selectedPackage);
  const creditsCost = effectiveIsMember 
    ? (selectedPkg?.memberPrice || 0) 
    : (selectedPkg?.regularPrice || 0);
  
  const memberSavings = useMemo(() => {
    const pkg = creditPackages.find((p) => p.id === selectedPackage);
    if (!pkg) return 0;
    return pkg.regularPrice - pkg.memberPrice;
  }, [selectedPackage]);

  const entryPlanCost = hasActiveEntryMembership ? 0 : (addMembership ? ENTRY_PLAN_COST : 0);
  const grandTotal = entryPlanCost + creditsCost;

  const orderItems = [
    ...(entryPlanCost > 0 ? [{
      type: "membership",
      description: "Entry Membership (Annual)",
      quantity: 1,
      unitAmount: "60000",
    }] : []),
    {
      type: "credits_basic",
      description: `${selectedPkg?.credits}x Test24 Basic Credits`,
      quantity: selectedPkg?.credits || 1,
      unitAmount: effectiveIsMember ? "5000" : "5500",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-serif font-bold">Test24 Basic</h1>
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
                Fast, affordable idea testing with 100 consumer responses in 24 hours
              </p>
              
              {hasActiveEntryMembership ? (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-5 h-5 text-accent" />
                    <p className="font-semibold text-accent">Member pricing applied</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You already have an active {getTierLabel(membershipTier)} Membership. Your Test24 Basic credits are at the {formatPrice(MEMBER_PRICE_PER_CREDIT)} member rate.
                  </p>
                </div>
              ) : isLoggedIn ? (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <p className="font-semibold text-primary">Save with member pricing</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Become a member today and save {formatPrice(REGULAR_PRICE_PER_CREDIT - MEMBER_PRICE_PER_CREDIT)} on every Test24 Basic credit.
                  </p>
                </div>
              ) : (
                <div className="bg-muted/50 border rounded-lg p-4">
                  <p className="text-sm font-medium">
                    Members save {formatPrice(REGULAR_PRICE_PER_CREDIT - MEMBER_PRICE_PER_CREDIT)} per Test24 Basic credit
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
                          Your {getTierLabel(membershipTier)} Membership is active, so you qualify for member pricing on all Test24 Basic credits.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          You will only be billed for the credits shown in your order summary.
                        </p>
                      </div>
                    </>
                  ) : isLoggedIn ? (
                    <>
                      <p className="text-sm">
                        To access member pricing on Test24 Basic credits, you need an active Entry Membership plan.
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
                                One annual fee. Member pricing on all Test24 credits.
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
                                Pay the standard rate for credits only.
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
                            Member pricing will apply to this order and all future Test24 credits for 12 months.
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
                            Log in or create an account to unlock member pricing on Test24 Basic.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Members save {formatPrice(REGULAR_PRICE_PER_CREDIT - MEMBER_PRICE_PER_CREDIT)} per Test24 Basic credit.
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
                <CardTitle className="text-xl">Choose Your Credit Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {creditPackages.map((pkg) => {
                  const displayPrice = effectiveIsMember ? pkg.memberPrice : pkg.regularPrice;
                  const pricePerCredit = effectiveIsMember ? MEMBER_PRICE_PER_CREDIT : REGULAR_PRICE_PER_CREDIT;
                  return (
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
                            BEST VALUE
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
                              {effectiveIsMember ? (
                                <p className="text-sm text-accent font-semibold">
                                  Member Pricing
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Standard Pricing
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground ml-8">
                            {pkg.credits === 1
                              ? "Perfect for testing a single concept"
                              : `Test ${pkg.credits} ideas`}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          {effectiveIsMember ? (
                            <>
                              <div className="flex items-center gap-2 justify-end">
                                <Star className="w-4 h-4 text-accent fill-accent" />
                                <div className="text-2xl font-bold text-primary">
                                  {formatPrice(pkg.memberPrice)}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(pkg.regularPrice)}
                              </div>
                              <div className="text-xs text-accent font-medium mt-1">
                                Save {formatPrice(pkg.regularPrice - pkg.memberPrice)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-primary">
                                {formatPrice(pkg.regularPrice)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatPrice(pricePerCredit)} per credit
                              </div>
                              <div className="text-xs text-accent font-medium">
                                {formatPrice(pkg.memberPrice)} for members
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                    {hasActiveEntryMembership ? (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-4 h-4 text-accent" />
                          <p className="font-semibold text-accent">Active {getTierLabel(membershipTier)} Membership</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Enjoying {formatPrice(MEMBER_PRICE_PER_CREDIT)} per credit member rate</p>
                      </div>
                    ) : addMembership ? (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">Entry Membership</p>
                          <p className="font-bold text-primary">{formatPrice(ENTRY_PLAN_COST)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Annual plan - One-time fee for 12 months</p>
                      </div>
                    ) : null}

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">
                          {selectedPkg?.credits}x Test24 Basic Credits
                        </p>
                        <p className="font-bold">
                          {formatPrice(creditsCost)}
                        </p>
                      </div>
                      {effectiveIsMember ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <p className="text-xs text-accent font-medium">Member Rate Applied</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Standard Rate</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  {entryPlanCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entry Plan (12 months)</span>
                      <span>{formatPrice(entryPlanCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credits Package</span>
                    <span>{formatPrice(creditsCost)}</span>
                  </div>
                  {effectiveIsMember && !hasActiveEntryMembership && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Member Savings</span>
                      <span>-{formatPrice(memberSavings)}</span>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    All prices include VAT where applicable
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
        orderItems={orderItems}
        totalAmount={grandTotal}
        purchaseType="Test24 Basic Credits (Member)"
      />

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
}
