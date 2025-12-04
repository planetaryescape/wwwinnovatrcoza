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

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    totalCompanies: number;
    activeStudies: number;
    reportsPublished: number;
    creditsRemaining: {
      basic: number;
      pro: number;
    };
  };
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
    icon: Icon, 
    iconColor = "text-primary"
  }: { 
    label: string; 
    value: string | number; 
    icon: any;
    iconColor?: string;
  }) => (
    <Card className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
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
          icon={Users}
          iconColor="text-blue-500"
        />
        <MetricCard 
          label="Companies" 
          value={analytics?.metrics.totalCompanies || 0} 
          icon={Building2}
          iconColor="text-violet-500"
        />
        <MetricCard 
          label="Active Studies" 
          value={analytics?.metrics.activeStudies || 0} 
          icon={FlaskConical}
          iconColor="text-orange-500"
        />
        <MetricCard 
          label="Reports" 
          value={analytics?.metrics.reportsPublished || 0}
          icon={FileCheck}
          iconColor="text-emerald-500"
        />
        <MetricCard 
          label="Credits Available" 
          value={`${analytics?.metrics.creditsRemaining.basic || 0} Basic / ${analytics?.metrics.creditsRemaining.pro || 0} Pro`}
          icon={Zap}
          iconColor="text-amber-500"
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
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Research Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {analytics?.pipeline.briefStats.new || 0}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> New
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {analytics?.pipeline.briefStats.inProgress || 0}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3" /> In Progress
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {analytics?.pipeline.briefStats.completed || 0}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{analytics?.pipeline.activeStudies || 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div 
                className="h-2 bg-blue-500 rounded-l-full transition-all" 
                style={{ 
                  width: `${((analytics?.pipeline.briefStats.new || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%`,
                  minWidth: analytics?.pipeline.briefStats.new ? '10%' : '0'
                }}
              />
              <div 
                className="h-2 bg-yellow-500 transition-all" 
                style={{ 
                  width: `${((analytics?.pipeline.briefStats.inProgress || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%`,
                  minWidth: analytics?.pipeline.briefStats.inProgress ? '10%' : '0'
                }}
              />
              <div 
                className="h-2 bg-green-500 rounded-r-full transition-all" 
                style={{ 
                  width: `${((analytics?.pipeline.briefStats.completed || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%`,
                  minWidth: analytics?.pipeline.briefStats.completed ? '10%' : '0'
                }}
              />
            </div>

            <div className="text-sm text-muted-foreground text-center">
              {analytics?.pipeline.totalBriefs || 0} total briefs in pipeline
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
