import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  X,
  ShieldAlert,
  Upload,
  Clock,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Phone,
  HeartPulse,
} from 'lucide-react';

interface FloatingSpeedDialProps {
  onOpenEmergencyModal: () => void;
  onOpenPrescriptionModal: () => void;
  onOpenHealthGuide?: () => void;
}

export const FloatingSpeedDial: React.FC<FloatingSpeedDialProps> = ({
  onOpenEmergencyModal,
  onOpenPrescriptionModal,
  onOpenHealthGuide,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-72 space-y-2.5"
          >
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  24/7 Patient Speed Dial
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Bole Branch
              </span>
            </div>

            {/* Direct Pharmacist Phone */}
            <motion.a
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              href="tel:+251911889001"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 transition border border-emerald-200/80 dark:border-emerald-800/80 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Phone className="h-4 w-4" />
              </div>
              <div className="text-left flex-1">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 block leading-tight">
                  Call Bole Pharmacist
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                  +251 911 889 001
                </span>
              </div>
            </motion.a>

            {/* Upload Prescription */}
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsOpen(false);
                onOpenPrescriptionModal();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Upload className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                  Upload Prescription
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Hold & verify dosage
                </span>
              </div>
            </motion.button>

            {/* Emergency & Poison Protocol */}
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsOpen(false);
                onOpenEmergencyModal();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 transition border border-rose-200 dark:border-rose-900/80 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block leading-tight">
                  First-Aid & 907 Protocol
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400">
                  Poison 8335 • Ambulance
                </span>
              </div>
            </motion.button>

            {onOpenHealthGuide && (
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsOpen(false);
                  onOpenHealthGuide();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold text-left transition"
              >
                <HeartPulse className="h-3.5 w-3.5 text-emerald-600" />
                <span>OTC Symptom Health Guide</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button with Pulsing Ring */}
      <div className="relative">
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
        )}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 dark:bg-slate-100 dark:text-slate-900'
              : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-emerald-600/40 ring-4 ring-emerald-500/20'
          }`}
          title="24/7 Duty Speed Dial & Emergency"
        >
          {isOpen ? <X className="h-6 w-6" /> : <PhoneCall className="h-6 w-6" />}
        </motion.button>
      </div>
    </div>
  );
};
