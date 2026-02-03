import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Clock, CheckCircle2, Zap, Target, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Test24BasicPage() {
  const [, setLocation] = useLocation();
  const { formatPrice } = useCurrency();

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
            <div className="w-16 h-16 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(242, 184, 168, 0.2)' }}>
              <Clock className="w-8 h-8" style={{ color: '#F2B8A8' }} />
            </div>
            <div>
              <h1 className="text-5xl font-serif font-bold" style={{ color: '#F2B8A8' }}>
                Innovatr Test24 Basic
              </h1>
            </div>
          </div>
          
          <p className="text-2xl font-medium mb-2">
            24hr Pay Per Concept Testing – {formatPrice(5000)} per concept (members)
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

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Pain Point
              </h3>
              <p className="text-muted-foreground">
                Teams wanting faster concept testing with flexibility to only pay per concept you want to test - flexibility & affordability unlocked
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Utilised For</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Fast creative checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Quick design validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Early stage concept screening</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Rapid decision support</span>
                </li>
              </ul>
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

        <Card className="mb-12 bg-accent/5 border-accent/20">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-serif font-bold mb-2 text-center">
              Download Demo Materials
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              See what your reports and questionnaire will look like
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <a
                href="/assets/reports/Test24-Basic-Demo.pdf"
                download
                data-testid="button-download-demo-report"
              >
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo Report
                </Button>
              </a>
              <a
                href="/assets/reports/Test24-Basic-Questionnaire.docx"
                download
                data-testid="button-download-demo-questionnaire"
              >
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo Questionnaire
                </Button>
              </a>
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
                src="https://player.vimeo.com/video/1138122312?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
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
                title="Respondent Experience Video"
                data-testid="video-respondent-experience"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">
            When to use Test24 Basic
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Perfect for the moments when you need a fast signal, a simple yes or no, or a quick comparison before you invest more time or budget.
          </p>
          
          <h3 className="text-xl font-semibold mb-4">Typical Basic use cases</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Testing a social media post before launch</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Checking two packaging designs or thumbnails</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Quick validation of a new product name</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Understanding which claim or benefit feels strongest</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Early concept screening for rough ideas or low fidelity designs</span>
            </li>
          </ul>
          
          <p className="text-lg font-medium text-accent">
            Short, sharp, and made for speed.
          </p>
        </div>

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
              asChild
              data-testid="button-get-started"
            >
              <a href="/#pricing">Get Started</a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              asChild
              data-testid="button-learn-more"
            >
              <a href="/#pricing">Learn More</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
