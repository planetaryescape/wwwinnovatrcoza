import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  basicThisMonth: number;
  proThisMonth: number;
  inProgress: number;
  briefsInPipeline: number;
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
  };
  test24Stats: Test24Stats;
  pipeline: {
    totalBriefs: number;
    briefStats: BriefStats;
    activeStudies: number;
  };
  test24Studies: Study[];
  freeReports: Report[];
  timestamp: string;
}

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

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/analytics?period=all");
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
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

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
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchAnalytics}
          disabled={loading}
          data-testid="button-refresh-analytics"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard 
          label="Users" 
          value={analytics?.metrics.totalUsers || 0}
          subLabel={`New this month: ${analytics?.metrics.newUsersThisMonth || 0}`}
          icon={Users}
          iconBgColor="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <MetricCard 
          label="Companies" 
          value={analytics?.metrics.totalCompanies || 0}
          subLabel={`New this month: ${analytics?.metrics.newCompaniesThisMonth || 0}`}
          icon={Building2}
          iconBgColor="bg-violet-50 dark:bg-violet-900/20"
          iconColor="text-violet-600 dark:text-violet-400"
        />
        <MetricCard 
          label="Active Studies" 
          value={analytics?.metrics.activeStudies || 0}
          subLabel="In progress now"
          icon={FlaskConical}
          iconBgColor="bg-orange-50 dark:bg-orange-900/20"
          iconColor="text-orange-600 dark:text-orange-400"
        />
        <MetricCard 
          label="Reports" 
          value={analytics?.metrics.reportsPublished || 0}
          subLabel={`Free: ${analytics?.metrics.freeReportsCount || 0}`}
          icon={FileCheck}
          iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard 
          label="Credits Available" 
          value={`${analytics?.metrics.creditsRemaining.basic || 0} / ${analytics?.metrics.creditsRemaining.pro || 0}`}
          subLabel="Basic / Pro across all"
          icon={Zap}
          iconBgColor="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              Test24 Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Total Basic: {analytics?.test24Stats?.totalBasic || 0}
              </Badge>
              <Badge variant="secondary" className="text-xs px-3 py-1">
                Total Pro: {analytics?.test24Stats?.totalPro || 0}
              </Badge>
              <Badge variant="outline" className="text-xs px-3 py-1">
                This month: {analytics?.test24Stats?.basicThisMonth || 0} Basic / {analytics?.test24Stats?.proThisMonth || 0} Pro
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs px-3 py-1">
                In progress: {analytics?.test24Stats?.inProgress || 0}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 bg-blue-500 rounded-l-full transition-all" 
                  style={{ 
                    width: `${(analytics?.test24Stats?.totalBasic || 0) / Math.max(1, (analytics?.test24Stats?.totalBasic || 0) + (analytics?.test24Stats?.totalPro || 0)) * 100}%`,
                    minWidth: analytics?.test24Stats?.totalBasic ? '20%' : '0'
                  }}
                />
                <div 
                  className="h-3 bg-violet-500 rounded-r-full transition-all" 
                  style={{ 
                    width: `${(analytics?.test24Stats?.totalPro || 0) / Math.max(1, (analytics?.test24Stats?.totalBasic || 0) + (analytics?.test24Stats?.totalPro || 0)) * 100}%`,
                    minWidth: analytics?.test24Stats?.totalPro ? '20%' : '0'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Basic
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-500" /> Pro
                </span>
                <span>{analytics?.test24Stats?.briefsInPipeline || 0} briefs in pipeline</span>
              </div>
            </div>

            <div className="border-t pt-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : analytics?.test24Studies && analytics.test24Studies.length > 0 ? (
                <div className="space-y-3">
                  {analytics.test24Studies.map((study) => (
                    <div 
                      key={study.id} 
                      className="p-3 border rounded-lg hover-elevate"
                      data-testid={`study-item-${study.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{study.title}</p>
                          <p className="text-sm text-muted-foreground">{study.companyName}</p>
                        </div>
                        {getStatusBadge(study.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {study.studyType === "basic" ? "Test24 Basic" : "Test24 Pro"}
                        </span>
                        <span>
                          {study.submittedByName}
                        </span>
                        {study.deliveryDate && (
                          <span>Delivered: {formatDate(study.deliveryDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No Test24 studies yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-500" />
                Test24 Activity Snapshot
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = "/portal/admin?tab=briefs"}
                data-testid="button-view-all-briefs"
              >
                View all
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">
                  {(analytics?.test24Stats?.totalBasic || 0) + (analytics?.test24Stats?.totalPro || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Studies</p>
              </div>
              <div className="text-center p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {analytics?.test24Stats?.inProgress || 0}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {analytics?.pipeline.briefStats.completed || 0}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Basic vs Pro Distribution</p>
              {(() => {
                const basic = analytics?.test24Stats?.totalBasic || 0;
                const pro = analytics?.test24Stats?.totalPro || 0;
                const total = basic + pro;
                const basicPercent = total > 0 ? (basic / total) * 100 : 50;
                const proPercent = total > 0 ? (pro / total) * 100 : 50;
                
                return (
                  <div className="space-y-3">
                    <div className="h-6 flex rounded-md overflow-hidden border" data-testid="bar-basic-pro-distribution">
                      <div 
                        className="bg-blue-500 flex items-center justify-center transition-all duration-300"
                        style={{ width: `${basicPercent}%` }}
                      >
                        {basicPercent >= 20 && (
                          <span className="text-xs font-medium text-white">{basic}</span>
                        )}
                      </div>
                      <div 
                        className="bg-violet-500 flex items-center justify-center transition-all duration-300"
                        style={{ width: `${proPercent}%` }}
                      >
                        {proPercent >= 20 && (
                          <span className="text-xs font-medium text-white">{pro}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span>Test24 Basic ({basic})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-violet-500"></div>
                        <span>Test24 Pro ({pro})</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3">Live Studies</p>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : analytics?.test24Studies && analytics.test24Studies.filter(s => s.status !== "COMPLETED").length > 0 ? (
                <div className="space-y-2">
                  {analytics.test24Studies
                    .filter(s => s.status !== "COMPLETED")
                    .slice(0, 3)
                    .map((study) => (
                      <div 
                        key={study.id} 
                        className="flex items-center justify-between p-2 rounded-lg border hover-elevate"
                        data-testid={`snapshot-study-${study.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{study.title}</p>
                          <p className="text-xs text-muted-foreground">{study.companyName}</p>
                        </div>
                        {getStatusBadge(study.status)}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No live studies
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-500" />
            Free Reports Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : analytics?.freeReports && analytics.freeReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.freeReports.map((report) => (
                <div 
                  key={report.id} 
                  className="p-3 border rounded-lg hover-elevate"
                  data-testid={`report-item-${report.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-medium text-sm line-clamp-2">{report.title}</p>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {report.category}
                    </Badge>
                    {report.topics?.slice(0, 2).map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(report.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No free reports available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">System Status: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Database: Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
