import { ArrowLeft, Check, Star, ShoppingCart, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
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

const starterFeaturesBase = [
  "Trends Report Access",
  "Discounted Research Pricing",
  "Private Dashboard Access",
  "Priority Email Support",
  "Monthly Industry Insights",
];

const responsiveStyles = `
  @media (max-width: 860px) {
    .checkout-grid { grid-template-columns: 1fr !important; }
    .checkout-features-grid { grid-template-columns: 1fr !important; }
    .checkout-payment-grid { grid-template-columns: 1fr !important; }
    .checkout-pricing-grid { grid-template-columns: 1fr !important; }
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

export default function CheckoutMembershipEntry() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const [paymentType, setPaymentType] = useState<"monthly" | "annual">("annual");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const monthlyPriceZAR = 5000;
  const annualPriceZAR = 60000;
  const basicPriceZAR = 5000;
  const proPriceZAR = 45000;
  const totalDueTodayZAR = paymentType === "monthly" ? monthlyPriceZAR : annualPriceZAR;

  const starterFeatures = [
    ...starterFeaturesBase,
    `Test24 Basic: ${formatPrice(basicPriceZAR)} per concept (50% off)`,
    `Test24 Pro: ${formatPrice(proPriceZAR)} per survey (10% off)`,
  ];

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
            <Star size={26} color={BRAND.violet} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: BRAND.dark, fontFamily: '"Playfair Display", serif' }}>
              Starter Membership
            </h1>
            <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: 0, marginTop: 2 }}>
              {paymentType === "monthly" ? "Monthly Plan" : "Annual Plan"}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 16, color: BRAND.textSecondary, marginBottom: 36 }}>
          For startups & small teams seeking affordable research insights
        </p>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Choose Your Payment Option
              </h2>
              <div className="checkout-payment-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <button
                  onClick={() => setPaymentType("monthly")}
                  data-testid="button-payment-monthly"
                  style={{
                    border: `2px solid ${paymentType === "monthly" ? BRAND.coral : BRAND.borderLight}`,
                    borderRadius: 14, padding: 24, textAlign: "left", cursor: "pointer",
                    background: paymentType === "monthly" ? `${BRAND.coral}08` : BRAND.cardBg,
                    transition: "all 0.2s", fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 17, color: BRAND.dark }}>Monthly</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: `2px solid ${paymentType === "monthly" ? BRAND.coral : BRAND.textTertiary}`,
                      background: paymentType === "monthly" ? BRAND.coral : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {paymentType === "monthly" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: BRAND.dark }}>
                      {formatPrice(monthlyPriceZAR)}
                    </span>
                    <span style={{ color: BRAND.textTertiary, fontSize: 14, marginLeft: 4 }}>/month</span>
                  </div>
                  <p style={{ fontSize: 13, color: BRAND.textTertiary, margin: 0 }}>
                    Flexible monthly billing · Cancel anytime
                  </p>
                </button>

                <button
                  onClick={() => setPaymentType("annual")}
                  data-testid="button-payment-annual"
                  style={{
                    border: `2px solid ${paymentType === "annual" ? BRAND.coral : BRAND.borderLight}`,
                    borderRadius: 14, padding: 24, textAlign: "left", cursor: "pointer",
                    background: paymentType === "annual" ? `${BRAND.coral}08` : BRAND.cardBg,
                    transition: "all 0.2s", fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 17, color: BRAND.dark }}>Annual</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: `2px solid ${paymentType === "annual" ? BRAND.coral : BRAND.textTertiary}`,
                      background: paymentType === "annual" ? BRAND.coral : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {paymentType === "annual" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: BRAND.dark }}>
                      {formatPrice(annualPriceZAR)}
                    </span>
                    <span style={{ color: BRAND.textTertiary, fontSize: 14, marginLeft: 4 }}>/year</span>
                  </div>
                  <p style={{ fontSize: 13, color: BRAND.textTertiary, margin: 0 }}>
                    One payment · Full year access
                  </p>
                </button>
              </div>

              {paymentType === "annual" && (
                <div style={{
                  marginTop: 16, background: `${BRAND.violet}0A`,
                  border: `1px solid ${BRAND.violet}20`,
                  borderRadius: 10, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.violet }}>
                    Save with annual billing — just {formatPrice(monthlyPriceZAR)}/month equivalent
                  </span>
                </div>
              )}
            </div>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Plan Details
              </h2>

              <div style={{
                background: `${BRAND.violet}0A`, border: `1px solid ${BRAND.violet}20`,
                borderRadius: 12, padding: 16, marginBottom: 20,
              }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 6 }}>
                  Save up to 40% on Research
                </h3>
                <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
                  Get member-only discounted rates on all Test24 services throughout the year
                </p>
              </div>

              <div className="checkout-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{
                  border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 16,
                }}>
                  <h4 style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark, marginBottom: 6 }}>Test24 Basic</h4>
                  <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.violet, marginBottom: 4 }}>
                    {formatPrice(basicPriceZAR)}
                  </div>
                  <p style={{ fontSize: 12, color: BRAND.textTertiary, margin: 0 }}>per concept (50% off PAYG)</p>
                </div>
                <div style={{
                  border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 16,
                }}>
                  <h4 style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark, marginBottom: 6 }}>Test24 Pro</h4>
                  <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.violet, marginBottom: 4 }}>
                    {formatPrice(proPriceZAR)}
                  </div>
                  <p style={{ fontSize: 12, color: BRAND.textTertiary, margin: 0 }}>per survey (10% off PAYG)</p>
                </div>
              </div>
            </div>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                What's Included
              </h2>
              <div className="checkout-features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 24 }}>
                {starterFeatures.map((feature, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={15} color={BRAND.coral} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 14, color: BRAND.textSecondary, lineHeight: 1.5 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 16 }}>
                  See Your Private Dashboard in Action
                </h3>
                <div style={{ padding: "56.25% 0 0 0", position: "relative", borderRadius: 12, overflow: "hidden" }}>
                  <iframe
                    src="https://player.vimeo.com/video/1138121972?badge=0&autopause=0&player_id=0&app_id=58479"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    title="Private Research Dashboard Demo"
                    data-testid="video-dashboard-entry"
                  />
                </div>
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

              <div style={{
                background: BRAND.offWhite, border: `1px solid ${BRAND.borderLight}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark, marginBottom: 4 }}>
                  Starter Membership
                </div>
                <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                  {paymentType === "monthly" ? "Monthly billing" : "Annual billing"}
                </div>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
              }}>
                {paymentType === "monthly" ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: BRAND.textSecondary }}>Monthly Price</span>
                      <span data-testid="text-monthly-price" style={{ fontWeight: 600, color: BRAND.dark }}>
                        {formatPrice(monthlyPriceZAR)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: BRAND.textSecondary }}>Total for 12 months</span>
                      <span data-testid="text-12-month-total" style={{ color: BRAND.violet }}>
                        {formatPrice(monthlyPriceZAR * 12)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: BRAND.textSecondary }}>Annual Price</span>
                      <span data-testid="text-annual-price" style={{ fontWeight: 600, color: BRAND.dark }}>
                        {formatPrice(annualPriceZAR)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: BRAND.textSecondary }}>Monthly Equivalent</span>
                      <span style={{ color: BRAND.violet }}>{formatPrice(monthlyPriceZAR)}/month</span>
                    </div>
                  </>
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total Due Today</span>
                  <span data-testid="text-total" style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}>
                    {formatPrice(totalDueTodayZAR)}
                  </span>
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
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>
                    {paymentType === "monthly" ? "Billed monthly · Cancel anytime" : "Billed annually · Renews automatically"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={13} color={BRAND.textSecondary} />
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>All prices include VAT where applicable</span>
                </div>
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600 }}>
                    Start saving on research today
                  </span>
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
        orderItems={[
          {
            type: "membership",
            description: `Starter Membership (${paymentType === "monthly" ? "Monthly" : "Annual"})`,
            quantity: 1,
            unitAmount: String(totalDueTodayZAR),
          },
        ]}
        totalAmount={totalDueTodayZAR}
        purchaseType={`Starter Membership (${paymentType === "monthly" ? "Monthly" : "Annual"})`}
        subscriptionOptions={paymentType === "monthly" ? {
          enabled: true,
          subscriptionType: 1,
          frequency: 3,
          cycles: 12,
          recurringAmount: monthlyPriceZAR,
        } : undefined}
      />
    </div>
  );
}
