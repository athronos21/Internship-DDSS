import React, { useState, useEffect } from 'react';
import { Purchase, Supplier, Medicine, User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { safeFetchJson } from '../../utils/api';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  FileText,
  FileCheck,
  Receipt,
  Banknote,
  RotateCcw,
  PieChart,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Activity,
  Boxes,
  ArrowUpRight,
  PackageCheck,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface PurchasesViewProps {
  currentUser?: User | null;
  initialSubTab?: 'suppliers' | 'purchase_orders' | 'goods_receipts' | 'purchase_invoices' | 'supplier_payments' | 'purchase_returns' | 'ap_dashboard';
  autoOpenAddSupplierModal?: boolean;
  autoOpenNewPOModal?: boolean;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  currentUser,
  initialSubTab = 'purchase_orders',
  autoOpenAddSupplierModal = false,
  autoOpenNewPOModal = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'purchase_orders' | 'goods_receipts' | 'purchase_invoices' | 'supplier_payments' | 'purchase_returns' | 'ap_dashboard'>(initialSubTab);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(autoOpenNewPOModal);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(autoOpenAddSupplierModal);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Analytics Datasets for Procurement & Supplier Intelligence
  const monthlyProcurementTrend = [
    { month: 'May 2026', spend: 42000, batches: 14, orders: 8 },
    { month: 'Jun 2026', spend: 58500, batches: 19, orders: 12 },
    { month: 'Jul 2026', spend: 64200, batches: 22, orders: 15 },
    { month: 'Aug 2026', spend: 78000, batches: 27, orders: 18 },
    { month: 'Sep 2026', spend: 61800, batches: 21, orders: 14 },
    { month: 'Oct 2026', spend: 89500, batches: 32, orders: 21 },
  ];

  const supplierPerformanceData = [
    {
      name: 'MedPharm Ltd',
      fullName: 'MedPharm Wholesale Ltd',
      license: 'EFDA/LIC/2024/0912',
      spend: 145000,
      batches: 28,
      onTimeRate: 98.6,
      leadTimeDays: 1.4,
      efdaCompliance: 100,
      color: '#0d9488',
    },
    {
      name: 'Global Health',
      fullName: 'Global Health Supplies PLC',
      license: 'EFDA/LIC/2023/1844',
      spend: 118500,
      batches: 22,
      onTimeRate: 96.4,
      leadTimeDays: 2.1,
      efdaCompliance: 99.5,
      color: '#0284c7',
    },
    {
      name: 'East Africa Dist',
      fullName: 'East Africa Pharma Distributors',
      license: 'EFDA/LIC/2025/0022',
      spend: 85000,
      batches: 15,
      onTimeRate: 99.2,
      leadTimeDays: 1.8,
      efdaCompliance: 100,
      color: '#6366f1',
    },
  ];

  const apAgingChartData = [
    { bracket: '0-30 Days (Current)', amount: 25000, color: '#10b981', note: 'Within Net 30 Terms' },
    { bracket: '31-60 Days (Aging)', amount: 32000, color: '#f59e0b', note: 'Immediate Settlement Due' },
    { bracket: '61-90 Days', amount: 0, color: '#64748b', note: 'Zero Overdue' },
    { bracket: '>90 Days Delinquent', amount: 0, color: '#94a3b8', note: 'Clean Audit Record' },
  ];

  // Mock Goods Receipts (GRN)
  const [goodsReceipts, setGoodsReceipts] = useState([
    {
      grnNumber: 'GRN-2026-081',
      poNumber: 'SUP-INV-8841',
      supplierName: 'EPharm Wholesale Distributor',
      receivedDate: '2026-08-11',
      inspectorName: 'Chief Inspector Robel',
      itemsCount: 1200,
      inspectionStatus: 'PASSED_EFDA_SEALED',
      batchVerified: true,
    },
    {
      grnNumber: 'GRN-2026-082',
      poNumber: 'SUP-INV-9012',
      supplierName: 'Cadila Pharmaceuticals Ethiopia',
      receivedDate: '2026-08-09',
      inspectorName: 'Quality Lead Tigist',
      itemsCount: 500,
      inspectionStatus: 'PASSED_EFDA_SEALED',
      batchVerified: true,
    },
  ]);

  // Mock Purchase Invoices
  const [purchaseInvoices, setPurchaseInvoices] = useState([
    {
      id: 'INV-2026-101',
      poNumber: 'SUP-INV-8841',
      supplierName: 'EPharm Wholesale Distributor',
      invoiceDate: '2026-08-10',
      dueDate: '2026-09-09',
      totalAmount: 45000,
      paidAmount: 20000,
      status: 'PARTIALLY_PAID',
      terms: 'Net 30',
    },
    {
      id: 'INV-2026-102',
      poNumber: 'SUP-INV-9012',
      supplierName: 'Cadila Pharmaceuticals Ethiopia',
      invoiceDate: '2026-08-08',
      dueDate: '2026-09-07',
      totalAmount: 18500,
      paidAmount: 18500,
      status: 'FULLY_PAID',
      terms: 'Net 30',
    },
    {
      id: 'INV-2026-103',
      poNumber: 'SUP-INV-7104',
      supplierName: 'East Africa Pharmaceuticals',
      invoiceDate: '2026-07-25',
      dueDate: '2026-08-24',
      totalAmount: 32000,
      paidAmount: 0,
      status: 'UNPAID',
      terms: 'Net 30',
    },
  ]);

  // Mock Supplier Payments
  const [supplierPayments, setSupplierPayments] = useState([
    {
      voucherNo: 'PMT-2026-501',
      supplierName: 'Cadila Pharmaceuticals Ethiopia',
      paymentDate: '2026-08-09',
      method: 'CBE Direct Transfer',
      refNo: 'CBE-TX-998124',
      amount: 18500,
      paidBy: 'Accountant Worku',
    },
    {
      voucherNo: 'PMT-2026-502',
      supplierName: 'EPharm Wholesale Distributor',
      paymentDate: '2026-08-10',
      method: 'Telebirr Merchant',
      refNo: 'TB-MER-441209',
      amount: 20000,
      paidBy: 'Accountant Worku',
    },
  ]);

  // Mock Purchase Returns
  const [purchaseReturns, setPurchaseReturns] = useState([
    {
      returnNo: 'RET-2026-01',
      poNumber: 'SUP-INV-8841',
      supplierName: 'EPharm Wholesale Distributor',
      returnDate: '2026-08-11',
      reason: 'Damaged outer blister seals on 2 boxes of Paracetamol Syrup',
      refundCreditAmount: 1200,
      creditNoteNo: 'CN-EP-0082',
      status: 'CREDIT_ISSUED',
    },
  ]);

  // New Supplier Form
  const [supForm, setSupForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    licenseNumber: '',
  });

  // New Purchase Form
  const [purForm, setPurForm] = useState({
    supplierId: '',
    invoiceNumber: `SUP-INV-${Math.floor(1000 + Math.random() * 9000)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    items: [
      {
        medicineId: '',
        batchNumber: `KZ-BAT-${Math.floor(100 + Math.random() * 900)}`,
        mfgDate: '2025-01-01',
        expDate: '2028-01-01',
        quantity: 100,
        unitCost: 10,
        sellingPrice: 20,
      },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pData, sData, mData] = await Promise.all([
        safeFetchJson<Purchase[]>('/api/purchases'),
        safeFetchJson<Supplier[]>('/api/suppliers'),
        safeFetchJson<Medicine[]>('/api/medicines'),
      ]);

      if (pData.success && pData.data) setPurchases(pData.data);
      if (sData.success && sData.data) {
        setSuppliers(sData.data);
        if (sData.data.length > 0) setPurForm((prev) => ({ ...prev, supplierId: sData.data[0].id }));
      }
      if (mData.success && mData.data) {
        setMedicines(mData.data);
        if (mData.data.length > 0) {
          setPurForm((prev) => ({
            ...prev,
            items: [{ ...prev.items[0], medicineId: mData.data[0].id }],
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await safeFetchJson('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supForm),
      });

      if (data.success) {
        setIsNewSupplierOpen(false);
        fetchData();
        alert('Supplier added successfully!');
      } else {
        alert(data.message || 'Failed to add supplier');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await safeFetchJson('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purForm),
      });

      if (data.success) {
        setIsNewPurchaseOpen(false);
        fetchData();
        alert('Purchase order created & stock replenished atomically!');
      } else {
        alert(data.message || 'Failed to create purchase order');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* WHOLESALE SUPPLIER AUTHENTICATED BADGE STRIP */}
      {currentUser?.role === 'SUPPLIER' && (
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-teal-700/50 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-teal-200">Wholesale Supplier Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  EFDA B2B Authorized Distributor
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Connected as <strong className="text-white">{currentUser.name}</strong> • {currentUser.pharmacyName || 'MedTech Wholesale Distribution Hub'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-teal-200 font-semibold">
              Distributor License: {currentUser.pharmacistLicense || 'EFDA-DIST-AA-5501'}
            </span>
          </div>
        </div>
      )}

      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-teal-600" />
            <span>Procurement & Wholesale Inventory Replenishment</span>
          </h2>
          <p className="text-xs text-slate-500">
            Manage wholesaler accounts, purchase orders, goods receipts, invoices, and accounts payable (AP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewSupplierOpen(true)}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 text-xs font-semibold transition dark:bg-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 text-slate-500" /> Add Supplier
          </button>
          <button
            onClick={() => setIsNewPurchaseOpen(true)}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Record Purchase Order
          </button>
        </div>
      </div>

      {/* PROCUREMENT SUB-TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'suppliers'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Suppliers ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('purchase_orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'purchase_orders'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Purchase Orders ({purchases.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('goods_receipts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'goods_receipts'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Goods Receipts GRN ({goodsReceipts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('purchase_invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'purchase_invoices'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Purchase Invoices ({purchaseInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('supplier_payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'supplier_payments'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Banknote className="h-4 w-4" />
          <span>Supplier Payments ({supplierPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('purchase_returns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'purchase_returns'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Purchase Returns ({purchaseReturns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ap_dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'ap_dashboard'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>AP Dashboard</span>
        </button>
      </div>

      {/* SUB-VIEW 1: SUPPLIERS DIRECTORY & PROCUREMENT INTELLIGENCE */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm dark:text-white">Registered Wholesalers & Manufacturers</h3>
            <span className="text-xs text-slate-500">{suppliers.length} Active Wholesalers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm dark:text-white">{s.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Lic: {s.licenseNumber}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 p-3 rounded-xl dark:bg-slate-950">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PROCUREMENT ANALYTICS & SUPPLIER PERFORMANCE */}
          <div className="space-y-6 pt-1">
            {/* Analytics Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white p-5 rounded-2xl border border-teal-800/40 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Procurement Intelligence & Supplier Analytics
                  </h3>
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Live Wholesale Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Continuous audit of wholesale replenishment trends, supplier fulfillment velocity, and EFDA regulatory compliance.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-slate-200 font-mono">
                  FY 2026 Procurement Cycle
                </span>
              </div>
            </div>

            {/* 4 Procurement KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Spend */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">YTD Wholesale Spend</span>
                  <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(348500)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+14.2% vs last quarter</span>
                </div>
                <p className="text-[10px] text-slate-400">Across 3 verified distributors</p>
              </div>

              {/* Card 2: Avg Lead Time */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Avg Fulfillment Velocity</span>
                  <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  1.8 Days
                </div>
                <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>0.6d faster than SLA benchmark</span>
                </div>
                <p className="text-[10px] text-slate-400">Order issue to dockside GRN check</p>
              </div>

              {/* Card 3: Quality Pass Rate */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">EFDA Seal Inspection Pass</span>
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  99.8%
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>65 / 65 batches verified sealed</span>
                </div>
                <p className="text-[10px] text-slate-400">Zero batch quarantine flags</p>
              </div>

              {/* Card 4: Trade Credit Exposure */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Trade Liabilities</span>
                  <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <Banknote className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(57000)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <span>Net 30 terms • 94% on-schedule</span>
                </div>
                <p className="text-[10px] text-slate-400">ETB 38,500 settled this month</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Wholesale Spend & Inflow Trend */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      <span>Monthly Procurement Expenditure Trend</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Historical spending trajectory and medicine batch intake</p>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                    6-Month Inflow
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyProcurementTrend} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `ETB ${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name.includes('Spend')) {
                            return [`ETB ${Number(value).toLocaleString()}`, 'Procurement Spend'];
                          }
                          return [value, name];
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        name="Procurement Spend (ETB)"
                        stroke="#0d9488"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#spendGradient)"
                        dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 7, fill: '#14b8a6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Avg</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">ETB 65,667</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Peak Month</p>
                    <p className="text-xs font-bold text-teal-600">Oct (ETB 89.5k)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Batches</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">135 Batches</p>
                  </div>
                </div>
              </div>

              {/* Chart 2: Wholesaler Fulfillment Share & Delivery Performance */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-600" />
                      <span>Wholesaler Fulfillment Allocation & Volume</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Cumulative procurement volume and delivery reliability</p>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 dark:bg-sky-950 dark:text-sky-300">
                    Distribution Share
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierPerformanceData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `ETB ${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          if (name.includes('Spend') || name.includes('Volume')) {
                            return [`ETB ${Number(value).toLocaleString()}`, 'Procurement Volume'];
                          }
                          return [value, name];
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                      <Bar dataKey="spend" name="Procurement Volume (ETB)" radius={[8, 8, 0, 0]}>
                        {supplierPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {supplierPerformanceData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl dark:bg-slate-950">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-bold text-slate-800 dark:text-white">{s.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(s.spend)}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                          {s.onTimeRate}% On-Time
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wholesaler Compliance & SLA Performance Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-teal-600" />
                    <span>Distributor SLA & EFDA Regulatory Performance Matrix</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">Service Level Agreement metrics, quality scorecards, and fulfillment lead times</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">Audited: Oct 2026</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">WHOLESALER & LICENSE</th>
                      <th className="px-4 py-3 text-center">STATUS & TIER</th>
                      <th className="px-4 py-3 text-right">YTD REPLENISHMENT</th>
                      <th className="px-4 py-3 text-center">AVG LEAD TIME</th>
                      <th className="px-4 py-3 text-center">ON-TIME DELIVERY</th>
                      <th className="px-4 py-3 text-center">EFDA SEAL AUDIT</th>
                      <th className="px-4 py-3 text-right">CREDIT TERMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {supplierPerformanceData.map((s) => (
                      <tr key={s.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{s.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Lic: {s.license}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                            <ShieldCheck className="h-3 w-3" /> Tier 1 Certified
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(s.spend)}
                          <div className="text-[10px] text-slate-400 font-normal">{s.batches} batches delivered</div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                          {s.leadTimeDays} Days
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{s.onTimeRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                            {s.efdaCompliance}% PASSED
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                          Net 30 Days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PURCHASE ORDERS */}
      {activeSubTab === 'purchase_orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm dark:text-white dark:border-slate-800 flex items-center justify-between">
            <span>Completed & Open Purchase Orders</span>
            <span className="bg-teal-50 text-teal-700 font-bold text-xs px-3 py-1 rounded-full border border-teal-200">
              {purchases.length} Recorded Orders
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Supplier Invoice #</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Purchase Date</th>
                  <th className="px-6 py-3.5">Items Purchased</th>
                  <th className="px-6 py-3.5 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition dark:hover:bg-slate-950/50">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{p.invoiceNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{p.supplierName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(p.purchaseDate)}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p.items.length} items</td>
                    <td className="px-6 py-4 text-right font-bold text-teal-700 dark:text-teal-400">
                      {formatCurrency(p.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: GOODS RECEIPTS (GRN) */}
      {activeSubTab === 'goods_receipts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-teal-600" />
                <span>Goods Receiving Notes (GRN) & Quality Inspection Log</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Physical verification of received pharmaceutical batches against supplier purchase orders.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
              {goodsReceipts.length} Inspection Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">GRN NO</th>
                  <th className="px-4 py-3">PO REF</th>
                  <th className="px-4 py-3">SUPPLIER</th>
                  <th className="px-4 py-3">RECEIVED DATE</th>
                  <th className="px-4 py-3">INSPECTOR</th>
                  <th className="px-4 py-3 text-right">UNITS RECEIVED</th>
                  <th className="px-4 py-3">EFDA QUALITY STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {goodsReceipts.map((grn) => (
                  <tr key={grn.grnNumber} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{grn.grnNumber}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{grn.poNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{grn.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{grn.receivedDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{grn.inspectorName}</td>
                    <td className="px-4 py-3 text-right font-bold text-teal-700">{grn.itemsCount} units</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" /> PASSED EFDA SEAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: PURCHASE INVOICES */}
      {activeSubTab === 'purchase_invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-teal-600" />
                <span>Supplier Purchase Invoices & Net Terms</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage accounts payable invoices, credit terms, due dates, and settlement schedules.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full border border-slate-200">
              {purchaseInvoices.length} Registered Invoices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">INVOICE ID</th>
                  <th className="px-4 py-3">PO REF</th>
                  <th className="px-4 py-3">SUPPLIER</th>
                  <th className="px-4 py-3">INV DATE</th>
                  <th className="px-4 py-3">DUE DATE</th>
                  <th className="px-4 py-3">TERMS</th>
                  <th className="px-4 py-3 text-right">TOTAL (ETB)</th>
                  <th className="px-4 py-3 text-right">PAID (ETB)</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{inv.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{inv.poNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{inv.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-slate-500 font-bold">{inv.dueDate}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{inv.terms}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          inv.status === 'FULLY_PAID'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: SUPPLIER PAYMENTS */}
      {activeSubTab === 'supplier_payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Banknote className="h-4 w-4 text-emerald-600" />
                <span>Supplier Payment Vouchers & Disbursements</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log bank transfers, Telebirr merchant payments, and cheque disbursements to wholesalers.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
              {supplierPayments.length} Payment Receipts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">VOUCHER NO</th>
                  <th className="px-4 py-3">SUPPLIER</th>
                  <th className="px-4 py-3">PAYMENT DATE</th>
                  <th className="px-4 py-3">METHOD</th>
                  <th className="px-4 py-3">REF NO</th>
                  <th className="px-4 py-3 text-right">DISBURSED AMOUNT</th>
                  <th className="px-4 py-3">PAID BY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supplierPayments.map((pmt) => (
                  <tr key={pmt.voucherNo} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{pmt.voucherNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{pmt.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{pmt.paymentDate}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{pmt.method}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{pmt.refNo}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-teal-700">
                      {formatCurrency(pmt.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{pmt.paidBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: PURCHASE RETURNS */}
      {activeSubTab === 'purchase_returns' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                <span>Purchase Returns & Wholesaler Credit Notes</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record returns of damaged, expired, or incorrect shipments to suppliers for credit notes.
              </p>
            </div>
            <span className="bg-rose-50 text-rose-700 font-bold text-xs px-3 py-1 rounded-full border border-rose-200">
              {purchaseReturns.length} Return Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">RETURN NO</th>
                  <th className="px-4 py-3">PO REF</th>
                  <th className="px-4 py-3">SUPPLIER</th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">REASON</th>
                  <th className="px-4 py-3 font-mono">CREDIT NOTE</th>
                  <th className="px-4 py-3 text-right">CREDIT AMOUNT</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseReturns.map((ret) => (
                  <tr key={ret.returnNo} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{ret.returnNo}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{ret.poNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{ret.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{ret.returnDate}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">{ret.reason}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 font-bold">{ret.creditNoteNo}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-600">
                      {formatCurrency(ret.refundCreditAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-300">
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: AP DASHBOARD */}
      {activeSubTab === 'ap_dashboard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Accounts Payable (AP)</span>
                <DollarSign className="h-5 w-5 text-rose-500" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(57000)}</div>
              <p className="text-[11px] text-slate-500">Outstanding liabilities across 3 active suppliers</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Overdue Liabilities (&gt;30 Days)</span>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600">{formatCurrency(32000)}</div>
              <p className="text-[11px] text-slate-500">1 invoice requires immediate payment settlement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Settled This Month</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600">{formatCurrency(38500)}</div>
              <p className="text-[11px] text-slate-500">2 supplier invoices paid in August 2026</p>
            </div>
          </div>

          {/* AP Aging & Outflow Schedule Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                  <span>Accounts Payable Aging & Settlement Horizon</span>
                </h4>
                <p className="text-[11px] text-slate-500">Distribution of trade liabilities across repayment aging horizons</p>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                Total Due: {formatCurrency(57000)}
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apAgingChartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `ETB ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`ETB ${Number(value).toLocaleString()}`, 'Payable Liability']}
                    labelStyle={{ fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  <Bar dataKey="amount" name="Liability (ETB)" radius={[8, 8, 0, 0]}>
                    {apAgingChartData.map((entry, index) => (
                      <Cell key={`cell-ap-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 text-sm dark:text-white">AP Aging Analysis (Wholesaler Liabilities)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">SUPPLIER</th>
                    <th className="px-4 py-3 text-right">CURRENT (0-30 DAYS)</th>
                    <th className="px-4 py-3 text-right">31-60 DAYS</th>
                    <th className="px-4 py-3 text-right">&gt;60 DAYS</th>
                    <th className="px-4 py-3 text-right">TOTAL DUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">EPharm Wholesale Distributor</td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">{formatCurrency(25000)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">ETB 0.00</td>
                    <td className="px-4 py-3 text-right text-slate-400">ETB 0.00</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">{formatCurrency(25000)}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">East Africa Pharmaceuticals</td>
                    <td className="px-4 py-3 text-right text-slate-400">ETB 0.00</td>
                    <td className="px-4 py-3 text-right text-rose-600 font-bold">{formatCurrency(32000)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">ETB 0.00</td>
                    <td className="px-4 py-3 text-right font-extrabold text-rose-600">{formatCurrency(32000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW SUPPLIER */}
      {isNewSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 text-base dark:text-white">Add Wholesaler / Supplier</h3>
              <button onClick={() => setIsNewSupplierOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MedPharm Wholesale Ltd"
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">EFDA License Number</label>
                <input
                  type="text"
                  placeholder="e.g. EFDA/LIC/2026/0112"
                  value={supForm.licenseNumber}
                  onChange={(e) => setSupForm({ ...supForm, licenseNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Phone</label>
                  <input
                    type="text"
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    value={supForm.email}
                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSupplierOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW PURCHASE ORDER */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 text-base dark:text-white">Record Wholesale Purchase Order</h3>
              <button onClick={() => setIsNewPurchaseOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPurchaseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Select Supplier</label>
                  <select
                    value={purForm.supplierId}
                    onChange={(e) => setPurForm({ ...purForm, supplierId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={purForm.invoiceNumber}
                    onChange={(e) => setPurForm({ ...purForm, invoiceNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Line Item Purchase Entry */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 block text-xs dark:text-white">Batch Stock Replenishment Item</span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Select Medicine</label>
                  <select
                    value={purForm.items[0].medicineId}
                    onChange={(e) => {
                      const items = [...purForm.items];
                      items[0].medicineId = e.target.value;
                      setPurForm({ ...purForm, items });
                    }}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.genericName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Batch #</label>
                    <input
                      type="text"
                      required
                      value={purForm.items[0].batchNumber}
                      onChange={(e) => {
                        const items = [...purForm.items];
                        items[0].batchNumber = e.target.value;
                        setPurForm({ ...purForm, items });
                      }}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={purForm.items[0].expDate}
                      onChange={(e) => {
                        const items = [...purForm.items];
                        items[0].expDate = e.target.value;
                        setPurForm({ ...purForm, items });
                      }}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Unit Cost (ETB)</label>
                    <input
                      type="number"
                      required
                      value={purForm.items[0].unitCost}
                      onChange={(e) => {
                        const items = [...purForm.items];
                        items[0].unitCost = Number(e.target.value);
                        setPurForm({ ...purForm, items });
                      }}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Quantity Received</label>
                    <input
                      type="number"
                      required
                      value={purForm.items[0].quantity}
                      onChange={(e) => {
                        const items = [...purForm.items];
                        items[0].quantity = Number(e.target.value);
                        setPurForm({ ...purForm, items });
                      }}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white">
                  Confirm Purchase & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
