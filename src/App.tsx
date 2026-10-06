import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from './utils/motionVariants';
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
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { OverviewView } from './components/dashboard/OverviewView';
import { InventoryView } from './components/dashboard/InventoryView';
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

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<'public_home' | 'public_products' | 'public_orders' | 'public_favorites' | 'public_contact' | 'public_registration' | 'dashboard'>('public_home');
  const [dashboardView, setDashboardView] = useState<string>('dashboard');
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOwnerRegisterModalOpen, setIsOwnerRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFlutterModalOpen, setIsFlutterModalOpen] = useState(false);
  const [isPhoneQrModalOpen, setIsPhoneQrModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [wishlistIds, setWishlistIds] = useState<string[]>(['med-1', 'med-2']);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();

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

        const viewParam = urlParams.get('view');
        const roleParam = urlParams.get('role');
        const subParam = urlParams.get('sub');

        if (viewParam || roleParam) {
          fetch('/api/users')
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.data) {
                const uList: User[] = data.data;
                let targetUser = uList.find((u) => u.role === 'STORE_OWNER');
                if (roleParam === 'superadmin' || viewParam === 'master_admin') {
                  targetUser = uList.find((u) => u.isSuperAdmin || u.email === 'athronos21@gmail.com') || targetUser;
                } else if (roleParam === 'pharmacist' || viewParam === 'pos') {
                  targetUser = uList.find((u) => u.role === 'PHARMACIST') || targetUser;
                }
                if (targetUser) {
                  setCurrentUser(targetUser);
                  setCurrentScreen('dashboard');
                  if (viewParam) {
                    setDashboardView(viewParam);
                  }
                  if (subParam && viewParam === 'reports') {
                    setReportsSubTab(subParam as any);
                  }
                  if (subParam && viewParam === 'inventory') {
                    setInventorySubTab(subParam as any);
                  }
                }
              }
            })
            .catch((err) => console.error('Error deep linking user:', err));
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
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAvailableUsers(data.data);
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const isSuperAdmin = !!(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.email?.toLowerCase() === 'athronos21@gmail.com'
  );

  const handleSelectRole = (role: UserRole) => {
    const matchedUser = availableUsers.find((u) => u.role === role);
    if (matchedUser) {
      setCurrentUser({
        ...matchedUser,
        role,
        isSuperAdmin: role === 'SUPER_ADMIN' || matchedUser.isSuperAdmin,
      });
      if (role === 'SUPER_ADMIN') {
        setDashboardView('master_admin');
        setMasterAdminSubTab('HUB');
      } else if (role === 'PHARMACIST') {
        setDashboardView('pos');
      } else {
        setDashboardView('dashboard');
      }
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
      } else if (role === 'PHARMACIST') {
        setDashboardView('pos');
      } else {
        setDashboardView('dashboard');
      }
    }
  };

  const handleLoginClick = () => {
    setLoginInitialMode('STORE_STAFF');
    if (currentUser && currentUser.role !== 'CUSTOMER') {
      setCurrentScreen('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleMasterAdminLoginClick = () => {
    setLoginInitialMode('MASTER_ADMIN');
    if (currentUser && (currentUser.isSuperAdmin || currentUser.email === 'athronos21@gmail.com')) {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* RENDER MANAGEMENT DASHBOARD SIDE (For Staff Users Only) */}
      {currentScreen === 'dashboard' && currentUser && currentUser.role !== 'CUSTOMER' ? (
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
              setDashboardView('inventory');
              setInventorySubTab('medicines');
            } else if (itemId === 'inventory_add' || itemId === 'add_product' || itemId === 'add_medicine') {
              setDashboardView('add_medicine');
            } else if (itemId === 'inventory_expired') {
              setInventorySubTab('expiring');
            } else if (itemId === 'inventory_archived') {
              setInventorySubTab('archived');
            } else if (itemId === 'stock_movements') {
              setInventorySubTab('movements');
            } else if (itemId === 'stock_adjustments') {
              setInventorySubTab('batches');
              setAutoOpenAdjustModal(true);
            } else if (itemId === 'stock_requests') {
              setInventorySubTab('requests');
            } else if (itemId === 'create_stock_req') {
              setInventorySubTab('requests');
              setAutoOpenCreateReqModal(true);
            } else if (itemId === 'batch_mgmt') {
              setInventorySubTab('batches');
            } else if (itemId === 'expiry_tracking') {
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
            setCurrentScreen('public_home');
          }}
          onBackToPublicPortal={() => setCurrentScreen('public_home')}
        >
          {/* MASTER ADMIN FLEET VIEW */}
          {(dashboardView === 'master_admin' || (isSuperAdmin && dashboardView === 'dashboard')) && (
            <MasterAdminView
              currentUser={currentUser!}
              initialSubTab={masterAdminSubTab}
              initialSubFilter={masterAdminSubFilter}
              onSwitchToStoreWorkstation={(storeId, targetView) => setDashboardView(targetView || 'inventory')}
              onOpenOwnerRegistration={() => setIsOwnerRegisterModalOpen(true)}
            />
          )}

          {dashboardView === 'dashboard' && !isSuperAdmin && (
            <OverviewView currentUser={currentUser} onNavigate={(v) => setDashboardView(v)} />
          )}
          {dashboardView === 'inventory' && (
            <InventoryView
              initialSubTab={inventorySubTab}
              autoOpenAddModal={autoOpenAddMedModal}
              autoOpenAdjustModal={autoOpenAdjustModal}
              autoOpenCreateReqModal={autoOpenCreateReqModal}
              onNavigateToAddMedicine={() => setDashboardView('add_medicine')}
            />
          )}
          {dashboardView === 'add_medicine' && (
            <AddMedicineView
              onBack={() => {
                setDashboardView('inventory');
                setInventorySubTab('medicines');
              }}
              onSuccess={() => {
                setDashboardView('inventory');
                setInventorySubTab('medicines');
              }}
            />
          )}
          {dashboardView === 'pos' && <PosView onOpenShiftHandover={() => setIsShiftHandoverOpen(true)} />}
          {dashboardView === 'sales' && <SalesView initialSubTab={salesSubTab} />}
          {dashboardView === 'purchases' && (
            <PurchasesView
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
          {dashboardView === 'settings' && <SettingsView initialSubTab={settingsSubTab} />}
        </DashboardLayout>
      ) : (
        /* RENDER DIRECT DDS PHARMACY GATEWAY (Customer Access Disabled) */
        <DDSGatewayPage
          availableUsers={availableUsers}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.email === 'athronos21@gmail.com') {
              setDashboardView('master_admin');
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
        />
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
          if (user.isSuperAdmin || user.email === 'athronos21@gmail.com') {
            setDashboardView('master_admin');
            setCurrentScreen('dashboard');
            showToast(`Master Admin Session active for ${user.name}. Whole system governance unlocked.`, 'success', 'Whole System Authority');
          } else if (isStaff) {
            if (user.role === 'PHARMACIST') {
              setDashboardView('pos');
            } else {
              setDashboardView('dashboard');
            }
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
          setDashboardView('dashboard');
          setCurrentScreen('dashboard');
          fetchUsers();
          showToast(
            `Pharmacy "${pharmacyProfile.storeName}" successfully registered! Redirected directly to your store management dashboard.`,
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
