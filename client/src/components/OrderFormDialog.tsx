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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle2, CreditCard } from "lucide-react";

interface OrderItem {
  type: string;
  description: string;
  quantity: number;
  unitAmount: string;
}

interface SubscriptionOptions {
  enabled: boolean;
  subscriptionType?: number;  // 1 = fixed subscription
  frequency?: number;         // 3 = Monthly
  cycles?: number;            // Number of billing cycles
  recurringAmount?: number;   // Amount per billing cycle
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
  const [isSuccess, setIsSuccess] = useState(false);
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

  const initiatePaymentMutation = useMutation({
    mutationFn: async (data: { order: any; items: OrderItem[]; subscription?: SubscriptionOptions }) => {
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
      
      // Add subscription options if this is a recurring payment
      if (data.subscription?.enabled) {
        requestBody.subscription = {
          subscriptionType: data.subscription.subscriptionType || 1,
          frequency: data.subscription.frequency || 3, // Monthly
          cycles: data.subscription.cycles || 12, // 12 months default
          recurringAmount: data.subscription.recurringAmount || Number(data.order.amount),
        };
      }
      
      const response = await apiRequest("POST", "/api/payment/checkout", requestBody);
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
          title: isSubscription ? "Subscription Payment Started" : "Payment Window Opened",
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
    });
  };

  const handleClose = () => {
    if (isSuccess) {
      setLocation("/");
    }
    onOpenChange(false);
    setIsSuccess(false);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerCompany("");
  };

  const formatPrice = (price: number) => {
    return `R${price.toLocaleString()}`;
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Enter your details below and our team will contact you to process
            your payment.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
                initiatePaymentMutation.isPending
              }
              data-testid="button-cancel-order"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                createInquiryMutation.isPending ||
                initiatePaymentMutation.isPending
              }
              data-testid="button-submit-order"
            >
              {createInquiryMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={
                createInquiryMutation.isPending ||
                initiatePaymentMutation.isPending
              }
              data-testid="button-pay-online"
            >
              {initiatePaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Online
                </>
              )}
            </Button>
          </div>

          {/* <p className="text-xs text-muted-foreground text-center">
            Choose "Place Order" for manual payment coordination or "Pay Online" to pay securely with PayFast.
          </p> */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
