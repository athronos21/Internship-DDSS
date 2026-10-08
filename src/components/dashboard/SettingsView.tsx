import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  AlertTriangle,
  Clock,
  Filter,
  Inbox,
  MessageSquare,
  PhoneCall,
  Mail,
  Shield,
  Sliders,
  Store,
  Volume2,
  VolumeX,
  X,
  Plus,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  MapPin,
  Users,
  Banknote,
  Calendar,
  Edit3,
  CreditCard,
  QrCode,
  Barcode as BarcodeIcon,
  Smartphone,
  Wallet,
  Percent,
  Settings,
  ShieldCheck,
  HardDrive,
  Printer,
  Lock,
  FileText,
  Activity,
  Server,
} from 'lucide-react';
import { User } from '../../types';

interface SettingsViewProps {
  initialSubTab?: 'branch_config' | 'payment_methods' | 'store_config' | 'all_notifications' | 'notif_settings' | 'db_schema';
  currentUser?: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialSubTab = 'payment_methods',
  currentUser,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'branch_config' | 'payment_methods' | 'store_config' | 'all_notifications' | 'notif_settings' | 'db_schema'
  >(initialSubTab);

  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // System & Store Parameters State
  const [storeConfig, setStoreConfig] = useState({
    storeName: 'Kaziniya Drug Store',
    efdaLicense: 'EFDA/PH/2026/08912',
    address: 'Near Central Hospital, Bole Road, Addis Ababa, Ethiopia',
    phone: '+251 911 234 567',
    tinNumber: '0098234123',
    taxRatePercent: 15,
    currencySymbol: 'ETB',
    defaultReorderThreshold: 20,
    expiringAlertDays: 90,
    fefoEnforcement: true,
    requirePrescriptionForControlledSubstances: true,
    posReceiptPrinterWidth: '80mm',
    receiptFooterMessage: 'Thank you for trusting Kaziniya Pharmacy. Contact +251 911 234 567 for refill queries.',
    sessionTimeoutMinutes: 15,
    autoBackupFrequency: 'DAILY',
    auditLogRetentionDays: 365,
    systemLanguage: 'English & Amharic (አማርኛ)',
    realtimeDbSync: true,
    enableBarcodeSystem: false,
  });

  // Multi-Branch Settings State
  const [branches, setBranches] = useState([
    {
      id: 'BR-001',
      name: 'Kaziniya Central Main Store & Warehouse',
      code: 'HQ-ADDIS',
      type: 'Central Vault & Main Retail Pharmacy',
      manager: 'Dr. Ephrem Tadesse (Chief Pharmacist)',
      address: 'Bole Road, Near Central Hospital, Addis Ababa',
      phone: '+251 911 234 567',
      efdaLicense: 'EFDA/PH/2026/08912',
      status: 'ACTIVE',
      cashVaultFloat: 142500,
      inventoryValuation: 2850000,
      posCountersCount: 4,
      operatingHours: '24/7 Emergency Service',
    },
    {
      id: 'BR-002',
      name: 'Bole Sub-Branch Retail Outlet',
      code: 'BR-BOLE',
      type: 'Satellite Retail Pharmacy',
      manager: 'Pharmacist Rahel Worku',
      address: 'Edna Mall Commercial Complex, Bole, Addis Ababa',
      phone: '+251 911 887 766',
      efdaLicense: 'EFDA/PH/2026/08913',
      status: 'ACTIVE',
      cashVaultFloat: 48200,
      inventoryValuation: 940000,
      posCountersCount: 2,
      operatingHours: '08:00 AM - 10:00 PM',
    },
    {
      id: 'BR-003',
      name: 'Hawassa Regional Distribution Hub',
      code: 'HUB-HAWASSA',
      type: 'Regional Distribution Depot & Retail',
      manager: 'Dawit Solomon (Logistics Manager)',
      address: 'Piazza Commercial Zone, Hawassa, Sidama Region',
      phone: '+251 946 554 321',
      efdaLicense: 'EFDA/PH/2026/08914',
      status: 'OPENING_SOON',
      cashVaultFloat: 0,
      inventoryValuation: 0,
      posCountersCount: 1,
      operatingHours: '08:30 AM - 06:00 PM',
    },
  ]);

  // Payment Gateways & Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'PAY-TELEBIRR',
      name: 'Telebirr SuperApp & Merchant QR',
      provider: 'Ethio Telecom',
      code: 'TELEBIRR',
      status: 'ACTIVE',
      merchantShortCode: '889021',
      apiMode: 'LIVE_PRODUCTION',
      feePercent: 0.5,
      autoVerifyWebhook: true,
      description: 'Instant mobile money payments via Telebirr QR scan, USSD push, or SuperApp mini-program.',
    },
    {
      id: 'PAY-CBE',
      name: 'Commercial Bank of Ethiopia (CBE Birr & Mobile)',
      provider: 'Commercial Bank of Ethiopia',
      code: 'CBE_BIRR',
      status: 'ACTIVE',
      merchantShortCode: 'CBE-100029384920',
      apiMode: 'LIVE_PRODUCTION',
      feePercent: 0.0,
      autoVerifyWebhook: true,
      description: 'Direct account-to-account CBE transfers and CBE Birr USSD merchant payments.',
    },
    {
      id: 'PAY-CASH',
      name: 'Physical Cash (ETB Ethiopian Birr)',
      provider: 'In-Store POS Cashier Vault',
      code: 'CASH',
      status: 'ACTIVE',
      merchantShortCode: 'POS-DRAWER-01',
      apiMode: 'HARDWARE_DRAWER',
      feePercent: 0.0,
      autoVerifyWebhook: false,
      description: 'Cashier cash drawer with auto kick trigger, change calculator, and denomination audit.',
    },
    {
      id: 'PAY-CARD',
      name: 'Bank Debit/Credit POS Terminals',
      provider: 'Dashen / BOA / Awash / CBE POS',
      code: 'CARD_POS',
      status: 'ACTIVE',
      merchantShortCode: 'TERM-44021',
      apiMode: 'HARDWARE_POS',
      feePercent: 1.2,
      autoVerifyWebhook: false,
      description: 'Chip & contactless card swipe terminals for Visa, Mastercard, and local EthSwitch debit cards.',
    },
    {
      id: 'PAY-INSURANCE',
      name: 'Medical Insurance & Corporate Credit',
      provider: 'EIC, Nyala, Awash Insurance, Ethiopian Airlines',
      code: 'INSURANCE_CREDIT',
      status: 'ACTIVE',
      merchantShortCode: 'INS-CORP-900',
      apiMode: 'CREDIT_LEDGER',
      feePercent: 0.0,
      autoVerifyWebhook: true,
      description: 'Direct insurance co-pay billing and corporate staff credit vouchers with pre-approval tracking.',
    },
    {
      id: 'PAY-CHAPA',
      name: 'Chapa Digital Payment Gateway',
      provider: 'Chapa Financial Technologies',
      code: 'CHAPA_WEB',
      status: 'ACTIVE',
      merchantShortCode: 'CHAP-SEC-9921',
      apiMode: 'LIVE_PRODUCTION',
      feePercent: 2.0,
      autoVerifyWebhook: true,
      description: 'E-commerce online checkout gateway for web prescription purchases.',
    },
  ]);

  const [transferRules, setTransferRules] = useState({
    autoApproveReorders: true,
    requirePharmacistColdChainSignoff: true,
    pricingMode: 'UNIFORM', // 'UNIFORM' or 'LOCATION_BASED'
    allowCrossBranchSales: true,
  });

  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    type: 'Satellite Retail Pharmacy',
    manager: '',
    address: '',
    phone: '',
    efdaLicense: '',
    posCountersCount: 1,
    operatingHours: '08:00 AM - 08:00 PM',
  });

  // Notification Rules & Alert Settings State
  const [notifRules, setNotifRules] = useState({
    enableLowStockAlerts: true,
    lowStockThreshold: 25,
    enableExpiryAlerts: true,
    expiryDaysWindow: 90,
    enableUnbalancedJournalAlerts: true,
    enableOnlineOrderSound: true,
    enableSmsGateways: true,
    managerSmsNumber: '+251 911 987 654',
    enableTelegramBot: true,
    telegramChatId: '@kaziniya_pharmacy_alerts',
    enableEmailDigest: true,
    managerEmail: 'manager@kaziniya.et',
  });

  // Mock Active System Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-101',
      title: 'Critical Low Stock Warning',
      message: 'Amoxicillin 500mg capsules fell below reorder threshold (12 units remaining).',
      type: 'STOCK',
      priority: 'HIGH',
      timestamp: '2026-08-12 04:30 AM',
      read: false,
      actionText: 'Generate PO',
    },
    {
      id: 'NOTIF-102',
      title: 'Batch Expiring Soon Alert',
      message: 'Paracetamol 500mg (Batch #PAR-2024-B9) expires in 18 days (50 boxes).',
      type: 'EXPIRY',
      priority: 'HIGH',
      timestamp: '2026-08-12 02:15 AM',
      read: false,
      actionText: 'Inspect Batch',
    },
    {
      id: 'NOTIF-103',
      title: 'Pending Purchase Order Approval',
      message: 'PO #PO-2026-089 (EPHARM Wholesaler - 120,000 ETB) requires manager approval.',
      type: 'PROCUREMENT',
      priority: 'MEDIUM',
      timestamp: '2026-08-11 05:40 PM',
      read: false,
      actionText: 'Review PO',
    },
    {
      id: 'NOTIF-104',
      title: 'New Online Order Received',
      message: 'Customer Selam T. placed web prescription order #ORD-8821.',
      type: 'SALES',
      priority: 'MEDIUM',
      timestamp: '2026-08-11 03:10 PM',
      read: true,
      actionText: 'View Order',
    },
    {
      id: 'NOTIF-105',
      title: 'Unbalanced Journal Voucher Logged',
      message: 'Journal Entry JV-2026-0801 has a debit/credit discrepancy of 500 ETB.',
      type: 'FINANCIAL',
      priority: 'HIGH',
      timestamp: '2026-08-10 11:20 AM',
      read: true,
      actionText: 'Audit Entry',
    },
    {
      id: 'NOTIF-106',
      title: 'Staff Leave Application Submitted',
      message: 'Hiwot Kebede requested 7 days annual leave starting Aug 15.',
      type: 'HR',
      priority: 'INFO',
      timestamp: '2026-08-10 09:00 AM',
      read: true,
      actionText: 'Approve Leave',
    },
  ]);

  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    fetchSqlSchema();
    fetchPharmacyProfile();
  }, []);

  const fetchPharmacyProfile = async () => {
    try {
      const res = await fetch('/api/pharmacy/profile');
      const data = await res.json();
      if (data.success && data.data) {
        setStoreConfig((prev) => ({
          ...prev,
          storeName: data.data.storeName || prev.storeName,
          efdaLicense: data.data.efdaLicense || prev.efdaLicense,
          address: data.data.streetAddress || prev.address,
          phone: data.data.phone || prev.phone,
          tinNumber: data.data.tinNumber || prev.tinNumber,
          receiptFooterMessage: data.data.receiptFooterMessage || prev.receiptFooterMessage,
          enableBarcodeSystem: Boolean(data.data.enableBarcodeSystem),
        }));
      }
    } catch (e) {
      console.warn('Failed to load pharmacy profile:', e);
    }
  };

  const isOwnerOrAdmin =
    !currentUser ||
    currentUser.role === 'STORE_OWNER' ||
    currentUser.role === 'SUPER_ADMIN' ||
    Boolean(currentUser.isOwner) ||
    Boolean(currentUser.isSuperAdmin);

  const handleToggleBarcodeSystem = async (newValue: boolean) => {
    if (!isOwnerOrAdmin) {
      alert('The Barcode Scanning & Label Printing Subsystem is managed exclusively by the Drug Store Owner or Super Admin.');
      return;
    }

    setStoreConfig((prev) => ({ ...prev, enableBarcodeSystem: newValue }));

    try {
      const res = await fetch('/api/pharmacy/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'u-1',
        },
        body: JSON.stringify({ enableBarcodeSystem: newValue }),
      });
      const data = await res.json();
      if (!data.success) {
        console.warn('Server failed to persist barcode toggle:', data.message);
      }
    } catch (e) {
      console.error('Failed to update barcode toggle:', e);
    }
  };

  const handleSaveStoreConfig = async () => {
    try {
      const res = await fetch('/api/pharmacy/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || 'u-1',
        },
        body: JSON.stringify({
          storeName: storeConfig.storeName,
          efdaLicense: storeConfig.efdaLicense,
          streetAddress: storeConfig.address,
          phone: storeConfig.phone,
          tinNumber: storeConfig.tinNumber,
          receiptFooterMessage: storeConfig.receiptFooterMessage,
          enableBarcodeSystem: storeConfig.enableBarcodeSystem,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('All EIMS system parameters, barcode subsystem configuration, and EFDA credentials saved successfully!');
      } else {
        alert(data.message || 'Failed to save store configuration.');
      }
    } catch (e) {
      alert('Network error while saving store configuration.');
    }
  };

  const fetchSqlSchema = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database/schema-sql');
      const data = await res.json();
      if (data.success) {
        setSqlSchema(data.data.sql);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlSchema], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'kaziniya_pharmacy_schema_supabase.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.code) {
      alert('Please fill in required fields (Branch Name and Code).');
      return;
    }
    const created = {
      id: `BR-00${branches.length + 1}`,
      name: newBranch.name,
      code: newBranch.code.toUpperCase(),
      type: newBranch.type,
      manager: newBranch.manager || 'Unassigned',
      address: newBranch.address || 'Addis Ababa',
      phone: newBranch.phone || '+251 900 000 000',
      efdaLicense: newBranch.efdaLicense || 'EFDA/PH/2026/PENDING',
      status: 'ACTIVE',
      cashVaultFloat: 25000,
      inventoryValuation: 100000,
      posCountersCount: Number(newBranch.posCountersCount) || 1,
      operatingHours: newBranch.operatingHours,
    };
    setBranches([...branches, created]);
    setIsAddBranchModalOpen(false);
    setNewBranch({
      name: '',
      code: '',
      type: 'Satellite Retail Pharmacy',
      manager: '',
      address: '',
      phone: '',
      efdaLicense: '',
      posCountersCount: 1,
      operatingHours: '08:00 AM - 08:00 PM',
    });
    alert(`Branch "${created.name}" created and configured successfully!`);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'STOCK') return n.type === 'STOCK' || n.type === 'EXPIRY';
    if (filterType === 'FINANCIAL') return n.type === 'FINANCIAL' || n.type === 'PROCUREMENT';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* NOTIFICATIONS & SETTINGS SUB-TAB NAVBAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('branch_config')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'branch_config'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Branch Outlets & Multi-Store</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payment_methods')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'payment_methods'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Gateways & Methods</span>
        </button>

        <button
          onClick={() => setActiveSubTab('all_notifications')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'all_notifications'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notification Center ({unreadCount} unread)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notif_settings')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'notif_settings'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <BellRing className="h-4 w-4" />
          <span>Alert Rules & Triggers</span>
        </button>

        <button
          onClick={() => setActiveSubTab('store_config')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'store_config'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>System & Store Parameters</span>
        </button>

        <button
          onClick={() => setActiveSubTab('db_schema')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeSubTab === 'db_schema'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>PostgreSQL / Supabase DDL</span>
        </button>
      </div>

      {/* SUB-VIEW 0: BRANCH OUTLETS & MULTI-STORE SETTINGS */}
      {activeSubTab === 'branch_config' && (
        <div className="space-y-6">
          {/* TOP ACTION BAR */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" /> Pharmacy Chain Outlets & Multi-Store Settings
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure physical pharmacy branch locations, cash vault floats, POS terminal counts, and EFDA licenses across Ethiopia.
              </p>
            </div>

            <button
              onClick={() => setIsAddBranchModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="h-4 w-4" /> Register New Branch
            </button>
          </div>

          {/* BRANCH CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md dark:bg-teal-950/60 dark:text-teal-400">
                        {b.code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm dark:text-white mt-1.5 leading-snug">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{b.type}</p>
                    </div>
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                        b.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{b.manager}</span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{b.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      <PhoneCall className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{b.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                      <Shield className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span className="font-mono">{b.efdaLicense}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                      <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{b.operatingHours}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 dark:bg-slate-950 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">CASH VAULT FLOAT</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {b.cashVaultFloat.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 dark:bg-slate-950 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block">POS TERMINALS</span>
                      <span className="font-extrabold text-teal-600 text-sm">
                        {b.posCountersCount} Active Counter{b.posCountersCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => alert(`Opening configuration panel for ${b.name}`)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition text-center dark:bg-slate-800 dark:text-slate-300"
                  >
                    Edit Config
                  </button>
                  <button
                    onClick={() => alert(`Adjusting vault float for ${b.name}`)}
                    className="flex-1 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition text-center dark:bg-teal-950/60 dark:text-teal-300"
                  >
                    Vault Float
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* INTER-BRANCH TRANSFER & PRICING RULES */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-teal-600" /> Multi-Store Transfer & Pricing Policy Rules
              </h4>
              <p className="text-xs text-slate-500">
                Define rules for inter-branch inventory transfers, price synchronization, and cold-chain compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Auto-Approve Reorders from Main Vault
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sub-branch low stock requests auto-issue POs to Main Warehouse
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={transferRules.autoApproveReorders}
                  onChange={(e) => setTransferRules({ ...transferRules, autoApproveReorders: e.target.checked })}
                  className="h-4 w-4 accent-teal-600 rounded shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Cold-Chain Pharmacist Verification
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Require licensed pharmacist signature before dispatching temperature-sensitive vaccines
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={transferRules.requirePharmacistColdChainSignoff}
                  onChange={(e) =>
                    setTransferRules({
                      ...transferRules,
                      requirePharmacistColdChainSignoff: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-teal-600 rounded shrink-0"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Chain-Wide Retail Price Mode
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Uniform pricing vs location-specific regional markups
                  </span>
                </div>
                <select
                  value={transferRules.pricingMode}
                  onChange={(e) => setTransferRules({ ...transferRules, pricingMode: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 font-bold text-xs dark:bg-slate-900 dark:border-slate-800"
                >
                  <option value="UNIFORM">Uniform Price Across All Branches</option>
                  <option value="LOCATION_BASED">Location-Specific Markup</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="font-bold block text-slate-800 dark:text-slate-200">
                    Cross-Branch Customer Order Fulfillment
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Allow cashiers to accept prescription payments for pickup at another branch
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={transferRules.allowCrossBranchSales}
                  onChange={(e) => setTransferRules({ ...transferRules, allowCrossBranchSales: e.target.checked })}
                  className="h-4 w-4 accent-teal-600 rounded shrink-0"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => alert('Multi-store transfer policy and pricing rules saved!')}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
              >
                Save Branch Policies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW BRANCH MODAL */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
                  Register New Branch Outlet
                </h3>
              </div>
              <button
                onClick={() => setIsAddBranchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranchSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Branch Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Merkato Retail Store"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Branch Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-MERKATO"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Facility Type
                  </label>
                  <select
                    value={newBranch.type}
                    onChange={(e) => setNewBranch({ ...newBranch, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    <option value="Satellite Retail Pharmacy">Satellite Retail Pharmacy</option>
                    <option value="Main Central Store">Main Central Store</option>
                    <option value="Regional Distribution Depot">Regional Distribution Depot</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    EFDA License Number
                  </label>
                  <input
                    type="text"
                    placeholder="EFDA/PH/2026/08915"
                    value={newBranch.efdaLicense}
                    onChange={(e) => setNewBranch({ ...newBranch, efdaLicense: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Manager in Charge
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Samuel Girma"
                    value={newBranch.manager}
                    onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+251 911 000 111"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Physical Address
                </label>
                <input
                  type="text"
                  placeholder="Merkato Commercial Plaza, Addis Ababa"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    POS Counter Terminals
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBranch.posCountersCount}
                    onChange={(e) => setNewBranch({ ...newBranch, posCountersCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={newBranch.operatingHours}
                    onChange={(e) => setNewBranch({ ...newBranch, operatingHours: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs"
                >
                  Save Branch Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-VIEW 0.5: PAYMENT GATEWAYS & PAYMENT METHODS */}
      {activeSubTab === 'payment_methods' && (
        <div className="space-y-6">
          {/* METRICS HEADER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ACTIVE GATEWAYS</span>
                <CreditCard className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {paymentMethods.filter((p) => p.status === 'ACTIVE').length} / {paymentMethods.length} Enabled
              </p>
              <p className="text-[11px] text-teal-600 font-bold">POS Cashier & E-Commerce Ready</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">TELEBIRR SUPERAPP</span>
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-600">ShortCode: 889021</p>
              <p className="text-[11px] text-slate-500 font-medium">Auto Webhook Reconciled (0.5% Fee)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">CBE BIRR DIRECT</span>
                <Banknote className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-600">0.0% Fee</p>
              <p className="text-[11px] text-slate-500 font-medium">CBE Merchant USSD & Account API</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">INSURANCE & CREDIT</span>
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">Co-Pay Ledger</p>
              <p className="text-[11px] text-emerald-600 font-bold">EIC, Nyala & Awash Direct Billing</p>
            </div>
          </div>

          {/* MAIN PAYMENT METHODS LIST PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-600" /> Accepted Store Payment Gateways & Cashier Channels
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure payment provider merchant IDs, webhook auto-verifications, card terminals, and transaction fee percentages for POS cashiers and web portal checkout.
              </p>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((pm, idx) => (
                <div
                  key={pm.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-950 dark:border-slate-800 space-y-4 transition hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shrink-0 mt-0.5">
                        {pm.code === 'TELEBIRR' && <Smartphone className="h-5 w-5 text-blue-600" />}
                        {pm.code === 'CBE_BIRR' && <Banknote className="h-5 w-5 text-purple-600" />}
                        {pm.code === 'CASH' && <Wallet className="h-5 w-5 text-emerald-600" />}
                        {pm.code === 'CARD_POS' && <CreditCard className="h-5 w-5 text-amber-600" />}
                        {pm.code === 'INSURANCE_CREDIT' && <Shield className="h-5 w-5 text-teal-600" />}
                        {pm.code === 'CHAPA_WEB' && <QrCode className="h-5 w-5 text-indigo-600" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm dark:text-white">{pm.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md dark:bg-slate-800 dark:text-slate-300">
                            {pm.provider}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{pm.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span>{pm.status === 'ACTIVE' ? 'Enabled' : 'Disabled'}</span>
                        <input
                          type="checkbox"
                          checked={pm.status === 'ACTIVE'}
                          onChange={(e) => {
                            const updated = paymentMethods.map((p, i) =>
                              i === idx ? { ...p, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' } : p
                            );
                            setPaymentMethods(updated);
                          }}
                          className="h-4 w-4 accent-teal-600 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="font-bold block mb-1 text-slate-600 dark:text-slate-400">
                        Merchant ShortCode / ID
                      </label>
                      <input
                        type="text"
                        value={pm.merchantShortCode}
                        onChange={(e) => {
                          const updated = paymentMethods.map((p, i) =>
                            i === idx ? { ...p, merchantShortCode: e.target.value } : p
                          );
                          setPaymentMethods(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-600 dark:text-slate-400">
                        API & Hardware Mode
                      </label>
                      <select
                        value={pm.apiMode}
                        onChange={(e) => {
                          const updated = paymentMethods.map((p, i) =>
                            i === idx ? { ...p, apiMode: e.target.value } : p
                          );
                          setPaymentMethods(updated);
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-semibold text-xs"
                      >
                        <option value="LIVE_PRODUCTION">Live Production API</option>
                        <option value="HARDWARE_DRAWER">Hardware Cash Drawer</option>
                        <option value="HARDWARE_POS">Bank Card POS Terminal</option>
                        <option value="CREDIT_LEDGER">Corporate Credit Ledger</option>
                        <option value="SANDBOX_TEST">Sandbox Test Mode</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-600 dark:text-slate-400">
                        Merchant Fee (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={pm.feePercent}
                          onChange={(e) => {
                            const updated = paymentMethods.map((p, i) =>
                              i === idx ? { ...p, feePercent: Number(e.target.value) } : p
                            );
                            setPaymentMethods(updated);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2 pr-6 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-semibold text-xs"
                        />
                        <span className="absolute right-2.5 top-2 text-slate-400 font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-600 dark:text-slate-400">
                        Auto Webhook Reconciliation
                      </label>
                      <div className="flex items-center gap-2 pt-1.5">
                        <input
                          type="checkbox"
                          checked={pm.autoVerifyWebhook}
                          onChange={(e) => {
                            const updated = paymentMethods.map((p, i) =>
                              i === idx ? { ...p, autoVerifyWebhook: e.target.checked } : p
                            );
                            setPaymentMethods(updated);
                          }}
                          className="h-4 w-4 accent-teal-600 rounded"
                        />
                        <span className="text-[11px] text-slate-500 font-medium">
                          {pm.autoVerifyWebhook ? 'Auto-verified' : 'Manual cashier audit'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => alert('Payment gateway configurations and cashier payment methods updated successfully!')}
                className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Save Payment Gateway Settings
              </button>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'all_notifications' && (
        <div className="space-y-6">
          {/* TOP METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">TOTAL NOTIFICATIONS</span>
                <Inbox className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{notifications.length}</p>
              <p className="text-[11px] text-slate-500 font-medium">Logged in store vault</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">UNREAD ALERTS</span>
                <BellRing className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600">{unreadCount}</p>
              <p className="text-[11px] text-amber-600 font-bold">Action required</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">STOCK & EXPIRY ALERTS</span>
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">2 Critical</p>
              <p className="text-[11px] text-rose-600 font-bold">Amoxicillin & Paracetamol</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">SMS / TELEGRAM GATEWAY</span>
                <PhoneCall className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">Active</p>
              <p className="text-[11px] text-slate-500 font-medium">Connected to @kaziniya_bot</p>
            </div>
          </div>

          {/* MAIN NOTIFICATION FEED PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-teal-600" /> System Alerts & Notifications Feed
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time pharmacy alerts covering inventory reorder, batch expiry, PO approvals, and financial logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1.5 dark:bg-slate-800 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mark All as Read
                </button>
              </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterType('UNREAD')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'UNREAD'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilterType('STOCK')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'STOCK'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Stock & Expiry Alerts
              </button>
              <button
                onClick={() => setFilterType('FINANCIAL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  filterType === 'FINANCIAL'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Procurement & Ledger
              </button>
            </div>

            {/* NOTIFICATION FEED LIST */}
            <div className="space-y-3 pt-2">
              {filteredNotifs.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    !n.read
                      ? 'bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50'
                      : 'bg-slate-50 border-slate-200/80 dark:bg-slate-950 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        n.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : n.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm dark:text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => alert(`Redirecting to action for ${n.title}`)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs"
                    >
                      {n.actionText}
                    </button>
                    <button
                      onClick={() => toggleReadStatus(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
                      title={n.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check className={`h-4 w-4 ${n.read ? 'text-emerald-600' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ALERT RULES & AUTOMATED TRIGGERS */}
      {activeSubTab === 'notif_settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
              <BellRing className="h-5 w-5 text-teal-600" /> Automated Alert Threshold Rules & Delivery Channels
            </h3>
            <p className="text-xs text-slate-500">
              Configure real-time trigger rules for low inventory, expiring medicine batches, sound chimes, and SMS/Telegram gateways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* PANEL 1: THRESHOLD RULES */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 dark:bg-slate-950 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-600" /> Inventory & Financial Threshold Triggers
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">Low Stock Reorder Alert</span>
                    <span className="text-[11px] text-slate-400">Trigger alert when medicine units drop below threshold</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifRules.enableLowStockAlerts}
                    onChange={(e) => setNotifRules({ ...notifRules, enableLowStockAlerts: e.target.checked })}
                    className="h-4 w-4 accent-teal-600 rounded"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Low Stock Threshold (Units)
                  </label>
                  <input
                    type="number"
                    value={notifRules.lowStockThreshold}
                    onChange={(e) => setNotifRules({ ...notifRules, lowStockThreshold: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">Batch Expiry Advance Notice</span>
                    <span className="text-[11px] text-slate-400">Flag batch in alerts before expiry date</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifRules.enableExpiryAlerts}
                    onChange={(e) => setNotifRules({ ...notifRules, enableExpiryAlerts: e.target.checked })}
                    className="h-4 w-4 accent-teal-600 rounded"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Expiry Warning Window (Days)
                  </label>
                  <input
                    type="number"
                    value={notifRules.expiryDaysWindow}
                    onChange={(e) => setNotifRules({ ...notifRules, expiryDaysWindow: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* PANEL 2: DELIVERY CHANNELS & SOUND CHIMES */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 dark:bg-slate-950 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-teal-600" /> External Gateway Channels & POS Audio
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">POS & Online Order Sound Chime</span>
                    <span className="text-[11px] text-slate-400">Play audio chime on incoming customer web order</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifRules.enableOnlineOrderSound}
                    onChange={(e) => setNotifRules({ ...notifRules, enableOnlineOrderSound: e.target.checked })}
                    className="h-4 w-4 accent-teal-600 rounded"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Manager SMS Gateway Contact
                  </label>
                  <input
                    type="text"
                    value={notifRules.managerSmsNumber}
                    onChange={(e) => setNotifRules({ ...notifRules, managerSmsNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                    Telegram Bot Alerts Channel
                  </label>
                  <input
                    type="text"
                    value={notifRules.telegramChatId}
                    onChange={(e) => setNotifRules({ ...notifRules, telegramChatId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => alert('Notification rules & alert thresholds saved successfully!')}
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs"
            >
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SYSTEM & STORE CONFIGURATION DASHBOARD */}
      {activeSubTab === 'store_config' && (
        <div className="space-y-6">
          {/* TOP METRIC CARDS FOR SYSTEM ENVIRONMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">SYSTEM STATUS</span>
                <Server className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">v2.4.0 Live</p>
              <p className="text-[11px] text-teal-600 font-bold">Build #891 - Cloud Container Active</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">DATABASE ENGINE</span>
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-600">PostgreSQL</p>
              <p className="text-[11px] text-slate-500 font-medium">Supabase Pool Latency 18ms</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">EFDA LEGAL CERTIFICATION</span>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">Verified</p>
              <p className="text-[11px] text-emerald-600 font-bold">Valid through Dec 2028</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">VAULT BACKUP & AUDIT</span>
                <HardDrive className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-600">Daily 02:00 UTC</p>
              <p className="text-[11px] text-slate-500 font-medium">AES-256 Encrypted Backups</p>
            </div>
          </div>

          {/* SYSTEM CONFIGURATION PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-teal-600" /> System Operational Parameters & EFDA Legal Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure core pharmacy system behavior, FEFO inventory dispatching rules, receipt printer headers, tax rates, and security idle timeouts.
              </p>
            </div>

            {/* SECTION 1: LEGAL ENTITY & TAX PROFILE */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-950 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" /> Pharmacy Trade & Legal Entity Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Drug Store Trade Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeConfig.storeName}
                    onChange={(e) => setStoreConfig({ ...storeConfig, storeName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    EFDA Pharmacy License Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={storeConfig.efdaLicense}
                    onChange={(e) => setStoreConfig({ ...storeConfig, efdaLicense: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Business Tax Identification No. (TIN)
                  </label>
                  <input
                    type="text"
                    value={storeConfig.tinNumber}
                    onChange={(e) => setStoreConfig({ ...storeConfig, tinNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Headquarters Address
                  </label>
                  <input
                    type="text"
                    value={storeConfig.address}
                    onChange={(e) => setStoreConfig({ ...storeConfig, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Contact Phone Line
                  </label>
                  <input
                    type="text"
                    value={storeConfig.phone}
                    onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Primary System Language
                  </label>
                  <input
                    type="text"
                    disabled
                    value={storeConfig.systemLanguage}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-300 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CLINICAL DISPENSING & FEFO INVENTORY RULES */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-950 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-600" /> Clinical Dispensing & Inventory Logic
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Enforce FEFO (First-Expiry, First-Out) Batch Priority
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Force POS cashiers to pick batches expiring soonest before newer inventory
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeConfig.fefoEnforcement}
                    onChange={(e) => setStoreConfig({ ...storeConfig, fefoEnforcement: e.target.checked })}
                    className="h-4 w-4 accent-teal-600 rounded shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="font-bold block text-slate-800 dark:text-slate-200">
                      Require Prescription Signature for Controlled Drugs
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Block checkout of narcotic/controlled drugs without doctor & pharmacist signoff
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeConfig.requirePrescriptionForControlledSubstances}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        requirePrescriptionForControlledSubstances: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-teal-600 rounded shrink-0"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Default Low Stock Reorder Threshold (Units)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.defaultReorderThreshold}
                    onChange={(e) =>
                      setStoreConfig({ ...storeConfig, defaultReorderThreshold: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Advance Batch Expiry Alert Window (Days)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.expiringAlertDays}
                    onChange={(e) => setStoreConfig({ ...storeConfig, expiringAlertDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: POS HARDWARE & RECEIPT PRINTER SETTINGS */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-950 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Printer className="h-4 w-4 text-teal-600" /> POS Thermal Receipt & Fiscal Tax Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Base Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={storeConfig.currencySymbol}
                    onChange={(e) => setStoreConfig({ ...storeConfig, currencySymbol: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Standard VAT Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.taxRatePercent}
                    onChange={(e) => setStoreConfig({ ...storeConfig, taxRatePercent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Thermal Receipt Paper Width
                  </label>
                  <select
                    value={storeConfig.posReceiptPrinterWidth}
                    onChange={(e) => setStoreConfig({ ...storeConfig, posReceiptPrinterWidth: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-semibold"
                  >
                    <option value="80mm">80mm Standard POS Thermal Roll</option>
                    <option value="58mm">58mm Compact Mobile Printer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Customer Receipt Footer Message / Disclaimer
                </label>
                <input
                  type="text"
                  value={storeConfig.receiptFooterMessage}
                  onChange={(e) => setStoreConfig({ ...storeConfig, receiptFooterMessage: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* SECTION 4: SECURITY, BACKUP & AUDIT RETENTION */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:bg-slate-950 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-600" /> Security, Automated Backup & Database Sync
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    User Session Idle Lockout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.sessionTimeoutMinutes}
                    onChange={(e) => setStoreConfig({ ...storeConfig, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Database Vault Backup Frequency
                  </label>
                  <select
                    value={storeConfig.autoBackupFrequency}
                    onChange={(e) => setStoreConfig({ ...storeConfig, autoBackupFrequency: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-semibold"
                  >
                    <option value="HOURLY">Every 6 Hours</option>
                    <option value="DAILY">Daily Automatic (02:00 AM UTC)</option>
                    <option value="WEEKLY">Weekly Full Snapshot</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    Audit Log Retention Window (Days)
                  </label>
                  <input
                    type="number"
                    value={storeConfig.auditLogRetentionDays}
                    onChange={(e) => setStoreConfig({ ...storeConfig, auditLogRetentionDays: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: BARCODE SCANNING & THERMAL LABEL SUBSYSTEM (FUTURE FEATURE TOGGLE) */}
            <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950 dark:border-indigo-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BarcodeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-extrabold text-slate-900 text-sm dark:text-white">
                      Barcode Scanning & Thermal Label Printing Subsystem
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Future Feature Toggle
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Managed exclusively by the Drug Store Owner. Toggle hardware laser barcode scanners, camera-based barcode recognition, and 50mm thermal barcode shelf/box sticker printing across the POS Counter and Inventory Workstation.
                  </p>
                </div>

                {/* Dedicated On/Off Toggle Button */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/80 shadow-xs shrink-0">
                  <span className={`text-xs font-bold ${storeConfig.enableBarcodeSystem ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {storeConfig.enableBarcodeSystem ? 'SYSTEM ON' : 'SYSTEM OFF'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={storeConfig.enableBarcodeSystem}
                    disabled={!isOwnerOrAdmin}
                    onClick={() => handleToggleBarcodeSystem(!storeConfig.enableBarcodeSystem)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      storeConfig.enableBarcodeSystem ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    } ${!isOwnerOrAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isOwnerOrAdmin ? 'Toggle Barcode Subsystem' : 'Managed exclusively by Drug Store Owner'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        storeConfig.enableBarcodeSystem ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className={`p-3 rounded-xl border ${storeConfig.enableBarcodeSystem ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                  <span className="font-bold block">1. POS Barcode Scanner</span>
                  <span className="text-[11px]">{storeConfig.enableBarcodeSystem ? 'Camera & laser scanner enabled' : 'Disabled (Manual name & SKU search active)'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${storeConfig.enableBarcodeSystem ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                  <span className="font-bold block">2. Label Studio</span>
                  <span className="text-[11px]">{storeConfig.enableBarcodeSystem ? '50mm thermal shelf label generation active' : 'Disabled / Standby'}</span>
                </div>
                <div className={`p-3 rounded-xl border ${storeConfig.enableBarcodeSystem ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                  <span className="font-bold block">3. Access Governance</span>
                  <span className="text-[11px]">Configurable only by Drug Store Owner or Super Admin</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveStoreConfig}
                className="rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> Save System Configurations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: DATABASE SCHEMA DDL EXPORT */}
      {activeSubTab === 'db_schema' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-teal-600" /> Supabase / PostgreSQL DDL Export
              </h3>
              <p className="text-xs text-slate-500">
                Ready-to-deploy SQL schema file for production Supabase / Cloud SQL migration with Foreign Keys & Indexes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
              <button
                onClick={handleDownloadSql}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs"
              >
                <Download className="h-4 w-4" /> Download .SQL File
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800">
            <pre className="font-mono text-[11px] text-teal-300 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {loading ? 'Generating PostgreSQL schema...' : sqlSchema}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
