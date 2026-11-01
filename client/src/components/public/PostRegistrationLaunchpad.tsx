import React, { useState } from 'react';
import {
  CheckCircle2,
  Store,
  ShieldCheck,
  Printer,
  QrCode,
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  Download,
  ExternalLink,
  Package,
  Layers,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
  Award,
} from 'lucide-react';
import { PharmacyStoreProfile, User as UserType } from '../../types';
import { useToast } from '../../context/ToastContext';

interface PostRegistrationLaunchpadProps {
  ownerUser: UserType;
  pharmacyProfile: PharmacyStoreProfile;
  onLaunchDashboard: () => void;
  onLaunchPos?: () => void;
  onViewStorefront?: () => void;
}

export const PostRegistrationLaunchpad: React.FC<PostRegistrationLaunchpadProps> = ({
  ownerUser,
  pharmacyProfile,
  onLaunchDashboard,
  onLaunchPos,
  onViewStorefront,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'CERTIFICATE' | 'CHECKLIST' | 'RECEIPT'>('CERTIFICATE');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info', 'Copied');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Congratulatory Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
                  Node Successfully Registered
                </span>
                <span className="text-xs font-mono text-emerald-200/80">TIN: {pharmacyProfile.tinNumber}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome, {ownerUser.name}!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl mt-0.5">
                Your drug store <strong className="text-white underline decoration-emerald-400">{pharmacyProfile.storeName}</strong> is officially initialized with EFDA legal credentials and ready for digital dispensing.
              </p>
            </div>
          </div>

          {/* Quick Launch Button */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={onLaunchDashboard}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm transition shadow-lg hover:shadow-emerald-500/20 active:scale-98"
            >
              <span>Launch Owner Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {onLaunchPos && (
              <button
                onClick={onLaunchPos}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-300" />
                <span>Open POS Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CERTIFICATE'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Digital Certificate of Registration</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'CHECKLIST'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Quick-Start Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECEIPT')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'RECEIPT'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Printer className="h-3.5 w-3.5 text-blue-500" />
            <span>Fiscal Receipt Preview</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OFFICIAL DIGITAL CERTIFICATE OF REGISTRATION */}
      {activeTab === 'CERTIFICATE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <span>Official Pharmacy Registration Certificate</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized electronic registration certificate for compliance with Ethiopian Ministry of Health & EFDA standards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition border border-slate-300 dark:border-slate-700"
              >
                <Printer className="h-4 w-4 text-emerald-600" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>

          {/* Certificate Canvas Sheet */}
          <div className="relative rounded-3xl bg-amber-50/40 dark:bg-slate-900 border-4 border-double border-emerald-700/60 dark:border-emerald-600/40 p-6 sm:p-8 shadow-xl overflow-hidden">
            {/* Background Seal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10 pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-emerald-800" />
            </div>

            <div className="relative z-10 space-y-6">
              {/* Certificate Header */}
              <div className="text-center space-y-2 border-b border-emerald-200 dark:border-emerald-800/80 pb-5">
                <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                  <span>FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA</span>
                  <span>•</span>
                  <span>EFDA HEALTHCARE PORTAL</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
                  Certificate of Pharmacy & Drug Store Registration
                </h1>
                <p className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                  Registration Node Certificate ID: <strong className="font-bold">{pharmacyProfile.id}</strong>
                </p>
              </div>

              {/* Certificate Body Profile */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Store Logo & QR Code */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-center">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 p-1 bg-white shadow-md">
                    <img
                      src={pharmacyProfile.logoUrl}
                      alt="Store Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      {pharmacyProfile.storeName}
                    </h4>
                    {pharmacyProfile.storeNameAmharic && (
                      <p className="text-xs text-slate-500 font-bold">{pharmacyProfile.storeNameAmharic}</p>
                    )}
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                      {pharmacyProfile.storeType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* QR Code Mockup */}
                  <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-inner flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-950 p-1 rounded-lg flex items-center justify-center">
                      <QrCode className="w-full h-full text-white" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">
                      VERIFY: TIN-{pharmacyProfile.tinNumber}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="md:col-span-2 space-y-3 text-xs bg-white/70 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Managing Pharmacist / Owner
                      </span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">
                        {pharmacyProfile.ownerName}
                      </span>
                      <span className="text-[10.5px] text-slate-500 block mt-0.5">
                        {pharmacyProfile.ownerTitle || 'Licensed Pharmacist'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block">
                        Tax Identification (TIN)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-amber-950 dark:text-amber-200 text-sm">
                          {pharmacyProfile.tinNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pharmacyProfile.tinNumber, 'TIN')}
                          className="p-1 text-amber-700 hover:text-amber-900"
                        >
                          {copiedField === 'TIN' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        EFDA Facility License No.
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {pharmacyProfile.efdaLicense}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pharmacyProfile.efdaLicense, 'EFDA License')}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Copy EFDA License"
                        >
                          {copiedField === 'EFDA License' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Tax Category / VAT-TOT
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                        {pharmacyProfile.vatTotType ? pharmacyProfile.vatTotType.replace('_', ' ') : 'VAT 15% Registered'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Authorized Physical Store Address
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-xs block mt-0.5">
                        {pharmacyProfile.streetAddress}, {pharmacyProfile.subcity}, {pharmacyProfile.city}, Ethiopia
                      </span>
                      {pharmacyProfile.landmark && (
                        <span className="text-[10.5px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                          Landmark: {pharmacyProfile.landmark}
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Official Store Contacts
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                        {pharmacyProfile.phone}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Operating Hours
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {pharmacyProfile.operatingHours}
                      </span>
                    </div>
                  </div>

                  {/* Telebirr & CBE Payment Badges */}
                  {(pharmacyProfile.telebirrMerchantId || pharmacyProfile.cbeAccountNumber) && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
                      {pharmacyProfile.telebirrMerchantId && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-mono text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                          <span>Telebirr: {pharmacyProfile.telebirrMerchantId}</span>
                        </div>
                      )}
                      {pharmacyProfile.cbeAccountNumber && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-mono text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                          <Building2 className="h-3.5 w-3.5 text-purple-600" />
                          <span>CBE: {pharmacyProfile.cbeAccountNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Footer Seals */}
              <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      EFDA Electronic Verification Stamp
                    </span>
                    <span>Issued on {new Date(pharmacyProfile.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {pharmacyProfile.ownerName}
                  </span>
                  <span className="text-[10px]">Authorized Signature & Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUICK-START CHECKLIST */}
      {activeTab === 'CHECKLIST' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>Pharmacy Onboarding & Launch Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete these initial pharmacy operations tasks to start dispensing and selling immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist Item 1: Legal TIN & Store Identity */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                  Completed
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                1. Legal Store Identity & Fiscal TIN Active
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                TIN #{pharmacyProfile.tinNumber} and EFDA license #{pharmacyProfile.efdaLicense} are bound to all POS thermal receipts.
              </p>
            </div>

            {/* Checklist Item 2: Essential Medicines Catalog */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                2. Medication Inventory & Batch Tracking
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pre-populated with FEFO-managed Ethiopian essential drug formulary. Add stock batches or scan barcodes anytime in Inventory.
              </p>
            </div>

            {/* Checklist Item 3: POS Terminal & Cashier Station */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  Ready
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                3. Fast POS Checkout & Supervisor PIN
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your owner master PIN ({ownerUser.pin || '1234'}) is active for cashier drawer openings and price overrides.
              </p>
            </div>

            {/* Checklist Item 4: Customer Payments & Settlement */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  Configured
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                4. Telebirr & CBE Cash Settlement
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seamlessly accept Cash, Telebirr QR, and CBE transfers at POS with automated shift reconciliation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FISCAL RECEIPT PREVIEW */}
      {activeTab === 'RECEIPT' && (
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="h-5 w-5 text-emerald-600" />
                <span>Live POS Thermal Receipt Layout</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This is how printed receipts will look with your new pharmacy branding and TIN number.
              </p>
            </div>
          </div>

          <div className="flex justify-center p-6 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            {/* 80mm POS Thermal Receipt Paper Mockup */}
            <div className="w-full max-w-sm bg-white p-5 rounded-2xl shadow-xl border border-slate-200 font-mono text-xs text-slate-900 space-y-3">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto border border-slate-300 p-0.5">
                  <img src={pharmacyProfile.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="font-black text-sm uppercase tracking-tight text-slate-950">
                  {pharmacyProfile.storeName}
                </div>
                {pharmacyProfile.storeNameAmharic && (
                  <div className="text-[11px] font-bold text-slate-700">{pharmacyProfile.storeNameAmharic}</div>
                )}
                <div className="text-[10px] text-slate-500 leading-tight">
                  {pharmacyProfile.streetAddress}, {pharmacyProfile.subcity}, {pharmacyProfile.city}
                </div>
                <div className="text-[10px] text-slate-600 font-bold">Tel: {pharmacyProfile.phone}</div>
                <div className="text-[11px] font-black text-emerald-900 bg-emerald-50 py-0.5 px-2 rounded">
                  TIN: {pharmacyProfile.tinNumber} • EFDA: {pharmacyProfile.efdaLicense}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Receipt: #POS-2026-0001</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Cashier: {ownerUser.name}</span>
                <span>Terminal: MAIN-01</span>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Amoxicillin 500mg (20 Caps)</span>
                  <span>185.00 ETB</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Paracetamol 500mg (Strip)</span>
                  <span>45.00 ETB</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Subtotal:</span>
                  <span>230.00 ETB</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>VAT (15% Included):</span>
                  <span>30.00 ETB</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-200">
                  <span>TOTAL PAID:</span>
                  <span>230.00 ETB</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-700">{pharmacyProfile.receiptFooterMessage || 'Thank you for trusting our pharmacy!'}</p>
                <p>Keep medications in a dry, cool place below 25°C.</p>
                <p className="text-[9px] font-mono text-slate-400">Powered by Kaziniya Pharma OS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        {onViewStorefront && (
          <button
            type="button"
            onClick={onViewStorefront}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Public Customer Storefront</span>
          </button>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onLaunchDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition shadow-md active:scale-98"
          >
            <span>Proceed to Owner Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
