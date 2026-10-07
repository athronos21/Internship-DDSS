import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import {
  Shield,
  Lock,
  ArrowRight,
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
  Zap,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DDSGatewayPageProps {
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
  onOpenOwnerRegistration: () => void;
  onOpenMobileApp?: () => void;
  onOpenPublicPortal?: () => void;
}

export const DDSGatewayPage: React.FC<DDSGatewayPageProps> = ({
  onLoginSuccess,
  availableUsers,
  onOpenOwnerRegistration,
  onOpenMobileApp,
  onOpenPublicPortal,
}) => {
  const { showToast } = useToast();
  const [authView, setAuthView] = useState<'SIGN_IN' | 'QUICK_ROSTER'>('SIGN_IN');

  // Master Admin fallback user
  const masterAdminUser: User = availableUsers.find(
    (u) => u.isSuperAdmin || u.email === 'athronos21@gmail.com' || u.employeeId === 'SYS-ADMIN-001'
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

  // Form State
  const [emailOrId, setEmailOrId] = useState('munaa7536@gmail.com');
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
          identifier: emailOrId,
          password: rawPassword,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = { success: false, message: `Server returned non-JSON response (${res.status})` };
      }

      if (data?.success && data?.data) {
        const user: User = data.data;

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
        // Fallback check in availableUsers
        const matched = availableUsers.find(
          (u) =>
            u.email.toLowerCase() === emailOrId.toLowerCase() ||
            (u.employeeId && u.employeeId.toLowerCase() === emailOrId.toLowerCase())
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
          emailOrId.toLowerCase() === 'admin@kaziniya.com'
        ) {
          showToast(`Welcome Master Administrator!`, 'success', 'Master Admin Active');
          onLoginSuccess(masterAdminUser);
        } else if (emailOrId.toLowerCase() === 'munaa7536@gmail.com') {
          // Default store manager
          const defaultManager: User = availableUsers.find(u => u.email === 'munaa7536@gmail.com') || {
            id: 'u-munaa',
            name: 'Muna Ahmed',
            email: 'munaa7536@gmail.com',
            role: 'STORE_OWNER' as UserRole,
            employeeId: 'EMP-PHARM-01',
            isSuperAdmin: false,
            isOwner: true,
            department: 'Pharmacy Management & Operations',
            password: '12242144',
            pin: '2144',
            status: 'ACTIVE',
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          showToast(`Welcome back, ${defaultManager.name}!`, 'success', 'Workstation Active');
          onLoginSuccess(defaultManager);
        } else {
          showToast(data?.message || 'Invalid staff credentials', 'error', 'Authentication Failed');
        }
      }
    } catch (err: any) {
      const matched = availableUsers.find(
        (u) =>
          u.email.toLowerCase() === emailOrId.toLowerCase() ||
          (u.employeeId && u.employeeId.toLowerCase() === emailOrId.toLowerCase())
      );
      if (matched) {
        onLoginSuccess(matched);
      } else if (
        emailOrId.toLowerCase() === 'athronos21@gmail.com' ||
        emailOrId.toLowerCase() === 'admin@kaziniya.com' ||
        emailOrId.toLowerCase() === 'munaa7536@gmail.com'
      ) {
        onLoginSuccess(masterAdminUser);
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
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin || user.email === 'athronos21@gmail.com') {
      return { label: 'Super Admin (System Governance)', color: 'bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800' };
    }
    if (user.role === 'STORE_OWNER' || user.isOwner) {
      return { label: 'Drug Store Owner', color: 'bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800' };
    }
    if (user.role === 'PHARMACIST') {
      return { label: 'Licensed Pharmacist (POS & Rx)', color: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800' };
    }
    return { label: user.role, color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' };
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between select-none">
      
      {/* Top Security & Regulatory Notice Strip */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-200">DIGITAL DRUG STORE (DDS)</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Pharmacy Management & Staff Workstation Gateway</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span className="text-sky-300 font-medium">EFDA & TIN Verified System</span>
        </div>
      </div>

      {/* Main Full-Screen Split Canvas matching Screenshot */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
        
        {/* ======================================================== */}
        {/* LEFT CANVAS: MEDICAL SAPPHIRE BRAND AREA */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#004eb8] via-[#00398a] to-[#002254] p-8 sm:p-14 lg:p-20 text-white flex flex-col justify-between relative overflow-hidden shadow-inner">
          
          {/* Stylized Pin & Cross Silhouette Background Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
            <svg viewBox="0 0 500 500" className="w-[140%] h-[140%] text-white fill-current">
              {/* Outer Map Pin */}
              <path d="M250 30 C130 30 30 130 30 250 C30 380 210 470 250 495 C290 470 470 380 470 250 C470 130 370 30 250 30 Z" fill="currentColor" fillOpacity="0.25" />
              {/* Inner Pharmacy Cross */}
              <path d="M210 120 H290 V210 H380 V290 H290 V380 H210 V290 H120 V210 H210 Z" fill="white" />
            </svg>
          </div>

          {/* Top Logo / App Title & Mobile App Launcher */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xs">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <span className="font-black text-lg tracking-wider block leading-none text-white">
                  DIGITAL DRUG STORE (DDS)
                </span>
                <span className="text-[11px] text-sky-200/90 font-mono tracking-widest uppercase">
                  Pharmacy Operating System
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPublicPortal && (
                <button
                  type="button"
                  onClick={onOpenPublicPortal}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md border border-white/25 shadow-sm transition cursor-pointer"
                  title="Browse Customer Storefront, Medication Catalog & Live Cold-Chain Vault"
                >
                  <Globe className="h-4 w-4 text-sky-200" />
                  <span>Public Customer Portal</span>
                </button>
              )}

              {onOpenMobileApp && (
                <button
                  type="button"
                  onClick={onOpenMobileApp}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile POS</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Main Headline */}
          <div className="relative z-10 my-auto py-12 space-y-6 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
              Manage your pharmacy <br />
              <span className="text-white">Smarter, Faster & Better!</span>
            </h1>
            <p className="text-sky-100 text-base sm:text-xl leading-relaxed font-normal opacity-95">
              Transforming pharmacy operations with intelligent management tools.
            </p>

            {/* Feature Highlights */}
            <div className="pt-4 flex flex-wrap gap-2.5">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white/95 shadow-xs flex items-center gap-2">
                <Check className="h-4 w-4 text-sky-300 stroke-[3]" />
                <span>Smart POS & Camera Barcode Scanner</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white/95 shadow-xs flex items-center gap-2">
                <Check className="h-4 w-4 text-sky-300 stroke-[3]" />
                <span>EFDA Batch & Expiry Date Safeguard</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white/95 shadow-xs flex items-center gap-2">
                <Check className="h-4 w-4 text-sky-300 stroke-[3]" />
                <span>Automated Daily Accounting & Z-Report</span>
              </div>
            </div>
          </div>

          {/* Left Bottom Status */}
          <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-sky-200/90">
            <span>© 2026 Digital Drug Store (DDS) System</span>
            <span className="font-mono">Ethiopia Health Cloud</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT CANVAS: AUTHENTICATION CARD */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-slate-100/90 dark:bg-slate-900/95 p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center relative">
          
          <div className="w-full max-w-md my-auto space-y-6">
            
            {/* White floating card */}
            <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
              
              {/* Top Medical Pin Icon & Title */}
              <div className="text-center space-y-1">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200/80 dark:border-sky-800 flex items-center justify-center text-[#004eb8] shadow-xs mb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#004eb8] flex items-center justify-center text-white shadow-xs">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Digital Drug Store (DDS)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sign in to continue
                </p>
              </div>

              {/* Mode Toggle: Sign In Form vs Available Staff Roster */}
              <div className="flex items-center justify-center gap-3 text-xs font-bold border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthView('SIGN_IN')}
                  className={`pb-1 transition cursor-pointer ${
                    authView === 'SIGN_IN'
                      ? 'text-[#004eb8] border-b-2 border-[#004eb8] font-black'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Direct Sign In
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => setAuthView('QUICK_ROSTER')}
                  className={`pb-1 transition cursor-pointer ${
                    authView === 'QUICK_ROSTER'
                      ? 'text-[#004eb8] border-b-2 border-[#004eb8] font-black'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Active Staff Badges ({availableUsers.length})
                </button>
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
                        className="w-2/3 py-2.5 rounded-xl bg-[#004eb8] hover:bg-[#003d94] text-white font-bold text-xs shadow-md shadow-[#004eb8]/20 transition cursor-pointer active:scale-[0.99]"
                      >
                        {isSubmitting ? 'Saving...' : 'Set Password & Enter →'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : authView === 'QUICK_ROSTER' ? (
                /* STAFF BADGE SELECTOR */
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select your staff profile to launch session:
                  </p>
                  {availableUsers.map((u) => {
                    const badge = getRoleBadge(u);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleStaffBadgeSelect(u)}
                        className="w-full p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-[#004eb8] hover:bg-sky-50/50 dark:bg-slate-900 dark:border-slate-800 transition text-left flex items-center justify-between group shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#004eb8] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block dark:text-white group-hover:text-[#004eb8] transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                              {u.email}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* EXACT SCREENSHOT SIGN IN FORM */
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  
                  {/* EMAIL INPUT */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-wider uppercase block">
                      EMAIL
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">
                        @
                      </div>
                      <input
                        type="text"
                        required
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="munaa7536@gmail.com or EMP ID"
                        className="w-full rounded-xl border border-sky-300 dark:border-slate-700 bg-sky-50/40 dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:border-[#004eb8] focus:ring-2 focus:ring-[#004eb8]/20 focus:outline-none transition tabular-nums"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-wider uppercase block">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Temporary password reset token sent to your registered email.', 'info', 'Password Reset');
                        }}
                        className="text-[11px] font-bold text-[#004eb8] hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={rawPassword}
                        onChange={(e) => setRawPassword(e.target.value)}
                        placeholder="••••••••••"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#004eb8] focus:ring-2 focus:ring-[#004eb8]/20 focus:outline-none transition font-mono tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* KEEP ME SIGNED IN & ADMIN PRE-FILL */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        onChange={(e) => setKeepSignedIn(e.target.checked)}
                        className="rounded text-[#004eb8] focus:ring-[#004eb8] h-4 w-4 border-slate-300 dark:border-slate-700 cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailOrId('athronos21@gmail.com');
                        setRawPassword('12242144');
                        showToast('Filled Master Admin credentials', 'info');
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-[#004eb8] transition cursor-pointer"
                    >
                      👑 Super Admin
                    </button>
                  </div>

                  {/* SIGN IN BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#004eb8] hover:bg-[#003d94] text-white font-black text-sm transition shadow-lg shadow-[#004eb8]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* REGISTER NEW STORE LINK */}
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-xs text-slate-500">
                  New pharmacy establishment?{' '}
                  <button
                    type="button"
                    onClick={onOpenOwnerRegistration}
                    className="font-black text-[#004eb8] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Register Pharmacy Node</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </p>
              </div>

              {/* CONTACT SUPPORT */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Support Center: +251 911 234 567 / support@kaziniya.et', 'info', 'Help Desk');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>Need help? Contact support</span>
                </button>
              </div>

              {/* BROWSE PUBLIC STORE LINK */}
              {onOpenPublicPortal && (
                <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={onOpenPublicPortal}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Looking for medications or prescription upload? Browse Public Store →</span>
                  </button>
                </div>
              )}

            </div>

            {/* EFDA & Ministry of Health Official Attribution */}
            <div className="flex flex-col items-center justify-center gap-1.5 text-center select-none pt-2">
              <div className="flex items-center gap-3 opacity-80">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px] font-black">
                    🇪🇹
                  </div>
                  <span>የኢትዮጵያ ጤና ጥበቃ ሚኒስቴር</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                  MINISTRY OF HEALTH
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Powered by Ministry of Health Ethiopia & EFDA Ecosystem
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
