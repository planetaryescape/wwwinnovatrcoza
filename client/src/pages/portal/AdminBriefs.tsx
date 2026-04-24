import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Search,
  Calendar,
  Mail,
  Building2,
  User,
  Phone,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  Download,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  BarChart3,
  Rocket,
  Timer,
  LayoutGrid,
  List,
  GripVertical,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Study {
  id: string;
  briefId: string | null;
  companyId: string | null;
  companyName: string;
  title: string;
  description: string | null;
  studyType: "basic" | "pro";
  status: "NEW" | "AUDIENCE_LIVE" | "ANALYSING_DATA" | "COMPLETED";
  statusUpdatedAt: string | null;
  isTest24: boolean;
  tags: string[];
  reportUrl: string | null;
  deliveryDate: string | null;
  submittedByEmail: string;
  submittedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BriefFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

const formatStudyTypeLabel = (studyType: string): string => {
  const lower = studyType.toLowerCase();
  if (lower.includes("pro")) return "Test24 Pro";
  return "Test24 Basic";
};

interface BriefSubmission {
  id: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByContact: string | null;
  companyName: string;
  companyBrand: string | null;
  studyType: string;
  numIdeas: number;
  numConsumers: number;
  researchObjective: string;
  regions: string[];
  ages: string[];
  genders: string[];
  incomes: string[];
  industry: string | null;
  competitors: string[];
  projectFileUrls: string[];
  files?: BriefFile[];
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Loader2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  on_hold: { label: "On Hold", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

const studyStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  NEW: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  AUDIENCE_LIVE: { label: "Fieldwork Live", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Play },
  ANALYSING_DATA: { label: "Analysing", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: BarChart3 },
  COMPLETED: { label: "Complete", color: "bg-primary/15 text-primary dark:bg-primary/20", icon: CheckCircle },
};

export default function AdminBriefs() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBrief, setSelectedBrief] = useState<BriefSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [linkedStudy, setLinkedStudy] = useState<Study | null>(null);
  const [studyStatus, setStudyStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBrief, setDeletingBrief] = useState(false);

  const { data: briefs = [], isLoading } = useQuery<BriefSubmission[]>({
    queryKey: ["/api/admin/briefs"],
  });

  const { data: studies = [] } = useQuery<Study[]>({
    queryKey: ["/api/admin/studies"],
  });

  // Log studies data for debugging
  useEffect(() => {
    if (studies.length > 0) {
      console.log("=== STUDIES DATA ===");
      console.log("Total studies:", studies.length);
      console.table(studies.map(s => ({
        id: s.id,
        title: s.title,
        companyName: s.companyName,
        studyType: s.studyType,
        status: s.status,
        briefId: s.briefId,
        createdAt: s.createdAt,
      })));
      console.log("Full studies data:", studies);
    } else {
      console.log("=== No studies found ===");
    }
  }, [studies]);

  // Log briefs data for debugging
  useEffect(() => {
    if (briefs.length > 0) {
      console.log("=== BRIEFS DATA ===");
      console.log("Total briefs:", briefs.length);
      console.table(briefs.map(b => ({
        id: b.id,
        companyName: b.companyName,
        studyType: b.studyType,
        numIdeas: b.numIdeas,
        status: b.status,
        submittedByName: b.submittedByName,
        createdAt: b.createdAt,
      })));
      console.log("Full briefs data:", briefs);
    }
  }, [briefs]);

  useEffect(() => {
    if (selectedBrief && studies.length > 0) {
      const study = studies.find(s => s.briefId === selectedBrief.id);
      setLinkedStudy(study || null);
      if (study) {
        setStudyStatus(study.status);
      }
    }
  }, [selectedBrief, studies]);

  const updateBriefMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/briefs/${id}`, { status, notes });
      return response.json();
    },
    // Optimistic update — apply the new status/notes to the local cache before the server replies.
    onMutate: async ({ id, status, notes }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/admin/briefs"] });
      const previous = queryClient.getQueryData<BriefSubmission[]>(["/api/admin/briefs"]);
      queryClient.setQueryData<BriefSubmission[]>(["/api/admin/briefs"], (old) =>
        old?.map((b) =>
          b.id === id
            ? { ...b, ...(status !== undefined ? { status } : {}), ...(notes !== undefined ? { notes } : {}) }
            : b,
        ),
      );
      return { previous };
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["/api/admin/briefs"], ctx.previous);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update brief.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Brief updated",
        description: "The brief has been updated successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/briefs"] });
    },
  });

  const createStudyMutation = useMutation({
    mutationFn: async (briefId: string) => {
      const response = await apiRequest("POST", `/api/admin/studies/from-brief/${briefId}`, {});
      return response.json();
    },
    onSuccess: (study) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/studies"] });
      setLinkedStudy(study);
      setStudyStatus(study.status);
      toast({
        title: "Study created",
        description: `Study "${study.title}" has been created and is ready for fieldwork.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create study",
        description: error.message || "Could not create study from this brief.",
        variant: "destructive",
      });
    },
  });

  const updateStudyStatusMutation = useMutation({
    mutationFn: async ({ id, status, sendNotification }: { id: string; status: string; sendNotification?: boolean }) => {
      const response = await apiRequest("PATCH", `/api/admin/studies/${id}/status`, { status, sendNotification });
      return response.json();
    },
    // Optimistic update — apply the new status to the local cache + reflect it in the open detail pane.
    onMutate: async ({ id, status }) => {
      const nextStatus = status as Study["status"];
      await queryClient.cancelQueries({ queryKey: ["/api/admin/studies"] });
      const previous = queryClient.getQueryData<Study[]>(["/api/admin/studies"]);
      queryClient.setQueryData<Study[]>(["/api/admin/studies"], (old) =>
        old?.map((s) => (s.id === id ? { ...s, status: nextStatus } : s)),
      );
      const previousLinkedStatus = studyStatus;
      setStudyStatus(status);
      if (linkedStudy && linkedStudy.id === id) setLinkedStudy({ ...linkedStudy, status: nextStatus });
      return { previous, previousLinkedStatus };
    },
    onError: (error: any, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["/api/admin/studies"], ctx.previous);
      if (ctx?.previousLinkedStatus !== undefined) setStudyStatus(ctx.previousLinkedStatus);
      toast({
        title: "Status update failed",
        description: error.message || "Failed to update study status.",
        variant: "destructive",
      });
    },
    onSuccess: (study) => {
      setLinkedStudy(study);
      setStudyStatus(study.status);
      toast({
        title: "Study status updated",
        description: `Study status changed to ${studyStatusConfig[study.status]?.label || study.status}.`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/studies"] });
    },
  });

  const handleDeleteBrief = async () => {
    if (!selectedBrief) return;
    
    setDeletingBrief(true);
    try {
      await apiRequest("DELETE", `/api/admin/briefs/${selectedBrief.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/briefs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/studies"] });
      toast({
        title: "Brief deleted",
        description: "The brief has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedBrief(null);
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete brief.",
        variant: "destructive",
      });
    } finally {
      setDeletingBrief(false);
    }
  };

  const filteredBriefs = briefs.filter((brief) => {
    const matchesSearch =
      searchQuery === "" ||
      brief.submittedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.submittedByEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brief.studyType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || brief.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openBriefDetail = (brief: BriefSubmission) => {
    setSelectedBrief(brief);
    setEditStatus(brief.status);
    setEditNotes(brief.notes || "");
    setIsDetailOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedBrief) {
      updateBriefMutation.mutate({
        id: selectedBrief.id,
        status: editStatus,
        notes: editNotes,
      });
    }
  };

  const stats = {
    total: briefs.length,
    new: briefs.filter((b) => b.status === "new").length,
    inProgress: briefs.filter((b) => b.status === "in_progress").length,
    completed: briefs.filter((b) => b.status === "completed").length,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brief Submissions</CardTitle>
          <CardDescription>Loading brief submissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Brief Submissions
              </CardTitle>
              <CardDescription>
                Manage and track research brief submissions from clients
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Briefs</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.new}</div>
                <div className="text-sm text-blue-600 dark:text-blue-500">New</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.inProgress}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-500">In Progress</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.completed}</div>
                <div className="text-sm text-green-600 dark:text-green-500">Completed</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-briefs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                variant={viewMode === "pipeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("pipeline")}
                className="rounded-none"
                data-testid="button-pipeline-view"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredBriefs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No brief submissions found</p>
              <p className="text-sm">Briefs will appear here when clients submit research requests</p>
            </div>
          ) : viewMode === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Study Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Ideas</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBriefs.map((brief) => {
                  const statusInfo = statusConfig[brief.status] || statusConfig.new;
                  const StatusIcon = statusInfo.icon;
                  const fileCount = (brief.files?.length || 0) + (brief.projectFileUrls?.length || 0);

                  return (
                    <TableRow key={brief.id} data-testid={`row-brief-${brief.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {formatStudyTypeLabel(brief.studyType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{brief.submittedByName}</span>
                          <span className="text-xs text-muted-foreground">{brief.submittedByEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{brief.companyName}</span>
                          {brief.companyBrand && (
                            <span className="text-xs text-muted-foreground">{brief.companyBrand}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[180px]">
                          {brief.researchObjective
                            ? brief.researchObjective.length > 60
                              ? brief.researchObjective.slice(0, 60) + "…"
                              : brief.researchObjective
                            : <span className="italic">No objective</span>
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{brief.numIdeas}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span>{fileCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(brief.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBriefDetail(brief)}
                          data-testid={`button-view-brief-${brief.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-testid="pipeline-view">
              {[
                { status: "new", label: "New", color: "border-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
                { status: "in_progress", label: "In Progress", color: "border-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
                { status: "completed", label: "Completed", color: "border-green-400", bgColor: "bg-green-50 dark:bg-green-900/20" },
                { status: "on_hold", label: "On Hold", color: "border-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
                { status: "cancelled", label: "Cancelled", color: "border-red-400", bgColor: "bg-red-50 dark:bg-red-900/20" },
              ].map((column) => {
                const columnBriefs = (statusFilter === "all" || statusFilter === column.status) 
                  ? briefs.filter(b => {
                      const matchesSearch = !searchQuery || 
                        b.submittedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.submittedByEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
                      return b.status === column.status && matchesSearch;
                    })
                  : [];
                
                const handleDragOver = (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const target = e.currentTarget as HTMLElement;
                  if (!target.classList.contains("ring-2")) {
                    target.classList.add("ring-2", "ring-primary", "ring-opacity-50");
                  }
                };

                const handleDragLeave = (e: React.DragEvent) => {
                  e.stopPropagation();
                  const target = e.currentTarget as HTMLElement;
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (!target.contains(relatedTarget)) {
                    target.classList.remove("ring-2", "ring-primary", "ring-opacity-50");
                  }
                };

                const handleDrop = (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const target = e.currentTarget as HTMLElement;
                  target.classList.remove("ring-2", "ring-primary", "ring-opacity-50");
                  
                  const briefId = e.dataTransfer.getData("briefId");
                  const currentStatus = e.dataTransfer.getData("currentStatus");
                  
                  if (!briefId || currentStatus === column.status) {
                    return;
                  }
                  
                  updateBriefMutation.mutate({
                    id: briefId,
                    status: column.status,
                  });
                };

                return (
                  <div 
                    key={column.status} 
                    className={`rounded-lg border-t-4 ${column.color} ${column.bgColor} p-3 min-h-[300px] transition-all`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    data-testid={`pipeline-column-${column.status}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{column.label}</h3>
                      <Badge variant="secondary" className="text-xs">{columnBriefs.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {columnBriefs.map((brief) => {
                        const fileCount = (brief.files?.length || 0) + (brief.projectFileUrls?.length || 0);
                        
                        const handleDragStart = (e: React.DragEvent) => {
                          e.dataTransfer.setData("briefId", brief.id);
                          e.dataTransfer.setData("currentStatus", brief.status);
                          e.dataTransfer.effectAllowed = "move";
                        };

                        return (
                          <Card 
                            key={brief.id} 
                            className="cursor-grab hover-elevate bg-background active:cursor-grabbing"
                            onClick={() => openBriefDetail(brief)}
                            draggable
                            onDragStart={handleDragStart}
                            data-testid={`pipeline-card-${brief.id}`}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                                  <Badge variant="outline" className="text-xs">
                                    {formatStudyTypeLabel(brief.studyType)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {brief.numIdeas} ideas
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm truncate">{brief.companyName}</p>
                                {brief.companyBrand && (
                                  <p className="text-xs text-muted-foreground truncate">{brief.companyBrand}</p>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="truncate flex-1">{brief.submittedByName}</span>
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{fileCount}</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(brief.createdAt), "MMM d")}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {columnBriefs.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No briefs
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Brief Details
            </DialogTitle>
          </DialogHeader>

          {selectedBrief && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {formatStudyTypeLabel(selectedBrief.studyType)}
                </Badge>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    Submitted: {format(new Date(selectedBrief.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    data-testid="button-delete-brief"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBrief.submittedByName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedBrief.submittedByEmail}`} className="text-primary hover:underline">
                        {selectedBrief.submittedByEmail}
                      </a>
                    </div>
                    {selectedBrief.submittedByContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedBrief.submittedByContact}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBrief.companyName}</span>
                    </div>
                    {selectedBrief.companyBrand && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Brand: {selectedBrief.companyBrand}</span>
                      </div>
                    )}
                    {selectedBrief.industry && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Industry: {selectedBrief.industry}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Ideas to Test: {selectedBrief.numIdeas}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Consumer Reach: {(selectedBrief.numConsumers || 100).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Research Objective</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                    {selectedBrief.researchObjective}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        Regions
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedBrief.regions.length > 0 ? (
                          selectedBrief.regions.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs">
                              {r}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-3 w-3" />
                        Age Groups
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedBrief.ages.length > 0 ? (
                          selectedBrief.ages.map((a) => (
                            <Badge key={a} variant="secondary" className="text-xs">
                              {a}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-3 w-3" />
                        Genders
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedBrief.genders.length > 0 ? (
                          selectedBrief.genders.map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs">
                              {g}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        Income Levels
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedBrief.incomes.length > 0 ? (
                          selectedBrief.incomes.map((i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {i}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedBrief.competitors.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Competitors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedBrief.competitors.map((competitor, idx) => (
                        <Badge key={idx} variant="outline">
                          {competitor}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {((selectedBrief.files && selectedBrief.files.length > 0) || selectedBrief.projectFileUrls.length > 0) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Uploaded Files ({(selectedBrief.files?.length || 0) + (selectedBrief.projectFileUrls?.length || 0)})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedBrief.files?.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{file.fileName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.fileSize)} - {file.mimeType.split('/')[1]?.toUpperCase() || file.mimeType}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                      {selectedBrief.projectFileUrls?.map((url, idx) => (
                        <div
                          key={`legacy-${idx}`}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[300px]">{url.split("/").pop()}</span>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    Study Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!linkedStudy ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <Timer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        No study has been created for this brief yet
                      </p>
                      <Button
                        onClick={() => selectedBrief && createStudyMutation.mutate(selectedBrief.id)}
                        disabled={createStudyMutation.isPending}
                        data-testid="button-create-study"
                      >
                        {createStudyMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            Create Study
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{linkedStudy.title}</span>
                          <Badge className={studyStatusConfig[linkedStudy.status]?.color}>
                            {studyStatusConfig[linkedStudy.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(linkedStudy.createdAt), "MMM d, yyyy")}
                          {linkedStudy.statusUpdatedAt && ` • Last updated ${format(new Date(linkedStudy.statusUpdatedAt), "MMM d 'at' h:mm a")}`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Update Study Status</Label>
                        <Select value={studyStatus} onValueChange={setStudyStatus}>
                          <SelectTrigger data-testid="select-study-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">Submitted (Awaiting Launch)</SelectItem>
                            <SelectItem value="AUDIENCE_LIVE">Fieldwork Live (24hr countdown)</SelectItem>
                            <SelectItem value="ANALYSING_DATA">Analysing Data</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => linkedStudy && updateStudyStatusMutation.mutate({
                            id: linkedStudy.id,
                            status: studyStatus,
                            sendNotification: true,
                          })}
                          disabled={updateStudyStatusMutation.isPending || studyStatus === linkedStudy.status}
                          className="flex-1"
                          data-testid="button-update-study-status"
                        >
                          {updateStudyStatusMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              Update & Notify Client
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => linkedStudy && updateStudyStatusMutation.mutate({
                            id: linkedStudy.id,
                            status: studyStatus,
                            sendNotification: false,
                          })}
                          disabled={updateStudyStatusMutation.isPending || studyStatus === linkedStudy.status}
                          data-testid="button-update-study-silent"
                        >
                          Update Only
                        </Button>
                      </div>

                      {linkedStudy.status === "AUDIENCE_LIVE" && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <Play className="h-4 w-4" />
                            <span className="text-sm font-medium">24-hour countdown active</span>
                          </div>
                          <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                            Client can see the countdown timer in their My Research dashboard
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Brief Admin Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brief Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger data-testid="select-edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes</Label>
                    <Textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add internal notes about this brief..."
                      className="min-h-[100px]"
                      data-testid="textarea-brief-notes"
                    />
                  </div>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={updateBriefMutation.isPending}
                    className="w-full"
                    data-testid="button-save-brief-changes"
                  >
                    {updateBriefMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Brief Changes"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brief</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this brief from {selectedBrief?.companyName}? 
              This will permanently remove the brief and all uploaded files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBrief}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrief}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingBrief}
            >
              {deletingBrief ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Brief"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
