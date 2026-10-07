import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function runPortalRegistrationTest() {
  const screenshotsDir = path.join(process.cwd(), 'documentation', 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePaths = [
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];

  let executablePath = '';
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }

  if (!executablePath) {
    throw new Error('No Chrome or Edge executable found on system.');
  }

  console.log(`[TEST] Using browser: ${executablePath}`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1400,900',
    ],
    defaultViewport: { width: 1400, height: 900 },
  });

  try {
    const page = await browser.newPage();

    console.log('[TEST] Navigating to http://localhost:5000/...');
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle0', timeout: 30000 });

    const step1Path = path.join(screenshotsDir, '01_portal_gateway.png');
    await page.screenshot({ path: step1Path });
    console.log(`[TEST] 1. Gateway screenshot saved: ${step1Path}`);

    // Check if on login page
    const isLoginPage = await page.evaluate(() => {
      return !!document.querySelector('input[type="email"]') || document.body.innerText.includes('Active Staff Badges');
    });

    if (isLoginPage) {
      console.log('[TEST] Switching to Active Staff Badges...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const badgeBtn = buttons.find(b => b.innerText.includes('Active Staff Badges'));
        if (badgeBtn) badgeBtn.click();
      });

      await new Promise((r) => setTimeout(r, 800));

      console.log('[TEST] Clicking Dr. Alemu Tadesse badge to launch session...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const alemu = buttons.find(b => b.innerText.includes('Dr. Alemu Tadesse') || b.innerText.includes('Robel'));
        if (alemu) alemu.click();
      });

      await new Promise((r) => setTimeout(r, 2000));
    }

    const step2Path = path.join(screenshotsDir, '02_portal_dashboard.png');
    await page.screenshot({ path: step2Path });
    console.log(`[TEST] 2. Dashboard screenshot saved: ${step2Path}`);

    // Click "Manage Inventory" button to open Inventory View
    console.log('[TEST] Clicking "Manage Inventory" button on dashboard...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const manageBtn = buttons.find(b => b.innerText.includes('Manage Inventory'));
      if (manageBtn) manageBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));

    const step3Path = path.join(screenshotsDir, '03_inventory_view.png');
    await page.screenshot({ path: step3Path });
    console.log(`[TEST] 3. Inventory View screenshot saved: ${step3Path}`);

    // Click "+ Add Product" button
    console.log('[TEST] Clicking "+ Add Product" button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.innerText.trim().includes('Add Product'));
      if (addBtn) addBtn.click();
    });

    await new Promise((r) => setTimeout(r, 2000));

    // Switch to manual registration form
    console.log('[TEST] Switching to "2. Manual Product Registration Form"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const manualBtn = buttons.find(b => b.innerText.includes('Manual Product Registration'));
      if (manualBtn) manualBtn.click();
    });

    await new Promise((r) => setTimeout(r, 1000));

    const uniqueSuffix = Date.now().toString().slice(-4);
    const testMedName = `Azithromycin 500mg Tablet (KZ-${uniqueSuffix})`;
    const testGeneric = 'Azithromycin Dihydrate USP';

    console.log(`[TEST] Typing Brand Name="${testMedName}" using native keyboard...`);
    const brandSelector = 'input[placeholder*="Paracetamol 500mg"]';
    await page.waitForSelector(brandSelector);
    await page.click(brandSelector);
    await page.type(brandSelector, testMedName, { delay: 20 });

    console.log(`[TEST] Typing Generic Name="${testGeneric}" using native keyboard...`);
    const genericSelector = 'input[placeholder*="Amoxicillin Trihydrate"]';
    await page.waitForSelector(genericSelector);
    await page.click(genericSelector);
    await page.type(genericSelector, testGeneric, { delay: 20 });

    await new Promise((r) => setTimeout(r, 800));

    const step5Path = path.join(screenshotsDir, '05_form_filled_ready.png');
    await page.screenshot({ path: step5Path });
    console.log(`[TEST] Form screenshot saved: ${step5Path}`);

    // Submit the form by clicking "Save Product & Add to Stock"
    console.log('[TEST] Submitting medicine registration form via Save Product button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const saveBtn = buttons.find(b => b.innerText.includes('Save Product') || b.innerText.includes('Save Medicine')) ||
        (document.querySelector('button[type="submit"]') as HTMLButtonElement);
      if (saveBtn) {
        saveBtn.scrollIntoView();
        saveBtn.click();
      }
    });

    // Wait for submission response, toast message, and redirection back to inventory table
    console.log('[TEST] Waiting for submission response and UI redirect (5s)...');
    await new Promise((r) => setTimeout(r, 5000));

    const step6Path = path.join(screenshotsDir, '06_submission_success.png');
    await page.screenshot({ path: step6Path });
    console.log(`[TEST] Post-submission screenshot saved: ${step6Path}`);

    // Search for the newly added medicine in the inventory table using native typing
    console.log(`[TEST] Searching for registered medicine "Azithromycin" in inventory table...`);
    const searchSelector = 'input[placeholder*="Search"]';
    const hasSearch = await page.$(searchSelector);
    if (hasSearch) {
      await page.click(searchSelector);
      await page.type(searchSelector, 'Azithromycin', { delay: 30 });
    } else {
      await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const s = inputs.find(i => (i.placeholder || '').toLowerCase().includes('search'));
        if (s) {
          s.value = 'Azithromycin';
          s.dispatchEvent(new Event('input', { bubbles: true }));
          s.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }

    await new Promise((r) => setTimeout(r, 2000));

    const step7Path = path.join(screenshotsDir, '07_inventory_search_verified.png');
    await page.screenshot({ path: step7Path });
    console.log(`[TEST] 7. Verified in inventory table screenshot saved: ${step7Path}`);

    // Verification check in DOM
    const verifyData = await page.evaluate((name) => {
      const pageText = document.body.innerText;
      return {
        foundMedicineInDOM: pageText.includes('Azithromycin'),
        hasSpecificName: pageText.includes(name),
        allMedicinesBadge: pageText.match(/All Medicines \((\d+)\)/)?.[0] || 'N/A',
      };
    }, testMedName);

    console.log('\n======================================================');
    console.log('PORTAL TEST EXECUTION SUMMARY:');
    console.log('Medicine Registered:', testMedName);
    console.log('Generic Name:', testGeneric);
    console.log('Found in Portal Table:', verifyData.foundMedicineInDOM);
    console.log('Found Exact Name in Table:', verifyData.hasSpecificName);
    console.log('Total Medicines Badge:', verifyData.allMedicinesBadge);
    console.log('======================================================\n');

  } finally {
    await browser.close();
  }
}

runPortalRegistrationTest().catch((err) => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
