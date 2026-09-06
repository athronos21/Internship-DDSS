import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Pill,
  DollarSign,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ShieldCheck,
  Activity,
  Sparkles,
  Thermometer,
  Percent,
  Users,
  CreditCard,
  Smartphone,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  ChevronDown,
  Printer,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PharmacyNode, MasterCatalogItem } from './MasterAdminView';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface PharmacyAnalyticsViewProps {
  pharmacyFleet: PharmacyNode[];
  masterCatalog?: MasterCatalogItem[];
  onInspectNode?: (node: PharmacyNode) => void;
  onSwitchToStoreWorkstation?: (storeId?: string, targetView?: string) => void;
}

type TimeframeOption = 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'YEAR_TO_DATE';

// Color palettes for polished visualization
const THEME_COLORS = {
  indigo: '#4f46e5',
  teal: '#0d9488',
  emerald: '#10b981',
  sky: '#0284c7',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#8b5cf6',
  slate: '#64748b',
};

const CATEGORY_PIE_COLORS = [
  '#4f46e5', // Antibiotics (Indigo)
  '#0d9488', // Cardiovascular (Teal)
  '#f59e0b', // Analgesics (Amber)
  '#0284c7', // Antidiabetics (Sky)
  '#8b5cf6', // GI & Antacids (Purple)
  '#10b981', // Respiratory (Emerald)
  '#ec4899', // Maternal & Pediatric (Pink)
  '#f43f5e', // Cold Chain & Vaccines (Rose)
  '#64748b', // Others (Slate)
];

const PAYMENT_COLORS = ['#0070ba', '#8b5cf6', '#10b981', '#f59e0b'];

export const PharmacyAnalyticsView: React.FC<PharmacyAnalyticsViewProps> = ({
  pharmacyFleet,
  masterCatalog = [],
  onInspectNode,
  onSwitchToStoreWorkstation,
}) => {
  const { showToast } = useToast();

  const [timeframe, setTimeframe] = useState<TimeframeOption>('LAST_30_DAYS');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ALL');
  const [selectedTherapeuticClass, setSelectedTherapeuticClass] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected node details
  const activeNode = useMemo(() => {
    if (selectedNodeId === 'ALL') return null;
    return pharmacyFleet.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, pharmacyFleet]);

  // Scaled GMV & Prescriptions based on selected node & timeframe
  const metricsMultiplier = useMemo(() => {
    let tfMult = 1.0;
    if (timeframe === 'LAST_7_DAYS') tfMult = 0.25;
    if (timeframe === 'LAST_90_DAYS') tfMult = 2.85;
    if (timeframe === 'YEAR_TO_DATE') tfMult = 8.2;

    if (activeNode) {
      // Fraction of network
      const totalFleetGmv = pharmacyFleet.reduce((acc, n) => acc + (n.monthlyGmv || 0), 0) || 1;
      const nodeFraction = (activeNode.monthlyGmv || 1000000) / totalFleetGmv;
      return tfMult * nodeFraction * pharmacyFleet.length; // Normalized
    }
    return tfMult;
  }, [timeframe, activeNode, pharmacyFleet]);

  // 1. Daily Dispensing & Revenue Velocity Data (30 Points or 7 points)
  const dailyDispensingTrend = useMemo(() => {
    const days = timeframe === 'LAST_7_DAYS' ? 7 : timeframe === 'LAST_90_DAYS' ? 12 : 30;
    const baseGmvPerDay = (7285000 / 30) * (activeNode ? (activeNode.monthlyGmv / 7285000) * 1.5 : 1);
    const baseRxPerDay = (38420 / 30) * (activeNode ? (activeNode.monthlyGmv / 7285000) * 1.5 : 1);

    const list = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Natural fluctuation
      const noise = 0.88 + Math.sin(i * 0.8) * 0.18 + ((i % 5 === 0) ? 0.12 : -0.05);
      const gmv = Math.round(baseGmvPerDay * noise);
      const prescriptions = Math.round(baseRxPerDay * noise);
      const otcSales = Math.round(gmv * 0.24);
      const rxSales = gmv - otcSales;
      const avgBasket = Math.round(gmv / (prescriptions || 1));

      list.push({
        date: dayLabel,
        gmv,
        prescriptions,
        rxSales,
        otcSales,
        avgBasket,
      });
    }
    return list;
  }, [timeframe, activeNode]);

  // 2. Hourly Dispensing Rush Heatmap Data (08:00 to 22:00)
  const hourlyTrafficData = useMemo(() => {
    const hours = [
      { hour: '08:00', patients: 28, rxVolume: 34, avgWaitMin: 4 },
      { hour: '09:00', patients: 68, rxVolume: 92, avgWaitMin: 9 },
      { hour: '10:00', patients: 94, rxVolume: 135, avgWaitMin: 14 },
      { hour: '11:00', patients: 88, rxVolume: 120, avgWaitMin: 12 },
      { hour: '12:00', patients: 52, rxVolume: 74, avgWaitMin: 6 },
      { hour: '13:00', patients: 45, rxVolume: 61, avgWaitMin: 5 },
      { hour: '14:00', patients: 62, rxVolume: 85, avgWaitMin: 7 },
      { hour: '15:00', patients: 76, rxVolume: 104, avgWaitMin: 10 },
      { hour: '16:00', patients: 112, rxVolume: 156, avgWaitMin: 16 }, // Evening rush
      { hour: '17:00', patients: 128, rxVolume: 178, avgWaitMin: 18 }, // Peak rush
      { hour: '18:00', patients: 105, rxVolume: 144, avgWaitMin: 13 },
      { hour: '19:00', patients: 78, rxVolume: 98, avgWaitMin: 8 },
      { hour: '20:00', patients: 44, rxVolume: 58, avgWaitMin: 5 },
      { hour: '21:00', patients: 26, rxVolume: 32, avgWaitMin: 3 },
    ];
    return hours.map((h) => ({
      ...h,
      rxVolume: Math.round(h.rxVolume * (activeNode ? 0.35 : 1)),
      patients: Math.round(h.patients * (activeNode ? 0.35 : 1)),
    }));
  }, [activeNode]);

  // 3. Therapeutic Drug Category Breakdown
  const therapeuticCategoryData = useMemo(() => {
    return [
      { name: 'Antimicrobials & Antibiotics', value: 2180000, percentage: 30.0, units: 14200, growth: '+8.4%' },
      { name: 'Cardiovascular & Antihypertensives', value: 1675000, percentage: 23.0, units: 9800, growth: '+14.2%' },
      { name: 'Analgesics & Antipyretics (NSAIDs)', value: 1020000, percentage: 14.0, units: 18500, growth: '+3.1%' },
      { name: 'Antidiabetic Agents (Oral & Insulins)', value: 875000, percentage: 12.0, units: 6200, growth: '+19.5%' },
      { name: 'Gastrointestinal & Antacids', value: 580000, percentage: 8.0, units: 5400, growth: '+5.0%' },
      { name: 'Respiratory & Antiasthmatics', value: 435000, percentage: 6.0, units: 3900, growth: '+11.2%' },
      { name: 'Maternal, Pediatric & Nutritional', value: 290000, percentage: 4.0, units: 4800, growth: '+7.8%' },
      { name: 'Cold-Chain Biologicals & Vaccines', value: 230000, percentage: 3.0, units: 1100, growth: '+22.0%' },
    ];
  }, []);

  // 4. Prescription vs OTC vs Chronic Refills Mix
  const prescriptionMixData = useMemo(() => {
    return [
      { name: 'Chronic Disease Care (Refills)', value: 42, color: '#4f46e5', desc: 'Hypertension, Diabetes, Asthma maintenance' },
      { name: 'Acute Prescription Orders (Rx)', value: 32, color: '#0d9488', desc: 'Antibiotics, post-op, acute infections' },
      { name: 'Over-The-Counter (OTC Self-Care)', value: 22, color: '#f59e0b', desc: 'Analgesics, ORS, topical, cough & cold' },
      { name: 'Regulated & Controlled (Sched II)', value: 4, color: '#f43f5e', desc: 'Strict serial prescription log required' },
    ];
  }, []);

  // 5. Payment Channel Breakdown
  const paymentChannelData = useMemo(() => {
    return [
      { name: 'Telebirr SuperApp', value: 4516700, percentage: 62, count: 23820, feePercent: 0.8 },
      { name: 'CBE Birr / Mobile Banking', value: 2039800, percentage: 28, count: 10750, feePercent: 0.5 },
      { name: 'Over-The-Counter Cash Float', value: 582800, percentage: 8, count: 3240, feePercent: 0.0 },
      { name: 'Private Health Insurance / Credit', value: 145700, percentage: 2, count: 610, feePercent: 1.5 },
    ];
  }, []);

  // 6. FEFO Shelf Expiry Risk Pipeline across Branches
  const expiryRiskData = useMemo(() => {
    return [
      {
        horizon: '< 30 Days (Critical Action)',
        value: 142000,
        skuCount: 18,
        color: '#f43f5e',
        action: 'Mandatory return to supplier or clearance discount',
      },
      {
        horizon: '31 - 90 Days (Warning Window)',
        value: 385000,
        skuCount: 44,
        color: '#f59e0b',
        action: 'Front-shelf FEFO rotation & inter-branch transfer',
      },
      {
        horizon: '91 - 180 Days (Monitoring)',
        value: 920000,
        skuCount: 112,
        color: '#0284c7',
        action: 'Standard dispensing prioritization',
      },
      {
        horizon: '> 180 Days (Optimal Fresh)',
        value: 4850000,
        skuCount: 486,
        color: '#10b981',
        action: 'Healthy pipeline with zero expiry hazard',
      },
    ];
  }, []);

  // 7. Top 10 Fast-Moving Medicines (National & Branch Level)
  const top10FastMovers = useMemo(() => {
    return [
      { rank: 1, name: 'Amoxicillin 500mg Capsule', brand: 'Ethiopian Pharma (EPHARM)', category: 'Antibiotic', units: 4820, revenue: 385600, stockStatus: 'IN_STOCK', availability: 98 },
      { rank: 2, name: 'Paracetamol 500mg Tablet', brand: 'Cadila / Remedica', category: 'Analgesic', units: 7100, revenue: 142000, stockStatus: 'IN_STOCK', availability: 100 },
      { rank: 3, name: 'Metformin 500mg Tablet', brand: 'Merck / Julphar', category: 'Antidiabetic', units: 3650, revenue: 219000, stockStatus: 'IN_STOCK', availability: 96 },
      { rank: 4, name: 'Omeprazole 20mg Delayed-Release', brand: 'AstraZeneca / Cipla', category: 'GI & Antacid', units: 3420, revenue: 273600, stockStatus: 'IN_STOCK', availability: 94 },
      { rank: 5, name: 'Ciprofloxacin 500mg Tablet', brand: 'Bayer / Medochemie', category: 'Antibiotic', units: 2890, revenue: 346800, stockStatus: 'IN_STOCK', availability: 91 },
      { rank: 6, name: 'Azithromycin 500mg Tablet', brand: 'Pfizer / Zithromax', category: 'Antibiotic', units: 2150, revenue: 451500, stockStatus: 'LOW_STOCK', availability: 78 },
      { rank: 7, name: 'Amlodipine 5mg Tablet', brand: 'Pfizer / Norvasc', category: 'Cardiovascular', units: 2980, revenue: 238400, stockStatus: 'IN_STOCK', availability: 97 },
      { rank: 8, name: 'Artemether + Lumefantrine 20/120mg', brand: 'Novartis / Coartem', category: 'Antimalarial', units: 1850, revenue: 222000, stockStatus: 'IN_STOCK', availability: 95 },
      { rank: 9, name: 'Oral Rehydration Salts (ORS) + Zinc', brand: 'UNICEF / EPHARM', category: 'Pediatric/Nutrition', units: 4120, revenue: 123600, stockStatus: 'IN_STOCK', availability: 100 },
      { rank: 10, name: 'Human Insulin 70/30 (100 IU/ml)', brand: 'Novo Nordisk / Mixtard', category: 'Cold Chain Insulin', units: 890, revenue: 338200, stockStatus: 'CRITICAL', availability: 68 },
    ];
  }, []);

  // 8. Store-by-Store Operational Benchmarking
  const storeBenchmarkingData = useMemo(() => {
    return pharmacyFleet.map((node) => {
      const gmv = node.monthlyGmv || 1000000;
      const rxCount = Math.round(gmv / 188);
      const stockTurnover = (4.2 + (node.id === 'node-1' ? 1.4 : node.id === 'node-2' ? 0.8 : -0.3)).toFixed(1);
      const efdaAuditScore = node.status === 'ACTIVE' ? (94 + (node.coldChainReady ? 4 : 0)) : 82;
      const telebirrShare = 62 + (node.city === 'Addis Ababa' ? 4 : -2);
      const nearExpiryValue = Math.round(gmv * 0.045);

      return {
        ...node,
        gmv,
        rxCount,
        stockTurnover,
        efdaAuditScore,
        telebirrShare,
        nearExpiryValue,
      };
    });
  }, [pharmacyFleet]);

  // 9. Cold-chain Temperature Stability Log (2°C - 8°C)
  const coldChainTempLog = useMemo(() => {
    return [
      { time: '00:00', fridge1: 3.8, fridge2: 4.1, minLimit: 2.0, maxLimit: 8.0 },
      { time: '04:00', fridge1: 3.9, fridge2: 4.0, minLimit: 2.0, maxLimit: 8.0 },
      { time: '08:00', fridge1: 4.4, fridge2: 4.6, minLimit: 2.0, maxLimit: 8.0 },
      { time: '12:00', fridge1: 4.8, fridge2: 5.1, minLimit: 2.0, maxLimit: 8.0 },
      { time: '16:00', fridge1: 5.0, fridge2: 4.9, minLimit: 2.0, maxLimit: 8.0 },
      { time: '20:00', fridge1: 4.2, fridge2: 4.3, minLimit: 2.0, maxLimit: 8.0 },
      { time: '23:59', fridge1: 3.9, fridge2: 4.1, minLimit: 2.0, maxLimit: 8.0 },
    ];
  }, []);

  // Summary Totals
  const totalGmvComputed = useMemo(() => {
    if (activeNode) return Math.round(activeNode.monthlyGmv * metricsMultiplier);
    const sum = pharmacyFleet.reduce((acc, n) => acc + (n.monthlyGmv || 0), 0);
    return Math.round(sum * metricsMultiplier);
  }, [activeNode, pharmacyFleet, metricsMultiplier]);

  const totalRxComputed = useMemo(() => {
    return Math.round(totalGmvComputed / 189.6);
  }, [totalGmvComputed]);

  // Handler for manual refresh
  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Real-time POS and ERP dispensing telemetry synchronized across all nodes.', 'success', 'Telemetry Refreshed');
    }, 600);
  };

  // Handler for CSV Export
  const handleExportCsv = () => {
    const headers = ['Metric', 'Period', 'Branch', 'Value', 'Unit', 'Notes'];
    const rows = [
      ['Total Dispensing GMV', timeframe, selectedNodeId, totalGmvComputed, 'ETB', 'Consolidated Multi-Store'],
      ['Total Prescriptions', timeframe, selectedNodeId, totalRxComputed, 'Prescriptions', 'Dispensed & Logged'],
      ['Average Basket Size', timeframe, selectedNodeId, (totalGmvComputed / (totalRxComputed || 1)).toFixed(2), 'ETB', 'Per Customer Ticket'],
      ['Telebirr Share', timeframe, selectedNodeId, '62%', 'Percentage', 'Direct API Settlement'],
      ['CBE Birr Share', timeframe, selectedNodeId, '28%', 'Percentage', 'CBE Mobile Banking'],
      ['Cash Share', timeframe, selectedNodeId, '8%', 'Percentage', 'Cash Till Float'],
      ['Generic Dispensing Rate', timeframe, selectedNodeId, '74.2%', 'Percentage', 'EFDA Essential Medicine Standard'],
      ['Cold Chain Fridge Temp Avg', timeframe, selectedNodeId, '4.2', '°C', '2°C - 8°C Verified Stability'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ethiopian_Pharmacy_Fleet_Analytics_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Analytics summary exported as CSV for auditing and financial reports.', 'success', 'Export Complete');
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in">
      {/* ========================================================================= */}
      {/* 🧭 FILTER & DRILLDOWN COMMAND STRIP */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                National Pharmacy Fleet & Drug Store Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Comprehensive clinical dispensing volume, GMV velocity, FEFO shelf expiry risk, therapeutic drug category distribution, and EFDA regulatory stewardship across connected community and retail pharmacies.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefreshTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Export Analytics CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* Pharmacy Node Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-500 dark:text-slate-400">Node:</span>
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Network Fleet (6 Stores)</option>
                {pharmacyFleet.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.storeName} ({node.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Therapeutic Class Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5 text-xs">
              <Pill className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-500 dark:text-slate-400">Drug Class:</span>
              <select
                value={selectedTherapeuticClass}
                onChange={(e) => setSelectedTherapeuticClass(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Therapeutic Classes</option>
                <option value="ANTIBIOTICS">Antimicrobials & Antibiotics</option>
                <option value="CARDIO">Cardiovascular & Antihypertensives</option>
                <option value="DIABETES">Antidiabetic Agents</option>
                <option value="ANALGESIC">Analgesics & NSAIDs</option>
                <option value="COLD_CHAIN">Cold Chain & Insulins</option>
                <option value="GI">Gastrointestinal & Antacids</option>
              </select>
            </div>
          </div>

          {/* Timeframe Selector Pill Group */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeframe('LAST_7_DAYS')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                timeframe === 'LAST_7_DAYS'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('LAST_30_DAYS')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                timeframe === 'LAST_30_DAYS'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('LAST_90_DAYS')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                timeframe === 'LAST_90_DAYS'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              90 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('YEAR_TO_DATE')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                timeframe === 'YEAR_TO_DATE'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2026 YTD
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 TOP EXECUTIVE KPI METRICS (6 PILLARS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Gross Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Gross Dispensing GMV</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {formatCurrency(totalGmvComputed)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span>+18.4% vs prev cycle</span>
          </div>
        </div>

        {/* KPI 2: Prescriptions Filled */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Prescriptions Filled</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {totalRxComputed.toLocaleString()} Rx
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <span>Avg ticket:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">ETB 189.60</span>
          </div>
        </div>

        {/* KPI 3: Cashless Telebirr/CBE Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Cashless Settlement</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Smartphone className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            90.0%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-600 font-bold">
            <span>Telebirr 62% • CBE 28%</span>
          </div>
        </div>

        {/* KPI 4: Shelf In-Stock Availability */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Stock Availability</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            96.8%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold">
            <AlertTriangle className="h-3 w-3" />
            <span>2 Critical Shortages</span>
          </div>
        </div>

        {/* KPI 5: Generic Dispensing Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Generic Sub Rate</span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            74.2%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-bold">
            <span>Saved: ETB 1.42M</span>
          </div>
        </div>

        {/* KPI 6: Cold Chain Temp Compliance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Cold Chain Health</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-emerald-600">
            100%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Mean: 4.2°C (2–8°C safe)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📈 SECTION 1: DISPENSING REVENUE VELOCITY & HOURLY LOAD RUSH */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Daily Revenue & Prescription Dispensing Velocity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Prescription Dispensing & Revenue Velocity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                  Daily GMV & Ticket Volume
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Gross daily turnover in ETB alongside validated doctor prescriptions dispensed at counter terminals.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-slate-600 dark:text-slate-300">Revenue (ETB)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-slate-600 dark:text-slate-300">Prescriptions (Rx)</span>
              </div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyDispensingTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `ETB ${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} Rx`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const gmvVal = payload[0].value as number;
                      const rxVal = payload[1]?.value as number;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
                          <div className="font-extrabold text-slate-300 pb-1 border-b border-slate-800">
                            {label}
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-indigo-300">Revenue (GMV):</span>
                            <span className="font-bold font-mono text-white">{formatCurrency(gmvVal)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-teal-300">Prescriptions:</span>
                            <span className="font-bold font-mono text-white">{rxVal} Rx</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                            <span>Avg Ticket:</span>
                            <span className="font-mono text-slate-200">ETB {Math.round(gmvVal / (rxVal || 1))}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="gmv"
                  name="Gross Revenue (ETB)"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gmvGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="prescriptions"
                  name="Prescriptions (Rx)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#rxGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hourly Dispensing Peak Load Heatmap */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Peak Dispensing Rush Hours</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                Staffing Optimization
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hourly patient traffic and dispensing queue wait times to guide clinical shift allocations.
            </p>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrafficData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                          <div className="font-extrabold text-amber-400">{label} Window</div>
                          <div>Rx Items: <span className="font-bold font-mono">{data.rxVolume}</span></div>
                          <div>Patients: <span className="font-bold font-mono">{data.patients}</span></div>
                          <div className="text-[11px] text-slate-300">Avg Wait: <span className="font-bold text-emerald-400">{data.avgWaitMin} min</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rxVolume" name="Prescriptions Dispensed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              <span>Primary Rush: 16:30 – 19:30 (Evening Commute)</span>
            </div>
            <p>Recommended: 3 Pharmacists on primary dispensing counters during peak hours to maintain &lt;10 min wait time.</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💊 SECTION 2: THERAPEUTIC CATEGORY BREAKDOWN & PRESCRIPTION MIX */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Therapeutic Category Breakdown (Donut + Table) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>Therapeutic Drug Category Distribution</span>
              </h3>
              <p className="text-xs text-slate-500">
                Dispensing share by pharmacology class, essential drug prioritization, and monthly turnover.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              8 Pharmacological Classes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Pie / Donut Chart */}
            <div className="md:col-span-5 h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={therapeuticCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {therapeuticCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_PIE_COLORS[index % CATEGORY_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Monthly GMV']}
                    contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Table */}
            <div className="md:col-span-7 space-y-2">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar text-xs">
                {therapeuticCategoryData.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_PIE_COLORS[idx % CATEGORY_PIE_COLORS.length] }}
                      />
                      <div className="truncate">
                        <div className="font-extrabold text-slate-900 dark:text-white truncate">{cat.name}</div>
                        <div className="text-[10px] text-slate-400">{cat.units.toLocaleString()} units dispensed</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black font-mono text-slate-900 dark:text-white">
                        {formatCurrency(cat.value)}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600">{cat.percentage}% ({cat.growth})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Prescription Mix (Rx vs OTC vs Chronic) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                <span>Clinical Dispensing Profile</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                EFDA Standards
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Distribution of Chronic Care repeat programs, acute doctor prescriptions, OTC self-care, and controlled registers.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {prescriptionMixData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </span>
                  <span className="font-black font-mono text-slate-900 dark:text-white">{item.value}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 pl-4.5">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold">Chronic Care Loyalty:</span> 42% of volume represents repeating hypertension & diabetes patients, securing steady monthly demand predictability.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💳 SECTION 3: CASHLESS PAYMENT CHANNELS & FEFO SHELF EXPIRY PIPELINE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 5: Cashless Payment Channels Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                <span>Payment Settlement Channels</span>
              </h3>
              <p className="text-xs text-slate-500">
                National digital payments share with Telebirr, CBE Birr, and cash reconciliation.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
              90% Digital
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {paymentChannelData.map((channel, i) => (
              <div
                key={channel.name}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }}
                    />
                    <span className="font-black text-slate-900 dark:text-white">{channel.name}</span>
                  </div>
                  <span className="font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(channel.value)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${channel.percentage}%`,
                      backgroundColor: PAYMENT_COLORS[i % PAYMENT_COLORS.length],
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>{channel.count.toLocaleString()} Transactions ({channel.percentage}%)</span>
                  <span>Est. Gateway Fee: {channel.feePercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 6: Shelf Expiry & FEFO Inventory Risk Pipeline */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>FEFO Inventory Expiry Risk Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  First-Expired-First-Out stock valuation by remaining shelf life horizon across all warehouse & shelf locations.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                FEFO Compliance Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {expiryRiskData.map((item) => (
              <div
                key={item.horizon}
                className="p-4 rounded-2xl border space-y-2"
                style={{
                  borderColor: `${item.color}30`,
                  backgroundColor: `${item.color}08`,
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold" style={{ color: item.color }}>
                    {item.horizon}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    {item.skuCount} SKUs
                  </span>
                </div>

                <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {formatCurrency(item.value)}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {item.action}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                Total At-Risk Stock (&lt; 90 Days): <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(142000 + 385000)}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast('Initiated inter-branch stock rebalancing recommendation for near-expiry medicines.', 'info', 'Rebalance Triggered');
              }}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Rebalance Stock
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏆 SECTION 4: TOP 10 FAST-MOVING MEDICINES & BRANCH BENCHMARKING */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 Fast-Moving Medicines Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Top 10 High-Velocity Medicines (Fast-Movers)</span>
              </h3>
              <p className="text-xs text-slate-500">Highest-turnover pharmaceutical SKUs driving patient footfall and revenues.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Essential Drug Index</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Medicine & Form</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Units Dispensed</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4 text-right">In-Stock Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {top10FastMovers.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-black text-slate-400 font-mono">{item.rank}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.brand}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {item.units.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.availability >= 90
                                ? 'bg-emerald-500'
                                : item.availability >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.availability}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                          {item.availability}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store-by-Store Operational Benchmarking Matrix */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Multi-Store Fleet Benchmarking</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                6 Operating Nodes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Comparative review of revenue efficiency, prescription fill rates, and regulatory compliance.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {storeBenchmarkingData.map((node) => (
              <div
                key={node.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{node.storeName}</span>
                      <span className="text-[10px] font-medium text-slate-400">({node.city})</span>
                    </div>
                    <div className="text-[10px] text-slate-500">License: {node.efdaLicense}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(node.gmv)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{node.rxCount.toLocaleString()} Rx</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-400">Stock Turn:</span>{' '}
                    <strong className="text-slate-700 dark:text-slate-300 font-mono">{node.stockTurnover}x</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Telebirr:</span>{' '}
                    <strong className="text-emerald-600 font-mono">{node.telebirrShare}%</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Audit:</span>{' '}
                    <strong className="text-indigo-600 font-mono">{node.efdaAuditScore}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Audit Standard: EFDA Directive 98/2022</span>
            <span className="font-bold text-emerald-600">All 6 Stores Compliant</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛡️ SECTION 5: ANTIMICROBIAL STEWARDSHIP & COLD-CHAIN DIGITAL LOGGER */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHO & EFDA Antimicrobial Resistance (AMR) AWaRe Classification */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Antimicrobial Stewardship (WHO AWaRe Classification)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Stewardship tracking to prevent antibiotic resistance as mandated by the Ministry of Health and EFDA.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
              WHO Target Met
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Access Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-600">ACCESS Group (First-line, narrow spectrum)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">66.5% (WHO Target &gt;= 60%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: '66.5%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Amoxicillin, Doxycycline, Ampicillin, Cotrimoxazole</p>
            </div>

            {/* Watch Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-500">WATCH Group (Higher resistance potential)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">26.8%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500" style={{ width: '26.8%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Ciprofloxacin, Azithromycin, Ceftriaxone, Levofloxacin</p>
            </div>

            {/* Reserve Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-500">RESERVE Group (Last-resort antibiotics)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">6.7%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-rose-500" style={{ width: '6.7%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Meropenem, Linezolid, Colistin, Vancomycin (Hospital Rx verified)</p>
            </div>
          </div>
        </div>

        {/* Cold-Chain 24H Continuous Digital Logger Temperature Stability */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-emerald-600" />
                <span>Cold-Chain 24-Hour Digital Logger Logs (2°C – 8°C)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Continuous IoT telemetry tracking vaccine & insulin refrigerators with zero temperature excursion.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              0 Excursions
            </span>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={coldChainTempLog} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}°C`} />
                <Tooltip
                  formatter={(val: any) => [`${val}°C`, 'Temperature']}
                  contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', color: '#fff', border: 'none' }}
                />
                <Line type="monotone" dataKey="fridge1" name="Addis Refrigerator #1" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="fridge2" name="Hawassa Refrigerator #2" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <span>Biological Integrity: Insulins, Vaccines, Tetanus Toxoid, Anti-Rabies</span>
            <span className="font-bold">Active Solar Battery Backup Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
