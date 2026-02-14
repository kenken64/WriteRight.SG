export type TTSVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
export type TTSModel = "tts-1" | "tts-1-hd";
export type TTSFormat = "mp3" | "opus" | "aac" | "flac";

export interface TTSRequest {
  text: string;
  voice?: TTSVoice;
  model?: TTSModel;
  speed?: number; // 0.25 to 4.0
  format?: TTSFormat;
}

export interface TTSResponse {
  audio: Buffer;
  contentType: string;
  durationEstimateMs: number;
}

export type TTSUseCase = "feedback" | "rewrite" | "vocabulary";
