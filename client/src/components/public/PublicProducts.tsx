import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Medicine, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import { ProductGridSkeleton } from './AnimatedSkeleton';
import {
  Search,
  Pill,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Clock,
  ShoppingBag,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  PackageCheck,
  Heart,
  Info,
  ArrowUpDown,
} from 'lucide-react';
import { StockReserveModal } from './StockReserveModal';
import { MedicineDetailsModal } from './MedicineDetailsModal';

interface PublicProductsProps {
  onOpenDashboard: () => void;
  initialSearchQuery?: string;
  wishlistIds?: string[];
  onToggleWishlist?: (medicineId: string) => void;
}

// Standard pharmacy categories list
const CATEGORY_CHIPS = [
  { id: 'ALL', name: 'All Categories', badge: 'All' },
  { id: 'Analgesics', name: 'Analgesics', badge: 'Pain & Fever' },
  { id: 'Antibiotics', name: 'Antibiotics', badge: 'Anti-infectives' },
  { id: 'Supplements', name: 'Supplements', badge: 'Vitamins & Health' },
  { id: 'Cardiovascular', name: 'Cardiovascular', badge: 'Heart & BP' },
  { id: 'Gastrointestinal', name: 'Gastrointestinal', badge: 'Stomach Care' },
];

export const PublicProducts: React.FC<PublicProductsProps> = ({
  onOpenDashboard,
  initialSearchQuery = '',
  wishlistIds = [],
  onToggleWishlist,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [rxFilter, setRxFilter] = useState<'ALL' | 'OTC' | 'RX'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'NAME_ASC'>('FEATURED');
  const [loading, setLoading] = useState(true);
  const [reserveMedicine, setReserveMedicine] = useState<Medicine | null>(null);
  const [detailsMedicine, setDetailsMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    fetchPublicProducts();
  }, []);

  const fetchPublicProducts = async () => {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([fetch('/api/medicines'), fetch('/api/categories')]);
      const [mData, cData] = await Promise.all([mRes.json(), cRes.json()]);

      if (mData.success) setMedicines(mData.data);
      if (cData.success) setCategories(cData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setRxFilter('ALL');
    setStockFilter('ALL');
    setSortBy('FEATURED');
    setSearchQuery('');
  };

  const checkMedicineMatchesCategory = (m: Medicine, categoryKey: string) => {
    if (categoryKey === 'ALL') return true;
    const catKey = categoryKey.toLowerCase();
    const mCatId = (m.categoryId || '').toLowerCase();
    const mCatName = typeof (m as any).category === 'object' ? ((m as any).category?.name || '').toLowerCase() : (m.categoryName || (m as any).category || '').toLowerCase();
    const mName = m.name.toLowerCase();
    const mGeneric = m.genericName.toLowerCase();

    if (mCatId === catKey || mCatName === catKey || mCatName.includes(catKey)) return true;

    if (catKey.includes('analgesic') || catKey.includes('pain')) {
      return mCatName.includes('analgesic') || mName.includes('para') || mName.includes('ibu') || mName.includes('diclo') || mGeneric.includes('para') || mGeneric.includes('ibu');
    }
    if (catKey.includes('antibiotic') || catKey.includes('infective')) {
      return mCatName.includes('antibiotic') || mName.includes('amox') || mName.includes('cipro') || mName.includes('ceft') || mGeneric.includes('amox') || mGeneric.includes('cipro');
    }
    if (catKey.includes('supplement') || catKey.includes('vitamin')) {
      return mCatName.includes('supplement') || mName.includes('vit') || mName.includes('zinc') || mName.includes('syrup') || mGeneric.includes('vit');
    }
    if (catKey.includes('cardio') || catKey.includes('heart')) {
      return mCatName.includes('cardio') || mName.includes('amlo') || mName.includes('aten') || mGeneric.includes('amlo');
    }
    if (catKey.includes('gastro') || catKey.includes('stomach')) {
      return mCatName.includes('gastro') || mName.includes('form') || mName.includes('omep') || mGeneric.includes('meta');
    }

    return false;
  };

  const filteredMeds = medicines
    .filter((m) => {
      // 1. Category filter
      const matchesCat = checkMedicineMatchesCategory(m, selectedCategory);

      // 2. Prescription filter
      let matchesRx = true;
      if (rxFilter === 'OTC') matchesRx = !m.prescriptionRequired;
      if (rxFilter === 'RX') matchesRx = !!m.prescriptionRequired;

      // 3. Stock filter
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') matchesStock = (m.totalStock || 0) > 0;

      // 4. Search query
      const q = searchQuery.toLowerCase();
      const categoryNameStr = typeof (m as any).category === 'object' ? ((m as any).category?.name || '') : (m.categoryName || (m as any).category || '');
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.dosageForm.toLowerCase().includes(q) ||
        categoryNameStr.toLowerCase().includes(q);

      return matchesCat && matchesRx && matchesStock && matchesQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (a.sellingPrice || 0) - (b.sellingPrice || 0);
      if (sortBy === 'PRICE_DESC') return (b.sellingPrice || 0) - (a.sellingPrice || 0);
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      return 0;
    });

  // Calculate count for category badge
  const getCategoryCount = (catId: string) => {
    if (catId === 'ALL') return medicines.length;
    return medicines.filter((m) => checkMedicineMatchesCategory(m, catId)).length;
  };

  return (
    <div className="bg-slate-50 py-10 min-h-[80vh] dark:bg-slate-950">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
        {/* Banner Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase px-3 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80">
              Live Inventory Catalog
            </span>
            <div className="flex items-center gap-3">
              {/* Sorting Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ArrowUpDown className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  <option value="FEATURED">Featured</option>
                  <option value="PRICE_ASC">Price: Low to High</option>
                  <option value="PRICE_DESC">Price: High to Low</option>
                  <option value="NAME_ASC">Name (A-Z)</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Showing {filteredMeds.length} of {medicines.length} items
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pharmaceutical & Health Catalog</h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Browse available certified medicines at Kaziniya Drug Store. Real-time batch inventory synced with counter POS authority.
          </p>
        </div>

        {/* HORIZONTAL CATEGORY FILTER BAR */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span>Category Filter Bar</span>
            </span>
            {(selectedCategory !== 'ALL' || rxFilter !== 'ALL' || stockFilter !== 'ALL' || searchQuery || sortBy !== 'FEATURED') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {CATEGORY_CHIPS.map((chip) => {
              const isSelected = selectedCategory === chip.id;
              const count = getCategoryCount(chip.id);
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedCategory(chip.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{chip.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono tabular-nums font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR + PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CATEGORY & FILTER SIDEBAR (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5 dark:bg-slate-900 dark:border-slate-800">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Filter Catalog</h3>
                </div>
              </div>

              {/* Search Bar in Sidebar */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Search Medicine
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, ingredient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white transition"
                  />
                </div>
              </div>

              {/* Medicine Category List */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Categories
                </label>
                <div className="space-y-1">
                  {CATEGORY_CHIPS.map((cat) => {
                    const active = selectedCategory === cat.id;
                    const count = getCategoryCount(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          active
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Pill className={`h-3.5 w-3.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-bold">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prescription Requirements Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Prescription Policy
                </label>
                <div className="space-y-1 text-xs">
                  {[
                    { id: 'ALL', label: 'All Policy Types' },
                    { id: 'OTC', label: 'Over-The-Counter (OTC)' },
                    { id: 'RX', label: 'Prescription Required (Rx)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRxFilter(p.id as any)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        rxFilter === p.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{p.label}</span>
                      {rxFilter === p.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Availability
                </label>
                <div className="space-y-1 text-xs">
                  {[
                    { id: 'ALL', label: 'All Inventory Items' },
                    { id: 'IN_STOCK', label: 'In Stock Only (>0 units)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStockFilter(s.id as any)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        stockFilter === s.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{s.label}</span>
                      {stockFilter === s.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID (9 Cols) */}
          <div className="lg:col-span-9 space-y-4">
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : filteredMeds.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-2">
                <PackageCheck className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  No matching medicines found for selected filters.
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Try selecting "All Categories" or click "Reset Filters" to clear prescription and stock constraints.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                </button>
              </div>
            ) : (
              <motion.div
                key={`${selectedCategory}-${rxFilter}-${stockFilter}-${sortBy}-${searchQuery}`}
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredMeds.map((med) => {
                  const stock = med.totalStock || 0;
                  const categoryNameStr = typeof (med as any).category === 'object' ? (med as any).category?.name : (med.categoryName || (med as any).category || 'General');

                  // Calculate stock status tier
                  let stockStatusLabel = 'Out of Stock';
                  let stockBadgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
                  let stockDotStyle = 'bg-rose-500';
                  let stockDetail = '0 units available';

                  if (stock > 10) {
                    stockStatusLabel = 'In Stock';
                    stockBadgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
                    stockDotStyle = 'bg-emerald-500';
                    stockDetail = `${stock} units in stock`;
                  } else if (stock > 0) {
                    stockStatusLabel = 'Limited';
                    stockBadgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
                    stockDotStyle = 'bg-amber-500 animate-pulse';
                    stockDetail = `Only ${stock} unit${stock > 1 ? 's' : ''} left`;
                  }

                  const isAvailable = stock > 0;
                  const isWishlisted = wishlistIds.includes(med.id);

                  return (
                    <motion.div
                      key={med.id}
                      layout
                      variants={staggerItem}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800 space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full dark:bg-emerald-950/80 dark:text-emerald-200 shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                            {categoryNameStr}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Details Button */}
                            <button
                              onClick={() => setDetailsMedicine(med)}
                              className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer dark:hover:bg-slate-800"
                              title="View Clinical Details"
                            >
                              <Info className="h-4 w-4" />
                            </button>

                            {/* Wishlist Bookmark Heart */}
                            {onToggleWishlist && (
                              <button
                                onClick={() => onToggleWishlist(med.id)}
                                className={`p-1.5 rounded-full transition cursor-pointer active:scale-90 ${
                                  isWishlisted
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                              </button>
                            )}

                            {/* Real-time Stock Status Badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${stockBadgeStyle}`}
                              title={stockDetail}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${stockDotStyle}`}></span>
                              <span>{stockStatusLabel}</span>
                            </span>
                          </div>
                        </div>

                        <h3
                          onClick={() => setDetailsMedicine(med)}
                          className="font-bold text-slate-900 text-base dark:text-white leading-snug cursor-pointer hover:text-emerald-600 transition"
                        >
                          {med.name}
                        </h3>
                        <p className="text-xs text-slate-500">Generic: {med.genericName}</p>

                        <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                          <div>
                            Dosage: <span className="text-slate-700 dark:text-slate-300 font-medium">{med.dosageForm} ({med.strength})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Mfr: {med.manufacturer}</span>
                            <span className="font-mono tabular-nums text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {stockDetail}
                            </span>
                          </div>
                          {med.prescriptionRequired && (
                            <div className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 pt-1 text-[10px]">
                              <AlertCircle className="h-3 w-3" /> Prescription Required
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Retail Price</span>
                          <span className="font-bold text-emerald-800 text-base dark:text-emerald-400 font-mono tabular-nums">
                            {formatCurrency(med.sellingPrice || 0)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isAvailable && (
                            <button
                              onClick={() => setReserveMedicine(med)}
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-[0.99]"
                            >
                              <Clock className="h-3.5 w-3.5" /> Reserve
                            </button>
                          )}
                          <button
                            onClick={() => setDetailsMedicine(med)}
                            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-[0.99]"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* Stock Reserve Modal */}
        <StockReserveModal
          medicine={reserveMedicine}
          onClose={() => setReserveMedicine(null)}
        />

        {/* Medicine Details Modal */}
        <MedicineDetailsModal
          medicine={detailsMedicine}
          onClose={() => setDetailsMedicine(null)}
          onReserve={(med) => setReserveMedicine(med)}
          isWishlisted={detailsMedicine ? wishlistIds.includes(detailsMedicine.id) : false}
          onToggleWishlist={onToggleWishlist}
        />
      </div>
    </div>
  );
};


