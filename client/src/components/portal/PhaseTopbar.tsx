import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PortalThemeToggle } from "./PortalThemeToggle";

const PHASES = [
  { num: "01", key: "explore", label: "Explore", path: "/portal/explore" },
  { num: "02", key: "test",    label: "Test",    path: "/portal/test"    },
  { num: "03", key: "act",     label: "Act",     path: "/portal/act"     },
  { num: "04", key: "health",  label: "Company", path: "/portal/health"  },
];

interface PhaseTopbarProps {
  currentPhase: "explore" | "test" | "act" | "health";
  description?: string;
  primaryAction?: React.ReactNode;
}

export function PhaseTopbar({ currentPhase, description, primaryAction }: PhaseTopbarProps) {
  const [, setLocation] = useLocation();

  const currentIdx = PHASES.findIndex(p => p.key === currentPhase);
  const prevPhase  = PHASES[currentIdx - 1];
  const nextPhase  = PHASES[currentIdx + 1];
  const active     = PHASES[currentIdx];

  return (
    <div
      className="flex items-center justify-between flex-shrink-0 px-4 gap-2"
      style={{
        minHeight: 52,
        background: "var(--pt-topbar-bg)",
        borderBottom: "1px solid var(--pt-topbar-border)",
      }}
    >
      {/* Left: prev arrow + phase strip */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Prev chevron */}
        <button
          onClick={() => prevPhase && setLocation(prevPhase.path)}
          disabled={!prevPhase}
          aria-label={prevPhase ? `Go to ${prevPhase.label}` : undefined}
          data-testid="button-phase-prev"
          style={{
            width: 28, height: 28, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            background: prevPhase ? "var(--pt-nav-btn-bg)" : "transparent",
            border: prevPhase ? "1px solid var(--pt-nav-btn-border)" : "1px solid transparent",
            color: prevPhase ? "var(--pt-nav-btn-color)" : "var(--pt-nav-btn-disabled)",
            cursor: prevPhase ? "pointer" : "default",
            opacity: prevPhase ? 1 : 0.3,
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Phase step pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar" style={{ minWidth: 0 }}>
          {PHASES.map((phase) => {
            const isActive = phase.key === currentPhase;
            return (
              <button
                key={phase.key}
                onClick={() => setLocation(phase.path)}
                data-testid={`button-phase-step-${phase.key}`}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px",
                  borderRadius: 6,
                  flexShrink: 0,
                  background: isActive ? "var(--pt-step-active-bg)" : "transparent",
                  border: isActive ? "1px solid var(--pt-step-active-border)" : "1px solid transparent",
                  color: isActive ? "var(--pt-step-active-color)" : "var(--pt-step-idle-color)",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 18, height: 18, borderRadius: 9999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, flexShrink: 0,
                    background: isActive ? "var(--pt-step-active-bubble)" : "transparent",
                    border: isActive ? "none" : "1px solid var(--pt-step-bubble-border)",
                    color: isActive ? "#fff" : "var(--pt-step-bubble-idle-color)",
                  }}
                >
                  {phase.num}
                </span>
                <span className="text-[11px] font-semibold hidden sm:inline">{phase.label}</span>
              </button>
            );
          })}
        </div>

        {/* Next chevron */}
        <button
          onClick={() => nextPhase && setLocation(nextPhase.path)}
          disabled={!nextPhase}
          aria-label={nextPhase ? `Go to ${nextPhase.label}` : undefined}
          data-testid="button-phase-next"
          style={{
            width: 28, height: 28, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            background: nextPhase ? "var(--pt-nav-btn-bg)" : "transparent",
            border: nextPhase ? "1px solid var(--pt-nav-btn-border)" : "1px solid transparent",
            color: nextPhase ? "var(--pt-nav-btn-color)" : "var(--pt-nav-btn-disabled)",
            cursor: nextPhase ? "pointer" : "default",
            opacity: nextPhase ? 1 : 0.3,
          }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: phase label + optional description + optional CTA + theme toggle + close */}
      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        <span
          className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 hidden sm:inline-block flex-shrink-0"
          style={{
            background: "var(--pt-step-active-bg)",
            color: "var(--pt-step-active-color)",
            border: "1px solid var(--pt-step-active-border)",
            borderRadius: 6,
          }}
        >
          PHASE {active.num}
        </span>
        <h1 className="font-serif text-base sm:text-lg flex-shrink-0" style={{ color: "var(--pt-title-color)" }}>
          {active.label}
        </h1>
        {description && (
          <span
            className="text-xs truncate hidden md:block"
            style={{ color: "var(--pt-step-idle-color)", maxWidth: 200 }}
            title={description}
          >
            {description}
          </span>
        )}
        {primaryAction && (
          <div className="flex-shrink-0 hidden sm:block">
            {primaryAction}
          </div>
        )}
        <PortalThemeToggle />
        <button
          onClick={() => setLocation("/portal/dashboard")}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 30, height: 30,
            background: "var(--pt-close-bg)",
            color: "var(--pt-close-color)",
            border: "none",
            cursor: "pointer",
          }}
          data-testid="button-close-phase"
          aria-label="Back to dashboard"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
