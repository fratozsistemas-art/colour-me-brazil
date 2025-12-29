import throttle from 'lodash.throttle';

// ✅ CRITICAL FIX: Rate limiting to prevent brute force attacks

/**
 * Client-side rate limiter using localStorage
 * Prevents excessive API calls and brute force attempts
 */
class RateLimiter {
  constructor() {
    this.prefix = 'rate_limit_';
    this.cleanupInterval = 60000; // Cleanup every minute
    this.startCleanup();
  }

  /**
   * Check if action is allowed under rate limit
   * @param {string} action - Action identifier (e.g., 'login', 'api_call')
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {object} - { allowed: boolean, remainingAttempts: number, resetTime: number }
   */
  checkLimit(action, maxAttempts = 5, windowMs = 60000) {
    const key = `${this.prefix}${action}`;
    const now = Date.now();
    
    try {
      let data = localStorage.getItem(key);
      let attempts = [];
      
      if (data) {
        attempts = JSON.parse(data).filter(timestamp => now - timestamp < windowMs);
      }
      
      if (attempts.length >= maxAttempts) {
        const oldestAttempt = Math.min(...attempts);
        const resetTime = oldestAttempt + windowMs;
        
        console.warn(`⚠️ Rate limit exceeded for action: ${action}`);
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime,
          waitTime: Math.ceil((resetTime - now) / 1000)
        };
      }
      
      return {
        allowed: true,
        remainingAttempts: maxAttempts - attempts.length,
        resetTime: now + windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      return { allowed: true, remainingAttempts: maxAttempts };
    }
  }

  /**
   * Record an attempt for the action
   * @param {string} action - Action identifier
   */
  recordAttempt(action) {
    const key = `${this.prefix}${action}`;
    const now = Date.now();
    
    try {
      let data = localStorage.getItem(key);
      let attempts = data ? JSON.parse(data) : [];
      
      attempts.push(now);
      localStorage.setItem(key, JSON.stringify(attempts));
      
      console.log(`📊 Recorded attempt for: ${action} (${attempts.length} total)`);
    } catch (error) {
      console.error('Failed to record attempt:', error);
    }
  }

  /**
   * Clear rate limit for an action (use after successful auth, etc.)
   * @param {string} action - Action identifier
   */
  clearLimit(action) {
    const key = `${this.prefix}${action}`;
    localStorage.removeItem(key);
    console.log(`🧹 Cleared rate limit for: ${action}`);
  }

  /**
   * Cleanup old rate limit entries
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            const attempts = JSON.parse(data).filter(timestamp => now - timestamp < maxAge);
            
            if (attempts.length === 0) {
              localStorage.removeItem(key);
            } else {
              localStorage.setItem(key, JSON.stringify(attempts));
            }
          }
        }
      });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }
}

// ✅ Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Throttle function calls (prevents rapid repeated calls)
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Throttled function
 */
export const createThrottle = (func, wait = 1000) => {
  return throttle(func, wait, { leading: true, trailing: false });
};

/**
 * HOC to add rate limiting to async functions
 * @param {Function} asyncFunc - Async function to rate limit
 * @param {string} action - Rate limit action name
 * @param {object} options - Rate limit options
 */
export const withRateLimit = (asyncFunc, action, options = {}) => {
  const { maxAttempts = 5, windowMs = 60000 } = options;
  
  return async (...args) => {
    const check = rateLimiter.checkLimit(action, maxAttempts, windowMs);
    
    if (!check.allowed) {
      throw new Error(
        `Too many attempts. Please wait ${check.waitTime} seconds before trying again.`
      );
    }
    
    rateLimiter.recordAttempt(action);
    
    try {
      const result = await asyncFunc(...args);
      // Clear limit on success for certain actions
      if (action.includes('login') || action.includes('auth')) {
        rateLimiter.clearLimit(action);
      }
      return result;
    } catch (error) {
      // Don't clear limit on failure
      throw error;
    }
  };
};

export default rateLimiter;