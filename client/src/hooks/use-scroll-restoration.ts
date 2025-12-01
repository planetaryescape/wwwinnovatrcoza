import { useEffect, useRef, useCallback } from "react";

const SCROLL_POSITIONS_KEY = "scroll-positions";
const THROTTLE_MS = 100;

interface ScrollPositions {
  [path: string]: number;
}

function getScrollPositions(): ScrollPositions {
  try {
    const stored = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveScrollPosition(path: string, position: number) {
  try {
    const positions = getScrollPositions();
    positions[path] = position;
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // Ignore storage errors
  }
}

function getScrollPosition(path: string): number {
  const positions = getScrollPositions();
  return positions[path] || 0;
}

export function useScrollRestoration(key: string) {
  const restored = useRef(false);
  const lastSaveTime = useRef(0);
  const pendingSave = useRef<number | null>(null);

  const throttledSave = useCallback((position: number) => {
    const now = Date.now();
    
    if (pendingSave.current !== null) {
      cancelAnimationFrame(pendingSave.current);
    }

    if (now - lastSaveTime.current >= THROTTLE_MS) {
      saveScrollPosition(key, position);
      lastSaveTime.current = now;
    } else {
      pendingSave.current = requestAnimationFrame(() => {
        saveScrollPosition(key, position);
        lastSaveTime.current = Date.now();
        pendingSave.current = null;
      });
    }
  }, [key]);

  useEffect(() => {
    if (!restored.current) {
      const savedPosition = getScrollPosition(key);
      if (savedPosition > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
      restored.current = true;
    }

    const handleScroll = () => {
      throttledSave(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (pendingSave.current !== null) {
        cancelAnimationFrame(pendingSave.current);
      }
    };
  }, [key, throttledSave]);

  return {
    clearPosition: () => {
      try {
        const positions = getScrollPositions();
        delete positions[key];
        sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
      } catch {
        // Ignore storage errors
      }
    },
  };
}

export function clearAllScrollPositions() {
  try {
    sessionStorage.removeItem(SCROLL_POSITIONS_KEY);
  } catch {
    // Ignore storage errors
  }
}
