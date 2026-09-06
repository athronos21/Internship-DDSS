import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Medicine, CartItem, Sale, PaymentMethod } from '../../types';
import { formatCurrency, formatDate, getDaysUntilExpiry, getExpiryBadgeClass } from '../../utils/formatters';
import { playSound, isSoundEnabled, setSoundEnabled } from '../../utils/soundEffects';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import {
  cacheInventorySnapshot,
  getCachedInventorySnapshot,
  enqueueOfflineSale,
  getOfflineActivityLog,
  subscribeToQueueChanges,
} from '../../utils/offlineSync';
import {
  Scan,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Pill,
  Sparkles,
  Zap,
  Tag,
  AlertTriangle,
  Printer,
  FileText,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  CloudOff,
  QrCode,
  ClipboardList,
  Filter,
  Calendar,
  Layers,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Bookmark,
  RotateCcw,
  Save,
  QrCode as QrCodeIcon,
  Smartphone as PhoneIcon,
} from 'lucide-react';
import QRCode from 'qrcode';
import { BarcodeScannerModal, extractCleanBarcode } from '../common/BarcodeScannerModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { OfflineActivityLogModal } from '../common/OfflineActivityLogModal';
import { MedicineQrCodeModal } from '../common/MedicineQrCodeModal';
import { DraftSalesModal, SavedDraftSale } from '../common/DraftSalesModal';

const POS_ACTIVE_DRAFT_KEY = 'kaziniya_pos_active_draft_v1';
const POS_SAVED_DRAFTS_KEY = 'kaziniya_pos_saved_drafts_v1';

interface PosViewProps {
  onOpenShiftHandover?: () => void;
}

export const PosView: React.FC<PosViewProps> = ({ onOpenShiftHandover }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeFefoPreview, setActiveFefoPreview] = useState<any | null>(null);
  const [soundActive, setSoundActive] = useState(isSoundEnabled());
  const [lastScannedItemName, setLastScannedItemName] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const scanFlashTimeoutRef = useRef<number | null>(null);

  // Draft Sales & Local Persistence state
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftStatusText, setDraftStatusText] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftSale[]>(() => {
    try {
      const raw = localStorage.getItem(POS_SAVED_DRAFTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Quick Filters, QR codes, Low stock & Offline Log state
  const [isOfflineLogOpen, setIsOfflineLogOpen] = useState(false);
  const [selectedMedForQr, setSelectedMedForQr] = useState<Medicine | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expiryFilter, setExpiryFilter] = useState<'ALL' | 'FEFO_FIRST' | 'EXPIRING_90' | 'EXPIRING_180' | 'LONG_EXPIRY'>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'IN_STOCK'>('ALL');
  const [offlineActivityCount, setOfflineActivityCount] = useState<number>(0);

  const {
    isOnline,
    swStatus,
    queuedSalesCount,
    isSyncing,
    isCaching,
    lastCachedAt,
    cachedMedsCount,
    syncNow,
    cacheInventoryNow,
  } = useNetworkStatus();

  const updateOfflineActivityCount = () => {
    const logs = getOfflineActivityLog();
    setOfflineActivityCount(logs.length);
  };

  // Restore active draft from localStorage on initial mount
  useEffect(() => {
    try {
      const rawActive = localStorage.getItem(POS_ACTIVE_DRAFT_KEY);
      if (rawActive) {
        const parsed = JSON.parse(rawActive);
        if (Array.isArray(parsed.cart) && parsed.cart.length > 0) {
          setCart(parsed.cart);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          if (typeof parsed.discountAmount === 'number') setDiscountAmount(parsed.discountAmount);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          setDraftStatusText(`Restored active draft (${parsed.cart.length} items) from previous session`);
          setTimeout(() => setDraftStatusText(null), 4000);
        }
      }
    } catch (e) {
      console.warn('Failed to restore active POS draft', e);
    }
  }, []);

  // Automatically persist cart changes to localStorage (Draft Sale persistence across refresh)
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    try {
      if (cart.length > 0) {
        localStorage.setItem(
          POS_ACTIVE_DRAFT_KEY,
          JSON.stringify({
            cart,
            customerName,
            discountAmount,
            paymentMethod,
            updatedAt: new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem(POS_ACTIVE_DRAFT_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist active POS draft', e);
    }
  }, [cart, customerName, discountAmount, paymentMethod]);

  useEffect(() => {
    fetchMedicines();
    updateOfflineActivityCount();
    const unsub = subscribeToQueueChanges(updateOfflineActivityCount);
    return unsub;
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setMedicines(data.data);
        // Snapshot to local cache for offline fallback
        cacheInventorySnapshot(data.data);
      } else {
        // Attempt offline fallback from local snapshot
        const snapshot = getCachedInventorySnapshot();
        if (snapshot && snapshot.data.length > 0) {
          setMedicines(snapshot.data);
          setOfflineNotice(`Loaded ${snapshot.data.length} medicines from Service Worker offline cache`);
        }
      }
    } catch (e) {
      console.warn('[POS] Network error fetching medicines. Falling back to offline cache.', e);
      const snapshot = getCachedInventorySnapshot();
      if (snapshot && snapshot.data.length > 0) {
        setMedicines(snapshot.data);
        setOfflineNotice(`Offline Mode: Using ${snapshot.data.length} cached medicines`);
      }
    }
  };

  const triggerScanFlash = (itemName: string) => {
    setLastScannedItemName(itemName);
    if (scanFlashTimeoutRef.current) {
      clearTimeout(scanFlashTimeoutRef.current);
    }
    scanFlashTimeoutRef.current = window.setTimeout(() => {
      setLastScannedItemName(null);
    }, 2400);
  };

  const toggleSoundFeedback = () => {
    const newState = !soundActive;
    setSoundActive(newState);
    setSoundEnabled(newState);
    if (newState) {
      playSound('scan_success');
    }
  };

  const handleBarcodeScanned = async (rawCode: string, resolvedMed?: Medicine | null) => {
    if (resolvedMed) {
      const added = addMedicineToCart(resolvedMed, true);
      if (added) {
        triggerScanFlash(resolvedMed.name);
      }
      return;
    }

    const barcode = extractCleanBarcode(rawCode);
    if (!barcode) {
      playSound('scan_error');
      return;
    }

    // Check in-memory medicine list first for instant response
    const localMatch = medicines.find(
      (m) =>
        (m.barcode && m.barcode.toLowerCase() === barcode.toLowerCase()) ||
        (m.id && m.id.toLowerCase() === barcode.toLowerCase()) ||
        (m.sku && m.sku.toLowerCase() === barcode.toLowerCase())
    );

    if (localMatch) {
      const added = addMedicineToCart(localMatch, true);
      if (added) {
        triggerScanFlash(localMatch.name);
      }
      return;
    }

    try {
      const res = await fetch(`/api/medicines/barcode/${encodeURIComponent(barcode)}`);
      const data = await res.json();
      if (data.success && data.data.medicine) {
        const added = addMedicineToCart(data.data.medicine, true);
        if (added) {
          triggerScanFlash(data.data.medicine.name);
        }
      } else {
        playSound('scan_error');
      }
    } catch (e) {
      // Offline fallback check
      const fallbackMatch = medicines.find(
        (m) =>
          (m.barcode && m.barcode.toLowerCase().includes(barcode.toLowerCase())) ||
          (m.id && m.id.toLowerCase().includes(barcode.toLowerCase()))
      );
      if (fallbackMatch) {
        const added = addMedicineToCart(fallbackMatch, true);
        if (added) {
          triggerScanFlash(fallbackMatch.name);
        }
      } else {
        playSound('scan_error');
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      e.preventDefault();
      const rawQuery = searchQuery.trim();
      const query = extractCleanBarcode(rawQuery).toLowerCase();
      // Look for exact barcode match first
      const barcodeMatch = medicines.find(
        (m) =>
          m.barcode.toLowerCase() === query ||
          m.id.toLowerCase() === query ||
          (m.sku && m.sku.toLowerCase() === query)
      );
      if (barcodeMatch) {
        const added = addMedicineToCart(barcodeMatch, true);
        if (added) {
          triggerScanFlash(barcodeMatch.name);
          setSearchQuery('');
        }
        return;
      }

      // Look for exact or top match
      const matchingMeds = medicines.filter(
        (m) =>
          m.name.toLowerCase() === query ||
          m.barcode.toLowerCase().includes(query) ||
          m.name.toLowerCase().includes(query)
      );

      if (matchingMeds.length === 1) {
        const added = addMedicineToCart(matchingMeds[0], true);
        if (added) {
          triggerScanFlash(matchingMeds[0].name);
          setSearchQuery('');
        }
      } else if (matchingMeds.length > 1) {
        // Pick the top matched available medicine
        const topAvailable = matchingMeds.find((m) => (m.totalStock || 0) > 0) || matchingMeds[0];
        const added = addMedicineToCart(topAvailable, true);
        if (added) {
          triggerScanFlash(topAvailable.name);
          setSearchQuery('');
        }
      } else {
        playSound('scan_error');
      }
    }
  };

  const addMedicineToCart = (med: Medicine, isScan = false): boolean => {
    if ((med.totalStock || 0) <= 0) {
      playSound('scan_error');
      alert(`"${med.name}" is OUT OF STOCK or all available batches have EXPIRED.`);
      return false;
    }

    const existingIndex = cart.findIndex((i) => i.medicine.id === med.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty > (med.totalStock || 0)) {
        playSound('scan_error');
        alert(`Cannot add more. Maximum non-expired stock for "${med.name}" is ${med.totalStock} units.`);
        return false;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * updated[existingIndex].unitPrice;
      setCart(updated);
      // Audible beep feedback (double chirp for quantity increment)
      playSound(isScan ? 'scan_double' : 'scan_success');
      return true;
    } else {
      setCart([
        ...cart,
        {
          medicine: med,
          quantity: 1,
          unitPrice: med.sellingPrice || 10,
          discount: 0,
          totalPrice: med.sellingPrice || 10,
        },
      ]);
      // Audible beep feedback (crisp POS laser beep)
      playSound('scan_success');
      return true;
    }
  };

  const updateCartQty = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }

    if (newQty > (item.medicine.totalStock || 0)) {
      playSound('scan_error');
      alert(`Only ${item.medicine.totalStock} non-expired units available in stock.`);
      return;
    }

    item.quantity = newQty;
    item.totalPrice = newQty * item.unitPrice - item.discount;
    setCart(updated);
    if (delta > 0) {
      playSound('scan_success', 0.2);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    setIsCheckoutProcessing(true);

    const saleItems = cart.map((c) => ({
      medicineId: c.medicine.id,
      medicineName: c.medicine.name,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      discount: c.discount || 0,
    }));

    // If device is explicitly offline or network fails, queue the sale offline
    const executeOfflineSale = () => {
      const generatedInvoice = `INV-OFFLINE-${Date.now().toString().slice(-6)}`;
      const offlineRecord = enqueueOfflineSale({
        invoiceNumber: generatedInvoice,
        items: saleItems,
        discount: Number(discountAmount),
        customerName: customerName.trim() || 'Walk-in Customer',
        paymentMethod,
        totalAmount,
      });

      // Construct receipt sale object
      const offlineSale: Sale = {
        id: offlineRecord.id,
        invoiceNumber: generatedInvoice,
        subtotal: subtotal,
        discount: Number(discountAmount),
        tax: 0,
        totalAmount: totalAmount,
        paymentMethod,
        paymentStatus: 'PAID',
        customerName: customerName.trim() || 'Walk-in Customer (Offline Queued)',
        soldBy: 'u-4',
        soldByName: 'Pharmacist Counter (Offline Node)',
        createdAt: new Date().toISOString(),
        items: cart.map((ci, idx) => ({
          id: `off-item-${idx}`,
          saleId: offlineRecord.id,
          batchId: (ci.medicine as any).batches?.[0]?.id || 'b-1',
          medicineId: ci.medicine.id,
          medicineName: ci.medicine.name,
          batchNumber: (ci.medicine as any).batches?.[0]?.batchNumber || 'BATCH-OFFLINE',
          expiryDate: formatDate(ci.medicine.earliestExpiry),
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          discount: ci.discount || 0,
          totalPrice: ci.totalPrice,
        })),
      };

      // Deduct sold units in-memory so POS inventory matches local state
      setMedicines((prev) =>
        prev.map((m) => {
          const cartMatch = cart.find((c) => c.medicine.id === m.id);
          if (cartMatch) {
            const newStock = Math.max(0, (m.totalStock || 0) - cartMatch.quantity);
            return { ...m, totalStock: newStock };
          }
          return m;
        })
      );

      playSound('checkout_complete');
      setCompletedSale(offlineSale);
      setIsReceiptOpen(true);
      setCart([]);
      setDiscountAmount(0);
      setCustomerName('');
      localStorage.removeItem(POS_ACTIVE_DRAFT_KEY);
      setOfflineNotice('⚡ Offline sale recorded and queued! It will automatically sync once online.');
    };

    if (!isOnline) {
      executeOfflineSale();
      setIsCheckoutProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-4' },
        body: JSON.stringify({
          items: saleItems,
          discount: Number(discountAmount),
          customerName: customerName.trim() || 'Walk-in Customer',
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSound('checkout_complete');
        setCompletedSale(data.data);
        setIsReceiptOpen(true);
        setCart([]);
        setDiscountAmount(0);
        setCustomerName('');
        localStorage.removeItem(POS_ACTIVE_DRAFT_KEY);
        fetchMedicines(); // Refresh stock totals
      } else {
        // Fallback to offline queue if server returned failure
        console.warn('[POS] Online submission failed, switching to offline fallback queue:', data.message);
        executeOfflineSale();
      }
    } catch (err: any) {
      console.warn('[POS] Network error during checkout, executing offline sale:', err);
      executeOfflineSale();
    } finally {
      setIsCheckoutProcessing(false);
    }
  };

  const handlePrintReceiptClick = () => {
    if (completedSale) {
      setIsReceiptOpen(true);
    } else if (cart.length > 0) {
      // Create instant formatted draft invoice for active cart
      const draftSale: Sale = {
        id: `draft-${Date.now()}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        subtotal: subtotal,
        discount: discountAmount,
        tax: 0,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: 'PAID',
        customerName: customerName || 'Walk-in Customer',
        soldBy: 'u-4',
        soldByName: 'Pharmacist Counter Node',
        createdAt: new Date().toISOString(),
        items: cart.map((ci, idx) => ({
          id: `draft-item-${idx}`,
          saleId: `draft-${Date.now()}`,
          batchId: (ci.medicine as any).batches?.[0]?.id || 'b-1',
          medicineId: ci.medicine.id,
          medicineName: ci.medicine.name,
          batchNumber: (ci.medicine as any).batches?.[0]?.batchNumber || 'BATCH-001',
          expiryDate: formatDate(ci.medicine.earliestExpiry),
          quantity: ci.quantity,
          unitPrice: ci.unitPrice,
          discount: ci.discount || 0,
          totalPrice: ci.totalPrice,
        })),
      };
      setCompletedSale(draftSale);
      setIsReceiptOpen(true);
    } else {
      alert('Cart is empty. Please add items or complete a transaction to print a receipt.');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Draft sale management actions
  const handleSaveCurrentCartAsDraft = (label: string) => {
    if (cart.length === 0) return;
    const newDraft: SavedDraftSale = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: label || `Draft Sale #${savedDrafts.length + 1}`,
      customerName: customerName.trim(),
      items: [...cart],
      discountAmount,
      paymentMethod,
      subtotal,
      totalAmount,
      savedAt: new Date().toISOString(),
    };
    const updated = [newDraft, ...savedDrafts];
    setSavedDrafts(updated);
    try {
      localStorage.setItem(POS_SAVED_DRAFTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save draft sales array', e);
    }
    // Clear active cart & active draft key
    setCart([]);
    setCustomerName('');
    setDiscountAmount(0);
    localStorage.removeItem(POS_ACTIVE_DRAFT_KEY);
    playSound('scan_success');
    setDraftStatusText(`Held sale "${newDraft.label}" saved to drafts`);
    setTimeout(() => setDraftStatusText(null), 3500);
  };

  const handleLoadDraft = (draft: SavedDraftSale) => {
    if (cart.length > 0) {
      if (!confirm(`Replace current cart (${cart.length} items) with draft "${draft.label}"?`)) {
        return;
      }
    }
    setCart(draft.items);
    setCustomerName(draft.customerName || '');
    setDiscountAmount(draft.discountAmount || 0);
    setPaymentMethod(draft.paymentMethod || 'CASH');
    playSound('scan_double');
    setDraftStatusText(`Loaded draft "${draft.label}" into cart`);
    setTimeout(() => setDraftStatusText(null), 3500);
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = savedDrafts.filter((d) => d.id !== draftId);
    setSavedDrafts(updated);
    try {
      localStorage.setItem(POS_SAVED_DRAFTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update saved drafts', e);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Clear all items from the current cart?')) {
      setCart([]);
      setCustomerName('');
      setDiscountAmount(0);
      localStorage.removeItem(POS_ACTIVE_DRAFT_KEY);
      playSound('scan_error');
      setDraftStatusText('Cart cleared');
      setTimeout(() => setDraftStatusText(null), 2500);
    }
  };

  // Extract unique categories for quick filter buttons
  const categoriesList = Array.from(
    new Set(medicines.map((m) => m.categoryName).filter(Boolean))
  );

  // Low stock calculation
  const lowStockCount = medicines.filter(
    (m) => (m.totalStock || 0) > 0 && (m.totalStock || 0) <= (m.reorderLevel || 10)
  ).length;

  const outOfStockCount = medicines.filter((m) => (m.totalStock || 0) <= 0).length;

  // Filter medicines
  let filteredMeds = medicines.filter((m) => {
    // Text search
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery) ||
      (m.categoryName && m.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory !== 'ALL' && m.categoryName !== selectedCategory) {
      return false;
    }

    // Stock status filter
    const isLow = (m.totalStock || 0) > 0 && (m.totalStock || 0) <= (m.reorderLevel || 10);
    const inStock = (m.totalStock || 0) > 0;
    if (stockStatusFilter === 'LOW_STOCK' && !isLow) return false;
    if (stockStatusFilter === 'IN_STOCK' && !inStock) return false;

    // Expiry FEFO filter
    if (expiryFilter === 'EXPIRING_90') {
      const days = getDaysUntilExpiry(m.earliestExpiry);
      if (days < 0 || days > 90) return false;
    } else if (expiryFilter === 'EXPIRING_180') {
      const days = getDaysUntilExpiry(m.earliestExpiry);
      if (days <= 90 || days > 180) return false;
    } else if (expiryFilter === 'LONG_EXPIRY') {
      const days = getDaysUntilExpiry(m.earliestExpiry);
      if (days <= 180) return false;
    }

    return true;
  });

  // Sorting for FEFO
  if (expiryFilter === 'FEFO_FIRST') {
    filteredMeds = [...filteredMeds].sort((a, b) => {
      const da = a.earliestExpiry ? new Date(a.earliestExpiry).getTime() : 9999999999999;
      const db = b.earliestExpiry ? new Date(b.earliestExpiry).getTime() : 9999999999999;
      return da - db;
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: MEDICINES LOOKUP, QUICK FILTERS & SCANNER (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Service Worker Connectivity & Offline Status Bar */}
        <div className="rounded-2xl border bg-white p-3.5 shadow-sm border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
              }`}
            >
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isOnline ? 'Online (Live Cloud Sync)' : 'Offline Mode (Service Worker Active)'}
                </span>
                <span className="rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  SW Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {cachedMedsCount > 0
                  ? `${cachedMedsCount} critical medicines cached for offline barcode scanning`
                  : 'Critical inventory data cached in Service Worker'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Offline Activity Log Button */}
            <button
              onClick={() => setIsOfflineLogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              title="View offline transaction audit logs and pending sync queues"
            >
              <ClipboardList className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>Offline Log</span>
              {offlineActivityCount > 0 && (
                <span className="rounded-full bg-teal-100 dark:bg-teal-950 px-1.5 py-0.2 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                  {offlineActivityCount}
                </span>
              )}
            </button>

            {queuedSalesCount > 0 && (
              <button
                onClick={syncNow}
                disabled={isSyncing || !isOnline}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 text-xs font-bold transition shadow-xs disabled:opacity-50"
                title="Synchronize queued offline transactions to database"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : `Sync ${queuedSalesCount} Pending`}</span>
              </button>
            )}

            <button
              onClick={cacheInventoryNow}
              disabled={isCaching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 disabled:opacity-50"
              title="Manually refresh Service Worker cache snapshot of all medicines"
            >
              <Database className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isCaching ? 'Caching...' : 'Pre-cache'}</span>
            </button>
          </div>
        </div>

        {/* Low Stock Warning Banner if items are below reorder level */}
        {lowStockCount > 0 && (
          <div
            onClick={() => setStockStatusFilter(stockStatusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
            className={`rounded-xl border p-2.5 text-xs flex items-center justify-between cursor-pointer transition ${
              stockStatusFilter === 'LOW_STOCK'
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 shrink-0 ${stockStatusFilter === 'LOW_STOCK' ? 'text-white' : 'text-amber-600'}`} />
              <span className="font-bold">
                Reorder Alert: {lowStockCount} {lowStockCount === 1 ? 'medicine' : 'medicines'} below minimum stock threshold!
              </span>
            </div>
            <span className="text-[11px] font-bold underline shrink-0">
              {stockStatusFilter === 'LOW_STOCK' ? 'Clear Filter' : 'Filter Low Stock'}
            </span>
          </div>
        )}

        {/* Offline Notice Banner if active */}
        {offlineNotice && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-200 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{offlineNotice}</span>
            </div>
            <button
              onClick={() => setOfflineNotice(null)}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline dark:text-amber-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Search, Scan & Filters Container */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by medicine name, generic, or scan barcode (Press Enter to quick-add)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onOpenShiftHandover && (
                <button
                  onClick={onOpenShiftHandover}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  title="Cashier Shift Handover & Reconciliation"
                >
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Shift Handover
                </button>
              )}

              <button
                onClick={handlePrintReceiptClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-50 px-3.5 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition shadow-2xs dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
                title="Print formatted thermal invoice receipt"
              >
                <Printer className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Print Receipt
              </button>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm shrink-0"
              >
                <Scan className="h-4 w-4" />
                Barcode Scanner
              </button>
            </div>
          </div>

          {/* Quick Filters Bar (FEFO Expiry, Category, and Stock Status) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Category Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Category:
              </span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({medicines.length})
              </button>
              {categoriesList.map((cat) => {
                const count = medicines.filter((m) => m.categoryName === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* FEFO Expiry & Stock Status Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              {/* Expiry Quick Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  FEFO Expiry:
                </span>
                <button
                  onClick={() => setExpiryFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    expiryFilter === 'ALL'
                      ? 'bg-teal-100 text-teal-900 font-bold dark:bg-teal-950 dark:text-teal-300'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Expiry
                </button>
                <button
                  onClick={() => setExpiryFilter('FEFO_FIRST')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                    expiryFilter === 'FEFO_FIRST'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}
                  title="Sort by nearest expiration date first for strict FEFO compliance"
                >
                  <Clock className="h-3 w-3" />
                  Sort FEFO First
                </button>
                <button
                  onClick={() => setExpiryFilter('EXPIRING_90')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                    expiryFilter === 'EXPIRING_90'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  Expiring Soon (&lt;90d)
                </button>
                <button
                  onClick={() => setExpiryFilter('EXPIRING_180')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    expiryFilter === 'EXPIRING_180'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  3-6 Mos
                </button>
              </div>

              {/* Stock Filter Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStockStatusFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    stockStatusFilter === 'ALL' ? 'text-teal-700 font-bold underline' : 'text-slate-400'
                  }`}
                >
                  All Stock
                </button>
                <button
                  onClick={() => setStockStatusFilter(stockStatusFilter === 'IN_STOCK' ? 'ALL' : 'IN_STOCK')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    stockStatusFilter === 'IN_STOCK'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  In Stock Only
                </button>
                <button
                  onClick={() => setStockStatusFilter(stockStatusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                    stockStatusFilter === 'LOW_STOCK'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Low Stock ({lowStockCount})
                </button>
              </div>
            </div>
          </div>

          {/* Scanner Audio Feedback Bar & Status Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSoundFeedback}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                  soundActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}
                title="Toggle audible scan confirmation beep"
              >
                {soundActive ? (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Scan Beep: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                    <span>Scan Beep: OFF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => playSound('scan_success')}
                className="text-[10.5px] font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 underline underline-offset-2 transition"
              >
                Test Beep
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Showing <strong className="text-slate-700 dark:text-slate-300">{filteredMeds.length}</strong> items
              </span>
              {lastScannedItemName && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate max-w-[180px]">Scanned: {lastScannedItemName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medicines Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
          {filteredMeds.length === 0 ? (
            <div className="sm:col-span-2 py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-6 space-y-2">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No medicines match current search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setExpiryFilter('ALL');
                  setStockStatusFilter('ALL');
                }}
                className="text-teal-600 dark:text-teal-400 underline text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredMeds.map((med) => {
              const inStock = (med.totalStock || 0) > 0;
              const isLowStock = inStock && (med.totalStock || 0) <= (med.reorderLevel || 10);
              const daysToExpiry = getDaysUntilExpiry(med.earliestExpiry);

              return (
                <div
                  key={med.id}
                  onClick={() => inStock && addMedicineToCart(med)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                    !inStock
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed dark:bg-slate-950 dark:border-slate-800'
                      : isLowStock
                      ? 'bg-amber-50/20 border-amber-300 hover:border-amber-500 hover:shadow-md dark:bg-amber-950/10 dark:border-amber-800/80'
                      : 'bg-white border-slate-200/80 hover:border-teal-500 hover:shadow-md dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Header Badges: Category, Low Stock Warning & Stock Pill */}
                    <div className="flex justify-between items-start gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                        {med.categoryName || 'General'}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* QR Code Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedForQr(med);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition"
                          title="Generate & View QR Code for POS Scanner"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !inStock
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {inStock ? `${med.totalStock} in stock` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Low Stock Reorder Point Alert Badge */}
                    {isLowStock && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-100/90 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 animate-pulse">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                        <span>Low Stock Alert ({med.totalStock} left • Reorder point: {med.reorderLevel})</span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm dark:text-white leading-tight group-hover:text-teal-600 transition">
                        {med.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 italic">
                        {med.genericName} {med.strength && `(${med.strength})`}
                      </p>
                    </div>

                    {/* Expiry / FEFO Indicator */}
                    {med.earliestExpiry && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            daysToExpiry <= 90
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : daysToExpiry <= 180
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          Exp: {formatDate(med.earliestExpiry)} ({daysToExpiry}d)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                    <span className="font-mono text-[10px] text-slate-400">Barcode: {med.barcode}</span>
                    <span className="font-extrabold text-teal-700 text-sm dark:text-teal-400">
                      {formatCurrency(med.sellingPrice || 0)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: POS SHOPPING CART & FEFO BREAKDOWN (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base dark:text-white leading-none">
                Counter Cart ({cart.length})
              </h3>
              {cart.length > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-saved Draft
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Saved Drafts / Held Carts Drawer button */}
            <button
              onClick={() => setIsDraftModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold transition dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
              title="View held and saved draft sales"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-600" />
              <span>Drafts</span>
              {savedDrafts.length > 0 && (
                <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.2 text-[10px] font-mono">
                  {savedDrafts.length}
                </span>
              )}
            </button>

            {/* Hold Current Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={() => setIsDraftModalOpen(true)}
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-semibold transition dark:bg-slate-800 dark:text-slate-300"
                title="Hold / Save current cart as a draft"
              >
                <Save className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hold</span>
              </button>
            )}

            {/* Clear Cart Button */}
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition dark:hover:bg-rose-950/60"
                title="Clear all cart items"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full dark:bg-teal-950 dark:text-teal-300">
              FEFO
            </span>
          </div>
        </div>

        {/* Draft Notice / Restored banner if active */}
        {draftStatusText && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/90 p-2.5 text-xs text-teal-900 dark:border-teal-800 dark:bg-teal-950/70 dark:text-teal-200 flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-medium">
              <Bookmark className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>{draftStatusText}</span>
            </div>
            <button
              onClick={() => setDraftStatusText(null)}
              className="text-[10px] font-bold text-teal-700 hover:text-teal-900 underline dark:text-teal-300"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Cart Line Items */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
              Cart is empty. Click medicines, quick-filter, or scan barcode to add items.
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {cart.map((item, idx) => (
                <motion.div
                  key={item.medicine.id || `cart-${idx}`}
                  layout
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs dark:bg-slate-950 dark:border-slate-800"
                >
                  <div className="space-y-0.5 flex-1 pr-2">
                    <span className="font-bold text-slate-900 dark:text-white block">{item.medicine.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Unit: {formatCurrency(item.unitPrice)} • Exp: {formatDate(item.medicine.earliestExpiry)}
                    </span>
                  </div>

                  {/* Quantity Buttons */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 dark:bg-slate-900 dark:border-slate-800">
                    <button
                      onClick={() => updateCartQty(idx, -1)}
                      className="text-slate-500 hover:text-slate-900 font-bold px-1 transition active:scale-90"
                    >
                      -
                    </button>
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 1.25, color: '#0d9488' }}
                      animate={{ scale: 1, color: 'inherit' }}
                      transition={{ duration: 0.18 }}
                      className="font-bold text-slate-900 text-xs px-1 dark:text-white inline-block"
                    >
                      {item.quantity}
                    </motion.span>
                    <button
                      onClick={() => updateCartQty(idx, 1)}
                      className="text-slate-500 hover:text-slate-900 font-bold px-1 transition active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right pl-3">
                    <motion.span
                      key={item.totalPrice}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="font-bold text-teal-700 text-xs block dark:text-teal-400"
                    >
                      {formatCurrency(item.totalPrice)}
                    </motion.span>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-rose-500 hover:text-rose-700 transition active:scale-90"
                      title="Remove item from cart"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Customer & Payment Method Selector */}
        {cart.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1 dark:text-slate-400">Customer Name (Optional)</label>
              <input
                type="text"
                placeholder="Walk-in Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-600 block mb-1 dark:text-slate-400">Discount (ETB)</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1 dark:text-slate-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">Mobile Money (Telebirr / CBE)</option>
                  <option value="CARD">Bank Card / POS Terminal</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 dark:bg-slate-950 dark:border-slate-800">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-slate-900 pt-2 border-t border-slate-200 dark:border-slate-800 dark:text-white">
                <span>Total Amount:</span>
                <span className="text-teal-700 dark:text-teal-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Complete Sale & Print Action Buttons */}
            <div className="space-y-2">
              <button
                disabled={isCheckoutProcessing}
                onClick={handleCheckoutSubmit}
                className="w-full rounded-xl bg-teal-600 py-3.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCheckoutProcessing ? 'Processing Sale...' : `COMPLETE SALE (${formatCurrency(totalAmount)})`}
              </button>

              <button
                onClick={handlePrintReceiptClick}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 flex items-center justify-center gap-2"
              >
                <Printer className="h-3.5 w-3.5 text-teal-600" />
                Print Cart Receipt Invoice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        knownMedicines={medicines}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />

      {/* Offline Activity Log Modal */}
      <OfflineActivityLogModal
        isOpen={isOfflineLogOpen}
        onClose={() => setIsOfflineLogOpen(false)}
        isOnline={isOnline}
      />

      {/* Medicine QR Code & Shelf Label Modal */}
      <MedicineQrCodeModal
        isOpen={!!selectedMedForQr}
        onClose={() => setSelectedMedForQr(null)}
        medicine={selectedMedForQr}
      />

      {/* Held & Saved Draft Sales Modal */}
      <DraftSalesModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        drafts={savedDrafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onSaveCurrentCart={handleSaveCurrentCartAsDraft}
        currentCartCount={cart.length}
      />
    </div>
  );
};
