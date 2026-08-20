import { WEEK_DAYS } from './constants';

/** YYYY-MM-DD (KST 기준 달력 날짜) */
export type DateStr = string;
/** YYYY-MM */
export type MonthStr = string;

/*
 * 날짜는 전부 Asia/Seoul 기준으로 다룬다.
 *
 * UTC 를 쓰면 한국 시간 밤 9시 이후 학습이 '다음 날' 출석으로 기록된다.
 * DB 쪽도 같은 이유로 current_date 대신 kst_today() 를 쓴다 (mds/04 §1).
 *
 * 계산은 전부 UTC 자정 기준 Date 로 한다. 로컬 타임존이 무엇이든
 * 달력 값(년·월·일)만 다루므로 오프셋 때문에 하루가 밀리지 않는다.
 */

const KST = 'Asia/Seoul';

const kstFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: KST,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 지금 이 순간의 KST 달력 날짜 */
function nowInKst(): DateStr {
  return kstFormatter.format(new Date());
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 앱이 기준으로 삼는 '오늘'.
 * VITE_MOCK_TODAY 가 있으면 그 날짜로 고정한다 (프로토타입과 시각 대조할 때 사용).
 */
export function kstToday(): DateStr {
  const mock = import.meta.env.VITE_MOCK_TODAY;
  return mock && ISO_DATE.test(mock) ? mock : nowInKst();
}

/** "2026-08-20" → { year: 2026, month: 8, day: 20 } */
export function parseDate(date: DateStr): { year: number; month: number; day: number } {
  const [y, m, d] = date.split('-');
  return { year: Number(y), month: Number(m), day: Number(d) };
}

export function toDateStr(year: number, month: number, day: number): DateStr {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toMonthStr(year: number, month: number): MonthStr {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** 달력 값으로만 이루어진 UTC 자정 Date — 요일 계산 등 내부 연산용 */
function utcOf(date: DateStr): Date {
  const { year, month, day } = parseDate(date);
  return new Date(Date.UTC(year, month - 1, day));
}

/** 0 = 일요일 */
export function dayOfWeek(date: DateStr): number {
  return utcOf(date).getUTCDay();
}

export function addDays(date: DateStr, delta: number): DateStr {
  const d = utcOf(date);
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateStr(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function daysInMonth(year: number, month: number): number {
  // month 는 1~12. Date.UTC(y, month, 0) = 그 달의 마지막 날
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 그 달 1일의 요일 (0 = 일요일) — 캘린더 선행 빈칸 개수 */
export function startDow(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

/**
 * 캘린더 그리드. 앞쪽 빈칸은 null, 나머지는 일자.
 * 예) 2026-08 은 1일이 토요일 → [null×6, 1, 2, ... 31]
 */
export function monthGrid(year: number, month: number): (number | null)[] {
  const lead = Array.from({ length: startDow(year, month) }, () => null);
  const days = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
  return [...lead, ...days];
}

/** 헤더 날짜 칩: "8월 20일 목요일" */
export function formatHeaderDate(date: DateStr): string {
  const { month, day } = parseDate(date);
  return `${month}월 ${day}일 ${WEEK_DAYS[dayOfWeek(date)]}요일`;
}

/** 시트 헤더: "8월 12일" / 오늘이면 "8월 20일 (오늘)" */
export function formatSheetDate(date: DateStr, isToday: boolean): string {
  const { month, day } = parseDate(date);
  return `${month}월 ${day}일${isToday ? ' (오늘)' : ''}`;
}

/** "2026년 8월" */
export function formatMonthLabel(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

/** 같은 달인지 */
export function isSameMonth(a: { year: number; month: number }, b: { year: number; month: number }) {
  return a.year === b.year && a.month === b.month;
}

/** a 가 b 보다 이전 달이면 음수, 같으면 0, 이후면 양수 */
export function compareMonth(
  a: { year: number; month: number },
  b: { year: number; month: number },
): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

/** 월 이동 (delta = -1 이전달 / +1 다음달) */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}
