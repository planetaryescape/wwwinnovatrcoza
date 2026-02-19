import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Trash2,
  Image,
  Check,
  X,
  Sparkles,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportEditorModal from "./ReportEditorModal";
import { exportReportsToCSV, exportPerformanceToCSV } from "@/lib/csvExport";

type StatusType = "draft" | "scheduled" | "published" | "archived" | "all";
type AccessLevel = "public" | "starter" | "growth" | "scale" | "tier" | "paid" | "all";
type ReportType = "all" | "library" | "client";

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
  isClientReport?: boolean;
  clientCompanyIds?: string[];
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
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [accessFilter, setAccessFilter] = useState<AccessLevel>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<ReportType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [reportToDelete, setReportToDelete] = useState<ReportData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState("");
  const [inlineSaving, setInlineSaving] = useState(false);
  const quickImageInputRef = useRef<HTMLInputElement>(null);
  const [quickImageReportId, setQuickImageReportId] = useState<string | null>(null);

  interface ReportRequest {
    id: string;
    name: string;
    email: string;
    companyName: string;
    industry: string;
    topic: string;
    reason: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  const [reportRequests, setReportRequests] = useState<ReportRequest[]>([]);
  const [requestsExpanded, setRequestsExpanded] = useState(true);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null);

  interface InsightMailer {
    id: string;
    mailerNumber: number;
    month: string;
    scheduledDate: string;
    day: string;
    sendTime: string;
    topic: string;
    subjectLine: string;
    previewText: string;
    bodyContent: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  const [insightMailers, setInsightMailers] = useState<InsightMailer[]>([]);
  const [mailersLoading, setMailersLoading] = useState(true);
  const [mailersExpanded, setMailersExpanded] = useState(true);
  const [expandedMailerId, setExpandedMailerId] = useState<string | null>(null);
  const [mailerStatusLoading, setMailerStatusLoading] = useState<string | null>(null);

  const pendingRequestsCount = useMemo(
    () => reportRequests.filter(r => r.status === "pending").length,
    [reportRequests]
  );

  const getMailerAutoStatus = useCallback((mailer: InsightMailer) => {
    const now = new Date();
    const scheduled = new Date(mailer.scheduledDate);
    if (mailer.status === "sent") return "sent";
    if (mailer.status === "draft") return "draft";
    if (scheduled < now) return "overdue";
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (scheduled <= sevenDaysFromNow) return "upcoming";
    return "scheduled";
  }, []);

  const upcomingMailersCount = useMemo(() => {
    return insightMailers.filter(m => {
      const status = getMailerAutoStatus(m);
      return status === "upcoming" || status === "overdue";
    }).length;
  }, [insightMailers, getMailerAutoStatus]);

  const fetchReportRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/report-requests");
      if (!res.ok) return;
      const data = await res.json();
      setReportRequests(data);
    } catch (err) {
      console.error("Failed to fetch report requests:", err);
    }
  }, []);

  const fetchInsightMailers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/insight-mailers");
      if (!res.ok) return;
      const data = await res.json();
      setInsightMailers(data);
    } catch (err) {
      console.error("Failed to fetch insight mailers:", err);
    } finally {
      setMailersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportRequests();
    fetchInsightMailers();
  }, [fetchReportRequests, fetchInsightMailers]);

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    setRequestActionLoading(id);
    try {
      const res = await fetch(`/api/admin/report-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setReportRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status } : r)
      );
      toast({
        title: status === "received" ? "Marked as received" : "Marked as complete",
        description: status === "received"
          ? "Confirmation email sent to requester."
          : "Request marked as completed.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update request status.",
        variant: "destructive",
      });
    } finally {
      setRequestActionLoading(null);
    }
  };

  const handleUpdateMailerStatus = async (id: string, status: string) => {
    setMailerStatusLoading(id);
    try {
      const res = await fetch(`/api/admin/insight-mailers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update mailer status");
      setInsightMailers(prev =>
        prev.map(m => m.id === id ? { ...m, status } : m)
      );
      toast({
        title: "Status updated",
        description: `Mailer marked as ${status}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not update mailer status.",
        variant: "destructive",
      });
    } finally {
      setMailerStatusLoading(null);
    }
  };

  const handleInlineTitleSave = async (reportId: string) => {
    if (!inlineEditTitle.trim()) return;
    setInlineSaving(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: inlineEditTitle.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, title: inlineEditTitle.trim() } : r));
      toast({ title: "Title updated" });
    } catch (err) {
      toast({ title: "Error", description: "Could not update title", variant: "destructive" });
    } finally {
      setInlineSaving(false);
      setInlineEditId(null);
    }
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quickImageReportId) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("file", file);
      formDataPayload.append("fileType", "cover");
      const uploadRes = await fetch("/api/admin/reports/upload", { method: "POST", body: formDataPayload });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      
      const patchRes = await fetch(`/api/admin/reports/${quickImageReportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: url }),
      });
      if (!patchRes.ok) throw new Error("Save failed");
      setReports(prev => prev.map(r => r.id === quickImageReportId ? { ...r, coverImage: url } : r));
      toast({ title: "Cover image updated" });
    } catch (err) {
      toast({ title: "Error", description: "Could not update image", variant: "destructive" });
    } finally {
      setQuickImageReportId(null);
      if (quickImageInputRef.current) quickImageInputRef.current.value = "";
    }
  };

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
      
      const isClient = report.isClientReport === true;
      const matchesType = typeFilter === "all" || 
        (typeFilter === "client" ? isClient : !isClient);
      
      return matchesSearch && matchesStatus && matchesAccess && matchesCategory && matchesType;
    });
  }, [reports, searchQuery, statusFilter, accessFilter, categoryFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: reports.length,
    published: reports.filter(r => (r.status || "published") === "published").length,
    draft: reports.filter(r => r.status === "draft").length,
    scheduled: reports.filter(r => r.status === "scheduled").length,
    library: reports.filter(r => !r.isClientReport).length,
    client: reports.filter(r => r.isClientReport === true).length,
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

  const handleToggleFeatured = async (report: ReportData) => {
    try {
      const newValue = !report.isFeatured;
      await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: newValue }),
      });
      setReports(reports.map(r => 
        r.id === report.id ? { ...r, isFeatured: newValue } : r
      ));
      toast({
        title: newValue ? "Report featured" : "Report unfeatured",
        description: newValue ? "This report will now appear in the Featured spotlight." : "This report has been removed from Featured.",
      });
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
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

  const handleDelete = async () => {
    if (!reportToDelete) return;
    
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/admin/reports/${reportToDelete.id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      toast({
        title: "Report deleted",
        description: `"${reportToDelete.title}" has been permanently deleted.`,
      });
    } catch (err) {
      console.error("Failed to delete report:", err);
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setReportToDelete(null);
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
      <Card className="bg-white border" data-testid="report-requests-section">
        <div
          className="flex items-center justify-between gap-2 p-4 cursor-pointer select-none"
          onClick={() => setRequestsExpanded(prev => !prev)}
        >
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-[#0033A0]" />
            <h3 className="text-lg font-semibold text-gray-900">Report Requests</h3>
            {pendingRequestsCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                {pendingRequestsCount} pending
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon">
            {requestsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        {requestsExpanded && (
          <CardContent className="p-4 pt-0">
            {reportRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No report requests yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-medium">Date</TableHead>
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Company</TableHead>
                      <TableHead className="font-medium">Industry</TableHead>
                      <TableHead className="font-medium">Topic</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportRequests.map((req) => {
                      const statusColors: Record<string, string> = {
                        pending: "bg-amber-100 text-amber-700",
                        received: "bg-blue-100 text-blue-700",
                        completed: "bg-green-100 text-green-700",
                      };
                      return (
                        <TableRow key={req.id} data-testid={`row-request-${req.id}`}>
                          <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-gray-900">{req.name}</TableCell>
                          <TableCell className="text-sm text-gray-600">{req.email}</TableCell>
                          <TableCell className="text-sm text-gray-600">{req.companyName}</TableCell>
                          <TableCell className="text-sm text-gray-600">{req.industry}</TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{req.topic}</TableCell>
                          <TableCell>
                            <Badge className={`text-xs border-0 ${statusColors[req.status] || "bg-gray-100 text-gray-700"}`}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {req.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={requestActionLoading === req.id}
                                  onClick={() => handleUpdateRequestStatus(req.id, "received")}
                                  data-testid={`button-mark-received-${req.id}`}
                                >
                                  {requestActionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                  Mark as Received
                                </Button>
                              )}
                              {(req.status === "pending" || req.status === "received") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={requestActionLoading === req.id}
                                  onClick={() => handleUpdateRequestStatus(req.id, "completed")}
                                  data-testid={`button-mark-complete-${req.id}`}
                                >
                                  {requestActionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                  Mark as Complete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card className="bg-white border" data-testid="insight-mailers-section">
        <div
          className="flex items-center justify-between gap-2 p-4 cursor-pointer select-none"
          onClick={() => setMailersExpanded(prev => !prev)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0033A0]" />
            <h3 className="text-lg font-semibold text-gray-900">INNOVATR INSIDE Mailer Schedule</h3>
            {upcomingMailersCount > 0 && (
              <Badge className="bg-blue-100 text-[#0033A0] border-0 text-xs">
                {upcomingMailersCount} upcoming
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon">
            {mailersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        {mailersExpanded && (
          <CardContent className="p-4 pt-0">
            {mailersLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : insightMailers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No insight mailers scheduled</p>
            ) : (
              <div className="space-y-2">
                {insightMailers.map((mailer) => {
                  const autoStatus = getMailerAutoStatus(mailer);
                  const statusColors: Record<string, string> = {
                    sent: "bg-green-100 text-green-700",
                    scheduled: "bg-gray-100 text-gray-600",
                    upcoming: "bg-blue-100 text-[#0033A0]",
                    overdue: "bg-red-100 text-red-700",
                    draft: "bg-amber-100 text-amber-700",
                  };
                  const isExpanded = expandedMailerId === mailer.id;
                  return (
                    <div key={mailer.id} className="border rounded-md" data-testid={`mailer-row-${mailer.id}`}>
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer select-none hover-elevate"
                        onClick={() => setExpandedMailerId(isExpanded ? null : mailer.id)}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0033A0]/10 text-[#0033A0] text-sm font-bold flex-shrink-0">
                          {mailer.mailerNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 truncate">{mailer.topic}</span>
                            <Badge className={`text-xs border-0 ${statusColors[autoStatus] || "bg-gray-100 text-gray-700"}`}>
                              {autoStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>{mailer.month}</span>
                            <span>{new Date(mailer.scheduledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            <span>{mailer.day} at {mailer.sendTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {mailer.status !== "sent" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={mailerStatusLoading === mailer.id}
                              onClick={(e) => { e.stopPropagation(); handleUpdateMailerStatus(mailer.id, "sent"); }}
                              data-testid={`button-mark-sent-${mailer.id}`}
                            >
                              {mailerStatusLoading === mailer.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Mark Sent
                            </Button>
                          )}
                          {mailer.status === "sent" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={mailerStatusLoading === mailer.id}
                              onClick={(e) => { e.stopPropagation(); handleUpdateMailerStatus(mailer.id, "scheduled"); }}
                              data-testid={`button-revert-sent-${mailer.id}`}
                            >
                              Revert
                            </Button>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t p-4 bg-gray-50/50 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Subject Line</p>
                            <p className="text-sm text-gray-900">{mailer.subjectLine}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Preview Text</p>
                            <p className="text-sm text-gray-700">{mailer.previewText}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Body Content</p>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded-md p-3 border max-h-[300px] overflow-y-auto">
                              {mailer.bodyContent}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        )}
      </Card>

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
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ReportType)}>
                <SelectTrigger className="w-[130px]" data-testid="select-type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="library">Library ({stats.library})</SelectItem>
                  <SelectItem value="client">Client ({stats.client})</SelectItem>
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
                <TableHead className="font-medium w-20">Type</TableHead>
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
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                  const isClient = report.isClientReport === true;
                  
                  return (
                    <TableRow 
                      key={report.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => inlineEditId !== report.id && handleEdit(report)}
                      data-testid={`row-report-${report.id}`}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {inlineEditId === report.id ? (
                          <div className="flex items-center gap-1 max-w-[300px]">
                            <Input
                              value={inlineEditTitle}
                              onChange={(e) => setInlineEditTitle(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineTitleSave(report.id);
                                if (e.key === "Escape") setInlineEditId(null);
                              }}
                              data-testid={`input-inline-title-${report.id}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={() => handleInlineTitleSave(report.id)}
                              disabled={inlineSaving}
                              data-testid={`button-inline-save-${report.id}`}
                            >
                              {inlineSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-green-600" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={() => setInlineEditId(null)}
                              data-testid={`button-inline-cancel-${report.id}`}
                            >
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <div className="max-w-[300px] group/title">
                            <p className="font-medium text-sm text-gray-900 truncate flex items-center gap-1.5">
                              {report.isFeatured && <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                              {report.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{report.teaser}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${isClient ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-700'}`}>
                          {isClient ? 'Client' : 'Library'}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => {
                              setInlineEditId(report.id);
                              setInlineEditTitle(report.title);
                            }}>
                              <FileText className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setQuickImageReportId(report.id);
                              setTimeout(() => quickImageInputRef.current?.click(), 50);
                            }}>
                              <Image className="w-4 h-4 mr-2" />
                              Change Image
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/portal/insights/${report.slug}`, '_blank')}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleFeatured(report)}
                              data-testid={`button-toggle-featured-${report.id}`}
                            >
                              <Sparkles className={`w-4 h-4 mr-2 ${report.isFeatured ? 'text-amber-500' : ''}`} />
                              {report.isFeatured ? 'Remove from Featured' : 'Feature Report'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleArchive(report.id)}
                              className="text-amber-600"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setReportToDelete(report)}
                              className="text-red-600"
                              data-testid={`button-delete-${report.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

      <input
        ref={quickImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickImageUpload}
        className="hidden"
        data-testid="input-quick-image"
      />

      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone and will permanently remove the report from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading} data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
