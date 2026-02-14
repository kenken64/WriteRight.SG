export class AIError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 500, public retryable = false) {
    super(message);
    this.name = "AIError";
  }
}

export class OCRError extends AIError {
  constructor(message: string, public imageRef?: string) {
    super(message, "OCR_ERROR", 422, true);
    this.name = "OCRError";
  }
}

export class MarkingError extends AIError {
  constructor(message: string) {
    super(message, "MARKING_ERROR", 500, true);
    this.name = "MarkingError";
  }
}

export class RewriteError extends AIError {
  constructor(message: string) {
    super(message, "REWRITE_ERROR", 500, true);
    this.name = "RewriteError";
  }
}

export class TopicGenerationError extends AIError {
  constructor(message: string) {
    super(message, "TOPIC_GEN_ERROR", 500, true);
    this.name = "TopicGenerationError";
  }
}

export class RateLimitError extends AIError {
  constructor(public retryAfterMs: number) {
    super("Rate limit exceeded", "RATE_LIMIT", 429, true);
    this.name = "RateLimitError";
  }
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof AIError) return error.retryable;
  if (error instanceof Error && error.message.includes("timeout")) return true;
  return false;
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 1000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isRetryable(error)) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}
