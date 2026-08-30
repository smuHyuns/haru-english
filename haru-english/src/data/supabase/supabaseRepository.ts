import { PER_DAY } from '@/lib/constants';
import { deriveVideoForDay } from '@/lib/curriculum';
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
  async getTodayWords(): Promise<Word[]> {
    const rows = unwrap(
      await getSupabase().from('words').select(WORD_COLS).order('sort_order').returns<WordRow[]>(),
      '단어 목록',
    );
    return rows.map(toWord);
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
    return deriveWordsForDay(date, await supabaseRepository.getTodayWords());
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
    const base = getSupabase().from('videos').select(VIDEO_COLS).eq('is_active', true);
    const q = category === 'all' ? base : base.eq('category_id', category);
    // id 가 유튜브 영상 ID(무작위 11자)라 정렬 기준이 못 된다. sort_order 로 커리큘럼 순.
    // 카테고리를 안 고른 '전체' 에서도 생활회화 1강부터 보이도록 category_id 를 먼저 본다.
    return unwrap(
      await q.order('category_id').order('sort_order').returns<VideoRow[]>(),
      '영상 목록',
    ).map(toVideo);
  },

  async getVideoByDate(date: DateStr): Promise<Video | null> {
    const rows = unwrap(
      await getSupabase()
        .from('daily_videos')
        .select(`video_id, videos(${VIDEO_COLS})`)
        .eq('learn_date', date)
        .returns<{ video_id: string; videos: VideoRow | null }[]>(),
      '오늘의 영상',
    );
    const row = rows[0]?.videos;
    if (row) return toVideo(row);

    // 폴백 — 커리큘럼이 그 날짜까지 안 채워진 경우. 생활회화를 순환시킨다.
    return deriveVideoForDay(date, await supabaseRepository.getVideos('daily'));
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

/** 프로토타입 규칙 WORDS[(일자 * PER_DAY + slot) % total] — mock 의 wordsForDay 와 같은 식 */
export function deriveWordsForDay(date: DateStr, catalog: Word[]): Word[] {
  if (catalog.length === 0) return [];
  const { day } = parseDate(date);
  return Array.from(
    { length: PER_DAY },
    (_, slot) => catalog[(day * PER_DAY + slot) % catalog.length]!,
  );
}
