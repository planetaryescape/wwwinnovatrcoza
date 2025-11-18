import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Clock, CheckCircle2, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Test24BasicPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <div className="w-16 h-16 rounded-md bg-accent/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-5xl font-serif font-bold text-accent">
                Innovatr Test24 Basic
              </h1>
            </div>
          </div>
          
          <p className="text-2xl font-medium mb-2">
            24hr Pay Per Idea Testing – R5,000 per idea (members)
          </p>
          <p className="text-xl text-muted-foreground">
            Idea, Design, Creative rapid testing in any format
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Ideal For</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-accent/10 text-foreground rounded-full text-sm">
                  Agencies
                </span>
                <span className="px-3 py-1 bg-accent/10 text-foreground rounded-full text-sm">
                  Product Leads
                </span>
                <span className="px-3 py-1 bg-accent/10 text-foreground rounded-full text-sm">
                  Startups
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Pain Point
              </h3>
              <p className="text-muted-foreground">
                Teams wanting faster concept testing with flexibility to only pay per idea you want to test - flexibility & affordability unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12 border-accent">
          <CardContent className="pt-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-serif font-bold">Key Features</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">24hr turnaround for rapid validation</h3>
                  <p className="text-sm text-muted-foreground">Get insights fast when speed matters</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Flexible idea volume with no minimum</h3>
                  <p className="text-sm text-muted-foreground">Test as many or as few ideas as you need</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">X100 Consumer Reach, 5min Survey</h3>
                  <p className="text-sm text-muted-foreground">Quick, focused feedback from real consumers</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Automated brief upload portal saving you time</h3>
                  <p className="text-sm text-muted-foreground">Simple, streamlined briefing process</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Final Reports emailed 24hrs later</h3>
                  <p className="text-sm text-muted-foreground">Actionable insights delivered on time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-serif font-bold mb-4 text-center">
              Respondent Experience Video
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              See what consumers experience when answering a survey
            </p>
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://player.vimeo.com/video/1138122312?badge=0&autopause=0&player_id=0&app_id=58479"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%"
                }}
                allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title="Respondent Experience - Upsiide Survey"
                data-testid="video-respondent-experience"
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready to test your ideas?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get started with Test24 Basic and validate your concepts in just 24 hours
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
              onClick={() => setLocation("/#pricing")}
              data-testid="button-view-pricing"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
