import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2, Sparkles, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function InnovatrConsultPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-md bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <h1 className="text-5xl font-serif font-bold text-secondary">
                Innovatr Consult
              </h1>
            </div>
          </div>
          
          <p className="text-2xl font-medium mb-2">
            Enterprise Level, Strategic Problem Solving
          </p>
          <p className="text-xl text-muted-foreground">
            Idea to Market Consulting Strategy, Design, Testing & Go to Market
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold">Ideal For</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
                  Enterprise Teams
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
                  Corporate Brands
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full text-sm">
                  Large Agencies
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Pain Point
              </h3>
              <p className="text-muted-foreground">
                Finding growth opportunities is challenging, and working with traditional consultancies is expensive and often too theoretical.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12 border-secondary">
          <CardContent className="pt-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h2 className="text-3xl font-serif font-bold">Consulting Expertise</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Category Brand Health Audit</h3>
                  <p className="text-sm text-muted-foreground">Understand where your brand stands in the market</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Demand Mapping & Portfolio Strategy</h3>
                  <p className="text-sm text-muted-foreground">Identify opportunities and optimize your portfolio</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Ideation & Prototyping</h3>
                  <p className="text-sm text-muted-foreground">Generate and validate breakthrough concepts</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Product Mix Development</h3>
                  <p className="text-sm text-muted-foreground">Build the right product portfolio for your market</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Positioning & Brand Strategy</h3>
                  <p className="text-sm text-muted-foreground">Define compelling positioning that resonates</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Packaging Design & Visual Identity</h3>
                  <p className="text-sm text-muted-foreground">Create designs that stand out on shelf and screen</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Go to Market</h3>
                  <p className="text-sm text-muted-foreground">Execute launches that drive real business results</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready to solve strategic challenges?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Partner with us for practical, insight-driven consulting that delivers results
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation("/#contact")}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/#contact")}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
