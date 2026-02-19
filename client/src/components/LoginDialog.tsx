import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Check, X } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Beverages",
  "Food & Snacks",
  "Personal Care",
  "Beauty & Cosmetics",
  "Health & Wellness",
  "Alcohol",
  "Agriculture",
  "Retail",
  "Technology",
  "FMCG",
  "Hospitality",
  "Financial Services",
  "Media & Entertainment",
  "Education",
  "Other",
];

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showResetLink, setShowResetLink] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Email validation
  const isValidEmail = useMemo(() => {
    if (!email) return false;
    // RFC 5322 compliant email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email);
  }, [email]);

  // Password requirements validation
  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const resolvedIndustry = industry === "Other" ? customIndustry : industry;
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean) && isValidEmail && company.trim().length > 0 && resolvedIndustry.trim().length > 0;

  const handlePasswordResetRequest = async () => {
    if (!email) {
      setLoginError("Please enter your email address first.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setResetEmailSent(true);
        toast({
          title: "Reset email sent",
          description: "Check your inbox for password reset instructions.",
        });
      } else {
        toast({
          title: "Could not send reset email",
          description: "Please check your email address and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      if (isSignup) {
        await signup(email, password, name, company, resolvedIndustry);
        toast({
          title: "Welcome to Innovatr!",
          description: "Your free account has been created. Access trend reports now!",
        });
        setLoginAttempts(0);
      } else {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        setLoginAttempts(0);
      }
      
      // Close dialog and redirect to portal
      onOpenChange(false);
      setTimeout(() => {
        setLocation("/portal");
      }, 100);
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // Progressive error messages
      if (!isSignup) {
        setLoginError("Incorrect email or password. Please try again.");
        setShowResetLink(true);
      } else {
        // Signup error
        const message = error?.message || "Could not create account. Please try again.";
        setLoginError(message);
      }
      
      toast({
        title: isSignup ? "Signup failed" : "Login failed",
        description: error?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle data-testid="text-login-title">
            {isSignup ? "Create Free Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription data-testid="text-login-description">
            {isSignup
              ? "Get instant access to premium trend reports and industry insights."
              : "Access your portal and continue your research journey."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" data-testid="label-name">
                  Full Name
                </Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" data-testid="label-company">
                  Company Name
                </Label>
                <Input
                  id="company"
                  data-testid="input-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company or organization"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" data-testid="label-industry">
                  Industry
                </Label>
                <Select value={industry} onValueChange={(v) => { setIndustry(v); if (v !== "Other") setCustomIndustry(""); }}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {industry === "Other" && (
                  <Input
                    data-testid="input-custom-industry"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Enter your industry"
                    required
                  />
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" data-testid="label-email">
              Email Address
            </Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
            {isSignup && email.length > 0 && !isValidEmail && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="email-validation">
                <X className="w-3.5 h-3.5" />
                <span>Please enter a valid email address</span>
              </div>
            )}
            {isSignup && email.length > 0 && isValidEmail && (
              <div className="flex items-center gap-1.5 text-xs text-green-600" data-testid="email-validation-success">
                <Check className="w-3.5 h-3.5" />
                <span>Valid email address</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" data-testid="label-password">
              Password
            </Label>
            <Input
              id="password"
              data-testid="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            {isSignup && password.length > 0 && (
              <div className="mt-2 space-y-1.5 text-xs" data-testid="password-requirements">
                <p className="text-muted-foreground font-medium mb-2">Password must have:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.minLength ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasUppercase ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasLowercase ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasNumber ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loginError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm" data-testid="error-login">
              <p className="text-destructive">{loginError}</p>
              {showResetLink && !isSignup && !resetEmailSent && (
                <button
                  type="button"
                  onClick={handlePasswordResetRequest}
                  className="mt-2 text-primary hover:underline text-xs"
                  data-testid="button-forgot-password"
                  disabled={isLoading}
                >
                  Forgot your password? Click here to reset it.
                </button>
              )}
              {resetEmailSent && (
                <p className="mt-2 text-green-600 text-xs">
                  Password reset email sent. Check your inbox.
                </p>
              )}
            </div>
          )}

          {isSignup && (
            <div className="rounded-md bg-accent/10 p-3 text-sm" data-testid="banner-free-benefits">
              <p className="font-medium text-foreground">Free Account Includes:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Access to premium trend reports</li>
                <li>• Industry insights library</li>
                <li>• Email updates on new research</li>
              </ul>
            </div>
          )}

          <Button
            type="submit"
            data-testid="button-submit-login"
            className="w-full"
            disabled={isLoading || (isSignup && !allRequirementsMet)}
          >
            {isLoading ? "Please wait..." : isSignup ? "Create Free Account" : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              data-testid="button-toggle-signup"
              onClick={() => setIsSignup(!isSignup)}
              className="text-primary hover-elevate active-elevate-2"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
