import { describe, expect, it } from 'vitest';
import { sanitizeText } from '@/lib/sanitize';

describe('sanitizeText', () => {
  it('removes HTML tags and trims whitespace', () => {
    expect(sanitizeText(' <b>Hello</b> ')).toBe('Hello');
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(null)).toBe('');
  });
});
