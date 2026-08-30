-- 일자별 영상 커리큘럼.
--
-- daily_words 와 같은 발상이지만 하루에 한 편이라 learn_date 만으로 PK 가 된다.
-- 이게 없으면 Today 화면이 videos[0] 을 고정으로 보여줘서 매일 같은 영상이 뜬다.
create table if not exists public.daily_videos (
  learn_date date not null primary key,
  video_id   text not null references public.videos(id) on delete restrict
);

-- 날짜로만 조회하므로 PK 인덱스로 충분하다. video_id 역방향 조회는 쓰지 않는다.

alter table public.daily_videos enable row level security;

-- 콘텐츠 테이블 — 로그인 전(둘러보기)에도 읽혀야 하므로 anon 까지 허용한다.
-- 쓰기 정책은 만들지 않는다. RLS 가 켜져 있으면 정책 없는 동작은 전부 거부된다.
drop policy if exists "daily_videos are readable by everyone" on public.daily_videos;
create policy "daily_videos are readable by everyone"
  on public.daily_videos for select to anon, authenticated using (true);

-- videos 정렬 기준.
-- 지금까지는 getVideos 가 id 순으로 정렬했는데, id 가 유튜브 영상 ID 로 바뀌면서
-- 정렬이 무의미해졌다(무작위 11자 문자열). 커리큘럼 순서를 명시적으로 담는다.
alter table public.videos add column if not exists sort_order int not null default 0;
create index if not exists videos_category_sort_idx
  on public.videos (category_id, sort_order);
