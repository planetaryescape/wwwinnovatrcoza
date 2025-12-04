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
 * - Competitors are now OPTIONAL
 * 
 * CONCEPT BUILDER:
 * - Concepts are stored as an array with name, description, and files
 * - Number of concepts is derived from concepts.length
 * 
 * BILLING PREFERENCES:
 * - Pay Online: Immediate payment
 * - Invoice Me: 30-day payment terms
 * 
 * BACKEND ASSUMPTION:
 * - The submit payload sends arrays for region, age, gender, income, and competitors.
 * - If backend expects different formats, modify only the handleSubmit function.
 */

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileText, Zap, CheckCircle, Upload, ArrowRight, FileUp, X, Download, ChevronDown, Plus, Loader2, Trash2, CreditCard, FileCheck, AlertCircle } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

type BriefType = "basic" | "pro" | null;

interface ConceptFile {
  file: File;
  id: string;
}

interface Concept {
  id: string;
  name: string;
  description: string;
  files: ConceptFile[];
}

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
  error?: boolean;
}

function MultiSelect({ options, selected, onChange, placeholder, testId, error }: MultiSelectProps) {
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
          className={`w-full justify-between font-normal ${error ? "border-destructive" : ""}`}
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
                className="pointer-events-none"
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
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" },
];

const incomeOptions: MultiSelectOption[] = [
  { value: "under-10k", label: "Under R10,000" },
  { value: "10k-20k", label: "R10k - R20k" },
  { value: "30k-50k", label: "R30k - R50k" },
  { value: "50k-75k", label: "R50k - R75k" },
  { value: "75k-100k", label: "R75k - R100k" },
  { value: "100k+", label: "R100k+" },
];

const genderOptions: MultiSelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

// Generate unique ID for concepts
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function LaunchBrief() {
  const [selectedBrief, setSelectedBrief] = useState<BriefType>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingConcept, setIsDraggingConcept] = useState<string | null>(null);
  const [competitorInput, setCompetitorInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  // Concepts state
  const [concepts, setConcepts] = useState<Concept[]>([
    { id: generateId(), name: "", description: "", files: [] }
  ]);

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
    competitors: [] as string[],
    billingPreference: "online" as "online" | "invoice",
    confirmAuthorisation: false,
    confirmPaymentTerms: false,
    subscribeUpdates: false,
  });
  const { toast } = useToast();

  const PRICE_PER_CONCEPT = selectedBrief === "basic" ? 5000 : 45000;
  const totalPrice = PRICE_PER_CONCEPT * concepts.length;

  // Competitors limit: 2 for Basic, 5 for Pro
  const isBasic = selectedBrief === "basic";
  const maxCompetitors = isBasic ? 2 : 5;
  const competitorsLabel = isBasic 
    ? "Competitors (optional, up to 2)" 
    : "Competitors (optional, up to 5)";

  // File upload for additional materials (20MB limit)
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const VALID_FILE_TYPES = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/webm",
    "audio/mpeg", "audio/mp4", "audio/mp4a-latm", "audio/wav",
    "application/pdf", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-powerpoint",
    "text/plain"
  ];

  const handleFileUpload = useCallback((files: FileList | null, forConceptId?: string) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(file.name);
        toast({
          title: "File too large",
          description: (
            <div className="space-y-2">
              <p><strong>{file.name}</strong> is too large to upload. Please compress it and try again.</p>
              <p className="text-xs text-muted-foreground">
                If you still experience issues, email your materials directly to richard@innovatr.co.za and hannah@innovatr.co.za and we'll attach them to your project manually.
              </p>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      if (!VALID_FILE_TYPES.includes(file.type) && !file.name.match(/\.(pptx?|docx?|xlsx?)$/i)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
    });

    if (forConceptId) {
      // Add files to specific concept
      setConcepts(prev => prev.map(concept => 
        concept.id === forConceptId
          ? { 
              ...concept, 
              files: [...concept.files, ...validFiles.map(f => ({ file: f, id: generateId() }))]
            }
          : concept
      ));
    } else {
      // Add to additional files
      setAdditionalFiles((prev) => [...prev, ...validFiles]);
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent, conceptId?: string) => {
    e.preventDefault();
    if (conceptId) {
      setIsDraggingConcept(conceptId);
    } else {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, conceptId?: string) => {
    e.preventDefault();
    if (conceptId) {
      setIsDraggingConcept(null);
    } else {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, conceptId?: string) => {
    e.preventDefault();
    setIsDragging(false);
    setIsDraggingConcept(null);
    handleFileUpload(e.dataTransfer.files, conceptId);
  }, [handleFileUpload]);

  const removeFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeConceptFile = (conceptId: string, fileId: string) => {
    setConcepts(prev => prev.map(concept =>
      concept.id === conceptId
        ? { ...concept, files: concept.files.filter(f => f.id !== fileId) }
        : concept
    ));
  };

  // Concept management
  const addConcept = () => {
    setConcepts(prev => [...prev, { id: generateId(), name: "", description: "", files: [] }]);
  };

  const removeConcept = (id: string) => {
    if (concepts.length <= 1) return;
    setConcepts(prev => prev.filter(c => c.id !== id));
  };

  const updateConcept = (id: string, field: keyof Concept, value: string) => {
    setConcepts(prev => prev.map(concept =>
      concept.id === id ? { ...concept, [field]: value } : concept
    ));
  };

  // Competitor management
  const addCompetitor = () => {
    const trimmed = competitorInput.trim();
    if (!trimmed) return;
    
    if (formData.competitors.length >= maxCompetitors) {
      toast({
        title: "Limit reached",
        description: `You've reached the maximum number of competitors for this study.`,
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

  // State for file upload in progress
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const submitBriefMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const response = await apiRequest("POST", "/api/briefs", payload);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      
      // Reset form
      setSelectedBrief(null);
      setAdditionalFiles([]);
      setCompetitorInput("");
      setConcepts([{ id: generateId(), name: "", description: "", files: [] }]);
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
        competitors: [],
        billingPreference: "online",
        confirmAuthorisation: false,
        confirmPaymentTerms: false,
        subscribeUpdates: false,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit brief. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload files to server and return metadata
  const uploadFilesToServer = async (files: File[]): Promise<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  }[]> => {
    if (files.length === 0) return [];

    const formDataUpload = new FormData();
    files.forEach(file => {
      formDataUpload.append("files", file);
    });

    const response = await fetch("/api/briefs/upload", {
      method: "POST",
      body: formDataUpload,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload files");
    }

    const data = await response.json();
    return data.files || [];
  };

  const scrollToFirstError = () => {
    const firstErrorKey = Object.keys(validationErrors)[0];
    if (firstErrorKey && formRef.current) {
      const errorElement = formRef.current.querySelector(`[data-field="${firstErrorKey}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};

    // Validate client details
    if (!formData.clientName.trim()) errors.clientName = "Client Name is required";
    if (!formData.clientEmail.trim()) errors.clientEmail = "Client Email is required";
    if (!formData.clientContact.trim()) errors.clientContact = "Contact Number is required";
    if (!formData.clientCompany.trim()) errors.clientCompany = "Company is required";

    // Validate research details
    if (!formData.researchObjective.trim()) errors.researchObjective = "Research Objective is required";
    if (formData.region.length === 0) errors.region = "Select at least one region";
    if (formData.age.length === 0) errors.age = "Select at least one age range";
    if (formData.income.length === 0) errors.income = "Select at least one income range";
    if (formData.gender.length === 0) errors.gender = "Select at least one gender";

    // Validate concepts
    concepts.forEach((concept, index) => {
      if (!concept.name.trim()) {
        errors[`concept_${index}_name`] = `Concept ${index + 1} name is required`;
      }
    });

    // Validate consent checkboxes
    if (!formData.confirmAuthorisation) {
      errors.confirmAuthorisation = "Please confirm project authorisation";
    }

    if (formData.billingPreference === "invoice" && !formData.confirmPaymentTerms) {
      errors.confirmPaymentTerms = "Please agree to the payment terms";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      setTimeout(scrollToFirstError, 100);
      return;
    }

    try {
      setIsUploadingFiles(true);

      // Collect all files from concepts
      const allConceptFiles = concepts.flatMap(c => c.files.map(f => f.file));
      const allFiles = [...allConceptFiles, ...additionalFiles];

      // Upload all files
      const uploadedFileMetadata = await uploadFilesToServer(allFiles);

      // Build the payload matching the backend schema
      const payload = {
        submittedByName: formData.clientName,
        submittedByEmail: formData.clientEmail,
        submittedByContact: formData.clientContact,
        companyName: formData.clientCompany,
        studyType: selectedBrief === "basic" ? "Test24 Basic" : "Test24 Pro",
        numIdeas: concepts.length,
        researchObjective: formData.researchObjective,
        regions: formData.region,
        ages: formData.age,
        genders: formData.gender,
        incomes: formData.income,
        competitors: formData.competitors,
        concepts: concepts.map(c => ({
          name: c.name,
          description: c.description || undefined,
          fileCount: c.files.length,
        })),
        billingPreference: formData.billingPreference,
        projectFileUrls: [],
        files: uploadedFileMetadata,
      };

      submitBriefMutation.mutate(payload);
    } catch (error: any) {
      toast({
        title: "File upload failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="border-primary">
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-serif font-bold">
                  Your brief has been successfully submitted!
                </h1>
                <p className="text-muted-foreground text-lg">
                  We've emailed you a confirmation and saved your brief in your My Research tab.
                  We'll review it and contact you shortly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/portal/research">
                  <Button size="lg" data-testid="button-go-to-research">
                    Go to My Research
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/portal">
                  <Button variant="outline" size="lg" data-testid="button-back-to-dashboard">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

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
                    1 Credit - R5,000 member rate
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
                    1 Credit - R45,000 member rate
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
      <div className="p-6 max-w-4xl mx-auto space-y-8" ref={formRef}>
        {/* Page Header */}
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
              See what your report and questionnaire will look like.
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
              <div className="space-y-2" data-field="clientName">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  placeholder="Your full name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className={validationErrors.clientName ? "border-destructive" : ""}
                  data-testid="input-client-name"
                />
                {validationErrors.clientName && (
                  <p className="text-xs text-destructive">{validationErrors.clientName}</p>
                )}
              </div>

              <div className="space-y-2" data-field="clientEmail">
                <Label htmlFor="clientEmail">Client Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  className={validationErrors.clientEmail ? "border-destructive" : ""}
                  data-testid="input-client-email"
                />
                {validationErrors.clientEmail && (
                  <p className="text-xs text-destructive">{validationErrors.clientEmail}</p>
                )}
              </div>

              <div className="space-y-2" data-field="clientContact">
                <Label htmlFor="clientContact">Client Contact Number *</Label>
                <Input
                  id="clientContact"
                  type="tel"
                  placeholder="+27 XX XXX XXXX"
                  value={formData.clientContact}
                  onChange={(e) =>
                    setFormData({ ...formData, clientContact: e.target.value })
                  }
                  className={validationErrors.clientContact ? "border-destructive" : ""}
                  data-testid="input-client-contact"
                />
                {validationErrors.clientContact && (
                  <p className="text-xs text-destructive">{validationErrors.clientContact}</p>
                )}
              </div>

              <div className="space-y-2" data-field="clientCompany">
                <Label htmlFor="clientCompany">Client Company *</Label>
                <Input
                  id="clientCompany"
                  placeholder="Company name"
                  value={formData.clientCompany}
                  onChange={(e) =>
                    setFormData({ ...formData, clientCompany: e.target.value })
                  }
                  className={validationErrors.clientCompany ? "border-destructive" : ""}
                  data-testid="input-client-company"
                />
                {validationErrors.clientCompany && (
                  <p className="text-xs text-destructive">{validationErrors.clientCompany}</p>
                )}
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
            <div className="space-y-2" data-field="researchObjective">
              <Label htmlFor="researchObjective">Research Objective *</Label>
              <Textarea
                id="researchObjective"
                placeholder="What do you want to learn from this research?"
                rows={3}
                value={formData.researchObjective}
                onChange={(e) =>
                  setFormData({ ...formData, researchObjective: e.target.value })
                }
                className={validationErrors.researchObjective ? "border-destructive" : ""}
                data-testid="input-research-objective"
              />
              {validationErrors.researchObjective && (
                <p className="text-xs text-destructive">{validationErrors.researchObjective}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2" data-field="region">
                <Label htmlFor="region">Region *</Label>
                <MultiSelect
                  options={regionOptions}
                  selected={formData.region}
                  onChange={(selected) => setFormData({ ...formData, region: selected })}
                  placeholder="Select regions"
                  testId="select-region"
                  error={!!validationErrors.region}
                />
                {validationErrors.region && (
                  <p className="text-xs text-destructive">{validationErrors.region}</p>
                )}
              </div>

              <div className="space-y-2" data-field="age">
                <Label htmlFor="age">Age *</Label>
                <MultiSelect
                  options={ageOptions}
                  selected={formData.age}
                  onChange={(selected) => setFormData({ ...formData, age: selected })}
                  placeholder="Select age ranges"
                  testId="select-age"
                  error={!!validationErrors.age}
                />
                {validationErrors.age && (
                  <p className="text-xs text-destructive">{validationErrors.age}</p>
                )}
              </div>

              <div className="space-y-2" data-field="income">
                <Label htmlFor="income">Income *</Label>
                <MultiSelect
                  options={incomeOptions}
                  selected={formData.income}
                  onChange={(selected) => setFormData({ ...formData, income: selected })}
                  placeholder="Select income ranges"
                  testId="select-income"
                  error={!!validationErrors.income}
                />
                {validationErrors.income && (
                  <p className="text-xs text-destructive">{validationErrors.income}</p>
                )}
              </div>

              <div className="space-y-2" data-field="gender">
                <Label htmlFor="gender">Gender *</Label>
                <MultiSelect
                  options={genderOptions}
                  selected={formData.gender}
                  onChange={(selected) => setFormData({ ...formData, gender: selected })}
                  placeholder="Select genders"
                  testId="select-gender"
                  error={!!validationErrors.gender}
                />
                {validationErrors.gender && (
                  <p className="text-xs text-destructive">{validationErrors.gender}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Concepts & Competitors Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Concepts</CardTitle>
            <CardDescription>
              Add each concept you want to test. You can upload multiple creative files for each concept.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {concepts.map((concept, index) => (
              <div
                key={concept.id}
                className="border rounded-lg p-4 space-y-4 relative"
                data-field={`concept_${index}_name`}
              >
                {concepts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeConcept(concept.id)}
                    data-testid={`button-remove-concept-${index}`}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label>Concept name *</Label>
                  <Input
                    placeholder="e.g. New snack bar idea, TVC #1, Route B"
                    value={concept.name}
                    onChange={(e) => updateConcept(concept.id, "name", e.target.value)}
                    className={validationErrors[`concept_${index}_name`] ? "border-destructive" : ""}
                    data-testid={`input-concept-name-${index}`}
                  />
                  {validationErrors[`concept_${index}_name`] && (
                    <p className="text-xs text-destructive">{validationErrors[`concept_${index}_name`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Upload creative(s)</Label>
                  <p className="text-xs text-muted-foreground">
                    You can upload multiple files. Drag and drop or click to browse.
                    <br />
                    Supported types: Images, videos, decks, and documents.
                  </p>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDraggingConcept === concept.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={(e) => handleDragOver(e, concept.id)}
                    onDragLeave={(e) => handleDragLeave(e, concept.id)}
                    onDrop={(e) => handleDrop(e, concept.id)}
                    data-testid={`dropzone-concept-${index}`}
                  >
                    <FileUp className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <input
                      type="file"
                      id={`conceptUpload-${concept.id}`}
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.pptx,.txt"
                      onChange={(e) => handleFileUpload(e.target.files, concept.id)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`conceptUpload-${concept.id}`)?.click()}
                      data-testid={`button-upload-concept-${index}`}
                    >
                      Choose Files
                    </Button>
                  </div>

                  {concept.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {concept.files.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">{f.file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(f.file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConceptFile(concept.id, f.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Concept notes (optional)</Label>
                  <Textarea
                    placeholder="Add any additional context or messaging you want us to understand."
                    rows={2}
                    value={concept.description}
                    onChange={(e) => updateConcept(concept.id, "description", e.target.value)}
                    data-testid={`input-concept-description-${index}`}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addConcept}
              className="w-full"
              data-testid="button-add-concept"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Concept
            </Button>

            {/* Competitors Section */}
            <div className="pt-6 border-t space-y-2">
              <Label htmlFor="competitors">{competitorsLabel}</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add the competitors you'd like your concepts compared against. You can leave this blank if you don't want competitor benchmarks.
              </p>
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
              {formData.competitors.length >= maxCompetitors && (
                <p className="text-xs text-muted-foreground">
                  You've reached the maximum number of competitors for this study.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Supporting Materials Section */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Supporting Materials</CardTitle>
            <CardDescription>
              Upload any extra references, brief documents, guidelines or mood boards that will help us understand your project.
              <br />
              Supports images, decks, videos, audio and documents. Maximum file size per file: 20MB.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => handleDragOver(e)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={(e) => handleDrop(e)}
              data-testid="dropzone-additional-files"
            >
              <FileUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                You can upload multiple files. Drag and drop or click to browse.
              </p>
              <input
                type="file"
                id="additionalFileUpload"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.docx,.xlsx,.pptx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("additionalFileUpload")?.click()}
                data-testid="button-choose-additional-files"
              >
                Choose Files
              </Button>
            </div>

            {additionalFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded files:</p>
                {additionalFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                    data-testid={`additional-file-item-${index}`}
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
                      data-testid={`button-remove-additional-file-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={formData.billingPreference}
              onValueChange={(value: "online" | "invoice") => 
                setFormData({ ...formData, billingPreference: value })
              }
              className="space-y-4"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="online" id="billing-online" data-testid="radio-billing-online" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="billing-online" className="font-medium cursor-pointer flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay Online
                  </Label>
                  {formData.billingPreference === "online" && (
                    <p className="text-sm text-muted-foreground">
                      Your card will be charged immediately and your project will move into the queue right away.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="invoice" id="billing-invoice" data-testid="radio-billing-invoice" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="billing-invoice" className="font-medium cursor-pointer flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    Invoice Me
                  </Label>
                  {formData.billingPreference === "invoice" && (
                    <p className="text-sm text-muted-foreground">
                      You'll receive an invoice within 1 working day. Your project will begin once payment or a purchase order is received. Standard 30-day payment terms apply.
                    </p>
                  )}
                </div>
              </div>
            </RadioGroup>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start space-x-2" data-field="confirmAuthorisation">
                <Checkbox
                  id="confirmAuthorisation"
                  checked={formData.confirmAuthorisation}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmAuthorisation: checked as boolean })
                  }
                  data-testid="checkbox-confirm-authorisation"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="confirmAuthorisation"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    I confirm that this brief is accurate and I authorise Innovatr to prepare the study based on the information supplied. *
                  </label>
                  {validationErrors.confirmAuthorisation && (
                    <p className="text-xs text-destructive">{validationErrors.confirmAuthorisation}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2" data-field="confirmPaymentTerms">
                <Checkbox
                  id="confirmPaymentTerms"
                  checked={formData.confirmPaymentTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, confirmPaymentTerms: checked as boolean })
                  }
                  data-testid="checkbox-confirm-payment-terms"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPaymentTerms"
                    className="text-sm leading-tight cursor-pointer"
                  >
                    If I choose to be invoiced, I agree to a 30-day payment term. My project will begin once payment or a purchase order is received. {formData.billingPreference === "invoice" ? "*" : ""}
                  </label>
                  {validationErrors.confirmPaymentTerms && (
                    <p className="text-xs text-destructive">{validationErrors.confirmPaymentTerms}</p>
                  )}
                </div>
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
                  Keep me updated with insights, news, and special offers. I can unsubscribe anytime.
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
              <span className="font-semibold">{concepts.length}</span>
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
              disabled={isUploadingFiles || submitBriefMutation.isPending}
              data-testid="button-submit-brief"
            >
              {isUploadingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading files...
                </>
              ) : submitBriefMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {formData.billingPreference === "online" ? "Submit & Pay" : "Submit Brief"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
