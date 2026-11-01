import React from 'react';
import { motion } from 'motion/react';
import { Activity, Heart, ShieldCheck, Zap } from 'lucide-react';

interface EkgPulseMonitorProps {
  className?: string;
}

export const EkgPulseMonitor: React.FC<EkgPulseMonitorProps> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden bg-slate-950 text-white rounded-2xl border border-emerald-500/30 p-3 shadow-lg ${className}`}>
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Activity className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Live Pharmacy Vitals & Verification
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800 font-mono">
                ACTIVE 24/7
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Bole Flagship Dispatch • EFDA Certified Cold-Chain Storage • Real-time Batch Safety
            </p>
          </div>
        </div>

        {/* Center Animated EKG SVG Waveform */}
        <div className="w-full sm:w-64 h-8 relative flex items-center overflow-hidden">
          <svg
            viewBox="0 0 300 40"
            className="w-full h-full stroke-emerald-400 fill-none"
            style={{ strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
          >
            {/* Base Dim Path */}
            <path
              d="M0 20 L50 20 L60 20 L68 7 L76 33 L84 10 L92 27 L98 20 L150 20 L200 20 L210 20 L218 7 L226 33 L234 10 L242 27 L248 20 L300 20"
              className="opacity-30 stroke-emerald-500"
            />
            {/* Glowing Active Animated Wave */}
            <motion.path
              d="M0 20 L50 20 L60 20 L68 7 L76 33 L84 10 L92 27 L98 20 L150 20 L200 20 L210 20 L218 7 L226 33 L234 10 L242 27 L248 20 L300 20"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{ pathLength: [0.1, 0.4, 0.1], pathOffset: [0, 1] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="stroke-emerald-300 drop-shadow-[0_0_8px_#34d399]"
            />
          </svg>
          {/* Traveling Glowing Blip */}
          <motion.div
            animate={{ left: ['0%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#10b981,0_0_20px_#34d399] pointer-events-none"
          />
        </div>

        {/* Right Live Rate Badge */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 0.85, ease: 'easeInOut' }}
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            </motion.div>
            <span className="font-mono font-bold text-white text-[11px]">72 BPM</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>0 Counter Queues</span>
          </div>
        </div>
      </div>
    </div>
  );
};
