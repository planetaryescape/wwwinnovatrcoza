import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCouponClaimSchema, type InsertCouponClaim, type CouponClaim } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gift, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import coverImage from "@assets/Picture 1_1763494967673.jpg";
import { useSEO } from "@/hooks/use-seo";

export default function CouponSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [claimedCoupon, setClaimedCoupon] = useState<CouponClaim | null>(null);

  useSEO({
    title: "Claim Your Coupon",
    description: "Claim your exclusive Innovatr coupon and get started with discounted consumer research.",
    canonicalUrl: "https://www.innovatr.co.za/claim-coupon",
  });

  const form = useForm<InsertCouponClaim>({
    resolver: zodResolver(insertCouponClaimSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (data: InsertCouponClaim) => {
      const res = await apiRequest("POST", "/api/coupon-claims", data);
      return await res.json() as CouponClaim;
    },
    onSuccess: (data) => {
      setClaimedCoupon(data);
      toast({
        title: "Coupon Claimed Successfully!",
        description: "Check your coupon code below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim coupon. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCouponClaim) => {
    claimMutation.mutate(data);
  };

  const copyCouponCode = () => {
    if (claimedCoupon?.couponCode) {
      navigator.clipboard.writeText(claimedCoupon.couponCode);
      toast({
        title: "Copied!",
        description: "Coupon code copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${coverImage})`,
          filter: "blur(2px) brightness(0.4)",
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-6 text-white hover:bg-white/10"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {!claimedCoupon ? (
            <Card className="border-primary/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-serif mb-2">
                    Claim Your R10,000 Coupon
                  </CardTitle>
                  <CardDescription className="text-base">
                    Get your first Test24 Basic idea on us. Enter your details below to receive your coupon code.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              {...field} 
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="you@company.com" 
                              {...field} 
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={claimMutation.isPending}
                      data-testid="button-claim-coupon"
                    >
                      {claimMutation.isPending ? "Claiming..." : "Claim My Coupon"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-serif mb-2">
                    Coupon Claimed!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Thank you, {claimedCoupon.name}! Your coupon code is ready.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 text-center space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">YOUR COUPON CODE</p>
                  <div className="flex items-center justify-center gap-2">
                    <code 
                      className="text-2xl font-bold text-primary bg-primary/10 px-4 py-2 rounded"
                      data-testid="text-coupon-code"
                    >
                      {claimedCoupon.couponCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyCouponCode}
                      data-testid="button-copy-code"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Value: <span className="font-semibold text-foreground">R10,000</span>
                  </p>
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-accent" />
                    How to Use Your Coupon
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Valid for one Test24 Basic idea testing</li>
                    <li>Use at checkout when launching your brief</li>
                    <li>No expiry date</li>
                    <li>Cannot be combined with other offers</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    onClick={() => setLocation("/")}
                    data-testid="button-explore-services"
                  >
                    Explore Our Services
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation("/#contact")}
                    data-testid="button-contact-us"
                  >
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
