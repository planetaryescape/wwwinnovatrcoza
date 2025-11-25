import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp } from "lucide-react";

interface OverviewStats {
  totalUsers: number;
  starterMembers: number;
  growthMembers: number;
  scaleMembers: number;
  activeDeals: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        if (!res.ok) throw new Error("Failed to fetch overview");
        const data = await res.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          starterMembers: data.starterMembers || 0,
          growthMembers: data.growthMembers || 0,
          scaleMembers: data.scaleMembers || 0,
          activeDeals: data.activeDeals || 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const MetricCard = ({ label, value }: { label: string; value: number }) => (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">System Overview</h2>
        <p className="text-muted-foreground">High-level metrics and system health</p>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Total Users" value={stats?.totalUsers || 0} />
        <MetricCard label="Starter Members" value={stats?.starterMembers || 0} />
        <MetricCard label="Growth Members" value={stats?.growthMembers || 0} />
        <MetricCard label="Scale Members" value={stats?.scaleMembers || 0} />
        <MetricCard label="Active Deals" value={stats?.activeDeals || 0} />
      </div>
    </div>
  );
}
