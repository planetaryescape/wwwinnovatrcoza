import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import reportsData from "@/data/reports.json";

export default function AdminReports() {
  const [reports] = useState(reportsData);

  const getAccessColor = (level?: string) => {
    switch (level) {
      case "PUBLIC": return "bg-blue-100 text-blue-900";
      case "STARTER": return "bg-green-100 text-green-900";
      case "GROWTH": return "bg-purple-100 text-purple-900";
      case "SCALE": return "bg-indigo-100 text-indigo-900";
      default: return "bg-gray-100 text-gray-900";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold mb-2">Reports Management</h2>
        <p className="text-muted-foreground">Manage research reports and access levels</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reports.map((report) => (
              <div key={report.id} className="border-b pb-4 last:border-b-0" data-testid={`report-item-${report.id}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{report.teaser}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Badge variant="outline" className="text-xs">{report.category}</Badge>
                    <Badge className={`text-xs ${getAccessColor(report.accessLevel || "PUBLIC")}`}>
                      {report.accessLevel || "PUBLIC"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">Total: {reports.length} reports</p>
        </CardContent>
      </Card>
    </div>
  );
}
