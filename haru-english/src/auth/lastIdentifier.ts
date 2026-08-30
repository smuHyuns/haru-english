import { toEmail } from './identifier';

/*
 * 마지막으로 로그인에 성공한 아이디를 기억한다.
 *
 * 로그아웃했거나 저장된 세션이 끊긴 뒤 아이디를 다시 타이핑하지 않게 하려는 것.
 * 대상 사용자에게는 휴대폰 문자 입력이 가장 큰 장벽이라, 한 칸을 지워 주는 것만으로
 * 다시 들어오는 문턱이 눈에 띄게 낮아진다.
 *
 * 비밀번호는 저장하지 않는다. 저장하는 순간 기기를 집어 든 사람이 곧 계정 주인이 된다.
 * 아이디만으로는 로그인할 수 없으므로, 남는 위험은 "이 기기를 누가 쓰는지"가 보이는 정도다.
 */

const KEY = 'haru:auth:last-id:v1';

/** 아이디 최대 30자, 휴대폰 표기 최대 16자. 그보다 길면 우리가 쓴 값이 아니다 */
const MAX = 40;

/** 채워 넣을 아이디. 없거나 지금 규칙으로 못 쓰는 값이면 null */
export function readIdentifier(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw || raw.length > MAX) return null;
    /*
     * 스토리지는 신뢰할 수 없는 입력이다 — 옛 버전이 남긴 값일 수도, 손으로 고친
     * 값일 수도 있다. 지금 규칙을 다시 통과시켜서, 어차피 거절당할 값을 미리
     * 채워 넣고 사용자가 이유를 모른 채 헤매는 일을 막는다.
     */
    return toEmail(raw).ok ? raw : null;
  } catch {
    // 사파리 프라이빗 모드 등 — 기억 못 할 뿐 로그인은 된다
    return null;
  }
}

/** 로그인·가입에 성공한 뒤에만 부른다. 입력한 표기 그대로 남긴다 */
export function rememberIdentifier(input: string): void {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > MAX || !toEmail(trimmed).ok) return;
  try {
    localStorage.setItem(KEY, trimmed);
  } catch {
    // 저장 실패로 로그인을 되돌릴 이유는 없다
  }
}
