import { describe, expect, it } from 'bun:test';
import {
  getEffectiveRole,
  getRoleConfig,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessDashboardView,
  ROLE_CONFIGS,
  SYSTEM_HIERARCHY_STATEMENT,
} from '../src/utils/roleManager';
import { User } from '../src/types';

describe('Role Manager & RBAC Security Suite', () => {
  it('exposes the institutional 3-tier hierarchy statement', () => {
    expect(SYSTEM_HIERARCHY_STATEMENT).toContain('Pharmacist');
    expect(SYSTEM_HIERARCHY_STATEMENT).toContain('Store Owner');
    expect(SYSTEM_HIERARCHY_STATEMENT).toContain('Super Admin');
  });

  describe('getEffectiveRole', () => {
    it('correctly resolves SUPER_ADMIN role', () => {
      const u1: Partial<User> = { id: '1', role: 'SUPER_ADMIN' };
      expect(getEffectiveRole(u1 as User)).toBe('SUPER_ADMIN');

      const u2: Partial<User> = { id: '2', role: 'ADMIN' as any, isSuperAdmin: true };
      expect(getEffectiveRole(u2 as User)).toBe('SUPER_ADMIN');

      const u3: Partial<User> = { id: '3', role: 'PHARMACIST', email: 'athronos21@gmail.com' };
      expect(getEffectiveRole(u3 as User)).toBe('SUPER_ADMIN');
    });

    it('correctly resolves STORE_OWNER role', () => {
      const u1: Partial<User> = { id: '1', role: 'STORE_OWNER' };
      expect(getEffectiveRole(u1 as User)).toBe('STORE_OWNER');

      const u2: Partial<User> = { id: '2', isOwner: true, role: 'PHARMACIST' };
      expect(getEffectiveRole(u2 as User)).toBe('STORE_OWNER');

      const u3: Partial<User> = { id: '3', role: 'ADMIN' as any };
      expect(getEffectiveRole(u3 as User)).toBe('STORE_OWNER');
    });

    it('correctly resolves PHARMACIST role', () => {
      const u1: Partial<User> = { id: '1', role: 'PHARMACIST' };
      expect(getEffectiveRole(u1 as User)).toBe('PHARMACIST');
    });

    it('defaults to CUSTOMER when user is null or undefined', () => {
      expect(getEffectiveRole(null)).toBe('CUSTOMER');
      expect(getEffectiveRole(undefined)).toBe('CUSTOMER');
    });
  });

  describe('hasPermission & Role Boundaries', () => {
    const superAdmin: Partial<User> = { id: 'u0', role: 'SUPER_ADMIN' };
    const storeOwner: Partial<User> = { id: 'u1', role: 'STORE_OWNER', isOwner: true };
    const pharmacist: Partial<User> = { id: 'u2', role: 'PHARMACIST' };
    const customer: Partial<User> = { id: 'u4', role: 'CUSTOMER' };

    it('Super Admin possesses master governance permissions', () => {
      expect(hasPermission(superAdmin as User, 'GLOBAL_SYSTEM_GOVERNANCE')).toBe(true);
      expect(hasPermission(superAdmin as User, 'VIEW_MASTER_FLEET')).toBe(true);
      expect(hasPermission(superAdmin as User, 'ONBOARD_GLOBAL_STORE')).toBe(true);
      expect(hasPermission(superAdmin as User, 'MANAGE_EFDA_RECALLS')).toBe(true);
      expect(hasPermission(superAdmin as User, 'SETTLE_GLOBAL_PAYMENTS')).toBe(true);
    });

    it('Store Owner possesses store operations & financial permissions', () => {
      expect(hasPermission(storeOwner as User, 'MANAGE_STORE_PROFILE')).toBe(true);
      expect(hasPermission(storeOwner as User, 'MANAGE_STORE_SETTINGS')).toBe(true);
      expect(hasPermission(storeOwner as User, 'MANAGE_STAFF_ACCOUNTS')).toBe(true);
      expect(hasPermission(storeOwner as User, 'VIEW_PROFIT_LOSS')).toBe(true);
      expect(hasPermission(storeOwner as User, 'EXPORT_FINANCIAL_PDF')).toBe(true);
      expect(hasPermission(storeOwner as User, 'MANAGE_INVENTORY')).toBe(true);
      expect(hasPermission(storeOwner as User, 'MANAGE_PURCHASES')).toBe(true);
      // But does NOT have platform governance
      expect(hasPermission(storeOwner as User, 'GLOBAL_SYSTEM_GOVERNANCE')).toBe(false);
      expect(hasPermission(storeOwner as User, 'ONBOARD_GLOBAL_STORE')).toBe(false);
    });

    it('Pharmacist possesses dispensing & inventory POS permissions, but is blocked from store governance and financials', () => {
      expect(hasPermission(pharmacist as User, 'USE_POS_CHECKOUT')).toBe(true);
      expect(hasPermission(pharmacist as User, 'VERIFY_PRESCRIPTIONS')).toBe(true);
      expect(hasPermission(pharmacist as User, 'DISPENSE_PRESCRIPTIONS')).toBe(true);
      expect(hasPermission(pharmacist as User, 'PROCESS_PAYMENTS_TELEBIRR_CBE')).toBe(true);
      expect(hasPermission(pharmacist as User, 'VIEW_STOCK_AVAILABILITY')).toBe(true);
      expect(hasPermission(pharmacist as User, 'MANAGE_INVENTORY')).toBe(true);
      expect(hasPermission(pharmacist as User, 'RECEIVE_BATCHES')).toBe(true);
      expect(hasPermission(pharmacist as User, 'PERFORM_SHIFT_HANDOVER')).toBe(true);

      // Blocked permissions (must be strictly false)
      expect(hasPermission(pharmacist as User, 'MANAGE_STAFF_ACCOUNTS')).toBe(false);
      expect(hasPermission(pharmacist as User, 'MANAGE_STORE_SETTINGS')).toBe(false);
      expect(hasPermission(pharmacist as User, 'MANAGE_STORE_PROFILE')).toBe(false);
      expect(hasPermission(pharmacist as User, 'VIEW_PROFIT_LOSS')).toBe(false);
      expect(hasPermission(pharmacist as User, 'VIEW_BALANCE_SHEET')).toBe(false);
      expect(hasPermission(pharmacist as User, 'GLOBAL_SYSTEM_GOVERNANCE')).toBe(false);
    });

    it('Customer only possesses public catalog viewing permission', () => {
      expect(hasPermission(customer as User, 'VIEW_STOCK_AVAILABILITY')).toBe(true);
      expect(hasPermission(customer as User, 'USE_POS_CHECKOUT')).toBe(false);
      expect(hasPermission(customer as User, 'MANAGE_INVENTORY')).toBe(false);
      expect(hasPermission(customer as User, 'VIEW_PROFIT_LOSS')).toBe(false);
    });
  });

  describe('Dashboard View Access Control', () => {
    const pharmacist: Partial<User> = { id: 'u2', role: 'PHARMACIST' };
    const storeOwner: Partial<User> = { id: 'u1', role: 'STORE_OWNER' };
    const superAdmin: Partial<User> = { id: 'u0', role: 'SUPER_ADMIN' };

    it('Pharmacist can access counter views but not admin views', () => {
      expect(canAccessDashboardView(pharmacist as User, 'pos')).toBe(true);
      expect(canAccessDashboardView(pharmacist as User, 'inventory')).toBe(true);
      expect(canAccessDashboardView(pharmacist as User, 'sales')).toBe(true);
      expect(canAccessDashboardView(pharmacist as User, 'reports')).toBe(true);

      expect(canAccessDashboardView(pharmacist as User, 'master_admin')).toBe(false);
      expect(canAccessDashboardView(pharmacist as User, 'users')).toBe(false);
      expect(canAccessDashboardView(pharmacist as User, 'settings')).toBe(false);
    });

    it('Store Owner can access back-office operational views', () => {
      expect(canAccessDashboardView(storeOwner as User, 'dashboard')).toBe(true);
      expect(canAccessDashboardView(storeOwner as User, 'inventory')).toBe(true);
      expect(canAccessDashboardView(storeOwner as User, 'sales')).toBe(true);
      expect(canAccessDashboardView(storeOwner as User, 'purchases')).toBe(true);
      expect(canAccessDashboardView(storeOwner as User, 'users')).toBe(true);
      expect(canAccessDashboardView(storeOwner as User, 'settings')).toBe(true);

      expect(canAccessDashboardView(storeOwner as User, 'master_admin')).toBe(false);
    });

    it('Super Admin can access national master administration view', () => {
      expect(canAccessDashboardView(superAdmin as User, 'master_admin')).toBe(true);
      expect(canAccessDashboardView(superAdmin as User, 'dashboard')).toBe(true);
    });
  });

  describe('hasAnyPermission and hasAllPermissions helpers', () => {
    const pharmacist: Partial<User> = { id: 'u2', role: 'PHARMACIST' };

    it('evaluates hasAnyPermission correctly', () => {
      expect(hasAnyPermission(pharmacist as User, ['USE_POS_CHECKOUT', 'GLOBAL_SYSTEM_GOVERNANCE'])).toBe(true);
      expect(hasAnyPermission(pharmacist as User, ['GLOBAL_SYSTEM_GOVERNANCE', 'MANAGE_STAFF_ACCOUNTS'])).toBe(false);
      expect(hasAnyPermission(null, ['USE_POS_CHECKOUT'])).toBe(false);
    });

    it('evaluates hasAllPermissions correctly', () => {
      expect(hasAllPermissions(pharmacist as User, ['USE_POS_CHECKOUT', 'VERIFY_PRESCRIPTIONS'])).toBe(true);
      expect(hasAllPermissions(pharmacist as User, ['USE_POS_CHECKOUT', 'MANAGE_STAFF_ACCOUNTS'])).toBe(false);
      expect(hasAllPermissions(null, ['USE_POS_CHECKOUT'])).toBe(false);
    });
  });
});
