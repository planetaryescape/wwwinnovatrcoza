import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const SCROLL_POSITIONS_KEY = "scroll-positions";

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

export function useScrollRestoration(key?: string) {
  const [location] = useLocation();
  const scrollKey = key || location;
  const restored = useRef(false);

  useEffect(() => {
    if (!restored.current) {
      const savedPosition = getScrollPosition(scrollKey);
      if (savedPosition > 0) {
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 50);
      }
      restored.current = true;
    }

    const handleScroll = () => {
      saveScrollPosition(scrollKey, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollKey]);

  return {
    clearPosition: () => {
      try {
        const positions = getScrollPositions();
        delete positions[scrollKey];
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
