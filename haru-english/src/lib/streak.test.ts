import { describe, expect, it } from 'vitest';

import { computeStreak } from './streak';

const TODAY = '2026-08-20';

describe('computeStreak', () => {
  it('기록이 없으면 0', () => {
    expect(computeStreak([], TODAY)).toBe(0);
  });

  it('오늘만 있으면 1', () => {
    expect(computeStreak([TODAY], TODAY)).toBe(1);
  });

  it('오늘부터 연속된 날을 센다', () => {
    const dates = ['2026-08-20', '2026-08-19', '2026-08-18', '2026-08-17'];
    expect(computeStreak(dates, TODAY)).toBe(4);
  });

  it('끊긴 지점에서 멈춘다', () => {
    // 18일이 빠져 있음
    const dates = ['2026-08-20', '2026-08-19', '2026-08-17', '2026-08-16'];
    expect(computeStreak(dates, TODAY)).toBe(2);
  });

  it('오늘 아직 출석 전이면 어제부터 센다', () => {
    // 자정 직후에 스트릭이 0으로 보여 "끊겼다"고 오해하는 걸 막는다
    const dates = ['2026-08-19', '2026-08-18'];
    expect(computeStreak(dates, TODAY)).toBe(2);
  });

  it('오늘도 어제도 없으면 0', () => {
    expect(computeStreak(['2026-08-18', '2026-08-17'], TODAY)).toBe(0);
  });

  it('월 경계를 넘는다', () => {
    const dates = ['2026-09-01', '2026-08-31', '2026-08-30'];
    expect(computeStreak(dates, '2026-09-01')).toBe(3);
  });

  it('순서가 뒤섞여 있어도 된다', () => {
    const dates = ['2026-08-18', '2026-08-20', '2026-08-19'];
    expect(computeStreak(dates, TODAY)).toBe(3);
  });

  it('중복이 있어도 한 번만 센다', () => {
    const dates = ['2026-08-20', '2026-08-20', '2026-08-19'];
    expect(computeStreak(dates, TODAY)).toBe(2);
  });
});
