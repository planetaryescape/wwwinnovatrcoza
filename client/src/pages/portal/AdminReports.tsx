import { useState, useMemo } from "react";
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
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ReportEditorModal from "./ReportEditorModal";
import { exportReportsToCSV, exportPerformanceToCSV } from "@/lib/csvExport";

type StatusType = "draft" | "scheduled" | "published" | "archived" | "all";
type AccessLevel = "public" | "member" | "tier" | "paid" | "all";

interface ReportData {
  id: string;
  title: string;
  category: string;
  industry: string | null;
  date: string;
  teaser: string | null;
  slug: string | null;
  topics: string[] | null;
  body: string | null;
  thumbnailUrl: string | null;
  pdfUrl: string | null;
  accessLevel: string;
  status: string;
  isArchived: boolean;
  viewCount?: number;
  downloadCount?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  scheduled: { label: "Scheduled", color: "bg-amber-100 text-amber-700" },
  published: { label: "Published", color: "bg-green-100 text-green-700" },
  archived: { label: "Archived", color: "bg-red-100 text-red-700" },
};

const accessConfig: Record<string, { label: string; color: string }> = {
  public: { label: "Public", color: "bg-blue-50 text-[#0033A0]" },
  member: { label: "Members", color: "bg-violet-50 text-violet-700" },
  tier: { label: "Tier-locked", color: "bg-orange-50 text-orange-700" },
  paid: { label: "Paid", color: "bg-emerald-50 text-emerald-700" },
};

const categoryColors: Record<string, string> = {
  Insights: "bg-blue-50 text-[#0033A0]",
  Launch: "bg-orange-50 text-orange-700",
  Inside: "bg-violet-50 text-violet-700",
  IRL: "bg-rose-50 text-rose-700",
};

export default function AdminReports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");
  const [accessFilter, setAccessFilter] = useState<AccessLevel>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  const { data: reports = [], isLoading, error } = useQuery<ReportData[]>({
    queryKey: ['/api/admin/reports'],
  });

  const archiveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return apiRequest('PATCH', `/api/admin/reports/${reportId}`, { isArchived: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
    },
  });

  const categories = useMemo(() => 
    Array.from(new Set(reports.map(r => r.category))),
    [reports]
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.teaser?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const reportStatus = report.status || "published";
      const matchesStatus = statusFilter === "all" || reportStatus === statusFilter;
      
      const reportAccess = report.accessLevel?.toLowerCase() || "public";
      const matchesAccess = accessFilter === "all" || reportAccess === accessFilter;
      
      const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesAccess && matchesCategory;
    });
  }, [reports, searchQuery, statusFilter, accessFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: reports.length,
    published: reports.filter(r => r.status === "published").length,
    draft: reports.filter(r => r.status === "draft").length,
    scheduled: reports.filter(r => r.status === "scheduled").length,
  }), [reports]);

  const handleEdit = (report: ReportData) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedReport(null);
    setModalOpen(true);
  };

  const handleArchive = (reportId: string) => {
    archiveMutation.mutate(reportId);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0033A0]" />
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">Failed to load reports. Please try again later.</p>
      </div>
    );
  }

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
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="member">Members</SelectItem>
                  <SelectItem value="tier">Tier-locked</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
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
            </div>
          </div>
        </CardContent>
      </Card>

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
                  const reportAccess = report.accessLevel?.toLowerCase() || "public";
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

      <ReportEditorModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        report={selectedReport}
        onSuccess={handleRefresh} 
      />
    </div>
  );
}
