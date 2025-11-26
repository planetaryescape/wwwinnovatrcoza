import { useState } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";

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
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      order: {
        customerName,
        customerEmail,
        amount: totalAmount.toString(),
        currency: "ZAR",
        purchaseType,
        status: "pending",
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
              Thank you for your order. Our team will review it and contact you at{" "}
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={createOrderMutation.isPending}
              data-testid="button-cancel-order"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createOrderMutation.isPending}
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
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Our team will contact you within 24 hours to process your payment securely.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
