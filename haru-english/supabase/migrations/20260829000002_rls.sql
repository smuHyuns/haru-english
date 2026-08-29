-- ─────────────────────────────────────────────────────────────
-- 0002 · Row Level Security
--
-- Supabase 는 RLS 를 켜지 않으면 anon key 만으로 테이블 전체가 읽힌다.
-- anon key 는 번들에 노출되는 게 정상이므로, 인가는 전적으로 여기서 한다.
-- ⇒ 새 테이블을 추가할 때마다 이 파일에도 반드시 정책을 추가할 것.
-- ─────────────────────────────────────────────────────────────

alter table public.categories      enable row level security;
alter table public.words           enable row level security;
alter table public.videos          enable row level security;
alter table public.daily_words     enable row level security;
alter table public.profiles        enable row level security;
alter table public.attendance      enable row level security;
alter table public.favorite_words  enable row level security;
alter table public.favorite_videos enable row level security;

-- ── 콘텐츠 — 누구나 읽기, 쓰기 정책 없음 ───────────────────────
-- INSERT/UPDATE/DELETE 정책을 만들지 않는다 ⇒ 클라이언트에서 콘텐츠 수정 불가.
-- 콘텐츠 추가는 마이그레이션/시드 또는 service_role 로만.

drop policy if exists "content readable" on public.categories;
create policy "content readable" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "content readable" on public.words;
create policy "content readable" on public.words
  for select to anon, authenticated using (true);

drop policy if exists "content readable" on public.videos;
create policy "content readable" on public.videos
  for select to anon, authenticated using (is_active);

drop policy if exists "content readable" on public.daily_words;
create policy "content readable" on public.daily_words
  for select to anon, authenticated using (true);

-- ── 사용자 데이터 — 본인 것만 ─────────────────────────────────
-- auth.uid() 를 (select auth.uid()) 로 감싸는 건 성능 최적화다.
-- 그냥 쓰면 행마다 재평가되고, 감싸면 initPlan 으로 한 번만 평가된다.
-- 익명 로그인 사용자도 role 이 authenticated 라 아래 정책이 그대로 적용된다.

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "own attendance" on public.attendance;
create policy "own attendance" on public.attendance
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own favorite words" on public.favorite_words;
create policy "own favorite words" on public.favorite_words
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own favorite videos" on public.favorite_videos;
create policy "own favorite videos" on public.favorite_videos
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
