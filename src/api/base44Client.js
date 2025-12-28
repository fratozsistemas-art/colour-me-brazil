import { createClient } from '@base44/sdk';

// Simple, robust Base44 client initialization
let clientInstance = null;

function getBase44Client() {
  if (clientInstance) {
    return clientInstance;
  }

  // Get config from environment variables
  const appId = import.meta.env.VITE_BASE44_APP_ID;
  const serverUrl = import.meta.env.VITE_BASE44_SERVER_URL;
  const functionsVersion = import.meta.env.VITE_BASE44_FUNCTIONS_VERSION || 'v1';

  console.log('🔧 Initializing Base44 client with:', {
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
