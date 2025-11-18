import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Zap, CheckCircle, Upload, ArrowRight } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";

type BriefType = "basic" | "pro" | null;

export default function LaunchBrief() {
  const [selectedBrief, setSelectedBrief] = useState<BriefType>(null);
  const [formData, setFormData] = useState({
    productName: "",
    productType: "",
    description: "",
    targetAudience: "",
    researchQuestions: "",
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Brief Submitted!",
      description: `Your ${selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro"} study is being set up. Expected delivery: 24 hours.`,
    });
    // Reset form
    setSelectedBrief(null);
    setFormData({
      productName: "",
      productType: "",
      description: "",
      targetAudience: "",
      researchQuestions: "",
    });
  };

  if (!selectedBrief) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Launch New Brief</h1>
            <p className="text-lg text-muted-foreground">
              Choose your research type and launch in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card
              className="hover-elevate active-elevate-2 cursor-pointer border-2 border-accent/30"
              onClick={() => setSelectedBrief("basic")}
              data-testid="card-select-basic"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-md bg-accent/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Test24 Basic</CardTitle>
                <CardDescription className="text-base">
                  Fast idea validation with quantitative insights
                </CardDescription>
                <div className="pt-4">
                  <Badge className="bg-accent text-accent-foreground">
                    1 Credit • R5,000 member rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Swipe Testing (100+ consumers)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Trade-off Analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Market Simulator</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Results in 24 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover-elevate active-elevate-2 cursor-pointer border-2 border-primary/30"
              onClick={() => setSelectedBrief("pro")}
              data-testid="card-select-pro"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Test24 Pro</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-level quant & qual testing
                </CardDescription>
                <div className="pt-4">
                  <Badge className="bg-primary text-primary-foreground">
                    1 Credit • R45,000 member rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Everything in Basic</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">AI-powered Qual interviews</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Reach options: 100/200/500 consumers</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Deep VOC analysis</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">
              {selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro"} Brief
            </h1>
            <p className="text-lg text-muted-foreground">
              Complete the form below to launch your study
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedBrief(null)}
            data-testid="button-change-type"
          >
            Change Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Study Details</CardTitle>
            <CardDescription>
              Provide information about your product or idea
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Product/Idea Name *</Label>
              <Input
                id="productName"
                placeholder="e.g., New Protein Bar Range"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Product Category *</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) =>
                  setFormData({ ...formData, productType: value })
                }
              >
                <SelectTrigger id="productType" data-testid="select-product-type">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="personal-care">Personal Care</SelectItem>
                  <SelectItem value="household">Household</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="financial">Financial Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your product, idea, or concept..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience *</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., Active adults 25-45, LSM 8-10"
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                data-testid="input-target-audience"
              />
            </div>

            {selectedBrief === "pro" && (
              <div className="space-y-2">
                <Label htmlFor="researchQuestions">
                  Research Questions (Optional)
                </Label>
                <Textarea
                  id="researchQuestions"
                  placeholder="What specific questions do you want answered?"
                  rows={3}
                  value={formData.researchQuestions}
                  onChange={(e) =>
                    setFormData({ ...formData, researchQuestions: e.target.value })
                  }
                  data-testid="input-research-questions"
                />
              </div>
            )}

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-2">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Upload Assets (Optional)</p>
                <p className="text-xs text-muted-foreground">
                  Images, videos, or documents related to your concept
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-upload-assets">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Study Type</span>
              <span className="font-semibold">
                {selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Turnaround Time</span>
              <span className="font-semibold">24 hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit Cost</span>
              <span className="font-semibold">1 Credit</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold">Member Rate</span>
              <span className="text-lg font-bold text-primary">
                {selectedBrief === "basic" ? "R5,000" : "R45,000"}
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              data-testid="button-submit-brief"
            >
              Launch Study
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
