import { apiClient, ApiResponse } from './client';
import { User } from '../../types';

export const hrApi = {
  async getUsers(): Promise<ApiResponse<User[]>> {
    return apiClient<User[]>('/api/users');
  },

  async createUser(payload: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    department?: string;
    temporaryPassword?: string;
    mustChangePassword?: boolean;
  }): Promise<ApiResponse<User>> {
    return apiClient<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(id: string, payload: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient<User>(`/api/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(userId: string): Promise<ApiResponse<{ user: User; temporaryPassword?: string }>> {
    return apiClient(`/api/users/${encodeURIComponent(userId)}/reset-password`, {
      method: 'POST',
    });
  },

  async login(identifier: string, password?: string, pin?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, pin }),
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string, newPin?: string): Promise<ApiResponse<User>> {
    return apiClient<User>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, currentPassword, newPassword, newPin }),
    });
  },

  async registerOwner(ownerPayload: any): Promise<ApiResponse<any>> {
    return apiClient('/api/auth/register-owner', {
      method: 'POST',
      body: JSON.stringify(ownerPayload),
    });
  },

  async getCurrentUserSession(): Promise<ApiResponse<{ user: User; role: string; permissions: string[] }>> {
    return apiClient('/api/auth/me');
  },
};
