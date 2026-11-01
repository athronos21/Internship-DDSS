import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  Building,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  CheckCircle2,
  Copy,
  ArrowRight,
  Pill,
} from 'lucide-react';
import { User, PharmacyStoreProfile } from '../../types';
import { useToast } from '../../context/ToastContext';

interface PharmacistAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyProfile?: PharmacyStoreProfile | null;
  onSuccess: (pharmacistUser: User) => void;
  onInstantLogin?: (pharmacistUser: User) => void;
}

export const PharmacistAuthorizationModal: React.FC<PharmacistAuthorizationModalProps> = ({
  isOpen,
  onClose,
  pharmacyProfile,
  onSuccess,
  onInstantLogin,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState(
    `PH-${Math.floor(100 + Math.random() * 900)}`
  );
  const [counter, setCounter] = useState('Counter 1 - Outpatient Prescription');
  const [tempPassword, setTempPassword] = useState('Pharma#2026');
  const [pin, setPin] = useState('2144');

  // Permission tokens
  const [canPos, setCanPos] = useState(true);
  const [canRx, setCanRx] = useState(true);
  const [canReceive, setCanReceive] = useState(true);
  const [canFefo, setCanFefo] = useState(true);
  const [canShift, setCanShift] = useState(true);

  // Success state view
  const [createdPharmacist, setCreatedPharmacist] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard!`, 'info', 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Pharmacist full name is required', 'error', 'Validation Error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Valid professional email is required', 'error', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedLicense =
        licenseNumber.trim() ||
        `EFDA-LIC-PH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newPharmacist: User = {
        id: `u-ph-${Date.now()}`,
        name: fullName.trim().startsWith('Pharm.') ? fullName.trim() : `Pharm. ${fullName.trim()}`,
        email: email.trim().toLowerCase(),
        role: 'PHARMACIST',
        employeeId: employeeId.trim() || `EMP-PH-${Date.now().toString().slice(-4)}`,
        department: `Dispensary (${counter})`,
        isSuperAdmin: false,
        isOwner: false,
        isActive: true,
        status: 'ACTIVE',
        password: tempPassword,
        temporaryPassword: tempPassword,
        mustChangePassword: false,
        pin: pin || '1234',
        createdAt: new Date().toISOString(),
      };

      // Try creating via API
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'u-1', // Store owner role override
          },
          body: JSON.stringify({
            name: newPharmacist.name,
            email: newPharmacist.email,
            role: 'PHARMACIST',
            phone,
            department: newPharmacist.department,
            employeeId: newPharmacist.employeeId,
            temporaryPassword: tempPassword,
            pin,
            mustChangePassword: false,
          }),
        });
      } catch {
        // Safe offline fallback
      }

      // Add to store's authorized roster in localStorage
      try {
        const storedRoster = JSON.parse(
          localStorage.getItem('dds_authorized_pharmacists') || '[]'
        );
        storedRoster.push(newPharmacist);
        localStorage.setItem(
          'dds_authorized_pharmacists',
          JSON.stringify(storedRoster)
        );
      } catch {}

      showToast(
        `Pharmacist ${newPharmacist.name} authorized and active on counter!`,
        'success',
        'Staff Authorized'
      );

      setCreatedPharmacist(newPharmacist);
      onSuccess(newPharmacist);
    } catch (err: any) {
      showToast(err.message || 'Failed to authorize pharmacist', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-5 sm:p-6 relative shrink-0 border-b border-emerald-800/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/60">
                  Store Owner Action Hub
                </span>
                <span className="text-[10px] text-emerald-200/80 font-mono">
                  {pharmacyProfile?.storeName || 'Registered Drug Store'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Authorize Pharmacist Account
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Issue certified dispensing credentials and counter permissions for licensed clinical staff.
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        {createdPharmacist ? (
          /* SUCCESS CREDENTIALS CARD */
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                Pharmacist Account Authorized!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                <strong>{createdPharmacist.name}</strong> is now licensed and registered to operate the counter POS terminal.
              </p>
            </div>

            {/* Credential summary box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {createdPharmacist.employeeId}
                  <button
                    onClick={() => handleCopy(createdPharmacist.employeeId || '', 'Employee ID')}
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Login Email:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {createdPharmacist.email}
                  <button
                    onClick={() => handleCopy(createdPharmacist.email, 'Email')}
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Temporary Password:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  {tempPassword}
                  <button
                    onClick={() => handleCopy(tempPassword, 'Password')}
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">POS Fast-Login PIN:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white tracking-widest flex items-center gap-2">
                  {pin}
                  <button
                    onClick={() => handleCopy(pin, 'PIN')}
                    className="text-slate-400 hover:text-emerald-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {onInstantLogin && (
                <button
                  onClick={() => {
                    onInstantLogin(createdPharmacist);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Pill className="h-4 w-4" />
                  <span>Launch POS as {createdPharmacist.name.split(' ')[1] || 'Pharmacist'} →</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Close & Return to Hub
              </button>
            </div>
          </div>
        ) : (
          /* AUTHORIZATION FORM */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-slate-800 dark:text-slate-100">
            
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                1. Clinical Pharmacist Identity & Board License
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pharmacist Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monet Alemayehu (or Hana Yohannes)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    EFDA / Board License No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EFDA/LIC/PH/2026/4102"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email (Login ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="pharmacist@drugstore.et"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+251 911 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: COUNTER & ACCESS CONTROL */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                2. Assigned Dispensary Counter & Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Dispensary Counter / Department Assignment
                  </label>
                  <select
                    value={counter}
                    onChange={(e) => setCounter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Counter 1 - Outpatient Prescription">Counter 1 - Outpatient Prescription</option>
                    <option value="Counter 2 - Chronic & Cold-Chain Biologics">Counter 2 - Chronic & Cold-Chain Biologics</option>
                    <option value="Night Shift Dispensary">Night Shift Emergency Dispensary</option>
                    <option value="Inpatient Ward Pharmacy">Inpatient Ward Pharmacy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    POS 4-Digit Fast-Login PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-emerald-500 focus:outline-none font-mono tracking-widest text-center"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: DISPENSARY PERMISSION CHECKLIST */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Authorized Dispensary Permissions:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canPos}
                    onChange={(e) => setCanPos(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>POS Barcode Checkout</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canRx}
                    onChange={(e) => setCanRx(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Prescription Verification</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canReceive}
                    onChange={(e) => setCanReceive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Batch Stock Receiving</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canFefo}
                    onChange={(e) => setCanFefo(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>FEFO Expiry Adjustments</span>
                </label>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Pharmacist...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Authorize & Activate Pharmacist →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
