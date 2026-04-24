import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Compat shim for the legacy shadcn `useToast` API on top of Sonner.
 * Existing call sites use:
 *   const { toast } = useToast();
 *   toast({ title, description, variant: "default" | "destructive" });
 * Routes those to the matching Sonner variant.
 */

export type LegacyToastInput = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive";
};

function toString(value: ReactNode): string {
  if (value == null || value === false) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  // ReactNode is rare in our call sites; sonner accepts ReactNode as message too
  return value as unknown as string;
}

function toast({ title, description, variant }: LegacyToastInput) {
  const message = toString(title);
  const opts = description !== undefined ? { description: toString(description) } : undefined;
  if (variant === "destructive") return sonnerToast.error(message, opts);
  return sonnerToast(message, opts);
}

function useToast() {
  return { toast, dismiss: sonnerToast.dismiss };
}

export { useToast, toast };
