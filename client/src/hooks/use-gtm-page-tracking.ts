import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function useGtmPageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "virtualPageview",
      pagePath: location,
      pageTitle: document.title,
    });
  }, [location]);
}
