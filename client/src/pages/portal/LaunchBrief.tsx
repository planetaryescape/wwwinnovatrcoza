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

import { useState, useCallback, useRef, useEffect, MutableRefObject } from "react";
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
import { FileText, Zap, CheckCircle, Upload, ArrowRight, FileUp, X, Download, ChevronDown, Plus, Loader2, Trash2, CreditCard, FileCheck, AlertCircle, Coins, ShoppingCart } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useAuth, getBasicCreditsRemaining, getProCreditsRemaining } from "@/contexts/AuthContext";

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

type BillingPreference = "online" | "invoice" | "credits";

const BASIC_MEMBER_PRICE = 5000;
const BASIC_STANDARD_PRICE = 5500;
const PRO_MEMBER_PRICE = 45000;
const PRO_STANDARD_PRICE = 50000;

export default function LaunchBrief() {
  const { user, company, isPaidMember, isFreeUser } = useAuth();
  const [, setLocationHook] = useLocation();
  const queryClient = useQueryClient();
  const [selectedBrief, setSelectedBrief] = useState<BriefType>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingConcept, setIsDraggingConcept] = useState<string | null>(null);
  const [competitorInput, setCompetitorInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);
  const paymentWindowRef = useRef<Window | null>(null);

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
    billingPreference: "online" as BillingPreference,
    confirmAuthorisation: false,
    confirmPaymentTerms: false,
    confirmCreditsDeduction: false,
    subscribeUpdates: false,
  });
  const { toast } = useToast();

  // Pre-populate client details from user and company data
  useEffect(() => {
    if (user || company) {
      setFormData(prev => ({
        ...prev,
        clientName: prev.clientName || user?.name || "",
        clientEmail: prev.clientEmail || user?.email || "",
        clientCompany: prev.clientCompany || company?.name || user?.company || "",
      }));
    }
  }, [user, company]);

  // Credit calculations
  const basicCreditsRemaining = company ? getBasicCreditsRemaining(company) : 0;
  const proCreditsRemaining = company ? getProCreditsRemaining(company) : 0;
  const creditsRequired = concepts.length;
  const isBasicStudy = selectedBrief === "basic";
  const requiredCreditsType = isBasicStudy ? "Basic" : "Pro";
  const availableCreditsForStudy = isBasicStudy ? basicCreditsRemaining : proCreditsRemaining;
  const hasEnoughCredits = availableCreditsForStudy >= creditsRequired;
  const hasAnyCredits = basicCreditsRemaining > 0 || proCreditsRemaining > 0;

  // Use member pricing if user is logged in, otherwise standard pricing
  const isLoggedIn = !!user;
  const basicPrice = isLoggedIn ? BASIC_MEMBER_PRICE : BASIC_STANDARD_PRICE;
  const proPrice = isLoggedIn ? PRO_MEMBER_PRICE : PRO_STANDARD_PRICE;
  const PRICE_PER_CONCEPT = selectedBrief === "basic" ? basicPrice : proPrice;
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

  // State for tracking payment redirect
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  const submitBriefMutation = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const response = await apiRequest("POST", "/api/briefs", payload);
      return response.json();
    },
    onSuccess: async (data) => {
      // Check if this requires payment redirect
      if (data.requiresPayment && data.brief?.id) {
        setIsRedirectingToPayment(true);
        
        try {
          // Create checkout for the brief
          const checkoutRes = await fetch(`/api/briefs/${data.brief.id}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerKey: "payfast" }),
          });
          
          if (!checkoutRes.ok) {
            throw new Error("Failed to create checkout");
          }
          
          const checkout = await checkoutRes.json();
          
          // Handle PayFast form redirect - data is nested under checkout.data
          if (checkout.type === "form" && checkout.data?.action && checkout.data?.fields) {
            // Use the pre-opened payment window
            const paymentWindow = paymentWindowRef.current;
            if (paymentWindow && !paymentWindow.closed) {
              // Build form HTML
              const fieldsHtml = Object.entries(checkout.data.fields)
                .map(([key, value]) => `<input type="hidden" name="${key}" value="${String(value).replace(/"/g, '&quot;')}" />`)
                .join("");
              
              // Clear the loading screen and write the payment form
              paymentWindow.document.open();
              paymentWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head><title>Redirecting to PayFast...</title></head>
                <body>
                  <p>Redirecting to PayFast payment page...</p>
                  <form id="payfast-form" method="POST" action="${checkout.data.action}">
                    ${fieldsHtml}
                  </form>
                  <script>document.getElementById('payfast-form').submit();</script>
                </body>
                </html>
              `);
              paymentWindow.document.close();
              paymentWindowRef.current = null; // Clear the ref
              
              toast({
                title: "Payment Window Opened",
                description: "Complete your payment in the new tab.",
              });
            } else {
              // Window was closed by user
              toast({
                title: "Payment Cancelled",
                description: "The payment window was closed. Please try again.",
                variant: "destructive",
              });
            }
            setIsRedirectingToPayment(false);
            return;
          }
        } catch (error) {
          console.error("Payment redirect failed:", error);
          setIsRedirectingToPayment(false);
          // Close the payment window if it's still open
          if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
            paymentWindowRef.current.close();
            paymentWindowRef.current = null;
          }
          toast({
            title: "Payment setup failed",
            description: "Your brief was saved but we couldn't set up payment. Please try again from your dashboard.",
            variant: "destructive",
          });
          // Still show success since brief was saved
          setShowSuccess(true);
        }
      } else {
        // Not a payment redirect - show success immediately
        setShowSuccess(true);
      }
      
      // Invalidate company data if credits were used
      if (company) {
        queryClient.invalidateQueries({ queryKey: ['/api/companies', company.id] });
      }
      
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
        confirmCreditsDeduction: false,
        subscribeUpdates: false,
      });
    },
    onError: (error: any) => {
      setIsRedirectingToPayment(false);
      // Close the payment window if it's still open
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
        paymentWindowRef.current = null;
      }
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit brief. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload files to server and return metadata
  const uploadFilesToServer = async (files: File[], companyName: string): Promise<{
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
    // Include company name for organized storage path
    formDataUpload.append("companyName", companyName);

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

    // Validate consent checkboxes based on payment method
    if (formData.billingPreference === "online" || formData.billingPreference === "invoice") {
      if (!formData.confirmAuthorisation) {
        errors.confirmAuthorisation = "Please confirm project authorisation";
      }
    }

    if (formData.billingPreference === "credits") {
      if (!formData.confirmCreditsDeduction) {
        errors.confirmCreditsDeduction = "Please confirm credits deduction authorisation";
      }
      // Double-check credits availability
      if (!hasEnoughCredits) {
        errors.credits = "Insufficient credits for this study";
      }
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

    // IMPORTANT: Open payment window IMMEDIATELY for online payments
    // This must happen synchronously in response to user click to avoid popup blockers
    if (formData.billingPreference === "online") {
      const paymentWindow = window.open("about:blank", "_blank");
      if (!paymentWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
        return;
      }
      // Show loading message in the new window
      paymentWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preparing Payment...</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .loader { text-align: center; }
            .spinner { width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #333; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>Preparing your payment...</p>
          </div>
        </body>
        </html>
      `);
      paymentWindowRef.current = paymentWindow;
    }

    try {
      setIsUploadingFiles(true);

      // Collect all files from concepts
      const allConceptFiles = concepts.flatMap(c => c.files.map(f => f.file));
      const allFiles = [...allConceptFiles, ...additionalFiles];

      // Upload all files with company name for organized storage
      const uploadedFileMetadata = await uploadFilesToServer(allFiles, formData.clientCompany);

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
        paymentMethod: formData.billingPreference === "credits" ? "credits" : 
                       formData.billingPreference === "invoice" ? "invoice" : "online",
        // Credit usage information
        basicCreditsUsed: formData.billingPreference === "credits" && isBasicStudy ? creditsRequired : 0,
        proCreditsUsed: formData.billingPreference === "credits" && !isBasicStudy ? creditsRequired : 0,
        companyId: company?.id || null,
        userId: user?.id || null,
        projectFileUrls: [],
        files: uploadedFileMetadata,
      };

      submitBriefMutation.mutate(payload);
    } catch (error: any) {
      // Close the payment window if it's still open
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
        paymentWindowRef.current = null;
      }
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

          {/* Free user membership promo */}
          {isFreeUser && (
            <Card className="bg-primary/5 border-primary/30 mb-4">
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Save with Innovatr Membership</p>
                    <p className="text-sm text-muted-foreground">
                      Members save R500 on every Basic credit and 10% on Pro studies
                    </p>
                  </div>
                </div>
                <Link href="/#membership">
                  <Button variant="outline" size="sm" data-testid="button-view-membership">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

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
                <div className="pt-4 space-y-2">
                  {isFreeUser ? (
                    <>
                      <Badge className="bg-accent text-accent-foreground">
                        R{BASIC_STANDARD_PRICE.toLocaleString()} standard rate
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Members save R{(BASIC_STANDARD_PRICE - BASIC_MEMBER_PRICE).toLocaleString()} per credit
                      </p>
                    </>
                  ) : (
                    <Badge className="bg-accent text-accent-foreground">
                      1 Credit - R{BASIC_MEMBER_PRICE.toLocaleString()} member rate
                    </Badge>
                  )}
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
                <div className="pt-4 space-y-2">
                  {isFreeUser ? (
                    <>
                      <Badge className="bg-primary text-primary-foreground">
                        R{PRO_STANDARD_PRICE.toLocaleString()} standard rate
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Members save R{(PRO_STANDARD_PRICE - PRO_MEMBER_PRICE).toLocaleString()} per study (10% off)
                      </p>
                    </>
                  ) : (
                    <Badge className="bg-primary text-primary-foreground">
                      1 Credit - R{PRO_MEMBER_PRICE.toLocaleString()} member rate
                    </Badge>
                  )}
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
              onValueChange={(value: BillingPreference) => 
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

              {/* Use My Credits Option */}
              {isPaidMember && company && (
                <div className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value="credits" 
                    id="billing-credits" 
                    data-testid="radio-billing-credits"
                    disabled={!hasEnoughCredits}
                  />
                  <div className="space-y-2 flex-1">
                    <Label 
                      htmlFor="billing-credits" 
                      className={`font-medium cursor-pointer flex items-center gap-2 ${!hasEnoughCredits ? "text-muted-foreground" : ""}`}
                    >
                      <Coins className="w-4 h-4" />
                      Use My Credits
                    </Label>
                    
                    {formData.billingPreference === "credits" && hasEnoughCredits && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Pay using your available Test24 credits. Fast, simple, and no billing required.
                        </p>
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            You have enough credits to launch this study.
                          </p>
                          <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                            <p className="font-medium">Available Credits</p>
                            <p>Test24 Basic: {basicCreditsRemaining} available</p>
                            <p>Test24 Pro: {proCreditsRemaining} available</p>
                          </div>
                          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                            This study will use <strong>{creditsRequired} Test24 {requiredCreditsType}</strong> credit{creditsRequired > 1 ? "s" : ""}.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Show credit status when not selected but has some credits */}
                    {formData.billingPreference !== "credits" && hasAnyCredits && (
                      <div className="text-sm text-muted-foreground">
                        <p>Test24 Basic: {basicCreditsRemaining} | Test24 Pro: {proCreditsRemaining}</p>
                      </div>
                    )}

                    {/* Not enough credits of the correct type */}
                    {!hasEnoughCredits && hasAnyCredits && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          You don't have enough credits for this study.
                        </p>
                        <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                          <p className="font-medium">Available Credits</p>
                          <p>Test24 Basic: {basicCreditsRemaining} available</p>
                          <p>Test24 Pro: {proCreditsRemaining} available</p>
                        </div>
                        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                          Top up your Test24 {requiredCreditsType} credits to launch this project.
                        </p>
                        <Link href="/portal/billing">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            data-testid="button-topup-credits"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Top Up Credits
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* No credits at all */}
                    {!hasAnyCredits && (
                      <div className="p-3 bg-muted border rounded-md">
                        <p className="text-sm font-medium text-muted-foreground">
                          Looks like you don't have any Test24 credits yet.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Top up now to unlock faster launches and member-only pricing.
                        </p>
                        <Link href="/portal/billing">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            data-testid="button-buy-credits"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Credits
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </RadioGroup>

            {/* Consent Checkboxes - Dynamic based on payment method */}
            <div className="space-y-4 pt-4 border-t">
              {/* Pay Online Consent */}
              {formData.billingPreference === "online" && (
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
                      I confirm this brief is accurate and I authorise Innovatr to begin the study immediately. Payment will be processed upon submission. *
                    </label>
                    {validationErrors.confirmAuthorisation && (
                      <p className="text-xs text-destructive">{validationErrors.confirmAuthorisation}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Invoice Me Consent */}
              {formData.billingPreference === "invoice" && (
                <>
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
                        I confirm this brief is accurate and I authorise Innovatr to prepare the study. I agree to a 30-day payment term. My project will begin once payment or a purchase order is received. *
                      </label>
                      {validationErrors.confirmAuthorisation && (
                        <p className="text-xs text-destructive">{validationErrors.confirmAuthorisation}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Use My Credits Consent */}
              {formData.billingPreference === "credits" && (
                <div className="flex items-start space-x-2" data-field="confirmCreditsDeduction">
                  <Checkbox
                    id="confirmCreditsDeduction"
                    checked={formData.confirmCreditsDeduction}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, confirmCreditsDeduction: checked as boolean })
                    }
                    data-testid="checkbox-confirm-credits-deduction"
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="confirmCreditsDeduction"
                      className="text-sm leading-tight cursor-pointer"
                    >
                      I confirm this brief is accurate and I authorise Innovatr to deduct {creditsRequired} Test24 {requiredCreditsType} credit{creditsRequired > 1 ? "s" : ""} from my account and begin the study immediately. *
                    </label>
                    {validationErrors.confirmCreditsDeduction && (
                      <p className="text-xs text-destructive">{validationErrors.confirmCreditsDeduction}</p>
                    )}
                  </div>
                </div>
              )}

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
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="font-semibold">
                {formData.billingPreference === "online" && "Pay Online"}
                {formData.billingPreference === "invoice" && "Invoice"}
                {formData.billingPreference === "credits" && "Use My Credits"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold">
                {formData.billingPreference === "credits" ? "Credits Required" : "Total Cost"}
              </span>
              {formData.billingPreference === "credits" ? (
                <span className="text-2xl font-bold text-primary">
                  {creditsRequired} {requiredCreditsType} Credit{creditsRequired > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  R{totalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={isUploadingFiles || submitBriefMutation.isPending || isRedirectingToPayment || (formData.billingPreference === "credits" && !hasEnoughCredits)}
              data-testid="button-submit-brief"
            >
              {isUploadingFiles ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading files...
                </>
              ) : isRedirectingToPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting to payment...
                </>
              ) : submitBriefMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {formData.billingPreference === "online" && "Submit & Pay"}
                  {formData.billingPreference === "invoice" && "Submit Brief"}
                  {formData.billingPreference === "credits" && (hasEnoughCredits ? "Submit Using Credits" : "Top Up Credits")}
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
