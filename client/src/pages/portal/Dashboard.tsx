import { useMemo, useEffect } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Download,
  ShoppingCart,
  Archive,
  TrendingUp,
  Sparkles,
  Clock,
  AlertCircle,
  ExternalLink,
  Activity,
  CreditCard,
  CheckCircle2,
  PlayCircle,
  BadgePercent,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import LockedFeature from "@/components/LockedFeature";
import CompanyCreditsCard from "@/components/CompanyCreditsCard";
import reportsData from "@/data/reports.json";
import type { Company } from "@shared/schema";

interface Report {
  id: number;
  title: string;
  teaser: string;
  slug: string;
  series: string;
  category: string;
  displayCategories?: string[];
  industry: string;
  publishDate: string;
  date: string;
  status: string;
  coverImage: string;
  pdfPath: string | null;
  hasDownload: boolean;
  videoPaths: string[];
  tags: string[];
  isNew: boolean;
  access: string;
  accessLevel: string;
  content?: {
    intro: string;
    sections: { heading: string; body: string }[];
  };
}


function canAccessReport(
  report: Report,
  userTier: string | undefined,
  isPaidMember: boolean
): boolean {
  // All reports require at least a paid membership (STARTER+)
  // FREE tier members can see cards but cannot open any report
  if (!isPaidMember) {
    return false;
  }
  
  // All paid members can access all content
  return true;
}

function isNewReport(publishDate: string): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const reportDate = new Date(publishDate);
  return reportDate >= thirtyDaysAgo;
}

function getRecommendedReports(
  reports: Report[],
  userTier: string | undefined,
  isPaidMember: boolean,
  userIndustry: string | undefined,
  count: number = 3
): Report[] {
  const accessibleReports = reports.filter(report => 
    report.status === "live" && canAccessReport(report, userTier, isPaidMember)
  );

  const sortedByDate = [...accessibleReports].sort(
    (a, b) => new Date(b.publishDate || b.date || 0).getTime() - new Date(a.publishDate || a.date || 0).getTime()
  );

  if (sortedByDate.length <= count) return sortedByDate;

  const matchesIndustry = (report: Report) => {
    if (!userIndustry) return false;
    const matchLower = userIndustry.toLowerCase().trim();
    const reportIndustry = report.industry?.toLowerCase().trim() || "";
    if (!reportIndustry) return false;
    if (reportIndustry === matchLower || reportIndustry.includes(matchLower) || matchLower.includes(reportIndustry)) return true;
    const displayCategories = report.displayCategories || [];
    return displayCategories.some(cat => cat.toLowerCase().trim() === matchLower);
  };

  const getIndustryKey = (report: Report) => (report.industry?.toLowerCase().trim() || "general");
  const getCategoryKey = (report: Report) => (report.category?.toLowerCase().trim() || "insights");

  const industryRelevant = sortedByDate.filter(matchesIndustry);
  const crossIndustry = sortedByDate.filter(r => !matchesIndustry(r));

  const selected: Report[] = [];
  const usedIndustries = new Set<string>();
  const usedCategories = new Set<string>();

  if (industryRelevant.length > 0) {
    selected.push(industryRelevant[0]);
    usedIndustries.add(getIndustryKey(industryRelevant[0]));
    usedCategories.add(getCategoryKey(industryRelevant[0]));
  }

  for (const report of crossIndustry) {
    if (selected.length >= count) break;
    if (selected.some(s => s.id === report.id)) continue;
    const indKey = getIndustryKey(report);
    const catKey = getCategoryKey(report);
    if (!usedIndustries.has(indKey) && !usedCategories.has(catKey)) {
      selected.push(report);
      usedIndustries.add(indKey);
      usedCategories.add(catKey);
    }
  }

  if (selected.length < count) {
    for (const report of crossIndustry) {
      if (selected.length >= count) break;
      if (selected.some(s => s.id === report.id)) continue;
      const indKey = getIndustryKey(report);
      if (!usedIndustries.has(indKey)) {
        selected.push(report);
        usedIndustries.add(indKey);
        usedCategories.add(getCategoryKey(report));
      }
    }
  }

  if (selected.length < count) {
    for (const report of sortedByDate) {
      if (selected.length >= count) break;
      if (!selected.some(s => s.id === report.id)) {
        selected.push(report);
      }
    }
  }

  return selected;
}


export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isPaidMember } = useAuth();
  const { formatShortPrice } = useCurrency();

  useEffect(() => {
    logActivity("view_dashboard");
  }, []);

  const { data: realDeals, isLoading: isLoadingDeals } = useQuery<any[]>({
    queryKey: ["/api/member/deals"],
    enabled: !!user,
  });

  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ["/api/member/company", user?.companyId],
    queryFn: async () => {
      const response = await fetch(`/api/member/company?companyId=${user?.companyId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.companyId,
    retry: false,
  });

  const { data: userActivity, isLoading: isLoadingActivity } = useQuery<{
    studiesCompleted: number;
    liveStudies: number;
    reportsDownloaded: number;
    discountSaved: number;
    basicCreditsRemaining: number;
    proCreditsRemaining: number;
  }>({
    queryKey: ["/api/member/activity", user?.id],
    enabled: !!user,
  });

  const userIndustry = useMemo(() => {
    return company?.industry || undefined;
  }, [company]);

  const { data: dbReports } = useQuery<any[]>({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

  const isLoadingRecommendations = isLoadingCompany && !!user?.companyId;

  const recommendedReports = useMemo(() => {
    const staticReports = reportsData as Report[];
    const dbReportsMapped: Report[] = (dbReports || [])
      .filter((r: any) => r.status === "published" || r.status === "live")
      .filter((r: any) => !staticReports.some(sr => sr.slug === r.slug))
      .map((r: any) => ({
        id: typeof r.id === 'string' ? parseInt(r.id, 10) || 0 : r.id,
        title: r.title,
        teaser: r.teaser || '',
        slug: r.slug,
        series: r.series || r.category || '',
        category: r.category || '',
        industry: r.industry || '',
        publishDate: r.date || r.publishDate || '',
        date: r.date || '',
        status: 'live',
        coverImage: r.coverImage || '',
        pdfPath: r.pdfUrl || r.pdfPath || null,
        hasDownload: !!(r.pdfUrl || r.pdfPath || r.hasDownload),
        videoPaths: r.videoPaths || [],
        tags: r.tags || [],
        isNew: false,
        access: r.accessLevel === 'PUBLIC' ? 'free' : 'members',
        accessLevel: r.accessLevel || 'PUBLIC',
      }));
    const allReports = [...staticReports, ...dbReportsMapped];
    return getRecommendedReports(
      allReports,
      user?.membershipTier,
      isPaidMember,
      userIndustry
    );
  }, [user?.membershipTier, isPaidMember, userIndustry, dbReports]);

  const handleReportClick = (report: Report, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (report.pdfPath && report.hasDownload) {
      window.open(report.pdfPath, "_blank");
    } else {
      setLocation(`/portal/insights/${report.slug}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="mb-8" data-testid="section-welcome">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif font-bold" data-testid="text-welcome-name">
              Welcome{isPaidMember ? " back" : ""}, {user?.name}
            </h1>
            {!isPaidMember && (
              <Badge variant="secondary" className="text-sm" data-testid="badge-free-account">
                Free Account
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground" data-testid="text-welcome-subtitle">
            {isPaidMember ? "Your personal dashboard for innovation" : "You're exploring the Innovatr Portal"}
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

            {/* Credit Summary Widget - only for non-company users */}
            {!user?.companyId && (
              isPaidMember ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid="text-credits-title">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Your Research Credits
                    </CardTitle>
                    <CardDescription data-testid="text-credits-description">
                      Remaining balance as a {user?.membershipTier?.toUpperCase()} Member
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test24 Basic</span>
                        <span className="text-sm text-muted-foreground">
                          {isLoadingActivity ? "..." : (userActivity?.basicCreditsRemaining ?? 0)} remaining
                        </span>
                      </div>
                      <Progress value={isLoadingActivity ? 0 : Math.min(100, (userActivity?.basicCreditsRemaining ?? 0) * 10)} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test24 Pro</span>
                        <span className="text-sm text-muted-foreground">
                          {isLoadingActivity ? "..." : (userActivity?.proCreditsRemaining ?? 0)} remaining
                        </span>
                      </div>
                      <Progress value={isLoadingActivity ? 0 : Math.min(100, (userActivity?.proCreditsRemaining ?? 0) * 20)} className="h-2" />
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
              ) : (
                <LockedFeature
                  title="Research Credits"
                  description="Track and manage your Test24 credits. Members get exclusive discounts and credit packages."
                  showButton={true}
                >
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Test24 Basic</span>
                        <span className="text-muted-foreground">Upgrade to access</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Test24 Pro</span>
                        <span className="text-muted-foreground">Upgrade to access</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>
                </LockedFeature>
              )
            )}

            {/* Personalized Recommendations Feed */}
            {isPaidMember ? (
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
                  {isLoadingRecommendations ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-md border">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  ) : recommendedReports.length > 0 ? (
                    <div className="space-y-3">
                      {recommendedReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-start gap-3 p-3 rounded-md hover-elevate active-elevate-2 cursor-pointer border"
                          onClick={(e) => handleReportClick(report, e)}
                          data-testid={`recommendation-${report.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium">{report.title}</h4>
                              {isNewReport(report.publishDate) && (
                                <Badge variant="secondary" className="text-xs">
                                  NEW
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {report.series} • {formatDate(report.publishDate)}
                            </p>
                          </div>
                          {report.pdfPath && report.hasDownload ? (
                            <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No recommended reports yet. As you start using Innovatr, we'll surface reports that match your industry.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Personalized Recommendations"
                description="Get AI-powered trend recommendations tailored to your industry and business needs."
                showButton={true}
              >
                <div className="space-y-3 mt-4">
                  {recommendedReports.length > 0 ? (
                    recommendedReports.slice(0, 3).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-start gap-3 p-3 rounded-md border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{report.title}</h4>
                            {isNewReport(report.publishDate) && (
                              <Badge variant="secondary" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {report.series} • {formatDate(report.publishDate)}
                          </p>
                        </div>
                        {report.pdfPath && report.hasDownload ? (
                          <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recommended reports yet.
                    </p>
                  )}
                </div>
              </LockedFeature>
            )}
          </div>

          {/* Right Column - Offers & Notifications */}
          <div className="space-y-6">
            {/* Member Offers Box */}
            {isPaidMember ? (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Member Offers
                  </CardTitle>
                  <CardDescription>Exclusive offers for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingDeals ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 rounded-lg border">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : realDeals && realDeals.length > 0 ? (
                    realDeals.slice(0, 3).map((deal: any, index: number) => (
                      <div
                        key={deal.id || index}
                        className="p-4 rounded-lg bg-accent/10 border border-accent/20"
                        data-testid={`deal-${deal.id || index}`}
                      >
                        <h4 className="font-semibold text-sm mb-1">{deal.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {deal.description}
                        </p>
                        {deal.discountPercentage && (
                          <Badge variant="secondary" className="text-xs mb-2">
                            {deal.discountPercentage}% off
                          </Badge>
                        )}
                        {deal.expiresAt && (
                          <div className="flex items-center gap-2 text-xs text-accent">
                            <AlertCircle className="w-3 h-3" />
                            <span>Expires: {new Date(deal.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No active offers right now. Check back soon!
                    </p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/portal/deals")}
                    data-testid="button-explore-deals"
                  >
                    Explore All Offers
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Member Offers"
                description="Exclusive discounts and offers available to members"
                showButton={true}
              >
                <div className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-semibold text-sm mb-1">Exclusive member pricing</h4>
                    <p className="text-xs text-muted-foreground">
                      Members save up to 50% on research credits and studies
                    </p>
                  </div>
                </div>
              </LockedFeature>
            )}

            {/* Your Activity */}
            {isPaidMember ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4" />
                    Your Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Completed studies
                    </span>
                    <span className="text-lg font-bold" data-testid="text-studies-completed">
                      {isLoadingActivity ? "..." : (userActivity?.studiesCompleted ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                      Live studies
                    </span>
                    <span className="text-lg font-bold" data-testid="text-live-studies">
                      {isLoadingActivity ? "..." : (userActivity?.liveStudies ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      Credits available
                    </span>
                    <div className="text-right" data-testid="text-credits-available">
                      {isLoadingActivity ? "..." : (
                        <div className="text-sm">
                          <span className="font-bold">{userActivity?.basicCreditsRemaining ?? 0}</span>
                          <span className="text-muted-foreground"> Basic</span>
                          <span className="mx-1 text-muted-foreground">/</span>
                          <span className="font-bold">{userActivity?.proCreditsRemaining ?? 0}</span>
                          <span className="text-muted-foreground"> Pro</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                      Member savings
                    </span>
                    <span className="text-lg font-bold text-emerald-600" data-testid="text-discount-saved">
                      {isLoadingActivity ? "..." : formatShortPrice(userActivity?.discountSaved ?? 0)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Members pay {formatShortPrice(5000)} for Basic (not {formatShortPrice(10000)}) and {formatShortPrice(45000)} for Pro (not {formatShortPrice(50000)})
                  </p>
                </CardContent>
              </Card>
            ) : (
              <LockedFeature
                title="Your Activity"
                description="Track your research progress, credits, and member savings"
                showButton={true}
              >
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Studies completed</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Live studies</span>
                    <span className="text-lg font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Member savings</span>
                    <span className="text-lg font-bold text-primary">{formatShortPrice(0)}</span>
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
