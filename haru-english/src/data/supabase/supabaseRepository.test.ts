import { describe, expect, it } from 'vitest';

import { PER_DAY } from '@/lib/constants';

import { WORDS } from '../mock/content';
import { wordsForDay } from '../mock/mockRepository';
import { deriveWordsForDay } from './supabaseRepository';

/*
 * 어댑터 전환(mock ↔ supabase)에서 화면이 바뀌면 안 된다.
 * daily_words 가 비었을 때 쓰는 폴백이 mock 의 규칙과 어긋나면
 * "지난 날 시트에 다른 단어가 뜬다" 로 나타나는데, 눈으로는 잘 안 잡힌다.
 */
describe('supabase 폴백 ↔ mock 규칙 동치', () => {
  it('한 달 전체에서 mock 과 같은 단어를 낸다', () => {
    for (let day = 1; day <= 31; day++) {
      const date = `2026-08-${String(day).padStart(2, '0')}`;
      expect(deriveWordsForDay(date, WORDS), date).toEqual(wordsForDay(date));
    }
  });

  it('월이 달라도 일자만 같으면 같은 단어다 (프로토타입 규칙)', () => {
    expect(deriveWordsForDay('2026-05-12', WORDS)).toEqual(deriveWordsForDay('2026-11-12', WORDS));
  });

  it('하루 PER_DAY 개', () => {
    expect(deriveWordsForDay('2026-08-12', WORDS)).toHaveLength(PER_DAY);
  });

  it('카탈로그가 비면 빈 배열 — 인덱싱으로 터지지 않는다', () => {
    expect(deriveWordsForDay('2026-08-12', [])).toEqual([]);
  });

  it('카탈로그가 PER_DAY 보다 적어도 순환해서 채운다', () => {
    const two = WORDS.slice(0, 2);
    const out = deriveWordsForDay('2026-08-12', two);
    expect(out).toHaveLength(PER_DAY);
    expect(out.every((w) => two.includes(w))).toBe(true);
  });
});
