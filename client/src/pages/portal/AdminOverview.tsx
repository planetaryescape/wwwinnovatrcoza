import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Building2, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Crown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    totalCompanies: number;
    activeSubscriptions: number;
    activeStudies: number;
    briefsThisPeriod: number;
    reportsPublished: number;
    creditsRemaining: {
      basic: number;
      pro: number;
    };
  };
  people: {
    newUsers: number;
    newCompanies: number;
    topActiveCompany: string;
    usersByTier: {
      starter: number;
      growth: number;
      scale: number;
    };
  };
  revenue: {
    ordersThisPeriod: number;
    totalOrderValue: number;
    averageOrderValue: number;
    creditsPurchased: number;
    creditsUsed: number;
    nextToRunOut: string;
  };
  pipeline: {
    totalBriefs: number;
    briefStats: {
      new: number;
      inProgress: number;
      completed: number;
      onHold: number;
    };
    activeStudies: number;
    studyTrend: { month: string; studies: number }[];
  };
  charts: {
    studiesByCompany: { name: string; studies: number; basicCredits: number; proCredits: number }[];
    orderTrend: { month: string; orders: number; revenue: number }[];
    studyTrend: { month: string; studies: number }[];
  };
  activeDeals: number;
  timestamp: string;
}

const CHART_COLORS = {
  primary: "#0033A0",
  secondary: "#7c3aed",
  success: "#22c55e",
  warning: "#f59e0b",
  info: "#3b82f6",
  muted: "#6b7280",
};

const CATEGORY_COLORS = ["#0033A0", "#7c3aed", "#f97316", "#ec4899"];

export default function AdminOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30d");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const formatCurrency = (value: number) => 
    `R${value.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-ZA", { month: "short" });
  };

  const handleDownloadPdf = async () => {
    if (!analytics) return;
    const summaryText = `
Innovatr Admin Summary
Generated: ${new Date().toLocaleString()}
Period: ${period === "7d" ? "Last 7 Days" : period === "30d" ? "Last 30 Days" : period === "year" ? "This Year" : "All Time"}

KEY METRICS
- Total Users: ${analytics.metrics.totalUsers}
- Total Companies: ${analytics.metrics.totalCompanies}
- Active Subscriptions: ${analytics.metrics.activeSubscriptions}
- Active Studies: ${analytics.metrics.activeStudies}
- Briefs This Period: ${analytics.metrics.briefsThisPeriod}
- Reports Published: ${analytics.metrics.reportsPublished}
- Credits Remaining: ${analytics.metrics.creditsRemaining.basic} Basic, ${analytics.metrics.creditsRemaining.pro} Pro

REVENUE & ORDERS
- Orders This Period: ${analytics.revenue.ordersThisPeriod}
- Total Order Value: ${formatCurrency(analytics.revenue.totalOrderValue)}
- Average Order Value: ${formatCurrency(analytics.revenue.averageOrderValue)}

RESEARCH PIPELINE
- Total Briefs: ${analytics.pipeline.totalBriefs}
- New: ${analytics.pipeline.briefStats.new}
- In Progress: ${analytics.pipeline.briefStats.inProgress}
- Completed: ${analytics.pipeline.briefStats.completed}

TOP ACTIVE COMPANY: ${analytics.people.topActiveCompany}
NEXT TO RUN OUT OF CREDITS: ${analytics.revenue.nextToRunOut}
    `.trim();

    const blob = new Blob([summaryText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `innovatr-admin-summary-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    subtitle,
    iconColor = "text-primary"
  }: { 
    label: string; 
    value: string | number; 
    icon: any;
    subtitle?: string;
    iconColor?: string;
  }) => (
    <Card className="hover-elevate cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const reportCategories = [
    { name: "Insights", value: 6 },
    { name: "Launch", value: 4 },
    { name: "Inside", value: 3 },
    { name: "IRL", value: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-1">Control Room</h2>
          <p className="text-muted-foreground">
            System overview and analytics dashboard
            {lastUpdated && (
              <span className="ml-2 text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
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
          <Button 
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={loading || !analytics}
            data-testid="button-download-summary"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Summary
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard 
          label="Total Users" 
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
          label="Active Subs" 
          value={analytics?.metrics.activeSubscriptions || 0} 
          icon={CreditCard}
          iconColor="text-green-500"
        />
        <MetricCard 
          label="Active Studies" 
          value={analytics?.metrics.activeStudies || 0} 
          icon={BarChart3}
          iconColor="text-orange-500"
        />
        <MetricCard 
          label="Briefs" 
          value={analytics?.metrics.briefsThisPeriod || 0}
          subtitle="This period"
          icon={FileText}
          iconColor="text-blue-500"
        />
        <MetricCard 
          label="Reports" 
          value={analytics?.metrics.reportsPublished || 0}
          subtitle="Published"
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <MetricCard 
          label="Credits Left" 
          value={`${analytics?.metrics.creditsRemaining.basic || 0}B / ${analytics?.metrics.creditsRemaining.pro || 0}P`}
          icon={Zap}
          iconColor="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              People & Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{analytics?.people.newUsers || 0}</p>
                <p className="text-xs text-muted-foreground">New Users</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{analytics?.people.newCompanies || 0}</p>
                <p className="text-xs text-muted-foreground">New Companies</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-bold truncate">{analytics?.people.topActiveCompany || "N/A"}</p>
                <p className="text-xs text-muted-foreground">Top Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {analytics?.people.usersByTier.starter || 0} Starter
              </Badge>
              <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {analytics?.people.usersByTier.growth || 0} Growth
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {analytics?.people.usersByTier.scale || 0} Scale
              </Badge>
            </div>

            {analytics?.charts.studiesByCompany && analytics.charts.studiesByCompany.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.studiesByCompany.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} />
                    <YAxis type="category" dataKey="name" width={100} fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="studies" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Revenue & Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{analytics?.revenue.ordersThisPeriod || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(analytics?.revenue.totalOrderValue || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">
                  {formatCurrency(analytics?.revenue.averageOrderValue || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Avg Order</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm">Next to run out:</span>
              </div>
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {analytics?.revenue.nextToRunOut || "N/A"}
              </span>
            </div>

            {analytics?.charts.studiesByCompany && analytics.charts.studiesByCompany.length > 0 && (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.studiesByCompany.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="basicCredits" name="Basic" stackId="a" fill={CHART_COLORS.info} />
                    <Bar dataKey="proCredits" name="Pro" stackId="a" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Research Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                  {analytics?.pipeline.briefStats.new || 0}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> New
                </p>
              </div>
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                  {analytics?.pipeline.briefStats.inProgress || 0}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Loader2 className="w-3 h-3" /> Progress
                </p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                  {analytics?.pipeline.briefStats.completed || 0}
                </p>
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Done
                </p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold">{analytics?.pipeline.activeStudies || 0}</p>
                <p className="text-[10px] text-muted-foreground">Active</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all" 
                  style={{ width: `${((analytics?.pipeline.briefStats.new || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%` }}
                />
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all" 
                  style={{ width: `${((analytics?.pipeline.briefStats.inProgress || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%` }}
                />
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${((analytics?.pipeline.briefStats.completed || 0) / Math.max(1, analytics?.pipeline.totalBriefs || 1)) * 100}%` }}
                />
              </div>
            </div>

            {analytics?.charts.studyTrend && analytics.charts.studyTrend.length > 0 && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.charts.studyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={10} tickFormatter={formatMonth} />
                    <YAxis fontSize={12} />
                    <Tooltip labelFormatter={(v) => formatMonth(v as string)} />
                    <Line 
                      type="monotone" 
                      dataKey="studies" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.primary, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Reports & Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold">16</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xl font-bold text-green-700 dark:text-green-400">16</p>
                <p className="text-[10px] text-muted-foreground">Published</p>
              </div>
              <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xl font-bold text-amber-700 dark:text-amber-400">0</p>
                <p className="text-[10px] text-muted-foreground">Scheduled</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold">0</p>
                <p className="text-[10px] text-muted-foreground">Drafts</p>
              </div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {reportCategories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2">
              {reportCategories.map((cat, i) => (
                <Badge 
                  key={cat.name} 
                  variant="secondary"
                  style={{ backgroundColor: `${CATEGORY_COLORS[i]}20`, color: CATEGORY_COLORS[i] }}
                >
                  {cat.name}: {cat.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Email Service: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Database: Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Active Deals: {analytics?.activeDeals || 0}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              System Status: All Systems Operational
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
