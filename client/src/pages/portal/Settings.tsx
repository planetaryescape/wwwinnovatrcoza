import { useState, useMemo, useEffect } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Building2, Bell, Shield, Users, Check, X, AlertTriangle, Loader2 } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { INDUSTRY_OPTIONS } from "@shared/access";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
  membershipTier: string;
  role: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { user, isViewingAsCompany } = useAuth();

  useEffect(() => {
    logActivity("view_settings");
  }, []);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("Food & Beverage");
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          const nameParts = (data.name || "").split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
          setCompanyName(data.company || "");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password requirements validation
  const passwordRequirements = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
    };
  }, [newPassword]);

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSaveProfile = () => {
    if (isViewingAsCompany) {
      toast({
        title: "Cannot Save",
        description: "Settings cannot be changed while viewing as a company.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSavePreferences = () => {
    if (isViewingAsCompany) {
      toast({
        title: "Cannot Save",
        description: "Settings cannot be changed while viewing as a company.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (isViewingAsCompany) {
      setPasswordError("Password cannot be changed while viewing as a company.");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!allRequirementsMet) {
      setPasswordError("Please ensure your new password meets all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setShowPasswordDialog(false);
        resetPasswordForm();
      } else {
        setPasswordError(data.error || "Failed to change password. Please try again.");
      }
    } catch (err) {
      setPasswordError("An error occurred. Please try again later.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">Settings</h1>
          <p className="text-lg text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        {isViewingAsCompany && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You are currently viewing as a company. Settings changes are disabled during impersonation mode.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal and company details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isViewingAsCompany}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isViewingAsCompany}
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                data-testid="input-email"
              />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>Company Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isViewingAsCompany}
                  data-testid="input-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  disabled={isViewingAsCompany}
                  data-testid="input-job-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={isViewingAsCompany}>
                <SelectTrigger id="industry" data-testid="select-industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps us personalize trend recommendations
              </p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={isViewingAsCompany}
              data-testid="button-save-profile"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control what updates you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newReports">New Industry Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new trend reports are available
                </p>
              </div>
              <Switch id="newReports" defaultChecked data-testid="switch-new-reports" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="creditReminders">Credit Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts when credits are running low or expiring
                </p>
              </div>
              <Switch id="creditReminders" defaultChecked data-testid="switch-credit-reminders" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="studyComplete">Study Completion</Label>
                <p className="text-sm text-muted-foreground">
                  Email when your research studies are ready
                </p>
              </div>
              <Switch id="studyComplete" defaultChecked data-testid="switch-study-complete" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deals">Member Offers & Promotions</Label>
                <p className="text-sm text-muted-foreground">
                  Exclusive discounts and limited-time promotions
                </p>
              </div>
              <Switch id="deals" defaultChecked data-testid="switch-deals" />
            </div>

            <Button 
              onClick={handleSavePreferences}
              disabled={isViewingAsCompany}
              data-testid="button-save-preferences"
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Team Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Access
            </CardTitle>
            <CardDescription>
              Manage who can access your Innovatr account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{profile?.email || "—"}</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={isViewingAsCompany}
              data-testid="button-invite-team"
            >
              Invite Team Member
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              data-testid="button-change-password"
              disabled={isViewingAsCompany}
              onClick={() => {
                resetPasswordForm();
                setShowPasswordDialog(true);
              }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) resetPasswordForm();
      }}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-change-password">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                data-testid="input-current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                data-testid="input-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              {newPassword.length > 0 && (
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
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

            {passwordError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm" data-testid="error-change-password">
                <p className="text-destructive">{passwordError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
                data-testid="button-cancel-password"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-testid="button-submit-password"
                className="flex-1"
                disabled={isChangingPassword || !currentPassword || !allRequirementsMet || !passwordsMatch}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
