import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import {
  ShieldCheck,
  Sparkles,
  Rotate3d,
  Layers,
  Atom,
  CheckCircle2,
  Maximize2,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface Pill3DSceneProps {
  className?: string;
  onExploreProducts?: () => void;
}

export const Pill3DScene: React.FC<Pill3DSceneProps> = ({ className = '', onExploreProducts }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [active3DMode, setActive3DMode] = useState<'capsule' | 'molecular' | 'hologram'>('capsule');
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(true);

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 180,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), {
    stiffness: 180,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white border border-emerald-500/40 shadow-2xl overflow-hidden select-none ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Dynamic 3D Ambient Lighting Glow */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top 3D Control Header */}
      <div className="relative z-20 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Rotate3d className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              3D Pharmacokinetics Matrix
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <span className="text-[10px] text-slate-400">Interactive EFDA Batch #CAD-8841</span>
          </div>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActive3DMode('capsule')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              active3DMode === 'capsule'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3D Capsule
          </button>
          <button
            onClick={() => setActive3DMode('molecular')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              active3DMode === 'molecular'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Molecular Orbit
          </button>
          <button
            onClick={() => setActive3DMode('hologram')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              active3DMode === 'hologram'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EFDA Seal
          </button>
        </div>
      </div>

      {/* Main 3D Stage Canvas */}
      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
        {/* 3D Tilted Container that responds to mouse */}
        <motion.div
          style={{
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
        >
          {/* Circular 3D Stage Pedestal */}
          <motion.div
            style={{ transform: 'translateZ(-40px) rotateX(75deg)' }}
            className="absolute w-48 h-48 rounded-full border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent shadow-[0_0_30px_#10b981]"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="w-full h-full rounded-full border border-dashed border-emerald-400/40"
            />
          </motion.div>

          {/* 3D Molecular Orbit Particles Ring */}
          <motion.div
            style={{ transform: 'translateZ(20px) rotateX(45deg)' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
            className="absolute w-56 h-56 rounded-full border border-teal-500/20 pointer-events-none flex items-center justify-between"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
              className="w-2.5 h-2.5 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf]"
            />
          </motion.div>

          <motion.div
            style={{ transform: 'translateZ(10px) rotateY(60deg) rotateX(-30deg)' }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            className="absolute w-52 h-52 rounded-full border border-cyan-500/20 pointer-events-none flex items-center justify-between"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </motion.div>

          {/* Center 3D Capsule Structure */}
          {active3DMode === 'capsule' && (
            <motion.div
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(60px)' }}
              animate={
                isAutoSpin && !isHovered
                  ? {
                      rotateY: [0, 360],
                      y: [-8, 8, -8],
                      rotateZ: [-12, 12, -12],
                    }
                  : { y: [-6, 6, -6] }
              }
              transition={{
                rotateY: { repeat: Infinity, duration: 10, ease: 'linear' },
                y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
                rotateZ: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
              }}
              className="relative w-28 h-56 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Capsule Top Half (Emerald Green Active Compound) */}
              <div className="relative w-24 h-28 rounded-t-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-700 shadow-2xl border-t-2 border-l border-r border-emerald-300/60 overflow-hidden flex items-center justify-center">
                {/* Specular Highlight Streak */}
                <div className="absolute top-2 left-3 w-4 h-16 bg-white/40 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />
                <div className="text-center">
                  <span className="text-[10px] font-black tracking-widest text-emerald-950 font-mono block">
                    KZN
                  </span>
                  <span className="text-[8px] font-bold text-emerald-950/80 font-mono">500mg</span>
                </div>
              </div>

              {/* Center Ring Connection Band */}
              <div className="w-26 h-3 bg-slate-900 border-y border-emerald-400/80 shadow-md relative z-10 flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>

              {/* Capsule Bottom Half (Arctic White / Clear Sustained-Release Shell) */}
              <div className="relative w-24 h-28 rounded-b-full bg-gradient-to-r from-slate-100 via-white to-slate-300 shadow-2xl border-b-2 border-l border-r border-slate-300 overflow-hidden flex items-center justify-center">
                {/* Specular Highlight */}
                <div className="absolute bottom-4 left-3 w-4 h-16 bg-white/70 rounded-full blur-[1px] transform -rotate-12 pointer-events-none" />
                {/* Micro-pellet granules simulation */}
                <div className="absolute inset-0 p-3 flex flex-wrap gap-1 items-center justify-center opacity-70">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-xs" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="relative z-10 text-[9px] font-mono font-black text-slate-800 tracking-wider">
                  FEFO-OK
                </span>
              </div>
            </motion.div>
          )}

          {/* Mode 2: Molecular Compound Lattice 3D view */}
          {active3DMode === 'molecular' && (
            <motion.div
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(50px)' }}
              animate={{ rotateY: [0, 360], rotateX: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="relative w-44 h-44 flex items-center justify-center"
            >
              {/* Central Core Molecule */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-700 shadow-[0_0_25px_#10b981] flex items-center justify-center font-bold text-xs">
                C₁₆H₁₉N₃
              </div>
              {/* Bond Struts */}
              <div className="absolute w-36 h-1 bg-emerald-400/60 shadow-[0_0_8px_#34d399] transform rotate-45" />
              <div className="absolute w-36 h-1 bg-emerald-400/60 shadow-[0_0_8px_#34d399] transform -rotate-45" />
              {/* Outer Atoms */}
              <div className="absolute -top-3 left-4 w-7 h-7 rounded-full bg-cyan-400 shadow-md flex items-center justify-center text-[9px] font-bold text-slate-900">
                O₄
              </div>
              <div className="absolute -bottom-3 right-4 w-7 h-7 rounded-full bg-amber-400 shadow-md flex items-center justify-center text-[9px] font-bold text-slate-900">
                S
              </div>
              <div className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-emerald-300 shadow-md flex items-center justify-center text-[8px] font-bold text-slate-900">
                H₂O
              </div>
              <div className="absolute bottom-4 -left-3 w-6 h-6 rounded-full bg-teal-300 shadow-md flex items-center justify-center text-[8px] font-bold text-slate-900">
                Na
              </div>
            </motion.div>
          )}

          {/* Mode 3: Holographic EFDA Verification Badge 3D */}
          {active3DMode === 'hologram' && (
            <motion.div
              style={{ transformStyle: 'preserve-3d', transform: 'translateZ(70px)' }}
              animate={{
                rotateY: [-15, 15, -15],
                y: [-6, 6, -6],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="relative w-48 h-48 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-teal-500/30 to-cyan-500/20 border-2 border-emerald-400/80 backdrop-blur-md p-4 shadow-[0_0_35px_rgba(16,185,129,0.4)] flex flex-col items-center justify-between text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-black tracking-wider text-emerald-300 uppercase block font-mono">
                  EFDA REGISTRY SEAL
                </span>
                <span className="text-[10px] font-bold text-white block">Official Ethiopian Health Authority</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 inline-block">
                  CERT #ETH-2026-MED
                </span>
              </div>
              <div className="text-[9px] text-slate-300 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>100% Genuine Chemical Purity</span>
              </div>
            </motion.div>
          )}

          {/* Floating 3D Stat Tag (Depth: 90px) */}
          <motion.div
            style={{ transform: 'translateZ(90px)' }}
            className="absolute -bottom-2 -left-2 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <div className="text-left">
              <span className="text-[8px] uppercase font-bold text-slate-400 block">Bioavailability</span>
              <span className="text-[11px] font-black text-emerald-300 font-mono">94.8% Peak</span>
            </div>
          </motion.div>

          {/* Floating 3D Dissolution Rate Tag (Depth: 80px) */}
          <motion.div
            style={{ transform: 'translateZ(80px)' }}
            className="absolute -top-2 -right-2 bg-slate-900/90 backdrop-blur-md border border-teal-500/40 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <div className="text-left">
              <span className="text-[8px] uppercase font-bold text-slate-400 block">Dissolution</span>
              <span className="text-[11px] font-black text-amber-300 font-mono">15 Mins Rapid</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Interactive Controls & 3D Tilt Hint */}
      <div className="relative z-20 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <button
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold transition ${
              isAutoSpin
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {isAutoSpin ? 'Auto-Spin ON' : 'Auto-Spin OFF'}
          </button>
          <span className="hidden sm:inline text-slate-500">Move cursor to tilt 3D perspective</span>
        </div>

        {onExploreProducts && (
          <button
            onClick={onExploreProducts}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <span>Explore 140+ Drugs</span>
          </button>
        )}
      </div>
    </div>
  );
};
