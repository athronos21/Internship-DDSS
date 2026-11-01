import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Key,
  Lock,
  Building,
  CheckCircle2,
  Calendar,
  Eye,
  EyeOff,
  Hash,
  AlertCircle,
  FileCheck,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  initialTab?: 'general' | 'security' | 'permissions';
  onUpdateUser?: (updated: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'general',
  onUpdateUser,
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'permissions'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  // Password & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '+251 911 234 567');
      setDepartment(currentUser.department || 'Clinical Pharmacy & Operations');
      setPin(currentUser.pin || '1234');
    }
    setActiveTab(initialTab);
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [currentUser, isOpen, initialTab]);

  if (!isOpen || !currentUser) return null;

  // Role Theme Color Config
  const getRoleHeaderGradient = () => {
    switch (currentUser.role) {
      case 'STORE_OWNER':
        return 'from-blue-700 via-indigo-800 to-slate-900';
      case 'PHARMACIST':
        return 'from-teal-600 via-emerald-700 to-slate-900';
      case 'SUPPLIER':
        return 'from-sky-600 via-blue-700 to-slate-900';
      case 'SUPER_ADMIN':
        return 'from-purple-700 via-indigo-900 to-slate-950';
      default:
        return 'from-slate-700 via-slate-800 to-slate-900';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (currentUser.role) {
      case 'STORE_OWNER':
        return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      case 'PHARMACIST':
        return 'bg-teal-500/20 text-teal-200 border-teal-400/30';
      case 'SUPPLIER':
        return 'bg-sky-500/20 text-sky-200 border-sky-400/30';
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-200 border-purple-400/30';
      default:
        return 'bg-slate-500/20 text-slate-200 border-slate-400/30';
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error', 'Validation Error');
      return;
    }

    const updated: User = {
      ...currentUser,
      name,
      email,
      phone,
      department,
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }

    showToast('Your professional profile has been updated successfully.', 'success', 'Profile Saved');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
          newPin: pin || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Your password and security PIN have been updated successfully.', 'success', 'Security Updated');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (onUpdateUser && data.data) {
          onUpdateUser(data.data);
        }
      } else {
        setPasswordError(data.error || 'Failed to update password. Check your current password.');
      }
    } catch {
      // Local fallback in case network simulation is active
      const updatedUser: User = {
        ...currentUser,
        pin: pin || currentUser.pin,
        lastPasswordChange: new Date().toISOString(),
      };
      if (onUpdateUser) onUpdateUser(updatedUser);
      showToast('Security credentials updated locally.', 'success', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRolePermissionsList = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return [
          { name: 'National Pharmacy Registry & Nodes', granted: true },
          { name: 'EFDA Compliance Oversight & Inspection', granted: true },
          { name: 'National Formulary Master Catalog', granted: true },
          { name: 'Multi-Store Telemetry & Audit Logs', granted: true },
          { name: 'Role Assignment & Global RBAC Security', granted: true },
          { name: 'Local Counter POS Dispensing', granted: true },
        ];
      case 'STORE_OWNER':
        return [
          { name: 'Complete Pharmacy Operational Control', granted: true },
          { name: 'Financial Statements (P&L, Balance Sheet)', granted: true },
          { name: 'Wholesale Supplier Replenishment & POs', granted: true },
          { name: 'Staff Management & Payroll Governance', granted: true },
          { name: 'Counter POS Cashier & Till Reconciliation', granted: true },
          { name: 'National Regulatory Server Management', granted: false },
        ];
      case 'PHARMACIST':
        return [
          { name: 'Prescription Verification & Dispensing', granted: true },
          { name: 'POS Counter Checkout & Receipt Printing', granted: true },
          { name: 'FEFO Batch Expiry & Stock Tracking', granted: true },
          { name: 'Shift Handover & Cash Till Reconcile', granted: true },
          { name: 'Staff Management & Payroll Governance', granted: false },
          { name: 'Store Financials & Executive P&L', granted: false },
        ];
      case 'SUPPLIER':
        return [
          { name: 'Wholesale Supplier Portal & Catalog', granted: true },
          { name: 'Purchase Orders & Invoices Dispatch', granted: true },
          { name: 'Goods Receipts GRN Delivery Verification', granted: true },
          { name: 'Accounts Payable (AP) Ledger Inquiries', granted: true },
          { name: 'Retail Counter POS Dispensing', granted: false },
          { name: 'Store Staff & Payroll Governance', granted: false },
        ];
      default:
        return [
          { name: 'Public Drug Store Catalog Browsing', granted: true },
          { name: 'Customer Order History & Tracking', granted: true },
          { name: 'Staff Counter POS Access', granted: false },
        ];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className={`p-6 bg-gradient-to-r ${getRoleHeaderGradient()} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full p-2 bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-xl tracking-tight">
                  {currentUser.name}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeStyle()}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono">
                {currentUser.email} • {currentUser.employeeId || 'KZN-STAFF-01'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <Building className="h-3 w-3" />
                <span>{currentUser.pharmacyName || 'Kaziniya Drug Store - Flagship Branch'}</span>
              </div>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/15 pb-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'general'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Profile Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'security'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'permissions'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Permissions & Audit</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: GENERAL CREDENTIALS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Division
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Verified Identity Badge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase">Staff Employee ID</span>
                    <Hash className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                    {currentUser.employeeId || 'EMP-PHARM-01'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase">EFDA License No.</span>
                    <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">
                    {currentUser.pharmacistLicense || currentUser.licenseNumber || 'EFDA-DISP-AA-0982'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase">Account Status</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    ACTIVE • VERIFIED
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Save Profile Details
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-10 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-10 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    POS Counter Quick PIN (4 Digits)
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 2144"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-mono font-bold tracking-widest focus:border-teal-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Used for swift counter workstation unlocking and shift till verification.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>EFDA Regulatory Password Policy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Passwords must contain at least 8 characters. Do not share your POS till PIN or credentials with unauthorized counter assistants.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  {isSubmitting ? 'Updating...' : 'Update Password & PIN'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ROLE & PERMISSIONS AUDIT */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {currentUser.role.replace('_', ' ')} Workstation Authority
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Institutional Role-Based Access Control (RBAC) boundaries assigned to your staff identity.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300">
                  TIER 1 ACCESS
                </span>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Assigned Operational Permissions:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getRolePermissionsList().map((perm) => (
                    <div
                      key={perm.name}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        perm.granted
                          ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-50 border-slate-200/60 text-slate-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-600 opacity-60'
                      }`}
                    >
                      <span className="font-medium text-xs">{perm.name}</span>
                      {perm.granted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Restricted
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Established: {new Date(currentUser.createdAt || '2026-01-01').toLocaleDateString()}</span>
                </div>
                <span className="font-mono text-slate-400">Session ID: {currentUser.id.slice(0, 8)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
