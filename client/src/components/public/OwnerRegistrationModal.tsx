import React, { useState } from 'react';
import {
  X,
  Store,
  User,
  ShieldCheck,
  Building2,
  MapPin,
  Lock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
  Zap,
} from 'lucide-react';
import { PharmacyOwnerRegistration, PharmacyStoreProfile, User as UserType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { usePortalContent } from '../../context/PortalContentContext';
import { safeFetchJson } from '../../utils/api';
import { PostRegistrationLaunchpad } from './PostRegistrationLaunchpad';

interface OwnerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ownerUser: UserType, pharmacyProfile: PharmacyStoreProfile) => void;
  onOpenPosTerminal?: () => void;
  onViewStorefront?: () => void;
}

const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Dire Dawa',
  'Oromia Region',
  'Amhara Region',
  'Sidama Region',
  'Tigray Region',
  'Somali Region',
  'SNNPR / South Ethiopia',
  'Harari Region',
  'Afar Region',
  'Benishangul-Gumuz',
  'Gambella Region',
  'South West Ethiopia',
];

const ADDIS_SUBCITIES = [
  'Bole Subcity',
  'Kirkos Subcity',
  'Yeka Subcity',
  'Arada Subcity',
  'Lideta Subcity',
  'Nifas Silk-Lafto Subcity',
  'Kolfe Keranio Subcity',
  'Gulele Subcity',
  'Addis Ketema Subcity',
  'Akaki Kality Subcity',
  'Lemi Kura Subcity',
];

export const OwnerRegistrationModal: React.FC<OwnerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenPosTerminal,
  onViewStorefront,
}) => {
  const { showToast } = useToast();
  const { updateContent } = usePortalContent();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Post-Registration Registered State
  const [registeredResult, setRegisteredResult] = useState<{
    user: UserType;
    pharmacy: PharmacyStoreProfile;
  } | null>(null);

  // Streamlined Registration Form State
  const [formData, setFormData] = useState<PharmacyOwnerRegistration>({
    // 1. Account & Owner Essentials
    ownerTitle: 'Licensed Pharmacist / Director',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerSecondaryPhone: '',
    ownerNationalId: 'ETH-ID-VERIFIED',
    ownerPharmacistLicense: '',
    ownerPharmacistLicenseExpiry: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    password: '',
    confirmPassword: '',
    pin: '1234',

    // 2. Pharmacy Essentials
    storeName: '',
    storeNameAmharic: '',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: '',
    efdaLicense: '',
    efdaLicenseExpiry: '',
    tradeLicenseNumber: '',
    vatTotType: 'VAT_15',
    vatNumber: '',
    storeSlogan: 'Your Trusted Healthcare & Medication Partner',

    // 3. Location Essentials
    city: 'Addis Ababa',
    subcity: 'Bole Subcity',
    woreda: 'Woreda 03',
    kebele: 'Kebele 02',
    houseNumber: '',
    streetAddress: '',
    landmark: '',
    gpsCoordinates: '',
    storePhone: '',
    storeEmail: '',
    operatingHours: 'Open 24/7 (365 Days Emergency Service)',
    is24Hours: true,
    coldChainAvailable: true,
    deliveryAvailable: true,

    // 4. Financial & Defaults
    logoUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80',
    telebirrMerchantId: '',
    cbeAccountNumber: '',
    cbeAccountName: '',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '',
    openingCashFloat: 2500,
    receiptFooterMessage: 'Thank you for choosing our pharmacy! Keep medications below 25°C.',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (field: keyof PharmacyOwnerRegistration, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFillDemoData = () => {
    setFormData((prev) => ({
      ...prev,
      ownerName: 'Dr. Yohannes Tadesse',
      ownerEmail: `yohannes.${Date.now().toString().slice(-4)}@selampharmacy.et`,
      ownerPhone: '+251 911 456 789',
      password: 'Password123!',
      storeName: 'Selam Community Pharmacy',
      storeNameAmharic: 'ሰላም መድኃኒት ቤት',
      tinNumber: '0049281745',
      efdaLicense: 'EFDA/MED/AA/2026/8942',
      city: 'Addis Ababa',
      subcity: 'Bole Subcity',
      streetAddress: 'Bole Medhanealem Road, Ground Floor',
      telebirrMerchantId: 'TB-MERCHANT-8829',
    }));
    setFormErrors({});
    showToast('Fast sample data loaded! Ready to submit.', 'info', 'Quick Fill');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    if (!formData.tinNumber.trim()) {
      errors.tinNumber = 'TIN number is required (8-10 digits)';
    } else if (formData.tinNumber.trim().length < 8) {
      errors.tinNumber = 'TIN must be at least 8-10 digits';
    }
    if (!formData.streetAddress.trim()) {
      errors.streetAddress = 'Location/Address is required';
    }
    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner full name is required';
    }
    if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes('@')) {
      errors.ownerEmail = 'Valid email is required (used to sign in)';
    }
    if (!formData.ownerPhone.trim()) {
      errors.ownerPhone = 'Phone number is required';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill in the required fields highlighted in red.', 'error', 'Missing Information');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await safeFetchJson('/api/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.success && response.data) {
        const { user, pharmacy } = response.data;

        // Update live branding
        updateContent({
          storeName: pharmacy.storeName,
          efdaLicense: pharmacy.efdaLicense || formData.efdaLicense,
          primaryPhone: pharmacy.phone || pharmacy.ownerPhone,
          primaryEmail: pharmacy.email || pharmacy.ownerEmail,
          flagshipAddress: `${pharmacy.streetAddress}, ${pharmacy.subcity || ''}, ${pharmacy.city}`,
          flagshipHours: pharmacy.operatingHours,
          heroTitlePrefix: pharmacy.storeName.split(' ')[0] || 'Pharmacy',
          heroTitleHighlight: pharmacy.storeName.split(' ').slice(1).join(' ') || 'Drug Store',
        });

        showToast(
          `Drug store "${pharmacy.storeName}" registered successfully!`,
          'success',
          'Registration Complete'
        );

        onSuccess(user, pharmacy);
        onClose();
      } else {
        showToast(
          response.message || 'Failed to register pharmacy. Please check your inputs.',
          'error',
          'Registration Failed'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred during registration.', 'error', 'Network Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* POST-REGISTRATION LAUNCHPAD FALLBACK */}
        {registeredResult ? (
          <div className="p-6 sm:p-8">
            <PostRegistrationLaunchpad
              ownerUser={registeredResult.user}
              pharmacyProfile={registeredResult.pharmacy}
              onLaunchDashboard={() => {
                onClose();
                onSuccess(registeredResult.user, registeredResult.pharmacy);
              }}
              onLaunchPos={() => {
                onClose();
                if (onOpenPosTerminal) {
                  onOpenPosTerminal();
                } else {
                  onSuccess(registeredResult.user, registeredResult.pharmacy);
                }
              }}
              onViewStorefront={() => {
                onClose();
                if (onViewStorefront) {
                  onViewStorefront();
                }
              }}
            />
          </div>
        ) : (
          <>
            {/* Top Clean Header */}
            <div className="bg-[#0060df] text-white p-5 sm:p-6 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-between gap-3 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Register Pharmacy / Drug Store
                    </h2>
                    <p className="text-xs text-sky-100">
                      Simple 1-step registration to start managing your store.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFillDemoData}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>Quick Fill</span>
                </button>
              </div>
            </div>

            {/* Simple Unified Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto space-y-5">
              
              {/* SECTION 1: PHARMACY INFO */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0060df] uppercase tracking-wider">
                  <Building2 className="h-4 w-4" />
                  <span>1. Pharmacy Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pharmacy Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pharmacy / Drug Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Selam Community Pharmacy"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.storeName ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.storeName && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.storeName}</p>
                    )}
                  </div>

                  {/* TIN Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      TIN Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="e.g. 0049281745"
                      value={formData.tinNumber}
                      onChange={(e) => handleInputChange('tinNumber', e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.tinNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.tinNumber && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.tinNumber}</p>
                    )}
                  </div>

                  {/* Establishment Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Store Type
                    </label>
                    <select
                      value={formData.storeType}
                      onChange={(e) => handleInputChange('storeType', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0060df] focus:outline-none"
                    >
                      <option value="COMMUNITY_DRUG_STORE">Community Drug Store (ደረጃ 1/2)</option>
                      <option value="RETAIL_PHARMACY">Retail Pharmacy (ሙሉ ፋርማሲ)</option>
                      <option value="WHOLESALE_DISPENSARY">Wholesale & Distribution</option>
                      <option value="SPECIALTY_PHARMACY">Specialty Clinic Pharmacy</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LOCATION */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0060df] uppercase tracking-wider">
                  <MapPin className="h-4 w-4" />
                  <span>2. Location & Address</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0060df] focus:outline-none"
                    >
                      {ETHIOPIAN_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subcity / Zone
                    </label>
                    {formData.city === 'Addis Ababa' ? (
                      <select
                        value={formData.subcity}
                        onChange={(e) => handleInputChange('subcity', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0060df] focus:outline-none"
                      >
                        {ADDIS_SUBCITIES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Zone / Subcity name"
                        value={formData.subcity}
                        onChange={(e) => handleInputChange('subcity', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#0060df] focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Physical Street Address / Building <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bole Medhanealem Road, Sunshine Plaza Ground Floor"
                      value={formData.streetAddress}
                      onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.streetAddress ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.streetAddress && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.streetAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: OWNER / ADMIN CREDENTIALS */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0060df] uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  <span>3. Owner Login & Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Owner / Manager Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Yohannes Tadesse"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.ownerName ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.ownerName && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.ownerName}</p>
                    )}
                  </div>

                  {/* Email (Sign in user) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@pharmacy.et"
                      value={formData.ownerEmail}
                      onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.ownerEmail ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.ownerEmail && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.ownerEmail}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+251 911 234 567"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        formErrors.ownerPhone ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#0060df] focus:outline-none`}
                    />
                    {formErrors.ownerPhone && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.ownerPhone}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password (min. 6 characters) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border ${
                          formErrors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-200 dark:border-slate-700'
                        } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-[#0060df] focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.password}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* TOGGLE OPTIONAL DETAILS (EFDA License, Telebirr, Amharic Name) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0060df] transition cursor-pointer"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} />
                  <span>{showOptionalFields ? 'Hide optional settings' : '+ Add optional EFDA license & Telebirr details'}</span>
                </button>

                {showOptionalFields && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        EFDA Facility License No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. EFDA/MED/AA/2026/8942"
                        value={formData.efdaLicense}
                        onChange={(e) => handleInputChange('efdaLicense', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Amharic Name (የንግድ ስም)
                      </label>
                      <input
                        type="text"
                        placeholder="ለምሳሌ፡ ሰላም መድኃኒት ቤት"
                        value={formData.storeNameAmharic || ''}
                        onChange={(e) => handleInputChange('storeNameAmharic', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Telebirr Merchant ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TB-MERCHANT-8829"
                        value={formData.telebirrMerchantId || ''}
                        onChange={(e) => handleInputChange('telebirrMerchantId', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        POS Quick PIN (4 Digits)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="1234"
                        value={formData.pin || ''}
                        onChange={(e) => handleInputChange('pin', e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0060df] hover:bg-[#0050bc] text-white text-xs font-black transition shadow-md shadow-[#0060df]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Creating Pharmacy Account...</span>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Complete Registration & Open Store</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </>
        )}
      </div>
    </div>
  );
};
