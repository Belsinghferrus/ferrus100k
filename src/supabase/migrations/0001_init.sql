-- ============================================================
-- FERRUS 100K — Initial schema
-- ============================================================
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  instagram_username text,
  starting_followers integer not null default 25200,
  target_followers integer not null default 100000,
  starting_date date not null default current_date,
  deadline date not null default date '2026-12-31',
  timezone text not null default 'UTC',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);
create policy profiles_delete_own on public.profiles for delete using (auth.uid() = id);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- content_pillars
-- ============================================================
create table public.content_pillars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null default '#FFD02B',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index content_pillars_user_idx on public.content_pillars(user_id);
alter table public.content_pillars enable row level security;
create policy content_pillars_all_own on public.content_pillars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_content_pillars_updated before update on public.content_pillars
  for each row execute function public.set_updated_at();

-- ============================================================
-- content_series
-- ============================================================
create table public.content_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  planned_episodes integer,
  status text not null default 'active'
    check (status in ('active','paused','complete','archived')),
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_series_user_idx on public.content_series(user_id);
alter table public.content_series enable row level security;
create policy content_series_all_own on public.content_series
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_content_series_updated before update on public.content_series
  for each row execute function public.set_updated_at();

-- ============================================================
-- hooks
-- ============================================================
create table public.hooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hook text not null,
  category text not null default 'Curiosity',
  pillar_id uuid references public.content_pillars(id) on delete set null,
  format text,
  used_count integer not null default 0,
  best_reel_id uuid, -- FK added after reels exists
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hooks_user_idx on public.hooks(user_id);
create index hooks_category_idx on public.hooks(user_id, category);
alter table public.hooks enable row level security;
create policy hooks_all_own on public.hooks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_hooks_updated before update on public.hooks
  for each row execute function public.set_updated_at();

-- ============================================================
-- reels
-- ============================================================
create table public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reel_number integer,
  posted_at date not null,
  title text,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  series_id uuid references public.content_series(id) on delete set null,
  series_episode integer,
  hook text,
  hook_id uuid references public.hooks(id) on delete set null,
  format text,

  views bigint not null default 0,
  watch_time_seconds bigint,
  avg_watch_time_seconds numeric(10,2),

  likes integer not null default 0,
  comments integer not null default 0,
  saves integer not null default 0,
  shares integer not null default 0,
  accounts_engaged integer not null default 0,
  profile_visits integer,
  follows integer,                    -- NULL when unknown
  non_follower_pct numeric(5,2),

  -- Derived (always consistent, cannot drift)
  follows_per_1k numeric(12,4) generated always as (
    case when views > 0 and follows is not null
      then (follows::numeric / views::numeric) * 1000
      else null end
  ) stored,
  engagement_rate numeric(10,4) generated always as (
    case when views > 0
      then (accounts_engaged::numeric / views::numeric) * 100
      else null end
  ) stored,
  share_rate numeric(10,4) generated always as (
    case when views > 0 then (shares::numeric / views::numeric) * 100 else null end
  ) stored,
  save_rate numeric(10,4) generated always as (
    case when views > 0 then (saves::numeric / views::numeric) * 100 else null end
  ) stored,

  verdict text check (verdict in ('SCALE','TEST','KILL')),
  verdict_override boolean not null default false,
  what_worked text,
  what_didnt_work text,
  next_test text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reels_user_posted_idx on public.reels(user_id, posted_at desc);
create index reels_user_pillar_idx on public.reels(user_id, pillar_id);
create index reels_user_series_idx on public.reels(user_id, series_id);
create index reels_user_follows_idx on public.reels(user_id, follows desc nulls last);
create index reels_user_fp1k_idx on public.reels(user_id, follows_per_1k desc nulls last);
alter table public.reels enable row level security;
create policy reels_all_own on public.reels
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_reels_updated before update on public.reels
  for each row execute function public.set_updated_at();

-- hooks.best_reel_id FK (added now that reels exists)
alter table public.hooks
  add constraint hooks_best_reel_fk
  foreign key (best_reel_id) references public.reels(id) on delete set null;

-- ============================================================
-- daily_growth
-- ============================================================
create table public.daily_growth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  start_followers integer not null,
  end_followers integer not null,
  net_growth integer generated always as (end_followers - start_followers) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);
create index daily_growth_user_date_idx on public.daily_growth(user_id, date desc);
alter table public.daily_growth enable row level security;
create policy daily_growth_all_own on public.daily_growth
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_daily_growth_updated before update on public.daily_growth
  for each row execute function public.set_updated_at();

-- ============================================================
-- weekly_reviews
-- ============================================================
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_number integer not null,
  start_date date not null,
  end_date date not null,
  starting_followers integer not null,
  ending_followers integer not null,
  net_growth integer generated always as (ending_followers - starting_followers) stored,
  reels_posted integer not null default 0,
  total_views bigint not null default 0,
  total_follows integer not null default 0,
  best_reel_id uuid references public.reels(id) on delete set null,
  winning_pattern text,
  what_failed text,
  what_to_kill text,
  what_to_repeat text,
  next_week_experiment text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_number)
);
create index weekly_reviews_user_idx on public.weekly_reviews(user_id, week_number desc);
alter table public.weekly_reviews enable row level security;
create policy weekly_reviews_all_own on public.weekly_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_weekly_reviews_updated before update on public.weekly_reviews
  for each row execute function public.set_updated_at();

-- ============================================================
-- experiments
-- ============================================================
create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  hypothesis text,
  start_date date,
  end_date date,
  variable text,
  control text,
  test text,
  expected_result text,
  actual_result text,
  winner text check (winner in ('CONTROL','TEST','INCONCLUSIVE')),
  learning text,
  next_action text,
  status text not null default 'PLANNED'
    check (status in ('PLANNED','RUNNING','COMPLETE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index experiments_user_idx on public.experiments(user_id, status);
alter table public.experiments enable row level security;
create policy experiments_all_own on public.experiments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_experiments_updated before update on public.experiments
  for each row execute function public.set_updated_at();

-- ============================================================
-- content_ideas
-- ============================================================
create table public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  idea text not null,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  format text,
  hook text,
  series_potential text check (series_potential in ('LOW','MEDIUM','HIGH')),
  difficulty text check (difficulty in ('EASY','MEDIUM','HARD')),
  status text not null default 'IDEA'
    check (status in ('IDEA','READY','POSTED','REPEAT','KILLED')),
  expected_outcome text,
  result text,
  follow_up_idea text,
  notes text,
  converted_reel_id uuid references public.reels(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_ideas_user_status_idx on public.content_ideas(user_id, status);
alter table public.content_ideas enable row level security;
create policy content_ideas_all_own on public.content_ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger trg_content_ideas_updated before update on public.content_ideas
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile on new auth.users row
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, instagram_username,
    starting_followers, target_followers, deadline)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'Ferrus'),
    coalesce(new.raw_user_meta_data->>'instagram_username', null),
    25200, 100000, date '2026-12-31'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();