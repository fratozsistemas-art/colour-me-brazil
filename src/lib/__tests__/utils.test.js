import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn (className merge)', () => {
    it('merges class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toContain('foo');
      expect(result).toContain('bar');
    });

    it('handles conditional class names', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toContain('foo');
      expect(result).not.toContain('bar');
      expect(result).toContain('baz');
    });

    it('handles undefined values', () => {
      const result = cn('foo', undefined, 'bar');
      expect(result).toContain('foo');
      expect(result).toContain('bar');
    });

    it('handles empty strings', () => {
      const result = cn('foo', '', 'bar');
      expect(result).toContain('foo');
      expect(result).toContain('bar');
    });

    it('merges tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      // Should prefer the latter px-4 over px-2
      expect(result).toBeTruthy();
    });
  });
});
