create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  bio text,
  ikigai_passion text,
  ikigai_mission text,
  ikigai_vocation text,
  ikigai_profession text,
  skills text[] default '{}',
  interests text[] default '{}',
  availability text,
  working_style text,
  intent text[] default '{}',
  portfolio_url text,
  github_url text,
  linkedin_url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_public" on public.profiles for select using (
  is_public = true or auth.uid() = id
);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
