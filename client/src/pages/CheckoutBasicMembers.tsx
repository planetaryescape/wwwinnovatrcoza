// Test24 Basic public checkout with member pricing
// - Detects if the logged in user has an active Entry Membership
// - Applies member Test24 Basic pricing automatically for existing members
// - For non members, allows adding Entry Membership to unlock member pricing
// - Anonymous visitors see a prompt to log in for member pricing

import { ArrowLeft, Check, Zap, ShoppingCart, Star, LogIn, Crown, Shield, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
  cardBg: "#FFFFFF",
  border: "#E5E3DE",
  borderLight: "#EDEBE7",
  textPrimary: "#0D0B1F",
  textSecondary: "#4A4862",
  textTertiary: "#8A879A",
};

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
    description: "Perfect for testing a single concept",
  },
  {
    id: "10x",
    credits: 10,
    memberPrice: 50000,
    regularPrice: 55000,
    popular: true,
    description: "Test 10 ideas — best value per credit",
  },
  {
    id: "20x",
    credits: 20,
    memberPrice: 100000,
    regularPrice: 110000,
    popular: false,
    description: "Scale your testing with 20 concepts",
  },
];

const featuresBase = [
  "24hr turnaround for rapid validation",
  "Flexible idea volume with no minimum",
  "X100 Consumer Reach, 5min Survey",
  "Automated brief upload portal",
  "Final Reports emailed 24hrs later",
  "{memberRate} per concept member rate",
  "Priority support",
];

const responsiveStyles = `
  @media (max-width: 860px) {
    .checkout-grid { grid-template-columns: 1fr !important; }
    .checkout-features-grid { grid-template-columns: 1fr !important; }
  }
`;

export default function CheckoutBasicMembers() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get("ref");
  const backLabel =
    ref === "home-pricing"
      ? "Back to Pricing"
      : ref === "home-membership" || ref === "research-membership"
      ? "Back to Memberships"
      : "Back to Our Offering";
  const backHref =
    ref === "home-pricing"
      ? "/#pricing"
      : ref === "home-membership"
      ? "/#membership"
      : ref === "research-membership"
      ? "/research#membership"
      : "/research#our-offering";

  const { user, isAuthenticated, isMember, membershipTier } = useAuth();
  const { formatPrice } = useCurrency();

  const [selectedPackage, setSelectedPackage] = useState("10x");
  const [addMembership, setAddMembership] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useSEO({
    title: "Test24 Basic — Buy Credits | Innovatr",
    description: "Purchase Test24 Basic credits and get 24-hour consumer research results. Member pricing available. Start testing your ideas today.",
    canonicalUrl: "https://www.innovatr.co.za/checkout/basic-members",
  });

  const isLoggedIn = isAuthenticated && user !== null;
  const hasActiveEntryMembership = Boolean(
    isLoggedIn && isMember && membershipTier && membershipTier !== "STARTER"
  );

  const features = featuresBase.map((f) =>
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
    ? selectedPkg?.memberPrice || 0
    : selectedPkg?.regularPrice || 0;

  const memberSavings = useMemo(() => {
    const pkg = creditPackages.find((p) => p.id === selectedPackage);
    if (!pkg) return 0;
    return pkg.regularPrice - pkg.memberPrice;
  }, [selectedPackage]);

  const entryPlanCost = hasActiveEntryMembership ? 0 : addMembership ? ENTRY_PLAN_COST : 0;
  const grandTotal = entryPlanCost + creditsCost;

  const orderItems = [
    ...(entryPlanCost > 0
      ? [{ type: "membership", description: "Entry Membership (Annual)", quantity: 1, unitAmount: "60000" }]
      : []),
    {
      type: "credits_basic",
      description: `${selectedPkg?.credits}x Test24 Basic Credits`,
      quantity: selectedPkg?.credits || 1,
      unitAmount: effectiveIsMember ? "5000" : "5500",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.offWhite, color: BRAND.textPrimary, fontFamily: '"DM Sans", sans-serif' }}>
      <style>{responsiveStyles}</style>
      <PublicNavbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Back link */}
        <button
          onClick={() => setLocation(backHref)}
          data-testid="button-back"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            color: BRAND.textTertiary,
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "inherit",
            marginBottom: 40,
            padding: "4px 0",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textPrimary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textTertiary; }}
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: `${BRAND.coral}14`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Zap size={26} color={BRAND.coral} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: BRAND.dark, fontFamily: '"Playfair Display", serif' }}>
              Test24 Basic
            </h1>
            <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: 0, marginTop: 2 }}>
              24-hour consumer research — fast, affordable, actionable
            </p>
          </div>
        </div>

        {/* Member status banner */}
        {hasActiveEntryMembership ? (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `${BRAND.violet}10`,
            border: `1px solid ${BRAND.violet}30`,
            borderRadius: 100,
            padding: "6px 14px",
            marginBottom: 36,
          }}>
            <Crown size={14} color={BRAND.violet} />
            <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.violet }}>
              {getTierLabel(membershipTier)} Member — Member Pricing Applied
            </span>
          </div>
        ) : (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `${BRAND.violet}0C`,
            border: `1px solid ${BRAND.violet}25`,
            borderRadius: 100,
            padding: "6px 14px",
            marginBottom: 36,
          }}>
            <Star size={14} color={BRAND.violet} />
            <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.violet }}>
              Member Pricing Available — Save {formatPrice(REGULAR_PRICE_PER_CREDIT - MEMBER_PRICE_PER_CREDIT)} per credit
            </span>
          </div>
        )}

        {/* Main layout */}
        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Membership status card */}
            <div style={{
              background: BRAND.cardBg,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: BRAND.dark }}>
                {hasActiveEntryMembership ? "Your Membership" : "Entry Plan Membership"}
              </h2>

              {hasActiveEntryMembership ? (
                <div style={{
                  background: `${BRAND.violet}08`,
                  border: `1px solid ${BRAND.violet}22`,
                  borderRadius: 12,
                  padding: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Check size={16} color={BRAND.violet} />
                    <span style={{ fontWeight: 600, color: BRAND.violet, fontSize: 14 }}>
                      Active {getTierLabel(membershipTier)} Membership
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
                    Your membership is active — {formatPrice(MEMBER_PRICE_PER_CREDIT)} member rate applied to all credits below.
                  </p>
                </div>
              ) : isLoggedIn ? (
                <>
                  <p style={{ fontSize: 14, color: BRAND.textSecondary, marginBottom: 16 }}>
                    Add an Entry Membership to unlock member pricing and save on every credit.
                  </p>

                  {/* Add membership option */}
                  <div
                    onClick={() => setAddMembership(true)}
                    data-testid="radio-add-membership"
                    style={{
                      border: `2px solid ${addMembership ? BRAND.violet : BRAND.border}`,
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                      marginBottom: 12,
                      background: addMembership ? `${BRAND.violet}08` : BRAND.cardBg,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${addMembership ? BRAND.violet : BRAND.textTertiary}`,
                        background: addMembership ? BRAND.violet : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                        transition: "all 0.2s",
                      }}>
                        {addMembership && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 4 }}>
                          Add Entry Membership + unlock member pricing
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.textTertiary, marginBottom: 12 }}>
                          One annual fee. Member pricing on all Test24 credits.
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: BRAND.violet }}>
                            {formatPrice(ENTRY_PLAN_COST)}/year
                          </span>
                          <span style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600 }}>
                            Save {formatPrice(memberSavings)} on this order
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Continue without option */}
                  <div
                    onClick={() => setAddMembership(false)}
                    data-testid="radio-without-membership"
                    style={{
                      border: `2px solid ${!addMembership ? BRAND.violet : BRAND.border}`,
                      borderRadius: 12,
                      padding: 20,
                      cursor: "pointer",
                      background: !addMembership ? `${BRAND.violet}08` : BRAND.cardBg,
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${!addMembership ? BRAND.violet : BRAND.textTertiary}`,
                        background: !addMembership ? BRAND.violet : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                        transition: "all 0.2s",
                      }}>
                        {!addMembership && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 4 }}>
                          Continue without membership
                        </div>
                        <div style={{ fontSize: 13, color: BRAND.textTertiary }}>
                          Pay the standard rate for credits only.
                        </div>
                      </div>
                    </div>
                  </div>

                  {addMembership && (
                    <div style={{
                      background: `${BRAND.coral}0A`,
                      border: `1px solid ${BRAND.coral}25`,
                      borderRadius: 12,
                      padding: 14,
                      marginTop: 16,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}>
                      <Check size={15} color={BRAND.coral} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: BRAND.coral, marginBottom: 2 }}>
                          Entry Membership added
                        </div>
                        <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                          Member pricing will apply to this order and all future Test24 credits for 12 months.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{
                    background: `${BRAND.violet}06`,
                    border: `1px solid ${BRAND.violet}18`,
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 16,
                  }}>
                    <LogIn size={18} color={BRAND.textTertiary} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: BRAND.dark, marginBottom: 4 }}>
                        Log in to unlock member pricing
                      </div>
                      <div style={{ fontSize: 13, color: BRAND.textSecondary }}>
                        Members save {formatPrice(REGULAR_PRICE_PER_CREDIT - MEMBER_PRICE_PER_CREDIT)} per Test24 Basic credit.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    data-testid="button-login-member-pricing"
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      background: "transparent",
                      border: `1.5px solid ${BRAND.violet}`,
                      borderRadius: 10,
                      color: BRAND.violet,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = `${BRAND.violet}0A`; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = "transparent"; }}
                  >
                    <LogIn size={15} />
                    Log in for member pricing
                  </button>
                </>
              )}
            </div>

            {/* Credit package selector */}
            <div style={{
              background: BRAND.cardBg,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Choose Your Credit Package
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {creditPackages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  const pricePerCredit = effectiveIsMember ? MEMBER_PRICE_PER_CREDIT : REGULAR_PRICE_PER_CREDIT;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      data-testid={`package-${pkg.id}`}
                      style={{
                        position: "relative",
                        border: `2px solid ${isSelected ? BRAND.coral : BRAND.borderLight}`,
                        borderRadius: 14,
                        padding: "20px 24px",
                        cursor: "pointer",
                        background: isSelected ? `${BRAND.coral}08` : BRAND.cardBg,
                        transition: "all 0.2s",
                      }}
                    >
                      {pkg.popular && (
                        <div style={{
                          position: "absolute",
                          top: -12,
                          right: 20,
                          background: BRAND.coral,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          padding: "4px 12px",
                          borderRadius: 100,
                        }}>
                          BEST VALUE
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            border: `2px solid ${isSelected ? BRAND.coral : BRAND.textTertiary}`,
                            background: isSelected ? BRAND.coral : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.2s",
                          }}>
                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 17, color: BRAND.dark, marginBottom: 2 }}>
                              {pkg.credits}x Idea Credit{pkg.credits > 1 ? "s" : ""}
                            </div>
                            <div style={{ fontSize: 13, color: BRAND.textTertiary }}>
                              {pkg.description}
                            </div>
                            {effectiveIsMember && (
                              <div style={{ fontSize: 12, color: BRAND.violet, fontWeight: 600, marginTop: 4 }}>
                                Member Pricing
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {effectiveIsMember ? (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                                <Star size={13} color={BRAND.violet} fill={BRAND.violet} />
                                <span style={{ fontSize: 22, fontWeight: 800, color: BRAND.dark }}>
                                  {formatPrice(pkg.memberPrice)}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: BRAND.textTertiary, textDecoration: "line-through", marginTop: 2 }}>
                                {formatPrice(pkg.regularPrice)}
                              </div>
                              <div style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600, marginTop: 2 }}>
                                Save {formatPrice(pkg.regularPrice - pkg.memberPrice)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.dark }}>
                                {formatPrice(pkg.regularPrice)}
                              </div>
                              <div style={{ fontSize: 12, color: BRAND.textTertiary, marginTop: 2 }}>
                                {formatPrice(pricePerCredit)} per credit
                              </div>
                              <div style={{ fontSize: 12, color: BRAND.violet, fontWeight: 600, marginTop: 2 }}>
                                {formatPrice(pkg.memberPrice)} for members
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What's included */}
            <div style={{
              background: BRAND.cardBg,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                What's Included
              </h2>
              <div className="checkout-features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                {features.map((feature, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={15} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: BRAND.textSecondary, lineHeight: 1.5 }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Order summary */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{
              background: BRAND.cardBg,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <ShoppingCart size={18} color={BRAND.coral} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: BRAND.dark, margin: 0 }}>
                  Order Summary
                </h2>
              </div>

              {/* Order items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {hasActiveEntryMembership ? (
                  <div style={{
                    background: `${BRAND.violet}08`,
                    border: `1px solid ${BRAND.violet}20`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Check size={13} color={BRAND.violet} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.violet }}>
                        Active {getTierLabel(membershipTier)} Membership
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                      {formatPrice(MEMBER_PRICE_PER_CREDIT)} per credit member rate
                    </div>
                  </div>
                ) : addMembership ? (
                  <div style={{
                    background: `${BRAND.violet}08`,
                    border: `1px solid ${BRAND.violet}20`,
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>
                        Entry Membership
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.violet }}>
                        {formatPrice(ENTRY_PLAN_COST)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                      Annual plan — 12 months
                    </div>
                  </div>
                ) : null}

                <div style={{
                  background: `${BRAND.offWhite}`,
                  border: `1px solid ${BRAND.borderLight}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>
                      {selectedPkg?.credits}x Test24 Basic Credits
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>
                      {formatPrice(creditsCost)}
                    </span>
                  </div>
                  {effectiveIsMember ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Star size={11} color={BRAND.violet} fill={BRAND.violet} />
                      <span style={{ fontSize: 12, color: BRAND.violet, fontWeight: 600 }}>Member Rate Applied</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: BRAND.textSecondary }}>Standard Rate</div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`,
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}>
                {entryPlanCost > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.textSecondary }}>Entry Plan (12 months)</span>
                    <span style={{ color: BRAND.dark }}>{formatPrice(entryPlanCost)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>Credits Package</span>
                  <span style={{ color: BRAND.dark }}>{formatPrice(creditsCost)}</span>
                </div>
                {effectiveIsMember && !hasActiveEntryMembership && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.coral }}>Member Savings</span>
                    <span style={{ color: BRAND.coral }}>-{formatPrice(memberSavings)}</span>
                  </div>
                )}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`,
                  paddingTop: 12,
                  marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total</span>
                  <span
                    data-testid="text-grand-total"
                    style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}
                  >
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                {hasActiveEntryMembership && (
                  <div style={{ textAlign: "center", fontSize: 12, color: BRAND.violet, fontWeight: 600, marginTop: 4 }}>
                    No Entry Plan fee — you're already a member!
                  </div>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}
                data-testid="button-proceed-checkout"
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  background: BRAND.coral,
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "opacity 0.2s, transform 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget).style.opacity = "0.9"; }}
                onMouseLeave={(e) => { (e.currentTarget).style.opacity = "1"; }}
                onMouseDown={(e) => { (e.currentTarget).style.transform = "scale(0.98)"; }}
                onMouseUp={(e) => { (e.currentTarget).style.transform = "scale(1)"; }}
              >
                <ShoppingCart size={17} />
                Proceed to Payment
              </button>

              {/* Trust signals */}
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>Secure payment processing</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>Credits never expire</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>All prices include VAT where applicable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InnovatrFooter />

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
