import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useDigStudies } from "@/lib/dig-api";
import { MobilePortalNav } from "@/components/portal/MobilePortalNav";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ConceptRankingTable from "@/components/dig/ConceptRankingTable";
import ConceptDetailPanel from "@/components/dig/ConceptDetailPanel";
import DemographicsCharts from "@/components/dig/DemographicsCharts";
import ThemeSummary from "@/components/dig/ThemeSummary";
import VerbatimSearchBox from "@/components/dig/VerbatimSearchBox";
type Tab = "overview" | "concepts" | "demographics" | "themes" | "ask";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "concepts", label: "Concepts" },
  { key: "demographics", label: "Demographics" },
  { key: "themes", label: "Themes" },
  { key: "ask", label: "Ask" },
];

const VDK = "#1E1B3A";
const N200 = "#EBEBEB";
const N500 = "#8A7260";
const CORAL = "#E8503A";
const SUCCESS = "#2A9E5C";
const CREAM = "#FFFFFF";

export default function ReportDetailPage() {
  const [, params] = useRoute("/portal/reports/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const reportId = params?.id;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: digStudies, isLoading: loadingDig } = useDigStudies(!!user);

  const digStudy = useMemo(() => {
    if (!digStudies || !reportId) return null;
    return digStudies.find(
      (s) => s.public_client_report_id === reportId
    ) || null;
  }, [digStudies, reportId]);

  const studyId = digStudy?.id;

  if (!reportId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  return (
    <div className="portal-root flex h-screen overflow-hidden" style={{ background: CREAM }}>
      <MobilePortalNav />
      <div className="flex flex-col w-full h-full">
        <div
          className="flex items-center justify-between flex-shrink-0 px-5"
          style={{
            minHeight: 52,
            background: "linear-gradient(135deg, #201B3C 0%, #2E2760 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation("/portal/test")}
              className="text-white/70 hover:text-white"
              data-testid="button-back-to-test"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span
              className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1"
              style={{
                background: "rgba(42,158,92,0.2)",
                color: "#86EFAC",
                border: "1px solid rgba(42,158,92,0.4)",
                borderRadius: 6,
              }}
            >
              REPORT
            </span>
            <h1 className="font-serif text-xl text-white truncate max-w-md">
              {digStudy?.study_name || `Report ${reportId.slice(0, 8)}`}
            </h1>
          </div>
        </div>

        {!loadingDig && !digStudy && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md space-y-3">
              <p className="text-lg font-medium" data-testid="text-no-dig-study">
                No Dig analysis linked
              </p>
              <p className="text-sm text-muted-foreground">
                This report does not have ingested Dig ETL data yet. Once CSV data is uploaded and processed, the full analysis will appear here.
              </p>
              <Button
                variant="outline"
                onClick={() => setLocation("/portal/test")}
                data-testid="button-back-test"
              >
                Back to Studies
              </Button>
            </div>
          </div>
        )}

        {loadingDig && (
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {digStudy && studyId && (
          <>
            <div
              className="flex flex-shrink-0 px-5 sticky-tab-bar border-b"
              style={{ borderColor: N200 }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  data-testid={`tab-report-${tab.key}`}
                  className="flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap"
                  style={{
                    color: activeTab === tab.key ? VDK : N500,
                    borderBottomColor: activeTab === tab.key ? CORAL : "transparent",
                    background: "transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-6">
              {activeTab === "overview" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      Status: <span className="font-medium capitalize">{digStudy.status}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Concepts: <span className="font-medium">{digStudy.concept_count}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Respondents: <span className="font-medium">{digStudy.respondent_count}</span>
                    </span>
                  </div>
                  <ConceptRankingTable studyId={studyId} />
                </div>
              )}

              {activeTab === "concepts" && (
                <div className="max-w-5xl">
                  <ConceptDetailPanel studyId={studyId} />
                </div>
              )}

              {activeTab === "demographics" && (
                <div className="max-w-6xl">
                  <DemographicsCharts studyId={studyId} />
                </div>
              )}

              {activeTab === "themes" && (
                <div className="max-w-5xl">
                  <ThemeSummary studyId={studyId} />
                </div>
              )}

              {activeTab === "ask" && (
                <div className="max-w-3xl">
                  <VerbatimSearchBox studyId={studyId} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
