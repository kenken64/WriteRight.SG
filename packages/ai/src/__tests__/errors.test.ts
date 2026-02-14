import { describe, it, expect, vi } from 'vitest';
import {
  AIError, OCRError, MarkingError, RewriteError,
  TopicGenerationError, RateLimitError,
  isRetryable, withRetry,
} from '../shared/errors';

describe('AIError', () => {
  it('sets properties correctly', () => {
    const err = new AIError('test', 'TEST_CODE', 400, false);
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(400);
    expect(err.retryable).toBe(false);
    expect(err.name).toBe('AIError');
    expect(err instanceof Error).toBe(true);
  });

  it('defaults to 500 and non-retryable', () => {
    const err = new AIError('test', 'CODE');
    expect(err.statusCode).toBe(500);
    expect(err.retryable).toBe(false);
  });
});

describe('OCRError', () => {
  it('inherits from AIError', () => {
    const err = new OCRError('bad image', 'img1.jpg');
    expect(err instanceof AIError).toBe(true);
    expect(err.code).toBe('OCR_ERROR');
    expect(err.statusCode).toBe(422);
    expect(err.retryable).toBe(true);
    expect(err.imageRef).toBe('img1.jpg');
    expect(err.name).toBe('OCRError');
  });
});

describe('MarkingError', () => {
  it('has correct defaults', () => {
    const err = new MarkingError('fail');
    expect(err.code).toBe('MARKING_ERROR');
    expect(err.retryable).toBe(true);
    expect(err.name).toBe('MarkingError');
  });
});

describe('RewriteError', () => {
  it('has correct defaults', () => {
    const err = new RewriteError('fail');
    expect(err.code).toBe('REWRITE_ERROR');
    expect(err.retryable).toBe(true);
  });
});

describe('TopicGenerationError', () => {
  it('has correct defaults', () => {
    const err = new TopicGenerationError('fail');
    expect(err.code).toBe('TOPIC_GEN_ERROR');
    expect(err.retryable).toBe(true);
  });
});

describe('RateLimitError', () => {
  it('stores retryAfterMs', () => {
    const err = new RateLimitError(5000);
    expect(err.retryAfterMs).toBe(5000);
    expect(err.statusCode).toBe(429);
    expect(err.retryable).toBe(true);
    expect(err.name).toBe('RateLimitError');
  });
});

describe('isRetryable', () => {
  it('returns true for retryable AIError', () => {
    expect(isRetryable(new MarkingError('x'))).toBe(true);
  });

  it('returns false for non-retryable AIError', () => {
    expect(isRetryable(new AIError('x', 'CODE', 400, false))).toBe(false);
  });

  it('returns true for timeout errors', () => {
    expect(isRetryable(new Error('Connection timeout'))).toBe(true);
  });

  it('returns false for random errors', () => {
    expect(isRetryable(new Error('something else'))).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isRetryable('string')).toBe(false);
    expect(isRetryable(null)).toBe(false);
  });
});

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, 3, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable error then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new MarkingError('fail'))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, 3, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately for non-retryable error', async () => {
    const fn = vi.fn().mockRejectedValue(new AIError('bad', 'CODE', 400, false));
    await expect(withRetry(fn, 3, 1)).rejects.toThrow('bad');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new MarkingError('persistent'));
    await expect(withRetry(fn, 2, 1)).rejects.toThrow('persistent');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});
