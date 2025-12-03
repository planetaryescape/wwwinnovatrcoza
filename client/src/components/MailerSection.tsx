import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Check, Building2, User, Briefcase } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  name: string;
  email: string;
  company: string;
  industry: string;
}

export default function MailerSection() {
  const [formData, setFormData] = useState<SubscriptionData>({
    name: "",
    email: "",
    company: "",
    industry: "",
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionData) => {
      return apiRequest("POST", "/api/mailer-subscriptions", data);
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setFormData({ name: "", email: "", company: "", industry: "" });
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
    if (formData.name && formData.email && formData.company && formData.industry) {
      subscribeMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof SubscriptionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name && formData.email && formData.company && formData.industry;

  return (
    <section id="mailer" className="py-20 bg-muted/30">
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
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
            <div className="bg-card border border-card-border rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mailer-name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Name
                  </Label>
                  <Input
                    id="mailer-name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    data-testid="input-mailer-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailer-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="mailer-email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    data-testid="input-mailer-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mailer-company" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Company
                  </Label>
                  <Input
                    id="mailer-company"
                    type="text"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                    data-testid="input-mailer-company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailer-industry" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Industry
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                  >
                    <SelectTrigger id="mailer-industry" data-testid="select-mailer-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beverage">Food & Beverage</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="financial">Financial Services</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="media">Media & Entertainment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={subscribeMutation.isPending || !isFormValid}
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
