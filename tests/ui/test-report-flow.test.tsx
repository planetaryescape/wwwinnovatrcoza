import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConceptDetailPanel from "@/components/dig/ConceptDetailPanel";
import ActPage from "@/pages/portal/ActPage";
import ReportDetailPage from "@/pages/portal/ReportDetailPage";
import TestPage from "@/pages/portal/TestPage";
import type { DigStudy } from "@/lib/dig-api.types";

let currentLocation = "/portal/test";
const setLocation = vi.fn((next: string) => {
  currentLocation = next;
});
let loadingConceptList = false;
let loadingConceptId: string | null = null;
let portalFeedResponse: unknown;

const activeCompany = {
  id: "company-revlon",
  name: "Revlon",
  tier: "SCALE",
  basicCreditsTotal: 25,
  basicCreditsUsed: 0,
  proCreditsTotal: 4,
  proCreditsUsed: 0,
};

const authValue = {
  user: {
    id: "user-hannah",
    name: "Hannah Steven",
    email: "hannah@example.test",
    companyId: activeCompany.id,
    company: activeCompany.name,
    membershipTier: "SCALE",
    role: "ADMIN",
  },
  isAuthenticated: true,
  isLoading: false,
  isPaidMember: true,
  isAdmin: true,
  impersonation: { isImpersonating: false },
  exitImpersonation: vi.fn(),
  isViewingAsCompany: false,
  viewingCompanyName: null,
  memberships: [
    {
      id: "membership-revlon",
      userId: "user-hannah",
      companyId: activeCompany.id,
      role: "ADMIN",
      status: "ACTIVE",
      company: activeCompany,
    },
  ],
  activeCompany,
  switchCompany: vi.fn(),
  logout: vi.fn(),
};

const studies: DigStudy[] = [
  {
    id: "dig-pending",
    title: "Stale Revlon ingest",
    source_study_name: "Stale Revlon ingest",
    public_client_report_id: "report-revlon",
    ingest_status: "pending",
    file_count: 7,
    respondent_count: 0,
    concept_count: 0,
    created_at: "2026-04-20T10:00:00Z",
    updated_at: "2026-04-20T10:00:00Z",
  },
  {
    id: "dig-ready",
    title: "Revlon: RS Concept Testing Round 1",
    source_study_name: "Revlon: RS Concept Testing Round 1",
    public_client_report_id: "report-revlon",
    ingest_status: "ready",
    file_count: 7,
    respondent_count: 100,
    concept_count: 12,
    created_at: "2026-04-19T10:00:00Z",
    updated_at: "2026-04-21T10:00:00Z",
  },
];

vi.mock("wouter", () => ({
  useLocation: () => [currentLocation, setLocation],
  useRoute: (pattern: string) => {
    if (pattern === "/portal/reports/:id" && currentLocation.startsWith("/portal/reports/")) {
      return [true, { id: currentLocation.split("/").pop()?.split("?")[0] }];
    }
    return [false, null];
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authValue,
}));

vi.mock("@/components/portal/MobilePortalNav", () => ({
  MobilePortalNav: () => null,
}));

vi.mock("@/components/portal/AIQueryPanel", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");
  type SelectState = {
    value: string;
    onValueChange?: (value: string) => void;
  };
  const SelectContext = React.createContext<SelectState>({ value: "" });

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: SelectState & { children: React.ReactNode }) =>
      React.createElement(SelectContext.Provider, { value: { value, onValueChange } }, children),
    SelectTrigger: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
      React.createElement("button", { type: "button", role: "combobox", ...props }, children),
    SelectValue: ({ placeholder }: { placeholder?: string }) =>
      React.createElement("span", null, placeholder),
    SelectContent: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { role: "listbox" }, children),
    SelectItem: ({
      value,
      children,
    }: {
      value: string;
      children: React.ReactNode;
    }) => {
      const select = React.useContext(SelectContext);
      return React.createElement(
        "button",
        {
          type: "button",
          role: "option",
          "aria-selected": select.value === value,
          onClick: () => select.onValueChange?.(value),
        },
        children,
      );
    },
  };
});

vi.mock("recharts", () => {
  const passthrough = ({ children, data, ...props }: any) => (
    <div data-chart={props.dataKey ?? props.name ?? "chart"}>
      {Array.isArray(data) && data.map((row) => <span key={row.fullLabel ?? row.name}>{row.fullLabel ?? row.name}</span>)}
      {children}
    </div>
  );
  return {
    ResponsiveContainer: passthrough,
    BarChart: passthrough,
    Bar: ({ name, dataKey }: { name?: string; dataKey?: string }) => (
      <div data-testid={`bar-${dataKey}`}>{name}</div>
    ),
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: ({ formatter }: { formatter?: (value: number, name: string, item: { dataKey?: string }) => [string, string] }) => {
      if (!formatter) return null;
      const [commitmentValue, commitmentLabel] = formatter(55, "Interest", { dataKey: "winRate" });
      const [interestValue, interestLabel] = formatter(83, "Interest", { dataKey: "interest" });
      return (
        <div data-testid="mock-ranking-tooltip">
          {commitmentLabel}: {commitmentValue}
          {" · "}
          {interestLabel}: {interestValue}
        </div>
      );
    },
    Legend: () => null,
  };
});

vi.mock("@/lib/dig-api", () => ({
  useDigStudies: () => ({ data: { studies }, isLoading: false }),
  useDigRanking: (studyId: string) => ({
    data: {
      ranking: [
        {
          rank: 1,
          concept_id: `concept-${studyId}`,
          name: studyId === "dig-ready" ? "Ready Revlon Concept" : "Stale Pending Concept",
          wins: 55,
          losses: 45,
          win_rate: 55,
          interest_rate: 83,
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useDigConcepts: () => ({
    data: loadingConceptList ? undefined : {
      concepts: [
        {
          id: "concept-vanilla",
          name: "Co: I love Vanilla",
          concept_type: "control",
          brand: "I love",
          product_name: "Vanilla",
          product_format: "Body Lotion",
          segments: [],
          interest_sample: 100,
          interest_rate: 83,
          commitment_sample: 100,
          wins: 55,
          losses: 45,
          win_rate: 55,
        },
        {
          id: "concept-surface",
          name: "New: SURFACE",
          concept_type: "new",
          brand: "SURFACE",
          product_name: "Surface",
          product_format: "Lotion",
          segments: [],
          interest_sample: 100,
          interest_rate: 80,
          commitment_sample: 100,
          wins: 50,
          losses: 50,
          win_rate: 50,
        },
      ],
    },
    isLoading: loadingConceptList,
    error: null,
  }),
  useDigConcept: (_studyId: string, conceptId: string) => {
    if (loadingConceptId === conceptId) {
      return { data: undefined, isLoading: true };
    }

    return {
      data: {
        concept: {
          id: conceptId,
          name: conceptId === "concept-surface" ? "New: SURFACE" : "Co: I love Vanilla",
          concept_type: conceptId === "concept-surface" ? "new" : "control",
          brand: conceptId === "concept-surface" ? "SURFACE" : "I love",
          product_name: conceptId === "concept-surface" ? "Surface" : "Vanilla",
          product_format: "Body Lotion",
          segments: [],
          evaluation_count: 100,
          emotions: [],
          agreements: [],
          themes: [{ theme_category: "clarity", mentions: 12, positive: 10, negative: 2, neutral: 0 }],
          sample_verbatims: [{ respondent_external_id: "1", clarity_label: "clear", comment: `Comment for ${conceptId}` }],
        },
      },
      isLoading: false,
    };
  },
}));

vi.mock("@/components/dig/ConceptRankingTable", () => ({
  default: ({ studyId }: { studyId: string }) => (
    <div data-testid="ranking-study-id">{studyId}</div>
  ),
}));

function renderWithQuery(
  ui: React.ReactElement,
  {
    searchParams = window.location.search,
    onUrlUpdate = vi.fn<[UrlUpdateEvent]>(),
  }: {
    searchParams?: string;
    onUrlUpdate?: ReturnType<typeof vi.fn<[UrlUpdateEvent]>>;
  } = {},
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    onUrlUpdate,
    ...render(
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
        <QueryClientProvider client={client}>
          {ui}
        </QueryClientProvider>
      </NuqsTestingAdapter>,
    ),
  };
}

function installFetchMock() {
  vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url === "/api/member/client-reports") {
      return new Response(JSON.stringify([
        {
          id: "report-revlon",
          title: "Revlon: RS Concept Testing Round 1",
          studyType: "Test24 Basic",
          status: "Completed",
          createdAt: "2026-04-21T10:00:00Z",
        },
      ]), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url === "/api/member/activity") {
      return new Response(JSON.stringify({ basicCreditsRemaining: 25, proCreditsRemaining: 4 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "/api/trends/has-new") {
      return new Response(JSON.stringify({ hasNew: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "/api/member/portal-feed") {
      return new Response(JSON.stringify(portalFeedResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url === "/api/member/studies") {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unhandled ${url}` }), { status: 404 });
  }));
}

function installBrowserShims() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  Element.prototype.scrollIntoView ??= vi.fn();
}

describe("Test study report flow", () => {
  beforeEach(() => {
    currentLocation = "/portal/test";
    loadingConceptList = false;
    loadingConceptId = null;
    portalFeedResponse = {
      signals: [],
      gaps: [],
      nextSteps: [],
      coverage: [],
      planningPrompts: [],
      consultOffers: [],
    };
    setLocation.mockClear();
    window.history.replaceState(null, "", "/portal/test");
    installBrowserShims();
    installFetchMock();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("labels ranking bars as interest and commitment, and uses the ready Dig study", async () => {
    renderWithQuery(<TestPage />);

    expect(await screen.findByText(/Ready Revlon/)).toBeInTheDocument();
    expect(screen.queryByText("Stale Pending Concept")).not.toBeInTheDocument();
    expect(screen.getByText("Commitment win rate")).toBeInTheDocument();
    expect(screen.getByText("Interest")).toBeInTheDocument();
    expect(screen.getByTestId("mock-ranking-tooltip")).toHaveTextContent("Commitment win rate: 55%");
    expect(screen.getByTestId("mock-ranking-tooltip")).toHaveTextContent("Interest: 83%");
  });

  it("uses the canonical launch route instead of a duplicate Test launch tab", async () => {
    renderWithQuery(<TestPage />);

    expect(screen.queryByTestId("tab-test-brief")).not.toBeInTheDocument();
    expect(screen.queryByText("How would you like to submit your brief?")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("button-launch-brief"));
    expect(setLocation).toHaveBeenCalledWith("/portal/launch");
  });

  it("sends Analyse in Act to Act and disables unavailable exports", async () => {
    renderWithQuery(<TestPage />);

    await userEvent.click(await screen.findByTestId("button-act-study-report-revlon"));
    expect(setLocation).toHaveBeenCalledWith("/portal/act?tab=nextsteps&reportId=report-revlon");
    expect(screen.getByTestId("button-download-pdf-report-revlon")).toBeDisabled();
  });

  it("opens Act evidence links on the report detail route", async () => {
    currentLocation = "/portal/act";
    portalFeedResponse = {
      signals: [],
      gaps: [
        {
          id: "gap-commitment",
          priority: 1,
          title: "Commitment gap",
          chip: { label: "High Priority", bg: "#FDECEA", color: "#E8503A" },
          desc: "People like it, but the purchase case is not landing yet.",
          cta: "View evidence",
          ctaAction: "evidence",
          ctaHref: "/portal/reports/report-revlon?tab=concepts&concept=concept-vanilla",
          priorityStyle: { bg: "#FDECEA", color: "#E8503A" },
        },
      ],
      nextSteps: [],
      coverage: [],
      planningPrompts: [],
      consultOffers: [],
    };

    renderWithQuery(<ActPage />);

    await userEvent.click(await screen.findByRole("button", { name: /View evidence/ }));
    expect(setLocation).toHaveBeenCalledWith("/portal/reports/report-revlon?tab=concepts&concept=concept-vanilla");
    expect(setLocation).not.toHaveBeenCalledWith("/portal/test");
  });

  it("shows study-aware breadcrumbs and uses the ready Dig study in the full report", async () => {
    currentLocation = "/portal/reports/report-revlon";

    renderWithQuery(<ReportDetailPage />);

    expect((await screen.findAllByText("Dashboard")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Test").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Revlon: RS Concept Testing Round 1")[0]).toBeInTheDocument();
    expect(screen.getByTestId("ranking-study-id")).toHaveTextContent("dig-ready");
    expect(screen.queryByTestId("button-back-to-test")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("tab-report-concepts"));
    expect(screen.getAllByText("Concepts").length).toBeGreaterThan(0);
  });

  it("uses a left concept navigator instead of hiding concept navigation in a dropdown", async () => {
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>();
    renderWithQuery(<ConceptDetailPanel studyId="dig-ready" />, { onUrlUpdate });

    expect(await screen.findByTestId("concept-nav")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Co: I love Vanilla/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /New: SURFACE/ }));

    await waitFor(() => expect(screen.getByText(/Comment for concept-surface/)).toBeInTheDocument());
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("concept")).toBe("concept-surface");
  });

  it("keeps hook order stable when the concept list loads after the skeleton", async () => {
    loadingConceptList = true;
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const renderPanel = () => (
      <NuqsTestingAdapter searchParams="">
        <QueryClientProvider client={client}>
          <ConceptDetailPanel studyId="dig-ready" />
        </QueryClientProvider>
      </NuqsTestingAdapter>
    );
    const { rerender } = render(renderPanel());

    expect(await screen.findByText("Concept Details")).toBeInTheDocument();

    loadingConceptList = false;
    rerender(renderPanel());

    expect(await screen.findByTestId("concept-nav")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Co: I love Vanilla/ })).toBeInTheDocument();
  });

  it("keeps the previous concept visible while a first-time concept detail loads", async () => {
    const onUrlUpdate = vi.fn<[UrlUpdateEvent]>();
    renderWithQuery(<ConceptDetailPanel studyId="dig-ready" />, { onUrlUpdate });

    expect(await screen.findByText(/Comment for concept-vanilla/)).toBeInTheDocument();

    loadingConceptId = "concept-surface";
    await userEvent.click(screen.getByRole("button", { name: /New: SURFACE/ }));

    expect(screen.getByText(/Comment for concept-vanilla/)).toBeInTheDocument();
    expect(screen.queryByTestId("text-concepts-empty")).not.toBeInTheDocument();
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled());
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("concept")).toBe("concept-surface");
  });
});
