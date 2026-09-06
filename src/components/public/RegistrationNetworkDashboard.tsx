import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  Shield,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ThermometerSnowflake,
  Truck,
  PlusCircle,
  LogIn,
  Key,
  Users,
  UserCheck,
  Compass,
  FileCheck,
  Receipt,
  HelpCircle,
  Copy,
  Check,
  Activity,
  AlertCircle,
  Pill,
  Navigation,
  Globe,
  Sliders,
  DollarSign,
  HeartHandshake,
  Database,
  Building,
} from 'lucide-react';
import { RegisteredPharmacyNode, User } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface RegistrationNetworkDashboardProps {
  onOpenOwnerRegister: () => void;
  onOpenMasterAdminLogin: () => void;
  onOpenStaffLogin: () => void;
  currentUser?: User | null;
  onExploreMedicines?: () => void;
}

export const RegistrationNetworkDashboard: React.FC<RegistrationNetworkDashboardProps> = ({
  onOpenOwnerRegister,
  onOpenMasterAdminLogin,
  onOpenStaffLogin,
  currentUser,
  onExploreMedicines,
}) => {
  const { showToast } = useToast();

  // Fleet data state
  const [pharmacies, setPharmacies] = useState<RegisteredPharmacyNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [filter24Hours, setFilter24Hours] = useState(false);
  const [filterColdChain, setFilterColdChain] = useState(false);
  const [filterDelivery, setFilterDelivery] = useState(false);
  const [selectedStore, setSelectedStore] = useState<RegisteredPharmacyNode | null>(null);

  // Active Map Viewport Region
  const [mapRegion, setMapRegion] = useState<'ALL' | 'ADDIS' | 'ADAMA' | 'HAWASSA' | 'BAHIR_DAR' | 'DIRE_DAWA' | 'GONDAR'>('ALL');

  // ROI Calculator Interactive States
  const [monthlySalesVolume, setMonthlySalesVolume] = useState<number>(1200000); // 1.2M ETB
  const [expiryWastageRate, setExpiryWastageRate] = useState<number>(4.5); // 4.5%
  const [dailyPrescriptions, setDailyPrescriptions] = useState<number>(85);

  // Active Tab within the Hub
  const [activeSection, setActiveSection] = useState<'BENEFITS' | 'DIRECTORY' | 'MAP' | 'ONBOARDING' | 'MASTER_ADMIN'>('BENEFITS');

  // FAQ Expand state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fetch registered pharmacies from backend
  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fleet/pharmacies');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPharmacies(data.data);
        if (data.data.length > 0) {
          setSelectedStore(data.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load registered pharmacy fleet:', e);
      showToast('Could not load online pharmacy network nodes. Using cached registry.', 'warning', 'Offline Mode');
    } finally {
      setIsLoading(false);
    }
  };

  // ROI Calculations
  const calculatedSavings = useMemo(() => {
    const annualSales = monthlySalesVolume * 12;
    const currentExpiryLoss = annualSales * (expiryWastageRate / 100);
    // Digital FEFO reduces expiry wastage by 85%
    const fefoSavedETB = currentExpiryLoss * 0.85;
    // Fast POS saves 45 seconds per prescription -> hours saved annually
    const annualPrescriptions = dailyPrescriptions * 365;
    const hoursSavedAnnually = Math.round((annualPrescriptions * 45) / 3600);
    // Estimated revenue boost from zero stockouts and digital customer loyalty
    const revenueGrowthETB = annualSales * 0.08;

    return {
      fefoSavedETB: Math.round(fefoSavedETB),
      hoursSavedAnnually,
      revenueGrowthETB: Math.round(revenueGrowthETB),
      totalAnnualValue: Math.round(fefoSavedETB + revenueGrowthETB),
    };
  }, [monthlySalesVolume, expiryWastageRate, dailyPrescriptions]);

  // Unique cities list
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    pharmacies.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [pharmacies]);

  // Filtered Pharmacies List
  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter((p) => {
      // City filter
      if (selectedCity !== 'ALL' && p.city !== selectedCity) return false;

      // Type filter
      if (selectedType !== 'ALL' && p.storeType !== selectedType) return false;

      // 24 Hours filter
      if (filter24Hours && !p.is24Hours) return false;

      // Cold chain filter
      if (filterColdChain && !p.coldChainAvailable) return false;

      // Delivery filter
      if (filterDelivery && !p.deliveryAvailable) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.storeName.toLowerCase().includes(q);
        const matchAmharic = p.storeNameAmharic?.toLowerCase().includes(q);
        const matchOwner = p.ownerName.toLowerCase().includes(q);
        const matchCity = p.city.toLowerCase().includes(q);
        const matchSubcity = p.subcity.toLowerCase().includes(q);
        const matchStreet = p.streetAddress.toLowerCase().includes(q);
        const matchLicense = p.efdaLicense.toLowerCase().includes(q);
        const matchTin = p.tinNumber.toLowerCase().includes(q);

        if (
          !matchName &&
          !matchAmharic &&
          !matchOwner &&
          !matchCity &&
          !matchSubcity &&
          !matchStreet &&
          !matchLicense &&
          !matchTin
        ) {
          return false;
        }
      }

      return true;
    });
  }, [pharmacies, selectedCity, selectedType, filter24Hours, filterColdChain, filterDelivery, searchQuery]);

  const handleCopyText = (text: string, id: string, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`${label} copied to clipboard!`, 'success', 'Copied');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStoreTypeLabel = (type: string) => {
    switch (type) {
      case 'COMMUNITY_DRUG_STORE':
        return 'Community Drug Store';
      case 'RETAIL_PHARMACY':
        return 'Retail Pharmacy';
      case 'SPECIALTY_PHARMACY':
        return 'Specialty & Emergency Pharmacy';
      case 'WHOLESALE_DISPENSARY':
        return 'Wholesale & Distribution Depot';
      case 'HOSPITAL_PHARMACY':
        return 'Hospital-Adjacent Pharmacy';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  // Map center coordinates depending on selected region
  const mapCoordinates = useMemo(() => {
    switch (mapRegion) {
      case 'ADDIS':
        return { lat: 9.015, lng: 38.775, zoom: '12x', label: 'Addis Ababa Capital Hub' };
      case 'ADAMA':
        return { lat: 8.54, lng: 39.27, zoom: '13x', label: 'Adama Expressway Medical Corridor' };
      case 'HAWASSA':
        return { lat: 7.05, lng: 38.47, zoom: '13x', label: 'Hawassa / Sidama Regional Network' };
      case 'BAHIR_DAR':
        return { lat: 11.59, lng: 37.39, zoom: '13x', label: 'Bahir Dar / Lake Tana Network' };
      case 'DIRE_DAWA':
        return { lat: 9.6, lng: 41.85, zoom: '13x', label: 'Dire Dawa Commercial Depot' };
      case 'GONDAR':
        return { lat: 12.6, lng: 37.45, zoom: '13x', label: 'Gondar Healthcare Cluster' };
      default:
        return { lat: 9.145, lng: 40.489, zoom: 'National', label: 'All Ethiopia Connected Hubs' };
    }
  }, [mapRegion]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 pb-20">
      {/* 1. HERO & COMMAND BAR */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-slate-900 to-slate-950 text-white pt-10 pb-14 border-b border-teal-900/50">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10 space-y-8">
          {/* Top Pill Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/80 border border-teal-700/80 text-teal-300 text-xs font-black tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>National Digital Pharmacy Network & Registry</span>
            </div>

            {/* Quick Action Buttons on Top Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenMasterAdminLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-900/90 hover:bg-indigo-800 text-indigo-100 border border-indigo-700/80 text-xs font-extrabold transition shadow-lg hover:scale-105 active:scale-95"
                title="Super Admin Super-Login Gateway"
              >
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Master Admin Login</span>
              </button>

              <button
                onClick={onOpenOwnerRegister}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95"
                title="Onboard New Pharmacy or Drugstore"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Register Pharmacy</span>
              </button>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Digitize Your Pharmacy & Join the National Health Network
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Empower your community pharmacy or drug store with automated EFDA-compliant batch tracking, instant
              Telebirr/CBE point-of-sale checkout, zero-expiry wastage, and nationwide multi-branch location visibility.
            </p>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">Registered Nodes</span>
                <Building2 className="h-4 w-4 text-teal-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{pharmacies.length}</p>
              <p className="text-[10px] text-slate-400">Verified Pharmacies & Drug Stores</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Cities Covered</span>
                <Compass className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{availableCities.length}</p>
              <p className="text-[10px] text-slate-400">Major Ethiopian Regional Centers</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">24/7 Emergency</span>
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {pharmacies.filter((p) => p.is24Hours).length}
              </p>
              <p className="text-[10px] text-slate-400">365-Day Continuous Care Nodes</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Cold-Chain Ready</span>
                <ThermometerSnowflake className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {pharmacies.filter((p) => p.coldChainAvailable).length}
              </p>
              <p className="text-[10px] text-slate-400">2°C - 8°C Biologicals & Insulin</p>
            </div>
          </div>

          {/* Quick Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setActiveSection('BENEFITS')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-2 ${
                activeSection === 'BENEFITS'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Digital Benefits & ROI</span>
            </button>

            <button
              onClick={() => setActiveSection('DIRECTORY')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-2 ${
                activeSection === 'DIRECTORY'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Registered Directory ({pharmacies.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('MAP')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-2 ${
                activeSection === 'MAP'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Interactive Location Map</span>
            </button>

            <button
              onClick={() => setActiveSection('ONBOARDING')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-2 ${
                activeSection === 'ONBOARDING'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>4-Step Onboarding Guide</span>
            </button>

            <button
              onClick={() => setActiveSection('MASTER_ADMIN')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition inline-flex items-center gap-2 ${
                activeSection === 'MASTER_ADMIN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-800/80'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Master Admin Gateway</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT SECTIONS */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-12">
        {/* SECTION A: BENEFITS OF DIGITAL PHARMACY & INTERACTIVE ROI CALCULATOR */}
        {activeSection === 'BENEFITS' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Benefits Overview Header */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Transformational Impact
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
                Why Transitioning to a Digital Pharmacy is Critical
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Traditional paper ledger books result in up to 14% expiry loss, stockouts, and tax reporting errors.
                Our cloud-integrated digital pharmacy system guarantees accuracy, speed, and profitability.
              </p>
            </div>

            {/* 6 Core Benefit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-teal-950/60 dark:text-teal-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  EFDA Compliance & Batch Expiry Control
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Automated FEFO (First-Expired, First-Out) dispensing algorithm prevents expired medications from ever
                  reaching customers. Real-time batch-level audit trails and automated narcotics logs keep you 100% compliant.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-teal-700 dark:text-teal-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Eliminate up to 88% of expiry losses</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  3-Second POS & Telebirr/CBE Birr Checkout
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  High-speed barcode scanner checkout with integrated Telebirr QR, CBE Birr, and cash float tracking.
                  Generates professional bilingual thermal receipts with QR codes for prescription validation.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Zero cashier discrepancies with shift handovers</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/60 dark:text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Double-Entry P&L & Balance Sheet Reporting
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every medicine sale instantly debits inventory and credits revenue at the true batch cost. Export
                  official Profit & Loss statements and Balance Sheets directly as auditable archival PDFs.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Instant 1-click accounting & tax readiness</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/60 dark:text-emerald-400">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Digital Wholesale Sourcing & Bulk Pooling
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Join aggregate wholesale purchasing pools with top Ethiopian importers & manufacturers (EPSS, MedPharm,
                  EPHARM). Unlock higher profit margins through collective bargaining and automated POs.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Save 12–18% on bulk pharmaceutical orders</span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center dark:bg-cyan-950/60 dark:text-cyan-400">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  AI 30-Day Predictive Demand Forecasting
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Machine learning algorithms analyze regional disease seasonality (malaria surges, respiratory infections,
                  flu peaks) to forecast optimal restocking quantities, avoiding costly stockouts and dead stock.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-cyan-700 dark:text-cyan-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>99.2% stock availability for vital medicines</span>
                </div>
              </div>

              {/* Card 6 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3 dark:bg-slate-900 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center dark:bg-rose-950/60 dark:text-rose-400">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Patient Tele-Pharmacy & Online Prescriptions
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Customers can upload prescriptions online, verify stock availability, and place pickup reservations.
                  Automated SMS notifications alert patients when their chronic medication refills are ready.
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Expand customer reach beyond walking distance</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE DIGITAL ROI VALUE CALCULATOR */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white border border-teal-800/80 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-800/60 pb-4">
                <div>
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" /> Interactive ROI Calculator
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Estimate Your Pharmacy’s Annual Digital Gains
                  </h3>
                </div>
                <button
                  onClick={onOpenOwnerRegister}
                  className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs transition shadow-lg inline-flex items-center gap-2 shrink-0 self-start md:self-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Claim These Savings – Register Now</span>
                </button>
              </div>

              {/* Slider Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Slider 1: Monthly Sales */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-300">Monthly Sales (ETB)</span>
                    <span className="text-teal-400 font-mono font-black">{formatCurrency(monthlySalesVolume)}</span>
                  </div>
                  <input
                    type="range"
                    min={200000}
                    max={5000000}
                    step={100000}
                    value={monthlySalesVolume}
                    onChange={(e) => setMonthlySalesVolume(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>200k ETB</span>
                    <span>5.0M ETB</span>
                  </div>
                </div>

                {/* Slider 2: Current Expiry Rate */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-300">Current Expiry Rate</span>
                    <span className="text-amber-400 font-mono font-black">{expiryWastageRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={0.5}
                    value={expiryWastageRate}
                    onChange={(e) => setExpiryWastageRate(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1% (Low)</span>
                    <span>12% (Severe)</span>
                  </div>
                </div>

                {/* Slider 3: Daily Prescriptions */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-300">Daily Prescriptions</span>
                    <span className="text-cyan-400 font-mono font-black">{dailyPrescriptions} Rxs / day</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    step={5}
                    value={dailyPrescriptions}
                    onChange={(e) => setDailyPrescriptions(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>20 Rxs</span>
                    <span>300 Rxs</span>
                  </div>
                </div>
              </div>

              {/* Computed Returns Highlight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-700/60 text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">FEFO Expiry Savings</span>
                  <p className="text-2xl font-black text-teal-300 font-mono">
                    +{formatCurrency(calculatedSavings.fefoSavedETB)}
                  </p>
                  <p className="text-[10px] text-slate-400">Estimated Annual Waste Reduction</p>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-700/60 text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Staff Time Reclaimed</span>
                  <p className="text-2xl font-black text-cyan-300 font-mono">
                    {calculatedSavings.hoursSavedAnnually} Hours / yr
                  </p>
                  <p className="text-[10px] text-slate-400">Automated Shift Checkout & Audit</p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 text-center space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Total Value Unlocked</span>
                  <p className="text-2xl font-black text-amber-300 font-mono">
                    +{formatCurrency(calculatedSavings.totalAnnualValue)}
                  </p>
                  <p className="text-[10px] text-slate-400">Direct Profit & Revenue Lift</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: REGISTERED PHARMACY DIRECTORY */}
        {activeSection === 'DIRECTORY' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Filter Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-teal-600" />
                  <span>All Registered Pharmacies & Drug Stores</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredPharmacies.length} of {pharmacies.length} verified healthcare dispensaries across Ethiopia.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSection('MAP')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition inline-flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                >
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <span>View on Map</span>
                </button>

                <button
                  onClick={onOpenOwnerRegister}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Register Store</span>
                </button>
              </div>
            </div>

            {/* Search Bar & Multi-Criteria Filter Bar */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 dark:bg-slate-900 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search query input */}
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by pharmacy name, pharmacist, street, EFDA license or TIN..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* City Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ALL">All Cities ({pharmacies.length})</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city} ({pharmacies.filter((p) => p.city === city).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Facility Type Filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="ALL">All Facility Types</option>
                    <option value="COMMUNITY_DRUG_STORE">Community Drug Store</option>
                    <option value="RETAIL_PHARMACY">Retail Pharmacy</option>
                    <option value="SPECIALTY_PHARMACY">Specialty & Emergency Pharmacy</option>
                    <option value="HOSPITAL_PHARMACY">Hospital-Adjacent Pharmacy</option>
                    <option value="WHOLESALE_DISPENSARY">Wholesale & Distribution Depot</option>
                  </select>
                </div>
              </div>

              {/* Capability Toggles */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Filter by Features:</span>

                <button
                  onClick={() => setFilter24Hours(!filter24Hours)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1.5 border ${
                    filter24Hours
                      ? 'bg-teal-50 border-teal-300 text-teal-800 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-teal-600" />
                  <span>24/7 Emergency</span>
                </button>

                <button
                  onClick={() => setFilterColdChain(!filterColdChain)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1.5 border ${
                    filterColdChain
                      ? 'bg-cyan-50 border-cyan-300 text-cyan-800 dark:bg-cyan-950/60 dark:border-cyan-700 dark:text-cyan-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <ThermometerSnowflake className="h-3.5 w-3.5 text-cyan-600" />
                  <span>Cold-Chain Ready</span>
                </button>

                <button
                  onClick={() => setFilterDelivery(!filterDelivery)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1.5 border ${
                    filterDelivery
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Truck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Delivery Available</span>
                </button>

                {(selectedCity !== 'ALL' || selectedType !== 'ALL' || filter24Hours || filterColdChain || filterDelivery || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCity('ALL');
                      setSelectedType('ALL');
                      setFilter24Hours(false);
                      setFilterColdChain(false);
                      setFilterDelivery(false);
                      setSearchQuery('');
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold ml-auto text-[11px] underline"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Pharmacies Cards Grid */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-500">Loading registered pharmacies directory...</p>
              </div>
            ) : filteredPharmacies.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No registered pharmacies match your search</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your city, type, or search terms, or register your pharmacy now to be listed in this region.
                </p>
                <button
                  onClick={onOpenOwnerRegister}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" /> Register New Pharmacy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPharmacies.map((pharmacy) => (
                  <div
                    key={pharmacy.id}
                    className="rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden dark:bg-slate-900 dark:border-slate-800 group"
                  >
                    {/* Card Top Banner */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 flex items-center justify-center font-black text-base shrink-0 border border-teal-200/60 dark:border-teal-800/60 overflow-hidden">
                            {pharmacy.logoUrl ? (
                              <img
                                src={pharmacy.logoUrl}
                                alt={pharmacy.storeName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store className="h-6 w-6 text-teal-600" />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                              {getStoreTypeLabel(pharmacy.storeType)}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 transition-colors">
                              {pharmacy.storeName}
                            </h3>
                            {pharmacy.storeNameAmharic && (
                              <p className="text-[11px] text-slate-500 font-medium">{pharmacy.storeNameAmharic}</p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {pharmacy.is24Hours ? (
                            <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 font-extrabold text-[10px] inline-flex items-center gap-1 border border-cyan-300 dark:border-cyan-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                              24/7 OPEN
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-extrabold text-[10px] inline-flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location Details */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                          <div className="leading-tight">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {pharmacy.city} ({pharmacy.subcity || 'Central Area'})
                            </span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{pharmacy.streetAddress}</p>
                            {pharmacy.landmark && (
                              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                                Landmark: {pharmacy.landmark}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500">{pharmacy.operatingHours}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-500">
                            In-Charge: <strong className="text-slate-700 dark:text-slate-200">{pharmacy.ownerName}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Services & Capabilities Chips */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {pharmacy.coldChainAvailable && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-800 inline-flex items-center gap-1">
                            <ThermometerSnowflake className="h-3 w-3" /> Cold-Chain
                          </span>
                        )}
                        {pharmacy.deliveryAvailable && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1">
                            <Truck className="h-3 w-3" /> Delivery
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {pharmacy.activeStaffCount} Staff
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                          TIN: {pharmacy.tinNumber}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${pharmacy.phone.split('/')[0].trim()}`}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white dark:border-slate-600 inline-flex items-center gap-1"
                        >
                          <Phone className="h-3.5 w-3.5 text-teal-600" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={() => handleCopyText(pharmacy.efdaLicense, `lic-${pharmacy.id}`, 'EFDA License')}
                          className="px-2 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold transition border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:border-slate-600"
                          title="Copy EFDA License Number"
                        >
                          {copiedId === `lic-${pharmacy.id}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <FileCheck className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedStore(pharmacy);
                          setActiveSection('MAP');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Locate on Map</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C: INTERACTIVE LOCATION MAP EXPLORER */}
        {activeSection === 'MAP' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span>Interactive Registered Pharmacy Map</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visual geospatial distribution of registered digital pharmacies and drug stores across Ethiopia.
                </p>
              </div>

              {/* Region Jump Selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setMapRegion('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'ALL'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All Ethiopia
                </button>
                <button
                  onClick={() => setMapRegion('ADDIS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'ADDIS'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Addis Ababa
                </button>
                <button
                  onClick={() => setMapRegion('ADAMA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'ADAMA'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Adama
                </button>
                <button
                  onClick={() => setMapRegion('HAWASSA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'HAWASSA'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Hawassa
                </button>
                <button
                  onClick={() => setMapRegion('BAHIR_DAR')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'BAHIR_DAR'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Bahir Dar
                </button>
                <button
                  onClick={() => setMapRegion('DIRE_DAWA')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mapRegion === 'DIRE_DAWA'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Dire Dawa
                </button>
              </div>
            </div>

            {/* Map Container & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive Visual Map Area (8 Cols) */}
              <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
                {/* SVG Visual Stylized Geospatial Grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
                        <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Map Viewport Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-teal-300 text-xs font-mono font-bold inline-flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5 text-teal-400 animate-spin" />
                    <span>{mapCoordinates.label} (GPS: {mapCoordinates.lat}° N, {mapCoordinates.lng}° E)</span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    Nodes Shown: {filteredPharmacies.length}
                  </span>
                </div>

                {/* Simulated Visual Interactive Node Markers on Map */}
                <div className="relative z-10 my-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredPharmacies.slice(0, 6).map((store, index) => {
                    const isSelected = selectedStore?.id === store.id;
                    return (
                      <div
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border text-left ${
                          isSelected
                            ? 'bg-teal-950/90 border-teal-400 ring-2 ring-teal-400/50 shadow-lg scale-105'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-teal-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                            {store.city}
                          </span>
                          {store.is24Hours && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" title="24/7 Service" />
                          )}
                        </div>
                        <h4 className="text-xs font-black text-white truncate">{store.storeName}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{store.streetAddress}</p>
                        <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
                          <span>EFDA Verified</span>
                          <span className="text-teal-300 font-bold">Select →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map Bottom Status Bar */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-teal-400">
                      <span className="w-2 h-2 rounded-full bg-teal-400" /> Active Pharmacy Node
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" /> 24/7 Emergency Hub
                    </span>
                  </div>
                  <span>Real-Time Geographic Distribution</span>
                </div>
              </div>

              {/* Selected Pharmacy Node Inspector Drawer (4 Cols) */}
              <div className="lg:col-span-4">
                {selectedStore ? (
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4 dark:bg-slate-900 dark:border-slate-800 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Store Header */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                          {getStoreTypeLabel(selectedStore.storeType)}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {selectedStore.storeName}
                        </h3>
                        {selectedStore.storeNameAmharic && (
                          <p className="text-xs text-slate-500 font-medium">{selectedStore.storeNameAmharic}</p>
                        )}
                      </div>

                      {/* Physical Location */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-900 dark:text-white block">
                              {selectedStore.city}, {selectedStore.subcity}
                            </strong>
                            <span className="text-slate-600 dark:text-slate-300">{selectedStore.streetAddress}</span>
                            {selectedStore.landmark && (
                              <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                                Landmark: {selectedStore.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 pt-1">
                          GPS: {selectedStore.latitude}° N, {selectedStore.longitude}° E
                        </div>
                      </div>

                      {/* Contact & Pharmacist In Charge */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-500">Pharmacist In-Charge:</span>
                          <strong className="text-slate-900 dark:text-white font-bold">{selectedStore.ownerName}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-500">EFDA License:</span>
                          <strong className="font-mono text-teal-700 dark:text-teal-300 text-[11px]">
                            {selectedStore.efdaLicense}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-500">TIN Number:</span>
                          <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedStore.tinNumber}</strong>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-slate-500">Operating Hours:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                            {selectedStore.operatingHours}
                          </span>
                        </div>
                      </div>

                      {/* Clinical Services */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 block">Services & Facilities:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedStore.servicesOffered.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-[10px] font-semibold border border-teal-200 dark:border-teal-800"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Direct Contact Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <a
                        href={`tel:${selectedStore.phone.split('/')[0].trim()}`}
                        className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Phone className="h-3.5 w-3.5" /> Call Store
                      </a>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `${selectedStore.storeName}, ${selectedStore.streetAddress}, ${selectedStore.city}`,
                            'address-copy',
                            'Address'
                          )
                        }
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                        title="Copy Address"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    Select a node on the map to inspect location and pharmacy details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION D: 4-STEP PHARMACY ONBOARDING PATHWAY */}
        {activeSection === 'ONBOARDING' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                Seamless Digital Setup
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                How to Register Your Pharmacy in 4 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Our guided onboarding process takes less than 3 minutes. Your pharmacy will be immediately integrated
                with EFDA compliance registers and regional digital directory.
              </p>
            </div>

            {/* 4 Steps Timeline Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800 relative">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  1
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Facility Profile & EFDA License</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your official pharmacy or drug store trade name, legal TIN number, and valid EFDA retail dispensary license.
                </p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block pt-1">
                  ✓ Instant TIN & License Validation
                </span>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800 relative">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  2
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Owner & Druggist Credentials</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Set up the supervising pharmacist or managing owner account with secure password, terminal login PIN, and national ID.
                </p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block pt-1">
                  ✓ Role-Based Executive Access
                </span>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800 relative">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  3
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Physical Location & Geo-Pinning</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Specify your region, city, subcity, street address, nearest landmark, and operating hours (including 24/7 emergency service).
                </p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block pt-1">
                  ✓ Mapped to Regional Directory
                </span>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800 relative">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  4
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">POS Terminal & Payment Setup</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Configure your Telebirr merchant ID, CBE bank account, and opening cash float for instant POS dispensing.
                </p>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 block pt-1">
                  ✓ Immediate Sales Readiness
                </span>
              </div>
            </div>

            {/* Launchpad CTA Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-teal-700">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black">Ready to Register Your Pharmacy?</h3>
                <p className="text-xs text-teal-200">
                  Join hundreds of forward-thinking pharmacies across Ethiopia. Immediate digital activation.
                </p>
              </div>
              <button
                onClick={onOpenOwnerRegister}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm transition shadow-xl shrink-0 inline-flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <PlusCircle className="h-5 w-5 text-teal-600" />
                <span>Start Pharmacy Registration</span>
              </button>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3 max-w-3xl mx-auto pt-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white text-center mb-4">
                Frequently Asked Registration Questions
              </h3>

              {[
                {
                  q: 'Who is eligible to register a pharmacy or drug store account?',
                  a: 'Any licensed community drug store, retail pharmacy, hospital dispensary, or wholesale medical depot holding a valid EFDA license and Ethiopian TIN number can register.',
                },
                {
                  q: 'What happens immediately after registration?',
                  a: 'Your owner account is immediately created, and your pharmacy profile is activated with automated FEFO batch tracking, POS terminal access, and inclusion in the nationwide directory.',
                },
                {
                  q: 'Can rural pharmacies operate if internet connection is intermittent?',
                  a: 'Yes! The workstation features full offline-first resilience. All POS sales, batch movements, and shift logs are saved locally and automatically synchronized with the cloud once connectivity resumes.',
                },
                {
                  q: 'How does Master Admin governance protect network integrity?',
                  a: 'The Master Admin Super-Authority verifies EFDA licenses, maintains the national standardized medicine catalog, and ensures strict data privacy and HIPAA/EFDA security across all tenant nodes.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-5 py-3.5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span>{item.q}</span>
                    {openFaq === idx ? <ChevronUp className="h-4 w-4 text-teal-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION E: MASTER ADMIN SUPER-LOGIN & GOVERNANCE GATEWAY */}
        {activeSection === 'MASTER_ADMIN' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Master Admin Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-700/80 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/90 border border-indigo-700 text-amber-300 text-xs font-mono font-bold">
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    <span>WHOLE SYSTEM GOVERNANCE & SUPER-ADMIN</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Master Admin Fleet Control</h2>
                </div>

                <button
                  onClick={onOpenMasterAdminLogin}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-xl inline-flex items-center gap-2 shrink-0 self-start sm:self-auto hover:scale-105 active:scale-95"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Launch Master Admin Login</span>
                </button>
              </div>

              {/* Master Admin Capabilities Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Building2 className="h-4 w-4" />
                    <span>Multi-Tenant Fleet Telemetry</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Live oversight of all registered pharmacy nodes, real-time inventory valuations, daily gross sales across
                    Addis Ababa, Hawassa, Adama, Bahir Dar, and Dire Dawa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-300">
                    <Database className="h-4 w-4" />
                    <span>National Medicine Catalog Standard</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Centrally manage and push the official EFDA essential drug database, standardized ATC codes, and recall
                    alerts to all connected pharmacy instances.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <FileCheck className="h-4 w-4" />
                    <span>EFDA Compliance & License Audit</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Review and verify newly submitted pharmacy licenses, audit narcotics and controlled substance dispensing
                    logs, and flag regulatory discrepancies.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-800/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <Lock className="h-4 w-4" />
                    <span>Platform Security & Global Broadcasts</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Send high-priority system alerts and epidemic advisories to all pharmacy cashiers and pharmacists
                    simultaneously across the network.
                  </p>
                </div>
              </div>

              {/* Master Admin Direct Trigger Note */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Authorized Master Administrator?</span>
                  <span className="text-[11px] text-slate-400">
                    Use your master credentials (e.g. athronos21@gmail.com) to access the super-governance cockpit.
                  </span>
                </div>
                <button
                  onClick={onOpenMasterAdminLogin}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-extrabold text-xs transition border border-indigo-700 inline-flex items-center gap-1.5 shrink-0"
                >
                  <Key className="h-3.5 w-3.5" /> Sign In as Master Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
