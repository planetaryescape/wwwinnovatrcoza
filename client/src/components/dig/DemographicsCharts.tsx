import { useState } from "react";
import { useDigDemographics } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

/** Dim non-hovered bars/cells to focus the user's eye on the one they're inspecting. */
function activeOpacity(activeIndex: number | null, i: number) {
  if (activeIndex === null) return 1;
  return activeIndex === i ? 1 : 0.32;
}

const PIE_COLORS = [
  "var(--ds-violet, #3A2FBF)",
  "var(--ds-coral, #E8503A)",
  "var(--ds-success, #2A9E5C)",
  "var(--ds-amber, #F5C842)",
  "var(--ds-cyan, #4EC9E8)",
  "var(--ds-n500, #6B7280)",
];

const genderConfig = {
  value: { label: "Count" },
} satisfies ChartConfig;

const ageConfig = {
  value: { label: "Count", color: "var(--ds-violet, #3A2FBF)" },
} satisfies ChartConfig;

const provinceConfig = {
  value: { label: "Count", color: "var(--ds-success, #2A9E5C)" },
} satisfies ChartConfig;

interface Props {
  studyId: string;
}

export default function DemographicsCharts({ studyId }: Props) {
  const { data, isLoading, error } = useDigDemographics(studyId);
  const [genderHover, setGenderHover] = useState<number | null>(null);
  const [ageHover, setAgeHover] = useState<number | null>(null);
  const [provinceHover, setProvinceHover] = useState<number | null>(null);

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

  const demographics = data?.demographics;

  if (!demographics) {
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

  const genderData = demographics.gender.map((b) => ({ name: b.label ?? "Unknown", value: b.count }));
  const ageData = demographics.age_buckets.map((b) => ({ name: b.bucket ?? b.label ?? "Unknown", value: b.count }));
  const provinceData = [...demographics.province]
    .sort((a, b) => b.count - a.count)
    .map((b) => ({ name: b.label ?? "Unknown", value: b.count }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" data-testid="card-demographics">
      <Card>
        <CardHeader><CardTitle className="text-base">Gender</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={genderConfig} className="aspect-auto h-[250px] w-full">
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
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    fillOpacity={activeOpacity(genderHover, i)}
                    onMouseEnter={() => setGenderHover(i)}
                    onMouseLeave={() => setGenderHover(null)}
                    style={{ transition: "fill-opacity 120ms ease" }}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Age Buckets</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer config={ageConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={28}
                onMouseLeave={() => setAgeHover(null)}
              >
                {ageData.map((_, i) => (
                  <Cell
                    key={i}
                    fill="var(--color-value)"
                    fillOpacity={activeOpacity(ageHover, i)}
                    onMouseEnter={() => setAgeHover(i)}
                    style={{ transition: "fill-opacity 120ms ease" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Provinces</CardTitle></CardHeader>
        <CardContent>
          <ChartContainer
            config={provinceConfig}
            className="aspect-auto w-full"
            style={{ height: Math.max(250, provinceData.length * 30) }}
          >
            <BarChart data={provinceData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={16}
                onMouseLeave={() => setProvinceHover(null)}
              >
                {provinceData.map((_, i) => (
                  <Cell
                    key={i}
                    fill="var(--color-value)"
                    fillOpacity={activeOpacity(provinceHover, i)}
                    onMouseEnter={() => setProvinceHover(i)}
                    style={{ transition: "fill-opacity 120ms ease" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
