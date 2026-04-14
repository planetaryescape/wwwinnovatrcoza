import { ArrowLeft, Check, Zap, ShoppingCart, Shield, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import OrderFormDialog from "@/components/OrderFormDialog";
import { useCurrency } from "@/contexts/CurrencyContext";
import PublicNavbar from "@/components/PublicNavbar";
import { InnovatrFooter } from "@/components/InnovatrFooter";
import { useSEO } from "@/hooks/use-seo";

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

const BASE_PRICE_PER_CREDIT = 10000;

const calculateCustomPrice = (credits: number) => {
  if (credits < 1) return { price: 0, discount: 0, originalPrice: 0, perCredit: 0 };
  const originalPrice = credits * BASE_PRICE_PER_CREDIT;
  let discount = 0;
  if (credits >= 20) {
    discount = 15;
  } else if (credits >= 10) {
    discount = 10;
  }
  const price = Math.round(originalPrice * (1 - discount / 100));
  const perCredit = Math.round(price / credits);
  return { price, discount, originalPrice, perCredit };
};

const creditPackages = [
  { id: "1x", credits: 1, price: 10000, discount: 0, popular: false },
  { id: "10x", credits: 10, price: 90000, originalPrice: 100000, discount: 10, popular: true },
  { id: "20x", credits: 20, price: 170000, originalPrice: 200000, discount: 15, popular: false },
];

const features = [
  "24hr turnaround for rapid validation",
  "Flexible idea volume with no minimum",
  "X100 Consumer Reach, 5min Survey",
  "Automated brief upload portal saving you time",
  "Final Reports emailed 24hrs later",
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
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
  }
  .checkout-cta-glow {
    position: absolute;
    width: 220%;
    aspect-ratio: 1;
    top: 50%; left: 50%;
    border-radius: 50%;
    filter: blur(14px);
    background: conic-gradient(from 0deg, #3A2FBF, #E8503A, #4EC9E8, #3A2FBF);
    animation: checkout-glow-spin 5s linear infinite;
    pointer-events: none;
    opacity: 0.7;
  }
  .checkout-cta-wrap:hover .checkout-cta-glow {
    opacity: 1;
    animation-duration: 2.5s;
  }
`;

export default function CheckoutBasicPAYG() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';
  const { formatPrice } = useCurrency();
  const [selectedPackage, setSelectedPackage] = useState("10x");
  const [customCredits, setCustomCredits] = useState<number>(4);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useSEO({
    title: "Test24 Basic — Pay As You Go",
    description: "Purchase Test24 Basic credits with no membership required. Flexible pay-as-you-go pricing for 24-hour consumer research.",
    canonicalUrl: "https://www.innovatr.co.za/checkout/basic-payg",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCheckout = () => {
    setShowOrderForm(true);
  };

  const isCustomSelected = selectedPackage === "custom";
  const customPricing = calculateCustomPrice(customCredits);

  const getSelectedCredits = () => {
    if (isCustomSelected) return customCredits;
    return creditPackages.find((p) => p.id === selectedPackage)?.credits || 1;
  };

  const getSelectedPrice = () => {
    if (isCustomSelected) return customPricing.price;
    return creditPackages.find((p) => p.id === selectedPackage)?.price || 0;
  };

  const getSelectedDiscount = () => {
    if (isCustomSelected) return customPricing.discount;
    return creditPackages.find((p) => p.id === selectedPackage)?.discount || 0;
  };

  const getSelectedOriginalPrice = () => {
    if (isCustomSelected) return customPricing.originalPrice;
    return creditPackages.find((p) => p.id === selectedPackage)?.originalPrice || 0;
  };

  const totalAmount = getSelectedPrice();
  const orderItems = [
    {
      type: "credits_basic",
      description: `${getSelectedCredits()}x Test24 Basic Credits (Pay As You Go)`,
      quantity: getSelectedCredits(),
      unitAmount: String(Math.round(totalAmount / getSelectedCredits())),
    },
  ];

  const handleCustomCreditsChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 100) {
      setCustomCredits(num);
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
            background: `${BRAND.coral}14`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Zap size={26} color={BRAND.coral} />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0, color: BRAND.dark, fontFamily: '"Playfair Display", serif' }}>
              Test24 Basic
            </h1>
            <p style={{ fontSize: 14, color: BRAND.textSecondary, margin: 0, marginTop: 2 }}>
              Pay As You Go — no membership required
            </p>
          </div>
        </div>

        <div style={{ marginBottom: 36 }} />

        <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{
              background: BRAND.cardBg, border: `1px solid ${BRAND.border}`,
              borderRadius: 16, padding: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: BRAND.dark }}>
                Choose Your Credit Package
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {creditPackages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      data-testid={`package-${pkg.id}`}
                      style={{
                        position: "relative",
                        border: `2px solid ${isSelected ? BRAND.coral : BRAND.borderLight}`,
                        borderRadius: 14, padding: "20px 24px", cursor: "pointer",
                        background: isSelected ? `${BRAND.coral}08` : BRAND.cardBg,
                        transition: "all 0.2s",
                      }}
                    >
                      {pkg.popular && (
                        <div style={{
                          position: "absolute", top: -12, right: 20,
                          background: BRAND.coral, color: "#fff",
                          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                          padding: "4px 12px", borderRadius: 100,
                        }}>
                          MOST POPULAR
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%",
                            border: `2px solid ${isSelected ? BRAND.coral : BRAND.textTertiary}`,
                            background: isSelected ? BRAND.coral : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "all 0.2s",
                          }}>
                            {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 17, color: BRAND.dark, marginBottom: 2 }}>
                              {pkg.credits}x Idea Credit{pkg.credits > 1 ? "s" : ""}
                            </div>
                            <div style={{ fontSize: 13, color: BRAND.textTertiary }}>
                              {pkg.credits === 1 ? "Perfect for testing a single concept" : `Test ${pkg.credits} ideas at a discounted rate`}
                            </div>
                            {pkg.discount > 0 && (
                              <div style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600, marginTop: 4 }}>
                                Save {pkg.discount}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.dark }}>
                            {formatPrice(pkg.price)}
                          </div>
                          {pkg.originalPrice && (
                            <div style={{ fontSize: 12, color: BRAND.textTertiary, textDecoration: "line-through", marginTop: 2 }}>
                              {formatPrice(pkg.originalPrice)}
                            </div>
                          )}
                          <div style={{ fontSize: 12, color: BRAND.textTertiary, marginTop: 2 }}>
                            {formatPrice(Math.round(pkg.price / pkg.credits))} per credit
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div
                  onClick={() => setSelectedPackage("custom")}
                  data-testid="package-custom"
                  style={{
                    position: "relative",
                    border: `2px solid ${isCustomSelected ? BRAND.coral : BRAND.borderLight}`,
                    borderRadius: 14, padding: "20px 24px", cursor: "pointer",
                    background: isCustomSelected ? `${BRAND.coral}08` : BRAND.cardBg,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          border: `2px solid ${isCustomSelected ? BRAND.coral : BRAND.textTertiary}`,
                          background: isCustomSelected ? BRAND.coral : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, transition: "all 0.2s",
                        }}>
                          {isCustomSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: BRAND.dark }}>Custom Quantity</div>
                          {customPricing.discount > 0 && isCustomSelected && (
                            <div style={{ fontSize: 12, color: BRAND.coral, fontWeight: 600, marginTop: 2 }}>
                              Save {customPricing.discount}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: BRAND.textTertiary, marginLeft: 36, marginBottom: 12 }}>
                        Enter your own credit quantity
                      </div>
                      <div style={{ marginLeft: 36, display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={customCredits}
                          onChange={(e) => handleCustomCreditsChange(e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage("custom");
                          }}
                          data-testid="input-custom-credits"
                          style={{
                            width: 80, padding: "8px 12px", borderRadius: 8,
                            border: `1px solid ${BRAND.border}`, fontFamily: "inherit",
                            fontSize: 15, fontWeight: 600, color: BRAND.dark,
                            background: BRAND.offWhite, outline: "none",
                          }}
                        />
                        <span style={{ fontSize: 13, color: BRAND.textTertiary }}>credits</span>
                      </div>
                      <div style={{ marginLeft: 36, marginTop: 12, fontSize: 12, color: BRAND.textTertiary, lineHeight: 1.8 }}>
                        <div>1-9 credits: 0% off ({formatPrice(10000)}/ concept)</div>
                        <div>10-19 credits: 10% off ({formatPrice(9000)}/ concept)</div>
                        <div>20+ credits: 15% off ({formatPrice(8500)}/ concept)</div>
                      </div>
                    </div>
                    {isCustomSelected && customCredits > 0 && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: BRAND.dark }}>
                          {formatPrice(customPricing.price)}
                        </div>
                        {customPricing.discount > 0 && (
                          <div style={{ fontSize: 12, color: BRAND.textTertiary, textDecoration: "line-through", marginTop: 2 }}>
                            {formatPrice(customPricing.originalPrice)}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: BRAND.textTertiary, marginTop: 2 }}>
                          {formatPrice(customPricing.perCredit)} per credit
                        </div>
                      </div>
                    )}
                  </div>
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

              <div style={{
                background: BRAND.offWhite, border: `1px solid ${BRAND.borderLight}`,
                borderRadius: 10, padding: "12px 14px", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: BRAND.dark }}>
                    {getSelectedCredits()}x Test24 Basic Credits
                  </span>
                </div>
                <div style={{ fontSize: 12, color: BRAND.textSecondary }}>Pay As You Go</div>
              </div>

              <div style={{
                borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 16,
                display: "flex", flexDirection: "column", gap: 8, marginBottom: 20,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: BRAND.textSecondary }}>Subtotal</span>
                  <span style={{ color: BRAND.dark }}>{formatPrice(getSelectedOriginalPrice() || getSelectedPrice())}</span>
                </div>
                {getSelectedDiscount() > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: BRAND.coral }}>Discount ({getSelectedDiscount()}%)</span>
                    <span style={{ color: BRAND.coral }}>-{formatPrice(getSelectedOriginalPrice() - getSelectedPrice())}</span>
                  </div>
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderTop: `1px solid ${BRAND.borderLight}`, paddingTop: 12, marginTop: 4,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark }}>Total</span>
                  <span data-testid="text-total" style={{ fontSize: 22, fontWeight: 800, color: BRAND.coral }}>
                    {formatPrice(getSelectedPrice())}
                  </span>
                </div>
              </div>

              <button
                className="checkout-cta-wrap"
                onClick={() => { if (!(isCustomSelected && customCredits < 1)) handleCheckout(); }}
                data-testid="button-proceed-checkout"
                disabled={isCustomSelected && customCredits < 1}
                style={{ opacity: isCustomSelected && customCredits < 1 ? 0.5 : 1, width: "100%", border: "none", background: "none", padding: 0, fontFamily: "inherit" }}
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
        totalAmount={totalAmount}
        purchaseType="Test24 Basic Credits (Pay As You Go)"
      />
    </div>
  );
}
