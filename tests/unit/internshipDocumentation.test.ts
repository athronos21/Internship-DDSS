import { describe, it, expect } from 'bun:test';
import fs from 'fs';
import path from 'path';

describe('Official Internship Documentation & Academic Report Suite', () => {
  it('1. Verifies official docx, pdf, and latex zip report files exist in public directory', () => {
    const docxPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');
    const legacyDocxPath = path.join(process.cwd(), 'public', 'Internship_Report_Digital_Drug_Store.docx');
    const pdfPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.pdf');
    const zipPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report_Overleaf.zip');

    expect(fs.existsSync(docxPath)).toBe(true);
    expect(fs.existsSync(legacyDocxPath)).toBe(true);
    expect(fs.existsSync(pdfPath)).toBe(true);
    expect(fs.existsSync(zipPath)).toBe(true);

    const docxSize = fs.statSync(docxPath).size;
    const legacySize = fs.statSync(legacyDocxPath).size;
    const pdfSize = fs.statSync(pdfPath).size;
    const zipSize = fs.statSync(zipPath).size;

    // Must be real files (> 500 KB), not empty or tiny placeholders
    expect(docxSize).toBeGreaterThan(500000);
    expect(legacySize).toBeGreaterThan(500000);
    expect(pdfSize).toBeGreaterThan(500000);
    expect(zipSize).toBeGreaterThan(1000000);
  });

  it('2. Verifies InternshipReportModal source contains authentic academic attribution', () => {
    const modalPath = path.join(process.cwd(), 'src', 'components', 'common', 'InternshipReportModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Authors
    expect(content).toContain('Atronos Sisay');
    expect(content).toContain('0761/16');
    expect(content).toContain('Beka Girma');
    expect(content).toContain('0821/16');

    // Academic & Company
    expect(content).toContain('Haramaya University');
    expect(content).toContain('College of Computing and Informatics');
    expect(content).toContain('Department of Information Technology');
    expect(content).toContain('Kaziniya Drug Store');
    expect(content).toContain('Monet Alemayehu');
    expect(content).toContain('Mr. Nabyom Sh.');

    // Title
    expect(content).toContain('Digital Drug Store (DDS) Full Pharmaceutical Inventory Management Platform (PIMS)');
  });

  it('3. Verifies navigation access points wired to open documentation modal across web app', () => {
    const gatewayPath = path.join(process.cwd(), 'src', 'components', 'public', 'DDSGatewayPage.tsx');
    const headerPath = path.join(process.cwd(), 'src', 'components', 'public', 'Header.tsx');
    const footerPath = path.join(process.cwd(), 'src', 'components', 'public', 'Footer.tsx');
    const dashboardPath = path.join(process.cwd(), 'src', 'components', 'dashboard', 'DashboardLayout.tsx');
    const appPath = path.join(process.cwd(), 'src', 'App.tsx');

    expect(fs.readFileSync(gatewayPath, 'utf-8')).toContain('onOpenDocumentation');
    expect(fs.readFileSync(headerPath, 'utf-8')).toContain('onOpenDocumentation');
    expect(fs.readFileSync(footerPath, 'utf-8')).toContain('onOpenDocumentation');
    expect(fs.readFileSync(dashboardPath, 'utf-8')).toContain('onOpenDocumentation');
    expect(fs.readFileSync(appPath, 'utf-8')).toContain('isInternshipModalOpen');
  });

  it('4. Verifies finance endpoint serves the complete official report docx file', async () => {
    const routesPath = path.join(process.cwd(), 'src', 'server', 'routes', 'finance.routes.ts');
    const content = fs.readFileSync(routesPath, 'utf-8');
    expect(content).toContain('/reports/internship-docx');
    expect(content).toContain('Internship Report – Digital Drug Store (DDS) Pharmaceutical Inventory Management Platform.docx');
  });
});
