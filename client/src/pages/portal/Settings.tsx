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
import { User, Building2, Bell, Shield, Users } from "lucide-react";
import PortalLayout from "./PortalLayout";
import { useToast } from "@/hooks/use-toast";
import { INDUSTRY_OPTIONS } from "@shared/access";

export default function Settings() {
  const { toast } = useToast();

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
              <Select defaultValue="Food & Beverage">
                <SelectTrigger id="industry" data-testid="select-industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
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
