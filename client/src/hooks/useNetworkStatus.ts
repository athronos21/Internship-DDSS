import { useState, useEffect, useCallback } from 'react';
import {
  getServiceWorkerStatus,
  subscribeServiceWorkerStatus,
  precachePharmacyInventory,
  ServiceWorkerStatus,
} from '../utils/serviceWorkerRegistration';
import {
  getQueuedSales,
  subscribeToQueueChanges,
  syncOfflineSalesQueue,
  getCachedInventorySnapshot,
} from '../utils/offlineSync';

export interface NetworkStatusState {
  isOnline: boolean;
  swStatus: ServiceWorkerStatus;
  queuedSalesCount: number;
  isSyncing: boolean;
  isCaching: boolean;
  lastCachedAt: string | null;
  cachedMedsCount: number;
  syncNow: () => Promise<{ syncedCount: number; failedCount: number; errors: string[] }>;
  cacheInventoryNow: () => Promise<boolean>;
}

export function useNetworkStatus(): NetworkStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus>(getServiceWorkerStatus());
  const [queuedSalesCount, setQueuedSalesCount] = useState<number>(() => getQueuedSales().length);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [lastCachedAt, setLastCachedAt] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('kaziniya_last_cached_at') : null;
  });
  const [cachedMedsCount, setCachedMedsCount] = useState<number>(() => {
    const snap = getCachedInventorySnapshot();
    return snap ? snap.count : 0;
  });

  const updateQueueCount = useCallback(() => {
    setQueuedSalesCount(getQueuedSales().length);
    const snap = getCachedInventorySnapshot();
    if (snap) {
      setCachedMedsCount(snap.count);
    }
  }, []);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncOfflineSalesQueue();
      updateQueueCount();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [updateQueueCount]);

  const cacheInventoryNow = useCallback(async () => {
    setIsCaching(true);
    try {
      const ok = await precachePharmacyInventory();
      if (ok) {
        const now = new Date().toISOString();
        setLastCachedAt(now);
      }
      return ok;
    } finally {
      setIsCaching(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically attempt to sync any queued offline sales on reconnect
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubSw = subscribeServiceWorkerStatus((newSw) => {
      setSwStatus(newSw);
    });

    const unsubQueue = subscribeToQueueChanges(() => {
      updateQueueCount();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubSw();
      unsubQueue();
    };
  }, [syncNow, updateQueueCount]);

  return {
    isOnline,
    swStatus,
    queuedSalesCount,
    isSyncing,
    isCaching,
    lastCachedAt,
    cachedMedsCount,
    syncNow,
    cacheInventoryNow,
  };
}
