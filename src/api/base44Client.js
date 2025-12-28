import { createClient } from '@base44/sdk';

// Simple, robust Base44 client initialization
let clientInstance = null;

function getBase44Client() {
  if (clientInstance) {
    return clientInstance;
  }

  // Get config from environment variables
  const appId = import.meta.env.VITE_BASE44_APP_ID || '69383fc9e0a81f2fec355d14';
  const serverUrl = import.meta.env.VITE_BASE44_SERVER_URL || 'https://colour-me-brazil.base44.app';
  const functionsVersion = import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1';

  console.log('🔧 Initializing Base44 client with:', {
    appId: appId ? `${appId.substring(0, 8)}...` : 'MISSING',
    serverUrl,
    functionsVersion
  });

  // Validate required config
  if (!appId || !serverUrl) {
    const error = new Error('Base44 configuration is incomplete. Check environment variables.');
    console.error('❌ Base44 Config Error:', { appId, serverUrl });
    throw error;
  }

  try {
    // Create client with minimal config
    clientInstance = createClient({
      appId,
      serverUrl,
      functionsVersion,
      requiresAuth: false
    });

    console.log('✅ Base44 client initialized successfully');
    return clientInstance;
  } catch (error) {
    console.error('❌ Failed to create Base44 client:', error);
    throw new Error(`Base44 initialization failed: ${error.message}`);
  }
}

// Export a stable reference that will initialize on first use
export const base44 = {
  get auth() {
    return getBase44Client().auth;
  },
  get entities() {
    return getBase44Client().entities;
  },
  get functions() {
    return getBase44Client().functions;
  },
  get integrations() {
    return getBase44Client().integrations;
  },
  get agents() {
    return getBase44Client().agents;
  },
  get socket() {
    return getBase44Client().socket;
  },
  get logs() {
    return getBase44Client().logs;
  },
  get runtime() {
    return getBase44Client().runtime;
  },
  // Direct access to client if needed
  _getClient() {
    return getBase44Client();
  }
};

// Export for debugging
export { getBase44Client };
export const base44Client = {
  get auth() {
    return getBase44Client().auth;
  },
  get entities() {
    return getBase44Client().entities;
  },
  get functions() {
    return getBase44Client().functions;
  },
  get integrations() {
    return getBase44Client().integrations;
  },
  get agents() {
    return getBase44Client().agents;
  },
  get socket() {
    return getBase44Client().socket;
  },
  get logs() {
    return getBase44Client().logs;
  },
  get runtime() {
    return getBase44Client().runtime;
  },
  setToken(token) {
    return getBase44Client().setToken(token);
  },
};
