import { ArrowLeft, Check, Rocket, ShoppingCart, Users, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
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
  { reach: 100, price: 50000, rate: 500, label: "100 Consumers" },
  { reach: 300, price: 142500, rate: 475, label: "300 Consumers" },
  { reach: 600, price: 270000, rate: 450, label: "600 Consumers" },
];

const features = [
  "24hr Turnaround",
  "Custom audience, reach & question flexibility",
  "Custom Consumer Reach per Survey",
  "AI Qual Voice of the Consumer Videos",
  "Robust Report with unlimited Filtering",
  "Strategic Recommendations from AI + Human Experts",
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

export default function CheckoutProPAYG() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const [quantity, setQuantity] = useState(1);
  const [selectedReach, setSelectedReach] = useState(100);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
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
            <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: 0, marginTop: 2 }}>
              Pay As You Go — no membership required
            </p>
          </div>
        </div>

        <p style={{ fontSize: 16, color: BRAND.textSecondary, marginBottom: 36 }}>
          Enterprise Level, Quant & Qual Testing in 24hrs
        </p>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

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
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.violet }}>
                    10% discount for 3 or more
                  </span>
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
                                R{tier.rate} per consumer
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.dark }}>
                              {formatPrice(tier.price)}
                            </div>
                            <div style={{ fontSize: 12, color: BRAND.textTertiary }}>per survey</div>
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

              {hasDiscount && (
                <div style={{
                  background: `${BRAND.violet}0A`, border: `1px solid ${BRAND.violet}20`,
                  borderRadius: 12, padding: 16, marginTop: 16,
                }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: BRAND.violet }}>
                    Volume Discount Applied: 10% off for 3+ studies
                  </div>
                  <div style={{ fontSize: 13, color: BRAND.textSecondary, marginTop: 4 }}>
                    You're saving {formatPrice(discountAmount)}
                  </div>
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

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>Selected Configuration</span>
              </div>
              <div style={{
                background: BRAND.offWhite, border: `1px solid ${BRAND.borderLight}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: BRAND.textSecondary }}>Studies</span>
                  <span data-testid="text-studies-count" style={{ fontWeight: 600, color: BRAND.dark }}>{quantity}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: BRAND.textSecondary }}>Reach per Survey</span>
                  <span data-testid="text-reach-per-study" style={{ fontWeight: 600, color: BRAND.dark }}>{selectedReach}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", fontSize: 13,
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 8, marginTop: 4,
                }}>
                  <span style={{ color: BRAND.textSecondary }}>Total Consumers</span>
                  <span data-testid="text-summary-total-consumers" style={{ fontWeight: 700, color: BRAND.cyanDark }}>
                    {totalConsumers.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>
                    {formatPrice(pricePerStudy)} × {quantity}
                  </span>
                  <span data-testid="text-subtotal" style={{ color: BRAND.dark }}>{formatPrice(subtotal)}</span>
                </div>
                {hasDiscount && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.coral }}>Volume Discount (10%)</span>
                    <span data-testid="text-discount" style={{ color: BRAND.coral }}>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total</span>
                  <span data-testid="text-final-total" style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}>
                    {formatPrice(finalTotal)}
                  </span>
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>
                  {formatPrice(Math.round(finalTotal / totalConsumers))} per consumer
                </div>
                <div style={{ textAlign: "center", fontSize: 12, color: BRAND.textSecondary }}>
                  All prices include VAT where applicable
                </div>
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
                {quantity < 3 && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600 }}>
                      Add {3 - quantity} more {3 - quantity === 1 ? "study" : "studies"} for 10% off
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
          {
            type: "study_pro",
            description: `${quantity}x Test24 Pro Study (${selectedReach} consumers each)`,
            quantity: quantity,
            unitAmount: String(pricePerStudy),
          },
        ]}
        totalAmount={finalTotal}
        purchaseType="Test24 Pro Study (Pay As You Go)"
      />
    </div>
  );
}
