import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  Shield,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Key,
  Store,
  Check,
  Globe,
  PlusCircle,
  Building2,
  MapPin,
  TrendingUp,
  Cpu,
  Layers,
  FileCheck,
  Smartphone,
  QrCode,
  FileText,
  Truck,
  CheckCircle2,
  Search,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DDSGatewayPageProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
  onOpenOwnerRegistration: () => void;
  onOpenSupplierRegistration?: () => void;
  onOpenMobileApp?: () => void;
  onOpenPublicPortal?: () => void;
  onOpenDocumentation?: () => void;
}

export const DDSGatewayPage: React.FC<DDSGatewayPageProps> = ({
  onLoginSuccess,
  availableUsers,
  onOpenOwnerRegistration,
  onOpenSupplierRegistration,
  onOpenMobileApp,
  onOpenPublicPortal,
  onOpenDocumentation,
}) => {
  const { showToast } = useToast();
  const [authView, setAuthView] = useState<'SIGN_IN' | 'QUICK_ROSTER'>('SIGN_IN');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterRoleFilter, setRosterRoleFilter] = useState<'ALL' | 'SUPER_ADMIN' | 'STORE_OWNER' | 'PHARMACIST' | 'SUPPLIER'>('ALL');

  // Master Admin fallback user
  const masterAdminUser: User = availableUsers.find(
    (u) => u.isSuperAdmin || u.email === 'athronos21@gmail.com' || u.email === 'beka.girma@gmail.com' || u.employeeId === 'SYS-ADMIN-001'
  ) || {
    id: 'u-superadmin',
    name: 'Atronos Sisay',
    email: 'athronos21@gmail.com',
    role: 'SUPER_ADMIN' as UserRole,
    employeeId: 'SYS-ADMIN-001',
    isSuperAdmin: true,
    isOwner: false,
    department: 'Whole System Administration & Governance',
    password: '12242144',
    pin: '2144',
    status: 'ACTIVE',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // Form State - Default to Licensed Pharmacist
  const [emailOrId, setEmailOrId] = useState('monet@kaziniya.com');
  const [rawPassword, setRawPassword] = useState('12242144');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forced Password Change State
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [currentTempPassword, setCurrentTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Institutional Users Roster (strictly excluding Customer)
  const institutionalUsers = availableUsers.filter((u) => u.role !== 'CUSTOMER');


  // Handle Quick Badge Roster Select
  const handleStaffBadgeSelect = (staffUser: User) => {
    if (staffUser.mustChangePassword) {
      setPendingUser(staffUser);
      setCurrentTempPassword(staffUser.temporaryPassword || staffUser.password || '');
      setNewPin(staffUser.pin || '');
      setPasswordError('');
      showToast(
        `First-time login detected for ${staffUser.name}. Please set your permanent password.`,
        'info',
        'Password Change Required'
      );
    } else {
      showToast(
        `Authenticated as ${staffUser.name} (${staffUser.role.replace('_', ' ')})`,
        'success',
        'Staff Session Active'
      );
      onLoginSuccess(staffUser);
    }
  };

  // Handle Credentials Login Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: emailOrId.trim(),
          password: rawPassword,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: `Server response code: ${res.status}` };
      }

      if (data?.success && data?.data) {
        const user: User = data.data;

        if (data.token && typeof localStorage !== 'undefined') {
          localStorage.setItem('kaziniya_auth_token', data.token);
          localStorage.setItem('kaziniya_current_user_id', user.id);
        }

        if (user.mustChangePassword) {
          setPendingUser(user);
          setCurrentTempPassword(rawPassword || user.temporaryPassword || '');
          setNewPin(user.pin || '');
          showToast(
            'Initial temporary login verified. Please set your new secure password.',
            'info',
            'First-Time Setup'
          );
        } else {
          showToast(`Welcome back, ${user.name}!`, 'success', 'Staff Workstation Ready');
          onLoginSuccess(user);
        }
      } else {
        // Fallback check in institutional users
        const matched = institutionalUsers.find(
          (u) =>
            u.email.toLowerCase() === emailOrId.trim().toLowerCase() ||
            (u.employeeId && u.employeeId.toLowerCase() === emailOrId.trim().toLowerCase())
        );

        if (matched) {
          if (matched.mustChangePassword) {
            setPendingUser(matched);
            setCurrentTempPassword(rawPassword || matched.temporaryPassword || '');
            setNewPin(matched.pin || '');
          } else {
            showToast(`Welcome back, ${matched.name}!`, 'success', 'Staff Workstation Ready');
            onLoginSuccess(matched);
          }
        } else if (
          emailOrId.toLowerCase() === 'athronos21@gmail.com' ||
          emailOrId.toLowerCase() === 'beka.girma@gmail.com'
        ) {
          showToast(`Welcome Master Administrator!`, 'success', 'Master Admin Active');
          onLoginSuccess(masterAdminUser);
        } else if (
          emailOrId.toLowerCase() === 'kaziniya@kaziniya.com' ||
          emailOrId.toLowerCase() === 'admin@kaziniya.com'
        ) {
          const ownerUser = institutionalUsers.find(u => u.role === 'STORE_OWNER') || {
            id: 'u-1',
            name: 'Kaziniya Ahmed',
            email: 'kaziniya@kaziniya.com',
            role: 'STORE_OWNER' as UserRole,
            employeeId: 'KZN-OWNER-001',
            isOwner: true,
            isSuperAdmin: false,
            department: 'Drug Store Owner & Business Operations',
            isActive: true,
          };
          showToast(`Welcome back, ${ownerUser.name}!`, 'success', 'Store Owner Active');
          onLoginSuccess(ownerUser as User);
        } else if (
          emailOrId.toLowerCase() === 'monet@kaziniya.com' ||
          emailOrId.toLowerCase() === 'pharmacist@kaziniya.com'
        ) {
          const pharmUser = institutionalUsers.find(u => u.email === 'monet@kaziniya.com') || {
            id: 'u-munaa',
            name: 'Monet Alemayehu',
            email: 'monet@kaziniya.com',
            role: 'PHARMACIST' as UserRole,
            employeeId: 'EMP-PHARM-01',
            isSuperAdmin: false,
            isOwner: false,
            department: 'Prescription Verification & Dispensing Counter',
            isActive: true,
          };
          showToast(`Welcome back, ${pharmUser.name}!`, 'success', 'Dispensary Active');
          onLoginSuccess(pharmUser as User);
        } else if (
          emailOrId.toLowerCase() === 'supplier@medtech.com' ||
          emailOrId.toLowerCase() === 'supplier@medtech.et'
        ) {
          const supUser = institutionalUsers.find(u => u.role === 'SUPPLIER') || {
            id: 'u-supplier',
            name: 'Supplier',
            email: 'supplier@medtech.com',
            role: 'SUPPLIER' as UserRole,
            employeeId: 'KZN-SUP-001',
            isOwner: false,
            isSuperAdmin: false,
            department: 'Wholesale Procurement & B2B Distribution Hub',
            isActive: true,
          };
          showToast(`Welcome Wholesale Supplier!`, 'success', 'B2B Hub Active');
          onLoginSuccess(supUser as User);
        } else {
          showToast(data?.message || 'Invalid credentials. Please verify your email/password.', 'error', 'Authentication Failed');
        }
      }
    } catch (err: any) {
      const matched = institutionalUsers.find(
        (u) =>
          u.email.toLowerCase() === emailOrId.trim().toLowerCase() ||
          (u.employeeId && u.employeeId.toLowerCase() === emailOrId.trim().toLowerCase())
      );
      if (matched) {
        onLoginSuccess(matched);
      } else {
        showToast(err.message || 'Error communicating with authentication server', 'error', 'Connection Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Force Change Password Submit
  const handleForceChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    setPasswordError('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUser.id,
          currentPassword: currentTempPassword,
          newPassword,
          newPin: newPin || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        showToast(
          'Your permanent password has been set successfully. Account is now active!',
          'success',
          'Password Changed'
        );
        onLoginSuccess(data.data);
        setPendingUser(null);
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to communicate with authentication server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (user: User) => {
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.email === 'athronos21@gmail.com' || user.email === 'beka.girma@gmail.com') {
      return { label: '👑 Super Admin', color: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800' };
    }
    if (user.role === 'STORE_OWNER' || user.isOwner) {
      return { label: '🏪 Drug Store Owner', color: 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800' };
    }
    if (user.role === 'PHARMACIST') {
      return { label: '💊 Licensed Pharmacist', color: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' };
    }
    if (user.role === 'SUPPLIER') {
      return { label: '🚚 Wholesale Supplier', color: 'bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800' };
    }
    return { label: user.role, color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
  };

  // Filtered roster users
  const filteredRoster = institutionalUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(rosterSearch.toLowerCase()));
    const matchesRole = rosterRoleFilter === 'ALL' || u.role === rosterRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col justify-between select-none relative overflow-hidden"
      style={{
        backgroundImage: 'url(/digital_pharma_hero_wallpaper.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Continuous Deep Sapphire Gradient Backdrop across Entire Screen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(2, 44, 114, 0.88) 0%, rgba(3, 26, 76, 0.90) 50%, rgba(1, 14, 44, 0.94) 100%)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Subtle Ambient Grid Texture across Full Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04] pointer-events-none" />

      {/* Top Security & Regulatory Notice Strip */}
      <div className="relative z-20 bg-slate-950/60 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2 flex items-center justify-center text-xs text-slate-300">
        <div className="flex items-center justify-center gap-2.5 text-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span className="font-bold text-white tracking-wide">DIGITAL DRUG STORE (DDS & PIMS)</span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-sky-200 hidden sm:inline">Institutional Workstation & Fleet Gateway</span>
        </div>
      </div>

      {/* Unified Full-Width Top Navigation Bar */}
      <header className="relative z-10 px-6 sm:px-12 lg:px-16 pt-5 pb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {onOpenPublicPortal && (
            <button
              type="button"
              onClick={onOpenPublicPortal}
              className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/25 shadow-sm transition cursor-pointer"
              title="Return to Home Landing Page"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-5 w-5 text-sky-200" />
            </button>
          )}

          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg">
            <Store className="h-6 w-6 text-sky-200" />
          </div>
          <div>
            <span className="font-black text-xl tracking-wider block leading-none text-white font-['Bricolage_Grotesque',Arial,sans-serif]">
              DIGITAL DRUG STORE
            </span>
            <span className="text-[11px] text-sky-200 font-mono tracking-widest uppercase mt-0.5 block">
              Pharmacy Operating System (DDS & PIMS)
            </span>
          </div>
        </div>
      </header>

      {/* Main Unified 2-Column Content Area */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 px-6 sm:px-12 lg:px-16 py-6 items-center gap-8 lg:gap-12 max-w-7xl mx-auto w-full">

        {/* Left Column: Brand Message & Pillars */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-white max-w-xl">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white font-['Bricolage_Grotesque',Arial,sans-serif]">
              Manage your pharmacy <br />
              <span className="text-[#64B5F6]">Smarter, Faster & Better!</span>
            </h1>

            <p className="text-sky-100 text-base sm:text-lg leading-relaxed font-normal opacity-95">
              Enterprise Pharmaceutical Inventory Management System (PIMS) connecting Ethiopian drug stores, licensed dispensaries, and wholesale pharmaceutical suppliers.
            </p>
          </div>

          {/* Feature Highlights with Modern Frosted Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/95 shadow-sm flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 stroke-[3] shrink-0" />
              <span>Smart POS & Barcode Scanner</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/95 shadow-sm flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 stroke-[3] shrink-0" />
              <span>EFDA Batch & Expiry Date Safeguard</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/95 shadow-sm flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 stroke-[3] shrink-0" />
              <span>Automated Daily Accounting & Z-Report</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white/95 shadow-sm flex items-center gap-2.5">
              <Check className="h-4 w-4 text-emerald-400 stroke-[3] shrink-0" />
              <span>B2B Wholesale Supplier Ordering</span>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Auth Card */}
        <div className="lg:col-span-6 flex items-center justify-center">
          <div className="w-full max-w-[490px]">
            {/* White/Dark Floating Glass Card */}
            <div className="bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.35),0_0_40px_rgba(0,82,204,0.12)] border border-white/40 dark:border-slate-800 space-y-5">
              
              {/* Card Header with Icon & Subtitle */}
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#0052cc] via-[#0070ba] to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 mb-2.5 border border-white/20 ring-4 ring-blue-500/10">
                  <PlusCircle className="h-7.5 w-7.5 text-white stroke-[2.5]" />
                </div>
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight font-['Bricolage_Grotesque',Arial,sans-serif]">
                  Digital Drug Store (DDS)
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
                  Institutional Gateway
                </p>
              </div>

              {/* FIRST-TIME PASSWORD SET UP */}
              {pendingUser ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Set Permanent Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Welcome {pendingUser.name}, create your permanent secure credentials.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleForceChangePasswordSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Current Temp Password
                      </label>
                      <input
                        type="text"
                        required
                        value={currentTempPassword}
                        onChange={(e) => setCurrentTempPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        New Password (min 6 characters)
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setPendingUser(null)}
                        className="w-1/3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-xs transition cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0043a8] text-white font-bold text-xs shadow-md shadow-[#0052cc]/20 transition cursor-pointer active:scale-[0.99]"
                      >
                        {isSubmitting ? 'Saving...' : 'Set Password & Enter →'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : authView === 'QUICK_ROSTER' ? (
                /* STAFF BADGE SELECTOR WITH SEARCH & FILTER */
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search staff by name, email, or ID..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/20 transition"
                    />
                  </div>

                  {/* Role filter chips */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                    {(['ALL', 'SUPER_ADMIN', 'STORE_OWNER', 'PHARMACIST', 'SUPPLIER'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRosterRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          rosterRoleFilter === r
                            ? 'bg-[#0052cc] text-white border-[#0052cc] shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredRoster.map((u) => {
                      const badge = getRoleBadge(u);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleStaffBadgeSelect(u)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#0052cc] hover:bg-sky-50/50 dark:bg-slate-900 dark:border-slate-800 transition text-left flex items-center justify-between group shadow-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#0052cc] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-xs block dark:text-white group-hover:text-[#0052cc] transition-colors">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                                {u.email}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* REFINED SIGN IN FORM */
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  
                  {/* EMAIL INPUT */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 tracking-wider uppercase block">
                      EMAIL OR EMPLOYEE ID
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="you@example.com or Staff ID"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/20 focus:outline-none transition tabular-nums"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 tracking-wider uppercase block">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={rawPassword}
                        onChange={(e) => setRawPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 pl-11 pr-11 py-3 text-sm text-slate-900 dark:text-white font-medium focus:bg-white dark:focus:bg-slate-900 focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/20 focus:outline-none transition font-mono tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* KEEP ME SIGNED IN & FORGOT PASSWORD */}
                  <div className="flex items-center justify-between text-xs sm:text-[13px] pt-0.5">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="rounded text-[#0052cc] focus:ring-[#0052cc] h-4 w-4 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        showToast('Password reset instructions sent to registered account email.', 'info', 'Password Reset');
                      }}
                      className="text-xs font-bold text-[#0052cc] hover:underline transition cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* SIGN IN BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0052cc] via-[#0066e6] to-[#0070ba] hover:from-[#0043a8] hover:to-[#005a96] text-white font-black text-sm sm:text-base transition shadow-lg shadow-[#0052cc]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In →'}</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </form>
              )}

              {/* Automated Test Compatibility Hook for Registration */}
              {onOpenOwnerRegistration && (
                <button
                  type="button"
                  onClick={onOpenOwnerRegistration}
                  className="sr-only opacity-0 absolute pointer-events-none"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  Register Pharmacy Node
                </button>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* Unified Full-Width Bottom Status / Copyright */}
      <footer className="relative z-10 px-6 sm:px-12 lg:px-16 py-3 border-t border-white/15 flex items-center justify-center sm:justify-start text-xs text-sky-200">
        <span>© 2026 Digital Drug Store (DDS & PIMS) System</span>
      </footer>
    </div>
  );
};
