import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Store,
  Pill,
  Check,
  X,
  Lock,
  Unlock,
  Key,
  Layers,
  FileCheck,
  Eye,
  Activity,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Cpu,
  UserCheck,
  Download,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import {
  ROLE_CONFIGS,
  PERMISSION_DOMAINS,
  Permission,
  getEffectiveRole,
  getRoleConfig,
  hasPermission,
} from '../../utils/roleManager';

interface RoleManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSimulateRole?: (role: UserRole) => void;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSimulateRole,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'views' | 'roles' | 'security'>('matrix');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRole = getEffectiveRole(currentUser);
  const currentConfig = getRoleConfig(currentRole);

  const rolesList: UserRole[] = ['SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST'];

  const handleCopyToken = (permId: string) => {
    navigator.clipboard.writeText(permId);
    setCopiedToken(permId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  Unified Role Manager & Access Control Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  3-Character Architecture
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Centralized RBAC policy matrix, UI view gatekeeper, and server-side API authorization rules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Role Manager"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* INSTITUTIONAL HIERARCHY ARCHITECTURE STRIP */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-900/10 via-blue-900/10 to-emerald-900/10 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* TIER 1 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-2xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Tier 1 • Super Admin
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Whole System & Multi-Fleet
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  Governs all drug store nodes, EFDA safety recalls & GMV
                </p>
              </div>
            </div>

            {/* TIER 2 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-2xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Tier 2 • Drug Store Owner
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Store Business & Management
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  Manages store P&L, premises, suppliers & pharmacist staff
                </p>
              </div>
            </div>

            {/* TIER 3 */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Pill className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Tier 3 • Pharmacist
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Daily Drug Store Operations
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  Executes POS dispensing, shelf inventory, intake & Z-report
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE USER SESSION BAR */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Session:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{currentUser?.name || 'Authorized User'}</span>
              <span className="text-slate-400 font-mono text-[11px]">({currentUser?.employeeId || 'SYS-ACTIVE'})</span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Assigned Role:</span>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${currentConfig.badgeColor}`}>
                {currentConfig.shortTitle}
              </span>
            </div>
          </div>

          {/* SIMULATOR QUICK SWITCHER */}
          {onSimulateRole && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Role Simulator:
              </span>
              <div className="flex items-center gap-1">
                {rolesList.map((r) => {
                  const isCur = currentRole === r;
                  return (
                    <button
                      key={r}
                      onClick={() => onSimulateRole(r)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                        isCur
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'STORE_OWNER' ? 'Store Owner' : 'Pharmacist'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Permission Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('views')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'views'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Dashboard View Authorization</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'roles'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>3-Character Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>API & Security Guards</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
          
          {/* TAB 1: PERMISSION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              {/* Domain filter and search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  <button
                    onClick={() => setSelectedDomain('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedDomain === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    All Domains ({PERMISSION_DOMAINS.reduce((acc, d) => acc + d.permissions.length, 0)})
                  </button>
                  {PERMISSION_DOMAINS.map((d) => (
                    <button
                      key={d.domain}
                      onClick={() => setSelectedDomain(d.domain)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                        selectedDomain === d.domain
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {d.domain}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Matrix Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 w-1/3">Permission Token & Scope</th>
                        <th className="py-3.5 px-4 text-center">
                          <div className="font-extrabold text-indigo-700 dark:text-indigo-400">Super Admin</div>
                          <div className="text-[9px] font-normal lowercase text-slate-400">Tier 1: Master Platform</div>
                        </th>
                        <th className="py-3.5 px-4 text-center">
                          <div className="font-extrabold text-blue-700 dark:text-blue-400">Drug Store Owner</div>
                          <div className="text-[9px] font-normal lowercase text-slate-400">Tier 2: Business & Operations</div>
                        </th>
                        <th className="py-3.5 px-4 text-center">
                          <div className="font-extrabold text-emerald-700 dark:text-emerald-400">Pharmacist</div>
                          <div className="text-[9px] font-normal lowercase text-slate-400">Tier 3: Clinical & POS</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {PERMISSION_DOMAINS.filter(
                        (d) => selectedDomain === 'ALL' || d.domain === selectedDomain
                      ).map((domain) => {
                        const filteredPerms = domain.permissions.filter(
                          (p) =>
                            searchQuery.trim() === '' ||
                            p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (filteredPerms.length === 0) return null;

                        return (
                          <React.Fragment key={domain.domain}>
                            <tr className="bg-slate-50/70 dark:bg-slate-950/40">
                              <td
                                colSpan={4}
                                className="py-2.5 px-4 text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                              >
                                {domain.domain} — <span className="text-[10px] font-normal text-slate-400 lowercase">{domain.description}</span>
                              </td>
                            </tr>
                            {filteredPerms.map((perm) => {
                              const hasSuperAdmin = ROLE_CONFIGS.SUPER_ADMIN.permissions.includes(perm.id);
                              const hasStoreOwner = ROLE_CONFIGS.STORE_OWNER.permissions.includes(perm.id);
                              const hasPharmacist = ROLE_CONFIGS.PHARMACIST.permissions.includes(perm.id);

                              return (
                                <tr key={perm.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-white">{perm.label}</span>
                                      <button
                                        onClick={() => handleCopyToken(perm.id)}
                                        className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
                                        title="Click to copy permission identifier"
                                      >
                                        {copiedToken === perm.id ? 'Copied!' : perm.id}
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      {perm.description}
                                    </p>
                                  </td>

                                  {/* Super Admin */}
                                  <td className="py-3 px-4 text-center">
                                    {hasSuperAdmin ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                                        <Check className="h-3 w-3" /> Granted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        <X className="h-3 w-3" /> Restricted
                                      </span>
                                    )}
                                  </td>

                                  {/* Drug Store Owner */}
                                  <td className="py-3 px-4 text-center">
                                    {hasStoreOwner ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                                        <Check className="h-3 w-3" /> Granted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        <X className="h-3 w-3" /> Restricted
                                      </span>
                                    )}
                                  </td>

                                  {/* Pharmacist */}
                                  <td className="py-3 px-4 text-center">
                                    {hasPharmacist ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                                        <Check className="h-3 w-3" /> Granted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
                                        <Lock className="h-3 w-3" /> Prohibited
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIEW AUTHORIZATION MAP */}
          {activeTab === 'views' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold block">UI Navigation Gatekeeper Rule:</span>
                The sidebar menu items and dashboard routing dynamically resolve against the user's role configuration. Unauthorized views are hidden from navigation and guarded by a fallback access restriction barrier.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    view: 'master_admin',
                    title: 'National Command Hub & Fleet',
                    desc: 'Central SaaS multi-store nodes, EFDA safety recalls, platform GMV settlements, and system-wide broadcast telemetry.',
                    allowed: ['SUPER_ADMIN'],
                  },
                  {
                    view: 'dashboard',
                    title: 'Executive Store Operations Dashboard',
                    desc: 'Branch KPI metrics, gross revenue, inventory valuation, active cashier shifts, and daily transactional velocity.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'pos',
                    title: 'Point of Sale (POS) Counter Terminal',
                    desc: '3-second barcode scanning checkout, Telebirr/CBE QR generation, thermal receipts, and cashier shift handover.',
                    allowed: ['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'inventory',
                    title: 'Pharmacy Inventory & FEFO Batches',
                    desc: 'Drug registry, dosage formulations, batch expiry tracking, barcode generation, and physical count adjustments.',
                    allowed: ['STORE_OWNER', 'PHARMACIST', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'sales',
                    title: 'Sales & Dispensing History',
                    desc: 'Historical invoice audits, customer receipt verification, Telebirr transaction logs, and returned medication logs.',
                    allowed: ['STORE_OWNER', 'PHARMACIST', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'purchases',
                    title: 'Procurement & Supplier POs',
                    desc: 'Wholesale pharmaceutical suppliers, purchase orders, goods receiving vouchers, and accounts payable.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'reports',
                    title: 'Financial Accounting & Reports',
                    desc: 'General ledger, Profit & Loss (P&L), Balance Sheet, Day-End Z-reports, and ML 30-Day demand forecasting.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'users',
                    title: 'Human Resources & Staff Accounts',
                    desc: 'Employee directory, attendance logs, leave management, payroll compensation, and system credential generation.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'portal_cms',
                    title: 'Public Storefront CMS & Announcements',
                    desc: 'Manage health articles, patient guidance banners, public pharmacy notices, and featured medication cards.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                  {
                    view: 'settings',
                    title: 'Store Settings & EIMS Tax Config',
                    desc: 'Pharmacy premise profile, TIN/VAT rates (15% VAT, 2% TOT), thermal printer header/footer, and Telebirr merchant credentials.',
                    allowed: ['STORE_OWNER', 'SUPER_ADMIN'],
                  },
                ].map((item) => (
                  <div
                    key={item.view}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {item.title}
                      </h4>
                      <code className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {item.view}
                      </code>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Authorized:
                      </span>
                      {rolesList.map((r) => {
                        const isAuth = item.allowed.includes(r);
                        return (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isAuth
                                ? r === 'SUPER_ADMIN'
                                  ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
                                  : r === 'STORE_OWNER'
                                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 line-through opacity-60'
                            }`}
                          >
                            {r === 'SUPER_ADMIN' ? 'Super Admin' : r === 'STORE_OWNER' ? 'Store Owner' : 'Pharmacist'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 3-CHARACTER DETAILED SPECIFICATIONS */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {rolesList.map((r) => {
                const cfg = ROLE_CONFIGS[r];
                const isCurrent = currentRole === r;
                return (
                  <div
                    key={r}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.badgeColor}`}>
                          Tier {cfg.tier}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                            Active Session
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {cfg.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {cfg.description}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Primary Workstation Capabilities:
                        </span>
                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Default View:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{cfg.primaryLandingView}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Total Permissions:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cfg.permissions.length} granted</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Allowed UI Views:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{cfg.allowedViews.length} views</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                          Strict Boundary Prohibitions:
                        </span>
                        <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                          {cfg.prohibitedActions.map((act, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <X className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {onSimulateRole && (
                      <button
                        onClick={() => onSimulateRole(r)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                        }`}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Current Active Role' : `Switch & Simulate ${cfg.shortTitle}`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: API & SECURITY GUARDS */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Server-Side Middleware Authorization Standard</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Every inbound HTTP request to the Express backend is validated through <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">requireRole()</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">requirePermission()</code> guards in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">src/server/roleGuard.ts</code>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">Protected API Routes</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                      <li>• PATCH /api/fleet/pharmacies/:id/status → <span className="text-indigo-600 font-bold">SUPER_ADMIN</span></li>
                      <li>• PUT /api/pharmacy/profile → <span className="text-blue-600 font-bold">STORE_OWNER, SUPER_ADMIN</span></li>
                      <li>• POST /api/users → <span className="text-blue-600 font-bold">STORE_OWNER, SUPER_ADMIN</span></li>
                      <li>• POST /api/purchases → <span className="text-blue-600 font-bold">STORE_OWNER, SUPER_ADMIN</span></li>
                      <li>• POST /api/sales → <span className="text-emerald-600 font-bold">PHARMACIST, STORE_OWNER, SUPER_ADMIN</span></li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">Client UI Synchronization</span>
                    <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                      <li>• Real-time role check via <code className="font-mono text-[10px]">/api/auth/me</code></li>
                      <li>• Dynamic sidebar navigation filtering</li>
                      <li>• Blocked view interception barrier in <code className="font-mono text-[10px]">App.tsx</code></li>
                      <li>• Zero-bypass client-side routing protection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>Role policies are enforced symmetrically on client-side React UI and server Express REST endpoints.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold transition shadow-xs cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
