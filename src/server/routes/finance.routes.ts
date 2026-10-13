import { Router } from 'express';
import { db } from '../db.js';
import { SalesRepository } from '../db/repositories/sales.repository.js';
import { requireRole, AuthenticatedRequest } from '../roleGuard.js';

export const financeRouter = Router();

// DASHBOARD KPIS & ANALYTICS
financeRouter.get('/dashboard', requireRole(['STORE_OWNER', 'SUPER_ADMIN', 'PHARMACIST', 'SUPPLIER']), (req: AuthenticatedRequest, res) => {
  try {
    const summary = SalesRepository.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PROFIT AND SALES REPORTS
financeRouter.get('/reports/profit', requireRole(['STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  try {
    const report = SalesRepository.getProfitReport();
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

financeRouter.get('/reports/sales', requireRole(['STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: db.sales });
});

financeRouter.get('/reports/stock-movement', requireRole(['STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: db.inventoryTransactions });
});

// ACADEMIC INTERNSHIP REPORT (.DOCX) DOWNLOAD ENDPOINT
financeRouter.get('/reports/internship-docx', async (req, res) => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const primaryPath = path.join(process.cwd(), 'documentation', 'Internship Report – Digital Drug Store (DDS) Pharmaceutical Inventory Management Platform.docx');
    const pimsPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');
    const targetPath = fs.existsSync(primaryPath) ? primaryPath : fs.existsSync(pimsPath) ? pimsPath : null;

    if (targetPath) {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Internship_Report_Digital_Drug_Store.docx"'
      );
      return res.send(fs.readFileSync(targetPath));
    }

    const { generatePimsDocx } = await import('../../../scripts/build_final_pims_docx.ts');
    const buffer = await generatePimsDocx();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Internship_Report_Digital_Drug_Store.docx"'
    );
    res.send(buffer);
  } catch (err: any) {
    console.error('Error generating docx report:', err);
    res.status(500).json({ success: false, message: 'Could not generate report' });
  }
});

// EXPENSES & GENERAL LEDGER
const inMemoryExpenses: any[] = [
  {
    id: 'exp-01',
    category: 'Utilities',
    amount: 3500,
    description: 'Dispensary Cold-Chain Electricity & Backup Generator Fuel',
    paidTo: 'Ethiopian Electric Power',
    paymentMethod: 'CBE_TRANSFER',
    date: '2026-08-01',
    recordedBy: 'Kaziniya Ahmed',
  },
  {
    id: 'exp-02',
    category: 'Rent',
    amount: 35000,
    description: 'Monthly Pharmacy Facility Rent (Bole Medhanealem Road)',
    paidTo: 'Bole Commercial Property LLC',
    paymentMethod: 'CBE_TRANSFER',
    date: '2026-08-01',
    recordedBy: 'Kaziniya Ahmed',
  },
];

financeRouter.get('/expenses', requireRole(['STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  res.json({ success: true, data: inMemoryExpenses });
});

financeRouter.post('/expenses', requireRole(['STORE_OWNER', 'SUPER_ADMIN']), (req: AuthenticatedRequest, res) => {
  const { category, amount, description, paidTo, paymentMethod, date } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid expense amount is required' });
  }

  const newExp = {
    id: `exp-${Date.now()}`,
    category: category || 'General Operating',
    amount: Number(amount),
    description: description || '',
    paidTo: paidTo || 'Vendor',
    paymentMethod: paymentMethod || 'CASH',
    date: date || new Date().toISOString().split('T')[0],
    recordedBy: (req.headers['x-user-name'] as string) || 'Dispensary Accountant',
  };

  inMemoryExpenses.unshift(newExp);
  res.status(201).json({ success: true, message: 'Expense recorded successfully', data: newExp });
});
