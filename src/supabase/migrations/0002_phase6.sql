-- Extend daily_growth to support the 60-second check-in flow
alter table public.daily_growth
  add column if not exists did_post boolean,
  add column if not exists reels_posted integer,
  add column if not exists best_reel_id uuid references public.reels(id) on delete set null,
  add column if not exists what_worked text,
  add column if not exists what_failed text,
  add column if not exists tomorrow_test text;

create index if not exists daily_growth_best_reel_idx on public.daily_growth(best_reel_id);