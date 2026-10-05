import { z } from "zod";

export const availabilityStatuses = ["available", "busy", "unavailable"] as const;
export type AvailabilityStatus = (typeof availabilityStatuses)[number];

export const availabilityStatusSchema = z.enum(availabilityStatuses, {
  errorMap: () => ({ message: "اختر حالة توفر صحيحة." }),
});

export const profileEditSchema = z.object({
  full_name: z.string().trim().min(1, "الاسم مطلوب.").max(100, "الاسم طويل جداً."),
  username: z
    .string()
    .trim()
    .min(3, "يجب أن يتكون اسم المستخدم من ٣ أحرف على الأقل.")
    .max(30, "اسم المستخدم طويل جداً.")
    .regex(/^[A-Za-z0-9_]+$/, "استخدم الأحرف الإنجليزية والأرقام والشرطة السفلية فقط."),
  avatar_url: z.string().max(2048).nullable(),
  headline: z.string().trim().max(120, "المسمى المهني طويل جداً."),
  location: z.string().trim().max(120, "الموقع طويل جداً."),
  bio: z.string().trim().max(1000, "النبذة طويلة جداً."),
  availability_status: availabilityStatusSchema,
});

export type ProfileEditValues = z.infer<typeof profileEditSchema>;

export type ProfileCompletionInput = {
  avatar_url: string | null;
  full_name: string | null;
  username: string | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  skill_count: number;
  availability_status: AvailabilityStatus;
};

export function getProfileCompletion(profile: ProfileCompletionInput): number {
  const completeFields = [
    Boolean(profile.avatar_url?.trim()),
    Boolean(profile.full_name?.trim()),
    Boolean(profile.username?.trim()),
    Boolean(profile.headline?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.bio?.trim()),
    profile.skill_count > 0,
    availabilityStatusSchema.safeParse(profile.availability_status).success,
  ].filter(Boolean).length;

  return Math.round((completeFields / 8) * 100);
}

export function getProfileCompletionMessage(percentage: number): string {
  if (percentage >= 100) return "ملفك المهني مكتمل";
  if (percentage >= 71) return "باقي خطوات بسيطة";
  if (percentage >= 31) return "ملفك يتحسن";
  return "ابدأ بناء ملفك المهني";
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidProfileSkillSelection(
  profileId: string,
  currentUserId: string,
  skillIds: readonly string[]
): boolean {
  return (
    profileId === currentUserId &&
    skillIds.every((id) => uuidPattern.test(id)) &&
    new Set(skillIds).size === skillIds.length
  );
}
