import { mockRepository } from './mock/mockRepository';
import type { Repository } from './repository';

/*
 * 어댑터 선택.
 *
 * VITE_DATA_SOURCE=supabase 로 두면 Phase 7 에서 붙일 supabaseRepository 를 쓴다.
 * 그 전까지는 mock 이 기본 — Supabase 프로젝트 없이도 앱 전체가 돈다.
 */
const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

export const repo: Repository = mockRepository;

/** 현재 어떤 어댑터를 쓰는지 (개발 중 확인용) */
export const dataSource = source;

export type { Repository } from './repository';
