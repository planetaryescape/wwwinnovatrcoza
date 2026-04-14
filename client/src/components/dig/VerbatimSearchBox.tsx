import { useState } from "react";
import { useDigSearch } from "@/lib/dig-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";

interface Props {
  studyId: string;
}

export default function VerbatimSearchBox({ studyId }: Props) {
  const [query, setQuery] = useState("");
  const searchMutation = useDigSearch(studyId);

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate({ query: query.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Card data-testid="card-verbatim-search">
      <CardHeader>
        <CardTitle>Ask the Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search respondent comments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              data-testid="input-verbatim-search"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searchMutation.isPending || !query.trim()}
            data-testid="button-verbatim-search"
          >
            {searchMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {searchMutation.error && (
          <p className="text-sm text-destructive" data-testid="text-search-error">
            Search failed. Please try again.
          </p>
        )}

        {searchMutation.data && searchMutation.data.results.length === 0 && (
          <p className="text-sm text-muted-foreground" data-testid="text-search-empty">
            No matching comments found.
          </p>
        )}

        {searchMutation.data && searchMutation.data.results.length > 0 && (
          <div className="space-y-3" data-testid="list-search-results">
            <p className="text-xs text-muted-foreground">
              {searchMutation.data.results.length} results for "{searchMutation.data.query}"
            </p>
            {searchMutation.data.results.map((r, i) => (
              <div
                key={`${r.respondent_id}-${i}`}
                className="p-3 rounded-md bg-muted/50 border space-y-1"
                data-testid={`search-result-${i}`}
              >
                <p className="text-sm">"{r.text}"</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {r.concept_label}
                  </Badge>
                  {r.theme_category && (
                    <Badge variant="secondary" className="text-xs">
                      {r.theme_category}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    relevance: {(1 - r.distance).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
