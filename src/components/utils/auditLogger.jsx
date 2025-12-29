// ✅ MEDIUM FIX: Audit logging for critical operations

/**
 * Audit log event types
 */
export const AuditEventType = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  PROFILE_CREATED: 'profile_created',
  PROFILE_UPDATED: 'profile_updated',
  PROFILE_DELETED: 'profile_deleted',
  BOOK_PURCHASED: 'book_purchased',
  CONTENT_UPLOADED: 'content_uploaded',
  CONTENT_DELETED: 'content_deleted',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  SETTINGS_CHANGED: 'settings_changed',
  PARENT_APPROVAL: 'parent_approval',
  CONTENT_REPORTED: 'content_reported',
  DATA_EXPORTED: 'data_exported',
  PERMISSION_CHANGED: 'permission_changed',
};

/**
 * Log an audit event
 */
export async function logAuditEvent(eventType, metadata = {}) {
  try {
    const { base44 } = await import('@/api/base44Client');
    
    // Get current user
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (error) {
      console.warn('⚠️ Could not get user for audit log');
    }

    const auditLog = {
      event_type: eventType,
      user_id: user?.id || 'anonymous',
      user_email: user?.email || 'anonymous',
      user_role: user?.role || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
      },
    };

    // ✅ Log to console (production: send to logging service)
    console.log('📝 AUDIT:', auditLog);

    // ✅ Store critical events in UserActivityLog
    if (shouldPersistEvent(eventType)) {
      try {
        await base44.entities.UserActivityLog.create({
          profile_id: metadata.profile_id || user?.user_profile_id,
          activity_type: eventType,
          metadata: auditLog.metadata,
          points_earned: 0,
        });
      } catch (error) {
        console.error('Failed to persist audit log:', error.message);
      }
    }

    return auditLog;

  } catch (error) {
    console.error('❌ Audit logging failed:', error.message);
  }
}

/**
 * Determine if event should be persisted to database
 */
function shouldPersistEvent(eventType) {
  const criticalEvents = [
    AuditEventType.USER_LOGIN,
    AuditEventType.BOOK_PURCHASED,
    AuditEventType.CONTENT_UPLOADED,
    AuditEventType.PAYMENT_COMPLETED,
    AuditEventType.CONTENT_REPORTED,
    AuditEventType.DATA_EXPORTED,
    AuditEventType.PERMISSION_CHANGED,
  ];

  return criticalEvents.includes(eventType);
}

/**
 * Audit wrapper for async functions
 */
export function withAudit(eventType, asyncFunc) {
  return async (...args) => {
    const startTime = Date.now();
    
    try {
      const result = await asyncFunc(...args);
      
      await logAuditEvent(eventType, {
        status: 'success',
        duration_ms: Date.now() - startTime,
        args: sanitizeArgs(args),
      });
      
      return result;
    } catch (error) {
      await logAuditEvent(eventType, {
        status: 'error',
        error: error.message,
        duration_ms: Date.now() - startTime,
        args: sanitizeArgs(args),
      });
      
      throw error;
    }
  };
}

/**
 * Sanitize arguments (remove sensitive data)
 */
function sanitizeArgs(args) {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg };
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
      
      Object.keys(sanitized).forEach(key => {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          sanitized[key] = '***REDACTED***';
        }
      });
      
      return sanitized;
    }
    return arg;
  });
}

/**
 * React hook for audit logging
 */
export function useAuditLog() {
  const logEvent = React.useCallback(async (eventType, metadata = {}) => {
    await logAuditEvent(eventType, metadata);
  }, []);

  return { logEvent };
}

export default { AuditEventType, logAuditEvent, withAudit };