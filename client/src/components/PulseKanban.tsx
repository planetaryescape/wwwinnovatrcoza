import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building2, User } from "lucide-react";

const PULSE_INDUSTRIES = [
  { slug: "food", label: "Food" },
  { slug: "bev", label: "Bev" },
  { slug: "financial", label: "Financial" },
  { slug: "beauty", label: "Beauty" },
  { slug: "health", label: "Health" },
  { slug: "other", label: "Other" },
] as const;

type IndustrySlug = "food" | "bev" | "financial" | "beauty" | "health" | "other";
type DropTarget = IndustrySlug | "to-sort";

export interface KanbanCompany {
  id: string;
  name: string;
  pulseIndustry?: string | null;
}

export interface KanbanMember {
  id: string;
  name: string;
  surname?: string | null;
  companyId?: string | null;
  pulseIndustry?: string | null;
}

interface Props {
  companies: KanbanCompany[];
  members: KanbanMember[];
}

type DraggableKind = "company" | "user";

function makeDraggableId(kind: DraggableKind, id: string): string {
  return `${kind}::${id}`;
}

function parseDraggableId(raw: string): { kind: DraggableKind; id: string } {
  const idx = raw.indexOf("::");
  return { kind: raw.slice(0, idx) as DraggableKind, id: raw.slice(idx + 2) };
}

function getIndustryFromDropTarget(target: string): IndustrySlug | null {
  if (target === "to-sort") return null;
  const slug = target.replace(/^(members|companies)::/, "");
  return slug as IndustrySlug;
}

function MemberChip({ member, isBeingDragged }: { member: KanbanMember; isBeingDragged?: boolean }) {
  const fullName = [member.name, member.surname].filter(Boolean).join(" ");
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: makeDraggableId("user", member.id),
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isBeingDragged ? 0.3 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 hover-elevate cursor-grab active:cursor-grabbing text-sm select-none"
      data-testid={`chip-member-${member.id}`}
    >
      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      <span className="truncate">{fullName}</span>
    </div>
  );
}

function CompanyCard({
  company,
  memberNames,
  isBeingDragged,
}: {
  company: KanbanCompany;
  memberNames: string[];
  isBeingDragged?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: makeDraggableId("company", company.id),
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isBeingDragged ? 0.3 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="rounded-md border bg-card/80 p-2 cursor-grab active:cursor-grabbing select-none"
      data-testid={`card-company-${company.id}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium truncate">{company.name}</span>
      </div>
      {memberNames.length > 0 && (
        <div className="pl-4 space-y-0.5">
          {memberNames.map((n, i) => (
            <p key={i} className="text-xs text-muted-foreground truncate">
              {n}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function DropZone({
  id,
  isOver,
  label,
  children,
  empty,
}: {
  id: string;
  isOver: boolean;
  label: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[48px] rounded-md border-2 border-dashed transition-colors p-1.5 ${
        isOver ? "border-primary/50 bg-primary/5" : "border-border/40 bg-transparent"
      }`}
      data-testid={`dropzone-${id}`}
    >
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 px-0.5">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {children}
        {empty && (
          <p className="text-[11px] text-muted-foreground/50 italic px-1">Empty</p>
        )}
      </div>
    </div>
  );
}

export default function PulseKanban({ companies, members }: Props) {
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<Record<string, IndustrySlug | null>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && (companies.length > 0 || members.length > 0)) {
      initializedRef.current = true;
      const map: Record<string, IndustrySlug | null> = {};
      companies.forEach((c) => {
        map[`company::${c.id}`] = (c.pulseIndustry as IndustrySlug) ?? null;
      });
      members.forEach((m) => {
        map[`user::${m.id}`] = (m.pulseIndustry as IndustrySlug) ?? null;
      });
      setAssignments(map);
    }
  }, [companies, members]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overZoneId, setOverZoneId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const getCompanyIndustry = useCallback(
    (companyId: string): IndustrySlug | null => assignments[`company::${companyId}`] ?? null,
    [assignments]
  );

  const getMembersForCompany = useCallback(
    (companyId: string) => members.filter((m) => m.companyId === companyId),
    [members]
  );

  const fullName = (m: KanbanMember) => [m.name, m.surname].filter(Boolean).join(" ");

  async function persistChange(kind: DraggableKind, id: string, industry: IndustrySlug | null) {
    try {
      const endpoint =
        kind === "company"
          ? `/api/admin/companies/${id}/pulse-industry`
          : `/api/admin/users/${id}/pulse-industry`;
      await apiRequest("PATCH", endpoint, { industry });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch {
      toast({
        title: "Failed to save",
        description: "Could not update industry assignment.",
        variant: "destructive",
      });
    }
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  function handleDragOver(e: DragOverEvent) {
    setOverZoneId((e.over?.id as string) ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    setOverZoneId(null);
    const { active, over } = e;
    if (!over) return;

    const draggableKey = active.id as string;
    const { kind, id } = parseDraggableId(draggableKey);
    const newIndustry = getIndustryFromDropTarget(over.id as string);
    const prevIndustry = assignments[draggableKey] ?? null;

    if (prevIndustry === newIndustry) return;

    setAssignments((prev) => ({ ...prev, [draggableKey]: newIndustry }));
    persistChange(kind, id, newIndustry);
  }

  const sortedCompanies = [...companies].sort((a, b) => a.name.localeCompare(b.name));
  const sortedMembers = [...members].sort((a, b) => fullName(a).localeCompare(fullName(b)));

  function companiesInSlug(slug: IndustrySlug | null) {
    return sortedCompanies.filter((c) => (assignments[`company::${c.id}`] ?? null) === slug);
  }

  function independentMembersInSlug(slug: IndustrySlug | null) {
    return sortedMembers.filter((m) => {
      if (m.companyId) {
        const compIndustry = getCompanyIndustry(m.companyId);
        if (compIndustry !== null) return false;
      }
      return (assignments[`user::${m.id}`] ?? null) === slug;
    });
  }

  const activeItem = activeId ? parseDraggableId(activeId) : null;
  const activeCompany = activeItem?.kind === "company" ? companies.find((c) => c.id === activeItem.id) : null;
  const activeMember = activeItem?.kind === "user" ? members.find((m) => m.id === activeItem.id) : null;

  const toSortCompanies = companiesInSlug(null);
  const toSortMembers = independentMembersInSlug(null);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            To Sort
          </p>
          <DropZone
            id="to-sort"
            label=""
            isOver={overZoneId === "to-sort"}
            empty={toSortCompanies.length === 0 && toSortMembers.length === 0}
          >
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {toSortCompanies.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  memberNames={getMembersForCompany(c.id).map(fullName)}
                  isBeingDragged={activeId === makeDraggableId("company", c.id)}
                />
              ))}
              {toSortMembers.map((m) => (
                <MemberChip
                  key={m.id}
                  member={m}
                  isBeingDragged={activeId === makeDraggableId("user", m.id)}
                />
              ))}
            </div>
          </DropZone>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PULSE_INDUSTRIES.map(({ slug, label }) => {
            const colCompanies = companiesInSlug(slug);
            const colMembers = independentMembersInSlug(slug);
            const membersZoneId = `members::${slug}`;
            const companiesZoneId = `companies::${slug}`;

            return (
              <div key={slug} className="flex flex-col gap-2" data-testid={`column-${slug}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <DropZone
                  id={membersZoneId}
                  label="Members"
                  isOver={overZoneId === membersZoneId}
                  empty={colMembers.length === 0}
                >
                  {colMembers.map((m) => (
                    <MemberChip
                      key={m.id}
                      member={m}
                      isBeingDragged={activeId === makeDraggableId("user", m.id)}
                    />
                  ))}
                </DropZone>
                <DropZone
                  id={companiesZoneId}
                  label="Companies"
                  isOver={overZoneId === companiesZoneId}
                  empty={colCompanies.length === 0}
                >
                  {colCompanies.map((c) => (
                    <CompanyCard
                      key={c.id}
                      company={c}
                      memberNames={getMembersForCompany(c.id).map(fullName)}
                      isBeingDragged={activeId === makeDraggableId("company", c.id)}
                    />
                  ))}
                </DropZone>
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCompany && (
          <div className="rounded-md border bg-card shadow-md p-2 opacity-95 w-36">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{activeCompany.name}</span>
            </div>
          </div>
        )}
        {activeMember && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted shadow-md text-sm opacity-95">
            <User className="w-3 h-3 text-muted-foreground" />
            <span>{fullName(activeMember)}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
