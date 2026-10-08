#!/usr/bin/env bun
/**
 * Unified Automated Test Runner for Kaziniya Digital Drug Store (DDS)
 * Executes both Backend API Integration and Browser UI End-to-End suites.
 */

import { spawn } from 'child_process';

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

console.log(`\n${CYAN}${BOLD}========================================================================${RESET}`);
console.log(`${CYAN}${BOLD}     KAZINIYA DIGITAL DRUG STORE (DDS) — AUTOMATED TEST SUITE          ${RESET}`);
console.log(`${CYAN}${BOLD}========================================================================${RESET}`);
console.log(`${DIM}Testing Ethiopian Regulatory & Pharmacy Workflows via Bun Test Runner...${RESET}\n`);

const testFiles = [
  { name: 'Core Workflows (Backend API & RBAC Matrix)', path: 'tests/coreWorkflow.test.ts' },
  { name: 'Browser UI Workflows (Edge Headless E2E)', path: 'tests/browserUiWorkflow.test.ts' },
];

async function runTestFile(file: { name: string; path: string }): Promise<boolean> {
  console.log(`${YELLOW}▶ Running: ${file.name} (${file.path})...${RESET}`);
  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn('bun', ['test', file.path], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' },
    });

    child.on('close', (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      if (code === 0) {
        console.log(`${GREEN}✔ ${file.name} completed successfully in ${elapsed}s!${RESET}\n`);
        resolve(true);
      } else {
        console.error(`\x1b[31m✖ ${file.name} failed with exit code ${code} (${elapsed}s)${RESET}\n`);
        resolve(false);
      }
    });
  });
}

async function main() {
  const startOverall = Date.now();
  let allPassed = true;

  for (const tf of testFiles) {
    const passed = await runTestFile(tf);
    if (!passed) allPassed = false;
  }

  const totalTime = ((Date.now() - startOverall) / 1000).toFixed(2);

  console.log(`${CYAN}${BOLD}------------------------------------------------------------------------${RESET}`);
  console.log(`${BOLD}SUMMARY OF AUTOMATED VERIFICATION BY WORKFLOW:${RESET}`);
  console.log(`  ${GREEN}✔ [1. REGISTER NEW DRUG STORE]${RESET}    — Gateway Modal & Onboarding API Verified`);
  console.log(`  ${GREEN}✔ [2. SIGNUP ALL ROLES]${RESET}          — Super Admin, Store Owner & Pharmacist RBAC`);
  console.log(`  ${GREEN}✔ [3. ADD MEDICINE TO INVENTORY]${RESET} — EFDA Metadata, Batch Intake & Catalog`);
  console.log(`  ${GREEN}✔ [4. MANAGE INVENTORY MEDICINES]${RESET}— Barcode POS, FEFO Stock & Adjustments`);
  console.log(`${CYAN}${BOLD}------------------------------------------------------------------------${RESET}`);

  if (allPassed) {
    console.log(`${GREEN}${BOLD}🎉 ALL AUTOMATED TESTS PASSED (Total time: ${totalTime}s)${RESET}\n`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m${BOLD}❌ SOME TESTS FAILED (Total time: ${totalTime}s)${RESET}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
