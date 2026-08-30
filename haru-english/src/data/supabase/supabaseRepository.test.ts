import { describe, expect, it } from 'vitest';

import { CURRICULUM_START, PER_DAY } from '@/lib/constants';
import { deriveWordsForDay } from '@/lib/curriculum';
import { addDays } from '@/lib/date';

import { WORDS } from '../mock/content';
import { wordsForDay } from '../mock/mockRepository';

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

  it('하루가 지나면 PER_DAY 만큼 앞으로 나아간다', () => {
    // 프로토타입은 '일'(1~31)로만 인덱싱해서 단어가 1440개가 되면
    // 인덱스가 95 를 못 넘고 카탈로그의 93% 가 영영 안 나온다.
    const catalog = Array.from({ length: 30 }, (_, i) => ({ ...WORDS[0]!, id: `w${i}`, en: `w${i}` }));
    const d0 = deriveWordsForDay(CURRICULUM_START, catalog).map((w) => w.id);
    const d1 = deriveWordsForDay(addDays(CURRICULUM_START, 1), catalog).map((w) => w.id);
    expect(d0).toEqual(['w0', 'w1', 'w2']);
    expect(d1).toEqual(['w3', 'w4', 'w5']);
  });

  it('카탈로그를 한 바퀴 돌면 처음으로 되돌아온다', () => {
    const catalog = Array.from({ length: 30 }, (_, i) => ({ ...WORDS[0]!, id: `w${i}`, en: `w${i}` }));
    // 30개 / 하루 3개 = 10일 주기
    expect(deriveWordsForDay(addDays(CURRICULUM_START, 10), catalog)).toEqual(
      deriveWordsForDay(CURRICULUM_START, catalog),
    );
  });

  it('시작일 이전 날짜에서도 카탈로그 밖으로 나가지 않는다', () => {
    for (let i = 1; i <= 40; i++) {
      const out = deriveWordsForDay(addDays(CURRICULUM_START, -i), WORDS);
      expect(out).toHaveLength(PER_DAY);
      expect(out.every((w) => WORDS.includes(w))).toBe(true);
    }
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
