import React, { useState, useMemo } from 'react';
import { AuditLog, User } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  Activity,
  Search,
  Filter,
  UserCheck,
  ShoppingBag,
  SlidersHorizontal,
  PlusCircle,
  Key,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
} from 'lucide-react';

interface UserActivityLogProps {
  auditLogs: AuditLog[];
  users: User[];
  onRefresh?: () => void;
  onAddLog?: (log: AuditLog) => void;
}

export const UserActivityLog: React.FC<UserActivityLogProps> = ({
  auditLogs,
  users,
  onRefresh,
  onAddLog,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Categories filter options
  const actionCategories = [
    { id: 'ALL', label: 'All Action Categories' },
    { id: 'SALE', label: 'Sales & POS Transactions' },
    { id: 'INVENTORY', label: 'Stock Adjustments & FEFO' },
    { id: 'PURCHASE', label: 'Purchases & Restocking' },
    { id: 'USER', label: 'Staff Accounts & RBAC' },
    { id: 'AUTH', label: 'Logins & Security' },
  ];

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // User filter
      const matchesUser = selectedUser === 'ALL' || log.userId === selectedUser || log.userName === selectedUser;

      // Category filter
      let matchesCat = true;
      if (selectedCategory === 'SALE') {
        matchesCat = log.action.includes('SALE') || log.entityType.includes('SALE') || log.action.includes('POS');
      } else if (selectedCategory === 'INVENTORY') {
        matchesCat =
          log.action.includes('STOCK') ||
          log.action.includes('ADJUSTMENT') ||
          log.action.includes('BATCH') ||
          log.action.includes('FEFO') ||
          log.entityType.includes('INVENTORY');
      } else if (selectedCategory === 'PURCHASE') {
        matchesCat = log.action.includes('PURCHASE') || log.entityType.includes('PURCHASE');
      } else if (selectedCategory === 'USER') {
        matchesCat = log.action.includes('USER') || log.entityType.includes('USER') || log.action.includes('ROLE');
      } else if (selectedCategory === 'AUTH') {
        matchesCat = log.action.includes('LOGIN') || log.action.includes('LOGOUT') || log.action.includes('SECURITY');
      }

      // Search query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (log.userName || '').toLowerCase().includes(q) ||
        (log.action || '').toLowerCase().includes(q) ||
        (log.entityType || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q);

      return matchesUser && matchesCat && matchesSearch;
    });
  }, [auditLogs, selectedUser, selectedCategory, searchQuery]);

  // Compute Summary Statistics
  const salesCount = useMemo(
    () => auditLogs.filter((l) => l.action.includes('SALE') || l.entityType.includes('SALE')).length,
    [auditLogs]
  );
  const inventoryCount = useMemo(
    () =>
      auditLogs.filter(
        (l) => l.action.includes('STOCK') || l.action.includes('ADJUST') || l.entityType.includes('INVENTORY')
      ).length,
    [auditLogs]
  );
  const activeStaffCount = users.filter((u) => u.isActive).length;

  // Helper badge color assigner
  const getEventBadge = (action: string, entityType: string) => {
    const act = (action + ' ' + entityType).toUpperCase();
    if (act.includes('SALE') || act.includes('CHECKOUT')) {
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        icon: ShoppingBag,
        label: 'POS SALE',
      };
    }
    if (act.includes('ADJUST') || act.includes('STOCK') || act.includes('FEFO') || act.includes('DAMAGED') || act.includes('EXPIRED')) {
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        icon: SlidersHorizontal,
        label: 'INVENTORY ADJUST',
      };
    }
    if (act.includes('PURCHASE') || act.includes('BATCH')) {
      return {
        bg: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
        icon: Boxes,
        label: 'RESTOCK BATCH',
      };
    }
    if (act.includes('USER') || act.includes('ACCOUNT')) {
      return {
        bg: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
        icon: UserCheck,
        label: 'STAFF ADMIN',
      };
    }
    return {
      bg: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
      icon: Activity,
      label: action,
    };
  };

  // Simulate new staff activity log item
  const handleSimulateAction = () => {
    setIsSimulating(true);
    const actionsPool = [
      {
        userId: 'u-3',
        userName: 'Pharm. Solomon Bekele',
        action: 'SALE_COMPLETED',
        entityType: 'SALE',
        details: `Processed prescription transaction #INV-${Math.floor(100000 + Math.random() * 900000)} (Paracetamol 500mg, Amoxicillin 500mg) for 480 ETB via Mobile Money`,
      },
      {
        userId: 'u-5',
        userName: 'Yonas Girma',
        action: 'INVENTORY_ADJUSTMENT',
        entityType: 'INVENTORY',
        details: `FEFO Stock Rotation: Adjusted batch KZ-BATCH-2026-04 quantity (-3 damaged packages quarantined)`,
      },
      {
        userId: 'u-2',
        userName: 'Bethlehem Worku',
        action: 'PURCHASE_ORDER_RECEIVED',
        entityType: 'PURCHASE',
        details: `Received supplier batch shipment #PO-9021 from MedPharm Wholesale (100 boxes Ciprofloxacin 500mg)`,
      },
      {
        userId: 'u-4',
        userName: 'Hana Kebede',
        action: 'CASHIER_COUNTER_LOGIN',
        entityType: 'AUTH',
        details: `Staff logged into POS Terminal Node #2 at Kaziniya Flagship Store`,
      },
    ];

    const randomAction = actionsPool[Math.floor(Math.random() * actionsPool.length)];
    const newLogItem: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: randomAction.userId,
      userName: randomAction.userName,
      action: randomAction.action,
      entityType: randomAction.entityType,
      entityId: `ent-${Date.now()}`,
      details: randomAction.details,
      ipAddress: '192.168.1.104',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      if (onAddLog) {
        onAddLog(newLogItem);
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base dark:text-white">
                Staff Activity & Audit Trail Log
              </h3>
              <p className="text-xs text-slate-500">
                Real-time traceability for all staff actions, inventory adjustments, sales transactions, and security events
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateAction}
            disabled={isSimulating}
            className="rounded-xl border border-teal-600 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100 transition inline-flex items-center gap-1.5 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800"
          >
            <PlusCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>{isSimulating ? 'Logging...' : 'Log Test Staff Action'}</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300"
              title="Refresh Audit Logs"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 MINI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl dark:bg-slate-950 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL AUDIT LOGS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{auditLogs.length}</span>
            <span className="text-xs text-teal-600 font-bold">100% Verified</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-900 space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block dark:text-emerald-400">
            SALES & POS ACTIONS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-300">{salesCount}</span>
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl dark:bg-amber-950/40 dark:border-amber-900 space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block dark:text-amber-400">
            STOCK ADJUSTMENTS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-950 dark:text-amber-300">{inventoryCount}</span>
            <SlidersHorizontal className="h-4 w-4 text-amber-600" />
          </div>
        </div>

        <div className="bg-purple-50/70 border border-purple-200 p-4 rounded-xl dark:bg-purple-950/40 dark:border-purple-900 space-y-1">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block dark:text-purple-400">
            ACTIVE STAFF ACCOUNTS
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-950 dark:text-purple-300">{activeStaffCount}</span>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* User Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Filter by Staff Member
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          >
            <option value="ALL">All Staff Members</option>
            {users.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Action Category Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Event Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
          >
            {actionCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Search Audit Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, batch, or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 p-2 text-xs text-slate-800 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED TIMELINE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Displaying {filteredLogs.length} staff action records</span>
          <span className="font-mono text-[10px] text-slate-400">Cryptographically Hashed Event Logs</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl dark:border-slate-800">
            No activity logs match the selected staff or category filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden dark:divide-slate-800 dark:border-slate-800">
            {filteredLogs.map((log) => {
              const badge = getEventBadge(log.action, log.entityType);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={log.id}
                  className="p-4 bg-white hover:bg-slate-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-slate-900 dark:hover:bg-slate-950/60"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${badge.bg}`}>
                      <BadgeIcon className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm dark:text-white">
                          {log.userName || 'System Auto-Task'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {log.ipAddress || 'Internal Dashboard Node'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-mono dark:text-slate-300 leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono text-[11px] text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
