import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import {
  Boxes,
  ShoppingCart,
  Store,
  Shield,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  Pill,
  Clock,
  Scale,
  FileText,
  Scan,
  TrendingUp,
} from 'lucide-react';

export type WorkstationId = 'IMS' | 'POS' | 'STORE_OPS' | 'MASTER_ADMIN';

export interface WorkstationItem {
  id: WorkstationId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkey?: string;
  isSuperAdminOnly?: boolean;
}

export const WORKSTATION_ITEMS: WorkstationItem[] = [
  {
    id: 'IMS',
    name: 'Inventory Management System',
    tagline: 'FEFO batches, physical counts, requisitions & label studio',
    badge: 'Autonomous IMS',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    icon: Boxes,
    hotkey: 'F2',
  },
  {
    id: 'POS',
    name: 'POS Dispensing Counter',
    tagline: 'Live prescription checkout & instant payment receipting',
    badge: 'Dispensary',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    icon: ShoppingCart,
    hotkey: 'F1',
  },
  {
    id: 'STORE_OPS',
    name: 'Store Management Portal',
    tagline: 'Sales ledger, supplier POs, profit reports & staff HR',
    badge: 'Back Office',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    icon: Store,
    hotkey: 'F6',
  },
  {
    id: 'MASTER_ADMIN',
    name: 'National Fleet Governance',
    tagline: 'Multi-store oversight, EFDA recalls & platform health',
    badge: 'Super Admin',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    icon: Shield,
    isSuperAdminOnly: true,
  },
];

export interface ImsQuickJump {
  tab: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const IMS_QUICK_JUMPS: ImsQuickJump[] = [
  { tab: 'medicines', label: 'Formulary Catalog', icon: Pill },
  { tab: 'batches', label: 'Batch Expiry & FEFO', icon: Clock },
  { tab: 'adjustments', label: 'Stock Adjustments', icon: Scale },
  { tab: 'requests', label: 'Requisitions & Transfers', icon: FileText },
  { tab: 'forecast', label: 'Demand Forecasting', icon: TrendingUp },
];

export function getAvailableWorkstations(user?: User | null): WorkstationItem[] {
  if (!user) return WORKSTATION_ITEMS.filter((w) => !w.isSuperAdminOnly);
  const isSuperAdmin = !!(user.isSuperAdmin || user.role === 'SUPER_ADMIN' || user.email === 'athronos21@gmail.com');
  if (isSuperAdmin) {
    return WORKSTATION_ITEMS;
  }
  return WORKSTATION_ITEMS.filter((w) => !w.isSuperAdminOnly);
}

export interface WorkstationDropdownProps {
  currentUser: User;
  currentWorkstation?: WorkstationId;
  onSelectWorkstation: (workstation: WorkstationId, subTab?: string) => void;
}

export const WorkstationDropdown: React.FC<WorkstationDropdownProps> = ({
  currentUser,
  currentWorkstation = 'STORE_OPS',
  onSelectWorkstation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableWorkstations = getAvailableWorkstations(currentUser);
  const currentItem = WORKSTATION_ITEMS.find((w) => w.id === currentWorkstation) || WORKSTATION_ITEMS[0];
  const CurrentIcon = currentItem.icon;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (id: WorkstationId, subTab?: string) => {
    onSelectWorkstation(id, subTab);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-[#00528e] hover:bg-[#00477a] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs border border-sky-400/30 group cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Switch Workstation & System Portals"
      >
        <div className="w-5 h-5 rounded-lg bg-sky-400/20 text-sky-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <CurrentIcon className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col text-left leading-tight hidden sm:flex">
          <span className="text-[9px] uppercase tracking-wider text-sky-200/80 font-black">
            Workstation
          </span>
          <span className="font-extrabold text-white text-xs truncate max-w-[130px] lg:max-w-[180px]">
            {currentItem.name}
          </span>
        </div>
        <span className="sm:hidden font-extrabold text-xs">Systems</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-sky-200 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN POPOVER MENU */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[340px] sm:w-[380px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#006cb7] to-[#00528e] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-200" />
              <span className="text-xs font-extrabold tracking-wide uppercase">
                Enterprise Workstations
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          {/* Workstations List */}
          <div className="p-2 space-y-1 max-h-[460px] overflow-y-auto">
            {availableWorkstations.map((workstation) => {
              const Icon = workstation.icon;
              const isActive = currentWorkstation === workstation.id;

              return (
                <div
                  key={workstation.id}
                  className={`rounded-xl transition p-2.5 ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(workstation.id)}
                    className="w-full flex items-start justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                          isActive
                            ? 'bg-[#006cb7] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-black transition-colors ${
                              isActive
                                ? 'text-[#006cb7] dark:text-sky-300'
                                : 'text-slate-900 dark:text-white group-hover:text-[#006cb7]'
                            }`}
                          >
                            {workstation.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md border ${workstation.badgeColor}`}
                          >
                            {workstation.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {workstation.tagline}
                        </p>
                      </div>
                    </div>
                    {workstation.hotkey && (
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300 shrink-0">
                        {workstation.hotkey}
                      </kbd>
                    )}
                  </button>

                  {/* If this is the IMS item, render quick direct links */}
                  {workstation.id === 'IMS' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 px-1 flex items-center justify-between">
                        <span>Direct Sub-Jumps:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px]">
                          ⚡ Fast Nav
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {IMS_QUICK_JUMPS.map((jump) => {
                          const JumpIcon = jump.icon;
                          return (
                            <button
                              key={jump.tab}
                              type="button"
                              onClick={() => handleSelect('IMS', jump.tab)}
                              className="flex items-center gap-1.5 p-1.5 rounded-lg text-left text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer"
                            >
                              <JumpIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{jump.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Unified Healthcare Database</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live FEFO Synced
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
