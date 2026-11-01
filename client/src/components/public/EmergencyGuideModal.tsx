import React, { useState } from 'react';
import {
  X,
  Phone,
  ShieldAlert,
  Flame,
  HeartPulse,
  Activity,
  Baby,
  AlertOctagon,
  LifeBuoy,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_TOPICS = [
  {
    id: 'poison',
    title: 'Poisoning & Toxic Ingestion',
    icon: AlertOctagon,
    color: 'text-rose-600',
    emergencyHotline: '8335 (Ethiopian Poison Control & Info Center)',
    steps: [
      'DO NOT induce vomiting unless explicitly directed by a poison control specialist.',
      'If toxic chemical is on the skin or eyes, irrigate with clean running water for 15-20 minutes immediately.',
      'Check if the person is conscious, breathing, and responsive.',
      'Bring the exact medicine container, chemical bottle, or packaging with you to the nearest hospital.',
    ],
    caution: 'Never give raw milk, raw eggs, or charcoal slurry without medical supervision.',
  },
  {
    id: 'burns',
    title: 'Thermal & Boiling Water Burns',
    icon: Flame,
    color: 'text-amber-600',
    emergencyHotline: '907 (Addis Ababa Fire & Emergency Services)',
    steps: [
      'Immediately cool the burn under cool or lukewarm running tap water for at least 10–20 minutes.',
      'Gently remove rings, bracelets, or tight clothing near the burned area before swelling starts.',
      'Cover the burn loosely with clean plastic cling film or sterile non-adherent dressing.',
      'Take Paracetamol or Ibuprofen for pain relief if needed.',
    ],
    caution: 'NEVER apply ice, toothpaste, butter, raw egg, or coffee grounds to open burn wounds.',
  },
  {
    id: 'hypo',
    title: 'Diabetic Hypoglycemia (Low Sugar)',
    icon: HeartPulse,
    color: 'text-blue-600',
    emergencyHotline: '907 (Ministry of Health Emergency)',
    steps: [
      'Identify symptoms: Cold clammy sweat, shaking, confusion, dizziness, extreme hunger, or pale skin.',
      'Rule of 15: Give 15-20 grams of fast-acting sugar (e.g. 1/2 glass fruit juice, 3-4 teaspoons sugar in water, or 3 glucose tablets).',
      'Wait 15 minutes, then re-check blood glucose if a glucometer is available.',
      'Once blood sugar rises above 70 mg/dL, provide a snack with complex carbs and protein (e.g., bread or milk).',
    ],
    caution: 'If patient is unconscious or having seizures, DO NOT put liquids in their mouth. Place in recovery position and call ambulance immediately.',
  },
  {
    id: 'asthma',
    title: 'Acute Asthma / Wheezing Attack',
    icon: Activity,
    color: 'text-emerald-600',
    emergencyHotline: '907 (National Ambulance Dispatch)',
    steps: [
      'Sit the person upright comfortably. Loosen tight clothing around the neck and chest.',
      'Give 2-4 puffs of blue reliever inhaler (Salbutamol) via spacer if available, taking 4 slow deep breaths per puff.',
      'Wait 4 minutes. If breathing does not improve, give 4 more puffs.',
      'If still struggling to speak full sentences or lips turn blue, call 907 immediately and continue 4 puffs every 4 minutes.',
    ],
    caution: 'Keep calm and never leave the person alone during an acute asthma flare.',
  },
];

export const EmergencyGuideModal: React.FC<EmergencyGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedTopicId, setSelectedTopicId] = useState('poison');

  if (!isOpen) return null;

  const currentTopic = EMERGENCY_TOPICS.find((t) => t.id === selectedTopicId) || EMERGENCY_TOPICS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                First-Aid & Emergency Medical Guide
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Ethiopian Ministry of Health & Red Cross Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Emergency Call Strip */}
        <div className="bg-rose-950 text-rose-200 px-5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-rose-900">
          <span className="font-bold flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-rose-400" />
            24/7 Hotlines in Ethiopia:
          </span>
          <div className="flex items-center gap-3">
            <a href="tel:907" className="underline font-black text-white hover:text-rose-300">
              MOH Hotline: 907
            </a>
            <span>•</span>
            <a href="tel:8335" className="underline font-black text-white hover:text-rose-300">
              Poison: 8335
            </a>
            <span>•</span>
            <a href="tel:911" className="underline font-black text-white hover:text-rose-300">
              Ambulance: 911
            </a>
          </div>
        </div>

        {/* Topic Selector */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar bg-slate-50 dark:bg-slate-800/50">
          {EMERGENCY_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const isSelected = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopicId(topic.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : topic.color}`} />
                <span>{topic.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              Immediate Action Steps for: {currentTopic.title}
            </h4>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
              Hotline: {currentTopic.emergencyHotline}
            </span>
          </div>

          <div className="space-y-3">
            {currentTopic.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Caution box */}
          <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
            <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold">Critical Warning:</strong> {currentTopic.caution}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            For severe trauma or loss of consciousness, seek immediate emergency hospital transport.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white rounded-xl text-xs font-bold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
