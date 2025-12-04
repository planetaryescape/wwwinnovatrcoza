import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Archive, 
  Eye,
  Download,
  TrendingUp,
  FileText,
  Clock,
  FileSpreadsheet,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  Loader2,
} from "lucide-react";
import ReportEditorModal from "./ReportEditorModal";
import { exportReportsToCSV, exportPerformanceToCSV } from "@/lib/csvExport";

type StatusType = "draft" | "scheduled" | "published" | "archived" | "all";
type AccessLevel = "public" | "starter" | "growth" | "scale" | "tier" | "paid" | "all";

interface ReportData {
  id: string;
  title: string;
  category: string;
  series?: string;
  industry: string;
  date: string;
  teaser: string;
  slug: string;
  coverImage?: string;
  pdfUrl?: string | null;
  pdfPath?: string | null;
  hasDownload?: boolean;
  videoPaths?: string[];
  topics?: string[];
  tags?: string[];
  isNew?: boolean;
  access?: "free" | "members";
  accessLevel?: string;
  allowedTiers?: string[];
  status?: string;
  viewCount?: number;
  downloadCount?: number;
  isFeatured?: boolean;
  creditType?: string;
  creditCost?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "Scheduled", color: "bg-amber-100 text-amber-700" },
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  archived: { label: "Archived", color: "bg-red-100 text-red-700" },
};

const accessConfig: Record<string, { label: string; color: string }> = {
  public: { label: "Free", color: "bg-blue-50 text-[#0033A0]" },
  starter: { label: "Starter", color: "bg-violet-50 text-violet-700" },
  growth: { label: "Growth", color: "bg-orange-50 text-orange-700" },
  scale: { label: "Scale", color: "bg-emerald-50 text-emerald-700" },
  tier: { label: "Tier-locked", color: "bg-amber-50 text-amber-700" },
  paid: { label: "Paid", color: "bg-rose-50 text-rose-700" },
  member: { label: "Members", color: "bg-violet-50 text-violet-700" },
};

function normalizeAccessLevel(level: string | undefined): string {
  if (!level) return "public";
  const lower = level.toLowerCase();
  if (lower === "public" || lower === "free") return "public";
  if (lower === "starter" || lower === "member") return "starter";
  if (lower === "growth") return "growth";
  if (lower === "scale") return "scale";
  if (lower === "tier") return "tier";
  if (lower === "paid") return "paid";
  return lower;
}

const categoryColors: Record<string, string> = {
  Insights: "bg-blue-50 text-[#0033A0]",
  Launch: "bg-orange-50 text-orange-700",
  Inside: "bg-violet-50 text-violet-700",
  IRL: "bg-rose-50 text-rose-700",
};

export default function AdminReports() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [accessFilter, setAccessFilter] = useState<AccessLevel>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reports");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const categories = useMemo(() => 
    Array.from(new Set(reports.map(r => r.category))),
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.teaser.toLowerCase().includes(searchQuery.toLowerCase());
      
      const reportStatus = report.status || "published";
      const matchesStatus = statusFilter === "all" || reportStatus === statusFilter;
      
      const reportAccess = normalizeAccessLevel(report.accessLevel);
      const paidTiers = ["starter", "growth", "scale", "paid", "tier"];
      const matchesAccess = accessFilter === "all" || 
        (accessFilter === "paid" ? paidTiers.includes(reportAccess) : reportAccess === accessFilter);
      
      const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesAccess && matchesCategory;
    });
  }, [reports, searchQuery, statusFilter, accessFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: reports.length,
    published: reports.filter(r => (r.status || "published") === "published").length,
    draft: reports.filter(r => r.status === "draft").length,
    scheduled: reports.filter(r => r.status === "scheduled").length,
  }), [reports]);

  const calendarData = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: { date: number; reports: ReportData[] }[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: 0, reports: [] });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.date);
        return reportDate.getFullYear() === year && 
               reportDate.getMonth() === month && 
               reportDate.getDate() === d;
      });
      days.push({ date: d, reports: dayReports });
    }
    
    while (days.length % 7 !== 0) {
      days.push({ date: 0, reports: [] });
    }
    
    return days;
  }, [reports, calendarMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    setCalendarMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const handleEdit = (report: ReportData) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedReport(null);
    setModalOpen(true);
  };

  const handleArchive = async (reportId: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: "archived" } : r
      ));
    } catch (err) {
      console.error("Failed to archive report:", err);
    }
  };

  const handleRefresh = () => {
    fetchReports();
    setModalOpen(false);
    setSelectedReport(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 
            className="text-2xl font-bold mb-1 text-gray-900"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            Reports Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Create, edit and schedule research reports and insights
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full" data-testid="button-export">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportReportsToCSV(reports)}>
                <FileText className="w-4 h-4 mr-2" />
                Export All Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPerformanceToCSV(reports)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Export Performance Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={handleNew} 
            className="rounded-full"
            style={{ backgroundColor: '#0033A0' }}
            data-testid="button-new-report"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-5 h-5 text-[#0033A0]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <Eye className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <Pencil className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Clock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-reports"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusType)}>
                <SelectTrigger className="w-[130px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accessFilter} onValueChange={(v) => setAccessFilter(v as AccessLevel)}>
                <SelectTrigger className="w-[130px]" data-testid="select-access-filter">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Access</SelectItem>
                  <SelectItem value="public">Free</SelectItem>
                  <SelectItem value="starter">Starter+</SelectItem>
                  <SelectItem value="growth">Growth+</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="paid">All Paid</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-none"
                  data-testid="button-table-view"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className="rounded-none"
                  data-testid="button-calendar-view"
                >
                  <CalendarDays className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "calendar" ? (
        <Card className="bg-white border p-4" data-testid="calendar-view">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {monthNames[calendarMonth.month]} {calendarMonth.year}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, idx) => (
              <div 
                key={idx} 
                className={`min-h-[80px] p-1 border rounded-md ${
                  day.date === 0 ? 'bg-muted/30' : 'bg-background'
                }`}
              >
                {day.date > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                    <div className="space-y-1 mt-1">
                      {day.reports.slice(0, 2).map((report) => (
                        <div
                          key={report.id}
                          onClick={() => handleEdit(report)}
                          className={`text-[10px] p-1 rounded cursor-pointer truncate ${
                            categoryColors[report.category] || 'bg-muted'
                          }`}
                          title={report.title}
                        >
                          {report.title}
                        </div>
                      ))}
                      {day.reports.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{day.reports.length - 2} more
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
      <Card className="bg-white border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium">Report</TableHead>
                <TableHead className="font-medium w-24">Category</TableHead>
                <TableHead className="font-medium w-24">Status</TableHead>
                <TableHead className="font-medium w-24">Access</TableHead>
                <TableHead className="font-medium w-24 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Views
                  </div>
                </TableHead>
                <TableHead className="font-medium w-24 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    DLs
                  </div>
                </TableHead>
                <TableHead className="font-medium w-28">Published</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reports found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const reportStatus = report.status || "published";
                  const reportAccess = normalizeAccessLevel(report.accessLevel);
                  const statusStyle = statusConfig[reportStatus] || statusConfig.published;
                  const accessStyle = accessConfig[reportAccess] || accessConfig.public;
                  const categoryStyle = categoryColors[report.category] || categoryColors.Insights;
                  
                  return (
                    <TableRow 
                      key={report.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEdit(report)}
                      data-testid={`row-report-${report.id}`}
                    >
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium text-sm text-gray-900 truncate">{report.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{report.teaser}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${categoryStyle} border-0`}>
                          {report.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusStyle.color} border-0`}>
                          {statusStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${accessStyle.color} border-0`}>
                          {accessStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-gray-600">{report.viewCount || 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-gray-600">{report.downloadCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(report.date)}</span>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-menu-${report.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(report)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/portal/insights/${report.slug}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleArchive(report.id)}
                              className="text-red-600"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-muted-foreground">
            Showing {filteredReports.length} of {reports.length} reports
          </p>
        </div>
      </Card>
      )}

      <ReportEditorModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        report={selectedReport}
        onSuccess={handleRefresh} 
      />
    </div>
  );
}
