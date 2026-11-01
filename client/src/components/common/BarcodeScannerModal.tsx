import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Scan,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  UploadCloud,
  SwitchCamera,
  Flashlight,
  FileImage,
  Sparkles,
  RefreshCw,
  QrCode,
  Layers,
  PackageX,
  PlusCircle,
  ArrowRight,
  Copy,
  Check,
  Search,
  HelpCircle,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Medicine } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { formatCurrency } from '../../utils/formatters';

export interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string, medicine?: Medicine | null) => void;
  title?: string;
  verifyInDatabase?: boolean;
  knownMedicines?: Medicine[];
  onAddNewMedicine?: (barcode: string) => void;
  onNotFound?: (barcode: string) => void;
}

interface NotFoundErrorState {
  barcode: string;
  scannedAt: Date;
  rawText: string;
  suggestions?: Medicine[];
}

/**
 * Intelligent helper to extract barcode from raw strings, JSON payloads, or URLs
 */
export const extractCleanBarcode = (rawInput: string): string => {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();

  // 1. Check if payload is a JSON object (e.g. structured QR code)
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.code) return String(parsed.code).trim();
      if (parsed.barcode) return String(parsed.barcode).trim();
      if (parsed.id) return String(parsed.id).trim();
      if (parsed.sku) return String(parsed.sku).trim();
    } catch (e) {
      // Not valid JSON, continue
    }
  }

  // 2. Check if payload is a URL with query parameters (e.g. ?code=... or ?barcode=...)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://example.com/${trimmed}`);
      const codeParam =
        url.searchParams.get('code') ||
        url.searchParams.get('barcode') ||
        url.searchParams.get('id') ||
        url.searchParams.get('rx');
      if (codeParam) return codeParam.trim();
      
      // Check last path segment if formatted like .../medicines/8901234567890
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && /^[A-Za-z0-9_-]{4,}$/.test(lastSegment)) {
          return lastSegment;
        }
      }
    } catch (e) {
      // URL parse fail, continue
    }
  }

  // 3. Check for custom prefix protocols e.g. "KAZINIYA:8901234567890"
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    const potentialCode = parts[parts.length - 1].trim();
    if (potentialCode && /^[A-Za-z0-9_-]{3,}$/.test(potentialCode)) {
      return potentialCode;
    }
  }

  return trimmed;
};

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR & Medicine Barcode',
  verifyInDatabase = true,
  knownMedicines = [],
  onAddNewMedicine,
  onNotFound,
}) => {
  const [activeMode, setActiveMode] = useState<'CAMERA' | 'FILE' | 'MANUAL'>('CAMERA');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [notFoundError, setNotFoundError] = useState<NotFoundErrorState | null>(null);
  const [foundMedicine, setFoundMedicine] = useState<Medicine | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-scanner-viewport';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Available sample presets for testing
  const presets = [
    { name: 'Paracetamol 500mg', barcode: '8901234567890', valid: true },
    { name: 'Amoxicillin 500mg', barcode: '8901234567891', valid: true },
    { name: 'Coartem 20/120', barcode: '8901234567892', valid: true },
    { name: 'Omeprazole 20mg', barcode: '8901234567893', valid: true },
    { name: 'Ciprofloxacin 500mg', barcode: '8901234567894', valid: true },
    { name: 'Unregistered Demo Code', barcode: '9998887770001', valid: false },
  ];

  useEffect(() => {
    if (isOpen) {
      setManualBarcode('');
      setGeneralError('');
      setNotFoundError(null);
      setFoundMedicine(null);
      setLastScannedResult(null);
      setIsCheckingDb(false);
      if (activeMode === 'CAMERA') {
        initializeAndStartScanner();
      }
    } else {
      stopScannerInstance();
    }

    return () => {
      stopScannerInstance();
    };
  }, [isOpen, activeMode]);

  const stopScannerInstance = async () => {
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (e) {
      console.warn('Error during scanner cleanup:', e);
    } finally {
      setIsScannerRunning(false);
      setTorchOn(false);
    }
  };

  const handleDetection = async (decodedText: string) => {
    if (!decodedText || isCheckingDb) return;
    const cleanCode = extractCleanBarcode(decodedText);
    if (!cleanCode) {
      setGeneralError('Could not parse a valid barcode or QR code from the scan.');
      return;
    }

    setLastScannedResult(cleanCode);
    setGeneralError('');
    setNotFoundError(null);

    // If verification in database is disabled, immediately succeed
    if (!verifyInDatabase) {
      if (soundActive) playSound('scan_success');
      setTimeout(() => {
        stopScannerInstance();
        onScan(cleanCode, null);
        onClose();
      }, 350);
      return;
    }

    // Perform database lookup
    setIsCheckingDb(true);
    let matchedMedicine: Medicine | null = null;

    // 1. Check client-side knownMedicines array first
    if (knownMedicines && knownMedicines.length > 0) {
      const q = cleanCode.toLowerCase();
      const local = knownMedicines.find(
        (m) =>
          (m.barcode && m.barcode.toLowerCase() === q) ||
          (m.id && m.id.toLowerCase() === q) ||
          (m.sku && m.sku.toLowerCase() === q)
      );
      if (local) {
        matchedMedicine = local;
      }
    }

    // 2. Query server if not found in local cache
    if (!matchedMedicine) {
      try {
        const res = await fetch(`/api/medicines/barcode/${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (data.success && data.data?.medicine) {
          matchedMedicine = data.data.medicine;
        }
      } catch (err) {
        console.warn('Server lookup failed, checking fuzzy match:', err);
      }
    }

    setIsCheckingDb(false);

    if (matchedMedicine) {
      // MATCH FOUND!
      setFoundMedicine(matchedMedicine);
      if (soundActive) {
        playSound('scan_success');
      }
      setTimeout(() => {
        stopScannerInstance();
        onScan(cleanCode, matchedMedicine);
        onClose();
      }, 500);
    } else {
      // NOT FOUND IN DATABASE -> SHOW FRIENDLY ERROR STATE
      if (soundActive) {
        playSound('scan_error');
      }

      // Calculate fuzzy suggestions if known medicines exist
      let suggestions: Medicine[] = [];
      if (knownMedicines && knownMedicines.length > 0) {
        suggestions = knownMedicines.slice(0, 3);
      }

      setNotFoundError({
        barcode: cleanCode,
        scannedAt: new Date(),
        rawText: decodedText,
        suggestions,
      });

      if (onNotFound) {
        onNotFound(cleanCode);
      }
    }
  };

  const handleResumeScanning = async () => {
    setNotFoundError(null);
    setFoundMedicine(null);
    setLastScannedResult(null);
    setGeneralError('');
    if (activeMode === 'CAMERA') {
      await initializeAndStartScanner();
    }
  };

  const handleProceedWithUnregisteredCode = (code: string) => {
    stopScannerInstance();
    onScan(code, null);
    onClose();
  };

  const handleAddNewItemRedirect = (code: string) => {
    stopScannerInstance();
    if (onAddNewMedicine) {
      onAddNewMedicine(code);
    } else {
      onScan(code, null);
    }
    onClose();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  const initializeAndStartScanner = async (cameraIdOverride?: string) => {
    setGeneralError('');
    try {
      await stopScannerInstance();

      // Ensure viewport element exists
      const element = document.getElementById(scannerContainerId);
      if (!element) return;

      const supportedFormats = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
      ];

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: supportedFormats,
        verbose: false,
      });
      html5QrCodeRef.current = html5QrCode;

      // Query available camera devices
      let availableCameras: Array<{ id: string; label: string }> = [];
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          availableCameras = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(availableCameras);
        }
      } catch (camErr) {
        console.warn('Could not enumerate cameras, falling back to environment constraint', camErr);
      }

      const targetCamera =
        cameraIdOverride ||
        selectedCameraId ||
        (availableCameras.length > 0 ? availableCameras[0].id : { facingMode: 'environment' });

      await html5QrCode.start(
        targetCamera,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.75);
            return { width: Math.max(220, size), height: Math.max(220, size) };
          },
          aspectRatio: 1.3333,
        },
        (decodedText) => {
          handleDetection(decodedText);
        },
        () => {
          // Ignored per-frame decoding failure
        }
      );

      setIsScannerRunning(true);
    } catch (err: any) {
      console.warn('Failed to start camera scanner:', err);
      setIsScannerRunning(false);
      setGeneralError(
        'Camera permission was denied or is unavailable. You can upload an image with a QR/barcode or use manual entry below.'
      );
    }
  };

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCameraId = cameras[nextIndex].id;
    setSelectedCameraId(nextCameraId);
    await initializeAndStartScanner(nextCameraId);
  };

  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !isScannerRunning) return;
    try {
      const nextTorch = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch not supported on this device/camera.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingFile(true);
    setGeneralError('');
    setNotFoundError(null);

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp-host', { verbose: false });
      const decoded = await html5QrCode.scanFile(file, true);
      if (decoded) {
        handleDetection(decoded);
      }
    } catch (err: any) {
      console.warn('Failed to decode image file:', err);
      setGeneralError('No QR code or barcode detected in the uploaded image. Please try a clearer picture.');
    } finally {
      setIsAnalyzingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleDetection(manualBarcode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hidden temp host for file scanning */}
        <div id="file-scanner-temp-host" className="hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{title}</h3>
                <button
                  type="button"
                  onClick={() => setSoundActive(!soundActive)}
                  title={soundActive ? 'Audio beep enabled' : 'Audio beep muted'}
                  className={`p-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition ${
                    soundActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {soundActive ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  <span>{soundActive ? 'Beep ON' : 'Muted'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live camera scanner for 2D QR codes & 1D retail barcodes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMode('CAMERA');
              setNotFoundError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeMode === 'CAMERA'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Live Camera Scan
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('FILE');
              setNotFoundError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeMode === 'FILE'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Scan from Image File
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('MANUAL');
              setNotFoundError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
              activeMode === 'MANUAL'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Manual / Quick Demo
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* ========================================================================= */}
          {/* VISUAL ERROR STATE: ITEM NOT FOUND IN DATABASE */}
          {/* ========================================================================= */}
          {notFoundError && (
            <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-b from-amber-50/90 to-orange-50/40 p-5 dark:from-amber-950/40 dark:to-slate-900 dark:border-amber-700/60 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Header with Icon & Friendly Message */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                  <PackageX className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Not Registered
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {notFoundError.scannedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Item Not Found in Database
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    We successfully scanned this code, but no registered medicine or active batch in your pharmacy inventory matches this identifier.
                  </p>
                </div>
              </div>

              {/* Scanned Code Display Box */}
              <div className="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-slate-950 p-3 border border-amber-200/80 dark:border-slate-800 shadow-2xs">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scanned Code / Barcode
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-amber-400 truncate block">
                    {notFoundError.barcode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(notFoundError.barcode)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                  title="Copy barcode to clipboard"
                >
                  {copiedBarcode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedBarcode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Helpful Tips & Suggestions */}
              <div className="rounded-xl bg-amber-500/10 dark:bg-amber-950/20 p-3 border border-amber-200/50 dark:border-amber-900/30 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Next Steps:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 pl-1">
                  <li>Ensure you scanned the primary medicine box or blister pack.</li>
                  <li>If this is new inventory stock, register the medicine under <strong>Inventory</strong>.</li>
                  <li>You can also proceed with this code to auto-populate a registration form.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResumeScanning}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-2xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Scan Another Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNewItemRedirect(notFoundError.barcode)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Register as New Medicine</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-amber-200/60 dark:border-slate-800">
                <span>Want to use this code anyway?</span>
                <button
                  type="button"
                  onClick={() => handleProceedWithUnregisteredCode(notFoundError.barcode)}
                  className="font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>Use Scanned Code Anyway</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* CAMERA MODE (When not in error state) */}
          {activeMode === 'CAMERA' && !notFoundError && (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-video flex flex-col items-center justify-center text-center border-2 border-slate-800 shadow-inner">
                {/* HTML5 QR Code Host Container */}
                <div
                  id={scannerContainerId}
                  className="w-full h-full object-cover flex items-center justify-center text-slate-300"
                />

                {/* Laser Overlay animation */}
                {isScannerRunning && !isCheckingDb && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="relative w-48 h-48 border-2 border-dashed border-teal-400/80 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse" />
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-teal-300 rounded-tl" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-teal-300 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-teal-300 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-teal-300 rounded-br" />
                      <span className="text-[10px] font-mono bg-slate-900/90 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40">
                        POINT AT QR / BARCODE
                      </span>
                    </div>
                  </div>
                )}

                {/* Checking Database Overlay */}
                {isCheckingDb && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-30">
                    <RefreshCw className="h-8 w-8 text-teal-400 animate-spin" />
                    <p className="text-xs font-bold">Verifying medicine in database...</p>
                    <span className="text-[10px] font-mono text-slate-400">{lastScannedResult}</span>
                  </div>
                )}

                {/* Camera Control Overlay Top-Right */}
                {isScannerRunning && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                    {cameras.length > 1 && (
                      <button
                        type="button"
                        onClick={handleSwitchCamera}
                        title="Switch Camera"
                        className="p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 backdrop-blur-xs transition"
                      >
                        <SwitchCamera className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleToggleTorch}
                      title="Toggle Flashlight"
                      className={`p-2 rounded-xl border backdrop-blur-xs transition ${
                        torchOn
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900/80 text-white hover:bg-slate-800 border-slate-700'
                      }`}
                    >
                      <Flashlight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Scanned Feedback Banner (Success) */}
                {foundMedicine && (
                  <div className="absolute bottom-3 inset-x-3 bg-emerald-600 text-white text-xs font-bold p-3 rounded-xl shadow-lg flex items-center justify-between gap-2 z-30 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <div>
                        <span className="block">{foundMedicine.name} ({foundMedicine.strength})</span>
                        <span className="text-[10px] opacity-80 font-normal">
                          {formatCurrency(foundMedicine.sellingPrice || 0)} • Stock: {foundMedicine.totalStock}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                )}
              </div>

              {/* General Error Notice */}
              {generalError && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">{generalError}</p>
                    <p className="text-[11px] mt-1 text-amber-700 dark:text-amber-400">
                      Tip: You can switch to the "Scan from Image File" tab or use manual entry below.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FILE UPLOAD SCAN MODE */}
          {activeMode === 'FILE' && !notFoundError && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/50 transition space-y-3 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 group-hover:scale-110 transition">
                  <FileImage className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {isAnalyzingFile ? 'Analyzing Image...' : 'Click to Upload QR or Barcode Image'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PNG, JPG, WEBP photos of shelf labels, receipts, or medicine packages
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzingFile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
                >
                  <UploadCloud className="h-4 w-4" />
                  {isAnalyzingFile ? 'Decoding QR...' : 'Select Image File'}
                </button>
              </div>

              {generalError && (
                <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/50 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL INPUT & DEMO BARCODES */}
          <div className="space-y-3 pt-1">
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter barcode or QR payload (e.g. 8901234567890)"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                disabled={isCheckingDb}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition shrink-0 disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5" />
                Submit
              </button>
            </form>

            {/* Quick Demo Shortcuts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Fast Demo Barcode Shortcuts:
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">1-Click Test</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.barcode}
                    type="button"
                    onClick={() => handleDetection(p.barcode)}
                    className={`flex flex-col text-left rounded-xl border p-2 text-xs transition shadow-2xs ${
                      p.valid
                        ? 'border-slate-200 bg-white text-slate-700 hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-700'
                        : 'border-amber-200 bg-amber-50/50 text-amber-900 hover:border-amber-400 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{p.name}</span>
                      {!p.valid && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Test Error</span>
                      )}
                    </div>
                    <span className="font-mono text-[9px] text-slate-400">{p.barcode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400 text-[11px]">
            Kaziniya OS • Hardware Scanner & Camera Decoders
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
