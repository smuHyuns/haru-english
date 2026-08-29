-- ─────────────────────────────────────────────────────────────
-- 콘텐츠 시드
--
-- src/data/mock/content.ts 와 **완전히 같은 데이터**여야 한다.
-- 그래야 VITE_DATA_SOURCE 를 mock ↔ supabase 로 바꿔도 화면이 안 바뀌고,
-- 바뀐다면 그건 어댑터 버그라는 뜻이 된다.
--
-- 전부 idempotent (on conflict do nothing) — 여러 번 돌려도 안전.
-- ─────────────────────────────────────────────────────────────

-- 주의: mock 의 CATEGORIES 에는 { id:'all', label:'전체' } 가 들어 있지만
-- 여기엔 넣지 않는다. '전체' 는 콘텐츠가 아니라 UI 필터 개념이라
-- 어댑터(getCategories)가 앞에 붙인다. DB 에 두면 videos.category_id 가
-- 'all' 을 참조할 수 있게 되어 무결성이 헐거워진다.
insert into public.categories (id, label, sort_order) values
  ('daily','일상',1), ('travel','여행',2), ('restaurant','식당',3),
  ('shopping','쇼핑',4), ('hospital','병원',5)
on conflict (id) do nothing;

insert into public.words (id, en, ipa, ko, ex_en, ex_ko, sort_order) values
  ('grocery',     'grocery',     '[ˈɡroʊ.sər.i]',  '식료품',    'I need to buy a few grocery items.',  '식료품 몇 가지를 사야 해요.',         1),
  ('appointment', 'appointment', '[əˈpɔɪnt.mənt]', '약속, 예약', 'I have an appointment at three.',     '3시에 예약이 있어요.',                2),
  ('receipt',     'receipt',     '[rɪˈsiːt]',      '영수증',    'Could I get a receipt, please?',      '영수증 좀 받을 수 있을까요?',         3),
  ('neighbor',    'neighbor',    '[ˈneɪ.bɚ]',      '이웃',      'My neighbor helped me this morning.', '오늘 아침에 이웃이 저를 도와줬어요.',  4),
  ('refreshing',  'refreshing',  '[rɪˈfreʃ.ɪŋ]',   '상쾌한',    'The morning air feels refreshing.',   '아침 공기가 상쾌해요.',               5),
  ('refund',      'refund',      '[ˈriː.fʌnd]',    '환불',      'Can I get a refund for this?',        '이거 환불받을 수 있을까요?',          6),
  ('pharmacy',    'pharmacy',    '[ˈfɑːr.mə.si]',  '약국',      'The pharmacy is next to the bank.',   '약국은 은행 옆에 있어요.',            7),
  ('borrow',      'borrow',      '[ˈbɑː.roʊ]',     '빌리다',    'May I borrow your pen?',              '펜 좀 빌려도 될까요?',                8),
  ('crowded',     'crowded',     '[ˈkraʊ.dɪd]',    '붐비는',    'The bus was very crowded today.',     '오늘 버스가 아주 붐볐어요.',          9),
  ('leftover',    'leftover',    '[ˈleft.oʊ.vər]', '남은 음식',  'I ate the leftover soup.',            '남은 국을 먹었어요.',                10),
  ('on-time',     'on time',     '[ɑːn taɪm]',     '제시간에',   'The train arrived on time.',          '기차가 제시간에 도착했어요.',        11),
  ('chilly',      'chilly',      '[ˈtʃɪl.i]',      '쌀쌀한',    'It gets chilly at night.',            '밤에는 쌀쌀해져요.',                 12)
on conflict (id) do nothing;

insert into public.videos (id, category_id, title, channel, duration_sec) values
  ('v1','daily',      '아침에 쓰는 인사 표현 10가지', 'Everyday English',  480),
  ('v2','travel',     '공항에서 바로 쓰는 문장',     'Travel Talk',       720),
  ('v3','restaurant', '카페에서 주문하기',          'Slow English',      360),
  ('v4','shopping',   '마트에서 물건 찾을 때',       'Daily Phrases',     540),
  ('v5','daily',      '날씨 이야기로 대화 시작하기',  'Small Talk',        420),
  ('v6','hospital',   '병원에서 증상 말하기',        'Real Life English', 600)
on conflict (id) do nothing;

-- ── daily_words — 프로토타입 공식 그대로 ──────────────────────
-- WORDS[(일자 * 3 + slot) % 12] 를 SQL 로 옮긴 것.
-- 가입 가능월(2026-05-01)부터 오늘 + 30일까지 채운다.
--
-- 운영 주의: 미래 30일치만 채운다. 커리큘럼이 떨어지면 daily_words 가 비고
-- 홈이 폴백(전체 단어)으로 떨어진다. 주기적으로 이 블록을 다시 돌리거나
-- 나중에 pg_cron 롤링 잡을 붙일 것.
with ordered as (
  select id,
         (row_number() over (order by sort_order) - 1)::int as idx,
         count(*) over ()                                   as total
  from public.words
),
d as (
  select generate_series(date '2026-05-01', public.kst_today() + 30, interval '1 day')::date as learn_date
)
insert into public.daily_words (learn_date, slot, word_id)
select d.learn_date, s.slot, o.id
from d
cross join generate_series(0, 2) as s(slot)
join ordered o
  on o.idx = ((extract(day from d.learn_date)::int * 3) + s.slot) % o.total
on conflict (learn_date, slot) do nothing;
