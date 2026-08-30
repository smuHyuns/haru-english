import { PER_DAY, TODAY_VIDEOS } from '@/lib/constants';
import { deriveVideosFromDay, wordStartIndex } from '@/lib/curriculum';
import { addDays, daysInMonth, kstToday, parseDate, toDateStr } from '@/lib/date';

import type { Repository } from '../repository';
import type {
  AttendanceMonth,
  Category,
  CategoryFilter,
  DateStr,
  Favorites,
  Profile,
  Video,
  Word,
} from '../types';
import { getSupabase, requireUserId } from './client';

/*
 * Supabase 어댑터.
 *
 * mockRepository 와 화면상 동작이 같아야 한다 — 다르면 그건 이 파일의 버그다.
 * 스키마는 supabase/migrations/*.sql 이 정본.
 */

// ── DB 행 모양 (snake_case) ───────────────────────────────────

type WordRow = {
  id: string;
  en: string;
  ipa: string;
  ko: string;
  ex_en: string;
  ex_ko: string;
};

type VideoRow = {
  id: string;
  youtube_id: string | null;
  category_id: string;
  title: string;
  channel: string;
  duration_sec: number;
  thumbnail_url: string | null;
  sort_order: number;
};

const WORD_COLS = 'id, en, ipa, ko, ex_en, ex_ko';
const VIDEO_COLS =
  'id, youtube_id, category_id, title, channel, duration_sec, thumbnail_url, sort_order';

function toWord(r: WordRow): Word {
  return { id: r.id, en: r.en, ipa: r.ipa, ko: r.ko, exEn: r.ex_en, exKo: r.ex_ko };
}

function toVideo(r: VideoRow): Video {
  return {
    id: r.id,
    youtubeId: r.youtube_id,
    categoryId: r.category_id as Video['categoryId'],
    title: r.title,
    channel: r.channel,
    durationSec: r.duration_sec,
    thumbnailUrl: r.thumbnail_url,
  };
}

/**
 * daily_words 가 비어 있는 날의 폴백.
 *
 * 목처럼 카탈로그를 통째로 받아 자르지 않는다 — 단어가 1440개라
 * 폴백 한 번에 1440행을 내려받게 된다. 개수만 세고 필요한 3행만 range 로 집는다.
 */
async function fallbackWordsForDay(date: DateStr): Promise<Word[]> {
  const sb = getSupabase();
  const { count, error } = await sb.from('words').select('id', { count: 'exact', head: true });
  if (error) throw new Error(`단어 개수: ${error.message}`);
  if (!count) return [];

  const start = wordStartIndex(date, count);
  const take = async (from: number, n: number) =>
    unwrap(
      await sb
        .from('words')
        .select(WORD_COLS)
        .order('sort_order')
        .range(from, from + n - 1)
        .returns<WordRow[]>(),
      '단어 폴백',
    );

  const head = await take(start, PER_DAY);
  // 카탈로그 끝을 넘어가면 앞쪽에서 마저 채운다 (range 는 감싸주지 않는다)
  const rest = head.length < PER_DAY ? await take(0, PER_DAY - head.length) : [];
  return [...head, ...rest].map(toWord).slice(0, PER_DAY);
}

/** PostgREST 에러를 그대로 던진다 — 빈 배열로 삼키면 장애가 '데이터 없음'으로 보인다 */
function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data === null) throw new Error(`${what}: 응답이 비어 있습니다`);
  return res.data;
}

export const supabaseRepository: Repository = {
  /*
   * 이름은 '오늘의 단어'지만 실제로는 단어 카탈로그 전체를 돌려준다. 이유가 둘.
   *   1. 홈은 프로토타입대로 전체 단어를 순환한다 (카운터가 "1 / 12").
   *   2. Saved 화면이 이 목록으로 즐겨찾기 id 를 단어로 해석한다.
   *      오늘치 3개만 주면 다른 날 즐겨찾기한 단어가 목록에서 사라진다.
   * 단어가 수백 개로 늘면 getWordsByIds 를 따로 만들고 여기를 쪼개야 한다.
   */
  async getWordsByIds(ids: string[]): Promise<Word[]> {
    if (ids.length === 0) return []; // 빈 in() 은 PostgREST 에서 문법 오류가 된다
    const rows = unwrap(
      await getSupabase()
        .from('words')
        .select(WORD_COLS)
        .in('id', ids)
        .order('sort_order')
        .returns<WordRow[]>(),
      '단어 조회',
    );
    return rows.map(toWord);
  },

  async getVideosByIds(ids: string[]): Promise<Video[]> {
    if (ids.length === 0) return [];
    const rows = unwrap(
      await getSupabase()
        .from('videos')
        .select(VIDEO_COLS)
        .in('id', ids)
        .order('category_id')
        .order('sort_order')
        .returns<VideoRow[]>(),
      '영상 조회',
    );
    return rows.map(toVideo);
  },

  async getWordsByDate(date: DateStr): Promise<Word[]> {
    const rows = unwrap(
      await getSupabase()
        .from('daily_words')
        .select(`slot, words(${WORD_COLS})`)
        .eq('learn_date', date)
        .order('slot')
        .returns<{ slot: number; words: WordRow | null }[]>(),
      '그날의 단어',
    );

    const words = rows.map((r) => r.words).filter((w): w is WordRow => w !== null);
    if (words.length > 0) return words.map(toWord);

    // 폴백 — 커리큘럼(daily_words)이 그 날짜까지 안 채워진 경우.
    // mock 과 같은 결정론적 규칙으로 채워 화면이 비지 않게 한다.
    return fallbackWordsForDay(date);
  },

  async getCategories(): Promise<Category[]> {
    const rows = unwrap(
      await getSupabase()
        .from('categories')
        .select('id, label, sort_order')
        .order('sort_order')
        .returns<{ id: string; label: string; sort_order: number }[]>(),
      '카테고리',
    );
    // '전체' 는 콘텐츠가 아니라 UI 필터라 DB 에 두지 않고 여기서 붙인다 (seed.sql 주석 참고)
    return [
      { id: 'all', label: '전체', sortOrder: 0 },
      ...rows.map((r) => ({ id: r.id as Category['id'], label: r.label, sortOrder: r.sort_order })),
    ];
  },

  async getVideos(category: CategoryFilter): Promise<Video[]> {
    /*
     * 생활회화는 409편이라 통째로 내려받지 않는다. 오늘 구간 TODAY_VIDEOS 편만.
     * 화면에서 잘라내는 게 아니라 여기서 막는다 — 그래야 네트워크로 409행이 안 온다.
     */
    if (category === 'daily') {
      return supabaseRepository.getVideosByDate(kstToday(), TODAY_VIDEOS);
    }

    const base = getSupabase().from('videos').select(VIDEO_COLS).eq('is_active', true);
    // id 가 유튜브 영상 ID(무작위 11자)라 정렬 기준이 못 된다. sort_order 로 커리큘럼 순.
    const rest = unwrap(
      await (category === 'all' ? base.neq('category_id', 'daily') : base.eq('category_id', category))
        .order('category_id')
        .order('sort_order')
        .returns<VideoRow[]>(),
      '영상 목록',
    ).map(toVideo);

    if (category !== 'all') return rest;
    // '전체' 는 생활회화(sort_order 1) 를 앞에 두고 나머지를 잇는다
    return [...(await supabaseRepository.getVideosByDate(kstToday(), TODAY_VIDEOS)), ...rest];
  },

  async getVideosByDate(date: DateStr, count: number): Promise<Video[]> {
    const rows = unwrap(
      await getSupabase()
        .from('daily_videos')
        .select(`learn_date, videos(${VIDEO_COLS})`)
        .gte('learn_date', date)
        .lte('learn_date', addDays(date, count - 1))
        .order('learn_date')
        .returns<{ learn_date: DateStr; videos: VideoRow | null }[]>(),
      '오늘 볼 영상',
    );
    const found = rows.map((r) => r.videos).filter((v): v is VideoRow => v !== null);
    if (found.length === count) return found.map(toVideo);

    /*
     * 커리큘럼이 끝나가면 요청한 만큼 안 나온다(마지막 날 근처). 그때는 부분 결과를
     * 쓰지 않고 통째로 폴백한다 — 3편만 보이다 말면 목록이 잘린 것처럼 보인다.
     */
    return deriveVideosFromDay(date, await supabaseRepository.getVideos('daily'), count);
  },

  async getAttendance(year: number, month: number): Promise<AttendanceMonth> {
    const userId = await requireUserId();
    const rows = unwrap(
      await getSupabase()
        .from('attendance')
        .select('learn_date')
        .eq('user_id', userId)
        .gte('learn_date', toDateStr(year, month, 1))
        .lte('learn_date', toDateStr(year, month, daysInMonth(year, month)))
        .returns<{ learn_date: DateStr }[]>(),
      '출석',
    );
    return { year, month, days: rows.map((r) => parseDate(r.learn_date).day) };
  },

  async getRecentAttendance(days = 120): Promise<DateStr[]> {
    const userId = await requireUserId();
    const rows = unwrap(
      await getSupabase()
        .from('attendance')
        .select('learn_date')
        .eq('user_id', userId)
        .gte('learn_date', addDays(kstToday(), -(days - 1)))
        .order('learn_date', { ascending: false })
        .returns<{ learn_date: DateStr }[]>(),
      '최근 출석',
    );
    return rows.map((r) => r.learn_date);
  },

  async markAttendanceToday(): Promise<void> {
    const userId = await requireUserId();
    // 앱 진입마다 호출되므로 PK 충돌이 정상 경로다 — 조용히 넘어간다
    const { error } = await getSupabase()
      .from('attendance')
      .upsert(
        { user_id: userId, learn_date: kstToday() },
        { onConflict: 'user_id,learn_date', ignoreDuplicates: true },
      );
    if (error) throw new Error(`출석 기록: ${error.message}`);
  },

  async getProfile(): Promise<Profile> {
    const { data: userData } = await getSupabase().auth.getUser();
    const user = userData.user;
    if (!user) throw new Error('로그인이 필요합니다 (세션 없음).');

    const row = unwrap(
      await getSupabase()
        .from('profiles')
        .select('id, username, joined_at')
        .eq('id', user.id)
        .maybeSingle()
        .returns<{ id: string; username: string | null; joined_at: DateStr } | null>(),
      '프로필',
    );

    return {
      userId: user.id,
      username: row?.username ?? null,
      // 트리거가 만들어 주지만, 아직 없으면 오늘로 본다 (캘린더 하한월이 미래가 되지 않게)
      joinedAt: row?.joined_at ?? kstToday(),
      isAnonymous: user.is_anonymous ?? false,
    };
  },

  async getFavorites(): Promise<Favorites> {
    const userId = await requireUserId();
    const sb = getSupabase();
    const [words, videos] = await Promise.all([
      sb
        .from('favorite_words')
        .select('word_id')
        .eq('user_id', userId)
        .returns<{ word_id: string }[]>(),
      sb
        .from('favorite_videos')
        .select('video_id')
        .eq('user_id', userId)
        .returns<{ video_id: string }[]>(),
    ]);
    return {
      words: unwrap(words, '즐겨찾기 단어').map((r) => r.word_id),
      videos: unwrap(videos, '즐겨찾기 영상').map((r) => r.video_id),
    };
  },

  async setFavoriteWord(wordId: string, on: boolean): Promise<void> {
    await setFavorite('favorite_words', 'word_id', wordId, on);
  },

  async setFavoriteVideo(videoId: string, on: boolean): Promise<void> {
    await setFavorite('favorite_videos', 'video_id', videoId, on);
  },
};

async function setFavorite(
  table: 'favorite_words' | 'favorite_videos',
  column: 'word_id' | 'video_id',
  id: string,
  on: boolean,
): Promise<void> {
  const userId = await requireUserId();
  const sb = getSupabase();

  const { error } = on
    ? await sb
        .from(table)
        .upsert(
          { user_id: userId, [column]: id },
          { onConflict: `user_id,${column}`, ignoreDuplicates: true },
        )
    : await sb.from(table).delete().eq('user_id', userId).eq(column, id);

  if (error) throw new Error(`즐겨찾기 ${on ? '추가' : '해제'}: ${error.message}`);
}

