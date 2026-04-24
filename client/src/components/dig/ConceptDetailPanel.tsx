import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { useDigConcepts, useDigConcept } from "@/lib/dig-api";
import type { ConceptDetail } from "@/lib/dig-api.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

const AGREEMENT_GROUP_LABELS: Record<string, string> = {
  self_relevance: "Self relevance",
  brand_comparison: "Brand comparison",
};

function formatPercent(value: number | null | undefined) {
  return value == null ? "\u2014" : `${Math.round(value)}%`;
}

type AnimatedChartRow = {
  animationKey: string;
  value: number;
};

type EmotionChartRow = AnimatedChartRow & {
  name: string;
  fill: string;
};

type AgreementQuestionRow = AnimatedChartRow & {
  question: string;
};

type AgreementGroup = {
  group: string;
  questions: AgreementQuestionRow[];
};

type DisplayedConceptDetail = {
  studyId: string;
  detail: ConceptDetail;
};

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

const useChartRowsEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function useAnimatedChartRows<T extends AnimatedChartRow>(targetRows: T[], durationMs = 420) {
  const [rows, setRows] = useState<T[]>(targetRows);
  const rowsRef = useRef(rows);
  const frameRef = useRef<number | null>(null);
  const targetSignature = JSON.stringify(targetRows);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useChartRowsEffect(() => {
    const scheduleFrame = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (callback: FrameRequestCallback) => window.setTimeout(() => callback(window.performance?.now() ?? Date.now()), 16);
    const cancelFrame = typeof window.cancelAnimationFrame === "function"
      ? window.cancelAnimationFrame.bind(window)
      : window.clearTimeout.bind(window);

    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }

    if (targetRows.length === 0) {
      if (rowsRef.current.length === 0) return;
      rowsRef.current = [];
      setRows([]);
      return;
    }

    const previousRows = new Map(rowsRef.current.map((row) => [row.animationKey, row]));
    const startRows = targetRows.map((target) => ({
      ...target,
      value: previousRows.get(target.animationKey)?.value ?? 0,
    }));

    const startedAt = window.performance?.now() ?? Date.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const easedProgress = easeOutCubic(progress);

      const nextRows = targetRows.map((target, index) => {
        const startValue = startRows[index]?.value ?? 0;
        return {
          ...target,
          value: startValue + ((target.value - startValue) * easedProgress),
        };
      });

      rowsRef.current = nextRows;
      setRows(nextRows);

      if (progress < 1) {
        frameRef.current = scheduleFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    rowsRef.current = startRows;
    setRows(startRows);
    frameRef.current = scheduleFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [durationMs, targetSignature]);

  return rows;
}

interface Props {
  studyId: string;
}

export default function ConceptDetailPanel({ studyId }: Props) {
  const { data: conceptsData, isLoading: loadingList, error: listError } = useDigConcepts(studyId);
  const [selectedId, setSelectedId] = useQueryState("concept", parseAsString);
  const [displayedDetailState, setDisplayedDetailState] = useState<DisplayedConceptDetail | null>(null);

  const concepts = conceptsData?.concepts ?? [];
  const selectedConceptExists = selectedId ? concepts.some((concept) => concept.id === selectedId) : false;
  const activeId = selectedConceptExists ? selectedId : concepts[0]?.id || "";
  const activeConcept = concepts.find((concept) => concept.id === activeId);

  const { data: detailData, isLoading: loadingDetail } = useDigConcept(studyId, activeId || undefined);
  const fetchedDetail = detailData?.concept;
  const displayedDetail = displayedDetailState?.studyId === studyId ? displayedDetailState.detail : null;
  const detail = fetchedDetail ?? displayedDetail;
  const isShowingPreviousDetail = !!displayedDetail && !fetchedDetail && displayedDetail.id !== activeId;

  useEffect(() => {
    if (fetchedDetail) {
      setDisplayedDetailState({ studyId, detail: fetchedDetail });
    }
  }, [fetchedDetail?.id, studyId]);

  const emotionData = useMemo<EmotionChartRow[]>(() => (
    detail
      ? detail.emotions.map((e) => ({
        animationKey: e.emotion.toLowerCase(),
        name: e.emotion.charAt(0).toUpperCase() + e.emotion.slice(1),
        value: Math.round(e.percentage),
        fill: EMOTION_COLORS[e.emotion.toLowerCase()] || "#9CA3AF",
      }))
      : []
  ), [detail]);

  const agreementGroups = useMemo<AgreementGroup[]>(() => {
    if (!detail) return [];

    const selfAgreements = detail.agreements.filter((a) => a.question_group === "self_relevance");
    const brandAgreements = detail.agreements.filter((a) => a.question_group === "brand_comparison");

    return [
      ...(selfAgreements.length > 0
        ? [
            {
              group: "self_relevance",
              questions: selfAgreements.map((a) => ({
                animationKey: `self_relevance:${a.statement}`,
                question: a.statement,
                value: Math.round(a.agree_percentage),
              })),
            },
          ]
        : []),
      ...(brandAgreements.length > 0
        ? [
            {
              group: "brand_comparison",
              questions: brandAgreements.map((a) => ({
                animationKey: `brand_comparison:${a.statement}`,
                question: a.statement,
                value: Math.round(a.agree_percentage),
              })),
            },
          ]
        : []),
    ];
  }, [detail]);

  const animatedEmotionData = useAnimatedChartRows(emotionData);
  const agreementRows = useMemo(
    () => agreementGroups.flatMap((group) => group.questions),
    [agreementGroups],
  );
  const animatedAgreementRows = useAnimatedChartRows(agreementRows);
  const animatedAgreementRowMap = useMemo(
    () => new Map(animatedAgreementRows.map((row) => [row.animationKey, row])),
    [animatedAgreementRows],
  );
  const animatedAgreementGroups = useMemo(
    () => agreementGroups.map((group) => ({
      ...group,
      questions: group.questions.map((question) => (
        animatedAgreementRowMap.get(question.animationKey) ?? { ...question, value: 0 }
      )),
    })),
    [agreementGroups, animatedAgreementRowMap],
  );

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

  return (
    <Card data-testid="card-concept-detail" className="overflow-hidden">
      <CardHeader>
        <CardTitle>Concept results</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick a concept on the left to keep your place while comparing detailed results.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className="border-b bg-muted/30 p-3 lg:border-b-0 lg:border-r"
            data-testid="concept-nav"
            aria-label="Concept navigation"
          >
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {concepts.length} concepts
            </div>
            <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
              {concepts.map((concept, index) => {
                const isActive = concept.id === activeId;

                return (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => { void setSelectedId(concept.id); }}
                    aria-current={isActive ? "true" : undefined}
                    className="min-w-56 rounded-lg border px-3 py-2 text-left transition-colors lg:w-full"
                    style={{
                      background: isActive ? "#F8F7FF" : "#FFFFFF",
                      borderColor: isActive ? "#3A2FBF" : "#EBEBEB",
                    }}
                    data-testid={`button-concept-nav-${concept.id}`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate text-sm font-semibold">{concept.name}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatPercent(concept.interest_rate)} interest · {formatPercent(concept.win_rate)} commitment
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 space-y-6 p-6">
        {loadingDetail && !detail && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {detail && (
          <>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Selected concept</span>
                {isShowingPreviousDetail && <span className="normal-case tracking-normal">Updating...</span>}
              </div>
              <h3 className="mt-1 text-xl font-semibold">
                {isShowingPreviousDetail ? detail.name : activeConcept?.name ?? detail.name}
              </h3>
            </div>

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

            {animatedEmotionData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Emotions</h4>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={animatedEmotionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${Math.round(v)}%`, "Score"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive={false}>
                        {animatedEmotionData.map((e) => (
                          <rect key={e.animationKey} fill={e.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {animatedAgreementGroups.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Agreement by Question Group</h4>
                {animatedAgreementGroups.map((g) => (
                  <div key={g.group} className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
                      {AGREEMENT_GROUP_LABELS[g.group] ?? g.group}
                    </p>
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
                          <Tooltip formatter={(v: number) => [`${Math.round(v)}%`, "Agreement"]} />
                          <Bar dataKey="value" fill="#3A2FBF" radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false} />
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
                      key={`${v.respondent_external_id ?? "anonymous"}:${v.comment}`}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
