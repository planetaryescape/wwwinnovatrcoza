import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * Centered empty-state card. Same visual idiom as the existing
 * "No studies yet" block on the Dashboard so it drops in cleanly.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  testId,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-10 text-center shadow-sm",
        className,
      )}
      style={{ borderColor: "var(--ds-n200, #EBEBEB)" }}
      data-testid={testId}
    >
      {Icon && (
        <div
          className="mx-auto mb-3 inline-flex"
          style={{ color: "var(--ds-n500, #8A7260)" }}
        >
          <Icon className="h-8 w-8" />
        </div>
      )}
      <p
        className="mb-1 text-sm font-semibold"
        style={{ color: "var(--ds-violet-dk, #1E1B3A)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="mb-4 text-xs"
          style={{ color: "var(--ds-n500, #8A7260)" }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
