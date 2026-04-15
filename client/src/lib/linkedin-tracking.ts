declare global {
  interface Window {
    lintrk?: (action: string, options: { conversion_id: number }) => void;
  }
}

export function trackLinkedInConversion(): void {
  if (typeof window !== "undefined" && typeof window.lintrk === "function") {
    window.lintrk("track", { conversion_id: 27547985 });
  }
}
