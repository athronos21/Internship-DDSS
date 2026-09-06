import React, { useState, useEffect } from 'react';
import {
  getOfflineActivityLog,
  OfflineActivityRecord,
  syncOfflineSalesQueue,
  syncSingleOfflineSale,
  clearSyncedOfflineHistory,
  subscribeToQueueChanges,
} from '../../utils/offlineSync';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  CloudCheck,
  CloudOff,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';

interface OfflineActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export const OfflineActivityLogModal: React.FC<OfflineActivityLogModalProps> = ({
  isOpen,
  onClose,
  isOnline,
}) => {
  const [logs, setLogs] = useState<OfflineActivityRecord[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SYNCED' | 'FAILED'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadLogs = () => {
    setLogs(getOfflineActivityLog());
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      const unsubscribe = subscribeToQueueChanges(loadLogs);
      return unsubscribe;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pendingCount = logs.filter((l) => l.status === 'PENDING').length;
  const syncedCount = logs.filter((l) => l.status === 'SYNCED').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const totalVolume = logs.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const filteredLogs = logs.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'SYNCED') return item.status === 'SYNCED';
    if (filter === 'FAILED') return item.status === 'FAILED';
    return true;
  });

  const handleSyncAll = async () => {
    if (!isOnline) {
      setStatusMessage('Device is currently offline. Please restore connectivity to sync.');
      return;
    }
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await syncOfflineSalesQueue();
      loadLogs();
      if (res.syncedCount > 0) {
        setStatusMessage(`Successfully synced ${res.syncedCount} offline ${res.syncedCount === 1 ? 'sale' : 'sales'} to database.`);
      } else if (res.failedCount > 0) {
        setStatusMessage(`Sync attempted: ${res.failedCount} transactions failed. Check errors below.`);
      }
    } catch (e: any) {
      setStatusMessage(`Sync error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetrySingle = async (item: OfflineActivityRecord) => {
    if (!isOnline) {
      setStatusMessage('Device is currently offline. Connect to network to retry.');
      return;
    }
    setSyncingItemId(item.id);
    setStatusMessage(null);
    try {
      const outcome = await syncSingleOfflineSale(item);
      loadLogs();
      if (outcome.success) {
        setStatusMessage(`Invoice ${item.invoiceNumber} successfully synced!`);
      } else {
        setStatusMessage(`Retry failed: ${outcome.message}`);
      }
    } catch (e: any) {
      setStatusMessage(`Retry error: ${e.message}`);
    } finally {
      setSyncingItemId(null);
    }
  };

  const handleClearSynced = () => {
    clearSyncedOfflineHistory();
    loadLogs();
    setStatusMessage('Cleared synced records from local cache history.');
  };

  const handlePrintLog = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
              <CloudOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Offline Activity Log & Sync Manager
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isOnline
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                  {isOnline ? 'Online (Ready to Sync)' : 'Offline (Local Capture)'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit transactions recorded during network disconnects and monitor backend reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintLog}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              title="Print offline transaction audit log"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print Log</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* METRICS & QUICK ACTIONS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 border-b border-slate-100 dark:bg-slate-950/60 dark:border-slate-800 shrink-0">
          <div className="rounded-xl bg-white p-3 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Cloud Sync</span>
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-[11px] text-slate-500 block">Queued in memory</span>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Synced Successfully</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{syncedCount}</span>
            <span className="text-[11px] text-slate-500 block">Reconciled to DB</span>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sync Errors</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{failedCount}</span>
            <span className="text-[11px] text-slate-500 block">Requires retry</span>
          </div>

          <div className="rounded-xl bg-white p-3 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Offline Volume</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white truncate block">
              {formatCurrency(totalVolume)}
            </span>
            <span className="text-[11px] text-slate-500 block">{logs.length} Total Sales</span>
          </div>
        </div>

        {/* STATUS MESSAGE BANNER */}
        {statusMessage && (
          <div className="mx-6 mt-3 rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-xs font-medium text-teal-900 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-200 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-teal-700 hover:text-teal-900 dark:text-teal-300 font-bold">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* FILTERS & ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('SYNCED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'SYNCED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              Synced ({syncedCount})
            </button>
            {failedCount > 0 && (
              <button
                onClick={() => setFilter('FAILED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filter === 'FAILED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                Failed ({failedCount})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {syncedCount > 0 && (
              <button
                onClick={handleClearSynced}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                title="Clear synced records from view"
              >
                <Trash2 className="h-3 w-3" />
                Clear Synced
              </button>
            )}

            <button
              onClick={handleSyncAll}
              disabled={isSyncing || pendingCount === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : `Sync All Pending (${pendingCount})`}</span>
            </button>
          </div>
        </div>

        {/* LOGS TABLE / LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No Offline Transactions Recorded</h4>
                <p className="text-xs text-slate-400">
                  {filter === 'ALL'
                    ? 'All transactions were processed with live cloud database connectivity.'
                    : `No transactions matching the "${filter}" status filter.`}
                </p>
              </div>
            </div>
          ) : (
            filteredLogs.map((item) => {
              const isExpanded = expandedRecordId === item.id;
              const isItemSyncing = syncingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all ${
                    item.status === 'SYNCED'
                      ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/10'
                      : item.status === 'FAILED'
                      ? 'border-rose-200 bg-rose-50/20 dark:border-rose-900/60 dark:bg-rose-950/10'
                      : 'border-amber-200/90 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/10'
                  }`}
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {item.invoiceNumber}
                        </span>

                        {/* Status Badge */}
                        {item.status === 'SYNCED' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Synced to Cloud
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                            <Clock className="h-3 w-3" />
                            Pending Sync
                          </span>
                        )}
                        {item.status === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertTriangle className="h-3 w-3" />
                            Sync Failed
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Customer: <strong className="text-slate-700 dark:text-slate-300">{item.customerName}</strong></span>
                        <span>•</span>
                        <span>Payment: <strong className="text-teal-600 dark:text-teal-400">{item.paymentMethod}</strong></span>
                        <span>•</span>
                        <span>{item.items.length} {item.items.length === 1 ? 'Medicine' : 'Medicines'}</span>
                      </div>

                      {item.status === 'SYNCED' && item.syncedAt && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Reconciled to cloud server on {formatDateTime(item.syncedAt)}
                          {item.serverSaleId && ` (Ref ID: ${item.serverSaleId})`}
                        </p>
                      )}

                      {item.status === 'FAILED' && item.errorMessage && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          Error: {item.errorMessage}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.totalAmount)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-[10px] text-rose-500 block">
                            Disc: -{formatCurrency(item.discount)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(item.status === 'PENDING' || item.status === 'FAILED') && (
                          <button
                            onClick={() => handleRetrySingle(item)}
                            disabled={isItemSyncing || !isOnline}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 transition dark:bg-teal-950 dark:border-teal-800 dark:text-teal-300 disabled:opacity-50"
                            title="Retry sync for this sale"
                          >
                            <RefreshCw className={`h-3 w-3 ${isItemSyncing ? 'animate-spin' : ''}`} />
                            <span>{isItemSyncing ? 'Syncing...' : 'Sync'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setExpandedRecordId(isExpanded ? null : item.id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          title="View sale line items"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED LINE ITEMS */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 text-xs">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
                        Purchased Medicines Breakdown
                      </h5>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {item.items.map((line, idx) => (
                          <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {line.medicineName || `Medicine #${line.medicineId}`}
                              </span>
                              <span className="text-slate-400 text-[11px] block">
                                {line.quantity} units @ {formatCurrency(line.unitPrice)}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(line.quantity * line.unitPrice - (line.discount || 0))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Kaziniya POS Offline Replication Engine • Local Storage V1
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition dark:bg-slate-800 dark:text-slate-300"
          >
            Close Activity Log
          </button>
        </div>
      </div>
    </div>
  );
};
