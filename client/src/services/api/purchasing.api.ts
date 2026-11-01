import { apiClient, ApiResponse } from './client';
import { Purchase, Supplier } from '../../types';

export const purchasingApi = {
  async getPurchases(): Promise<ApiResponse<Purchase[]>> {
    return apiClient<Purchase[]>('/api/purchases');
  },

  async createPurchase(purchasePayload: {
    supplierId: string;
    invoiceNumber: string;
    purchaseDate: string;
    items: Array<{
      medicineId: string;
      batchNumber: string;
      mfgDate: string;
      expiryDate: string;
      quantity: number;
      purchasePrice: number;
      sellingPrice: number;
    }>;
    totalAmount: number;
    notes?: string;
  }): Promise<ApiResponse<Purchase>> {
    return apiClient<Purchase>('/api/purchases', {
      method: 'POST',
      body: JSON.stringify(purchasePayload),
    });
  },

  async getSuppliers(): Promise<ApiResponse<Supplier[]>> {
    return apiClient<Supplier[]>('/api/suppliers');
  },

  async createSupplier(supplierPayload: Partial<Supplier> & { name: string }): Promise<ApiResponse<Supplier>> {
    return apiClient<Supplier>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierPayload),
    });
  },

  async updateSupplier(id: string, payload: Partial<Supplier>): Promise<ApiResponse<Supplier>> {
    return apiClient<Supplier>(`/api/suppliers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
