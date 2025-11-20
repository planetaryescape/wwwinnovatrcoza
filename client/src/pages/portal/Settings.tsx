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
import { Separator } from "@/components/ui/separator";
import { User, Building2, Bell, Shield, Users, Lock } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import LockedFeature from "@/components/LockedFeature";

export default function Settings() {
  const { toast } = useToast();
  const { isMember } = useAuth();
  const [, setLocation] = useLocation();

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  // Free users see locked state
  if (!isMember) {
    return (
      <PortalLayout>
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2">Settings</h1>
              <p className="text-lg text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
            <Badge variant="secondary" className="text-sm" data-testid="badge-members-only">
              Members Only
            </Badge>
          </div>

          {/* Free User Message */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Advanced Settings</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Manage your team members, notification preferences, integrations, and account settings. This feature is exclusive to Innovatr Members.
              </p>
              <div className="flex gap-3 justify-center">
                <Button size="lg" onClick={() => setLocation("/#membership")} data-testid="button-join-membership">
                  Join as a Member
                </Button>
                <Button variant="outline" size="lg" onClick={() => setLocation("/portal/trends")} data-testid="button-view-trends">
                  View Trends Library
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Locked Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LockedFeature title="Team Management" description="Add and manage team members with role-based access control" />
            <LockedFeature title="Advanced Notifications" description="Customize email and push notifications for research updates and insights" />
            <LockedFeature title="API Integrations" description="Connect with your existing tools and workflows via secure API access" />
          </div>
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
                  defaultValue="Richard"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue="Smith"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue="richard@innovatr.co.za"
                data-testid="input-email"
              />
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
                  defaultValue="Innovatr"
                  data-testid="input-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  defaultValue="Innovation Manager"
                  data-testid="input-job-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select defaultValue="beverage">
                <SelectTrigger id="industry" data-testid="select-industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beverage">Food & Beverage</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="financial">Financial Services</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps us personalize trend recommendations
              </p>
            </div>

            <Button onClick={handleSaveProfile} data-testid="button-save-profile">
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
                <Label htmlFor="deals">Member Deals & Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Exclusive discounts and limited-time promotions
                </p>
              </div>
              <Switch id="deals" defaultChecked data-testid="switch-deals" />
            </div>

            <Button onClick={handleSavePreferences} data-testid="button-save-preferences">
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
                <p className="font-medium">richard@innovatr.co.za</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-invite-team">
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
            <Button variant="outline" data-testid="button-change-password">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
