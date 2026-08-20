/** 클래스 이름 합치기. falsy 는 버린다 (CSS Modules 조회가 undefined 를 줄 수 있음) */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
