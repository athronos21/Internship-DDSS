import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Medicine, MedicineBatch, CartItem, Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { playSound } from '../../utils/soundEffects';
import {
  Smartphone,
  Scan,
  PlusCircle,
  ShoppingBag,
  History,
  Camera,
  Trash2,
  Search,
  Wifi,
  Sparkles,
  FileCode2,
  X,
  QrCode,
  Copy,
  Check,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Tag,
  CreditCard,
  Banknote,
  PhoneCall,
  UserCheck,
  Building2,
  Package,
  Layers,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';

interface FlutterAppSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterAppSimulator: React.FC<FlutterAppSimulatorProps> = ({ isOpen, onClose }) => {
  // Navigation tabs: pos, register, inventory, sales, qr, code
  const [activeTab, setActiveTab] = useState<'pos' | 'register' | 'inventory' | 'sales' | 'qr' | 'code'>('pos');
  
  // Registration sub-tab: visual AI scan vs. manual form
  const [registerMode, setRegisterMode] = useState<'visual' | 'manual'>('visual');

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'CARD'>('CASH');
  const [customerName, setCustomerName] = useState('Walk-in Counter Patient');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // Visual Medicine Scanner State (No Barcode / QR Required)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'pos' | 'register'>('pos');
  const [isScanningPackaging, setIsScanningPackaging] = useState(false);
  const [scannedPackagingResult, setScannedPackagingResult] = useState<any>(null);
  const [selectedSampleHint, setSelectedSampleHint] = useState<string>('Amoxil 500mg');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Data State
  const [medicinesList, setMedicinesList] = useState<Medicine[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [syncQrDataUrl, setSyncQrDataUrl] = useState<string>('');

  // Manual / Visual Drug Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    genericName: '',
    brandName: '',
    categoryId: 'cat-1',
    dosageForm: 'Tablet',
    strength: '500mg',
    unit: 'Box',
    manufacturer: 'EPHARM',
    batchNumber: 'KZ-BATCH-001',
    mfgDate: '2025-01-01',
    expDate: '2027-12-31',
    purchasePrice: '15',
    sellingPrice: '25',
    quantity: '50',
    reorderLevel: '15',
    shelfLocation: 'Shelf A-02',
    barcode: '',
    prescriptionRequired: false,
  });

  const getMobileSyncUrl = () => {
    if (typeof window === 'undefined') {
      return 'https://ais-pre-leozf7qd26ta7bgww7m4mw-648174942624.europe-west2.run.app?flutter_pos=true';
    }
    let origin = window.location.origin;
    if (origin.startsWith('http://')) {
      origin = origin.replace('http://', 'https://');
    }
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return `${origin}?flutter_pos=true`;
  };

  const mobileSyncUrl = getMobileSyncUrl();

  useEffect(() => {
    if (isOpen) {
      fetchMedicines();
      fetchSales();
      QRCode.toDataURL(mobileSyncUrl, {
        width: 240,
        margin: 2,
        color: { dark: '#022c22', light: '#ffffff' },
      })
        .then((url) => setSyncQrDataUrl(url))
        .catch((e) => console.warn('Could not generate sync QR:', e));
    }
  }, [isOpen, mobileSyncUrl]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mobileSyncUrl);
    setCopiedUrl(true);
    showToast('Mobile POS URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines');
      const data = await res.json();
      if (data.success) setMedicinesList(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      if (data.success) setSalesHistory(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations for POS
  const cartSubtotal = cart.reduce((acc, i) => acc + i.totalPrice, 0);
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = tenderedNum > cartSubtotal ? tenderedNum - cartSubtotal : 0;

  // Add to POS Cart
  const addToCart = (med: Medicine, qty: number = 1) => {
    const totalStock = med.totalStock || 0;
    const existingIdx = cart.findIndex((item) => item.medicine.id === med.id);
    const currentQty = existingIdx >= 0 ? cart[existingIdx].quantity : 0;

    if (currentQty + qty > totalStock) {
      playSound('scan_error');
      showToast(`Stock limit reached! Only ${totalStock} available.`);
      return;
    }

    const price = med.sellingPrice || 10;
    playSound('scan_success');

    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].quantity += qty;
      updated[existingIdx].totalPrice = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setCart(updated);
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicine: med,
          quantity: qty,
          unitPrice: price,
          discount: 0,
          totalPrice: qty * price,
        },
      ]);
    }
    showToast(`✓ Added ${med.name} to cart`);
  };

  const updateCartQuantity = (index: number, delta: number) => {
    const item = cart[index];
    const newQty = item.quantity + delta;
    const totalStock = item.medicine.totalStock || 999;

    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== index));
    } else if (newQty <= totalStock) {
      const updated = [...cart];
      updated[index].quantity = newQty;
      updated[index].totalPrice = newQty * item.unitPrice;
      setCart(updated);
    } else {
      showToast(`Only ${totalStock} units available`);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCashTendered('');
  };

  // Perform POS Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingSale(true);

    try {
      const items = cart.map((c) => ({
        medicineId: c.medicine.id,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
      }));

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-4' },
        body: JSON.stringify({
          items,
          paymentMethod,
          customerName: customerName.trim() || 'Walk-in Counter Patient',
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSound('checkout_complete');
        setCompletedSale(data.data);
        setIsReceiptOpen(true);
        setCart([]);
        setCashTendered('');
        fetchMedicines();
        fetchSales();
        showToast('✓ Counter sale completed successfully!');
      } else {
        alert(`Checkout Failed: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsProcessingSale(false);
    }
  };

  // AI Visual Medicine Packaging Scanner (No Barcode / QR Code Required)
  const triggerVisualMedicineScan = async (sampleHint?: string, customImageBase64?: string) => {
    setIsScanningPackaging(true);
    setScannedPackagingResult(null);

    try {
      const hint = sampleHint || selectedSampleHint;
      // Use provided image or fallback mock image representation
      const imagePayload = customImageBase64 || 'data:image/jpeg;base64,mockMedicinePackaging';

      const res = await fetch('/api/gemini/scan-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePayload,
          medicineHint: hint,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        playSound('scan_success');
        const extracted = data.data;
        setScannedPackagingResult(extracted);

        // If in POS mode, automatically find or offer to add to cart
        if (cameraMode === 'pos') {
          if (extracted.matchedInventoryMedicine) {
            showToast(`Visual Match: ${extracted.matchedInventoryMedicine.name}`);
          } else {
            // Find in local list
            const found = medicinesList.find((m) =>
              m.name.toLowerCase().includes(extracted.name.toLowerCase()) ||
              extracted.name.toLowerCase().includes(m.name.toLowerCase())
            );
            if (found) {
              extracted.matchedInventoryMedicine = found;
              showToast(`Visual Match: ${found.name}`);
            }
          }
        }

        // If in Register mode, populate form
        if (cameraMode === 'register' || activeTab === 'register') {
          setRegForm({
            name: extracted.name || '',
            genericName: extracted.genericName || '',
            brandName: extracted.brandName || '',
            categoryId: extracted.category ? 'cat-1' : 'cat-1',
            dosageForm: extracted.dosageForm || 'Tablet',
            strength: extracted.strength || '500mg',
            unit: extracted.unit || 'Strip',
            manufacturer: extracted.manufacturer || 'EPHARM',
            batchNumber: extracted.batchNumber || 'KZ-B902',
            mfgDate: extracted.mfgDate || '2025-01-01',
            expDate: extracted.expDate || '2027-11-30',
            purchasePrice: (extracted.suggestedPurchasePrice || 15).toString(),
            sellingPrice: (extracted.suggestedSellingPrice || 25).toString(),
            quantity: (extracted.suggestedQuantity || 50).toString(),
            reorderLevel: (extracted.reorderLevel || 15).toString(),
            shelfLocation: extracted.shelfLocation || 'Shelf A-02',
            barcode: extracted.generatedCode || '',
            prescriptionRequired: !!extracted.prescriptionRequired,
          });
          showToast(`✓ Extracted: ${extracted.name} (${extracted.dosageForm})`);
        }
      } else {
        playSound('scan_error');
        showToast('Packaging scan could not identify label');
      }
    } catch (e) {
      playSound('scan_error');
      showToast('Error during AI packaging scan');
    } finally {
      setIsScanningPackaging(false);
    }
  };

  // Handle Image File Upload for Scanning
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      triggerVisualMedicineScan(undefined, base64);
    };
    reader.readAsDataURL(file);
  };

  // Submit Drug Registration (Manual or AI-scanned)
  const handleRegisterMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      alert('Product Name is required');
      return;
    }

    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-5' },
        body: JSON.stringify({
          barcode: regForm.barcode.trim() || undefined,
          name: regForm.name.trim(),
          genericName: regForm.genericName.trim() || regForm.name.trim(),
          brandName: regForm.brandName.trim() || regForm.name.trim(),
          categoryId: regForm.categoryId,
          dosageForm: regForm.dosageForm,
          strength: regForm.strength,
          unit: regForm.unit,
          manufacturer: regForm.manufacturer,
          shelfLocation: regForm.shelfLocation,
          prescriptionRequired: regForm.prescriptionRequired,
          reorderLevel: Number(regForm.reorderLevel) || 15,
          initialBatch: {
            batchNumber: regForm.batchNumber || 'KZ-BATCH-001',
            mfgDate: regForm.mfgDate || '2025-01-01',
            expDate: regForm.expDate || '2027-12-31',
            purchasePrice: Number(regForm.purchasePrice) || 15,
            sellingPrice: Number(regForm.sellingPrice) || 25,
            quantity: Number(regForm.quantity) || 50,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSound('scan_success');
        showToast(`✓ Registered "${regForm.name}" into inventory!`);
        fetchMedicines();
        // Reset form & navigate to inventory or POS
        setScannedPackagingResult(null);
        setActiveTab('pos');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter medicines for POS catalog
  const filteredMedicines = medicinesList.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      m.name.toLowerCase().includes(q) ||
      (m.genericName && m.genericName.toLowerCase().includes(q)) ||
      (m.brandName && m.brandName.toLowerCase().includes(q)) ||
      (m.strength && m.strength.toLowerCase().includes(q)) ||
      (m.barcode && m.barcode.toLowerCase().includes(q));

    if (!matchesQuery) return false;
    if (selectedCategory === 'ALL') return true;
    return m.categoryId === selectedCategory;
  });

  const categories = [
    { id: 'ALL', label: 'All Drugs' },
    { id: 'cat-1', label: 'Antibiotics' },
    { id: 'cat-2', label: 'Pain & Fever' },
    { id: 'cat-3', label: 'Cardio' },
    { id: 'cat-4', label: 'Gastro' },
    { id: 'cat-5', label: 'Respiratory' },
  ];

  const sampleDrugPresets = [
    { name: 'Amoxil 500mg Strip', hint: 'Amoxil 500mg', desc: 'Blister Foil • Amoxicillin Trihydrate' },
    { name: 'Paracetamol 500mg Box', hint: 'Paracetamol 500mg', desc: 'Box of 100 • Cadila' },
    { name: 'Ciprofloxacin 500mg', hint: 'Ciprofloxacin 500mg', desc: 'Film-coated Strip • Medochemie' },
    { name: 'Metformin 850mg', hint: 'Metformin 850mg', desc: 'Tablets • Julphar' },
    { name: 'Omeprazole 20mg', hint: 'Omeprazole 20mg', desc: 'Delayed-release Capsule' },
    { name: 'Augmentin 625mg', hint: 'Augmentin 625mg', desc: 'Amox + Clavulanate' },
  ];

  const flutterCodeSnippet = `// ============================================================================
// KAZINIYA DRUG STORE - FLUTTER MOBILE APP CORE (DART 3)
// Modular Architecture:
// 1. /lib/screens/register_medicine_screen.dart (Visual AI Scan + Manual Entry)
// 2. /lib/screens/pos_screen.dart (Counter POS, Cart, Cash Change, Receipt)
// 3. /lib/screens/scan_and_sell.dart (Visual Packaging Scanner & FEFO Allocation)
// 4. /lib/services/api_service.dart (Dio HTTP Client to Node Backend)
// ============================================================================

import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

void main() {
  runApp(const KaziniyaMobileApp());
}

class KaziniyaMobileApp extends StatelessWidget {
  const KaziniyaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kaziniya Drug Store POS',
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF0D9488),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
      ),
      home: const MainNavigationShell(),
    );
  }
}

// See /mobile/lib/screens/pos_screen.dart and register_medicine_screen.dart
// for full Dart 3 implementations with Gemini Vision integration!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 z-50 animate-bounce bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-emerald-400">
          <Sparkles className="h-4 w-4" />
          {notification}
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto space-y-3 p-3 sm:p-5">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold shadow-md">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-white">Flutter Mobile Counter POS</h2>
                <span className="rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Wifi className="h-3 w-3 text-emerald-400" /> LIVE COUNTER NODE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kaziniya Drug Store • Visual Medicine Packaging AI Scanner & Counter POS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('qr')}
              className="rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5"
            >
              <QrCode className="h-4 w-4" /> Phone QR Sync
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 transition"
              title="Close Mobile Terminal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2.5 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('pos');
              setIsCameraActive(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'pos' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> 1. POS Counter ({cart.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setIsCameraActive(false);
            }}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'register' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="h-4 w-4" /> 2. Register Product (2 Ways)
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" /> Stock (FEFO)
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'sales' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-4 w-4" /> Sales Log
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'qr' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" /> Phone QR
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileCode2 className="h-4 w-4" /> Flutter Dart Code
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* PHONE FRAME (Column 1) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[360px] h-[640px] rounded-[42px] bg-slate-950 p-3 shadow-2xl border-[6px] border-slate-800 flex flex-col justify-between overflow-hidden">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-700 rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="flex justify-between items-center px-4 pt-2 text-[10px] text-slate-400 z-20 font-mono">
                <span>09:41 AM</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Wifi className="h-3 w-3" /> 100%
                </span>
              </div>

              {/* App Bar */}
              <div className="bg-emerald-950 border border-emerald-800 text-white p-2.5 rounded-2xl mt-1 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-800/60">
                    <Building2 className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block leading-tight">Kaziniya Mobile POS</span>
                    <span className="text-[9px] text-emerald-300/80 font-mono">Sister Bethlehem • Pharmacist</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCameraMode('pos');
                    setIsCameraActive(true);
                  }}
                  className="rounded-lg bg-emerald-600 p-1.5 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1 text-[10px] font-bold"
                  title="Scan Medicine Packaging"
                >
                  <Camera className="h-3.5 w-3.5" /> Scan
                </button>
              </div>

              {/* IN-PHONE CAMERA SCANNER OVERLAY */}
              {isCameraActive && (
                <div className="absolute inset-x-2 top-14 bottom-14 z-40 bg-slate-950/98 p-3 flex flex-col justify-between rounded-3xl border-2 border-emerald-500 shadow-2xl backdrop-blur-md animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span>AI Visual Medicine Scanner</span>
                    </div>
                    <button
                      onClick={() => setIsCameraActive(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Camera Viewfinder Box with Laser Animation */}
                  <div className="relative my-2 h-44 rounded-2xl border-2 border-emerald-400 bg-slate-900/90 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                    {/* Animated Green Laser Scanning Bar */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />

                    {/* Corner Reticle Brackets */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                    {isScanningPackaging ? (
                      <div className="flex flex-col items-center gap-2 text-center p-2">
                        <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
                        <span className="text-[10px] font-bold text-white">Analyzing Medicine Packaging...</span>
                        <span className="text-[8px] text-emerald-300 font-mono">Recognizing API & Dosage Form</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center p-2">
                        <Package className="h-8 w-8 text-emerald-400/90 mb-1" />
                        <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          POINT CAMERA AT MEDICINE PACKAGING
                        </span>
                        <span className="text-[8px] text-slate-400 mt-1">
                          Blister Foil • Box • Bottle • Ampoule (No Barcode Needed!)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Input for Image Upload */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFileUpload}
                  />

                  {/* Live Medicine Packaging Presets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                      <span>Test Real Drug Packaging:</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Camera className="h-3 w-3" /> Upload Photo
                      </button>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {sampleDrugPresets.map((preset) => (
                        <button
                          key={preset.hint}
                          onClick={() => {
                            setSelectedSampleHint(preset.hint);
                            triggerVisualMedicineScan(preset.hint);
                          }}
                          className="w-full text-left bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500/70 p-2 rounded-xl transition flex items-center justify-between text-[10px]"
                        >
                          <div>
                            <span className="font-bold text-white block truncate max-w-[180px]">
                              {preset.name}
                            </span>
                            <span className="text-slate-400 text-[9px]">{preset.desc}</span>
                          </div>
                          <span className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-2 py-1 rounded-lg shrink-0">
                            SCAN
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scanned Result Card in Overlay */}
                  {scannedPackagingResult && (
                    <div className="mt-2 bg-slate-900 border border-emerald-500 p-2 rounded-xl text-[10px] space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{scannedPackagingResult.name}</span>
                        <span className="text-emerald-400">ETB {scannedPackagingResult.suggestedSellingPrice}</span>
                      </div>
                      <p className="text-slate-400 text-[9px]">
                        Generic: {scannedPackagingResult.genericName} ({scannedPackagingResult.strength})
                      </p>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-[9px] text-emerald-400 font-mono">
                          SKU: {scannedPackagingResult.generatedCode}
                        </span>
                        {cameraMode === 'pos' ? (
                          <button
                            onClick={() => {
                              const medToAdd = scannedPackagingResult.matchedInventoryMedicine || {
                                id: `med-${Date.now()}`,
                                name: scannedPackagingResult.name,
                                sellingPrice: scannedPackagingResult.suggestedSellingPrice || 25,
                                totalStock: 50,
                              };
                              addToCart(medToAdd as Medicine, 1);
                              setIsCameraActive(false);
                            }}
                            className="bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg hover:bg-emerald-500"
                          >
                            + Add to Cart
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setIsCameraActive(false);
                              setActiveTab('register');
                            }}
                            className="bg-emerald-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg hover:bg-emerald-500"
                          >
                            Review & Register
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Scrollable View Area */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2.5 px-1">
                {/* 1. POS COUNTER TAB */}
                {activeTab === 'pos' && (
                  <div className="space-y-2.5">
                    {/* Visual Medicine AI Scan Button */}
                    <button
                      onClick={() => {
                        setCameraMode('pos');
                        setIsCameraActive(true);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-2.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      SCAN MEDICINE ITSELF (NO BARCODE NEEDED)
                    </button>

                    {/* Search & Category Filter */}
                    <div className="space-y-1.5">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search drug name, generic, strength..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex gap-1 overflow-x-auto pb-1 text-[9px]">
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c.id)}
                            className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-bold transition ${
                              selectedCategory === c.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Add Medicine Catalog (FEFO Stock) */}
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {filteredMedicines.slice(0, 8).map((med) => (
                        <div
                          key={med.id}
                          className="bg-slate-900 p-2 rounded-xl border border-slate-850 flex items-center justify-between text-[10px]"
                        >
                          <div>
                            <span className="font-bold text-white block truncate max-w-[150px]">{med.name}</span>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400">
                              <span>Stock: {med.totalStock}</span>
                              <span className="text-emerald-400 font-mono">{formatCurrency(med.sellingPrice || 0)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(med, 1)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg"
                          >
                            + ADD
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Shopping Cart Summary & Checkout */}
                    <div className="bg-slate-900 p-2.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center font-bold text-white">
                        <span className="flex items-center gap-1.5 text-xs">
                          <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" /> Cart ({cart.length})
                        </span>
                        <span className="text-emerald-400 font-mono text-xs">{formatCurrency(cartSubtotal)}</span>
                      </div>

                      {cart.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-2">
                          Cart is empty • Tap +ADD or scan medicine packaging above
                        </p>
                      ) : (
                        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                          {cart.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[10px] bg-slate-950 p-1.5 rounded-xl border border-slate-850"
                            >
                              <div className="truncate max-w-[140px]">
                                <span className="font-bold text-white block truncate">{item.medicine.name}</span>
                                <span className="text-slate-400 font-mono text-[9px]">
                                  {item.quantity} x {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => updateCartQuantity(idx, -1)}
                                  className="text-slate-400 hover:text-white font-bold px-1"
                                >
                                  -
                                </button>
                                <span className="font-bold text-white text-[10px]">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(idx, 1)}
                                  className="text-slate-400 hover:text-white font-bold px-1"
                                >
                                  +
                                </button>
                                <span className="font-bold text-emerald-400 font-mono text-[10px]">
                                  {formatCurrency(item.totalPrice)}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(idx, -999)}
                                  className="text-rose-400 hover:text-rose-300 ml-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Checkout Details & Cash Tendered Helper */}
                      {cart.length > 0 && (
                        <div className="pt-2 space-y-2 border-t border-slate-800">
                          {/* Payment Mode Selector */}
                          <div className="grid grid-cols-3 gap-1 text-[9px]">
                            {(['CASH', 'MOBILE_MONEY', 'CARD'] as const).map((m) => (
                              <button
                                key={m}
                                onClick={() => setPaymentMethod(m)}
                                className={`p-1 rounded-lg font-bold uppercase transition ${
                                  paymentMethod === m
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {m === 'MOBILE_MONEY' ? 'Telebirr' : m === 'CARD' ? 'CBE Card' : 'Cash'}
                              </button>
                            ))}
                          </div>

                          {/* Cash Change Calculator */}
                          {paymentMethod === 'CASH' && (
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1.5 text-[10px]">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Cash Tendered:</span>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={cashTendered}
                                  onChange={(e) => setCashTendered(e.target.value)}
                                  className="w-20 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-right font-mono text-white text-[10px]"
                                />
                              </div>
                              <div className="flex gap-1 justify-end text-[8px]">
                                {[
                                  { label: 'Exact', val: cartSubtotal.toString() },
                                  { label: '+50', val: (Math.ceil(cartSubtotal / 50) * 50).toString() },
                                  { label: '+100', val: (Math.ceil(cartSubtotal / 100) * 100).toString() },
                                  { label: '+200', val: (Math.ceil(cartSubtotal / 200) * 200).toString() },
                                ].map((chip) => (
                                  <button
                                    key={chip.label}
                                    onClick={() => setCashTendered(chip.val)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                  >
                                    {chip.label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-slate-800 font-bold">
                                <span className="text-slate-400">Change Due:</span>
                                <span className="text-emerald-400 font-mono">{formatCurrency(changeDue)}</span>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handleCheckout}
                            disabled={isProcessingSale}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl shadow-xs"
                          >
                            {isProcessingSale ? 'Processing Sale...' : `COMPLETE SALE (${formatCurrency(cartSubtotal)})`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. REGISTER PRODUCT TAB (TWO WAYS) */}
                {activeTab === 'register' && (
                  <div className="space-y-2.5 text-[11px]">
                    {/* Method Selector Toggle */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                      <button
                        onClick={() => setRegisterMode('visual')}
                        className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                          registerMode === 'visual'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" /> 1. Scan Packaging
                      </button>
                      <button
                        onClick={() => setRegisterMode('manual')}
                        className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                          registerMode === 'manual'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <PlusCircle className="h-3.5 w-3.5" /> 2. Manual Form
                      </button>
                    </div>

                    {/* METHOD 1: VISUAL MEDICINE SCANNER */}
                    {registerMode === 'visual' && (
                      <div className="space-y-2">
                        <div className="bg-emerald-950/60 border border-emerald-800/80 p-2.5 rounded-xl text-[10px] text-emerald-300">
                          <span className="font-bold block text-emerald-200">No Barcode / QR Code Required!</span>
                          Point camera at blister foil, box, or bottle label. AI extracts medicine name, generic, strength, batch & expiry.
                        </div>

                        <button
                          onClick={() => {
                            setCameraMode('register');
                            setIsCameraActive(true);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-sm"
                        >
                          <Camera className="h-4 w-4 animate-pulse" />
                          LAUNCH PACKAGING SCANNER
                        </button>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">
                            Quick Drug Packaging Presets:
                          </span>
                          <div className="grid grid-cols-2 gap-1">
                            {sampleDrugPresets.slice(0, 4).map((p) => (
                              <button
                                key={p.hint}
                                onClick={() => {
                                  setSelectedSampleHint(p.hint);
                                  setCameraMode('register');
                                  triggerVisualMedicineScan(p.hint);
                                }}
                                className="bg-slate-900 hover:bg-emerald-950 border border-slate-800 p-1.5 rounded-lg text-left text-[9px]"
                              >
                                <span className="font-bold text-white block truncate">{p.name}</span>
                                <span className="text-slate-400 text-[8px] truncate block">{p.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {scannedPackagingResult && (
                          <div className="bg-slate-900 border border-emerald-500 p-2.5 rounded-xl space-y-1 text-[10px]">
                            <div className="flex justify-between font-bold text-white">
                              <span>{scannedPackagingResult.name}</span>
                              <span className="text-emerald-400">{scannedPackagingResult.strength}</span>
                            </div>
                            <p className="text-slate-400 text-[9px]">
                              Generic: {scannedPackagingResult.genericName} • {scannedPackagingResult.dosageForm}
                            </p>
                            <p className="text-slate-400 text-[9px]">
                              Extracted Batch: {scannedPackagingResult.batchNumber} (Exp: {scannedPackagingResult.expDate})
                            </p>
                            <span className="text-[9px] text-emerald-400 font-mono block">
                              Auto-generated SKU: {scannedPackagingResult.generatedCode}
                            </span>
                            <button
                              onClick={handleRegisterMedicineSubmit}
                              className="w-full bg-emerald-600 text-white font-bold py-1.5 rounded-lg mt-1"
                            >
                              Confirm & Save Drug into Inventory
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* METHOD 2: MANUAL REGISTRATION FORM */}
                    {registerMode === 'manual' && (
                      <form onSubmit={handleRegisterMedicineSubmit} className="space-y-2 text-[10px]">
                        <div>
                          <label className="text-slate-400 block mb-0.5">Commercial Drug Name *</label>
                          <input
                            type="text"
                            required
                            value={regForm.name}
                            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                            placeholder="e.g. Augmentin 625mg"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">Generic (Active Ingredient)</label>
                          <input
                            type="text"
                            value={regForm.genericName}
                            onChange={(e) => setRegForm({ ...regForm, genericName: e.target.value })}
                            placeholder="e.g. Amoxicillin + Clavulanate"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-slate-400 block mb-0.5">Strength</label>
                            <input
                              type="text"
                              value={regForm.strength}
                              onChange={(e) => setRegForm({ ...regForm, strength: e.target.value })}
                              placeholder="500mg"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-0.5">Dosage Form</label>
                            <input
                              type="text"
                              value={regForm.dosageForm}
                              onChange={(e) => setRegForm({ ...regForm, dosageForm: e.target.value })}
                              placeholder="Tablet / Capsule"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-slate-400 block mb-0.5">Cost Price (ETB)</label>
                            <input
                              type="number"
                              value={regForm.purchasePrice}
                              onChange={(e) => setRegForm({ ...regForm, purchasePrice: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-0.5">Selling Price (ETB) *</label>
                            <input
                              type="number"
                              required
                              value={regForm.sellingPrice}
                              onChange={(e) => setRegForm({ ...regForm, sellingPrice: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-slate-400 block mb-0.5">Initial Quantity *</label>
                            <input
                              type="number"
                              required
                              value={regForm.quantity}
                              onChange={(e) => setRegForm({ ...regForm, quantity: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="text-slate-400 block mb-0.5">Batch Number *</label>
                            <input
                              type="text"
                              required
                              value={regForm.batchNumber}
                              onChange={(e) => setRegForm({ ...regForm, batchNumber: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">Expiry Date *</label>
                          <input
                            type="date"
                            required
                            value={regForm.expDate}
                            onChange={(e) => setRegForm({ ...regForm, expDate: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-0.5">
                            Barcode (Optional - internal code generated if blank)
                          </label>
                          <input
                            type="text"
                            value={regForm.barcode}
                            onChange={(e) => setRegForm({ ...regForm, barcode: e.target.value })}
                            placeholder="Leave empty if medicine has no barcode"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-[11px]"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl mt-1 text-xs"
                        >
                          Save Drug into Inventory
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 3. INVENTORY TAB */}
                {activeTab === 'inventory' && (
                  <div className="space-y-2 text-xs">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                      {medicinesList
                        .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((m) => (
                          <div key={m.id} className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
                            <div className="flex justify-between font-bold text-white">
                              <span>{m.name}</span>
                              <span className="text-emerald-400 font-mono">{formatCurrency(m.sellingPrice || 0)}</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-mono">
                              <span>Stock: {m.totalStock} units</span>
                              <span>Exp: {m.earliestExpiry ? formatDate(m.earliestExpiry) : 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 4. SALES TAB */}
                {activeTab === 'sales' && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-white text-xs block">Recent Counter Sales</span>
                    {salesHistory.slice(0, 10).map((s) => (
                      <div key={s.id} className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
                        <div className="flex justify-between font-bold text-white">
                          <span>{s.invoiceNumber}</span>
                          <span className="text-emerald-400 font-mono">{formatCurrency(s.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                          <span>{s.paymentMethod}</span>
                          <span>{s.items?.length || 0} items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. QR TAB */}
                {activeTab === 'qr' && (
                  <div className="space-y-3 text-center p-2 text-xs">
                    <span className="font-bold text-white text-xs block">Connect Physical Phone</span>
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                      {syncQrDataUrl ? (
                        <img
                          src={syncQrDataUrl}
                          alt="Mobile Sync QR Code"
                          className="w-36 h-36 mx-auto object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-[10px] text-slate-400">
                          Generating QR...
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Scan this QR code with your phone camera to launch the Flutter Mobile POS directly on your device.
                    </p>
                  </div>
                )}

                {/* 6. DART CODE TAB */}
                {activeTab === 'code' && (
                  <div className="p-1">
                    <pre className="bg-slate-900 p-2 rounded-xl text-[9px] text-emerald-300 font-mono overflow-x-auto max-h-80">
                      {flutterCodeSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* Bottom Tab Bar for Mobile Navigation */}
              <div className="bg-slate-900 border-t border-slate-800 p-1.5 rounded-2xl flex justify-around text-[9px] z-20">
                <button
                  onClick={() => {
                    setActiveTab('pos');
                    setIsCameraActive(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeTab === 'pos' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> POS
                </button>
                <button
                  onClick={() => {
                    setActiveTab('register');
                    setIsCameraActive(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeTab === 'register' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Register
                </button>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setIsCameraActive(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeTab === 'inventory' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" /> Stock
                </button>
                <button
                  onClick={() => {
                    setActiveTab('sales');
                    setIsCameraActive(false);
                  }}
                  className={`flex flex-col items-center gap-0.5 ${
                    activeTab === 'sales' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  <History className="h-3.5 w-3.5" /> Sales
                </button>
              </div>
            </div>
          </div>

          {/* DETAILED INFORMATION & PHONE CONNECTION SETUP (Column 2) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visual Medicine Packaging Scanner Spotlight Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Visual Medicine Packaging AI Scanner</h3>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                  NO BARCODE / QR NEEDED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Many medicines in drug store dispensaries lack printed barcodes or QR codes on individual blister strips, foil packs, bottles, or ampoules. Kaziniya solves this with <strong>AI Vision Recognition</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                    <Camera className="h-4 w-4" /> 1. Visual Packaging Scan
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Point phone camera at the physical medicine or strip. AI scans typography, active ingredient, dosage form, crimp batch, and expiry.
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                    <ShoppingBag className="h-4 w-4" /> 2. Counter POS Sale
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Instantly matches recognized drug against FEFO inventory batches, adds to cart, computes cash tendered change, and issues thermal receipt.
                  </p>
                </div>
              </div>
            </div>

            {/* Physical Phone Setup & QR Sync */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Operate Directly on Physical Phone</h3>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-800 font-mono font-bold">
                  MOBILE LIVE NODE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 bg-white p-3 rounded-2xl flex flex-col items-center justify-center">
                  {syncQrDataUrl ? (
                    <img
                      src={syncQrDataUrl}
                      alt="Mobile Sync QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[10px] text-slate-800 font-bold mt-1.5">Scan with Phone Camera</span>
                </div>

                <div className="md:col-span-7 space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    Operate all Flutter staff tools (visual medicine packaging scanning, POS counter sales, and receipt printing) right on your smartphone.
                  </p>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Direct Mobile POS URL:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={mobileSyncUrl}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 focus:outline-none"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition shrink-0"
                        title="Copy URL"
                      >
                        {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <a
                    href={mobileSyncUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 text-xs transition border border-slate-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                    Open Mobile View in New Browser Tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Pharmacy Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
};
