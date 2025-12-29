// ✅ CRITICAL FIX: Server-side rate limiting middleware
// Prevents brute force attacks and API abuse

/**
 * In-memory rate limiter for backend functions
 * Production: Use Redis or similar for distributed rate limiting
 */
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    const oldestAttempt = Math.min(...data.attempts);
    if (now - oldestAttempt > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

/**
 * Rate limit checker
 * @param {string} identifier - Unique identifier (user_id, ip, email)
 * @param {object} options - Rate limit options
 * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, options = {}) {
  const {
    maxAttempts = 10,
    windowMs = 60000, // 1 minute default
    blockDurationMs = 300000 // 5 minutes block on exceed
  } = options;

  const now = Date.now();
  const key = identifier;

  // Get or initialize rate limit data
  let data = rateLimitStore.get(key);
  
  if (!data) {
    data = {
      attempts: [],
      windowMs,
      blockedUntil: null
    };
  }

  // Check if currently blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    const waitTime = Math.ceil((data.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      blocked: true,
      waitTime,
      reason: 'Rate limit exceeded - temporarily blocked'
    };
  }

  // Clean up old attempts outside window
  data.attempts = data.attempts.filter(timestamp => now - timestamp < windowMs);

  // Check if rate limit exceeded
  if (data.attempts.length >= maxAttempts) {
    // Block for specified duration
    data.blockedUntil = now + blockDurationMs;
    rateLimitStore.set(key, data);
    
    console.warn(`⚠️ Rate limit exceeded for: ${identifier} - blocked for ${blockDurationMs/1000}s`);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      blocked: true,
      waitTime: Math.ceil(blockDurationMs / 1000),
      reason: 'Too many requests - temporarily blocked'
    };
  }

  // Allow request
  return {
    allowed: true,
    remaining: maxAttempts - data.attempts.length,
    resetTime: now + windowMs,
    blocked: false
  };
}

/**
 * Record an attempt
 * @param {string} identifier - Unique identifier
 */
export function recordAttempt(identifier) {
  const now = Date.now();
  const key = identifier;
  
  let data = rateLimitStore.get(key);
  
  if (!data) {
    data = {
      attempts: [],
      windowMs: 60000,
      blockedUntil: null
    };
  }

  data.attempts.push(now);
  rateLimitStore.set(key, data);
  
  console.log(`📊 Recorded attempt for: ${identifier} (${data.attempts.length} total)`);
}

/**
 * Clear rate limit for identifier
 * @param {string} identifier - Unique identifier
 */
export function clearRateLimit(identifier) {
  rateLimitStore.delete(identifier);
  console.log(`🧹 Cleared rate limit for: ${identifier}`);
}

/**
 * Middleware wrapper for backend functions
 * Usage: const handler = withRateLimit(yourHandler, options);
 */
export function withRateLimit(handler, options = {}) {
  return async (req) => {
    try {
      // Extract identifier (prefer user_id, fallback to IP)
      const identifier = req.headers.get('x-user-id') || 
                        req.headers.get('x-forwarded-for') || 
                        req.headers.get('cf-connecting-ip') ||
                        'unknown';

      // Check rate limit
      const rateCheck = checkRateLimit(identifier, options);

      if (!rateCheck.allowed) {
        console.warn(`🚫 Rate limit blocked: ${identifier}`);
        return Response.json({
          error: 'Too Many Requests',
          message: rateCheck.reason,
          waitTime: rateCheck.waitTime,
          retryAfter: rateCheck.resetTime
        }, {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.waitTime),
            'X-RateLimit-Limit': String(options.maxAttempts || 10),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.resetTime)
          }
        });
      }

      // Record attempt
      recordAttempt(identifier);

      // Execute handler
      const response = await handler(req);

      // Add rate limit headers
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', String(options.maxAttempts || 10));
      headers.set('X-RateLimit-Remaining', String(rateCheck.remaining - 1));
      headers.set('X-RateLimit-Reset', String(rateCheck.resetTime));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

    } catch (error) {
      console.error('❌ Rate limit middleware error:', error);
      // Continue to handler on middleware error (fail open)
      return handler(req);
    }
  };
}

export default { checkRateLimit, recordAttempt, clearRateLimit, withRateLimit };