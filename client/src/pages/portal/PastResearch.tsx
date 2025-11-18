import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, Download, Eye, Grid3x3, List } from "lucide-react";
import PortalLayout from "./PortalLayout";

const mockStudies = [
  {
    id: 1,
    title: "Protein Bar Flavour Test",
    type: "Basic",
    date: "2024-11-10",
    category: "Food & Beverage",
    score: 78,
    status: "completed",
    topFindings: "Chocolate Peanut variant ranked highest",
  },
  {
    id: 2,
    title: "Packaging Design Study",
    type: "Pro",
    date: "2024-10-28",
    category: "Design & Innovation",
    score: 82,
    status: "completed",
    topFindings: "Eco-friendly packaging drove 40% preference increase",
  },
  {
    id: 3,
    title: "Brand Positioning Analysis",
    type: "Pro",
    date: "2024-10-15",
    category: "Brand Strategy",
    score: 75,
    status: "completed",
    topFindings: "Premium positioning resonated with target audience",
  },
  {
    id: 4,
    title: "Product Name Testing",
    type: "Basic",
    date: "2024-09-22",
    category: "Marketing",
    score: 68,
    status: "completed",
    topFindings: "Name B outperformed by 25% in recall tests",
  },
  {
    id: 5,
    title: "Market Entry Strategy",
    type: "Pro",
    date: "2024-09-08",
    category: "Strategy",
    score: 85,
    status: "completed",
    topFindings: "Cape Town market showed strongest potential",
  },
  {
    id: 6,
    title: "New Service Concept Test",
    type: "Basic",
    date: "2024-08-25",
    category: "Services",
    score: 71,
    status: "completed",
    topFindings: "Subscription model preferred by 65% of respondents",
  },
];

export default function PastResearch() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filteredStudies = mockStudies.filter((study) => {
    const matchesSearch =
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.topFindings.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || study.category === filterCategory;
    const matchesType = filterType === "all" || study.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-accent";
    return "text-orange-600";
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Past Research</h1>
            <p className="text-lg text-muted-foreground">
              Access all your completed studies and insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Studies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by title or findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-studies"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  <SelectItem value="Design & Innovation">Design & Innovation</SelectItem>
                  <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Basic">Test24 Basic</SelectItem>
                  <SelectItem value="Pro">Test24 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredStudies.length} of {mockStudies.length} studies
            </div>
          </CardContent>
        </Card>

        {/* Studies Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies.map((study) => (
              <Card
                key={study.id}
                className="hover-elevate flex flex-col"
                data-testid={`study-card-${study.id}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={study.type === "Pro" ? "default" : "secondary"}>
                      Test24 {study.type}
                    </Badge>
                    <span className={`text-2xl font-bold ${getScoreColor(study.score)}`}>
                      {study.score}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{study.title}</CardTitle>
                  <CardDescription>{study.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-3">
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Top Finding:</p>
                      <p className="font-medium">{study.topFindings}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(study.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" data-testid={`button-view-${study.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-download-${study.id}`}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredStudies.map((study) => (
                  <div
                    key={study.id}
                    className="p-4 hover-elevate flex items-center gap-4"
                    data-testid={`study-row-${study.id}`}
                  >
                    <div className="flex-shrink-0">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{study.title}</h3>
                        <Badge variant={study.type === "Pro" ? "default" : "secondary"} className="text-xs">
                          {study.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{study.topFindings}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{study.category}</span>
                        <span>{new Date(study.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(study.score)}`}>
                      {study.score}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-view-${study.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-download-${study.id}`}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
