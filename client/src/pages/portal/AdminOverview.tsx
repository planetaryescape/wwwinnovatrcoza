import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Building2, 
  FileText, 
  Zap,
  RefreshCw,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  FileCheck,
  ExternalLink,
  FlaskConical,
  Eye,
  Download,
  TrendingUp,
  Shield,
  KeyRound,
  AlertTriangle,
  UserX,
  LogIn,
} from "lucide-react";

interface Study {
  id: string;
  title: string;
  companyName: string;
  status: string;
  studyType: string;
  isTest24: boolean;
  submittedByName: string;
  createdAt: string;
  deliveryDate?: string;
  clientReportId?: string | null;
}

interface Report {
  id: string;
  title: string;
  category: string;
  accessLevel: string;
  status: string;
  date: string;
  topics: string[];
}

interface BriefStats {
  new: number;
  inProgress: number;
  completed: number;
  onHold: number;
}

interface Test24Stats {
  totalBasic: number;
  totalPro: number;
  completedBasic: number;
  completedPro: number;
  completed: number;
  basicThisMonth: number;
  proThisMonth: number;
  inProgress: number;
  briefsInPipeline: number;
}

interface AuthActivity {
  loginsThisMonth: number;
  loginFailuresThisMonth: number;
  passwordResetRequestsThisMonth: number;
  passwordResetCompletionsThisMonth: number;
  activeUsersThisMonth: number;
  usersNeverLoggedIn: number;
  usersInactive30Days: number;
}

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    totalCompanies: number;
    activeStudies: number;
    reportsPublished: number;
    freeReportsCount: number;
    creditsRemaining: {
      basic: number;
      pro: number;
    };
    newUsersThisMonth: number;
    newCompaniesThisMonth: number;
    newUsersInPeriod: number;
    newCompaniesInPeriod: number;
  };
  authActivity?: AuthActivity;
  test24Stats: Test24Stats;
  pipeline: {
    totalBriefs: number;
    briefStats: BriefStats;
    activeStudies: number;
  };
  test24Studies: Study[];
  freeReports: Report[];
  reportEngagement?: {
    totalViews: number;
    totalDownloads: number;
    viewsThisMonth: number;
    downloadsThisMonth: number;
    allTimeViews: number;
    allTimeDownloads: number;
    mostPopularReport: { id: string; title: string; views: number } | null;
  };
  periodLabel?: string;
  timestamp: string;
}

const PERIOD_OPTIONS = [
  { value: "1d",   label: "Last 24 hrs" },
  { value: "3d",   label: "Last 3 days" },
  { value: "7d",   label: "Last 7 days" },
  { value: "30d",  label: "Last 30 days" },
  { value: "year", label: "This year" },
  { value: "all",  label: "All time" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  "AUDIENCE_LIVE": { label: "Live", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: Play },
  "IN_PROGRESS": { label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: Loader2 },
  "COMPLETED": { label: "Completed", color: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300", icon: CheckCircle },
  "PENDING": { label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: Clock },
};

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = useCallback(async (activePeriod: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?period=${activePeriod}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
    const interval = setInterval(() => fetchAnalytics(period), 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, period]);

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
  };

  const periodLabel = analytics?.periodLabel || PERIOD_OPTIONS.find(o => o.value === period)?.label || "Last 30 days";

  const MetricCard = ({ 
    label, 
    value, 
    subLabel,
    icon: Icon, 
    iconBgColor = "bg-blue-50 dark:bg-blue-900/20",
    iconColor = "text-blue-600 dark:text-blue-400"
  }: { 
    label: string; 
    value: string | number; 
    subLabel?: string;
    icon: any;
    iconBgColor?: string;
    iconColor?: string;
  }) => (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1 truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            )}
            {subLabel && !loading && (
              <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
            )}
          </div>
          <div className={`w-11 h-11 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig["PENDING"];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-ZA", { 
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-1">Control Room</h2>
          <p className="text-muted-foreground">
            System overview
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-36" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchAnalytics(period)}
            disabled={loading}
            data-testid="button-refresh-analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card data-testid="card-platform-overview">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1" data-testid="stat-users">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Users</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.metrics.totalUsers || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">+{analytics?.metrics.newUsersInPeriod ?? analytics?.metrics.newUsersThisMonth ?? 0} in {periodLabel.toLowerCase()}</p>}
              </div>
              
              <div className="space-y-1" data-testid="stat-companies">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Companies</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.metrics.totalCompanies || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">+{analytics?.metrics.newCompaniesInPeriod ?? analytics?.metrics.newCompaniesThisMonth ?? 0} in {periodLabel.toLowerCase()}</p>}
              </div>
              
              <div className="space-y-1" data-testid="stat-studies">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Studies</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.metrics.activeStudies || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">In progress now</p>}
              </div>
              
              <div className="space-y-1" data-testid="stat-reports">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reports</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.metrics.reportsPublished || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">{analytics?.metrics.freeReportsCount || 0} free</p>}
              </div>
              
              <div className="space-y-1 col-span-2 sm:col-span-1" data-testid="stat-credits">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Credits Available</p>
                    {loading ? <Skeleton className="h-6 w-16" /> : <p className="text-xl font-bold">{analytics?.metrics.creditsRemaining.basic || 0} / {analytics?.metrics.creditsRemaining.pro || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">Basic / Pro</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-report-engagement">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Report Engagement ({periodLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1" data-testid="stat-total-views">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.reportEngagement?.totalViews || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">{analytics?.reportEngagement?.allTimeViews || 0} all time</p>}
              </div>
              
              <div className="space-y-1" data-testid="stat-total-downloads">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                    {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.reportEngagement?.totalDownloads || 0}</p>}
                  </div>
                </div>
                {!loading && <p className="text-xs text-muted-foreground pl-10">{analytics?.reportEngagement?.allTimeDownloads || 0} all time</p>}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t" data-testid="stat-most-popular">
              <p className="text-xs font-medium text-muted-foreground mb-2">Most Popular Report ({periodLabel})</p>
              {loading ? (
                <Skeleton className="h-12 w-full" />
              ) : analytics?.reportEngagement?.mostPopularReport ? (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-sm truncate">{analytics.reportEngagement.mostPopularReport.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {analytics.reportEngagement.mostPopularReport.views} views
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                  No report engagement data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-auth-activity">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            User Engagement ({periodLabel})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="space-y-1" data-testid="stat-logins">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Logins</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.loginsThisMonth || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-active-users">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.activeUsersThisMonth || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-login-failures">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed Logins</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.loginFailuresThisMonth || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-reset-requests">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reset Requests</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.passwordResetRequestsThisMonth || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-reset-completions">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resets Done</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.passwordResetCompletionsThisMonth || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-never-logged-in">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900/20 flex items-center justify-center">
                  <UserX className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Never Logged In</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.usersNeverLoggedIn || 0}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-1" data-testid="stat-inactive-30d">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inactive 30d</p>
                  {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-bold">{analytics?.authActivity?.usersInactive30Days || 0}</p>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-research-overview">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              Research Overview
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => window.location.href = "/portal/research"}
              data-testid="button-view-my-research"
            >
              View My Research
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 border rounded-lg" data-testid="stat-total-test24">
              <p className="text-2xl font-bold">
                {(analytics?.test24Stats?.totalBasic || 0) + (analytics?.test24Stats?.totalPro || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Studies</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20" data-testid="stat-inprogress-test24">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {analytics?.test24Stats?.inProgress || 0}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20" data-testid="stat-completed-test24">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {analytics?.test24Stats?.completed || 0}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 border rounded-lg" data-testid="stat-basicpro-test24">
              <p className="text-2xl font-bold">
                {analytics?.test24Stats?.totalBasic || 0}
                <span className="text-muted-foreground text-lg"> / </span>
                {analytics?.test24Stats?.totalPro || 0}
              </p>
              <p className="text-xs text-muted-foreground">Basic / Pro</p>
            </div>
          </div>

          {(() => {
            const basic = analytics?.test24Stats?.totalBasic || 0;
            const pro = analytics?.test24Stats?.totalPro || 0;
            const total = basic + pro;
            const basicPct = total > 0 ? (basic / total) * 100 : 100;
            const proPct = total > 0 ? (pro / total) * 100 : 0;
            return (
              <div className="space-y-2">
                <div className="h-5 flex rounded-md overflow-hidden border" data-testid="bar-basic-pro-distribution">
                  <div className="bg-blue-500 flex items-center justify-center transition-all duration-300" style={{ width: `${basicPct}%` }}>
                    {basicPct >= 25 && <span className="text-xs font-medium text-white">{basic}</span>}
                  </div>
                  {pro > 0 && (
                    <div className="bg-violet-500 flex items-center justify-center transition-all duration-300" style={{ width: `${proPct}%` }}>
                      {proPct >= 25 && <span className="text-xs font-medium text-white">{pro}</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Test24 Basic ({basic})
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-violet-500" /> Test24 Pro ({pro})
                  </span>
                  <span>{periodLabel}: {analytics?.test24Stats?.basicThisMonth || 0} Basic / {analytics?.test24Stats?.proThisMonth || 0} Pro</span>
                </div>
              </div>
            );
          })()}

          <div className="border-t pt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : analytics?.test24Studies && analytics.test24Studies.length > 0 ? (
              <div className="space-y-2">
                {analytics.test24Studies.map((study) => (
                  <div
                    key={study.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover-elevate"
                    data-testid={`study-item-${study.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{study.title}</p>
                        {study.clientReportId && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">Report</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{study.companyName}</span>
                        <span className="text-xs text-muted-foreground">
                          {study.studyType?.toLowerCase().includes("pro") ? "Test24 Pro" : "Test24 Basic"}
                        </span>
                        {study.submittedByName && study.submittedByName !== "Unknown" && (
                          <span className="text-xs text-muted-foreground">{study.submittedByName}</span>
                        )}
                        {study.deliveryDate && (
                          <span className="text-xs text-muted-foreground">Delivered {formatDate(study.deliveryDate)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(study.status)}
                      {study.clientReportId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => window.location.href = "/portal/research"}
                          data-testid={`button-view-report-${study.id}`}
                          title="View report in My Research"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No Test24 studies yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
