import { apiClient, ApiResponse } from './client';
import { Medicine, MedicineBatch, Category, InventoryTransaction } from '../../types';

export const inventoryApi = {
  async getMedicines(): Promise<ApiResponse<Medicine[]>> {
    return apiClient<Medicine[]>('/api/medicines');
  },

  async getMedicineById(id: string): Promise<ApiResponse<{ medicine: Medicine; batches: MedicineBatch[]; transactions: InventoryTransaction[] }>> {
    return apiClient(`/api/medicines/${encodeURIComponent(id)}`);
  },

  async getMedicineByBarcode(barcode: string): Promise<ApiResponse<{ medicine: Medicine; batches: MedicineBatch[] }>> {
    return apiClient(`/api/medicines/barcode/${encodeURIComponent(barcode)}`);
  },

  async createMedicine(payload: Partial<Medicine> & { name: string; initialBatch?: any }): Promise<ApiResponse<Medicine>> {
    return apiClient<Medicine>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateMedicine(id: string, payload: Partial<Medicine>): Promise<ApiResponse<Medicine>> {
    return apiClient<Medicine>(`/api/medicines/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteMedicine(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiClient(`/api/medicines/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async getBatches(): Promise<ApiResponse<MedicineBatch[]>> {
    return apiClient<MedicineBatch[]>('/api/batches');
  },

  async createBatch(payload: Partial<MedicineBatch> & { medicineId: string; batchNumber: string }): Promise<ApiResponse<MedicineBatch>> {
    return apiClient<MedicineBatch>('/api/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateBatch(id: string, payload: Partial<MedicineBatch>): Promise<ApiResponse<MedicineBatch>> {
    return apiClient<MedicineBatch>(`/api/batches/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async adjustInventory(payload: {
    medicineId: string;
    batchId?: string;
    type: 'DAMAGE' | 'EXPIRY' | 'THEFT' | 'AUDIT_CORRECTION' | 'INITIAL_STOCK';
    quantity: number;
    reason?: string;
    performedBy?: string;
  }): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient<InventoryTransaction>('/api/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient<Category[]>('/api/categories');
  },

  async createCategory(payload: { name: string; description?: string }): Promise<ApiResponse<Category>> {
    return apiClient<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
