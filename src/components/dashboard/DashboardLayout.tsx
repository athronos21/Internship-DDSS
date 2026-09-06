import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { safeFetchJson } from '../../utils/api';
import { RoleManagerModal } from './RoleManagerModal';
import {
  getEffectiveRole,
  getRoleConfig,
  ROLE_CONFIGS,
  hasPermission,
} from '../../utils/roleManager';
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
  children,
}) => {
  const [notifications, setNotifications] = useState<Array<{ title: string; message: string; type: 'warning' | 'danger' }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfileMenu, setShowUserProfileMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await safeFetchJson('/api/dashboard');
      if (data.success && data.data) {
        const alerts = [];
        if (data.data.lowStockCount > 0) {
          alerts.push({
            title: 'Low Stock Alert',
            message: `${data.data.lowStockCount} items below reorder level.`,
            type: 'warning' as const,
          });
        }
        if (data.data.expiringSoonCount > 0) {
          alerts.push({
            title: 'Expiring Soon Warning',
            message: `${data.data.expiringSoonCount} batches expire soon.`,
            type: 'warning' as const,
          });
        }
        setNotifications(alerts);
      }
    } catch (e) {
      console.warn('Alerts fetch fallback:', e);
    }
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
  const roleConfig = getRoleConfig(effectiveRole);

  // View Permission Guard: Ensure activeView is allowed for the user's effective role
  useEffect(() => {
    if (roleConfig && !roleConfig.allowedViews.includes(activeView)) {
      const fallback = isSuperAdmin ? 'master_admin' : isPharmacist ? 'pos' : 'dashboard';
      setActiveView(fallback);
    }
  }, [effectiveRole, activeView, roleConfig, isSuperAdmin, isPharmacist, setActiveView]);

  // Menubar structure - strictly Super Admin centric for Super Admin, store-centric for owner, and dispensing-centric for pharmacist
  const navGroups = isSuperAdmin
    ? [
        {
          group: 'NATIONAL FLEET GOVERNANCE',
          items: [
            {
              id: 'master_hub',
              label: 'Command Hub',
              icon: Shield,
              hasSubmenu: false,
            },
            {
              id: 'master_nodes',
              label: 'Pharmacy Fleet (Nodes)',
              icon: Building2,
              hasSubmenu: true,
              subItems: [
                { id: 'master_nodes_list', label: 'All Connected Pharmacies (6)', icon: List },
                { id: 'master_nodes_pending', label: 'Pending Approvals (1)', icon: Clock },
                { id: 'master_nodes_onboard', label: 'Onboard New Pharmacy', icon: PlusCircle },
              ],
            },
            {
              id: 'master_compliance',
              label: 'EFDA Compliance & Recalls',
              icon: FileCheck,
              hasSubmenu: true,
              subItems: [
                { id: 'master_efda_licenses', label: 'EFDA License Registry', icon: ShieldCheck },
                { id: 'master_recalls', label: 'National Batch Recalls', icon: AlertOctagon },
              ],
            },
          ],
        },
        {
          group: 'CENTRAL FORMULARY & SHORTAGES',
          items: [
            {
              id: 'master_catalog',
              label: 'National Drug Index',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'master_catalog_all', label: 'Master Medicine Registry', icon: List },
                { id: 'master_shortages', label: 'Critical Shortage Alerts', icon: AlertTriangle },
                { id: 'master_price_ceilings', label: 'EFDA Price Ceilings', icon: Tag },
              ],
            },
          ],
        },
        {
          group: 'MULTI-STORE FINANCIALS & SETTLEMENT',
          items: [
            {
              id: 'master_financials',
              label: 'Consolidated GMV',
              icon: BarChart3,
              hasSubmenu: true,
              subItems: [
                { id: 'master_analytics', label: 'Pharmacy Analytics & Charts', icon: TrendingUp, badge: 'Live' },
                { id: 'master_gmv', label: 'Multi-Store GMV Analytics', icon: BarChart3 },
                { id: 'master_settlements', label: 'Telebirr / CBE Settlements', icon: Receipt },
              ],
            },
          ],
        },
        {
          group: 'NATIONAL HR & PERSONNEL',
          items: [
            {
              id: 'master_staff',
              label: 'National Staff Directory',
              icon: Users,
              hasSubmenu: true,
              subItems: [
                { id: 'master_staff_all', label: 'Licensed Staff Directory', icon: List },
                { id: 'role_manager', label: 'Unified Role Manager & RBAC', icon: Lock },
              ],
            },
          ],
        },
        {
          group: 'CLOUD PLATFORM & BROADCASTS',
          items: [
            {
              id: 'master_health',
              label: 'Platform & Broadcast',
              icon: Server,
              hasSubmenu: true,
              subItems: [
                { id: 'master_broadcast', label: 'Emergency System Broadcast', icon: Radio },
                { id: 'master_telemetry', label: 'PostgreSQL Sync & Latency', icon: Activity },
              ],
            },
            { id: 'portal_cms', label: 'Public Portal CMS', icon: Globe },
            { id: 'registration_hub', label: 'Registration & Onboarding Hub', icon: Store },
          ],
        },
        {
          group: 'STORE WORKSTATION INSPECTION',
          items: [
            {
              id: 'store_inspection_grp',
              label: 'Inspect Store Workstations',
              icon: Store,
              hasSubmenu: true,
              subItems: [
                { id: 'inspect_flagship', label: 'Inspect Flagship Store (AA)', icon: Store },
                { id: 'inventory', label: 'Inspect Local Shelf Stock', icon: Boxes },
                { id: 'pos', label: 'Inspect POS Counter Terminal', icon: CreditCard },
                { id: 'all_sales', label: 'Inspect Branch Sales Invoices', icon: Receipt },
                { id: 'reports', label: 'Inspect Branch Day-End Z-Report', icon: FileText },
              ],
            },
            {
              id: 'sys_config',
              label: 'System Configuration',
              icon: SlidersHorizontal,
              hasSubmenu: true,
              subItems: [
                { id: 'store_settings', label: 'Global Store Settings', icon: PenSquare },
                { id: 'eims_config', label: 'EIMS & Tax Configuration', icon: FileText },
              ],
            },
          ],
        },
      ]
    : isPharmacist
    ? [
        {
          group: 'CLINICAL DISPENSING & POS',
          items: [
            { id: 'pos', label: 'Point of Sale (POS Terminal)', icon: Store },
            {
              id: 'sales_mgmt',
              label: 'Sales & Dispensing History',
              icon: FileText,
              hasSubmenu: true,
              subItems: [
                { id: 'all_sales', label: 'Dispensed Invoices', icon: List },
                { id: 'sales_returns', label: 'Sales Returns & Void Logs', icon: RotateCcw },
              ],
            },
          ],
        },
        {
          group: 'MEDICINE SHELF & INVENTORY WORK',
          items: [
            {
              id: 'medicines',
              label: 'Medicine Shelf & Formulary',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'inventory', label: 'Medicine Registry & Search', icon: List },
                { id: 'inventory_add', label: 'Add Medicine to Stock', icon: PlusCircle },
                { id: 'batch_mgmt', label: 'Batch Intake & FEFO Expiry', icon: Layers },
                { id: 'stock_adjustments', label: 'Stock Intake & Adjustments', icon: PenSquare },
                { id: 'stock_movements', label: 'Stock Movements & Dispense Log', icon: ArrowLeftRight },
              ],
            },
          ],
        },
        {
          group: 'SHIFT SUMMARY & PERMISSIONS',
          items: [
            { id: 'reports', label: 'Day-End Z-Report & Summary', icon: FileSpreadsheet },
            { id: 'role_manager', label: 'My Clinical Permissions & RBAC', icon: ShieldCheck },
          ],
        },
      ]
    : [
        {
          group: 'PRODUCT MANAGEMENT',
          items: [
            {
              id: 'medicines',
              label: 'Products',
              icon: Pill,
              hasSubmenu: true,
              subItems: [
                { id: 'inventory', label: 'All Products', icon: List },
                { id: 'inventory_add', label: 'Add Product', icon: PlusCircle },
                { id: 'inventory_expired', label: 'Expired Products', icon: CalendarX },
                { id: 'inventory_archived', label: 'Archived Products', icon: Box },
              ],
            },
            { id: 'pos', label: 'Point of Sale (POS)', icon: Receipt },
            {
              id: 'sales_mgmt',
              label: 'Sales Management',
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
          group: 'INVENTORY MANAGEMENT',
          items: [
            { id: 'inventory_health', label: 'Inventory Dashboard', icon: TrendingUp },
            { id: 'store_settings', label: 'Warehouses', icon: Warehouse },
            {
              id: 'stock_mgmt',
              label: 'Stock Management',
              icon: Boxes,
              hasSubmenu: true,
              subItems: [
                { id: 'stock_movements', label: 'Stock Movements', icon: ArrowLeftRight },
                { id: 'stock_adjustments', label: 'Adjustments', icon: PenSquare },
                { id: 'stock_requests', label: 'Stock Requests', icon: HandHeart },
                { id: 'create_stock_req', label: 'Create Stock Request', icon: PlusCircle },
                { id: 'batch_mgmt', label: 'Batch Management', icon: Layers },
                { id: 'stock_report', label: 'Stock Report', icon: FileText },
                { id: 'expiry_tracking', label: 'Expiry Tracking', icon: CalendarX },
                { id: 'movement_report', label: 'Movement Report', icon: FileSpreadsheet },
              ],
            },
            { id: 'online_orders', label: 'Reservations', icon: Lock },
            {
              id: 'procurement',
              label: 'Procurement',
              icon: Truck,
              hasSubmenu: true,
              subItems: [
                { id: 'suppliers', label: 'Suppliers', icon: Truck },
                { id: 'purchase_orders', label: 'Purchase Orders', icon: FileText },
                { id: 'goods_receipts', label: 'Goods Receipts', icon: FileCheck },
                { id: 'purchase_invoices', label: 'Purchase Invoices', icon: Receipt },
                { id: 'supplier_payments', label: 'Supplier Payments', icon: Banknote },
                { id: 'purchase_returns', label: 'Purchase Returns', icon: RotateCcw },
                { id: 'ap_dashboard', label: 'AP Dashboard', icon: PieChart },
              ],
            },
          ],
        },
        {
          group: 'ACCOUNTING',
          items: [
            {
              id: 'accounting',
              label: 'Accounting',
              icon: Calculator,
              hasSubmenu: true,
              subItems: [
                { id: 'acc_dashboard', label: 'Dashboard', icon: Gauge },
                { id: 'journal_entries', label: 'Journal Entries', icon: BookOpen },
                { id: 'branch_reports', label: 'Branch Reports', icon: BarChart3 },
                {
                  id: 'store_accounting',
                  label: 'Store Accounting',
                  icon: Store,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'store_dashboard', label: 'Store Dashboard', icon: Gauge },
                    { id: 'chart_of_accounts', label: 'Chart of Accounts', icon: List },
                    { id: 'all_journal_entries', label: 'All Journal Entries', icon: BookOpen },
                    { id: 'trial_balance', label: 'Trial Balance', icon: Scale },
                    { id: 'profit_loss', label: 'Profit & Loss', icon: TrendingUp },
                    { id: 'balance_sheet', label: 'Balance Sheet', icon: FileText },
                    { id: 'accounting_periods', label: 'Accounting Periods', icon: Calendar },
                    { id: 'account_mapping', label: 'Account Mapping', icon: GitFork },
                  ],
                },
                {
                  id: 'expense_mgmt',
                  label: 'Expense Management',
                  icon: Receipt,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'all_expenses', label: 'All Expenses', icon: List },
                    { id: 'create_expense', label: 'Create Expense', icon: PlusCircle },
                    { id: 'expense_categories', label: 'Expense Categories', icon: Tag },
                    { id: 'expense_reports', label: 'Expense Reports', icon: BarChart3 },
                  ],
                },
              ],
            },
          ],
        },
        {
          group: 'CUSTOMER MANAGEMENT',
          items: [
            { id: 'customers', label: 'Customers', icon: Users },
          ],
        },
        {
          group: 'HUMAN RESOURCES',
          items: [
            {
              id: 'human_resources',
              label: 'Employees & HR',
              icon: UserCheck,
              hasSubmenu: true,
              subItems: [
                { id: 'hr_dashboard', label: 'Dashboard', icon: Gauge },
                { id: 'employees', label: 'Employees', icon: Users },
                { id: 'role_manager', label: 'Role & Access Matrix', icon: ShieldCheck },
                {
                  id: 'attendance_schedules',
                  label: 'Attendance & Schedules',
                  icon: Clock,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'attendance', label: 'Attendance', icon: Clock },
                    { id: 'schedules', label: 'Schedules', icon: Calendar },
                  ],
                },
                {
                  id: 'leave_mgmt',
                  label: 'Leave Management',
                  icon: Calendar,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'leave_requests', label: 'Leave Requests', icon: Calendar },
                    { id: 'leave_types', label: 'Leave Types', icon: Calendar },
                  ],
                },
                {
                  id: 'payroll_comp',
                  label: 'Payroll & Compensation',
                  icon: Banknote,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'payroll', label: 'Payroll', icon: FileText },
                    { id: 'loans', label: 'Loans', icon: Banknote },
                  ],
                },
                {
                  id: 'performance_eval',
                  label: 'Performance & Evaluation',
                  icon: TrendingUp,
                  hasSubmenu: true,
                  subItems: [
                    { id: 'performance', label: 'Performance', icon: TrendingUp },
                    { id: 'offboarding', label: 'Offboarding', icon: UserX },
                  ],
                },
                {
                  id: 'org_structure',
                  label: 'Organization Structure',
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
              label: 'Notifications',
              icon: Bell,
              hasSubmenu: true,
              subItems: [
                { id: 'all_notifications', label: 'All Notifications', icon: List },
                { id: 'notif_settings', label: 'Settings', icon: Settings },
              ],
            },
          ],
        },
        {
          group: 'ANALYTICS & EXPORTS',
          items: [
            {
              id: 'analytics',
              label: 'Analytics & Reports',
              icon: PieChart,
              hasSubmenu: true,
              subItems: [
                { id: 'analytics_dashboard', label: 'Dashboard', icon: Gauge },
                { id: 'sales_analysis', label: 'Sales Analysis', icon: ShoppingCart },
                { id: 'inventory_health', label: 'Inventory Health', icon: Boxes },
                { id: 'financial_trends', label: 'Financial Trends', icon: Banknote },
              ],
            },
          ],
        },
        {
          group: 'SYSTEM SETTINGS',
          items: [
            { id: 'store_settings', label: 'Store Settings', icon: Settings },
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
      {/* TOP HEADER BAR - RICH BLUE */}
      <header className="h-14 bg-[#006cb7] text-white px-3 sm:px-6 flex items-center justify-between shadow-md z-40 shrink-0">
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

          <div className="hidden lg:flex items-center gap-2 bg-[#005a9c] px-3.5 py-1.5 rounded-xl border border-sky-400/20 text-xs font-semibold text-white shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-sky-200" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <button
            onClick={onBackToPublicPortal}
            className="flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition shadow-sm border border-emerald-400/40 group shrink-0"
            title="Return to Public Customer Storefront & Portal"
          >
            <Globe className="h-4 w-4 text-emerald-100 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="hidden sm:inline">Back to Public Portal</span>
            <span className="sm:hidden">Portal</span>
          </button>
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
              className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white border border-[#006cb7]">
                11
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white p-4 shadow-2xl border border-slate-200 z-50 text-slate-900 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs">Store Alerts (2)</span>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <span className="font-bold block">14 Low Stock Items</span>
                    <span className="text-[11px] opacity-80">Reorder thresholds reached for essential drugs.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                    <span className="font-bold block">2 Expiring Soon Batches</span>
                    <span className="text-[11px] opacity-80">Check inventory audit log before expiry.</span>
                  </div>
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
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white py-2 shadow-2xl border border-slate-200 z-50 text-slate-800 text-xs font-medium space-y-1">
                {/* Account Details Header */}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-xs truncate">
                      {currentUser?.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      isSuperAdmin
                        ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        : currentUser?.isOwner || effectiveRole === 'STORE_OWNER'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-teal-100 text-teal-800 border-teal-300'
                    }`}>
                      {roleConfig?.title || effectiveRole.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserProfileMenu(false);
                    setIsRoleManagerOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 bg-indigo-50 text-indigo-900 font-bold hover:bg-indigo-100 transition"
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>Role Manager & RBAC Matrix</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserProfileMenu(false);
                    if (onBackToPublicPortal) onBackToPublicPortal();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 transition"
                >
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span>Back to Public Portal</span>
                </button>
                
                {onOpenShiftHandover && (
                  <button
                    onClick={() => {
                      setShowUserProfileMenu(false);
                      onOpenShiftHandover();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition"
                  >
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    <span>Shift Handover & Till Count</span>
                  </button>
                )}

                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => setShowUserProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>Profile ({currentUser?.role})</span>
                </button>
                {!isPharmacist && (
                  <button
                    onClick={() => {
                      setActiveView('settings');
                      setShowUserProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Store Setting</span>
                  </button>
                )}
                <button
                  onClick={() => setShowUserProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 transition"
                >
                  <Key className="h-4 w-4 text-slate-400" />
                  <span>Change Password</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setShowUserProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
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
                        {isSuperAdmin ? 'National Health Fleet' : 'Kaziniya Drug store'}
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
                        {isSuperAdmin ? 'National Health Fleet' : 'Kaziniya Drug store'}
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
                  onClick={() => handleItemClick(isSuperAdmin ? 'master_hub' : isPharmacist ? 'pos' : 'dashboard')}
                  className={`w-full h-10 flex items-center justify-center rounded-xl text-xs font-semibold transition ${
                    (isSuperAdmin && activeView === 'master_admin') ||
                    (isPharmacist && activeView === 'pos') ||
                    (!isSuperAdmin && !isPharmacist && activeView === 'dashboard')
                      ? 'bg-white/25 text-white shadow-xs font-bold border border-white/30'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isSuperAdmin ? 'Fleet Command Center' : isPharmacist ? 'Clinical POS & Dispensary' : 'Store Executive Dashboard'}
                >
                  {isSuperAdmin ? <Shield className="h-5 w-5" /> : isPharmacist ? <Receipt className="h-5 w-5" /> : <Gauge className="h-5 w-5" />}
                </button>
              ) : (
                <button
                  onClick={() => handleItemClick(isSuperAdmin ? 'master_hub' : isPharmacist ? 'pos' : 'dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                    (isSuperAdmin && activeView === 'master_admin') ||
                    (isPharmacist && activeView === 'pos') ||
                    (!isSuperAdmin && !isPharmacist && activeView === 'dashboard')
                      ? 'bg-white/20 text-white shadow-xs border-white/25'
                      : 'bg-white/10 text-white/95 border-transparent hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-[#0070ba] flex items-center justify-center shadow-xs shrink-0">
                    {isSuperAdmin ? <Shield className="h-4.5 w-4.5" /> : isPharmacist ? <Receipt className="h-4.5 w-4.5" /> : <Gauge className="h-4.5 w-4.5" />}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <span className="text-[13px] font-bold tracking-tight text-white block truncate leading-tight">
                      {isSuperAdmin ? 'Fleet Command' : isPharmacist ? 'Dispensary & POS' : 'Store Dashboard'}
                    </span>
                    <span className="text-[10px] text-sky-200/90 block font-normal leading-tight mt-0.5">
                      {isSuperAdmin ? 'National Governance' : isPharmacist ? 'Clinical Counter' : 'Executive Management'}
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
                            className={`w-full h-10 flex items-center justify-center rounded-xl text-xs font-medium transition ${
                              isOpen || activeView === item.id
                                ? 'bg-white/25 text-white shadow-xs font-bold border border-white/30'
                                : 'text-white/90 hover:bg-white/10 hover:text-white'
                            }`}
                            title={item.label}
                          >
                            <Icon className="h-5 w-5" />
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
          {isSuperAdmin && activeView !== 'master_admin' && (
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

          {/* Footer Banner */}
          <footer className="px-4 sm:px-6 py-3.5 border-t border-slate-200/80 bg-[#f8fafc] flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>© 2026 Teninete</span>
            <span>Version 2.0.0</span>
          </footer>
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
    </div>
  );
};


