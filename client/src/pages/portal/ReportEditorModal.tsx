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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Settings, 
  Clock, 
  BarChart3, 
  Eye,
  Download,
  TrendingUp,
  Zap,
  Upload,
  Image,
  ExternalLink,
  Loader2,
  X,
  FileIcon
} from "lucide-react";

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
  coverImageUrl: "",
  publishAt: "",
  unpublishAt: "",
};

export default function ReportEditorModal({
  open,
  onOpenChange,
  report,
  onSuccess,
}: ReportEditorModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [formData, setFormData] = useState(defaultFormData);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!report;

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || "",
        slug: report.slug || "",
        category: report.category || "Insights",
        industry: report.industry || "",
        topics: "",
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
        coverImageUrl: report.coverImageUrl || "",
        publishAt: report.publishAt?.split("T")[0] || "",
        unpublishAt: report.unpublishAt?.split("T")[0] || "",
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab("content");
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
      setFormData({
        ...formData,
        allowedTiers: current.filter(t => t !== tier),
      });
    } else {
      setFormData({
        ...formData,
        allowedTiers: [...current, tier],
      });
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
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or PowerPoint file",
        variant: "destructive",
      });
      return;
    }

    setUploadingPdf(true);
    try {
      const result = await handleFileUpload(file, "pdf");
      setFormData({ ...formData, pdfUrl: result.url });
      toast({
        title: "File uploaded",
        description: `${result.fileName} uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload file",
        variant: "destructive",
      });
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const result = await handleFileUpload(file, "cover");
      setFormData({ ...formData, coverImageUrl: result.url });
      toast({
        title: "Image uploaded",
        description: `${result.fileName} uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.teaser) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (title, category, preview text)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const reportPayload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: formData.category,
        industry: formData.industry || null,
        topics: formData.topics ? formData.topics.split(",").map((t) => t.trim()) : [],
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        previewText: formData.teaser,
        bodyContent: formData.bodyContent || null,
        date: new Date(formData.date),
        status: formData.status,
        accessLevel: formData.accessLevel,
        allowedTiers: formData.allowedTiers,
        creditType: formData.creditType,
        creditCost: formData.creditCost,
        isFeatured: formData.isFeatured,
        pdfUrl: formData.pdfUrl || null,
        dashboardLink: formData.dashboardLink || null,
        coverImageUrl: formData.coverImageUrl || null,
        publishAt: formData.publishAt ? new Date(formData.publishAt) : null,
        unpublishAt: formData.unpublishAt ? new Date(formData.unpublishAt) : null,
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle 
            className="text-xl"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            {isEditing ? "Edit Report" : "Create New Report"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the report details, access settings, and scheduling"
              : "Create a new Innovatr Intelligence report"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Access
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            {isEditing && (
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            )}
          </TabsList>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="content" className="space-y-4 m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="banking-monogamy-is-dead"
                      data-testid="input-slug"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={generateSlug}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="teaser">Preview Text *</Label>
                <Textarea
                  id="teaser"
                  name="teaser"
                  value={formData.teaser}
                  onChange={handleChange}
                  placeholder="Short teaser for the card view (1-2 sentences)"
                  className="h-20"
                  data-testid="textarea-teaser"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyContent">Full Content</Label>
                <Textarea
                  id="bodyContent"
                  name="bodyContent"
                  value={formData.bodyContent}
                  onChange={handleChange}
                  placeholder="Full report content..."
                  className="h-40"
                  data-testid="textarea-body"
                />
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Report Files</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PDF/PowerPoint Upload</Label>
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
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                          </>
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
                    <p className="text-xs text-muted-foreground">
                      Or enter URL manually:
                    </p>
                    <Input
                      id="pdfUrl"
                      name="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/report.pdf"
                      className="text-sm"
                      data-testid="input-pdf-url"
                    />
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
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex-shrink-0"
                        data-testid="button-upload-image"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Image className="w-4 h-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                      {formData.coverImageUrl && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex-1 min-w-0">
                          <Image className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{formData.coverImageUrl.split('/').pop()}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 flex-shrink-0"
                            onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {formData.coverImageUrl && (
                      <div className="mt-2 relative w-32 h-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={formData.coverImageUrl} 
                          alt="Cover preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dashboardLink">External Dashboard Link</Label>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dashboardLink"
                      name="dashboardLink"
                      value={formData.dashboardLink}
                      onChange={handleChange}
                      placeholder="https://app.powerbi.com/... or Google Data Studio link"
                      data-testid="input-dashboard-link"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link to external dashboard (Power BI, Google Data Studio, Tableau, etc.)
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

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
            </TabsContent>

            <TabsContent value="access" className="space-y-6 m-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Access Level</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control who can view this report
                  </p>
                  <Select 
                    value={formData.accessLevel} 
                    onValueChange={(val) => handleSelectChange("accessLevel", val)}
                  >
                    <SelectTrigger data-testid="select-access-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Free - Anyone can view</SelectItem>
                      <SelectItem value="starter">Starter - Starter members and above</SelectItem>
                      <SelectItem value="growth">Growth - Growth members and above</SelectItem>
                      <SelectItem value="scale">Scale - Scale members only</SelectItem>
                      <SelectItem value="tier">Tier - Specific tiers only</SelectItem>
                      <SelectItem value="paid">Paid - Costs credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.accessLevel === "tier" && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-medium mb-3 block">Allowed Tiers</Label>
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
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditType">Credit Type</Label>
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
                      <Label htmlFor="creditCost">Credit Cost</Label>
                      <Input
                        id="creditCost"
                        name="creditCost"
                        type="number"
                        min="0"
                        value={formData.creditCost}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          creditCost: parseInt(e.target.value) || 0 
                        })}
                        data-testid="input-credit-cost"
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6 m-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Publication Status</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Control when this report is visible
                  </p>
                  <Select 
                    value={formData.status} 
                    onValueChange={(val) => handleSelectChange("status", val)}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft - Not visible</SelectItem>
                      <SelectItem value="scheduled">Scheduled - Publish at set time</SelectItem>
                      <SelectItem value="published">Published - Live now</SelectItem>
                      <SelectItem value="archived">Archived - Hidden from library</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === "scheduled" && (
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
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
                )}
              </div>
            </TabsContent>

            {isEditing && (
              <TabsContent value="analytics" className="space-y-6 m-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-[#0033A0]" />
                    <p className="text-2xl font-bold">{report?.viewCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Download className="w-5 h-5 mx-auto mb-2 text-[#0033A0]" />
                    <p className="text-2xl font-bold">{report?.downloadCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Unique Views</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Zap className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Upgrade Influence</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Performance Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    Analytics data is collected automatically as users interact with this report.
                    The upgrade influence score tracks how often users upgraded their membership
                    after viewing this content.
                  </p>
                </div>
              </TabsContent>
            )}

            <div className="flex justify-end gap-2 pt-6 mt-4 border-t">
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
                    ? "Update Report" 
                    : formData.status === "published" 
                      ? "Publish" 
                      : "Save as Draft"
                }
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
