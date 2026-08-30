import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readIdentifier, rememberIdentifier } from './lastIdentifier';

const KEY = 'haru:auth:last-id:v1';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('아이디 저장', () => {
  it('입력한 표기 그대로 돌려준다', () => {
    rememberIdentifier('010-1234-5678');
    // 정규화한 01012345678 을 보여 주면 "내가 쓴 게 아닌데" 싶어진다
    expect(readIdentifier()).toBe('010-1234-5678');
  });

  it('앞뒤 공백은 지우고 저장한다', () => {
    rememberIdentifier('  MinSu99  ');
    expect(readIdentifier()).toBe('MinSu99');
  });

  it('저장한 적 없으면 null', () => {
    expect(readIdentifier()).toBeNull();
  });

  it('형식에 맞지 않는 값은 저장하지 않는다', () => {
    rememberIdentifier('홍길동');
    rememberIdentifier('ab');
    rememberIdentifier('   ');
    expect(readIdentifier()).toBeNull();
  });

  it('스토리지에 남아 있던 못 쓰는 값은 무시한다', () => {
    // 옛 버전이 남겼거나 손으로 고친 값 — 채워 넣어 봐야 로그인에서 거절당한다
    localStorage.setItem(KEY, '홍길동');
    expect(readIdentifier()).toBeNull();
  });

  it('말도 안 되게 긴 값은 읽지도 쓰지도 않는다', () => {
    const long = 'a'.repeat(200);
    rememberIdentifier(long);
    expect(localStorage.getItem(KEY)).toBeNull();

    localStorage.setItem(KEY, long);
    expect(readIdentifier()).toBeNull();
  });

  it('스토리지가 막혀 있어도 던지지 않는다', () => {
    // 사파리 프라이빗 모드. 기억을 못 할 뿐 로그인은 되어야 한다
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => rememberIdentifier('minsu99')).not.toThrow();
    expect(readIdentifier()).toBeNull();
  });
});
