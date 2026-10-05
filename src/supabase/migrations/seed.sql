create or replace function public.seed_default_data(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_pillar uuid;
begin
  -- Pillars (idempotent)
  insert into public.content_pillars (user_id, name, is_default) values
    (p_user_id, 'Founder Journey', true),
    (p_user_id, 'Business', true),
    (p_user_id, 'Experiments / Challenges', true),
    (p_user_id, 'Personal Story', true),
    (p_user_id, 'Founder Lifestyle', true)
  on conflict (user_id, name) do nothing;

  select id into v_pillar from public.content_pillars
    where user_id = p_user_id and name = 'Founder Journey' limit 1;

  -- Benchmark Reels — Reels 1 & 2 have follows = NULL (not provided)
  insert into public.reels (
    user_id, reel_number, posted_at, title, pillar_id, format,
    views, likes, comments, saves, shares, accounts_engaged, non_follower_pct, follows
  ) values
    (p_user_id, 1, current_date - interval '30 days', 'Benchmark Reel 1', v_pillar, 'Reel',
      468393, 11785, 52, 1776, 1655, 14575, 97.7, null),
    (p_user_id, 2, current_date - interval '20 days', 'Benchmark Reel 2', v_pillar, 'Reel',
      334598, 22934, 143, 2403, 5845, 26357, 98.5, null),
    (p_user_id, 3, current_date - interval '10 days', 'Benchmark Reel 3', v_pillar, 'Reel',
      161351, 7409, 1113, 2540, 2745, 11671, 94.2, 663)
  on conflict do nothing;
end; $$;

-- After you create your auth user, run:
--   select public.seed_default_data('<your-auth-user-uuid>');
7a079c85-44a6-4546-b956-fef41e105a32