import type { StudyStatus } from "@shared/schema";

const LIVE_STUDY_STATUSES: ReadonlySet<StudyStatus> = new Set<StudyStatus>([
  "NEW",
  "AUDIENCE_LIVE",
  "ANALYSING_DATA",
]);

export type NextBestActionKind =
  | "topup"
  | "act"
  | "wait"
  | "explore-or-launch"
  | "launch"
  | "explore";

type ActionLink = {
  label: string;
  to: string;
};

export type NextBestAction = {
  kind: NextBestActionKind;
  headline: string;
  primary: ActionLink;
  secondary?: ActionLink;
};

export type NextBestActionInputs = {
  studies: ReadonlyArray<{ status: string }>;
  signalCount: number;
  recommendationCount: number;
  basicCredits: number;
  proCredits: number;
};

export function deriveNextBestAction(input: NextBestActionInputs): NextBestAction {
  const { studies, signalCount, recommendationCount, basicCredits, proCredits } = input;

  if (basicCredits === 0 && proCredits === 0) {
    return {
      kind: "topup",
      headline: "You're out of credits — top up to keep researching.",
      primary: { label: "Top up credits", to: "/portal/credits" },
    };
  }

  const liveCount = studies.filter((s) => LIVE_STUDY_STATUSES.has(s.status as StudyStatus)).length;
  const doneCount = studies.filter((s) => s.status === "COMPLETED").length;

  if (doneCount > 0 && recommendationCount > 0) {
    return {
      kind: "act",
      headline: "You have results worth acting on.",
      primary: { label: "Open Act", to: "/portal/act" },
    };
  }

  if (liveCount > 0) {
    const noun = liveCount === 1 ? "study" : "studies";
    return {
      kind: "wait",
      headline: `${liveCount} ${noun} in field — check progress.`,
      primary: { label: "Open Test", to: "/portal/test" },
    };
  }

  if (studies.length === 0 && signalCount > 0) {
    return {
      kind: "explore-or-launch",
      headline: `${signalCount} signals waiting — start in Explore.`,
      primary: { label: "Open Explore", to: "/portal/explore" },
      secondary: { label: "Or launch a brief", to: "/portal/launch" },
    };
  }

  if (studies.length === 0) {
    return {
      kind: "launch",
      headline: "No research yet — launch your first brief.",
      primary: { label: "Launch a brief", to: "/portal/launch" },
    };
  }

  return {
    kind: "explore",
    headline: "Browse market signals to find your next idea.",
    primary: { label: "Open Explore", to: "/portal/explore" },
  };
}
