import React from 'react';
import { Pill, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { usePortalContent } from '../../context/PortalContentContext';

export const PublicFooter: React.FC<{
  onOpenDashboard: () => void;
  onNavigateToContact?: () => void;
  onNavigateToRegistration?: () => void;
}> = ({ onOpenDashboard, onNavigateToContact, onNavigateToRegistration }) => {
  const { content } = usePortalContent();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                K
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                {content.storeName}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {content.storeTagline}
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-950/80 px-2.5 py-1 text-[10px] text-emerald-400 border border-emerald-800 font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {content.efdaLicense}
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="font-bold text-white text-xs tracking-wider uppercase mb-3">Operating Schedule</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              {content.branches.slice(0, 3).map((branch) => (
                <div key={branch.id} className="flex justify-between py-1 border-b border-slate-900 gap-2">
                  <span className="truncate">{branch.name}:</span>
                  <span className={`font-mono tabular-nums font-bold shrink-0 ${branch.isMain ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {branch.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white text-xs tracking-wider uppercase mb-3">Store Location</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{content.flagshipAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono tabular-nums">{content.primaryPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{content.primaryEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Portal & Network</h4>
            {onNavigateToRegistration && (
              <button
                onClick={onNavigateToRegistration}
                className="w-full rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 font-bold text-xs py-2.5 px-4 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Registration & Network Hub →</span>
              </button>
            )}
            {onNavigateToContact && (
              <button
                onClick={onNavigateToContact}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Building Gallery & Contact Us</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {content.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Healthcare Platform • Built with Clean Minimalism</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Footer = PublicFooter;
