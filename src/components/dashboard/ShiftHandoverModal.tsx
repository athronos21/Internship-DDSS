import React, { useState, useEffect, useMemo } from 'react';
import { User, Sale, PaymentMethod } from '../../types';
import { formatCurrency, formatDateTime, formatDate } from '../../utils/formatters';
import {
  Clock,
  DollarSign,
  Banknote,
  Smartphone,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  X,
  Users,
  Send,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  availableUsers: User[];
  onSwitchUser?: (newUser: User) => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSwitchUser,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Shift state
  const [shiftStartTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0); // Default to today 8:00 AM
    return d.toISOString();
  });
  
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [countedCash, setCountedCash] = useState<string>('2000');
  const [incomingUserId, setIncomingUserId] = useState<string>('');
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [cashierPin, setCashierPin] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [handoverSuccess, setHandoverSuccess] = useState<boolean>(false);

  // Pending inventory requests during shift
  const [pendingRequests] = useState([
    {
      id: 'REQ-901',
      date: '10:30 AM',
      branch: 'Bole Sub-Branch',
      items: 'Omeprazole 20mg (10 Boxes), Insulin (5 Vials)',
      urgency: 'HIGH',
      status: 'PENDING_APPROVAL',
    },
    {
      id: 'REQ-904',
      date: '01:15 PM',
      branch: 'Prescription Dispensary Counter',
      items: 'Amoxicillin 500mg (15 Boxes)',
      urgency: 'NORMAL',
      status: 'AWAITING_STOCK',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      fetchShiftSales();
      // Set default incoming user (first user not current)
      const otherUser = availableUsers.find((u) => u.id !== currentUser?.id);
      if (otherUser) setIncomingUserId(otherUser.id);
    }
  }, [isOpen, currentUser, availableUsers]);

  const fetchShiftSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSales(data.data);
      }
    } catch (e) {
      console.error('Failed to load shift sales', e);
    } finally {
      setLoading(false);
    }
  };

  // Compute shift financial breakdown
  const shiftMetrics = useMemo(() => {
    let totalSalesAmount = 0;
    let cashSalesAmount = 0;
    let telebirrAmount = 0;
    let telebirrCount = 0;
    let cbeAmount = 0;
    let cbeCount = 0;
    let cardAmount = 0;
    let cardCount = 0;
    let cashTxCount = 0;
    let itemsSoldMap: Record<string, { name: string; qty: number; total: number }> = {};

    sales.forEach((s) => {
      totalSalesAmount += s.totalAmount || 0;
      
      if (s.paymentMethod === 'CASH') {
        cashSalesAmount += s.totalAmount || 0;
        cashTxCount++;
      } else if (s.paymentMethod === 'MOBILE_MONEY' || (s.paymentMethod as string) === 'TELEBIRR') {
        telebirrAmount += s.totalAmount || 0;
        telebirrCount++;
      } else if (s.paymentMethod === 'BANK_TRANSFER' || (s.paymentMethod as string) === 'CBE_TRANSFER') {
        cbeAmount += s.totalAmount || 0;
        cbeCount++;
      } else if (s.paymentMethod === 'CARD') {
        cardAmount += s.totalAmount || 0;
        cardCount++;
      } else {
        // Fallback or split
        cashSalesAmount += s.totalAmount || 0;
        cashTxCount++;
      }

      // Track top items
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach((item) => {
          const medId = item.medicineId || item.medicineName;
          if (!itemsSoldMap[medId]) {
            itemsSoldMap[medId] = {
              name: item.medicineName || 'Medicine',
              qty: 0,
              total: 0,
            };
          }
          itemsSoldMap[medId].qty += item.quantity || 1;
          itemsSoldMap[medId].total += item.totalPrice || 0;
        });
      }
    });

    const expectedCashInDrawer = openingFloat + cashSalesAmount;
    const countedNumber = parseFloat(countedCash) || 0;
    const cashDiscrepancy = countedNumber - expectedCashInDrawer;

    const topItems = Object.values(itemsSoldMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalSalesCount: sales.length,
      totalSalesAmount,
      cashSalesAmount,
      cashTxCount,
      telebirrAmount,
      telebirrCount,
      cbeAmount,
      cbeCount,
      cardAmount,
      cardCount,
      expectedCashInDrawer,
      cashDiscrepancy,
      topItems,
    };
  }, [sales, openingFloat, countedCash]);

  // Set default counted cash once sales load
  useEffect(() => {
    if (sales.length > 0 && countedCash === '2000') {
      setCountedCash(shiftMetrics.expectedCashInDrawer.toString());
    }
  }, [sales, shiftMetrics.expectedCashInDrawer]);

  const handlePrintHandoverReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the shift handover report.');
      return;
    }

    const incomingUser = availableUsers.find((u) => u.id === incomingUserId);
    const countedVal = parseFloat(countedCash) || 0;
    const discrepancyStr =
      shiftMetrics.cashDiscrepancy === 0
        ? 'EXACT (0.00 ETB)'
        : shiftMetrics.cashDiscrepancy > 0
        ? `+${formatCurrency(shiftMetrics.cashDiscrepancy)} (OVER)`
        : `${formatCurrency(shiftMetrics.cashDiscrepancy)} (SHORT)`;

    const styles = `
      @page { size: 80mm auto; margin: 3mm; }
      body { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #000; margin: 0; padding: 6px; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
      .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
      .double-divider { border-bottom: 2px solid #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; margin: 3px 0; }
      .section-title { font-weight: bold; margin-top: 8px; margin-bottom: 4px; text-transform: uppercase; }
      .sig-box { margin-top: 20px; border-top: 1px solid #000; padding-top: 4px; text-align: center; }
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shift Handover Report - Kaziniya Drug Store</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="text-center font-bold" style="font-size: 14px;">KAZINIYA DRUG STORE</div>
          <div class="text-center" style="font-size: 10px;">CASHIER SHIFT HANDOVER REPORT</div>
          <div class="text-center" style="font-size: 10px;">Date: ${formatDateTime(new Date().toISOString())}</div>
          <div class="double-divider"></div>

          <div class="row"><span>Outgoing Staff:</span><span class="font-bold">${currentUser?.name || 'Cashier'}</span></div>
          <div class="row"><span>Role / ID:</span><span>${currentUser?.role || 'CASHIER'} (${currentUser?.employeeId || 'KZN-01'})</span></div>
          <div class="row"><span>Shift Started:</span><span>${formatDateTime(shiftStartTime)}</span></div>
          <div class="row"><span>Shift Ended:</span><span>${formatDateTime(new Date().toISOString())}</span></div>
          <div class="row"><span>Incoming Staff:</span><span class="font-bold">${incomingUser?.name || 'Incoming Cashier'}</span></div>

          <div class="divider"></div>
          <div class="section-title">REVENUE & REGISTER RECONCILIATION</div>

          <div class="row"><span>Opening Float:</span><span>${formatCurrency(openingFloat)}</span></div>
          <div class="row font-bold"><span>Total Sales (${shiftMetrics.totalSalesCount} Tx):</span><span>${formatCurrency(shiftMetrics.totalSalesAmount)}</span></div>
          
          <div class="divider"></div>
          <div class="row"><span>• Cash Collected:</span><span>${formatCurrency(shiftMetrics.cashSalesAmount)}</span></div>
          <div class="row"><span>• Telebirr (${shiftMetrics.telebirrCount} Tx):</span><span>${formatCurrency(shiftMetrics.telebirrAmount)}</span></div>
          <div class="row"><span>• CBE Transfer (${shiftMetrics.cbeCount} Tx):</span><span>${formatCurrency(shiftMetrics.cbeAmount)}</span></div>
          <div class="row"><span>• Card / POS (${shiftMetrics.cardCount} Tx):</span><span>${formatCurrency(shiftMetrics.cardAmount)}</span></div>

          <div class="divider"></div>
          <div class="row font-bold"><span>EXPECTED CASH IN DRAWER:</span><span>${formatCurrency(shiftMetrics.expectedCashInDrawer)}</span></div>
          <div class="row font-bold"><span>COUNTED PHYSICAL CASH:</span><span>${formatCurrency(countedVal)}</span></div>
          <div class="row font-bold"><span>REGISTER DISCREPANCY:</span><span>${discrepancyStr}</span></div>

          <div class="divider"></div>
          <div class="section-title">PENDING STORE REQUISITIONS (${pendingRequests.length})</div>
          ${pendingRequests
            .map((r) => `<div class="row"><span>${r.branch}</span><span class="font-bold">${r.status}</span></div>`)
            .join('')}

          ${
            handoverNotes
              ? `<div class="divider"></div><div class="section-title">HANDOVER NOTES</div><div>${handoverNotes}</div>`
              : ''
          }

          <div class="double-divider"></div>
          <div style="display: flex; gap: 15px; margin-top: 15px;">
            <div style="flex: 1;" class="sig-box">Outgoing Cashier</div>
            <div style="flex: 1;" class="sig-box">Incoming Cashier</div>
          </div>
          <div class="text-center" style="font-size: 9px; margin-top: 15px;">Verified by Kaziniya Security & Audit Trail</div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleCompleteHandover = async () => {
    const incomingUser = availableUsers.find((u) => u.id === incomingUserId);
    if (!incomingUser) {
      alert('Please select an incoming staff member.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Record handover event in backend
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser?.id || 'u-4' },
        body: JSON.stringify({
          action: 'SHIFT_HANDOVER',
          entityType: 'USER_SESSION',
          entityId: currentUser?.id || 'u-4',
          newData: {
            outgoingUser: currentUser?.name,
            incomingUser: incomingUser.name,
            totalSales: shiftMetrics.totalSalesAmount,
            cashCollected: shiftMetrics.cashSalesAmount,
            telebirrAmount: shiftMetrics.telebirrAmount,
            cbeAmount: shiftMetrics.cbeAmount,
            expectedCash: shiftMetrics.expectedCashInDrawer,
            countedCash: parseFloat(countedCash) || 0,
            discrepancy: shiftMetrics.cashDiscrepancy,
            notes: handoverNotes,
          },
        }),
      });

      setHandoverSuccess(true);
      setTimeout(() => {
        if (onSwitchUser) {
          onSwitchUser(incomingUser);
        }
        onClose();
      }, 1500);
    } catch (e: any) {
      alert('Handover error: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-teal-600 text-white shadow-md">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">
                  Cashier Shift Handover & Reconciliation
                </h3>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-amber-950 dark:text-amber-300">
                  ACTIVE SESSION
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit cash register drawer, verify electronic payments, and hand over session to incoming staff.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* CURRENT CASHIER SESSION CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'CS'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Staff</span>
                <h4 className="font-bold text-slate-900 text-sm dark:text-white">{currentUser?.name || 'Cashier Hana'}</h4>
                <p className="text-xs text-slate-500">{currentUser?.role || 'CASHIER'} • {currentUser?.employeeId || 'KZN-CSH-004'}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shift Window</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-teal-600" />
                <span>Today from 08:00 AM</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Active Duration: ~7h 45m</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Register Counter</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Main Store - POS Counter #1</span>
              </div>
              <p className="text-[11px] text-slate-500">Terminal: POS-TER-01</p>
            </div>
          </div>

          {/* FINANCIAL SUMMARY CARDS */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Session Payment Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* CASH COLLECTED */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cash Sales</span>
                  <Banknote className="h-4 w-4" />
                </div>
                <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
                  {formatCurrency(shiftMetrics.cashSalesAmount)}
                </p>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {shiftMetrics.cashTxCount} Cash Transactions
                </span>
              </div>

              {/* TELEBIRR / MOBILE MONEY */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800">
                <div className="flex items-center justify-between text-sky-800 dark:text-sky-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Telebirr Merchant</span>
                  <Smartphone className="h-4 w-4" />
                </div>
                <p className="text-xl font-black text-sky-950 dark:text-sky-100 mt-1">
                  {formatCurrency(shiftMetrics.telebirrAmount)}
                </p>
                <span className="text-[10px] text-sky-700 dark:text-sky-400">
                  {shiftMetrics.telebirrCount} QR Payments
                </span>
              </div>

              {/* CBE DIRECT BANK */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800">
                <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider">CBE Transfers</span>
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-xl font-black text-indigo-950 dark:text-indigo-100 mt-1">
                  {formatCurrency(shiftMetrics.cbeAmount)}
                </p>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400">
                  {shiftMetrics.cbeCount} Bank Receipts
                </span>
              </div>

              {/* TOTAL GROSS SALES */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800">
                <div className="flex items-center justify-between text-teal-800 dark:text-teal-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Gross Shift Total</span>
                  <Receipt className="h-4 w-4" />
                </div>
                <p className="text-xl font-black text-teal-950 dark:text-teal-100 mt-1">
                  {formatCurrency(shiftMetrics.totalSalesAmount)}
                </p>
                <span className="text-[10px] text-teal-700 dark:text-teal-400">
                  {shiftMetrics.totalSalesCount} Total Orders
                </span>
              </div>
            </div>
          </div>

          {/* PHYSICAL CASH DRAWER RECONCILIATION */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-teal-600" />
              <span>Physical Cash Drawer Count & Variance</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                  Opening Float (ETB)
                </label>
                <input
                  type="number"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
                <span className="text-[10px] text-slate-400">Initial change in till</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                  Expected Cash In Till
                </label>
                <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  {formatCurrency(shiftMetrics.expectedCashInDrawer)}
                </div>
                <span className="text-[10px] text-slate-400">Float + Cash Sales</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                  Counted Physical Cash (ETB) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  className="w-full rounded-xl border-2 border-teal-500 bg-white px-3 py-2 text-xs font-extrabold text-teal-900 focus:outline-none dark:bg-slate-900 dark:text-teal-200"
                />
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Enter actual cash in drawer</span>
              </div>
            </div>

            {/* VARIANCE STATUS BANNER */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                shiftMetrics.cashDiscrepancy === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : shiftMetrics.cashDiscrepancy > 0
                  ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {shiftMetrics.cashDiscrepancy === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                )}
                <span>
                  Drawer Status:{' '}
                  {shiftMetrics.cashDiscrepancy === 0
                    ? 'Perfect Match (Zero Discrepancy)'
                    : shiftMetrics.cashDiscrepancy > 0
                    ? `Over by ${formatCurrency(shiftMetrics.cashDiscrepancy)}`
                    : `Short by ${formatCurrency(Math.abs(shiftMetrics.cashDiscrepancy))}`}
                </span>
              </div>

              <span className="font-mono text-xs">
                Variance: {shiftMetrics.cashDiscrepancy > 0 ? `+${shiftMetrics.cashDiscrepancy.toFixed(2)}` : shiftMetrics.cashDiscrepancy.toFixed(2)} ETB
              </span>
            </div>
          </div>

          {/* PENDING INVENTORY REQUISITIONS & TOP SELLERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PENDING REQUESTS */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-xs dark:text-white flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pending Inventory Requests ({pendingRequests.length})</span>
                </h5>
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                  Action for Next Staff
                </span>
              </div>

              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{req.branch}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {req.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{req.items}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP DISPENSED MEDICINES */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <h5 className="font-bold text-slate-900 text-xs dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Top Medicines Dispensed This Shift</span>
              </h5>

              <div className="space-y-2">
                {shiftMetrics.topItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-teal-700 dark:text-teal-400">{item.qty} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* INCOMING STAFF & HANDOVER NOTES */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Shift Handover Handshake</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                  Select Incoming Staff Member *
                </label>
                <select
                  value={incomingUserId}
                  onChange={(e) => setIncomingUserId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                >
                  {availableUsers
                    .filter((u) => u.id !== currentUser?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role} - {u.employeeId || 'ID'})
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-400">Session will transition to this account</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                  Authorizing Security PIN (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  value={cashierPin}
                  onChange={(e) => setCashierPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1 dark:text-slate-400">
                Notes for Incoming Pharmacist / Key Customer Pickups
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Dispensed Prescription #104, customer will return at 5:00 PM for remaining vials. Need more 50-Birr cash change."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* SUCCESS BANNER */}
          {handoverSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Shift Handover Completed!</h4>
                <p className="text-xs">Audit log recorded. Switching active session to incoming staff...</p>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 gap-3">
          <button
            type="button"
            onClick={handlePrintHandoverReceipt}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            <Printer className="h-4 w-4 text-teal-600" />
            <span>Print Shift Audit Slip (80mm)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Keep Session Open
            </button>

            <button
              type="button"
              onClick={handleCompleteHandover}
              disabled={isSubmitting || handoverSuccess}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Recording Handover...</span>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Complete Handover & Switch Cashier</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
