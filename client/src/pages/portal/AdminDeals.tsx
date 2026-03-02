import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm, Controller } from "react-hook-form";
import { Pencil, Plus, Trash2, Gift, Sparkles, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Deal {
  id: string;
  title: string;
  description: string | null;
  headlineOffer: string | null;
  originalPrice: string | null;
  discountedPrice: string | null;
  discountPercent: number | null;
  creditsIncluded: number;
  dealType: string;
  slotsTotal: number | null;
  slotsRemaining: number | null;
  sortOrder: number;
  targetTierKeys: string[];
  targetUserIds: string[];
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
}

interface DealFormValues {
  title: string;
  description: string;
  headlineOffer: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercent: number;
  creditsIncluded: number;
  dealType: "exclusive_offer" | "perk" | "teaser";
  slotsTotal: string;
  slotsRemaining: string;
  sortOrder: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const DEAL_TYPE_ICONS: Record<string, typeof Gift> = {
  exclusive_offer: Tag,
  perk: Gift,
  teaser: Sparkles,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function toDateInputValue(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

function DealCard({
  deal,
  onEdit,
  onDelete,
  onToggle,
}: {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onToggle: (deal: Deal) => void;
}) {
  const Icon = DEAL_TYPE_ICONS[deal.dealType] ?? Gift;
  return (
    <Card data-testid={`card-deal-${deal.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm" data-testid={`text-deal-title-${deal.id}`}>{deal.title}</p>
                <Badge variant={deal.isActive ? "default" : "secondary"} data-testid={`badge-deal-status-${deal.id}`}>
                  {deal.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {deal.headlineOffer && (
                <p className="text-xs text-muted-foreground mt-0.5">{deal.headlineOffer}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
                {deal.discountedPrice && (
                  <span>
                    R{Number(deal.discountedPrice).toLocaleString()}
                    {deal.originalPrice && (
                      <span className="line-through ml-1 opacity-60">R{Number(deal.originalPrice).toLocaleString()}</span>
                    )}
                  </span>
                )}
                {deal.slotsTotal != null && (
                  <span data-testid={`text-slots-${deal.id}`}>{deal.slotsRemaining ?? deal.slotsTotal} of {deal.slotsTotal} slots remaining</span>
                )}
                <span>From {formatDate(deal.validFrom)}</span>
                {deal.validTo && <span>Until {formatDate(deal.validTo)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={deal.isActive}
              onCheckedChange={() => onToggle(deal)}
              data-testid={`toggle-deal-active-${deal.id}`}
            />
            <Button size="icon" variant="ghost" onClick={() => onEdit(deal)} data-testid={`button-edit-deal-${deal.id}`}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(deal)} data-testid={`button-delete-deal-${deal.id}`}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDeals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/admin/deals"],
  });

  const { register, handleSubmit, control, reset } = useForm<DealFormValues>({
    defaultValues: {
      dealType: "exclusive_offer",
      isActive: true,
      creditsIncluded: 0,
      discountPercent: 0,
      sortOrder: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/deals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
      setDialogOpen(false);
      toast({ title: "Deal created" });
    },
    onError: () => toast({ title: "Failed to create deal", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/admin/deals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
      setDialogOpen(false);
      toast({ title: "Deal updated" });
    },
    onError: () => toast({ title: "Failed to update deal", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deals"] });
      setDeletingDeal(null);
      toast({ title: "Deal deleted" });
    },
    onError: () => toast({ title: "Failed to delete deal", variant: "destructive" }),
  });

  const openNew = () => {
    setEditingDeal(null);
    reset({
      dealType: "exclusive_offer",
      isActive: true,
      creditsIncluded: 0,
      discountPercent: 0,
      sortOrder: 0,
      title: "",
      description: "",
      headlineOffer: "",
      originalPrice: "",
      discountedPrice: "",
      slotsTotal: "",
      slotsRemaining: "",
      validFrom: toDateInputValue(new Date().toISOString()),
      validTo: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setEditingDeal(deal);
    reset({
      title: deal.title,
      description: deal.description ?? "",
      headlineOffer: deal.headlineOffer ?? "",
      originalPrice: deal.originalPrice ?? "",
      discountedPrice: deal.discountedPrice ?? "",
      discountPercent: deal.discountPercent ?? 0,
      creditsIncluded: deal.creditsIncluded,
      dealType: deal.dealType as any,
      slotsTotal: deal.slotsTotal != null ? String(deal.slotsTotal) : "",
      slotsRemaining: deal.slotsRemaining != null ? String(deal.slotsRemaining) : "",
      sortOrder: deal.sortOrder,
      validFrom: toDateInputValue(deal.validFrom),
      validTo: toDateInputValue(deal.validTo),
      isActive: deal.isActive,
    });
    setDialogOpen(true);
  };

  const onToggle = (deal: Deal) => {
    updateMutation.mutate({ id: deal.id, data: { isActive: !deal.isActive } });
  };

  const onSubmit = (values: DealFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      headlineOffer: values.headlineOffer || null,
      originalPrice: values.originalPrice || null,
      discountedPrice: values.discountedPrice || null,
      discountPercent: Number(values.discountPercent) || 0,
      creditsIncluded: Number(values.creditsIncluded) || 0,
      dealType: values.dealType,
      slotsTotal: values.slotsTotal ? Number(values.slotsTotal) : null,
      slotsRemaining: values.slotsRemaining ? Number(values.slotsRemaining) : null,
      sortOrder: Number(values.sortOrder) || 0,
      validFrom: values.validFrom ? new Date(values.validFrom).toISOString() : new Date().toISOString(),
      validTo: values.validTo ? new Date(values.validTo).toISOString() : null,
      isActive: values.isActive,
      targetTierKeys: [],
      targetUserIds: [],
      createdByUserId: user?.id ?? "system",
    };

    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const exclusiveOffers = deals.filter(d => d.dealType === "exclusive_offer");
  const perks = deals.filter(d => d.dealType === "perk");
  const teasers = deals.filter(d => d.dealType === "teaser");
  const isPending = createMutation.isPending || updateMutation.isPending;

  const sections = [
    { label: "Exclusive Offers", icon: Tag, deals: exclusiveOffers },
    { label: "Monthly Perks", icon: Gift, deals: perks },
    { label: "Teasers", icon: Sparkles, deals: teasers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-1">Member Offers</h2>
          <p className="text-muted-foreground">Manage exclusive deals, monthly perks, and upcoming teasers shown to members.</p>
        </div>
        <Button onClick={openNew} data-testid="button-new-deal">
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map(({ label, icon: Icon, deals: sectionDeals }) => (
            <div key={label} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">{label}</h3>
                <Badge variant="secondary">{sectionDeals.length}</Badge>
              </div>
              {sectionDeals.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    No {label.toLowerCase()} yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {[...sectionDeals]
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onEdit={openEdit}
                        onDelete={setDeletingDeal}
                        onToggle={onToggle}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "New Deal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Deal Type</Label>
                <Controller
                  name="dealType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-deal-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exclusive_offer">Exclusive Offer</SelectItem>
                        <SelectItem value="perk">Monthly Perk</SelectItem>
                        <SelectItem value="teaser">Teaser</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Title *</Label>
                <Input {...register("title", { required: true })} data-testid="input-deal-title" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Headline Offer</Label>
                <Input {...register("headlineOffer")} placeholder="e.g. Strategy Workshop + Fieldwork Bundle" data-testid="input-deal-headline" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea {...register("description")} rows={3} data-testid="input-deal-description" />
              </div>

              <div className="space-y-1.5">
                <Label>Original Price (ZAR)</Label>
                <Input type="number" {...register("originalPrice")} placeholder="0" data-testid="input-deal-original-price" />
              </div>

              <div className="space-y-1.5">
                <Label>Discounted Price (ZAR)</Label>
                <Input type="number" {...register("discountedPrice")} placeholder="0" data-testid="input-deal-discounted-price" />
              </div>

              <div className="space-y-1.5">
                <Label>Credits Included</Label>
                <Input type="number" {...register("creditsIncluded")} data-testid="input-deal-credits" />
              </div>

              <div className="space-y-1.5">
                <Label>Discount %</Label>
                <Input type="number" {...register("discountPercent")} data-testid="input-deal-discount-pct" />
              </div>

              <div className="space-y-1.5">
                <Label>Total Slots</Label>
                <Input type="number" {...register("slotsTotal")} placeholder="Leave blank for unlimited" data-testid="input-deal-slots-total" />
              </div>

              <div className="space-y-1.5">
                <Label>Slots Remaining</Label>
                <Input type="number" {...register("slotsRemaining")} placeholder="Leave blank for unlimited" data-testid="input-deal-slots-remaining" />
              </div>

              <div className="space-y-1.5">
                <Label>Valid From *</Label>
                <Input type="date" {...register("validFrom", { required: true })} data-testid="input-deal-valid-from" />
              </div>

              <div className="space-y-1.5">
                <Label>Valid Until</Label>
                <Input type="date" {...register("validTo")} data-testid="input-deal-valid-to" />
              </div>

              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register("sortOrder")} data-testid="input-deal-sort-order" />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-deal-form-active" />
                  )}
                />
                <Label>Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-deal">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-deal">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingDeal ? "Save Changes" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDeal} onOpenChange={open => !open && setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDeal?.title}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-deal">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDeal && deleteMutation.mutate(deletingDeal.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-deal"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
