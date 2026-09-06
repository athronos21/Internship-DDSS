import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Info,
  Sparkles,
  PhoneCall,
  ArrowRight,
  Package,
  Navigation,
  ThermometerSnowflake,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface SubcityZone {
  id: string;
  name: string;
  subcity: string;
  etaMinutes: string;
  deliveryFee: number;
  freeAbove: number;
  courierType: string;
  popularSpots: string[];
  // SVG coordinates on map (0-300 scale)
  mapCoords: { x: number; y: number };
}

const ADDIS_ZONES: SubcityZone[] = [
  {
    id: 'bole_core',
    name: 'Bole Medhanealem & Atlas',
    subcity: 'Bole Subcity',
    etaMinutes: '20 - 35 mins',
    deliveryFee: 60,
    freeAbove: 800,
    courierType: 'Kaziniya Electric Bike Courier',
    popularSpots: ['Edna Mall', 'Bole Airport Area', 'Atlas Hotel', 'DH Geda Tower', 'Moenco'],
    mapCoords: { x: 190, y: 160 },
  },
  {
    id: 'bole_gerji',
    name: 'Gerji, Imperial & Jackros',
    subcity: 'Bole Subcity',
    etaMinutes: '30 - 45 mins',
    deliveryFee: 90,
    freeAbove: 1000,
    courierType: 'Express Motorcycle Dispatch',
    popularSpots: ['Imperial Hotel', 'Unity University', 'Robel Cafe', 'Jackros Area'],
    mapCoords: { x: 230, y: 190 },
  },
  {
    id: 'kazanchis_kirkos',
    name: 'Kazanchis, Bambis & Kirkos',
    subcity: 'Kirkos Subcity',
    etaMinutes: '30 - 50 mins',
    deliveryFee: 100,
    freeAbove: 1200,
    courierType: 'Express Motorcycle Dispatch',
    popularSpots: ['ECA Conference Center', 'Intercontinental Hotel', 'Bambis Supermarket', 'Olympia'],
    mapCoords: { x: 150, y: 130 },
  },
  {
    id: 'sarbet_mexico',
    name: 'Sarbet, Mexico & Vatican',
    subcity: 'Kirkos / Lideta',
    etaMinutes: '35 - 55 mins',
    deliveryFee: 120,
    freeAbove: 1200,
    courierType: 'Temperature-Controlled Courier',
    popularSpots: ['AU Headquarters', 'Mexico Square', 'Canadian Embassy', 'Old Airport'],
    mapCoords: { x: 100, y: 180 },
  },
  {
    id: 'cmc_summit',
    name: 'CMC, Meri, Summit & Ayat',
    subcity: 'Yeka / Bole',
    etaMinutes: '45 - 65 mins',
    deliveryFee: 140,
    freeAbove: 1500,
    courierType: 'Temperature-Controlled Courier',
    popularSpots: ['Michael Roundabout', 'Summit Fiyel Bet', 'Ayat Zone 3', 'Civil Service'],
    mapCoords: { x: 260, y: 90 },
  },
  {
    id: 'piassa_arada',
    name: 'Piassa, Arat Kilo & Sidist Kilo',
    subcity: 'Arada Subcity',
    etaMinutes: '40 - 60 mins',
    deliveryFee: 130,
    freeAbove: 1400,
    courierType: 'Express Motorcycle Dispatch',
    popularSpots: ['Arat Kilo Square', 'Addis Ababa University', 'Tayitu Hotel', 'Churchill Ave'],
    mapCoords: { x: 120, y: 70 },
  },
  {
    id: 'gotera_lebu',
    name: 'Gotera, Lebu, Jemo & Nifas Silk',
    subcity: 'Nifas Silk Lafto',
    etaMinutes: '45 - 70 mins',
    deliveryFee: 150,
    freeAbove: 1500,
    courierType: 'Temperature-Controlled Courier',
    popularSpots: ['Gotera Interchange', 'Lebu Varnero', 'Jemo 1', 'Nifas Silk Complex'],
    mapCoords: { x: 80, y: 240 },
  },
];

// Origin: Bole Flagship Store coordinates on map
const FLAGSHIP_COORDS = { x: 180, y: 150 };

export const DeliveryCalculator: React.FC<{ onStartOrder?: () => void }> = ({ onStartOrder }) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('bole_core');
  const [estimatedOrderValue, setEstimatedOrderValue] = useState<number>(650);

  const currentZone = ADDIS_ZONES.find((z) => z.id === selectedZoneId) || ADDIS_ZONES[0];
  const isFreeDelivery = estimatedOrderValue >= currentZone.freeAbove;
  const effectiveFee = isFreeDelivery ? 0 : currentZone.deliveryFee;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
              <Truck className="h-3.5 w-3.5 text-emerald-200" />
              <span>Addis Ababa Express Dispatch</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Interactive Delivery Radar & Fee Calculator
            </h3>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Live temperature-controlled dispatch tracking from our Bole Medhanealem flagship store across 11 subcities in Addis Ababa.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-200">
              <ThermometerSnowflake className="h-6 w-6 animate-pulse" />
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-white">Cold-Chain Insulated Box</div>
              <div className="text-emerald-200 font-mono">2°C – 8°C Certified</div>
            </div>
          </div>
        </div>

        {/* Subcity Selector Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pt-6 pb-1 custom-scrollbar">
          {ADDIS_ZONES.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
                  isSelected
                    ? 'bg-white text-emerald-950 shadow-md scale-[1.02]'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
                }`}
              >
                <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-emerald-700' : 'text-white'}`} />
                <span>{zone.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Rate Calculator */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center: Interactive Animated Addis Ababa Delivery Map (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-5 border border-slate-800 text-white relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Map Grid overlay */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#10b981 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            />

            {/* Top Map Status Bar */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-400" />
                <span className="font-mono font-bold text-slate-200">
                  DISPATCH SIMULATOR: <strong className="text-emerald-400">BOLE → {currentZone.name.split(',')[0]}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE RADAR
              </span>
            </div>

            {/* Interactive Vector Map Canvas */}
            <div className="relative z-10 my-4 h-56 w-full bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 320 280" className="w-full h-full">
                {/* Background Subcity Contours */}
                <path
                  d="M40,50 Q120,20 220,40 T290,120 T240,240 T90,260 T30,170 Z"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Subcity Landmark Points */}
                {ADDIS_ZONES.map((zone) => {
                  const isCur = zone.id === selectedZoneId;
                  return (
                    <g key={zone.id} className="cursor-pointer" onClick={() => setSelectedZoneId(zone.id)}>
                      <circle
                        cx={zone.mapCoords.x}
                        cy={zone.mapCoords.y}
                        r={isCur ? 7 : 4}
                        fill={isCur ? '#10b981' : '#64748b'}
                        className="transition-all duration-300"
                      />
                      {isCur && (
                        <circle
                          cx={zone.mapCoords.x}
                          cy={zone.mapCoords.y}
                          r={14}
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="1.5"
                          className="animate-ping opacity-60 origin-center"
                        />
                      )}
                      <text
                        x={zone.mapCoords.x + 8}
                        y={zone.mapCoords.y + 4}
                        fill={isCur ? '#34d399' : '#94a3b8'}
                        fontSize="9"
                        fontWeight={isCur ? 'bold' : 'normal'}
                        fontFamily="monospace"
                      >
                        {zone.name.split(',')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Flagship Store Hub (Bole Medhanealem) */}
                <g>
                  <circle cx={FLAGSHIP_COORDS.x} cy={FLAGSHIP_COORDS.y} r={9} fill="#059669" />
                  <circle
                    cx={FLAGSHIP_COORDS.x}
                    cy={FLAGSHIP_COORDS.y}
                    r={18}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1"
                    className="animate-pulse opacity-40"
                  />
                  <text
                    x={FLAGSHIP_COORDS.x - 28}
                    y={FLAGSHIP_COORDS.y - 12}
                    fill="#10b981"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    ★ Bole Flagship Store
                  </text>
                </g>

                {/* Animated Dispatch Route Line */}
                <motion.line
                  x1={FLAGSHIP_COORDS.x}
                  y1={FLAGSHIP_COORDS.y}
                  x2={currentZone.mapCoords.x}
                  y2={currentZone.mapCoords.y}
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />

                {/* Animated Moving Motorcycle Courier Dot along Line */}
                <motion.circle
                  animate={{
                    cx: [FLAGSHIP_COORDS.x, currentZone.mapCoords.x],
                    cy: [FLAGSHIP_COORDS.y, currentZone.mapCoords.y],
                  }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  r={5}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                  className="shadow-lg"
                />
              </svg>
            </div>

            {/* Bottom Live Metrics */}
            <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-[11px] font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">COURIER</span>
                <strong className="text-white truncate block">{currentZone.courierType.split(' ')[0]}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">AVG SPEED</span>
                <strong className="text-emerald-400 block">32 km/h</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EST. TIME</span>
                <strong className="text-amber-300 block">{currentZone.etaMinutes}</strong>
              </div>
            </div>
          </div>

          {/* Right: Calculations & Pricing Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Selected Subcity
                  </span>
                  <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    {currentZone.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Delivery ETA</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentZone.etaMinutes}
                  </span>
                </div>
              </div>

              {/* Order Value Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Simulate Medicine Cart Value:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-sm font-black font-mono">
                    {formatCurrency(estimatedOrderValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={estimatedOrderValue}
                  onChange={(e) => setEstimatedOrderValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>200 ETB</span>
                  <span>Free over: {formatCurrency(currentZone.freeAbove)}</span>
                  <span>2,500+ ETB</span>
                </div>
              </div>

              {/* Cost Summary Box */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Standard Zone Delivery:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(currentZone.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Free Threshold Waiver:</span>
                  <span className={`font-mono font-bold ${isFreeDelivery ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isFreeDelivery ? `-${formatCurrency(currentZone.deliveryFee)} (100% OFF)` : '0 ETB'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-900 text-sm font-black text-slate-900 dark:text-white">
                  <span>Delivery Total:</span>
                  <span className={`font-mono ${isFreeDelivery ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {isFreeDelivery ? 'FREE DELIVERY' : formatCurrency(effectiveFee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {onStartOrder && (
                <button
                  onClick={onStartOrder}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <span>Explore Medicines & Order</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <a
                href="tel:+251911234567"
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs py-2 rounded-xl transition border border-emerald-300 dark:border-emerald-800 flex items-center justify-center gap-2"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span>Call Bole Dispatch Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
