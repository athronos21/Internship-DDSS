import { describe, it, expect } from 'bun:test';
import { getAuthenticatedUser, requireAuth, requireRole } from '../src/server/roleGuard';

describe('Security Middleware Hardening', () => {
  it('rejects unauthenticated requests without session credentials', async () => {
    const req = { headers: {} } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });

  it('rejects forged x-user-id header without valid session token', async () => {
    const req = { headers: { 'x-user-id': 'u-superadmin' } } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });

  it('rejects invalid or forged bearer token', async () => {
    const req = { headers: { authorization: 'Bearer fake-token-123' } } as any;
    const user = await getAuthenticatedUser(req);
    expect(user).toBeNull();
  });

  it('requireAuth responds with 401 when user is not authenticated', () => {
    const req = {} as any;
    let statusCode: number | null = null;
    let jsonResponse: any = null;
    let nextCalled = false;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          },
        };
      },
    } as any;
    const next = () => {
      nextCalled = true;
    };

    requireAuth(req, res, next);
    expect(statusCode).toBe(401);
    expect(jsonResponse?.success).toBe(false);
    expect(nextCalled).toBe(false);
  });

  it('requireRole responds with 403 when role is unauthorized', () => {
    const req = { user: { role: 'CUSTOMER' } } as any;
    let statusCode: number | null = null;
    let jsonResponse: any = null;
    let nextCalled = false;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          },
        };
      },
    } as any;
    const next = () => {
      nextCalled = true;
    };

    const guard = requireRole(['PHARMACIST', 'STORE_OWNER']);
    guard(req, res, next);
    expect(statusCode).toBe(403);
    expect(jsonResponse?.success).toBe(false);
    expect(nextCalled).toBe(false);
  });
});
