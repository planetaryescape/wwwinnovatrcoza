import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function PaymentReturn() {
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "cancelled" | "error">("loading");
  const [message, setMessage] = useState("");

  useSEO({
    title: "Payment Status",
    description: "View your Innovatr payment status and confirmation details.",
    canonicalUrl: "https://www.innovatr.co.za/payment/return",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("status");

    if (location.includes("/payment/cancel")) {
      setStatus("cancelled");
      setMessage("Your payment was cancelled. No charges were made.");
    } else if (paymentStatus === "success") {
      setStatus("success");
      setMessage("Your payment was successful! Thank you for your purchase.");
    } else if (paymentStatus === "cancelled") {
      setStatus("cancelled");
      setMessage("Your payment was cancelled. No charges were made.");
    } else if (paymentStatus === "failed") {
      setStatus("error");
      setMessage("Your payment failed. Please try again or contact support.");
    } else {
      setTimeout(() => {
        setStatus("success");
        setMessage("Payment processing complete.");
      }, 2000);
    }
  }, [location]);

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-16 w-16 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-16 w-16 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Processing Payment";
      case "success":
        return "Payment Successful";
      case "cancelled":
        return "Payment Cancelled";
      case "error":
        return "Payment Failed";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl" data-testid="text-payment-title">{getTitle()}</CardTitle>
          <CardDescription data-testid="text-payment-message">{message}</CardDescription>
        </CardHeader>
        
        {status !== "loading" && (
          <CardContent className="text-center space-y-4">
            {status === "success" && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  You will receive a confirmation email shortly. You can now access your purchased features.
                </p>
              </div>
            )}
            
            {status === "cancelled" && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  If this was a mistake, you can try again or contact our support team.
                </p>
              </div>
            )}
            
            {status === "error" && (
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive">
                  There was an issue processing your payment. Please check your payment details and try again.
                </p>
              </div>
            )}
          </CardContent>
        )}
        
        <CardFooter className="flex gap-2">
          {status === "success" && (
            <>
              <Button 
                onClick={() => setLocation("/portal")} 
                className="flex-1"
                data-testid="button-goto-portal"
              >
                Go to Portal
              </Button>
              <Button 
                onClick={() => setLocation("/")} 
                variant="outline"
                className="flex-1"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </>
          )}
          
          {(status === "cancelled" || status === "error") && (
            <>
              <Button 
                onClick={() => window.history.back()} 
                className="flex-1"
                data-testid="button-try-again"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => setLocation("/")} 
                variant="outline"
                className="flex-1"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
