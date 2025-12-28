import { describe, expect, it, vi } from 'vitest';
import { createRateLimiter } from '@/lib/rateLimit';

describe('createRateLimiter', () => {
  it('limits concurrent executions', async () => {
    const limiter = createRateLimiter({ limit: 1, intervalMs: 10 });
    const order = [];

    const task = (label) => limiter(async () => {
      order.push(label);
      return label;
    });

    await Promise.all([task('first'), task('second')]);
    expect(order).toEqual(['first', 'second']);
  });
});
