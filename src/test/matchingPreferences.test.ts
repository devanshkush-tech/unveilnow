import { describe, expect, it } from "vitest";
import { genderPreferenceAllows, mutuallyGenderCompatible } from "@/lib/matchingPreferences";

describe("gender preferences", () => {
  it("shows women to a member who selected Women, not men or non-binary members", () => {
    expect(genderPreferenceAllows("Women", "Woman")).toBe(true);
    expect(genderPreferenceAllows("Women", "Man")).toBe(false);
    expect(genderPreferenceAllows("Women", "Non-binary")).toBe(false);
  });

  it("allows everyone and honors reciprocal preferences", () => {
    expect(genderPreferenceAllows("Everyone", "Non-binary")).toBe(true);
    expect(mutuallyGenderCompatible("Man", "Women", "Woman", "Men")).toBe(true);
    expect(mutuallyGenderCompatible("Man", "Women", "Woman", "Women")).toBe(false);
  });
});