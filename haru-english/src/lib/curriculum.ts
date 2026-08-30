import type { DateStr, Video, Word } from '@/data/types';

import { CURRICULUM_START, PER_DAY } from './constants';
import { daysBetween } from './date';

/** 커리큘럼 N일차 (시작일이 0일차). 음수도 그대로 돌려준다 */
export function dayIndex(date: DateStr): number {
  return daysBetween(CURRICULUM_START, date);
}

/** 목록 길이에 맞춰 감싼 인덱스. 음수 나머지를 한 번 더 정규화한다 */
export function wrap(i: number, len: number): number {
  return ((i % len) + len) % len;
}

/**
 * 그날 배울 단어의 카탈로그 내 시작 위치.
 * 하루 PER_DAY 개씩 앞으로 나아간다 — 단어가 1440개면 480일치 커리큘럼이 된다.
 *
 * 프로토타입은 `일자 * 3 + slot` 이라 '일'(1~31)만 썼다. 단어가 12개일 땐 문제가
 * 없었지만 1440개가 되면 인덱스가 95 를 넘지 못해 카탈로그의 93% 를 못 쓴다.
 */
export function wordStartIndex(date: DateStr, total: number): number {
  return wrap(dayIndex(date) * PER_DAY, total);
}

/** 커리큘럼이 떨어진 날의 단어 폴백 — 카탈로그를 순환한다 */
export function deriveWordsForDay(date: DateStr, catalog: Word[]): Word[] {
  if (catalog.length === 0) return [];
  const start = wordStartIndex(date, catalog.length);
  return Array.from({ length: PER_DAY }, (_, slot) => catalog[wrap(start + slot, catalog.length)]!);
}

/**
 * 커리큘럼이 떨어진 날의 폴백 — 목록을 순환시킨다.
 *
 * daily_videos 는 유한하다(2027-06-13 까지). 그 뒤로 넘어가면 '오늘의 영상' 자리가
 * 비어 홈이 무너지므로, 시작일 기준 일수로 목록을 돌려 항상 한 편이 나오게 한다.
 *
 * 어댑터가 아니라 여기 두는 이유: mock 과 supabase 가 같은 규칙을 써야 하는데
 * mock 이 supabase 모듈을 import 하면 mock 빌드에 supabase-js 가 딸려 들어온다.
 */
export function deriveVideoForDay(date: DateStr, catalog: Video[]): Video | null {
  if (catalog.length === 0) return null;
  return catalog[wrap(dayIndex(date), catalog.length)]!;
}

/** 그날부터 count 일치. 카탈로그가 count 보다 짧으면 있는 만큼만 (같은 편이 겹치지 않게) */
export function deriveVideosFromDay(date: DateStr, catalog: Video[], count: number): Video[] {
  if (catalog.length === 0) return [];
  const n = Math.min(count, catalog.length);
  const start = dayIndex(date);
  return Array.from({ length: n }, (_, i) => catalog[wrap(start + i, catalog.length)]!);
}
