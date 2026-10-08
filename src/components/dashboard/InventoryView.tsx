import React, { useState, useEffect, useMemo } from 'react';
import { Medicine, MedicineBatch, Category, Supplier } from '../../types';
import { formatCurrency, formatDate, getExpiryBadgeClass, getDaysUntilExpiry } from '../../utils/formatters';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  Scan,
  Boxes,
  Layers,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import { BarcodeScannerModal, extractCleanBarcode } from '../common/BarcodeScannerModal';
import { MedicineQrCodeModal } from '../common/MedicineQrCodeModal';
import { BarcodeGeneratorModal } from '../common/BarcodeGeneratorModal';
import { CsvImportModal } from '../common/CsvImportModal';
import { Barcode as BarcodeIcon, UploadCloud } from 'lucide-react';

interface InventoryViewProps {
  initialSubTab?: 'medicines' | 'batches' | 'low' | 'expiring' | 'archived' | 'movements' | 'requests';
  autoOpenAddModal?: boolean;
  autoOpenAdjustModal?: boolean;
  autoOpenCreateReqModal?: boolean;
  onNavigateToAddMedicine?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  initialSubTab = 'medicines',
  autoOpenAddModal = false,
  autoOpenAdjustModal = false,
  autoOpenCreateReqModal = false,
  onNavigateToAddMedicine,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'medicines' | 'batches' | 'low' | 'expiring' | 'archived' | 'movements' | 'requests'>(initialSubTab);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [batches, setBatches] = useState<MedicineBatch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('Kaziniya Drug store');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddMedOpen, setIsAddMedOpen] = useState(autoOpenAddModal);
  const [isAdjustOpen, setIsAdjustOpen] = useState(autoOpenAdjustModal);
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(autoOpenCreateReqModal);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isBarcodeGenOpen, setIsBarcodeGenOpen] = useState(false);
  const [enableBarcodeSystem, setEnableBarcodeSystem] = useState<boolean>(true);
  const [selectedBatchForAdjust, setSelectedBatchForAdjust] = useState<MedicineBatch | null>(null);
  const [selectedMedForQr, setSelectedMedForQr] = useState<Medicine | null>(null);
  const [selectedMedForBarcode, setSelectedMedForBarcode] = useState<Medicine | null>(null);

  // Stock Movements Mock Data
  const [stockMovements, setStockMovements] = useState([
    {
      id: 'MOV-801',
      date: '2026-08-12 11:20 AM',
      medicineName: 'Amoxicillin 500mg Capsule',
      batchNumber: 'BAT-AMX-2026A',
      type: 'DISPENSED_POS',
      qtyChange: -30,
      fromLocation: 'Main Shelf A-12',
      toLocation: 'POS Counter 1 (Sold)',
      handledBy: 'Pharmacist Selam',
    },
    {
      id: 'MOV-802',
      date: '2026-08-11 04:15 PM',
      medicineName: 'Metformin 500mg Tablet',
      batchNumber: 'BAT-MET-8890',
      type: 'PURCHASE_RECEIPT',
      qtyChange: 500,
      fromLocation: 'EPharm Wholesale Supplier',
      toLocation: 'Main Warehouse B-04',
      handledBy: 'Store Admin Robel',
    },
    {
      id: 'MOV-803',
      date: '2026-08-10 09:30 AM',
      medicineName: 'Paracetamol 120mg/5ml Syrup',
      batchNumber: 'BAT-PAR-5542',
      type: 'ADJUSTMENT_WRITE_OFF',
      qtyChange: -5,
      fromLocation: 'Main Shelf C-02',
      toLocation: 'Quarantine Bin (Damaged)',
      handledBy: 'Pharmacist Tigist',
    },
    {
      id: 'MOV-804',
      date: '2026-08-09 02:45 PM',
      medicineName: 'Omeprazole 20mg Capsule',
      batchNumber: 'BAT-OME-1002',
      type: 'BRANCH_TRANSFER_OUT',
      qtyChange: -100,
      fromLocation: 'Main Store',
      toLocation: 'Bole Sub-Branch Store',
      handledBy: 'Logistics Supervisor Samuel',
    },
  ]);

  // Stock Requests Mock Data
  const [stockRequests, setStockRequests] = useState([
    {
      id: 'REQ-901',
      requestDate: '2026-08-12',
      fromBranch: 'Bole Sub-Branch',
      toBranch: 'Kaziniya Drug store (Main)',
      itemsRequested: 'Omeprazole 20mg (10 Boxes), Insulin Glargine (5 Vials)',
      urgency: 'HIGH',
      status: 'PENDING_APPROVAL',
      requestedBy: 'Dr. Yonas',
    },
    {
      id: 'REQ-902',
      requestDate: '2026-08-11',
      fromBranch: 'Kazanchis Branch',
      toBranch: 'Kaziniya Drug store (Main)',
      itemsRequested: 'Ciprofloxacin 500mg (20 Boxes)',
      urgency: 'NORMAL',
      status: 'DISPATCHED',
      requestedBy: 'Pharmacist Bethlehem',
    },
    {
      id: 'REQ-903',
      requestDate: '2026-08-08',
      fromBranch: 'Piassa Branch',
      toBranch: 'Kaziniya Drug store (Main)',
      itemsRequested: 'Paracetamol Syrup 100ml (50 Bottles)',
      urgency: 'LOW',
      status: 'RECEIVED',
      requestedBy: 'Store Assistant Alazar',
    },
  ]);

  // Requisition Form state
  const [reqForm, setReqForm] = useState({
    fromBranch: 'Bole Sub-Branch',
    toBranch: 'Kaziniya Drug store (Main)',
    itemsRequested: '',
    urgency: 'NORMAL',
    notes: '',
  });

  // Mock archived medicines list
  const [archivedMedicines, setArchivedMedicines] = useState<any[]>([
    {
      id: 'arch-1',
      barcode: '628100010991',
      sku: 'SKU-ASP-81',
      name: 'Aspirin Dispersible 81mg',
      brandName: 'Bayer Low-Dose',
      genericName: 'Acetylsalicylic Acid',
      categoryName: 'Pain Relief & Analgesics',
      totalStock: 0,
      sellingPrice: 45.0,
      archivedDate: '2026-02-01',
      reason: 'Replaced with Enteric-Coated Formulation',
    },
    {
      id: 'arch-2',
      barcode: '628100020882',
      sku: 'SKU-CPM-4SY',
      name: 'Chlorpheniramine 4mg Syrup 100ml',
      brandName: 'Allerhist-Pediatric',
      genericName: 'Chlorpheniramine Maleate',
      categoryName: 'Antihistamines',
      totalStock: 0,
      sellingPrice: 85.0,
      archivedDate: '2025-11-15',
      reason: 'EFDA Regulatory Batch Recall Discontinued',
    },
    {
      id: 'arch-3',
      barcode: '628100030773',
      sku: 'SKU-TET-250',
      name: 'Tetracycline 250mg Capsule',
      brandName: 'Tetra-EPharm',
      genericName: 'Tetracycline Hydrochloride',
      categoryName: 'Antibiotics & Anti-Infectives',
      totalStock: 0,
      sellingPrice: 110.0,
      archivedDate: '2025-08-20',
      reason: 'Phased out in favor of Doxycycline 100mg',
    },
  ]);

  useEffect(() => {
    setActiveSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    if (autoOpenAddModal) {
      setIsAddMedOpen(true);
    }
  }, [autoOpenAddModal]);

  useEffect(() => {
    if (autoOpenAdjustModal) {
      setIsAdjustOpen(true);
    }
  }, [autoOpenAdjustModal]);

  useEffect(() => {
    if (autoOpenCreateReqModal) {
      setIsCreateReqOpen(true);
    }
  }, [autoOpenCreateReqModal]);

  // Adjust Form state
  const [adjustForm, setAdjustForm] = useState({
    transactionType: 'ADJUSTMENT' as 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED',
    quantityDelta: 0,
    notes: '',
  });

  // Add Medicine Form state
  const [addMedForm, setAddMedForm] = useState({
    barcode: '',
    sku: '',
    name: '',
    genericName: '',
    brandName: '',
    categoryId: 'cat-1',
    dosageForm: 'Tablet',
    strength: '500mg',
    unit: 'Box',
    manufacturer: 'EPHARM',
    description: '',
    prescriptionRequired: false,
    reorderLevel: 20,
    // Batch
    batchNumber: 'KZ-BATCH-2026-01',
    mfgDate: '2025-01-01',
    expDate: '2028-01-01',
    purchasePrice: 10,
    sellingPrice: 20,
    quantity: 100,
    supplierId: 'sup-1',
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [medRes, batRes, catRes, supRes, profRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/batches'),
        fetch('/api/categories'),
        fetch('/api/suppliers'),
        fetch('/api/pharmacy/profile'),
      ]);

      const [medData, batData, catData, supData, profData] = await Promise.all([
        medRes.json(),
        batRes.json(),
        catRes.json(),
        supRes.json(),
        profRes.json().catch(() => ({ success: false })),
      ]);

      if (medData.success) setMedicines(medData.data);
      if (batData.success) setBatches(batData.data);
      if (catData.success) setCategories(catData.data);
      if (supData.success) setSuppliers(supData.data);
      if (profData?.success && profData.data) {
        setEnableBarcodeSystem(Boolean(profData.data.enableBarcodeSystem));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-5' },
        body: JSON.stringify({
          barcode: addMedForm.barcode,
          sku: addMedForm.sku,
          name: addMedForm.name,
          genericName: addMedForm.genericName,
          brandName: addMedForm.brandName,
          categoryId: addMedForm.categoryId,
          dosageForm: addMedForm.dosageForm,
          strength: addMedForm.strength,
          unit: addMedForm.unit,
          manufacturer: addMedForm.manufacturer,
          description: addMedForm.description,
          prescriptionRequired: addMedForm.prescriptionRequired,
          reorderLevel: addMedForm.reorderLevel,
          initialBatch: {
            batchNumber: addMedForm.batchNumber,
            mfgDate: addMedForm.mfgDate,
            expDate: addMedForm.expDate,
            purchasePrice: addMedForm.purchasePrice,
            sellingPrice: addMedForm.sellingPrice,
            quantity: addMedForm.quantity,
            supplierId: addMedForm.supplierId,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddMedOpen(false);
        fetchInventoryData();
        alert('Medicine registered successfully with initial batch!');
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForAdjust) return;

    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-5' },
        body: JSON.stringify({
          medicineId: selectedBatchForAdjust.medicineId,
          batchId: selectedBatchForAdjust.id,
          transactionType: adjustForm.transactionType,
          quantityDelta: Number(adjustForm.quantityDelta),
          notes: adjustForm.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAdjustOpen(false);
        fetchInventoryData();
        alert('Stock adjustment recorded successfully.');
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered lists with pagination calculation
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesCategory = selectedCategory === 'ALL' || m.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.barcode.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q);

      const stock = m.totalStock || 0;
      let matchesStock = true;
      if (stockFilter === 'IN_STOCK') {
        matchesStock = stock > m.reorderLevel;
      } else if (stockFilter === 'LOW_STOCK') {
        matchesStock = stock > 0 && stock <= m.reorderLevel;
      } else if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = stock <= 0;
      }

      const matchesBranch = branchFilter === 'ALL' || (m.branchName || 'Kaziniya Drug store') === branchFilter;

      return matchesCategory && matchesSearch && matchesStock && matchesBranch;
    });
  }, [medicines, selectedCategory, searchQuery, stockFilter, branchFilter]);

  const totalItems = filteredMedicines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (validPage - 1) * pageSize;
    return filteredMedicines.slice(startIndex, startIndex + pageSize);
  }, [filteredMedicines, validPage, pageSize]);

  const inStockCount = useMemo(() => medicines.filter((m) => (m.totalStock || 0) > m.reorderLevel).length, [medicines]);
  const lowStockCount = useMemo(() => medicines.filter((m) => (m.totalStock || 0) > 0 && (m.totalStock || 0) <= m.reorderLevel).length, [medicines]);
  const outOfStockCount = useMemo(() => medicines.filter((m) => (m.totalStock || 0) <= 0).length, [medicines]);
  const lowStockMeds = useMemo(() => medicines.filter((m) => (m.totalStock || 0) <= m.reorderLevel), [medicines]);
  const expiringBatches = useMemo(() => batches.filter((b) => b.status === 'EXPIRING_SOON' || b.status === 'EXPIRED'), [batches]);

  return (
    <div className="space-y-6">
      {/* BREADCRUMB & PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium mb-1">
            <span>Dashboard</span> <span className="mx-1">›</span> <span className="text-sky-600 font-semibold">Medicines</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Medicines</h1>
        </div>

        {/* Top Right Actions Row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveSubTab('expiring')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
            title="View expiring batches"
          >
            <Clock className="h-4 w-4" />
            <span>FEFO Alerts</span>
          </button>
          <button
            onClick={() => {
              if (onNavigateToAddMedicine) {
                onNavigateToAddMedicine();
              } else {
                setIsAddMedOpen(true);
              }
            }}
            className="bg-[#0284c7] hover:bg-[#02699e] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 TOP KPI CARDS (Exact Screenshot Match) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL MEDICINES */}
        <div className="bg-[#e0f2fe] border border-sky-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">TOTAL MEDICINES</p>
            <p className="text-2xl font-black text-sky-950 mt-1">{medicines.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-200/80 text-sky-800 flex items-center justify-center font-bold">
            <Pill className="h-5 w-5" />
          </div>
        </div>

        {/* IN STOCK */}
        <div className="bg-[#dcfce7] border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">IN STOCK</p>
            <p className="text-2xl font-black text-emerald-950 mt-1">{inStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="bg-[#fef3c7] border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">LOW STOCK</p>
            <p className="text-2xl font-black text-amber-950 mt-1">{lowStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* OUT OF STOCK */}
        <div className="bg-[#ffe4e6] border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">OUT OF STOCK</p>
            <p className="text-2xl font-black text-rose-950 mt-1">{outOfStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-200/80 text-rose-800 flex items-center justify-center font-bold">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* FEFO EXPIRY NOTIFICATION SYSTEM BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300 dark:border-amber-900 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm dark:text-white">
                  FEFO Stock Rotation System Active
                </h3>
                <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {expiringBatches.length} Batches Need Action
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Products approaching expiry date are automatically prioritized for First Expiring, First Out (FEFO) dispensing or quarantine.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSubTab('expiring')}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
          >
            <span>Review FEFO Expiry Center</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Quick status chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/60 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">FEFO Status Summary:</span>
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2.5 py-0.5 rounded-md border border-red-200 text-[11px]">
            🔴 {batches.filter((b) => getDaysUntilExpiry(b.expiryDate) < 0).length} Expired (Blocked)
          </span>
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-md border border-rose-200 text-[11px]">
            🟠 {batches.filter((b) => { const d = getDaysUntilExpiry(b.expiryDate); return d >= 0 && d <= 30; }).length} Expires in &lt;30 Days
          </span>
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-md border border-amber-200 text-[11px]">
            🟡 {batches.filter((b) => { const d = getDaysUntilExpiry(b.expiryDate); return d > 30 && d <= 90; }).length} Expires in &lt;90 Days
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md border border-emerald-200 text-[11px]">
            🟢 {batches.filter((b) => getDaysUntilExpiry(b.expiryDate) > 90).length} Safe FEFO Shelf Life
          </span>
        </div>
      </div>

      {/* SUB-TAB NAV PILLS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('medicines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'medicines'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>All Medicines ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('batches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'batches'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Batch Ledger & FEFO Ranks ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('low')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'low'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Low Stock Alerts ({lowStockMeds.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('expiring')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'expiring'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>FEFO Expiry Center ({expiringBatches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'movements'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Stock Movements ({stockMovements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'requests'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Stock Requests ({stockRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('archived')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeSubTab === 'archived'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>Archived Medicines ({archivedMedicines.length})</span>
        </button>
      </div>

      {/* FILTER CONTROLS ROW */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* BRANCH */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">BRANCH</label>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="Kaziniya Drug store">Kaziniya Drug store</option>
              <option value="ALL">All Branches</option>
            </select>
          </div>

          {/* SUPPLIER */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">SUPPLIER</label>
            <select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* STOCK STATUS */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">STOCK STATUS</label>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* SEARCH WITH QR CODE BUTTON */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search or Scan QR</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Search with QR, name, SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (!enableBarcodeSystem) {
                    alert(
                      'The Barcode Scanning subsystem is currently turned OFF by the Drug Store Owner.\n\nTo activate camera & QR/barcode scanning, ask the Drug Store Owner to switch it ON in Settings > System & Store Parameters.'
                    );
                    return;
                  }
                  setIsScannerOpen(true);
                }}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition cursor-pointer ${
                  enableBarcodeSystem
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title={enableBarcodeSystem ? 'Scan QR Code or Barcode with Camera or File' : 'Barcode scanner turned OFF by Store Owner'}
              >
                <Scan className="h-4 w-4" />
                <span className="hidden xl:inline text-[11px]">Scan QR</span>
                {!enableBarcodeSystem && (
                  <span className="text-[9px] bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1 py-0.2 rounded font-bold uppercase">
                    Off
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shrink-0"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: ALL MEDICINES TABLE (Tabular Form matching Screenshot) */}
      {activeSubTab === 'medicines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0070ba] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">#</th>
                  <th className="px-4 py-3.5">MEDICINE NAME</th>
                  <th className="px-4 py-3.5">CATEGORY</th>
                  <th className="px-4 py-3.5">STOCK STATUS</th>
                  <th className="px-4 py-3.5">AVAILABLE STOCK</th>
                  <th className="px-4 py-3.5">BRANCH</th>
                  <th className="px-4 py-3.5 text-center w-32">OPTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      <p>No medicines found matching filters.</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToAddMedicine) {
                            onNavigateToAddMedicine();
                          } else {
                            setIsAddMedOpen(true);
                          }
                        }}
                        className="mt-3 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#02699e] text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Product</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedMedicines.map((med, idx) => {
                    const currentStock = med.totalStock || 0;
                    const isOut = currentStock <= 0;
                    const isLow = !isOut && currentStock <= med.reorderLevel;

                    return (
                      <tr key={med.id} className="hover:bg-sky-50/40 transition-colors">
                        {/* 1. SN */}
                        <td className="px-4 py-3.5 text-center font-bold text-slate-500">
                          {(validPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* 2. MEDICINE NAME (Thumbnail + Name + Generic + Strength/Form + Barcode) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white p-0.5 shrink-0 overflow-hidden shadow-2xs flex items-center justify-center">
                              <img
                                src={med.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80'}
                                alt={med.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  // Fallback placeholder image
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                {med.name}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap text-slate-500">
                                <span className="text-xs font-semibold text-slate-600">{med.genericName}</span>
                                {med.strength && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                    {med.strength}
                                  </span>
                                )}
                                {med.dosageForm && (
                                  <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200/80 text-[10px] font-bold uppercase">
                                    {med.dosageForm}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
                                {med.barcode || med.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. CATEGORY */}
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200/70 rounded-md font-bold text-[11px] uppercase tracking-wider">
                            {med.categoryName || 'MEDICINE'}
                          </span>
                        </td>

                        {/* 4. STOCK STATUS */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isOut
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>

                        {/* 5. AVAILABLE STOCK */}
                        <td className="px-4 py-3.5">
                          <div>
                            <div className="text-sm font-black text-slate-900">
                              {currentStock.toFixed(2)}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400">
                              ETB {(med.sellingPrice || 115).toFixed(2)}
                            </div>
                          </div>
                        </td>

                        {/* 6. BRANCH */}
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-slate-700 text-xs">
                            {med.branchName || 'Kaziniya Drug store'}
                          </span>
                        </td>

                        {/* 7. OPTIONS */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedMedForBarcode(med);
                                setIsBarcodeGenOpen(true);
                              }}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                              title="Generate & Print Code-128 Barcode Label"
                            >
                              <BarcodeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setSelectedMedForQr(med)}
                              className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                              title="Generate & Print QR Code Shelf Label"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const b = batches.find((b) => b.medicineId === med.id);
                                if (b) {
                                  setSelectedBatchForAdjust(b);
                                  setIsAdjustOpen(true);
                                } else {
                                  alert('No batch found to adjust for this medicine.');
                                }
                              }}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                              title="Adjust Stock Quantity"
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-slate-400 hover:text-slate-600 rounded-md font-bold">
                              •••
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* DYNAMIC PAGINATION FOOTER */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-semibold text-slate-700">
                Showing {totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1} to{' '}
                {Math.min(validPage * pageSize, totalItems)} of {totalItems} Results
              </span>

              {/* Items Per Page Selector (15 or 20 items per table) */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500">Items per page:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPageSize(15);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded font-bold border transition ${
                    pageSize === 15
                      ? 'bg-[#0070ba] text-white border-[#0070ba]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  15
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPageSize(20);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded font-bold border transition ${
                    pageSize === 20
                      ? 'bg-[#0070ba] text-white border-[#0070ba]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  20
                </button>
              </div>
            </div>

            {/* Pagination Number Buttons */}
            <div className="flex items-center gap-1 font-bold">
              <button
                type="button"
                disabled={validPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Previous Page"
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === validPage;
                // If many pages, show window around active
                if (
                  totalPages > 7 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(pageNum - validPage) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded border transition ${
                      isActive
                        ? 'bg-[#0070ba] text-white border-[#0070ba] shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Next Page"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BATCHES LEDGER TABLE */}
      {activeSubTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Batch Number</th>
                  <th className="px-6 py-3.5">Medicine Name</th>
                  <th className="px-6 py-3.5">Expiry Status</th>
                  <th className="px-6 py-3.5 text-center">Qty (Curr / Init)</th>
                  <th className="px-6 py-3.5">Purchase Cost</th>
                  <th className="px-6 py-3.5">Selling Price</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {batches.map((b) => {
                  const badge = getExpiryBadgeClass(b.expiryDate);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition dark:hover:bg-slate-950/50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {b.batchNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {b.medicineName}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${badge.bgClass} ${badge.textClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {b.currentQuantity} / {b.initialQuantity}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {formatCurrency(b.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-teal-700 dark:text-teal-400">
                        {formatCurrency(b.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatchForAdjust(b);
                            setIsAdjustOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LOW STOCK CENTER */}
      {activeSubTab === 'low' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <div className="text-xs">
              <span className="font-bold block">Reorder Alert Triggered</span>
              <span>The following medicines have dropped below their established store reorder threshold. Create a purchase order to replenish stock.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lowStockMeds.map((m) => (
              <div key={m.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-semibold text-amber-600 uppercase">{m.categoryName}</span>
                    <h4 className="font-bold text-slate-900 text-base dark:text-white">{m.name}</h4>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-amber-950 dark:text-amber-300">
                    Low Stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl dark:bg-slate-950">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Stock</span>
                    <span className="font-bold text-rose-600 text-sm">{m.totalStock} units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reorder Threshold</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{m.reorderLevel} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EXPIRY AUDIT CENTER */}
      {activeSubTab === 'expiring' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 shrink-0 text-rose-600" />
            <div className="text-xs">
              <span className="font-bold block">FEFO Safety System Active</span>
              <span>Expired items are automatically blocked from Point of Sale transactions. Use stock adjustments to quarantine or destroy expired batches.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {expiringBatches.map((b) => {
              const badge = getExpiryBadgeClass(b.expiryDate);
              return (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block">Batch: {b.batchNumber}</span>
                      <h4 className="font-bold text-slate-900 text-base dark:text-white">{b.medicineName}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${badge.bgClass} ${badge.textClass}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl dark:bg-slate-950">
                    <div className="flex justify-between text-slate-500">
                      <span>Remaining Quantity:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{b.currentQuantity} units</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Expiry Date:</span>
                      <span className="font-semibold text-rose-600">{formatDate(b.expiryDate)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBatchForAdjust(b);
                      setIsAdjustOpen(true);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-xl transition dark:bg-slate-800 dark:text-slate-200"
                  >
                    Adjust / Quarantine Batch
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: STOCK MOVEMENTS AUDIT LOG */}
      {activeSubTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-sky-600" />
                <span>Stock Movements & Inventory Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable ledger of all stock ins, POS dispenses, branch transfers, and write-off adjustments.
              </p>
            </div>
            <span className="bg-sky-50 text-sky-700 font-bold text-xs px-3 py-1 rounded-full border border-sky-200">
              {stockMovements.length} Total Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">REF ID</th>
                  <th className="px-4 py-3">TIMESTAMP</th>
                  <th className="px-4 py-3">MEDICINE & BATCH</th>
                  <th className="px-4 py-3">MOVEMENT TYPE</th>
                  <th className="px-4 py-3 text-right">QTY CHANGE</th>
                  <th className="px-4 py-3">FROM / TO LOCATION</th>
                  <th className="px-4 py-3">HANDLED BY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{mov.id}</td>
                    <td className="px-4 py-3 text-slate-500 font-medium">{mov.date}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{mov.medicineName}</span>
                      <span className="text-[10px] font-mono text-slate-400">Batch: {mov.batchNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          mov.type === 'PURCHASE_RECEIPT'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : mov.type === 'DISPENSED_POS'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : mov.type === 'ADJUSTMENT_WRITE_OFF'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold">
                      <span className={mov.qtyChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {mov.qtyChange > 0 ? `+${mov.qtyChange}` : mov.qtyChange} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <span className="block text-[11px] font-medium">{mov.fromLocation}</span>
                      <span className="block text-[10px] text-slate-400">➔ {mov.toLocation}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">{mov.handledBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: STOCK REQUESTS & BRANCH TRANSFERS */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#006cb7]" />
                <span>Inter-Branch Stock Requisitions & Store Transfers</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Request stock transfers between drug stores and main warehouses to balance regional stockouts.
              </p>
            </div>

            <button
              onClick={() => setIsCreateReqOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#006cb7] hover:bg-sky-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Create Stock Requisition
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">REQ ID</th>
                  <th className="px-4 py-3">DATE</th>
                  <th className="px-4 py-3">FROM BRANCH</th>
                  <th className="px-4 py-3">TO BRANCH</th>
                  <th className="px-4 py-3">ITEMS REQUESTED</th>
                  <th className="px-4 py-3">URGENCY</th>
                  <th className="px-4 py-3">STATUS</th>
                  <th className="px-4 py-3">REQUESTED BY</th>
                  <th className="px-4 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{req.id}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{req.requestDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{req.fromBranch}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{req.toBranch}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs">
                      {req.itemsRequested}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          req.urgency === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : req.status === 'DISPATCHED'
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{req.requestedBy}</td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => {
                            setStockRequests((prev) =>
                              prev.map((r) => (r.id === req.id ? { ...r, status: 'DISPATCHED' } : r))
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition"
                        >
                          Approve & Dispatch
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: ARCHIVED MEDICINES CATALOG */}
      {activeSubTab === 'archived' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-4 p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-slate-500" />
                <span>Archived & Discontinued Products Catalog</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                These formulations and batches have been archived due to phase-outs, regulatory updates, or replacement products.
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1 rounded-full border border-slate-200">
              {archivedMedicines.length} Archived Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">SKU / QR CODE</th>
                  <th className="px-4 py-3">MEDICINE NAME</th>
                  <th className="px-4 py-3">CATEGORY</th>
                  <th className="px-4 py-3">ARCHIVED DATE</th>
                  <th className="px-4 py-3">ARCHIVE REASON</th>
                  <th className="px-4 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {archivedMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No archived medicines in store catalog.
                    </td>
                  </tr>
                ) : (
                  archivedMedicines.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-mono text-slate-600 font-bold">{item.barcode}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">Brand: {item.brandName} • {item.genericName}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600">{item.categoryName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-500">{item.archivedDate}</td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs">{item.reason}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setArchivedMedicines((prev) => prev.filter((m) => m.id !== item.id));
                            setMedicines((prev) => [
                              ...prev,
                              {
                                id: item.id,
                                barcode: item.barcode,
                                sku: item.sku,
                                name: item.name,
                                genericName: item.genericName,
                                brandName: item.brandName,
                                categoryId: 'cat-1',
                                categoryName: item.categoryName,
                                dosageForm: 'Tablet',
                                strength: 'Standard',
                                unit: 'Box',
                                manufacturer: 'PharmCo',
                                description: 'Restored from archives',
                                prescriptionRequired: false,
                                reorderLevel: 15,
                                totalStock: 50,
                                sellingPrice: item.sellingPrice,
                                isActive: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              },
                            ]);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1 shadow-xs"
                        >
                          <Sparkles className="h-3 w-3" /> Restore Medicine
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STOCK REQUISITION */}
      {isCreateReqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#006cb7]" /> Create Stock Requisition
              </h3>
              <button
                onClick={() => setIsCreateReqOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reqForm.itemsRequested) return;
                const newReq = {
                  id: `REQ-${Date.now().toString().slice(-3)}`,
                  requestDate: new Date().toISOString().split('T')[0],
                  fromBranch: reqForm.fromBranch,
                  toBranch: reqForm.toBranch,
                  itemsRequested: reqForm.itemsRequested,
                  urgency: reqForm.urgency,
                  status: 'PENDING_APPROVAL',
                  requestedBy: 'Store Staff',
                };
                setStockRequests([newReq, ...stockRequests]);
                setIsCreateReqOpen(false);
                setReqForm({
                  fromBranch: 'Bole Sub-Branch',
                  toBranch: 'Kaziniya Drug store (Main)',
                  itemsRequested: '',
                  urgency: 'NORMAL',
                  notes: '',
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Requesting From Branch</label>
                <select
                  value={reqForm.fromBranch}
                  onChange={(e) => setReqForm({ ...reqForm, fromBranch: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#006cb7] focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Bole Sub-Branch">Bole Sub-Branch</option>
                  <option value="Kazanchis Branch">Kazanchis Branch</option>
                  <option value="Piassa Branch">Piassa Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Destination Branch</label>
                <select
                  value={reqForm.toBranch}
                  onChange={(e) => setReqForm({ ...reqForm, toBranch: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#006cb7] focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Kaziniya Drug store (Main)">Kaziniya Drug store (Main)</option>
                  <option value="Central Warehouse A">Central Warehouse A</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Requested Items & Quantities *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Amoxicillin 500mg (20 Boxes), Paracetamol Syrup (30 Bottles)"
                  value={reqForm.itemsRequested}
                  onChange={(e) => setReqForm({ ...reqForm, itemsRequested: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#006cb7] focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Urgency Level</label>
                <select
                  value={reqForm.urgency}
                  onChange={(e) => setReqForm({ ...reqForm, urgency: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#006cb7] focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH (Urgent Patient Need)</option>
                  <option value="LOW">LOW (Routine Replenishment)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateReqOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#006cb7] hover:bg-sky-700 text-white font-bold transition shadow-xs"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW MEDICINE */}
      {isAddMedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 text-lg dark:text-white">Register New Medicine & Initial Batch</h3>
              <button onClick={() => setIsAddMedOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Barcode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8901234567899"
                      value={addMedForm.barcode}
                      onChange={(e) => setAddMedForm({ ...addMedForm, barcode: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(true)}
                      className="bg-teal-600 text-white p-2 rounded-xl"
                    >
                      <Scan className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Medicine Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ciprofloxacin 500mg"
                    value={addMedForm.name}
                    onChange={(e) => setAddMedForm({ ...addMedForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Generic Ingredient</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ciprofloxacin HCl"
                    value={addMedForm.genericName}
                    onChange={(e) => setAddMedForm({ ...addMedForm, genericName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Category</label>
                  <select
                    value={addMedForm.categoryId}
                    onChange={(e) => setAddMedForm({ ...addMedForm, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Dosage Form</label>
                  <select
                    value={addMedForm.dosageForm}
                    onChange={(e) => setAddMedForm({ ...addMedForm, dosageForm: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    {['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream', 'Inhaler', 'Powder'].map((df) => (
                      <option key={df} value={df}>
                        {df}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Strength & Packaging</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg (Box of 10)"
                    value={addMedForm.strength}
                    onChange={(e) => setAddMedForm({ ...addMedForm, strength: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Initial Batch Registration Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-900 text-xs block dark:text-white">Initial Stock Batch Details</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Batch Number</label>
                    <input
                      type="text"
                      required
                      value={addMedForm.batchNumber}
                      onChange={(e) => setAddMedForm({ ...addMedForm, batchNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={addMedForm.expDate}
                      onChange={(e) => setAddMedForm({ ...addMedForm, expDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cost Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={addMedForm.purchasePrice}
                      onChange={(e) => setAddMedForm({ ...addMedForm, purchasePrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Sell Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={addMedForm.sellingPrice}
                      onChange={(e) => setAddMedForm({ ...addMedForm, sellingPrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMedOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK ADJUSTMENT */}
      {isAdjustOpen && selectedBatchForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 text-base dark:text-white">
                Stock Adjustment: {selectedBatchForAdjust.batchNumber}
              </h3>
              <button onClick={() => setIsAdjustOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl dark:bg-slate-950 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{selectedBatchForAdjust.medicineName}</span>
                <span className="text-slate-500 text-[10px]">Current Quantity: {selectedBatchForAdjust.currentQuantity} units</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Adjustment Type</label>
                <select
                  value={adjustForm.transactionType}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      transactionType: e.target.value as any,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                >
                  <option value="ADJUSTMENT">Inventory Audit Adjustment (+/-)</option>
                  <option value="DAMAGED">Damaged / Broken Package (-)</option>
                  <option value="EXPIRED">Expired Batch Removal (-)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">
                  Quantity Delta (e.g. -5 for removal, +10 for audit addition)
                </label>
                <input
                  type="number"
                  required
                  value={adjustForm.quantityDelta}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityDelta: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 dark:text-slate-300">Audit Notes / Reason</label>
                <textarea
                  required
                  placeholder="Explain why stock is being adjusted..."
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 font-bold text-white hover:bg-teal-700"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        verifyInDatabase={!isAddMedOpen}
        knownMedicines={medicines}
        onAddNewMedicine={(code) => {
          setAddMedForm((prev) => ({ ...prev, barcode: code }));
          setIsAddMedOpen(true);
        }}
        onScan={(scannedCode) => {
          const clean = extractCleanBarcode(scannedCode);
          if (isAddMedOpen) {
            setAddMedForm((prev) => ({ ...prev, barcode: clean }));
          } else {
            setSearchQuery(clean);
            setActiveSubTab('medicines');
          }
        }}
      />

      {/* Medicine QR Code & Shelf Label Modal */}
      <MedicineQrCodeModal
        isOpen={!!selectedMedForQr}
        onClose={() => setSelectedMedForQr(null)}
        medicine={selectedMedForQr}
      />

      {/* Code-128 Internal Barcode Generator Modal */}
      <BarcodeGeneratorModal
        isOpen={isBarcodeGenOpen}
        onClose={() => {
          setIsBarcodeGenOpen(false);
          setSelectedMedForBarcode(null);
        }}
        medicine={selectedMedForBarcode}
        onBarcodeUpdated={(medId, newBarcode) => {
          setMedicines((prev) =>
            prev.map((m) => (m.id === medId ? { ...m, barcode: newBarcode } : m))
          );
        }}
      />

      {/* Bulk CSV Medicine Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        categories={categories}
        suppliers={suppliers}
        onImportComplete={() => {
          fetchInventoryData();
        }}
      />
    </div>
  );
};
