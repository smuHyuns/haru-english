import type {
  AttendanceMonth,
  Category,
  CategoryFilter,
  DateStr,
  Favorites,
  Profile,
  Video,
  Word,
} from './types';

/**
 * 데이터 접근 경계.
 *
 * 화면은 Supabase 를 직접 부르지 않고 항상 이 인터페이스만 본다.
 * 어댑터는 둘 — mockRepository(개발·테스트) / supabaseRepository(Phase 7).
 * 메서드 구성은 핸드오프 README 의 REST 스펙과 1:1 로 맞췄다.
 */
export interface Repository {
  /** GET /words/today — 홈에서 순환할 오늘의 추천 단어 */
  getTodayWords(): Promise<Word[]>;

  /** GET /words/by-date — 그날 배운 단어 (하루 PER_DAY 개) */
  getWordsByDate(date: DateStr): Promise<Word[]>;

  getCategories(): Promise<Category[]>;

  /** GET /videos?category= */
  getVideos(category: CategoryFilter): Promise<Video[]>;

  /**
   * 그날의 영상 한 편 (daily_videos).
   * 커리큘럼이 그 날짜까지 안 채워졌으면 null 이 아니라 순환 폴백을 돌려준다 —
   * 홈에서 '오늘의 영상' 자리가 비면 화면이 무너진다.
   */
  getVideoByDate(date: DateStr): Promise<Video | null>;

  /** GET /attendance?year=&month= */
  getAttendance(year: number, month: number): Promise<AttendanceMonth>;

  /** 스트릭 계산용 — 최근 N일 출석 날짜 */
  getRecentAttendance(days?: number): Promise<DateStr[]>;

  /** POST /attendance — 앱 진입 시 오늘 기록. 실패해도 UI 를 막지 않는다 */
  markAttendanceToday(): Promise<void>;

  getProfile(): Promise<Profile>;

  getFavorites(): Promise<Favorites>;
  setFavoriteWord(wordId: string, on: boolean): Promise<void>;
  setFavoriteVideo(videoId: string, on: boolean): Promise<void>;
}
