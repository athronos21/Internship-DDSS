import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, ContactShadows, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import {
  Rotate3d,
  Sparkles as SparklesIcon,
  Layers,
  ShieldCheck,
  Zap,
  Info,
  Maximize2,
  CheckCircle2,
  Atom,
  Pill,
} from 'lucide-react';

// --- Dynamic Canvas Texture for Rx Bottle Label ---
function useBottleLabelTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Label background (Clean medical ivory/white)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1024, 512);

      // Top green header stripe
      ctx.fillStyle = '#047857';
      ctx.fillRect(0, 0, 1024, 80);

      // Header text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('KAZINIYA DRUG STORE • BOLE BRANCH', 40, 52);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('EFDA CERTIFIED PHARMACY • ADDIS ABABA', 650, 52);

      // Rx Symbol
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 72px serif';
      ctx.fillText('℞', 40, 160);

      // Main Medicine Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 46px sans-serif';
      ctx.fillText('AMOXICILLIN 500mg', 120, 140);

      ctx.fillStyle = '#475569';
      ctx.font = '24px sans-serif';
      ctx.fillText('Broad-Spectrum Antibiotic Capsules • 30 Units', 120, 175);

      // Divider
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 200);
      ctx.lineTo(984, 200);
      ctx.stroke();

      // Dosage & Warning details
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('DIRECTIONS: Take 1 capsule three times daily with water.', 40, 240);

      ctx.fillStyle = '#64748b';
      ctx.font = '20px sans-serif';
      ctx.fillText('Storage: 15°C - 25°C • Keep away from direct sunlight & children.', 40, 275);

      // EFDA Batch & Expiry Strip
      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(40, 310, 500, 70);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(40, 310, 500, 70);

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('BATCH: #ETH-2026-89A  |  EXP: 12/2028', 55, 345);
      ctx.font = '18px monospace';
      ctx.fillText('EFDA AUTH: REG-094182 • PASSED QC', 55, 370);

      // Barcode lines
      ctx.fillStyle = '#0f172a';
      const startX = 600;
      for (let i = 0; i < 60; i++) {
        const w = (i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2);
        ctx.fillRect(startX + i * 6, 310, w, 70);
      }
      ctx.font = '16px monospace';
      ctx.fillText('6 938491 048201', 670, 400);

      // Bottom warning banner
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(0, 432, 1024, 80);
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('PRESCRIPTION ONLY MEDICINE • DISPENSE BY LICENSED PHARMACIST', 40, 480);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);
}

// --- 3D Medicine Bottle Model ---
function MedicineBottle({
  autoRotate = true,
  rotationSpeed = 1,
  onHotspotClick,
}: {
  autoRotate?: boolean;
  rotationSpeed?: number;
  onHotspotClick?: (info: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const labelTexture = useBottleLabelTexture();

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.6 * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Bottle Main Body (Amber glass / translucent pharmacy PET) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 2.6, 64]} />
        <meshPhysicalMaterial
          color="#d97706"
          roughness={0.12}
          metalness={0.1}
          transmission={0.45}
          thickness={1.2}
          ior={1.52}
          transparent
          opacity={0.92}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Label wrap around the body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.108, 1.108, 2.0, 64, 1, true, -Math.PI * 0.75, Math.PI * 1.5]} />
        <meshStandardMaterial
          map={labelTexture}
          roughness={0.35}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bottle Shoulder Curve */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.1, 0.4, 64]} />
        <meshPhysicalMaterial
          color="#d97706"
          roughness={0.15}
          metalness={0.1}
          transmission={0.4}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Bottle Neck with Threading */}
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 0.35, 64]} />
        <meshPhysicalMaterial
          color="#b45309"
          roughness={0.2}
          transmission={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Ribbed Safety Cap */}
      <group position={[0, 2.1, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.45, 64]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Vertical ridges on cap for safety grip */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.76, 0, Math.sin(angle) * 0.76]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.02, 0.4, 0.03]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
            </mesh>
          );
        })}

        {/* Top embossed safety push icon */}
        <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.5, 32]} />
          <meshStandardMaterial color="#047857" roughness={0.2} />
        </mesh>
      </group>

      {/* Interior floating capsules visible through amber bottle */}
      <group position={[0, -0.4, 0]}>
        {[-0.4, 0.1, 0.5].map((yOffset, idx) => (
          <group
            key={idx}
            position={[Math.sin(idx * 2) * 0.35, yOffset, Math.cos(idx * 2) * 0.35]}
            rotation={[idx * 0.6, idx * 1.2, idx * 0.8]}
          >
            <mesh position={[0, 0.1, 0]}>
              <capsuleGeometry args={[0.16, 0.3, 16, 16]} />
              <meshStandardMaterial color={idx % 2 === 0 ? '#10b981' : '#f59e0b'} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Interactive 3D HTML Hotspots */}
      <Html position={[1.3, 0.5, 0]} center distanceFactor={8}>
        <button
          onClick={() => onHotspotClick?.('EFDA Certified & Digitally Verified Batch')}
          className="group flex items-center gap-1.5 bg-emerald-900/90 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-400/60 shadow-lg backdrop-blur-md hover:bg-emerald-800 transition transform hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>EFDA Verified</span>
        </button>
      </Html>

      <Html position={[-1.3, 1.8, 0]} center distanceFactor={8}>
        <button
          onClick={() => onHotspotClick?.('Child-Resistant Push-and-Turn Safety Cap')}
          className="group flex items-center gap-1.5 bg-slate-900/90 text-cyan-300 text-[10px] font-bold px-2 py-1 rounded-full border border-cyan-400/60 shadow-lg backdrop-blur-md hover:bg-slate-800 transition transform hover:scale-105"
        >
          <ShieldCheck className="h-3 w-3 text-cyan-400" />
          <span>Safety Seal</span>
        </button>
      </Html>
    </group>
  );
}

// --- 3D Large Dual-Tone Pharmaceutical Capsule Model ---
function DualToneCapsule({
  autoRotate = true,
  rotationSpeed = 1,
}: {
  autoRotate?: boolean;
  rotationSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.7 * rotationSpeed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.25;
      groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Top Emerald Green Half */}
      <group position={[0, 0.65, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#059669"
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 1.3, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#059669"
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
      </group>

      {/* Gold/Emerald Metallic Band Divider */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.1, 32]} />
        <meshStandardMaterial color="#34d399" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bottom Porcelain White Half */}
      <group position={[0, -0.65, 0]} rotation={[Math.PI, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.88, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.15}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <cylinderGeometry args={[0.88, 0.88, 1.3, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.15}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
      </group>

      {/* Floating internal therapeutic micro-pellets */}
      {Array.from({ length: 16 }).map((_, i) => {
        const radius = 0.55 * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#10b981' : i % 2 === 0 ? '#38bdf8' : '#f59e0b'}
              emissive={i % 3 === 0 ? '#059669' : '#0284c7'}
              emissiveIntensity={0.4}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// --- 3D Molecular Lattice / DNA Structure Model ---
function MolecularLattice({
  autoRotate = true,
  rotationSpeed = 1,
}: {
  autoRotate?: boolean;
  rotationSpeed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.8 * rotationSpeed;
      groupRef.current.rotation.x += delta * 0.3 * rotationSpeed;
    }
  });

  const nodes = useMemo(() => {
    const list = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4;
      const y = (i - count / 2) * 0.32;
      const radius = 1.2;
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      list.push({ id: i, p1: [x1, y, z1] as [number, number, number], p2: [x2, y, z2] as [number, number, number] });
    }
    return list;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {nodes.map(({ id, p1, p2 }) => (
        <group key={id}>
          {/* Node 1 (Emerald Active) */}
          <mesh position={p1} castShadow>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={0.6}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>

          {/* Node 2 (Cyan Therapeutic) */}
          <mesh position={p2} castShadow>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.5}
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>

          {/* Cross Bond Connection Bar */}
          <mesh
            position={[(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2, (p1[2] + p2[2]) / 2]}
            rotation={[0, -Math.atan2(p2[2] - p1[2], p2[0] - p1[0]), Math.PI / 2]}
          >
            <cylinderGeometry args={[0.035, 0.035, 2.4, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Central Bioactive Energy Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#10b981"
          emissiveIntensity={1.2}
          wireframe
        />
      </mesh>
    </group>
  );
}

// --- Orbiting 3D Pills Floating Around Center Model ---
function OrbitingPills() {
  const p1Ref = useRef<THREE.Group>(null);
  const p2Ref = useRef<THREE.Group>(null);
  const p3Ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (p1Ref.current) {
      p1Ref.current.position.x = Math.sin(t * 0.9) * 2.3;
      p1Ref.current.position.z = Math.cos(t * 0.9) * 2.3;
      p1Ref.current.position.y = Math.sin(t * 1.8) * 0.4 + 0.6;
      p1Ref.current.rotation.x = t * 1.5;
      p1Ref.current.rotation.y = t * 2.0;
    }
    if (p2Ref.current) {
      p2Ref.current.position.x = Math.sin(t * 0.7 + 2.2) * 2.6;
      p2Ref.current.position.z = Math.cos(t * 0.7 + 2.2) * 2.6;
      p2Ref.current.position.y = Math.cos(t * 1.5) * 0.5 - 0.4;
      p2Ref.current.rotation.y = t * 1.2;
      p2Ref.current.rotation.z = t * 1.8;
    }
    if (p3Ref.current) {
      p3Ref.current.position.x = Math.sin(t * 0.8 + 4.4) * 2.1;
      p3Ref.current.position.z = Math.cos(t * 0.8 + 4.4) * 2.1;
      p3Ref.current.position.y = Math.sin(t * 2.2) * 0.35 + 1.2;
      p3Ref.current.rotation.x = t * 1.0;
      p3Ref.current.rotation.z = t * 2.5;
    }
  });

  return (
    <>
      {/* Orbiting Capsule 1 (Emerald/White) */}
      <group ref={p1Ref}>
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.2}>
          <mesh castShadow>
            <capsuleGeometry args={[0.18, 0.45, 16, 16]} />
            <meshPhysicalMaterial
              color="#10b981"
              roughness={0.1}
              metalness={0.2}
              clearcoat={1}
            />
          </mesh>
        </Float>
      </group>

      {/* Orbiting Tablet 2 (Round Scored Disc) */}
      <group ref={p2Ref}>
        <Float speed={2.5} rotationIntensity={2} floatIntensity={1}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.12, 32]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
          </mesh>
        </Float>
      </group>

      {/* Orbiting Capsule 3 (Amber/Cyan) */}
      <group ref={p3Ref}>
        <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.4}>
          <mesh castShadow>
            <capsuleGeometry args={[0.15, 0.38, 16, 16]} />
            <meshPhysicalMaterial
              color="#0284c7"
              roughness={0.15}
              metalness={0.2}
              clearcoat={1}
            />
          </mesh>
        </Float>
      </group>
    </>
  );
}

// --- Main 3D Canvas Container Component ---
interface MedicineBottle3DCanvasProps {
  className?: string;
  onExploreProducts?: () => void;
}

export const MedicineBottle3DCanvas: React.FC<MedicineBottle3DCanvasProps> = ({
  className = '',
  onExploreProducts,
}) => {
  const [activeModel, setActiveModel] = useState<'bottle' | 'capsule' | 'molecular'>('bottle');
  const [lightingPreset, setLightingPreset] = useState<'emerald' | 'warm' | 'cyan'>('emerald');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [activeHotspotInfo, setActiveHotspotInfo] = useState<string | null>(null);

  // Lighting configurations based on preset
  const lightConfig = useMemo(() => {
    switch (lightingPreset) {
      case 'warm':
        return {
          ambient: '#fff7ed',
          ambientIntensity: 0.8,
          keyLight: '#f59e0b',
          rimLight: '#d97706',
          bgGlow: 'from-amber-950/40 via-slate-900 to-slate-950',
          borderColor: 'border-amber-500/40',
        };
      case 'cyan':
        return {
          ambient: '#ecfeff',
          ambientIntensity: 0.7,
          keyLight: '#06b6d4',
          rimLight: '#0284c7',
          bgGlow: 'from-cyan-950/40 via-slate-900 to-slate-950',
          borderColor: 'border-cyan-500/40',
        };
      case 'emerald':
      default:
        return {
          ambient: '#ecfdf5',
          ambientIntensity: 0.8,
          keyLight: '#10b981',
          rimLight: '#059669',
          bgGlow: 'from-emerald-950/40 via-slate-900 to-slate-950',
          borderColor: 'border-emerald-500/40',
        };
    }
  }, [lightingPreset]);

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-br ${lightConfig.bgGlow} p-4 sm:p-6 text-white border ${lightConfig.borderColor} shadow-2xl overflow-hidden select-none flex flex-col justify-between ${className}`}
      style={{ minHeight: '440px' }}
    >
      {/* Background ambient lighting blur spheres */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3D Header Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xs">
            <Rotate3d className="h-4 w-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              Interactive 3D Pharmacy Canvas
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">React Three Fiber • WebGL 60FPS</span>
          </div>
        </div>

        {/* 3D Model Switcher Pill Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveModel('bottle')}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              activeModel === 'bottle'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rotate3d className="h-3 w-3" />
            <span>Rx Bottle</span>
          </button>
          <button
            onClick={() => setActiveModel('capsule')}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              activeModel === 'capsule'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pill className="h-3 w-3" />
            <span>3D Capsule</span>
          </button>
          <button
            onClick={() => setActiveModel('molecular')}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
              activeModel === 'molecular'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="h-3 w-3" />
            <span>DNA Helix</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="relative z-10 w-full h-72 sm:h-80 my-1 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Rotate3d className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="text-xs font-mono">Initializing 3D WebGL Shader...</span>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0.4, 5.2], fov: 45 }}
            shadows
            gl={{ antialias: true, alpha: true }}
          >
            {/* Dynamic Studio Lights */}
            <ambientLight color={lightConfig.ambient} intensity={lightConfig.ambientIntensity} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.4}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-4, 3, -3]} color={lightConfig.keyLight} intensity={1.8} />
            <pointLight position={[3, -2, 2]} color={lightConfig.rimLight} intensity={1.2} />
            <pointLight position={[0, 4, 2]} color="#ffffff" intensity={0.8} />

            {/* Sparkles Particle Field */}
            <Sparkles count={40} scale={5} size={2} speed={0.4} opacity={0.6} color="#34d399" />

            {/* Render Selected 3D Model */}
            <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
              {activeModel === 'bottle' && (
                <MedicineBottle
                  autoRotate={autoRotate}
                  rotationSpeed={rotationSpeed}
                  onHotspotClick={setActiveHotspotInfo}
                />
              )}
              {activeModel === 'capsule' && (
                <DualToneCapsule autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
              )}
              {activeModel === 'molecular' && (
                <MolecularLattice autoRotate={autoRotate} rotationSpeed={rotationSpeed} />
              )}

              {/* Orbiting floating pills */}
              <OrbitingPills />
            </Float>

            {/* Ground Contact Shadow */}
            <ContactShadows
              position={[0, -1.8, 0]}
              opacity={0.65}
              scale={6}
              blur={2}
              far={4}
              color="#022c22"
            />

            {/* Damped Interactive Orbit Controls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2 + 0.2}
              minPolarAngle={Math.PI / 4}
              dampingFactor={0.06}
            />
          </Canvas>
        </Suspense>

        {/* Hotspot Notification Toast Overlay */}
        {activeHotspotInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 bg-slate-900/95 text-white border border-emerald-500/50 p-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs max-w-sm z-30"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{activeHotspotInfo}</span>
            </div>
            <button
              onClick={() => setActiveHotspotInfo(null)}
              className="text-slate-400 hover:text-white text-[10px] font-bold underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </div>

      {/* Bottom Interactive Toolbar & Telemetry */}
      <div className="relative z-20 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Rotation & Lighting Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border flex items-center gap-1.5 ${
              autoRotate
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Rotate3d className={`h-3 w-3 ${autoRotate ? 'animate-spin-slow' : ''}`} />
            <span>{autoRotate ? 'Auto-Spin ON' : 'Auto-Spin OFF'}</span>
          </button>

          {/* Lighting Tones */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLightingPreset('emerald')}
              className={`w-4 h-4 rounded-full bg-emerald-500 transition ${
                lightingPreset === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-60'
              }`}
              title="Emerald Clinical Glow"
            />
            <button
              onClick={() => setLightingPreset('warm')}
              className={`w-4 h-4 rounded-full bg-amber-500 transition ${
                lightingPreset === 'warm' ? 'ring-2 ring-white scale-110' : 'opacity-60'
              }`}
              title="Amber Pharmacy Glow"
            />
            <button
              onClick={() => setLightingPreset('cyan')}
              className={`w-4 h-4 rounded-full bg-cyan-500 transition ${
                lightingPreset === 'cyan' ? 'ring-2 ring-white scale-110' : 'opacity-60'
              }`}
              title="Cyan Cryo-Storage Glow"
            />
          </div>

          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Drag to rotate 360° in real time
          </span>
        </div>

        {/* Action Button */}
        {onExploreProducts && (
          <button
            onClick={onExploreProducts}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-extrabold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 shrink-0"
          >
            <span>Explore Catalog</span>
            <Zap className="h-3.5 w-3.5 fill-emerald-300" />
          </button>
        )}
      </div>
    </div>
  );
};
