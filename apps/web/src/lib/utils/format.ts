/**
 * Format a score as "X / Y"
 */
export function formatScore(score: number, maxScore: number): string {
  return `${score} / ${maxScore}`;
}

/**
 * Get band label (e.g. "Band 4")
 */
export function formatBand(band: number): string {
  if (band === 0) return 'Band 0 — No creditable response';
  return `Band ${band}`;
}

/**
 * Get band color class for UI
 */
export function getBandColor(band: number): string {
  const colors: Record<number, string> = {
    0: 'text-gray-400',
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-blue-500',
    5: 'text-green-500',
  };
  return colors[band] ?? 'text-gray-500';
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Format a date relative to now
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format submission status for display
 */
export function formatStatus(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    uploading: { label: 'Uploading...', color: 'bg-blue-100 text-blue-700' },
    processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700' },
    ocr_complete: { label: 'OCR Complete', color: 'bg-purple-100 text-purple-700' },
    evaluating: { label: 'Marking...', color: 'bg-orange-100 text-orange-700' },
    evaluated: { label: 'Marked', color: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  };
  return map[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
}

/**
 * Get reward type emoji
 */
export function getRewardEmoji(type: string): string {
  const emojis: Record<string, string> = {
    treat: '🍦',
    screen_time: '🎮',
    book: '📖',
    activity: '🏊',
    money: '💰',
    creative: '🎨',
    custom: '🎁',
  };
  return emojis[type] ?? '🎁';
}
