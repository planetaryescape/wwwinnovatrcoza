import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function MailerSection() {
  const [, setLocation] = useLocation();

  return (
    <section id="mailer" className="py-12 sm:py-20 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: '#4D5FF1' }}>
          Stay Ahead of the Shift
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Subscribe to Pulse Insights and get free bi-weekly trend analysis, market shifts, and launch insights delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => setLocation("/portal?subscribe=true")}
            data-testid="button-subscribe-now"
          >
            Subscribe Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8"
            onClick={() => setLocation("/portal")}
            data-testid="button-login-member"
          >
            Already a member? Log in
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Create an account to subscribe. Full trends library access available with an Innovatr Membership.
        </p>
      </div>
    </section>
  );
}
