import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scan,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building,
  Pill,
  Clock,
  Check,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface RxPreset {
  id: string;
  name: string;
  doctor: string;
  clinic: string;
  diagnosis: string;
  items: {
    name: string;
    dosage: string;
    frequency: string;
    batchCode: string;
    stock: number;
    price: number;
  }[];
}

const RX_PRESETS: RxPreset[] = [
  {
    id: 'rx-1',
    name: 'Sample 1: Respiratory Infection (Antibiotic + Analgesic)',
    doctor: 'Dr. Dawit Haile, MD (Internal Medicine)',
    clinic: 'Bole Medhanealem Specialized Clinic',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    items: [
      {
        name: 'Amoxicillin 500mg Capsules (Cadila)',
        dosage: '1 Capsule 3x daily with food',
        frequency: '7-day course (21 capsules)',
        batchCode: 'EFDA-CAD-8841',
        stock: 84,
        price: 240,
      },
      {
        name: 'Paracetamol 500mg Tablets (EPHARM)',
        dosage: '1-2 Tablets every 6 hours PRN',
        frequency: 'As needed for fever/pain (20 tablets)',
        batchCode: 'EFDA-EPH-9102',
        stock: 310,
        price: 85,
      },
    ],
  },
  {
    id: 'rx-2',
    name: 'Sample 2: Chronic Hypertension & Diabetes Care',
    doctor: 'Dr. Aster Mengesha, MD (Cardiologist)',
    clinic: 'St. Paul’s Hospital Millennium Med Center',
    diagnosis: 'Essential Hypertension & Type 2 Diabetes',
    items: [
      {
        name: 'Metformin 500mg Extended Release',
        dosage: '1 Tablet twice daily after meals',
        frequency: '30-day supply (60 tablets)',
        batchCode: 'EFDA-MET-4419',
        stock: 120,
        price: 320,
      },
      {
        name: 'Amlodipine 5mg Tablets (Pfizer)',
        dosage: '1 Tablet once daily morning',
        frequency: '30-day supply (30 tablets)',
        batchCode: 'EFDA-AML-3301',
        stock: 95,
        price: 280,
      },
    ],
  },
  {
    id: 'rx-3',
    name: 'Sample 3: Pediatric Fever & Cough Relief',
    doctor: 'Dr. Bethlehem Tadesse, MD (Pediatrics)',
    clinic: 'Ethio-Tebib Children Hospital',
    diagnosis: 'Pediatric Viral Pharyngitis with Pyrexia',
    items: [
      {
        name: 'Paracetamol Pediatric Syrup 120mg/5ml',
        dosage: '5ml every 6 hours (Max 4 doses/day)',
        frequency: '1 Bottle 100ml',
        batchCode: 'EFDA-PED-7721',
        stock: 45,
        price: 150,
      },
      {
        name: 'Vitamin C + Zinc Oral Drops',
        dosage: '10 drops daily with milk/water',
        frequency: '1 Bottle 30ml',
        batchCode: 'EFDA-NUT-2022',
        stock: 60,
        price: 180,
      },
    ],
  },
];

interface InteractivePrescriptionScannerProps {
  onOpenUploadModal?: () => void;
}

export const InteractivePrescriptionScanner: React.FC<InteractivePrescriptionScannerProps> = ({
  onOpenUploadModal,
}) => {
  const { showToast } = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rx-1');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'analyzed'>('idle');
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  const currentPreset = RX_PRESETS.find((p) => p.id === selectedPresetId) || RX_PRESETS[0];

  const handleStartScan = (presetId?: string) => {
    if (presetId) setSelectedPresetId(presetId);
    setScanState('scanning');
    setIsReserved(false);
    setActiveHighlightIndex(null);

    // Sequence the scan simulation
    setTimeout(() => {
      setActiveHighlightIndex(0);
    }, 800);

    setTimeout(() => {
      setActiveHighlightIndex(1);
    }, 1400);

    setTimeout(() => {
      setScanState('analyzed');
      setActiveHighlightIndex(null);
      showToast(
        `Prescription analyzed! ${currentPreset.items.length} items validated against EFDA Registry.`,
        'success',
        'AI Rx Recognition'
      );
    }, 2000);
  };

  const handleReserveCounterHold = () => {
    setIsReserved(true);
    showToast(
      'Reservation locked for 6 hours at Bole Medhanealem Counter! Hold code: KZ-RX-9821',
      'success',
      'Counter Hold Confirmed'
    );
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="bg-slate-950/80 p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
            <Scan className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-white tracking-wide">
                Interactive AI Prescription Laser Scanner
              </h4>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                LIVE DEMO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Optical Character Recognition & EFDA National Batch Code Verification
            </p>
          </div>
        </div>

        {/* Scan Actions */}
        <div className="flex items-center gap-2">
          {scanState !== 'scanning' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleStartScan()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Run Laser Scan</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/80 rounded-xl border border-emerald-700/80 text-emerald-400 text-xs font-mono">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Scanning Document...</span>
            </div>
          )}

          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Upload className="h-3.5 w-3.5 text-emerald-400" />
              <span>Upload Custom Rx</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset Selector Pill Tabs */}
      <div className="px-4 sm:px-6 pt-4 pb-2 bg-slate-950/40 border-b border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Choose Sample Rx:
          </span>
          {RX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleStartScan(preset.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedPresetId === preset.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-emerald-300" />
              <span>{preset.name.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Laser Scanning Viewport */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Realistic Prescription Sheet with Laser Sweep */}
        <div className="lg:col-span-7 relative bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-inner border border-slate-300 overflow-hidden min-h-[320px] flex flex-col justify-between">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Building className="w-80 h-80 text-slate-900" />
          </div>

          {/* High-Tech Corner Reticles */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-600 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-600 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-600 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-600 pointer-events-none" />

          {/* Animated Laser Beam */}
          <AnimatePresence>
            {scanState === 'scanning' && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_15px_#10b981] z-30 pointer-events-none flex items-center justify-center"
              >
                <span className="text-[9px] font-mono text-emerald-800 font-bold bg-emerald-100/90 px-2 py-0.5 rounded shadow-sm">
                  OCR PARSING 88%
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rx Document Header */}
          <div className="space-y-2 border-b-2 border-slate-900/80 pb-3 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-emerald-700" />
                  {currentPreset.clinic}
                </h5>
                <p className="text-[11px] text-slate-600 font-medium">{currentPreset.doctor}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-700 block">Date: 14/08/2026</span>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-300">
                  Rx #ETH-9014
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md">
              <strong>Clinical Indication:</strong> {currentPreset.diagnosis}
            </div>
          </div>

          {/* Rx Items List with Simulated OCR Target Brackets */}
          <div className="py-4 space-y-3 relative z-10">
            <div className="text-xs font-serif font-black italic text-emerald-900 text-lg">℞</div>
            {currentPreset.items.map((item, idx) => {
              const isHighlight = activeHighlightIndex === idx || scanState === 'analyzed';
              return (
                <motion.div
                  key={idx}
                  animate={isHighlight ? { scale: [1, 1.01, 1] } : {}}
                  className={`p-2.5 rounded-xl transition border ${
                    isHighlight
                      ? 'bg-emerald-50/90 border-emerald-500 ring-1 ring-emerald-400/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono block">
                        Sig: {item.dosage} ({item.frequency})
                      </span>
                    </div>
                    {scanState === 'analyzed' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                        <Check className="h-3 w-3" /> MATCH
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Rx Stamp & Doctor Signature Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
            <div className="flex items-center gap-1 text-emerald-700 font-bold font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>OFFICIAL MEDICAL REGISTRATION #MD-AA-4019</span>
            </div>
            <div className="border border-emerald-600/40 text-emerald-800 px-2 py-1 rounded font-serif italic text-xs font-bold transform -rotate-3 bg-emerald-50">
              Verified Rx Stamp
            </div>
          </div>
        </div>

        {/* Right: Real-time Analysis & EFDA Batch Validation Dashboard */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                EFDA Batch Stock Status
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                100% GENUINE
              </span>
            </div>

            <div className="space-y-2.5">
              {currentPreset.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-white font-bold">
                    <span className="truncate">{item.name.split(' ')[0]} {item.name.split(' ')[1]}</span>
                    <span className="text-emerald-400">{item.price} ETB</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Batch: <strong className="text-amber-300">{item.batchCode}</strong></span>
                    <span className="text-emerald-300 font-bold">{item.stock} Units in Bole</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/80 text-[11px] text-emerald-200 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Drugs are available in our active Bole Medhanealem dispensary. 6-hour reservation ensures your medicine is not sold out before you arrive.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {!isReserved ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReserveCounterHold}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Reserve Prescriptions (6-Hr Counter Hold)</span>
              </motion.button>
            ) : (
              <div className="bg-emerald-900/80 border border-emerald-500 p-3 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Prescription Held at Counter!</span>
                </div>
                <p className="text-[10px] text-slate-300 font-mono">
                  Reservation Code: <strong className="text-white text-xs">KZ-RX-9821</strong> (Valid till 6:00 PM)
                </p>
              </div>
            )}

            <button
              onClick={() => handleStartScan()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              Re-scan Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
