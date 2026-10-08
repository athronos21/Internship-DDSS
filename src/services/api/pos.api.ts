import { apiClient, ApiResponse } from './client';
import { Sale, DashboardSummary } from '../../types';

export const posApi = {
  async getSales(): Promise<ApiResponse<Sale[]>> {
    return apiClient<Sale[]>('/api/sales');
  },

  async getSaleById(id: string): Promise<ApiResponse<Sale>> {
    return apiClient<Sale>(`/api/sales/${encodeURIComponent(id)}`);
  },

  async createSale(salePayload: {
    items: Array<{
      medicineId: string;
      batchId?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    customerName?: string;
    subtotal: number;
    discount?: number;
    tax?: number;
    totalAmount: number;
    paymentMethod: string;
    soldBy?: string;
  }): Promise<ApiResponse<Sale>> {
    return apiClient<Sale>('/api/sales', {
      method: 'POST',
      body: JSON.stringify(salePayload),
    });
  },

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
    return apiClient<DashboardSummary>('/api/dashboard');
  },
};
