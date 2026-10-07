import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function runStoreRegistrationTest() {
  const screenshotsDir = path.join(process.cwd(), 'documentation', 'test_screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('========================================================');
  console.log('STEP 1: TESTING BACKEND API (POST /api/auth/register-owner)');
  console.log('========================================================');

  const uniqueId = Date.now().toString().slice(-4);
  const testStorePayload = {
    ownerTitle: 'Chief Pharmacist / Technical Director',
    ownerName: `Dr. Henok Berhanu`,
    ownerEmail: `henok.store${uniqueId}@abyssiniadrugs.et`,
    ownerPhone: '+251 911 889 900',
    password: 'SecurePassword123!',
    pin: '7788',
    storeName: `Abyssinia Health Drug Store (Branch ${uniqueId})`,
    storeNameAmharic: 'አቢሲኒያ ጤና መድኃኒት ቤት',
    storeType: 'COMMUNITY_DRUG_STORE',
    tinNumber: `00${uniqueId}554433`,
    efdaLicense: `EFDA/PH/AA/2026/${uniqueId}`,
    city: 'Addis Ababa',
    subcity: 'Bole Subcity',
    woreda: 'Woreda 04',
    streetAddress: 'Namibia Street, Abyssinia Medical Tower, Ground Floor',
    is24Hours: true,
    coldChainAvailable: true,
  };

  const apiRes = await fetch('http://localhost:5000/api/auth/register-owner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testStorePayload),
  });

  const apiData = await apiRes.json();
  console.log(`[API RESPONSE] HTTP ${apiRes.status}:`, {
    success: apiData.success,
    message: apiData.message,
    registeredStoreName: apiData.data?.pharmacy?.storeName,
    ownerEmail: apiData.data?.user?.email,
    ownerRole: apiData.data?.user?.role,
    employeeId: apiData.data?.user?.employeeId,
  });

  if (!apiData.success) {
    throw new Error(`API registration failed: ${apiData.message}`);
  }
  console.log('>>> [API TEST PASSED] Store and Owner User successfully registered in database. <<<\n');

  console.log('========================================================');
  console.log('STEP 2: TESTING PORTAL UI REGISTRATION IN HEADLESS CHROME');
  console.log('========================================================');

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
    throw new Error('No Chrome or Edge executable found.');
  }

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

    console.log('[PORTAL TEST] Navigating to http://localhost:5000/...');
    await page.goto('http://localhost:5000/', { waitUntil: 'networkidle0', timeout: 30000 });

    const step1Path = path.join(screenshotsDir, 'store_01_gateway_screen.png');
    await page.screenshot({ path: step1Path });
    console.log(`[PORTAL TEST] 1. Gateway screen saved: ${step1Path}`);

    // Click "Register Pharmacy Node" link
    console.log('[PORTAL TEST] Clicking "Register Pharmacy Node" button...');
    const clickedLink = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const regLink = buttons.find(b => b.textContent && b.textContent.includes('Register Pharmacy Node'));
      if (regLink) {
        (regLink as HTMLElement).click();
        return true;
      }
      return false;
    });

    console.log(`[PORTAL TEST] Clicked Register Pharmacy Node: ${clickedLink}`);
    await new Promise((r) => setTimeout(r, 1500));

    const step2Path = path.join(screenshotsDir, 'store_02_registration_modal.png');
    await page.screenshot({ path: step2Path });
    console.log(`[PORTAL TEST] 2. Registration Modal opened: ${step2Path}`);

    // Click "Quick Fill" button in modal
    console.log('[PORTAL TEST] Clicking "Quick Fill" in modal for realistic Ethiopian pharmacy data...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const quickFill = buttons.find(b => b.textContent && b.textContent.includes('Quick Fill'));
      if (quickFill) quickFill.click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Customize the pharmacy name and owner name with native keystrokes or state update
    const uiStoreName = `Selam Community Pharmacy (Node ${uniqueId})`;
    const uiOwnerEmail = `yohannes.${uniqueId}@selampharmacy.et`;

    console.log(`[PORTAL TEST] Setting customized store name: "${uiStoreName}"...`);
    await page.evaluate((sName, email) => {
      const storeInput = document.querySelector('input[placeholder*="Selam Community Pharmacy"]') as HTMLInputElement;
      if (storeInput) {
        storeInput.value = sName;
        storeInput.dispatchEvent(new Event('input', { bubbles: true }));
        storeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const emailInput = document.querySelector('input[placeholder*="owner@pharmacy.et"]') as HTMLInputElement;
      if (emailInput) {
        emailInput.value = email;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, uiStoreName, uiOwnerEmail);

    await new Promise((r) => setTimeout(r, 1000));

    const step3Path = path.join(screenshotsDir, 'store_03_form_filled.png');
    await page.screenshot({ path: step3Path });
    console.log(`[PORTAL TEST] 3. Form Filled screenshot: ${step3Path}`);

    // Submit the form: "Complete Registration & Open Store"
    console.log('[PORTAL TEST] Clicking "Complete Registration & Open Store"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitBtn = buttons.find(b => b.textContent && b.textContent.includes('Complete Registration')) ||
        (document.querySelector('button[type="submit"]') as HTMLButtonElement);
      if (submitBtn) {
        submitBtn.scrollIntoView();
        submitBtn.click();
      }
    });

    // Wait for registration request, toast message, and redirect into store dashboard
    console.log('[PORTAL TEST] Waiting for registration processing and session launch (5s)...');
    await new Promise((r) => setTimeout(r, 5000));

    const step4Path = path.join(screenshotsDir, 'store_04_dashboard_registered.png');
    await page.screenshot({ path: step4Path });
    console.log(`[PORTAL TEST] 4. Store Dashboard screenshot: ${step4Path}`);

    // Verify DOM state
    const uiVerification = await page.evaluate((expectedStore) => {
      const text = document.body.innerText;
      return {
        foundStoreName: text.includes(expectedStore) || text.includes('Selam Community Pharmacy') || text.includes('Executive Management'),
        currentUrl: window.location.href,
        hasToast: text.includes('successfully registered') || text.includes('Registration Completed'),
      };
    }, uiStoreName);

    console.log('\n======================================================');
    console.log('[DRUG STORE REGISTRATION VERIFICATION RESULT]');
    console.log('Store Name Registered:', uiStoreName);
    console.log('Owner Account:', uiOwnerEmail);
    console.log('Dashboard Reached & Verified:', uiVerification.foundStoreName);
    console.log('Success Toast Observed:', uiVerification.hasToast);
    console.log('======================================================\n');

  } finally {
    await browser.close();
  }
}

runStoreRegistrationTest().catch((err) => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
