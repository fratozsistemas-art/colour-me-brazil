import { createClient } from '@base44/sdk';
import { logger } from '@/lib/logger';
import { createRateLimiter } from '@/lib/rateLimit';

// Simple, robust Base44 client initialization
let clientInstance = null;
const rateLimit = createRateLimiter({ limit: 10, intervalMs: 1000 });

const rateLimitProxy = (target) => {
  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop];
      if (typeof value === 'function') {
        return (...args) => rateLimit(() => value.apply(obj, args));
      }
      if (value && typeof value === 'object') {
        return rateLimitProxy(value);
      }
      return value;
    },
  });
};

function getBase44Client() {
  if (clientInstance) {
    return clientInstance;
  }

  // Get config from environment variables
  const appId = import.meta.env.VITE_BASE44_APP_ID;
  const serverUrl = import.meta.env.VITE_BASE44_SERVER_URL;
  const functionsVersion = import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1';

  logger.info('🔧 Initializing Base44 client with:', {
    appId: appId ? `${appId.substring(0, 8)}...` : 'MISSING',
    serverUrl,
    functionsVersion
  });

  // Validate required config
  if (!appId || !serverUrl) {
    throw new Error(
      'Base44 configuration is incomplete. Set VITE_BASE44_APP_ID and VITE_BASE44_SERVER_URL.'
    );
  }

  try {
    // Create client with minimal config
    clientInstance = createClient({
      appId,
      serverUrl,
      functionsVersion,
      requiresAuth: false,
      timeout: 10000,
      retry: { attempts: 2, delay: 1000 }
    });

    logger.info('✅ Base44 client initialized successfully');
    return clientInstance;
  } catch (error) {
    logger.error('❌ Failed to create Base44 client', error);
    throw new Error(`Base44 initialization failed: ${error.message}`);
  }
}

// Export a stable reference that will initialize on first use
export const base44 = {
  get auth() {
    return rateLimitProxy(getBase44Client().auth);
  },
  get entities() {
    return rateLimitProxy(getBase44Client().entities);
  },
  get functions() {
    return rateLimitProxy(getBase44Client().functions);
  },
  get integrations() {
    return rateLimitProxy(getBase44Client().integrations);
  },
  get agents() {
    return rateLimitProxy(getBase44Client().agents);
  },
  get socket() {
    return rateLimitProxy(getBase44Client().socket);
  },
  get logs() {
    return rateLimitProxy(getBase44Client().logs);
  },
  get runtime() {
    return rateLimitProxy(getBase44Client().runtime);
  },
  // Direct access to client if needed
  _getClient() {
    return getBase44Client();
  }
};

// Export for debugging
export { getBase44Client };
