import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Mail, Search, Building2, Briefcase, Calendar, Users } from "lucide-react";
import { useState, useMemo } from "react";
import type { MailerSubscription } from "@shared/schema";

const industryLabels: Record<string, string> = {
  beverage: "Food & Beverage",
  retail: "Retail",
  financial: "Financial Services",
  technology: "Technology",
  healthcare: "Healthcare",
  manufacturing: "Manufacturing",
  media: "Media & Entertainment",
  other: "Other",
};

export default function AdminMailerSubscriptions() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: subscriptions = [], isLoading } = useQuery<MailerSubscription[]>({
    queryKey: ["/api/admin/mailer-subscriptions"],
  });

  const filteredSubscriptions = useMemo(() => {
    if (!searchTerm) return subscriptions;
    const term = searchTerm.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(term) ||
        sub.email.toLowerCase().includes(term) ||
        sub.company.toLowerCase().includes(term) ||
        sub.industry.toLowerCase().includes(term)
    );
  }, [subscriptions, searchTerm]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case "beverage": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "retail": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "financial": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "technology": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "healthcare": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "manufacturing": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      case "media": return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading subscribers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscriptions.length}</p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(subscriptions.map((s) => s.company)).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(subscriptions.map((s) => s.industry)).size}
                </p>
                <p className="text-sm text-muted-foreground">Industries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {subscriptions.filter((s) => {
                    const subDate = new Date(s.subscribedAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return subDate >= thirtyDaysAgo;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Last 30 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pulse Insights Subscribers
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-subscribers"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No subscribers match your search" : "No subscribers yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} data-testid={`row-subscriber-${sub.id}`}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${sub.email}`} 
                        className="text-primary hover:underline"
                      >
                        {sub.email}
                      </a>
                    </TableCell>
                    <TableCell>{sub.company}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={getIndustryColor(sub.industry)}
                      >
                        {industryLabels[sub.industry] || sub.industry}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(sub.subscribedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
