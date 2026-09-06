import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
  Building2,
  Tag,
  Boxes,
  Pill,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  Layers,
  CheckCircle2,
  Camera,
  Scan,
  RefreshCw,
  Package,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CategoryOption {
  id: string;
  name: string;
  icon?: any;
}

interface SupplierOption {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
}

interface MedicineOption {
  id: string;
  name?: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
  dosageUnit?: string;
  dosageForm?: string;
  manufacturer?: string;
  atcCode?: string;
  barcode?: string;
  description?: string;
  prescriptionRequired?: boolean;
}

interface AddMedicineViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const AddMedicineView: React.FC<AddMedicineViewProps> = ({ onBack, onSuccess }) => {
  const { showToast } = useToast();

  // Basic Information & Direct Inputs
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');
  const [genericName, setGenericName] = useState<string>('');
  const [strength, setStrength] = useState<string>('500mg');
  const [dosageForm, setDosageForm] = useState<string>('Tablet');
  const [manufacturer, setManufacturer] = useState<string>('Ethiopian Pharmaceuticals (EPHARM)');
  const [barcode, setBarcode] = useState<string>(() => `6281${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [shelfLocation, setShelfLocation] = useState<string>('Shelf A-01');

  // Initial Batch & Stock Configuration
  const [initialQuantity, setInitialQuantity] = useState<number | string>('100');
  const [batchNumber, setBatchNumber] = useState<string>(() => `KZ-BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [mfgDate, setMfgDate] = useState<string>('2025-01-01');
  const [expDate, setExpDate] = useState<string>('2028-06-30');

  // Pricing Information
  const [buyPrice, setBuyPrice] = useState<number | string>('100.00');
  const [profitMargin, setProfitMargin] = useState<number | string>('25.00');
  const [sellPrice, setSellPrice] = useState<number | string>('125.00');

  // Classification
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Discontinued'>('Active');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Medicine']);

  // Media Assets
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [coverImageName, setCoverImageName] = useState<string>('');

  // Additional Settings
  const [prescriptionRequired, setPrescriptionRequired] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');

  // Dropdown lists & data
  const [medicinesList, setMedicinesList] = useState<MedicineOption[]>([]);
  const [suppliersList, setSuppliersList] = useState<SupplierOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [isAddGenericModalOpen, setIsAddGenericModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  // Add Generic Medicine Modal state
  const [newMedBrandName, setNewMedBrandName] = useState('');
  const [newMedGenericName, setNewMedGenericName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('');
  const [newMedDosageUnit, setNewMedDosageUnit] = useState('');
  const [dosageUnitSearch, setDosageUnitSearch] = useState('');
  const [isDosageUnitOpen, setIsDosageUnitOpen] = useState(false);

  const [newMedDosageForm, setNewMedDosageForm] = useState('');
  const [dosageFormSearch, setDosageFormSearch] = useState('');
  const [isDosageFormOpen, setIsDosageFormOpen] = useState(false);

  const [newMedManufacturer, setNewMedManufacturer] = useState('');
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [isManufacturerOpen, setIsManufacturerOpen] = useState(false);

  const [newMedAtcCode, setNewMedAtcCode] = useState('');

  // Modal validation state to enforce that it's filled first
  const [modalErrors, setModalErrors] = useState<{
    brandName?: boolean;
    genericName?: boolean;
    strength?: boolean;
    dosageUnit?: boolean;
    dosageForm?: boolean;
    manufacturer?: boolean;
  }>({});

  // Quick Add Supplier state
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  // Two Ways to Register Product: 'scan' (AI Visual Packaging Scanner) or 'manual' (Direct Entry)
  const [registrationMode, setRegistrationMode] = useState<'scan' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [selectedPresetHint, setSelectedPresetHint] = useState<string>('Amoxil 500mg');
  const scannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const packagingFileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Start Live Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      if (scannerVideoRef.current) {
        scannerVideoRef.current.srcObject = stream;
        scannerVideoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access denied or unavailable. You can upload a photo or select sample packaging below.');
      setIsCameraActive(false);
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scannerVideoRef.current) {
      scannerVideoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture Frame & Execute AI Scan
  const captureFrameAndScan = async () => {
    if (!scannerVideoRef.current) return;
    try {
      const video = scannerVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      await executeScan(base64, selectedPresetHint);
    } catch (err: any) {
      showToast('Failed to snapshot camera frame: ' + err.message, 'warning');
    }
  };

  // Handle Photo File Upload
  const handlePackagingFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      executeScan(base64, selectedPresetHint);
    };
    reader.readAsDataURL(file);
  };

  // Execute AI Visual Scan (calls /api/gemini/scan-medicine)
  const executeScan = async (base64Image?: string, hint?: string) => {
    setIsScanning(true);
    setScannedResult(null);
    try {
      const res = await fetch('/api/gemini/scan-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-4' },
        body: JSON.stringify({
          image: base64Image || '',
          medicineHint: hint || selectedPresetHint,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setScannedResult(data.data);
        showToast(`✓ Recognized: ${data.data.name} (${data.data.dosageForm}) • No Barcode Needed!`, 'success', 'Packaging Identified');
      } else {
        throw new Error(data.message || 'Recognition failed');
      }
    } catch (err: any) {
      showToast('Packaging scan failed: ' + err.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply Scanned Medicine Details into Form Fields
  const applyScannedMedicine = (item: any) => {
    if (!item) return;
    setBrandName(item.brandName || item.name || '');
    setGenericName(item.genericName || item.brandName || item.name || '');
    setStrength(item.strength || '500mg');
    setDosageForm(item.dosageForm || 'Tablet');
    setManufacturer(item.manufacturer || 'Ethiopian Pharmaceuticals (EPHARM)');
    setBatchNumber(item.batchNumber || `KZ-BAT-${Date.now().toString().slice(-4)}`);
    if (item.expDate) setExpDate(item.expDate);
    if (item.mfgDate) setMfgDate(item.mfgDate);
    if (item.suggestedSellingPrice) setSellPrice(String(item.suggestedSellingPrice));
    if (item.suggestedPurchasePrice) setBuyPrice(String(item.suggestedPurchasePrice));
    if (item.suggestedQuantity) setInitialQuantity(String(item.suggestedQuantity));
    if (item.shelfLocation) setShelfLocation(item.shelfLocation);
    if (item.prescriptionRequired !== undefined) setPrescriptionRequired(item.prescriptionRequired);
    if (item.barcode || item.generatedCode) {
      setBarcode(item.barcode || item.generatedCode);
    } else {
      setBarcode(`KZ-MED-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setDescription(`Visually recognized: ${item.name} (${item.genericName}). ${item.detectedText ? `Packaging text: "${item.detectedText}".` : ''}`);
    setRegistrationMode('manual');
    showToast('✓ Scanned packaging details loaded into registration form! Review and click Save.', 'success', 'Form Ready');
  };

  // File Input Ref
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Dosage Units, Forms, and Manufacturers Lists
  const dosageUnits = ['mg', 'g', 'ml', 'mcg', 'IU', '%', 'vial', 'ampoule', 'drop', 'puff', 'tablet', 'capsule', 'suppository'];
  const dosageForms = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Suspension',
    'Injection',
    'Cream',
    'Ointment',
    'Drops',
    'Inhaler',
    'Powder',
    'Solution',
    'Gel',
    'Suppository',
    'Spray',
  ];
  const manufacturers = [
    'Ethiopian Pharmaceuticals (EPHARM)',
    'Julphar Pharmaceuticals Ethiopia',
    'Cadila Pharmaceuticals',
    'Novartis International AG',
    'Sun Pharmaceutical Industries',
    'Pfizer Global Pharma',
    'Sanofi Aventis',
    'GlaxoSmithKline (GSK)',
    'AstraZeneca',
    'Cipla Laboratories',
    'Bayer AG Healthcare',
    'Roche Pharmaceuticals',
    'MedTech BioPharma Ethiopia',
  ];

  // Sample pharmaceutical product images
  const sampleProductImages = [
    {
      label: 'Paracetamol Tablets',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
    },
    {
      label: 'Amoxicillin Capsules',
      url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80',
    },
    {
      label: 'Pediatric Oral Suspension',
      url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80',
    },
    {
      label: 'Insulin Vial & Injection',
      url: 'https://images.unsplash.com/photo-1579165466791-78822231ac67?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Fetch initial medicines and suppliers
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [medRes, supRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/suppliers'),
      ]);

      const [medData, supData] = await Promise.all([
        medRes.json(),
        supRes.json(),
      ]);

      if (medData.success && medData.data) {
        const mapped: MedicineOption[] = medData.data.map((m: any) => ({
          id: m.id,
          brandName: m.brandName || m.name,
          genericName: m.genericName || m.name,
          strength: m.strength || '500mg',
          dosageForm: m.dosageForm || 'Tablet',
          manufacturer: m.manufacturer || 'Standard Pharma',
          atcCode: m.atcCode || '',
          barcode: m.barcode || '',
          description: m.description || '',
          prescriptionRequired: m.prescriptionRequired !== undefined ? m.prescriptionRequired : true,
        }));
        setMedicinesList(mapped);
      }

      if (supData.success && supData.data) {
        setSuppliersList(supData.data);
      }
    } catch (e) {
      console.error('Error fetching initial medicine or supplier data:', e);
    }
  };

  // Auto-calculate Sell Price whenever Buy Price or Profit Margin changes
  useEffect(() => {
    const buy = parseFloat(String(buyPrice)) || 0;
    const margin = parseFloat(String(profitMargin)) || 0;
    const calculated = buy + (buy * margin) / 100;
    setSellPrice(calculated.toFixed(2));
  }, [buyPrice, profitMargin]);

  // When a medicine is chosen from the dropdown, auto-populate details
  const handleSelectMedicine = (medId: string) => {
    setSelectedMedicineId(medId);
    if (!medId) return;
    const med = medicinesList.find((m) => m.id === medId);
    if (med) {
      setBrandName(med.brandName || med.name);
      setGenericName(med.genericName || med.brandName || med.name);
      setStrength(med.strength || '500mg');
      setDosageForm(med.dosageForm || 'Tablet');
      setManufacturer(med.manufacturer || 'Ethiopian Pharmaceuticals (EPHARM)');
      if (med.barcode) setBarcode(med.barcode);
      if (med.description) setDescription(med.description);
      if (med.prescriptionRequired !== undefined) setPrescriptionRequired(med.prescriptionRequired);
      showToast(`Selected "${med.brandName || med.name}". Details loaded.`, 'info');
    }
  };

  // Toggle category
  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName]
    );
  };

  // Handle Cover Image Upload
  const handleCoverUpload = (file: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Image file size must be less than 4MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
      setCoverImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 2MB)`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit "+ Add Generic Name" Modal - Validating required fields first
  const handleAddGenericSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      brandName?: boolean;
      genericName?: boolean;
      strength?: boolean;
      dosageUnit?: boolean;
      dosageForm?: boolean;
      manufacturer?: boolean;
    } = {};

    if (!newMedBrandName.trim()) errors.brandName = true;
    if (!newMedGenericName.trim()) errors.genericName = true;
    if (!newMedStrength.trim()) errors.strength = true;
    if (!newMedDosageUnit.trim()) errors.dosageUnit = true;
    if (!newMedDosageForm.trim()) errors.dosageForm = true;
    if (!newMedManufacturer.trim()) errors.manufacturer = true;

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      showToast('All required fields marked with * must be filled first.', 'warning', 'Required Fields Missing');
      return;
    }

    setModalErrors({});
    const newId = `med-custom-${Date.now()}`;
    const newMedItem: MedicineOption = {
      id: newId,
      brandName: newMedBrandName.trim(),
      genericName: newMedGenericName.trim(),
      strength: `${newMedStrength.trim()} ${newMedDosageUnit}`,
      dosageUnit: newMedDosageUnit,
      dosageForm: newMedDosageForm,
      manufacturer: newMedManufacturer,
      atcCode: newMedAtcCode.trim(),
      prescriptionRequired: true,
      description: `${newMedBrandName.trim()} (${newMedGenericName.trim()}) formulated in ${newMedDosageForm} dosage form manufactured by ${newMedManufacturer}.`,
    };

    setMedicinesList((prev) => [newMedItem, ...prev]);
    setSelectedMedicineId(newId);
    setBrandName(newMedItem.brandName);
    setGenericName(newMedItem.genericName);
    setStrength(newMedItem.strength);
    setDosageForm(newMedItem.dosageForm);
    setManufacturer(newMedItem.manufacturer);
    setDescription(newMedItem.description || '');
    setIsAddGenericModalOpen(false);

    // Reset modal form
    setNewMedBrandName('');
    setNewMedGenericName('');
    setNewMedStrength('');
    setNewMedDosageUnit('');
    setNewMedDosageForm('');
    setNewMedManufacturer('');
    setNewMedAtcCode('');

    showToast(`"${newMedItem.brandName}" populated! Now configure price and initial batch.`, 'success', 'Medicine Added');
  };

  // Submit Quick Add Supplier Modal
  const handleAddSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      showToast('Supplier Name is required.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName.trim(),
          phone: newSupplierPhone.trim() || '+251 911 000 000',
          contactPerson: newSupplierContact.trim() || 'Distribution Rep',
          city: 'Addis Ababa',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSuppliersList((prev) => [data.data, ...prev]);
        setSelectedSupplierId(data.data.id);
        setIsAddSupplierModalOpen(false);
        setNewSupplierName('');
        setNewSupplierPhone('');
        setNewSupplierContact('');
        showToast('Supplier registered and selected!', 'success');
      } else {
        const localId = `sup-local-${Date.now()}`;
        const localSup: SupplierOption = {
          id: localId,
          name: newSupplierName.trim(),
          phone: newSupplierPhone.trim(),
          contactPerson: newSupplierContact.trim(),
        };
        setSuppliersList((prev) => [localSup, ...prev]);
        setSelectedSupplierId(localId);
        setIsAddSupplierModalOpen(false);
        showToast('Supplier added and selected!', 'success');
      }
    } catch {
      const localId = `sup-local-${Date.now()}`;
      const localSup: SupplierOption = {
        id: localId,
        name: newSupplierName.trim(),
        phone: newSupplierPhone.trim(),
        contactPerson: newSupplierContact.trim(),
      };
      setSuppliersList((prev) => [localSup, ...prev]);
      setSelectedSupplierId(localId);
      setIsAddSupplierModalOpen(false);
      showToast('Supplier added and selected!', 'success');
    }
  };

  // Main Submit Handler
  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveBrandName = (brandName || '').trim();
    if (!effectiveBrandName) {
      showToast('Medicine Brand Name is required. Enter name or pick from formulary.', 'warning', 'Medicine Name Required');
      return;
    }

    if (selectedCategories.length === 0) {
      showToast('Please select at least one classification category.', 'warning', 'Category Required');
      return;
    }

    const effectiveGenericName = (genericName || effectiveBrandName).trim();
    const finalBarcode = (barcode || '').trim() || `6281${Math.floor(10000000 + Math.random() * 90000000)}`;

    setIsSubmitting(true);

    try {
      const buyNum = parseFloat(String(buyPrice)) || 0;
      const sellNum = parseFloat(String(sellPrice)) || (buyNum > 0 ? buyNum * 1.25 : 20);
      const qtyNum = Math.max(1, parseInt(String(initialQuantity), 10) || 100);

      const payload = {
        barcode: finalBarcode,
        name: effectiveBrandName,
        brandName: effectiveBrandName,
        genericName: effectiveGenericName,
        dosageForm: dosageForm || 'Tablet',
        strength: strength || '500mg',
        manufacturer: manufacturer || 'Ethiopian Pharmaceuticals (EPHARM)',
        description: description || `${effectiveBrandName} (${effectiveGenericName}) formulated for clinical therapeutic management.`,
        prescriptionRequired: prescriptionRequired,
        shelfLocation: shelfLocation || 'Shelf A-01',
        status: status,
        categories: selectedCategories,
        coverImage: coverImage || undefined,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
        initialBatch: {
          batchNumber: batchNumber.trim() || `KZ-BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          mfgDate: mfgDate || '2025-01-01',
          expDate: expDate || '2028-06-30',
          purchasePrice: buyNum,
          sellingPrice: sellNum,
          quantity: qtyNum,
          supplierId: selectedSupplierId || 'sup-1',
        },
      };

      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'u-1',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `Product "${effectiveBrandName}" successfully added to stock with ${qtyNum} units!`,
          'success',
          'Product Saved'
        );
        if (onSuccess) {
          onSuccess();
        } else {
          onBack();
        }
      } else {
        showToast(data.message || 'Failed to add medicine.', 'error');
      }
    } catch (err: any) {
      console.error('Error adding medicine:', err);
      showToast('Network error while registering medicine. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* TOP BREADCRUMB & HEADER */}
      <div className="space-y-2">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#0070ba] transition cursor-pointer"
          >
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#0070ba] transition cursor-pointer"
          >
            Medicine
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-[#0070ba] font-bold">Add Product</span>
        </div>

        {/* Title, Subtitle & Stepper Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 sm:mt-0 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              title="Return to medicines inventory table"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Add New Medicine
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Choose branch, generic and brand names, set pricing and images, select categories, then save.
              </p>
            </div>
          </div>

          {/* Stepper / Mode Badge */}
          <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-sky-50 text-[#0070ba] border border-sky-200/70 text-xs font-extrabold tracking-wide shadow-2xs">
            Two Ways: AI Visual Scan · Manual Entry
          </div>
        </div>
      </div>

      {/* TWO WAYS TO REGISTER / ADD PRODUCT SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRegistrationMode('scan')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
            registrationMode === 'scan'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Camera className="h-4.5 w-4.5" />
          <span>1. Scan Medicine Packaging (No Barcode/QR Needed)</span>
        </button>
        <button
          type="button"
          onClick={() => setRegistrationMode('manual')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition cursor-pointer ${
            registrationMode === 'manual'
              ? 'bg-[#0070ba] text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileText className="h-4.5 w-4.5" />
          <span>2. Manual Product Registration Form</span>
        </button>
      </div>

      {/* METHOD 1: VISUAL MEDICINE PACKAGING SCANNER PANEL */}
      {registrationMode === 'scan' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-2xl border-2 border-emerald-500/40 p-6 text-white space-y-6 shadow-xl">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Visual Medicine Packaging Recognition</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                    NO BARCODE REQUIRED
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan the whole medicine or visible packaging (blister foil, carton, bottle, vial, or strip) using camera or photo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Open Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Stop Camera</span>
                </button>
              )}

              <input
                type="file"
                ref={packagingFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePackagingFileUpload}
              />
              <button
                type="button"
                onClick={() => packagingFileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="h-4 w-4 text-emerald-400" />
                <span>Upload Packaging Photo</span>
              </button>
            </div>
          </div>

          {/* Camera Viewfinder / Laser Overlay */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-slate-900/90 overflow-hidden h-64 sm:h-72 flex items-center justify-center shadow-inner">
                {/* Real Video Element */}
                <video
                  ref={scannerVideoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <Package className="h-12 w-12 text-emerald-400/80 mb-1" />
                    <p className="font-bold text-sm text-white">Camera is currently idle</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Click "Open Camera" to scan blister strips, bottles, and packaging, upload an image, or click one of the quick packaging presets below.
                    </p>
                  </div>
                )}

                {/* Laser scan line when camera or scanning is active */}
                {(isCameraActive || isScanning) && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />
                )}

                {/* Corner reticle brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

                {/* Loading indicator */}
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20">
                    <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin mb-2" />
                    <span className="font-bold text-white text-sm">Analyzing Medicine Packaging...</span>
                    <span className="text-xs text-emerald-300 font-mono mt-1">Reading API, formulation & strength without barcode</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Action buttons under camera */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={captureFrameAndScan}
                    disabled={isScanning}
                    className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Scan className="h-4 w-4" />
                    <span>Capture & Recognize Medicine</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Recognition Results or Quick Presets */}
            <div className="lg:col-span-5 space-y-4">
              {scannedResult ? (
                <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Visual Detection Matched
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      {Math.round((scannedResult.confidence || 0.95) * 100)}% Confidence
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-black text-sm text-white">{scannedResult.name}</p>
                    <p className="text-slate-300">
                      <strong className="text-slate-400">Generic (API):</strong> {scannedResult.genericName}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Strength / Form:</span>
                        <span className="font-bold text-emerald-300">{scannedResult.strength} • {scannedResult.dosageForm}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Batch / Expiry:</span>
                        <span className="font-bold text-emerald-300">{scannedResult.batchNumber} • {scannedResult.expDate}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Suggested Buy / Sell:</span>
                        <span className="font-bold text-white">${scannedResult.suggestedPurchasePrice} / ${scannedResult.suggestedSellingPrice}</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Manufacturer:</span>
                        <span className="font-bold text-white truncate block">{scannedResult.manufacturer}</span>
                      </div>
                    </div>

                    {scannedResult.detectedText && (
                      <p className="text-[10px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
                        Packaging Text: "{scannedResult.detectedText}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => applyScannedMedicine(scannedResult)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Apply Recognized Details to Form & Save</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                    Quick Packaging Presets (One-Click Scan)
                  </span>
                  <p className="text-xs text-slate-400">
                    Test the AI visual recognition immediately with authentic pharmaceutical packaging samples:
                  </p>
                  <div className="space-y-2">
                    {[
                      { name: 'Amoxil 500mg Capsules', type: 'Blister Strip' },
                      { name: 'Paracetamol 500mg Tablets', type: 'Carton Box (10 Strips)' },
                      { name: 'Ciprofloxacin 500mg', type: 'Foil Packaging' },
                      { name: 'Omeprazole 20mg Delayed-Release', type: 'Blister Pack' },
                      { name: 'Metformin 850mg Tablets', type: 'Box of 60 Tablets' },
                    ].map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => {
                          setSelectedPresetHint(sample.name);
                          executeScan(undefined, sample.name);
                        }}
                        className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-xs text-white group-hover:text-emerald-300 block">
                            {sample.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{sample.type}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition">
                          Simulate Scan →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleMainSubmit} className="space-y-6">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-400">Medicine Basic Details, Generic Identity & Packaging</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalErrors({});
                  setIsAddGenericModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0070ba] hover:bg-[#005a9c] text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Generic Name (Modal)</span>
              </button>
            </div>
          </div>

          {/* Quick Formulary Auto-Fill Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-[#0070ba] shrink-0" />
              <span className="text-slate-700">
                <strong>Quick Fill from Formulary:</strong> Select any existing registered medicine or type details directly below.
              </span>
            </div>
            <div className="w-full md:w-72">
              <select
                value={selectedMedicineId}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setModalErrors({});
                    setIsAddGenericModalOpen(true);
                  } else {
                    handleSelectMedicine(e.target.value);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-[#0070ba] focus:outline-none shadow-2xs"
              >
                <option value="">-- Choose Existing Medicine to Restock --</option>
                <option value="__NEW__" className="text-[#0070ba] font-bold">
                  + Add Generic Name (Formulary Modal)
                </option>
                {medicinesList.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.brandName} ({med.genericName}) - {med.strength} {med.dosageForm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Brand / Product Name * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Brand / Product Name <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol 500mg, Amoxicillin"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>

            {/* Generic Name / Active Ingredient * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Generic Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol, Amoxicillin Trihydrate"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>

            {/* Dosage Strength * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Dosage Strength <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500mg, 250mg/5ml, 1g"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>

            {/* Dosage Form * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Dosage Form <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Suspension">Suspension</option>
                <option value="Injection">Injection</option>
                <option value="IV Infusion">IV Infusion</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
                <option value="Eye Drops">Eye Drops</option>
                <option value="Ear Drops">Ear Drops</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Suppository">Suppository</option>
                <option value="Powder / Granules">Powder / Granules</option>
              </select>
            </div>

            {/* Manufacturer */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Ethiopian Pharmaceuticals (EPHARM)"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Barcode
                </label>
                <button
                  type="button"
                  onClick={() => setBarcode(`6281${Math.floor(10000000 + Math.random() * 90000000)}`)}
                  className="text-[11px] font-bold text-[#0070ba] hover:underline cursor-pointer"
                >
                  Generate New
                </button>
              </div>
              <input
                type="text"
                placeholder="Scan or enter barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>

            {/* Supplier (Optional) + Add New */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Supplier (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(true)}
                  className="text-xs font-bold text-[#0070ba] hover:text-[#005a9c] hover:underline cursor-pointer"
                >
                  Add New
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              >
                <option value="">Select Supplier</option>
                {suppliersList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} {sup.phone ? `(${sup.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Shelf Location (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Shelf Location (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Shelf A-01, Fridge 2"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING & INITIAL BATCH STOCK */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Pricing & Initial Stock Intake</h2>
            <p className="text-xs text-slate-400">Configure Cost, Profit Margin, Initial Quantity, and Batch Details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Buy Price * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Buy Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Profit Margin * */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Profit Margin <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Sell Price (Calculated / Editable) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Sell Price (Retail ETB)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-emerald-50/50 pl-12 pr-3.5 py-2.5 text-xs font-black text-emerald-700 focus:border-[#0070ba] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Batch & Initial Stock Intake Row */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Initial Stock Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Initial Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                placeholder="100"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:outline-none"
              />
            </div>

            {/* Batch Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Batch / Lot # <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setBatchNumber(`KZ-BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)}
                  className="text-[10px] text-[#0070ba] font-bold hover:underline cursor-pointer"
                >
                  Gen #
                </button>
              </div>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. KZ-BAT-2026-842"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0070ba] focus:outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Expiry Date (Exp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:outline-none"
              />
            </div>

            {/* Manufacturing Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Manufacturing Date (Mfg)
              </label>
              <input
                type="date"
                value={mfgDate}
                onChange={(e) => setMfgDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: CLASSIFICATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Classification</h2>
            <p className="text-xs text-slate-400">Unit Type And Categories</p>
          </div>

          <div className="space-y-4">
            {/* Status * */}
            <div className="max-w-xs space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>

            {/* Select Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Select Categories
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Medicine', icon: Pill, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                  { name: 'Medical Supplies', icon: Boxes, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                  { name: 'Chemicals and Reagents', icon: Tag, color: 'text-purple-600 bg-purple-50 border-purple-200' },
                  { name: 'Accessory', icon: Building2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                ].map((cat) => {
                  const isChecked = selectedCategories.includes(cat.name);
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
                        isChecked
                          ? 'border-[#0070ba] bg-sky-50/70 shadow-2xs ring-1 ring-[#0070ba]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-[#0070ba] border-[#0070ba] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${isChecked ? 'text-[#0070ba]' : 'text-slate-800'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: MEDIA ASSETS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Media Assets</h2>
            <p className="text-xs text-slate-400">Upload Medicine Images</p>
          </div>

          <div className="space-y-5">
            {/* Cover Image * */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Cover Image <span className="text-rose-500">*</span>
              </label>

              {coverImage ? (
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-2xs">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {coverImageName || 'Cover Image Selected'}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Image ready for catalog display
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImageName('');
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Cover Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleCoverUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0070ba] hover:bg-sky-50/30 p-6 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center text-slate-500 group-hover:text-[#0070ba] transition">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    PNG, JPG, GIF — 4MB max
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Recommended size 100×100 px, formats JPG, PNG, max size 2MB
                  </span>
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCoverUpload(e.target.files[0]);
                  }
                }}
              />

              {/* Sample Preset Images */}
              {!coverImage && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    Or select a preset product image:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sampleProductImages.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCoverImage(sample.url);
                          setCoverImageName(sample.label);
                        }}
                        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-[#0070ba] bg-white text-xs font-semibold text-slate-700 transition cursor-pointer"
                      >
                        <img
                          src={sample.url}
                          alt={sample.label}
                          className="w-5 h-5 rounded-md object-cover"
                        />
                        <span className="text-[11px]">{sample.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Gallery Images
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
                >
                  Choose Files
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  {galleryImages.length > 0 ? `${galleryImages.length} files chosen` : 'No file chosen'}
                </span>
              </div>

              <span className="text-[10px] text-slate-400 block">
                Recommended size 100×100 px · max size 2MB each
              </span>

              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={(e) => handleGalleryUpload(e.target.files)}
              />

              {/* Gallery Preview Grid */}
              {galleryImages.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                    >
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: ADDITIONAL SETTINGS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Additional Settings</h2>
            <p className="text-xs text-slate-400">Extra Configurations And Details</p>
          </div>

          <div className="space-y-5">
            {/* Is Prescription Required? */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-[#0070ba]" />
                  Is Prescription Required?
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Enforces mandatory doctor Rx license verification at checkout & POS
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prescriptionRequired}
                  onChange={(e) => setPrescriptionRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0070ba]"></div>
              </label>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Description</label>
              <textarea
                rows={3}
                placeholder="Enter Medicine Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0070ba] focus:ring-1 focus:ring-[#0070ba] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-[#0070ba] hover:bg-[#005a9c] active:scale-[0.98] text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <span>Save Product & Add to Stock</span>
            )}
          </button>
        </div>
      </form>

      {/* MODAL 1: ADD MEDICINE (ADD GENERIC NAME) - MATCHING PICTURE 4 */}
      {isAddGenericModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Add Medicine</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddGenericModalOpen(false);
                  setModalErrors({});
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Missing Fields Banner if submitted incomplete */}
            {Object.keys(modalErrors).length > 0 && (
              <div className="mx-6 mb-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>Please fill in all required fields marked with * first before adding medicine.</span>
              </div>
            )}

            {/* Modal Body: 2-Column Layout matching Picture 4 */}
            <form onSubmit={handleAddGenericSubmit} className="p-6 pt-2 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                  {/* Brand Name * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMedBrandName}
                      onChange={(e) => {
                        setNewMedBrandName(e.target.value);
                        if (modalErrors.brandName) setModalErrors((prev) => ({ ...prev, brandName: false }));
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.brandName ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070ba] focus:outline-none transition`}
                    />
                    {modalErrors.brandName && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Brand Name is required first</span>
                    )}
                  </div>

                  {/* Dosage Strength * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Dosage Strength <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMedStrength}
                      onChange={(e) => {
                        setNewMedStrength(e.target.value);
                        if (modalErrors.strength) setModalErrors((prev) => ({ ...prev, strength: false }));
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.strength ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070ba] focus:outline-none transition`}
                    />
                    {modalErrors.strength && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Dosage Strength is required first</span>
                    )}
                  </div>

                  {/* Dosage Form: * (With colon matching Picture 4) */}
                  <div className="space-y-1 relative">
                    <label className="font-bold text-slate-800 block">
                      Dosage Form: <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDosageFormOpen(!isDosageFormOpen);
                        setIsDosageUnitOpen(false);
                        setIsManufacturerOpen(false);
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.dosageForm ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-left flex items-center justify-between bg-white focus:border-[#0070ba] transition cursor-pointer`}
                    >
                      <span className={newMedDosageForm ? 'text-slate-800 font-medium' : 'text-slate-400 font-normal'}>
                        {newMedDosageForm || 'Search'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    </button>
                    {modalErrors.dosageForm && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Dosage Form is required first</span>
                    )}

                    {isDosageFormOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                        <div className="relative mb-1">
                          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search"
                            value={dosageFormSearch}
                            onChange={(e) => setDosageFormSearch(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0070ba]"
                          />
                        </div>
                        {dosageForms
                          .filter((f) => f.toLowerCase().includes(dosageFormSearch.toLowerCase()))
                          .map((f) => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => {
                                setNewMedDosageForm(f);
                                setIsDosageFormOpen(false);
                                if (modalErrors.dosageForm) setModalErrors((prev) => ({ ...prev, dosageForm: false }));
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition cursor-pointer ${
                                newMedDosageForm === f ? 'bg-sky-50 text-[#0070ba] font-bold' : 'text-slate-700'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Atc Code (Optional) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Atc Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={newMedAtcCode}
                      onChange={(e) => setNewMedAtcCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070ba] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                  {/* Generic Name * */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Generic Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMedGenericName}
                      onChange={(e) => {
                        setNewMedGenericName(e.target.value);
                        if (modalErrors.genericName) setModalErrors((prev) => ({ ...prev, genericName: false }));
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.genericName ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070ba] focus:outline-none transition`}
                    />
                    {modalErrors.genericName && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Generic Name is required first</span>
                    )}
                  </div>

                  {/* Dosage Unit * */}
                  <div className="space-y-1 relative">
                    <label className="font-bold text-slate-800 block">
                      Dosage Unit <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDosageUnitOpen(!isDosageUnitOpen);
                        setIsDosageFormOpen(false);
                        setIsManufacturerOpen(false);
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.dosageUnit ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-left flex items-center justify-between bg-white focus:border-[#0070ba] transition cursor-pointer`}
                    >
                      <span className={newMedDosageUnit ? 'text-slate-800 font-medium' : 'text-slate-400 font-normal'}>
                        {newMedDosageUnit || 'Search'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    </button>
                    {modalErrors.dosageUnit && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Dosage Unit is required first</span>
                    )}

                    {isDosageUnitOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                        <div className="relative mb-1">
                          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search"
                            value={dosageUnitSearch}
                            onChange={(e) => setDosageUnitSearch(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0070ba]"
                          />
                        </div>
                        {dosageUnits
                          .filter((u) => u.toLowerCase().includes(dosageUnitSearch.toLowerCase()))
                          .map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => {
                                setNewMedDosageUnit(u);
                                setIsDosageUnitOpen(false);
                                if (modalErrors.dosageUnit) setModalErrors((prev) => ({ ...prev, dosageUnit: false }));
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition cursor-pointer ${
                                newMedDosageUnit === u ? 'bg-sky-50 text-[#0070ba] font-bold' : 'text-slate-700'
                              }`}
                            >
                              {u}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Manufacturer * */}
                  <div className="space-y-1 relative">
                    <label className="font-bold text-slate-800 block">
                      Manufacturer <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManufacturerOpen(!isManufacturerOpen);
                        setIsDosageFormOpen(false);
                        setIsDosageUnitOpen(false);
                      }}
                      className={`w-full rounded-lg border ${
                        modalErrors.manufacturer ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500' : 'border-slate-200'
                      } px-3.5 py-2 text-xs text-left flex items-center justify-between bg-white focus:border-[#0070ba] transition cursor-pointer`}
                    >
                      <span className={newMedManufacturer ? 'text-slate-800 font-medium truncate' : 'text-slate-400 font-normal'}>
                        {newMedManufacturer || 'Search'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
                    </button>
                    {modalErrors.manufacturer && (
                      <span className="text-[10px] text-rose-500 font-semibold block">Manufacturer is required first</span>
                    )}

                    {isManufacturerOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                        <div className="relative mb-1">
                          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search"
                            value={manufacturerSearch}
                            onChange={(e) => setManufacturerSearch(e.target.value)}
                            className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0070ba]"
                          />
                        </div>
                        {manufacturers
                          .filter((m) => m.toLowerCase().includes(manufacturerSearch.toLowerCase()))
                          .map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setNewMedManufacturer(m);
                                setIsManufacturerOpen(false);
                                if (modalErrors.manufacturer) setModalErrors((prev) => ({ ...prev, manufacturer: false }));
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition truncate cursor-pointer ${
                                newMedManufacturer === m ? 'bg-sky-50 text-[#0070ba] font-bold' : 'text-slate-700'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddGenericModalOpen(false);
                    setModalErrors({});
                  }}
                  className="px-5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0070ba] hover:bg-[#005a9c] text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK ADD SUPPLIER */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
              <h3 className="font-extrabold text-slate-900 text-base">Register New Supplier</h3>
              <button
                type="button"
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Addis BioPharma Wholesalers"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-[#0070ba] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Manager Michael"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-[#0070ba] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +251 911 223 344"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-[#0070ba] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0070ba] hover:bg-[#005a9c] text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
