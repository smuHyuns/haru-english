-- ─────────────────────────────────────────────────────────────
-- 0003 · 회원가입/익명 로그인 시 프로필 자동 생성
--
-- 앱에서 별도 처리가 필요 없어진다. 게스트 → 정식 전환은 updateUser() 라
-- auth.users 에 새 행이 생기지 않고 기존 프로필이 그대로 승계된다.
-- ─────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public   -- security definer 함수에서 필수 (권한 상승 경로 차단)
as $$
begin
  insert into public.profiles (id, username, joined_at)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'username', ''),
    public.kst_today()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
