import type { TTSVoice, TTSModel, TTSUseCase } from "./types";

export interface VoiceProfile {
  voice: TTSVoice;
  model: TTSModel;
  speed: number;
  description: string;
}

/**
 * Default voice profiles per use case.
 *
 * - feedback:   Clear, warm, encouraging — suited for reading evaluation feedback aloud
 * - rewrite:    Measured, expressive — helps students hear proper sentence flow and rhythm
 * - vocabulary: Slow, precise — clear pronunciation for learning new words
 */
const USE_CASE_DEFAULTS: Record<TTSUseCase, VoiceProfile> = {
  feedback: {
    voice: "nova",
    model: "tts-1",
    speed: 1.0,
    description: "Warm and encouraging — reads feedback clearly",
  },
  rewrite: {
    voice: "shimmer",
    model: "tts-1-hd",
    speed: 0.9,
    description: "Expressive and measured — demonstrates good sentence flow",
  },
  vocabulary: {
    voice: "onyx",
    model: "tts-1-hd",
    speed: 0.75,
    description: "Deep and precise — clear word pronunciation",
  },
};

const VOICE_DESCRIPTIONS: Record<TTSVoice, string> = {
  alloy: "Neutral, balanced — good all-rounder",
  echo: "Warm male voice — calm and steady",
  fable: "Expressive, British-accented — engaging storytelling",
  onyx: "Deep, authoritative — clear enunciation",
  nova: "Friendly, warm female — encouraging tone",
  shimmer: "Soft, expressive female — gentle and clear",
};

export function getVoiceForUseCase(useCase: TTSUseCase): VoiceProfile {
  return USE_CASE_DEFAULTS[useCase];
}

export function getVoiceDescription(voice: TTSVoice): string {
  return VOICE_DESCRIPTIONS[voice];
}

export function getAllVoices(): { voice: TTSVoice; description: string }[] {
  return Object.entries(VOICE_DESCRIPTIONS).map(([voice, description]) => ({
    voice: voice as TTSVoice,
    description,
  }));
}

export function isValidVoice(voice: string): voice is TTSVoice {
  return voice in VOICE_DESCRIPTIONS;
}
