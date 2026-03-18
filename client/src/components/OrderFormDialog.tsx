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

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, CreditCard, FileText, Eye } from "lucide-react";

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

  // Success state for inquiry
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">
              Quote Request Received!
            </DialogTitle>
            <DialogDescription className="text-base mb-6">
              Thank you for your inquiry from{" "}
              <span className="font-medium text-foreground">
                {customerCompany}
              </span>
              . Our team will review it and contact you at{" "}
              <span className="font-medium text-foreground">
                {customerEmail}
              </span>{" "}
              to discuss your order and payment options.
            </DialogDescription>
            <Button onClick={handleClose} data-testid="button-close-success">
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state for invoice request
  if (isInvoiceSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">
              Invoice Request Submitted!
            </DialogTitle>
            <DialogDescription className="text-base mb-6">
              Thank you, <span className="font-medium text-foreground">{customerName}</span>!{" "}
              We'll prepare an invoice and send it to{" "}
              <span className="font-medium text-foreground">{customerEmail}</span>.{" "}
              Your credits will be activated once payment is received.
            </DialogDescription>
            <Button onClick={handleClose} data-testid="button-view-billing">
              View Credits & Billing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Enter your details below and our team will contact you to process
            your payment.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              data-testid="input-customer-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="Enter your email address"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              data-testid="input-customer-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCompany">Company Name</Label>
            <Input
              id="customerCompany"
              placeholder="Enter your company name"
              value={customerCompany}
              onChange={(e) => setCustomerCompany(e.target.value)}
              required
              data-testid="input-customer-company"
            />
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="invoiceRequested"
                checked={invoiceRequested}
                onCheckedChange={(checked) =>
                  setInvoiceRequested(checked === true)
                }
                data-testid="checkbox-request-invoice"
              />
              <Label
                htmlFor="invoiceRequested"
                className="flex items-center gap-2 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send me an invoice
              </Label>
            </div>

            {invoiceRequested && (
              <div className="space-y-3 pt-2 border-t mt-3">
                <p className="text-xs text-muted-foreground">
                  Please provide your business details for the tax invoice (VAT
                  calculated at 15%)
                </p>
                <div className="space-y-2">
                  <Label htmlFor="businessRegNumber">
                    Business Registration Number
                  </Label>
                  <Input
                    id="businessRegNumber"
                    placeholder="e.g., 2023/123456/07"
                    value={businessRegNumber}
                    onChange={(e) => setBusinessRegNumber(e.target.value)}
                    data-testid="input-business-reg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number (optional)</Label>
                  <Input
                    id="vatNumber"
                    placeholder="e.g., 4123456789"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    data-testid="input-vat-number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    placeholder="e.g., 123 Main Street, City, 1234"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    data-testid="input-company-address"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Order Summary</h4>
            {orderItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.description}
                </span>
                <span>x{item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={
                createInquiryMutation.isPending ||
                initiatePaymentMutation.isPending ||
                createInvoiceOrderMutation.isPending
              }
              data-testid="button-cancel-order"
            >
              Cancel
            </Button>
            {/* Dynamic button based on invoice checkbox */}
            <Button
              type="button"
              onClick={invoiceRequested ? handleInvoiceRequest : handlePayOnline}
              disabled={
                createInquiryMutation.isPending ||
                initiatePaymentMutation.isPending ||
                createInvoiceOrderMutation.isPending
              }
              data-testid={invoiceRequested ? "button-invoice-me" : "button-pay-online"}
            >
              {initiatePaymentMutation.isPending || createInvoiceOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : invoiceRequested ? (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Invoice me
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Online
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
