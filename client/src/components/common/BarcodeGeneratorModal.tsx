import React, { useState, useEffect, useMemo } from 'react';
import { Medicine } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  generateCode128SvgString,
  generateUniqueMedicineBarcode,
  isValidCode128,
} from '../../utils/code128';
import {
  X,
  Printer,
  RefreshCw,
  Check,
  Tag,
  Copy,
  Sliders,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Save,
  Barcode as BarcodeIcon,
} from 'lucide-react';

interface BarcodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine?: Medicine | null;
  onBarcodeUpdated?: (medicineId: string, newBarcode: string) => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onBarcodeUpdated,
}) => {
  const [prefix, setPrefix] = useState<'KZN' | 'ET' | 'RX' | 'OTC' | 'CUSTOM'>('KZN');
  const [customPrefix, setCustomPrefix] = useState('');
  const [barcodeText, setBarcodeText] = useState('');
  const [labelCopies, setLabelCopies] = useState<number>(10);
  const [labelLayout, setLabelLayout] = useState<'single' | 'sheet30' | 'sheet24'>('single');
  
  // Custom label items toggle
  const [showStoreName, setShowStoreName] = useState(true);
  const [showGenericName, setShowGenericName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showExpiry, setShowExpiry] = useState(true);
  const [showBatch, setShowBatch] = useState(true);
  
  const [customPrice, setCustomPrice] = useState<number>(medicine?.sellingPrice || 50);
  const [customBatch, setCustomBatch] = useState('KZ-2026-B01');
  const [customExpiry, setCustomExpiry] = useState('2028-06-30');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (medicine) {
      if (medicine.barcode && medicine.barcode.trim().length > 0) {
        setBarcodeText(medicine.barcode);
      } else {
        const generated = generateUniqueMedicineBarcode(prefix === 'CUSTOM' ? customPrefix || 'KZN' : prefix);
        setBarcodeText(generated);
      }
      if (medicine.sellingPrice) setCustomPrice(medicine.sellingPrice);
      if (medicine.earliestExpiry) setCustomExpiry(medicine.earliestExpiry);
    } else {
      const generated = generateUniqueMedicineBarcode(prefix === 'CUSTOM' ? customPrefix || 'KZN' : prefix);
      setBarcodeText(generated);
    }
  }, [medicine, isOpen]);

  const handleGenerateNew = () => {
    const selectedPfx = prefix === 'CUSTOM' ? customPrefix || 'KZN' : prefix;
    const newBarcode = generateUniqueMedicineBarcode(selectedPfx);
    setBarcodeText(newBarcode);
    setSaveSuccess(false);
  };

  const svgBarcodeString = useMemo(() => {
    if (!barcodeText || !isValidCode128(barcodeText)) {
      return '';
    }
    return generateCode128SvgString(barcodeText, {
      height: 48,
      moduleWidth: 1.8,
      fontSize: 11,
      includeText: true,
      margin: 4,
    });
  }, [barcodeText]);

  const handleCopyBarcode = () => {
    if (!barcodeText) return;
    navigator.clipboard.writeText(barcodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToMedicine = async () => {
    if (!medicine || !barcodeText) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/medicines/${medicine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'u-1' },
        body: JSON.stringify({ barcode: barcodeText }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (onBarcodeUpdated) {
          onBarcodeUpdated(medicine.id, barcodeText);
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(data.message || 'Failed to save barcode');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update barcode');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintLabels = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print barcode labels.');
      return;
    }

    const medName = medicine?.name || 'Standard Pharmaceutical';
    const genericName = medicine?.genericName || '';
    const priceStr = formatCurrency(customPrice);
    const expiryStr = customExpiry ? formatDate(customExpiry) : '';

    const labelHtml = `
      <div class="barcode-label">
        ${showStoreName ? '<div class="store-name">KAZINIYA DRUG STORE</div>' : ''}
        <div class="med-name">${medName}</div>
        ${showGenericName && genericName ? `<div class="generic-name">${genericName}</div>` : ''}
        <div class="barcode-svg-container">${svgBarcodeString}</div>
        <div class="label-footer">
          ${showPrice ? `<span class="price">${priceStr}</span>` : ''}
          ${showBatch ? `<span class="batch">B:${customBatch}</span>` : ''}
          ${showExpiry && expiryStr ? `<span class="exp">EXP:${expiryStr}</span>` : ''}
        </div>
      </div>
    `;

    const allLabelsHtml = Array(labelCopies).fill(labelHtml).join('');

    const styles = `
      @page {
        size: ${labelLayout === 'single' ? '50mm 30mm' : 'A4 portrait'};
        margin: ${labelLayout === 'single' ? '2mm' : '8mm'};
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #000;
        background: #fff;
      }
      .grid-container {
        display: grid;
        grid-template-columns: ${labelLayout === 'single' ? '1fr' : labelLayout === 'sheet30' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)'};
        gap: ${labelLayout === 'single' ? '0' : '4mm'};
      }
      .barcode-label {
        box-sizing: border-box;
        border: 1px dashed #ccc;
        padding: 3mm;
        text-align: center;
        page-break-inside: avoid;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #fff;
        border-radius: 4px;
        min-height: ${labelLayout === 'single' ? '28mm' : '26mm'};
      }
      .store-name {
        font-size: 7pt;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #1e293b;
        text-transform: uppercase;
      }
      .med-name {
        font-size: 8.5pt;
        font-weight: 900;
        line-height: 1.1;
        margin: 1px 0;
        color: #0f172a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .generic-name {
        font-size: 6.5pt;
        color: #475569;
        font-style: italic;
        margin-bottom: 2px;
      }
      .barcode-svg-container svg {
        max-width: 100%;
        height: auto;
        max-height: 14mm;
        display: block;
        margin: 0 auto;
      }
      .label-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 7pt;
        margin-top: 2px;
        padding-top: 1px;
        border-top: 1px solid #e2e8f0;
      }
      .price {
        font-weight: 900;
        font-size: 8pt;
        color: #000;
      }
      .batch, .exp {
        font-family: monospace;
        font-weight: 600;
        font-size: 6.5pt;
        color: #334155;
      }
      @media print {
        .barcode-label {
          border: 1px solid #eee;
        }
      }
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kaziniya - Barcode Labels Print</title>
          <style>${styles}</style>
        </head>
        <body>
          <div class="grid-container">
            ${allLabelsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <BarcodeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">
                  Internal Code-128 Barcode Generator
                </h3>
                <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full dark:bg-teal-950 dark:text-teal-300">
                  CODE-128B
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and print standard 1D barcodes for unbarcoded medicines and thermal shelf labels.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT CONFIGURATION PANEL (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Target Medicine Info */}
            {medicine ? (
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 dark:bg-teal-950/30 dark:border-teal-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">Target Medicine</span>
                  <h4 className="font-bold text-slate-900 text-sm dark:text-white">{medicine.name}</h4>
                  <p className="text-xs text-slate-500 italic">{medicine.genericName} • {medicine.strength}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-teal-700 dark:text-teal-400 block">{formatCurrency(medicine.sellingPrice || 0)}</span>
                  <span className="text-[10px] font-mono text-slate-400">Stock: {medicine.totalStock || 0}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                💡 Generating a standalone custom Code-128 barcode.
              </div>
            )}

            {/* Prefix & Barcode Text Generator */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Barcode Prefix & Format</span>
                <span className="text-[10px] text-slate-400">Standard Code-128 subset B</span>
              </label>

              <div className="grid grid-cols-5 gap-2">
                {(['KZN', 'ET', 'RX', 'OTC', 'CUSTOM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPrefix(p);
                      const selectedPfx = p === 'CUSTOM' ? customPrefix || 'KZN' : p;
                      setBarcodeText(generateUniqueMedicineBarcode(selectedPfx));
                      setSaveSuccess(false);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition border text-center ${
                      prefix === p
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p === 'KZN' ? 'KZN (Store)' : p === 'ET' ? 'ET (National)' : p === 'RX' ? 'RX (Prescription)' : p === 'OTC' ? 'OTC (General)' : 'Custom'}
                  </button>
                ))}
              </div>

              {prefix === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="Custom Prefix (e.g. HOSP, PHARM)"
                  value={customPrefix}
                  onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              )}

              {/* Barcode String Input with Re-generate & Copy actions */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Barcode String (Scannable Value)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={barcodeText}
                      onChange={(e) => {
                        setBarcodeText(e.target.value);
                        setSaveSuccess(false);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold tracking-wider focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateNew}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    title="Generate another unique barcode ID"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBarcode}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                    title="Copy barcode text to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Label Elements Customizer */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Printable Label Elements
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showStoreName}
                    onChange={(e) => setShowStoreName(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Store Name</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGenericName}
                    onChange={(e) => setShowGenericName(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Generic Name</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrice}
                    onChange={(e) => setShowPrice(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Retail Price</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBatch}
                    onChange={(e) => setShowBatch(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Batch #</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExpiry}
                    onChange={(e) => setShowExpiry(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Expiry Date</span>
                </label>
              </div>
            </div>

            {/* Custom Values Overrides */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Retail Price (ETB)</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Batch Number</label>
                <input
                  type="text"
                  value={customBatch}
                  onChange={(e) => setCustomBatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Print Sheet Layout Settings */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Label Layout & Copies
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLabelLayout('single')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                    labelLayout === 'single'
                      ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Single Thermal</span>
                  <span className="text-[10px] font-normal text-slate-400">50x30mm sticker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelLayout('sheet30')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                    labelLayout === 'sheet30'
                      ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Avery 30-Up</span>
                  <span className="text-[10px] font-normal text-slate-400">3x10 A4 sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLabelLayout('sheet24')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                    labelLayout === 'sheet24'
                      ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950 dark:border-teal-700 dark:text-teal-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Avery 24-Up</span>
                  <span className="text-[10px] font-normal text-slate-400">3x8 A4 sheet</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-500 font-medium">Quantity of labels to print:</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={labelCopies}
                  onChange={(e) => setLabelCopies(Math.max(1, Number(e.target.value)))}
                  className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 font-bold text-center focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">labels ({Math.ceil(labelCopies / (labelLayout === 'single' ? 1 : 30))} page(s))</span>
              </div>
            </div>

          </div>

          {/* RIGHT PREVIEW & ACTIONS PANEL (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-teal-600" />
                  Live Label Preview
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1:1 Thermal Ratio</span>
              </div>

              {/* Physical Label Mockup */}
              <div className="bg-white p-4 rounded-xl border-2 border-slate-300 shadow-md max-w-sm mx-auto text-slate-900 dark:bg-white dark:text-slate-900 space-y-2">
                {showStoreName && (
                  <div className="text-[10px] font-black text-center tracking-wider text-slate-800 uppercase border-b border-slate-100 pb-1">
                    Kaziniya Drug Store
                  </div>
                )}

                <div className="text-center">
                  <h5 className="font-black text-xs leading-tight line-clamp-1">
                    {medicine?.name || 'Amoxicillin 500mg'}
                  </h5>
                  {showGenericName && (
                    <p className="text-[10px] text-slate-500 italic line-clamp-1">
                      {medicine?.genericName || 'Amoxicillin Trihydrate'}
                    </p>
                  )}
                </div>

                {/* SVG Barcode Graphic */}
                <div
                  className="py-1 flex justify-center overflow-hidden bg-white"
                  dangerouslySetInnerHTML={{ __html: svgBarcodeString }}
                />

                {/* Label Bottom Meta */}
                <div className="flex items-center justify-between text-[10px] border-t border-slate-100 pt-1.5">
                  {showPrice && (
                    <span className="font-black text-xs text-slate-900">
                      {formatCurrency(customPrice)}
                    </span>
                  )}
                  {showBatch && (
                    <span className="font-mono text-slate-600 text-[9px]">
                      B:{customBatch}
                    </span>
                  )}
                  {showExpiry && (
                    <span className="font-mono text-slate-600 text-[9px]">
                      EXP:{formatDate(customExpiry)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  Ready to scan with 1D/2D optical barcode scanners & POS camera.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              
              {medicine && (
                <button
                  type="button"
                  onClick={handleSaveToMedicine}
                  disabled={isSaving || !barcodeText}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-white" />
                      <span>Barcode Assigned to Medicine!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 text-teal-600" />
                      <span>{isSaving ? 'Updating...' : 'Assign & Save Barcode to Medicine'}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handlePrintLabels}
                disabled={!barcodeText}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Print {labelCopies} Barcode Labels</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                Close Window
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
