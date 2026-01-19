import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, AlertCircle, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

const tealColor = "#8DD9E4";

export default function InnovatrIntelligence() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tealColor }}>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-serif font-bold mb-4" style={{ color: tealColor }}>
                Innovatr Intelligence
              </h1>
              <p className="text-2xl font-semibold mb-2">
                Ask anything, instant local AI Powered Answers & Reports
              </p>
              <p className="text-lg text-muted-foreground">
                Stay ahead before your competitors even notice the shift
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" style={{ color: tealColor }} />
                <CardTitle>Ideal For</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm px-4 py-2 text-foreground" data-testid="badge-consultants">
                  Consultants
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2 text-foreground" data-testid="badge-strategy-leads">
                  Strategy Leads
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2 text-foreground" data-testid="badge-business-owners">
                  Business Owners
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card style={{ borderColor: `${tealColor}33` }}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" style={{ color: tealColor }} />
                <CardTitle>Pain Point</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                Teams who need to catch emerging consumer, competitor, and market shifts in real time, without expensive, slow full-service projects.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30" style={{ borderColor: `${tealColor}33` }}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5" style={{ color: tealColor }} />
                <CardTitle>Key Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3" data-testid="feature-curated-insights">
                  <span className="mt-1 font-bold" style={{ color: tealColor }}>•</span>
                  <span>Bi-weekly curated insights delivered to your inbox</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-signal-detection">
                  <span className="mt-1 font-bold" style={{ color: tealColor }}>•</span>
                  <span>Real-time signal detection across multiple data sources</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-local-research">
                  <span className="mt-1 font-bold" style={{ color: tealColor }}>•</span>
                  <span>+200 Local Research AI Powered Trends & Opportunity detection</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-downloadable-reports">
                  <span className="mt-1 font-bold" style={{ color: tealColor }}>•</span>
                  <span>Downloadable Reports via Membership Plans</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-text-answers">
                  <span className="mt-1 font-bold" style={{ color: tealColor }}>•</span>
                  <span>Text-based answers & downloadable reports on any topics – launching soon</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="rounded-lg p-8 text-center" style={{ background: `linear-gradient(to right, ${tealColor}1A, ${tealColor}0D)` }}>
            <h2 className="text-3xl font-serif font-bold mb-2" style={{ color: tealColor }}>
              Ready to stay ahead of trends?
            </h2>
            <p className="text-sm uppercase tracking-wide text-muted-foreground mb-2">Pricing</p>
            <p className="text-4xl font-bold mb-4" style={{ color: tealColor }}>R5,000 / month</p>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get bi-weekly curated insights and access to 200+ AI-powered trend reports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                asChild
                className="text-white"
                style={{ backgroundColor: tealColor }}
                data-testid="button-get-started"
              >
                <a href="/#membership">Get Started</a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                asChild
                data-testid="button-learn-more"
              >
                <a href="/#membership">Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
