import { useCallback, useMemo } from 'react';

import { say } from '@/lib/speech';

import { useToast } from './useToast';

/**
 * 발음 재생 + 토스트 피드백.
 *
 * 반환된 함수는 **반드시 클릭 핸들러 안에서** 호출해야 한다 —
 * iOS 는 사용자 제스처 직후에만 speechSynthesis 를 허용한다.
 */
export function useSpeak() {
  const toast = useToast();

  const run = useCallback(
    (text: string, message: string) => {
      if (say(text) === 'unsupported') {
        toast.show('이 기기는 소리 재생을 지원하지 않아요');
        return;
      }
      toast.show(message);
    },
    [toast],
  );

  return useMemo(
    () => ({
      speakWord: (en: string) => run(en, `🔊 ${en} 발음 재생 중`),
      speakExample: (exEn: string) => run(exEn, '🔊 예문 재생 중'),
    }),
    [run],
  );
}
