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
import { Pencil, Plus, Trash2, Loader2, Target, Lightbulb, Rocket, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaseStudy {
  id: string;
  slug: string;
  client: string;
  industry: string;
  headline: string;
  problemShort: string;
  problem: string;
  process: string;
  results: string;
  phases: string[];
  duration: string;
  highlight: string;
  bgColor: string;
  gifAsset: string;
  sortOrder: number;
  isActive: boolean;
}

interface CaseStudyFormValues {
  slug: string;
  client: string;
  industry: string;
  headline: string;
  problemShort: string;
  problem: string;
  process: string;
  results: string;
  phaseStrategy: boolean;
  phaseInnovation: boolean;
  phaseExecution: boolean;
  duration: string;
  highlight: string;
  bgColor: string;
  gifAsset: "cooking" | "airplanes" | "pen" | "default";
  sortOrder: number;
  isActive: boolean;
}

const PHASE_ICONS: Record<string, typeof Target> = {
  strategy: Target,
  innovation: Lightbulb,
  execution: Rocket,
};

export default function AdminCaseStudies() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCs, setEditingCs] = useState<CaseStudy | null>(null);
  const [deletingCs, setDeletingCs] = useState<CaseStudy | null>(null);

  const { data: caseStudies = [], isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/admin/case-studies"],
  });

  const { register, handleSubmit, control, reset } = useForm<CaseStudyFormValues>({
    defaultValues: {
      isActive: true,
      sortOrder: 0,
      bgColor: "#F5F5F5",
      gifAsset: "default",
      phaseStrategy: false,
      phaseInnovation: false,
      phaseExecution: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/case-studies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      setDialogOpen(false);
      toast({ title: "Case study created" });
    },
    onError: () => toast({ title: "Failed to create case study", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/admin/case-studies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      setDialogOpen(false);
      toast({ title: "Case study updated" });
    },
    onError: () => toast({ title: "Failed to update case study", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/case-studies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      setDeletingCs(null);
      toast({ title: "Case study deleted" });
    },
    onError: () => toast({ title: "Failed to delete case study", variant: "destructive" }),
  });

  const openNew = () => {
    setEditingCs(null);
    reset({
      slug: "",
      client: "",
      industry: "",
      headline: "",
      problemShort: "",
      problem: "",
      process: "",
      results: "",
      phaseStrategy: false,
      phaseInnovation: false,
      phaseExecution: false,
      duration: "",
      highlight: "",
      bgColor: "#F5F5F5",
      gifAsset: "default",
      sortOrder: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (cs: CaseStudy) => {
    setEditingCs(cs);
    reset({
      slug: cs.slug,
      client: cs.client,
      industry: cs.industry,
      headline: cs.headline,
      problemShort: cs.problemShort,
      problem: cs.problem,
      process: cs.process,
      results: cs.results,
      phaseStrategy: cs.phases.includes("strategy"),
      phaseInnovation: cs.phases.includes("innovation"),
      phaseExecution: cs.phases.includes("execution"),
      duration: cs.duration,
      highlight: cs.highlight,
      bgColor: cs.bgColor,
      gifAsset: cs.gifAsset as any,
      sortOrder: cs.sortOrder,
      isActive: cs.isActive,
    });
    setDialogOpen(true);
  };

  const onToggle = (cs: CaseStudy) => {
    updateMutation.mutate({ id: cs.id, data: { isActive: !cs.isActive } });
  };

  const onSubmit = (values: CaseStudyFormValues) => {
    const phases: string[] = [];
    if (values.phaseStrategy) phases.push("strategy");
    if (values.phaseInnovation) phases.push("innovation");
    if (values.phaseExecution) phases.push("execution");

    const payload = {
      slug: values.slug,
      client: values.client,
      industry: values.industry,
      headline: values.headline,
      problemShort: values.problemShort,
      problem: values.problem,
      process: values.process,
      results: values.results,
      phases,
      duration: values.duration,
      highlight: values.highlight,
      bgColor: values.bgColor || "#F5F5F5",
      gifAsset: values.gifAsset,
      sortOrder: Number(values.sortOrder) || 0,
      isActive: values.isActive,
    };

    if (editingCs) {
      updateMutation.mutate({ id: editingCs.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-1">Case Studies</h2>
          <p className="text-muted-foreground">Manage the case studies shown on the public Consult page.</p>
        </div>
        <Button onClick={openNew} data-testid="button-new-case-study">
          <Plus className="w-4 h-4 mr-2" />
          New Case Study
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : caseStudies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No case studies yet. Create one with the button above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {[...caseStudies].sort((a, b) => a.sortOrder - b.sortOrder).map(cs => (
            <Card key={cs.id} data-testid={`card-case-study-${cs.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cs.bgColor + "40" }}
                    >
                      <BookOpen className="w-4 h-4" style={{ color: cs.bgColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm" data-testid={`text-cs-client-${cs.id}`}>{cs.client}</p>
                        <Badge variant="outline" className="text-xs">{cs.industry}</Badge>
                        <Badge variant={cs.isActive ? "default" : "secondary"} data-testid={`badge-cs-status-${cs.id}`}>
                          {cs.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cs.headline}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {cs.phases.map(phase => {
                          const Icon = PHASE_ICONS[phase] ?? Target;
                          return (
                            <div key={phase} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon className="w-3 h-3" />
                              <span className="capitalize">{phase}</span>
                            </div>
                          );
                        })}
                        <span className="text-xs text-muted-foreground">{cs.duration}</span>
                        <span className="text-xs font-medium">{cs.highlight}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cs.isActive}
                      onCheckedChange={() => onToggle(cs)}
                      data-testid={`toggle-cs-active-${cs.id}`}
                    />
                    <Button size="icon" variant="ghost" onClick={() => openEdit(cs)} data-testid={`button-edit-cs-${cs.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeletingCs(cs)} data-testid={`button-delete-cs-${cs.id}`}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCs ? "Edit Case Study" : "New Case Study"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Client Name *</Label>
                <Input {...register("client", { required: true })} data-testid="input-cs-client" />
              </div>

              <div className="space-y-1.5">
                <Label>Industry *</Label>
                <Input {...register("industry", { required: true })} data-testid="input-cs-industry" />
              </div>

              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input {...register("slug", { required: true })} placeholder="e.g. discovery-bank" data-testid="input-cs-slug" />
              </div>

              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input {...register("duration")} placeholder="e.g. 70 Days" data-testid="input-cs-duration" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Headline *</Label>
                <Input {...register("headline", { required: true })} data-testid="input-cs-headline" />
              </div>

              <div className="space-y-1.5">
                <Label>Key Result / Highlight</Label>
                <Input {...register("highlight")} placeholder="e.g. 7 Pipeline Projects" data-testid="input-cs-highlight" />
              </div>

              <div className="space-y-1.5">
                <Label>Background Colour</Label>
                <div className="flex gap-2">
                  <Input {...register("bgColor")} placeholder="#F5F5F5" data-testid="input-cs-bgcolor" />
                  <Controller
                    name="bgColor"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="color"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        data-testid="input-cs-bgcolor-picker"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>GIF Asset</Label>
                <Controller
                  name="gifAsset"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger data-testid="select-cs-gif">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cooking">Cooking (Orange)</SelectItem>
                        <SelectItem value="airplanes">Airplanes (Blue)</SelectItem>
                        <SelectItem value="pen">Pen (Warm)</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" {...register("sortOrder")} data-testid="input-cs-sort-order" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Short Problem Summary</Label>
                <Input {...register("problemShort")} placeholder="Shown in list view" data-testid="input-cs-problem-short" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>The Problem</Label>
                <Textarea {...register("problem")} rows={3} data-testid="input-cs-problem" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>The Process</Label>
                <Textarea {...register("process")} rows={3} data-testid="input-cs-process" />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>The Results</Label>
                <Textarea {...register("results")} rows={3} data-testid="input-cs-results" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Phases</Label>
                <div className="flex gap-4 flex-wrap">
                  <Controller
                    name="phaseStrategy"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-cs-phase-strategy" />
                        <span className="text-sm flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Strategy</span>
                      </label>
                    )}
                  />
                  <Controller
                    name="phaseInnovation"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-cs-phase-innovation" />
                        <span className="text-sm flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Innovation</span>
                      </label>
                    )}
                  />
                  <Controller
                    name="phaseExecution"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-cs-phase-execution" />
                        <span className="text-sm flex items-center gap-1"><Rocket className="w-3.5 h-3.5" /> Execution</span>
                      </label>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="toggle-cs-form-active" />
                  )}
                />
                <Label>Active (visible on public page)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-cs">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-cs">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingCs ? "Save Changes" : "Create Case Study"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCs} onOpenChange={open => !open && setDeletingCs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case Study</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{deletingCs?.client}" case study? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-cs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCs && deleteMutation.mutate(deletingCs.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-cs"
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
