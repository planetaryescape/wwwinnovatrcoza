import { useDigRanking } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = {
  winRate: "#3A2FBF",
  interest: "#3B82F6",
};

interface Props {
  studyId: string;
}

export default function ConceptRankingTable({ studyId }: Props) {
  const { data, isLoading, error } = useDigRanking(studyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Concept Ranking</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Concept Ranking</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-ranking-error">
            Failed to load ranking data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const ranking = data?.ranking ?? [];

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Concept Ranking</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-ranking-empty">
            No ranking data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...ranking].sort((a, b) => a.rank - b.rank);

  const chartData = sorted.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 18) + "\u2026" : c.name,
    fullLabel: c.name,
    winRate: c.win_rate ?? 0,
    interest: c.interest_rate ?? 0,
    rank: c.rank,
  }));

  return (
    <Card data-testid="card-concept-ranking">
      <CardHeader>
        <CardTitle>Concept Ranking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height: Math.max(250, sorted.length * 50) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name === "winRate" ? "Win Rate" : "Interest"]}
                labelFormatter={(label: string, payload: Array<{ payload?: { fullLabel?: string } }>) => payload?.[0]?.payload?.fullLabel || label}
              />
              <Legend />
              <Bar dataKey="winRate" name="Win Rate" fill={COLORS.winRate} radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="interest" name="Interest" fill={COLORS.interest} radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Concept</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Win Rate</th>
                <th className="text-right py-2 px-2 font-medium text-muted-foreground">Interest</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.concept_id} className="border-b last:border-0" data-testid={`row-ranking-${c.concept_id}`}>
                  <td className="py-2 px-2 font-medium">{c.rank}</td>
                  <td className="py-2 px-2">{c.name}</td>
                  <td className="text-right py-2 px-2 font-mono">{c.win_rate != null ? `${c.win_rate}%` : "\u2014"}</td>
                  <td className="text-right py-2 px-2 font-mono">{c.interest_rate != null ? `${c.interest_rate}%` : "\u2014"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
