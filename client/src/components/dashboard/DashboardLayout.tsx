import React, { useState, useEffect } from 'react';
import { User, UserRole, StoreAlert, StoreAlertsResponse } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { safeFetchJson } from '../../utils/api';
import { RoleManagerModal } from './RoleManagerModal';
import { UserProfileModal } from './UserProfileModal';
import {
  getEffectiveRole,
  getRoleConfig,
  ROLE_CONFIGS,
  hasPermission,
} from '../../utils/roleManager';
import { WorkstationId } from './WorkstationDropdown';
import {
  LayoutDashboard,
  Pill,
  ShoppingBag,
  Truck,
  BarChart3,
  Users,
  ShieldCheck,
  Shield,
  Settings,
  Bell,
  LogOut,
  Smartphone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Store,
  Layers,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Calculator,
  Warehouse,
  Lock,
  Menu,
  User as UserIcon,
  Globe,
  Key,
  Calendar,
  Building2,
  Box,
  FileText,
  UserCheck,
  HelpCircle,
  Clock,
  Sparkles,
  Boxes,
  PenSquare,
  HandHeart,
  PlusCircle,
  RotateCcw,
  FileCheck,
  Receipt,
  Banknote,
  Scale,
  TrendingUp,
  GitFork,
  Tag,
  Gauge,
  BookOpen,
  UserX,
  Briefcase,
  Building,
  ShoppingCart,
  Download,
  CreditCard,
  SlidersHorizontal,
  List,
  ArrowLeftRight,
  CalendarX,
  FileSpreadsheet,
  PieChart,
  Keyboard,
  Command,
  Cpu,
  Activity,
  AlertOctagon,
  Radio,
  Server,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface DashboardLayoutProps {
  currentUser: User;
  onSelectRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onNavigateSubItem?: (view: string, itemId: string) => void;
  onOpenMobileApp: () => void;
  onOpenShiftHandover?: () => void;
  onOpenRoleManager?: () => void;
  onLogout: () => void;
  onBackToPublicPortal?: () => void;
  onSwitchWorkstation?: (workstation: WorkstationId, subTab?: string) => void;
  onOpenDocumentation?: () => void;
  onUpdateUser?: (updated: User) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  onSelectRole,
  activeView,
  setActiveView,
  onNavigateSubItem,
  onOpenMobileApp,
  onOpenShiftHandover,
  onOpenRoleManager,
  onLogout,
  onBackToPublicPortal,
  onSwitchWorkstation,
  onOpenDocumentation,
  onUpdateUser,
  children,
}) => {
  const [alertsData, setAlertsData] = useState<StoreAlertsResponse | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFetchingAlerts, setIsFetchingAlerts] = useState(false);
  const [showUserProfileMenu, setShowUserProfileMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfileInitialTab, setUserProfileInitialTab] = useState<'general' | 'security' | 'permissions'>('general');
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isOnline, queuedSalesCount } = useNetworkStatus();

  // Expandable accordions state for menubar items (all closed by default so user opens them manually)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    medicines: false,
    sales_mgmt: false,
    stock_mgmt: false,
    procurement: false,
    accounting: false,
    store_accounting: false,
    expense_mgmt: false,
    human_resources: false,
    attendance_schedules: false,
    leave_mgmt: false,
    payroll_comp: false,
    performance_eval: false,
    org_structure: false,
    notifications: false,
    analytics: false,
    branch_settings_grp: false,
    payment_methods_grp: false,
    sys_config: false,
  });

  // Global Keyboard Shortcuts (F1 for POS, F2 for Inventory, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // Trigger function shortcuts
      if (e.key === 'F1' || (e.altKey && e.key === '1')) {
        e.preventDefault();
        setActiveView('pos');
        triggerShortcutToast('Switched to POS Terminal (F1)');
      } else if (e.key === 'F2' || (e.altKey && e.key === '2')) {
        e.preventDefault();
        setActiveView('inventory');
        triggerShortcutToast('Switched to Inventory & Stock (F2)');
      } else if (e.key === 'F3' || (e.altKey && e.key === '3')) {
        e.preventDefault();
        setActiveView('purchases');
        triggerShortcutToast('Switched to Purchases & Suppliers (F3)');
      } else if (e.key === 'F4' || (e.altKey && e.key === '4')) {
        e.preventDefault();
        setActiveView('sales');
        triggerShortcutToast('Switched to Sales Ledger (F4)');
      } else if (e.key === 'F6' || (e.altKey && e.key === '6')) {
        e.preventDefault();
        setActiveView('dashboard');
        triggerShortcutToast('Switched to Store Overview (F6)');
      } else if (e.key === 'F7' || (e.altKey && e.key === '7')) {
        e.preventDefault();
        setActiveView('reports');
        triggerShortcutToast('Switched to Accounting & Reports (F7)');
      } else if (e.key === 'F8' || (e.altKey && e.key === '8')) {
        e.preventDefault();
        setActiveView('users');
        triggerShortcutToast('Switched to Staff & HR (F8)');
      } else if (e.key === 'F9' || (!isInput && (e.key === '?' || (e.shiftKey && e.key === '/')))) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowShortcutsModal(false);
        setShowNotifications(false);
        setShowUserProfileMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  const triggerShortcutToast = (text: string) => {
    setShortcutToast(text);
    setTimeout(() => {
      setShortcutToast(null);
    }, 2200);
  };

  const fetchAlerts = async () => {
    try {
      setIsFetchingAlerts(true);
      const res = await safeFetchJson<StoreAlertsResponse>('/api/notifications/alerts');
      if (res.success && res.data) {
        setAlertsData(res.data);
      }
    } catch (e) {
      console.warn('Alerts fetch fallback:', e);
    } finally {
      setIsFetchingAlerts(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissAlert = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await safeFetchJson<StoreAlertsResponse>('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (res.success && res.data) {
        setAlertsData(res.data);
      }
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      const res = await safeFetchJson<StoreAlertsResponse>('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true }),
      });
      if (res.success && res.data) {
        setAlertsData(res.data);
      }
    } catch (err) {
      console.error('Failed to clear alerts:', err);
    }
  };

  const handleAlertClick = (alert: StoreAlert) => {
    setShowNotifications(false);
    if (alert.actionTarget === 'inquiries') {
      setActiveView('inquiries');
    } else if (alert.actionTarget === 'batch_mgmt') {
      setActiveView('inventory');
      onNavigateSubItem?.('inventory', 'batch_mgmt');
    } else {
      setActiveView('inventory');
    }
  };

  const handleOpenNotificationCenter = () => {
    setShowNotifications(false);
    setActiveView('settings');
    onNavigateSubItem?.('settings', 'all_notifications');
  };

  const toggleMenu = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to handle view routing based on menu item clicks
  const handleItemClick = (id: string) => {
    if (id === 'role_manager' || id === 'master_staff_rbac') {
      setIsRoleManagerOpen(true);
      return;
    }

    let targetView = 'dashboard';
    if (
      id.startsWith('master_') ||
      id === 'master_admin' ||
      id === 'fleet_management' ||
      id === 'efda_compliance' ||
      id === 'national_catalog' ||
      id === 'system_broadcast'
    ) {
      targetView = 'master_admin';
    } else if (['inquiries', 'customer_inquiries'].includes(id)) {
      targetView = 'inquiries';
    } else if (['inventory_add', 'add_product', 'add_medicine'].includes(id)) {
      targetView = 'add_medicine';
    } else if (['inventory', 'inventory_expired', 'inventory_archived', 'stock_movements', 'stock_adjustments', 'stock_requests', 'create_stock_req', 'batch_mgmt', 'expiry_tracking', 'inventory_health', 'medicines', 'inspect_flagship'].includes(id)) {
      targetView = 'inventory';
    } else if (['pos'].includes(id)) {
      targetView = 'pos';
    } else if (['all_sales', 'online_orders', 'sales_returns', 'sales_analysis', 'sales', 'sales_mgmt'].includes(id)) {
      targetView = 'sales';
    } else if (['suppliers', 'purchase_orders', 'goods_receipts', 'purchase_invoices', 'supplier_payments', 'purchase_returns', 'ap_dashboard', 'purchases', 'procurement'].includes(id)) {
      targetView = 'purchases';
    } else if (['acc_dashboard', 'journal_entries', 'branch_reports', 'store_dashboard', 'chart_of_accounts', 'all_journal_entries', 'trial_balance', 'profit_loss', 'balance_sheet', 'accounting_periods', 'account_mapping', 'all_expenses', 'create_expense', 'expense_categories', 'expense_reports', 'stock_report', 'movement_report', 'financial_trends', 'my_exports', 'reports', 'accounting', 'expense_mgmt', 'store_accounting', 'analytics', 'analytics_dashboard', 'ml_forecast'].includes(id)) {
      targetView = 'reports';
    } else if (['customers', 'employees', 'hr_dashboard', 'attendance', 'schedules', 'leave_requests', 'leave_types', 'payroll', 'loans', 'performance', 'offboarding', 'departments', 'job_titles', 'users', 'human_resources', 'attendance_schedules', 'leave_mgmt', 'payroll_comp', 'performance_eval', 'org_structure'].includes(id)) {
      targetView = 'users';
    } else if (['portal_cms'].includes(id)) {
      targetView = 'portal_cms';
    } else if (['registration_hub'].includes(id)) {
      targetView = 'registration_hub';
    } else if (['settings', 'store_settings', 'eims_config', 'branch_settings', 'branch_scheduling', 'all_methods', 'add_method', 'payment_keys', 'all_notifications', 'notif_settings', 'sys_config', 'payment_methods_grp', 'branch_mgmt', 'branch_settings_grp'].includes(id)) {
      targetView = 'settings';
    } else {
      targetView = 'dashboard';
    }

    setActiveView(targetView);
    setIsMobileMenuOpen(false);
    if (onNavigateSubItem) {
      onNavigateSubItem(targetView, id);
    }
  };

  const effectiveRole = getEffectiveRole(currentUser);
  const isSuperAdmin = effectiveRole === 'SUPER_ADMIN';
  const isPharmacist = effectiveRole === 'PHARMACIST';
  const isSupplier = effectiveRole === 'SUPPLIER';
  const isOwner = effectiveRole === 'STORE_OWNER';
  const roleConfig = getRoleConfig(effectiveRole);

  // View Permission Guard: Ensure activeView is allowed for the user's effective role
  useEffect(() => {
    if (roleConfig && !roleConfig.allowedViews.includes(activeView)) {
      const fallback = isSuperAdmin ? 'master_admin' : isSupplier ? 'purchases' : 'dashboard';
      setActiveView(fallback);
    }
  }, [effectiveRole, activeView, roleConfig, isSuperAdmin, isPharmacist, isSupplier, setActiveView]);

  // Menubar structure - strictly Super Admin centric for Super Admin, store-centric for owner, and dispensing-centric for pharmacist
  const navGroups = isSuperAdmin
    ? [
        {
          group: 'PHARMACIES & STORES',
          items: [
            {
              id: 'master_hub',
              label: 'Overview',
              icon: Shield,
              hasSubmenu: false,
            },
            {
              id: 'master_nodes',
              label: 'Branch Stores',
              icon: Building2,
              hasSubmenu: true,
              subItems: [
                { id: 'master_nodes_list', label: 'All Stores (6)', icon: List },
                { id: 'master_nodes_pending', label: 'Pending Approvals (1)', icon: Clock },
                { id: 'master_nodes_onboard', label: 'Add New Store', icon: PlusCircle },
              ],
            },
            {
              id: 'master_compliance',
              label: 'Licenses & Recalls',
              icon: FileCheck,
              hasSubmenu: true,
              subItems: [
                { id: 'master_efda_licenses', label: 'Store Licenses', icon: ShieldCheck },
                { id: 'master_recalls', label: 'Medicine Recalls', icon: AlertOctagon },
              ],
            },
          ],
        },
        {
          group: 'MEDICINES & CATALOG',
          items: [
            {
              id: 'master_catalog',
              label: 'Medicine Catalog',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'master_catalog_all', label: 'All Medicines List', icon: List },
                { id: 'master_shortages', label: 'Low Stock Alerts', icon: AlertTriangle },
                { id: 'master_price_ceilings', label: 'Price Limits Check', icon: Tag },
              ],
            },
          ],
        },
        {
          group: 'SALES & FINANCES',
          items: [
            {
              id: 'master_financials',
              label: 'Sales & Revenue',
              icon: BarChart3,
              hasSubmenu: true,
              subItems: [
                { id: 'master_analytics', label: 'Sales Analytics & Charts', icon: TrendingUp, badge: 'Live' },
                { id: 'master_gmv', label: 'Branch Sales Reports', icon: BarChart3 },
                { id: 'master_settlements', label: 'Mobile & Bank Payments', icon: Receipt },
              ],
            },
          ],
        },
        {
          group: 'STAFF & TEAMS',
          items: [
            {
              id: 'master_staff',
              label: 'Staff Directory',
              icon: Users,
              hasSubmenu: true,
              subItems: [
                { id: 'master_staff_all', label: 'All Staff Members', icon: List },
                { id: 'role_manager', label: 'Roles & Permissions', icon: Lock },
              ],
            },
          ],
        },
        {
          group: 'SYSTEM & TOOLS',
          items: [
            {
              id: 'master_health',
              label: 'System & Announcements',
              icon: Server,
              hasSubmenu: true,
              subItems: [
                { id: 'master_broadcast', label: 'Send Urgent Announcement', icon: Radio },
                { id: 'master_telemetry', label: 'System & Database Health', icon: Activity },
              ],
            },
            { id: 'portal_cms', label: 'Website Content', icon: Globe },
            { id: 'registration_hub', label: 'New Store Applications', icon: Store },
          ],
        },
        {
          group: 'VISIT PHARMACY STORES',
          items: [
            {
              id: 'store_inspection_grp',
              label: 'Switch to Store View',
              icon: Store,
              hasSubmenu: true,
              subItems: [
                { id: 'inspect_flagship', label: 'Flagship Store (Addis Ababa)', icon: Store },
                { id: 'inventory', label: 'View Shelf Inventory', icon: Boxes },
                { id: 'pos', label: 'View POS Cashier Counter', icon: CreditCard },
                { id: 'all_sales', label: 'View Sales Invoices', icon: Receipt },
                { id: 'reports', label: 'View Daily Cash Reports (Z-Report)', icon: FileText },
              ],
            },
            {
              id: 'sys_config',
              label: 'Settings',
              icon: SlidersHorizontal,
              hasSubmenu: true,
              subItems: [
                { id: 'store_settings', label: 'Store Settings', icon: PenSquare },
                { id: 'eims_config', label: 'Tax & Invoice Settings', icon: FileText },
              ],
            },
          ],
        },
      ]
    : isPharmacist
    ? [
        {
          group: 'DISPENSING & CASHIER',
          items: [
            { id: 'dashboard', label: 'Pharmacist Overview', icon: Gauge },
            { id: 'pos', label: 'Cashier / Sell (POS)', icon: Store },
            {
              id: 'sales_mgmt',
              label: 'Sales & Dispense History',
              icon: FileText,
              hasSubmenu: true,
              subItems: [
                { id: 'all_sales', label: 'All Dispensed Sales', icon: List },
                { id: 'sales_returns', label: 'Sales Returns & Refunds', icon: RotateCcw },
              ],
            },
          ],
        },
        {
          group: 'MEDICINES & SHELVES',
          items: [
            {
              id: 'medicines',
              label: 'Medicines & Shelves',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'inventory', label: 'Search Medicines', icon: List },
                { id: 'inventory_add', label: 'Add Medicine', icon: PlusCircle },
                { id: 'batch_mgmt', label: 'Batches & Expiry Dates', icon: Layers },
                { id: 'stock_adjustments', label: 'Adjust Stock Count', icon: PenSquare },
                { id: 'stock_movements', label: 'Stock & Dispense Logs', icon: ArrowLeftRight },
              ],
            },
          ],
        },
        {
          group: 'DAILY SUMMARY & PERMISSIONS',
          items: [
            { id: 'reports', label: 'Daily Sales Report (Z-Report)', icon: FileSpreadsheet },
            { id: 'role_manager', label: 'My Permissions', icon: ShieldCheck },
          ],
        },
      ]
    : isSupplier
    ? [
        {
          group: 'WHOLESALE & PURCHASES',
          items: [
            { id: 'purchases', label: 'Wholesale Orders & POs', icon: Truck },
            { id: 'suppliers', label: 'Supplier Accounts & AP', icon: Building2 },
            { id: 'goods_receipts', label: 'Goods Receipts (GRN)', icon: FileCheck },
            { id: 'purchase_invoices', label: 'Invoices & Vendor Bills', icon: Receipt },
            { id: 'supplier_payments', label: 'Supplier Payments', icon: Banknote },
            { id: 'purchase_returns', label: 'Purchase Returns', icon: RotateCcw },
          ],
        },
        {
          group: 'BULK CATALOG & STOCK',
          items: [
            { id: 'inventory', label: 'Bulk Medicines Catalog', icon: Pill },
            { id: 'batch_mgmt', label: 'Batches & Expiry Dates', icon: Layers },
          ],
        },
        {
          group: 'SUMMARY & PERMISSIONS',
          items: [
            { id: 'dashboard', label: 'Supplier Station Overview', icon: Gauge },
            { id: 'reports', label: 'Procurement Reports', icon: BarChart3 },
            { id: 'role_manager', label: 'My Permissions', icon: ShieldCheck },
          ],
        },
      ]
    : [
        {
          group: 'MEDICINES & POS',
          items: [
            {
              id: 'medicines',
              label: 'Medicines',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'inventory', label: 'All Medicines', icon: List },
                { id: 'inventory_add', label: 'Add Medicine', icon: PlusCircle },
                { id: 'inventory_expired', label: 'Expired Medicines', icon: CalendarX },
                { id: 'inventory_archived', label: 'Archived Medicines', icon: Box },
              ],
            },
            { id: 'pos', label: 'Cashier / Sell (POS)', icon: Receipt },
            {
              id: 'sales_mgmt',
              label: 'Sales Records',
              icon: FileText,
              hasSubmenu: true,
              subItems: [
                { id: 'all_sales', label: 'All Sales', icon: List },
                { id: 'online_orders', label: 'Online Orders', icon: Globe },
                { id: 'sales_returns', label: 'Sales Returns', icon: RotateCcw },
              ],
            },
          ],
        },
        {
          group: 'STOCK & SUPPLIERS',
          items: [
            { id: 'inventory_health', label: 'Stock Health', icon: TrendingUp },
            { id: 'store_settings', label: 'Store Shelves & Rooms', icon: Warehouse },
            {
              id: 'stock_mgmt',
              label: 'Stock Management',
              icon: Boxes,
              hasSubmenu: true,
              subItems: [
                { id: 'stock_movements', label: 'Stock Movements', icon: ArrowLeftRight },
                { id: 'stock_adjustments', label: 'Adjust Stock Count', icon: PenSquare },
                { id: 'stock_requests', label: 'Stock Requests', icon: HandHeart },
                { id: 'create_stock_req', label: 'New Stock Request', icon: PlusCircle },
                { id: 'batch_mgmt', label: 'Batch & Expiry Dates', icon: Layers },
                { id: 'stock_report', label: 'Stock Report', icon: FileText },
                { id: 'expiry_tracking', label: 'Expiring Soon', icon: CalendarX },
                { id: 'movement_report', label: 'Movement History', icon: FileSpreadsheet },
              ],
            },
            { id: 'online_orders', label: 'Customer Holds', icon: Lock },
            {
              id: 'procurement',
              label: 'Supplier Orders',
              icon: Truck,
              hasSubmenu: true,
              subItems: [
                { id: 'suppliers', label: 'Suppliers', icon: Truck },
                { id: 'purchase_orders', label: 'Orders Sent to Suppliers', icon: FileText },
                { id: 'goods_receipts', label: 'Received Deliveries', icon: FileCheck },
                { id: 'purchase_invoices', label: 'Supplier Bills', icon: Receipt },
                { id: 'supplier_payments', label: 'Payments Made', icon: Banknote },
                { id: 'purchase_returns', label: 'Returned to Supplier', icon: RotateCcw },
                { id: 'ap_dashboard', label: 'Bills to Pay', icon: PieChart },
              ],
            },
          ],
        },
        {
          group: 'FINANCES & EXPENSES',
          items: [
            {
              id: 'accounting',
              label: 'Store Finances',
              icon: Calculator,
              hasSubmenu: true,
              subItems: [
                { id: 'acc_dashboard', label: 'Finance Overview', icon: Gauge },
                { id: 'journal_entries', label: 'Bookkeeping Entries', icon: BookOpen },
                { id: 'branch_reports', label: 'Branch Reports', icon: BarChart3 },
                {
                  id: 'store_accounting',
                  label: 'Store Accounts',
                  icon: Store,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'store_dashboard', label: 'Accounts Summary', icon: Gauge },
                    { id: 'chart_of_accounts', label: 'List of Accounts', icon: List },
                    { id: 'all_journal_entries', label: 'All Entries', icon: BookOpen },
                    { id: 'trial_balance', label: 'Trial Balance', icon: Scale },
                    { id: 'profit_loss', label: 'Income & Expenses (P&L)', icon: TrendingUp },
                    { id: 'balance_sheet', label: 'Balance Sheet', icon: FileText },
                    { id: 'accounting_periods', label: 'Monthly Periods', icon: Calendar },
                    { id: 'account_mapping', label: 'Account Linking', icon: GitFork },
                  ],
                },
                {
                  id: 'expense_mgmt',
                  label: 'Store Expenses',
                  icon: Receipt,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'all_expenses', label: 'All Expenses', icon: List },
                    { id: 'create_expense', label: 'Record New Expense', icon: PlusCircle },
                    { id: 'expense_categories', label: 'Expense Types', icon: Tag },
                    { id: 'expense_reports', label: 'Expense Reports', icon: BarChart3 },
                  ],
                },
              ],
            },
          ],
        },
        {
          group: 'CUSTOMERS & INQUIRIES',
          items: [
            { id: 'customers', label: 'Customer Directory', icon: Users },
            {
              id: 'inquiries',
              label: 'Customer Inquiries',
              icon: MessageSquare,
              badge: alertsData?.inquiriesCount,
            },
          ],
        },
        {
          group: 'STAFF & ATTENDANCE',
          items: [
            {
              id: 'human_resources',
              label: 'Staff Team',
              icon: UserCheck,
              hasSubmenu: true,
              subItems: [
                { id: 'hr_dashboard', label: 'Staff Overview', icon: Gauge },
                { id: 'employees', label: 'Team Members', icon: Users },
                { id: 'role_manager', label: 'Staff Permissions', icon: ShieldCheck },
                {
                  id: 'attendance_schedules',
                  label: 'Attendance & Shifts',
                  icon: Clock,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'attendance', label: 'Daily Check-in', icon: Clock },
                    { id: 'schedules', label: 'Work Shifts', icon: Calendar },
                  ],
                },
                {
                  id: 'leave_mgmt',
                  label: 'Time Off & Leave',
                  icon: Calendar,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'leave_requests', label: 'Leave Requests', icon: Calendar },
                    { id: 'leave_types', label: 'Leave Types', icon: Calendar },
                  ],
                },
                {
                  id: 'payroll_comp',
                  label: 'Salaries & Pay',
                  icon: Banknote,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'payroll', label: 'Monthly Salaries', icon: FileText },
                    { id: 'loans', label: 'Staff Advances', icon: Banknote },
                  ],
                },
                {
                  id: 'performance_eval',
                  label: 'Staff Activity & Reviews',
                  icon: TrendingUp,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'performance', label: 'Activity Logs', icon: TrendingUp },
                    { id: 'offboarding', label: 'Former Staff', icon: UserX },
                  ],
                },
                {
                  id: 'org_structure',
                  label: 'Job Roles & Teams',
                  icon: Building2,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'departments', label: 'Departments', icon: Building },
                    { id: 'job_titles', label: 'Job Titles', icon: Briefcase },
                  ],
                },
              ],
            },
            {
              id: 'notifications',
              label: 'Store Alerts',
              icon: Bell,
              hasSubmenu: true,
              subItems: [
                { id: 'all_notifications', label: 'All Alerts', icon: List },
                { id: 'notif_settings', label: 'Alert Settings', icon: Settings },
              ],
            },
          ],
        },
        {
          group: 'REPORTS & INSIGHTS',
          items: [
            {
              id: 'analytics',
              label: 'Store Reports',
              icon: PieChart,
              hasSubmenu: true,
              subItems: [
                { id: 'analytics_dashboard', label: 'Reports Overview', icon: Gauge },
                { id: 'sales_analysis', label: 'Sales Insights', icon: ShoppingCart },
                { id: 'inventory_health', label: 'Stock Health Report', icon: Boxes },
                { id: 'financial_trends', label: 'Revenue & Growth', icon: Banknote },
              ],
            },
          ],
        },
        {
          group: 'SETTINGS',
          items: [
            { id: 'store_settings', label: 'Store Details & Profile', icon: Settings },
            { id: 'payment_methods_grp', label: 'Payment Methods', icon: CreditCard },
          ],
        },
      ];

  const filteredNavGroups = navGroups
    .map((group) => {
      const query = sidebarSearch.toLowerCase().trim();
      if (!query) return group;
      const filteredItems = group.items.filter((item: any) => {
        if (item.label.toLowerCase().includes(query)) return true;
        if (item.subItems) {
          return item.subItems.some((sub: any) => {
            if (sub.label.toLowerCase().includes(query)) return true;
            if (sub.subItems) {
              return sub.subItems.some((leaf: any) => leaf.label.toLowerCase().includes(query));
            }
            return false;
          });
        }
        return false;
      });
      return { ...group, items: filteredItems };
    })
    .filter((g) => g.items.length > 0);

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* TOP HEADER BAR - RICH BLUE #0070BA */}
      <header className="h-14 bg-[#0070BA] text-white px-3 sm:px-6 flex items-center justify-between shadow-md z-40 shrink-0">
        {/* Left: Mobile Menu Toggle, Date Display & Back to Public Portal */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Toggle navigation menu"
            title="Toggle Menu Bar"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden lg:flex items-center gap-2 bg-[#005A96] px-3.5 py-1.5 rounded-xl border border-sky-400/20 text-xs font-semibold text-white shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-sky-200" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

        </div>

        {/* Right Controls: Network Status, Notifications, Shift Handover, User Profile */}
        <div className="flex items-center gap-3">

          {/* Network / Service Worker Status Indicator */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30'
                : 'bg-amber-500/30 text-amber-100 border-amber-400/40 animate-pulse'
            }`}
            title={isOnline ? 'Network Connected (Service Worker Active)' : 'Offline Mode (Service Worker Fallback)'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {queuedSalesCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-slate-900">
                {queuedSalesCount}
              </span>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Store Alerts & Notifications"
            >
              <Bell className="h-4 w-4" />
              {alertsData && alertsData.totalAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white border border-[#0070BA] animate-pulse">
                  {alertsData.totalAlertCount > 99 ? '99+' : alertsData.totalAlertCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-88 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 z-50 text-slate-900 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Store Alerts ({alertsData?.totalAlertCount || 0})
                    </span>
                    {alertsData && alertsData.totalAlertCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {alertsData.outOfStockCount > 0
                          ? `${alertsData.outOfStockCount} Out of Stock`
                          : `${alertsData.lowStockCount} Low Stock`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={fetchAlerts}
                      disabled={isFetchingAlerts}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                      title="Refresh Alerts"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isFetchingAlerts ? 'animate-spin text-teal-600' : ''}`} />
                    </button>
                    {alertsData && alertsData.totalAlertCount > 0 && (
                      <button
                        onClick={handleClearAllAlerts}
                        className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-1.5 py-0.5 rounded transition cursor-pointer"
                        title="Dismiss all active alerts"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Alerts List */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5">
                  {!alertsData || alertsData.totalAlertCount === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">All Shelves Healthy</p>
                      <p className="text-[11px] text-slate-500">
                        No critical low-stock items or expiring batches requiring attention.
                      </p>
                    </div>
                  ) : (
                    alertsData.alerts.map((alert) => {
                      const isDanger = alert.type === 'danger';
                      const isInfo = alert.type === 'info' || alert.category === 'CUSTOMER_INQUIRY';
                      return (
                        <div
                          key={alert.id}
                          onClick={() => handleAlertClick(alert)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition relative group ${
                            isDanger
                              ? 'bg-rose-50/80 hover:bg-rose-100/80 border-rose-200 text-rose-950'
                              : isInfo
                              ? 'bg-sky-50/80 hover:bg-sky-100/80 border-sky-200 text-sky-950'
                              : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-950'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {isDanger ? (
                                <AlertOctagon className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                              ) : isInfo ? (
                                <MessageSquare className="h-4 w-4 text-[#0070ba] mt-0.5 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                              )}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs">{alert.title}</span>
                                  <span
                                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                      isDanger
                                        ? 'bg-rose-200 text-rose-800'
                                        : isInfo
                                        ? 'bg-sky-200 text-sky-800'
                                        : 'bg-amber-200 text-amber-800'
                                    }`}
                                  >
                                    {alert.category.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-[11px] opacity-90 leading-relaxed">{alert.message}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDismissAlert(alert.id, e)}
                              className="text-slate-400 hover:text-slate-600 opacity-60 group-hover:opacity-100 p-0.5 rounded transition cursor-pointer"
                              title="Dismiss Alert"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[10px] opacity-75">
                            <span>
                              {alert.actionTarget === 'inquiries'
                                ? 'View Inquiries Inbox'
                                : alert.actionTarget === 'batch_mgmt'
                                ? 'Inspect Batches'
                                : 'View in Shelves'}
                            </span>
                            <span className="flex items-center gap-0.5 font-semibold text-[#0070ba]">
                              Open <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={handleOpenNotificationCenter}
                    className="text-xs font-bold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Notification Center</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <span className="text-[10px] text-slate-400">FEFO Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Shift Handover Quick Action Button */}
          {onOpenShiftHandover && (
            <button
              onClick={onOpenShiftHandover}
              className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-amber-400/30"
              title="Open Cashier Shift Handover & Financial Reconciliation"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-300" />
              <span className="hidden sm:inline">Shift Handover</span>
            </button>
          )}

          {/* User Profile Pill & Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserProfileMenu(!showUserProfileMenu)}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition border border-white/20"
            >
              <div className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'K'}
              </div>
              <span>{currentUser?.name || 'Kaziniya Ahmed'}</span>
              <ChevronDown className="h-3.5 w-3.5 text-sky-200" />
            </button>

            {/* User Dropdown Menu */}
            {showUserProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserProfileMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200/80 z-50 text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Details Header */}
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/70 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0070BA] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
                          {currentUser?.name || 'Authorized User'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                          {currentUser?.email}
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E0EFF9] text-[#0070BA] border border-[#BAE0F4]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA]" />
                            {roleConfig?.title || effectiveRole.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions / System Tools */}
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserProfileMenu(false);
                        setIsRoleManagerOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#0070BA] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="flex-1 truncate">Role Manager & RBAC Matrix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserProfileMenu(false);
                        if (onBackToPublicPortal) onBackToPublicPortal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                    >
                      <Globe className="h-4 w-4 text-[#0070BA] group-hover:scale-110 transition-transform shrink-0" />
                      <span className="flex-1 truncate">Back to Public Portal</span>
                    </button>

                    {(isPharmacist || isOwner) && onOpenShiftHandover && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserProfileMenu(false);
                          onOpenShiftHandover();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                      >
                        <RotateCcw className="h-4 w-4 text-[#0070BA] group-hover:scale-110 transition-transform shrink-0" />
                        <span className="flex-1 truncate">Shift Handover & Till Count</span>
                      </button>
                    )}
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Account Settings */}
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserProfileMenu(false);
                        setUserProfileInitialTab('general');
                        setIsUserProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                    >
                      <UserIcon className="h-4 w-4 text-slate-400 group-hover:text-[#0070BA] transition-colors shrink-0" />
                      <span className="flex-1 truncate">Profile ({effectiveRole.replace('_', ' ')})</span>
                    </button>

                    {(isOwner || isSuperAdmin) && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('settings');
                          setShowUserProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                      >
                        <Settings className="h-4 w-4 text-slate-400 group-hover:text-[#0070BA] transition-colors shrink-0" />
                        <span className="flex-1 truncate">Store Settings</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserProfileMenu(false);
                        setUserProfileInitialTab('security');
                        setIsUserProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-[#0070BA] hover:bg-[#F8FAFC] font-semibold transition text-left cursor-pointer group"
                    >
                      <Key className="h-4 w-4 text-slate-400 group-hover:text-[#0070BA] transition-colors shrink-0" />
                      <span className="flex-1 truncate">Change Password</span>
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition text-left cursor-pointer group"
                  >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR & CONTENT */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* MOBILE DRAWER OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Mobile Drawer */}
            <div className="relative w-[280px] max-w-[85vw] bg-[#0070ba] text-white flex flex-col justify-between shadow-2xl h-full z-10 animate-in slide-in-from-left duration-200 select-none overflow-hidden">
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Store Brand Header for Mobile */}
                <div className="p-3.5 border-b border-white/15 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-2xs relative">
                      {isSuperAdmin ? (
                        <div className="w-full h-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black">
                          <Shield className="h-5 w-5 text-slate-900" />
                        </div>
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80"
                          alt="Kaziniya Drug Store"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                        {isSuperAdmin ? 'Digital Drug Store' : 'Kaziniya Drug Store'}
                      </h2>
                      <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
                        {isSuperAdmin ? 'Super Admin Portal' : 'Licensed Drug Store'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
                    title="Close Menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Bar in Mobile Menu */}
                <div className="p-3 pb-1 border-b border-white/10 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={sidebarSearch}
                      onChange={(e) => setSidebarSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/30 transition"
                    />
                  </div>
                </div>

                {/* Nav items in mobile menu */}
                <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
                  {filteredNavGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200/60">
                        {group.group}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isItemActive = activeView === item.id || (item.id === 'master_hub' && activeView === 'master_admin');
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleItemClick(item.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                                isItemActive
                                  ? 'bg-white text-[#0070ba] shadow-xs'
                                  : 'text-white/90 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              {item.badge && (
                                <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEFT SIDEBAR - MATCHING SCREENSHOT BLUE (#0070ba / #006cb7) */}
        <aside
          className={`${
            isSidebarCollapsed ? 'w-16' : 'w-[276px]'
          } bg-[#0070ba] text-white hidden md:flex flex-col justify-between shrink-0 shadow-lg select-none h-full min-h-0 overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Store Brand Header */}
            <div
              className={`p-3.5 border-b border-white/15 flex items-center ${
                isSidebarCollapsed ? 'justify-center' : 'justify-between'
              } shrink-0`}
            >
              {!isSidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-2xs relative">
                      {isSuperAdmin ? (
                        <div className="w-full h-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black">
                          <Shield className="h-5 w-5 text-slate-900" />
                        </div>
                      ) : (
                        <>
                          <img
                            src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80"
                            alt="Kaziniya Drug Store"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-[#005a9c]/15" />
                        </>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-bold text-sm tracking-tight text-white leading-tight truncate">
                        {isSuperAdmin ? 'Digital Drug Store' : 'Kaziniya Drug Store'}
                      </h2>
                      {isSuperAdmin ? (
                        <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
                          Super Admin Portal
                        </span>
                      ) : (
                        <span className="text-[10px] text-sky-200/90 font-medium block leading-none mt-0.5">
                          Licensed Drug Store
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSidebarCollapsed(true)}
                    className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0 cursor-pointer"
                    title="Collapse Menu Bar"
                  >
                    <ChevronsLeft className="h-4.5 w-4.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition shadow-xs cursor-pointer"
                  title="Expand Navigation Menu Bar"
                >
                  <ChevronsRight className="h-4.5 w-4.5 text-white" />
                </button>
              )}
            </div>

            {/* Sidebar Search Bar - Expanded view only */}
            {!isSidebarCollapsed && (
              <div className="px-3 pt-3 pb-1 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    className="w-full bg-[#005a9c]/60 hover:bg-[#005a9c]/80 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:bg-[#005a9c] focus:border-white/40 transition"
                  />
                </div>
              </div>
            )}

            {/* Navigation Groups - Scrollable Container */}
            <div className={`py-2 space-y-2 flex-1 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
              {/* Prominent Dashboard / Primary Workstation Card */}
              {isSidebarCollapsed ? (
                <button
                  onClick={() => handleItemClick(isSuperAdmin ? 'master_hub' : isSupplier ? 'purchases' : 'dashboard')}
                  className={`w-full h-10 flex items-center justify-center rounded-xl text-xs font-semibold transition ${
                    (isSuperAdmin && activeView === 'master_admin') ||
                    (isPharmacist && (activeView === 'dashboard' || activeView === 'pos')) ||
                    (isSupplier && (activeView === 'purchases' || activeView === 'dashboard')) ||
                    (!isSuperAdmin && !isPharmacist && !isSupplier && activeView === 'dashboard')
                      ? 'bg-white/25 text-white shadow-xs font-bold border border-white/30'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isSuperAdmin ? 'All Stores Overview' : isPharmacist ? 'Pharmacist Station' : isSupplier ? 'Wholesale Supplier Hub' : 'Store Dashboard'}
                >
                  {isSuperAdmin ? <Shield className="h-5 w-5" /> : isSupplier ? <Truck className="h-5 w-5" /> : <Gauge className="h-5 w-5" />}
                </button>
              ) : (
                <button
                  onClick={() => handleItemClick(isSuperAdmin ? 'master_hub' : isSupplier ? 'purchases' : 'dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                    (isSuperAdmin && activeView === 'master_admin') ||
                    (isPharmacist && (activeView === 'pos' || activeView === 'dashboard')) ||
                    (isSupplier && (activeView === 'purchases' || activeView === 'dashboard')) ||
                    (!isSuperAdmin && !isPharmacist && !isSupplier && activeView === 'dashboard')
                      ? 'bg-white/20 text-white shadow-xs border-white/25'
                      : 'bg-white/10 text-white/95 border-transparent hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-[#0070ba] flex items-center justify-center shadow-xs shrink-0">
                    {isSuperAdmin ? <Shield className="h-4.5 w-4.5" /> : isSupplier ? <Truck className="h-4.5 w-4.5" /> : <Gauge className="h-4.5 w-4.5" />}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className="text-[13px] font-bold tracking-tight text-white block truncate leading-tight">
                      {isSuperAdmin ? 'All Stores Overview' : isPharmacist ? 'Pharmacist Station' : isSupplier ? 'Wholesale Supplier Hub' : 'Store Dashboard'}
                    </span>
                    <span className="text-[10px] text-sky-200/90 block font-normal leading-tight mt-0.5">
                      {isSuperAdmin ? 'Main Overview' : isPharmacist ? 'Clinical & Dispensing' : isSupplier ? 'B2B Wholesale Procurement' : 'Main Overview'}
                    </span>
                  </div>
                </button>
              )}

              {/* Render Navigation Groups with Dividers & Card Badges */}
              {navGroups
                .map((group) => {
                  const query = sidebarSearch.toLowerCase().trim();
                  if (!query) return group;
                  const filteredItems = group.items.filter((item: any) => {
                    if (item.label.toLowerCase().includes(query)) return true;
                    if (item.subItems) {
                      return item.subItems.some((sub: any) => {
                        if (sub.label.toLowerCase().includes(query)) return true;
                        if (sub.subItems) {
                          return sub.subItems.some((leaf: any) => leaf.label.toLowerCase().includes(query));
                        }
                        return false;
                      });
                    }
                    return false;
                  });
                  return { ...group, items: filteredItems };
                })
                .filter((group) => group.items.length > 0)
                .map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1">
                    {!isSidebarCollapsed && (
                      <div className="flex items-center gap-2 px-1 pt-3 pb-1">
                        <div className="h-px bg-white/20 flex-1" />
                        <span className="text-[9.5px] font-extrabold text-white/60 tracking-wider uppercase whitespace-nowrap">
                          {group.group}
                        </span>
                        <div className="h-px bg-white/20 flex-1" />
                      </div>
                    )}

                    {group.items.map((item: any) => {
                      const Icon = item.icon || Box;
                      const isSearching = sidebarSearch.trim().length > 0;
                      const isOpen = isSearching ? true : (openMenus[item.id] ?? false);

                      if (isSidebarCollapsed) {
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setIsSidebarCollapsed(false);
                              if (item.hasSubmenu) {
                                setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
                              } else {
                                handleItemClick(item.id);
                              }
                            }}
                            className={`w-full h-10 flex items-center justify-center rounded-xl text-xs font-medium transition relative ${
                              isOpen || activeView === item.id
                                ? 'bg-white/25 text-white shadow-xs font-bold border border-white/30'
                                : 'text-white/90 hover:bg-white/10 hover:text-white'
                            }`}
                            title={item.label}
                          >
                            <Icon className="h-5 w-5" />
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-[#0070ba] animate-pulse" />
                            )}
                          </button>
                        );
                      }

                      return (
                        <div key={item.id} className="space-y-1">
                          {/* Top-Level Header Button */}
                          <button
                            onClick={(e) => {
                              if (item.hasSubmenu) {
                                setOpenMenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                              }
                              handleItemClick(item.id);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition group cursor-pointer ${
                              isOpen || (activeView === item.id && !item.hasSubmenu)
                                ? 'bg-white/15 text-white font-bold'
                                : 'text-white/90 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-white/25 transition shadow-2xs">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="whitespace-nowrap text-xs font-semibold">{item.label}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.badge !== undefined && item.badge > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 shadow-xs animate-pulse">
                                  {item.badge}
                                </span>
                              )}
                              {item.hasSubmenu && (
                                <ChevronRight
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(item.id, e);
                                  }}
                                  className={`h-3.5 w-3.5 text-white/60 shrink-0 transition-transform duration-200 group-hover:text-white ml-2 ${
                                    isOpen ? 'rotate-90 text-white' : ''
                                  }`}
                                />
                              )}
                            </div>
                          </button>

                          {/* Level 1 Submenu with Vertical Connector Line */}
                          {item.hasSubmenu && isOpen && item.subItems && (
                            <div className="ml-4 pl-3.5 border-l border-white/25 space-y-1 py-1">
                              {item.subItems.map((sub: any) => {
                                const SubIcon = sub.icon || Box;
                                const isSubOpen = isSearching ? true : (openMenus[sub.id] ?? false);

                                return (
                                  <div key={sub.id} className="space-y-1">
                                    <button
                                      onClick={(e) => {
                                        if (sub.hasSubmenu) {
                                          setOpenMenus((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }));
                                        }
                                        handleItemClick(sub.id);
                                      }}
                                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11.5px] font-medium text-white/90 hover:text-white hover:bg-white/10 transition group text-left cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <SubIcon className="h-3.5 w-3.5 text-white/80 group-hover:text-white shrink-0" />
                                        <span className="whitespace-nowrap">{sub.label}</span>
                                      </div>

                                      {sub.hasSubmenu && (
                                        <ChevronRight
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(sub.id, e);
                                          }}
                                          className={`h-3 w-3 text-white/70 shrink-0 transition-transform duration-200 ml-1 ${
                                            isSubOpen ? 'rotate-90 text-white' : ''
                                          }`}
                                        />
                                      )}
                                    </button>

                                    {/* Level 2 Submenu for Store Accounting, Expense Mgmt, Attendance, Leave, Payroll, Performance, Org Structure */}
                                    {sub.hasSubmenu && isSubOpen && sub.subItems && (
                                      <div className="ml-3 pl-3 border-l border-white/20 space-y-1 my-1">
                                        {sub.subItems.map((leaf: any) => {
                                          const LeafIcon = leaf.icon || Box;
                                          return (
                                            <button
                                              key={leaf.id}
                                              onClick={() => handleItemClick(leaf.id)}
                                              className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-[11px] font-medium text-white/80 hover:text-white hover:bg-white/10 transition group text-left cursor-pointer"
                                            >
                                              <LeafIcon className="h-3 w-3 text-white/70 group-hover:text-white shrink-0" />
                                              <span className="whitespace-nowrap">{leaf.label}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>

          {/* Ethiopian Ministry of Health Footer Emblem */}
          <div className="p-2.5 border-t border-white/15 bg-black/10 shrink-0 space-y-2">
            {isSidebarCollapsed ? (
              <div className="space-y-2 flex flex-col items-center">
                <button
                  onClick={onBackToPublicPortal}
                  className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold flex items-center justify-center transition border border-white/20"
                  title="Back to Public Customer Portal"
                >
                  <Globe className="h-4.5 w-4.5 text-emerald-300" />
                </button>
                <button
                  onClick={onOpenMobileApp}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold flex items-center justify-center transition shadow-sm"
                  title="Launch Flutter Counter POS"
                >
                  <Smartphone className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onOpenMobileApp}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer group"
                  title="Launch Flutter Mobile POS & Phone QR Scanner"
                >
                  <Smartphone className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <span>📱 Mobile POS App (Flutter)</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col justify-between relative">
          {/* SUPER ADMIN WORKSTATION INSPECTION BANNER */}
          {isSuperAdmin && !['master_admin', 'dashboard', 'registration_hub', 'portal_cms'].includes(activeView) && (
            <div className="bg-indigo-950 text-white px-5 py-2.5 flex items-center justify-between shadow-xs border-b border-indigo-800 text-xs shrink-0 z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="font-extrabold uppercase tracking-wider text-amber-300 text-[11px] shrink-0">
                  Super Admin Workstation Inspection:
                </span>
                <span className="text-indigo-100 truncate">
                  Auditing {activeView === 'pos' ? 'Clinical POS Counter Terminal' : activeView === 'inventory' ? 'Local Shelf Stock & Batches' : activeView === 'sales' ? 'Branch Sales Invoices & Dispensing Records' : activeView === 'reports' ? 'Branch Day-End Z-Report' : activeView === 'users' ? 'Branch Staff Directory & Schedules' : 'Branch Workstation'} (Kaziniya Flagship Node - Addis Ababa)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveView('master_admin');
                  if (onNavigateSubItem) {
                    onNavigateSubItem('master_admin', 'master_hub');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer shrink-0 ml-3"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Return to Fleet Hub</span>
              </button>
            </div>
          )}

          <div className="p-3 sm:p-5 md:p-6 space-y-4 sm:space-y-6 flex-1 max-w-full">
            {children}
          </div>


        </div>
      </div>

      {/* SHORTCUT TOAST NOTIFICATION */}
      {shortcutToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Keyboard className="h-4 w-4 text-emerald-400" />
          <span>{shortcutToast}</span>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS REFERENCE MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-700">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Pharmacy Keyboard Shortcuts</h3>
                  <p className="text-xs text-slate-400">Quickly navigate and operate the management system</p>
                </div>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-2 border-b border-slate-100">
                  Navigation Hotkeys
                </h4>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">POS Sales Terminal & Barcode Scanner</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F1</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+1</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Inventory, FEFO Batches & Stock</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F2</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+2</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Purchases, Suppliers & Procurement</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F3</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+3</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Sales Ledger & Order History</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F4</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+4</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Store Dashboard & Analytics Overview</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F6</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+6</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Accounting, Expenses & Financial Reports</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F7</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+7</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Staff, Employees & HR</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F8</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-1.5 py-1 rounded bg-white font-mono text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200">Alt+8</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-2 border-b border-slate-100">
                  Global System Actions
                </h4>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Open Shortcuts Guide</span>
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">F9</kbd>
                      <span className="text-slate-400 text-[10px]">or</span>
                      <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">?</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">Close Open Modal / Dialog</span>
                    <kbd className="px-2 py-1 rounded bg-white font-mono font-bold text-slate-700 shadow-xs border border-slate-200">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Function keys work across all dashboard screens</span>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED ROLE MANAGER & RBAC MODAL */}
      <RoleManagerModal
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
        currentUser={currentUser}
        onSimulateRole={onSelectRole}
      />

      {/* USER PROFILE & CREDENTIALS MODAL */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        currentUser={currentUser}
        initialTab={userProfileInitialTab}
        onUpdateUser={onUpdateUser}
      />
    </div>
  );
};


