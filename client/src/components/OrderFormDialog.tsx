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

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItems: OrderItem[];
  totalAmount: number;
  purchaseType: string;
  onSuccess?: () => void;
}

export default function OrderFormDialog({
  open,
  onOpenChange,
  orderItems,
  totalAmount,
  purchaseType,
  onSuccess,
}: OrderFormDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const createOrderMutation = useMutation({
    mutationFn: async (data: { order: any; items: OrderItem[] }) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Order Submitted Successfully",
        description: "Our team will contact you shortly to process your order.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (data: { order: any; items: OrderItem[] }) => {
      // First create the order
      const orderResponse = await apiRequest("POST", "/api/orders", data);
      const order = await orderResponse.json();

      // Then create payment intent
      const intentResponse = await apiRequest("POST", "/api/payment-intents", {
        orderId: order.id,
        items: data.items,
        providerKey: "payfast",
      });
      const intent = await intentResponse.json();

      // Get checkout payload
      const checkoutResponse = await apiRequest("GET", `/api/payment-intents/${intent.id}/checkout`, undefined);
      const checkout = await checkoutResponse.json();

      return { order, intent, checkout };
    },
    onSuccess: (data) => {
      // Auto-submit PayFast form
      const { checkout } = data;
      if (checkout.type === "form" && checkout.data) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkout.data.action;

        Object.entries(checkout.data.fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
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
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !customerEmail.trim() || !customerCompany.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, company, and email address.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      order: {
        customerName,
        customerEmail,
        customerCompany,
        amount: totalAmount.toString(),
        currency: "ZAR",
        purchaseType,
        status: "pending",
      },
      items: orderItems,
    });
  };

  const handlePayOnline = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !customerEmail.trim() || !customerCompany.trim()) {
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
            <DialogTitle className="text-2xl mb-2">Order Received!</DialogTitle>
            <DialogDescription className="text-base mb-6">
              Thank you for your order from <span className="font-medium text-foreground">{customerCompany}</span>. Our team will review it and contact you at{" "}
              <span className="font-medium text-foreground">{customerEmail}</span> to complete the payment process.
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
            Enter your details below and our team will contact you to process your payment.
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
                <span className="text-muted-foreground">{item.description}</span>
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
              disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
              data-testid="button-cancel-order"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
              data-testid="button-submit-order"
            >
              {createOrderMutation.isPending ? (
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
              disabled={createOrderMutation.isPending || initiatePaymentMutation.isPending}
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

          <p className="text-xs text-muted-foreground text-center">
            Choose "Place Order" for manual payment or "Pay Online" to pay securely with PayFast.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
