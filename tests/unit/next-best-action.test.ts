import { describe, expect, it } from "vitest";
import { deriveNextBestAction } from "@/lib/next-best-action";

const baseInputs = {
  studies: [],
  signalCount: 0,
  recommendationCount: 0,
  basicCredits: 25,
  proCredits: 4,
};

describe("deriveNextBestAction", () => {
  it("tells the user to top up when both credit pools are empty", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      basicCredits: 0,
      proCredits: 0,
    });
    expect(action.kind).toBe("topup");
    expect(action.primary.to).toBe("/portal/credits");
  });

  it("points to Act when there are completed studies and recommendations", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      studies: [{ status: "COMPLETED" }],
      recommendationCount: 1,
    });
    expect(action.kind).toBe("act");
    expect(action.primary.to).toBe("/portal/act");
  });

  it("tells the user to wait + check progress when studies are in field", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      studies: [{ status: "AUDIENCE_LIVE" }, { status: "ANALYSING_DATA" }],
    });
    expect(action.kind).toBe("wait");
    expect(action.headline).toContain("2 studies");
    expect(action.primary.to).toBe("/portal/test");
  });

  it("uses singular noun when only one study is in field", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      studies: [{ status: "NEW" }],
    });
    expect(action.kind).toBe("wait");
    expect(action.headline).toContain("1 study");
  });

  it("offers Explore-or-Launch when no studies exist but signals are available", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      signalCount: 13,
    });
    expect(action.kind).toBe("explore-or-launch");
    expect(action.headline).toContain("13 signals");
    expect(action.primary.to).toBe("/portal/explore");
    expect(action.secondary?.to).toBe("/portal/launch");
  });

  it("falls back to Launch when there are neither studies nor signals", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
    });
    expect(action.kind).toBe("launch");
    expect(action.primary.to).toBe("/portal/launch");
  });

  it("falls back to Explore when there are studies but none live, none done", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      studies: [{ status: "ARCHIVED_OR_OTHER" }],
    });
    expect(action.kind).toBe("explore");
    expect(action.primary.to).toBe("/portal/explore");
  });

  it("prefers act over wait when both completed-with-recs and live studies exist", () => {
    const action = deriveNextBestAction({
      ...baseInputs,
      studies: [{ status: "COMPLETED" }, { status: "AUDIENCE_LIVE" }],
      recommendationCount: 1,
    });
    expect(action.kind).toBe("act");
  });
});
