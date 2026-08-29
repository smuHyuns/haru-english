-- ─────────────────────────────────────────────────────────────
-- 0001 · 헬퍼 · 테이블 · 인덱스
-- 이 파일이 스키마의 유일한 출처다. 대시보드에서 직접 고치지 말 것
-- (재현이 안 되고 dev/prod 가 어긋난다).
-- ─────────────────────────────────────────────────────────────

-- Postgres 의 current_date 는 UTC 기준이다. 그대로 쓰면 한국 시간 밤 9시 이후
-- 학습이 '다음 날' 출석으로 기록된다. 앱의 lib/date.ts 와 같은 기준을 쓴다.
create or replace function public.kst_today()
returns date
language sql
stable
as $$ select (now() at time zone 'Asia/Seoul')::date $$;

-- ── 콘텐츠 (전 사용자 공용, 읽기 전용) ─────────────────────────

create table if not exists public.categories (
  id          text primary key,
  label       text not null,
  sort_order  int  not null
);

create table if not exists public.words (
  id          text primary key,          -- slug: 'grocery', 'on-time'
  en          text not null unique,
  ipa         text not null,
  ko          text not null,
  ex_en       text not null,
  ex_ko       text not null,
  sort_order  int  not null,             -- 커리큘럼 순서 (daily_words 생성 기준)
  created_at  timestamptz not null default now()
);

create table if not exists public.videos (
  id            text primary key,
  youtube_id    text,
  category_id   text not null references public.categories(id),
  title         text not null,
  channel       text not null,
  duration_sec  int  not null check (duration_sec > 0),
  thumbnail_url text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- 그날의 커리큘럼 — 전 사용자 공통, 하루 3개.
-- 프로토타입이 날짜만으로 단어를 결정하므로(WORDS[(day*3+slot) % 12])
-- 사용자별이 아니라 날짜별로 둔다.
create table if not exists public.daily_words (
  learn_date  date     not null,
  slot        smallint not null check (slot between 0 and 2),
  word_id     text     not null references public.words(id) on delete restrict,
  primary key (learn_date, slot)
);

-- ── 사용자 데이터 ─────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,                        -- 로그인 입력 원본 (아이디/휴대폰)
  joined_at  date not null default public.kst_today(),
  created_at timestamptz not null default now()
);

-- user_id 에 default auth.uid() 를 걸어두면 클라이언트가 user_id 를 보내지 않아도 되고,
-- RLS with check 와 합쳐 남의 id 로 쓰는 경로가 원천 차단된다.
create table if not exists public.attendance (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  learn_date date not null default public.kst_today(),
  created_at timestamptz not null default now(),
  primary key (user_id, learn_date)
);

create table if not exists public.favorite_words (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  word_id    text not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create table if not exists public.favorite_videos (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  video_id   text not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

-- ── 인덱스 ───────────────────────────────────────────────────
-- PK 가 (user_id, ...) 로 시작해 사용자별 조회는 PK 로 커버되지만,
-- 정렬·범위 조회용으로 명시한다.

create index if not exists daily_words_learn_date_idx on public.daily_words (learn_date);
create index if not exists videos_category_active_idx  on public.videos (category_id) where is_active;
create index if not exists attendance_user_date_idx    on public.attendance (user_id, learn_date desc);
create index if not exists favorite_words_user_idx     on public.favorite_words (user_id);
create index if not exists favorite_videos_user_idx    on public.favorite_videos (user_id);
