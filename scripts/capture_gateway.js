import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

function getBrowserPath() {
  const paths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No compatible browser found');
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5000/?screen=gateway', { waitUntil: 'networkidle0', timeout: 15000 });

  await new Promise(r => setTimeout(r, 1000));

  const outDir = 'C:\\Users\\Nythor\\.gemini\\antigravity-ide\\brain\\2897ee18-b39b-4423-9d47-dd9176a959c5';
  const outPath = path.join(outDir, 'gateway_larger_card_bg.png');
  await page.screenshot({ path: outPath });

  console.log('Screenshot saved to:', outPath);
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
