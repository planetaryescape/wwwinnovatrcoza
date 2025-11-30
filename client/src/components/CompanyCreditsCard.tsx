import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Zap, Crown, Clock, Users } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  tier: string;
  contractStart: string | null;
  contractEnd: string | null;
  monthlyFee: string | null;
  basicCreditsTotal: number;
  basicCreditsUsed: number;
  proCreditsTotal: number;
  proCreditsUsed: number;
  notes: string | null;
}

interface CompanyCreditsCardProps {
  companyId: string;
}

export default function CompanyCreditsCard({ companyId }: CompanyCreditsCardProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/member/company?companyId=${companyId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch company");
        }
        const data = await res.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load company");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Company Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !company) {
    return null;
  }

  const basicRemaining = company.basicCreditsTotal - company.basicCreditsUsed;
  const proRemaining = company.proCreditsTotal - company.proCreditsUsed;
  const basicPercentage = company.basicCreditsTotal > 0 
    ? ((company.basicCreditsTotal - company.basicCreditsUsed) / company.basicCreditsTotal) * 100 
    : 0;
  const proPercentage = company.proCreditsTotal > 0 
    ? ((company.proCreditsTotal - company.proCreditsUsed) / company.proCreditsTotal) * 100 
    : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card data-testid="card-company-credits">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2" data-testid="text-company-credits-title">
              <Building2 className="w-5 h-5 text-primary" />
              {company.name} Credit Pool
            </CardTitle>
            <CardDescription data-testid="text-company-credits-description">
              Shared credits for your team
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
            data-testid="badge-company-tier"
          >
            <Crown className="w-3 h-3 mr-1" />
            {company.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(company.basicCreditsTotal > 0 || company.proCreditsTotal > 0) ? (
          <>
            {company.basicCreditsTotal > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Test24 Basic
                  </span>
                  <span className="text-sm text-muted-foreground" data-testid="text-basic-credits-remaining">
                    {basicRemaining} of {company.basicCreditsTotal} remaining
                  </span>
                </div>
                <Progress value={basicPercentage} className="h-2" data-testid="progress-basic-credits" />
              </div>
            )}

            {company.proCreditsTotal > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-500" />
                    Test24 Pro
                  </span>
                  <span className="text-sm text-muted-foreground" data-testid="text-pro-credits-remaining">
                    {proRemaining} of {company.proCreditsTotal} remaining
                  </span>
                </div>
                <Progress value={proPercentage} className="h-2" data-testid="progress-pro-credits" />
              </div>
            )}

            {company.contractEnd && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Clock className="w-4 h-4" />
                <span data-testid="text-contract-end">Contract ends: {formatDate(company.contractEnd)}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your company has access to Scale-tier reports.</p>
            <p className="text-xs mt-1">Credits are managed by {company.name}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
