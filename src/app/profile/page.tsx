"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/Spinner";
import {
  availabilityStatuses,
  isValidProfileSkillSelection,
  profileEditSchema,
  type AvailabilityStatus,
  type ProfileEditValues,
} from "@/lib/profileIdentity";

type ProfileForm = ProfileEditValues;
type Skill = { id: string; name: string; slug: string; category: string };

const emptyProfile: ProfileForm = {
  full_name: "",
  username: "",
  avatar_url: null,
  headline: "",
  location: "",
  bio: "",
  availability_status: "available",
};

const availabilityLabels: Record<AvailabilityStatus, string> = {
  available: "متاح للعمل",
  busy: "مشغول حالياً",
  unavailable: "غير متاح",
};

const textFields: {
  key: "full_name" | "username" | "headline" | "location";
  label: string;
  placeholder: string;
  maxLength: number;
}[] = [
  { key: "full_name", label: "الاسم", placeholder: "الاسم الذي يظهر في ملفك", maxLength: 100 },
  { key: "username", label: "اسم المستخدم", placeholder: "مثال: maha_ali", maxLength: 30 },
  { key: "headline", label: "المسمى المهني", placeholder: "مثال: مصممة منتجات", maxLength: 120 },
  { key: "location", label: "الموقع", placeholder: "المدينة، الدولة", maxLength: 120 },
];

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [savedSkillIds, setSavedSkillIds] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirectTo=%2Fprofile");
        return;
      }

      const [profileResult, skillsResult, profileSkillsResult] = await Promise.all([
        supabase.from("profiles").select("full_name,username,avatar_url,headline,location,bio,availability_status").eq("id", user.id).maybeSingle(),
        supabase.from("skills").select("id,name,slug,category").order("name"),
        supabase.from("profile_skills").select("skill_id").eq("profile_id", user.id),
      ]);
      if (!active) return;

      if (profileResult.error) setError(profileResult.error.message);
      const profile = profileResult.data;
      const metadata = user.user_metadata ?? {};
      setForm({
        full_name: profile?.full_name ?? metadata.full_name ?? "",
        username: profile?.username ?? metadata.username ?? "",
        avatar_url: profile?.avatar_url ?? metadata.avatar_url ?? null,
        headline: profile?.headline ?? "",
        location: profile?.location ?? "",
        bio: profile?.bio ?? "",
        availability_status: profile?.availability_status ?? "available",
      });
      if (skillsResult.error || profileSkillsResult.error) {
        setError(skillsResult.error?.message ?? profileSkillsResult.error?.message ?? "تعذر تحميل المهارات.");
      } else {
        const catalog = (skillsResult.data ?? []) as Skill[];
        const assigned = (profileSkillsResult.data ?? []).map(({ skill_id }) => skill_id);
        setSkills(catalog);
        setSelectedSkillIds(assigned);
        setSavedSkillIds(assigned);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLocaleLowerCase();
    return skills.filter((skill) =>
      !selectedSkillIds.includes(skill.id) &&
      (!query || skill.name.toLocaleLowerCase().includes(query) || skill.category.toLocaleLowerCase().includes(query))
    );
  }, [skillSearch, selectedSkillIds, skills]);

  const update = (key: keyof ProfileForm, value: string | null) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const parsed = profileEditSchema.safeParse({ ...form, username: form.username.trim(), avatar_url: form.avatar_url || null });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "راجع المعلومات المدخلة.");
      setSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login?redirectTo=%2Fprofile");
      return;
    }
    if (!isValidProfileSkillSelection(user.id, user.id, selectedSkillIds)) {
      setError("تعذر التحقق من قائمة المهارات. حدّث الصفحة وحاول مرة أخرى.");
      setSaving(false);
      return;
    }

    const values = parsed.data;
    const { error: saveError } = await supabase.from("profiles").update({
      full_name: values.full_name,
      username: values.username,
      avatar_url: values.avatar_url,
      headline: values.headline || null,
      location: values.location || null,
      bio: values.bio || null,
      availability_status: values.availability_status,
    }).eq("id", user.id);

    if (saveError) {
      setSaving(false);
      setError(saveError.code === "23505" ? "اسم المستخدم مستخدم بالفعل." : saveError.message);
      return;
    }

    const removed = savedSkillIds.filter((id) => !selectedSkillIds.includes(id));
    const added = selectedSkillIds.filter((id) => !savedSkillIds.includes(id));
    if (removed.length) {
      const { error: removeError } = await supabase.from("profile_skills").delete().eq("profile_id", user.id).in("skill_id", removed);
      if (removeError) {
        setSaving(false);
        setError(`تم حفظ الملف، لكن تعذر تحديث المهارات: ${removeError.message}`);
        return;
      }
    }
    if (added.length) {
      const { error: addError } = await supabase.from("profile_skills").insert(added.map((skill_id) => ({ profile_id: user.id, skill_id })));
      if (addError) {
        setSaving(false);
        setError(`تم حفظ الملف، لكن تعذر تحديث المهارات: ${addError.message}`);
        return;
      }
    }

    setSavedSkillIds(selectedSkillIds);
    setForm(values);
    setSaving(false);
    setMessage("تم حفظ ملفك المهني.");
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("اختر صورة لا يتجاوز حجمها ٢ ميغابايت.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update("avatar_url", `${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  if (loading) return <div className="flex min-h-80 items-center justify-center"><Spinner className="h-6 w-6 text-primary" /></div>;

  return (
    <div dir="rtl" className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <section>
        <p className="text-sm font-semibold text-primary">ملفك المهني</p>
        <h1 className="mt-2 text-3xl font-bold">عرّف الناس بشغلك</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">أضف المعلومات التي تساعد الآخرين على معرفة خبرتك ومجالك.</p>

        <form onSubmit={saveProfile} className="mt-7 space-y-7">
          <section aria-labelledby="basic-info-heading" className="space-y-5">
            <h2 id="basic-info-heading" className="text-lg font-bold">المعلومات الأساسية</h2>
            <div>
              <label className="mb-2 block text-sm font-semibold">الصورة الشخصية</label>
              <div className="flex items-center gap-4">
                {form.avatar_url ? <Image src={form.avatar_url} alt="الصورة الشخصية" width={64} height={64} unoptimized className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-400 dark:bg-gray-800">م</div>}
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:border-primary dark:border-gray-700">{uploading ? "جارٍ الرفع…" : "اختر صورة"}</button>
                  <p className="mt-1 text-xs text-gray-500">صورة حتى ٢ ميغابايت</p>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { void uploadAvatar(event.target.files?.[0]); event.target.value = ""; }} />
              </div>
            </div>
            {textFields.slice(0, 2).map(({ key, label, placeholder, maxLength }) => <div key={key}>
              <label htmlFor={key} className="mb-1.5 block text-sm font-semibold">{label}</label>
              <input id={key} value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} required maxLength={maxLength} minLength={key === "username" ? 3 : undefined} pattern={key === "username" ? "[A-Za-z0-9_]{3,30}" : undefined} autoComplete={key === "username" ? "username" : "name"} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-950" />
              {key === "username" && <p className="mt-1 text-xs text-gray-500">رابط ملفك العام: /pro/{form.username || "اسم_المستخدم"}</p>}
            </div>)}
          </section>

          <section aria-labelledby="professional-info-heading" className="space-y-5 border-t border-gray-200 pt-6 dark:border-gray-800">
            <h2 id="professional-info-heading" className="text-lg font-bold">المعلومات المهنية</h2>
            {textFields.slice(2).map(({ key, label, placeholder, maxLength }) => <div key={key}>
              <label htmlFor={key} className="mb-1.5 block text-sm font-semibold">{label}</label>
              <input id={key} value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} maxLength={maxLength} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-950" />
            </div>)}
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold">نبذة عني</label>
              <textarea id="bio" value={form.bio} onChange={(event) => update("bio", event.target.value)} rows={5} maxLength={1000} placeholder="اكتب نبذة قصيرة عن خبرتك وما تقدمه…" className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-950" />
            </div>
            <div>
              <label htmlFor="availability_status" className="mb-1.5 block text-sm font-semibold">حالة التوفر</label>
              <select id="availability_status" value={form.availability_status} onChange={(event) => update("availability_status", event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-950">
                {availabilityStatuses.map((status) => <option key={status} value={status}>{availabilityLabels[status]}</option>)}
              </select>
            </div>
          </section>

          <section aria-labelledby="skills-heading" className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-800">
            <h2 id="skills-heading" className="text-lg font-bold">المهارات</h2>
            <div className="flex flex-wrap gap-2">
              {selectedSkillIds.map((id) => {
                const skill = skills.find((item) => item.id === id);
                if (!skill) return null;
                return <button key={id} type="button" onClick={() => setSelectedSkillIds((current) => current.filter((item) => item !== id))} aria-label={`إزالة ${skill.name}`} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30">{skill.name} <span aria-hidden="true">×</span></button>;
              })}
              {!selectedSkillIds.length && <p className="text-sm text-gray-500">أضف مهارة واحدة على الأقل إلى ملفك.</p>}
            </div>
            <div>
              <label htmlFor="skill-search" className="mb-1.5 block text-sm font-semibold">إضافة مهارة</label>
              <input id="skill-search" type="search" value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder="ابحث بالمهارة أو المجال" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-950" />
              <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
                {filteredSkills.length ? filteredSkills.map((skill) => <button key={skill.id} type="button" onClick={() => setSelectedSkillIds((current) => [...current, skill.id])} className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 text-start last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"><span className="text-sm font-medium">{skill.name}</span><span className="text-xs text-gray-500">{skill.category}</span></button>) : <p className="px-3 py-3 text-sm text-gray-500">لا توجد مهارات مطابقة.</p>}
              </div>
            </div>
          </section>

          {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={saving || uploading} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">{saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button>
        </form>
      </section>

      <aside aria-label="معاينة الملف المهني" className="h-fit rounded-xl border border-gray-200 p-5 dark:border-gray-800 sm:p-6">
        <p className="text-xs font-semibold text-gray-500">معاينة الملف المهني</p>
        <div className="mt-5 flex items-center gap-3">
          {form.avatar_url ? <Image src={form.avatar_url} alt="" width={56} height={56} unoptimized className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">م</div>}
          <div><h2 className="font-bold">{form.full_name || "اسمك الكامل"}</h2><p className="mt-1 text-sm text-gray-500">@{form.username || "اسم_المستخدم"}</p></div>
        </div>
        <p className="mt-5 font-medium">{form.headline || "المسمى المهني"}</p>
        {form.location && <p className="mt-2 text-sm text-gray-500">{form.location}</p>}
        <p className="mt-2 text-sm text-primary">{availabilityLabels[form.availability_status]}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">{form.bio || "ستظهر نبذتك المهنية هنا."}</p>
      </aside>
    </div>
  );
}
