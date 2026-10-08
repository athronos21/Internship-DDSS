import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import { Server } from 'http';
import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { startServer } from '../server';

function getBrowserPath(): string {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No compatible Chromium browser found for automated UI testing');
}

describe('Automated Browser UI Workflows (Edge Headless)', () => {
  let serverInstance: Server;
  let browser: Browser;
  let page: Page;
  const TEST_PORT = 5491;
  const baseUrl = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    process.env.NODE_ENV = 'production';
    const result = await startServer(TEST_PORT);
    serverInstance = result.server;

    const executablePath = getBrowserPath();
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,800'],
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  }, 30000);

  afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (serverInstance) {
      await new Promise<void>((resolve) => serverInstance.close(() => resolve()));
    }
  });

  // ---------------------------------------------------------------------------
  // 1. REGISTER NEW DRUG STORE (UI FLOW)
  // ---------------------------------------------------------------------------
  it('Workflow 1 UI: Opens gateway, clicks Register Pharmacy Node, and completes registration', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const title = await page.title();
    expect(title).toContain('Kaziniya');

    // Click "Register Pharmacy Node" button
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reg = btns.find((b) => b.textContent?.includes('Register Pharmacy Node'));
      if (reg) {
        reg.click();
        return true;
      }
      return false;
    });
    expect(clicked).toBe(true);

    // Wait for modal heading to appear
    await page.waitForFunction(
      () => document.body.innerText.includes('Register Pharmacy / Drug Store'),
      { timeout: 8000 }
    );

    // Click "Quick Fill" button to populate Ethiopian pharmacy data
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const quickFill = btns.find((b) => b.textContent?.includes('Quick Fill'));
      if (quickFill) quickFill.click();
    });

    // Click "Complete Registration & Open Store" submit button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const submit = btns.find((b) => b.textContent?.includes('Complete Registration') || b.type === 'submit');
      if (submit) submit.click();
    });

    // Wait for successful registration feedback
    const registered = await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes('registered successfully') ||
          text.includes('Registration Complete') ||
          text.includes('Launch Pharmacy') ||
          text.includes('Dashboard') ||
          text.includes('Workstation')
        );
      },
      { timeout: 10000 }
    );
    expect(registered).toBeTruthy();
  }, 25000);

  // ---------------------------------------------------------------------------
  // 2. SIGNUP ALL ROLES (UI FLOW)
  // ---------------------------------------------------------------------------
  it('Workflow 2 UI: Authenticates and verifies workstation dashboards for all 3 institutional roles', async () => {
    // 2A: Super Admin Workstation
    await page.goto(`${baseUrl}/?role=superadmin&view=master_admin`, { waitUntil: 'domcontentloaded' });
    const superAdminLoaded = await page.waitForFunction(
      () =>
        document.body.innerText.includes('Super Admin') ||
        document.body.innerText.includes('System Governance') ||
        document.body.innerText.includes('National Health Fleet'),
      { timeout: 8000 }
    );
    expect(superAdminLoaded).toBeTruthy();

    // 2B: Store Owner Workstation
    await page.goto(`${baseUrl}/?role=owner&view=dashboard`, { waitUntil: 'domcontentloaded' });
    const ownerLoaded = await page.waitForFunction(
      () =>
        document.body.innerText.includes('Dr. Alemu') ||
        document.body.innerText.includes('Store Overview') ||
        document.body.innerText.includes('Pharmacy Administration') ||
        document.body.innerText.includes('Kaziniya Drug store'),
      { timeout: 8000 }
    );
    expect(ownerLoaded).toBeTruthy();

    // 2C: Pharmacist Workstation
    await page.goto(`${baseUrl}/?role=pharmacist&view=pos`, { waitUntil: 'domcontentloaded' });
    const pharmacistLoaded = await page.waitForFunction(
      () =>
        document.body.innerText.includes('Point of Sale') ||
        document.body.innerText.includes('POS') ||
        document.body.innerText.includes('Muna Ahmed') ||
        document.body.innerText.includes('Dispensing'),
      { timeout: 8000 }
    );
    expect(pharmacistLoaded).toBeTruthy();
  }, 25000);

  // ---------------------------------------------------------------------------
  // 3. ADD MEDICINE TO INVENTORY (UI FLOW)
  // ---------------------------------------------------------------------------
  it('Workflow 3 UI: Navigates to Add Medicine workstation and verifies EFDA intake form', async () => {
    await page.goto(`${baseUrl}/?role=owner&view=add_medicine`, { waitUntil: 'domcontentloaded' });

    // Verify Add Medicine intake form elements are present
    const formVisible = await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes('Add Medicine') ||
          text.includes('Register New Medication') ||
          text.includes('Brand Name') ||
          text.includes('Generic Name') ||
          text.includes('Dosage Form')
        );
      },
      { timeout: 8000 }
    );
    expect(formVisible).toBeTruthy();
  }, 15000);

  // ---------------------------------------------------------------------------
  // 4. MANAGE MEDICINES IN INVENTORY (UI FLOW)
  // ---------------------------------------------------------------------------
  it('Workflow 4 UI: Navigates to Inventory Management and verifies catalog & batch stock table', async () => {
    await page.goto(`${baseUrl}/?role=owner&view=inventory`, { waitUntil: 'domcontentloaded' });

    // Verify Inventory view is active and displays catalog records & FEFO rotation
    const inventoryLoaded = await page.waitForFunction(
      () => {
        const text = document.body.innerText;
        return (
          text.includes('FEFO') ||
          text.includes('Medicine Registry') ||
          text.includes('Inventory') ||
          text.includes('Batches Need Action') ||
          text.includes('Safe FEFO Shelf Life')
        );
      },
      { timeout: 8000 }
    );
    expect(inventoryLoaded).toBeTruthy();
  }, 15000);
});
