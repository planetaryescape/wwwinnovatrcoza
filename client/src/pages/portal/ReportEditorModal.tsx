import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { safeParseDateObject } from "@shared/access";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  FileText, 
  Clock, 
  BarChart3, 
  Eye,
  Download,
  Zap,
  Upload,
  Image,
  ExternalLink,
  Loader2,
  X,
  FileIcon,
  Building2,
  Tag,
  Users,
  UserCheck,
  UserX,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { INDUSTRY_TAGS, THEME_TAGS, METHOD_TAGS } from "@shared/tagConfig";

interface ReportData {
  id?: string;
  title: string;
  category: string;
  series?: string;
  industry: string;
  date: string;
  teaser: string;
  slug: string;
  pdfUrl?: string | null;
  pdfPath?: string | null;
  hasDownload?: boolean;
  videoPaths?: string[];
  topics?: string[];
  tags?: string[];
  isNew?: boolean;
  access?: "free" | "members";
  accessLevel?: string;
  status?: string;
  viewCount?: number;
  downloadCount?: number;
  allowedTiers?: string[];
  creditType?: string;
  creditCost?: number;
  isFeatured?: boolean;
  publishAt?: string;
  unpublishAt?: string;
  dashboardLink?: string | null;
  coverImageUrl?: string | null;
  thumbnailUrl?: string | null;
  isClientReport?: boolean;
  clientCompanyIds?: string[];
  industryTag?: string | null;
  themeTags?: string[];
  methodTags?: string[];
}

interface Company {
  id: string;
  name: string;
}

interface ReportEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportData | null;
  onSuccess: () => void;
}

const defaultFormData = {
  title: "",
  slug: "",
  category: "Insights",
  series: "",
  industry: "",
  topics: "",
  tags: "",
  teaser: "",
  bodyContent: "",
  date: new Date().toISOString().split("T")[0],
  status: "draft",
  accessLevel: "public",
  allowedTiers: [] as string[],
  creditType: "none",
  creditCost: 0,
  isFeatured: false,
  pdfUrl: "",
  dashboardLink: "",
  videoPaths: "",
  coverImageUrl: "",
  publishAt: "",
  unpublishAt: "",
  isClientReport: false,
  clientCompanyIds: [] as string[],
  industryTag: "",
  themeTags: [] as string[],
  methodTags: [] as string[],
};

interface AnalyticsData {
  totalViews: number;
  memberViews: number;
  guestViews: number;
  totalDownloads: number;
  memberDownloads: number;
  guestDownloads: number;
}

interface ViewerData {
  id: string;
  reportId: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  memberTier: string | null;
  companyName: string | null;
  viewCount: number;
  lastViewedAt: string;
  firstViewedAt: string;
}

type TimeRange = "today" | "30d" | "12m";

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  defaultOpen = false, 
  children,
  testId,
}: { 
  title: string; 
  icon: React.ElementType; 
  defaultOpen?: boolean; 
  children: React.ReactNode;
  testId?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          data-testid={testId}
        >
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Icon className="w-4 h-4" />
          <span>{title}</span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function AnalyticsSection({ reportId }: { reportId?: string }) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/reports", reportId, "analytics", timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports/${reportId}/analytics?range=${timeRange}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!reportId,
  });

  const { data: viewers = [], isLoading: viewersLoading } = useQuery<ViewerData[]>({
    queryKey: ["/api/admin/reports", reportId, "viewers"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports/${reportId}/viewers`);
      if (!res.ok) throw new Error("Failed to fetch viewers");
      return res.json();
    },
    enabled: !!reportId,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeRangeLabels: Record<TimeRange, string> = {
    today: "Today",
    "30d": "Last 30 Days",
    "12m": "Last 12 Months",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time Range:</span>
        </div>
        <div className="flex gap-1">
          {(["today", "30d", "12m"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              type="button"
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              data-testid={`button-range-${range}`}
            >
              {timeRangeLabels[range]}
            </Button>
          ))}
        </div>
      </div>

      {analyticsLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="w-3.5 h-3.5 text-[#0033A0]" />
              <span className="text-xs text-muted-foreground">Views</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-total-views">{analytics?.totalViews || 0}</p>
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{analytics?.memberViews || 0}</span>
              <span className="flex items-center gap-1"><UserX className="w-3 h-3" />{analytics?.guestViews || 0}</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Download className="w-3.5 h-3.5 text-[#0033A0]" />
              <span className="text-xs text-muted-foreground">Downloads</span>
            </div>
            <p className="text-xl font-bold" data-testid="text-total-downloads">{analytics?.totalDownloads || 0}</p>
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{analytics?.memberDownloads || 0}</span>
              <span className="flex items-center gap-1"><UserX className="w-3 h-3" />{analytics?.guestDownloads || 0}</span>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#0033A0]" />
              <span className="text-xs text-muted-foreground">Viewers</span>
            </div>
            <p className="text-xl font-bold">{viewers.length}</p>
          </div>
        </div>
      )}

      {!viewersLoading && viewers.length > 0 && (
        <ScrollArea className="h-[150px]">
          <div className="space-y-1.5">
            {viewers.map((viewer) => (
              <div
                key={viewer.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm"
                data-testid={`viewer-row-${viewer.id}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0033A0] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {viewer.userName ? viewer.userName.charAt(0).toUpperCase() : "G"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{viewer.userName || "Guest User"}</p>
                    {viewer.companyName && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {viewer.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {viewer.memberTier && (
                    <Badge variant="outline" className="text-xs">{viewer.memberTier}</Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {viewer.viewCount} {viewer.viewCount === 1 ? "view" : "views"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default function ReportEditorModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: ReportEditorModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!report;

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/admin/companies"],
    enabled: open,
  });

  useEffect(() => {
    if (report) {
      const hasClientCompanies = report.clientCompanyIds && report.clientCompanyIds.length > 0;
      setFormData({
        title: report.title || "",
        slug: report.slug || "",
        category: report.category || "Insights",
        series: report.series || "",
        industry: report.industry || "",
        topics: report.topics?.join(", ") || "",
        tags: report.tags?.join(", ") || "",
        teaser: report.teaser || "",
        bodyContent: "",
        date: report.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        status: report.status || "published",
        accessLevel: report.accessLevel?.toLowerCase() || "public",
        allowedTiers: report.allowedTiers || [],
        creditType: report.creditType || "none",
        creditCost: report.creditCost || 0,
        isFeatured: report.isFeatured || false,
        pdfUrl: report.pdfUrl || "",
        dashboardLink: report.dashboardLink || "",
        videoPaths: report.videoPaths?.join(", ") || "",
        coverImageUrl: report.coverImageUrl || "",
        publishAt: report.publishAt?.split("T")[0] || "",
        unpublishAt: report.unpublishAt?.split("T")[0] || "",
        isClientReport: report.isClientReport || hasClientCompanies || false,
        clientCompanyIds: report.clientCompanyIds || [],
        industryTag: report.industryTag || "",
        themeTags: report.themeTags || [],
        methodTags: report.methodTags || [],
      });
    } else {
      setFormData(defaultFormData);
    }
    setUploadingPdf(false);
    setUploadingImage(false);
  }, [report, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTierToggle = (tier: string) => {
    const current = formData.allowedTiers;
    if (current.includes(tier)) {
      setFormData({ ...formData, allowedTiers: current.filter(t => t !== tier) });
    } else {
      setFormData({ ...formData, allowedTiers: [...current, tier] });
    }
  };

  const handleCompanyToggle = (companyId: string) => {
    const current = formData.clientCompanyIds;
    if (current.includes(companyId)) {
      setFormData({ ...formData, clientCompanyIds: current.filter(id => id !== companyId) });
    } else {
      setFormData({ ...formData, clientCompanyIds: [...current, companyId] });
    }
  };

  const handleThemeTagToggle = (tag: string) => {
    const current = formData.themeTags;
    if (current.includes(tag)) {
      setFormData({ ...formData, themeTags: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, themeTags: [...current, tag] });
    }
  };

  const handleMethodTagToggle = (tag: string) => {
    const current = formData.methodTags;
    if (current.includes(tag)) {
      setFormData({ ...formData, methodTags: current.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, methodTags: [...current, tag] });
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  const handleFileUpload = async (file: File, fileType: "pdf" | "cover" | "thumbnail") => {
    const formDataPayload = new FormData();
    formDataPayload.append("file", file);
    formDataPayload.append("fileType", fileType);

    const response = await fetch("/api/admin/reports/upload", {
      method: "POST",
      body: formDataPayload,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    return response.json();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or PowerPoint file", variant: "destructive" });
      return;
    }

    setUploadingPdf(true);
    try {
      const result = await handleFileUpload(file, "pdf");
      setFormData({ ...formData, pdfUrl: result.url });
      toast({ title: "File uploaded", description: `${result.fileName} uploaded successfully` });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Could not upload file", variant: "destructive" });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const result = await handleFileUpload(file, "cover");
      setFormData({ ...formData, coverImageUrl: result.url });
      toast({ title: "Image uploaded", description: `${result.fileName} uploaded successfully` });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Could not upload image", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({ title: "Title is required", description: "Please enter a report title", variant: "destructive" });
      return;
    }

    if (!isEditing && !formData.teaser.trim()) {
      toast({ title: "Preview text is required", description: "Please enter preview text for new reports", variant: "destructive" });
      return;
    }

    if (formData.isClientReport && formData.clientCompanyIds.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one client company for this report", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const dateStr = formData.date || new Date().toISOString().split("T")[0];
      const parsedDate = safeParseDateObject(dateStr);
      const parsedPublishAt = safeParseDateObject(formData.publishAt);
      const parsedUnpublishAt = safeParseDateObject(formData.unpublishAt);
      
      if (!parsedDate) {
        toast({ title: "Invalid Date", description: "Please enter a valid publication date", variant: "destructive" });
        setLoading(false);
        return;
      }

      const reportPayload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formData.category,
        series: formData.series || null,
        industry: formData.industry || null,
        topics: formData.topics ? formData.topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        previewText: formData.teaser,
        bodyContent: formData.bodyContent || null,
        date: parsedDate,
        status: formData.status,
        accessLevel: formData.isClientReport ? "companyOnly" : formData.accessLevel,
        allowedTiers: formData.allowedTiers,
        creditType: formData.creditType,
        creditCost: formData.creditCost,
        isFeatured: formData.isFeatured,
        pdfUrl: formData.pdfUrl || null,
        dashboardLink: formData.dashboardLink || null,
        videoPaths: formData.videoPaths ? formData.videoPaths.split(",").map((v) => v.trim()).filter(Boolean) : [],
        coverImageUrl: formData.coverImageUrl || null,
        publishAt: parsedPublishAt,
        unpublishAt: parsedUnpublishAt,
        clientCompanyIds: formData.isClientReport ? formData.clientCompanyIds : [],
        industryTag: formData.industryTag || null,
        themeTags: formData.themeTags,
        methodTags: formData.methodTags,
      };

      const url = isEditing 
        ? `/api/admin/reports/${report.id}` 
        : "/api/admin/reports";
      
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportPayload),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: "Success",
        description: isEditing ? "Report updated successfully!" : "Report created successfully!",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle 
            className="text-xl"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {isEditing ? "Edit Report" : "Create New Report"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your report. Only title is required to save."
              : "Create a new report. Fill in the essentials below."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => !formData.slug && generateSlug()}
                placeholder="e.g., Banking Monogamy Is Dead"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teaser">Preview Text {!isEditing && "*"}</Label>
              <Textarea
                id="teaser"
                name="teaser"
                value={formData.teaser}
                onChange={handleChange}
                placeholder="Short teaser for the card view (1-2 sentences)"
                className="h-16"
                data-testid="textarea-teaser"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => handleSelectChange("category", val)}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Insights">Insights</SelectItem>
                    <SelectItem value="Launch">Launch</SelectItem>
                    <SelectItem value="Inside">Inside</SelectItem>
                    <SelectItem value="IRL">IRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => handleSelectChange("status", val)}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="input-cover-image"
              />
              <div className="flex items-center gap-3">
                {formData.coverImageUrl && (
                  <div className="relative w-24 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <img 
                      src={formData.coverImageUrl} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  data-testid="button-upload-image"
                >
                  {uploadingImage ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                  ) : (
                    <><Image className="w-4 h-4 mr-2" />{formData.coverImageUrl ? "Change Image" : "Upload Image"}</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <CollapsibleSection 
            title="Report File & Links" 
            icon={FileText}
            defaultOpen={!isEditing}
            testId="toggle-files"
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>PDF / PowerPoint</Label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,.pptx,.ppt"
                  onChange={handlePdfUpload}
                  className="hidden"
                  data-testid="input-pdf-file"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="flex-shrink-0"
                    data-testid="button-upload-pdf"
                  >
                    {uploadingPdf ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Upload File</>
                    )}
                  </Button>
                  {formData.pdfUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1 min-w-0">
                      <FileIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formData.pdfUrl.split('/').pop()}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 flex-shrink-0"
                        onClick={() => setFormData({ ...formData, pdfUrl: "" })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  id="pdfUrl"
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                  placeholder="Or paste URL: https://example.com/report.pdf"
                  className="text-sm"
                  data-testid="input-pdf-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dashboardLink">External Dashboard Link</Label>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    id="dashboardLink"
                    name="dashboardLink"
                    value={formData.dashboardLink}
                    onChange={handleChange}
                    placeholder="Power BI, Google Data Studio, Tableau link"
                    data-testid="input-dashboard-link"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoPaths">Video URLs (comma-separated)</Label>
                <Input
                  id="videoPaths"
                  name="videoPaths"
                  value={formData.videoPaths}
                  onChange={handleChange}
                  placeholder="https://example.com/video.mp4"
                  data-testid="input-video-paths"
                />
              </div>
            </div>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection 
            title="Details & Tags" 
            icon={Tag}
            defaultOpen={!isEditing}
            testId="toggle-details"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated-from-title"
                    data-testid="input-slug"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={generateSlug}>
                    Auto
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g., Financial Services"
                  data-testid="input-industry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Publication Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="series">Series</Label>
                <Select
                  value={formData.series || "none"}
                  onValueChange={(value) => handleSelectChange("series", value === "none" ? "" : value)}
                >
                  <SelectTrigger data-testid="select-series">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Inside">Inside</SelectItem>
                    <SelectItem value="Insights">Insights</SelectItem>
                    <SelectItem value="Launch">Launch</SelectItem>
                    <SelectItem value="IRL">IRL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., Banking, Loyalty, Digital"
                data-testid="input-tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Input
                id="topics"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="e.g., Consumer Trends, Innovation"
                data-testid="input-topics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyContent">Full Content</Label>
              <Textarea
                id="bodyContent"
                name="bodyContent"
                value={formData.bodyContent}
                onChange={handleChange}
                placeholder="Full report content (optional)..."
                className="h-24"
                data-testid="textarea-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry Tag</Label>
                <Select 
                  value={formData.industryTag || "none"} 
                  onValueChange={(val) => handleSelectChange("industryTag", val === "none" ? "" : val)}
                >
                  <SelectTrigger data-testid="select-industry-tag">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {INDUSTRY_TAGS.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Theme Tags</Label>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                {THEME_TAGS.map(tag => (
                  <div 
                    key={tag}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    onClick={() => handleThemeTagToggle(tag)}
                  >
                    <Checkbox
                      checked={formData.themeTags.includes(tag)}
                      onCheckedChange={() => handleThemeTagToggle(tag)}
                      data-testid={`checkbox-theme-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <span className="text-xs">{tag}</span>
                  </div>
                ))}
              </div>
              {formData.themeTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.themeTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => handleThemeTagToggle(tag)}>
                      {tag}<X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {(formData.category === "Inside" || formData.series === "Inside") && (
              <div className="space-y-2">
                <Label>Method Tags</Label>
                <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-2 border rounded-md bg-violet-50 dark:bg-violet-900/20">
                  {METHOD_TAGS.map(tag => (
                    <div 
                      key={tag}
                      className="flex items-center gap-1.5 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-800/30 p-1 rounded"
                      onClick={() => handleMethodTagToggle(tag)}
                    >
                      <Checkbox
                        checked={formData.methodTags.includes(tag)}
                        onCheckedChange={() => handleMethodTagToggle(tag)}
                        data-testid={`checkbox-method-${tag.replace(/\s+/g, '-').toLowerCase()}`}
                      />
                      <span className="text-xs">{tag}</span>
                    </div>
                  ))}
                </div>
                {formData.methodTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.methodTags.map(tag => (
                      <Badge key={tag} className="text-xs cursor-pointer bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100" onClick={() => handleMethodTagToggle(tag)}>
                        {tag}<X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                data-testid="switch-featured"
              />
              <Label htmlFor="isFeatured" className="flex items-center gap-2 cursor-pointer">
                <Zap className="w-4 h-4 text-amber-500" />
                Feature this report
              </Label>
            </div>
          </CollapsibleSection>

          <Separator />

          <CollapsibleSection 
            title="Access & Client Settings" 
            icon={Building2}
            defaultOpen={!isEditing}
            testId="toggle-access"
          >
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium">Client Report</Label>
                    <p className="text-xs text-muted-foreground">Restrict to specific companies</p>
                  </div>
                </div>
                <Switch
                  id="isClientReport"
                  checked={formData.isClientReport}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    isClientReport: checked,
                    clientCompanyIds: checked ? formData.clientCompanyIds : []
                  })}
                  data-testid="switch-client-report"
                />
              </div>
              
              {formData.isClientReport && (
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <Label className="text-xs font-medium mb-2 block">Select Companies</Label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                    {[...companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                      <div 
                        key={company.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                        onClick={() => handleCompanyToggle(company.id)}
                        data-testid={`row-company-${company.id}`}
                      >
                        <Checkbox
                          checked={formData.clientCompanyIds.includes(company.id)}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => handleCompanyToggle(company.id)}
                          data-testid={`checkbox-company-${company.id}`}
                        />
                        <span className="text-xs">{company.name}</span>
                      </div>
                    ))}
                  </div>
                  {formData.clientCompanyIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.clientCompanyIds.map((id) => {
                        const company = companies.find(c => c.id === id);
                        return company ? (
                          <Badge key={id} variant="secondary" className="text-xs" data-testid={`badge-company-${id}`}>
                            {company.name}
                            <X className="w-3 h-3 ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleCompanyToggle(id); }} data-testid={`button-remove-company-${id}`} />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                  {formData.clientCompanyIds.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2">Please select at least one company</p>
                  )}
                </div>
              )}
            </div>

            {!formData.isClientReport && (
              <>
                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Select 
                    value={formData.accessLevel} 
                    onValueChange={(val) => handleSelectChange("accessLevel", val)}
                  >
                    <SelectTrigger data-testid="select-access-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Free - Anyone can view</SelectItem>
                      <SelectItem value="starter">Starter - Starter members+</SelectItem>
                      <SelectItem value="growth">Growth - Growth members+</SelectItem>
                      <SelectItem value="scale">Scale - Scale members only</SelectItem>
                      <SelectItem value="tier">Tier - Specific tiers</SelectItem>
                      <SelectItem value="paid">Paid - Costs credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.accessLevel === "tier" && (
                  <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Label className="text-xs font-medium mb-2 block">Allowed Tiers</Label>
                    <div className="flex gap-2 flex-wrap">
                      {["STARTER", "GROWTH", "SCALE"].map((tier) => (
                        <Badge
                          key={tier}
                          variant={formData.allowedTiers.includes(tier) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTierToggle(tier)}
                        >
                          {tier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.accessLevel === "paid" && (
                  <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                    <div className="space-y-2">
                      <Label>Credit Type</Label>
                      <Select 
                        value={formData.creditType} 
                        onValueChange={(val) => handleSelectChange("creditType", val)}
                      >
                        <SelectTrigger data-testid="select-credit-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Credits</SelectItem>
                          <SelectItem value="pro">Pro Credits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Credit Cost</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.creditCost}
                        onChange={(e) => setFormData({ ...formData, creditCost: parseInt(e.target.value) || 0 })}
                        data-testid="input-credit-cost"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CollapsibleSection>

          {formData.status === "scheduled" && (
            <>
              <Separator />
              <CollapsibleSection 
                title="Scheduling" 
                icon={Clock}
                defaultOpen={true}
                testId="toggle-schedule"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishAt">Publish At</Label>
                    <Input
                      id="publishAt"
                      name="publishAt"
                      type="datetime-local"
                      value={formData.publishAt}
                      onChange={handleChange}
                      data-testid="input-publish-at"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unpublishAt">Unpublish At (optional)</Label>
                    <Input
                      id="unpublishAt"
                      name="unpublishAt"
                      type="datetime-local"
                      value={formData.unpublishAt}
                      onChange={handleChange}
                      data-testid="input-unpublish-at"
                    />
                  </div>
                </div>
              </CollapsibleSection>
            </>
          )}

          {isEditing && formData.status !== "published" && (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  Quick Publish
                </p>
                <p className="text-xs text-muted-foreground">Make this report live immediately</p>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await fetch(`/api/admin/reports/${report?.id}/publish-now`, { method: "POST" });
                    if (!res.ok) throw new Error("Failed to publish");
                    toast({ title: "Published!", description: "Report is now live." });
                    setFormData({ ...formData, status: "published", publishAt: "" });
                    onSuccess();
                  } catch (error) {
                    toast({ title: "Error", description: "Could not publish report", variant: "destructive" });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                data-testid="button-publish-now"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
                Publish Now
              </Button>
            </div>
          )}

          {isEditing && (
            <>
              <Separator />
              <CollapsibleSection 
                title="Analytics" 
                icon={BarChart3}
                defaultOpen={false}
                testId="toggle-analytics"
              >
                <AnalyticsSection reportId={report?.id} />
              </CollapsibleSection>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="rounded-full"
              style={{ backgroundColor: '#0033A0' }}
              data-testid="button-submit"
            >
              {loading 
                ? "Saving..." 
                : isEditing 
                  ? "Save Changes" 
                  : formData.status === "published" 
                    ? "Publish" 
                    : "Save as Draft"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
