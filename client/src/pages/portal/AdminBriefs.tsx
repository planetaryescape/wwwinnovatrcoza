import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BriefSubmission {
  id: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedByContact: string | null;
  companyName: string;
  companyBrand: string | null;
  studyType: string;
  numIdeas: number;
  researchObjective: string;
  regions: string[];
  ages: string[];
  genders: string[];
  incomes: string[];
  industry: string | null;
  competitors: string[];
  projectFileUrls: string[];
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Loader2 },
  completed: { label: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  on_hold: { label: "On Hold", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default function AdminBriefs() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBrief, setSelectedBrief] = useState<BriefSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: briefs = [], isLoading } = useQuery<BriefSubmission[]>({
    queryKey: ["/api/admin/briefs"],
  });

  const updateBriefMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status?: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/briefs/${id}`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/briefs"] });
      toast({
        title: "Brief updated",
        description: "The brief has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update brief.",
        variant: "destructive",
      });
    },
  });

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
          </div>
        </CardHeader>

        <CardContent>
          {filteredBriefs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No brief submissions found</p>
              <p className="text-sm">Briefs will appear here when clients submit research requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Study Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Ideas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBriefs.map((brief) => {
                  const statusInfo = statusConfig[brief.status] || statusConfig.new;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={brief.id} data-testid={`row-brief-${brief.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {brief.studyType}
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
                        <span className="font-medium">{brief.numIdeas}</span>
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
                  {selectedBrief.studyType}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Submitted: {format(new Date(selectedBrief.createdAt), "MMMM d, yyyy 'at' h:mm a")}
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

              {selectedBrief.projectFileUrls.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedBrief.projectFileUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[300px]">{url.split("/").pop()}</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
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
                  <CardTitle className="text-sm font-medium">Admin Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
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
                      "Save Changes"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
