import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Medicine, Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import { OrderListSkeleton } from './AnimatedSkeleton';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Printer,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  QrCode,
  MapPin,
  RefreshCw,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { useToast } from '../../context/ToastContext';

interface PublicOrdersProps {
  currentUser: User | null;
  onExploreProducts: () => void;
  onOpenReserveModal?: (medicine?: Medicine) => void;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  type: 'HOLD' | 'PICKUP' | 'PRESCRIPTION_DELIVERY';
  status: 'READY_FOR_PICKUP' | 'PROCESSING' | 'COMPLETED' | 'DELIVERED';
  date: string;
  items: {
    medicineName: string;
    dosageForm: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  pickupLocation: string;
  pickupCode: string;
}

export const PublicOrders: React.FC<PublicOrdersProps> = ({
  currentUser,
  onExploreProducts,
}) => {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HOLDS' | 'COMPLETED' | 'PRESCRIPTIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (filter: 'ALL' | 'HOLDS' | 'COMPLETED' | 'PRESCRIPTIONS') => {
    setActiveFilter(filter);
    setLoading(true);
    setTimeout(() => setLoading(false), 250);
  };

  // Initial Sample Customer Orders for Patient Account
  const [orders, setOrders] = useState<CustomerOrder[]>([
    {
      id: 'ord-101',
      orderNumber: 'KAZ-INV-849021',
      type: 'HOLD',
      status: 'READY_FOR_PICKUP',
      date: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
      items: [
        {
          medicineName: 'Amoxicillin 500mg Capsules',
          dosageForm: 'Capsule',
          quantity: 2,
          unitPrice: 380,
          totalPrice: 760,
        },
        {
          medicineName: 'Paracetamol 500mg Tablets',
          dosageForm: 'Tablet',
          quantity: 1,
          unitPrice: 120,
          totalPrice: 120,
        },
      ],
      totalAmount: 880,
      paymentMethod: 'Pay at Pharmacy Counter',
      pickupLocation: 'Kaziniya Main Branch, Bole Medhanealem, Addis Ababa',
      pickupCode: 'HOLD-9821',
    },
    {
      id: 'ord-102',
      orderNumber: 'KAZ-INV-710293',
      type: 'PICKUP',
      status: 'COMPLETED',
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      items: [
        {
          medicineName: 'Omeprazole 20mg Capsules',
          dosageForm: 'Capsule',
          quantity: 1,
          unitPrice: 450,
          totalPrice: 450,
        },
        {
          medicineName: 'Vitamin C 1000mg Effervescent',
          dosageForm: 'Effervescent Tablet',
          quantity: 2,
          unitPrice: 280,
          totalPrice: 560,
        },
      ],
      totalAmount: 1010,
      paymentMethod: 'Telebirr Mobile Payment',
      pickupLocation: 'Kaziniya Main Branch, Bole Medhanealem, Addis Ababa',
      pickupCode: 'PICKUP-7102',
    },
    {
      id: 'ord-103',
      orderNumber: 'KAZ-RX-554109',
      type: 'PRESCRIPTION_DELIVERY',
      status: 'DELIVERED',
      date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      items: [
        {
          medicineName: 'Metformin 850mg Extended Release',
          dosageForm: 'Tablet',
          quantity: 3,
          unitPrice: 320,
          totalPrice: 960,
        },
      ],
      totalAmount: 960,
      paymentMethod: 'CBE Birr',
      pickupLocation: 'Home Delivery - Bole Subcity, Addis Ababa',
      pickupCode: 'DELIV-5541',
    },
  ]);

  const filteredOrders = orders.filter((o) => {
    // Filter by type tab
    if (activeFilter === 'HOLDS' && o.type !== 'HOLD') return false;
    if (activeFilter === 'COMPLETED' && o.status !== 'COMPLETED' && o.status !== 'DELIVERED') return false;
    if (activeFilter === 'PRESCRIPTIONS' && o.type !== 'PRESCRIPTION_DELIVERY') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.medicineName.toLowerCase().includes(q));
      return matchNum || matchItem;
    }

    return true;
  });

  const handleOpenReceiptForOrder = (ord: CustomerOrder) => {
    const sale: Sale = {
      id: ord.id,
      invoiceNumber: ord.orderNumber,
      subtotal: ord.totalAmount,
      discount: 0,
      tax: 0,
      totalAmount: ord.totalAmount,
      paymentMethod: (ord.paymentMethod as any) || 'CASH',
      paymentStatus: 'PAID',
      customerName: currentUser?.name || 'Valued Patient',
      soldBy: 'u-1',
      soldByName: 'Kaziniya Pharmacy Counter',
      createdAt: ord.date,
      items: ord.items.map((i, idx) => ({
        id: `ord-item-${idx}`,
        saleId: ord.id,
        batchId: `b-${idx}`,
        medicineId: `med-${idx}`,
        medicineName: i.medicineName,
        batchNumber: `BATCH-2026-${idx + 1}`,
        expiryDate: '2027-12-31',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: 0,
        totalPrice: i.totalPrice,
      })),
    };
    setSelectedReceiptSale(sale);
    setIsReceiptOpen(true);
  };

  const handleReorder = (ord: CustomerOrder) => {
    showToast(`Items from order ${ord.orderNumber} added to current prescription holds!`, 'success', 'Re-order Processed');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Banner Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Customer Order History & Active Holds</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Orders & Prescription Holds
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser
                ? `Welcome, ${currentUser.name}. Track your live pharmacy holds, branch pickups, and purchase history.`
                : 'Track your medicine holds and pharmacy purchase history.'}
            </p>
          </div>

          <button
            onClick={onExploreProducts}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 shrink-0"
          >
            <span>Browse Medicines Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 font-bold text-xs overflow-x-auto">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              All Purchases ({orders.length})
            </button>
            <button
              onClick={() => handleFilterChange('HOLDS')}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeFilter === 'HOLDS'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Active Holds ({orders.filter((o) => o.type === 'HOLD').length})
            </button>
            <button
              onClick={() => handleFilterChange('COMPLETED')}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Completed Pickups
            </button>
            <button
              onClick={() => handleFilterChange('PRESCRIPTIONS')}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                activeFilter === 'PRESCRIPTIONS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              Prescriptions
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice or medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <OrderListSkeleton count={3} />
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto dark:bg-slate-800">
              <Package className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white">No Orders Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You do not have any active orders or medicine holds matching the current filter criteria.
              </p>
            </div>
            <button
              onClick={onExploreProducts}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <span>Explore Pharmacy Catalog</span>
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredOrders.map((ord) => {
              const isHold = ord.type === 'HOLD';

              return (
                <motion.div
                  key={ord.id}
                  variants={staggerItem}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all dark:bg-slate-900 dark:border-slate-800 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-100 dark:bg-slate-950/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 shadow-2xs">
                        <ShoppingBag className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 text-sm dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.status === 'READY_FOR_PICKUP'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : ord.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{formatDate(ord.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReceiptForOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      >
                        <Printer className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Thermal Invoice</span>
                      </button>

                      <button
                        onClick={() => setSelectedQrOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition dark:bg-emerald-600"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>Pickup Pass</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Itemized medicines table */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {ord.items.map((item, i) => (
                        <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white block">{item.medicineName}</span>
                            <span className="text-[10px] text-slate-400">Form: {item.dosageForm}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                              {item.quantity}x @ {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block text-xs">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Location & Payment Details */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-3.5 rounded-2xl dark:bg-slate-950/40">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-medium truncate">{ord.pickupLocation}</span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                        <span className="text-slate-500">Method: <strong>{ord.paymentMethod}</strong></span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                          <span className="font-extrabold text-slate-900 text-sm dark:text-white">
                            {formatCurrency(ord.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pickup QR Pass Modal Overlay */}
        {selectedQrOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-5 text-center">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pharmacy Pickup Pass
                </span>
                <button
                  onClick={() => setSelectedQrOrder(null)}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <p className="font-mono text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  {selectedQrOrder.pickupCode}
                </p>
                <p className="text-[11px] text-slate-500">
                  Show this digital pass or barcode to the pharmacist counter node for instant verification.
                </p>
              </div>

              {/* Simulated QR Code Graphic */}
              <div className="bg-slate-900 p-6 rounded-2xl border-4 border-emerald-500/30 flex flex-col items-center justify-center space-y-2 text-white mx-auto w-48 h-48 shadow-lg">
                <QrCode className="h-28 w-28 text-emerald-400" />
                <span className="text-[10px] font-mono tracking-widest text-slate-400">VERIFIED AUTH</span>
              </div>

              <button
                onClick={() => setSelectedQrOrder(null)}
                className="w-full rounded-2xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}

        {/* Thermal Receipt Modal Component */}
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          sale={selectedReceiptSale}
        />
      </div>
    </div>
  );
};
