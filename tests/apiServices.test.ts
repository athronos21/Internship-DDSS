import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import {
  inventoryApi,
  posApi,
  purchasingApi,
  financeApi,
  hrApi,
  adminApi,
} from '../src/services/api';

describe('Typed Frontend API Client Services (Task 5)', () => {
  let serverInstance: Server;
  const TEST_PORT = 5396;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.API_BASE_URL = `http://localhost:${TEST_PORT}`;
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  it('1. inventoryApi retrieves medicines, batches, and categories', async () => {
    const medRes = await inventoryApi.getMedicines();
    expect(medRes.success).toBe(true);
    expect(Array.isArray(medRes.data)).toBe(true);
    expect(medRes.data!.length).toBeGreaterThan(0);

    const batchRes = await inventoryApi.getBatches();
    expect(batchRes.success).toBe(true);
    expect(Array.isArray(batchRes.data)).toBe(true);

    const catRes = await inventoryApi.getCategories();
    expect(catRes.success).toBe(true);
    expect(Array.isArray(catRes.data)).toBe(true);
  });

  it('2. posApi retrieves sales and live dashboard summary telemetry', async () => {
    const salesRes = await posApi.getSales();
    expect(salesRes.success).toBe(true);
    expect(Array.isArray(salesRes.data)).toBe(true);

    const dashRes = await posApi.getDashboardSummary();
    expect(dashRes.success).toBe(true);
    expect(dashRes.data).toBeDefined();
    expect(typeof dashRes.data!.todayRevenue).toBe('number');
  });

  it('3. purchasingApi retrieves purchases and verified supplier network', async () => {
    const purchasesRes = await purchasingApi.getPurchases();
    expect(purchasesRes.success).toBe(true);
    expect(Array.isArray(purchasesRes.data)).toBe(true);

    const suppliersRes = await purchasingApi.getSuppliers();
    expect(suppliersRes.success).toBe(true);
    expect(Array.isArray(suppliersRes.data)).toBe(true);
    expect(suppliersRes.data!.length).toBeGreaterThan(0);
  });

  it('4. financeApi calculates profit & loss and COGS telemetry', async () => {
    const profitRes = await financeApi.getProfitReport('monthly');
    expect(profitRes.success).toBe(true);
    expect(profitRes.data).toBeDefined();
    expect(typeof profitRes.data!.grossProfit).toBe('number');
    expect(typeof profitRes.data!.profitMarginPercent).toBe('number');
  });

  it('5. hrApi manages user directory and institutional authentication', async () => {
    const usersRes = await hrApi.getUsers();
    expect(usersRes.success).toBe(true);
    expect(Array.isArray(usersRes.data)).toBe(true);
    expect(usersRes.data!.length).toBeGreaterThan(0);
  });

  it('6. adminApi manages institutional pharmacy profile, audit logs, and fleet', async () => {
    const profileRes = await adminApi.getPharmacyProfile();
    expect(profileRes.success).toBe(true);
    expect(profileRes.data).toBeDefined();
    expect(profileRes.data!.storeName).toBeDefined();
    expect(typeof profileRes.data!.enableBarcodeSystem).toBe('boolean');

    const fleetRes = await adminApi.getFleetPharmacies();
    expect(fleetRes.success).toBe(true);
    expect(Array.isArray(fleetRes.data)).toBe(true);
    expect(fleetRes.data!.length).toBeGreaterThan(0);

    const auditRes = await adminApi.getAuditLogs();
    expect(auditRes.success).toBe(true);
    expect(Array.isArray(auditRes.data)).toBe(true);
  });
});
