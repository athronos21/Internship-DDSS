import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from './utils/motionVariants';
import { safeFetchJson } from './utils/api';
import { User, UserRole, Medicine } from './types';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import { PublicHome } from './components/public/PublicHome';
import { PublicProducts } from './components/public/PublicProducts';
import { PublicOrders } from './components/public/PublicOrders';
import { PublicFavorites } from './components/public/PublicFavorites';
import { PublicContact } from './components/public/PublicContact';
import { PublicProfileModal } from './components/public/PublicProfileModal';
import { AuthModal } from './components/public/AuthModal';
import { DDSGatewayPage } from './components/public/DDSGatewayPage';
import { OwnerRegistrationModal } from './components/public/OwnerRegistrationModal';
import { SupplierRegistrationModal } from './components/public/SupplierRegistrationModal';
import { PharmacistAuthorizationModal } from './components/public/PharmacistAuthorizationModal';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewView } from './components/dashboard/OverviewView';
import { InventoryView } from './components/dashboard/InventoryView';
import { InventorySystemWorkstation } from './components/inventory/InventorySystemWorkstation';
import { AddMedicineView } from './components/dashboard/AddMedicineView';
import { PosView } from './components/dashboard/PosView';
import { SalesView } from './components/dashboard/SalesView';
import { PurchasesView } from './components/dashboard/PurchasesView';
import { ReportsView } from './components/dashboard/ReportsView';
import { UsersAndAuditView } from './components/dashboard/UsersAndAuditView';
import { SettingsView } from './components/dashboard/SettingsView';
import { PortalCmsView } from './components/dashboard/PortalCmsView';
import { MasterAdminView, MasterAdminTab } from './components/dashboard/MasterAdminView';
import { RegistrationNetworkDashboard } from './components/public/RegistrationNetworkDashboard';
import { ShiftHandoverModal } from './components/dashboard/ShiftHandoverModal';
import { FlutterAppSimulator } from './components/mobile/FlutterAppSimulator';
import { PhoneConnectQrModal } from './components/mobile/PhoneConnectQrModal';
import { InternshipReportModal } from './components/common/InternshipReportModal';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ToastProvider, useToast } from './context/ToastContext';
import { PortalContentProvider } from './context/PortalContentContext';
import { Smartphone, FileText } from 'lucide-react';

const DEFAULT_AVAILABLE_USERS: User[] = [
  {
    id: 'u-superadmin',
    name: 'Atronos Sisay',
    email: 'athronos21@gmail.com',
    role: 'SUPER_ADMIN',
    employeeId: 'SYS-ADMIN-001',
    isSuperAdmin: true,
    isOwner: false,
    department: 'Whole System Administration & Governance',
    password: '••••••••••',
    pin: '2144',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-superadmin-2',
    name: 'Beka Girma',
    email: 'beka.girma@gmail.com',
    role: 'SUPER_ADMIN',
    employeeId: 'SYS-ADMIN-002',
    isSuperAdmin: true,
    isOwner: false,
    department: 'Whole System Administration & Governance',
    password: '••••••••••',
    pin: '2144',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-1',
    name: 'Kaziniya Ahmed',
    email: 'kaziniya@kaziniya.com',
    role: 'STORE_OWNER',
    employeeId: 'KZN-OWNER-001',
    isOwner: true,
    isSuperAdmin: false,
    department: 'Pharmacy Administration & Ownership',
    password: '••••••••••',
    pin: '1234',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-munaa',
    name: 'Monet Alemayehu',
    email: 'monet@kaziniya.com',
    role: 'PHARMACIST',
    employeeId: 'EMP-PHARM-01',
    isSuperAdmin: false,
    isOwner: false,
    department: 'Dispensary & Counter',
    password: '••••••••••',
    pin: '2144',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'u-2',
    name: 'Pharm. Solomon Bekele',
    email: 'pharmacist@kaziniya.com',
    role: 'PHARMACIST',
    employeeId: 'KZN-PH-002',
    department: 'Clinical Dispensing & POS Counter',
    isActive: true,
    isOwner: false,
    isSuperAdmin: false,
    password: '••••••••••',
    pin: '3456',
    status: 'ACTIVE',
    createdAt: '2026-01-03T08:00:00Z',
  },
  {
    id: 'u-3',
    name: 'Pharm. Bethlehem Worku',
    email: 'bethlehem@kaziniya.com',
    role: 'PHARMACIST',
    employeeId: 'KZN-PH-003',
    department: 'Prescription Verification & Dispensing',
    isActive: true,
    isOwner: false,
    isSuperAdmin: false,
    mustChangePassword: true,
    temporaryPassword: 'Temp#Pharma2026',
    password: 'Temp#Pharma2026',
    pin: '4567',
    status: 'PENDING_FIRST_LOGIN',
    createdAt: '2026-01-04T08:00:00Z',
  },
  {
    id: 'u-sup-1',
    name: 'Supplier',
    email: 'supplier@medtech.com',
    role: 'SUPPLIER',
    employeeId: 'SUP-WHL-001',
    department: 'Pharmaceutical Wholesale & Procurement',
    pharmacyName: 'MedTech Wholesale Distribution Hub',
    isActive: true,
    isOwner: false,
    isSuperAdmin: false,
    password: '••••••••••',
    pin: '5678',
    status: 'ACTIVE',
    createdAt: '2026-01-05T08:00:00Z',
  },
];

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<'gateway' | 'public_home' | 'public_products' | 'public_orders' | 'public_favorites' | 'public_contact' | 'public_registration' | 'dashboard'>('dashboard');
  const [dashboardView, setDashboardView] = useState<string>('purchases');
  const [loginInitialMode, setLoginInitialMode] = useState<'STORE_STAFF' | 'MASTER_ADMIN'>('STORE_STAFF');
  const [inventorySubTab, setInventorySubTab] = useState<'medicines' | 'batches' | 'low' | 'expiring' | 'archived' | 'movements' | 'requests'>('medicines');
  const [salesSubTab, setSalesSubTab] = useState<'all_sales' | 'online_orders' | 'sales_returns'>('all_sales');
  const [purchasesSubTab, setPurchasesSubTab] = useState<'suppliers' | 'purchase_orders' | 'goods_receipts' | 'purchase_invoices' | 'supplier_payments' | 'purchase_returns' | 'ap_dashboard'>('purchase_orders');
  const [reportsSubTab, setReportsSubTab] = useState<'analytics' | 'ml_forecast' | 'chart_of_accounts' | 'journal_entries' | 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'expenses' | 'branch_reports'>('analytics');
  const [hrSubTab, setHrSubTab] = useState<'dashboard' | 'employees' | 'attendance' | 'schedules' | 'leave_requests' | 'payroll' | 'loans' | 'departments' | 'job_titles' | 'audit_logs'>('employees');
  const [settingsSubTab, setSettingsSubTab] = useState<'store_config' | 'all_notifications' | 'notif_settings' | 'db_schema' | 'branch_config' | 'payment_methods'>('all_notifications');
  const [masterAdminSubTab, setMasterAdminSubTab] = useState<MasterAdminTab>('HUB');
  const [masterAdminSubFilter, setMasterAdminSubFilter] = useState<string>('');
  const [autoOpenAddMedModal, setAutoOpenAddMedModal] = useState(false);
  const [autoOpenAdjustModal, setAutoOpenAdjustModal] = useState(false);
  const [autoOpenCreateReqModal, setAutoOpenCreateReqModal] = useState(false);
  const [autoOpenAddSupplierModal, setAutoOpenAddSupplierModal] = useState(false);
  const [autoOpenNewPOModal, setAutoOpenNewPOModal] = useState(false);
  const [autoOpenCreateExpenseModal, setAutoOpenCreateExpenseModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_AVAILABLE_USERS[5]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOwnerRegisterModalOpen, setIsOwnerRegisterModalOpen] = useState(false);
  const [isSupplierRegisterModalOpen, setIsSupplierRegisterModalOpen] = useState(false);
  const [isPharmacistAuthModalOpen, setIsPharmacistAuthModalOpen] = useState(false);
  const [landingMode, setLandingMode] = useState<'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER'>('NATIONAL');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState(false);
  const [isPhoneQrModalOpen, setIsPhoneQrModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>(DEFAULT_AVAILABLE_USERS);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [wishlistIds, setWishlistIds] = useState<string[]>(['med-1', 'med-2']);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();

    const initialUrlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const explicitRoleParam = initialUrlParams?.get('role');

    // Check if there is an active session (skip if URL explicitly requests a specific role)
    const existingToken = typeof localStorage !== 'undefined' ? localStorage.getItem('kaziniya_auth_token') : null;
    if (existingToken && !explicitRoleParam) {
      safeFetchJson<User>('/api/auth/me').then((res) => {
        if (res?.success && res?.data) {
          setCurrentUser(res.data);
        }
      }).catch(() => {});
    } else if (currentUser?.email && !explicitRoleParam) {
      // In development mode, auto-handshake initial user so dashboard requests are authenticated
      safeFetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: currentUser.email,
          password: 'Password123!',
        }),
      }).then((loginRes) => {
        if (loginRes.success && loginRes.token && typeof localStorage !== 'undefined') {
          localStorage.setItem('kaziniya_auth_token', loginRes.token);
          localStorage.setItem('kaziniya_current_user_id', currentUser.id);
        }
      }).catch(() => {});
    }

    const checkMobileUrlParams = () => {
      if (typeof window === 'undefined') return;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.toLowerCase();

        const hasMobileQuery =
          urlParams.get('flutter_pos') === 'true' ||
          urlParams.get('flutter_pos') === '1' ||
          urlParams.has('flutter_pos') ||
          urlParams.get('mode') === 'mobile_pos' ||
          urlParams.get('mode') === 'mobile' ||
          urlParams.get('mode') === 'flutter' ||
          urlParams.get('mobile') === 'true' ||
          urlParams.get('mobile') === 'pos' ||
          urlParams.get('mobile') === '1' ||
          urlParams.has('mobile') ||
          urlParams.get('mobile_pos') === 'true' ||
          urlParams.get('mobile_pos') === '1' ||
          urlParams.has('mobile_pos') ||
          urlParams.get('app') === 'mobile' ||
          urlParams.get('app') === 'flutter' ||
          urlParams.get('view') === 'mobile' ||
          urlParams.get('view') === 'mobile_pos' ||
          hash.includes('mobile_pos') ||
          hash.includes('flutter') ||
          hash.includes('mobile');

        const screenParam = urlParams.get('screen');
        const modeParam = urlParams.get('mode');

        if (screenParam) {
          if (['gateway', 'public_home', 'public_products', 'public_orders', 'public_favorites', 'public_contact', 'public_registration', 'dashboard'].includes(screenParam)) {
            setCurrentScreen(screenParam as any);
          }
        } else if (modeParam === 'public' || hash.includes('public')) {
          setCurrentScreen('public_home');
        } else if (modeParam === 'gateway' || hash.includes('gateway')) {
          setCurrentScreen('gateway');
        }

        const viewParam = urlParams.get('view');
        const roleParam = urlParams.get('role');
        const subParam = urlParams.get('sub');

        if (viewParam || roleParam) {
          const resolveUserFromList = (uList: User[]) => {
            let targetUser = uList.find((u) => u.role === 'STORE_OWNER');
            if (roleParam === 'superadmin' || viewParam === 'master_admin') {
              targetUser = uList.find((u) => u.isSuperAdmin || u.email === 'athronos21@gmail.com' || u.email === 'beka.girma@gmail.com') || targetUser;
            } else if (roleParam === 'pharmacist' || viewParam === 'pos') {
              targetUser = uList.find((u) => u.role === 'PHARMACIST') || targetUser;
            } else if (roleParam === 'supplier' || viewParam === 'purchases') {
              targetUser = uList.find((u) => u.role === 'SUPPLIER') || targetUser;
            }
            if (targetUser) {
              setCurrentUser(targetUser);
              setCurrentScreen('dashboard');
              if (targetUser.email) {
                safeFetchJson('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    identifier: targetUser.email,
                    password: 'Password123!',
                  }),
                }).then((loginRes) => {
                  if (loginRes.success && loginRes.token && typeof localStorage !== 'undefined') {
                    localStorage.setItem('kaziniya_auth_token', loginRes.token);
                    localStorage.setItem('kaziniya_current_user_id', targetUser.id);
                  }
                }).catch(() => {});
              }
              if (viewParam) {
                setDashboardView(viewParam);
              }
              if (subParam && viewParam === 'reports') {
                setReportsSubTab(subParam as any);
              }
              if (subParam && viewParam === 'inventory') {
                setInventorySubTab(subParam as any);
              }
              if (subParam && viewParam === 'purchases') {
                setPurchasesSubTab(subParam as any);
              }
            }
          };

          safeFetchJson<User[]>('/api/users')
            .then((data) => {
              if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
                resolveUserFromList(data.data);
              } else {
                resolveUserFromList(DEFAULT_AVAILABLE_USERS);
              }
            })
            .catch(() => {
              resolveUserFromList(DEFAULT_AVAILABLE_USERS);
            });
        }

        if (hasMobileQuery) {
          setIsFlutterModalOpen(true);
        }
      } catch (err) {
        console.error('Error parsing mobile URL parameters:', err);
      }
    };

    checkMobileUrlParams();
    window.addEventListener('popstate', checkMobileUrlParams);
    window.addEventListener('hashchange', checkMobileUrlParams);

    return () => {
      window.removeEventListener('popstate', checkMobileUrlParams);
      window.removeEventListener('hashchange', checkMobileUrlParams);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        return;
      }
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
        setAvailableUsers(data.data);
      }
    } catch {
      // Retain pre-seeded DEFAULT_AVAILABLE_USERS on network/static failure
    }
  };

  const isSuperAdmin = !!(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email?.toLowerCase() === 'athronos21@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'beka.girma@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'beka@kaziniya.et'
  );

  const handleSelectRole = (role: UserRole, userEmail?: string) => {
    let matchedUser = userEmail
      ? availableUsers.find((u) => u.email?.toLowerCase() === userEmail.toLowerCase())
      : undefined;
    if (!matchedUser) {
      matchedUser = availableUsers.find((u) => u.role === role);
    }

    if (matchedUser) {
      const activeUser = {
        ...matchedUser,
        role,
        isSuperAdmin: role === 'SUPER_ADMIN',
        isOwner: role === 'STORE_OWNER',
      };
      setCurrentUser(activeUser);
      if (activeUser.email) {
        safeFetchJson('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: activeUser.email,
            password: 'Password123!',
          }),
        }).then((loginRes) => {
          if (loginRes.success && loginRes.token && typeof localStorage !== 'undefined') {
            localStorage.setItem('kaziniya_auth_token', loginRes.token);
            localStorage.setItem('kaziniya_current_user_id', activeUser.id);
          }
        }).catch(() => {});
      }
      if (role === 'SUPER_ADMIN') {
        setDashboardView('master_admin');
        setMasterAdminSubTab('HUB');
      } else if (role === 'SUPPLIER') {
        setDashboardView('purchases');
        setPurchasesSubTab('purchase_orders');
      } else {
        setDashboardView('dashboard');
      }
      setCurrentScreen('dashboard');
    } else if (currentUser) {
      const updatedUser = {
        ...currentUser,
        role,
        isSuperAdmin: role === 'SUPER_ADMIN',
        isOwner: role === 'STORE_OWNER',
      };
      setCurrentUser(updatedUser);
      if (role === 'SUPER_ADMIN') {
        setDashboardView('master_admin');
        setMasterAdminSubTab('HUB');
      } else if (role === 'SUPPLIER') {
        setDashboardView('purchases');
        setPurchasesSubTab('purchase_orders');
      } else {
        setDashboardView('dashboard');
      }
      setCurrentScreen('dashboard');
    }
  };

  const handleLoginClick = () => {
    setLoginInitialMode('STORE_STAFF');
    if (currentUser) {
      setCurrentScreen('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleMasterAdminLoginClick = () => {
    setLoginInitialMode('MASTER_ADMIN');
    if (currentUser && (currentUser.isSuperAdmin || currentUser.email === 'athronos21@gmail.com' || currentUser.email === 'beka.girma@gmail.com')) {
      setDashboardView('master_admin');
      setCurrentScreen('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleToggleWishlist = (medicineId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(medicineId)) {
        showToast('Item removed from your Wishlist.', 'info', 'Wishlist Updated');
        return prev.filter((id) => id !== medicineId);
      } else {
        showToast('Item saved to your Wishlist!', 'success', 'Wishlist Updated');
        return [...prev, medicineId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      {/* RENDER MANAGEMENT DASHBOARD SIDE (For Staff Users Only) */}
      {currentScreen === 'dashboard' && currentUser ? (
        <DashboardLayout
          currentUser={currentUser}
          onSelectRole={handleSelectRole}
          activeView={dashboardView}
          setActiveView={setDashboardView}
          onNavigateSubItem={(view, itemId) => {
            // Reset modal auto-open triggers by default
            setAutoOpenAddMedModal(false);
            setAutoOpenAdjustModal(false);
            setAutoOpenCreateReqModal(false);
            setAutoOpenAddSupplierModal(false);
            setAutoOpenNewPOModal(false);
            setAutoOpenCreateExpenseModal(false);

            if (itemId.startsWith('master_') || itemId === 'master_admin' || itemId === 'fleet_management' || itemId === 'efda_compliance' || itemId === 'national_catalog' || itemId === 'system_broadcast') {
              setDashboardView('master_admin');
              if (itemId === 'master_hub' || itemId === 'master_admin') {
                setMasterAdminSubTab('HUB');
                setMasterAdminSubFilter('');
              } else if (itemId === 'master_nodes' || itemId === 'master_nodes_list' || itemId === 'fleet_management') {
                setMasterAdminSubTab('NODES');
                setMasterAdminSubFilter('ALL');
              } else if (itemId === 'master_nodes_pending') {
                setMasterAdminSubTab('NODES');
                setMasterAdminSubFilter('PENDING');
              } else if (itemId === 'master_nodes_onboard') {
                setMasterAdminSubTab('NODES');
                setIsOwnerRegisterModalOpen(true);
              } else if (itemId === 'master_compliance' || itemId === 'master_efda_licenses' || itemId === 'efda_compliance') {
                setMasterAdminSubTab('COMPLIANCE');
                setMasterAdminSubFilter('');
              } else if (itemId === 'master_recalls') {
                setMasterAdminSubTab('COMPLIANCE');
                setMasterAdminSubFilter('RECALL');
              } else if (itemId === 'master_catalog' || itemId === 'master_catalog_all' || itemId === 'national_catalog') {
                setMasterAdminSubTab('GLOBAL_CATALOG');
                setMasterAdminSubFilter('');
              } else if (itemId === 'master_shortages') {
                setMasterAdminSubTab('GLOBAL_CATALOG');
                setMasterAdminSubFilter('SHORTAGE');
              } else if (itemId === 'master_price_ceilings') {
                setMasterAdminSubTab('GLOBAL_CATALOG');
                setMasterAdminSubFilter('PRICE_CEILINGS');
              } else if (itemId === 'master_analytics' || itemId === 'pharmacy_analytics') {
                setMasterAdminSubTab('ANALYTICS');
                setMasterAdminSubFilter('ALL');
              } else if (itemId === 'master_financials' || itemId === 'master_gmv') {
                setMasterAdminSubTab('FINANCIALS');
                setMasterAdminSubFilter('GMV');
              } else if (itemId === 'master_settlements') {
                setMasterAdminSubTab('FINANCIALS');
                setMasterAdminSubFilter('SETTLEMENTS');
              } else if (itemId === 'master_staff' || itemId === 'master_staff_all') {
                setMasterAdminSubTab('STAFF');
                setMasterAdminSubFilter('DIRECTORY');
              } else if (itemId === 'master_staff_rbac') {
                setMasterAdminSubTab('STAFF');
                setMasterAdminSubFilter('RBAC');
              } else if (itemId === 'master_health' || itemId === 'master_broadcast' || itemId === 'system_broadcast') {
                setMasterAdminSubTab('SYSTEM_HEALTH');
                setMasterAdminSubFilter('BROADCAST');
              } else if (itemId === 'master_telemetry') {
                setMasterAdminSubTab('SYSTEM_HEALTH');
                setMasterAdminSubFilter('TELEMETRY');
              }
            } else if (itemId === 'inspect_flagship') {
              setDashboardView('inventory');
              setInventorySubTab('medicines');
            } else if (itemId === 'registration_hub') {
              setDashboardView('registration_hub');
            } else if (itemId === 'portal_cms') {
              setDashboardView('portal_cms');
            } else if (itemId === 'inventory' || itemId === 'medicines') {
              setDashboardView('inventory_system');
              setInventorySubTab('medicines');
            } else if (itemId === 'inventory_add' || itemId === 'add_product' || itemId === 'add_medicine') {
              setDashboardView('add_medicine');
            } else if (itemId === 'inventory_expired') {
              setDashboardView('inventory_system');
              setInventorySubTab('expiring');
            } else if (itemId === 'inventory_archived') {
              setDashboardView('inventory_system');
              setInventorySubTab('archived');
            } else if (itemId === 'stock_movements') {
              setDashboardView('inventory_system');
              setInventorySubTab('movements');
            } else if (itemId === 'stock_adjustments') {
              setDashboardView('inventory_system');
              setInventorySubTab('batches');
              setAutoOpenAdjustModal(true);
            } else if (itemId === 'stock_requests') {
              setDashboardView('inventory_system');
              setInventorySubTab('requests');
            } else if (itemId === 'create_stock_req') {
              setDashboardView('inventory_system');
              setInventorySubTab('requests');
              setAutoOpenCreateReqModal(true);
            } else if (itemId === 'batch_mgmt') {
              setDashboardView('inventory_system');
              setInventorySubTab('batches');
            } else if (itemId === 'expiry_tracking') {
              setDashboardView('inventory_system');
              setInventorySubTab('expiring');
            } else if (itemId === 'stock_report' || itemId === 'movement_report') {
              setDashboardView('reports');
              setReportsSubTab('analytics');
            } else if (itemId === 'all_sales' || itemId === 'sales_mgmt') {
              setSalesSubTab('all_sales');
            } else if (itemId === 'online_orders') {
              setSalesSubTab('online_orders');
            } else if (itemId === 'sales_returns') {
              setSalesSubTab('sales_returns');
            } else if (itemId === 'suppliers') {
              setPurchasesSubTab('suppliers');
            } else if (itemId === 'purchase_orders') {
              setPurchasesSubTab('purchase_orders');
            } else if (itemId === 'goods_receipts') {
              setPurchasesSubTab('goods_receipts');
            } else if (itemId === 'purchase_invoices') {
              setPurchasesSubTab('purchase_invoices');
            } else if (itemId === 'supplier_payments') {
              setPurchasesSubTab('supplier_payments');
            } else if (itemId === 'purchase_returns') {
              setPurchasesSubTab('purchase_returns');
            } else if (itemId === 'ap_dashboard' || itemId === 'procurement') {
              setPurchasesSubTab('ap_dashboard');
            } else if (itemId === 'ml_forecast') {
              setDashboardView('reports');
              setReportsSubTab('ml_forecast');
            } else if (
              itemId === 'analytics_dashboard' ||
              itemId === 'sales_analysis' ||
              itemId === 'inventory_health' ||
              itemId === 'financial_trends' ||
              itemId === 'my_exports'
            ) {
              setDashboardView('reports');
              setReportsSubTab('analytics');
            } else if (itemId === 'acc_dashboard' || itemId === 'store_dashboard' || itemId === 'accounting') {
              setReportsSubTab('analytics');
            } else if (itemId === 'chart_of_accounts') {
              setReportsSubTab('chart_of_accounts');
            } else if (itemId === 'journal_entries' || itemId === 'all_journal_entries') {
              setReportsSubTab('journal_entries');
            } else if (itemId === 'trial_balance') {
              setReportsSubTab('trial_balance');
            } else if (itemId === 'profit_loss') {
              setReportsSubTab('profit_loss');
            } else if (itemId === 'balance_sheet') {
              setReportsSubTab('balance_sheet');
            } else if (itemId === 'all_expenses' || itemId === 'expense_categories' || itemId === 'expense_reports') {
              setReportsSubTab('expenses');
            } else if (itemId === 'create_expense') {
              setReportsSubTab('expenses');
              setAutoOpenCreateExpenseModal(true);
            } else if (itemId === 'branch_reports') {
              setReportsSubTab('branch_reports');
            } else if (itemId === 'hr_dashboard' || itemId === 'human_resources') {
              setHrSubTab('dashboard');
            } else if (itemId === 'employees' || itemId === 'offboarding') {
              setHrSubTab('employees');
            } else if (itemId === 'attendance') {
              setHrSubTab('attendance');
            } else if (itemId === 'schedules') {
              setHrSubTab('schedules');
            } else if (itemId === 'leave_requests' || itemId === 'leave_types') {
              setHrSubTab('leave_requests');
            } else if (itemId === 'payroll') {
              setHrSubTab('payroll');
            } else if (itemId === 'loans') {
              setHrSubTab('loans');
            } else if (itemId === 'departments') {
              setHrSubTab('departments');
            } else if (itemId === 'job_titles') {
              setHrSubTab('job_titles');
            } else if (itemId === 'performance') {
              setHrSubTab('audit_logs');
            } else if (itemId === 'branch_settings' || itemId === 'branch_scheduling') {
              setSettingsSubTab('branch_config');
            } else if (itemId === 'payment_methods' || itemId === 'payment_gateways' || itemId === 'all_methods') {
              setSettingsSubTab('payment_methods');
            } else if (itemId === 'all_notifications') {
              setSettingsSubTab('all_notifications');
            } else if (itemId === 'notif_settings') {
              setSettingsSubTab('notif_settings');
            } else if (
              itemId === 'mobile_pos' ||
              itemId === 'flutter_pos' ||
              itemId === 'flutter_app' ||
              itemId === 'mobile_app'
            ) {
              setIsPhoneQrModalOpen(true);
            } else if (
              itemId === 'store_settings' ||
              itemId === 'eims_config' ||
              itemId === 'system_config' ||
              itemId === 'system_settings' ||
              itemId === 'sys_config'
            ) {
              setSettingsSubTab('store_config');
            }
          }}
          onOpenMobileApp={() => setIsPhoneQrModalOpen(true)}
          onOpenShiftHandover={() => setIsShiftHandoverOpen(true)}
          onLogout={() => {
            setCurrentUser(null);
            setCurrentScreen('gateway');
          }}
          onBackToPublicPortal={() => setCurrentScreen('public_home')}
          onOpenDocumentation={() => setIsInternshipModalOpen(true)}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onSwitchWorkstation={(ws, subTab) => {
            if (ws === 'IMS') {
              setDashboardView('inventory_system');
              if (subTab) setInventorySubTab(subTab as any);
            } else if (ws === 'POS') {
              setDashboardView('pos');
            } else if (ws === 'MASTER_ADMIN') {
              setDashboardView('master_admin');
            } else {
              setDashboardView('dashboard');
            }
          }}
        >
          {/* MASTER ADMIN FLEET VIEW */}
          {(dashboardView === 'master_admin' || (isSuperAdmin && dashboardView === 'dashboard')) && (
            <MasterAdminView
              currentUser={currentUser!}
              initialSubTab={masterAdminSubTab}
              initialSubFilter={masterAdminSubFilter}
              onSwitchToStoreWorkstation={(storeId, targetView) => setDashboardView(targetView || 'inventory_system')}
              onOpenOwnerRegistration={() => setIsOwnerRegisterModalOpen(true)}
            />
          )}

          {dashboardView === 'dashboard' && !isSuperAdmin && (
            <OverviewView currentUser={currentUser} onNavigate={(v) => setDashboardView(v)} />
          )}
          {(dashboardView === 'inventory' || dashboardView === 'inventory_system') && (
            <InventorySystemWorkstation
              currentUser={currentUser!}
              initialSubTab={inventorySubTab}
              onExitToDashboard={() => setDashboardView('dashboard')}
              onSwitchWorkstation={(ws, subTab) => {
                if (ws === 'IMS') {
                  setDashboardView('inventory_system');
                  if (subTab) setInventorySubTab(subTab as any);
                } else if (ws === 'POS') {
                  setDashboardView('pos');
                } else if (ws === 'MASTER_ADMIN') {
                  setDashboardView('master_admin');
                } else {
                  setDashboardView('dashboard');
                }
              }}
              onNavigateToAddMedicine={() => setDashboardView('add_medicine')}
            />
          )}
          {dashboardView === 'add_medicine' && (
            <AddMedicineView
              onBack={() => {
                setDashboardView('inventory_system');
                setInventorySubTab('medicines');
              }}
              onSuccess={() => {
                setDashboardView('inventory_system');
                setInventorySubTab('medicines');
              }}
            />
          )}
          {dashboardView === 'pos' && <PosView onOpenShiftHandover={() => setIsShiftHandoverOpen(true)} />}
          {dashboardView === 'sales' && <SalesView initialSubTab={salesSubTab} />}
          {dashboardView === 'purchases' && (
            <PurchasesView
              currentUser={currentUser}
              initialSubTab={purchasesSubTab}
              autoOpenAddSupplierModal={autoOpenAddSupplierModal}
              autoOpenNewPOModal={autoOpenNewPOModal}
            />
          )}
          {dashboardView === 'reports' && (
            <ReportsView
              currentUser={currentUser}
              initialSubTab={reportsSubTab}
              autoOpenCreateExpenseModal={autoOpenCreateExpenseModal}
              onNavigateToPurchase={() => {
                setDashboardView('purchases');
                setPurchasesSubTab('purchase_orders');
                setAutoOpenNewPOModal(true);
              }}
            />
          )}
          {dashboardView === 'users' && <UsersAndAuditView currentUser={currentUser} initialSubTab={hrSubTab} />}
          {dashboardView === 'portal_cms' && <PortalCmsView />}
          {dashboardView === 'registration_hub' && (
            <RegistrationNetworkDashboard
              onOpenOwnerRegister={() => setIsOwnerRegisterModalOpen(true)}
              onOpenMasterAdminLogin={handleMasterAdminLoginClick}
              onOpenStaffLogin={handleLoginClick}
              currentUser={currentUser}
              onExploreMedicines={() => {
                setCurrentScreen('public_products');
              }}
            />
          )}
          {dashboardView === 'settings' && <SettingsView initialSubTab={settingsSubTab} currentUser={currentUser} />}
        </DashboardLayout>
      ) : currentScreen === 'gateway' ? (
        /* STAFF WORKSTATION GATEWAY */
        <DDSGatewayPage
          availableUsers={availableUsers}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.email === 'athronos21@gmail.com' || user.email === 'beka.girma@gmail.com') {
              setDashboardView('master_admin');
            } else if (user.role === 'SUPPLIER') {
              setDashboardView('purchases');
              setPurchasesSubTab('purchase_orders');
            } else if (user.role === 'PHARMACIST') {
              setDashboardView('pos');
            } else if (user.role === 'STORE_OWNER' || user.isOwner) {
              setDashboardView('dashboard');
            } else {
              setDashboardView('dashboard');
            }
            setCurrentScreen('dashboard');
          }}
          onOpenOwnerRegistration={() => setIsOwnerRegisterModalOpen(true)}
          onOpenMobileApp={() => setIsPhoneQrModalOpen(true)}
          onOpenPublicPortal={() => setCurrentScreen('public_home')}
          onOpenDocumentation={() => setIsInternshipModalOpen(true)}
        />
      ) : currentScreen === 'public_home' ? (
        <PublicHome
          onExploreProducts={() => setCurrentScreen('public_products')}
          onOpenLogin={() => setCurrentScreen('gateway')}
          onOpenDashboard={() => {
            if (currentUser) {
              if (currentUser.role === 'SUPER_ADMIN' || currentUser.isSuperAdmin || currentUser.email === 'athronos21@gmail.com' || currentUser.email === 'beka.girma@gmail.com') {
                setDashboardView('master_admin');
              } else if (currentUser.role === 'SUPPLIER') {
                setDashboardView('purchases');
                setPurchasesSubTab('purchase_orders');
              } else if (currentUser.role === 'PHARMACIST') {
                setDashboardView('pos');
              } else {
                setDashboardView('dashboard');
              }
              setCurrentScreen('dashboard');
            } else {
              setCurrentScreen('gateway');
            }
          }}
          onOpenOwnerRegister={() => setIsOwnerRegisterModalOpen(true)}
          onOpenMobileApp={() => setIsPhoneQrModalOpen(true)}
          onNavigateToContact={() => setCurrentScreen('public_contact')}
          onNavigateToRegistration={() => setCurrentScreen('public_registration')}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.email === 'athronos21@gmail.com' || user.email === 'beka.girma@gmail.com') {
              setDashboardView('master_admin');
            } else if (user.role === 'SUPPLIER') {
              setDashboardView('purchases');
              setPurchasesSubTab('purchase_orders');
            } else if (user.role === 'PHARMACIST') {
              setDashboardView('pos');
            } else if (user.role === 'STORE_OWNER' || user.isOwner) {
              setDashboardView('dashboard');
            } else {
              setDashboardView('dashboard');
            }
            setCurrentScreen('dashboard');
          }}
          currentUser={currentUser}
          availableUsers={availableUsers}
          onOpenDocumentation={() => setIsInternshipModalOpen(true)}
          landingMode={landingMode}
          onSwitchLandingMode={setLandingMode}
        />
      ) : (
        /* PUBLIC PATIENT & CUSTOMER STOREFRONT PORTAL */
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => {
              if (screen === 'gateway') {
                setCurrentScreen('gateway');
              } else {
                setCurrentScreen(screen as any);
              }
            }}
            onLoginClick={() => setCurrentScreen('gateway')}
            onOpenMasterAdminLogin={handleMasterAdminLoginClick}
            onOpenOwnerRegister={() => setIsOwnerRegisterModalOpen(true)}
            onOpenSupplierRegister={() => setIsSupplierRegisterModalOpen(true)}
            onOpenPharmacistAuth={() => setIsPharmacistAuthModalOpen(true)}
            onOpenMobileApp={() => setIsPhoneQrModalOpen(true)}
            currentUser={currentUser}
            onSignOut={() => {
              setCurrentUser(null);
              setCurrentScreen('gateway');
              showToast('You have been signed out.', 'info', 'Signed Out');
            }}
            onOpenDashboard={() => {
              if (currentUser) {
                if (currentUser.role === 'SUPER_ADMIN' || currentUser.isSuperAdmin || currentUser.email === 'athronos21@gmail.com' || currentUser.email === 'beka.girma@gmail.com') {
                  setDashboardView('master_admin');
                } else if (currentUser.role === 'SUPPLIER') {
                  setDashboardView('purchases');
                  setPurchasesSubTab('purchase_orders');
                } else if (currentUser.role === 'PHARMACIST') {
                  setDashboardView('pos');
                } else {
                  setDashboardView('dashboard');
                }
                setCurrentScreen('dashboard');
              } else {
                setCurrentScreen('gateway');
              }
            }}
            wishlistCount={wishlistIds.length}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenDocumentation={() => setIsInternshipModalOpen(true)}
            onQuickRoleLogin={(role, userEmail) => handleSelectRole(role, userEmail)}
            landingMode={landingMode}
            onSwitchLandingMode={(mode) => {
              setLandingMode(mode);
              try {
                localStorage.setItem('dds_active_landing_mode', mode);
              } catch {}
              setCurrentScreen('public_home');
            }}
          />

          <main className="flex-1">
            <AnimatePresence mode="wait">

              {currentScreen === 'public_products' && (
                <motion.div
                  key="public_products"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <PublicProducts
                    onOpenDashboard={() => setCurrentScreen('gateway')}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                  />
                </motion.div>
              )}

              {currentScreen === 'public_orders' && (
                <motion.div
                  key="public_orders"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <PublicOrders
                    currentUser={currentUser}
                    onExploreProducts={() => setCurrentScreen('public_products')}
                  />
                </motion.div>
              )}

              {currentScreen === 'public_favorites' && (
                <motion.div
                  key="public_favorites"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <PublicFavorites
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                    onExploreProducts={() => setCurrentScreen('public_products')}
                  />
                </motion.div>
              )}

              {currentScreen === 'public_contact' && (
                <motion.div
                  key="public_contact"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <PublicContact
                    onExploreProducts={() => setCurrentScreen('public_products')}
                  />
                </motion.div>
              )}

              {currentScreen === 'public_registration' && (
                <motion.div
                  key="public_registration"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <RegistrationNetworkDashboard
                    onOpenOwnerRegister={() => setIsOwnerRegisterModalOpen(true)}
                    onOpenMasterAdminLogin={handleMasterAdminLoginClick}
                    onOpenStaffLogin={() => setCurrentScreen('gateway')}
                    currentUser={currentUser}
                    onExploreMedicines={() => setCurrentScreen('public_products')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <Footer
            onOpenDashboard={() => setCurrentScreen('gateway')}
            onNavigateToContact={() => setCurrentScreen('public_contact')}
            onNavigateToRegistration={() => setCurrentScreen('public_registration')}
            onOpenDocumentation={() => setIsInternshipModalOpen(true)}
          />
        </div>
      )}

      {/* SCROLL TO TOP FLOATING BUTTON */}
      <ScrollToTop />

      {/* ACADEMIC INTERNSHIP REPORT MODAL */}
      <InternshipReportModal
        isOpen={isInternshipModalOpen}
        onClose={() => setIsInternshipModalOpen(false)}
      />

      {/* PHONE CONNECT & QR CODE MODAL (Fixes 403 error for phone cameras) */}
      <PhoneConnectQrModal
        isOpen={isPhoneQrModalOpen}
        onClose={() => setIsPhoneQrModalOpen(false)}
        onOpenSimulator={() => setIsFlutterModalOpen(true)}
      />

      {/* FLUTTER MOBILE APP SIMULATOR MODAL */}
      <FlutterAppSimulator
        isOpen={isFlutterModalOpen}
        onClose={() => setIsFlutterModalOpen(false)}
      />

      {/* CUSTOMER PROFILE MODAL */}
      <PublicProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onNavigateToOrders={() => setCurrentScreen('public_orders')}
        onNavigateToFavorites={() => setCurrentScreen('public_favorites')}
      />

      {/* CUSTOMER & STAFF AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialMode={loginInitialMode}
        availableUsers={availableUsers}
        onOpenOwnerRegistration={() => setIsOwnerRegisterModalOpen(true)}
        onLoginSuccess={(user, isStaff) => {
          setCurrentUser(user);
          if (user.isSuperAdmin || user.email === 'athronos21@gmail.com' || user.email === 'beka.girma@gmail.com') {
            setDashboardView('master_admin');
            setCurrentScreen('dashboard');
            showToast(`Master Admin Session active for ${user.name}. Whole system governance unlocked.`, 'success', 'Whole System Authority');
          } else if (user.role === 'SUPPLIER') {
            setDashboardView('purchases');
            setPurchasesSubTab('purchase_orders');
            setCurrentScreen('dashboard');
            showToast(`Wholesale Supplier Session active for ${user.name}. Wholesale procurement hub ready.`, 'success', 'Wholesale Hub Active');
          } else if (user.role === 'PHARMACIST') {
            setDashboardView('pos');
            setCurrentScreen('dashboard');
            showToast(`Pharmacist Session active for ${user.name}. Clinical POS ready.`, 'success', 'Pharmacist Station Active');
          } else if (isStaff) {
            setDashboardView('dashboard');
            setCurrentScreen('dashboard');
            showToast(`Welcome back, ${user.name} (${user.role}). Workstation ready.`, 'success', 'Staff Authenticated');
          } else {
            setCurrentScreen('public_home');
          }
        }}
      />

      {/* PHARMACY & DRUG STORE OWNER REGISTRATION MODAL */}
      <OwnerRegistrationModal
        isOpen={isOwnerRegisterModalOpen}
        onClose={() => setIsOwnerRegisterModalOpen(false)}
        onSuccess={(ownerUser, pharmacyProfile) => {
          setCurrentUser(ownerUser);
          try {
            localStorage.setItem('dds_registered_store', JSON.stringify(pharmacyProfile));
            localStorage.setItem('dds_active_landing_mode', 'REGISTERED_STORE');
          } catch {}
          setDashboardView('dashboard');
          setCurrentScreen('public_home');
          fetchUsers();
          showToast(
            `Pharmacy "${pharmacyProfile.storeName}" successfully registered! You can now authorize your pharmacist staff right here on your store landing page.`,
            'success',
            'Registration Completed'
          );
        }}
        onOpenPosTerminal={() => {
          setCurrentScreen('dashboard');
          setDashboardView('pos');
          fetchUsers();
        }}
        onViewStorefront={() => {
          setCurrentScreen('public_home');
          fetchUsers();
        }}
      />

      {/* PHARMACEUTICAL WHOLESALER / SUPPLIER REGISTRATION MODAL */}
      <SupplierRegistrationModal
        isOpen={isSupplierRegisterModalOpen}
        onClose={() => setIsSupplierRegisterModalOpen(false)}
        onSuccess={(supplier, user) => {
          try {
            localStorage.setItem('dds_registered_supplier', JSON.stringify(supplier));
            localStorage.setItem('dds_active_landing_mode', 'REGISTERED_SUPPLIER');
            window.dispatchEvent(new CustomEvent('dds_state_updated'));
          } catch {}
          setLandingMode('REGISTERED_SUPPLIER');
          setCurrentScreen('public_home');
          fetchUsers();
          showToast(
            `Wholesale Supplier "${supplier.name}" successfully registered! Procurement portal activated.`,
            'success',
            'Supplier Registered'
          );
        }}
      />

      {/* STORE OWNER PHARMACIST AUTHORIZATION MODAL */}
      <PharmacistAuthorizationModal
        isOpen={isPharmacistAuthModalOpen}
        onClose={() => setIsPharmacistAuthModalOpen(false)}
        pharmacyProfile={(() => {
          try {
            const stored = localStorage.getItem('dds_registered_store');
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        })()}
        onSuccess={(pharmacistUser) => {
          try {
            const stored = localStorage.getItem('dds_authorized_pharmacists');
            const list = stored ? JSON.parse(stored) : [];
            list.push(pharmacistUser);
            localStorage.setItem('dds_authorized_pharmacists', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('dds_state_updated'));
          } catch {}
          fetchUsers();
          showToast(
            `Pharmacist ${pharmacistUser.name} authorized! License: ${pharmacistUser.licenseNumber || 'Active'}. Added to dispensary roster.`,
            'success',
            'Staff Authorized'
          );
        }}
        onInstantLogin={(pharmacistUser) => {
          setCurrentUser(pharmacistUser);
          setDashboardView('pos');
          setCurrentScreen('dashboard');
          showToast(`Direct login active as Pharmacist ${pharmacistUser.name}. POS Terminal loaded.`, 'success', 'Staff Session');
        }}
      />

      {/* SHIFT HANDOVER & CASHIER RECONCILIATION MODAL */}
      <ShiftHandoverModal
        isOpen={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSwitchUser={(newUser) => {
          setCurrentUser(newUser);
          showToast(`Shift successfully handed over to ${newUser.name}. Active session switched.`, 'success', 'Shift Handover');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <PortalContentProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </PortalContentProvider>
  );
}
