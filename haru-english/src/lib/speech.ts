import { SPEECH_RATE_SLOW } from './constants';

/*
 * 발음 재생 — 브라우저 내장 speechSynthesis. 서버·API 키 불필요.
 *
 * 나중에 원어민 mp3(Supabase Storage)로 바꿀 때 이 파일의 say() 하나만 교체하면 된다.
 */

export type SpeakResult = 'ok' | 'unsupported';

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesBound = false;

/**
 * getVoices() 는 기기에 따라 비동기다 (처음엔 빈 배열).
 * voiceschanged 이후에 en-US 음성을 골라 캐시한다.
 */
function pickEnVoice(): SpeechSynthesisVoice | null {
  const synth = window.speechSynthesis;
  if (!synth) return null;

  if (!voicesBound) {
    voicesBound = true;
    synth.addEventListener?.('voiceschanged', () => {
      cachedVoice = selectVoice(synth.getVoices());
    });
  }

  if (!cachedVoice) cachedVoice = selectVoice(synth.getVoices());
  return cachedVoice;
}

function selectVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

/**
 * 영어 텍스트를 읽는다.
 *
 * iOS 는 사용자 제스처 직후에만 재생을 허용하므로 **반드시 클릭 핸들러 안에서** 호출할 것.
 * 호출 지점 5곳: 홈 발음/예문, 즐겨찾기 듣기, 시트 발음/예문 (mds/02 §8)
 */
export function say(text: string, rate: number = SPEECH_RATE_SLOW): SpeakResult {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth) return 'unsupported';

  // 진행 중인 발화를 끊고 새로 말한다 (연타 시 겹치지 않게)
  synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = pickEnVoice();
  if (voice) u.voice = voice;

  synth.speak(u);
  return 'ok';
}

/** 테스트용 — 캐시된 음성 초기화 */
export function resetVoiceCache() {
  cachedVoice = null;
  voicesBound = false;
}
