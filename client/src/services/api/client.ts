import { safeFetchJson } from '../../utils/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
  [key: string]: any;
}

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public raw?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('kaziniya_auth_token') : null;
  const currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('kaziniya_current_user_id') : null;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  if (currentUserId) {
    defaultHeaders['x-user-id'] = currentUserId;
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };

  let targetUrl = endpoint;
  if (endpoint.startsWith('/') && typeof window === 'undefined') {
    const base = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    targetUrl = `${base}${endpoint}`;
  }

  const response = await safeFetchJson<T>(targetUrl, {
    ...options,
    headers: mergedHeaders,
  });

  return response as ApiResponse<T>;
}
