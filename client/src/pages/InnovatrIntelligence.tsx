import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, AlertCircle, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function InnovatrIntelligence() {
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
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-serif font-bold mb-4 text-primary">
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
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Ideal For</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm px-4 py-2" data-testid="badge-consultants">
                  Consultants
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2" data-testid="badge-strategy-leads">
                  Strategy Leads
                </Badge>
                <Badge variant="secondary" className="text-sm px-4 py-2" data-testid="badge-business-owners">
                  Business Owners
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-accent" />
                <CardTitle>Pain Point</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base">
                Teams who need to catch emerging consumer, competitor, and market shifts in real time, without expensive, slow full-service projects.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <CardTitle>Key Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3" data-testid="feature-curated-insights">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span>Bi-weekly curated insights delivered to your inbox</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-signal-detection">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span>Real-time signal detection across multiple data sources</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-local-research">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span>+200 Local Research AI Powered Trends & Opportunity detection</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-downloadable-reports">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span>Downloadable Reports via Membership Plans</span>
                </li>
                <li className="flex items-start gap-3" data-testid="feature-text-answers">
                  <span className="text-primary mt-1 font-bold">•</span>
                  <span>Text-based answers & downloadable reports on any topics – launching soon</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-wide mb-2">Pricing</p>
                  <p className="text-4xl font-bold">R5,000 / month</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    asChild
                    variant="secondary" 
                    size="lg" 
                    className="w-full sm:w-auto"
                  >
                    <a href="/#pricing" data-testid="button-get-started">
                      Get Started
                    </a>
                  </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <a href="/#contact" data-testid="button-contact-us">
                      Contact Us
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
