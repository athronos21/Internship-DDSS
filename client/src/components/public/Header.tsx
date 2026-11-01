import React, { useState, useEffect, useRef } from 'react';
import {
  Pill,
  UserCheck,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Shield,
  LogIn,
  UserPlus,
  ShoppingBag,
  Store,
  FileText,
  ArrowLeft,
  Globe,
  MapPin,
  Sparkles,
  PlusCircle,
  Truck,
  Info,
  Menu,
  X,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { PrescriptionUploadModal } from './PrescriptionUploadModal';
import { StockReserveModal } from './StockReserveModal';
import { OwnerRegistrationModal } from './OwnerRegistrationModal';
import { SupplierRegistrationModal } from './SupplierRegistrationModal';
import { PharmacistAuthorizationModal } from './PharmacistAuthorizationModal';
import { Medicine, User as UserType, UserRole, PharmacyStoreProfile, Supplier } from '../../types';
import { usePortalContent } from '../../context/PortalContentContext';
import { useToast } from '../../context/ToastContext';

export interface PublicHeaderProps {
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
  onLoginClick: () => void;
  onOpenMasterAdminLogin?: () => void;
  onOpenOwnerRegister?: () => void;
  onOpenSupplierRegister?: () => void;
  onOpenPharmacistAuth?: () => void;
  onOpenMobileApp?: () => void;
  currentUser?: UserType | null;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  onOpenDashboard?: () => void;
  wishlistCount?: number;
  onOpenProfile?: () => void;
  onOpenDocumentation?: () => void;
  onQuickRoleLogin?: (role: UserRole, userEmail?: string) => void;
  landingMode?: 'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER';
  onSwitchLandingMode?: (mode: 'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER') => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentScreen = 'public_home',
  onNavigate,
  onLoginClick,
  onOpenMasterAdminLogin,
  onOpenOwnerRegister,
  onOpenSupplierRegister,
  onOpenPharmacistAuth,
  onOpenMobileApp,
  currentUser,
  onSignOut,
  onSearch,
  onOpenDashboard,
  wishlistCount = 0,
  onOpenProfile,
  onOpenDocumentation,
  onQuickRoleLogin,
  landingMode = 'NATIONAL',
  onSwitchLandingMode,
}) => {
  const { content } = usePortalContent();
  const { showToast } = useToast();

  // Internal Modals fallback
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [reserveMedicine, setReserveMedicine] = useState<Medicine | null>(null);
  const [isInternalOwnerModalOpen, setIsInternalOwnerModalOpen] = useState(false);
  const [isInternalSupplierModalOpen, setIsInternalSupplierModalOpen] = useState(false);
  const [isInternalPharmacistModalOpen, setIsInternalPharmacistModalOpen] = useState(false);

  // Menubar Dropdown States
  const [isRegisterMenuOpen, setIsRegisterMenuOpen] = useState(false);
  const [isRoleLoginMenuOpen, setIsRoleLoginMenuOpen] = useState(false);
  const [isModeSwitcherOpen, setIsModeSwitcherOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent registration entities cache
  const [registeredStore, setRegisteredStore] = useState<PharmacyStoreProfile | null>(null);
  const [registeredSupplier, setRegisteredSupplier] = useState<Supplier | null>(null);

  // Refs for click outside
  const registerMenuRef = useRef<HTMLDivElement>(null);
  const roleLoginMenuRef = useRef<HTMLDivElement>(null);
  const modeSwitcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = !!(
    currentUser?.isSuperAdmin ||
    currentUser?.email === 'athronos21@gmail.com' ||
    currentUser?.email === 'beka.girma@gmail.com' ||
    currentUser?.email === 'beka@kaziniya.et' ||
    currentUser?.role === 'SUPER_ADMIN'
  );
  const isStoreOwner = !!(currentUser?.isOwner || currentUser?.role === 'STORE_OWNER');
  const isPharmacist = currentUser?.role === 'PHARMACIST';
  const isSupplier = currentUser?.role === 'SUPPLIER';
  const isNetworkPortal = currentScreen === 'public_registration';

  // Read stored registrations on mount & listen to state updates
  useEffect(() => {
    const syncLocalData = () => {
      try {
        const storedStore = localStorage.getItem('dds_registered_store');
        if (storedStore) setRegisteredStore(JSON.parse(storedStore));
        const storedSupplier = localStorage.getItem('dds_registered_supplier');
        if (storedSupplier) setRegisteredSupplier(JSON.parse(storedSupplier));
      } catch {}
    };
    syncLocalData();
    window.addEventListener('storage', syncLocalData);
    window.addEventListener('dds_state_updated', syncLocalData);
    return () => {
      window.removeEventListener('storage', syncLocalData);
      window.removeEventListener('dds_state_updated', syncLocalData);
    };
  }, []);

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (registerMenuRef.current && !registerMenuRef.current.contains(target)) {
        setIsRegisterMenuOpen(false);
      }
      if (roleLoginMenuRef.current && !roleLoginMenuRef.current.contains(target)) {
        setIsRoleLoginMenuOpen(false);
      }
      if (modeSwitcherRef.current && !modeSwitcherRef.current.contains(target)) {
        setIsModeSwitcherOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (screen: string) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  const handleScrollToInfo = () => {
    setIsMobileMenuOpen(false);
    if (currentScreen !== 'public_home') {
      if (onNavigate) onNavigate('public_home');
      setTimeout(() => {
        const el = document.getElementById('dds-platform-info');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById('dds-platform-info');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToLogin = () => {
    setIsMobileMenuOpen(false);
    setIsRoleLoginMenuOpen(false);
    if (currentScreen !== 'public_home') {
      if (onNavigate) onNavigate('public_home');
      setTimeout(() => {
        const el = document.getElementById('workstation-login-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById('workstation-login-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleModeChange = (newMode: 'NATIONAL' | 'REGISTERED_STORE' | 'REGISTERED_SUPPLIER') => {
    setIsModeSwitcherOpen(false);
    setIsMobileMenuOpen(false);
    try {
      localStorage.setItem('dds_active_landing_mode', newMode);
      window.dispatchEvent(new CustomEvent('dds_state_updated'));
    } catch {}
    if (onSwitchLandingMode) {
      onSwitchLandingMode(newMode);
    }
    if (currentScreen !== 'public_home' && onNavigate) {
      onNavigate('public_home');
    }
    showToast(
      `Landing page transformed to: ${
        newMode === 'NATIONAL'
          ? 'National DDS Platform'
          : newMode === 'REGISTERED_STORE'
          ? 'Registered Community Drug Store'
          : 'Registered Wholesaler Portal'
      }`,
      'info',
      'View Mode Switched'
    );
  };

  const handleOpenOwner = () => {
    setIsRegisterMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onOpenOwnerRegister) {
      onOpenOwnerRegister();
    } else {
      setIsInternalOwnerModalOpen(true);
    }
  };

  const handleOpenSupplier = () => {
    setIsRegisterMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onOpenSupplierRegister) {
      onOpenSupplierRegister();
    } else {
      setIsInternalSupplierModalOpen(true);
    }
  };

  const handleOpenPharmacist = () => {
    setIsRegisterMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onOpenPharmacistAuth) {
      onOpenPharmacistAuth();
    } else {
      setIsInternalPharmacistModalOpen(true);
    }
  };

  const handleRoleQuickLogin = (role: UserRole, userEmail?: string) => {
    setIsRoleLoginMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (onQuickRoleLogin) {
      onQuickRoleLogin(role, userEmail);
    } else {
      handleScrollToLogin();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isNetworkPortal
          ? 'bg-slate-950/95 border-teal-900/60 text-white'
          : 'bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-800'
      }`}
    >
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* ========================================================================= */}
          {/* 1. BRAND LOGO & DYNAMIC MODE IDENTITY                                     */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={() => handleNav('public_home')}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Return to National DDS Home Portal"
            >
              <div className="w-9 h-9 bg-[#004eb8] rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-[#003d94] transition">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                  {landingMode === 'REGISTERED_STORE' && registeredStore
                    ? registeredStore.storeName
                    : content.storeName || 'Digital Drug Store (DDS)'}
                </span>
                <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 block tracking-wider uppercase">
                  {landingMode === 'REGISTERED_STORE'
                    ? 'Licensed Community Pharmacy • EFDA Node'
                    : landingMode === 'REGISTERED_SUPPLIER'
                    ? 'B2B Wholesale Procurement Portal'
                    : 'National Platform • EFDA Certified'}
                </span>
              </div>
            </div>

            {/* DYNAMIC VIEW SWITCHER DROPDOWN (Directly in Header) */}
            <div ref={modeSwitcherRef} className="relative hidden xl:block">
              <button
                type="button"
                onClick={() => setIsModeSwitcherOpen(!isModeSwitcherOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Switch Landing Page View"
              >
                <SlidersHorizontal className="h-3 w-3 text-indigo-500" />
                <span>
                  {landingMode === 'NATIONAL'
                    ? '🌐 National View'
                    : landingMode === 'REGISTERED_STORE'
                    ? '🏪 Store View'
                    : '🚚 Supplier View'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {isModeSwitcherOpen && (
                <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-1 block">
                    Select Landing Page View:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleModeChange('NATIONAL')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                      landingMode === 'NATIONAL'
                        ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 font-black'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-indigo-500" />
                      <span>National DDS Platform</span>
                    </span>
                    {landingMode === 'NATIONAL' && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('REGISTERED_STORE')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                      landingMode === 'REGISTERED_STORE'
                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-black'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Registered Drug Store</span>
                    </span>
                    {landingMode === 'REGISTERED_STORE' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('REGISTERED_SUPPLIER')}
                    className={`w-full text-left px-2.5 py-2 rounded-lg font-bold transition flex items-center justify-between ${
                      landingMode === 'REGISTERED_SUPPLIER'
                        ? 'bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-200 font-black'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-teal-500" />
                      <span>Registered Supplier Hub</span>
                    </span>
                    {landingMode === 'REGISTERED_SUPPLIER' && <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CENTRAL NAVIGATION LINKS (DESKTOP)                                     */}
          {/* ========================================================================= */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('public_home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentScreen === 'public_home'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
              }`}
            >
              Home
            </button>

            {/* INFO ABOUT DIGITAL DRUG STORE DIRECT LINK */}
            <button
              type="button"
              onClick={handleScrollToInfo}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition inline-flex items-center gap-1 cursor-pointer"
              title="Learn about DDS & PIMS Features, FEFO Triage and Architecture"
            >
              <Info className="h-3.5 w-3.5 text-indigo-500" />
              <span>About DDS</span>
            </button>

            <button
              onClick={() => handleNav('public_products')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentScreen === 'public_products'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
              }`}
            >
              Catalog
            </button>

            <button
              onClick={() => setIsPrescriptionModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Upload Rx</span>
            </button>

            <button
              onClick={() => handleNav('public_orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentScreen === 'public_orders'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
              }`}
            >
              Track Orders
            </button>

            <button
              onClick={() => handleNav('public_contact')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentScreen === 'public_contact'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80'
              }`}
            >
              Branches & Contact
            </button>

            {onOpenDocumentation && (
              <button
                type="button"
                onClick={onOpenDocumentation}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition inline-flex items-center gap-1.5 cursor-pointer"
                title="View Academic Internship Report & Official Documentation (.docx / .pdf)"
              >
                <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Docs</span>
              </button>
            )}
          </nav>

          {/* ========================================================================= */}
          {/* 3. RIGHT ACTIONS: REGISTRATION MENUBAR & 4-ROLE LOGIN MENUBAR            */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* REGISTER & ONBOARD MENUBAR DROPDOWN */}
            <div ref={registerMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsRegisterMenuOpen(!isRegisterMenuOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 dark:bg-teal-950/80 dark:hover:bg-teal-900/80 dark:text-teal-200 dark:border-teal-800 px-3 py-1.5 text-xs font-extrabold transition shadow-2xs cursor-pointer group"
                title="Register Drug Store, Register Supplier, or Authorize Pharmacist"
              >
                <PlusCircle className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-90 transition-transform" />
                <span>Register & Onboard</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </button>

              {isRegisterMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 block">
                    Choose Registration Pathway:
                  </span>

                  {/* 1. REGISTER DRUG STORE */}
                  <button
                    type="button"
                    onClick={handleOpenOwner}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                        Register Drug Store
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Onboard community pharmacy, EFDA license & TIN registry
                      </span>
                    </div>
                  </button>

                  {/* 2. REGISTER AS SUPPLIER */}
                  <button
                    type="button"
                    onClick={handleOpenSupplier}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-transparent hover:border-teal-200 dark:hover:border-teal-800 transition flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-teal-700 dark:group-hover:text-teal-300">
                        Register as Supplier
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Wholesale medicine distributor, credit terms & logistics
                      </span>
                    </div>
                  </button>

                  {/* 3. AUTHORIZE PHARMACIST */}
                  <button
                    type="button"
                    onClick={handleOpenPharmacist}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                        Authorize Pharmacist
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                        Provision licensed clinical staff dispenser ID & fast PIN
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* UNIFIED 4-ROLE LOGIN / WORKSTATION ACCESS */}
            {currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs cursor-pointer ${
                    isSuperAdmin
                      ? 'bg-indigo-950 text-white border-indigo-700 hover:bg-indigo-900'
                      : isStoreOwner
                      ? 'bg-blue-950 text-white border-blue-700 hover:bg-blue-900'
                      : isSupplier
                      ? 'bg-teal-950 text-white border-teal-700 hover:bg-teal-900'
                      : 'bg-emerald-900 text-white border-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isSuperAdmin
                        ? 'bg-amber-400 text-indigo-950'
                        : isStoreOwner
                        ? 'bg-blue-400 text-slate-950'
                        : isSupplier
                        ? 'bg-teal-400 text-slate-950'
                        : 'bg-emerald-400 text-slate-900'
                    }`}
                  >
                    {isSuperAdmin ? '👑' : isStoreOwner ? '🏪' : isSupplier ? '🚚' : '💊'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block leading-none font-extrabold">{currentUser.name}</span>
                    <span className="text-[9px] opacity-80 font-mono block pt-0.5">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>

                {/* Dropdown Menu when user is logged in */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 dark:bg-slate-900 dark:border-slate-800 space-y-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95">
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Authenticated Active Session
                      </span>
                      <p className="font-bold text-slate-900 text-xs dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="pt-1 space-y-1 text-xs">
                      {onOpenDashboard && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenDashboard();
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-white font-black transition flex items-center justify-between shadow-xs ${
                            isSuperAdmin
                              ? 'bg-indigo-600 hover:bg-indigo-700'
                              : isStoreOwner
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : isSupplier
                              ? 'bg-teal-600 hover:bg-teal-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSuperAdmin ? (
                              <Shield className="h-3.5 w-3.5 text-amber-300" />
                            ) : isSupplier ? (
                              <Truck className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <Store className="h-3.5 w-3.5 text-white" />
                            )}
                            <span>
                              {isSuperAdmin
                                ? '👑 Master Admin Fleet'
                                : isStoreOwner
                                ? '🏪 Owner Workstation'
                                : isSupplier
                                ? '🚚 Supplier Procurement Hub'
                                : '💊 Staff Terminal & POS'}
                            </span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNav('public_orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Dispense Activity Logs</span>
                      </button>

                      {onOpenProfile && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <User className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Employee Shift Profile</span>
                        </button>
                      )}

                      {onSignOut && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition flex items-center gap-2 dark:hover:bg-rose-950/40 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ROLE LOGIN MENUBAR DROPDOWN (Direct 1-Click for 4 roles) */
              <div ref={roleLoginMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleLoginMenuOpen(!isRoleLoginMenuOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#004eb8] hover:bg-[#003d94] px-3.5 py-1.5 text-xs font-black text-white transition shadow-sm cursor-pointer active:scale-98"
                  title="Sign In for All Roles: Super Admin, Store Owner, Pharmacist, Wholesale Supplier"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>4-Role Login</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {isRoleLoginMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 z-50 space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 px-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        1-Click Test Simulation Login:
                      </span>
                      <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400">
                        Canonical Credentials
                      </span>
                    </div>

                    {/* 1. SUPER ADMIN 1: ATRONOS SISAY */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('SUPER_ADMIN', 'athronos21@gmail.com')}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-400 text-indigo-950 flex items-center justify-center text-xs font-black">
                          👑
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Super Admin (1)
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Atronos Sisay • National Fleet
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>

                    {/* 2. SUPER ADMIN 2: BEKA GIRMA */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('SUPER_ADMIN', 'beka.girma@gmail.com')}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-indigo-950 flex items-center justify-center text-xs font-black">
                          👑
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Super Admin (2)
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Beka Girma • National Fleet
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>

                    {/* 3. STORE OWNER: KAZINIYA AHMED */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('STORE_OWNER', 'kaziniya@kaziniya.com')}
                      className="w-full text-left p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-xs font-black">
                          🏪
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Drug Store Owner
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Kaziniya Ahmed • Pharmacy Owner
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-blue-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>

                    {/* 4. PHARMACIST: MONET ALEMAYEHU */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('PHARMACIST', 'monet@kaziniya.com')}
                      className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                          💊
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Pharmacist
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Monet Alemayehu • POS & Dispense
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>

                    {/* 5. WHOLESALE SUPPLIER: SUPPLIER */}
                    <button
                      type="button"
                      onClick={() => handleRoleQuickLogin('SUPPLIER', 'supplier@medtech.com')}
                      className="w-full text-left p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-teal-100 dark:border-teal-900/60 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                          🚚
                        </span>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            Wholesale Supplier
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Supplier • B2B Procurement Hub
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-teal-600 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                    </button>

                    {/* CUSTOM CREDENTIALS / GATEWAY */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleLoginMenuOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-center py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Open DDS Gateway Login Page →</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE SLIDE-DOWN DRAWER MENU (100% Comprehensive Accessibility)      */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-2">
          
          {/* Landing Mode Switcher for Mobile */}
          <div className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 block">
              Active Landing Page View:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleModeChange('NATIONAL')}
                className={`py-1.5 px-2 rounded-lg border text-center transition ${
                  landingMode === 'NATIONAL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                🌐 National
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('REGISTERED_STORE')}
                className={`py-1.5 px-2 rounded-lg border text-center transition ${
                  landingMode === 'REGISTERED_STORE'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                🏪 Pharmacy
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('REGISTERED_SUPPLIER')}
                className={`py-1.5 px-2 rounded-lg border text-center transition ${
                  landingMode === 'REGISTERED_SUPPLIER'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                🚚 Supplier
              </button>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => handleNav('public_home')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              🏠 Home
            </button>
            <button
              onClick={handleScrollToInfo}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              ℹ️ About DDS
            </button>
            <button
              onClick={() => handleNav('public_products')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              💊 Medicine Catalog
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsPrescriptionModalOpen(true);
              }}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              📄 Upload Prescription
            </button>
            <button
              onClick={() => handleNav('public_orders')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              📦 Track Orders
            </button>
            <button
              onClick={() => handleNav('public_contact')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-left"
            >
              🏢 Branches & Contact
            </button>
          </div>

          {/* Onboarding Actions on Mobile */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 block">
              Registration & Authorization:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleOpenOwner}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <Store className="h-4 w-4" />
                <span>Register Drug Store</span>
              </button>
              <button
                type="button"
                onClick={handleOpenSupplier}
                className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <Truck className="h-4 w-4" />
                <span>Register Supplier</span>
              </button>
              <button
                type="button"
                onClick={handleOpenPharmacist}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="h-4 w-4" />
                <span>Authorize Pharmacist</span>
              </button>
            </div>
          </div>

          {/* 5-Role Quick Login Buttons on Mobile */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 block">
              Quick Role Login (1-Click):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('SUPER_ADMIN')}
                className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-extrabold text-left"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('STORE_OWNER')}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-extrabold text-left"
              >
                🏪 Store Owner
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('PHARMACIST')}
                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-extrabold text-left"
              >
                💊 Pharmacist
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('SUPPLIER')}
                className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-extrabold text-left"
              >
                🚚 Wholesale Supplier
              </button>
            </div>
          </div>

          {/* Academic Documentation Button */}
          {onOpenDocumentation && (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDocumentation();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4 text-teal-600" />
              <span>Academic Report & Documentation (.docx / .pdf)</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS MOUNTED DIRECTLY IN HEADER                                     */}
      {/* ========================================================================= */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <StockReserveModal
        medicine={reserveMedicine}
        onClose={() => setReserveMedicine(null)}
      />

      {/* Internal Owner Registration Modal Fallback */}
      <OwnerRegistrationModal
        isOpen={isInternalOwnerModalOpen}
        onClose={() => setIsInternalOwnerModalOpen(false)}
        onSuccess={(ownerUser, pharmacyProfile) => {
          setIsInternalOwnerModalOpen(false);
          try {
            localStorage.setItem('dds_registered_store', JSON.stringify(pharmacyProfile));
            localStorage.setItem('dds_active_landing_mode', 'REGISTERED_STORE');
            window.dispatchEvent(new CustomEvent('dds_state_updated'));
          } catch {}
          if (onSwitchLandingMode) onSwitchLandingMode('REGISTERED_STORE');
          if (onNavigate) onNavigate('public_home');
          showToast(
            `Pharmacy "${pharmacyProfile.storeName}" registered! Now authorize your pharmacist staff.`,
            'success',
            'Drug Store Created'
          );
        }}
        onOpenPosTerminal={() => {
          setIsInternalOwnerModalOpen(false);
          if (onOpenDashboard) onOpenDashboard();
        }}
        onViewStorefront={() => {
          setIsInternalOwnerModalOpen(false);
          if (onNavigate) onNavigate('public_home');
        }}
      />

      {/* Internal Supplier Registration Modal Fallback */}
      <SupplierRegistrationModal
        isOpen={isInternalSupplierModalOpen}
        onClose={() => setIsInternalSupplierModalOpen(false)}
        onSuccess={(supplier, user) => {
          setIsInternalSupplierModalOpen(false);
          try {
            localStorage.setItem('dds_registered_supplier', JSON.stringify(supplier));
            localStorage.setItem('dds_active_landing_mode', 'REGISTERED_SUPPLIER');
            window.dispatchEvent(new CustomEvent('dds_state_updated'));
          } catch {}
          if (onSwitchLandingMode) onSwitchLandingMode('REGISTERED_SUPPLIER');
          if (onNavigate) onNavigate('public_home');
          showToast(
            `Supplier "${supplier.name}" registered! Procurement network active.`,
            'success',
            'Supplier Created'
          );
        }}
      />

      {/* Internal Pharmacist Authorization Modal Fallback */}
      <PharmacistAuthorizationModal
        isOpen={isInternalPharmacistModalOpen}
        onClose={() => setIsInternalPharmacistModalOpen(false)}
        pharmacyProfile={registeredStore}
        onSuccess={(pharmacistUser) => {
          setIsInternalPharmacistModalOpen(false);
          try {
            const stored = localStorage.getItem('dds_authorized_pharmacists');
            const list = stored ? JSON.parse(stored) : [];
            list.push(pharmacistUser);
            localStorage.setItem('dds_authorized_pharmacists', JSON.stringify(list));
            window.dispatchEvent(new CustomEvent('dds_state_updated'));
          } catch {}
          showToast(
            `Pharmacist "${pharmacistUser.name}" authorized! Ready to dispense.`,
            'success',
            'Pharmacist Authorized'
          );
        }}
        onInstantLogin={(pharmacistUser) => {
          setIsInternalPharmacistModalOpen(false);
          if (onQuickRoleLogin) {
            onQuickRoleLogin('PHARMACIST');
          } else if (onOpenDashboard) {
            onOpenDashboard();
          }
        }}
      />
    </header>
  );
};

export const Header = PublicHeader;
