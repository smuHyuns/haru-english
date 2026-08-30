import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CURRICULUM_START, PER_DAY } from '@/lib/constants';
import { addDays, kstToday, parseDate } from '@/lib/date';

import { thumbnailUrl, videoMeta } from '../types';
import { CATEGORIES, JOINED_AT, VIDEOS, WORDS } from './content';
import { createMockRepository, seedAttendance, wordsForDay } from './mockRepository';

describe('콘텐츠 시드', () => {
  it('단어 12개, 영상 7개, 카테고리 5개', () => {
    expect(WORDS).toHaveLength(12);
    // 영상은 실제 콘텐츠(439개)의 축소판이라 프로토타입의 6개와 개수가 다르다
    expect(VIDEOS).toHaveLength(7);
    expect(CATEGORIES).toHaveLength(5); // 전체 + 생활회화/몰아듣기/말하기/공부법
  });

  it('단어 id 가 slug 이고 중복이 없다', () => {
    const ids = WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('on-time'); // "on time" → 공백을 하이픈으로
    for (const id of ids) expect(id).toMatch(/^[a-z-]+$/);
  });

  it('videoMeta 를 duration/channel 에서 파생한다', () => {
    expect(videoMeta(VIDEOS[0]!)).toBe('20분 · 1일1영어'); // 1197초
    expect(videoMeta(VIDEOS[1]!)).toBe('19분 · 1일1영어'); // 1142초
  });

  it('한 시간이 넘으면 시간 단위로 적는다 — 몰아듣기가 최대 3시간이라', () => {
    const pack = VIDEOS.find((v) => v.categoryId === 'pack')!;
    expect(videoMeta(pack)).toBe('5시간 19분 · 1일1영어'); // 19151초
    expect(videoMeta({ ...pack, durationSec: 7200 })).toBe('2시간 · 1일1영어');
    expect(videoMeta({ ...pack, durationSec: 3540 })).toBe('59분 · 1일1영어');
  });

  it('썸네일 주소를 영상 ID 에서 파생한다', () => {
    expect(thumbnailUrl(VIDEOS[0]!)).toBe('https://i.ytimg.com/vi/GGvsQdnGg_E/mqdefault.jpg');
    // 명시된 주소가 있으면 그걸 쓴다
    expect(thumbnailUrl({ ...VIDEOS[0]!, thumbnailUrl: '/x.jpg' })).toBe('/x.jpg');
    // 유튜브 ID 가 없으면 플레이스홀더로 떨어지도록 null
    expect(thumbnailUrl({ ...VIDEOS[0]!, youtubeId: null })).toBeNull();
  });
});

describe('wordsForDay — 커리큘럼 시작일부터 하루 PER_DAY 개씩', () => {
  it('하루 3개를 준다', () => {
    expect(wordsForDay('2026-08-12')).toHaveLength(PER_DAY);
  });

  it('같은 날짜면 항상 같은 단어 (결정론적)', () => {
    expect(wordsForDay('2026-08-12')).toEqual(wordsForDay('2026-08-12'));
  });

  it('시작일에는 카탈로그 앞에서 세 개', () => {
    expect(wordsForDay(CURRICULUM_START).map((w) => w.id)).toEqual([
      'grocery',
      'appointment',
      'receipt',
    ]);
  });

  it('다음 날은 그 다음 세 개', () => {
    expect(wordsForDay(addDays(CURRICULUM_START, 1)).map((w) => w.id)).toEqual([
      'neighbor',
      'refreshing',
      'refund',
    ]);
  });

  it('날짜가 다르면 단어도 다르다 — 예전엔 일자만 같으면 같았다', () => {
    expect(wordsForDay('2026-07-12')).not.toEqual(wordsForDay('2026-08-12'));
  });
});

describe('seedAttendance', () => {
  const today = parseDate(kstToday());

  it('미래월은 비어 있다', () => {
    expect(seedAttendance(today.year + 1, 1)).toEqual([]);
  });

  it('가입월 이전은 비어 있다', () => {
    const joined = parseDate(JOINED_AT);
    expect(seedAttendance(joined.year - 1, 12)).toEqual([]);
  });

  it('현재월은 오늘을 넘지 않고, 오늘은 반드시 포함한다', () => {
    const days = seedAttendance(today.year, today.month);
    expect(Math.max(...days)).toBeLessThanOrEqual(today.day);
    expect(days).toContain(today.day);
  });
});

describe('mockRepository', () => {
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    repo = createMockRepository();
  });

  it('카테고리 필터가 동작한다', async () => {
    expect(await repo.getVideos('all')).toHaveLength(7);
    const daily = await repo.getVideos('daily');
    expect(daily).toHaveLength(3);
    expect(daily.every((v) => v.categoryId === 'daily')).toBe(true);
  });

  it('id 로 단어·영상을 골라 온다 — 즐겨찾기 화면이 카탈로그 전체를 안 받게', async () => {
    const words = await repo.getWordsByIds(['receipt', 'chilly']);
    expect(words.map((w) => w.id)).toEqual(['receipt', 'chilly']);

    const videos = await repo.getVideosByIds(['cgQK_ylwiEY']);
    expect(videos.map((v) => v.id)).toEqual(['cgQK_ylwiEY']);
  });

  it('빈 id 목록이면 빈 배열 — 즐겨찾기가 하나도 없는 사용자', async () => {
    expect(await repo.getWordsByIds([])).toEqual([]);
    expect(await repo.getVideosByIds([])).toEqual([]);
  });

  it('없는 id 는 조용히 빠진다', async () => {
    expect(await repo.getWordsByIds(['receipt', 'nope'])).toHaveLength(1);
  });

  it('즐겨찾기 시드가 프로토타입과 같다', async () => {
    const fav = await repo.getFavorites();
    expect(fav.words).toEqual(['receipt', 'appointment']);
    expect(fav.videos).toEqual(['cgQK_ylwiEY']);
  });

  it('즐겨찾기를 켜고 끌 수 있고, 중복 추가되지 않는다', async () => {
    await repo.setFavoriteWord('grocery', true);
    await repo.setFavoriteWord('grocery', true);
    expect((await repo.getFavorites()).words).toEqual(['receipt', 'appointment', 'grocery']);

    await repo.setFavoriteWord('receipt', false);
    expect((await repo.getFavorites()).words).toEqual(['appointment', 'grocery']);
  });

  it('없는 항목을 꺼도 조용히 넘어간다', async () => {
    await repo.setFavoriteVideo('v99', false);
    expect((await repo.getFavorites()).videos).toEqual(['cgQK_ylwiEY']);
  });

  it('반환된 배열을 밖에서 고쳐도 내부 상태가 안 바뀐다', async () => {
    const fav = await repo.getFavorites();
    fav.words.push('침입');
    expect((await repo.getFavorites()).words).not.toContain('침입');
  });

  it('인스턴스끼리 상태가 격리된다', async () => {
    const other = createMockRepository();
    await repo.setFavoriteWord('chilly', true);
    expect((await other.getFavorites()).words).not.toContain('chilly');
  });

  it('오늘 출석을 기록하면 현재월 출석에 들어간다', async () => {
    const { year, month, day } = parseDate(kstToday());
    await repo.markAttendanceToday();
    expect((await repo.getAttendance(year, month)).days).toContain(day);
  });

  it('최근 출석은 오늘부터 과거 순으로 준다', async () => {
    const dates = await repo.getRecentAttendance(10);
    expect(dates[0]).toBe(kstToday());
    // 내림차순
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('프로필의 가입월이 캘린더 하한이 된다', async () => {
    expect((await repo.getProfile()).joinedAt).toBe(JOINED_AT);
  });
});

describe('홈 단어 순환 (프로토타입: 음수 허용 후 모듈로 정규화)', () => {
  const normalize = (i: number, len: number) => ((i % len) + len) % len;

  it('앞뒤로 무한 순환한다', () => {
    const n = WORDS.length;
    expect(normalize(0, n)).toBe(0);
    expect(normalize(-1, n)).toBe(11);
    expect(normalize(-13, n)).toBe(11);
    expect(normalize(12, n)).toBe(0);
    expect(normalize(25, n)).toBe(1);
  });
});

// 음성 재생은 jsdom 에 speechSynthesis 가 없어 'unsupported' 를 반환해야 한다
describe('say()', () => {
  it('speechSynthesis 미지원 환경에서 unsupported 를 반환한다', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    const { say } = await import('@/lib/speech');
    expect(say('grocery')).toBe('unsupported');
    vi.unstubAllGlobals();
  });
});
