import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeEssayContent, validateFileType } from '@/lib/middleware/sanitize';

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
  });

  it('removes javascript: URIs', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes event handlers', () => {
    expect(sanitizeInput('text onclick=alert(1)')).toBe('text alert(1)');
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('preserves normal text', () => {
    expect(sanitizeInput('Hello world')).toBe('Hello world');
  });
});

describe('sanitizeEssayContent', () => {
  it('allows safe tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeEssayContent(html)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('strips script tags', () => {
    const html = '<p>Hello</p><script>alert(1)</script>';
    expect(sanitizeEssayContent(html)).toBe('<p>Hello</p>alert(1)');
  });

  it('strips div tags', () => {
    const html = '<div>Hello</div>';
    expect(sanitizeEssayContent(html)).toBe('Hello');
  });

  it('strips attributes from allowed tags', () => {
    const html = '<p class="evil" onclick="alert(1)">Safe</p>';
    expect(sanitizeEssayContent(html)).toBe('<p>Safe</p>');
  });

  it('allows em, u, br, ul, ol, li', () => {
    const html = '<ul><li><em>item</em></li></ul>';
    expect(sanitizeEssayContent(html)).toBe('<ul><li><em>item</em></li></ul>');
  });
});

describe('validateFileType', () => {
  it('allows jpeg', () => {
    expect(validateFileType('image/jpeg')).toBe(true);
  });

  it('allows png', () => {
    expect(validateFileType('image/png')).toBe(true);
  });

  it('allows heif', () => {
    expect(validateFileType('image/heif')).toBe(true);
  });

  it('allows pdf', () => {
    expect(validateFileType('application/pdf')).toBe(true);
  });

  it('rejects exe', () => {
    expect(validateFileType('application/x-msdownload')).toBe(false);
  });

  it('rejects html', () => {
    expect(validateFileType('text/html')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(validateFileType('IMAGE/JPEG')).toBe(true);
  });
});
