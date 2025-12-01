/**
 * Launch New Brief Form
 * 
 * MULTI-SELECT FIELDS:
 * - Region, Age, Gender, and Income fields now store arrays (string[]) instead of single strings.
 * - Users can select multiple options for each audience field.
 * 
 * COMPETITORS LOGIC:
 * - For Test24 Basic (selectedBrief === "basic"): maxCompetitors = 2
 * - For Test24 Pro or any other type: maxCompetitors = 5
 * - The label and input limit adjust dynamically based on study type.
 * 
 * BACKEND ASSUMPTION:
 * - The submit payload sends arrays for region, age, gender, income, and competitors.
 * - If backend expects different formats, modify only the handleSubmit function.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Zap, CheckCircle, Upload, ArrowRight, FileUp, X, Download, ChevronDown, Plus } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";

type BriefType = "basic" | "pro" | null;

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
  testId: string;
}

function MultiSelect({ options, selected, onChange, placeholder, testId }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getSelectedLabels = () => {
    return selected.map(v => options.find(o => o.value === v)?.label).filter(Boolean);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          data-testid={testId}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-[90%]">
              {selected.length <= 2 ? (
                getSelectedLabels().map((label, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {selected.length} selected
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start">
        <div className="space-y-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 hover-elevate rounded cursor-pointer"
              onClick={() => toggleOption(option.value)}
              data-testid={`option-${testId}-${option.value}`}
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={() => toggleOption(option.value)}
              />
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="pt-2 mt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onChange([])}
              data-testid={`button-clear-${testId}`}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

const regionOptions: MultiSelectOption[] = [
  { value: "eastern-cape", label: "Eastern Cape" },
  { value: "free-state", label: "Free State" },
  { value: "gauteng", label: "Gauteng" },
  { value: "kwazulu-natal", label: "KwaZulu-Natal" },
  { value: "limpopo", label: "Limpopo" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "northern-cape", label: "Northern Cape" },
  { value: "north-west", label: "North West" },
  { value: "western-cape", label: "Western Cape" },
];

const ageOptions: MultiSelectOption[] = [
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45-54", label: "45–54" },
  { value: "55+", label: "55+" },
];

const incomeOptions: MultiSelectOption[] = [
  { value: "under-10k", label: "Under R10,000" },
  { value: "10k-20k", label: "R10k – R20k" },
  { value: "30k-50k", label: "R30k – R50k" },
  { value: "50k-75k", label: "R50k – R75k" },
  { value: "75k-100k", label: "R75k – R100k" },
  { value: "100k+", label: "R100k+" },
];

const genderOptions: MultiSelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function LaunchBrief() {
  const [selectedBrief, setSelectedBrief] = useState<BriefType>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [competitorInput, setCompetitorInput] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientContact: "",
    clientCompany: "",
    researchObjective: "",
    region: [] as string[],
    age: [] as string[],
    income: [] as string[],
    gender: [] as string[],
    industry: "",
    companyBrand: "",
    numberOfIdeas: "1",
    competitors: [] as string[],
    confirmTerms: false,
    subscribeUpdates: false,
  });
  const { toast } = useToast();

  const PRICE_PER_CONCEPT = selectedBrief === "basic" ? 5000 : 45000;
  const totalPrice = PRICE_PER_CONCEPT * parseInt(formData.numberOfIdeas || "1");

  // Competitors limit: 2 for Basic, 5 for Pro
  const isBasic = selectedBrief === "basic";
  const maxCompetitors = isBasic ? 2 : 5;
  const competitorsLabel = `Competitors (up to ${maxCompetitors}) *`;

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      const maxSize = 3 * 1024 * 1024; // 3MB
      const validTypes = [
        "video/mp4", "video/quicktime", "video/webm",
        "audio/mpeg", "audio/mp4", "audio/mp4a-latm",
        "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain"
      ];

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 3MB limit`,
          variant: "destructive",
        });
        return false;
      }

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addCompetitor = () => {
    const trimmed = competitorInput.trim();
    if (!trimmed) return;
    
    if (formData.competitors.length >= maxCompetitors) {
      toast({
        title: "Limit reached",
        description: `You can only add up to ${maxCompetitors} competitors`,
        variant: "destructive",
      });
      return;
    }

    if (formData.competitors.includes(trimmed)) {
      toast({
        title: "Duplicate competitor",
        description: "This competitor has already been added",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, competitors: [...formData.competitors, trimmed] });
    setCompetitorInput("");
  };

  const removeCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const handleCompetitorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCompetitor();
    }
  };

  const handleSubmit = () => {
    // Validate all required fields - arrays must have at least one selection
    const requiredTextFields = [
      { value: formData.clientName, label: "Client Name" },
      { value: formData.clientEmail, label: "Client Email" },
      { value: formData.clientContact, label: "Client Contact Number" },
      { value: formData.clientCompany, label: "Client Company" },
      { value: formData.researchObjective, label: "Research Objective" },
      { value: formData.industry, label: "Industry" },
      { value: formData.companyBrand, label: "Company Brand" },
      { value: formData.numberOfIdeas, label: "Number of Ideas" },
    ];

    const requiredArrayFields = [
      { value: formData.region, label: "Region" },
      { value: formData.age, label: "Age" },
      { value: formData.income, label: "Income" },
      { value: formData.gender, label: "Gender" },
      { value: formData.competitors, label: "Competitors" },
    ];

    const emptyTextField = requiredTextFields.find(field => !field.value.trim());
    if (emptyTextField) {
      toast({
        title: "Missing required field",
        description: `Please fill in ${emptyTextField.label}`,
        variant: "destructive",
      });
      return;
    }

    const emptyArrayField = requiredArrayFields.find(field => field.value.length === 0);
    if (emptyArrayField) {
      toast({
        title: "Missing required field",
        description: `Please select at least one ${emptyArrayField.label}`,
        variant: "destructive",
      });
      return;
    }

    // Validate number of ideas is positive
    const numberOfIdeas = parseInt(formData.numberOfIdeas);
    if (isNaN(numberOfIdeas) || numberOfIdeas < 1) {
      toast({
        title: "Invalid number of ideas",
        description: "Please enter at least 1 idea to test",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "Missing project brief",
        description: "Please upload at least one file for your project brief",
        variant: "destructive",
      });
      return;
    }

    if (!formData.confirmTerms) {
      toast({
        title: "Terms required",
        description: "Please confirm that you understand the terms",
        variant: "destructive",
      });
      return;
    }

    // Submit payload - all audience fields and competitors are arrays
    const payload = {
      studyType: selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro",
      ...formData,
      // Arrays are sent as-is for backend processing
    };

    console.log("Brief submission payload:", payload);

    toast({
      title: "Brief Submitted!",
      description: `Your ${selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro"} study is being set up. Expected delivery: 24 hours.`,
    });
    
    // Reset form
    setSelectedBrief(null);
    setUploadedFiles([]);
    setCompetitorInput("");
    setFormData({
      clientName: "",
      clientEmail: "",
      clientContact: "",
      clientCompany: "",
      researchObjective: "",
      region: [],
      age: [],
      income: [],
      gender: [],
      industry: "",
      companyBrand: "",
      numberOfIdeas: "1",
      competitors: [],
      confirmTerms: false,
      subscribeUpdates: false,
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
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Submit Your Brief</h1>
            <p className="text-lg text-muted-foreground">
              {selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro"}
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

        {/* How It Works Section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works:</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold text-lg">Upload Your Brief</h3>
              <p className="text-sm text-muted-foreground">
                Share your project details and attach any ideas, references, or visuals that bring your vision to life.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold text-lg">Review & Launch</h3>
              <p className="text-sm text-muted-foreground">
                We'll turn your brief into a ready-to-launch survey. Review, approve, and hit go.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold text-lg">Get Insights Fast</h3>
              <p className="text-sm text-muted-foreground">
                Your full report arrives in just <strong>24 hours</strong>, packed with clear, actionable insights.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download Demo Materials Section */}
        <Card className={selectedBrief === "basic" ? "bg-accent/5 border-accent/20" : "bg-primary/5 border-primary/20"}>
          <CardHeader>
            <CardTitle className="text-2xl">Download Demo Materials</CardTitle>
            <CardDescription>
              See what your {selectedBrief === "basic" ? "report and questionnaire" : "report"} will look like
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={selectedBrief === "basic" ? "grid sm:grid-cols-2 gap-4" : "flex justify-start"}>
              <a
                href={`/assets/reports/Test24-${selectedBrief === "basic" ? "Basic" : "Pro"}-Demo.pdf`}
                download
                data-testid={`button-download-demo-report-${selectedBrief}`}
              >
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Demo Report
                </Button>
              </a>
              {selectedBrief === "basic" && (
                <a
                  href="/assets/reports/Test24-Basic-Questionnaire.docx"
                  download
                  data-testid="button-download-demo-questionnaire"
                >
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Demo Questionnaire
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Your full name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  data-testid="input-client-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  data-testid="input-client-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientContact">Client Contact Number *</Label>
                <Input
                  id="clientContact"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={formData.clientContact}
                  onChange={(e) =>
                    setFormData({ ...formData, clientContact: e.target.value })
                  }
                  data-testid="input-client-contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientCompany">Client Company *</Label>
                <Input
                  id="clientCompany"
                  placeholder="Company name"
                  value={formData.clientCompany}
                  onChange={(e) =>
                    setFormData({ ...formData, clientCompany: e.target.value })
                  }
                  data-testid="input-client-company"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Research Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="researchObjective">Research Objective *</Label>
              <Textarea
                id="researchObjective"
                placeholder="What do you want to learn from this research?"
                rows={3}
                value={formData.researchObjective}
                onChange={(e) =>
                  setFormData({ ...formData, researchObjective: e.target.value })
                }
                data-testid="input-research-objective"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <MultiSelect
                  options={regionOptions}
                  selected={formData.region}
                  onChange={(selected) => setFormData({ ...formData, region: selected })}
                  placeholder="Select regions"
                  testId="select-region"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <MultiSelect
                  options={ageOptions}
                  selected={formData.age}
                  onChange={(selected) => setFormData({ ...formData, age: selected })}
                  placeholder="Select age ranges"
                  testId="select-age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">Income *</Label>
                <MultiSelect
                  options={incomeOptions}
                  selected={formData.income}
                  onChange={(selected) => setFormData({ ...formData, income: selected })}
                  placeholder="Select income ranges"
                  testId="select-income"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <MultiSelect
                  options={genderOptions}
                  selected={formData.gender}
                  onChange={(selected) => setFormData({ ...formData, gender: selected })}
                  placeholder="Select genders"
                  testId="select-gender"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Food & Beverage"
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  data-testid="input-industry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyBrand">Company Brand *</Label>
                <Input
                  id="companyBrand"
                  placeholder="Brand being tested"
                  value={formData.companyBrand}
                  onChange={(e) =>
                    setFormData({ ...formData, companyBrand: e.target.value })
                  }
                  data-testid="input-company-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfIdeas">How many ideas being tested *</Label>
                <Input
                  id="numberOfIdeas"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.numberOfIdeas}
                  onChange={(e) =>
                    setFormData({ ...formData, numberOfIdeas: e.target.value })
                  }
                  data-testid="input-number-of-ideas"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.numberOfIdeas} Concept{formData.numberOfIdeas !== "1" ? "s" : ""} / Creative = R{totalPrice.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitors">{competitorsLabel}</Label>
                <div className="flex gap-2">
                  <Input
                    id="competitors"
                    placeholder="Enter competitor name"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={handleCompetitorKeyDown}
                    disabled={formData.competitors.length >= maxCompetitors}
                    data-testid="input-competitors"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addCompetitor}
                    disabled={formData.competitors.length >= maxCompetitors || !competitorInput.trim()}
                    data-testid="button-add-competitor"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.competitors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.competitors.map((competitor, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                        data-testid={`competitor-tag-${index}`}
                      >
                        {competitor}
                        <button
                          type="button"
                          onClick={() => removeCompetitor(index)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                          data-testid={`button-remove-competitor-${index}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.competitors.length} of {maxCompetitors} competitors added
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label>Project / Idea Brief *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Maximum file size 3 MB. Supported types: Videos (.mp4, .mov, .webm), Audio (.mp3, .m4a), and Documents (.pdf, .docx, .xlsx, .pptx, .txt).
              </p>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid="dropzone-files"
              >
                <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">Drag and Drop (or)</p>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept=".mp4,.mov,.webm,.mp3,.m4a,.pdf,.docx,.xlsx,.pptx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("fileUpload")?.click()}
                  data-testid="button-choose-files"
                >
                  Choose Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                      data-testid={`file-item-${index}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation Checkboxes */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="confirmTerms"
                  checked={formData.confirmTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmTerms: checked as boolean })
                  }
                  data-testid="checkbox-confirm-terms"
                />
                <label
                  htmlFor="confirmTerms"
                  className="text-sm leading-tight cursor-pointer"
                >
                  I understand that by submitting, I'm confirming my project to proceed to launch and will be billed once it begins.
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="subscribeUpdates"
                  checked={formData.subscribeUpdates}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, subscribeUpdates: checked as boolean })
                  }
                  data-testid="checkbox-subscribe-updates"
                />
                <label
                  htmlFor="subscribeUpdates"
                  className="text-sm leading-tight cursor-pointer"
                >
                  Keep me in the loop with updates, news, and special offers. I can unsubscribe anytime.
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary and Submit */}
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
              <span className="text-sm text-muted-foreground">Number of Concepts</span>
              <span className="font-semibold">{formData.numberOfIdeas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Turnaround Time</span>
              <span className="font-semibold">24 hours</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold">Total Cost</span>
              <span className="text-2xl font-bold text-primary">
                R{totalPrice.toLocaleString()}
              </span>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              data-testid="button-submit-brief"
            >
              Submit Brief
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
