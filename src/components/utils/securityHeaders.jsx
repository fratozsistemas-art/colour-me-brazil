// ✅ CRITICAL FIX: Security headers (CSP, HTTPS enforcement, etc.)

/**
 * Content Security Policy configuration
 * Prevents XSS, clickjacking, and other injection attacks
 */
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React
    "'unsafe-eval'", // Required for dev mode
    'https://js.stripe.com',
    'https://cdn.jsdelivr.net',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://*.supabase.co',
    'https://base44.com',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://api.base44.com',
    'https://api.stripe.com',
    'https://*.supabase.co',
  ],
  'media-src': ["'self'", 'blob:', 'https:'],
  'object-src': ["'none'"],
  'frame-src': ["'self'", 'https://js.stripe.com'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader() {
  return Object.entries(CSP_POLICY)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers for backend functions
 */
export function getSecurityHeaders() {
  return {
    'Content-Security-Policy': generateCSPHeader(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

/**
 * Apply security headers to Response
 */
export function applySecurityHeaders(response) {
  const headers = new Headers(response.headers);
  const securityHeaders = getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * HTTPS enforcement check
 */
export function enforceHTTPS(req) {
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host');
  
  if (protocol !== 'https' && !host.includes('localhost')) {
    const httpsUrl = `https://${host}${new URL(req.url).pathname}`;
    return Response.redirect(httpsUrl, 301);
  }
  
  return null;
}

export default { getSecurityHeaders, applySecurityHeaders, enforceHTTPS };