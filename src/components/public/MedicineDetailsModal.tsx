import React from 'react';
import {
  X,
  Pill,
  ShieldCheck,
  Thermometer,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Medicine } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface MedicineDetailsModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onReserve: (med: Medicine) => void;
  isWishlisted: boolean;
  onToggleWishlist?: (id: string) => void;
}

export const MedicineDetailsModal: React.FC<MedicineDetailsModalProps> = ({
  medicine,
  onClose,
  onReserve,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!medicine) return null;

  const stock = medicine.totalStock || 0;
  const isAvailable = stock > 0;
  const categoryName = typeof (medicine as any).category === 'object' ? ((medicine as any).category as any)?.name : (medicine.categoryName || (medicine as any).category || 'General Healthcare');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              {categoryName}
            </span>
            {medicine.prescriptionRequired ? (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Prescription (Rx) Required
              </span>
            ) : (
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Over-The-Counter (OTC)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">{medicine.name}</h2>
          <p className="text-xs text-emerald-200 font-medium pt-0.5">
            Active Generic: <strong>{medicine.genericName}</strong> ({medicine.strength})
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Key Facts Strip */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dosage Form</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {medicine.dosageForm}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Unit Package</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                1 {medicine.unit || 'pack'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Store Availability</span>
              <span className={`text-xs font-black ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isAvailable ? `${stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Description & Clinical Uses */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              <span>Description & Clinical Purpose</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {medicine.description || `EFDA certified ${medicine.genericName} formulated for safe therapeutic management. Dispensed under strict FEFO batch controls at Kaziniya Drug Store.`}
            </p>
          </div>

          {/* Storage & Handling */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5 text-emerald-600" />
              <span>Recommended Storage & Care</span>
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Store below 25°C in a dry place away from direct sunlight and humidity.</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Keep all medicines safely out of reach and sight of children.</span>
              </p>
            </div>
          </div>

          {/* Manufacturer & Certification */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-slate-400" />
              <span>Manufacturer: <strong>{medicine.manufacturer || 'Certified Importer'}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>EFDA Reg. Authentic</span>
            </div>
          </div>
        </div>

        {/* Footer with Price and Action */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Retail Price</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
              {formatCurrency(medicine.sellingPrice || 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(medicine.id)}
                className={`p-2.5 rounded-xl border transition ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:border-rose-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                }`}
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            {isAvailable ? (
              <button
                onClick={() => {
                  onClose();
                  onReserve(medicine);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Clock className="h-4 w-4" />
                <span>Reserve for Counter Pickup</span>
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2.5 bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed"
              >
                Currently Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
