import React, { useState, useRef } from 'react';
import { Category, Supplier } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { generateUniqueMedicineBarcode } from '../../utils/code128';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  suppliers: Supplier[];
  onImportComplete: () => void;
}

interface ParsedMedicineRow {
  index: number;
  name: string;
  genericName: string;
  brandName: string;
  categoryName: string;
  barcode: string;
  sku: string;
  dosageForm: string;
  strength: string;
  unit: string;
  manufacturer: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  prescriptionRequired: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  categories,
  suppliers,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedMedicineRow[]>([]);
  const [filterView, setFilterView] = useState<'ALL' | 'VALID' | 'ERRORS'>('ALL');
  const [autoGenerateBarcodes, setAutoGenerateBarcodes] = useState(true);
  const [autoCreateCategories, setAutoCreateCategories] = useState(true);
  const [updateExistingMedicines, setUpdateExistingMedicines] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    createdCount: number;
    updatedCount: number;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCsv = () => {
    const headers = [
      'Name',
      'GenericName',
      'BrandName',
      'Category',
      'Barcode',
      'SKU',
      'DosageForm',
      'Strength',
      'Unit',
      'Manufacturer',
      'PurchasePrice',
      'SellingPrice',
      'InitialStock',
      'ReorderLevel',
      'BatchNumber',
      'MfgDate',
      'ExpiryDate',
      'PrescriptionRequired',
    ];

    const sampleRows = [
      [
        'Amoxicillin 500mg Capsule',
        'Amoxicillin Trihydrate',
        'Amox-EPharm',
        'Antibiotics & Anti-Infectives',
        '628100010011',
        'MED-AMX-500',
        'Capsule',
        '500mg',
        'Box of 100',
        'EPHARM Ethiopia',
        '180.00',
        '250.00',
        '150',
        '30',
        'BAT-AMX-2026A',
        '2025-06-01',
        '2028-06-01',
        'true',
      ],
      [
        'Paracetamol 500mg Tablets',
        'Acetaminophen',
        'Panadol Extra',
        'Pain Relief & Analgesics',
        '628100020022',
        'MED-PAR-500',
        'Tablet',
        '500mg',
        'Box of 200',
        'Cadila Pharma',
        '85.00',
        '130.00',
        '300',
        '50',
        'BAT-PAR-9921',
        '2025-04-10',
        '2028-04-10',
        'false',
      ],
      [
        'Metformin 850mg Tablets',
        'Metformin Hydrochloride',
        'Glucophage',
        'Diabetes & Chronic Care',
        '628100030033',
        'MED-MET-850',
        'Tablet',
        '850mg',
        'Box of 100',
        'Julphar Pharmaceuticals',
        '210.00',
        '310.00',
        '80',
        '20',
        'BAT-MET-4412',
        '2025-01-15',
        '2027-12-31',
        'true',
      ],
      [
        'Omeprazole 20mg Delayed-Release',
        'Omeprazole',
        'Omez',
        'Gastrointestinal & PPIs',
        '',
        'MED-OME-020',
        'Capsule',
        '20mg',
        'Bottle of 30',
        'Dr. Reddy\'s Lab',
        '120.00',
        '190.00',
        '120',
        '25',
        'BAT-OME-7810',
        '2025-03-01',
        '2028-02-28',
        'false',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kaziniya_medicines_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file is empty or contains only headers.');
      return;
    }

    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Header index mapping
    const getIndex = (keys: string[]) => {
      for (const k of keys) {
        const idx = headers.findIndex((h) => h.includes(k));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const nameIdx = getIndex(['name', 'medicinename', 'product']);
    const genericIdx = getIndex(['generic', 'genericname']);
    const brandIdx = getIndex(['brand', 'brandname']);
    const catIdx = getIndex(['cat', 'category']);
    const barcodeIdx = getIndex(['barcode', 'code128', 'upc', 'ean']);
    const skuIdx = getIndex(['sku', 'code']);
    const dosageIdx = getIndex(['dosage', 'form']);
    const strengthIdx = getIndex(['strength', 'dose']);
    const unitIdx = getIndex(['unit', 'packaging']);
    const mfgIdx = getIndex(['manufacturer', 'mfr', 'brand']);
    const purchaseIdx = getIndex(['purchase', 'cost', 'buy']);
    const sellingIdx = getIndex(['selling', 'price', 'retail']);
    const stockIdx = getIndex(['stock', 'quantity', 'qty', 'initial']);
    const reorderIdx = getIndex(['reorder', 'min', 'alert']);
    const batchIdx = getIndex(['batch', 'batchno', 'lot']);
    const mfgDateIdx = getIndex(['mfgdate', 'manufacturing']);
    const expDateIdx = getIndex(['expiry', 'expdate', 'exp']);
    const rxIdx = getIndex(['rx', 'prescription']);

    const rows: ParsedMedicineRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const cols = parseCsvLine(line);

      const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : '';
      const genericName = genericIdx !== -1 && cols[genericIdx] ? cols[genericIdx] : name;
      const brandName = brandIdx !== -1 && cols[brandIdx] ? cols[brandIdx] : '';
      const categoryName = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : 'General Pharmaceuticals';
      let barcode = barcodeIdx !== -1 && cols[barcodeIdx] ? cols[barcodeIdx] : '';
      const sku = skuIdx !== -1 && cols[skuIdx] ? cols[skuIdx] : `MED-${Math.floor(1000 + Math.random() * 9000)}`;
      const dosageForm = dosageIdx !== -1 && cols[dosageIdx] ? cols[dosageIdx] : 'Tablet';
      const strength = strengthIdx !== -1 && cols[strengthIdx] ? cols[strengthIdx] : '';
      const unit = unitIdx !== -1 && cols[unitIdx] ? cols[unitIdx] : 'Box';
      const manufacturer = mfgIdx !== -1 && cols[mfgIdx] ? cols[mfgIdx] : 'Standard Pharma';
      
      const purchasePrice = purchaseIdx !== -1 ? parseFloat(cols[purchaseIdx]) || 10 : 10;
      const sellingPrice = sellingIdx !== -1 ? parseFloat(cols[sellingIdx]) || 20 : 20;
      const stockQuantity = stockIdx !== -1 ? parseInt(cols[stockIdx], 10) || 50 : 50;
      const reorderLevel = reorderIdx !== -1 ? parseInt(cols[reorderIdx], 10) || 20 : 20;

      const batchNumber = batchIdx !== -1 && cols[batchIdx] ? cols[batchIdx] : `KZ-BAT-${Date.now().toString().slice(-4)}`;
      const mfgDate = mfgDateIdx !== -1 && cols[mfgDateIdx] ? cols[mfgDateIdx] : '2025-01-01';
      const expiryDate = expDateIdx !== -1 && cols[expDateIdx] ? cols[expDateIdx] : '2028-01-01';
      const rxVal = rxIdx !== -1 ? cols[rxIdx].toLowerCase() : 'false';
      const prescriptionRequired = rxVal === 'true' || rxVal === '1' || rxVal === 'yes';

      const errors: string[] = [];
      const warnings: string[] = [];

      if (!name) {
        errors.push('Medicine name is required');
      }

      if (!barcode) {
        if (autoGenerateBarcodes) {
          barcode = generateUniqueMedicineBarcode('KZN');
          warnings.push('Generated Code-128 barcode automatically');
        } else {
          errors.push('Barcode is missing');
        }
      }

      if (sellingPrice < purchasePrice) {
        warnings.push('Selling price is lower than purchase cost');
      }

      if (stockQuantity < 0) {
        errors.push('Stock quantity cannot be negative');
      }

      if (new Date(expiryDate).getTime() < new Date().getTime()) {
        errors.push('Expiry date is in the past (expired)');
      }

      rows.push({
        index: i,
        name,
        genericName,
        brandName,
        categoryName,
        barcode,
        sku,
        dosageForm,
        strength,
        unit,
        manufacturer,
        purchasePrice,
        sellingPrice,
        stockQuantity,
        reorderLevel,
        batchNumber,
        mfgDate,
        expiryDate,
        prescriptionRequired,
        isValid: errors.length === 0,
        errors,
        warnings,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) parseCsvText(text);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setImportResults(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) parseCsvText(text);
      };
      reader.readAsText(droppedFile);
    }
  };

  const handleCommitImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('No valid medicine rows to import. Please review errors.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/medicines/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-1' },
        body: JSON.stringify({
          medicines: validRows,
          autoCreateCategories,
          updateExistingMedicines,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResults({
          success: true,
          createdCount: data.createdCount || validRows.length,
          updatedCount: data.updatedCount || 0,
          message: data.message || `Successfully imported ${validRows.length} medicines into inventory!`,
        });
        onImportComplete();
      } else {
        alert(data.message || 'Import failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit bulk import');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;
  const totalStockSum = parsedRows
    .filter((r) => r.isValid)
    .reduce((acc, r) => acc + r.stockQuantity, 0);
  const totalValueSum = parsedRows
    .filter((r) => r.isValid)
    .reduce((acc, r) => acc + r.stockQuantity * r.sellingPrice, 0);

  const displayedRows = parsedRows.filter((r) => {
    if (filterView === 'VALID') return r.isValid;
    if (filterView === 'ERRORS') return !r.isValid;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg dark:text-white flex items-center gap-2">
                <span>Bulk CSV Medicine Import</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-teal-950 dark:text-teal-300">
                  BATCH UPLOADER
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quickly upload hundreds of medicines with purchase/selling prices, batch details, and reorder levels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5 text-teal-600" />
              <span>Download CSV Template</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* UPLOAD DROPZONE */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-teal-50/20 dark:bg-slate-950 dark:border-slate-800 dark:hover:border-teal-600 space-y-3"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center shadow-inner">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base dark:text-white">
                  Drop your CSV file here, or browse from computer
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports standard comma-separated (.csv) files. Auto-matches standard pharmacy headers.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 dark:bg-teal-950 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-creates Code-128 barcodes for unbarcoded rows</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            /* FILE LOADED BAR & IMPORT CONFIG */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-600 text-white">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm dark:text-white">{file.name}</h4>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} total medicines parsed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                      setImportResults(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-600 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* IMPORT SUMMARY METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 dark:bg-sky-950/40 dark:border-sky-800">
                  <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Total Rows</span>
                  <p className="text-xl font-black text-sky-950 dark:text-sky-200">{parsedRows.length}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Valid Rows</span>
                  <p className="text-xl font-black text-emerald-950 dark:text-emerald-200">{validCount}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Total Stock Units</span>
                  <p className="text-xl font-black text-amber-950 dark:text-amber-200">{totalStockSum.toLocaleString()}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Total Retail Value</span>
                  <p className="text-xl font-black text-teal-950 dark:text-teal-200">{formatCurrency(totalValueSum)}</p>
                </div>
              </div>

              {/* IMPORT PREFERENCES CHECKBOXES */}
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoGenerateBarcodes}
                    onChange={(e) => setAutoGenerateBarcodes(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Auto-assign Code-128 barcode if missing</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoCreateCategories}
                    onChange={(e) => setAutoCreateCategories(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Auto-create new categories</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={updateExistingMedicines}
                    onChange={(e) => setUpdateExistingMedicines(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Update existing medicines if barcode matches</span>
                </label>
              </div>

              {/* PREVIEW FILTER PILLS */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => setFilterView('ALL')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filterView === 'ALL'
                        ? 'bg-slate-900 text-white dark:bg-teal-600'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    All Rows ({parsedRows.length})
                  </button>

                  <button
                    onClick={() => setFilterView('VALID')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filterView === 'VALID'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Ready to Import ({validCount})
                  </button>

                  {errorCount > 0 && (
                    <button
                      onClick={() => setFilterView('ERRORS')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        filterView === 'ERRORS'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      Has Errors ({errorCount})
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-400">
                  Showing {displayedRows.length} of {parsedRows.length}
                </span>
              </div>

              {/* PREVIEW DATA TABLE */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden dark:border-slate-800 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Medicine Name</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Barcode</th>
                      <th className="px-3 py-2.5 text-right">Cost</th>
                      <th className="px-3 py-2.5 text-right">Retail</th>
                      <th className="px-3 py-2.5 text-center">Stock</th>
                      <th className="px-3 py-2.5 text-center">Min</th>
                      <th className="px-3 py-2.5">Batch / Expiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {displayedRows.map((row) => (
                      <tr
                        key={row.index}
                        className={`hover:bg-slate-50 transition dark:hover:bg-slate-950/50 ${
                          !row.isValid ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="px-3 py-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md dark:bg-emerald-950 dark:text-emerald-300">
                              <Check className="h-3 w-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md dark:bg-rose-950 dark:text-rose-300" title={row.errors.join(', ')}>
                              <XCircle className="h-3 w-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                          <div>{row.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal italic">{row.genericName}</div>
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300 text-[11px]">{row.categoryName}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{row.barcode}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-600 dark:text-slate-300">{formatCurrency(row.purchasePrice)}</td>
                        <td className="px-3 py-2 text-right font-bold text-teal-700 dark:text-teal-400">{formatCurrency(row.sellingPrice)}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-900 dark:text-white">{row.stockQuantity}</td>
                        <td className="px-3 py-2 text-center text-slate-500 font-mono">{row.reorderLevel}</td>
                        <td className="px-3 py-2 text-[10px] font-mono text-slate-500">
                          <div>{row.batchNumber}</div>
                          <div className="text-slate-400">Exp: {row.expiryDate}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* IMPORT COMPLETION BANNER */}
              {importResults && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Bulk Import Successful!</h4>
                      <p className="text-xs">{importResults.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    Done & Close
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        {file && !importResults && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="text-xs text-slate-500">
              {validCount > 0 ? (
                <span>Ready to commit <strong>{validCount}</strong> medicines to inventory database.</span>
              ) : (
                <span className="text-rose-600 font-semibold">Please fix errors in the CSV file before uploading.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={isProcessing || validCount === 0}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing Bulk Upload...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Commit & Import {validCount} Medicines</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
