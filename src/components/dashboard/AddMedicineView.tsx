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
  Zap,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  parsePackagingText,
  accumulatePackagingData,
  ParsedPackagingData,
} from '../../utils/pharmaPackagingParser';

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
  const [scannedResult, setScannedResult] = useState<ParsedPackagingData | null>(null);
  const [selectedPresetHint, setSelectedPresetHint] = useState<string>('Amoxil 500mg');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanPaused, setIsScanPaused] = useState(false);
  const [liveDetectedWords, setLiveDetectedWords] = useState<string[]>([]);
  const [framesScannedCount, setFramesScannedCount] = useState(0);

  const scannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const packagingFileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const continuousIntervalRef = useRef<number | null>(null);
  const isFrameBusyRef = useRef(false);
  const accumulatedDataRef = useRef<ParsedPackagingData | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Live Camera with Continuous Multi-Frame Inspection
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
      });
      mediaStreamRef.current = stream;
      if (scannerVideoRef.current) {
        scannerVideoRef.current.srcObject = stream;
        await scannerVideoRef.current.play();
      }
      setIsCameraActive(true);
      setIsScanPaused(false);
      startContinuousScannerLoop();
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access denied or unavailable. You can upload a photo or select sample packaging below.');
      setIsCameraActive(false);
    }
  };

  // Stop Live Camera
  const stopCamera = () => {
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
      continuousIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scannerVideoRef.current) {
      scannerVideoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setTorchEnabled(false);
  };

  // Toggle Hardware Torch / Flashlight (Crucial for reflective blister packs or foil)
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !torchEnabled;
      await (track as any).applyConstraints({
        advanced: [{ torch: next }],
      });
      setTorchEnabled(next);
      showToast(next ? 'Flashlight ON' : 'Flashlight OFF', 'info');
    } catch (err) {
      showToast('Flashlight not supported on this device/browser', 'info');
    }
  };

  // Reset Continuous Accumulator to scan a new package
  const resetAccumulator = () => {
    accumulatedDataRef.current = null;
    setScannedResult(null);
    setLiveDetectedWords([]);
    setFramesScannedCount(0);
    showToast('Scanner reset. Ready for next package.', 'info');
  };

  // Start continuous frame inspection loop ("Stay and Scan in Detail")
  const startContinuousScannerLoop = () => {
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
    }

    const hasTextDetector = typeof (window as any).TextDetector !== 'undefined';
    const textDetector = hasTextDetector ? new (window as any).TextDetector() : null;

    continuousIntervalRef.current = window.setInterval(async () => {
      if (!scannerVideoRef.current || isFrameBusyRef.current || isScanPaused) return;
      const video = scannerVideoRef.current;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      isFrameBusyRef.current = true;
      try {
        let frameText = '';

        if (textDetector) {
          // Native Android Chrome hardware ML Kit OCR
          const detected = await textDetector.detect(video);
          if (detected && detected.length > 0) {
            frameText = detected.map((d: any) => d.rawValue || '').join('\n');
          }
        }

        if (frameText.trim()) {
          const merged = accumulatePackagingData(accumulatedDataRef.current, frameText, medicinesList as any);
          accumulatedDataRef.current = merged;
          setScannedResult({ ...merged });
          setFramesScannedCount((c) => c + 1);

          const tokens = frameText
            .split(/\s+/)
            .map((w) => w.trim().replace(/[^a-zA-Z0-9.%/]/g, ''))
            .filter((w) => w.length >= 3 && !['FOR', 'THE', 'AND'].includes(w.toUpperCase()))
            .slice(0, 10);
          if (tokens.length > 0) {
            setLiveDetectedWords((prev) => Array.from(new Set([...tokens, ...prev])).slice(0, 12));
          }
        }
      } catch (err) {
        console.debug('Continuous frame tick:', err);
      } finally {
        isFrameBusyRef.current = false;
      }
    }, 600);
  };

  // Manually Snapshot Frame & Run Deep Inspection
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

  // Instant Offline Test from Realistic Pharma Presets
  const scanPresetSample = (name: string, ocrText: string) => {
    const merged = accumulatePackagingData(accumulatedDataRef.current, ocrText, medicinesList as any);
    accumulatedDataRef.current = merged;
    setScannedResult({ ...merged });

    const tokens = ocrText.split('\n').filter((l) => l.trim().length > 2);
    setLiveDetectedWords(tokens.slice(0, 8));

    showToast(`✓ Parsed: ${merged.name} (${merged.strength}) • Zero Cloud Calls!`, 'success', 'Packaging Read');
  };

  // Execute AI Visual Scan (calls /api/gemini/scan-medicine)
  const executeScan = async (base64Image?: string, hint?: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/gemini/scan-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-4' },
        body: JSON.stringify({
          image: base64Image || '',
          medicineHint: hint || selectedPresetHint,
          ocrText: accumulatedDataRef.current?.rawText,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        const fakeText = `${item.name}\n${item.genericName}\n${item.strength} ${item.dosageForm}\n${item.batchNumber}\n${item.expDate}\n${item.manufacturer}`;
        const merged = accumulatePackagingData(accumulatedDataRef.current, fakeText, medicinesList as any);
        accumulatedDataRef.current = merged;
        setScannedResult({ ...merged });
        showToast(`✓ Recognized: ${data.data.name} (${data.data.dosageForm}) • Detailed Inspection`, 'success', 'Packaging Identified');
      } else {
        throw new Error(data.message || 'Recognition failed');
      }
    } catch (err: any) {
      showToast('Packaging scan: ' + err.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Apply Scanned Medicine Details into Form Fields
  const applyScannedMedicine = (item: ParsedPackagingData | null) => {
    if (!item) return;
    setBrandName(item.brandName || item.name || '');
    setGenericName(item.genericName || item.brandName || item.name || '');
    setStrength(item.strength || '500mg');
    setDosageForm(item.dosageForm || 'Tablet');
    setManufacturer(item.manufacturer || 'Ethiopian Pharmaceuticals (EPHARM)');
    setBatchNumber(item.batchNumber || `KZ-BAT-${Date.now().toString().slice(-4)}`);
    if (item.expDate) setExpDate(item.expDate);
    if (item.mfgDate) setMfgDate(item.mfgDate);
    setBarcode(`KZ-MED-${Math.floor(100000 + Math.random() * 900000)}`);
    setDescription(`Visually recognized: ${item.name} (${item.genericName}). ${item.detectedKeywords ? `Detected: ${item.detectedKeywords.join(', ')}` : ''}`);
    stopCamera();
    setRegistrationMode('manual');
    showToast('✓ Scanned packaging details loaded into registration form! Review and save.', 'success', 'Form Ready');
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

      {/* METHOD 1: CONTINUOUS VISUAL MEDICINE PACKAGING SCANNER PANEL ("STAY & SCAN IN DETAIL") */}
      {registrationMode === 'scan' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 rounded-2xl border-2 border-teal-500/50 p-5 sm:p-6 text-white space-y-6 shadow-2xl">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Continuous Packaging Scanner</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40 font-mono font-bold">
                    STAY & SCAN IN DETAIL
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Camera stays active and merges details across frames: show the front for <strong>Name & Strength</strong>, then tilt to the flap or crimp edge for <strong>Batch & Expiry</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Open Live Camera</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                      torchEnabled
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                    title="Toggle Flashlight / Torch for shiny blister foils"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{torchEnabled ? 'Torch ON' : 'Torch'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsScanPaused((p) => !p)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {isScanPaused ? <Play className="h-3.5 w-3.5 text-teal-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
                    <span>{isScanPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Close</span>
                  </button>
                </>
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
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5 text-teal-400" />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Camera Viewfinder + Real-Time Checklist HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Viewfinder & Live Frame Controls */}
            <div className="lg:col-span-6 space-y-3">
              <div className="relative rounded-2xl border-2 border-teal-500/50 bg-slate-900/95 overflow-hidden h-72 sm:h-80 flex items-center justify-center shadow-2xl">
                {/* Live Video */}
                <video
                  ref={scannerVideoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                />

                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                    <div className="p-4 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400">
                      <Scan className="h-10 w-10 animate-pulse" />
                    </div>
                    <p className="font-bold text-sm text-white">Live Camera is Idle</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Click <strong>"Open Live Camera"</strong> to activate continuous stay-and-scan mode, or test instantly with a preset packaging sample below.
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 bg-teal-500 hover:bg-teal-400 text-teal-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Start Continuous Scanner</span>
                    </button>
                  </div>
                )}

                {/* Live scanning radar beam */}
                {isCameraActive && !isScanPaused && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] animate-bounce" />
                )}

                {/* Corner reticle brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-teal-400" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-teal-400" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-teal-400" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-teal-400" />

                {/* Floating Status Badges inside Camera */}
                {isCameraActive && (
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-teal-300 border border-teal-500/40">
                      <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                      LIVE CONTINUOUS SCAN
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 border border-slate-700">
                      {framesScannedCount} frames merged
                    </span>
                  </div>
                )}

                {/* Paused Overlay */}
                {isCameraActive && isScanPaused && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20">
                    <Pause className="h-10 w-10 text-amber-400 mb-2" />
                    <span className="font-black text-white text-sm">Scanner Paused</span>
                    <span className="text-xs text-slate-300 mt-1">Click Resume to continue reading frames</span>
                    <button
                      type="button"
                      onClick={() => setIsScanPaused(false)}
                      className="mt-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Resume Scanning</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Viewfinder Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={captureFrameAndScan}
                      disabled={isScanning}
                      className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Scan className="h-3.5 w-3.5" />
                      <span>Snapshot Deep Scan</span>
                    </button>
                  )}
                  {scannedResult && (
                    <button
                      type="button"
                      onClick={resetAccumulator}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                      title="Clear accumulated data to scan another box"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Buffer</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Engine: <strong>On-Device Multi-Frame ML Kit</strong>
                </span>
              </div>

              {/* Live Detected Text Stream */}
              {liveDetectedWords.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Live Recognition Stream (Last Detected Tokens):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {liveDetectedWords.map((word, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-teal-950/80 text-teal-300 border border-teal-800 text-[10px] font-mono"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Real-Time Detection Checklist HUD */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-900 border border-teal-500/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-black text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-teal-400" />
                      Real-Time Detection Checklist
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Attributes lock in as you move the packaging
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-950 text-teal-300 px-2.5 py-1 rounded-lg border border-teal-800">
                    {Math.round((scannedResult?.confidence || 0.40) * 100)}% Matched
                  </span>
                </div>

                {/* 6 Real-Time Attribute Checkboxes */}
                <div className="space-y-2.5">
                  {/* 1. Commercial Name */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.nameLocked
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.nameLocked
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.nameLocked ? '✓' : '1'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Commercial Product Name</span>
                        <span className="font-bold text-xs text-white truncate block">
                          {scannedResult?.name && scannedResult.name !== 'Unidentified Medicine'
                            ? scannedResult.name
                            : 'Scanning front of packaging...'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.nameLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
                    }`}>
                      {scannedResult?.fieldStatus?.nameLocked ? '✓ Locked' : 'Searching'}
                    </span>
                  </div>

                  {/* 2. Generic Name (Active Ingredient) */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.nameLocked && scannedResult.genericName
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.nameLocked && scannedResult.genericName
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.nameLocked ? '✓' : '2'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Ingredient (INN Generic)</span>
                        <span className="font-bold text-xs text-slate-200 truncate block">
                          {scannedResult?.genericName || 'Pending front text extraction...'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.nameLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {scannedResult?.fieldStatus?.nameLocked ? '✓ Locked' : 'Pending'}
                    </span>
                  </div>

                  {/* 3. Strength & Dosage Form */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.strengthLocked
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.strengthLocked
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.strengthLocked ? '✓' : '3'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Strength & Dosage Form</span>
                        <span className="font-bold text-xs text-teal-300 truncate block">
                          {scannedResult?.strength || '500mg'} • {scannedResult?.dosageForm || 'Tablet'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.strengthLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
                    }`}>
                      {scannedResult?.fieldStatus?.strengthLocked ? '✓ Locked' : 'Searching'}
                    </span>
                  </div>

                  {/* 4. Batch / Lot Number */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.batchLocked
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.batchLocked
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.batchLocked ? '✓' : '4'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Batch / Lot Number</span>
                        <span className="font-bold text-xs text-white truncate block">
                          {scannedResult?.batchNumber || 'Tilt box to flap or crimp edge...'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.batchLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {scannedResult?.fieldStatus?.batchLocked ? '✓ Locked' : 'Show Flap'}
                    </span>
                  </div>

                  {/* 5. Expiration Date */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.expDateLocked
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.expDateLocked
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.expDateLocked ? '✓' : '5'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Expiry Date (EXP)</span>
                        <span className="font-bold text-xs text-teal-300 truncate block">
                          {scannedResult?.expDate || 'Look for EXP MM/YY or stamp...'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.expDateLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    }`}>
                      {scannedResult?.fieldStatus?.expDateLocked ? '✓ Locked' : 'Show EXP'}
                    </span>
                  </div>

                  {/* 6. Manufacturer */}
                  <div className={`p-2.5 rounded-xl border transition flex items-center justify-between ${
                    scannedResult?.fieldStatus?.manufacturerLocked
                      ? 'bg-teal-950/60 border-teal-500/60'
                      : 'bg-slate-950/50 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        scannedResult?.fieldStatus?.manufacturerLocked
                          ? 'bg-teal-500 text-teal-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {scannedResult?.fieldStatus?.manufacturerLocked ? '✓' : '6'}
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Manufacturer</span>
                        <span className="font-bold text-xs text-white truncate block">
                          {scannedResult?.manufacturer || 'Reading pharma lab name...'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      scannedResult?.fieldStatus?.manufacturerLocked
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {scannedResult?.fieldStatus?.manufacturerLocked ? '✓ Locked' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button: Lock & Auto-Fill Form */}
                <button
                  type="button"
                  onClick={() => applyScannedMedicine(scannedResult)}
                  className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    scannedResult && (scannedResult.fieldStatus?.nameLocked || scannedResult.fieldStatus?.strengthLocked)
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 ring-2 ring-teal-400/50 animate-pulse'
                      : 'bg-teal-600/60 hover:bg-teal-600 text-white'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>Lock & Auto-Fill Product Registration Form</span>
                </button>
              </div>

              {/* Quick Realistic Pharma Presets (Offline Test) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Instant Offline Test Presets (Realistic Pharma Labels):
                  </span>
                  <span className="text-[10px] text-teal-400">100% Deterministic</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    {
                      label: 'Amoxil 500mg Strip',
                      text: 'AMOXIL\nAmoxicillin Trihydrate 500mg Capsules\nGlaxoSmithKline\nB.NO. KZ-AMX-901\nEXP: 02/2027\nMFG: 01/2024\n100 Capsules',
                    },
                    {
                      label: 'Panadol 120mg Bottle',
                      text: 'Panadol Children\nParacetamol Suspension 120mg/5ml\n100 ml Bottle\nEPHARM\nBN: PND-441\nEXPIRY: MAY 2028',
                    },
                    {
                      label: 'Cipro 500mg Box',
                      text: 'Ciprofloxacin Tablets USP 500mg\nCiprobay\nBayer Healthcare\nLot: CB-4410\n09/2027',
                    },
                    {
                      label: 'Hydrocortisone Tube',
                      text: 'Hydrocortisone 1%\nTopical Ointment\nCadila Pharmaceuticals\nLot: C-5521\nEXP: 11/2026',
                    },
                    {
                      label: 'Metformin 850mg',
                      text: 'Glucophage 850mg\nMetformin Hydrochloride\nJulphar Pharmaceuticals\nB.No: M850-22\nEXP. 06.2027',
                    },
                    {
                      label: 'Omeprazole 20mg',
                      text: 'Omez 20mg\nOmeprazole Delayed-Release Capsules\nCadila Pharma\nBN: OMZ-771\nEXP: 09/2027',
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => scanPresetSample(preset.label, preset.text)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-left transition text-xs font-semibold text-slate-200 hover:text-teal-300 cursor-pointer"
                    >
                      <span className="block truncate">{preset.label}</span>
                      <span className="text-[9px] text-slate-400 block">Click to test HUD →</span>
                    </button>
                  ))}
                </div>
              </div>
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
