// Service Worker Registration and Lifecycle Manager for Kaziniya Pharmacy

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  isWaiting: boolean;
  registration: ServiceWorkerRegistration | null;
}

let swStatus: ServiceWorkerStatus = {
  isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
  isRegistered: false,
  isActive: false,
  isWaiting: false,
  registration: null,
};

const listeners = new Set<(status: ServiceWorkerStatus) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...swStatus }));
}

export function subscribeServiceWorkerStatus(callback: (status: ServiceWorkerStatus) => void): () => void {
  listeners.add(callback);
  callback({ ...swStatus });
  return () => {
    listeners.delete(callback);
  };
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[ServiceWorker] Service Workers are not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    swStatus.registration = registration;
    swStatus.isRegistered = true;
    swStatus.isActive = !!registration.active;
    swStatus.isWaiting = !!registration.waiting;
    notifyListeners();

    // Check for updates on register
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[ServiceWorker] New content is available and will be used when tabs close.');
              swStatus.isWaiting = true;
            } else {
              console.log('[ServiceWorker] Pharmacy POS content is cached for offline use.');
              swStatus.isActive = true;
            }
            notifyListeners();
          }
        });
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      swStatus.isActive = true;
      notifyListeners();
    });

    console.log('[ServiceWorker] Registered successfully with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[ServiceWorker] Registration failed:', error);
    return null;
  }
}

/**
 * Triggers an explicit background pre-cache of critical inventory endpoints.
 */
export async function precachePharmacyInventory(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.success) {
            localStorage.setItem('kaziniya_last_cached_at', new Date().toISOString());
            resolve(true);
          } else {
            resolve(false);
          }
        };

        registration.active?.postMessage(
          { type: 'PRECACHE_INVENTORY' },
          [messageChannel.port2]
        );
      });
    }
  } catch (err) {
    console.warn('[ServiceWorker] Precache inventory warning:', err);
  }

  return false;
}

export function getServiceWorkerStatus(): ServiceWorkerStatus {
  return { ...swStatus };
}
