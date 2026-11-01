import React from 'react';
import { motion } from 'motion/react';

interface ProfessionalHeroBackgroundProps {
  className?: string;
}

export const ProfessionalHeroBackground: React.FC<ProfessionalHeroBackgroundProps> = ({
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {/* 1. Precision Grid & Micro-Dot Matrix Overlay */}
      <div className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25]">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            {/* Fine Sub-grid */}
            <pattern
              id="medical-grid-pattern"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-slate-300/40 dark:text-slate-700/40"
              />
              <circle
                cx="48"
                cy="0"
                r="1.5"
                fill="currentColor"
                className="text-emerald-500/40 dark:text-emerald-400/30"
              />
            </pattern>

            {/* Radial Fade Mask for clean edge blending */}
            <radialGradient id="grid-fade-mask" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="60%" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="fade-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade-mask)" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#medical-grid-pattern)"
            mask="url(#fade-mask)"
          />
        </svg>
      </div>

      {/* 2. Professional Ambient Ambient Light Mesh */}
      {/* Primary Emerald Glow Orb */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -35, 25, 0],
          scale: [1, 1.12, 0.95, 1],
          opacity: [0.35, 0.5, 0.38, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 left-1/12 w-[32rem] h-[32rem] bg-gradient-to-br from-emerald-400/25 via-teal-400/20 to-transparent dark:from-emerald-500/20 dark:via-teal-500/10 dark:to-transparent rounded-full blur-3xl"
      />

      {/* Secondary Cyan/Teal Clinical Precision Aura */}
      <motion.div
        animate={{
          x: [0, -45, 35, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.92, 1.08, 1],
          opacity: [0.3, 0.45, 0.32, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 right-1/10 w-[28rem] h-[28rem] bg-gradient-to-tl from-cyan-400/20 via-emerald-300/15 to-transparent dark:from-cyan-500/15 dark:via-emerald-600/10 dark:to-transparent rounded-full blur-3xl"
      />

      {/* Soft Bottom Warm Healing Accent Aura */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 20, 0],
          scale: [0.95, 1.05, 0.98, 0.95],
          opacity: [0.2, 0.35, 0.25, 0.2],
        }}
        transition={{
          repeat: Infinity,
          duration: 26,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute -bottom-20 left-1/3 w-[36rem] h-[24rem] bg-gradient-to-tr from-teal-300/20 via-emerald-200/15 to-transparent dark:from-teal-600/10 dark:via-emerald-800/10 dark:to-transparent rounded-full blur-3xl"
      />

      {/* 3. Subtle Animated Vital Stream / EKG Telemetry Wave */}
      <div className="absolute top-1/4 left-0 right-0 h-40 opacity-20 dark:opacity-15 overflow-hidden">
        <svg
          viewBox="0 0 1440 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full preserve-3d"
        >
          <defs>
            <linearGradient id="ekg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
              <stop offset="20%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Smooth Sine-Vital Flow */}
          <motion.path
            d="M 0 80 Q 180 40 360 80 T 720 80 T 1080 80 T 1440 80"
            stroke="url(#ekg-grad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
            initial={{ pathOffset: 0, pathLength: 1 }}
            animate={{
              d: [
                'M 0 80 Q 180 35 360 80 T 720 80 T 1080 80 T 1440 80',
                'M 0 80 Q 180 125 360 80 T 720 80 T 1080 80 T 1440 80',
                'M 0 80 Q 180 35 360 80 T 720 80 T 1080 80 T 1440 80',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: 'easeInOut',
            }}
          />

          {/* Second Offset Harmonics Wave */}
          <motion.path
            d="M 0 85 Q 240 130 480 85 T 960 85 T 1440 85"
            stroke="url(#ekg-grad)"
            strokeWidth="1"
            strokeDasharray="4 6"
            fill="none"
            animate={{
              d: [
                'M 0 85 Q 240 130 480 85 T 960 85 T 1440 85',
                'M 0 85 Q 240 40 480 85 T 960 85 T 1440 85',
                'M 0 85 Q 240 130 480 85 T 960 85 T 1440 85',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 16,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>

      {/* 4. Elegant Micro Data-Node Constellations (Pharmaceutical Quality Network) */}
      <div className="absolute inset-0">
        {/* Node 1 */}
        <motion.div
          className="absolute top-[18%] left-[12%] flex items-center gap-1.5"
          animate={{
            y: [0, -10, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 block shadow-sm" />
            <span className="w-4 h-4 rounded-full border border-emerald-400/40 absolute -top-1 -left-1 animate-ping" />
          </div>
          <span className="text-[9px] font-mono font-semibold tracking-wider text-emerald-600/60 dark:text-emerald-400/40 uppercase hidden sm:inline-block">
            FEFO • ACTIVE
          </span>
        </motion.div>

        {/* Node 2 */}
        <motion.div
          className="absolute top-[38%] left-[3%] flex items-center gap-1.5"
          animate={{
            y: [0, 12, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1 }}
        >
          <div className="relative">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 block" />
          </div>
          <span className="text-[8px] font-mono text-teal-600/50 dark:text-teal-400/30 uppercase hidden md:inline-block">
            COLD-CHAIN 4.2°C
          </span>
        </motion.div>

        {/* Node 3 */}
        <motion.div
          className="absolute bottom-[22%] left-[28%] flex items-center gap-1.5"
          animate={{
            y: [0, -8, 0],
            opacity: [0.35, 0.75, 0.35],
          }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 2 }}
        >
          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 block" />
            <span className="w-3 h-3 rounded-full border border-cyan-400/30 absolute -top-0.5 -left-0.5" />
          </div>
          <span className="text-[8px] font-mono text-cyan-600/50 dark:text-cyan-400/30 uppercase hidden lg:inline-block">
            EFDA BATCH SYNC
          </span>
        </motion.div>

        {/* Node 4 (Right area) */}
        <motion.div
          className="absolute top-[15%] right-[8%] flex items-center gap-1.5"
          animate={{
            y: [0, 10, 0],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', delay: 1.5 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
          <span className="text-[8px] font-mono text-emerald-600/40 dark:text-emerald-400/30 uppercase hidden xl:inline-block">
            DISPENSE NODE 01
          </span>
        </motion.div>

        {/* Connecting Hairline Vectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 dark:opacity-15">
          <motion.line
            x1="12%"
            y1="18%"
            x2="28%"
            y2="78%"
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth="0.75"
            strokeDasharray="3 6"
            animate={{ strokeDashoffset: [0, -36] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          />
          <motion.line
            x1="3%"
            y1="38%"
            x2="12%"
            y2="18%"
            stroke="currentColor"
            className="text-teal-500"
            strokeWidth="0.75"
            strokeDasharray="2 4"
            animate={{ strokeDashoffset: [0, 24] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          />
        </svg>
      </div>

      {/* 5. Clean Top & Bottom Vignettes for Flawless Section Blending */}
      <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/80 dark:from-slate-900/80 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
    </div>
  );
};
