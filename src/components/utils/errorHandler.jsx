// ✅ MEDIUM FIX: Centralized error handling

/**
 * Error types for categorization
 */
export const ErrorType = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NETWORK: 'network',
  DATABASE: 'database',
  RATE_LIMIT: 'rate_limit',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, statusCode = 500, metadata = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error and return user-friendly message
 */
export function parseError(error) {
  // AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      statusCode: error.statusCode,
      userMessage: getUserMessage(error.type, error.message),
    };
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return {
      message: error.message,
      type: ErrorType.NETWORK,
      statusCode: 0,
      userMessage: 'Network error. Please check your connection.',
    };
  }

  // Rate limit errors
  if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
    return {
      message: error.message,
      type: ErrorType.RATE_LIMIT,
      statusCode: 429,
      userMessage: error.message || 'Too many requests. Please wait and try again.',
    };
  }

  // Authentication errors
  if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
    return {
      message: error.message,
      type: ErrorType.AUTHENTICATION,
      statusCode: 401,
      userMessage: 'Please log in to continue.',
    };
  }

  // Default error
  return {
    message: error.message || 'An error occurred',
    type: ErrorType.UNKNOWN,
    statusCode: 500,
    userMessage: 'Something went wrong. Please try again.',
  };
}

/**
 * Get user-friendly message based on error type
 */
function getUserMessage(type, originalMessage) {
  const messages = {
    [ErrorType.AUTHENTICATION]: 'Please log in to continue.',
    [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorType.VALIDATION]: originalMessage || 'Invalid input. Please check your data.',
    [ErrorType.NETWORK]: 'Network error. Please check your connection.',
    [ErrorType.DATABASE]: 'Database error. Please try again later.',
    [ErrorType.RATE_LIMIT]: originalMessage || 'Too many requests. Please wait and try again.',
    [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorType.SERVER]: 'Server error. Please try again later.',
    [ErrorType.UNKNOWN]: 'Something went wrong. Please try again.',
  };

  return messages[type] || messages[ErrorType.UNKNOWN];
}

/**
 * Log error (client-side)
 */
export function logError(error, context = {}) {
  const parsed = parseError(error);
  
  console.error('🔴 Error:', {
    ...parsed,
    context,
    stack: error.stack?.split('\n').slice(0, 3), // First 3 lines only
  });

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry, LogRocket, etc.
  }
}

/**
 * Handle async errors with consistent pattern
 */
export async function handleAsync(promise, errorMessage = 'Operation failed') {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    logError(error, { context: errorMessage });
    return [null, parseError(error)];
  }
}

/**
 * React hook for error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((err, context = {}) => {
    const parsed = parseError(err);
    logError(err, context);
    setError(parsed);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

export default { AppError, ErrorType, parseError, logError, handleAsync };