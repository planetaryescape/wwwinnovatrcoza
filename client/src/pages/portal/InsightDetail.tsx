import { useState, useEffect, useRef } from "react";
import { logActivity } from "@/lib/activityLogger";
import { useRoute, useLocation } from "wouter";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ArrowLeft, Calendar, Briefcase, Lock, Crown, CreditCard, LogIn, Play, ChevronUp, FileText, ExternalLink, Loader2, Mail, CheckCircle2, TrendingUp } from "lucide-react";
import PortalLayout from "./PortalLayout";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import insightsHeader from "@assets/insights-header_1764322405058.png";
import launchCover from "@assets/launch-cover_1764321848244.png";
import insideCover from "@assets/inside-cover_1764321472939.png";
import irlCover from "@assets/irl-cover_1764322310189.png";
import { getRelatedArticles } from "@/lib/getRelatedArticles";

function InsightPageWrapper({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return <PortalLayout>{children}</PortalLayout>;
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

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
    subtitle?: string;
    closingLine?: string;
    retailerHook?: string;
    ctaLabel?: string;
    ctaHelper?: string;
    ctaEmail?: string;
  };
  industryTag?: string | null;
  themeTags?: string[];
  methodTags?: string[];
}

interface AccessCheckResult {
  hasAccess: boolean;
  reason: "public" | "member" | "tier_allowed" | "credits_available" | 
          "not_logged_in" | "membership_required" | "tier_required" | "credits_required";
  message?: string;
}

function checkReportAccess(
  report: Report,
  user: { membershipTier?: string; creditsBasic?: number; creditsPro?: number } | null,
  hasPaidSeatAccess?: boolean
): AccessCheckResult {
  const accessLevel = report.accessLevel || "PUBLIC";

  // Not logged in: only allow PUBLIC/free content
  if (!user) {
    if (accessLevel === "PUBLIC" || accessLevel === "public" || accessLevel === "FREE" || accessLevel === "free") {
      return { hasAccess: true, reason: "public" };
    }
    return { hasAccess: false, reason: "not_logged_in", message: "Sign in to access this members-only content" };
  }

  // Logged-in users: ALL content requires a paid membership (STARTER+)
  // FREE tier members see a paywall on every report, including public/free ones
  if (hasPaidSeatAccess) {
    return { hasAccess: true, reason: "member" };
  }
  
  const userTier = (user.membershipTier || "").toUpperCase();
  const paidTiers = ["STARTER", "GROWTH", "SCALE"];
  if (paidTiers.includes(userTier)) {
    return { hasAccess: true, reason: "member" };
  }
  
  return { 
    hasAccess: false, 
    reason: "membership_required", 
    message: "Become a member to access this content" 
  };
}

function RelatedReportCard({ report }: { report: Report }) {
  const categoryStyle = getCategoryStyle(report.category);
  const coverImage = report.coverImage || report.coverImageUrl || getCoverImage(report.category);

  return (
    <Link href={`/portal/insights/${report.slug}`}>
      <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 flex flex-col h-full">
        <div className="relative h-28 overflow-hidden">
          <img
            src={coverImage}
            alt={report.title}
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
  const { user, isAuthenticated, hasPaidSeatAccess } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [relatedReports, setRelatedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!params?.slug) return;
      
      setLoading(true);
      try {
        // Use member endpoint if authenticated (includes client-specific reports)
        // Fall back to public endpoint otherwise
        const endpoint = isAuthenticated 
          ? `/api/member/reports/${encodeURIComponent(params.slug)}`
          : `/api/reports/${encodeURIComponent(params.slug)}`;
        
        const res = await fetch(endpoint);
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
  }, [params?.slug, isAuthenticated]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!report) return;
      
      try {
        // Use member endpoint if authenticated for complete report list
        const endpoint = isAuthenticated ? "/api/member/reports" : "/api/reports";
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          // Format all reports for the related articles helper
          const allReports = data.map((r: any) => ({
            id: String(r.id),
            slug: r.slug,
            title: r.title,
            category: r.category,
            series: r.series,
            industryTag: r.industryTag,
            themeTags: r.themeTags || [],
            methodTags: r.methodTags || [],
            date: r.date,
          }));
          
          // Get related using the tag-aware helper
          const related = getRelatedArticles(
            {
              id: String(report.id),
              slug: report.slug,
              title: report.title,
              category: report.category,
              series: report.series,
              industryTag: report.industryTag,
              themeTags: report.themeTags || [],
              methodTags: report.methodTags || [],
              date: report.date,
            },
            allReports,
            3
          );
          
          // Map back to full report objects for display
          const formatted = related.map(rel => {
            const fullReport = data.find((r: any) => String(r.id) === rel.id);
            return fullReport ? {
              ...fullReport,
              coverImage: fullReport.coverImageUrl || getCoverImage(fullReport.category),
              pdfPath: fullReport.pdfUrl,
              tags: fullReport.tags || fullReport.topics || [],
              isNew: fullReport.isNew ?? false,
            } : null;
          }).filter(Boolean) as Report[];
          
          setRelatedReports(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch related reports:", error);
      }
    };
    
    fetchRelated();
  }, [report?.id, report?.category, report?.industryTag, report?.themeTags, isAuthenticated]);

  const accessResult = report 
    ? checkReportAccess(report, user as { membershipTier?: string; creditsBasic?: number; creditsPro?: number } | null, hasPaidSeatAccess)
    : { hasAccess: true, reason: "public" as const };

  const viewTracked = useRef(false);
  useEffect(() => {
    if (report?.id && !viewTracked.current) {
      viewTracked.current = true;
      fetch(`/api/reports/${report.id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "view" }),
      }).catch(() => {});
    }
  }, [report?.id]);

  useEffect(() => {
    if (report) {
      logActivity("view_report", { entityType: "report", entityId: String(report.id), entityName: report.title });
    }
  }, [report?.id]);

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
    setLoginDialogOpen(true);
  };

  const handleUpgrade = () => {
    setLocation("/portal/billing");
  };

  const handlePurchaseCredits = () => {
    setLocation("/portal/billing");
  };

  if (loading) {
    return (
      <InsightPageWrapper isAuthenticated={isAuthenticated}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#5B6EF7]" />
            <span className="text-muted-foreground">Loading report...</span>
          </div>
        </div>
      </InsightPageWrapper>
    );
  }

  if (!report) {
    return (
      <InsightPageWrapper isAuthenticated={isAuthenticated}>
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
      </InsightPageWrapper>
    );
  }

  const handleDownload = () => {
    if (!report.pdfPath) return;
    toast({
      title: "Download Started",
      description: "Your report is being downloaded.",
    });
    logActivity("download_report", { entityType: "report", entityId: String(report.id), entityName: report.title });

    fetch(`/api/reports/${report.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "download" }),
    }).catch(() => {});

    const ext = report.pdfPath.split('.').pop() || 'pdf';
    const downloadName = encodeURIComponent(`${report.title}.${ext}`);
    const downloadUrl = `${report.pdfPath}${report.pdfPath.includes('?') ? '&' : '?'}download=${downloadName}`;
    window.open(downloadUrl, '_blank');
  };

  const formattedDate = new Date(report.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const categoryStyle = getCategoryStyle(report.category);
  const heroImage = report.coverImage || getCoverImage(report.category);
  const hasOwnCover = !!(report.coverImageUrl || report.coverImage?.startsWith('/api/files'));
  const subtitle = report.content?.subtitle;

  const sections = report.content?.sections ?? [];

  const scrollToSection = (index: number) => {
    const el = document.getElementById(`section-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <InsightPageWrapper isAuthenticated={isAuthenticated}>
      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <div className={`relative w-full ${hasOwnCover ? 'h-80 md:h-[30rem]' : 'h-72 md:h-[26rem]'} overflow-hidden`}>
          <img
            src={heroImage}
            alt={report.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${hasOwnCover ? 'bg-gradient-to-t from-black/85 via-black/35 to-black/10' : 'bg-gradient-to-t from-black/75 via-black/40 to-black/10'}`} />

          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 md:px-10 md:pb-10">
            <div className="max-w-5xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setLocation("/portal/trends")}
                className="mb-5 text-white/90 hover:text-white hover:bg-white/15 -ml-2 text-sm"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Library
              </Button>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-semibold px-2.5 py-1 border-0`}>
                  {report.category}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-white/90 text-gray-700">
                  {report.industry}
                </Badge>
                {report.content?.retailerHook && (
                  <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-orange-50 text-orange-700">
                    {report.content.retailerHook}
                  </Badge>
                )}
                {report.isNew && (
                  <Badge className="text-white text-xs font-semibold px-2.5 py-1" style={{ backgroundColor: '#5B6EF7' }}>
                    NEW
                  </Badge>
                )}
              </div>

              <h1
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 text-white leading-tight max-w-3xl"
                style={{ fontFamily: 'DM Serif Display, serif' }}
                data-testid="text-report-title"
              >
                {report.title}
              </h1>

              {subtitle && (
                <p className="text-base md:text-lg text-white/85 mb-3 italic max-w-2xl" data-testid="text-report-subtitle">
                  {subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-white/70 mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{report.industry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">

            {/* ── Main article column ── (order-last on mobile so sidebar appears first) */}
            <div className="flex-1 min-w-0 order-last lg:order-first">

              {/* Lead / teaser */}
              <p className="text-xl leading-relaxed text-gray-600 font-light mb-8 border-b border-gray-100 pb-8">
                {report.teaser}
              </p>

              {/* Locked state */}
              {!accessResult.hasAccess ? (
                <div>
                  {report.content && (
                    <article className="mb-10">
                      <p className="text-base text-gray-700 leading-relaxed mb-8 font-medium">
                        {report.content.intro}
                      </p>

                      {sections.map((section, index) => (
                        <div key={index} id={`section-${index}`} className="mb-10 scroll-mt-6">
                          {index > 0 && <hr className="border-gray-100 mb-10" />}
                          <h2
                            className="text-2xl font-bold mb-4 text-gray-900"
                            style={{ fontFamily: 'DM Serif Display, serif' }}
                          >
                            {section.heading}
                          </h2>
                          {section.heading.toLowerCase().includes("what you") ? (
                            <ul className="space-y-3">
                              {section.body.split('\n').filter(l => l.trim()).map((line, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                  <CheckCircle2 className="w-5 h-5 text-[#5B6EF7] flex-shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{line.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : section.heading.toLowerCase().includes("featured") || section.heading.toLowerCase().includes("signal") ? (
                            <div className="space-y-3">
                              {section.body.split('\n').filter(l => l.trim()).map((line, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                  <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700 font-medium leading-relaxed">{line.trim()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
                              {section.body}
                            </div>
                          )}
                        </div>
                      ))}

                      {report.content.closingLine && (
                        <blockquote className="border-l-4 border-[#5B6EF7] pl-5 py-1 mt-8 mb-10">
                          <p className="text-lg text-gray-800 font-medium italic leading-relaxed">
                            {report.content.closingLine}
                          </p>
                        </blockquote>
                      )}
                    </article>
                  )}

                  <Card className="border border-[#5B6EF7]/20 bg-gradient-to-br from-blue-50 to-white" id="report-download">
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 rounded-full bg-[#5B6EF7]/10 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-7 h-7 text-[#5B6EF7]" />
                      </div>
                      <h3
                        className="text-xl font-bold mb-2 text-gray-900"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        {report.content?.ctaLabel || "Members-Only Content"}
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                        {report.content?.ctaHelper || accessResult.message || "Become a member to access this content."}
                      </p>

                      {accessResult.reason === "not_logged_in" ? (
                        <div className="flex flex-col items-center gap-3">
                          <Button
                            onClick={handleLogin}
                            className="rounded-full"
                            style={{ backgroundColor: '#5B6EF7' }}
                            data-testid="button-login-access"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In to Continue
                          </Button>
                          {report.content?.ctaEmail && (
                            <p className="text-sm text-gray-500">
                              Or email{' '}
                              <a href={`mailto:${report.content.ctaEmail}`} className="text-[#5B6EF7] hover:underline" data-testid="link-cta-email">
                                {report.content.ctaEmail}
                              </a>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Button
                            onClick={handleUpgrade}
                            className="rounded-full"
                            style={{ backgroundColor: '#5B6EF7' }}
                            data-testid="button-upgrade-tier"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Become a Member
                          </Button>
                          {report.content?.ctaEmail && (
                            <p className="text-sm text-gray-500">
                              Or email{' '}
                              <a href={`mailto:${report.content.ctaEmail}`} className="text-[#5B6EF7] hover:underline" data-testid="link-cta-email">
                                {report.content.ctaEmail}
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {/* Accessible article */}
                  {report.content && (
                    <article>
                      <p className="text-base text-gray-700 leading-relaxed mb-10 font-medium">
                        {report.content.intro}
                      </p>

                      {sections.map((section, index) => (
                        <div key={index} id={`section-${index}`} className="mb-10 scroll-mt-6">
                          {index > 0 && <hr className="border-gray-100 mb-10" />}
                          <h2
                            className="text-2xl font-bold mb-4 text-gray-900"
                            style={{ fontFamily: 'DM Serif Display, serif' }}
                          >
                            {section.heading}
                          </h2>
                          {section.heading.toLowerCase().includes("what you") ? (
                            <ul className="space-y-3">
                              {section.body.split('\n').filter(l => l.trim()).map((line, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700">
                                  <CheckCircle2 className="w-5 h-5 text-[#5B6EF7] flex-shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{line.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : section.heading.toLowerCase().includes("featured") || section.heading.toLowerCase().includes("signal") ? (
                            <div className="space-y-3">
                              {section.body.split('\n').filter(l => l.trim()).map((line, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                  <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700 font-medium leading-relaxed">{line.trim()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
                              {section.body}
                            </div>
                          )}
                        </div>
                      ))}

                      {report.content.closingLine && (
                        <blockquote className="border-l-4 border-[#5B6EF7] pl-5 py-1 mt-8 mb-10">
                          <p className="text-lg text-gray-800 font-medium italic leading-relaxed">
                            {report.content.closingLine}
                          </p>
                        </blockquote>
                      )}
                    </article>
                  )}

                  {/* Raw body fallback */}
                  {!report.content && (report as any).body && (
                    <article>
                      {((report as any).body as string).split(/\n{2,}/).map((paragraph: string, idx: number) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        const isShortLine = trimmed.length < 80 && !trimmed.includes(".");
                        return isShortLine ? (
                          <h3
                            key={idx}
                            className="text-xl font-bold text-gray-900 mt-10 mb-3"
                            style={{ fontFamily: "DM Serif Display, serif" }}
                          >
                            {trimmed}
                          </h3>
                        ) : (
                          <p key={idx} className="text-gray-700 leading-relaxed mb-5 text-[15px]">
                            {trimmed}
                          </p>
                        );
                      })}
                    </article>
                  )}

                  {/* Download / dashboard CTA */}
                  {(report.pdfPath || report.dashboardLink) && (
                    <div id="report-download" className="mt-12 pt-10 border-t border-gray-100">
                      <h3
                        className="text-2xl font-bold mb-2 text-gray-900"
                        style={{ fontFamily: 'DM Serif Display, serif' }}
                      >
                        Go deeper with the full report
                      </h3>
                      <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                        {report.content?.ctaHelper || "This article gives you the full story. If you need all diagnostics, numbers, and charts, access the full research report."}
                      </p>
                      <div className="flex flex-wrap gap-3">
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
                            className="rounded-full border-[#5B6EF7] text-[#5B6EF7]"
                            data-testid="button-open-dashboard"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Interactive Dashboard
                          </Button>
                        )}
                      </div>
                      {report.content?.ctaEmail && (
                        <p className="text-xs text-gray-400 mt-4">
                          Or email{' '}
                          <a href={`mailto:${report.content.ctaEmail}`} className="text-[#5B6EF7] hover:underline">
                            {report.content.ctaEmail}
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Video section */}
                  {report.series === "Inside" && report.videoPaths && report.videoPaths.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <Play className="w-5 h-5 text-violet-700" />
                        </div>
                        <div>
                          <h3
                            className="text-2xl font-bold text-gray-900"
                            style={{ fontFamily: 'DM Serif Display, serif' }}
                          >
                            Watch the Demo
                          </h3>
                          <p className="text-gray-500 text-sm">See how this tool works in action</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        {report.videoPaths.map((videoPath, index) => {
                          const videoName = videoPath.split('/').pop()?.replace('.mp4', '').replace(/-/g, ' ').replace('Innovatr Inside X ', '') || `Video ${index + 1}`;
                          return (
                            <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
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
            </div>

            {/* ── Sticky sidebar (order-first on mobile so it appears between hero and article) ── */}
            <aside className="w-full lg:w-64 xl:w-72 flex-shrink-0 order-first lg:order-last">
              <div className="lg:sticky lg:top-6 space-y-6">

                {/* Metadata card */}
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Badge className={`${categoryStyle.bg} ${categoryStyle.text} text-xs font-semibold px-2.5 py-1 border-0`}>
                        {report.category}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Published</p>
                        <p className="font-medium text-gray-800">{formattedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Briefcase className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Industry</p>
                        <p className="font-medium text-gray-800">{report.industry}</p>
                      </div>
                    </div>
                  </div>

                  {report.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5 bg-white text-gray-600 border border-gray-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section nav — only when there are named sections */}
                {accessResult.hasAccess && sections.length > 0 && (
                  <div className="rounded-lg border border-gray-100 p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">In this report</p>
                    <nav className="space-y-1">
                      {sections.map((section, index) => (
                        <button
                          key={index}
                          onClick={() => scrollToSection(index)}
                          className="block w-full text-left text-sm text-gray-600 hover:text-[#5B6EF7] py-1.5 px-2 rounded hover-elevate transition-colors leading-snug"
                          data-testid={`sidebar-section-${index}`}
                        >
                          {section.heading}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Sidebar download shortcut */}
                {accessResult.hasAccess && (report.pdfPath || report.dashboardLink) && (
                  <div className="space-y-2">
                    {report.pdfPath && (
                      <Button
                        onClick={handleDownload}
                        className="w-full rounded-full justify-center"
                        style={{ backgroundColor: '#5B6EF7' }}
                        data-testid="button-download-sidebar"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download report
                      </Button>
                    )}
                    {report.dashboardLink && (
                      <Button
                        onClick={() => window.open(report.dashboardLink!, '_blank')}
                        variant="outline"
                        className="w-full rounded-full justify-center border-[#5B6EF7] text-[#5B6EF7]"
                        data-testid="button-dashboard-sidebar"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open dashboard
                      </Button>
                    )}
                  </div>
                )}

                {/* Upgrade prompt in sidebar for locked users */}
                {!accessResult.hasAccess && (
                  <div className="rounded-lg border border-[#5B6EF7]/20 bg-blue-50 p-5 text-center">
                    <Lock className="w-6 h-6 text-[#5B6EF7] mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {accessResult.reason === "not_logged_in"
                        ? "Sign in to access member reports."
                        : "Upgrade your membership to access the full report."}
                    </p>
                    {accessResult.reason === "not_logged_in" ? (
                      <Button size="sm" onClick={handleLogin} className="rounded-full w-full" style={{ backgroundColor: '#5B6EF7' }} data-testid="button-sidebar-login">
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Sign in
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleUpgrade} className="rounded-full w-full" style={{ backgroundColor: '#5B6EF7' }} data-testid="button-sidebar-upgrade">
                        <Crown className="w-3.5 h-3.5 mr-1.5" />
                        Become a member
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ── Full-width footer sections ── */}
          {relatedReports.length > 0 && (
            <div className="mt-14 pt-10 border-t border-gray-100">
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

          <div className="mt-10 pb-10 text-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/portal/trends")}
              className="rounded-full border-[#5B6EF7] text-[#5B6EF7]"
              data-testid="button-back-footer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trends Library
            </Button>
          </div>
        </div>

        {/* Floating Back to Top */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#5B6EF7] text-white rounded-full shadow-lg hover:bg-[#4958d6] transition-all duration-300"
            aria-label="Back to top"
            data-testid="button-back-to-top"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">Back to top</span>
          </button>
        )}
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        defaultSignup={false}
        returnTo={params?.slug ? `/portal/insights/${params.slug}` : "/portal"}
      />
    </InsightPageWrapper>
  );
}
