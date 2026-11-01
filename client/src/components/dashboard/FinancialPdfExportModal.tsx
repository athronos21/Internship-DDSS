import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Scale,
  BookOpen,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import {
  exportProfitAndLossPdf,
  exportBalanceSheetPdf,
  exportTrialBalancePdf,
  exportConsolidatedFinancialReportPdf,
  FinancialReportPdfOptions,
} from '../../utils/pdfExport';
import { ProfitReportData } from '../../types';

interface FinancialPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportType?: 'profit_loss' | 'balance_sheet' | 'trial_balance' | 'dossier';
  profitData?: ProfitReportData | null;
  chartOfAccounts?: Array<{ code: string; name: string; balance: number; type: string; category?: string }>;
  expenses?: Array<{ category: string; amount: number; vendor?: string; date?: string; notes?: string }>;
}

export const FinancialPdfExportModal: React.FC<FinancialPdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultReportType = 'profit_loss',
  profitData,
  chartOfAccounts = [],
  expenses = [],
}) => {
  const [reportType, setReportType] = useState<'profit_loss' | 'balance_sheet' | 'trial_balance' | 'dossier'>(
    defaultReportType
  );
  const [pharmacyName, setPharmacyName] = useState('Kaziniya Central Pharmacy & Medical Supplies');
  const [reportPeriod, setReportPeriod] = useState(
    `For the Period Ending ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
  );
  const [preparedBy, setPreparedBy] = useState('Chief Accountant Worku / Lead Pharmacist');
  const [reviewedBy, setReviewedBy] = useState('Pharmacy Director & Supervisory Board');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  React.useEffect(() => {
    setReportType(defaultReportType);
    setDownloadSuccess(false);
  }, [defaultReportType, isOpen]);

  if (!isOpen) return null;

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const options: FinancialReportPdfOptions = {
        pharmacyName,
        reportPeriod,
        preparedBy,
        reviewedBy,
      };

      // Slight timeout to let the spinner render smoothly
      await new Promise((res) => setTimeout(res, 250));

      if (reportType === 'profit_loss') {
        exportProfitAndLossPdf(
          {
            revenue: profitData?.totalRevenue ?? 410000,
            cogs: profitData?.cogs ?? 266500,
            expenses: expenses.map((e) => ({ category: e.category, amount: e.amount, notes: e.notes })),
          },
          options
        );
      } else if (reportType === 'balance_sheet') {
        exportBalanceSheetPdf(undefined, options);
      } else if (reportType === 'trial_balance') {
        exportTrialBalancePdf(chartOfAccounts, options);
      } else {
        exportConsolidatedFinancialReportPdf(
          {
            profitData,
            accounts: chartOfAccounts,
            expenses,
          },
          options
        );
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4.5 dark:bg-slate-950/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Download Financial Report (PDF)
              </h3>
              <p className="text-[11px] text-slate-500">
                Official high-resolution print & archival format for EFDA, AABE & Internal Audit
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Select Report Type Cards */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Select Statement to Archive
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType('profit_loss')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  reportType === 'profit_loss'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block">Profit & Loss (P&L)</span>
                  <span className="text-[10px] text-slate-500 block truncate">Revenue, FEFO COGS & Net Margin</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('balance_sheet')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  reportType === 'balance_sheet'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <FileText className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block">Balance Sheet</span>
                  <span className="text-[10px] text-slate-500 block truncate">Assets, Liabilities & Equity</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('trial_balance')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  reportType === 'trial_balance'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <Scale className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block">Trial Balance</span>
                  <span className="text-[10px] text-slate-500 block truncate">Double-entry ledger audit</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('dossier')}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  reportType === 'dossier'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 dark:bg-teal-950/40 dark:border-teal-600 dark:text-teal-200 shadow-2xs ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                }`}
              >
                <Layers className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block">Executive Dossier</span>
                  <span className="text-[10px] text-slate-500 block truncate">Consolidated full audit dossier</span>
                </div>
              </button>
            </div>
          </div>

          {/* Document Header Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Pharmacy / Entity Name
              </label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Statement Period
              </label>
              <input
                type="text"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Prepared By (Signatory)
              </label>
              <input
                type="text"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Audited & Approved By
              </label>
              <input
                type="text"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Compliance & PDF Features Checklist */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>Included in Archival PDF Export:</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                <span>Double-Entry Accrual & FEFO Costing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                <span>Official EFDA & Ethiopian Currency (ETB)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                <span>Audited Ledger Signature & Seal Blocks</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-teal-600 shrink-0" />
                <span>Auto-Formatted Vector Print Ready Tables</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/70 p-4 dark:bg-slate-950/70 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition inline-flex items-center gap-2 ${
              downloadSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-teal-600 hover:bg-teal-700 disabled:opacity-50'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Vector PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <FileCheck className="h-4 w-4" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
