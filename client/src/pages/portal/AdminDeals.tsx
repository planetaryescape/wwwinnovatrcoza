import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewDealModal from "./NewDealModal";

interface Deal {
  id: string;
  title: string;
  description: string;
  headlineOffer: string;
  discountPercent: number;
  creditsIncluded: number;
  targetTierKeys: string[];
  targetUserIds: string[];
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
}

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDealsAndUsers();
  }, []);

  const fetchDealsAndUsers = async () => {
    try {
      setLoading(true);
      const [dealsRes, usersRes] = await Promise.all([
        fetch("/api/admin/deals"),
        fetch("/api/admin/users"),
      ]);

      if (!dealsRes.ok) throw new Error("Failed to fetch deals");
      if (!usersRes.ok) throw new Error("Failed to fetch users");

      const dealsData = await dealsRes.json();
      const usersData = await usersRes.json();

      setDeals(dealsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (dealId: string) => {
    try {
      const res = await fetch(`/api/admin/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      if (!res.ok) throw new Error("Failed to deactivate deal");

      setDeals(deals.map((d) => (d.id === dealId ? { ...d, isActive: false } : d)));
    } catch (err) {
      console.error("Error deactivating deal:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Deals Management</h2>
          <p className="text-muted-foreground">Create and manage member promotions</p>
        </div>
        <Button onClick={() => setModalOpen(true)} data-testid="button-new-deal">
          <Plus className="w-4 h-4 mr-2" />
          New Deal
        </Button>
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
                    <th className="text-left py-2 px-2">Headline</th>
                    <th className="text-left py-2 px-2">Discount</th>
                    <th className="text-left py-2 px-2">Credits</th>
                    <th className="text-left py-2 px-2">Tiers</th>
                    <th className="text-left py-2 px-2">Valid From</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-b hover:bg-muted/50" data-testid={`deal-row-${deal.id}`}>
                      <td className="py-2 px-2 max-w-xs truncate text-sm">{deal.title}</td>
                      <td className="py-2 px-2 max-w-xs truncate text-xs text-muted-foreground">{deal.headlineOffer}</td>
                      <td className="py-2 px-2">{deal.discountPercent}%</td>
                      <td className="py-2 px-2">{deal.creditsIncluded}</td>
                      <td className="py-2 px-2 space-x-1">
                        {deal.targetTierKeys.map((tier) => (
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
                      <td className="py-2 px-2">
                        {deal.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivate(deal.id)}
                            data-testid={`button-deactivate-${deal.id}`}
                          >
                            Deactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewDealModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={fetchDealsAndUsers}
        users={users}
      />
    </div>
  );
}
