import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

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

// Create a client WITHOUT token initially
// Token will be set dynamically after user logs in
export const base44 = createClient({
  appId,
  serverUrl,
  // Don't pass token here - it will be set by AuthContext after login
  functionsVersion,
  requiresAuth: false
});
