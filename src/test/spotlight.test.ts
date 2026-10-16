import { describe, expect, it } from "vitest";
import { SPOTLIGHT_OFFERS, getSpotlightOffer } from "@/lib/spotlight";

describe("Spotlight packages", () => {
  it.each([
    ["spotlight_1d", 1, 149],
    ["spotlight_3d", 3, 299],
    ["spotlight_5d", 5, 499],
  ] as const)("keeps %s at %s day(s) for ₹%s", (plan, days, price) => {
    expect(getSpotlightOffer(plan)).toMatchObject({ plan, durationDays: days, priceInr: price });
  });

  it("contains exactly the three requested offers", () => {
    expect(SPOTLIGHT_OFFERS).toHaveLength(3);
  });
});