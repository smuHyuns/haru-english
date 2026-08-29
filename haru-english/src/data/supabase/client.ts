import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/*
 * Supabase 클라이언트.
 *
 * 모듈 최상위에서 만들지 않고 지연 생성한다 — index.ts 가 mock/supabase 를
 * 런타임에 고르기 때문에, import 만으로 환경변수 검증이 터지면 mock 모드까지
 * 같이 죽는다.
 *
 * 키 취급:
 *   VITE_SUPABASE_ANON_KEY 는 번들에 노출되는 게 정상이다. 인가는 Postgres RLS 가 한다.
 *   SUPABASE_SERVICE_ROLE_KEY 는 RLS 를 우회하므로 클라이언트 어디에도 두지 않는다.
 */

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'VITE_DATA_SOURCE=supabase 인데 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 비어 있습니다. ' +
        '.env.local 을 확인하세요 (.env.example 참고).',
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}

/** 로그인한 사용자 id. 세션이 없으면 null */
export async function currentUserId(): Promise<string | null> {
  const { data } = await getSupabase().auth.getUser();
  return data.user?.id ?? null;
}

/** 사용자 데이터 접근용 — 세션이 없으면 명확히 실패시킨다 */
export async function requireUserId(): Promise<string> {
  const id = await currentUserId();
  if (!id) throw new Error('로그인이 필요합니다 (세션 없음).');
  return id;
}
