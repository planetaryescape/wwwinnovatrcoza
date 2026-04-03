import { useState, useEffect, useCallback } from "react";

export type PortalTheme = "dark" | "light";

const STORAGE_KEY = "portal-theme";

function applyTheme(theme: PortalTheme) {
  document.documentElement.setAttribute("data-portal-theme", theme);
}

export function usePortalTheme() {
  const [theme, setThemeState] = useState<PortalTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: PortalTheme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
