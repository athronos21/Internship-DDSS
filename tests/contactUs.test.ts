import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';
import { seedInitialBetterAuthUsers } from '../src/server/auth';

describe('Public Contact Us & Pharmacist Consultation Inquiries', () => {
  let serverInstance: Server;
  const TEST_PORT = 5594;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  let storeOwnerToken: string;
  let pharmacistToken: string;
  let createdInquiryId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialBetterAuthUsers();
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    // Login Store Owner (kaziniya@kaziniya.com)
    const ownerRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'kaziniya@kaziniya.com',
        password: 'Password123!',
      }),
    });
    const ownerData = await ownerRes.json();
    storeOwnerToken = ownerData.token;

    // Login Pharmacist (monet@kaziniya.com)
    const pharmRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'monet@kaziniya.com',
        password: 'Password123!',
      }),
    });
    const pharmData = await pharmRes.json();
    pharmacistToken = pharmData.token;
  });

  afterAll((done) => {
    if (serverInstance) {
      serverInstance.close(() => done());
    } else {
      done();
    }
  });

  it('rejects POST /api/contact with missing required fields with 400', async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Selam' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('successfully receives public contact inquiry with 201 without auth and persists in db', async () => {
    const res = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dawit Bekele',
        contact: '+251 911 889 900',
        subject: 'Prescription Inquiry',
        message: 'Do you have Augmentin 625mg in stock at the Bole branch?',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.inquiryId).toBeDefined();
    createdInquiryId = body.inquiryId;

    // Verify persistence in audit log
    const logged = db.auditLogs.find((l) => l.entityId === body.inquiryId);
    expect(logged).toBeDefined();
    expect(logged?.action).toBe('CUSTOMER_INQUIRY_RECEIVED');
    expect(logged?.userName).toBe('Dawit Bekele');

    // Verify persistence in contactInquiries list
    const inq = db.getContactInquiries().find((i) => i.id === body.inquiryId);
    expect(inq).toBeDefined();
    expect(inq?.status).toBe('UNREAD');
    expect(inq?.message).toContain('Augmentin');
  });

  it('rejects unauthenticated GET /api/contact/inquiries with 401', async () => {
    const res = await fetch(`${baseUrl}/api/contact/inquiries`);
    expect(res.status).toBe(401);
  });

  it('rejects unauthorized PHARMACIST role on GET /api/contact/inquiries with 403', async () => {
    const res = await fetch(`${baseUrl}/api/contact/inquiries`, {
      headers: { Authorization: `Bearer ${pharmacistToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('allows authenticated STORE_OWNER to list all contact inquiries via GET /api/contact/inquiries', async () => {
    const res = await fetch(`${baseUrl}/api/contact/inquiries`, {
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.some((i: any) => i.id === createdInquiryId)).toBe(true);
  });

  it('allows STORE_OWNER to update inquiry status and reply notes via PATCH /api/contact/inquiries/:id', async () => {
    const res = await fetch(`${baseUrl}/api/contact/inquiries/${createdInquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storeOwnerToken}`,
      },
      body: JSON.stringify({
        status: 'REPLIED',
        replyNotes: 'Patient contacted via phone; confirmed Augmentin is in stock at Bole.',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('REPLIED');
    expect(body.data.replyNotes).toContain('confirmed Augmentin');
    expect(body.data.repliedAt).toBeDefined();

    // Verify update in db
    const updated = db.getContactInquiries().find((i) => i.id === createdInquiryId);
    expect(updated?.status).toBe('REPLIED');
  });

  it('reflects unread customer inquiries in GET /api/notifications/alerts', async () => {
    // Add a fresh unread inquiry
    const newInq = db.addContactInquiry({
      name: 'Aster Bedaso',
      contact: 'aster@gmail.com',
      subject: 'Store Hours',
      message: 'Are you open on Sunday evening for emergency prescriptions?',
    });

    const res = await fetch(`${baseUrl}/api/notifications/alerts`, {
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.inquiriesCount).toBeGreaterThan(0);

    const inquiryAlert = body.data.alerts.find((a: any) => a.category === 'CUSTOMER_INQUIRY');
    expect(inquiryAlert).toBeDefined();
    expect(inquiryAlert.actionTarget).toBe('inquiries');

    // Clean up test inquiry
    db.deleteContactInquiry(newInq.id);
  });

  it('allows STORE_OWNER to delete an inquiry via DELETE /api/contact/inquiries/:id', async () => {
    const res = await fetch(`${baseUrl}/api/contact/inquiries/${createdInquiryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${storeOwnerToken}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // Verify gone
    const inq = db.getContactInquiries().find((i) => i.id === createdInquiryId);
    expect(inq).toBeUndefined();
  });
});

