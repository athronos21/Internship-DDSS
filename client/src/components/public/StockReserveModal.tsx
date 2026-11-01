import React, { useState } from 'react';
import { Medicine } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, CheckCircle2, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StockReserveModalProps {
  medicine: Medicine | null;
  onClose: () => void;
}

export const StockReserveModal: React.FC<StockReserveModalProps> = ({ medicine, onClose }) => {
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!medicine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketNum = `KZ-HOLD-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket(ticketNum);
      setIsSubmitting(false);
      showToast(
        `Reserved ${quantity} unit(s) of ${medicine.name}. Ticket: ${ticketNum}`,
        'success',
        'Stock Held (6 Hours)'
      );
    }, 800);
  };

  const handleClose = () => {
    setPatientName('');
    setPhone('');
    setQuantity(1);
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-full bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 border border-emerald-400/30 mb-2">
            <Clock className="h-3.5 w-3.5" />
            6-Hour Free Stock Reservation
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Reserve Medicine at Store</h2>
          <p className="text-xs text-slate-300 mt-0.5">{medicine.name} • {medicine.dosageForm} ({medicine.strength})</p>
        </div>

        {submittedTicket ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Stock Held Successfully!</h3>
              <p className="text-xs text-slate-500">
                Your reservation for <strong className="text-slate-800">{quantity} unit(s)</strong> of {medicine.name} is confirmed.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Reservation Ticket Code</span>
              <p className="text-xl font-black text-emerald-700 font-mono tracking-widest">{submittedTicket}</p>
            </div>

            <div className="text-left bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <MapPin className="h-4 w-4 text-emerald-600" /> Pickup Location:
              </div>
              <p className="text-[11px] text-slate-600 pl-6">
                Kaziniya Drug Store — Bole Subcity, Woreda 03, Addis Ababa
              </p>

              <div className="flex items-center gap-2 font-bold text-slate-900 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Payment & Expiry:
              </div>
              <p className="text-[11px] text-slate-600 pl-6">
                Pay ETB {((medicine.sellingPrice || 0) * quantity).toFixed(2)} via Telebirr or CBE Birr at pickup within 6 hours.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Unit Retail Price</span>
                <span className="font-extrabold text-emerald-950 text-base">{formatCurrency(medicine.sellingPrice || 0)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Est. Price</span>
                <span className="font-extrabold text-emerald-950 text-base">{formatCurrency((medicine.sellingPrice || 0) * quantity)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Your Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Almaz Tadesse"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911 000 000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={medicine.totalStock || 10}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                />
              </div>
            </div>

            {medicine.prescriptionRequired && (
              <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Note: This is a prescription medication. Please bring your valid doctor prescription when picking up at the counter.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? 'Reserving...' : 'Confirm Hold'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
