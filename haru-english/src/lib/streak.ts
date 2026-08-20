import { addDays, kstToday, type DateStr } from './date';

/**
 * 연속 학습일 계산.
 *
 * 프로토타입은 `streak: 12` 상수였다. 실제로는 출석 기록에서 파생되어야 한다.
 * 오늘부터 하루씩 거슬러 올라가며 끊기는 지점까지 센다.
 *
 * 오늘 아직 출석 전이면 어제부터 센다 — 자정 직후에 스트릭이 0으로 보이면
 * 사용자가 "끊겼다"고 오해하기 때문. 실제로는 앱 진입 시 markAttendanceToday 가
 * 먼저 돌아서 대개 오늘이 포함된 상태다.
 */
export function computeStreak(attended: Iterable<DateStr>, today = kstToday()): number {
  const set = attended instanceof Set ? attended : new Set(attended);
  if (set.size === 0) return 0;

  // 오늘 출석했으면 오늘부터, 아니면 어제부터 센다
  let cursor = set.has(today) ? today : addDays(today, -1);

  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
