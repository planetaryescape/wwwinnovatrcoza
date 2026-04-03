import { Moon, Sun } from "lucide-react";
import { usePortalTheme } from "@/hooks/usePortalTheme";

export function PortalThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = usePortalTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      data-testid="button-portal-theme-toggle"
      className={className}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: "var(--pt-toggle-bg)",
        border: "1px solid var(--pt-toggle-border)",
        color: "var(--pt-toggle-color)",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
