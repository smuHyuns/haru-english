import { describe, expect, it } from 'vitest';

import { EMAIL_DOMAIN, checkPassword, normalizePhone, toEmail } from './identifier';

/*
 * 이 정규화가 흔들리면 같은 사람이 계정을 두 개 갖게 된다.
 * 본인은 "비밀번호가 틀렸다"고만 느끼고 원인을 못 찾는다 — 그래서 표기 변형을 전수로 묶는다.
 */
describe('휴대폰 번호 정규화', () => {
  const CANON = '01012345678';

  it.each([
    '01012345678',
    '010-1234-5678',
    '010 1234 5678',
    '010.1234.5678',
    ' 010-1234-5678 ',
    '+821012345678',
    '+82 10-1234-5678',
    '+82 010 1234 5678',
    '821012345678',
    '1012345678',
  ])('%s → 01012345678', (input) => {
    expect(normalizePhone(input)).toBe(CANON);
  });

  it('표기가 달라도 전부 같은 이메일이 된다', () => {
    const variants = ['01012345678', '010-1234-5678', '+82 10-1234-5678'];
    const emails = new Set(variants.map((v) => (toEmail(v) as { email: string }).email));
    expect(emails.size).toBe(1);
    expect([...emails][0]).toBe(`${CANON}@${EMAIL_DOMAIN}`);
  });

  it('구형 번호(011, 016, 017, 018, 019)도 받는다', () => {
    expect(normalizePhone('011-123-4567')).toBe('0111234567');
    expect(normalizePhone('019-1234-5678')).toBe('01912345678');
  });

  it('휴대폰이 아닌 번호는 휴대폰으로 읽지 않는다', () => {
    expect(normalizePhone('02-1234-5678')).toBeNull(); // 서울 유선
    expect(normalizePhone('1588-1234')).toBeNull(); // 대표번호
    expect(normalizePhone('010-123')).toBeNull(); // 자릿수 부족
    expect(normalizePhone('010-1234-56789')).toBeNull(); // 자릿수 초과
  });
});

describe('아이디 정규화', () => {
  it('대소문자를 구분하지 않는다', () => {
    const a = toEmail('HongGilDong');
    const b = toEmail('honggildong');
    expect(a).toEqual(b);
    expect(a).toMatchObject({ ok: true, kind: 'id', normalized: 'honggildong' });
  });

  it('앞뒤 공백을 무시한다', () => {
    expect(toEmail('  minsu99  ')).toMatchObject({ ok: true, normalized: 'minsu99' });
  });

  it('. _ - 를 허용한다 (하이픈이 든 아이디가 전화번호로 오독되지 않는다)', () => {
    expect(toEmail('hong-gil.dong_1')).toMatchObject({
      ok: true,
      kind: 'id',
      normalized: 'hong-gil.dong_1',
    });
  });
});

describe('입력 오류 안내', () => {
  it('빈 입력', () => {
    expect(toEmail('   ')).toEqual({
      ok: false,
      message: '아이디 또는 휴대폰 번호를 입력해 주세요.',
    });
  });

  it('한글 아이디는 이유를 짚어 준다', () => {
    const r = toEmail('홍길동');
    expect(r.ok).toBe(false);
    expect(r).toHaveProperty('message', '아이디는 영문·숫자로 입력해 주세요.');
  });

  it('너무 짧은 아이디', () => {
    expect(toEmail('ab')).toMatchObject({ ok: false, message: '아이디는 4자 이상 입력해 주세요.' });
  });

  it('쓸 수 없는 문자', () => {
    expect(toEmail('hong@gil')).toMatchObject({
      ok: false,
      message: '아이디는 영문·숫자와 . _ - 만 쓸 수 있어요.',
    });
  });
});

describe('비밀번호 검사', () => {
  it('빈 값', () => {
    expect(checkPassword('')).toBe('비밀번호를 입력해 주세요.');
  });

  it('8자 미만', () => {
    expect(checkPassword('1234567')).toBe('비밀번호는 8자 이상이어야 해요.');
  });

  it('8자 이상이면 통과', () => {
    expect(checkPassword('12345678')).toBeNull();
  });
});
