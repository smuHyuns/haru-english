# Supabase 스키마

`migrations/` + `seed.sql` 이 **스키마의 유일한 정본**이다.
대시보드에서 테이블을 직접 만들거나 고치지 말 것 — 재현이 안 되고 프로젝트끼리 어긋난다.
바꿔야 하면 새 마이그레이션 파일을 추가한다.

## 적용 순서

```
migrations/20260829000001_init.sql            확장 · kst_today() · 테이블 · 인덱스
migrations/20260829000002_rls.sql             RLS 활성화 + 정책
migrations/20260829000003_profile_trigger.sql 가입 시 profiles 자동 생성
seed.sql                                      콘텐츠 시드 (mock 과 동일 데이터)
```

전부 idempotent 하다 (`if not exists` / `on conflict do nothing` / `drop policy if exists`).
여러 번 돌려도 안전하다.

### 방법 A — 대시보드 SQL Editor

위 4개 파일을 **순서대로** 붙여넣고 실행. 지금은 이게 가장 빠르다.

### 방법 B — CLI (재현 가능, 권장)

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push        # migrations/ 반영
npx supabase db seed        # 또는 seed.sql 을 psql 로
```

## 대시보드에서 따로 켜야 하는 것

로그인 식별자는 **합성 이메일** 방식으로 확정됐다.
입력한 아이디/휴대폰이 `{정규화}@haru-english.app` 으로 바뀌어 email 인증에 실린다
(`src/auth/identifier.ts`). 사용자는 이 이메일을 보지 못하고, 수신도 불가능하다.

| 위치 | 항목 | 값 | 이유 |
|---|---|---|---|
| Authentication > Sign In / Providers | **Anonymous sign-ins** | **ON** | `로그인 없이 둘러보기` = `signInAnonymously()`. 게스트도 uid 가 있어야 RLS 와 데이터 승계가 성립 |
| Authentication > Sign In / Providers | Email | ON | 아이디/비밀번호 로그인 |
| Authentication > Sign In / Providers | **Confirm email** | **OFF** | `@haru-english.app` 은 실제 메일함이 아니다. 켜두면 확인 메일을 영영 못 받아 **아무도 가입을 마칠 수 없다** |
| Authentication > Sign In / Providers | Minimum password length | **8** | `MIN_PASSWORD` 와 같아야 한다. 서버가 더 크면 클라이언트를 통과한 값이 서버에서 거절된다 |
| Authentication > URL Configuration | Site URL | 프로덕션 도메인 | |
| Authentication > URL Configuration | Redirect URLs | 프로덕션 + `https://*.vercel.app` | Vercel 프리뷰 배포 |

> **비밀번호 재설정 메일은 보낼 수 없다.** 합성 도메인이라 수신이 불가능하다.
> 비밀번호를 잊은 사용자는 현재 복구 경로가 없다 — 대상 사용자층(어르신)에서 실제로
> 발생할 문제이므로, 카카오/네이버 OAuth 추가를 후속 과제로 남긴다.

## 적용 확인

```sql
-- 테이블 8개
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- RLS 가 전부 켜져 있는지 (rowsecurity 가 하나라도 false 면 그 테이블은 anon 에게 전부 열려 있다)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' order by tablename;

-- 시드
select (select count(*) from words)       as words,       -- 12
       (select count(*) from videos)      as videos,      -- 6
       (select count(*) from categories)  as categories,  -- 5 ('전체' 는 UI 개념이라 DB 에 없다)
       (select count(*) from daily_words) as daily_words; -- (오늘 + 30일 - 2026-05-01) * 3
```

## RLS 검증 (Phase 6 DoD)

정책을 만들어 놓고 실제로 막히는지 확인하지 않으면 의미가 없다.
사용자 2명으로 로그인해 서로의 데이터가 안 보이는지 본다.

```sql
-- A 로 가장하고 B 의 즐겨찾기 조회 → 0행이어야 한다
set local role authenticated;
set local request.jwt.claims = '{"sub":"<A-uuid>","role":"authenticated"}';
select count(*) from public.favorite_words where user_id = '<B-uuid>';

-- 남의 id 로 쓰기 → RLS 위반으로 실패해야 한다
insert into public.favorite_words (user_id, word_id) values ('<B-uuid>', 'grocery');
```
