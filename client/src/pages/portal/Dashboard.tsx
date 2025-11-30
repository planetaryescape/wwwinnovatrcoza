import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  ShoppingCart,
  Archive,
  TrendingUp,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import PortalLayout from "./PortalLayout";
import LockedFeature from "@/components/LockedFeature";
import CompanyCreditsCard from "@/components/CompanyCreditsCard";

const mockCredits = {
  basicRemaining: 7,
  basicTotal: 10,
  proRemaining: 1,
  proTotal: 2,
  expiryDate: "30 Dec 2025",
};

const mockRecommendations = [
  {
    id: 1,
    title: "SA Beverage Innovation Trends Q4 2024",
    category: "Beverage",
    date: "2024-11-15",
    isNew: true,
  },
  {
    id: 2,
    title: "Youth Consumer Behaviour Report",
    category: "Consumer Insights",
    date: "2024-11-10",
    isNew: true,
  },
  {
    id: 3,
    title: "Competitor Alert: New product launches in FMCG",
    category: "Competitive Intelligence",
    date: "2024-11-12",
    isNew: false,
  },
];

const mockDeals = [
  {
    title: "Buy 3 Test24 Basic, Get 1 Free",
    description: "Limited time offer for Gold members",
    expires: "5 days",
  },
  {
    title: "Upgrade to Platinum - Save R40k",
    description: "Unlock 15 Basic + 3 Pro studies annually",
    expires: "This month only",
  },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isMember } = useAuth();

  const basicPercentage = (mockCredits.basicRemaining / mockCredits.basicTotal) * 100;
  const proPercentage = (mockCredits.proRemaining / mockCredits.proTotal) * 100;

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="mb-8" data-testid="section-welcome">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif font-bold" data-testid="text-welcome-name">
              Welcome{isMember ? " back" : ""}, {user?.name}
            </h1>
            {!isMember && (
              <Badge variant="secondary" className="text-sm" data-testid="badge-free-account">
                Free Account
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground" data-testid="text-welcome-subtitle">
            {isMember ? "Your research command centre" : "You're exploring the Innovatr Portal"}
          </p>
        </div>

        {/* Quick Actions - Same for all users */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card
            className="hover-elevate active-elevate-2 cursor-pointer border-primary/20"
            onClick={() => setLocation("/portal/launch")}
            data-testid="card-quick-action-launch"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Launch New Brief</CardTitle>
              <CardDescription>Start Test24 Basic or Pro</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover-elevate active-elevate-2 cursor-pointer border-accent/20"
            onClick={() => setLocation("/portal/trends")}
            data-testid="card-quick-action-trends"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center mb-3">
                <Download className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Latest Trends</CardTitle>
              <CardDescription>Industry reports & insights</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/portal/credits")}
            data-testid="card-quick-action-credits"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Buy Credits</CardTitle>
              <CardDescription>Top up research credits</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="hover-elevate active-elevate-2 cursor-pointer"
            onClick={() => setLocation("/portal/research")}
            data-testid="card-quick-action-research"
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center mb-3">
                <Archive className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">Past Studies</CardTitle>
              <CardDescription>View all research results</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Credits & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Credits Widget - shown for company users */}
            {user?.companyId && <CompanyCreditsCard companyId={user.companyId} />}

            {/* Credit Summary Widget */}
            {isMember && !user?.companyId ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid="text-credits-title">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Your Research Credits
                  </CardTitle>
                  <CardDescription data-testid="text-credits-description">
                    Remaining balance as a {user?.tier?.toUpperCase()} Member
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test24 Basic</span>
                      <span className="text-sm text-muted-foreground">
                        {mockCredits.basicRemaining} of {mockCredits.basicTotal} remaining
                      </span>
                    </div>
                    <Progress value={basicPercentage} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test24 Pro</span>
                      <span className="text-sm text-muted-foreground">
                        {mockCredits.proRemaining} of {mockCredits.proTotal} remaining
                      </span>
                    </div>
                    <Progress value={proPercentage} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Credits expire: {mockCredits.expiryDate}</span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => setLocation("/portal/credits")}
                      data-testid="button-top-up"
                    >
                      Top Up Credits
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/portal/launch")}
                      data-testid="button-use-credit"
                    >
                      Use Credit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : !user?.companyId ? (
              <LockedFeature
                title="Research Credits"
                description="Track and manage your Test24 credits. Members get exclusive discounts and credit packages."
                showButton={true}
              >
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Test24 Basic</span>
                      <span className="text-muted-foreground">7 of 10 remaining</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Test24 Pro</span>
                      <span className="text-muted-foreground">1 of 2 remaining</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Credits expire: 30 Dec 2025
                  </p>
                </div>
              </LockedFeature>
            ) : null}

            {/* Personalized Recommendations Feed */}
            {isMember ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription>
                    Curated insights based on your industry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRecommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-start gap-3 p-3 rounded-md hover-elevate active-elevate-2 cursor-pointer border"
                        onClick={() => setLocation("/portal/trends")}
                        data-testid={`recommendation-${rec.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{rec.title}</h4>
                            {rec.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {rec.category} • {new Date(rec.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Personalized Recommendations"
                description="Get AI-powered trend recommendations tailored to your industry and business needs."
                showButton={true}
              >
                <div className="space-y-3 mt-4">
                  {mockRecommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-start gap-3 p-3 rounded-md border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{rec.title}</h4>
                          {rec.isNew && (
                            <Badge variant="secondary" className="text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {rec.category} • {new Date(rec.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </LockedFeature>
            )}
          </div>

          {/* Right Column - Deals & Notifications */}
          <div className="space-y-6">
            {/* Member Deals Box */}
            {isMember ? (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Member Deals
                  </CardTitle>
                  <CardDescription>Exclusive offers for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockDeals.map((deal, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                      data-testid={`deal-${index}`}
                    >
                      <h4 className="font-semibold text-sm mb-1">{deal.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {deal.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-accent">
                        <AlertCircle className="w-3 h-3" />
                        <span>Expires: {deal.expires}</span>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/portal/deals")}
                    data-testid="button-explore-deals"
                  >
                    Explore All Deals
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Member Deals"
                description="Exclusive discounts and offers"
                showButton={true}
              >
                <div className="space-y-4 mt-4">
                  {mockDeals.map((deal, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                    >
                      <h4 className="font-semibold text-sm mb-1">{deal.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {deal.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-accent">
                        <AlertCircle className="w-3 h-3" />
                        <span>Expires: {deal.expires}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </LockedFeature>
            )}

            {/* Quick Stats */}
            {isMember ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Your Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Studies completed</span>
                    <span className="text-lg font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reports downloaded</span>
                    <span className="text-lg font-bold">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Value unlocked</span>
                    <span className="text-lg font-bold text-primary">R240k</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Your Activity"
                description="Track your research progress and value unlocked"
                showButton={true}
              >
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Studies completed</span>
                    <span className="text-lg font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reports downloaded</span>
                    <span className="text-lg font-bold">28</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Value unlocked</span>
                    <span className="text-lg font-bold text-primary">R240k</span>
                  </div>
                </div>
              </LockedFeature>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
