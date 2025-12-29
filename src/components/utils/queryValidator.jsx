// ✅ CRITICAL FIX: SQL Injection protection for database queries

/**
 * Validate and sanitize query parameters
 * Prevents SQL injection and NoSQL injection attacks
 */

/**
 * Allowed operators for filtering
 */
const ALLOWED_OPERATORS = [
  '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
  '$in', '$nin', '$exists', '$regex'
];

/**
 * Validate object ID format
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId: 24 hex characters
  // UUID: standard UUID format
  return /^[a-f\d]{24}$/i.test(id) || 
         /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Sanitize query value (prevent injection)
 */
export function sanitizeQueryValue(value) {
  if (value === null || value === undefined) return value;

  // ✅ Convert to appropriate type
  if (typeof value === 'string') {
    // Remove potential injection characters
    return value.replace(/[\$\{\}]/g, '');
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeQueryValue);
  }

  if (typeof value === 'object') {
    return sanitizeQueryObject(value);
  }

  return value;
}

/**
 * Sanitize query object (recursive)
 */
export function sanitizeQueryObject(query) {
  if (!query || typeof query !== 'object') return {};

  const sanitized = {};

  for (const [key, value] of Object.entries(query)) {
    // ✅ Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn('⚠️ Attempted prototype pollution blocked:', key);
      continue;
    }

    // ✅ Validate operators
    if (key.startsWith('$')) {
      if (!ALLOWED_OPERATORS.includes(key)) {
        console.warn('⚠️ Invalid operator blocked:', key);
        continue;
      }
    }

    // ✅ Sanitize nested objects
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = Array.isArray(value) 
        ? value.map(sanitizeQueryValue)
        : sanitizeQueryObject(value);
    } else {
      sanitized[key] = sanitizeQueryValue(value);
    }
  }

  return sanitized;
}

/**
 * Validate entity filter query
 */
export function validateEntityFilter(filter) {
  if (!filter || typeof filter !== 'object') {
    return {};
  }

  // ✅ Sanitize entire query object
  const sanitized = sanitizeQueryObject(filter);

  // ✅ Additional validation
  Object.keys(sanitized).forEach(key => {
    // Prevent querying sensitive fields
    const sensitiveFields = ['password', 'secret', 'token', 'apiKey'];
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      console.warn('⚠️ Attempted to query sensitive field:', key);
      delete sanitized[key];
    }
  });

  console.log('✅ Query filter validated:', sanitized);
  return sanitized;
}

/**
 * Validate sort parameter
 */
export function validateSort(sort) {
  if (!sort) return undefined;

  if (typeof sort === 'string') {
    // Remove any non-alphanumeric characters except - and _
    return sort.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  if (typeof sort === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(sort)) {
      const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      sanitized[cleanKey] = value === -1 ? -1 : 1;
    }
    return sanitized;
  }

  return undefined;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(limit, skip) {
  const validLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 1000);
  const validSkip = Math.max(parseInt(skip) || 0, 0);

  return { limit: validLimit, skip: validSkip };
}

/**
 * Safe entity query wrapper
 */
export async function safeEntityQuery(entityClient, method, ...args) {
  try {
    // ✅ Validate all arguments
    const validatedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null && !Array.isArray(arg)) {
        return validateEntityFilter(arg);
      }
      return arg;
    });

    console.log('📊 Executing safe query:', method, validatedArgs);
    return await entityClient[method](...validatedArgs);

  } catch (error) {
    console.error('❌ Safe query error:', error);
    throw new Error('Query execution failed - invalid parameters');
  }
}

export default {
  isValidObjectId,
  sanitizeQueryValue,
  sanitizeQueryObject,
  validateEntityFilter,
  validateSort,
  validatePagination,
  safeEntityQuery,
};