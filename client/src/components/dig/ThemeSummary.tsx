import { useDigThemes } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  studyId: string;
}

export default function ThemeSummary({ studyId }: Props) {
  const { data, isLoading, error } = useDigThemes(studyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Themes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Themes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-themes-error">
            Failed to load theme data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const themes = data?.themes ?? [];

  if (themes.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Themes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-themes-empty">
            No theme data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = themes.map((t) => ({
    name: t.theme_category.length > 25 ? t.theme_category.slice(0, 23) + "\u2026" : t.theme_category,
    fullName: t.theme_category,
    concept: t.concept_name,
    positive: t.positive,
    neutral: t.neutral,
    negative: t.negative,
  }));

  return (
    <Card data-testid="card-theme-summary">
      <CardHeader>
        <CardTitle>Theme Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(300, themes.length * 45) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
              stackOffset="expand"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `${Math.round(v * 100)}%`} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                labelFormatter={(label: string, payload: Array<{ payload?: { fullName?: string; concept?: string } }>) => {
                  const p = payload?.[0]?.payload;
                  return p ? `${p.fullName} (${p.concept})` : label;
                }}
              />
              <Legend />
              <Bar dataKey="positive" name="Positive" stackId="a" fill="#2A9E5C" barSize={20} />
              <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#9CA3AF" barSize={20} />
              <Bar dataKey="negative" name="Negative" stackId="a" fill="#EF4444" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 space-y-3">
          {themes.map((t, i) => (
            <div key={`${t.concept_id}-${t.theme_category}-${i}`} className="border-b last:border-0 pb-3" data-testid={`theme-row-${t.theme_category}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div>
                  <span className="text-sm font-medium">{t.theme_category}</span>
                  <span className="text-xs text-muted-foreground ml-2">({t.concept_name})</span>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="text-green-600">+{t.positive}</span>
                  <span>~{t.neutral}</span>
                  <span className="text-red-500">-{t.negative}</span>
                  <span>{t.mentions} mentions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
