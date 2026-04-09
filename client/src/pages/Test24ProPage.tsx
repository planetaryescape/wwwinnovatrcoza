import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2, Rocket, CheckCircle2, Target, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";

export default function Test24ProPage() {
  const [, setLocation] = useLocation();
  const ref = new URLSearchParams(window.location.search).get('ref');
  const backLabel = ref === 'home-pricing' ? 'Back to Pricing' : ref === 'home-membership' || ref === 'research-membership' ? 'Back to Memberships' : 'Back to Our Offering';
  const backHref = ref === 'home-pricing' ? '/#pricing' : ref === 'home-membership' ? '/#membership' : ref === 'research-membership' ? '/research#membership' : '/research#our-offering';

  useSEO({
    title: "Test24 Pro — Advanced Consumer Research",
    description: "Get deeper consumer intelligence with Test24 Pro. Audience segmentation, competitor benchmarking, and strategic recommendations — all in 24 hours.",
    canonicalUrl: "https://www.innovatr.co.za/test24-pro",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Test24 Pro",
      "description": "Advanced 24-hour consumer research with audience segmentation, competitor benchmarking, and strategic recommendations — delivered overnight in South Africa.",
      "provider": { "@type": "Organization", "name": "Innovatr", "url": "https://www.innovatr.co.za" },
      "serviceType": "Consumer Research",
      "areaServed": { "@type": "Country", "name": "South Africa" },
      "url": "https://www.innovatr.co.za/test24-pro",
    } as Record<string, unknown>,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation(backHref)}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backLabel}
        </Button>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(181, 164, 212, 0.2)' }}>
              <Rocket className="w-8 h-8" style={{ color: '#B5A4D4' }} />
            </div>
            <div>
              <h1 className="text-5xl font-serif font-bold" style={{ color: '#B5A4D4' }}>
                Innovatr Test24 Pro
              </h1>
            </div>
          </div>
          
          <p className="text-2xl font-medium mb-2">
            Enterprise Level, Quant & Qual Testing in 24hrs
          </p>
          <p className="text-xl text-muted-foreground">
            Custom Quant Surveys with AI Qual Included
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Ideal For</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm">
                  Enterprise Teams
                </span>
                <span className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm">
                  Corporate Brands
                </span>
                <span className="px-3 py-1 bg-primary/10 text-foreground rounded-full text-sm">
                  Large Agencies
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Pain Point
              </h3>
              <p className="text-muted-foreground">
                24hr Quant Validation with Qual Empathy at Scale with full flexibility - at price points unheard of
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
                  <span>Deep quant validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Behavioural testing with full diagnostics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Decision making for product, brand, and creative investments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Market ready research with AI Qual included</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12 border-primary">
          <CardContent className="pt-8">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-serif font-bold">Key Features</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">24hr Turnaround</h3>
                  <p className="text-sm text-muted-foreground">Enterprise-grade insights at startup speed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Custom audience, reach & question flexibility</h3>
                  <p className="text-sm text-muted-foreground">Tailor every aspect to your needs</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">+100 Consumer Reach, 10-15 min Survey</h3>
                  <p className="text-sm text-muted-foreground">Deep insights from comprehensive surveys</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">+100 AI Qual Voice of the Consumer Videos</h3>
                  <p className="text-sm text-muted-foreground">Qualitative depth at quantitative scale</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Private Results Dashboard Access (members)</h3>
                  <p className="text-sm text-muted-foreground">Real-time access to your data</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Robust Report with unlimited Filtering</h3>
                  <p className="text-sm text-muted-foreground">Analyze data from every angle</p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Strategic Recommendations from AI + Human Experts</h3>
                  <p className="text-sm text-muted-foreground">Actionable insights backed by expertise</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardContent className="pt-8">
            <h2 className="text-2xl font-serif font-bold mb-2 text-center">
              Download Demo Report
            </h2>
            <p className="text-center text-muted-foreground mb-6">
              See what your Pro report will look like
            </p>
            <div className="flex justify-center">
              <a
                href="/assets/reports/Test24-Pro-Demo.pdf"
                download
                data-testid="button-download-demo-report"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo Report
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-serif font-bold mb-4 text-center">
              Dashboard Experience Video
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              See how Pro users can filter & explore results on their private dashboard
            </p>
            <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
              <iframe
                src="https://player.vimeo.com/video/1138121972?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
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
                title="Dashboard Experience Video"
                data-testid="video-dashboard-experience"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">
            When to use Test24 Pro
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Best for when you need structure, statistical confidence, full audience tailoring, and a report that can land with leadership or guide a major business decision.
          </p>
          
          <h3 className="text-xl font-semibold mb-4">Typical Pro use cases</h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Brand health audit for your full portfolio</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Testing a full creative route or campaign territory</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Validation of new product concepts across multiple audiences</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Understanding messaging or benefit ladders at scale</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Pre launch testing for a major pack redesign or product relaunch</span>
            </li>
          </ul>
          
          <p className="text-lg font-medium text-primary">
            Comprehensive, enterprise grade, and designed for bigger decisions.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Ready for enterprise-grade testing?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get the depth of qualitative research with the scale of quantitative data
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
