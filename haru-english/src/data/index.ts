import { mockRepository } from './mock/mockRepository';
import type { Repository } from './repository';
import { supabaseRepository } from './supabase/supabaseRepository';

/*
 * 어댑터 선택.
 *
 * VITE_DATA_SOURCE=supabase 면 Supabase, 그 외에는 mock.
 * mock 이 기본인 건 의도적이다 — 프로젝트/키 없이도 앱 전체가 돌고 테스트가 붙는다.
 *
 * 두 어댑터를 다 import 하므로 supabase-js 가 mock 빌드에도 들어간다.
 * 지금은 어차피 supabase 로 가는 중이라 그대로 두지만, mock 전용 빌드를 얇게 하려면
 * 여기를 동적 import 로 바꿔야 한다.
 */
const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

export const repo: Repository = source === 'supabase' ? supabaseRepository : mockRepository;

/** 현재 어떤 어댑터를 쓰는지 (개발 중 확인용) */
export const dataSource = source;

export type { Repository } from './repository';
