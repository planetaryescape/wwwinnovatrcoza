export type ActivityAction =
  | "login"
  | "view_report"
  | "download_report"
  | "view_trends"
  | "view_past_research"
  | "launch_brief"
  | "view_deals"
  | "view_dashboard"
  | "view_settings"
  | "view_credits"
  | "download_client_report"
  | "view_client_report";

export function logActivity(
  actionType: ActivityAction,
  details?: {
    entityType?: string;
    entityId?: string;
    entityName?: string;
    metadata?: Record<string, unknown>;
  }
) {
  fetch("/api/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      actionType,
      entityType: details?.entityType,
      entityId: details?.entityId,
      entityName: details?.entityName,
      metadata: details?.metadata,
    }),
  }).catch(() => {});
}
