declare global {
  interface Window {
    lintrk?: (action: string, options: { conversion_id: number }) => void;
  }
}

export type LinkedInEvent =
  | "sign_up"
  | "book_demo"
  | "subscribe_trends"
  | "membership_purchase";

const CONVERSION_IDS: Record<LinkedInEvent, number> = {
  sign_up: 27548169,
  book_demo: 27548177,
  subscribe_trends: 27548185,
  membership_purchase: 27548193,
};

export function trackLinkedInEvent(event: LinkedInEvent): void {
  if (typeof window !== "undefined" && typeof window.lintrk === "function") {
    window.lintrk("track", { conversion_id: CONVERSION_IDS[event] });
  }
}
