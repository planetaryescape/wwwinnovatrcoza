import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MailerSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/mailer-subscriptions", { email });
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive Pulse Insights bi-weekly in your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: '#4D5FF1' }}>
            Stay Ahead of the Shift
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get free bi-weekly insights, market shifts, launches and trend analysis delivered to your inbox.
          </p>
        </div>

        {isSubscribed ? (
          <div className="bg-card border border-card-border rounded-lg p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're all set!</h3>
            <p className="text-muted-foreground">
              Check your inbox for the next edition of Pulse Insights.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                data-testid="input-mailer-email"
              />
              <Button
                type="submit"
                size="lg"
                disabled={subscribeMutation.isPending}
                data-testid="button-subscribe-mailer"
              >
                {subscribeMutation.isPending ? "Subscribing..." : "Subscribe to Pulse Insights"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Get early access to select trends and reports. Full library available with an Innovatr Membership.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
