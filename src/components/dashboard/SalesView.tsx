import React, { useState, useEffect } from 'react';
import { Sale } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Search,
  FileText,
  Printer,
  RefreshCw,
  Globe,
  RotateCcw,
  Truck,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

interface SalesViewProps {
  initialSubTab?: 'all_sales' | 'online_orders' | 'sales_returns';
}

export const SalesView: React.FC<SalesViewProps> = ({ initialSubTab = 'all_sales' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all_sales' | 'online_orders' | 'sales_returns'>(initialSubTab);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Online Orders State
  const [onlineOrders, setOnlineOrders] = useState([
    {
      id: 'ORD-8821',
      customerName: 'Abebe Bikila',
      phone: '+251 91 123 4567',
      address: 'Bole Sub City, Woreda 03, House #124, Addis Ababa',
      itemsSummary: 'Amoxicillin 500mg, Paracetamol Syrup, Vitamin C',
      totalAmount: 480.0,
      paymentStatus: 'PAID (Telebirr)',
      orderStatus: 'PENDING',
      orderDate: '2026-08-12 10:15 AM',
      prescriptionUrl: true,
    },
    {
      id: 'ORD-8822',
      customerName: 'Tigist Assefa',
      phone: '+251 92 888 9900',
      address: 'Kazanchis Near UNECA, Addis Ababa',
      itemsSummary: 'Metformin 500mg (100 Tabs)',
      totalAmount: 350.0,
      paymentStatus: 'PAID (CBE Birr)',
      orderStatus: 'DISPATCHED',
      orderDate: '2026-08-12 09:30 AM',
      prescriptionUrl: true,
    },
    {
      id: 'ORD-8820',
      customerName: 'Mewael Alemu',
      phone: '+251 93 456 7890',
      address: 'Piassa Churchill Avenue, Addis Ababa',
      itemsSummary: 'Omeprazole 20mg, Ibuprofen 400mg',
      totalAmount: 220.0,
      paymentStatus: 'CASH ON DELIVERY',
      orderStatus: 'DELIVERED',
      orderDate: '2026-08-11 04:45 PM',
      prescriptionUrl: false,
    },
  ]);

  // Sales Returns State
  const [salesReturns, setSalesReturns] = useState([
    {
      id: 'RET-101',
      invoiceNumber: 'INV-2026-0801',
      customerName: 'Kaleb Tadesse',
      itemsReturned: 'Cetirizine 10mg (1 Box)',
      refundAmount: 140.0,
      refundMethod: 'CASH',
      reason: 'Wrong Dosage Prescribed by Doctor',
      returnDate: '2026-08-11 02:10 PM',
      processedBy: 'Pharmacist Selam',
    },
    {
      id: 'RET-102',
      invoiceNumber: 'INV-2026-0789',
      customerName: 'Walk-in Customer',
      itemsReturned: 'Digital Thermometer (1 Unit)',
      refundAmount: 450.0,
      refundMethod: 'Telebirr',
      reason: 'Defective Display Screen',
      returnDate: '2026-08-10 11:25 AM',
      processedBy: 'Store Admin',
    },
  ]);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({
    invoiceNumber: '',
    customerName: '',
    itemsReturned: '',
    refundAmount: '',
    refundMethod: 'CASH',
    reason: '',
  });

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) {
        setSales(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    setOnlineOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: newStatus } : ord))
    );
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.invoiceNumber || !returnForm.refundAmount) return;

    const newRet = {
      id: `RET-${Date.now().toString().slice(-3)}`,
      invoiceNumber: returnForm.invoiceNumber,
      customerName: returnForm.customerName || 'Walk-in Customer',
      itemsReturned: returnForm.itemsReturned || 'Returned Drug Items',
      refundAmount: parseFloat(returnForm.refundAmount) || 0,
      refundMethod: returnForm.refundMethod,
      reason: returnForm.reason || 'Customer Return',
      returnDate: new Date().toLocaleString(),
      processedBy: 'Current User',
    };

    setSalesReturns([newRet, ...salesReturns]);
    setIsReturnModalOpen(false);
    setReturnForm({
      invoiceNumber: '',
      customerName: '',
      itemsReturned: '',
      refundAmount: '',
      refundMethod: 'CASH',
      reason: '',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('all_sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'all_sales'
              ? 'bg-[#006cb7] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>All Sales ({sales.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('online_orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'online_orders'
              ? 'bg-[#006cb7] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Online Orders ({onlineOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sales_returns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'sales_returns'
              ? 'bg-[#006cb7] text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Sales Returns & Refunds ({salesReturns.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL SALES HISTORY */}
      {activeSubTab === 'all_sales' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-[#006cb7] focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <button
              onClick={fetchSalesHistory}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh History
            </button>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Date / Time</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items Sold</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5 text-right">Total Paid</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No sales invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition dark:hover:bg-slate-950/50">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                          {sale.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                          {sale.customerName || 'Walk-in Customer'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                          {sale.items.length} line items
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-lg bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-[#006cb7] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsReceiptOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-[#006cb7] hover:text-white transition dark:bg-slate-800 dark:text-slate-300"
                          >
                            <Printer className="h-3.5 w-3.5" /> View Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ONLINE ORDERS */}
      {activeSubTab === 'online_orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#006cb7]" />
                <span>Web & Mobile Portal E-Pharmacy Orders</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage prescription verification, fulfillment, and home delivery dispatches.
              </p>
            </div>
            <span className="bg-sky-50 text-[#006cb7] border border-sky-200 font-bold text-xs px-3 py-1 rounded-full">
              {onlineOrders.length} Total Orders
            </span>
          </div>

          <div className="space-y-3">
            {onlineOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 dark:bg-slate-800/50 dark:border-slate-700"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm dark:text-white">{ord.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ord.orderStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : ord.orderStatus === 'DISPATCHED'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                    {ord.prescriptionUrl && (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                        Prescription Attached
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Customer: {ord.customerName} • {ord.phone}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{ord.address}</p>
                  <p className="text-[11px] text-slate-600 font-medium dark:text-slate-300">
                    Items: <span className="text-slate-900 dark:text-white font-bold">{ord.itemsSummary}</span>
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block">{ord.orderDate}</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                    <span className="text-[10px] block text-slate-500 font-semibold">{ord.paymentStatus}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.orderStatus === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'DISPATCHED')}
                        className="px-3 py-1.5 rounded-lg bg-[#006cb7] hover:bg-sky-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Truck className="h-3.5 w-3.5" /> Dispatch Order
                      </button>
                    )}
                    {ord.orderStatus === 'DISPATCHED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered
                      </button>
                    )}
                    {ord.orderStatus === 'DELIVERED' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SALES RETURNS & REFUNDS */}
      {activeSubTab === 'sales_returns' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                <span>Sales Returns & Refund Processing</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log customer medicine returns, restore stock to inventory, and process cash or mobile refunds.
              </p>
            </div>

            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="h-4 w-4" /> Process New Return
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">RETURN ID</th>
                  <th className="px-4 py-3">ORIGINAL INVOICE</th>
                  <th className="px-4 py-3">CUSTOMER</th>
                  <th className="px-4 py-3">ITEMS RETURNED</th>
                  <th className="px-4 py-3">RETURN REASON</th>
                  <th className="px-4 py-3 text-right">REFUND AMOUNT</th>
                  <th className="px-4 py-3">METHOD</th>
                  <th className="px-4 py-3">PROCESSED BY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{ret.id}</td>
                    <td className="px-4 py-3 font-mono text-[#006cb7] font-semibold">{ret.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{ret.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{ret.itemsReturned}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs">{ret.reason}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                        {ret.refundMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{ret.processedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROCESS RETURN MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-600" /> Process Customer Return & Refund
              </h3>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Original Invoice Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-0801"
                  value={returnForm.invoiceNumber}
                  onChange={(e) => setReturnForm({ ...returnForm, invoiceNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Optional or Walk-in"
                  value={returnForm.customerName}
                  onChange={(e) => setReturnForm({ ...returnForm, customerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Returned Items & Quantity</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg (1 Box)"
                  value={returnForm.itemsReturned}
                  onChange={(e) => setReturnForm({ ...returnForm, itemsReturned: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Refund Amount (ETB) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={returnForm.refundAmount}
                    onChange={(e) => setReturnForm({ ...returnForm, refundAmount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Refund Method</label>
                  <select
                    value={returnForm.refundMethod}
                    onChange={(e) => setReturnForm({ ...returnForm, refundMethod: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="CASH">CASH</option>
                    <option value="Telebirr">Telebirr</option>
                    <option value="CBE Birr">CBE Birr</option>
                    <option value="STORE CREDIT">STORE CREDIT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Reason for Return</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Damaged packaging, wrong formulation prescribed"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs"
                >
                  Submit & Process Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
};

