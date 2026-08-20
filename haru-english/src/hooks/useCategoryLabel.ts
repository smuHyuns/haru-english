import { useCallback } from 'react';

import type { CategoryFilter } from '@/data/types';

import { useCategories } from './useData';

/**
 * 카테고리 id → 한글 라벨.
 *
 * 프로토타입은 상태에 한글 문자열(`"일상"`)을 그대로 담았는데,
 * URL·DB 에는 id('daily')를 쓰고 표시할 때만 라벨로 바꾼다 (mds/00 §6-4).
 */
export function useCategoryLabel() {
  const { data: categories } = useCategories();

  return useCallback(
    (id: CategoryFilter): string => categories?.find((c) => c.id === id)?.label ?? id,
    [categories],
  );
}
