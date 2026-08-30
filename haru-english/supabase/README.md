# Supabase 스키마

`migrations/` + `seed.sql` 이 **스키마의 유일한 정본**이다.
대시보드에서 테이블을 직접 만들거나 고치지 말 것 — 재현이 안 되고 프로젝트끼리 어긋난다.
바꿔야 하면 새 마이그레이션 파일을 추가한다.

## 적용 순서

```
migrations/20260829000001_init.sql            확장 · kst_today() · 테이블 · 인덱스
migrations/20260829000002_rls.sql             RLS 활성화 + 정책
migrations/20260829000003_profile_trigger.sql 가입 시 profiles 자동 생성
migrations/20260830000001_daily_videos.sql    일자별 영상 커리큘럼 + videos.sort_order
seed.sql                                      단어·카테고리 시드
seed_youtube.sql                              유튜브 콘텐츠 439개 + 409일치 영상 커리큘럼
```

전부 idempotent 하다 (`if not exists` / `on conflict do nothing|do update` / `drop policy if exists`).
여러 번 돌려도 안전하다.

> `seed_youtube.sql` 은 반드시 `seed.sql` **뒤에** 돌린다.
> 프로토타입 더미 영상 `v1~v6` 과 콘텐츠가 없는 카테고리(`travel` `restaurant` `shopping`
> `hospital`)를 지우고 실제 카테고리로 갈아끼우기 때문이다.
> `favorite_videos` 는 `on delete cascade` 라 `v1~v6` 에 걸린 즐겨찾기도 함께 사라진다.

### 방법 A — 대시보드 SQL Editor

위 6개 파일을 **순서대로** 붙여넣고 실행. 지금은 이게 가장 빠르다.

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
-- 테이블 9개
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- RLS 가 전부 켜져 있는지 (rowsecurity 가 하나라도 false 면 그 테이블은 anon 에게 전부 열려 있다)
select tablename, rowsecurity from pg_tables
where schemaname = 'public' order by tablename;

-- 시드
select (select count(*) from words)        as words,        -- 12
       (select count(*) from videos)       as videos,       -- 439
       (select count(*) from categories)   as categories,   -- 4 ('전체' 는 UI 개념이라 DB 에 없다)
       (select count(*) from daily_words)  as daily_words,  -- (오늘 + 30일 - 2026-05-01) * 3
       (select count(*) from daily_videos) as daily_videos; -- 409 (2026-05-01 ~ 2027-06-13)

-- 카테고리별 영상 수 — daily 409 / pack 26 / speaking 2 / study 2
select category_id, count(*) from videos group by 1 order by 2 desc;

-- 오늘의 영상이 실제로 잡히는지
select v.title, v.channel from daily_videos d
  join videos v on v.id = d.video_id
 where d.learn_date = public.kst_today();
```

## 유튜브 콘텐츠 (`seed_youtube.sql`)

출처는 `mds/youtube.md`. 재생목록 `PLMrnNeksF42O3UkOyCoj9QxEq2TPJ9xyO`(채널 `1일1영어`)
484개에서 삭제·비공개 12개와 90초 미만 숏츠 42개를 뺀 430개 + 개별 영상 9개 = **439개**.

| 카테고리 | 라벨 | 개수 | 내용 |
|---|---|---:|---|
| `daily` | 생활회화 | 409 | 8~28분짜리 회차물. `1강`~`409강` 으로 번호를 다시 매겼다 |
| `pack` | 몰아듣기 | 26 | 30분 이상 통합본 (최대 5시간 19분) |
| `speaking` | 말하기 | 2 | 소리튜닝·스피킹 |
| `study` | 공부법 | 2 | 공부법, 영단어 1500개 |

몇 가지 결정:

- **`videos.id` 는 유튜브 영상 ID 를 그대로 쓴다.** 안정적이고 매핑 테이블이 필요 없다.
  대신 `id` 순 정렬이 무의미해져서 `sort_order` 컬럼을 새로 뒀다.
- **`thumbnail_url` 은 비워 둔다.** `i.ytimg.com/vi/{id}/mqdefault.jpg` 로 파생 가능하다
  (`src/data/types.ts` 의 `thumbnailUrl()`). 439행에 100자짜리 URL 을 중복 저장할 이유가 없다.
- **제목에서 검색용 태그를 뗐다.** 원제는 `#66 … | 생활영어 | 영어듣기 | 쉬운영어` 처럼
  꼬리가 길다. 첫 `|` 앞만 남기고 회차 번호는 다시 매겼다.
- **번호를 다시 매긴 이유**: 원본 회차가 `#66`~`497` 로 시작이 66 이고 중간이 비어 있다.
  또 제목이 겹치는 회차가 32개 있어서 번호가 없으면 목록에서 구분이 안 된다.
- **재생목록 API 가 일부 영상에 번역된 영어 제목을 100자로 잘라서 준다.** 실제 업로드
  제목은 전부 한국어라, 한글이 없는 156개는 개별 조회로 다시 받아 덮어썼다.

커리큘럼이 2027-06-13 에 끝나면 어댑터가 `deriveVideoForDay` 순환 폴백으로 떨어진다
(`src/lib/curriculum.ts`). 화면이 비지는 않지만, 그 전에 이 시드를 갱신하는 편이 낫다.

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
