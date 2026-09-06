import React, { useState } from 'react';
import { User } from '../../types';
import { X, User as UserIcon, Mail, Phone, MapPin, KeyRound, CheckCircle2, Shield, Heart, ShoppingBag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser?: (updated: User) => void;
  onNavigateToOrders?: () => void;
  onNavigateToFavorites?: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onNavigateToOrders,
  onNavigateToFavorites,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || 'Abebe Bikila');
  const [email, setEmail] = useState(currentUser?.email || 'abebe.b@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+251 911 234 567');
  const [subcity, setSubcity] = useState('Bole Subcity, Addis Ababa');
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name,
      email,
      phone,
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditing(false);
    showToast('Your patient profile information has been updated successfully.', 'success', 'Profile Updated');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-6 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg dark:text-white leading-tight">
                {currentUser.name}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Patient Account ({currentUser.role === 'CUSTOMER' ? 'Public Portal' : currentUser.role})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Action Navigation Pills */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              if (onNavigateToOrders) onNavigateToOrders();
            }}
            className="p-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-100 transition flex items-center gap-2 text-left dark:bg-emerald-950/40 dark:border-emerald-900"
          >
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <div>
              <span className="font-bold text-xs text-slate-900 block dark:text-white">My Orders</span>
              <span className="text-[10px] text-slate-500">Track holds & receipts</span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToFavorites) onNavigateToFavorites();
            }}
            className="p-3 rounded-2xl border border-rose-100 bg-rose-50/60 hover:bg-rose-100 transition flex items-center gap-2 text-left dark:bg-rose-950/40 dark:border-rose-900"
          >
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <div>
              <span className="font-bold text-xs text-slate-900 block dark:text-white">My Favorites</span>
              <span className="text-[10px] text-slate-500">Saved drug items</span>
            </div>
          </button>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">Full Patient Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={!isEditing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase block">Default Subcity / Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={subcity}
                  onChange={(e) => setSubcity(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 disabled:bg-slate-50 disabled:text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition dark:bg-emerald-600"
              >
                Edit Profile Information
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
