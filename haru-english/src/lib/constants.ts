/** 스플래시 자동 전환 (프로토타입 동일) */
export const SPLASH_MS = 1600;

/** 토스트 자동 소멸. 새 토스트가 오면 타이머 리셋 */
export const TOAST_MS = 1800;

/** 하루 학습 단어 수 */
export const PER_DAY = 3;

/** speechSynthesis 발화 속도 */
export const SPEECH_RATE_SLOW = 0.8;
export const SPEECH_RATE_NORMAL = 1;

/** 최소 터치 타깃 (성인·어르신 사용자 전제) */
export const MIN_TOUCH_PX = 52;

/** 요일 라벨 (0 = 일요일) */
export const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 하단 탭 정의 — 순서가 곧 화면 순서 */
export const TABS = [
  { id: 'today', name: '오늘', path: '/today', title: '오늘의 영어' },
  { id: 'videos', name: '영상', path: '/videos', title: '영상 모음' },
  { id: 'saved', name: '즐겨찾기', path: '/saved', title: '즐겨찾기' },
  { id: 'my', name: '마이', path: '/my', title: '마이페이지' },
] as const;

export type TabId = (typeof TABS)[number]['id'];
