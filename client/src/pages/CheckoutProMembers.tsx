import { ArrowLeft, Check, Rocket, ShoppingCart, Star, Users, LogIn, Crown, Shield, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  cyan: "#4EC9E8",
  cyanDark: "#2596BE",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
  cardBg: "#FFFFFF",
  border: "#E5E3DE",
  borderLight: "#EDEBE7",
  textPrimary: "#0D0B1F",
  textSecondary: "#4A4862",
  textTertiary: "#8A879A",
};

const reachPricing = [
  { reach: 100, memberPrice: 45000, regularPrice: 50000, memberRate: 450, regularRate: 500, label: "100 Consumers" },
  { reach: 300, memberPrice: 128400, regularPrice: 142500, memberRate: 428, regularRate: 475, label: "300 Consumers" },
  { reach: 600, memberPrice: 243000, regularPrice: 270000, memberRate: 405, regularRate: 450, label: "600 Consumers" },
];

const ENTRY_PLAN_COST = 60000;

const features = [
  "24hr Turnaround",
  "Custom audience, reach & question flexibility",
  "Custom Consumer Reach per Survey",
  "AI Qual Voice of the Consumer Videos",
  "Private Results Dashboard Access (members)",
  "Robust Report with unlimited Filtering",
  "Strategic Recommendations from AI + Human Experts",
  "Priority member support",
];

const responsiveStyles = `
  @media (max-width: 860px) {
    .checkout-grid { grid-template-columns: 1fr !important; }
    .checkout-features-grid { grid-template-columns: 1fr !important; }
  }
  @keyframes checkout-glow-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }
  .checkout-cta-wrap {
    position: relative; border-radius: 14px; overflow: hidden; cursor: pointer;
  }
  .checkout-cta-glow {
    position: absolute; width: 220%; aspect-ratio: 1;
    top: 50%; left: 50%; border-radius: 50%; filter: blur(14px);
    background: conic-gradient(from 0deg, #3A2FBF, #E8503A, #4EC9E8, #3A2FBF);
    animation: checkout-glow-spin 5s linear infinite;
    pointer-events: none; opacity: 0.7;
  }
  .checkout-cta-wrap:hover .checkout-cta-glow {
    opacity: 1; animation-duration: 2.5s;
  }
`;

export default function CheckoutProMembers() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
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
    <div style={{ minHeight: "100vh", background: BRAND.offWhite, color: BRAND.textPrimary, fontFamily: '"DM Sans", sans-serif' }}>
      <style>{responsiveStyles}</style>
      <PublicNavbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "120px 24px 80px" }}>
        <button
          onClick={() => setLocation(backHref)}
          data-testid="button-back"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "none", border: "none", color: BRAND.textTertiary,
            cursor: "pointer", fontSize: 14, fontFamily: "inherit",
            marginBottom: 40, padding: "4px 0", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textPrimary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = BRAND.textTertiary; }}
        >
          <ArrowLeft size={16} />
          {backLabel}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: `${BRAND.violet}14`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Rocket size={26} color={BRAND.violet} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: BRAND.dark, fontFamily: '"Playfair Display", serif' }}>
              Test24 Pro
            </h1>
            {hasActiveEntryMembership ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Crown size={15} color={BRAND.cyanDark} />
                <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.cyanDark }}>Member Pricing Applied</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <Star size={15} color={BRAND.violet} fill={BRAND.violet} />
                <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.violet }}>Member Pricing Available</span>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: 16, color: BRAND.textSecondary, marginBottom: 20 }}>
          Enterprise Level, Quant & Qual Testing in 24hrs
        </p>

        {hasActiveEntryMembership ? (
          <div style={{
            background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
            borderRadius: 12, padding: 16, marginBottom: 36,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Check size={16} color={BRAND.cyanDark} />
              <span style={{ fontWeight: 600, fontSize: 14, color: BRAND.cyanDark }}>Member pricing applied</span>
            </div>
            <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
              You already have an active {getTierLabel(membershipTier)} Membership. Your Test24 Pro price includes the member discount.
            </p>
          </div>
        ) : isLoggedIn ? (
          <div style={{
            background: `${BRAND.violet}0A`, border: `1px solid ${BRAND.violet}20`,
            borderRadius: 12, padding: 16, marginBottom: 36,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Star size={16} color={BRAND.violet} fill={BRAND.violet} />
              <span style={{ fontWeight: 600, fontSize: 14, color: BRAND.violet }}>Save with member pricing</span>
            </div>
            <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
              Become a member today and save {formatPrice(regularPricePerStudy - memberPricePerStudy)} on every Test24 Pro study.
            </p>
          </div>
        ) : (
          <div style={{
            background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
            borderRadius: 12, padding: 16, marginBottom: 36,
          }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: BRAND.textSecondary, margin: 0 }}>
              Members save {formatPrice(regularPricePerStudy - memberPricePerStudy)} per Test24 Pro study
            </p>
          </div>
        )}

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{
              background: BRAND.cardBg, border: `2px solid ${BRAND.violet}30`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark, display: "flex", alignItems: "center", gap: 10 }}>
                {hasActiveEntryMembership ? "Membership Status" : "Entry Plan Membership"}
              </h2>

              {hasActiveEntryMembership ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: `${BRAND.cyan}18`, color: BRAND.cyanDark,
                      fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
                    }}>
                      <Check size={12} /> Status: Active member
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      border: `1px solid ${BRAND.border}`, color: BRAND.textSecondary,
                      fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100,
                    }}>
                      {getTierLabel(membershipTier)}
                    </span>
                  </div>
                  <div style={{
                    background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
                    borderRadius: 10, padding: "12px 14px",
                  }}>
                    <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
                      Your {getTierLabel(membershipTier)} Membership is active, so you qualify for member pricing on all Test24 Pro studies.
                    </p>
                    <p style={{ fontSize: 12, color: BRAND.textTertiary, margin: 0, marginTop: 6 }}>
                      You will only be billed for the Test24 Pro study shown in your order summary.
                    </p>
                  </div>
                </>
              ) : isLoggedIn ? (
                <>
                  <p style={{ fontSize: 14, color: BRAND.textSecondary, marginBottom: 16 }}>
                    To access member pricing on Test24 Pro studies, you need an active Entry Membership plan.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div
                      onClick={() => setAddMembership(true)}
                      data-testid="radio-add-membership"
                      style={{
                        border: `2px solid ${addMembership ? BRAND.violet : BRAND.borderLight}`,
                        borderRadius: 14, padding: "18px 22px", cursor: "pointer",
                        background: addMembership ? `${BRAND.violet}08` : BRAND.cardBg,
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", marginTop: 2,
                          border: `2px solid ${addMembership ? BRAND.violet : BRAND.textTertiary}`,
                          background: addMembership ? BRAND.violet : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.2s",
                        }}>
                          {addMembership && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 4 }}>
                            Add Entry Membership and unlock member pricing
                          </div>
                          <div style={{ fontSize: 13, color: BRAND.textTertiary, marginBottom: 10 }}>
                            One annual fee. Member pricing on all Test24 Pro studies.
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.violet }}>
                              {formatPrice(ENTRY_PLAN_COST)}/year
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.cyanDark }}>
                              Save {formatPrice(memberSavings)} on this order
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setAddMembership(false)}
                      data-testid="radio-without-membership"
                      style={{
                        border: `2px solid ${!addMembership ? BRAND.violet : BRAND.borderLight}`,
                        borderRadius: 14, padding: "18px 22px", cursor: "pointer",
                        background: !addMembership ? `${BRAND.violet}08` : BRAND.cardBg,
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%", marginTop: 2,
                          border: `2px solid ${!addMembership ? BRAND.violet : BRAND.textTertiary}`,
                          background: !addMembership ? BRAND.violet : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.2s",
                        }}>
                          {!addMembership && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 4 }}>
                            Continue without membership
                          </div>
                          <div style={{ fontSize: 13, color: BRAND.textTertiary }}>
                            Pay the standard Test24 Pro rate for this study only.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {addMembership && (
                    <div style={{
                      background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
                      borderRadius: 10, padding: "12px 14px", marginTop: 16,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Check size={14} color={BRAND.cyanDark} />
                        <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.cyanDark }}>Entry Membership added</span>
                      </div>
                      <p style={{ fontSize: 12, color: BRAND.textSecondary, margin: 0 }}>
                        Member pricing will apply to this study and all future Test24 Pro studies for 12 months.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{
                    background: BRAND.offWhite, borderRadius: 10,
                    padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                    marginBottom: 16,
                  }}>
                    <LogIn size={18} color={BRAND.textTertiary} style={{ flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: BRAND.dark, margin: 0, marginBottom: 4 }}>
                        Log in or create an account to unlock member pricing on Test24 Pro.
                      </p>
                      <p style={{ fontSize: 12, color: BRAND.textTertiary, margin: 0 }}>
                        Members save {formatPrice(regularPricePerStudy - memberPricePerStudy)} per Test24 Pro study.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLoginDialog(true)}
                    data-testid="button-login-member-pricing"
                    style={{
                      width: "100%", padding: "12px 20px", borderRadius: 10,
                      border: `1.5px solid ${BRAND.violet}`, background: "transparent",
                      color: BRAND.violet, fontWeight: 600, fontSize: 14,
                      fontFamily: "inherit", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${BRAND.violet}0A`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <LogIn size={15} />
                    Log in for member pricing
                  </button>
                </>
              )}
            </div>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Configure Your Study
              </h2>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.dark }}>Number of Studies</span>
                  {hasVolumeDiscount && (
                    <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.coral }}>
                      10% volume discount applied!
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease-quantity"
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: `1px solid ${BRAND.border}`, background: BRAND.cardBg,
                      cursor: quantity <= 1 ? "not-allowed" : "pointer",
                      fontSize: 18, fontWeight: 600, color: BRAND.dark,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "inherit", opacity: quantity <= 1 ? 0.4 : 1,
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    data-testid="input-quantity"
                    style={{
                      width: 70, padding: "8px 12px", borderRadius: 8,
                      border: `1px solid ${BRAND.border}`, fontFamily: "inherit",
                      fontSize: 16, fontWeight: 600, color: BRAND.dark,
                      background: BRAND.offWhite, outline: "none", textAlign: "center",
                    }}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: `1px solid ${BRAND.border}`, background: BRAND.cardBg,
                      cursor: "pointer", fontSize: 18, fontWeight: 600, color: BRAND.dark,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "inherit",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.dark, display: "block", marginBottom: 12 }}>
                  Reach per Survey
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reachPricing.map((tier) => {
                    const isSelected = selectedReach === tier.reach;
                    const displayRate = effectiveIsMember ? tier.memberRate : tier.regularRate;
                    return (
                      <div
                        key={tier.reach}
                        onClick={() => setSelectedReach(tier.reach)}
                        data-testid={`radio-reach-${tier.reach}`}
                        style={{
                          border: `2px solid ${isSelected ? BRAND.coral : BRAND.borderLight}`,
                          borderRadius: 14, padding: "16px 20px", cursor: "pointer",
                          background: isSelected ? `${BRAND.coral}08` : BRAND.cardBg,
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: "50%",
                              border: `2px solid ${isSelected ? BRAND.coral : BRAND.textTertiary}`,
                              background: isSelected ? BRAND.coral : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, transition: "all 0.2s",
                            }}>
                              {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark }}>{tier.label}</div>
                              <div style={{ fontSize: 13, color: BRAND.textTertiary, marginTop: 2 }}>
                                R{displayRate} per consumer
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {effectiveIsMember ? (
                              <>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                                  <Star size={13} color={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} fill={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} />
                                  <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.dark }}>
                                    {formatPrice(tier.memberPrice)}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: BRAND.textTertiary, textDecoration: "line-through", marginTop: 2 }}>
                                  {formatPrice(tier.regularPrice)}
                                </div>
                                <div style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600, marginTop: 2 }}>
                                  Save {formatPrice(tier.regularPrice - tier.memberPrice)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.dark }}>
                                  {formatPrice(tier.regularPrice)}
                                </div>
                                <div style={{ fontSize: 12, color: BRAND.textTertiary, marginTop: 2 }}>per survey</div>
                                <div style={{ fontSize: 12, color: BRAND.violet, fontWeight: 600, marginTop: 2 }}>
                                  {formatPrice(tier.memberPrice)} for members
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

              <div style={{
                background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Users size={16} color={BRAND.cyanDark} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.cyanDark }}>Total Consumers Reached</span>
                </div>
                <div data-testid="text-total-consumers" style={{ fontSize: 28, fontWeight: 800, color: BRAND.dark }}>
                  {totalConsumers.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: BRAND.textSecondary, marginTop: 4 }}>
                  {quantity} {quantity === 1 ? "study" : "studies"} × {selectedReach} consumers
                </div>
              </div>

              {hasVolumeDiscount && (
                <div style={{
                  background: `${BRAND.violet}0A`, border: `1px solid ${BRAND.violet}20`,
                  borderRadius: 12, padding: 16, marginTop: 16,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: BRAND.violet }}>
                    Volume Discount Applied: 10% off for 3+ studies
                  </div>
                  <div style={{ fontSize: 13, color: BRAND.textSecondary, marginTop: 4 }}>
                    Additional savings: {formatPrice(volumeDiscountAmount)}
                  </div>
                </div>
              )}

              {effectiveIsMember && memberSavings > 0 && (
                <div style={{
                  background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
                  borderRadius: 12, padding: 16, marginTop: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Star size={14} color={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} fill={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet }}>
                      Member Savings: {formatPrice(memberSavings)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
                    You're saving 10% compared to standard pricing
                  </p>
                </div>
              )}
            </div>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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

          <div style={{ position: "sticky", top: 24 }}>
            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <ShoppingCart size={18} color={BRAND.coral} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: BRAND.dark, margin: 0 }}>
                  Order Summary
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {hasActiveEntryMembership && (
                  <div style={{
                    background: `${BRAND.cyan}10`, border: `1px solid ${BRAND.cyan}30`,
                    borderRadius: 10, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Check size={13} color={BRAND.cyanDark} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.cyanDark }}>
                        Active {getTierLabel(membershipTier)} Membership
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                      Member discount applied to all studies
                    </div>
                  </div>
                )}

                {!hasActiveEntryMembership && addMembership && (
                  <div style={{
                    background: `${BRAND.violet}08`, border: `1px solid ${BRAND.violet}20`,
                    borderRadius: 10, padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>Entry Membership</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.violet }}>{formatPrice(ENTRY_PLAN_COST)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                      Annual plan — One-time fee for 12 months
                    </div>
                  </div>
                )}

                <div style={{
                  background: BRAND.offWhite, border: `1px solid ${BRAND.borderLight}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>Test24 Pro Studies</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>{formatPrice(studiesTotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: BRAND.textSecondary, marginBottom: 4 }}>
                    <span>Studies</span>
                    <span data-testid="text-studies-count" style={{ fontWeight: 600 }}>{quantity}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: BRAND.textSecondary, marginBottom: 4 }}>
                    <span>Reach per Survey</span>
                    <span data-testid="text-reach-per-study" style={{ fontWeight: 600 }}>{selectedReach}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: BRAND.textSecondary, marginBottom: 4 }}>
                    <span>Price per Survey</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(pricePerStudy)}</span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", fontSize: 12,
                    borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 8, marginTop: 4,
                  }}>
                    <span style={{ color: BRAND.textSecondary }}>Total Consumers</span>
                    <span data-testid="text-summary-total-consumers" style={{ fontWeight: 700, color: BRAND.cyanDark }}>
                      {totalConsumers.toLocaleString()}
                    </span>
                  </div>

                  {effectiveIsMember && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      marginTop: 8, paddingTop: 8,
                      borderTop: `1px solid ${BRAND.borderLight}`,
                    }}>
                      <Star size={11} color={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} fill={hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet} />
                      <span style={{ fontSize: 12, color: hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet, fontWeight: 600 }}>
                        Member discount applied
                      </span>
                    </div>
                  )}

                  {!effectiveIsMember && isLoggedIn && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BRAND.borderLight}` }}>
                      <p style={{ fontSize: 12, color: BRAND.textTertiary, margin: 0 }}>
                        You are paying the standard Test24 Pro rate. Add an Entry Membership to unlock member pricing.
                      </p>
                    </div>
                  )}
                </div>

                {effectiveIsMember && (
                  <div style={{
                    background: BRAND.offWhite, borderRadius: 10,
                    padding: "10px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: BRAND.textTertiary, marginBottom: 4 }}>
                      <span>Standard rate</span>
                      <span style={{ textDecoration: "line-through" }}>{formatPrice(regularPricePerStudy)} per survey</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: hasActiveEntryMembership ? BRAND.cyanDark : BRAND.violet }}>
                      <span>Member rate</span>
                      <span>{formatPrice(memberPricePerStudy)} per survey</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
              }}>
                {!hasActiveEntryMembership && addMembership && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.textSecondary }}>Entry Plan (12 months)</span>
                    <span style={{ color: BRAND.dark }}>{formatPrice(ENTRY_PLAN_COST)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>Pro Studies ({quantity}x)</span>
                  <span data-testid="text-subtotal" style={{ color: BRAND.dark }}>{formatPrice(studiesTotal)}</span>
                </div>
                {hasVolumeDiscount && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.coral }}>Volume Discount (10%)</span>
                    <span style={{ color: BRAND.coral }}>-{formatPrice(volumeDiscountAmount)}</span>
                  </div>
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total</span>
                  <span data-testid="text-grand-total" style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}>
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                {hasActiveEntryMembership && (
                  <div style={{ textAlign: "center", fontSize: 12, color: BRAND.cyanDark, fontWeight: 600, marginTop: 4 }}>
                    No Entry Plan fee — you're already a member!
                  </div>
                )}
                {!hasActiveEntryMembership && addMembership && (
                  <div style={{ textAlign: "center", fontSize: 12, color: BRAND.violet, fontWeight: 600, marginTop: 4 }}>
                    Entry Membership added. Member pricing will apply.
                  </div>
                )}
                {!effectiveIsMember && (
                  <div style={{ textAlign: "center", fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>
                    {formatPrice(Math.round(grandTotal / totalConsumers))} per consumer (all studies combined)
                  </div>
                )}
              </div>

              <button
                className="checkout-cta-wrap"
                onClick={handleCheckout}
                data-testid="button-proceed-checkout"
                style={{ width: "100%", border: "none", background: "none", padding: 0, fontFamily: "inherit", cursor: "pointer" }}
              >
                <div className="checkout-cta-glow" />
                <div style={{
                  position: "relative", zIndex: 1, width: "100%",
                  padding: "15px 20px", background: BRAND.coral, borderRadius: 12,
                  color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <ShoppingCart size={17} />
                  Proceed to Payment
                </div>
              </button>

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>Secure payment processing</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>All prices include VAT where applicable</span>
                </div>
                {quantity < 3 && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600 }}>
                      Add {3 - quantity} more {3 - quantity === 1 ? "study" : "studies"} for 10% volume discount
                    </span>
                  </div>
                )}
                {effectiveIsMember && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: BRAND.textSecondary }}>Exclusive member benefits included</span>
                  </div>
                )}
                {!effectiveIsMember && !isLoggedIn && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: BRAND.violet, fontWeight: 600 }}>
                      Log in to access member pricing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <InnovatrFooter />
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
