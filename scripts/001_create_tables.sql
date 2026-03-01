-- Create profiles table
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

-- Profiles RLS policies
create policy "profiles_select_public" on public.profiles for select using (
  is_public = true or auth.uid() = id
);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create matches table
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  matched_user_id uuid not null references auth.users(id) on delete cascade,
  match_score integer,
  match_type text,
  ai_explanation text,
  created_at timestamptz default now()
);

alter table public.matches enable row level security;

create policy "matches_select_own" on public.matches for select using (auth.uid() = user_id);
create policy "matches_insert_own" on public.matches for insert with check (auth.uid() = user_id);
create policy "matches_delete_own" on public.matches for delete using (auth.uid() = user_id);

-- Create connections table
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now()
);

alter table public.connections enable row level security;

create policy "connections_select_own" on public.connections for select using (
  auth.uid() = requester_id or auth.uid() = receiver_id
);
create policy "connections_insert_own" on public.connections for insert with check (auth.uid() = requester_id);
create policy "connections_update_receiver" on public.connections for update using (auth.uid() = receiver_id);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own" on public.messages for select using (
  auth.uid() = sender_id or auth.uid() = receiver_id
);
create policy "messages_insert_own" on public.messages for insert with check (auth.uid() = sender_id);
create policy "messages_update_read" on public.messages for update using (auth.uid() = receiver_id);

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
