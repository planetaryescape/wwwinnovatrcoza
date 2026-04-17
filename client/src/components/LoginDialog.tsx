import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Check, X } from "lucide-react";
import innovatrLogo from "@assets/Innovatr_logo-01_for_light_1774947393282.png";

const BRAND = {
  violet: "#3A2FBF",
  coral: "#E8503A",
  offWhite: "#F8F7F4",
  dark: "#0D0B1F",
};

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
  const [, setLocation] = useLocation();

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
  const allRequirementsMet =
    Object.values(passwordRequirements).every(Boolean) &&
    isValidEmail &&
    company.trim().length > 0 &&
    resolvedIndustry.trim().length > 0 &&
    name.trim().length > 0 &&
    surname.trim().length > 0;

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
        toast({ title: "Reset email sent", description: "Check your inbox for password reset instructions." });
      } else {
        toast({ title: "Could not send reset email", description: "Please check your email address and try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not send reset email. Please try again later.", variant: "destructive" });
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
        toast({ title: "Welcome to Innovatr!", description: "Your free account has been created. Explore your portal now." });
        setLoginAttempts(0);
      } else {
        await login(email, password);
        toast({ title: "Welcome back!", description: "You've successfully logged in." });
        setLoginAttempts(0);
      }
      onOpenChange(false);
      setTimeout(() => { setLocation(returnTo ?? "/portal"); }, 100);
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
        setLoginError(error?.message || "Could not create account. Please try again.");
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

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: BRAND.dark,
    background: BRAND.offWhite,
    border: `1.5px solid ${BRAND.dark}18`,
    borderRadius: 8,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: `${BRAND.dark}99`,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isSignup ? "sm:max-w-lg max-h-[90vh] overflow-y-auto" : "sm:max-w-md"}
        style={{ background: BRAND.offWhite, display: "block", padding: "36px 36px 32px" }}
        data-testid="dialog-login"
      >
        {/* Logo */}
        <div style={{ marginBottom: 22 }}>
          <img src={innovatrLogo} alt="Innovatr" style={{ height: 24, width: "auto" }} />
        </div>

        {/* Heading */}
        <DialogTitle
          data-testid="text-login-title"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.45rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: BRAND.dark,
            lineHeight: 1.2,
            margin: "0 0 7px",
          }}
        >
          {isSignup ? "Create a free account" : "Sign in to your portal"}
        </DialogTitle>
        <DialogDescription
          data-testid="text-login-description"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: `${BRAND.dark}88`,
            lineHeight: 1.5,
            margin: "0 0 28px",
          }}
        >
          {isSignup
            ? "Join leading brands using Innovatr to make smarter decisions, faster."
            : "Access your portal and continue your research journey."}
        </DialogDescription>

        <form onSubmit={handleSubmit}>
          {/* Signup-only: name + surname */}
          {isSignup && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label htmlFor="ld-name" style={labelStyle} data-testid="label-name">First Name</label>
                  <input
                    id="ld-name"
                    data-testid="input-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    required
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label htmlFor="ld-surname" style={labelStyle} data-testid="label-surname">Surname</label>
                  <input
                    id="ld-surname"
                    data-testid="input-surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Surname"
                    required
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label htmlFor="ld-company" style={labelStyle} data-testid="label-company">Company Name</label>
                <input
                  id="ld-company"
                  data-testid="input-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  required
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="ld-email" style={labelStyle} data-testid="label-email">
              {isSignup ? "Company Email" : "Email Address"}
            </label>
            <input
              id="ld-email"
              data-testid="input-email"
              type="email"
              autoComplete={isSignup ? "email" : "username email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={fieldStyle}
            />
            {isSignup && email.length > 0 && !isValidEmail && (
              <div
                style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: `${BRAND.dark}77` }}
                data-testid="email-validation"
              >
                <X className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
                <span>Please enter a valid email address</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: isSignup ? 14 : 16 }}>
            <label htmlFor="ld-password" style={labelStyle} data-testid="label-password">
              {isSignup ? "Create Password" : "Password"}
            </label>
            <input
              id="ld-password"
              data-testid="input-password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Create a secure password" : "Enter password"}
              required
              style={fieldStyle}
            />
            {isSignup && password.length > 0 && (
              <div
                style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}
                data-testid="password-requirements"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: passwordRequirements.minLength ? "#16a34a" : `${BRAND.dark}55` }}>
                  {passwordRequirements.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>8+ characters</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: passwordRequirements.hasUppercase ? "#16a34a" : `${BRAND.dark}55` }}>
                  {passwordRequirements.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Uppercase</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: passwordRequirements.hasLowercase ? "#16a34a" : `${BRAND.dark}55` }}>
                  {passwordRequirements.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Lowercase</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: passwordRequirements.hasNumber ? "#16a34a" : `${BRAND.dark}55` }}>
                  {passwordRequirements.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Number</span>
                </div>
              </div>
            )}
          </div>

          {/* Signup-only: industry + referral + checkboxes */}
          {isSignup && (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle} data-testid="label-industry">Industry</label>
                <Select value={industry} onValueChange={(v) => { setIndustry(v); if (v !== "Other") setCustomIndustry(""); }}>
                  <SelectTrigger
                    data-testid="select-industry"
                    style={{ ...fieldStyle, height: "auto", display: "flex", alignItems: "center" }}
                  >
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {industry === "Other" && (
                  <input
                    data-testid="input-custom-industry"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="Enter your industry"
                    required
                    style={{ ...fieldStyle, marginTop: 8 }}
                  />
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle} data-testid="label-referral">How did you hear about us?</label>
                <Select value={referralSource} onValueChange={setReferralSource}>
                  <SelectTrigger
                    data-testid="select-referral"
                    style={{ ...fieldStyle, height: "auto", display: "flex", alignItems: "center" }}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Checkbox
                    id="ld-newsletter"
                    data-testid="checkbox-newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={(checked) => setSubscribeNewsletter(checked === true)}
                    style={{ marginTop: 1, flexShrink: 0 }}
                  />
                  <label htmlFor="ld-newsletter" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: `${BRAND.dark}cc`, lineHeight: 1.45, cursor: "pointer" }}>
                    Sign me up for Pulse Insights (free bi-weekly trends & research)
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Checkbox
                    id="ld-wants-contact"
                    data-testid="checkbox-contact"
                    checked={wantsContact}
                    onCheckedChange={(checked) => setWantsContact(checked === true)}
                    style={{ marginTop: 1, flexShrink: 0 }}
                  />
                  <label htmlFor="ld-wants-contact" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: `${BRAND.dark}cc`, lineHeight: 1.45, cursor: "pointer" }}>
                    I'd like to be contacted to learn more about Innovatr
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {loginError && (
            <div
              style={{ background: `${BRAND.coral}12`, border: `1px solid ${BRAND.coral}35`, borderRadius: 8, padding: "12px 16px", marginBottom: 14, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: BRAND.coral }}
              data-testid="error-login"
            >
              {loginError}
              {resetEmailSent && (
                <p style={{ marginTop: 8, color: "#16a34a", fontSize: 12, margin: "8px 0 0" }} data-testid="text-reset-sent">
                  Password reset email sent. Check your inbox for a link to create a new password.
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            data-testid="button-submit-login"
            disabled={isLoading || (isSignup && !allRequirementsMet)}
            style={{
              width: "100%",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: isLoading || (isSignup && !allRequirementsMet) ? `${BRAND.violet}70` : BRAND.violet,
              border: "none",
              borderRadius: 10,
              padding: "15px 0",
              cursor: isLoading || (isSignup && !allRequirementsMet) ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              letterSpacing: "0.01em",
              marginBottom: 12,
            }}
          >
            {isLoading ? "Please wait…" : isSignup ? "Create Free Account" : "Sign In"}
          </button>

          {/* Forgot password */}
          {!isSignup && (
            <div style={{ textAlign: "center", marginBottom: 8 }} data-testid="forgot-password-section">
              {!resetEmailSent ? (
                <button
                  type="button"
                  onClick={handlePasswordResetRequest}
                  data-testid="button-forgot-password"
                  disabled={isLoading}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: `${BRAND.dark}66`, padding: 0, transition: "color 0.2s" }}
                >
                  Forgot your password?
                </button>
              ) : (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#16a34a", margin: 0 }} data-testid="text-reset-confirmation">
                  Reset link sent. Check your inbox.
                </p>
              )}
            </div>
          )}

          {/* Toggle signup / login */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              data-testid="button-toggle-signup"
              onClick={() => setIsSignup(!isSignup)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: BRAND.violet, fontWeight: 500, padding: 0 }}
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
