import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

let base44Client = null;

// Lazy initialization function
const initializeBase44 = () => {
  if (base44Client) return base44Client;

  const { appId, serverUrl, functionsVersion } = appParams;

  // Validation: Ensure critical params are defined
  if (!appId || !serverUrl) {
    console.error('❌ Base44 Configuration Error:', {
      appId,
      serverUrl,
      functionsVersion
    });
    throw new Error(
      `Base44 configuration is incomplete. Missing: ${!appId ? 'appId ' : ''}${!serverUrl ? 'serverUrl' : ''}`
    );
  }

  console.log('✅ Base44 Configuration:', {
    appId: appId ? `${appId.substring(0, 8)}...` : 'missing',
    serverUrl,
    functionsVersion
  });

  try {
    // Create a client WITHOUT token initially
    // Token will be set dynamically after user logs in
    base44Client = createClient({
      appId,
      serverUrl,
      // Don't pass token here - it will be set by AuthContext after login
      functionsVersion,
      requiresAuth: false
    });

    console.log('✅ Base44 Client initialized successfully');
    return base44Client;
  } catch (error) {
    console.error('❌ Failed to initialize Base44 client:', error);
    throw error;
  }
};

// Export lazy getter
export const base44 = new Proxy({}, {
  get(target, prop) {
    const client = initializeBase44();
    return client[prop];
  }
});
