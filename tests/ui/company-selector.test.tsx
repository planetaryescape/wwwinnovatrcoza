import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import PortalLayout from "@/pages/portal/PortalLayout";

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

const companyA = {
  id: "company-a",
  name: "Alpha Foods",
  tier: "GROWTH",
  basicCreditsTotal: 10,
  basicCreditsUsed: 1,
  proCreditsTotal: 3,
  proCreditsUsed: 0,
};

const companyB = {
  id: "company-b",
  name: "Beta Drinks",
  tier: "SCALE",
  basicCreditsTotal: 20,
  basicCreditsUsed: 2,
  proCreditsTotal: 5,
  proCreditsUsed: 1,
};

const memberships = [
  {
    id: "membership-a",
    userId: "user-1",
    companyId: companyA.id,
    role: "OWNER",
    status: "ACTIVE",
    company: companyA,
  },
  {
    id: "membership-b",
    userId: "user-1",
    companyId: companyB.id,
    role: "MEMBER",
    status: "ACTIVE",
    company: companyB,
  },
];

function installLocalStorageShim() {
  const values = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    clear: vi.fn(() => {
      values.clear();
    }),
  };

  Object.defineProperty(window, "localStorage", {
    value: storage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
}

function installMatchMediaShim() {
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

  Object.defineProperty(window, "PointerEvent", {
    value: MouseEvent,
    configurable: true,
  });
  Element.prototype.hasPointerCapture ??= vi.fn(() => false);
  Element.prototype.setPointerCapture ??= vi.fn();
  Element.prototype.releasePointerCapture ??= vi.fn();
}

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function installTenantFetchMock(visibleMemberships = memberships) {
  let activeCompany = companyA;

  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url === "/api/auth/me") {
      return jsonResponse({
        id: "user-1",
        email: "member@example.test",
        name: "Member User",
        role: "MEMBER",
        membershipTier: activeCompany.tier,
        isPaidSeat: true,
        activeCompany,
        memberships: visibleMemberships,
      });
    }

    if (url === "/api/member/company") {
      return jsonResponse(activeCompany);
    }

    if (url === "/api/trends/has-new") {
      return jsonResponse({ hasNew: false });
    }

    if (url === "/api/member/client-reports") {
      return jsonResponse([
        {
          id: `report-${activeCompany.id}`,
          title: activeCompany.id === companyA.id ? "Alpha research" : "Beta research",
        },
      ]);
    }

    if (url === "/api/member/active-company" && init?.method === "POST") {
      const body = JSON.parse(String(init.body));
      activeCompany = body.companyId === companyB.id ? companyB : companyA;
      return jsonResponse({ activeCompany, memberships: visibleMemberships });
    }

    if (url === "/api/auth/logout") {
      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: `Unhandled ${url}` }, 404);
  });
}

function installAdminViewAsFetchMock() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();

    if (url === "/api/auth/me") {
      return jsonResponse({
        id: "admin-1",
        email: "admin@example.test",
        name: "Admin User",
        role: "ADMIN",
        membershipTier: "SCALE",
        isPaidSeat: true,
        activeCompany: companyA,
        memberships: [
          {
            id: "admin-membership",
            userId: "admin-1",
            companyId: companyA.id,
            role: "OWNER",
            status: "ACTIVE",
            company: companyA,
          },
        ],
      });
    }

    if (url === "/api/admin/session-company" && init?.method === "POST") {
      return jsonResponse({ activeCompany: companyB });
    }

    if (url === "/api/admin/session-company" && init?.method === "DELETE") {
      return jsonResponse({ activeCompany: null });
    }

    return jsonResponse({ error: `Unhandled ${url}` }, 404);
  });
}

function ReportProbe() {
  const { activeCompany } = useAuth();
  const { data = [] } = useQuery<Array<{ title: string }>>({
    queryKey: ["/api/member/client-reports"],
    enabled: !!activeCompany,
  });

  return <div data-testid="active-report">{data[0]?.title ?? "No report"}</div>;
}

function AdminViewAsProbe() {
  const { impersonateCompany, exitImpersonation, isViewingAsCompany, viewingCompanyName } = useAuth();

  return (
    <div>
      <div data-testid="view-as-state">
        {isViewingAsCompany ? `Viewing ${viewingCompanyName}` : "Not viewing"}
      </div>
      <button type="button" onClick={() => impersonateCompany(companyB.id)}>
        View Beta
      </button>
      <button type="button" onClick={() => exitImpersonation()}>
        Exit view
      </button>
    </div>
  );
}

describe("portal company selector", () => {
  beforeEach(() => {
    installLocalStorageShim();
    installMatchMediaShim();
    window.history.pushState(null, "", "/portal/explore");
    localStorage.clear();
    queryClient.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    queryClient.clear();
  });

  it("shows the active company control even when the user only has one company", async () => {
    vi.stubGlobal("fetch", installTenantFetchMock([memberships[0]]));

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PortalLayout>
            <ReportProbe />
          </PortalLayout>
        </AuthProvider>
      </QueryClientProvider>,
    );

    const selector = await screen.findByTestId("select-active-company");
    expect(selector).toHaveTextContent(companyA.name);
    await userEvent.click(selector);
    expect(await screen.findByRole("option", { name: companyA.name })).toBeInTheDocument();
  });

  it("switches active company and refreshes tenant-sensitive dashboard data", async () => {
    const fetchMock = installTenantFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PortalLayout>
            <ReportProbe />
          </PortalLayout>
        </AuthProvider>
      </QueryClientProvider>,
    );

    const selector = await screen.findByTestId("select-active-company");
    expect(selector).toHaveTextContent(companyA.name);
    expect(await screen.findByText("Alpha research")).toBeInTheDocument();

    await userEvent.click(selector);
    await userEvent.click(await screen.findByRole("option", { name: companyB.name }));

    await waitFor(() =>
      expect(screen.getByTestId("select-active-company")).toHaveTextContent(companyB.name),
    );
    expect(await screen.findByText("Beta research")).toBeInTheDocument();
    expect(screen.queryByText("Alpha research")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/member/active-company",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ companyId: companyB.id }),
      }),
    );
  });

  it("sets and clears server-side company context for admin view-as-company", async () => {
    const fetchMock = installAdminViewAsFetchMock();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminViewAsProbe />
        </AuthProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Not viewing")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "View Beta" }));

    expect(await screen.findByText("Viewing Beta Drinks")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/session-company",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ companyId: companyB.id }),
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Exit view" }));

    await waitFor(() => expect(screen.getByTestId("view-as-state")).toHaveTextContent("Not viewing"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/session-company",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
