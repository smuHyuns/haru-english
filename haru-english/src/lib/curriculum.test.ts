import { describe, expect, it } from 'vitest';

import type { Video } from '@/data/types';

import { CURRICULUM_START } from './constants';
import { deriveVideoForDay, deriveVideosFromDay } from './curriculum';
import { addDays, daysBetween } from './date';

const v = (id: string): Video => ({
  id,
  youtubeId: id,
  categoryId: 'daily',
  title: id,
  channel: '1일1영어',
  durationSec: 600,
  thumbnailUrl: null,
});

const CATALOG = ['a', 'b', 'c'].map(v);

describe('deriveVideoForDay', () => {
  it('시작일에는 목록의 첫 번째', () => {
    expect(deriveVideoForDay(CURRICULUM_START, CATALOG)?.id).toBe('a');
  });

  it('하루 지나면 다음 영상 — 예전 videos[0] 고정을 대체한 지점', () => {
    expect(deriveVideoForDay(addDays(CURRICULUM_START, 1), CATALOG)?.id).toBe('b');
    expect(deriveVideoForDay(addDays(CURRICULUM_START, 2), CATALOG)?.id).toBe('c');
  });

  it('목록 끝에 닿으면 처음으로 돌아온다', () => {
    expect(deriveVideoForDay(addDays(CURRICULUM_START, 3), CATALOG)?.id).toBe('a');
    expect(deriveVideoForDay(addDays(CURRICULUM_START, 301), CATALOG)?.id).toBe('b');
  });

  it('같은 날짜면 항상 같은 영상 (결정론적)', () => {
    const d = '2027-01-15';
    expect(deriveVideoForDay(d, CATALOG)).toEqual(deriveVideoForDay(d, CATALOG));
  });

  it('시작일 이전 날짜에서도 목록 밖으로 나가지 않는다 (음수 나머지)', () => {
    for (let i = 1; i <= 40; i++) {
      const got = deriveVideoForDay(addDays(CURRICULUM_START, -i), CATALOG);
      expect(CATALOG).toContain(got);
    }
  });

  it('목록이 비면 null — 화면은 이 경우 영상 카드를 통째로 숨긴다', () => {
    expect(deriveVideoForDay('2026-05-01', [])).toBeNull();
  });
});

describe('deriveVideosFromDay — 홈 캐러셀', () => {
  it('요청한 개수만큼, 그날부터 이어서', () => {
    expect(deriveVideosFromDay(CURRICULUM_START, CATALOG, 2).map((v) => v.id)).toEqual(['a', 'b']);
    expect(deriveVideosFromDay(addDays(CURRICULUM_START, 1), CATALOG, 2).map((v) => v.id)).toEqual([
      'b',
      'c',
    ]);
  });

  it('첫 편은 그날의 deriveVideoForDay 와 같다', () => {
    for (let i = 0; i < 12; i++) {
      const d = addDays(CURRICULUM_START, i);
      expect(deriveVideosFromDay(d, CATALOG, 5)[0]).toEqual(deriveVideoForDay(d, CATALOG));
    }
  });

  it('카탈로그보다 많이 요청해도 같은 편이 겹치지 않는다', () => {
    const out = deriveVideosFromDay(CURRICULUM_START, CATALOG, 10);
    expect(out).toHaveLength(CATALOG.length); // 3개뿐
    expect(new Set(out.map((v) => v.id)).size).toBe(CATALOG.length);
  });

  it('카탈로그 끝을 넘어가면 앞으로 돌아온다', () => {
    expect(deriveVideosFromDay(addDays(CURRICULUM_START, 2), CATALOG, 3).map((v) => v.id)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('목록이 비면 빈 배열', () => {
    expect(deriveVideosFromDay(CURRICULUM_START, [], 5)).toEqual([]);
  });
});

describe('daysBetween', () => {
  it('같은 날은 0, 다음 날은 1', () => {
    expect(daysBetween('2026-05-01', '2026-05-01')).toBe(0);
    expect(daysBetween('2026-05-01', '2026-05-02')).toBe(1);
  });

  it('거꾸로면 음수', () => {
    expect(daysBetween('2026-05-02', '2026-05-01')).toBe(-1);
  });

  it('월·연 경계를 넘는다', () => {
    expect(daysBetween('2026-05-01', '2026-06-01')).toBe(31);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    // 2028 은 윤년 — 2월이 29일
    expect(daysBetween('2028-02-01', '2028-03-01')).toBe(29);
  });

  it('DST 가 있는 타임존에서도 하루는 하루다 (UTC 자정 기준 계산)', () => {
    // 미국 DST 전환일(3월 둘째 주 일요일)을 사이에 두고도 정확히 1
    expect(daysBetween('2027-03-13', '2027-03-14')).toBe(1);
  });
});
