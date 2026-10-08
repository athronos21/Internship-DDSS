import { apiClient, ApiResponse } from './client';
import { ProfitReportData } from '../../types';

export const financeApi = {
  async getProfitReport(period?: string): Promise<ApiResponse<ProfitReportData>> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    return apiClient<ProfitReportData>(`/api/reports/profit${query}`);
  },

  async getExpenses(): Promise<ApiResponse<any[]>> {
    return apiClient<any[]>('/api/expenses');
  },

  async createExpense(expensePayload: {
    category: string;
    amount: number;
    description: string;
    date: string;
  }): Promise<ApiResponse<any>> {
    return apiClient('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expensePayload),
    });
  },
};
