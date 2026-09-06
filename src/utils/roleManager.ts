import { User, UserRole } from '../types';

/**
 * Unified Permissions Enum for Kaziniya Digital Drug Store (DDS)
 * Comprehensive access-control tokens mapped across Super Admin, Drug Store Owner, and Pharmacist.
 */
export type Permission =
  // --- TIER 1: SUPER ADMIN (WHOLE SYSTEM GOVERNANCE) ---
  | 'GLOBAL_SYSTEM_GOVERNANCE'
  | 'VIEW_MASTER_FLEET'
  | 'ONBOARD_GLOBAL_STORE'
  | 'SUSPEND_GLOBAL_STORE'
  | 'MANAGE_EFDA_RECALLS'
  | 'MANAGE_GLOBAL_FORMULARY'
  | 'VIEW_GLOBAL_GMV'
  | 'SETTLE_GLOBAL_PAYMENTS'
  | 'BROADCAST_SYSTEM_ALERTS'
  | 'VIEW_GLOBAL_AUDIT_LOGS'
  | 'INSPECT_ANY_STORE_WORKSTATION'

  // --- TIER 2: DRUG STORE OWNER (STORE & BUSINESS OPERATIONS) ---
  | 'MANAGE_STORE_PROFILE'
  | 'MANAGE_STORE_SETTINGS'
  | 'MANAGE_TAX_EIMS_CONFIG'
  | 'MANAGE_STAFF_ACCOUNTS'
  | 'MANAGE_HR_PAYROLL'
  | 'MANAGE_INVENTORY'
  | 'CREATE_MEDICINE'
  | 'RECEIVE_BATCHES'
  | 'ADJUST_STOCK'
  | 'MANAGE_PURCHASES'
  | 'MANAGE_SUPPLIERS'
  | 'VIEW_FINANCIAL_REPORTS'
  | 'VIEW_PROFIT_LOSS'
  | 'VIEW_BALANCE_SHEET'
  | 'MANAGE_EXPENSES'
  | 'EXPORT_FINANCIAL_PDF'
  | 'MANAGE_PORTAL_CMS'

  // --- TIER 3: PHARMACIST (CLINICAL DISPENSING & SALES COUNTER) ---
  | 'USE_POS_CHECKOUT'
  | 'VERIFY_PRESCRIPTIONS'
  | 'DISPENSE_PRESCRIPTIONS'
  | 'PROCESS_PAYMENTS_TELEBIRR_CBE'
  | 'VIEW_STOCK_AVAILABILITY'
  | 'PERFORM_SHIFT_HANDOVER'
  | 'PROCESS_SALES_RETURNS'
  | 'PRINT_THERMAL_RECEIPT'
  | 'VIEW_EXPIRING_BATCHES'
  | 'VIEW_BASIC_AUDIT_LOGS'
  | 'EXPORT_INTERNSHIP_REPORTS';

export interface RoleConfig {
  role: UserRole;
  title: string;
  shortTitle: string;
  tier: 1 | 2 | 3;
  tierLabel: string;
  badgeColor: string;
  accentBg: string;
  borderColor: string;
  textColor: string;
  description: string;
  primaryLandingView: string;
  allowedViews: string[];
  permissions: Permission[];
  prohibitedActions: string[];
}

export const SYSTEM_HIERARCHY_STATEMENT = 
  'The whole drug store work is done by the Pharmacist and managed by the Store Owner, while the whole system is governed by the Super Admin.';

/**
 * Standard Role Configuration Matrix for the 3 Institutional Characters
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    shortTitle: 'Super Admin',
    tier: 1,
    tierLabel: 'Tier 1: Master Platform & Whole System Governance',
    badgeColor: 'bg-indigo-600 text-white',
    accentBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-300 dark:border-indigo-800',
    textColor: 'text-indigo-900 dark:text-indigo-200',
    description:
      'Master system administrator and national regulator who manages the entire multi-tenant system: onboarding pharmacy fleet nodes, broadcasting national EFDA safety recalls, standardizing the national drug formulary, and overseeing platform-wide GMV settlements.',
    primaryLandingView: 'master_admin',
    allowedViews: [
      'master_admin',
      'dashboard',
      'inventory',
      'add_medicine',
      'pos',
      'sales',
      'purchases',
      'reports',
      'users',
      'portal_cms',
      'registration_hub',
      'settings',
    ],
    permissions: [
      'GLOBAL_SYSTEM_GOVERNANCE',
      'VIEW_MASTER_FLEET',
      'ONBOARD_GLOBAL_STORE',
      'SUSPEND_GLOBAL_STORE',
      'MANAGE_EFDA_RECALLS',
      'MANAGE_GLOBAL_FORMULARY',
      'VIEW_GLOBAL_GMV',
      'SETTLE_GLOBAL_PAYMENTS',
      'BROADCAST_SYSTEM_ALERTS',
      'VIEW_GLOBAL_AUDIT_LOGS',
      'INSPECT_ANY_STORE_WORKSTATION',
      'VIEW_FINANCIAL_REPORTS',
      'VIEW_STOCK_AVAILABILITY',
      'EXPORT_INTERNSHIP_REPORTS',
      'MANAGE_PORTAL_CMS',
    ],
    prohibitedActions: [
      'Direct checkout on a live counter cash drawer without store inspection session',
      'Modifying private retail employee bank accounts without store owner confirmation',
    ],
  },

  STORE_OWNER: {
    role: 'STORE_OWNER',
    title: 'Drug Store Owner',
    shortTitle: 'Store Owner',
    tier: 2,
    tierLabel: 'Tier 2: Store Executive & Business Management',
    badgeColor: 'bg-blue-600 text-white',
    accentBg: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-300 dark:border-blue-800',
    textColor: 'text-blue-900 dark:text-blue-200',
    description:
      'Executive pharmacy proprietor who manages the store business: premise EFDA license & TIN/VAT compliance, store financial health (Profit & Loss, Balance Sheets, Expenses), procurement approvals & suppliers, pharmacist staff accounts, and store portal CMS.',
    primaryLandingView: 'dashboard',
    allowedViews: [
      'dashboard',
      'inventory',
      'add_medicine',
      'pos',
      'sales',
      'purchases',
      'reports',
      'users',
      'portal_cms',
      'registration_hub',
      'settings',
    ],
    permissions: [
      'MANAGE_STORE_PROFILE',
      'MANAGE_STORE_SETTINGS',
      'MANAGE_TAX_EIMS_CONFIG',
      'MANAGE_STAFF_ACCOUNTS',
      'MANAGE_HR_PAYROLL',
      'MANAGE_INVENTORY',
      'CREATE_MEDICINE',
      'RECEIVE_BATCHES',
      'ADJUST_STOCK',
      'MANAGE_PURCHASES',
      'MANAGE_SUPPLIERS',
      'VIEW_FINANCIAL_REPORTS',
      'VIEW_PROFIT_LOSS',
      'VIEW_BALANCE_SHEET',
      'MANAGE_EXPENSES',
      'EXPORT_FINANCIAL_PDF',
      'USE_POS_CHECKOUT',
      'VERIFY_PRESCRIPTIONS',
      'DISPENSE_PRESCRIPTIONS',
      'PROCESS_PAYMENTS_TELEBIRR_CBE',
      'VIEW_STOCK_AVAILABILITY',
      'PERFORM_SHIFT_HANDOVER',
      'PROCESS_SALES_RETURNS',
      'PRINT_THERMAL_RECEIPT',
      'VIEW_EXPIRING_BATCHES',
      'VIEW_BASIC_AUDIT_LOGS',
      'EXPORT_INTERNSHIP_REPORTS',
      'MANAGE_PORTAL_CMS',
    ],
    prohibitedActions: [
      'Accessing or modifying other registered competitor drug store nodes in the national fleet',
      'Issuing platform-wide EFDA national recalls or broadcasting system-wide emergency telemetry',
    ],
  },

  PHARMACIST: {
    role: 'PHARMACIST',
    title: 'Pharmacist',
    shortTitle: 'Pharmacist',
    tier: 3,
    tierLabel: 'Tier 3: Complete Drug Store Operations & Dispensing',
    badgeColor: 'bg-emerald-600 text-white',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-300 dark:border-emerald-800',
    textColor: 'text-emerald-900 dark:text-emerald-200',
    description:
      'Licensed clinical healthcare professional executing all daily drug store operations: POS counter checkout, prescription verification, patient counselling, shelf inventory management & stock intake, receiving batches, FEFO expiry tracking, and shift handover Z-reports.',
    primaryLandingView: 'pos',
    allowedViews: ['pos', 'inventory', 'add_medicine', 'sales', 'reports'],
    permissions: [
      'USE_POS_CHECKOUT',
      'VERIFY_PRESCRIPTIONS',
      'DISPENSE_PRESCRIPTIONS',
      'PROCESS_PAYMENTS_TELEBIRR_CBE',
      'VIEW_STOCK_AVAILABILITY',
      'MANAGE_INVENTORY',
      'CREATE_MEDICINE',
      'RECEIVE_BATCHES',
      'ADJUST_STOCK',
      'PERFORM_SHIFT_HANDOVER',
      'PROCESS_SALES_RETURNS',
      'PRINT_THERMAL_RECEIPT',
      'VIEW_EXPIRING_BATCHES',
      'VIEW_BASIC_AUDIT_LOGS',
      'EXPORT_INTERNSHIP_REPORTS',
    ],
    prohibitedActions: [
      'Altering store legal profile, TIN registration, or EFDA premise license numbers',
      'Accessing confidential store profit & loss, balance sheets, or employee payroll compensation',
      'Creating, editing, or deleting staff credentials or modifying system-level tax formulas',
      'Modifying store merchant payment credentials or central fiscal printer architecture',
    ],
  },

  CUSTOMER: {
    role: 'CUSTOMER',
    title: 'Customer',
    shortTitle: 'Customer',
    tier: 3,
    tierLabel: 'Customer Public Storefront',
    badgeColor: 'bg-slate-600 text-white',
    accentBg: 'bg-slate-50 dark:bg-slate-900',
    borderColor: 'border-slate-200 dark:border-slate-700',
    textColor: 'text-slate-800 dark:text-slate-200',
    description: 'Public customer browsing storefront and medicine directory.',
    primaryLandingView: 'portal_cms',
    allowedViews: ['portal_cms'],
    permissions: ['VIEW_STOCK_AVAILABILITY'],
    prohibitedActions: [
      'Accessing back-office workstation dashboards or POS terminal without employee credentials',
    ],
  },
};

/**
 * Determine the effective canonical UserRole for a given user object.
 */
export function getEffectiveRole(user: User | null | undefined): UserRole {
  if (!user) return 'CUSTOMER';

  if (
    user.role === 'SUPER_ADMIN' ||
    ((user.role as string) === 'ADMIN' && user.isSuperAdmin) ||
    user.isSuperAdmin ||
    user.email?.toLowerCase() === 'athronos21@gmail.com'
  ) {
    return 'SUPER_ADMIN';
  }

  if (user.role === 'STORE_OWNER' || (user.role as string) === 'ADMIN' || user.isOwner) {
    return 'STORE_OWNER';
  }

  if (user.role === 'PHARMACIST') {
    return 'PHARMACIST';
  }

  return (['SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST', 'CUSTOMER'].includes(user.role)
    ? user.role
    : 'PHARMACIST') as UserRole;
}

/**
 * Get the RoleConfig metadata for a given user or role.
 */
export function getRoleConfig(roleOrUser: UserRole | User | null | undefined): RoleConfig {
  if (!roleOrUser) return ROLE_CONFIGS.CUSTOMER;

  const role = typeof roleOrUser === 'string' ? roleOrUser : getEffectiveRole(roleOrUser);
  return ROLE_CONFIGS[role] || ROLE_CONFIGS.PHARMACIST;
}

/**
 * Check if a user possesses a specific permission.
 */
export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  const role = getEffectiveRole(user);
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions.
 */
export function hasAnyPermission(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.some((p) => hasPermission(user, p));
}

/**
 * Check if a user has all of the specified permissions.
 */
export function hasAllPermissions(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user || !permissions || permissions.length === 0) return false;
  return permissions.every((p) => hasPermission(user, p));
}

/**
 * Validate whether a user is authorized to access a given dashboard view ID.
 */
export function canAccessDashboardView(user: User | null | undefined, viewId: string): boolean {
  if (!user) return false;
  const role = getEffectiveRole(user);
  const config = ROLE_CONFIGS[role];
  if (!config) return false;

  // Super admin can inspect/access all administrative views
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  return config.allowedViews.includes(viewId);
}

/**
 * Get list of all permissions grouped by domain for inspection & matrix UI.
 */
export const PERMISSION_DOMAINS: {
  domain: string;
  description: string;
  permissions: { id: Permission; label: string; description: string }[];
}[] = [
  {
    domain: 'National Governance & Fleet',
    description: 'SaaS multi-tenant control, fleet health, and nationwide compliance',
    permissions: [
      {
        id: 'GLOBAL_SYSTEM_GOVERNANCE',
        label: 'Whole System Governance',
        description: 'Complete regulatory, architectural, and security governance across all stores.',
      },
      {
        id: 'VIEW_MASTER_FLEET',
        label: 'View Connected Fleet Nodes',
        description: 'Access the list of all connected pharmacies, nodes, and license statuses.',
      },
      {
        id: 'MANAGE_EFDA_RECALLS',
        label: 'Manage EFDA Recalls',
        description: 'Broadcast nationwide batch quarantine and recall mandates.',
      },
      {
        id: 'VIEW_GLOBAL_GMV',
        label: 'View Platform GMV',
        description: 'View consolidated Gross Merchandise Value across all pharmacy branches.',
      },
      {
        id: 'BROADCAST_SYSTEM_ALERTS',
        label: 'Emergency Broadcasts',
        description: 'Publish critical telemetry alerts to all active dispensary screens.',
      },
    ],
  },
  {
    domain: 'Store Administration & Settings',
    description: 'Local store legal profile, EIMS tax configuration, and staff management',
    permissions: [
      {
        id: 'MANAGE_STORE_PROFILE',
        label: 'Manage Store Profile',
        description: 'Update pharmacy premise name, address, EFDA license, and TIN number.',
      },
      {
        id: 'MANAGE_STORE_SETTINGS',
        label: 'Store Settings & Branches',
        description: 'Configure operating hours, cold-chain features, and receipts.',
      },
      {
        id: 'MANAGE_TAX_EIMS_CONFIG',
        label: 'EIMS & Tax Config',
        description: 'Set up Ministry of Revenues fiscal receipt rates (VAT 15%, TOT 2%).',
      },
      {
        id: 'MANAGE_STAFF_ACCOUNTS',
        label: 'Manage Staff Accounts',
        description: 'Create, edit, suspend, and reset credentials for store employees.',
      },
      {
        id: 'MANAGE_HR_PAYROLL',
        label: 'HR & Payroll Operations',
        description: 'Oversee attendance, leave requests, loans, and staff compensation.',
      },
    ],
  },
  {
    domain: 'Inventory & Procurement',
    description: 'Stock management, FEFO batch tracking, and supplier purchase orders',
    permissions: [
      {
        id: 'MANAGE_INVENTORY',
        label: 'Full Inventory Control',
        description: 'Add, archive, categorize, and configure reorder levels on medicines.',
      },
      {
        id: 'RECEIVE_BATCHES',
        label: 'Receive Medicine Batches',
        description: 'Input batch numbers, manufacturing/expiry dates, and unit purchase costs.',
      },
      {
        id: 'ADJUST_STOCK',
        label: 'Adjust Stock & Waste',
        description: 'Record physical count variances, breakage, or expired stock adjustments.',
      },
      {
        id: 'MANAGE_PURCHASES',
        label: 'Procurement & Purchase Orders',
        description: 'Create purchase orders, receive supplier invoices, and log vendor bills.',
      },
      {
        id: 'MANAGE_SUPPLIERS',
        label: 'Supplier Directory & AP',
        description: 'Manage pharmaceutical wholesale vendors and accounts payable.',
      },
    ],
  },
  {
    domain: 'Financial Accounting & Reports',
    description: 'General ledger, Day-End Z-reports, and financial statements',
    permissions: [
      {
        id: 'VIEW_FINANCIAL_REPORTS',
        label: 'Day-End & Sales Reports',
        description: 'Generate Day-End Z-reports, X-readings, and transaction logs.',
      },
      {
        id: 'VIEW_PROFIT_LOSS',
        label: 'Profit & Loss Statement',
        description: 'Inspect revenue, cost of goods sold (COGS), gross margin, and net profit.',
      },
      {
        id: 'VIEW_BALANCE_SHEET',
        label: 'Balance Sheet & Trial Balance',
        description: 'View chart of accounts, assets, liabilities, and equity reports.',
      },
      {
        id: 'MANAGE_EXPENSES',
        label: 'Expense Management',
        description: 'Record operational pharmacy expenses (utilities, rent, logistics).',
      },
      {
        id: 'EXPORT_FINANCIAL_PDF',
        label: 'Export Financial Statements',
        description: 'Generate official PDF statements with QR validation and stamp.',
      },
    ],
  },
  {
    domain: 'Clinical Dispensing & Counter POS',
    description: 'Frontline patient checkout, prescription verification, and shift handover',
    permissions: [
      {
        id: 'USE_POS_CHECKOUT',
        label: 'Point of Sale (POS)',
        description: 'Perform rapid 3-second barcode scanning and touchscreen retail checkout.',
      },
      {
        id: 'VERIFY_PRESCRIPTIONS',
        label: 'Verify Prescriptions',
        description: 'Validate doctor prescriptions, dosage instructions, and patient details.',
      },
      {
        id: 'DISPENSE_PRESCRIPTIONS',
        label: 'Dispense Regulated Drugs',
        description: 'Authorize prescription sales and attach clinical dispensing notes.',
      },
      {
        id: 'PROCESS_PAYMENTS_TELEBIRR_CBE',
        label: 'Accept Telebirr & CBE Birr',
        description: 'Generate dynamic payment QR codes and reconcile instant mobile payments.',
      },
      {
        id: 'VIEW_STOCK_AVAILABILITY',
        label: 'Stock Lookup & Batch Expiry',
        description: 'Search available shelf inventory, active batch numbers, and price lookups.',
      },
      {
        id: 'PERFORM_SHIFT_HANDOVER',
        label: 'Shift Cash Handover',
        description: 'Complete physical cash count, log variances, and hand over counter drawer.',
      },
      {
        id: 'PROCESS_SALES_RETURNS',
        label: 'Process Sales Returns',
        description: 'Handle customer item returns and issue refund vouchers under policy.',
      },
      {
        id: 'PRINT_THERMAL_RECEIPT',
        label: 'Print Thermal Receipts',
        description: 'Emit 58mm/80mm fiscal thermal receipts with QR verification codes.',
      },
      {
        id: 'VIEW_EXPIRING_BATCHES',
        label: 'FEFO Expiry Tracking',
        description: 'Monitor drugs expiring within 30, 60, and 90 days for early clearance.',
      },
      {
        id: 'EXPORT_INTERNSHIP_REPORTS',
        label: 'Export Internship & Audit Reports',
        description: 'Generate full documentation, EFDA logs, and Word (.docx) reports.',
      },
    ],
  },
];
