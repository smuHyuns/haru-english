/*
 * 로그인 식별자 → 합성 이메일.
 *
 * Supabase Auth 는 email / phone / OAuth 만 받는데, 화면 문구는
 * `아이디 또는 휴대폰 번호` 다. 그래서 입력을 정규화해 {아이디}@haru-english.app
 * 형태의 이메일로 바꿔 넘긴다. 사용자는 이 이메일을 볼 일이 없다.
 *
 * 정규화가 이 방식의 핵심 위험이다.
 * "010-1234-5678" 과 "01012345678" 이 다른 이메일이 되면 같은 사람이
 * 계정을 두 개 갖게 되고, 본인은 "비밀번호가 틀렸다"고만 느낀다.
 * 그래서 표기 흔들림(하이픈·공백·+82·앞자리 0)을 전부 한 형태로 눌러 담는다.
 *
 * 메일 수신이 불가능한 도메인이므로 비밀번호 재설정 메일은 보낼 수 없다.
 * 복구 경로가 필요해지면 OAuth(카카오/네이버)로 옮겨야 한다.
 */

export const EMAIL_DOMAIN = 'haru-english.app';

/** 비밀번호 최소 길이. Supabase 대시보드 설정과 같아야 한다 */
export const MIN_PASSWORD = 8;

export type Identifier =
  | { ok: true; email: string; kind: 'phone' | 'id'; normalized: string }
  | { ok: false; message: string };

/**
 * 휴대폰 번호로 읽히면 숫자만 남긴 표준형(01012345678)을 돌려준다.
 * 아니면 null.
 *
 *   010-1234-5678   → 01012345678
 *   +82 10-1234-5678 → 01012345678
 *   1012345678      → 01012345678   (앞자리 0 을 빠뜨린 경우)
 */
export function normalizePhone(input: string): string | null {
  const compact = input.replace(/[\s()\-.]/g, '');
  const m = /^(?:\+?82)?0?(1[016789]\d{7,8})$/.exec(compact);
  return m ? `0${m[1]}` : null;
}

/** 이메일 로컬 파트로 쓸 수 있는 아이디인지. 통과하면 소문자로 눌러 담는다 */
function normalizeId(input: string): string | null {
  return /^[A-Za-z0-9._-]{4,30}$/.test(input) ? input.toLowerCase() : null;
}

/** 로그인 입력 → 합성 이메일. 실패하면 화면에 그대로 띄울 수 있는 문구를 담아 돌려준다 */
export function toEmail(input: string): Identifier {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, message: '아이디 또는 휴대폰 번호를 입력해 주세요.' };
  }

  const phone = normalizePhone(trimmed);
  if (phone) {
    return { ok: true, email: `${phone}@${EMAIL_DOMAIN}`, kind: 'phone', normalized: phone };
  }

  const id = normalizeId(trimmed);
  if (id) {
    return { ok: true, email: `${id}@${EMAIL_DOMAIN}`, kind: 'id', normalized: id };
  }

  // 한글 입력이 흔한 실수다 — 이메일 로컬 파트에 못 쓴다
  if (/[^\x20-\x7E]/.test(trimmed)) {
    return { ok: false, message: '아이디는 영문·숫자로 입력해 주세요.' };
  }
  if (trimmed.length < 4) {
    return { ok: false, message: '아이디는 4자 이상 입력해 주세요.' };
  }
  return { ok: false, message: '아이디는 영문·숫자와 . _ - 만 쓸 수 있어요.' };
}

/** 비밀번호 형식 검사. 통과하면 null, 아니면 화면에 띄울 문구 */
export function checkPassword(pw: string): string | null {
  if (!pw) return '비밀번호를 입력해 주세요.';
  if (pw.length < MIN_PASSWORD) return `비밀번호는 ${MIN_PASSWORD}자 이상이어야 해요.`;
  return null;
}
