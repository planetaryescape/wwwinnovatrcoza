import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface NewReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NewReportModal({
  open,
  onOpenChange,
  onSuccess,
}: NewReportModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    industry: "",
    topics: "",
    teaser: "",
    date: new Date().toISOString().split("T")[0],
    accessLevel: "PUBLIC",
    body: "",
    pdfUrl: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.teaser || !formData.accessLevel || !formData.date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        title: formData.title,
        category: formData.category,
        industry: formData.industry || null,
        topics: formData.topics ? formData.topics.split(",").map((t) => t.trim()) : [],
        teaser: formData.teaser,
        date: new Date(formData.date),
        accessLevel: formData.accessLevel,
        body: formData.body || null,
        pdfUrl: formData.pdfUrl || null,
      };

      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: "Success",
        description: "New trend has been published!",
      });

      setFormData({
        title: "",
        category: "",
        industry: "",
        topics: "",
        teaser: "",
        date: new Date().toISOString().split("T")[0],
        accessLevel: "PUBLIC",
        body: "",
        pdfUrl: "",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Trend / Mailer</DialogTitle>
          <DialogDescription>
            Create and publish a new Innovatr Intelligence piece
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Banking Monogamy Is Dead"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(val) => handleSelectChange("category", val)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insights">Insights</SelectItem>
                  <SelectItem value="Launch">Launch</SelectItem>
                  <SelectItem value="IRL">IRL</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Input
                id="topics"
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="e.g., Banking, Loyalty, Digital"
                data-testid="input-topics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
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
              <Label htmlFor="accessLevel">Access Level *</Label>
              <Select value={formData.accessLevel} onValueChange={(val) => handleSelectChange("accessLevel", val)}>
                <SelectTrigger data-testid="select-access-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="STARTER">Starter+</SelectItem>
                  <SelectItem value="GROWTH">Growth+</SelectItem>
                  <SelectItem value="SCALE">Scale Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teaser">Preview Text *</Label>
            <Textarea
              id="teaser"
              name="teaser"
              value={formData.teaser}
              onChange={handleChange}
              placeholder="Short teaser for the card view"
              className="h-20"
              data-testid="textarea-teaser"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body Content</Label>
            <Textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Full mailer content"
              className="h-40"
              data-testid="textarea-body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfUrl">PDF URL (optional)</Label>
            <Input
              id="pdfUrl"
              name="pdfUrl"
              value={formData.pdfUrl}
              onChange={handleChange}
              placeholder="https://example.com/report.pdf"
              type="url"
              data-testid="input-pdf-url"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="button-submit">
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
