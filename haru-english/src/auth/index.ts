import { mockAuth } from './mockAuth';
import { supabaseAuth } from './supabaseAuth';
import type { AuthAdapter } from './types';

/** 데이터 어댑터와 같은 스위치를 쓴다 — 인증만 Supabase 인 조합은 의미가 없다 */
const source = import.meta.env.VITE_DATA_SOURCE ?? 'mock';

export const auth: AuthAdapter = source === 'supabase' ? supabaseAuth : mockAuth;

export { AuthError } from './types';
export type { AuthSession, SessionMode } from './types';
