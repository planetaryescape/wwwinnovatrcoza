import { useState, useEffect, useCallback } from "react";

export type PortalTheme = "dark" | "light";

const STORAGE_KEY = "portal-theme";
const THEME_CHANGE_EVENT = "portal-theme-change";

function readStoredTheme(): PortalTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

function applyTheme(theme: PortalTheme) {
  document.documentElement.setAttribute("data-portal-theme", theme);
}

export function setPortalTheme(theme: PortalTheme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
}

export function usePortalTheme() {
  const [theme, setThemeState] = useState<PortalTheme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);

    function onThemeChange(e: Event) {
      const t = (e as CustomEvent<PortalTheme>).detail;
      setThemeState(t);
    }
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
  }, []);

  const setTheme = useCallback((t: PortalTheme) => {
    setThemeState(t);
    setPortalTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readStoredTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
