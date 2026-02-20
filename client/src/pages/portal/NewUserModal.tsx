import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserMinus } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface NewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NewUserModal({
  open,
  onOpenChange,
  onSuccess,
}: NewUserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "independent", // "independent" means no company
    memberType: "independent", // "independent" or "companyUser"
    membershipTier: "STARTER",
    role: "MEMBER",
    status: "ACTIVE",
    creditsBasic: 0,
    creditsPro: 0,
  });

  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes("credits") ? parseInt(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "companyId") {
      // When company changes, update memberType accordingly
      setFormData({
        ...formData,
        companyId: value,
        memberType: value === "independent" ? "independent" : "companyUser",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Find company name if a company is selected
      const selectedCompany = formData.companyId !== "independent" 
        ? companies.find(c => c.id === formData.companyId)
        : null;
      
      const userData = {
        username: formData.email.split("@")[0],
        email: formData.email,
        password: Math.random().toString(36).slice(-10),
        name: formData.name || null,
        company: selectedCompany?.name || null,
        companyId: formData.companyId !== "independent" ? formData.companyId : null,
        membershipTier: formData.membershipTier,
        memberType: formData.memberType,
        role: formData.role,
        status: formData.status,
        creditsBasic: formData.creditsBasic,
        creditsPro: formData.creditsPro,
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: "Success",
        description: "New user created successfully",
      });

      setFormData({
        name: "",
        email: "",
        companyId: "independent",
        memberType: "independent",
        membershipTier: "STARTER",
        role: "MEMBER",
        status: "ACTIVE",
        creditsBasic: 0,
        creditsPro: 0,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>Create a new user account</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., John Smith"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john@company.com"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={formData.companyId}
                onValueChange={(val) => handleSelectChange("companyId", val)}
              >
                <SelectTrigger data-testid="select-company">
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">
                    <div className="flex items-center gap-2">
                      <UserMinus className="w-4 h-4 text-muted-foreground" />
                      <span>Independent</span>
                    </div>
                  </SelectItem>
                  {[...companies].sort((a, b) => a.name.localeCompare(b.name)).map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipTier">Membership Tier</Label>
              <Select
                value={formData.membershipTier}
                onValueChange={(val) => handleSelectChange("membershipTier", val)}
              >
                <SelectTrigger data-testid="select-membership-tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="GROWTH">Growth</SelectItem>
                  <SelectItem value="SCALE">Scale</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => handleSelectChange("role", val)}
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="DEAL_ADMIN">Deal Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleSelectChange("status", val)}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditsBasic">Basic Credits</Label>
              <Input
                id="creditsBasic"
                name="creditsBasic"
                type="number"
                value={formData.creditsBasic}
                onChange={handleChange}
                data-testid="input-credits-basic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditsPro">Pro Credits</Label>
              <Input
                id="creditsPro"
                name="creditsPro"
                type="number"
                value={formData.creditsPro}
                onChange={handleChange}
                data-testid="input-credits-pro"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="button-submit">
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
