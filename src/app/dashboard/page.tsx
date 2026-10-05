"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/Spinner";
import {
  availabilityStatusSchema,
  getProfileCompletion,
  getProfileCompletionMessage,
  type ProfileCompletionInput,
} from "@/lib/profileIdentity";

type ProfileProgress = ProfileCompletionInput;

const checklist: { key: keyof ProfileProgress; label: string }[] = [
  { key: "avatar_url", label: "الصورة" },
  { key: "full_name", label: "الاسم" },
  { key: "headline", label: "المسمى المهني" },
  { key: "location", label: "الموقع" },
  { key: "bio", label: "نبذة" },
  { key: "skill_count", label: "مهارة واحدة على الأقل" },
  { key: "username", label: "اسم المستخدم" },
  { key: "availability_status", label: "حالة التوفر" },
];

function isComplete(profile: ProfileProgress, key: keyof ProfileProgress) {
  if (key === "skill_count") return profile.skill_count > 0;
  if (key === "availability_status") return availabilityStatusSchema.safeParse(profile.availability_status).success;
  return Boolean(profile[key]?.toString().trim());
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileProgress | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirectTo=%2Fdashboard");
        return;
      }
      const [profileResult, skillsResult] = await Promise.all([
        supabase.from("profiles").select("avatar_url,full_name,username,headline,location,bio,availability_status").eq("id", user.id).maybeSingle(),
        supabase.from("profile_skills").select("skill_id").eq("profile_id", user.id),
      ]);
      if (!active) return;
      const data = profileResult.data;
      const status = availabilityStatusSchema.safeParse(data?.availability_status);
      setUsername(data?.username ?? null);
      setProfile({
        avatar_url: data?.avatar_url ?? null,
        full_name: data?.full_name ?? null,
        username: data?.username ?? null,
        headline: data?.headline ?? null,
        location: data?.location ?? null,
        bio: data?.bio ?? null,
        skill_count: skillsResult.data?.length ?? 0,
        availability_status: status.success ? status.data : "available",
      });
      setLoading(false);
    }
    void loadProfile();
    return () => { active = false; };
  }, [router]);

  if (loading) return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-6 w-6 text-primary" /></div>;

  const completion = profile ? getProfileCompletion(profile) : 0;

  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold text-primary">مساحة عملك</p>
      <h1 className="mt-2 text-3xl font-bold">أهلاً بك في مِهني 👋</h1>
      <section aria-labelledby="profile-progress-heading" className="mt-8 rounded-xl border border-gray-200 p-5 dark:border-gray-800 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="profile-progress-heading" className="text-xl font-bold">ملفك المهني</h2>
            <p className="mt-1 text-sm text-gray-500">{getProfileCompletionMessage(completion)}</p>
          </div>
          <Link href="/profile" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">تحديث الملف</Link>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div role="progressbar" aria-label="اكتمال الملف المهني" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion} className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completion}%` }} />
          </div>
          <span className="min-w-12 text-sm font-semibold tabular-nums">{completion}٪</span>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {checklist.map(({ key, label }) => {
            const done = profile ? isComplete(profile, key) : false;
            return <li key={key} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-900"><span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500 dark:bg-gray-800"}`}>{done ? "✓" : "○"}</span><span className="text-sm font-medium">{label}</span></li>;
          })}
        </ul>
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
          {username ? <Link href={`/pro/${encodeURIComponent(username)}`} className="text-sm font-semibold text-primary hover:underline">عرض ملفي العام</Link> : <p className="text-sm text-gray-500">اختر اسم مستخدم من صفحة الملف المهني لتتمكن من عرض ملفك العام.</p>}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-lg font-bold">خطوتك التالية</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/opportunities" className="rounded-lg border border-gray-200 p-5 font-semibold hover:border-primary dark:border-gray-800">أبحث عن شغل <span className="mt-1 block text-sm font-normal text-gray-500">استكشف فرص العمل — قريباً</span></Link>
          <Link href="/discover" className="rounded-lg border border-gray-200 p-5 font-semibold hover:border-primary dark:border-gray-800">أعرض خدمتي <span className="mt-1 block text-sm font-normal text-gray-500">اكتشف المحترفين — قريباً</span></Link>
        </div>
      </section>
    </div>
  );
}
