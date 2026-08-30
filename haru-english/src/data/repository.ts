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
  /** GET /words/by-date — 그날 배운 단어 (하루 PER_DAY 개) */
  getWordsByDate(date: DateStr): Promise<Word[]>;

  /**
   * 즐겨찾기 해석용. 예전에는 화면이 카탈로그를 통째로 받아 filter 했는데,
   * 단어가 1440개·영상이 439개가 되면서 즐겨찾기 몇 개를 그리자고
   * 목록 전체를 내려받는 꼴이 됐다.
   */
  getWordsByIds(ids: string[]): Promise<Word[]>;
  getVideosByIds(ids: string[]): Promise<Video[]>;

  getCategories(): Promise<Category[]>;

  /**
   * GET /videos?category=
   *
   * 생활회화(daily)는 커리큘럼이 409편이라 전부 내려주지 않는다.
   * 오늘부터 TODAY_VIDEOS 편만 — 홈 캐러셀과 같은 구간이다.
   * 지난 회차는 즐겨찾기(getVideosByIds)로만 다시 볼 수 있다.
   */
  getVideos(category: CategoryFilter): Promise<Video[]>;

  /**
   * 그날부터 count 일치의 영상 (daily_videos). 홈 캐러셀이 쓴다.
   * 커리큘럼이 거기까지 안 채워졌으면 빈 배열이 아니라 순환 폴백으로 채운다 —
   * 홈에서 '오늘 볼 영상' 자리가 비면 화면이 무너진다.
   */
  getVideosByDate(date: DateStr, count: number): Promise<Video[]>;

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
