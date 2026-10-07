import { describe, it, expect } from 'bun:test';

const BASE_LOCAL = 'http://localhost:5000';
const BASE_PROD = 'https://internship-ddss-athronos21s-projects.vercel.app';

describe('1. Institutional Health & Status Endpoints', () => {
  it('GET /health on localhost returns 200 and status: ok', async () => {
    const res = await fetch(`${BASE_LOCAL}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toContain('Kaziniya');
  });

  it('GET /health on live Vercel production returns 200 and status: ok', async () => {
    const res = await fetch(`${BASE_PROD}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
  });
});

describe('2. Comprehensive Role Authentication & Verification', () => {
  it('Super Admin authenticates via work email (athronos21@gmail.com)', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'athronos21@gmail.com', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('SUPER_ADMIN');
    expect(data.data.isSuperAdmin).toBe(true);
  });

  it('Super Admin authenticates via employee ID (SYS-ADMIN-001)', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'SYS-ADMIN-001', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('SUPER_ADMIN');
  });

  it('Store Owner authenticates via work email (admin@kaziniya.com)', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@kaziniya.com', password: 'Admin#2026' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('STORE_OWNER');
    expect(data.data.isOwner).toBe(true);
  });

  it('Store Owner authenticates via employee ID (KZN-OWNER-001 and EMP-001)', async () => {
    for (const empId of ['KZN-OWNER-001', 'EMP-001']) {
      const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: empId, password: 'Admin#2026' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.role).toBe('STORE_OWNER');
    }
  });

  it('Pharmacist (Muna Ahmed) authenticates via work email (munaa7536@gmail.com)', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'munaa7536@gmail.com', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Muna Ahmed');
    expect(data.data.role).toBe('PHARMACIST');
  });

  it('Pharmacist (Muna Ahmed) authenticates via employee ID (EMP-PHARM-01)', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'EMP-PHARM-01', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('PHARMACIST');
  });

  it('Senior Pharmacist (Solomon Bekele) authenticates via pharmacist@kaziniya.com', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'pharmacist@kaziniya.com', password: 'Pharma#2026' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('PHARMACIST');
  });

  it('First-time onboarding Pharmacist (Bethlehem Worku) returns mustChangePassword: true', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'bethlehem@kaziniya.com', password: 'Temp#Pharma2026' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mustChangePassword).toBe(true);
  });

  it('Rejects invalid password with HTTP 401', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'munaa7536@gmail.com', password: 'CompletelyWrongPassword!' }),
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid password');
  });

  it('Rejects non-existent account with HTTP 404', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'nonexistent-user@nowhere.com', password: 'Password123!' }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});

describe('3. Drug Store Registration (Owner Onboarding)', () => {
  it('Validates required fields and rejects invalid registration with HTTP 400', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerName: '' }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('Registers new pharmacy node, creates Store Owner user, and records audit log (HTTP 201)', async () => {
    const timestamp = Date.now();
    const storeEmail = `owner.${timestamp}@habeshapharmacy.et`;
    const regPayload = {
      ownerName: `Dr. Dawit Haile ${timestamp}`,
      ownerEmail: storeEmail,
      ownerPhone: '+251 911 887 766',
      password: 'Password123!',
      storeName: `Habesha Community Pharmacy ${timestamp}`,
      tinNumber: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      streetAddress: 'Bole Subcity, Woreda 03, Addis Ababa',
      city: 'Addis Ababa',
      subcity: 'Bole Subcity',
    };

    const res = await fetch(`${BASE_LOCAL}/api/auth/register-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(storeEmail);
    expect(data.data.user.role).toBe('STORE_OWNER');
    expect(data.data.pharmacy.storeName).toBe(regPayload.storeName);

    // Verify immediate login capability
    const loginRes = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: storeEmail, password: 'Password123!' }),
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.role).toBe('STORE_OWNER');
  });
});

describe('4. Staff Management & Account Lifecycle', () => {
  it('GET /api/users returns all registered users including Muna Ahmed', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/users`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    const muna = data.data.find((u: any) => u.email === 'munaa7536@gmail.com');
    expect(muna).toBeDefined();
    expect(muna.role).toBe('PHARMACIST');
  });

  it('POST /api/users creates a new dispensary pharmacist with temporary password slip', async () => {
    const timestamp = Date.now();
    const newStaffEmail = `staff.${timestamp}@kaziniya.com`;
    const payload = {
      name: `Pharm. Eyerusalem Tesfaye ${timestamp}`,
      email: newStaffEmail,
      phone: '+251 911 334 455',
      role: 'PHARMACIST',
      employeeId: `EMP-${timestamp.toString().slice(-4)}`,
      pin: '5566',
    };

    const res = await fetch(`${BASE_LOCAL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.temporaryPassword).toBeDefined();

    // Verify login with temporary credentials
    const loginRes = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: newStaffEmail, password: data.temporaryPassword }),
    });
    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(loginData.mustChangePassword).toBe(true);

    // Verify self-service change-password endpoint
    const changeRes = await fetch(`${BASE_LOCAL}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.data.id,
        currentPassword: data.temporaryPassword,
        newPassword: 'MyNewPermanentPassword123!',
        newPin: '7788',
      }),
    });
    expect(changeRes.status).toBe(200);
    const changeData = await changeRes.json();
    expect(changeData.success).toBe(true);

    // Verify permanent login
    const permLogin = await fetch(`${BASE_LOCAL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: newStaffEmail, password: 'MyNewPermanentPassword123!' }),
    });
    expect(permLogin.status).toBe(200);
    const permData = await permLogin.json();
    expect(permData.mustChangePassword).toBe(false);
  });
});

describe('5. Inventory, Batches, and FEFO Dispensing Core', () => {
  it('GET /api/medicines returns enriched stock and selling prices', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/medicines`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    const first = data.data[0];
    expect(first.id).toBeDefined();
    expect(typeof first.totalStock).toBe('number');
    expect(typeof first.sellingPrice).toBe('number');
  });

  it('GET /api/batches returns enriched batch expiration status', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/batches`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    const batch = data.data[0];
    expect(batch.expiryDate).toBeDefined();
    expect(batch.status).toBeDefined();
  });

  it('POST /api/sales executes atomic FEFO stock deduction and records transaction', async () => {
    // 1. Get first available medicine with stock
    const medRes = await fetch(`${BASE_LOCAL}/api/medicines`);
    const medData = await medRes.json();
    const targetMed = medData.data.find((m: any) => m.totalStock >= 2);
    expect(targetMed).toBeDefined();
    const initialStock = targetMed.totalStock;

    // 2. Perform POS sale of 1 unit
    const saleRes = await fetch(`${BASE_LOCAL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Abebe Bikila',
        customerPhone: '+251 911 223 344',
        paymentMethod: 'TELEBIRR',
        soldByUserId: 'u-munaa',
        items: [
          {
            medicineId: targetMed.id,
            quantity: 1,
            unitPrice: targetMed.sellingPrice,
          },
        ],
      }),
    });
    expect(saleRes.status).toBe(201);
    const saleData = await saleRes.json();
    expect(saleData.success).toBe(true);
    expect(saleData.data.invoiceNumber).toBeDefined();

    // 3. Verify stock decreased by 1
    const verifyRes = await fetch(`${BASE_LOCAL}/api/medicines`);
    const verifyData = await verifyRes.json();
    const updatedMed = verifyData.data.find((m: any) => m.id === targetMed.id);
    expect(updatedMed.totalStock).toBe(initialStock - 1);
  });

  it('POST /api/inventory/adjust applies physical count adjustments', async () => {
    const batchRes = await fetch(`${BASE_LOCAL}/api/batches`);
    const batchData = await batchRes.json();
    const targetBatch = batchData.data[0];
    const initialBatchQty = targetBatch.currentQuantity;

    // Positive adjustment (+5 units count correction)
    const adjRes = await fetch(`${BASE_LOCAL}/api/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        medicineId: targetBatch.medicineId,
        batchId: targetBatch.id,
        quantityDelta: 5,
        transactionType: 'PHYSICAL_COUNT',
        notes: 'Annual recount surplus verification',
        performedByUserId: 'u-1',
      }),
    });
    expect(adjRes.status).toBe(200);
    const adjData = await adjRes.json();
    expect(adjData.success).toBe(true);

    const checkRes = await fetch(`${BASE_LOCAL}/api/batches`);
    const checkData = await checkRes.json();
    const verifiedBatch = checkData.data.find((b: any) => b.id === targetBatch.id);
    expect(verifiedBatch.currentQuantity).toBe(initialBatchQty + 5);
  });
});

describe('6. Reports, Fleet Directory & Audit Logs', () => {
  it('GET /api/dashboard returns active KPIs and sales trends', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/dashboard`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.todayRevenue).toBeDefined();
    expect(data.data.lowStockCount).toBeDefined();
  });

  it('GET /api/reports/profit returns profit margins and COGS breakdown', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/reports/profit`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.totalRevenue).toBeDefined();
    expect(data.data.grossProfit).toBeDefined();
  });

  it('GET /api/fleet/pharmacies returns nationwide registered directory', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/fleet/pharmacies`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(7);
    expect(data.stats.totalRegistered).toBeGreaterThanOrEqual(7);
  });

  it('GET /api/audit-logs returns immutable institutional audit trail', async () => {
    const res = await fetch(`${BASE_LOCAL}/api/audit-logs`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });
});

describe('7. Live Production (Vercel) Smoke Tests', () => {
  it('Live Production /api/users returns 5 pre-seeded staff accounts', async () => {
    const res = await fetch(`${BASE_PROD}/api/users`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(5);
  });

  it('Live Production authenticates Muna Ahmed (PHARMACIST)', async () => {
    const res = await fetch(`${BASE_PROD}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'munaa7536@gmail.com', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Muna Ahmed');
    expect(data.data.role).toBe('PHARMACIST');
  });

  it('Live Production authenticates Dr. Alemu Tadesse (STORE_OWNER)', async () => {
    const res = await fetch(`${BASE_PROD}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@kaziniya.com', password: 'Admin#2026' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('STORE_OWNER');
  });

  it('Live Production authenticates Atronos Sisay (SUPER_ADMIN)', async () => {
    const res = await fetch(`${BASE_PROD}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'athronos21@gmail.com', password: '12242144' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('SUPER_ADMIN');
  });
});
