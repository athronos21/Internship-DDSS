import { apiClient, ApiResponse } from './client';
import { PharmacyStoreProfile, RegisteredPharmacyNode, AuditLog } from '../../types';

export const adminApi = {
  async getPharmacyProfile(): Promise<ApiResponse<PharmacyStoreProfile>> {
    return apiClient<PharmacyStoreProfile>('/api/pharmacy/profile');
  },

  async updatePharmacyProfile(payload: Partial<PharmacyStoreProfile>): Promise<ApiResponse<PharmacyStoreProfile>> {
    return apiClient<PharmacyStoreProfile>('/api/pharmacy/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getFleetPharmacies(): Promise<ApiResponse<RegisteredPharmacyNode[]>> {
    return apiClient<RegisteredPharmacyNode[]>('/api/fleet/pharmacies');
  },

  async getAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    return apiClient<AuditLog[]>('/api/audit-logs');
  },

  async createAuditLog(payload: {
    action: string;
    entityType: string;
    entityId: string;
    details?: string;
    newData?: any;
    oldData?: any;
  }): Promise<ApiResponse<AuditLog>> {
    return apiClient<AuditLog>('/api/audit-logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRoleMatrix(): Promise<ApiResponse<any>> {
    return apiClient('/api/auth/role-matrix');
  },

  async getDatabaseSchemaSql(): Promise<ApiResponse<{ sql: string }>> {
    return apiClient<{ sql: string }>('/api/database/schema-sql');
  },
};
