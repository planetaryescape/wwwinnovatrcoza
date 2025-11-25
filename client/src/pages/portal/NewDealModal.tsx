import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface NewDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  users?: any[];
}

export default function NewDealModal({
  open,
  onOpenChange,
  onSuccess,
  users = [],
}: NewDealModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    headlineOffer: "",
    originalPrice: 0,
    discountedPrice: 0,
    creditsIncluded: 0,
    targetTiers: [] as string[],
    targetUserIds: [] as string[],
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
    isActive: true,
  });

  const discountPercent = useMemo(() => {
    if (formData.originalPrice && formData.discountedPrice) {
      return Math.round(
        ((formData.originalPrice - formData.discountedPrice) /
          formData.originalPrice) *
          100
      );
    }
    return 0;
  }, [formData.originalPrice, formData.discountedPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
            ? (e.target as any).checked
            : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleTier = (tier: string) => {
    setFormData({
      ...formData,
      targetTiers: formData.targetTiers.includes(tier)
        ? formData.targetTiers.filter((t) => t !== tier)
        : [...formData.targetTiers, tier],
    });
  };

  const toggleUser = (userId: string) => {
    setFormData({
      ...formData,
      targetUserIds: formData.targetUserIds.includes(userId)
        ? formData.targetUserIds.filter((u) => u !== userId)
        : [...formData.targetUserIds, userId],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.headlineOffer) {
      toast({
        title: "Validation Error",
        description: "Title and headline offer are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dealData = {
        title: formData.title,
        description: formData.description || null,
        headlineOffer: formData.headlineOffer,
        originalPrice: formData.originalPrice || null,
        discountedPrice: formData.discountedPrice || null,
        discountPercent: discountPercent,
        creditsIncluded: formData.creditsIncluded,
        targetTierKeys: formData.targetTiers,
        targetUserIds: formData.targetUserIds,
        createdByUserId: user?.id || "",
        validFrom: new Date(formData.validFrom),
        validTo: formData.validTo ? new Date(formData.validTo) : null,
        isActive: formData.isActive,
      };

      const res = await fetch("/api/admin/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({
        title: "Success",
        description: "Deal created successfully",
      });

      setFormData({
        title: "",
        description: "",
        headlineOffer: "",
        originalPrice: 0,
        discountedPrice: 0,
        creditsIncluded: 0,
        targetTiers: [],
        targetUserIds: [],
        validFrom: new Date().toISOString().split("T")[0],
        validTo: "",
        isActive: true,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create deal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
          <DialogDescription>Create a new promotional deal for members</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spring Bundle"
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headlineOffer">Headline Offer *</Label>
              <Input
                id="headlineOffer"
                name="headlineOffer"
                value={formData.headlineOffer}
                onChange={handleChange}
                placeholder="e.g., 3 Basic for R40k"
                data-testid="input-headline"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the deal"
              className="h-20"
              data-testid="textarea-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price (R)</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                data-testid="input-original-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountedPrice">Discounted Price (R)</Label>
              <Input
                id="discountedPrice"
                name="discountedPrice"
                type="number"
                value={formData.discountedPrice}
                onChange={handleChange}
                data-testid="input-discounted-price"
              />
            </div>

            <div className="space-y-2">
              <Label>Discount</Label>
              <div className="flex items-center justify-center h-10 bg-muted rounded-md">
                <span className="text-sm font-semibold">{discountPercent}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditsIncluded">Credits Included</Label>
            <Input
              id="creditsIncluded"
              name="creditsIncluded"
              type="number"
              value={formData.creditsIncluded}
              onChange={handleChange}
              data-testid="input-credits"
            />
          </div>

          <div className="space-y-3">
            <Label>Target Membership Tiers</Label>
            <div className="flex gap-4">
              {["STARTER", "GROWTH", "SCALE"].map((tier) => (
                <div key={tier} className="flex items-center gap-2">
                  <Checkbox
                    id={`tier-${tier}`}
                    checked={formData.targetTiers.includes(tier)}
                    onCheckedChange={() => toggleTier(tier)}
                    data-testid={`checkbox-tier-${tier}`}
                  />
                  <Label htmlFor={`tier-${tier}`} className="font-normal cursor-pointer">
                    {tier}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {users.length > 0 && (
            <div className="space-y-2">
              <Label>Target Specific Users</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={formData.targetUserIds.includes(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                      data-testid={`checkbox-user-${user.id}`}
                    />
                    <Label
                      htmlFor={`user-${user.id}`}
                      className="font-normal cursor-pointer text-sm"
                    >
                      {user.name || user.email}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                name="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={handleChange}
                data-testid="input-valid-from"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To (optional)</Label>
              <Input
                id="validTo"
                name="validTo"
                type="date"
                value={formData.validTo}
                onChange={handleChange}
                data-testid="input-valid-to"
              />
            </div>

            <div className="space-y-2 flex items-end pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: Boolean(checked) })
                  }
                  data-testid="checkbox-active"
                />
                <Label htmlFor="isActive" className="font-normal cursor-pointer">
                  Active
                </Label>
              </div>
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
              {loading ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
