import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
      showToast(`Attached file: ${e.target.files[0].name}`, 'info', 'File Attached');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketNum = `KZ-PRES-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket(ticketNum);
      setIsSubmitting(false);
      showToast(
        `Prescription uploaded successfully for ${patientName}. Reference: ${ticketNum}`,
        'success',
        'Prescription Received'
      );
    }, 1000);
  };

  const resetForm = () => {
    setPatientName('');
    setPhone('');
    setClinicName('');
    setNotes('');
    setUploadedFileName(null);
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={resetForm}
            className="absolute top-5 right-5 p-1 text-emerald-200 hover:text-white rounded-full bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-200 border border-emerald-400/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            EFDA Prescription Verification Portal
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Upload Prescription</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Send your medical prescription for fast pharmacist verification & stock reservation.
          </p>
        </div>

        {/* Content Body */}
        {submittedTicket ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Prescription Received!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Our licensed pharmacist at Kaziniya Drug Store is reviewing your upload. We will call or SMS you shortly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tracking Reference ID</span>
              <p className="text-xl font-black text-emerald-700 tracking-wider font-mono">{submittedTicket}</p>
            </div>

            <div className="text-left bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl text-xs space-y-2 text-emerald-900">
              <div className="flex items-center gap-2 font-bold">
                <Phone className="h-4 w-4 text-emerald-700" /> What Happens Next?
              </div>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                <li>Pharmacist checks prescription validity & dosage instructions.</li>
                <li>Stock is placed on hold at Kaziniya Drug Store (Main Store).</li>
                <li>You can pay via Telebirr or CBE Birr upon store pickup.</li>
              </ul>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Close & Return to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Abebe Bikila"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911 234 567"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Hospital / Clinic Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Tikur Anbessa Hospital"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* File Upload Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Attach Prescription Image / Document</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-500 transition bg-slate-50 relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                {uploadedFileName ? (
                  <p className="text-xs font-bold text-emerald-700">{uploadedFileName}</p>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700">Click or drag image to upload</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG, or PDF up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Medication Details / Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type drug names, dosage instructions, or any special requests..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl flex items-start gap-2 text-amber-900 text-[11px]">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Prescription verification is subject to EFDA regulatory approval. Original physical prescription must be presented during store pickup.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Prescription'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
