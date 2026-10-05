-- Extend the existing profile foundation for public professional identity.
alter table public.profiles
  add column if not exists availability_status text not null default 'available';

alter table public.profiles
  drop constraint if exists profiles_availability_status_check;
alter table public.profiles
  add constraint profiles_availability_status_check
  check (availability_status in ('available', 'busy', 'unavailable'));

-- Only the explicitly public profile fields are readable through the Data API.
-- In particular, phone, timestamps, and any future private fields stay hidden.
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, username, avatar_url, headline, bio, location, account_type, availability_status)
  on public.profiles to anon, authenticated;

drop policy if exists "Public can view published profiles" on public.profiles;
create policy "Public can view published profiles"
  on public.profiles for select to anon, authenticated
  using (username is not null);

-- Users may edit profile content, but account type and identity keys remain
-- controlled by trusted database logic.
revoke update on public.profiles from anon, authenticated;
revoke update (full_name, username, avatar_url, headline, bio, location, phone, account_type)
  on public.profiles from anon, authenticated;
grant update (full_name, username, avatar_url, headline, bio, location, phone, availability_status)
  on public.profiles to authenticated;

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_skills (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, skill_id)
);

create index if not exists profile_skills_skill_id_idx
  on public.profile_skills (skill_id);

alter table public.skills enable row level security;
alter table public.profile_skills enable row level security;

drop policy if exists "Skills are publicly readable" on public.skills;
create policy "Skills are publicly readable"
  on public.skills for select to anon, authenticated
  using (true);

drop policy if exists "Public can view skills on published profiles" on public.profile_skills;
create policy "Public can view skills on published profiles"
  on public.profile_skills for select to anon, authenticated
  using (
    (select auth.uid()) = profile_id
    or exists (
      select 1 from public.profiles
      where profiles.id = profile_skills.profile_id
        and profiles.username is not null
    )
  );

drop policy if exists "Users can add skills to their own profile" on public.profile_skills;
create policy "Users can add skills to their own profile"
  on public.profile_skills for insert to authenticated
  with check ((select auth.uid()) = profile_id);

drop policy if exists "Users can remove skills from their own profile" on public.profile_skills;
create policy "Users can remove skills from their own profile"
  on public.profile_skills for delete to authenticated
  using ((select auth.uid()) = profile_id);

revoke all on public.skills, public.profile_skills from anon, authenticated;
grant select on public.skills to anon, authenticated;
grant select on public.profile_skills to anon, authenticated;
grant insert, delete on public.profile_skills to authenticated;

insert into public.skills (name, slug, category) values
  ('Web Development', 'web-development', 'Technology'),
  ('Mobile Development', 'mobile-development', 'Technology'),
  ('Graphic Design', 'graphic-design', 'Technology'),
  ('Electrical', 'electrical', 'Technical Trades'),
  ('Plumbing', 'plumbing', 'Technical Trades'),
  ('Air Conditioning', 'air-conditioning', 'Technical Trades'),
  ('Carpentry', 'carpentry', 'Technical Trades'),
  ('Maintenance', 'maintenance', 'Technical Trades'),
  ('Sales', 'sales', 'Business'),
  ('Marketing', 'marketing', 'Business'),
  ('Accounting', 'accounting', 'Business')
on conflict (slug) do nothing;
