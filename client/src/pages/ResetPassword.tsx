import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
    setEmail(params.get("email"));
  }, []);

  const passwordRequirements = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!allRequirementsMet) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password reset successful",
          description: "Signing you in now...",
        });
        
        setIsAutoLogging(true);
        try {
          await login(email, password);
          toast({
            title: "Welcome back!",
            description: "You're now signed in with your new password.",
          });
          setLocation("/portal");
          return;
        } catch (autoLoginErr) {
          setIsAutoLogging(false);
          toast({
            title: "Password reset successful",
            description: "Your password has been updated. Please sign in with your new password.",
          });
        }
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle data-testid="text-reset-error-title">Invalid Reset Link</CardTitle>
            <CardDescription data-testid="text-reset-error-description">
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              {isAutoLogging ? (
                <Loader2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-spin" />
              ) : (
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <CardTitle data-testid="text-reset-success-title">
              {isAutoLogging ? "Signing You In..." : "Password Reset Complete"}
            </CardTitle>
            <CardDescription data-testid="text-reset-success-description">
              {isAutoLogging 
                ? "Your password has been updated. Taking you to your portal now..."
                : "Your password has been successfully reset. Click below to sign in."}
            </CardDescription>
          </CardHeader>
          {!isAutoLogging && (
            <CardContent className="space-y-3">
              <Link href="/">
                <Button className="w-full" data-testid="button-go-signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Sign In
                </Button>
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle data-testid="text-reset-title">Reset Your Password</CardTitle>
          <CardDescription data-testid="text-reset-description">
            Enter your new password below. Make sure it meets all the requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                data-testid="input-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              {password.length > 0 && (
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                data-testid="input-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                  {passwordsMatch ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm" data-testid="error-reset">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              data-testid="button-reset-password"
              className="w-full"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-primary hover:underline" data-testid="link-back-home">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
