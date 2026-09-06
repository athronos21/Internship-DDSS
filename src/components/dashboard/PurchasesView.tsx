import React, { useState, useEffect } from 'react';
import { Purchase, Supplier, Medicine } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
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
} from 'lucide-react';

interface PurchasesViewProps {
  initialSubTab?: 'suppliers' | 'purchase_orders' | 'goods_receipts' | 'purchase_invoices' | 'supplier_payments' | 'purchase_returns' | 'ap_dashboard';
  autoOpenAddSupplierModal?: boolean;
  autoOpenNewPOModal?: boolean;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
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
      const [pRes, sRes, mRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/suppliers'),
        fetch('/api/medicines'),
      ]);

      const [pData, sData, mData] = await Promise.all([pRes.json(), sRes.json(), mRes.json()]);

      if (pData.success) setPurchases(pData.data);
      if (sData.success) {
        setSuppliers(sData.data);
        if (sData.data.length > 0) setPurForm((prev) => ({ ...prev, supplierId: sData.data[0].id }));
      }
      if (mData.success) {
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
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supForm),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewSupplierOpen(false);
        fetchData();
        alert('Supplier added successfully!');
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-5' },
        body: JSON.stringify(purForm),
      });

      const data = await res.json();
      if (data.success) {
        setIsNewPurchaseOpen(false);
        fetchData();
        alert('Purchase order created & stock replenished atomically!');
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* SUB-VIEW 1: SUPPLIERS DIRECTORY */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-4">
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
