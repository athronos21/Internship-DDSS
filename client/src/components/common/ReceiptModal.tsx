import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Medicine, Sale, SaleItem } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle, X, Store, Phone, MapPin, FileText, QrCode, Tag, Sparkles, AlertTriangle } from 'lucide-react';
import { MedicineQrCodeModal } from './MedicineQrCodeModal';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, sale }) => {
  const [receiptWidth, setReceiptWidth] = useState<'80mm' | '58mm'>('80mm');
  const [qrTargetMedicine, setQrTargetMedicine] = useState<Medicine | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [pendingLabelItem, setPendingLabelItem] = useState<SaleItem | null>(null);
  const [isConfirmingLabel, setIsConfirmingLabel] = useState(false);
  const [receiptQrDataUrl, setReceiptQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (sale) {
      const qrPayload = JSON.stringify({
        inv: sale.invoiceNumber,
        tot: sale.totalAmount,
        dt: sale.createdAt,
        pay: sale.paymentMethod,
        efda: 'EFDA/PH-AA/2026/0892',
        tin: '0048291048',
      });
      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setReceiptQrDataUrl(url))
        .catch((e) => console.warn('Could not generate receipt QR:', e));
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const promptLabelConfirmation = (item: SaleItem) => {
    setPendingLabelItem(item);
    setIsConfirmingLabel(true);
  };

  const handleConfirmLabelPrint = () => {
    if (pendingLabelItem) {
      handleOpenItemQr(pendingLabelItem);
    }
    setIsConfirmingLabel(false);
    setPendingLabelItem(null);
  };

  const handleCancelLabelPrint = () => {
    setIsConfirmingLabel(false);
    setPendingLabelItem(null);
  };

  const handleOpenItemQr = (item: SaleItem) => {
    const medicineObj: Medicine = {
      id: item.medicineId || `med-${item.id}`,
      barcode: item.batchNumber ? `MED-${item.medicineId?.slice(0, 6) || 'RX'}-${item.batchNumber}` : `RX-${item.medicineId?.slice(0, 8) || 'ITEM'}`,
      sku: `SKU-${item.medicineId?.slice(0, 6) || 'RX'}`,
      name: item.medicineName || 'Prescription Medicine',
      genericName: item.medicineName || 'Pharmaceutical Item',
      brandName: 'Kaziniya Rx',
      categoryId: 'general',
      categoryName: 'Dispensed Rx Item',
      dosageForm: 'Unit Dispense',
      strength: item.batchNumber ? `Batch: ${item.batchNumber}` : 'Standard Dose',
      unit: 'Pack',
      manufacturer: 'Kaziniya Healthcare Lab',
      description: `Dispensed in Invoice #${sale.invoiceNumber}. Batch: ${item.batchNumber || 'N/A'}${item.expiryDate ? ` - Exp: ${item.expiryDate}` : ''}`,
      prescriptionRequired: false,
      reorderLevel: 10,
      isActive: true,
      createdAt: sale.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sellingPrice: item.unitPrice || 0,
      earliestExpiry: item.expiryDate || '2027-12-31',
    };
    setQrTargetMedicine(medicineObj);
    setIsQrModalOpen(true);
  };

  const vatRate = 0; // Vital pharmaceuticals exempt under EFDA / MoR
  const calculatedVat = (sale.totalAmount * vatRate) / (1 + vatRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Actions Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5 dark:border-slate-800 print:hidden bg-slate-50/70 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm dark:text-white">Thermal Receipt Invoice</h3>
              <p className="text-[11px] text-slate-400 font-mono">{sale.invoiceNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Width Toggle for 80mm vs 58mm POS thermal printers */}
            <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => setReceiptWidth('80mm')}
                className={`px-2 py-1 rounded-md transition ${
                  receiptWidth === '80mm'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                80mm
              </button>
              <button
                onClick={() => setReceiptWidth('58mm')}
                className={`px-2 py-1 rounded-md transition ${
                  receiptWidth === '58mm'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
              title="Print formatted receipt to thermal printer"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Paper Container */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-100/50 dark:bg-slate-950/40">
          <div
            id="receipt-printable-area"
            style={{ width: receiptWidth === '58mm' ? '280px' : '340px' }}
            className="p-5 font-mono text-[11px] text-slate-900 bg-white dark:bg-white dark:text-slate-950 rounded-xl shadow-md border border-slate-200 space-y-3 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Pharmacy Official Branding & Header */}
            <div className="receipt-header text-center pb-3 border-b border-dashed border-slate-300 space-y-1.5 print:border-black">
              {/* Store Logo / Rx Emblem */}
              <div className="receipt-logo-container flex flex-col items-center justify-center gap-1">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center bg-slate-50 p-0.5 print:border-black print:bg-white shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=120&auto=format&fit=crop&q=80"
                    alt="Kaziniya Logo"
                    className="receipt-logo w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Store Brand Name */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5 font-sans font-black text-sm tracking-tight text-slate-950 uppercase print:text-black">
                  <Store className="h-3.5 w-3.5 text-slate-900 print:text-black shrink-0" />
                  KAZINIYA DRUG STORE
                </div>
                <div className="text-[10.5px] font-sans font-bold text-slate-800 print:text-black">
                  ካዚንያ መድኃኒት ቤት
                </div>
                <p className="text-[9.5px] text-slate-600 font-sans font-semibold print:text-black">
                  Licensed Retail Pharmacy & Healthcare Solutions
                </p>
                <div className="inline-block px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-100 text-slate-700 print:border print:border-black print:bg-transparent print:text-black">
                  Branch: Main Store (Bole Central)
                </div>
              </div>

              {/* Complete Store Contact & Compliance Details */}
              <div className="text-[9px] text-slate-600 font-sans space-y-0.5 pt-1 print:text-black leading-tight">
                <p className="flex items-center justify-center gap-1 text-center">
                  <MapPin className="h-2.5 w-2.5 shrink-0" /> Bole Medhanialem, Next to CBE, Addis Ababa, Ethiopia
                </p>
                <p className="flex items-center justify-center gap-1">
                  <Phone className="h-2.5 w-2.5 shrink-0" /> +251 116 123 456 / +251 911 234 567
                </p>
                <p className="text-[8.5px] text-slate-500 print:text-black">
                  Email: info@kaziniyadrugs.com • Web: www.kaziniyadrugs.com
                </p>
                <div className="pt-0.5 font-semibold text-slate-800 print:text-black text-[8.5px]">
                  <span>TIN: 0048291048</span> • <span>VAT: ET-98234-2026</span>
                </div>
                <p className="text-[8.5px] text-slate-500 print:text-black">
                  EFDA Lic: EFDA/PH-AA/2026/0892
                </p>
              </div>
            </div>

            {/* Offline Transaction Alert if Applicable */}
            {sale.invoiceNumber.includes('OFFLINE') && (
              <div className="rounded border border-dashed border-amber-600 bg-amber-50 p-1 text-center text-[9.5px] font-bold text-amber-900">
                ⚡ OFFLINE TRANSACTION (Queued for Cloud Sync)
              </div>
            )}

            {/* Print QR Code Action Bar within Receipt Container (Screen Only - Hidden during print) */}
            <div className="print:hidden rounded-xl border border-teal-200 bg-teal-50/90 dark:bg-teal-950/50 dark:border-teal-800/80 p-2.5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0 shadow-2xs">
                  <QrCode className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-bold text-[10.5px] text-teal-950 dark:text-teal-100 truncate">
                    Dispensed Medicine Labels
                  </p>
                  <p className="text-[9px] text-teal-700 dark:text-teal-300 truncate">
                    Generate scannable QR shelf & bottle stickers
                  </p>
                </div>
              </div>
              <button
                id="btn-print-qr-code"
                type="button"
                onClick={() => sale.items.length > 0 && promptLabelConfirmation(sale.items[0])}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1 text-[10px] font-bold transition shadow-xs shrink-0 cursor-pointer"
                title="Print QR Code label for dispensed medicine"
              >
                <QrCode className="h-3 w-3" />
                <span>Print QR Code</span>
              </button>
            </div>

            {/* Invoice & Sales Metadata */}
            <div className="py-1.5 border-b border-dashed border-slate-300 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice No:</span>
                <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date/Time:</span>
                <span>{formatDateTime(sale.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold">{sale.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dispensed By:</span>
                <span>{sale.soldByName || 'Pharmacist'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Type:</span>
                <span className="font-bold text-slate-900">{sale.paymentMethod}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-1.5 border-b border-dashed border-slate-300 space-y-1.5">
              <div className="grid grid-cols-12 font-bold pb-1 text-[9px] text-slate-500 uppercase border-b border-slate-200">
                <div className="col-span-6">Medicine / Batch</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Total</div>
              </div>

              <div className="space-y-2 pt-1">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="text-[10px] leading-tight space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-bold text-slate-900">
                        {idx + 1}. {item.medicineName}
                      </div>
                      <button
                        type="button"
                        onClick={() => promptLabelConfirmation(item)}
                        className="print:hidden inline-flex items-center gap-1 rounded bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-1.5 py-0.5 text-[8.5px] font-bold transition shadow-2xs shrink-0 cursor-pointer"
                        title={`Print QR Code label for ${item.medicineName}`}
                      >
                        <QrCode className="h-2.5 w-2.5" />
                        <span>Print QR Code</span>
                      </button>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[9px]">
                      <span>
                        B: {item.batchNumber} {item.expiryDate ? `(Exp: ${item.expiryDate})` : ''}
                      </span>
                      <span>
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary & VAT Details */}
            <div className="py-1.5 border-b border-dashed border-slate-300 space-y-1 text-[10.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}):</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Discount Applied:</span>
                  <span>-{formatCurrency(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[9.5px]">
                <span>VAT (0% - Essential Rx Exempt):</span>
                <span>ETB 0.00</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-300">
                <span>TOTAL AMOUNT:</span>
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
            </div>

            {/* Barcode & Verification Footprint */}
            <div className="pt-2 text-center space-y-2">
              <div className="flex flex-col items-center justify-center space-y-1.5">
                {receiptQrDataUrl ? (
                  <div className="p-1 bg-white border border-slate-200 rounded-lg inline-block">
                    <img
                      src={receiptQrDataUrl}
                      alt={`Receipt QR for ${sale.invoiceNumber}`}
                      className="w-24 h-24 object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-full flex items-center justify-center overflow-hidden px-4 opacity-85">
                    <div className="flex gap-[2px] items-stretch h-7 w-full justify-center">
                      {Array.from({ length: 38 }).map((_, i) => (
                        <div
                          key={i}
                          className={`bg-slate-900 ${
                            i % 4 === 0 ? 'w-[3px]' : i % 3 === 0 ? 'w-[1.5px]' : 'w-[1px]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-0.5 font-mono text-[9px] text-slate-600">
                  <span className="font-bold tracking-wider">*{sale.invoiceNumber}*</span>
                  <p className="text-[8px] text-slate-400">Scan QR to verify tax & EFDA compliance</p>
                </div>
              </div>

              {/* Legal Note & Disclaimer */}
              <div className="text-[9px] text-slate-500 space-y-1 border-t border-dashed border-slate-200 pt-2 font-sans">
                <p className="font-semibold text-slate-700">Thank you for visiting Kaziniya Drug Store!</p>
                <p>Goods sold are non-refundable except under EFDA pharmaceutical return protocols.</p>
                <p className="font-mono text-[8.5px] text-slate-400">
                  Core POS Node #{sale.id.slice(0, 8)} • Certified Pharmacy OS
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between print:hidden shrink-0 text-xs">
          <span className="text-slate-400 text-[11px]">
            Ready to print on 58mm or 80mm ESC/POS Thermal Printers
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300 transition dark:bg-slate-800 dark:text-slate-300"
            >
              Close Receipt
            </button>
            <button
              onClick={handlePrint}
              className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Thermal Label Print Confirmation Prompt Modal */}
      {isConfirmingLabel && pendingLabelItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs print:hidden animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Label Print Operation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You are about to initiate a QR code sticker & bottle label print.
                </p>
              </div>
            </div>

            {/* Target Item Details Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Medicine:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {pendingLabelItem.medicineName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Batch Number:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {pendingLabelItem.batchNumber || 'STANDARD-RX'}
                </span>
              </div>
              {pendingLabelItem.expiryDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Expiry Date:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {pendingLabelItem.expiryDate}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Quantity Sold:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {pendingLabelItem.quantity} units ({formatCurrency(pendingLabelItem.unitPrice)} each)
                </span>
              </div>
            </div>

            {/* Thermal Paper Wastage Warning */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 dark:border-amber-900/60 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-2">
              <Tag className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <strong>Thermal Paper Conservation:</strong> Verify your thermal barcode sticker printer is loaded and aligned before confirming to avoid paper wastage.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelLabelPrint}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLabelPrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow-sm transition cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Confirm & Generate Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Item QR Code Shelf / Bottle Label Print Modal */}
      {isQrModalOpen && (
        <MedicineQrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => {
            setIsQrModalOpen(false);
            setQrTargetMedicine(null);
          }}
          medicine={qrTargetMedicine}
        />
      )}
    </div>
  );
};

