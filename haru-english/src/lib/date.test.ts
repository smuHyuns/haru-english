import { describe, expect, it } from 'vitest';

import {
  addDays,
  compareMonth,
  dayOfWeek,
  daysInMonth,
  formatHeaderDate,
  formatSheetDate,
  monthGrid,
  parseDate,
  shiftMonth,
  startDow,
  toDateStr,
  toMonthStr,
} from './date';

describe('parseDate / toDateStr', () => {
  it('왕복 변환이 보존된다', () => {
    const { year, month, day } = parseDate('2026-08-20');
    expect([year, month, day]).toEqual([2026, 8, 20]);
    expect(toDateStr(year, month, day)).toBe('2026-08-20');
  });

  it('한 자리 월·일을 0으로 채운다', () => {
    expect(toDateStr(2026, 5, 3)).toBe('2026-05-03');
    expect(toMonthStr(2026, 5)).toBe('2026-05');
  });
});

describe('dayOfWeek', () => {
  it('프로토타입 기준일 2026-08-20 은 목요일(4)', () => {
    expect(dayOfWeek('2026-08-20')).toBe(4);
  });

  it('로컬 타임존과 무관하게 달력 요일을 준다', () => {
    // UTC 자정 기준으로 계산하므로 KST(+9)/UTC 어디서 돌려도 같아야 한다
    expect(dayOfWeek('2026-01-01')).toBe(4);
    expect(dayOfWeek('2026-12-31')).toBe(4);
  });
});

describe('daysInMonth', () => {
  it.each([
    [2026, 1, 31],
    [2026, 2, 28],
    [2026, 4, 30],
    [2026, 8, 31],
    [2024, 2, 29], // 윤년
  ])('%i-%i → %i일', (y, m, expected) => {
    expect(daysInMonth(y, m)).toBe(expected);
  });
});

describe('monthGrid', () => {
  it('2026-08 은 1일이 토요일이라 앞에 빈칸 6개가 온다', () => {
    expect(startDow(2026, 8)).toBe(6);
    const grid = monthGrid(2026, 8);
    expect(grid.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(grid[6]).toBe(1);
    expect(grid).toHaveLength(6 + 31);
    expect(grid.at(-1)).toBe(31);
  });

  it('1일이 일요일이면 빈칸이 없다', () => {
    // 2026-02-01 은 일요일
    expect(startDow(2026, 2)).toBe(0);
    expect(monthGrid(2026, 2)[0]).toBe(1);
  });
});

describe('addDays', () => {
  it('월·연 경계를 넘는다', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });
});

describe('shiftMonth / compareMonth', () => {
  it('연 경계를 넘는다', () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('월 순서를 비교한다', () => {
    expect(compareMonth({ year: 2026, month: 5 }, { year: 2026, month: 8 })).toBeLessThan(0);
    expect(compareMonth({ year: 2026, month: 8 }, { year: 2026, month: 8 })).toBe(0);
    expect(compareMonth({ year: 2027, month: 1 }, { year: 2026, month: 12 })).toBeGreaterThan(0);
  });
});

describe('포맷', () => {
  it('헤더 날짜 — 프로토타입 문구와 일치', () => {
    expect(formatHeaderDate('2026-08-20')).toBe('8월 20일 목요일');
  });

  it('시트 날짜 — 오늘이면 (오늘) 이 붙는다', () => {
    expect(formatSheetDate('2026-08-12', false)).toBe('8월 12일');
    expect(formatSheetDate('2026-08-20', true)).toBe('8월 20일 (오늘)');
  });
});
