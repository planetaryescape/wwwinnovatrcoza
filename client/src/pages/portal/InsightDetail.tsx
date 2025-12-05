import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Calendar, Briefcase, Lock, Crown, CreditCard, LogIn, Play, ChevronUp, FileText, ExternalLink, Loader2 } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import insightsHeader from "@assets/insights-header_1764322405058.png";
import launchCover from "@assets/launch-cover_1764321848244.png";
import insideCover from "@assets/inside-cover_1764321472939.png";
import irlCover from "@assets/irl-cover_1764322310189.png";

const categoryCoverImages: Record<string, string> = {
  insights: insightsHeader,
  irl: irlCover,
  inside: insideCover,
  launch: launchCover,
};

function normalizeCategoryKey(category: string): string {
  const normalized = category.toLowerCase().trim().replace("innovatr ", "");
  return normalized;
}

function getCoverImage(category: string): string {
  const key = normalizeCategoryKey(category);
  return categoryCoverImages[key] || categoryCoverImages.insights;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  insights: { bg: "bg-blue-50", text: "text-[#5B6EF7]" },
  launch: { bg: "bg-orange-50", text: "text-orange-700" },
  inside: { bg: "bg-violet-50", text: "text-violet-700" },
  irl: { bg: "bg-rose-50", text: "text-rose-700" },
};

function getCategoryStyle(category: string) {
  const key = normalizeCategoryKey(category);
  return categoryColors[key] || categoryColors.insights;
}

interface ReportSection {
  heading: string;
  body: string;
}

type AccessLevel = "public" | "member" | "tier" | "paid";
type CreditType = "none" | "basic" | "pro";

interface Report {
  id: number | string;
  category: string;
  series?: string;
  displayCategories?: string[];
  industry: string;
  date: string;
  publishDate?: string;
  status?: "live" | "scheduled" | "draft" | "published";
  title: string;
  teaser: string;
  slug: string;
  coverImage: string;
  pdfPath: string | null;
  pdfUrl?: string | null;
  dashboardLink?: string | null;
  coverImageUrl?: string | null;
  hasDownload?: boolean;
  videoPaths?: string[];
  tags: string[];
  topics?: string[];
  isNew: boolean;
  access?: "free" | "members";
  accessLevel?: string;
  allowedTiers?: string[];
  creditType?: CreditType;
  creditCost?: number;
  bodyContent?: string | null;
  previewText?: string | null;
  content?: {
    intro: string;
    sections: ReportSection[];
  };
}

interface AccessCheckResult {
  hasAccess: boolean;
  reason: "public" | "member" | "tier_allowed" | "credits_available" | 
          "not_logged_in" | "membership_required" | "tier_required" | "credits_required";
  message?: string;
}

function checkReportAccess(
  report: Report,
  user: { membershipTier?: string; creditsBasic?: number; creditsPro?: number } | null
): AccessCheckResult {
  const accessLevel = report.accessLevel || "PUBLIC";
  
  if (accessLevel === "PUBLIC" || accessLevel === "public") {
    return { hasAccess: true, reason: "public" };
  }
  
  if (!user) {
    return { hasAccess: false, reason: "not_logged_in", message: "Sign in to access this members-only content" };
  }
  
  if (accessLevel === "STARTER" || accessLevel === "member") {
    const userTier = user.membershipTier || "STARTER";
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    
    if (userTierIndex >= 0) {
      return { hasAccess: true, reason: "member" };
    }
    
    return { 
      hasAccess: false, 
      reason: "membership_required", 
      message: "Become a member to access this content" 
    };
  }
  
  if (accessLevel === "GROWTH") {
    const userTier = user.membershipTier || "STARTER";
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const requiredTierIndex = tierHierarchy.indexOf("GROWTH");
    
    if (userTierIndex >= requiredTierIndex) {
      return { hasAccess: true, reason: "tier_allowed" };
    }
    
    return { 
      hasAccess: false, 
      reason: "tier_required", 
      message: "Upgrade to Growth or higher to access this content" 
    };
  }
  
  if (accessLevel === "SCALE") {
    const userTier = user.membershipTier || "STARTER";
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const requiredTierIndex = tierHierarchy.indexOf("SCALE");
    
    if (userTierIndex >= requiredTierIndex) {
      return { hasAccess: true, reason: "tier_allowed" };
    }
    
    return { 
      hasAccess: false, 
      reason: "tier_required", 
      message: "Upgrade to Scale to access this content" 
    };
  }
  
  if (accessLevel === "tier") {
    const allowedTiers = report.allowedTiers || [];
    const userTier = user.membershipTier || "STARTER";
    
    const tierHierarchy = ["STARTER", "GROWTH", "SCALE"];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    
    const hasAccess = allowedTiers.some(tier => {
      const requiredTierIndex = tierHierarchy.indexOf(tier);
      return userTierIndex >= requiredTierIndex;
    });
    
    if (hasAccess) {
      return { hasAccess: true, reason: "tier_allowed" };
    }
    
    return { 
      hasAccess: false, 
      reason: "tier_required", 
      message: `Upgrade to ${allowedTiers[0]} or higher to access this content` 
    };
  }
  
  if (accessLevel === "paid") {
    const creditType = report.creditType || "basic";
    const creditCost = report.creditCost || 1;
    
    if (creditType === "none") {
      return { hasAccess: true, reason: "credits_available" };
    }
    
    const userCredits = creditType === "basic" ? (user.creditsBasic || 0) : (user.creditsPro || 0);
    
    if (userCredits >= creditCost) {
      return { hasAccess: true, reason: "credits_available" };
    }
    
    return { 
      hasAccess: false, 
      reason: "credits_required", 
      message: `This report requires ${creditCost} ${creditType === "basic" ? "Basic" : "Pro"} credit${creditCost > 1 ? "s" : ""}` 
    };
  }
  
  return { hasAccess: true, reason: "public" };
}

function RelatedReportCard({ report }: { report: Report }) {
  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full">
        <div className="relative h-28 overflow-hidden">
          <img
            src={coverImage}
            alt={report.category}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <Badge 
            className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2 py-0.5 border-0 mb-2`}
          >
            {report.category}
          </Badge>
          <h4 
            className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#5B6EF7] transition-colors"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {report.title}
          </h4>
        </div>
      </article>
    </Link>
  );
}

function AccessPaywall({ 
  accessResult, 
  report,
  onLogin,
  onUpgrade,
  onPurchaseCredits
}: { 
  accessResult: AccessCheckResult;
  report: Report;
  onLogin: () => void;
  onUpgrade: () => void;
  onPurchaseCredits: () => void;
}) {
  const getIcon = () => {
    switch (accessResult.reason) {
      case "not_logged_in":
        return <LogIn className="w-8 h-8 text-[#5B6EF7]" />;
      case "tier_required":
        return <Crown className="w-8 h-8 text-[#5B6EF7]" />;
      case "credits_required":
        return <CreditCard className="w-8 h-8 text-[#5B6EF7]" />;
      default:
        return <Lock className="w-8 h-8 text-[#5B6EF7]" />;
    }
  };

  const getAction = () => {
    switch (accessResult.reason) {
      case "not_logged_in":
        return (
          <Button 
            onClick={onLogin}
            className="rounded-full"
            style={{ backgroundColor: '#5B6EF7' }}
            data-testid="button-login-access"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign In to Continue
          </Button>
        );
      case "tier_required":
        return (
          <Button 
            onClick={onUpgrade}
            className="rounded-full"
            style={{ backgroundColor: '#5B6EF7' }}
            data-testid="button-upgrade-tier"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Membership
          </Button>
        );
      case "credits_required":
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onPurchaseCredits}
              className="rounded-full"
              style={{ backgroundColor: '#5B6EF7' }}
              data-testid="button-purchase-credits"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Purchase Credits
            </Button>
            <Button 
              variant="outline"
              onClick={onUpgrade}
              className="rounded-full border-[#5B6EF7] text-[#5B6EF7]"
              data-testid="button-upgrade-for-credits"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade for More Credits
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-[#5B6EF7]/20 bg-gradient-to-br from-blue-50 to-white">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#5B6EF7]/10 flex items-center justify-center mx-auto mb-4">
          {getIcon()}
        </div>
        <h3 
          className="text-xl font-bold mb-2 text-gray-900"
          style={{ fontFamily: 'DM Serif Display, serif' }}
        >
          {accessResult.reason === "not_logged_in" 
            ? "Members-Only Content"
            : accessResult.reason === "tier_required"
            ? "Premium Content"
            : "Credits Required"
          }
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {accessResult.message}
        </p>
        {getAction()}
      </CardContent>
    </Card>
  );
}

export default function InsightDetail() {
  const [, params] = useRoute("/portal/insights/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [relatedReports, setRelatedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!params?.slug) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/${encodeURIComponent(params.slug)}`);
        if (res.ok) {
          const data = await res.json();
          setReport({
            ...data,
            coverImage: data.coverImageUrl || getCoverImage(data.category),
            pdfPath: data.pdfUrl,
            tags: data.tags || data.topics || [],
            isNew: data.isNew ?? false,
          });
        } else {
          setReport(null);
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [params?.slug]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!report) return;
      
      try {
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          const formatted = data
            .filter((r: any) => r.id !== report.id && (r.category === report.category || (r.tags || r.topics || []).some((t: string) => report.tags.includes(t))))
            .slice(0, 3)
            .map((r: any) => ({
              ...r,
              coverImage: r.coverImageUrl || getCoverImage(r.category),
              pdfPath: r.pdfUrl,
              tags: r.tags || r.topics || [],
              isNew: r.isNew ?? false,
            }));
          setRelatedReports(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch related reports:", error);
      }
    };
    
    fetchRelated();
  }, [report?.id, report?.category, report?.tags]);

  const accessResult = report 
    ? checkReportAccess(report, user as { membershipTier?: string; creditsBasic?: number; creditsPro?: number } | null)
    : { hasAccess: true, reason: "public" as const };

  // Show back to top button after scrolling down one viewport height
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToDownload = () => {
    const downloadSection = document.getElementById("report-download");
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const handleUpgrade = () => {
    setLocation("/portal/billing");
  };

  const handlePurchaseCredits = () => {
    setLocation("/portal/billing");
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#5B6EF7]" />
            <span className="text-muted-foreground">Loading report...</span>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!report) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center p-12">
            <h2 
              className="text-3xl font-bold mb-4 text-gray-900"
              style={{ fontFamily: 'DM Serif Display, serif' }}
            >
              Report Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The report you're looking for doesn't exist or has been moved.
            </p>
            <Button 
              onClick={() => setLocation("/portal/trends")} 
              className="rounded-full"
              style={{ backgroundColor: '#5B6EF7' }}
              data-testid="button-back-library"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const handleDownload = () => {
    if (!report.pdfPath) return;
    toast({
      title: "Download Started",
      description: "Your report is being downloaded.",
    });
    window.open(report.pdfPath, '_blank');
  };

  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = getCoverImage(report.category);

  return (
    <PortalLayout>
      <div className="min-h-screen bg-white">
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          <img
            src={coverImage}
            alt={report.category}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setLocation("/portal/trends")}
                className="mb-4 text-white hover:text-white hover:bg-white/20 -ml-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
              
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge 
                  className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium px-2.5 py-1 border-0`}
                >
                  {report.category}
                </Badge>
                <Badge 
                  variant="secondary"
                  className="text-xs px-2.5 py-1 bg-white/90 text-gray-700"
                >
                  {report.industry}
                </Badge>
                {report.isNew && (
                  <Badge 
                    className="text-white text-xs font-medium px-2 py-1"
                    style={{ backgroundColor: '#5B6EF7' }}
                  >
                    NEW
                  </Badge>
                )}
              </div>

              <h1 
                className="text-2xl md:text-4xl font-bold mb-3 text-white leading-tight"
                style={{ fontFamily: 'DM Serif Display, serif' }}
                data-testid="text-report-title"
              >
                {report.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>{report.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {report.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            {report.teaser}
          </p>

          {/* Jump to report link - visible when there's a downloadable report or dashboard */}
          {(report.pdfPath || report.dashboardLink) && (
            <div className="mb-8">
              <button
                onClick={scrollToDownload}
                className="inline-flex items-center gap-1.5 text-[#5B6EF7] hover:text-[#4958d6] text-sm font-medium transition-colors"
                data-testid="button-jump-to-report"
              >
                <FileText className="w-4 h-4" />
                Jump to report
              </button>
            </div>
          )}

          {!accessResult.hasAccess ? (
            <div className="my-8">
              <AccessPaywall 
                accessResult={accessResult}
                report={report}
                onLogin={handleLogin}
                onUpgrade={handleUpgrade}
                onPurchaseCredits={handlePurchaseCredits}
              />
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500 text-center">
                  The full content is available to members with appropriate access level.
                </p>
              </div>
            </div>
          ) : (
            <>
              {report.content && (
                <article className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-10">
                    {report.content.intro}
                  </div>

                  {report.content.sections.map((section, index) => (
                    <div key={index} className="mb-10">
                      {index > 0 && <hr className="border-gray-100 my-10" />}
                      <h2 
                        className="text-2xl font-bold mb-4 text-gray-900"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        {section.heading}
                      </h2>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {section.body}
                      </div>
                    </div>
                  ))}
                </article>
              )}

              {(report.pdfPath || report.dashboardLink) && (
                <div id="report-download" className="mt-12 pt-8 border-t border-gray-100 text-center">
                  <h3 
                    className="text-2xl font-bold mb-2 text-gray-900"
                    style={{ fontFamily: 'DM Serif Display, serif' }}
                  >
                    Go deeper with the full report
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This article gives you the full story. If you need all diagnostics, numbers, and charts, access the full research report.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {report.pdfPath && (
                      <Button 
                        size="lg"
                        onClick={handleDownload}
                        className="rounded-full"
                        style={{ backgroundColor: '#5B6EF7' }}
                        data-testid="button-download-footer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download full report
                      </Button>
                    )}
                    {report.dashboardLink && (
                      <Button 
                        size="lg"
                        onClick={() => window.open(report.dashboardLink!, '_blank')}
                        variant="outline"
                        className="rounded-full border-[#5B6EF7] text-[#5B6EF7] hover:bg-[#5B6EF7]/10"
                        data-testid="button-open-dashboard"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Interactive Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {report.series === "Inside" && report.videoPaths && report.videoPaths.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <Play className="w-5 h-5 text-violet-700" />
                    </div>
                    <div>
                      <h3 
                        className="text-2xl font-bold text-gray-900"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        Watch the Demo
                      </h3>
                      <p className="text-gray-600 text-sm">
                        See how this tool works in action
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {report.videoPaths.map((videoPath, index) => {
                      const videoName = videoPath.split('/').pop()?.replace('.mp4', '').replace(/-/g, ' ').replace('Innovatr Inside X ', '') || `Video ${index + 1}`;
                      return (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          {report.videoPaths && report.videoPaths.length > 1 && (
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                              <span className="text-sm font-medium text-gray-700">{videoName}</span>
                            </div>
                          )}
                          <video
                            controls
                            className="w-full aspect-video bg-gray-900"
                            preload="metadata"
                            data-testid={`video-player-${index}`}
                          >
                            <source src={videoPath} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {relatedReports.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 
                className="text-xl font-bold mb-6 text-gray-900"
                style={{ fontFamily: 'DM Serif Display, serif' }}
              >
                Related content
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedReports.map((related) => (
                  <RelatedReportCard key={related.id} report={related as Report} />
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => setLocation("/portal/trends")}
              className="rounded-full border-[#5B6EF7] text-[#5B6EF7] hover:bg-[#5B6EF7] hover:text-white"
              data-testid="button-back-footer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trends Library
            </Button>
          </div>
        </div>

        {/* Floating Back to Top button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#5B6EF7] text-white rounded-full shadow-lg hover:bg-[#4958d6] transition-all duration-300 md:px-4 md:py-2"
            aria-label="Back to top"
            data-testid="button-back-to-top"
          >
            <ChevronUp className="w-5 h-5" />
            <span className="hidden md:inline text-sm font-medium">Back to top</span>
          </button>
        )}
      </div>
    </PortalLayout>
  );
}
