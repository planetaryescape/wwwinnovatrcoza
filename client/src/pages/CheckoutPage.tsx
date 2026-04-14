import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { SiApplepay } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

interface CheckoutItem {
  type: string;
  referenceId?: string;
  quantity: number;
  unitAmount: string;
  description?: string;
}

interface CheckoutPageProps {
  items?: CheckoutItem[];
  customerEmail?: string;
  customerName?: string;
  total?: string;
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  useSEO({
    title: "Checkout",
    description: "Complete your Innovatr purchase securely.",
    canonicalUrl: "https://www.innovatr.co.za/checkout",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const itemsParam = params.get("items");
  const emailParam = params.get("email");
  const nameParam = params.get("name");
  const totalParam = params.get("total");

  const items: CheckoutItem[] = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];
  const customerEmail = emailParam || "";
  const customerName = nameParam || "";
  const total = totalParam || "0";

  const { data: providersData } = useQuery<{ providers: string[] }>({
    queryKey: ["/api/payment/providers"],
    enabled: items.length > 0,
  });

  const availableProviders = providersData?.providers || [];

  const createOrderMutation = useMutation({
    mutationFn: async (data: { order: any; items: CheckoutItem[] }) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: { orderId: string; items: CheckoutItem[]; providerKey: string }) => {
      const response = await fetch("/api/payment-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create payment intent");
      return response.json();
    },
  });

  const handleCheckout = async () => {
    if (!selectedProvider) {
      toast({
        title: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (!customerEmail) {
      toast({
        title: "Customer email is required",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrderMutation.mutateAsync({
        order: {
          amount: total,
          currency: "ZAR",
          purchaseType: items.map(i => i.description).join(", "),
          status: "pending",
          customerName: customerName || null,
          customerEmail,
        },
        items,
      });

      const intent = await createPaymentIntentMutation.mutateAsync({
        orderId: order.id,
        items,
        providerKey: selectedProvider,
      });

      const checkoutPayload = await fetch(`/api/payment-intents/${intent.id}/checkout`).then(r => r.json());

      if (checkoutPayload.type === "redirect") {
        window.location.href = checkoutPayload.url;
      } else if (checkoutPayload.type === "form") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkoutPayload.action;
        
        Object.entries(checkoutPayload.fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else if (checkoutPayload.type === "qr") {
        toast({
          title: "QR Code Payment",
          description: "QR code payment flow will be displayed",
        });
      } else if (checkoutPayload.type === "applepay") {
        toast({
          title: "Apple Pay",
          description: "Apple Pay flow will be initiated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "payfast":
        return <CreditCard className="h-5 w-5" />;
      case "zapper":
        return <Smartphone className="h-5 w-5" />;
      case "applepay":
        return <SiApplepay className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "payfast":
        return "PayFast";
      case "zapper":
        return "Zapper";
      case "applepay":
        return "Apple Pay";
      default:
        return provider;
    }
  };

  const getProviderDescription = (provider: string) => {
    switch (provider) {
      case "payfast":
        return "Credit card, debit card, instant EFT, and more";
      case "zapper":
        return "QR code, Masterpass, Visa, and Zapper wallet";
      case "applepay":
        return "Pay quickly with Apple Pay";
      default:
        return "";
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Items</CardTitle>
            <CardDescription>Your cart is empty</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-checkout-title">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between" data-testid={`order-item-${index}`}>
                    <div>
                      <p className="font-medium">{item.description || item.type}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">R{parseFloat(item.unitAmount).toLocaleString()}</p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="text-total-amount">R{parseFloat(total).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p data-testid="text-customer-name">{customerName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p data-testid="text-customer-email">{customerEmail}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                {availableProviders.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading payment methods...</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
                    <div className="space-y-3">
                      {availableProviders.map((provider: string) => (
                        <div
                          key={provider}
                          className={`flex items-start space-x-3 rounded-lg border p-4 hover-elevate cursor-pointer ${
                            selectedProvider === provider ? "border-primary bg-accent" : ""
                          }`}
                          onClick={() => setSelectedProvider(provider)}
                          data-testid={`radio-provider-${provider}`}
                        >
                          <RadioGroupItem value={provider} id={provider} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getProviderIcon(provider)}
                              <Label htmlFor={provider} className="font-semibold cursor-pointer">
                                {getProviderName(provider)}
                              </Label>
                              {provider === "payfast" && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {getProviderDescription(provider)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!selectedProvider || isProcessing}
                  data-testid="button-complete-purchase"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete Purchase
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-muted-foreground">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
