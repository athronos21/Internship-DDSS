// Offline Synchronization and POS Offline Storage Engine for Kaziniya Pharmacy
import { Medicine, Sale, PaymentMethod } from '../types';

export interface QueuedSaleItem {
  medicineId: string;
  medicineName?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface QueuedSalePayload {
  id: string; // Temporary local ID
  invoiceNumber: string;
  items: QueuedSaleItem[];
  discount: number;
  customerName: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  totalAmount: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
  syncedAt?: string;
  serverSaleId?: string;
}

export interface OfflineActivityRecord extends QueuedSalePayload {
  lastAttemptAt?: string;
}

const OFFLINE_SALES_STORAGE_KEY = 'kaziniya_offline_sales_queue_v1';
const OFFLINE_ACTIVITY_HISTORY_KEY = 'kaziniya_offline_activity_history_v1';
const OFFLINE_INVENTORY_SNAPSHOT_KEY = 'kaziniya_offline_medicines_snapshot_v1';
const SYNC_EVENT_NAME = 'kaziniya-offline-sync-event';

// Notify UI components when offline queue or activity log changes
export function emitQueueChangeEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME));
  }
}

// Subscribe to queue change events
export function subscribeToQueueChanges(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SYNC_EVENT_NAME, callback);
  return () => {
    window.removeEventListener(SYNC_EVENT_NAME, callback);
  };
}

/**
 * Retrieves all offline queued sales pending backend synchronization.
 */
export function getQueuedSales(): QueuedSalePayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_SALES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading offline sales queue:', err);
    return [];
  }
}

/**
 * Retrieves full offline activity logs (both pending and completed synced transactions).
 */
export function getOfflineActivityLog(): OfflineActivityRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_ACTIVITY_HISTORY_KEY);
    const history: OfflineActivityRecord[] = raw ? JSON.parse(raw) : [];
    // Ensure all active queued items are represented
    const currentQueue = getQueuedSales();
    const map = new Map<string, OfflineActivityRecord>();
    for (const h of history) {
      map.set(h.id, h);
    }
    for (const q of currentQueue) {
      map.set(q.id, { ...q, status: q.status || 'PENDING' });
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.error('Error reading offline activity log:', err);
    return [];
  }
}

/**
 * Updates a record in the offline activity history.
 */
function updateActivityHistoryRecord(record: OfflineActivityRecord) {
  if (typeof window === 'undefined') return;
  try {
    const history = getOfflineActivityLog();
    const existingIndex = history.findIndex((h) => h.id === record.id);
    let updated: OfflineActivityRecord[];
    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = { ...updated[existingIndex], ...record };
    } else {
      updated = [record, ...history];
    }
    localStorage.setItem(OFFLINE_ACTIVITY_HISTORY_KEY, JSON.stringify(updated.slice(0, 100))); // Keep last 100
  } catch (e) {
    console.error('Error updating activity history record:', e);
  }
}

/**
 * Clears only synced items from activity history.
 */
export function clearSyncedOfflineHistory() {
  if (typeof window === 'undefined') return;
  try {
    const history = getOfflineActivityLog();
    const pendingOnly = history.filter((h) => h.status === 'PENDING' || h.status === 'FAILED');
    localStorage.setItem(OFFLINE_ACTIVITY_HISTORY_KEY, JSON.stringify(pendingOnly));
    emitQueueChangeEvent();
  } catch (e) {
    console.error('Error clearing synced offline history:', e);
  }
}

/**
 * Saves an offline sale to the local queue when POS completes a sale without network.
 */
export function enqueueOfflineSale(sale: Omit<QueuedSalePayload, 'id' | 'status' | 'createdAt'>): QueuedSalePayload {
  const currentQueue = getQueuedSales();
  const newQueuedSale: QueuedSalePayload = {
    ...sale,
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const updated = [newQueuedSale, ...currentQueue];
  localStorage.setItem(OFFLINE_SALES_STORAGE_KEY, JSON.stringify(updated));
  updateActivityHistoryRecord(newQueuedSale);
  emitQueueChangeEvent();
  return newQueuedSale;
}

/**
 * Removes a synced sale from the queue and marks it as SYNCED in history.
 */
export function markSaleAsSynced(id: string, serverSaleId?: string) {
  const currentQueue = getQueuedSales();
  const target = currentQueue.find((s) => s.id === id);
  const updated = currentQueue.filter((s) => s.id !== id);
  localStorage.setItem(OFFLINE_SALES_STORAGE_KEY, JSON.stringify(updated));

  if (target) {
    updateActivityHistoryRecord({
      ...target,
      status: 'SYNCED',
      syncedAt: new Date().toISOString(),
      serverSaleId,
      errorMessage: undefined,
    });
  }
  emitQueueChangeEvent();
}

/**
 * Marks an offline sale as failed in queue and history.
 */
export function markSaleAsFailed(id: string, errorMessage: string) {
  const currentQueue = getQueuedSales();
  const updated = currentQueue.map((s) => {
    if (s.id === id) {
      return { ...s, status: 'FAILED' as const, errorMessage, lastAttemptAt: new Date().toISOString() };
    }
    return s;
  });
  localStorage.setItem(OFFLINE_SALES_STORAGE_KEY, JSON.stringify(updated));

  const target = updated.find((s) => s.id === id);
  if (target) {
    updateActivityHistoryRecord(target);
  }
  emitQueueChangeEvent();
}

/**
 * Caches an in-memory snapshot of all medicines for offline lookup and barcode scanning.
 */
export function cacheInventorySnapshot(medicines: Medicine[]) {
  if (typeof window === 'undefined' || !medicines || medicines.length === 0) return;
  try {
    localStorage.setItem(OFFLINE_INVENTORY_SNAPSHOT_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
      count: medicines.length,
      data: medicines,
    }));
  } catch (e) {
    console.warn('Unable to write medicines snapshot to localStorage:', e);
  }
}

/**
 * Reads the cached inventory snapshot if offline or network fails.
 */
export function getCachedInventorySnapshot(): { timestamp: string; count: number; data: Medicine[] } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFLINE_INVENTORY_SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to sync a single offline sale item.
 */
export async function syncSingleOfflineSale(item: QueuedSalePayload): Promise<{ success: boolean; message?: string }> {
  try {
    const payload = {
      items: item.items.map((i) => ({
        medicineId: i.medicineId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount || 0,
      })),
      discount: item.discount,
      customerName: item.customerName || 'Walk-in Customer (Offline Synced)',
      paymentMethod: item.paymentMethod,
      notes: `Offline Transaction (Recorded: ${new Date(item.createdAt).toLocaleTimeString()})`,
    };

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'u-4',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.success) {
      markSaleAsSynced(item.id, result.data?.id);
      return { success: true };
    } else {
      const errMsg = result.message || 'Server rejected transaction';
      markSaleAsFailed(item.id, errMsg);
      return { success: false, message: errMsg };
    }
  } catch (err: any) {
    const errMsg = err.message || 'Network unreachable';
    markSaleAsFailed(item.id, errMsg);
    return { success: false, message: errMsg };
  }
}

/**
 * Attempts to push all queued offline sales to the backend server.
 * Returns the count of successfully synchronized sales.
 */
export async function syncOfflineSalesQueue(): Promise<{ syncedCount: number; failedCount: number; errors: string[] }> {
  const queue = getQueuedSales();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const item of [...queue]) {
    const outcome = await syncSingleOfflineSale(item);
    if (outcome.success) {
      syncedCount++;
    } else {
      failedCount++;
      errors.push(`Invoice ${item.invoiceNumber}: ${outcome.message}`);
    }
  }

  emitQueueChangeEvent();
  return { syncedCount, failedCount, errors };
}
