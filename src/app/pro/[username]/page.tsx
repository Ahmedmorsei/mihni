import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { availabilityStatusSchema } from "@/lib/profileIdentity";

export const dynamic = "force-dynamic";

const availabilityLabels = {
  available: "متاح للعمل",
  busy: "مشغول حالياً",
  unavailable: "غير متاح",
} as const;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type PublicSkill = { id: string; name: string; slug: string; category: string };

export default async function PublicProfessionalProfile({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,username,avatar_url,headline,bio,location,account_type,availability_status")
    .eq("username", username)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) notFound();

  const { data: assignments, error: skillsError } = await supabase
    .from("profile_skills")
    .select("skill_id")
    .eq("profile_id", profile.id);
  if (skillsError) throw skillsError;

  const skillIds = (assignments ?? []).map(({ skill_id }) => skill_id);
  let skills: PublicSkill[] = [];
  if (skillIds.length) {
    const { data, error } = await supabase
      .from("skills")
      .select("id,name,slug,category")
      .in("id", skillIds)
      .order("name");
    if (error) throw error;
    skills = (data ?? []) as PublicSkill[];
  }

  const availability = availabilityStatusSchema.safeParse(profile.availability_status);
  const status = availability.success ? availability.data : "unavailable";
  const accountType = profile.account_type === "company" ? "شركة" : "مهني";

  return (
    <main dir="rtl" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="h-2 bg-primary" />
        <div className="p-6 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.avatar_url ? <Image src={profile.avatar_url} alt={`الصورة الشخصية لـ ${profile.full_name ?? "المهني"}`} width={96} height={96} unoptimized className="h-24 w-24 rounded-full object-cover" /> : <div aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400 dark:bg-gray-800">م</div>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">{profile.full_name || profile.username}</h1>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{accountType}</span>
              </div>
              {profile.headline && <p className="mt-2 text-lg text-gray-700 dark:text-gray-200">{profile.headline}</p>}
              {profile.location && <p className="mt-2 text-sm text-gray-500">{profile.location}</p>}
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${status === "available" ? "bg-emerald-500" : status === "busy" ? "bg-amber-500" : "bg-gray-400"}`} />{availabilityLabels[status]}</p>
            </div>
          </div>

          {profile.bio && <section className="mt-9 border-t border-gray-200 pt-7 dark:border-gray-800">
            <h2 className="text-base font-bold">نبذة مهنية</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-gray-600 dark:text-gray-300">{profile.bio}</p>
          </section>}

          <section className="mt-9 border-t border-gray-200 pt-7 dark:border-gray-800">
            <h2 className="text-base font-bold">المهارات</h2>
            {skills.length ? <ul className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => <li key={skill.id} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{skill.name}</li>)}
            </ul> : <p className="mt-3 text-sm text-gray-500">لم تتم إضافة مهارات بعد.</p>}
          </section>
        </div>
      </article>
    </main>
  );
}
