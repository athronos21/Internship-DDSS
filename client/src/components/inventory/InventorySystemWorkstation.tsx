import React, { useState, useEffect } from 'react';
import { User, Medicine, Sale } from '../../types';
import { InventoryView } from '../dashboard/InventoryView';
import { MlDemandForecasting } from '../dashboard/MlDemandForecasting';
import { WorkstationDropdown, WorkstationId } from '../dashboard/WorkstationDropdown';
import { formatCurrency } from '../../utils/formatters';
import { safeFetchJson } from '../../utils/api';
import {
  Boxes,
  Pill,
  Clock,
  Scale,
  FileText,
  TrendingUp,
  Cpu,
  Scan,
  Barcode as BarcodeIcon,
  UploadCloud,
  Plus,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface ImsSubsystem {
  id: 'medicines' | 'batches' | 'adjustments' | 'requests' | 'movements' | 'forecast';
  name: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const IMS_SUBSYSTEMS: ImsSubsystem[] = [
  { id: 'medicines', name: 'Formulary Catalog', icon: Pill },
  { id: 'batches', name: 'Batch & FEFO Expiry', badge: 'EFDA', icon: Clock },
  { id: 'adjustments', name: 'Stock Audits & Recounts', icon: Scale },
  { id: 'requests', name: 'Requisitions & Transfers', icon: FileText },
  { id: 'movements', name: 'Movement Ledger', icon: SlidersHorizontal },
  { id: 'forecast', name: 'Demand Forecasting', badge: '30D ML', icon: TrendingUp },
];

export interface ImsToolbeltAction {
  id: 'scan' | 'barcode' | 'import_csv' | 'add_medicine';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const IMS_TOOLBELT_ACTIONS: ImsToolbeltAction[] = [
  { id: 'scan', label: 'Scan Barcode', icon: Scan },
  { id: 'barcode', label: 'Label Studio', icon: BarcodeIcon },
  { id: 'import_csv', label: 'Import CSV', icon: UploadCloud },
  { id: 'add_medicine', label: 'New Medicine', icon: Plus },
];

export interface InventorySystemWorkstationProps {
  currentUser: User;
  initialSubTab?: 'medicines' | 'batches' | 'adjustments' | 'requests' | 'movements' | 'forecast' | string;
  onExitToDashboard: () => void;
  onSwitchWorkstation: (workstation: WorkstationId, subTab?: string) => void;
  onNavigateToAddMedicine?: () => void;
}

const normalizeImsTab = (tab?: string): 'medicines' | 'batches' | 'adjustments' | 'requests' | 'movements' | 'forecast' => {
  if (!tab) return 'medicines';
  if (tab === 'batches' || tab === 'low' || tab === 'expiring' || tab === 'archived') return 'batches';
  if (tab === 'adjustments') return 'adjustments';
  if (tab === 'requests') return 'requests';
  if (tab === 'movements') return 'movements';
  if (tab === 'forecast') return 'forecast';
  return 'medicines';
};

export const InventorySystemWorkstation: React.FC<InventorySystemWorkstationProps> = ({
  currentUser,
  initialSubTab = 'medicines',
  onExitToDashboard,
  onSwitchWorkstation,
  onNavigateToAddMedicine,
}) => {
  const [activeTab, setActiveTab] = useState<'medicines' | 'batches' | 'adjustments' | 'requests' | 'movements' | 'forecast'>(
    normalizeImsTab(initialSubTab)
  );
  const [inventoryStats, setInventoryStats] = useState({
    totalSkus: 0,
    totalValuation: 0,
    lowStockCount: 0,
    expiringSoonCount: 0,
  });
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto trigger modals in embedded view
  const [autoOpenAdjustModal, setAutoOpenAdjustModal] = useState(false);
  const [autoOpenCreateReqModal, setAutoOpenCreateReqModal] = useState(false);

  useEffect(() => {
    fetchImsTelemetry();
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(normalizeImsTab(initialSubTab));
      if (initialSubTab === 'adjustments') {
        setAutoOpenAdjustModal(true);
      }
    }
  }, [initialSubTab]);

  const fetchImsTelemetry = async () => {
    setLoading(true);
    try {
      const [dashRes, medRes, salesRes] = await Promise.all([
        safeFetchJson('/api/dashboard'),
        safeFetchJson('/api/medicines'),
        safeFetchJson('/api/sales'),
      ]);

      if (medRes.success && Array.isArray(medRes.data)) {
        setMedicines(medRes.data);
      }
      if (salesRes.success && Array.isArray(salesRes.data)) {
        setSales(salesRes.data);
      }

      if (dashRes.success && dashRes.data) {
        setInventoryStats({
          totalSkus: dashRes.data.totalMedicines || (medRes.data ? medRes.data.length : 0),
          totalValuation: dashRes.data.totalInventoryValue || 0,
          lowStockCount: dashRes.data.lowStockCount || 0,
          expiringSoonCount: dashRes.data.expiringSoonCount || 0,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch IMS telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  // Map internal tab to InventoryView tab
  const getInventoryViewSubTab = (): 'medicines' | 'batches' | 'low' | 'expiring' | 'archived' | 'movements' | 'requests' => {
    if (activeTab === 'batches' && (initialSubTab === 'low' || initialSubTab === 'expiring' || initialSubTab === 'archived')) {
      return initialSubTab as any;
    }
    switch (activeTab) {
      case 'batches':
        return 'batches';
      case 'adjustments':
        return 'batches';
      case 'requests':
        return 'requests';
      case 'movements':
        return 'movements';
      case 'medicines':
      default:
        return 'medicines';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* 1. TOP IMS DEDICATED WORKSTATION HEADER */}
      <header className="h-16 bg-slate-950 border-b border-emerald-900/40 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-xl">
        {/* Left: Branding & Return Button */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onExitToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition shadow-xs cursor-pointer group"
            title="Return to General Store Dashboard"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform text-emerald-400" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Exit</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-900/40">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white">
                  Kaziniya IMS
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase">
                  <ShieldCheck className="h-3 w-3" /> EFDA Compliant
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Digital Inventory & FEFO Supply Chain Workstation
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Workstation Switcher & User Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={fetchImsTelemetry}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
            title="Refresh Inventory Telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Workstation Dropdown Switcher */}
          <WorkstationDropdown
            currentUser={currentUser}
            currentWorkstation="IMS"
            onSelectWorkstation={(ws, subTab) => {
              if (ws === 'IMS') {
                if (subTab) setActiveTab(subTab as any);
              } else {
                onSwitchWorkstation(ws, subTab);
              }
            }}
          />

          {/* User Role Tag */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.charAt(0)}
            </div>
            <span className="truncate max-w-[120px] font-semibold">{currentUser.name}</span>
          </div>
        </div>
      </header>

      {/* 2. IMS LIVE TELEMETRY STATS STRIP */}
      <section className="bg-slate-950/70 border-b border-slate-800/80 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active SKUs</p>
              <p className="text-lg font-black text-white mt-0.5">{inventoryStats.totalSkus}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Pill className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">
                {formatCurrency(inventoryStats.totalValuation)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Boxes className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low Stock Items</p>
              <p className={`text-lg font-black mt-0.5 ${inventoryStats.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {inventoryStats.lowStockCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiring Soon (&lt;90d)</p>
              <p className={`text-lg font-black mt-0.5 ${inventoryStats.expiringSoonCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                {inventoryStats.expiringSoonCount}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMS SUB-SYSTEM TABS & TOOLBELT STRIP */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 sm:px-6 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2.5">
          {/* Subsystem Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {IMS_SUBSYSTEMS.map((subsystem) => {
              const Icon = subsystem.icon;
              const isActive = activeTab === subsystem.id;

              return (
                <button
                  key={subsystem.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(subsystem.id);
                    if (subsystem.id === 'adjustments') {
                      setAutoOpenAdjustModal(true);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{subsystem.name}</span>
                  {subsystem.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {subsystem.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Button */}
          {onNavigateToAddMedicine && (
            <button
              type="button"
              onClick={onNavigateToAddMedicine}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Register Drug</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. WORKSTATION MAIN VIEWPORT */}
      <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'forecast' ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">AI Demand & Stockout Forecasting</h2>
                  <p className="text-xs text-slate-400">
                    Machine learning 30-day consumption prediction models and safety stock alerts.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] uppercase border border-teal-500/30">
                Hybrid Exponential Smoothing
              </span>
            </div>

            <MlDemandForecasting
              medicines={medicines}
              sales={sales}
              onNavigateToPurchase={() => onSwitchWorkstation('STORE_OPS', 'purchase_orders')}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl p-2 sm:p-4 text-slate-900 dark:text-slate-100">
            <InventoryView
              initialSubTab={getInventoryViewSubTab()}
              autoOpenAdjustModal={autoOpenAdjustModal}
              autoOpenCreateReqModal={autoOpenCreateReqModal}
              onNavigateToAddMedicine={onNavigateToAddMedicine}
            />
          </div>
        )}
      </main>
    </div>
  );
};
