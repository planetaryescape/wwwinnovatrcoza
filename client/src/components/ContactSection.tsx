import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { trackLinkedInEvent } from "@/lib/linkedin-tracking";
import { getRecaptchaToken } from "@/lib/recaptcha";
import contactBackground from "@assets/pexels-chris-f-8344064_1764657952677.jpeg";

export default function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      toast({
        title: "Message Sent",
        description: "Thank you! We'll get back to you soon.",
      });

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookDemo = () => {
    trackLinkedInEvent("book_demo");
    window.open("https://calendly.com/richard-1220", "_blank");
  };

  return (
    <section id="contact" className="py-12 sm:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${contactBackground})` }}
      />
      <div className="absolute inset-0 from-black/40 via-black/50 to-black/60 bg-[#c6e1a5]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Let's start a conversation?</h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Ready to launch better innovation? Get in touch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 mb-4 rounded-md bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="font-serif">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cs-name">Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="cs-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    data-testid="input-name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cs-email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="cs-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    data-testid="input-email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cs-message">Message <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="cs-message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your innovation challenge"
                    rows={4}
                    data-testid="input-message"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-submit-contact"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sent!
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Protected by reCAPTCHA &mdash;{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy</a>
                  {" "}&amp;{" "}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a>
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold font-serif mb-2">Book a Demo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See how Innovatr can transform your innovation process
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleBookDemo}
                      data-testid="button-book-demo"
                    >
                      Schedule 30-min Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
