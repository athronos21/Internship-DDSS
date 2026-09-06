import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Medicine } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  QrCode,
  Download,
  Printer,
  X,
  Copy,
  Check,
  Tag,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface MedicineQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
}

export const MedicineQrCodeModal: React.FC<MedicineQrCodeModalProps> = ({
  isOpen,
  onClose,
  medicine,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [qrFormat, setQrFormat] = useState<'BARCODE_ONLY' | 'STRUCTURED_JSON' | 'POS_URL'>('BARCODE_ONLY');
  const [labelPrintLayout, setLabelPrintLayout] = useState<'single' | 'sheet24' | 'sheet30'>('single');
  const [labelCount, setLabelCount] = useState<number>(12);

  useEffect(() => {
    if (isOpen && medicine) {
      generateQrCode();
    }
  }, [isOpen, medicine, qrFormat]);

  const getPayload = (): string => {
    if (!medicine) return '';
    if (qrFormat === 'BARCODE_ONLY') {
      // Raw barcode text ensures 100% direct instant recognition by any POS barcode/QR scanner
      return medicine.barcode;
    }
    if (qrFormat === 'POS_URL') {
      // Direct Web link that can be scanned with any smartphone camera to open the item directly in POS
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kaziniya.app';
      return `${baseUrl}/pos?barcode=${encodeURIComponent(medicine.barcode)}&id=${encodeURIComponent(medicine.id)}`;
    }
    // Full structured JSON for smart scanning apps, regulatory audits, and pharmacy passport
    return JSON.stringify({
      code: medicine.barcode,
      id: medicine.id,
      name: medicine.name,
      generic: medicine.genericName,
      strength: medicine.strength,
      price: medicine.sellingPrice || 0,
      expiry: medicine.earliestExpiry,
      cat: medicine.categoryName,
      efda: 'EFDA/PH-AA/2026/0892',
    });
  };

  const generateQrCode = async () => {
    if (!medicine) return;
    try {
      const payload = getPayload();
      
      // Generate Data URL for image rendering & download
      const url = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      setDataUrl(url);

      // Also render to canvas if available
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  if (!isOpen || !medicine) return null;

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${medicine.name.replace(/[^a-z0-9]/gi, '_')}_${medicine.barcode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(medicine.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getPayload());
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handlePrint = () => {
    if (labelPrintLayout === 'single') {
      window.print();
      return;
    }

    // Print multiple labels on standard A4 / Letter sticker sheet
    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    const count = labelPrintLayout === 'sheet24' ? 24 : 30;
    const cols = labelPrintLayout === 'sheet24' ? 3 : 3;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shelf Labels - ${medicine.name}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(${cols}, 1fr);
              gap: 8px;
            }
            .label-card {
              border: 1px dashed #cbd5e1;
              border-radius: 8px;
              padding: 8px;
              text-align: center;
              font-size: 11px;
              page-break-inside: avoid;
              background: #fff;
            }
            .label-title { font-weight: 800; font-size: 12px; margin-bottom: 2px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .label-generic { font-size: 9.5px; color: #64748b; font-style: italic; margin-bottom: 4px; }
            .qr-img { width: 90px; height: 90px; margin: 0 auto; display: block; }
            .barcode-text { font-family: monospace; font-weight: bold; font-size: 10px; margin-top: 2px; }
            .label-footer { display: flex; justify-content: space-between; font-size: 9.5px; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 3px; font-weight: bold; }
            .price { color: #0d9488; }
          </style>
        </head>
        <body>
          <div class="grid-container">
            ${Array.from({ length: count })
              .map(
                () => `
              <div class="label-card">
                <div style="font-size: 8px; color: #64748b; text-transform: uppercase; font-weight: bold;">Kaziniya Pharmacy</div>
                <div class="label-title">${medicine.name}</div>
                <div class="label-generic">${medicine.genericName} (${medicine.strength})</div>
                <img src="${dataUrl}" class="qr-img" />
                <div class="barcode-text">${medicine.barcode}</div>
                <div class="label-footer">
                  <span class="price">${formatCurrency(medicine.sellingPrice || 0)}</span>
                  <span>EXP: ${formatDate(medicine.earliestExpiry)}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 print:hidden bg-slate-50/60 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Medicine QR & Shelf Label</h3>
              <p className="text-[11px] text-slate-400">High-resolution QR encoding for instant POS and shelf scans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* PRINTABLE SHELF LABEL CARD */}
          <div className="p-4" id="qr-printable-label">
            <div className="rounded-2xl border-2 border-slate-200 p-5 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 text-center space-y-3 shadow-sm">
              {/* Category & Store Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-md bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                  {medicine.categoryName}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-500">
                  Kaziniya Drug Store
                </span>
              </div>

              {/* Medicine Name & Generic */}
              <div className="space-y-0.5">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {medicine.name}
                </h4>
                <p className="text-xs text-slate-500 italic">
                  {medicine.genericName} ({medicine.strength})
                </p>
              </div>

              {/* Canvas / Image QR Code Box */}
              <div className="flex justify-center py-2">
                <div className="p-3 bg-white rounded-2xl shadow-xs border border-slate-200 inline-block">
                  {dataUrl ? (
                    <img
                      src={dataUrl}
                      alt={`QR for ${medicine.name}`}
                      className="rounded-lg w-44 h-44 object-contain mx-auto"
                    />
                  ) : (
                    <canvas ref={canvasRef} className="rounded-lg max-w-[190px] h-auto" />
                  )}
                </div>
              </div>

              {/* Barcode Number & Copy */}
              <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {medicine.barcode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyBarcode}
                  className="p-1.5 text-slate-400 hover:text-teal-600 transition print:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Copy Barcode"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Price & Shelf Details */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Retail Price</span>
                  <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400">
                    {formatCurrency(medicine.sellingPrice || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Earliest Expiry</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatDate(medicine.earliestExpiry)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Format Selector */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 print:hidden text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">QR Encoding Payload:</span>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-[11px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline"
              >
                {copiedPayload ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedPayload ? 'Copied Raw Payload' : 'Copy QR Payload'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setQrFormat('BARCODE_ONLY')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold transition text-center ${
                  qrFormat === 'BARCODE_ONLY'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                POS Barcode Mode
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('STRUCTURED_JSON')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold transition text-center ${
                  qrFormat === 'STRUCTURED_JSON'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Full JSON Data
              </button>
              <button
                type="button"
                onClick={() => setQrFormat('POS_URL')}
                className={`px-2 py-2 rounded-lg text-[11px] font-bold transition text-center ${
                  qrFormat === 'POS_URL'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Web Direct Link
              </button>
            </div>
          </div>

          {/* Print Layout Sheet Selector */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 print:hidden text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-semibold block">Print Layout:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setLabelPrintLayout('single')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition text-center ${
                  labelPrintLayout === 'single'
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Single Shelf Sticker
              </button>
              <button
                type="button"
                onClick={() => setLabelPrintLayout('sheet24')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition text-center ${
                  labelPrintLayout === 'sheet24'
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Sheet of 24 Labels
              </button>
              <button
                type="button"
                onClick={() => setLabelPrintLayout('sheet30')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition text-center ${
                  labelPrintLayout === 'sheet30'
                    ? 'bg-slate-900 text-white dark:bg-teal-600'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Sheet of 30 Labels
              </button>
            </div>
          </div>
        </div>

        {/* ACTIONS FOOTER */}
        <div className="border-t border-slate-100 px-6 py-3.5 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between print:hidden shrink-0">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            {labelPrintLayout === 'single' ? 'Print Shelf Label' : `Print Sheet (${labelPrintLayout === 'sheet24' ? '24' : '30'} Labels)`}
          </button>
        </div>
      </div>
    </div>
  );
};
