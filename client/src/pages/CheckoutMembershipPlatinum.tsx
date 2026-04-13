import { ArrowLeft, Check, Gem, ShoppingCart, Star, Shield } from "lucide-react";
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

const responsiveStyles = `
  @media (max-width: 860px) {
    .checkout-grid { grid-template-columns: 1fr !important; }
    .checkout-features-grid { grid-template-columns: 1fr !important; }
    .checkout-tier-grid { grid-template-columns: 1fr !important; }
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

export default function CheckoutMembershipPlatinum() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { formatPrice, formatShortPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const entryPriceZAR = 60000;
  const scaleUpgradeZAR = 195000;
  const totalPriceZAR = 255000;
  const totalValueZAR = 360000;
  const basicValueZAR = 75000;
  const proValueZAR = 135000;
  const savingsZAR = totalValueZAR - totalPriceZAR;

  const scaleFeatures = [
    "Everything in Starter membership",
    `15x Test24 Basic ideas included (~${formatShortPrice(basicValueZAR)} value)`,
    `3x Test24 Pro Studies included (~${formatShortPrice(proValueZAR)} value)`,
    "Dedicated Insights Support Team",
    "White-label reporting options",
    "Custom audience segmentation",
    "Bi-weekly strategy calls",
    "Early access to new features",
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
            <Gem size={26} color={BRAND.violet} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: BRAND.dark, fontFamily: '"Playfair Display", serif' }}>
              Scale Membership
            </h1>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: BRAND.violet, color: "#fff",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              padding: "4px 12px", borderRadius: 100, marginTop: 6,
            }}>
              BEST VALUE
            </div>
          </div>
        </div>

        <p style={{ fontSize: 16, color: BRAND.textSecondary, marginBottom: 36 }}>
          Enterprise-level insights with maximum value and dedicated support
        </p>

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Plan Includes
              </h2>

              <div style={{
                background: `${BRAND.violet}0A`, border: `1px solid ${BRAND.violet}20`,
                borderRadius: 12, padding: 16, marginBottom: 20,
              }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: BRAND.dark, marginBottom: 6 }}>
                  Starter Membership Required
                </h3>
                <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0 }}>
                  Scale membership includes Starter benefits plus extensive credits and enterprise features
                </p>
              </div>

              <div className="checkout-tier-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{
                  border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 16,
                  background: `${BRAND.violet}06`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Star size={15} color={BRAND.violet} />
                    <h4 style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark, margin: 0 }}>Starter Base</h4>
                  </div>
                  <div style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.8 }}>
                    <div>· Discounted research rates</div>
                    <div>· Private dashboard</div>
                    <div>· Trends reports</div>
                    <div>· Priority support</div>
                  </div>
                </div>
                <div style={{
                  border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 16,
                  background: `${BRAND.violet}06`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Gem size={15} color={BRAND.violet} />
                    <h4 style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark, margin: 0 }}>Scale Upgrade</h4>
                  </div>
                  <div style={{ fontSize: 13, color: BRAND.textSecondary, lineHeight: 1.8 }}>
                    <div>· 15 Basic credits included</div>
                    <div>· 3 Pro studies included</div>
                    <div>· Dedicated support team</div>
                    <div>· ~{formatShortPrice(totalValueZAR)} total value</div>
                  </div>
                </div>
              </div>

              <div style={{
                background: `${BRAND.coral}0A`, border: `1px solid ${BRAND.coral}20`,
                borderRadius: 12, padding: 16,
              }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: BRAND.coral, marginBottom: 8 }}>
                  Included Credits
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: BRAND.textSecondary }}>15x Test24 Basic ideas</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>~{formatPrice(basicValueZAR)} value</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: BRAND.textSecondary }}>3x Test24 Pro studies</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>~{formatPrice(proValueZAR)} value</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.coral}15`, paddingTop: 8, marginTop: 4,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: BRAND.dark }}>Total Credits Value</span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: BRAND.coral }}>~{formatPrice(basicValueZAR + proValueZAR)}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                All Scale Features
              </h2>
              <div className="checkout-features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                {scaleFeatures.map((feature, index) => (
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
                <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>Selected Plan</span>
              </div>
              <div style={{
                background: BRAND.offWhite, border: `1px solid ${BRAND.borderLight}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Gem size={14} color={BRAND.violet} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>Scale Membership</span>
                </div>
                <div style={{ fontSize: 12, color: BRAND.textSecondary }}>
                  Includes Starter + Scale upgrade
                </div>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>
                  MEMBERSHIP BREAKDOWN
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>Starter Membership Base</span>
                  <span data-testid="text-entry-price" style={{ fontWeight: 600, color: BRAND.dark }}>{formatPrice(entryPriceZAR)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>Scale Tier Upgrade</span>
                  <span data-testid="text-platinum-upgrade" style={{ fontWeight: 600, color: BRAND.dark }}>{formatPrice(scaleUpgradeZAR)}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", fontSize: 14,
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 8, marginTop: 4,
                }}>
                  <span style={{ color: BRAND.violet, fontWeight: 600 }}>Total Package Value</span>
                  <span data-testid="text-total-value" style={{ color: BRAND.violet, fontWeight: 600 }}>{formatPrice(totalValueZAR)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.coral }}>Your Savings</span>
                  <span data-testid="text-savings" style={{ color: BRAND.coral }}>{formatPrice(savingsZAR)}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total Due Today</span>
                  <span data-testid="text-total" style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}>
                    {formatPrice(totalPriceZAR)}
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
                  <span style={{ fontSize: 12, color: BRAND.textSecondary }}>Billed annually · Renews automatically</span>
                </div>
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600 }}>
                    Maximum value for enterprises
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
            description: "Starter Membership (Annual)",
            quantity: 1,
            unitAmount: String(entryPriceZAR),
          },
          {
            type: "membership_upgrade",
            description: "Scale Tier Upgrade (15x Basic + 3x Pro)",
            quantity: 1,
            unitAmount: String(scaleUpgradeZAR),
          },
        ]}
        totalAmount={totalPriceZAR}
        purchaseType="Scale Membership (Annual)"
      />
    </div>
  );
}
