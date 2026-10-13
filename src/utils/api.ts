/**
 * Safe API request utility for client-side fetches.
 * Prevents "Unexpected token '<', '<!doctype' is not valid JSON" errors
 * by validating response content-types and safely parsing JSON responses.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('kaziniya_auth_token') : null;
    const currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('kaziniya_current_user_id') : null;

    const mergedHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...((init?.headers as Record<string, string>) || {}),
    };

    if (token && !mergedHeaders['Authorization'] && !mergedHeaders['authorization']) {
      mergedHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (currentUserId && !mergedHeaders['x-user-id']) {
      mergedHeaders['x-user-id'] = currentUserId;
    }

    const res = await fetch(input, {
      credentials: 'same-origin',
      ...init,
      headers: mergedHeaders,
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    if (!rawText || !rawText.trim()) {
      return {
        success: res.ok,
        message: res.ok ? 'OK' : `HTTP ${res.status} ${res.statusText}`,
      };
    }

    // If server responded with HTML (e.g. 404/500 fallback or index.html)
    if (rawText.trim().startsWith('<') || !contentType.includes('application/json')) {
      console.warn(`[safeFetchJson] Received non-JSON response from ${input}:`, rawText.slice(0, 120));
      return {
        success: false,
        message: `Received non-JSON response (${res.status})`,
      };
    }

    try {
      const parsed = JSON.parse(rawText);
      return parsed;
    } catch (parseError) {
      console.warn(`[safeFetchJson] Failed to parse JSON from ${input}:`, parseError);
      return {
        success: false,
        message: 'Invalid JSON response from server',
      };
    }
  } catch (netError: any) {
    console.warn(`[safeFetchJson] Network error for ${input}:`, netError);
    return {
      success: false,
      message: netError?.message || 'Network connection failed',
    };
  }
}
