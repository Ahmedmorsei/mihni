import { describe, expect, it } from "vitest";
import {
  availabilityStatusSchema,
  getProfileCompletion,
  getProfileCompletionMessage,
  isValidProfileSkillSelection,
  type ProfileCompletionInput,
} from "./profileIdentity";

const completeProfile: ProfileCompletionInput = {
  avatar_url: "https://example.com/avatar.png",
  full_name: "مها علي",
  username: "maha_ali",
  headline: "مصممة منتجات",
  location: "الرياض",
  bio: "أصمم تجارب رقمية واضحة.",
  skill_count: 2,
  availability_status: "available",
};

describe("professional profile identity logic", () => {
  it("calculates completion from profile data without storing it", () => {
    expect(getProfileCompletion(completeProfile)).toBe(100);
    expect(getProfileCompletion({ ...completeProfile, bio: null, skill_count: 0 })).toBe(75);
    expect(getProfileCompletion({ ...completeProfile, avatar_url: null, full_name: null, username: null, headline: null, location: null, bio: null, skill_count: 0 })).toBe(13);
  });

  it("uses the requested Arabic completion messages", () => {
    expect(getProfileCompletionMessage(0)).toBe("ابدأ بناء ملفك المهني");
    expect(getProfileCompletionMessage(50)).toBe("ملفك يتحسن");
    expect(getProfileCompletionMessage(90)).toBe("باقي خطوات بسيطة");
    expect(getProfileCompletionMessage(100)).toBe("ملفك المهني مكتمل");
  });

  it("accepts only supported availability values", () => {
    for (const status of ["available", "busy", "unavailable"]) {
      expect(availabilityStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(availabilityStatusSchema.safeParse("away").success).toBe(false);
  });

  it("validates skill assignments against the signed-in profile and unique IDs", () => {
    const profileId = "550e8400-e29b-41d4-a716-446655440000";
    const skillId = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
    expect(isValidProfileSkillSelection(profileId, profileId, [skillId])).toBe(true);
    expect(isValidProfileSkillSelection(profileId, "550e8400-e29b-41d4-a716-446655440001", [skillId])).toBe(false);
    expect(isValidProfileSkillSelection(profileId, profileId, [skillId, skillId])).toBe(false);
    expect(isValidProfileSkillSelection(profileId, profileId, ["not-a-uuid"])).toBe(false);
  });
});
