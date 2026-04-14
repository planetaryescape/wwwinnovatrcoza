import { useDigDemographics } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#3A2FBF", "#E8503A", "#2A9E5C", "#F59E0B", "#8B5CF6", "#6B7280"];

interface Props {
  studyId: string;
}

export default function DemographicsCharts({ studyId }: Props) {
  const { data, isLoading, error } = useDigDemographics(studyId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-demographics-error">
            Failed to load demographics data.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="text-demographics-empty">
            No demographics data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const genderData = Object.entries(data.gender).map(([name, value]) => ({ name, value }));
  const ageData = Object.entries(data.age_buckets).map(([name, value]) => ({ name, value }));
  const provinceData = Object.entries(data.provinces)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="card-demographics">
      <Card>
        <CardHeader><CardTitle className="text-base">Gender</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Age Buckets</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3A2FBF" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Provinces</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: Math.max(250, provinceData.length * 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2A9E5C" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
