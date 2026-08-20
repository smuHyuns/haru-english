import { beforeEach } from 'vitest';

import { mockRepository } from '@/data/mock/mockRepository';

/**
 * 목 리포지토리는 싱글턴이라 같은 파일 안의 테스트끼리 상태가 샌다.
 * (즐겨찾기를 켠 테스트 다음에 "빈 상태" 를 검사하면 터진다)
 * 이 파일을 import 하면 매 테스트 전에 시드로 되돌린다.
 */
beforeEach(() => {
  mockRepository.__reset();
});
