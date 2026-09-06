import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  PhoneCall,
  Share2,
  Copy,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { usePortalContent } from '../../context/PortalContentContext';
import pharmacyBuildingImg from '../../assets/images/pharmacy_building_1786459624657.jpg';

interface PublicContactProps {
  onExploreProducts: () => void;
}

export const PublicContact: React.FC<PublicContactProps> = ({ onExploreProducts }) => {
  const { content } = usePortalContent();
  const { showToast } = useToast();

  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [subject, setSubject] = useState('Prescription Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branches = content.branches;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderContact.trim() || !message.trim()) {
      showToast('Please fill out all required fields before sending.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        `Thank you ${senderName}! Your message regarding "${subject}" has been received. Our pharmacist will contact you at ${senderContact}.`,
        'success',
        'Message Sent'
      );
      setSenderName('');
      setSenderContact('');
      setMessage('');
    }, 800);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    showToast('Branch address copied to clipboard!', 'info');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
        {/* Page Banner Title */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
            <Building className="h-3.5 w-3.5" />
            <span>Store Location & Direct Contact</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Visit Kaziniya Drug Store & Reach Our Pharmacists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Located conveniently in Addis Ababa, Ethiopia. Whether you need 24/7 urgent medicine availability, direct phone consultation with a licensed clinical pharmacist, or bulk prescription orders, we are here to serve you.
          </p>
        </div>

        {/* Featured Store Building Photo & Flagship Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm dark:bg-slate-900 dark:border-slate-800">
          {/* Building Photo Container */}
          <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[420px] bg-slate-900 group overflow-hidden">
            <img
              src={pharmacyBuildingImg}
              alt="Kaziniya Pharmacy Store Building Exterior in Addis Ababa"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

            {/* Overlaid Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Main Flagship Store Building
              </span>
              <span className="bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Open 24/7
              </span>
            </div>

            {/* Overlaid Bottom Title */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Addis Ababa, Ethiopia
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                Kaziniya Pharmacy Main Store & Healthcare Center
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Bole Medhanealem Road, Next to Edna Mall, Bole Subcity</span>
              </p>
            </div>
          </div>

          {/* Quick Flagship Info Column */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Store Information
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                  Verified EFDA Pharmacy #48201
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-950/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <MapPin className="h-4 w-4 text-emerald-600" /> Exact Location
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                    Bole Medhanealem Road, Woreda 03, Bole Subcity, Addis Ababa, Ethiopia
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-950/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Phone className="h-4 w-4 text-emerald-600" /> Urgent Phone Lines
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 font-mono font-bold">
                    +251 11 661 2345 / +251 911 889 001
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 dark:bg-slate-950/60 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Clock className="h-4 w-4 text-emerald-600" /> Operating Schedule
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-6">
                    24 Hours / 7 Days a Week (Emergency Counter Open Nightly)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleCopyAddress('Bole Medhanealem Road, Next to Edna Mall, Addis Ababa, Ethiopia')}
                className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center justify-center gap-2 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <Copy className="h-4 w-4 text-emerald-600" /> Copy Flagship Address
              </button>

              <button
                onClick={onExploreProducts}
                className="w-full py-3 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Navigation className="h-4 w-4" /> Reserve Stock at Bole Branch
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form & Hotline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase text-emerald-600 tracking-wider">
                Send Us a Message
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Pharmacist Consultation & Inquiry Form
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Have a question about drug dosage, batch availability, or custom prescription imports? Submit your inquiry below for quick feedback.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bethlehem Tadesse"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase block">Phone Number or Email *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +251 9... or name@mail.com"
                    value={senderContact}
                    onChange={(e) => setSenderContact(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase block">Inquiry Topic</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Prescription Inquiry">Prescription Inquiry</option>
                  <option value="Drug Availability & Price">Drug Availability & Price</option>
                  <option value="Stock Reserve & Hold">Stock Reserve & Hold</option>
                  <option value="Wholesale & Hospital Supply">Wholesale & Hospital Supply</option>
                  <option value="Feedback / Suggestion">Feedback / Suggestion</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase block">Your Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your medicine query, dosage strength needed, or branch preference..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Dispatching Message...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message to Pharmacist</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Emergency Hotlines Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-lg border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest block">
                  24/7 Hotline
                </span>
                <h3 className="text-xl font-extrabold text-white">Emergency Dispatch Lines</h3>
                <p className="text-xs text-slate-400">
                  For immediate medicine verification, urgent asthma or insulin reserves, call our central phone lines directly.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Shortcode Helpline</span>
                    <span className="font-mono text-xl font-extrabold text-emerald-400 block">9229</span>
                  </div>
                  <PhoneCall className="h-6 w-6 text-emerald-400" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Direct Pharmacist WhatsApp</span>
                    <span className="font-mono text-sm font-bold text-white block">+251 911 000 111</span>
                  </div>
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Official Pharmacy Email</span>
                    <span className="font-mono text-xs font-bold text-slate-200 block">contact@kaziniyapharmacy.et</span>
                  </div>
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Branch Locations Grid */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              All Kaziniya Branch Locations in Addis Ababa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Find the nearest Kaziniya Drug Store node for instant medicine pickups and consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-400 transition-all dark:bg-slate-900 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-300">
                        {b.subcity}
                      </span>
                      {b.isMain && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold dark:bg-emerald-950 dark:text-emerald-300">
                          Flagship Node
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
                      {b.name}
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                    <Building className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-mono">{b.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{b.hours}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">{b.email}</span>
                  <button
                    onClick={() => handleCopyAddress(b.address)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 dark:text-emerald-400"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
