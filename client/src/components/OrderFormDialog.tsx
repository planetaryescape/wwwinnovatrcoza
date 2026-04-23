/**
 * Order Form Dialog Component
 * 
 * TWO DISTINCT FLOWS:
 * 1. Card Payment (default): "Send me an invoice" unchecked
 *    - Button shows "Pay Online"
 *    - Triggers existing payment gateway (PayFast)
 *    - Order created after successful payment
 * 
 * 2. Invoice Flow: "Send me an invoice" checked
 *    - Button shows "Invoice me"
 *    - Creates order with invoiceRequested=true, status="pending"
 *    - Sends email to richard@innovatr.co.za and hannah@innovatr.co.za
 *    - Redirects to Credits & Billing page
 *    - Credits only become active when admin marks order as "paid"
 */

import { useState, useRef, type CSSProperties } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, CreditCard, FileText, ShoppingCart, X } from "lucide-react";
import { GradientButtonWrap } from "@/components/GradientButtonWrap";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  dark: "#0D0B1F",
  offWhite: "#F8F7F4",
  border: "#E5E3DE",
  textSecondary: "#4A4862",
  textTertiary: "#8A879A",
};

interface OrderItem {
  type: string;
  description: string;
  quantity: number;
  unitAmount: string;
}

interface SubscriptionOptions {
  enabled: boolean;
  subscriptionType?: number; // 1 = fixed subscription
  frequency?: number; // 3 = Monthly
  cycles?: number; // Number of billing cycles
  recurringAmount?: number; // Amount per billing cycle
}

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItems: OrderItem[];
  totalAmount: number;
  purchaseType: string;
  onSuccess?: () => void;
  subscriptionOptions?: SubscriptionOptions;
}

export default function OrderFormDialog({
  open,
  onOpenChange,
  orderItems,
  totalAmount,
  purchaseType,
  onSuccess,
  subscriptionOptions,
}: OrderFormDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvoiceSuccess, setIsInvoiceSuccess] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const createInquiryMutation = useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerEmail: string;
      customerCompany: string;
      purchaseType: string;
      amount: string;
      items: OrderItem[];
    }) => {
      const response = await apiRequest("POST", "/api/inquiries", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Inquiry Submitted Successfully",
        description: "Our team will contact you shortly to discuss your order.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Inquiry Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Invoice flow mutation - creates order with invoiceRequested=true
  const createInvoiceOrderMutation = useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerEmail: string;
      customerCompany: string;
      amount: string;
      purchaseType: string;
      items: OrderItem[];
      businessRegNumber?: string;
      vatNumber?: string;
      companyAddress?: string;
    }) => {
      const response = await apiRequest("POST", "/api/invoice-orders", data);
      return response.json();
    },
    onSuccess: () => {
      setIsInvoiceSuccess(true);
      toast({
        title: "Invoice Request Submitted",
        description: "We'll prepare your invoice and send it to your email. Credits will be activated once payment is received.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Invoice Request Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (data: {
      order: any;
      items: OrderItem[];
      subscription?: SubscriptionOptions;
      invoiceData?: {
        invoiceRequested: boolean;
        businessRegNumber?: string;
        vatNumber?: string;
        companyAddress?: string;
      };
    }) => {
      // Create payment checkout directly - order will be created on successful payment
      const requestBody: Record<string, any> = {
        customerName: data.order.customerName,
        customerEmail: data.order.customerEmail,
        customerCompany: data.order.customerCompany,
        amount: data.order.amount,
        currency: data.order.currency,
        purchaseType: data.order.purchaseType,
        items: data.items,
        providerKey: "payfast",
      };

      // Add invoice data if requested (for card payments that also want an invoice after)
      if (data.invoiceData?.invoiceRequested) {
        requestBody.invoiceRequested = true;
        requestBody.businessRegNumber = data.invoiceData.businessRegNumber;
        requestBody.vatNumber = data.invoiceData.vatNumber;
        requestBody.companyAddress = data.invoiceData.companyAddress;
      }

      // Add subscription options if this is a recurring payment
      if (data.subscription?.enabled) {
        requestBody.subscription = {
          subscriptionType: data.subscription.subscriptionType || 1,
          frequency: data.subscription.frequency || 3, // Monthly
          cycles: data.subscription.cycles || 12, // 12 months default
          recurringAmount:
            data.subscription.recurringAmount || Number(data.order.amount),
        };
      }

      const response = await apiRequest(
        "POST",
        "/api/payment/checkout",
        requestBody,
      );
      const checkout = await response.json();
      return { checkout, isSubscription: data.subscription?.enabled };
    },
    onSuccess: (data) => {
      // Auto-submit PayFast form
      const { checkout, isSubscription } = data;

      // If any item in this order is a membership purchase, set a short-lived
      // sessionStorage flag so PaymentReturn can fire the LinkedIn
      // membership_purchase conversion only on a successful return.
      // Set this regardless of checkout transport (form vs. redirect) so the
      // membership conversion stays correctly attributed.
      try {
        const isMembershipOrder = orderItems.some(
          (it) => it.type === "membership" || it.type === "membership_upgrade",
        );
        if (isMembershipOrder && typeof window !== "undefined") {
          window.sessionStorage.setItem("pendingMembershipPurchase", "1");
        }
      } catch {
        // ignore storage errors (private mode etc.)
      }

      if (checkout.type === "form" && checkout.data) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkout.data.action;
        form.target = "_blank"; // Open in new tab to avoid iframe restrictions

        Object.entries(checkout.data.fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();

        // Close dialog after redirecting
        onOpenChange(false);
        toast({
          title: isSubscription
            ? "Subscription Payment Started"
            : "Payment Window Opened",
          description: isSubscription
            ? "Complete your subscription setup in the new tab."
            : "Complete your payment in the new tab.",
        });
      } else {
        toast({
          title: "Payment Initiated",
          description: "Redirecting to PayFast...",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description:
          error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerCompany.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, company, and email address.",
        variant: "destructive",
      });
      return;
    }

    createInquiryMutation.mutate({
      customerName,
      customerEmail,
      customerCompany,
      purchaseType,
      amount: totalAmount.toString(),
      items: orderItems,
    });
  };

  // Card payment flow - opens payment gateway
  const handlePayOnline = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerCompany.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, company, and email address.",
        variant: "destructive",
      });
      return;
    }

    initiatePaymentMutation.mutate({
      order: {
        customerName,
        customerEmail,
        customerCompany,
        amount: totalAmount.toString(),
        currency: "ZAR",
        purchaseType,
        status: "processing",
      },
      items: orderItems,
      subscription: subscriptionOptions,
      // Note: For card payments, we don't send invoice data - only for invoice-only flow
    });
  };

  // Invoice flow - creates order without payment gateway
  const handleInvoiceRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerCompany.trim()
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, company, and email address.",
        variant: "destructive",
      });
      return;
    }

    createInvoiceOrderMutation.mutate({
      customerName,
      customerEmail,
      customerCompany,
      amount: totalAmount.toString(),
      purchaseType,
      items: orderItems,
      businessRegNumber: businessRegNumber.trim() || undefined,
      vatNumber: vatNumber.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (isSuccess) {
      setLocation("/");
    } else if (isInvoiceSuccess) {
      setLocation("/portal/credits");
    }
    onOpenChange(false);
    setIsSuccess(false);
    setIsInvoiceSuccess(false);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerCompany("");
    setInvoiceRequested(false);
    setBusinessRegNumber("");
    setVatNumber("");
    setCompanyAddress("");
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

  const handlePreviewInvoice = async () => {
    setIsGeneratingPreview(true);
    try {
      const response = await fetch("/api/invoice/sample", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || "Sample Customer",
          customerEmail: customerEmail || "sample@example.com",
          customerCompany: customerCompany || "Sample Company (Pty) Ltd",
          businessRegNumber: businessRegNumber || "2024/123456/07",
          vatNumber: vatNumber || "4123456789",
          companyAddress: companyAddress || "123 Sample Street, City, 1234",
          orderItems:
            orderItems.length > 0
              ? orderItems
              : [
                  {
                    type: "membership",
                    description: "Sample Membership",
                    quantity: 1,
                    unitAmount: "5000",
                  },
                ],
          totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice preview");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      toast({
        title: "Invoice Preview Generated",
        description: "The sample invoice has opened in a new tab.",
      });
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to generate invoice preview.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const isPending = createInquiryMutation.isPending || initiatePaymentMutation.isPending || createInvoiceOrderMutation.isPending;

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${BRAND.border}`,
    fontFamily: '"DM Sans", sans-serif',
    fontSize: 14,
    color: BRAND.dark,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontFamily: '"DM Sans", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND.textSecondary,
    marginBottom: 6,
  };

  // Success state for inquiry
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Order Submitted</DialogTitle>
          <DialogDescription className="sr-only">Your order has been submitted successfully.</DialogDescription>
          <div style={{ background: "#fff", borderRadius: 12 }}>
            <div style={{ background: `linear-gradient(135deg, ${BRAND.violet} 0%, #6C5CE7 100%)`, padding: "32px 28px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={28} color="#fff" />
              </div>
              <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 22, fontWeight: 400, color: "#fff", margin: 0 }}>Order Submitted!</h2>
            </div>
            <div style={{ padding: "28px 28px 32px", textAlign: "center" }}>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: BRAND.textSecondary, lineHeight: 1.6, margin: "0 0 24px" }}>
                Thank you for your inquiry from <strong style={{ color: BRAND.dark }}>{customerCompany}</strong>. Our team will review it and contact you at <strong style={{ color: BRAND.dark }}>{customerEmail}</strong> to discuss your order.
              </p>
              <GradientButtonWrap variant="violet" borderRadius={8}>
                <button onClick={handleClose} data-testid="button-close-success" style={{ width: "100%", border: "none", padding: "13px 28px", background: BRAND.violet, borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: '"DM Sans", sans-serif', cursor: "pointer" }}>
                  Back to Home
                </button>
              </GradientButtonWrap>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state for invoice request
  if (isInvoiceSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Invoice Request Sent</DialogTitle>
          <DialogDescription className="sr-only">Your invoice request has been submitted.</DialogDescription>
          <div style={{ background: "#fff", borderRadius: 12 }}>
            <div style={{ background: `linear-gradient(135deg, ${BRAND.violet} 0%, #6C5CE7 100%)`, padding: "32px 28px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <FileText size={28} color="#fff" />
              </div>
              <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 22, fontWeight: 400, color: "#fff", margin: 0 }}>Invoice Request Sent!</h2>
            </div>
            <div style={{ padding: "28px 28px 32px", textAlign: "center" }}>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 15, color: BRAND.textSecondary, lineHeight: 1.6, margin: "0 0 24px" }}>
                We'll prepare an invoice and send it to <strong style={{ color: BRAND.dark }}>{customerEmail}</strong>. Your credits will be activated once payment is received.
              </p>
              <GradientButtonWrap variant="violet" borderRadius={8}>
                <button onClick={handleClose} data-testid="button-view-billing" style={{ width: "100%", border: "none", padding: "13px 28px", background: BRAND.violet, borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: '"DM Sans", sans-serif', cursor: "pointer" }}>
                  View Credits &amp; Billing
                </button>
              </GradientButtonWrap>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden max-h-[95vh]">
        <DialogTitle className="sr-only">Complete Your Order</DialogTitle>
        <DialogDescription className="sr-only">Enter your details to complete your purchase.</DialogDescription>
        <div style={{ background: "#fff", borderRadius: 12, display: "flex", flexDirection: "column", maxHeight: "95vh" }}>

          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${BRAND.violet} 0%, #6C5CE7 100%)`, padding: "24px 28px 20px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingCart size={20} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 20, fontWeight: 400, color: "#fff", margin: 0, lineHeight: 1.2 }}>Complete Your Order</h2>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "3px 0 0" }}>Secure checkout powered by PayFast</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ overflowY: "auto", padding: "24px 28px", flex: 1 }}>
            <form ref={formRef} onSubmit={(e) => e.preventDefault()}>

              {/* Your Details */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 700, color: BRAND.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Your Details</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label htmlFor="customerName" style={labelStyle}>Full Name</label>
                    <input id="customerName" placeholder="Enter your full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required data-testid="input-customer-name" style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="customerEmail" style={labelStyle}>Email Address</label>
                    <input id="customerEmail" type="email" placeholder="Enter your email address" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required data-testid="input-customer-email" style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="customerCompany" style={labelStyle}>Company Name</label>
                    <input id="customerCompany" placeholder="Enter your company name" value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} required data-testid="input-customer-company" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ background: BRAND.offWhite, borderRadius: 10, padding: "16px 18px", marginBottom: 20, border: `1px solid ${BRAND.border}` }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 700, color: BRAND.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>Order Summary</p>
                {orderItems.map((item, index) => (
                  <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: index < orderItems.length - 1 ? `1px solid ${BRAND.border}` : "none" }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: BRAND.textSecondary }}>{item.description}</span>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: BRAND.dark, fontWeight: 600 }}>x{item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginTop: 4, borderTop: `1px solid ${BRAND.border}` }}>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: 700, color: BRAND.dark }}>Total</span>
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 16, fontWeight: 800, color: BRAND.coral }}>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Invoice option */}
              <div style={{ borderRadius: 10, border: `1px solid ${BRAND.border}`, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Checkbox id="invoiceRequested" checked={invoiceRequested} onCheckedChange={(checked) => setInvoiceRequested(checked === true)} data-testid="checkbox-request-invoice" />
                  <label htmlFor="invoiceRequested" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: 600, color: BRAND.dark, cursor: "pointer" }}>
                    Send me an invoice instead
                  </label>
                </div>
                {!invoiceRequested && (
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: BRAND.textTertiary, margin: "8px 0 0 30px" }}>
                    Check this to receive a tax invoice rather than paying online now.
                  </p>
                )}

                {invoiceRequested && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BRAND.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: BRAND.textTertiary, margin: 0 }}>
                      Provide your business details for the tax invoice (VAT at 15%)
                    </p>
                    <div>
                      <label htmlFor="businessRegNumber" style={labelStyle}>Business Registration Number</label>
                      <input id="businessRegNumber" placeholder="e.g., 2023/123456/07" value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} data-testid="input-business-reg" style={inputStyle} />
                    </div>
                    <div>
                      <label htmlFor="vatNumber" style={labelStyle}>VAT Number <span style={{ fontWeight: 400, color: BRAND.textTertiary }}>(optional)</span></label>
                      <input id="vatNumber" placeholder="e.g., 4123456789" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} data-testid="input-vat-number" style={inputStyle} />
                    </div>
                    <div>
                      <label htmlFor="companyAddress" style={labelStyle}>Company Address</label>
                      <input id="companyAddress" placeholder="e.g., 123 Main Street, City, 1234" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} data-testid="input-company-address" style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => onOpenChange(false)} disabled={isPending} data-testid="button-cancel-order"
                  style={{ flex: "0 0 auto", padding: "13px 20px", borderRadius: 8, border: `1px solid ${BRAND.border}`, background: "#fff", fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: 600, color: BRAND.textSecondary, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.5 : 1 }}
                >
                  Cancel
                </button>
                <GradientButtonWrap variant={invoiceRequested ? "violet" : "coral"} borderRadius={8} disabled={isPending} style={{ flex: 1, opacity: isPending ? 0.7 : 1 }}>
                  <button type="button" onClick={invoiceRequested ? handleInvoiceRequest : handlePayOnline} disabled={isPending} data-testid={invoiceRequested ? "button-invoice-me" : "button-pay-online"}
                    style={{ width: "100%", border: "none", padding: "13px 0", borderRadius: 8, background: invoiceRequested ? BRAND.violet : BRAND.coral, color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: '"DM Sans", sans-serif', cursor: isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", zIndex: 1 }}
                  >
                    {isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    ) : invoiceRequested ? (
                      <><FileText size={16} /> Invoice me</>
                    ) : (
                      <><CreditCard size={16} /> Pay Online</>
                    )}
                  </button>
                </GradientButtonWrap>
              </div>

            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
