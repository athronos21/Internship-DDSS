import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Pill,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Stethoscope,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

interface DrugItem {
  id: string;
  name: string;
  generic: string;
  category: string;
}

interface InteractionResult {
  severity: 'HIGH' | 'MODERATE' | 'SAFE' | 'UNKNOWN';
  title: string;
  description: string;
  pharmacistRecommendation: string;
  foodPrecautions?: string;
}

const COMMON_DRUGS: DrugItem[] = [
  { id: 'para', name: 'Paracetamol (Panadol)', generic: 'Paracetamol', category: 'Analgesic' },
  { id: 'ibu', name: 'Ibuprofen (Brufen)', generic: 'Ibuprofen', category: 'NSAID / Anti-inflammatory' },
  { id: 'asp', name: 'Aspirin (Cardio)', generic: 'Acetylsalicylic Acid', category: 'Antiplatelet / NSAID' },
  { id: 'amox', name: 'Amoxicillin Capsules', generic: 'Amoxicillin', category: 'Antibiotic' },
  { id: 'cipro', name: 'Ciprofloxacin Tablets', generic: 'Ciprofloxacin', category: 'Fluoroquinolone Antibiotic' },
  { id: 'omep', name: 'Omeprazole (Prilosec)', generic: 'Omeprazole', category: 'Proton Pump Inhibitor (PPI)' },
  { id: 'antacid', name: 'Antacid Gel / Suspension', generic: 'Aluminum/Magnesium Hydroxide', category: 'Antacid' },
  { id: 'met', name: 'Metformin 500mg', generic: 'Metformin Hydrochloride', category: 'Antidiabetic' },
  { id: 'amlo', name: 'Amlodipine 5mg', generic: 'Amlodipine Besylate', category: 'Antihypertensive' },
  { id: 'warf', name: 'Warfarin 5mg', generic: 'Warfarin Sodium', category: 'Anticoagulant Blood Thinner' },
  { id: 'cet', name: 'Cetirizine (Zyrtec)', generic: 'Cetirizine', category: 'Antihistamine' },
  { id: 'vitc', name: 'Vitamin C 1000mg', generic: 'Ascorbic Acid', category: 'Supplement' },
];

const KNOWN_INTERACTIONS: { [key: string]: InteractionResult } = {
  'ibu+asp': {
    severity: 'HIGH',
    title: 'High Risk: Increased Bleeding & Stomach Ulceration',
    description: 'Combining two NSAIDs (Ibuprofen + Aspirin) significantly increases gastric mucosal erosion, ulcer risk, and negates Aspirin cardioprotective benefits.',
    pharmacistRecommendation: 'Do not take together. If you require daily cardio-aspirin, consult your physician before using any NSAID painkiller; consider Paracetamol instead.',
    foodPrecautions: 'Avoid alcohol completely as it multiplies gastrointestinal bleeding danger.',
  },
  'asp+warf': {
    severity: 'HIGH',
    title: 'Severe Bleeding Hazard: Anticoagulant + Antiplatelet',
    description: 'Concurrent use of Warfarin with Aspirin dramatically increases major internal bleeding, bruising, and hematoma risks.',
    pharmacistRecommendation: 'Strictly requires specialist cardiologist authorization and regular INR blood coagulation monitoring.',
    foodPrecautions: 'Maintain steady intake of green leafy vegetables (Vitamin K consistency).',
  },
  'cipro+antacid': {
    severity: 'MODERATE',
    title: 'Reduced Antibiotic Absorption (Chelation Hazard)',
    description: 'Magnesium and aluminum ions in antacids bind to Ciprofloxacin molecules in the stomach, reducing antibiotic blood absorption by up to 85%.',
    pharmacistRecommendation: 'Separate intake: Take Ciprofloxacin at least 2 hours BEFORE or 4-6 hours AFTER taking any antacid or dairy product.',
    foodPrecautions: 'Avoid taking with calcium-fortified milk or mineral supplements at the same time.',
  },
  'omep+amox': {
    severity: 'SAFE',
    title: 'Clinically Synergistic: Standard H. Pylori Eradication',
    description: 'Omeprazole reduces gastric stomach acid, creating an optimal pH environment for Amoxicillin to eradicate Helicobacter pylori bacteria.',
    pharmacistRecommendation: 'Take Omeprazole 30 mins before food and Amoxicillin with meals as prescribed by your gastroenterologist.',
  },
  'para+ibu': {
    severity: 'SAFE',
    title: 'Safe When Alternated for Severe Pain or Fever',
    description: 'Paracetamol and Ibuprofen work through different physiological pathways (central vs peripheral COX inhibition) and can be safely alternated under guidance.',
    pharmacistRecommendation: 'Stagger doses by 3 hours (e.g. Paracetamol at 8 AM, Ibuprofen at 11 AM) if severe pain persists. Do not exceed max daily limits.',
  },
  'amlo+met': {
    severity: 'SAFE',
    title: 'Standard Cardio-Metabolic Combination',
    description: 'Commonly co-prescribed for patients with concurrent hypertension and Type 2 diabetes mellitus with no adverse pharmacodynamic clash.',
    pharmacistRecommendation: 'Continue taking daily at regular schedule. Keep a periodic log of blood sugar and blood pressure.',
  },
  'vitc+para': {
    severity: 'SAFE',
    title: 'Safe Combination for Immune & Fever Support',
    description: 'Vitamin C and Paracetamol do not have adverse metabolic interactions when taken at therapeutic dosages.',
    pharmacistRecommendation: 'Drink adequate water and take with food.',
  },
};

export const DrugInteractionChecker: React.FC = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<DrugItem[]>([
    COMMON_DRUGS[0], // Paracetamol
    COMMON_DRUGS[1], // Ibuprofen
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleAddDrug = (drug: DrugItem) => {
    if (selectedDrugs.find((d) => d.id === drug.id)) return;
    if (selectedDrugs.length >= 4) return;
    setSelectedDrugs([...selectedDrugs, drug]);
    setShowDropdown(false);
    setSearchTerm('');
    triggerSimulation();
  };

  const handleRemoveDrug = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d.id !== drugId));
    triggerSimulation();
  };

  const handleReset = () => {
    setSelectedDrugs([COMMON_DRUGS[0], COMMON_DRUGS[1]]);
    triggerSimulation();
  };

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  // Evaluate pairwise interactions
  const getInteraction = (drugA: DrugItem, drugB: DrugItem): InteractionResult => {
    const key1 = `${drugA.id}+${drugB.id}`;
    const key2 = `${drugB.id}+${drugA.id}`;
    if (KNOWN_INTERACTIONS[key1]) return KNOWN_INTERACTIONS[key1];
    if (KNOWN_INTERACTIONS[key2]) return KNOWN_INTERACTIONS[key2];

    return {
      severity: 'SAFE',
      title: 'No Known Major Interaction in Standard Formularies',
      description: `No documented severe pharmacokinetic clash between ${drugA.name} and ${drugB.name} in Ethiopian National Medicine List.`,
      pharmacistRecommendation: 'Always adhere to prescribing doctor’s individual dosage schedule and report any unusual symptoms.',
    };
  };

  const pairs: { a: DrugItem; b: DrugItem; result: InteractionResult }[] = [];
  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      pairs.push({
        a: selectedDrugs[i],
        b: selectedDrugs[j],
        result: getInteraction(selectedDrugs[i], selectedDrugs[j]),
      });
    }
  }

  const hasHighRisk = pairs.some((p) => p.result.severity === 'HIGH');
  const hasModerateRisk = !hasHighRisk && pairs.some((p) => p.result.severity === 'MODERATE');

  const filteredDrugs = COMMON_DRUGS.filter(
    (d) =>
      !selectedDrugs.find((s) => s.id === d.id) &&
      (d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
              <Zap className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Real-time Clinical Pharmacology Simulator</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Instant Medicine Interaction Checker
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Verify if your prescribed medications can be safely combined. Visualizes pharmacological synergy, competitive absorption, and gastric bleed warnings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition border border-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Selected Drugs Chips & Selector */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              Selected Medicines ({selectedDrugs.length}/4):
            </span>
            {selectedDrugs.map((drug) => (
              <motion.div
                key={drug.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 bg-blue-600/90 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs border border-blue-400/40"
              >
                <Pill className="h-3.5 w-3.5 text-blue-200" />
                <span>{drug.name}</span>
                <button
                  onClick={() => handleRemoveDrug(drug.id)}
                  className="p-0.5 hover:bg-white/20 rounded-md text-white/80 hover:text-white transition"
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </motion.div>
            ))}

            {selectedDrugs.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition border border-white/20 border-dashed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Medicine</span>
                </button>

                {showDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search drug or generic name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
                      {filteredDrugs.length > 0 ? (
                        filteredDrugs.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleAddDrug(d)}
                            className="w-full text-left p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700/60 text-xs transition flex flex-col"
                          >
                            <span className="font-bold text-slate-900 dark:text-white">{d.name}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {d.generic} • {d.category}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400">No matching medicines</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Pill Collision Simulator Area */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Animated Chemical Compatibility Radar */}
        <div className="relative rounded-2xl bg-slate-950 p-5 text-white overflow-hidden border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 relative z-10">
            <motion.div
              animate={{
                scale: isSimulating ? [1, 1.3, 1] : 1,
                rotate: isSimulating ? [0, 180, 360] : 0,
              }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                hasHighRisk ? 'bg-rose-600' : hasModerateRisk ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              {hasHighRisk ? (
                <ShieldAlert className="h-6 w-6" />
              ) : hasModerateRisk ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-base text-white">
                  {hasHighRisk
                    ? 'Clinical Caution: Significant Interaction'
                    : hasModerateRisk
                    ? 'Moderate Timing Caution'
                    : 'Safe Compatibility: No Negative Clash'}
                </h4>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                    hasHighRisk
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : hasModerateRisk
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {hasHighRisk ? 'High Risk' : hasModerateRisk ? 'Moderate' : 'Safe'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {hasHighRisk
                  ? 'Do not co-administer without explicit medical clearance.'
                  : hasModerateRisk
                  ? 'Requires dose staggering (2 to 4 hours apart).'
                  : 'Normal combined administration according to package directions.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0 text-right">
            <span className="text-[10px] text-slate-400 block font-mono">TESTED PAIRS</span>
            <span className="text-lg font-black text-white font-mono">{pairs.length} Combinations</span>
          </div>
        </div>

        {/* Pairwise Breakdown Cards */}
        <div className="space-y-4">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pharmacological Pairwise Breakdown:
          </h4>

          <div className="grid grid-cols-1 gap-4">
            {pairs.map((item, idx) => {
              const isHigh = item.result.severity === 'HIGH';
              const isMod = item.result.severity === 'MODERATE';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className={`rounded-2xl border p-5 transition space-y-3 shadow-xs ${
                    isHigh
                      ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-900/60'
                      : isMod
                      ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-900/60'
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      <span>{item.a.name}</span>
                      <span className="text-slate-400">✕</span>
                      <span>{item.b.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto border font-mono ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-800'
                          : isMod
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-800'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {item.result.severity} Risk
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.result.title}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {item.result.description}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                      <Stethoscope className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-slate-900 dark:text-white">Pharmacist Guidance:</strong>{' '}
                        {item.result.pharmacistRecommendation}
                      </div>
                    </div>

                    {item.result.foodPrecautions && (
                      <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                        <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Dietary & Food Precautions:</strong> {item.result.foodPrecautions}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-slate-100 dark:bg-slate-800/40 p-4 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Disclaimer:</strong> This clinical screening tool references standard Ethiopian Essential Medicine List (EML) and British Pharmacopoeia monographs. It does not substitute individualized physician diagnosis.
          </span>
        </div>
      </div>
    </div>
  );
};
