import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  MapPin,
  Building,
  PhoneCall,
  ThermometerSnowflake,
  Store,
  ShieldCheck,
  Sparkles,
  Search,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PrescriptionUploadModal } from './PrescriptionUploadModal';
import { StockReserveModal } from './StockReserveModal';
import { EmergencyGuideModal } from './EmergencyGuideModal';
import { ProfessionalHeroBackground } from './ProfessionalHeroBackground';
import { useToast } from '../../context/ToastContext';
import { usePortalContent } from '../../context/PortalContentContext';
import { Medicine } from '../../types';
import pharmacyBuildingImg from '../../assets/images/pharmacy_building_1786459624657.jpg';

interface PublicHomeProps {
  onExploreProducts?: () => void;
  onOpenDashboard?: () => void;
  onOpenOwnerRegister?: () => void;
  onOpenMobileApp?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToRegistration?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onExploreProducts = () => {},
  onOpenDashboard = () => {},
  onOpenOwnerRegister,
  onOpenMobileApp = () => {},
  onNavigateToContact,
  onNavigateToRegistration,
}) => {
  const { content } = usePortalContent();
  const { showToast } = useToast();
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [reserveMedicine, setReserveMedicine] = useState<Medicine | null>(null);
  const [isLiveBarMinimized, setIsLiveBarMinimized] = useState(false);

  const [liveTemp, setLiveTemp] = useState(3.4);
  const [isGeneratorBackup, setIsGeneratorBackup] = useState(false);

  // Check if pharmacy is currently open in Addis Ababa timezone (EAT: UTC+3)
  const isPharmacyOpen = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const eatHours = (utcHours + 3) % 24;
    return eatHours >= 8 && eatHours < 21;
  };

  useEffect(() => {
    const tempTimer = setInterval(() => {
      setLiveTemp((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        const nextVal = Math.min(4.4, Math.max(2.4, prev + delta));
        return parseFloat(nextVal.toFixed(1));
      });
    }, 3200);
    return () => clearInterval(tempTimer);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-12 lg:py-20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
        {/* Professional Ambient & Animated Geometric Medical Lattice Background */}
        <ProfessionalHeroBackground />

        <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    isPharmacyOpen()
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/80'
                      : 'bg-amber-50 text-amber-900 border border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800/80'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPharmacyOpen() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  ></span>
                  <span className="font-medium tabular-nums">{isPharmacyOpen() ? 'Store Open Now (8 AM - 9 PM)' : 'Store Closed (Opens 8 AM)'}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700/80">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>100% EFDA Batch Traceable</span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-emerald-950 dark:text-white leading-[1.12]">
                {content.heroTitlePrefix}{' '}
                <span className="relative inline-block text-emerald-600 dark:text-emerald-400">
                  {content.heroTitleHighlight}
                  <span className="absolute left-0 bottom-1 w-full h-2 bg-emerald-400/20 -z-10 rounded-full" />
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {content.heroSubheading}
              </p>

              {/* High-Contrast Patient Primary Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={onExploreProducts}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 inline-flex items-center gap-2.5 cursor-pointer active:scale-[0.99]"
                >
                  <Search className="h-4 w-4" />
                  <span>Browse Medicine Catalog</span>
                  <ArrowRight className="h-4 w-4 opacity-80" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-sm transition border border-slate-700/80 shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Upload Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-900 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-200 font-bold text-xs transition border border-rose-200 dark:border-rose-800/80 inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <span>24/7 Helpline Guide</span>
                </button>
              </div>
            </motion.div>

            {/* Right Hero: Flagship Hub & Cold-Chain Biological Sensor Vault */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5 space-y-4"
            >
              {/* Flagship Store Building Card */}
              <div className="relative rounded-3xl bg-slate-900 overflow-hidden border border-emerald-700/80 shadow-2xl group min-h-[340px] flex flex-col justify-end">
                <img
                  src={pharmacyBuildingImg}
                  alt="Kaziniya Pharmacy Flagship Building"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-emerald-400/40"
                  >
                    <Building className="h-3.5 w-3.5 text-emerald-200" />
                    <span>Bole Flagship Hub</span>
                  </motion.span>
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 tabular-nums font-mono">
                    <Clock className="h-3 w-3" />
                    Open 24/7
                  </span>
                </div>

                {/* Banner Body Overlay Content */}
                <div className="relative z-10 p-5 space-y-3 text-white">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{content.flagshipAddress}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                      {content.heroBannerTitle}
                    </h3>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-900/80 border border-slate-700/80 p-2 rounded-2xl backdrop-blur-md space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">24/7 Helpline</span>
                      <span className="text-xs font-black text-emerald-400 font-mono tabular-nums flex items-center gap-1">
                        <PhoneCall className="h-3.5 w-3.5 text-emerald-400" /> {content.shortcodeHelpline}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-700/80 p-2 rounded-2xl backdrop-blur-md space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">EFDA License</span>
                      <span className="text-xs font-bold text-amber-300 font-mono tabular-nums">{content.efdaLicense}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Cold-Chain Biological Sensor Telemetry Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-slate-950/90 backdrop-blur-md rounded-3xl p-4.5 border border-cyan-500/30 shadow-xl relative overflow-hidden text-white"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600/25 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-xs">
                      <ThermometerSnowflake className="h-4 w-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        Cold-Chain Biological Vault
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      </h4>
                      <span className="text-[10px] text-slate-400">Insulins, Vaccines & Biologics Storage (2°C - 8°C)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono tabular-nums font-bold bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800">
                      Sensor ID: KZN-VAULT-01
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3">
                  {/* Temp reading */}
                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-cyan-900/40 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Live Temp</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-cyan-300 font-mono tabular-nums">{liveTemp}°C</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-semibold">Optimal Range</span>
                  </div>

                  {/* Humidity */}
                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Chamber RH</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-emerald-300 font-mono tabular-nums">42.5%</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">Auto-regulated</span>
                  </div>

                  {/* Power status & Generator */}
                  <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Backup UPS</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-extrabold text-amber-300 font-mono tabular-nums">
                        {isGeneratorBackup ? 'GEN-ACTIVE' : 'GRID-ONLINE'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsGeneratorBackup(!isGeneratorBackup);
                        showToast(
                          !isGeneratorBackup
                            ? 'Switched cold-chain vault to 100kVA automatic backup generator simulator.'
                            : 'Cold-chain vault returned to primary electrical grid.',
                          'info',
                          'Power Telemetry'
                        );
                      }}
                      className="text-[9px] text-cyan-200/80 hover:text-white underline block cursor-pointer transition-colors"
                    >
                      Toggle test
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DIGITAL PHARMACY NETWORK & REGISTRATION CALLOUT SECTION */}
      <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white border border-teal-800/80 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/80 border border-teal-700 text-teal-300 text-xs font-mono font-bold">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Join the National Digital Health Ecosystem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                Own a Pharmacy or Community Drug Store?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Explore our full Registration Dashboard to discover how digital batch tracking, Telebirr POS,
                and EFDA compliance reduce expiry waste by up to 88%. Browse all registered pharmacies and locations across Ethiopia.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 z-10 shrink-0">
              {onNavigateToRegistration && (
                <button
                  onClick={onNavigateToRegistration}
                  className="px-5 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-md shadow-teal-500/20 inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Store className="h-4 w-4" />
                  <span>Open Registration Dashboard</span>
                </button>
              )}

              {onOpenOwnerRegister && (
                <button
                  onClick={onOpenOwnerRegister}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-extrabold text-xs sm:text-sm transition inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Register Store Now →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <PrescriptionUploadModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <StockReserveModal
        medicine={reserveMedicine}
        onClose={() => setReserveMedicine(null)}
      />

      <EmergencyGuideModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};

export default PublicHome;
