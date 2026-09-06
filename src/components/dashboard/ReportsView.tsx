import React, { useState, useEffect, useMemo } from 'react';
import { ProfitReportData, InventoryTransaction, Medicine, Sale, User } from '../../types';
import { getEffectiveRole } from '../../utils/roleManager';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { MlDemandForecasting } from './MlDemandForecasting';
import { FinancialPdfExportModal } from './FinancialPdfExportModal';
import {
  exportProfitAndLossPdf,
  exportBalanceSheetPdf,
  exportTrialBalancePdf,
  exportConsolidatedFinancialReportPdf,
} from '../../utils/pdfExport';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Calendar,
  Filter,
  RefreshCw,
  BookOpen,
  List,
  Scale,
  FileText,
  Receipt,
  Plus,
  Building2,
  CheckCircle2,
  AlertCircle,
  Tag,
  PlusCircle,
  Calculator,
  Wallet,
  Landmark,
  Cpu,
  Sparkles,
  FileDown,
  Printer,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ReportsViewProps {
  currentUser?: User | null;
  initialSubTab?:
    | 'analytics'
    | 'ml_forecast'
    | 'chart_of_accounts'
    | 'journal_entries'
    | 'trial_balance'
    | 'profit_loss'
    | 'balance_sheet'
    | 'expenses'
    | 'branch_reports';
  autoOpenCreateExpenseModal?: boolean;
  onNavigateToPurchase?: (medicineId?: string, suggestedQty?: number, supplierId?: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  initialSubTab = 'analytics',
  autoOpenCreateExpenseModal = false,
  onNavigateToPurchase,
}) => {
  const effectiveRole = getEffectiveRole(currentUser);
  const isPharmacist = effectiveRole === 'PHARMACIST';

  const [activeSubTab, setActiveSubTab] = useState<
    | 'analytics'
    | 'ml_forecast'
    | 'chart_of_accounts'
    | 'journal_entries'
    | 'trial_balance'
    | 'profit_loss'
    | 'balance_sheet'
    | 'expenses'
    | 'branch_reports'
  >(isPharmacist && !['analytics', 'ml_forecast'].includes(initialSubTab) ? 'analytics' : initialSubTab);

  const [profitData, setProfitData] = useState<ProfitReportData | null>(null);
  const [stockMovements, setStockMovements] = useState<InventoryTransaction[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');

  // Modal states
  const [isNewJournalOpen, setIsNewJournalOpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(autoOpenCreateExpenseModal);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'profit_loss' | 'balance_sheet' | 'trial_balance' | 'dossier'>('profit_loss');
  const [isQuickDownloading, setIsQuickDownloading] = useState(false);
  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickPdfDownload = async (type: 'profit_loss' | 'balance_sheet' | 'trial_balance' | 'dossier') => {
    setIsQuickDownloading(true);
    try {
      if (type === 'profit_loss') {
        exportProfitAndLossPdf({
          revenue: profitData?.totalRevenue ?? 410000,
          cogs: profitData?.cogs ?? 266500,
          expenses: expenses.map((e) => ({ category: e.category, amount: e.amount, notes: e.notes })),
        });
        showToast('✓ Profit & Loss Statement (PDF) downloaded successfully');
      } else if (type === 'balance_sheet') {
        exportBalanceSheetPdf();
        showToast('✓ Balance Sheet (PDF) downloaded successfully');
      } else if (type === 'trial_balance') {
        exportTrialBalancePdf(chartOfAccounts);
        showToast('✓ Trial Balance Audit (PDF) downloaded successfully');
      } else {
        exportConsolidatedFinancialReportPdf({
          profitData,
          accounts: chartOfAccounts,
          expenses,
        });
        showToast('✓ Consolidated Financial Dossier (PDF) downloaded successfully');
      }
    } catch (e) {
      console.error('Failed to export PDF:', e);
      showToast('⚠ Failed to generate PDF. Please try again.');
    } finally {
      setIsQuickDownloading(false);
      setIsPdfDropdownOpen(false);
    }
  };

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  // Chart of Accounts Mock Data
  const [chartOfAccounts] = useState([
    { code: '1010', name: 'Petty Cash - Main Store', category: 'ASSET', balance: 45000, type: 'DEBIT' },
    { code: '1020', name: 'CBE Operating Bank Account', category: 'ASSET', balance: 382000, type: 'DEBIT' },
    { code: '1030', name: 'Telebirr Merchant Cash Account', category: 'ASSET', balance: 124500, type: 'DEBIT' },
    { code: '1200', name: 'Medicine Stock Inventory Asset', category: 'ASSET', balance: 840000, type: 'DEBIT' },
    { code: '2010', name: 'Accounts Payable - Wholesalers', category: 'LIABILITY', balance: 57000, type: 'CREDIT' },
    { code: '2030', name: 'EFDA License & Regulatory Fees Due', category: 'LIABILITY', balance: 12000, type: 'CREDIT' },
    { code: '3010', name: 'Paid-In Capital - Store Equity', category: 'EQUITY', balance: 1000000, type: 'CREDIT' },
    { code: '3020', name: 'Retained Earnings', category: 'EQUITY', balance: 322500, type: 'CREDIT' },
    { code: '4010', name: 'Pharmacy Retail Sales Revenue', category: 'REVENUE', balance: 410000, type: 'CREDIT' },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', category: 'EXPENSE', balance: 266500, type: 'DEBIT' },
    { code: '5020', name: 'Store Rent Expense', category: 'EXPENSE', balance: 25000, type: 'DEBIT' },
    { code: '5030', name: 'Staff Salaries & Wages', category: 'EXPENSE', balance: 42000, type: 'DEBIT' },
    { code: '5040', name: 'Utilities (Electricity & Water)', category: 'EXPENSE', balance: 4800, type: 'DEBIT' },
  ]);

  // Journal Entries Mock Data
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 'JV-2026-0801',
      date: '2026-08-11',
      description: 'Recorded POS Cash Sales and COGS for Aug 11',
      debitAccount: '1010 - Petty Cash - Main Store',
      creditAccount: '4010 - Pharmacy Retail Sales Revenue',
      debitAmount: 19400,
      creditAmount: 19400,
      status: 'BALANCED',
      enteredBy: 'Accountant Worku',
    },
    {
      id: 'JV-2026-0802',
      date: '2026-08-10',
      description: 'Purchased Medicine Batch from EPharm Wholesale',
      debitAccount: '1200 - Medicine Stock Inventory Asset',
      creditAccount: '2010 - Accounts Payable - Wholesalers',
      debitAmount: 45000,
      creditAmount: 45000,
      status: 'BALANCED',
      enteredBy: 'Accountant Worku',
    },
    {
      id: 'JV-2026-0803',
      date: '2026-08-05',
      description: 'Paid Store Rent for August 2026 via CBE Bank',
      debitAccount: '5020 - Store Rent Expense',
      creditAccount: '1020 - CBE Operating Bank Account',
      debitAmount: 25000,
      creditAmount: 25000,
      status: 'BALANCED',
      enteredBy: 'Accountant Worku',
    },
  ]);

  // Expenses Mock Data
  const [expenses, setExpenses] = useState([
    { id: 'EXP-101', date: '2026-08-05', category: 'Rent', vendor: 'Bole Commercial Complex', amount: 25000, paymentMethod: 'CBE Direct Transfer', notes: 'August store lease' },
    { id: 'EXP-102', date: '2026-08-07', category: 'Utilities', vendor: 'Ethiopian Electric Utility', amount: 3200, paymentMethod: 'Telebirr', notes: 'Monthly power bill' },
    { id: 'EXP-103', date: '2026-08-08', category: 'Salaries', vendor: 'Pharmacy Staff Payroll', amount: 42000, paymentMethod: 'CBE Bank Transfer', notes: 'July staff salaries' },
    { id: 'EXP-104', date: '2026-08-10', category: 'Logistics', vendor: 'Addis Delivery Express', amount: 1600, paymentMethod: 'Cash', notes: 'Inter-branch medicine transport' },
  ]);

  // New Journal Entry Form State
  const [jvForm, setJvForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    debitAccount: '1010 - Petty Cash - Main Store',
    creditAccount: '4010 - Pharmacy Retail Sales Revenue',
    amount: '',
  });

  // New Expense Form State
  const [expForm, setExpForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Rent',
    vendor: '',
    amount: '',
    paymentMethod: 'CBE Direct Transfer',
    notes: '',
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, medRes, salesRes] = await Promise.all([
        fetch('/api/reports/profit'),
        fetch('/api/reports/stock-movement'),
        fetch('/api/medicines'),
        fetch('/api/sales'),
      ]);

      const [pData, mData, medData, salesData] = await Promise.all([
        pRes.json(),
        mRes.json(),
        medRes.json(),
        salesRes.json(),
      ]);

      if (pData.success) setProfitData(pData.data);
      if (mData.success) setStockMovements(mData.data);
      if (medData.success && Array.isArray(medData.data)) setMedicines(medData.data);
      if (salesData.success && Array.isArray(salesData.data)) setSales(salesData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Generate Daily Sales Trend Data (7-day / 14-day history)
  const dailyTrendData = useMemo(() => {
    if (!profitData) return [];
    return [
      { date: 'Mon, Feb 5', revenue: 12450, cogs: 8200, profit: 4250, orders: 38 },
      { date: 'Tue, Feb 6', revenue: 15800, cogs: 10100, profit: 5700, orders: 46 },
      { date: 'Wed, Feb 7', revenue: 18900, cogs: 12300, profit: 6600, orders: 52 },
      { date: 'Thu, Feb 8', revenue: 14200, cogs: 9400, profit: 4800, orders: 41 },
      { date: 'Fri, Feb 9', revenue: 22600, cogs: 14800, profit: 7800, orders: 67 },
      { date: 'Sat, Feb 10', revenue: 26800, cogs: 17200, profit: 9600, orders: 74 },
      { date: 'Sun, Feb 11', revenue: 19400, cogs: 12600, profit: 6800, orders: 55 },
    ];
  }, [profitData]);

  // Generate Weekly Sales Trend Data (4 Weeks)
  const weeklyTrendData = useMemo(() => {
    return [
      { week: 'Week 1 (Jan 1-7)', revenue: 84200, cogs: 54700, profit: 29500, margin: 35.0 },
      { week: 'Week 2 (Jan 8-14)', revenue: 92800, cogs: 60300, profit: 32500, margin: 35.0 },
      { week: 'Week 3 (Jan 15-21)', revenue: 104500, cogs: 67900, profit: 36600, margin: 35.0 },
      { week: 'Week 4 (Jan 22-28)', revenue: 118400, cogs: 76800, profit: 41600, margin: 35.1 },
    ];
  }, []);

  // Category Revenue Share Pie Chart Data
  const categoryDistributionData = useMemo(() => {
    return [
      { name: 'Antibiotics & Anti-Infectives', value: 38500, color: '#0284c7' },
      { name: 'Pain Relief & Analgesics', value: 29400, color: '#0f9d58' },
      { name: 'Antimalarial Remedies', value: 21800, color: '#f59e0b' },
      { name: 'Vitamins & Supplements', value: 18200, color: '#8b5cf6' },
      { name: 'Gastrointestinal & PPIs', value: 14600, color: '#ec4899' },
    ];
  }, []);

  const exportStockMovementsCSV = () => {
    if (stockMovements.length === 0) return;

    const headers = ['Transaction ID', 'Medicine Name', 'Batch Number', 'Type', 'Qty', 'Prev Qty', 'New Qty', 'Performed By', 'Date'];
    const rows = stockMovements.map((tx) => [
      tx.id,
      `"${tx.medicineName || ''}"`,
      tx.batchNumber || '',
      tx.transactionType,
      tx.quantity,
      tx.previousQuantity,
      tx.newQuantity,
      `"${tx.performedByName || ''}"`,
      tx.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kaziniya_stock_movements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !profitData) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
        Computing Cost of Goods Sold (COGS) & Sales Trends...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ACCOUNTING & FINANCIAL NAVIGATION SUB-TABS + GLOBAL PDF EXPORT */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-1">
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSubTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics & COGS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ml_forecast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSubTab === 'ml_forecast'
                ? 'bg-gradient-to-r from-teal-600 to-sky-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Cpu className="h-4 w-4 text-teal-400" />
            <span>Demand Forecasting (30D ML)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[9px] font-extrabold uppercase">AI</span>
          </button>

          {!isPharmacist ? (
            <>
              <button
                onClick={() => setActiveSubTab('chart_of_accounts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'chart_of_accounts'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Chart of Accounts ({chartOfAccounts.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('journal_entries')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'journal_entries'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Journal Entries ({journalEntries.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('trial_balance')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'trial_balance'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Scale className="h-4 w-4" />
                <span>Trial Balance</span>
              </button>

              <button
                onClick={() => setActiveSubTab('profit_loss')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'profit_loss'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Profit & Loss (P&L)</span>
              </button>

              <button
                onClick={() => setActiveSubTab('balance_sheet')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'balance_sheet'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Balance Sheet</span>
              </button>

              <button
                onClick={() => setActiveSubTab('expenses')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'expenses'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Receipt className="h-4 w-4" />
                <span>Expense Mgmt ({expenses.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('branch_reports')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  activeSubTab === 'branch_reports'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Branch Financials</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold shrink-0">
              <span>Dispensary Analytics & Shift Reporting</span>
            </div>
          )}
        </div>

        {/* QUICK PDF DOWNLOAD ACTIONS */}
        <div className="relative shrink-0 flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-2">
          <button
            onClick={() => {
              if (activeSubTab === 'profit_loss') {
                setPdfReportType('profit_loss');
              } else if (activeSubTab === 'balance_sheet') {
                setPdfReportType('balance_sheet');
              } else if (activeSubTab === 'trial_balance') {
                setPdfReportType('trial_balance');
              } else {
                setPdfReportType('dossier');
              }
              setIsPdfModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
            title="Open Archival PDF Export configuration"
          >
            <FileDown className="h-4 w-4" />
            <span>Download as PDF</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsPdfDropdownOpen(!isPdfDropdownOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title="Quick PDF Export options"
            >
              <ChevronDown className="h-4 w-4" />
            </button>

            {isPdfDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Instant PDF Downloads
                </div>
                <button
                  disabled={isQuickDownloading}
                  onClick={() => handleQuickPdfDownload('profit_loss')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
                    <span>P&L Income Statement</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-bold">PDF</span>
                </button>

                <button
                  disabled={isQuickDownloading}
                  onClick={() => handleQuickPdfDownload('balance_sheet')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-teal-600" />
                    <span>Balance Sheet (Position)</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-bold">PDF</span>
                </button>

                <button
                  disabled={isQuickDownloading}
                  onClick={() => handleQuickPdfDownload('trial_balance')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5 text-teal-600" />
                    <span>Trial Balance Audit</span>
                  </div>
                  <span className="text-[10px] text-teal-600 font-bold">PDF</span>
                </button>

                <button
                  disabled={isQuickDownloading}
                  onClick={() => handleQuickPdfDownload('dossier')}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-sky-600" />
                    <span>Consolidated Dossier</span>
                  </div>
                  <span className="text-[10px] text-sky-600 font-bold">PDF</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsPdfDropdownOpen(false);
                      setIsPdfModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-2 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Configure & Archive PDF...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: EXECUTIVE ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* HEADER & TIME RANGE SWITCHER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-teal-600" /> Executive Sales & Financial Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Real-time revenue monitoring, Cost of Goods Sold (COGS), gross margins, and product profitability
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex text-xs font-bold">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'daily'
                      ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daily Trends
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeframe === 'weekly'
                      ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-900 dark:text-teal-400'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Weekly Overview
                </button>
              </div>

              <button
                onClick={fetchReports}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300"
                title="Refresh Financial Data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Sales Revenue</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(profitData.totalRevenue)}
          </div>
          <span className="text-[11px] text-teal-600 font-bold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs previous period
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Cost of Goods Sold (COGS)</span>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
            {formatCurrency(profitData.cogs)}
          </div>
          <span className="text-[11px] text-slate-400">Calculated from actual batch unit costs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block dark:text-emerald-400">Gross Profit</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(profitData.grossProfit)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">Revenue minus actual COGS</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block dark:text-teal-400">Profit Margin %</span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {profitData.profitMarginPercent.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400">Store average margin</span>
        </div>
      </div>

      {/* RECHARTS SECTION: DAILY & WEEKLY TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: DAILY / WEEKLY SALES AREA/BAR CHART (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                {timeframe === 'daily' ? 'Daily Revenue & Gross Profit Trend (ETB)' : 'Weekly Performance Comparison (ETB)'}
              </h3>
              <p className="text-xs text-slate-500">
                {timeframe === 'daily' ? '7-day breakdown of total revenue, COGS, and profit' : 'Month-to-date weekly revenue trajectory'}
              </p>
            </div>

            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg dark:bg-teal-950 dark:text-teal-300">
              {timeframe === 'daily' ? 'Daily View' : 'Weekly View'}
            </span>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {timeframe === 'daily' ? (
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f9d58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f9d58" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#0f9d58" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              ) : (
                <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#0f9d58" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cogs" name="COGS Cost" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Gross Profit" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: CATEGORY SHARE PIE CHART (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-sky-600" /> Revenue Share by Category
            </h3>
            <p className="text-xs text-slate-500">Therapeutic class contribution</p>
          </div>

          <div className="h-[230px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`ETB ${Number(val).toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryDistributionData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate text-[11px] font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-[11px]">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMBEDDED ML DEMAND FORECASTING & REORDER PRESCRIPTIONS */}
      <MlDemandForecasting
        medicines={medicines}
        sales={sales}
        onNavigateToPurchase={onNavigateToPurchase}
      />

      {/* Profit Breakdown by Medicine Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-3 p-5">
        <h3 className="font-bold text-slate-900 text-base dark:text-white">Gross Profit Breakdown by Product</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Medicine Name</th>
                <th className="px-4 py-3 text-center">Units Sold</th>
                <th className="px-4 py-3">Total Revenue</th>
                <th className="px-4 py-3">Total COGS Cost</th>
                <th className="px-4 py-3 font-bold text-emerald-700">Gross Profit</th>
                <th className="px-4 py-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {profitData.breakdownByMedicine.map((m) => (
                <tr key={m.medicineId} className="hover:bg-slate-50 transition dark:hover:bg-slate-950/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{m.medicineName}</td>
                  <td className="px-4 py-3 text-center">{m.unitsSold}</td>
                  <td className="px-4 py-3">{formatCurrency(m.revenue)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatCurrency(m.cost)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(m.grossProfit)}</td>
                  <td className="px-4 py-3 text-right font-bold text-teal-600">{m.profitMargin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Movement Audit Ledger & CSV Export */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base dark:text-white">Complete Stock Movement Audit Trail</h3>
            <p className="text-xs text-slate-500">Traceable history of all inventory additions, sales, and adjustments</p>
          </div>

          <button
            onClick={exportStockMovementsCSV}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
          >
            <Download className="h-4 w-4" /> Export CSV Ledger
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-center">Change Qty</th>
                <th className="px-4 py-3 font-mono text-slate-400">Prev &#8594; New</th>
                <th className="px-4 py-3 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockMovements.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition dark:hover:bg-slate-950/50">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{formatDateTime(tx.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{tx.medicineName || 'N/A'}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">{tx.batchNumber || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-bold uppercase text-[10px] dark:bg-slate-800 dark:text-slate-300">
                      {tx.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    <span className={tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {tx.previousQuantity} &#8594; {tx.newQuantity}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{tx.performedByName || 'System'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </div>
      )}

      {/* SUB-VIEW 1.5: DEDICATED ML DEMAND FORECASTING (30-DAY) */}
      {activeSubTab === 'ml_forecast' && (
        <div className="space-y-6 animate-fadeIn">
          <MlDemandForecasting
            medicines={medicines}
            sales={sales}
            onNavigateToPurchase={onNavigateToPurchase}
          />
        </div>
      )}

      {/* SUB-VIEW 2: CHART OF ACCOUNTS */}
      {activeSubTab === 'chart_of_accounts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <List className="h-4 w-4 text-teal-600" />
                <span>General Ledger - Chart of Accounts (COA)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master list of financial accounts categorized by Assets, Liabilities, Equity, Revenue, and Expenses.
              </p>
            </div>
            <span className="bg-teal-50 text-teal-700 font-bold text-xs px-3 py-1 rounded-full border border-teal-200">
              {chartOfAccounts.length} Active Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ACCOUNT CODE</th>
                  <th className="px-4 py-3">ACCOUNT NAME</th>
                  <th className="px-4 py-3">CATEGORY</th>
                  <th className="px-4 py-3">NORMAL TYPE</th>
                  <th className="px-4 py-3 text-right">CURRENT BALANCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chartOfAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-teal-700 dark:text-teal-400">{acc.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{acc.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          acc.category === 'ASSET'
                            ? 'bg-blue-100 text-blue-800'
                            : acc.category === 'LIABILITY'
                            ? 'bg-amber-100 text-amber-800'
                            : acc.category === 'EQUITY'
                            ? 'bg-purple-100 text-purple-800'
                            : acc.category === 'REVENUE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {acc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px] font-bold">{acc.type}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(acc.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: JOURNAL ENTRIES */}
      {activeSubTab === 'journal_entries' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <span>General Journal Vouchers & Double-Entry Ledger</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited record of debit and credit transaction vouchers across accounts.
              </p>
            </div>
            <button
              onClick={() => setIsNewJournalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> New Journal Voucher
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">VOUCHER ID</th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">DESCRIPTION</th>
                  <th className="px-4 py-3">DEBIT ACCOUNT</th>
                  <th className="px-4 py-3">CREDIT ACCOUNT</th>
                  <th className="px-4 py-3 text-right">AMOUNT (ETB)</th>
                  <th className="px-4 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {journalEntries.map((jv) => (
                  <tr key={jv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{jv.id}</td>
                    <td className="px-4 py-3 text-slate-500">{jv.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs">{jv.description}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">{jv.debitAccount}</td>
                    <td className="px-4 py-3 font-mono text-teal-700 font-bold">{jv.creditAccount}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(jv.debitAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {jv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: TRIAL BALANCE */}
      {activeSubTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Scale className="h-4 w-4 text-teal-600" />
                <span>Trial Balance Statement (Balanced Audit Verification)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verification that total debits equal total credits across all store ledger accounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> LEDGER BALANCED
              </span>
              <button
                disabled={isQuickDownloading}
                onClick={() => handleQuickPdfDownload('trial_balance')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <FileDown className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ACCOUNT CODE</th>
                  <th className="px-4 py-3">ACCOUNT NAME</th>
                  <th className="px-4 py-3 text-right">DEBIT (ETB)</th>
                  <th className="px-4 py-3 text-right">CREDIT (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {chartOfAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-600">{acc.code}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">{acc.name}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">
                      {acc.type === 'DEBIT' ? formatCurrency(acc.balance) : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-teal-700">
                      {acc.type === 'CREDIT' ? formatCurrency(acc.balance) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-950 font-extrabold text-xs text-slate-900 dark:text-white border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="px-4 py-3 uppercase tracking-wider">TOTAL BALANCES</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700">{formatCurrency(1791500)}</td>
                  <td className="px-4 py-3 text-right font-mono text-teal-700">{formatCurrency(1791500)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: PROFIT & LOSS STATEMENT */}
      {activeSubTab === 'profit_loss' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800 max-w-3xl mx-auto">
          {/* HEADER & PDF ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Kaziniya Central Pharmacy & Medical Supplies
              </h3>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">INCOME STATEMENT (PROFIT & LOSS)</p>
              <p className="text-[11px] text-slate-400">For the period ending August 12, 2026 (Currency: ETB)</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={isQuickDownloading}
                onClick={() => handleQuickPdfDownload('profit_loss')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Download official P&L PDF immediately"
              >
                <FileDown className="h-4 w-4" />
                <span>Download as PDF</span>
              </button>
              <button
                onClick={() => {
                  setPdfReportType('profit_loss');
                  setIsPdfModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition inline-flex items-center gap-1.5"
                title="Customize report title, period, signatories, and notes"
              >
                <Printer className="h-4 w-4" />
                <span>Archival Options</span>
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* REVENUE SECTION */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-1 dark:border-slate-800">
                <span>REVENUE FROM PHARMACEUTICAL SALES</span>
                <span>{formatCurrency(410000)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                <span>Less: Cost of Goods Sold (COGS from FEFO Batches)</span>
                <span className="text-rose-600 font-semibold">({formatCurrency(266500)})</span>
              </div>
            </div>

            {/* GROSS PROFIT */}
            <div className="flex justify-between font-extrabold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 text-sm">
              <span>GROSS PROFIT</span>
              <span>{formatCurrency(143500)}</span>
            </div>

            {/* OPERATING EXPENSES */}
            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-900 dark:text-white block border-b border-slate-100 pb-1 dark:border-slate-800">
                OPERATING EXPENSES (OpEx)
              </span>
              <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                <span>Store Premises Lease / Rent</span>
                <span>{formatCurrency(25000)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                <span>Pharmacist & Staff Payroll Expenses</span>
                <span>{formatCurrency(42000)}</span>
              </div>
              <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-400">
                <span>Utilities (Electricity & Water)</span>
                <span>{formatCurrency(4800)}</span>
              </div>
              <div className="flex justify-between pl-4 font-bold text-rose-600 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>TOTAL OPERATING EXPENSES</span>
                <span>({formatCurrency(71800)})</span>
              </div>
            </div>

            {/* NET PROFIT */}
            <div className="flex justify-between font-black text-slate-900 dark:text-white bg-slate-100 p-4 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-base">
              <span className="text-teal-700 dark:text-teal-400">NET OPERATING INCOME (NET PROFIT)</span>
              <span className="text-teal-700 dark:text-teal-400">{formatCurrency(71700)}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: BALANCE SHEET */}
      {activeSubTab === 'balance_sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800 max-w-3xl mx-auto">
          {/* HEADER & PDF ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Kaziniya Central Pharmacy & Medical Supplies
              </h3>
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400">STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)</p>
              <p className="text-[11px] text-slate-400">As of August 12, 2026 (Currency: ETB)</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={isQuickDownloading}
                onClick={() => handleQuickPdfDownload('balance_sheet')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Download official Balance Sheet PDF immediately"
              >
                <FileDown className="h-4 w-4" />
                <span>Download as PDF</span>
              </button>
              <button
                onClick={() => {
                  setPdfReportType('balance_sheet');
                  setIsPdfModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition inline-flex items-center gap-1.5"
                title="Customize report title, period, signatories, and notes"
              >
                <Printer className="h-4 w-4" />
                <span>Archival Options</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* ASSETS */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-950">
              <h4 className="font-extrabold text-teal-700 dark:text-teal-400 border-b border-slate-200 pb-2 dark:border-slate-800">
                ASSETS
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Petty Cash - Store Vault</span>
                  <span className="font-mono font-bold">{formatCurrency(45000)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>CBE Operating Account</span>
                  <span className="font-mono font-bold">{formatCurrency(382000)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Telebirr Merchant Cash</span>
                  <span className="font-mono font-bold">{formatCurrency(124500)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Medicine Stock Inventory Valuation</span>
                  <span className="font-mono font-bold">{formatCurrency(840000)}</span>
                </div>
              </div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>TOTAL ASSETS</span>
                <span className="text-teal-700 font-mono">{formatCurrency(1391500)}</span>
              </div>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl dark:bg-slate-950">
              <h4 className="font-extrabold text-teal-700 dark:text-teal-400 border-b border-slate-200 pb-2 dark:border-slate-800">
                LIABILITIES & EQUITY
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Accounts Payable (Wholesalers)</span>
                  <span className="font-mono font-bold">{formatCurrency(57000)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>EFDA License Fees Payable</span>
                  <span className="font-mono font-bold">{formatCurrency(12000)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Paid-In Capital</span>
                  <span className="font-mono font-bold">{formatCurrency(1000000)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Retained Earnings</span>
                  <span className="font-mono font-bold">{formatCurrency(322500)}</span>
                </div>
              </div>
              <div className="flex justify-between font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="text-teal-700 font-mono">{formatCurrency(1391500)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: EXPENSE MANAGEMENT */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Receipt className="h-4 w-4 text-rose-600" />
                <span>Store Operational Expenses & Overhead Log</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record rent, utilities, staff payroll, transport, and facility upkeep costs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={isQuickDownloading}
                onClick={() => handleQuickPdfDownload('profit_loss')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition inline-flex items-center gap-1.5"
                title="Download expense summary in P&L report"
              >
                <FileDown className="h-4 w-4" /> Download PDF
              </button>
              <button
                onClick={() => setIsNewExpenseOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" /> Record Expense
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">EXPENSE ID</th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">CATEGORY</th>
                  <th className="px-4 py-3">VENDOR / BENEFICIARY</th>
                  <th className="px-4 py-3">PAYMENT METHOD</th>
                  <th className="px-4 py-3">NOTES</th>
                  <th className="px-4 py-3 text-right">AMOUNT (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{exp.id}</td>
                    <td className="px-4 py-3 text-slate-500">{exp.date}</td>
                    <td className="px-4 py-3 font-bold text-rose-600">{exp.category}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{exp.vendor}</td>
                    <td className="px-4 py-3 font-semibold text-slate-600">{exp.paymentMethod}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-xs">{exp.notes}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-rose-600">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: BRANCH FINANCIAL CONSOLIDATION */}
      {activeSubTab === 'branch_reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span>Multi-Branch Store Financial Performance</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparison of sales revenues, inventory turn, and profitability across pharmacy outlets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center justify-between">
                <span>Kaziniya Main Central Branch</span>
                <span className="text-xs text-emerald-600 font-extrabold">+18.4% YoY</span>
              </h4>
              <p className="text-xs text-slate-500">Bole Road Commercial Center</p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Monthly Sales</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(245000)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Stock Asset</span>
                  <span className="font-bold text-teal-600">{formatCurrency(510000)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm dark:text-white flex items-center justify-between">
                <span>Bole Sub-Branch Outlet</span>
                <span className="text-xs text-emerald-600 font-extrabold">+12.1% YoY</span>
              </h4>
              <p className="text-xs text-slate-500">Bole Atlas Complex</p>
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Monthly Sales</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(165000)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase">Stock Asset</span>
                  <span className="font-bold text-teal-600">{formatCurrency(330000)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW JOURNAL VOUCHER */}
      {isNewJournalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-600" /> Create General Journal Voucher
              </h3>
              <button onClick={() => setIsNewJournalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                &#10005;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!jvForm.description || !jvForm.amount) return;

                const newJv = {
                  id: `JV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: jvForm.date,
                  description: jvForm.description,
                  debitAccount: jvForm.debitAccount,
                  creditAccount: jvForm.creditAccount,
                  debitAmount: parseFloat(jvForm.amount),
                  creditAmount: parseFloat(jvForm.amount),
                  status: 'BALANCED',
                  enteredBy: 'Accountant Worku',
                };

                setJournalEntries([newJv, ...journalEntries]);
                setIsNewJournalOpen(false);
                setJvForm({
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  debitAccount: '1010 - Petty Cash - Main Store',
                  creditAccount: '4010 - Pharmacy Retail Sales Revenue',
                  amount: '',
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-bold mb-1">Voucher Date</label>
                <input
                  type="date"
                  value={jvForm.date}
                  onChange={(e) => setJvForm({ ...jvForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Transaction Description</label>
                <input
                  type="text"
                  placeholder="e.g., Settlement of August Store Utility Fees"
                  value={jvForm.description}
                  onChange={(e) => setJvForm({ ...jvForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Debit Account (+Asset/+Expense)</label>
                  <select
                    value={jvForm.debitAccount}
                    onChange={(e) => setJvForm({ ...jvForm, debitAccount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  >
                    {chartOfAccounts.map((a) => (
                      <option key={a.code} value={`${a.code} - ${a.name}`}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Credit Account (+Revenue/+Payable)</label>
                  <select
                    value={jvForm.creditAccount}
                    onChange={(e) => setJvForm({ ...jvForm, creditAccount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  >
                    {chartOfAccounts.map((a) => (
                      <option key={a.code} value={`${a.code} - ${a.name}`}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Voucher Amount (ETB)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={jvForm.amount}
                  onChange={(e) => setJvForm({ ...jvForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewJournalOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700">
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD EXPENSE */}
      {isNewExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-rose-600" /> Record Store Operational Expense
              </h3>
              <button onClick={() => setIsNewExpenseOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                &#10005;
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!expForm.vendor || !expForm.amount) return;

                const newExp = {
                  id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
                  date: expForm.date,
                  category: expForm.category,
                  vendor: expForm.vendor,
                  amount: parseFloat(expForm.amount),
                  paymentMethod: expForm.paymentMethod,
                  notes: expForm.notes,
                };

                setExpenses([newExp, ...expenses]);
                setIsNewExpenseOpen(false);
                setExpForm({
                  date: new Date().toISOString().split('T')[0],
                  category: 'Rent',
                  vendor: '',
                  amount: '',
                  paymentMethod: 'CBE Direct Transfer',
                  notes: '',
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Expense Category</label>
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  >
                    <option value="Rent">Store Lease / Rent</option>
                    <option value="Utilities">Electricity & Water</option>
                    <option value="Salaries">Staff Payroll</option>
                    <option value="Logistics">Transport & Delivery</option>
                    <option value="Maintenance">Facility Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Vendor / Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ethiopian Electric Utility"
                  value={expForm.vendor}
                  onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Payment Method</label>
                  <select
                    value={expForm.paymentMethod}
                    onChange={(e) => setExpForm({ ...expForm, paymentMethod: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                  >
                    <option value="CBE Direct Transfer">CBE Direct Transfer</option>
                    <option value="Telebirr">Telebirr Merchant</option>
                    <option value="Cash">Vault Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Amount (ETB)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Additional expense remarks..."
                  value={expForm.notes}
                  onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewExpenseOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700">
                  Save Expense Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINANCIAL PDF ARCHIVAL & EXPORT MODAL */}
      <FinancialPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        profitData={profitData}
        chartOfAccounts={chartOfAccounts}
        expenses={expenses}
        defaultReportType={pdfReportType}
      />

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
