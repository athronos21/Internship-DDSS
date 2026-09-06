import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Medicine } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import { FavoritesSkeleton } from './AnimatedSkeleton';
import {
  Heart,
  Pill,
  Clock,
  ArrowRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { StockReserveModal } from './StockReserveModal';

interface PublicFavoritesProps {
  wishlistIds: string[];
  onToggleWishlist: (medicineId: string) => void;
  onExploreProducts: () => void;
}

export const PublicFavorites: React.FC<PublicFavoritesProps> = ({
  wishlistIds,
  onToggleWishlist,
  onExploreProducts,
}) => {
  const { showToast } = useToast();
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserveMedicine, setReserveMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    const fetchMeds = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/medicines');
        const data = await res.json();
        if (data.success) {
          setAllMedicines(data.data);
        }
      } catch (e) {
        console.error('Error loading medicines for wishlist:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMeds();
  }, []);

  const favoriteMedicines = allMedicines.filter((m) => wishlistIds.includes(m.id));

  return (
    <div className="bg-slate-50 min-h-screen py-8 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold dark:bg-rose-950/60 dark:text-rose-300">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>Patient Saved Wishlist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Favorite Medicines ({favoriteMedicines.length})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep track of your frequently needed prescription drugs, vitamins, and emergency remedies.
            </p>
          </div>

          <button
            onClick={onExploreProducts}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <span>Explore Medicines Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Favorites Grid / Empty State */}
        {loading ? (
          <FavoritesSkeleton count={6} />
        ) : favoriteMedicines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 dark:bg-slate-900 dark:border-slate-800 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto dark:bg-rose-950/60">
              <Heart className="h-8 w-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white">Your Wishlist is Empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven't bookmarked any medicines yet. Browse the catalog and tap the heart icon on any drug card to save it here for instant access.
              </p>
            </div>
            <button
              onClick={onExploreProducts}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md"
            >
              <Pill className="h-4 w-4" />
              <span>Browse All Medicines</span>
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteMedicines.map((med) => {
              const categoryName = typeof (med as any).category === 'object' ? (med as any).category?.name : (med.categoryName || (med as any).category || 'General');
              const isStock = (med.totalStock || 0) > 0;

              return (
                <motion.div
                  key={med.id}
                  variants={staggerItem}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-emerald-300 transition-all dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between gap-4 relative group"
                >
                  {/* Top Row: Category badge & Remove Heart */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-300">
                      {categoryName}
                    </span>

                    <button
                      onClick={() => onToggleWishlist(med.id)}
                      className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition dark:bg-rose-950/60 dark:text-rose-400"
                      title="Remove from favorites"
                    >
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base dark:text-white leading-snug">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {med.genericName}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                      <span>Form: <strong>{med.dosageForm}</strong></span>
                      <span>•</span>
                      <span>Strength: <strong>{med.strength}</strong></span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Price</span>
                      <span className="font-extrabold text-slate-900 text-base dark:text-emerald-400">
                        {formatCurrency(med.sellingPrice || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isStock ? (
                        <button
                          onClick={() => setReserveMedicine(med)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>Hold Stock</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold dark:bg-rose-950 dark:text-rose-400">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Stock Reserve Modal */}
        <StockReserveModal
          onClose={() => setReserveMedicine(null)}
          medicine={reserveMedicine}
        />
      </div>
    </div>
  );
};
