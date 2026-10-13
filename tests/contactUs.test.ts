import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import { startServer } from '../server';
import { db } from '../src/server/db';

describe('Public Contact Us & Pharmacist Consultation Inquiries', () => {
  let serverInstance: Server;
  const TEST_PORT = 5594;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
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

  it('successfully receives public contact inquiry with 201 without auth', async () => {
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

    // Verify persistence in audit log
    const logged = db.auditLogs.find((l) => l.entityId === body.inquiryId);
    expect(logged).toBeDefined();
    expect(logged?.action).toBe('CUSTOMER_INQUIRY_RECEIVED');
    expect(logged?.userName).toBe('Dawit Bekele');
  });
});
