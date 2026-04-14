import { useState } from "react";
import { useDigConcepts, useDigConcept } from "@/lib/dig-api";
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
  const { data: conceptsData, isLoading: loadingList, error: listError } = useDigConcepts(studyId);
  const [selectedId, setSelectedId] = useState<string>("");

  const concepts = conceptsData?.concepts ?? [];
  const activeId = selectedId || concepts[0]?.id || "";

  const { data: detailData, isLoading: loadingDetail } = useDigConcept(studyId, activeId || undefined);
  const detail = detailData?.concept;

  if (loadingList) {
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

  if (listError) {
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

  if (concepts.length === 0) {
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

  const emotionData = detail
    ? detail.emotions.map((e) => ({
        name: e.emotion.charAt(0).toUpperCase() + e.emotion.slice(1),
        value: Math.round(e.percentage),
        fill: EMOTION_COLORS[e.emotion.toLowerCase()] || "#9CA3AF",
      }))
    : [];

  const selfAgreements = detail
    ? detail.agreements.filter((a) => a.question_group === "self")
    : [];
  const brandAgreements = detail
    ? detail.agreements.filter((a) => a.question_group === "brand")
    : [];

  const agreementGroups = [
    ...(selfAgreements.length > 0 ? [{ group: "self", questions: selfAgreements.map((a) => ({ question: a.statement, value: Math.round(a.agree_percentage) })) }] : []),
    ...(brandAgreements.length > 0 ? [{ group: "brand", questions: brandAgreements.map((a) => ({ question: a.statement, value: Math.round(a.agree_percentage) })) }] : []),
  ];

  return (
    <Card data-testid="card-concept-detail">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Concept Details</CardTitle>
        {concepts.length > 1 && (
          <Select
            value={activeId}
            onValueChange={(v) => setSelectedId(v)}
          >
            <SelectTrigger className="w-56" data-testid="select-concept">
              <SelectValue placeholder="Select concept" />
            </SelectTrigger>
            <SelectContent>
              {concepts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingDetail && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {detail && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {detail.evaluation_count > 0 && (
                <Badge variant="secondary">Evaluations: {detail.evaluation_count}</Badge>
              )}
              {detail.concept_type && (
                <Badge variant="outline">{detail.concept_type}</Badge>
              )}
              {detail.brand && (
                <Badge variant="outline">{detail.brand}</Badge>
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

            {detail.themes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {detail.themes.map((t) => (
                    <Badge key={t.theme_category} variant="outline" data-testid={`badge-theme-${t.theme_category}`}>
                      {t.theme_category} ({t.mentions})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {detail.sample_verbatims.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Sample Verbatims</h4>
                <div className="space-y-2">
                  {detail.sample_verbatims.slice(0, 5).map((v, i) => (
                    <div
                      key={i}
                      className="text-sm p-3 rounded-md bg-muted/50 border"
                      data-testid={`text-verbatim-${i}`}
                    >
                      "{v.comment}"
                      {v.clarity_label && (
                        <span className="text-xs text-muted-foreground ml-2">({v.clarity_label})</span>
                      )}
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
