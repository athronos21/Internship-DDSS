import React, { useState, useEffect, useRef } from 'react';
import { Pill, UserCheck, ShieldCheck, User, LogOut, ChevronDown, Shield, LogIn, UserPlus, ShoppingBag, Store, FileText, ArrowLeft, Globe, MapPin, Sparkles, PlusCircle } from 'lucide-react';
import { PrescriptionUploadModal } from './PrescriptionUploadModal';
import { StockReserveModal } from './StockReserveModal';
import { Medicine, User as UserType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { usePortalContent } from '../../context/PortalContentContext';

interface PublicHeaderProps {
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
  onLoginClick: () => void;
  onOpenMasterAdminLogin?: () => void;
  onOpenOwnerRegister?: () => void;
  onOpenMobileApp?: () => void;
  currentUser?: UserType | null;
  onSignOut?: () => void;
  onSearch?: (query: string) => void;
  onOpenDashboard?: () => void;
  wishlistCount?: number;
  onOpenProfile?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentScreen = 'public_home',
  onNavigate,
  onLoginClick,
  onOpenMasterAdminLogin,
  onOpenOwnerRegister,
  currentUser,
  onSignOut,
  onSearch,
  onOpenDashboard,
  wishlistCount = 0,
  onOpenProfile,
}) => {
  const { content } = usePortalContent();
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [reserveMedicine, setReserveMedicine] = useState<Medicine | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.email === 'athronos21@gmail.com' || currentUser?.role === 'SUPER_ADMIN';
  const isStoreOwner = currentUser?.isOwner || currentUser?.role === 'STORE_OWNER';
  const isNetworkPortal = currentScreen === 'public_registration';

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isNetworkPortal 
        ? 'bg-slate-950/95 border-teal-900/60 text-white'
        : 'bg-white/95 border-slate-200 dark:bg-slate-900/95 dark:border-slate-800'
    }`}>
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* ========================================================================= */}
          {/* 1. BRAND LOGO (ADAPTIVE PER INDEPENDENT PORTAL) */}
          {/* ========================================================================= */}
          {isNetworkPortal ? (
            <div
              onClick={() => handleNav('public_registration')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-tight">
                  National Pharmacy Network
                </span>
                <span className="text-[9px] font-bold text-teal-400 block tracking-wider uppercase">
                  Store Registry & B2B Hub • EFDA Ecosystem
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleNav('public_home')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition">
                <Pill className="h-4 w-4" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-emerald-950 dark:text-white block leading-tight">
                  {content.storeName}
                </span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider uppercase">
                  Licensed Community Pharmacy • EFDA Certified
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CENTRAL NAVIGATION LINKS (INDEPENDENT PER PORTAL) */}
          {/* ========================================================================= */}
          {isNetworkPortal ? (
            /* PORTAL B NAVIGATION: PHARMACY REGISTRATION & NETWORK */
            <nav className="hidden lg:flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Network Portal:
              </span>
              <button
                onClick={() => handleNav('public_registration')}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition bg-teal-500/20 text-teal-300 border border-teal-500/40"
              >
                Network Directory & ROI
              </button>
              {onOpenOwnerRegister && (
                <button
                  onClick={onOpenOwnerRegister}
                  className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-300 hover:text-white hover:bg-slate-800 transition inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-teal-400" />
                  <span>Register Store</span>
                </button>
              )}
            </nav>
          ) : (
            /* PORTAL A NAVIGATION: PATIENT & CUSTOMER STOREFRONT */
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleNav('public_home')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  currentScreen === 'public_home'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => handleNav('public_products')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  currentScreen === 'public_products'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                Medicine Catalog
              </button>

              <button
                onClick={() => setIsPrescriptionModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition inline-flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Upload Prescription</span>
              </button>

              <button
                onClick={() => handleNav('public_orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  currentScreen === 'public_orders'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                Track Orders
              </button>

              <button
                onClick={() => handleNav('public_contact')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  currentScreen === 'public_contact'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                Contact & Branches
              </button>
            </nav>
          )}

          {/* ========================================================================= */}
          {/* 3. RIGHT ACTIONS & INDEPENDENT PORTAL SWITCHER */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {isNetworkPortal ? (
              /* PORTAL B RIGHT ACTIONS */
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMasterAdminLogin || onLoginClick}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 border border-indigo-700/80 px-3 py-1.5 text-xs font-black transition shadow-xs"
                  title="Master Admin Login: Multi-Tenant Fleet & Platform Governance"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Master Admin</span>
                </button>

                {onOpenOwnerRegister && (
                  <button
                    onClick={onOpenOwnerRegister}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 px-3 py-1.5 text-xs font-black transition shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Register Store</span>
                  </button>
                )}

                {/* RETURN TO PATIENT STOREFRONT BUTTON */}
                <button
                  onClick={() => handleNav('public_home')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 text-xs font-bold transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-teal-400" />
                  <span>Patient Store</span>
                </button>
              </div>
            ) : (
              /* PORTAL A RIGHT ACTIONS: PATIENT PORTAL */
              <div className="flex items-center gap-2">
                {/* PROMINENT INDEPENDENT B2B PORTAL SWITCHER */}
                <button
                  onClick={() => handleNav('public_registration')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300/80 dark:bg-teal-950/70 dark:hover:bg-teal-900/80 dark:text-teal-200 dark:border-teal-700/80 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold transition shadow-2xs group"
                  title="Switch to National Pharmacy Registration & Network Hub"
                >
                  <Store className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Pharmacy Network & Hub</span>
                  <span className="sm:hidden">Network</span>
                  <span className="text-teal-500 font-mono text-[10px] hidden md:inline">→</span>
                </button>

                {/* USER MENU OR STAFF SIGN IN */}
                {currentUser ? (
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-2xs ${
                        isSuperAdmin
                          ? 'bg-indigo-950 text-white border-indigo-700 hover:bg-indigo-900'
                          : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          isSuperAdmin ? 'bg-amber-400 text-indigo-950' : 'bg-emerald-400 text-slate-900'
                        }`}
                      >
                        {isSuperAdmin ? '👑' : currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left hidden sm:block">
                        <span className="block leading-none font-extrabold">{currentUser.name}</span>
                        <span className="text-[9px] opacity-80 font-mono block pt-0.5">
                          {isSuperAdmin ? 'MASTER ADMIN' : currentUser.role}
                        </span>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 dark:bg-slate-900 dark:border-slate-800 space-y-1 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95">
                        <div className="p-2 space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {isSuperAdmin ? 'System Authority' : 'Logged In Employee'}
                          </span>
                          <p className="font-bold text-slate-900 text-xs dark:text-white truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          {isSuperAdmin && (
                            <span className="inline-block mt-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono font-bold text-[9px] px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              👑 Whole System Super Admin
                            </span>
                          )}
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
                                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSuperAdmin ? (
                                  <Shield className="h-3.5 w-3.5 text-amber-300" />
                                ) : (
                                  <Store className="h-3.5 w-3.5 text-white" />
                                )}
                                <span>
                                  {isSuperAdmin
                                    ? '👑 Master Admin Fleet Dashboard'
                                    : isStoreOwner
                                    ? '🏪 Store Owner Workstation'
                                    : '💊 Staff Terminal & POS'}
                                </span>
                              </div>
                            </button>
                          )}

                          {/* Dispense Logs link */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleNav('public_orders');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition flex items-center justify-between dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Dispense Activity Logs</span>
                            </div>
                          </button>

                          {/* Account Profile button */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              if (onOpenProfile) onOpenProfile();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Employee Shift Profile</span>
                          </button>

                          {/* Switch Account / Login with different ID */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              if (onLoginClick) onLoginClick();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold transition flex items-center gap-2 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <LogIn className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Switch Account / Sign In</span>
                          </button>

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
                  <button
                    onClick={onLoginClick}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Staff Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <StockReserveModal
        medicine={reserveMedicine}
        onClose={() => setReserveMedicine(null)}
      />
    </header>
  );
};

export const Header = PublicHeader;
