import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Deal {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  creditsIncluded: number;
  targetTiers: string[];
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
}

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/admin/deals");
        if (!res.ok) throw new Error("Failed to fetch deals");
        const data = await res.json();
        setDeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Deals Management</h2>
        <p className="text-muted-foreground">Create and manage member promotions</p>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-muted-foreground">Loading deals...</p>
          ) : deals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No deals yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Title</th>
                    <th className="text-left py-2 px-2">Discount</th>
                    <th className="text-left py-2 px-2">Credits</th>
                    <th className="text-left py-2 px-2">Tiers</th>
                    <th className="text-left py-2 px-2">Valid From</th>
                    <th className="text-left py-2 px-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/50" data-testid={`deal-row-${deal.id}`}>
                      <td className="py-2 px-2 max-w-xs truncate">{deal.title}</td>
                      <td className="py-2 px-2">{deal.discountPercent}%</td>
                      <td className="py-2 px-2">{deal.creditsIncluded}</td>
                      <td className="py-2 px-2 space-x-1">
                        {deal.targetTiers.map((tier) => (
                          <Badge key={tier} variant="outline" className="text-xs">
                            {tier}
                          </Badge>
                        ))}
                      </td>
                      <td className="py-2 px-2 text-xs">{new Date(deal.validFrom).toLocaleDateString()}</td>
                      <td className="py-2 px-2">
                        <Badge variant={deal.isActive ? "default" : "secondary"} className="text-xs">
                          {deal.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
