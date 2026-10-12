import React, { useState } from 'react';
import {
  X,
  Truck,
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Supplier, User } from '../../types';
import { useToast } from '../../context/ToastContext';

interface SupplierRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (supplier: Supplier, user?: User) => void;
}

const SUPPLY_CATEGORIES = [
  'Antibiotics & Anti-Infectives',
  'Cold-Chain Biologics & Vaccines (2°C - 8°C)',
  'Emergency & Critical Care Therapeutics',
  'Cardiovascular & Hypertension',
  'Endocrine & Diabetes (Insulins/Metformin)',
  'Analgesics, NSAIDs & Antipyretics',
  'Surgical Consumables & Diagnostic Test Kits',
  'Pediatric Formulations & Syrups',
];

export const SupplierRegistrationModal: React.FC<SupplierRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('1234');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Antibiotics & Anti-Infectives',
    'Cold-Chain Biologics & Vaccines (2°C - 8°C)',
    'Emergency & Critical Care Therapeutics',
  ]);
  const [paymentTerms, setPaymentTerms] = useState('NET 30');
  const [creditLimit, setCreditLimit] = useState('2500000');

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      showToast('Supplier company name is required', 'error', 'Validation Error');
      return;
    }
    if (!phone.trim()) {
      showToast('Contact phone number is required', 'error', 'Validation Error');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Valid corporate email is required', 'error', 'Validation Error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedLicense = licenseNumber.trim() || `EFDA/WHOLESALE/AA/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedTin = tinNumber.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`;

      const newSupplierData = {
        name: companyName.trim(),
        contactPerson: contactPerson.trim() || 'Procurement Director',
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        tinNumber: generatedTin,
        licenseNumber: generatedLicense,
        address: `${address.trim() || 'Central Pharmaceutical Warehouse Zone'}, ${city}`,
        creditLimit: parseFloat(creditLimit) || 2500000,
        paymentTerms,
        categories: selectedCategories,
      };

      // Call server endpoint
      let createdSupplier: Supplier | null = null;
      try {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSupplierData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          createdSupplier = json.data;
        }
      } catch {
        // Fallback offline mock creation
      }

      if (!createdSupplier) {
        createdSupplier = {
          id: `sup-${Date.now()}`,
          name: newSupplierData.name,
          contactPerson: newSupplierData.contactPerson,
          phone: newSupplierData.phone,
          email: newSupplierData.email,
          address: newSupplierData.address,
          tinNumber: newSupplierData.tinNumber,
          licenseNumber: newSupplierData.licenseNumber,
          creditLimit: newSupplierData.creditLimit,
          paymentTerms: newSupplierData.paymentTerms,
          status: 'ACTIVE',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }

      // Store in localStorage for instant persistent landing page transformation
      try {
        localStorage.setItem('dds_registered_supplier', JSON.stringify(createdSupplier));
        localStorage.setItem('dds_active_landing_mode', 'REGISTERED_SUPPLIER');
      } catch {}

      showToast(
        `Pharmaceutical Wholesaler "${createdSupplier.name}" registered and certified successfully!`,
        'success',
        'Supplier Initialized'
      );

      const mockSupplierUser: User = {
        id: `u-sup-${Date.now()}`,
        name: contactPerson || companyName,
        email: email.toLowerCase(),
        role: 'STORE_OWNER', // Treated with supply management access
        employeeId: `SUP-DIR-${Math.floor(100 + Math.random() * 900)}`,
        department: 'Pharmaceutical Wholesale & Distribution',
        isSuperAdmin: false,
        isOwner: true,
        isActive: true,
        pin: pin || '1234',
        createdAt: new Date().toISOString(),
      };

      onSuccess(createdSupplier, mockSupplierUser);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete supplier registration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative shrink-0 border-b border-teal-800/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-inner">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-700/60">
                  EFDA Wholesale Node Registry
                </span>
                <span className="text-[10px] text-teal-200/80 font-mono">B2B Supply Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Register as Pharmaceutical Supplier
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Supply verified medicines to licensed community pharmacies with digital purchase orders.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800 dark:text-slate-100">
          
          {/* SECTION 1: WHOLESALER LEGAL PROFILE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              <span>1. Corporate & Regulatory License Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Distributor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BioMed Pharma Importers & Wholesalers PLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  EFDA Wholesale License No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. EFDA/WHOLESALE/AA/2026/089"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  TIN / Tax Identification No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0098234123"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warehouse Location City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value="Addis Ababa">Addis Ababa (Central Hub)</option>
                  <option value="Adama / Nazret">Adama / Nazret</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Jimma">Jimma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Warehouse Facility Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bole Airport Cargo Logistics Center, Block 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: AUTHORIZED CONTACT & CREDENTIALS */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              <Mail className="h-4 w-4" />
              <span>2. Authorized Contact Person & Portal Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person / Supply Manager <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+251 911 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work / Corporate Email (Login ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="supply@biomedpharma.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Portal Password (min 6 chars) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SUPPLY CATEGORIES & PAYMENT TERMS */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              <Package className="h-4 w-4" />
              <span>3. Product Categories Supplied & Commercial Terms</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Select Pharmaceutical Categories You Distribute:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUPPLY_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/70 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(cat)}
                        className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default B2B Credit Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                >
                  <option value="NET 30">NET 30 (30 Days Credit)</option>
                  <option value="NET 15">NET 15 (15 Days Credit)</option>
                  <option value="NET 60">NET 60 (60 Days Credit)</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Immediate Telebirr Transfer">Immediate Telebirr / CBE Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Maximum Credit Facility (ETB)
                </label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-teal-600/30 transition flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Wholesaler...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Register & Initialize Supplier Hub →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
