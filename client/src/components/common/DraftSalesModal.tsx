import React, { useState } from 'react';
import { CartItem, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Bookmark,
  Trash2,
  ArrowUpRight,
  Plus,
  X,
  ShoppingBag,
  Clock,
  User,
  Check,
  FileText,
  AlertCircle,
} from 'lucide-react';

export interface SavedDraftSale {
  id: string;
  label: string;
  customerName: string;
  items: CartItem[];
  discountAmount: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  totalAmount: number;
  savedAt: string;
}

interface DraftSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraftSale[];
  onLoadDraft: (draft: SavedDraftSale) => void;
  onDeleteDraft: (draftId: string) => void;
  onSaveCurrentCart: (label: string) => void;
  currentCartCount: number;
}

export const DraftSalesModal: React.FC<DraftSalesModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onSaveCurrentCart,
  currentCartCount,
}) => {
  const [newDraftLabel, setNewDraftLabel] = useState('');
  const [isSavingFormOpen, setIsSavingFormOpen] = useState(false);
  const [selectedDraftForPreview, setSelectedDraftForPreview] = useState<SavedDraftSale | null>(null);

  if (!isOpen) return null;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newDraftLabel.trim() || `Draft Sale #${drafts.length + 1}`;
    onSaveCurrentCart(label);
    setNewDraftLabel('');
    setIsSavingFormOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80 dark:bg-slate-950 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Bookmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base dark:text-white">
                Draft Sales & Held Carts ({drafts.length})
              </h3>
              <p className="text-xs text-slate-400">
                Hold customer transactions and resume them anytime without losing item details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Action: Save current cart to drafts */}
          {currentCartCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <ShoppingBag className="h-4 w-4 text-amber-600" />
                  <span>Current Active Cart: {currentCartCount} item(s)</span>
                </div>
                {!isSavingFormOpen && (
                  <button
                    onClick={() => setIsSavingFormOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 font-bold text-xs transition shadow-xs"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>Hold / Save Current Sale</span>
                  </button>
                )}
              </div>

              {isSavingFormOpen && (
                <form onSubmit={handleSaveSubmit} className="pt-2 border-t border-amber-200 dark:border-amber-900/40 space-y-2">
                  <label className="block text-[11px] font-semibold text-amber-950 dark:text-amber-200">
                    Draft Label / Customer Reference:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Bed #4 prescription inquiry, Walk-in checking wallet..."
                      value={newDraftLabel}
                      onChange={(e) => setNewDraftLabel(e.target.value)}
                      className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:bg-slate-900 dark:border-amber-700 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-bold transition shadow-xs shrink-0"
                    >
                      Save & Clear Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSavingFormOpen(false)}
                      className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-3 py-2 font-semibold transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Draft List */}
          {drafts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl dark:border-slate-800 space-y-2">
              <Bookmark className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">No held draft sales found</p>
              <p className="text-[11px]">
                When a customer needs to pause checkout, click &quot;Hold Draft&quot; to free the POS for the next sale.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider px-1">
                <span>Saved Draft Records</span>
                <span>Actions</span>
              </div>

              {drafts.map((draft) => {
                const isSelected = selectedDraftForPreview?.id === draft.id;
                return (
                  <div
                    key={draft.id}
                    className={`rounded-xl border transition p-4 space-y-3 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 dark:border-teal-700'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm dark:text-white">
                            {draft.label}
                          </span>
                          <span className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                            {draft.items.length} item{draft.items.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(draft.savedAt)}
                          </span>
                          {draft.customerName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {draft.customerName}
                            </span>
                          )}
                          <span className="font-bold text-teal-700 dark:text-teal-400">
                            Total: {formatCurrency(draft.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => setSelectedDraftForPreview(isSelected ? null : draft)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                        >
                          {isSelected ? 'Hide Details' : 'View Items'}
                        </button>
                        <button
                          onClick={() => {
                            onLoadDraft(draft);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 font-bold text-xs transition shadow-xs"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span>Load / Resume</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete draft sale "${draft.label}"?`)) {
                              onDeleteDraft(draft.id);
                              if (isSelected) setSelectedDraftForPreview(null);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition dark:hover:bg-rose-950/60"
                          title="Delete draft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable item breakdown preview */}
                    {isSelected && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                          Included Medicines:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {draft.items.map((item, i) => (
                            <div
                              key={i}
                              className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <div className="truncate pr-2">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                                  {item.medicine.name}
                                </span>
                                <span className="text-slate-400 text-[10px]">
                                  Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between text-slate-500 text-[11px]">
          <span>Drafts are preserved locally in browser storage across reboots and page refreshes.</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
