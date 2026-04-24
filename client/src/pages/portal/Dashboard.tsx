import { useMemo, useEffect, useState } from "react";
import { logActivity } from "@/lib/activityLogger";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download, ArrowRight, Sparkles, BarChart3,
  Zap, CreditCard, Home, Search, AlertTriangle,
  HelpCircle, X,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PortalLayout from "./PortalLayout";
import type { ClientReport, Company, Study } from "@shared/schema";
import { usePortalFeed } from "@/lib/portal-feed";
import { deriveNextBestAction } from "@/lib/next-best-action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/portal/EmptyState";

/* ── Design tokens ──────────────────────────────────────── */
const VDK        = "#1E1B3A";
const VIO        = "#3A2FBF";
const VIO_LT     = "#EAE8FF";
const CORAL      = "#E8503A";
const CORAL_LT   = "#FDECEA";
const CYAN_DK    = "#1A8FAD";
const CYAN_LT    = "#DFF6FC";
const AMBER_DK   = "#B8911A";
const AMBER_LT   = "#FEF6D6";
const N200       = "#EBEBEB";
const N400       = "#A89078";
const N500       = "#8A7260";
const SUCCESS    = "#2A9E5C";
const SUCCESS_LT = "#D1FAE5";
const CREAM      = "#FFFFFF";

const CARD: React.CSSProperties = {
  background: "#ffffff",
  border: `1px solid #EBEBEB`,
  borderRadius: 12,
  boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
};

const LIVE_STUDY_STATUSES = new Set(["NEW", "AUDIENCE_LIVE", "ANALYSING_DATA"]);
const ONBOARDING_STORAGE_KEY = "innovatr_dashboard_onboarding_seen";

type PortalClientReport = ClientReport & { companyName?: string };
type PhasePreviewItem = {
  dotColor: string;
  text: string;
  sub?: string;
  chip?: { label: string; bg: string; color: string };
  onClick?: () => void;
};

/* ── Helpers ──────────────────────────────────────────────── */
function metricColor(v: number) {
  if (v >= 75) return SUCCESS;
  if (v >= 55) return AMBER_DK;
  return CORAL;
}

function truncateText(value: string, max = 96) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function formatStudyStatus(status: string) {
  switch (status) {
    case "AUDIENCE_LIVE":
      return { label: "In Field",  bg: AMBER_LT,   color: AMBER_DK };
    case "ANALYSING_DATA":
      return { label: "Analysing", bg: VIO_LT,     color: VIO      };
    case "COMPLETED":
      return { label: "Complete",  bg: SUCCESS_LT, color: SUCCESS  };
    case "NEW":
      return { label: "New",       bg: CYAN_LT,    color: CYAN_DK  };
    default:
      return { label: status.replaceAll("_", " "), bg: "#F5F5F5", color: N500 };
  }
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isPaidMember } = useAuth();
  const [studySearch, setStudySearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => { logActivity("view_dashboard"); }, []);
  useEffect(() => {
    if (!window.localStorage.getItem(ONBOARDING_STORAGE_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const { data: company, isLoading: loadingCompany } = useQuery<Company | null>({
    queryKey: ["/api/member/company", user?.companyId],
    queryFn: async () => {
      const r = await fetch("/api/member/company");
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!user?.companyId,
    retry: false,
  });

  const { data: studies = [], isLoading: loadingStudies } = useQuery<Study[]>({
    queryKey: ["/api/member/studies", user?.companyId],
    queryFn: async () => {
      const r = await fetch("/api/member/studies");
      if (!r.ok) throw new Error("Failed to fetch studies");
      return r.json();
    },
    enabled: !!user,
  });

  const { data: clientReports = [], isLoading: loadingClientReports } = useQuery<PortalClientReport[]>({
    queryKey: ["/api/member/client-reports", user?.companyId],
    queryFn: async () => {
      const r = await fetch("/api/member/client-reports");
      if (!r.ok) throw new Error("Failed to fetch client reports");
      return r.json();
    },
    enabled: !!user,
  });

  const { data: portalFeed, isLoading: loadingPortalFeed } = usePortalFeed(!!user);
  const availableSignals = portalFeed?.signals ?? [];
  const availableGaps = portalFeed?.gaps ?? [];
  const availableNextSteps = portalFeed?.nextSteps ?? [];

  const signalCount = availableSignals.length;
  const recsCount = availableNextSteps.length;

  const basicCredits = company
    ? Math.max(0, (company.basicCreditsTotal ?? 0) - (company.basicCreditsUsed ?? 0))
    : 0;
  const proCredits = company
    ? Math.max(0, (company.proCreditsTotal ?? 0) - (company.proCreditsUsed ?? 0))
    : 0;
  const showLowCreditsBanner = !loadingCompany && basicCredits <= 2 && !(basicCredits === 0 && proCredits === 0);

  const studiesDone = useMemo(
    () => studies.filter((study) => study.status === "COMPLETED").length,
    [studies],
  );
  const liveStudies = useMemo(
    () => studies.filter((study) => LIVE_STUDY_STATUSES.has(study.status)).length,
    [studies],
  );

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const dataLoading = loadingCompany || loadingStudies || loadingPortalFeed;
  const nextAction = useMemo(
    () =>
      dataLoading
        ? null
        : deriveNextBestAction({
            studies,
            signalCount,
            recommendationCount: recsCount,
            basicCredits,
            proCredits,
          }),
    [basicCredits, proCredits, recsCount, signalCount, studies, dataLoading],
  );

  const sortedClientReports = useMemo(
    () => [...clientReports].sort((a, b) => {
      const aDate = new Date(a.deliveredAt ?? a.uploadedAt ?? a.createdAt).getTime();
      const bDate = new Date(b.deliveredAt ?? b.uploadedAt ?? b.createdAt).getTime();
      return bDate - aDate;
    }),
    [clientReports],
  );
  const recentProjectStudies = useMemo(
    () => [...studies]
      .sort((a, b) => {
        const aIsLive = LIVE_STUDY_STATUSES.has(a.status);
        const bIsLive = LIVE_STUDY_STATUSES.has(b.status);
        if (aIsLive !== bIsLive) {
          return aIsLive ? -1 : 1;
        }
        const aDate = new Date(a.statusUpdatedAt ?? a.deliveryDate ?? a.createdAt).getTime();
        const bDate = new Date(b.statusUpdatedAt ?? b.deliveryDate ?? b.createdAt).getTime();
        return bDate - aDate;
      })
      .slice(0, 3),
    [studies],
  );
  const studyClientOptions = useMemo(
    () => Array.from(new Set(sortedClientReports.map((study) => study.companyName).filter(Boolean))),
    [sortedClientReports],
  );
  const filteredStudies = useMemo(
    () => sortedClientReports
      .filter((study) => {
        const matchesSearch = !studySearch || study.title?.toLowerCase().includes(studySearch.toLowerCase());
        const matchesClient = selectedClient === "all" || study.companyName === selectedClient;
        return matchesSearch && matchesClient;
      })
      .slice(0, 6),
    [selectedClient, sortedClientReports, studySearch],
  );

  const explorePreviewItems = useMemo<PhasePreviewItem[]>(() => {
    if (loadingPortalFeed) return [{ dotColor: VIO, text: "Loading…" }];

    if (availableSignals.length === 0) {
      return [
        {
          dotColor: VIO,
          text: "No market signals yet",
          sub: "Open Explore to browse the library when signals are available.",
          chip: { label: "Empty", bg: VIO_LT, color: VIO },
          onClick: () => setLocation("/portal/explore"),
        },
      ];
    }

    return availableSignals.slice(0, 3).map((signal) => ({
      dotColor: signal.tagColor,
      text: signal.title,
      sub: signal.meta,
      chip: signal.chip,
      onClick: () => setLocation(signal.slug ? `/portal/explore/insights/${signal.slug}` : "/portal/explore"),
    }));
  }, [availableSignals, loadingPortalFeed, setLocation]);

  const testPreviewItems = useMemo<PhasePreviewItem[]>(() => {
    if (loadingStudies) return [{ dotColor: AMBER_DK, text: "Loading…" }];

    if (recentProjectStudies.length === 0) {
      return [
        {
          dotColor: SUCCESS,
          text: "Launch your first Test24 brief",
          sub: "This is where an idea becomes a real consumer study.",
          chip: { label: "Launch brief", bg: SUCCESS_LT, color: SUCCESS },
          onClick: () => setLocation("/portal/launch"),
        },
      ];
    }

    return recentProjectStudies.map((study) => {
      const status = formatStudyStatus(study.status);
      return {
        dotColor: study.status === "COMPLETED" ? SUCCESS : AMBER_DK,
        text: study.title,
        sub: `${study.companyName} · ${status.label}`,
        chip: study.status === "COMPLETED"
          ? { label: "Done", bg: SUCCESS_LT, color: SUCCESS }
          : { label: "Live", bg: AMBER_LT, color: AMBER_DK },
        onClick: () => setLocation("/portal/test"),
      };
    });
  }, [loadingStudies, recentProjectStudies, setLocation]);

  const actPreviewItems = useMemo<PhasePreviewItem[]>(() => {
    if (loadingPortalFeed) return [{ dotColor: CORAL, text: "Loading…" }];

    const hasResearchEvidence = studiesDone > 0 || sortedClientReports.length > 0;
    if (!hasResearchEvidence) {
      return [
        {
          dotColor: CORAL,
          text: "Act comes after evidence",
          sub: "Launch a Test24 brief first, then recommendations can be generated from the evidence.",
          chip: { label: "Launch brief", bg: CORAL_LT, color: CORAL },
          onClick: () => setLocation("/portal/launch"),
        },
      ];
    }

    const gapItems = availableGaps.slice(0, 1).map((gap) => ({
      dotColor: gap.priorityStyle.color,
      text: gap.title,
      sub: truncateText(gap.desc),
      chip: gap.chip,
      onClick: () => setLocation("/portal/act"),
    }));

    const nextStepItems = availableNextSteps
      .filter((step) => !/launch.*brief|test24/i.test(`${step.title} ${step.desc}`))
      .slice(0, 2)
      .map((step) => ({
        dotColor: step.cta?.primary ? CORAL : SUCCESS,
        text: step.title,
        sub: truncateText(step.desc),
        chip: step.cta
          ? {
              label: step.cta.primary ? "Next step" : "Explore",
              bg: step.cta.primary ? CORAL_LT : SUCCESS_LT,
              color: step.cta.primary ? CORAL : SUCCESS,
            }
          : undefined,
        onClick: () => {
          if (step.cta?.action === "explore") setLocation("/portal/explore");
          else if (step.cta?.action === "test") setLocation("/portal/test");
          else setLocation("/portal/act");
        },
      }));

    const items = [...gapItems, ...nextStepItems].slice(0, 3);
    if (items.length > 0) return items;

    return [
      {
        dotColor: CORAL,
        text: "No strategic recommendations available yet",
        sub: "Action suggestions will show here once portfolio data is available.",
        chip: { label: "Empty", bg: CORAL_LT, color: CORAL },
        onClick: () => setLocation("/portal/act"),
      },
    ];
  }, [availableGaps, availableNextSteps, loadingPortalFeed, setLocation, sortedClientReports.length, studiesDone]);

  const dismissOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setShowOnboarding(false);
  };

  return (
    <PortalLayout>
      <div className="flex-1 overflow-y-auto" style={{ background: CREAM }}>
        <div className="p-6 space-y-5">

          {/* ── Hero card ── */}
          <div
            className="rounded-2xl p-6 flex items-start justify-between gap-6 flex-wrap"
            style={{ background: `linear-gradient(135deg, ${VDK} 0%, #2A2660 60%, #3A3575 100%)` }}
            data-testid="hero-card"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-2" style={{ color: CORAL }}>
                <Sparkles className="w-3 h-3" />
                {greeting}, {user?.name?.split(" ")[0]} &middot;&nbsp;
                {isPaidMember ? (user?.membershipTier?.toUpperCase() || "STARTER") : "FREE"} TIER
              </div>
              <h1 className="font-serif text-4xl text-white mb-1.5">Dashboard</h1>
              <p className="text-sm max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                Where your company is in the Explore → Test → Act cycle, and what to do next.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ color: "#fff", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                data-testid="button-dashboard-tour"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How this dashboard works
              </button>
            </div>
            <div className="flex items-center gap-6 flex-shrink-0 flex-wrap">
              {[
                { val: loadingCompany ? null : basicCredits, label: "Basic credits" },
                { val: loadingCompany ? null : proCredits,   label: "Pro credits"   },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-center" data-testid={`hero-stat-${i}`}>
                    <div className="text-4xl font-bold font-mono text-white leading-none">
                      {s.val === null ? <Skeleton className="h-9 w-8 inline-block bg-white/20" /> : s.val}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-10 self-center" style={{ background: "rgba(255,255,255,0.15)" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Low credit warning ── */}
          {showLowCreditsBanner && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap" style={{ background: AMBER_LT, border: `1px solid ${AMBER_DK}33` }} data-testid="banner-low-credits">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: AMBER_DK }} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold" style={{ color: AMBER_DK }}>Low credits — </span>
                <span className="text-sm" style={{ color: "#7a5c10" }}>
                  You have <strong>{basicCredits}</strong> Basic credit{basicCredits !== 1 ? "s" : ""} remaining.
                  {proCredits <= 0 && " Pro credits are also at zero."} Top up to keep researching.
                </span>
              </div>
              <button
                onClick={() => setLocation("/portal/credits")}
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: AMBER_DK, color: "#fff", borderRadius: 8 }}
                data-testid="button-manage-credits-warn"
              >
                Top up credits →
              </button>
            </div>
          )}

          {/* ── Next best action ── */}
          <NextBestActionCard action={nextAction} loading={dataLoading} onNavigate={setLocation} />

          {/* ── Snapshot KPI row (Explore / Test / Act mapped) ── */}
          <div>
            <div className="flex items-end justify-between gap-4 mb-3 flex-wrap">
              <div>
                <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: CORAL }}>
                  Current snapshot
                </div>
                <h2 className="font-serif text-2xl leading-tight" style={{ color: VDK }}>
                  What do we have right now?
                </h2>
              </div>
              <p className="text-sm leading-relaxed max-w-xl" style={{ color: N500 }}>
                A quick count of active market signals, live research, and action recommendations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SnapshotMetric
                label="Signals"
                value={loadingPortalFeed ? null : signalCount}
                helper="Explore library"
                color={VIO}
                onClick={() => setLocation("/portal/explore")}
              />
              <SnapshotMetric
                label="Live studies"
                value={loadingStudies ? null : liveStudies}
                helper="Currently in field"
                color={SUCCESS}
                onClick={() => setLocation("/portal/test")}
              />
              <SnapshotMetric
                label="Recommendations"
                value={loadingPortalFeed ? null : recsCount}
                helper={studiesDone > 0 || sortedClientReports.length > 0 ? "Ready in Act" : "Unlock after Test"}
                color={CORAL}
                onClick={() => setLocation("/portal/act")}
              />
            </div>
          </div>

          <SectionHeader
            eyebrow="Where am I in the innovation cycle?"
            title="Choose the step that matches your question"
            description="Explore is for market context, Test is for validating an idea, and Act is for deciding what to do once evidence exists."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PhasePreviewCard
              num="1"
              title="Explore"
              subtitle="What is happening in my market?"
              description="Use this for inspiration, category context, and market signals before choosing what to test."
              color={VIO}
              onOpen={() => setLocation("/portal/explore")}
              actionLabel="Open Explore"
              items={explorePreviewItems}
            />
            <PhasePreviewCard
              num="2"
              title="Test"
              subtitle="Does my idea work?"
              description="Use this to launch a Test24 brief, track live studies, and review research results."
              color={SUCCESS}
              onOpen={() => setLocation(recentProjectStudies.length > 0 ? "/portal/test" : "/portal/launch")}
              actionLabel={recentProjectStudies.length > 0 ? "Open Test" : "Launch brief"}
              items={testPreviewItems}
            />
            <PhasePreviewCard
              num="3"
              title="Act"
              subtitle="What should we do next?"
              description="Use this after evidence exists, when you need gaps, recommendations, and next steps."
              color={CORAL}
              onOpen={() => setLocation("/portal/act")}
              actionLabel="Open Act"
              items={actPreviewItems}
            />
          </div>

          {/* ── Studies portfolio (table) ── */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold" style={{ color: VDK }}>
                  Studies
                  <span className="ml-2 text-xs font-normal" style={{ color: N500 }}>
                    {studiesDone} of {studies.length} completed
                  </span>
                </div>
                <div className="text-xs" style={{ color: N500 }}>
                  Completed research lives here. Use it to review evidence or move into Act.
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: N500 }} />
                  <input
                    value={studySearch}
                    onChange={e => setStudySearch(e.target.value)}
                    className="rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none"
                    style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK, width: 160 }}
                    placeholder="Search…"
                    data-testid="input-study-search"
                  />
                </div>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="rounded-lg px-3 py-2 text-xs focus:outline-none"
                  style={{ background: "#fff", border: `1px solid ${N200}`, color: VDK }}
                  data-testid="select-client-filter"
                >
                  <option value="all">All Clients</option>
                  {studyClientOptions.map((clientName) => (
                    <option key={clientName} value={clientName}>
                      {clientName}
                    </option>
                  ))}
                </select>
                <button onClick={() => setLocation("/portal/test")} className="text-xs font-semibold flex items-center gap-1" style={{ color: VIO }} data-testid="link-view-all-studies">
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {loadingClientReports ? (
              <div style={CARD} className="p-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 py-3" style={i < 3 ? { borderBottom: `1px solid ${N200}` } : {}}>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-1.5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-7 w-24" />
                  </div>
                ))}
              </div>
            ) : filteredStudies.length > 0 ? (
              <StudiesTable
                rows={filteredStudies}
                onActClick={() => setLocation("/portal/act")}
              />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No studies yet"
                description="Launch your first brief to start collecting consumer insights."
                action={
                  <button
                    onClick={() => setLocation("/portal/launch")}
                    data-testid="button-launch-first-brief"
                    className="text-sm font-semibold px-5 py-2 text-white rounded-lg"
                    style={{ background: CORAL }}
                  >
                    Launch a Brief
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
      {showOnboarding && (
        <DashboardOnboardingModal
          onClose={dismissOnboarding}
          onExplore={() => { dismissOnboarding(); setLocation("/portal/explore"); }}
          onTest={() => { dismissOnboarding(); setLocation("/portal/launch"); }}
          onAct={() => { dismissOnboarding(); setLocation("/portal/act"); }}
        />
      )}
    </PortalLayout>
  );
}

/* ── Next best action card ─────────────────────────────────── */
function NextBestActionCard({
  action,
  loading,
  onNavigate,
}: {
  action: ReturnType<typeof deriveNextBestAction> | null;
  loading: boolean;
  onNavigate: (to: string) => void;
}) {
  if (loading || !action) {
    return (
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ ...CARD, border: `1px solid ${CORAL}26`, background: `${CORAL}08` }}
        data-testid="next-best-action-loading"
      >
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 flex-wrap"
      style={{ ...CARD, border: `1px solid ${CORAL}26`, background: `${CORAL}08` }}
      data-testid="next-best-action"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5" style={{ color: CORAL }}>
          <Sparkles className="w-3 h-3" />
          Next best action
        </div>
        <div className="text-base font-medium leading-snug" style={{ color: VDK }}>
          {action.headline}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onNavigate(action.primary.to)}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white inline-flex items-center gap-1.5"
          style={{ background: CORAL }}
          data-testid="next-best-action-primary"
        >
          {action.primary.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {action.secondary && (
          <button
            type="button"
            onClick={() => onNavigate(action.secondary!.to)}
            className="text-sm font-semibold px-3 py-2 rounded-lg"
            style={{ color: VDK }}
            data-testid="next-best-action-secondary"
          >
            {action.secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: CORAL }}>
          {eyebrow}
        </div>
        <h2 className="font-serif text-2xl leading-tight" style={{ color: VDK }}>
          {title}
        </h2>
      </div>
      <p className="text-sm leading-relaxed max-w-xl" style={{ color: N500 }}>
        {description}
      </p>
    </div>
  );
}

function SnapshotMetric({ label, value, helper, color, onClick }: {
  label: string;
  value: number | null;
  helper: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, ${color}1F 0%, ${color}08 100%)`,
        border: `1px solid ${color}2E`,
        boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.03)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color }}>
            {label}
          </div>
          <div className="text-xs" style={{ color: N500 }}>
            {helper}
          </div>
        </div>
        <div className="text-3xl font-bold font-mono leading-none" style={{ color: VDK }}>
          {value === null ? <Skeleton className="h-8 w-8" /> : value}
        </div>
      </div>
    </button>
  );
}

function DashboardOnboardingModal({
  onClose,
  onExplore,
  onTest,
  onAct,
}: {
  onClose: () => void;
  onExplore: () => void;
  onTest: () => void;
  onAct: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(30,27,58,0.62)", backdropFilter: "blur(10px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-tour-title"
      data-testid="dashboard-onboarding-modal"
    >
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 24px 80px rgba(0,0,0,.28)" }}>
        <div className="p-6 md:p-7 flex items-start justify-between gap-4" style={{ background: `linear-gradient(135deg, ${VDK} 0%, #2A2660 100%)` }}>
          <div>
            <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: CORAL }}>
              Start here
            </div>
            <h2 id="dashboard-tour-title" className="font-serif text-3xl text-white mb-2">
              The dashboard follows one simple cycle.
            </h2>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,.68)" }}>
              Use Explore to understand the market, Test to validate an idea, and Act to decide what to do with the evidence.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}
            aria-label="Close dashboard tour"
            data-testid="button-close-dashboard-tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 md:p-6">
          <TourStep
            num="1"
            color={VIO}
            title="Explore"
            question="What is happening in my market?"
            body="Start here when you need trends, signals, category context, or inspiration before choosing what to test."
            action="Open Explore"
            onClick={onExplore}
          />
          <TourStep
            num="2"
            color={SUCCESS}
            title="Test"
            question="Does my idea work?"
            body="Launch a Test24 brief here. This turns a concept into consumer evidence your team can trust."
            action="Launch a brief"
            onClick={onTest}
          />
          <TourStep
            num="3"
            color={CORAL}
            title="Act"
            question="What should we do next?"
            body="Come here after research exists. Act translates studies into gaps, recommendations, and next steps."
            action="Open Act"
            onClick={onAct}
          />
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold px-5 py-2.5 rounded-lg text-white"
            style={{ background: VDK }}
            data-testid="button-finish-dashboard-tour"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function TourStep({ num, color, title, question, body, action, onClick }: {
  num: string;
  color: string;
  title: string;
  question: string;
  body: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col" style={{ border: `1px solid ${color}26`, background: `${color}0F` }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono" style={{ color, border: `2px solid ${color}` }}>
          {num}
        </span>
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color }}>
          {title}
        </span>
      </div>
      <div className="font-serif text-xl mb-2 leading-tight" style={{ color: VDK }}>
        {question}
      </div>
      <p className="text-sm leading-relaxed flex-1" style={{ color: N500 }}>
        {body}
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white"
        style={{ background: color }}
      >
        {action}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Phase Preview Card ───────────────────────────────────── */
function PhasePreviewCard({ num, title, subtitle, description, color, onOpen, actionLabel = "Open", items }: {
  num: string; title: string; subtitle: string; description: string; color: string; onOpen: () => void; actionLabel?: string;
  items: PhasePreviewItem[];
}) {
  return (
    <div
      className="portal-card-static overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${color}1F 0%, ${color}08 100%)`,
        border: `1px solid ${color}2E`,
        boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.03)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${color}24`, background: `${color}14` }}
      >
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono" style={{ border: `2px solid ${color}`, color, background: "#fff" }}>
            {num}
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: VDK }}>{title}</div>
            <div className="text-[11px]" style={{ color: N500 }}>{subtitle}</div>
          </div>
        </div>
        <button className="text-xs font-semibold flex items-center gap-0.5" style={{ color }} onClick={onOpen} data-testid={`phase-open-${num}`}>
          {actionLabel} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      <div className="px-4 pt-3 text-xs leading-relaxed" style={{ color: N500 }}>
        {description}
      </div>
      <div className="p-3 space-y-1.5">
        {items.map((item, i) => {
          const interactive = typeof item.onClick === "function";
          const content = (
            <>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dotColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs leading-snug font-medium" style={{ color: VDK }}>{item.text}</div>
                {item.sub && <div className="text-[11px] mt-0.5 leading-snug" style={{ color: N500 }}>{item.sub}</div>}
              </div>
              {item.chip && (
                <span className="text-[10px] font-bold px-2 py-0.5 flex-shrink-0 rounded-full" style={{ background: item.chip.bg, color: item.chip.color }}>
                  {item.chip.label}
                </span>
              )}
            </>
          );

          const rowStyle: React.CSSProperties = {
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${color}1F`,
          };

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={item.onClick}
                className="phase-preview-row w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg"
                style={rowStyle}
                data-testid={`phase-preview-item-${num}-${i}`}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg" style={rowStyle}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Studies Table ────────────────────────────────────────── */
function StudiesTable({
  rows,
  onActClick,
}: {
  rows: any[];
  onActClick: () => void;
}) {
  return (
    <div className="overflow-hidden" style={CARD}>
      <Table>
        <TableHeader>
          <TableRow style={{ background: "#FAFAFA", borderColor: N200 }}>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase" style={{ color: N500 }}>
              Title
            </TableHead>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase" style={{ color: N500 }}>
              Client
            </TableHead>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase" style={{ color: N500 }}>
              Type
            </TableHead>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase" style={{ color: N500 }}>
              Status
            </TableHead>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase text-right" style={{ color: N500 }}>
              Top idea
            </TableHead>
            <TableHead className="text-[11px] font-bold tracking-widest uppercase text-right" style={{ color: N500 }}>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((study) => (
            <StudyRow key={study.id} study={study} onActClick={onActClick} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StudyRow({ study, onActClick }: { study: any; onActClick: () => void }) {
  const typeBadge = (() => {
    const t = study.studyType?.toLowerCase() || "";
    if (t.includes("pro")) return { label: "PRO",   bg: VIO_LT,  color: VIO     };
    return                        { label: "BASIC", bg: CYAN_LT, color: CYAN_DK };
  })();

  const statusBadge = study.status ? formatStudyStatus(study.status) : null;
  const topIdea = study.topIdeaIdeaScore;

  return (
    <TableRow style={{ borderColor: N200 }} data-testid={`study-row-${study.id}`}>
      <TableCell className="py-3">
        <div className="text-sm font-semibold leading-snug" style={{ color: VDK }}>
          {study.title}
        </div>
        {study.respondentCount && (
          <div className="text-[11px] mt-0.5" style={{ color: N500 }}>
            {study.respondentCount} respondents
          </div>
        )}
      </TableCell>
      <TableCell className="py-3 text-sm" style={{ color: VDK }}>
        {study.companyName ?? "—"}
        {study.industry && (
          <div className="text-[11px]" style={{ color: N500 }}>
            {study.industry}
          </div>
        )}
      </TableCell>
      <TableCell className="py-3">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
          style={{ background: typeBadge.bg, color: typeBadge.color }}
        >
          {typeBadge.label}
        </span>
      </TableCell>
      <TableCell className="py-3">
        {statusBadge && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
            style={{ background: statusBadge.bg, color: statusBadge.color }}
          >
            {statusBadge.label}
          </span>
        )}
      </TableCell>
      <TableCell className="py-3 text-right">
        {typeof topIdea === "number" ? (
          <span className="font-mono text-base font-bold" style={{ color: metricColor(topIdea) }}>
            {topIdea}%
          </span>
        ) : (
          <span className="text-xs" style={{ color: N500 }}>—</span>
        )}
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={onActClick}
            data-testid={`button-act-study-${study.id}`}
            className="text-xs font-semibold px-3 py-1.5 text-white rounded-lg"
            style={{ background: VIO }}
          >
            Analyse
          </button>
          {study.pdfUrl && (
            <button
              onClick={() => window.open(study.pdfUrl, "_blank")}
              data-testid={`button-download-study-${study.id}`}
              className="text-xs font-semibold px-2.5 py-1.5 inline-flex items-center gap-1 rounded-lg"
              style={{ border: `1px solid ${N200}`, color: N500, background: "#fff" }}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
