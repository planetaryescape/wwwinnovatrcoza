import { useState } from "react";
import { useDigConcepts } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  joy: "#2A9E5C",
  trust: "#3B82F6",
  anticipation: "#F59E0B",
  surprise: "#8B5CF6",
  fear: "#EF4444",
  sadness: "#6B7280",
  disgust: "#DC2626",
  anger: "#B91C1C",
};

interface Props {
  studyId: string;
}

export default function ConceptDetailPanel({ studyId }: Props) {
  const { data: concepts, isLoading, error } = useDigConcepts(studyId);
  const [selectedId, setSelectedId] = useState<string>("");

  const selected = concepts?.find((c) => c.id === selectedId) || concepts?.[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Concept Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Concept Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-concepts-error">
            Failed to load concept data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!concepts || concepts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Concept Details</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-concepts-empty">
            No concept data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const emotionData = selected
    ? Object.entries(selected.emotions).map(([key, val]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: val,
        fill: EMOTION_COLORS[key] || "#9CA3AF",
      }))
    : [];

  const agreementGroups = selected
    ? Object.entries(selected.agreement).map(([group, questions]) => ({
        group,
        questions: Object.entries(questions).map(([q, val]) => ({ question: q, value: val })),
      }))
    : [];

  return (
    <Card data-testid="card-concept-detail">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Concept Details</CardTitle>
        {concepts.length > 1 && (
          <Select
            value={selected?.id || ""}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="w-56" data-testid="select-concept">
              <SelectValue placeholder="Select concept" />
            </SelectTrigger>
            <SelectContent>
              {concepts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {selected && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {selected.idea_score != null && (
                <Badge variant="secondary">Idea: {selected.idea_score}%</Badge>
              )}
              {selected.interest_score != null && (
                <Badge variant="secondary">Interest: {selected.interest_score}%</Badge>
              )}
              {selected.commitment_score != null && (
                <Badge variant="secondary">Commitment: {selected.commitment_score}%</Badge>
              )}
            </div>

            {emotionData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Emotions</h4>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v}%`, "Score"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28}>
                        {emotionData.map((e, i) => (
                          <rect key={i} fill={e.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {agreementGroups.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Agreement by Question Group</h4>
                {agreementGroups.map((g) => (
                  <div key={g.group} className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">{g.group}</p>
                    <div style={{ height: Math.max(150, g.questions.length * 35) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={g.questions}
                          layout="vertical"
                          margin={{ left: 10, right: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <YAxis
                            type="category"
                            dataKey="question"
                            width={150}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip formatter={(v: number) => [`${v}%`, "Agreement"]} />
                          <Bar dataKey="value" fill="#3A2FBF" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selected.themes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.themes.map((t) => (
                    <Badge key={t} variant="outline" data-testid={`badge-theme-${t}`}>
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selected.sample_verbatims.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Sample Verbatims</h4>
                <div className="space-y-2">
                  {selected.sample_verbatims.slice(0, 5).map((v, i) => (
                    <div
                      key={i}
                      className="text-sm p-3 rounded-md bg-muted/50 border"
                      data-testid={`text-verbatim-${i}`}
                    >
                      "{v}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
