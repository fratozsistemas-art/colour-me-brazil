import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

// Validation: Ensure critical params are defined
if (!appId || !serverUrl) {
  console.error('❌ Base44 Configuration Error:', {
    appId,
    serverUrl,
    token: token ? '✓ Present' : '✗ Missing',
    functionsVersion
  });
  throw new Error(
    `Base44 configuration is incomplete. Missing: ${!appId ? 'appId ' : ''}${!serverUrl ? 'serverUrl' : ''}`
  );
}

console.log('✅ Base44 Configuration:', {
  appId: appId ? `${appId.substring(0, 8)}...` : 'missing',
  serverUrl,
  hasToken: !!token,
  functionsVersion
});

//Create a client with authentication required
export const base44 = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});
