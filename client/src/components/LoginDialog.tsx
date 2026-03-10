import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

const REFERRAL_OPTIONS = [
  "Recommendation",
  "LinkedIn",
  "Word of Mouth",
  "Instagram",
  "Facebook",
  "Email",
  "Google Search",
  "Event / Conference",
  "Other",
];

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSignup?: boolean;
  returnTo?: string;
}

export function LoginDialog({ open, onOpenChange, defaultSignup = false, returnTo }: LoginDialogProps) {
  const [isSignup, setIsSignup] = useState(defaultSignup);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [wantsContact, setWantsContact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (open) {
      setIsSignup(defaultSignup);
    }
  }, [open, defaultSignup]);

  const isValidEmail = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return emailRegex.test(email);
  }, [email]);

  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const resolvedIndustry = industry === "Other" ? customIndustry : industry;
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean) && isValidEmail && company.trim().length > 0 && resolvedIndustry.trim().length > 0 && name.trim().length > 0 && surname.trim().length > 0;

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
        await signup(email, password, name, company, resolvedIndustry, {
          surname,
          referralSource: referralSource || undefined,
          wantsContact,
          subscribeNewsletter,
        });
        toast({
          title: "Welcome to Innovatr!",
          description: "Your free account has been created. Explore your portal now.",
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
      
      onOpenChange(false);
      setTimeout(() => {
        setLocation(returnTo ?? "/portal");
      }, 100);
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (!isSignup) {
        if (newAttempts >= 3) {
          setLoginError("Still having trouble? Try resetting your password using the link below.");
        } else {
          setLoginError("Incorrect email or password. Please check your details and try again.");
        }
      } else {
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
      <DialogContent className={isSignup ? "sm:max-w-lg max-h-[90vh] overflow-y-auto" : "sm:max-w-md"} data-testid="dialog-login">
        <DialogHeader>
          <DialogTitle data-testid="text-login-title" className="text-xl font-serif">
            {isSignup ? "Create a Free Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription data-testid="text-login-description">
            {isSignup
              ? "Join leading brands using Innovatr to make smarter decisions, faster."
              : "Access your portal and continue your research journey."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" data-testid="label-name">First Name</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="surname" data-testid="label-surname">Surname</Label>
                  <Input
                    id="surname"
                    data-testid="input-surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Surname"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" data-testid="label-company">Company Name</Label>
                <Input
                  id="company"
                  data-testid="input-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" data-testid="label-email">
              {isSignup ? "Company Email" : "Email Address"}
            </Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              autoComplete={isSignup ? "email" : "username email"}
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" data-testid="label-password">
              {isSignup ? "Create Password" : "Password"}
            </Label>
            <Input
              id="password"
              data-testid="input-password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Create a secure password" : "Enter password"}
              required
            />
            {isSignup && password.length > 0 && (
              <div className="mt-1.5 space-y-1 text-xs" data-testid="password-requirements">
                <div className="grid grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1 ${passwordRequirements.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {passwordRequirements.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isSignup && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="industry" data-testid="label-industry">Industry</Label>
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

              <div className="space-y-1.5">
                <Label htmlFor="referral" data-testid="label-referral">How did you hear about us?</Label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger data-testid="select-referral">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="newsletter"
                    data-testid="checkbox-newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={(checked) => setSubscribeNewsletter(checked === true)}
                  />
                  <label htmlFor="newsletter" className="text-sm leading-tight cursor-pointer">
                    Sign me up for Pulse Insights (free bi-weekly trends & research)
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="wantsContact"
                    data-testid="checkbox-contact"
                    checked={wantsContact}
                    onCheckedChange={(checked) => setWantsContact(checked === true)}
                  />
                  <label htmlFor="wantsContact" className="text-sm leading-tight cursor-pointer">
                    I'd like to be contacted to learn more about Innovatr
                  </label>
                </div>
              </div>
            </>
          )}

          {loginError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm" data-testid="error-login">
              <p className="text-destructive">{loginError}</p>
              {resetEmailSent && (
                <p className="mt-2 text-green-600 text-xs" data-testid="text-reset-sent">
                  Password reset email sent. Check your inbox for a link to create a new password.
                </p>
              )}
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

          {!isSignup && (
            <div className="text-center" data-testid="forgot-password-section">
              {!resetEmailSent ? (
                <button
                  type="button"
                  onClick={handlePasswordResetRequest}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
                  data-testid="button-forgot-password"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              ) : (
                <p className="text-sm text-green-600" data-testid="text-reset-confirmation">
                  Reset link sent. Check your inbox.
                </p>
              )}
            </div>
          )}

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
