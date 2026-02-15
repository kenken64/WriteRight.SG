import { getOpenAIClient } from "../shared/openai-client";
import { MODEL_TTS } from "../shared/model-config";
import { AIError, withRetry } from "../shared/errors";
import { getVoiceForUseCase } from "./voices";
import type { TTSRequest, TTSResponse, TTSUseCase, TTSVoice, TTSModel } from "./types";

/** Maximum input length for a single TTS request (4096 chars per OpenAI docs). */
const MAX_INPUT_LENGTH = 4096;

/** Rough estimate: ~150 words per minute, ~5 chars per word. */
function estimateDurationMs(text: string, speed: number): number {
  const words = text.split(/\s+/).length;
  const minutes = words / (150 * speed);
  return Math.round(minutes * 60_000);
}

/**
 * Generate speech audio from text using the OpenAI TTS API.
 */
export async function synthesise(request: TTSRequest): Promise<TTSResponse> {
  const {
    text,
    voice = "nova",
    model = MODEL_TTS,
    speed = 1.0,
    format = "mp3",
  } = request;

  if (!text || text.trim().length === 0) {
    throw new AIError("TTS input text cannot be empty", "TTS_EMPTY_INPUT", 400);
  }

  if (text.length > MAX_INPUT_LENGTH) {
    throw new AIError(
      `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters (got ${text.length})`,
      "TTS_INPUT_TOO_LONG",
      400
    );
  }

  if (speed < 0.25 || speed > 4.0) {
    throw new AIError("Speed must be between 0.25 and 4.0", "TTS_INVALID_SPEED", 400);
  }

  const client = getOpenAIClient();

  const response = await withRetry(
    () =>
      client.audio.speech.create({
        model,
        voice,
        input: text,
        speed,
        response_format: format,
      }),
    2,
    500
  );

  const arrayBuffer = await response.arrayBuffer();
  const audio = Buffer.from(arrayBuffer);

  const contentTypeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    opus: "audio/opus",
    aac: "audio/aac",
    flac: "audio/flac",
  };

  return {
    audio,
    contentType: contentTypeMap[format] ?? "audio/mpeg",
    durationEstimateMs: estimateDurationMs(text, speed),
  };
}

/**
 * Convenience: synthesise text using a preset use-case profile.
 * Caller can override voice/speed if desired.
 */
export async function synthesiseForUseCase(
  text: string,
  useCase: TTSUseCase,
  overrides: { voice?: TTSVoice; model?: TTSModel; speed?: number } = {}
): Promise<TTSResponse> {
  const profile = getVoiceForUseCase(useCase);
  return synthesise({
    text,
    voice: overrides.voice ?? profile.voice,
    model: overrides.model ?? profile.model,
    speed: overrides.speed ?? profile.speed,
  });
}

/**
 * Split long text into chunks that fit within the TTS character limit,
 * breaking at sentence boundaries where possible.
 */
export function chunkText(text: string, maxLen = MAX_INPUT_LENGTH): string[] {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}
