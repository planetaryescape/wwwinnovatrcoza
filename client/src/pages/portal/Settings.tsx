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
import { User, Building2, Bell, Shield, Users, Check, X, AlertTriangle, Loader2, BarChart3, Mail, TrendingUp, Activity } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { PortalTabContent, PortalTabs } from "@/components/portal/PortalTabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { INDUSTRY_OPTIONS } from "@shared/access";

const SETTINGS_TAB_VALUES = ["profile", "notifications", "team", "security", "admin"] as const;
type SettingsTab = typeof SETTINGS_TAB_VALUES[number];
const SETTINGS_TABS: { value: SettingsTab; label: string; testId: string; adminOnly?: boolean }[] = [
  { value: "profile", label: "Profile", testId: "tab-settings-profile" },
  { value: "notifications", label: "Notifications", testId: "tab-settings-notifications" },
  { value: "team", label: "Team Access", testId: "tab-settings-team" },
  { value: "security", label: "Security", testId: "tab-settings-security" },
  { value: "admin", label: "Admin", testId: "tab-settings-admin", adminOnly: true },
];

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
  const isAdmin = user?.isAdmin === true;
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(SETTINGS_TAB_VALUES).withDefault("profile"),
  );
  const visibleTabs = useMemo(
    () => SETTINGS_TABS.filter((tab) => !tab.adminOnly || isAdmin),
    [isAdmin],
  );

  useEffect(() => {
    logActivity("view_settings");
  }, []);

  useEffect(() => {
    if (activeTab === "admin" && !isAdmin) void setActiveTab("profile");
  }, [activeTab, isAdmin, setActiveTab]);
  
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
  const { data: adminStats } = useQuery<{
    totalUsers: number;
    activeUsers30d: number;
    totalCompanies: number;
    totalBriefs: number;
    neverLoggedIn: number;
    totalReportViews: number;
  }>({
    queryKey: ["/api/admin/engagement-stats"],
    enabled: isAdmin,
  });

  const [adminPrefs, setAdminPrefs] = useState({
    dailyDigest: true,
    newOrderAlerts: true,
    newUserAlerts: true,
    lowCreditAlerts: true,
  });
  const [savingAdminPrefs, setSavingAdminPrefs] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAdminPrefs = async () => {
      try {
        const res = await fetch("/api/admin/preferences", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAdminPrefs({
            dailyDigest: data.dailyDigest ?? true,
            newOrderAlerts: data.newOrderAlerts ?? true,
            newUserAlerts: data.newUserAlerts ?? true,
            lowCreditAlerts: data.lowCreditAlerts ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin preferences:", err);
      }
    };
    fetchAdminPrefs();
  }, [isAdmin]);

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

  const handleSaveAdminPreferences = async () => {
    if (isViewingAsCompany) {
      toast({
        title: "Cannot Save",
        description: "Settings cannot be changed while viewing as a company.",
        variant: "destructive",
      });
      return;
    }
    setSavingAdminPrefs(true);
    try {
      const res = await fetch("/api/admin/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(adminPrefs),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      const savedPrefs = await res.json();
      setAdminPrefs({
        dailyDigest: savedPrefs.dailyDigest ?? true,
        newOrderAlerts: savedPrefs.newOrderAlerts ?? true,
        newUserAlerts: savedPrefs.newUserAlerts ?? true,
        lowCreditAlerts: savedPrefs.lowCreditAlerts ?? true,
      });
      toast({
        title: "Admin Preferences Saved",
        description: "Your email notification preferences have been updated.",
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not save admin preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingAdminPrefs(false);
    }
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
        <div className="portal-page">
          <div className="portal-page-content flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="portal-page">
        <div className="portal-page-content space-y-6">
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

        <PortalTabs value={activeTab} onValueChange={(tab) => void setActiveTab(tab)} tabs={visibleTabs} barClassName="px-0">
        <PortalTabContent value="profile" className="mt-6">
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
        </PortalTabContent>

        <PortalTabContent value="notifications" className="mt-6">
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
        </PortalTabContent>

        <PortalTabContent value="team" className="mt-6">
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
        </PortalTabContent>

        <PortalTabContent value="security" className="mt-6">
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
        </PortalTabContent>

        <PortalTabContent value="admin" className="mt-6 space-y-6">
        {/* Admin Insights - Only visible to admins */}
        {isAdmin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Platform Insights
                </CardTitle>
                <CardDescription>
                  Quick overview of platform engagement and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border" data-testid="stat-total-users">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total Users</span>
                    </div>
                    <p className="text-2xl font-bold">{adminStats?.totalUsers ?? "..."}</p>
                  </div>
                  <div className="p-4 rounded-lg border" data-testid="stat-active-users">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Active (30d)</span>
                    </div>
                    <p className="text-2xl font-bold">{adminStats?.activeUsers30d ?? "..."}</p>
                  </div>
                  <div className="p-4 rounded-lg border" data-testid="stat-companies">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Companies</span>
                    </div>
                    <p className="text-2xl font-bold">{adminStats?.totalCompanies ?? "..."}</p>
                  </div>
                  <div className="p-4 rounded-lg border" data-testid="stat-briefs">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total Briefs</span>
                    </div>
                    <p className="text-2xl font-bold">{adminStats?.totalBriefs ?? "..."}</p>
                  </div>
                  <div className="p-4 rounded-lg border" data-testid="stat-never-logged-in">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground">Never Logged In</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{adminStats?.neverLoggedIn ?? "..."}</p>
                  </div>
                  <div className="p-4 rounded-lg border" data-testid="stat-report-views">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Report Views</span>
                    </div>
                    <p className="text-2xl font-bold">{adminStats?.totalReportViews ?? "..."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Admin Email Preferences
                </CardTitle>
                <CardDescription>
                  Configure digest emails and notification triggers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dailyDigest">Daily Admin Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a summary of platform activity at 4pm on weekdays
                    </p>
                  </div>
                  <Switch
                    id="dailyDigest"
                    checked={adminPrefs.dailyDigest}
                    onCheckedChange={(checked) => setAdminPrefs(prev => ({ ...prev, dailyDigest: checked }))}
                    data-testid="switch-daily-digest"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newOrderAlerts">New Order Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Instant email when a new order or brief is submitted
                    </p>
                  </div>
                  <Switch
                    id="newOrderAlerts"
                    checked={adminPrefs.newOrderAlerts}
                    onCheckedChange={(checked) => setAdminPrefs(prev => ({ ...prev, newOrderAlerts: checked }))}
                    data-testid="switch-new-order-alerts"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newUserAlerts">New User Signups</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new users register on the platform
                    </p>
                  </div>
                  <Switch
                    id="newUserAlerts"
                    checked={adminPrefs.newUserAlerts}
                    onCheckedChange={(checked) => setAdminPrefs(prev => ({ ...prev, newUserAlerts: checked }))}
                    data-testid="switch-new-user-alerts"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lowCreditAlerts">Low Credit Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when any company drops below 2 remaining credits
                    </p>
                  </div>
                  <Switch
                    id="lowCreditAlerts"
                    checked={adminPrefs.lowCreditAlerts}
                    onCheckedChange={(checked) => setAdminPrefs(prev => ({ ...prev, lowCreditAlerts: checked }))}
                    data-testid="switch-low-credit-alerts"
                  />
                </div>

                <Button 
                  onClick={handleSaveAdminPreferences}
                  disabled={isViewingAsCompany || savingAdminPrefs}
                  data-testid="button-save-admin-preferences"
                >
                  {savingAdminPrefs ? "Saving..." : "Save Admin Preferences"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
        </PortalTabContent>
        </PortalTabs>
        </div>
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
