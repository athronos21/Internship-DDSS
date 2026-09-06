import React, { useState } from 'react';
import {
  Sparkles,
  HeartPulse,
  Pill,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Info,
  Stethoscope,
  ChevronRight,
  Flame,
  Activity,
  Baby,
  Thermometer,
  Zap,
} from 'lucide-react';
import { Medicine } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface HealthGuideWizardProps {
  onSelectMedicine?: (medicineName: string) => void;
  onReserveMedicine?: (medicine: Partial<Medicine>) => void;
  onExploreCategory?: (category: string) => void;
}

interface HealthCondition {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  bgLight: string;
  description: string;
  typicalSymptoms: string[];
  recommendedMeds: {
    name: string;
    genericName: string;
    dosageForm: string;
    strength: string;
    estimatedPrice: number;
    rxRequired: boolean;
    usageNote: string;
    caution: string;
  }[];
  lifestyleTips: string[];
  whenToSeeDoctor: string;
}

const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'fever_pain',
    name: 'Fever, Headache & Body Aches',
    category: 'Analgesics',
    icon: Thermometer,
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60',
    description: 'Relief for acute mild-to-moderate pain, tension headache, toothache, and fever spikes.',
    typicalSymptoms: ['High body temperature (>37.5°C)', 'Throbbing headache', 'Joint / muscle stiffness', 'Fatigue'],
    recommendedMeds: [
      {
        name: 'Paracetamol 500mg Tablets',
        genericName: 'Paracetamol / Acetaminophen',
        dosageForm: 'Tablet',
        strength: '500mg',
        estimatedPrice: 120,
        rxRequired: false,
        usageNote: 'Adults: 1-2 tablets every 6 hours (Max 4g/day). Take with water after food.',
        caution: 'Do not combine with other paracetamol-containing products. Avoid alcohol.',
      },
      {
        name: 'Ibuprofen 400mg Film-Coated',
        genericName: 'Ibuprofen BP',
        dosageForm: 'Tablet',
        strength: '400mg',
        estimatedPrice: 180,
        rxRequired: false,
        usageNote: '1 tablet every 8 hours after meals. Provides anti-inflammatory relief.',
        caution: 'Avoid if you have active gastric ulcer or severe kidney impairment.',
      },
    ],
    lifestyleTips: [
      'Drink plenty of clean fluids (warm water, herbal tea, ORS).',
      'Rest in a cool, well-ventilated room with light clothing.',
      'Use lukewarm water sponge compresses on forehead if fever persists.',
    ],
    whenToSeeDoctor: 'Fever exceeding 39°C (102.2°F), lasting >3 days, or accompanied by stiff neck, rash, or confusion.',
  },
  {
    id: 'cough_flu',
    name: 'Cold, Cough & Flu Defense',
    category: 'Immune & Respiratory',
    icon: Activity,
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/60',
    description: 'Soothe respiratory irritation, nasal congestion, runny nose, and seasonal immune weakness.',
    typicalSymptoms: ['Runny or blocked nose', 'Dry or chesty cough', 'Sore scratchy throat', 'Sneezing'],
    recommendedMeds: [
      {
        name: 'Vitamin C 1000mg Effervescent',
        genericName: 'Ascorbic Acid + Zinc',
        dosageForm: 'Effervescent Tablet',
        strength: '1000mg + 10mg Zinc',
        estimatedPrice: 280,
        rxRequired: false,
        usageNote: 'Dissolve 1 tablet in 200ml glass of water once daily in the morning.',
        caution: 'Safe for daily use. Keep tube tightly closed to prevent moisture degradation.',
      },
      {
        name: 'Cetirizine 10mg Tablets',
        genericName: 'Cetirizine Hydrochloride',
        dosageForm: 'Tablet',
        strength: '10mg',
        estimatedPrice: 160,
        rxRequired: false,
        usageNote: '1 tablet at bedtime for relief of allergic rhinitis, sneezing, and runny nose.',
        caution: 'May cause mild drowsiness in sensitive individuals. Avoid operating heavy machinery.',
      },
    ],
    lifestyleTips: [
      'Perform warm steam inhalations with eucalyptus or menthol for 10 minutes.',
      'Gargle with warm salt water (1/2 tsp salt in warm water) 3 times daily.',
      'Stay hydrated with warm lemon honey tea and natural soups.',
    ],
    whenToSeeDoctor: 'Difficulty breathing, wheezing, coughing up discolored blood, or symptoms lasting over 10 days.',
  },
  {
    id: 'acidity_gut',
    name: 'Gastric Acidity & Digestion',
    category: 'Gastrointestinal',
    icon: Flame,
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/60',
    description: 'Fast-acting relief for heartburn, acid reflux (GERD), gastritis, and stomach discomfort.',
    typicalSymptoms: ['Burning sensation behind breastbone (heartburn)', 'Acid regurgitation', 'Bloating', 'Upper abdominal burning'],
    recommendedMeds: [
      {
        name: 'Omeprazole 20mg Delayed-Release',
        genericName: 'Omeprazole BP',
        dosageForm: 'Capsule',
        strength: '20mg',
        estimatedPrice: 450,
        rxRequired: false,
        usageNote: 'Take 1 capsule in the morning 30-60 minutes BEFORE breakfast with water.',
        caution: 'Swallow whole, do not crush or chew the pellets inside.',
      },
      {
        name: 'Antacid Suspension Plus',
        genericName: 'Magnesium Hydroxide + Aluminum Hydroxide + Simethicone',
        dosageForm: 'Oral Suspension',
        strength: '200ml Bottle',
        estimatedPrice: 220,
        rxRequired: false,
        usageNote: '10-20ml (2-4 teaspoons) 1 hour after meals and at bedtime for immediate soothing.',
        caution: 'Shake well before use. Separate from other medications by at least 2 hours.',
      },
    ],
    lifestyleTips: [
      'Avoid spicy, deep-fried foods, citrus, excess coffee, and eating within 3 hours of sleeping.',
      'Elevate the head of your bed slightly (15-20cm) if nighttime reflux occurs.',
      'Eat smaller, more frequent meals rather than large heavy portions.',
    ],
    whenToSeeDoctor: 'Difficulty swallowing, unexplained weight loss, vomiting coffee-ground like material, or dark tarry stools.',
  },
  {
    id: 'chronic_hypertension',
    name: 'Blood Pressure & Heart Health',
    category: 'Cardiovascular',
    icon: HeartPulse,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60',
    description: 'Essential prescription refills, daily compliance, and blood pressure monitoring support.',
    typicalSymptoms: ['Often asymptomatic (silent)', 'Occasional morning headache', 'Dizziness', 'Palpitations'],
    recommendedMeds: [
      {
        name: 'Amlodipine 5mg Tablets',
        genericName: 'Amlodipine Besylate',
        dosageForm: 'Tablet',
        strength: '5mg',
        estimatedPrice: 320,
        rxRequired: true,
        usageNote: '1 tablet once daily at the same time each day, with or without food.',
        caution: 'Doctor prescription required. Monitor for mild ankle swelling and report to physician.',
      },
      {
        name: 'Atorvastatin 20mg Tablets',
        genericName: 'Atorvastatin Calcium',
        dosageForm: 'Tablet',
        strength: '20mg',
        estimatedPrice: 580,
        rxRequired: true,
        usageNote: '1 tablet once daily at night. Helps maintain healthy cholesterol levels.',
        caution: 'Prescription required. Regular liver enzyme & lipid panel testing recommended.',
      },
    ],
    lifestyleTips: [
      'Limit dietary sodium (salt) intake to less than 2,300mg/day.',
      'Engage in 30 minutes of moderate physical activity (e.g. brisk walking) 5 days a week.',
      'Keep a home blood pressure log and check at the same time morning and evening.',
    ],
    whenToSeeDoctor: 'Systolic BP >180 mmHg or diastolic >120 mmHg, sudden chest pain, shortness of breath, or visual changes.',
  },
  {
    id: 'pediatric_care',
    name: 'Baby & Child Wellness',
    category: 'Pediatrics',
    icon: Baby,
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/60',
    description: 'Safe, age-appropriate liquid formulations, ORS electrolyte therapy, and infant vitamins.',
    typicalSymptoms: ['Childhood fever', 'Dehydration from diarrhea', 'Teething pain', 'Colic'],
    recommendedMeds: [
      {
        name: 'Paracetamol Pediatric Syrup 120mg/5ml',
        genericName: 'Paracetamol Oral Solution',
        dosageForm: 'Syrup',
        strength: '120mg/5ml (100ml)',
        estimatedPrice: 180,
        rxRequired: false,
        usageNote: 'Dose strictly by child’s weight (10-15mg/kg every 6 hours). Use measuring syringe.',
        caution: 'Never use adult spoons. Do not exceed 4 doses in 24 hours.',
      },
      {
        name: 'WHO Oral Rehydration Salts (ORS + Zinc)',
        genericName: 'Low Osmolarity ORS Packets',
        dosageForm: 'Powder for Solution',
        strength: '5 Sachet Pack',
        estimatedPrice: 95,
        rxRequired: false,
        usageNote: 'Dissolve 1 sachet in exactly 1 Liter of clean boiled & cooled water. Give sips continuously.',
        caution: 'Discard made-up solution after 24 hours. Do not boil solution after mixing.',
      },
    ],
    lifestyleTips: [
      'Keep offering frequent small sips of fluid rather than large gulps.',
      'Continue regular feeding or breastfeeding during illness.',
      'Monitor child diaper wetness (at least 4-6 wet diapers per 24 hours).',
    ],
    whenToSeeDoctor: 'Child lethargic, unable to drink or breastfeed, sunken eyes, skin pinch goes back slowly, or fever in infant <3 months.',
  },
];

export const HealthGuideWizard: React.FC<HealthGuideWizardProps> = ({
  onSelectMedicine,
  onReserveMedicine,
  onExploreCategory,
}) => {
  const [selectedConditionId, setSelectedConditionId] = useState<string>('fever_pain');
  const [activeTab, setActiveTab] = useState<'MEDICATIONS' | 'LIFESTYLE' | 'WARNINGS'>('MEDICATIONS');

  const currentCondition = HEALTH_CONDITIONS.find((c) => c.id === selectedConditionId) || HEALTH_CONDITIONS[0];

  const handleReserveClick = (med: typeof currentCondition.recommendedMeds[0]) => {
    if (onReserveMedicine) {
      onReserveMedicine({
        id: `guide-${med.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: med.name,
        genericName: med.genericName,
        dosageForm: med.dosageForm,
        strength: med.strength,
        sellingPrice: med.estimatedPrice,
        prescriptionRequired: med.rxRequired,
        totalStock: 50,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#006cb7] via-[#005a99] to-[#004d80] text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Interactive Pharmacist Guidance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Health Condition & Medication Finder
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Select your health need or symptom below to view clinically verified recommendations from Kaziniya’s lead
              pharmacists, proper dosages, safety warnings, and instant reservation options.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 shrink-0">
            <Stethoscope className="h-8 w-8 text-emerald-300" />
            <div className="text-xs">
              <div className="font-extrabold text-white">EFDA & MOH Ethiopia</div>
              <div className="text-white/70">Standard Treatment Guidelines</div>
            </div>
          </div>
        </div>

        {/* Condition Selector Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto pt-6 pb-1 custom-scrollbar">
          {HEALTH_CONDITIONS.map((cond) => {
            const Icon = cond.icon;
            const isSelected = cond.id === selectedConditionId;
            return (
              <button
                key={cond.id}
                onClick={() => {
                  setSelectedConditionId(cond.id);
                  setActiveTab('MEDICATIONS');
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition shadow-xs ${
                  isSelected
                    ? 'bg-white text-[#006cb7] shadow-md scale-[1.02]'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-[#006cb7]' : 'text-white'}`} />
                <span>{cond.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Condition Overview Banner */}
        <div className={`p-5 rounded-2xl border ${currentCondition.bgLight} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Category:
              </span>
              <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                {currentCondition.category}
              </span>
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              {currentCondition.name}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentCondition.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 shrink-0 max-w-md">
            {currentCondition.typicalSymptoms.map((symp, sIdx) => (
              <span
                key={sIdx}
                className="text-[11px] font-semibold bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
              >
                • {symp}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('MEDICATIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MEDICATIONS'
                ? 'bg-[#006cb7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Pill className="h-4 w-4" />
            <span>Recommended Formulations ({currentCondition.recommendedMeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LIFESTYLE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'LIFESTYLE'
                ? 'bg-[#006cb7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            <span>Pharmacist Lifestyle & Home Care</span>
          </button>

          <button
            onClick={() => setActiveTab('WARNINGS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'WARNINGS'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>When to Seek Immediate Medical Care</span>
          </button>
        </div>

        {/* Tab 1: Recommended Medications */}
        {activeTab === 'MEDICATIONS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentCondition.recommendedMeds.map((med, mIdx) => (
              <div
                key={mIdx}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-[#006cb7]/50 transition shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        {med.name}
                      </h5>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                        Generic: {med.genericName}
                      </span>
                    </div>
                    {med.rxRequired ? (
                      <span className="bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 border border-amber-300 dark:border-amber-700">
                        Rx Required
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 border border-emerald-300 dark:border-emerald-700">
                        OTC Available
                      </span>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900 dark:text-white font-semibold">Dosage:</strong>{' '}
                        {med.usageNote}
                      </span>
                    </div>
                    <div className="text-rose-700 dark:text-rose-300 flex items-start gap-1.5 text-[11px]">
                      <Info className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Safety Caution:</strong> {med.caution}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Store Price</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(med.estimatedPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSelectMedicine && (
                      <button
                        onClick={() => onSelectMedicine(med.name)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                      >
                        View in Store
                      </button>
                    )}
                    <button
                      onClick={() => handleReserveClick(med)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Reserve Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Lifestyle Tips */}
        {activeTab === 'LIFESTYLE' && (
          <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-emerald-600" />
              Pharmacist-Approved Lifestyle & Supportive Care
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentCondition.lifestyleTips.map((tip, tIdx) => (
                <div
                  key={tIdx}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs">
                    {tIdx + 1}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Medical Warning */}
        {activeTab === 'WARNINGS' && (
          <div className="bg-rose-50 dark:bg-rose-950/40 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-black text-sm">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <span>Red-Flag Warning & Clinical Referral</span>
            </div>
            <p className="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
              {currentCondition.whenToSeeDoctor}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="tel:907"
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-2"
              >
                <span>Call Emergency Helpline (907)</span>
              </a>
              <span className="text-[11px] text-rose-700 dark:text-rose-400">
                • 24/7 Ethiopian Ministry of Health Emergency Line
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
