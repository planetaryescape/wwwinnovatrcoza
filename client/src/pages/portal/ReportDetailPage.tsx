import { useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useAuth } from "@/contexts/AuthContext";
import { useDigStudies } from "@/lib/dig-api";
import { selectDigStudyForReport } from "@/lib/dig-study-selection";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ConceptRankingTable from "@/components/dig/ConceptRankingTable";
import ConceptDetailPanel from "@/components/dig/ConceptDetailPanel";
import DemographicsCharts from "@/components/dig/DemographicsCharts";
import ThemeSummary from "@/components/dig/ThemeSummary";
import VerbatimSearchBox from "@/components/dig/VerbatimSearchBox";
import { PortalTabs } from "@/components/portal/PortalTabs";
import { PortalBreadcrumbs } from "@/components/portal/PortalBreadcrumbs";
import PortalLayout from "./PortalLayout";

const REPORT_TAB_VALUES = ["overview", "concepts", "demographics", "themes", "ask"] as const;
type Tab = typeof REPORT_TAB_VALUES[number];
const REPORT_TABS: { value: Tab; label: string; testId: string }[] = [
  { value: "overview", label: "Overview", testId: "tab-report-overview" },
  { value: "concepts", label: "Concepts", testId: "tab-report-concepts" },
  { value: "demographics", label: "Demographics", testId: "tab-report-demographics" },
  { value: "themes", label: "Themes", testId: "tab-report-themes" },
  { value: "ask", label: "Ask", testId: "tab-report-ask" },
];

const VDK = "#1E1B3A";
const N200 = "#EBEBEB";
const N500 = "#8A7260";
const CORAL = "#E8503A";
export default function ReportDetailPage() {
  const [, params] = useRoute("/portal/reports/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const reportId = params?.id;
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(REPORT_TAB_VALUES).withDefault("overview"),
  );

  const { data: digStudiesData, isLoading: loadingDig } = useDigStudies(!!user);

  const digStudy = useMemo(() => {
    if (!digStudiesData?.studies || !reportId) return null;
    return selectDigStudyForReport(digStudiesData.studies, reportId);
  }, [digStudiesData, reportId]);

  const studyId = digStudy?.id;
  const activeTabLabel = REPORT_TABS.find((tab) => tab.value === activeTab)?.label ?? "Overview";

  if (!reportId) {
    return (
      <PortalLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Report not found.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="portal-workspace">
        <div className="portal-page-header border-b" style={{ borderColor: N200 }}>
          <PortalBreadcrumbs
            items={[
              { label: "Dashboard", href: "/portal/dashboard" },
              { label: "Test", href: "/portal/test" },
              ...(digStudy ? [{ label: digStudy.title }, { label: activeTabLabel }] : []),
            ]}
          />

          <div className="min-w-0">
            <h1 className="font-serif text-3xl leading-tight" style={{ color: VDK }}>
              {digStudy?.title || `Report ${reportId.slice(0, 8)}`}
            </h1>
            <p className="mt-2 max-w-none text-sm leading-relaxed" style={{ color: N500 }}>
              Review the study, compare concepts, then move the evidence into Act when you are ready to decide.
            </p>
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
            <PortalTabs value={activeTab} onValueChange={(tab) => void setActiveTab(tab)} tabs={REPORT_TABS} accentColor={CORAL}>
            <div className="portal-main-scroll">
              {activeTab === "overview" && (
                <div className="space-y-6 max-w-5xl">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      Status: <span className="font-medium capitalize">{digStudy.ingest_status}</span>
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
            </PortalTabs>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
