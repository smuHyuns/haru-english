import type { DateStr, Video } from '@/data/types';

import { CURRICULUM_START } from './constants';
import { daysBetween } from './date';

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
  const n = daysBetween(CURRICULUM_START, date);
  // 시작일 이전 날짜면 n 이 음수라 나머지도 음수가 된다 — 한 번 더 더해 정규화
  return catalog[((n % catalog.length) + catalog.length) % catalog.length]!;
}
