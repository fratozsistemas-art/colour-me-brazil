import { logger } from '@/lib/logger';

/**
 * Service Worker Registration
 * Registers and manages service worker lifecycle
 */

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('✓ Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => {
          logger.error('✗ Service Worker registration failed', error);
        });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('Service Worker updated, reloading page...');
        window.location.reload();
      });
    });
  } else {
    logger.info('Service Worker not supported in this browser');
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        logger.info('Service Worker unregistered');
      }
    } catch (error) {
      logger.error('Failed to unregister service worker', error);
    }
  }
};

/**
 * Show update notification when new version is available
 */
const showUpdateNotification = () => {
  const shouldUpdate = window.confirm(
    'A new version of Colour Me Brazil is available! Would you like to update now?'
  );

  if (shouldUpdate) {
    skipWaitingAndActivate();
  }
};

/**
 * Get service worker version
 */
export const getServiceWorkerVersion = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );

      // Timeout after 2 seconds
      setTimeout(() => resolve('unknown'), 2000);
    });
  }
  
  return 'not-registered';
};

/**
 * Skip waiting and activate new service worker immediately
 */
export const skipWaitingAndActivate = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

/**
 * Request background sync (for offline data)
 */
export const requestBackgroundSync = async (tag = 'sync-offline-data') => {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      logger.info('Background sync registered:', tag);
      return true;
    } catch (error) {
      logger.error('Background sync registration failed', error);
      return false;
    }
  }
  
  logger.warn('Background Sync not supported');
  return false;
};

/**
 * Check if app is running in standalone mode (PWA)
 */
export const isRunningAsPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Prompt user to install PWA
 */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  logger.info('PWA install prompt ready');
});

export const promptPWAInstall = async () => {
  if (!deferredPrompt) {
    logger.info('PWA install prompt not available');
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  logger.info(`User ${outcome} the PWA installation`);
  deferredPrompt = null;
  
  return outcome === 'accepted';
};

export const canInstallPWA = () => {
  return deferredPrompt !== null;
};
