import { Router } from 'express';
import { db } from '../db.js';
import { SalesRepository } from '../db/repositories/sales.repository.js';

export const financeRouter = Router();

// DASHBOARD KPIS & ANALYTICS
financeRouter.get('/dashboard', (req, res) => {
  try {
    const summary = SalesRepository.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PROFIT AND SALES REPORTS
financeRouter.get('/reports/profit', (req, res) => {
  try {
    const report = SalesRepository.getProfitReport();
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

financeRouter.get('/reports/sales', (req, res) => {
  res.json({ success: true, data: db.sales });
});

financeRouter.get('/reports/stock-movement', (req, res) => {
  res.json({ success: true, data: db.inventoryTransactions });
});

// ACADEMIC INTERNSHIP REPORT (.DOCX) DOWNLOAD ENDPOINT
financeRouter.get('/reports/internship-docx', async (req, res) => {
  try {
    const { generateInternshipDocx } = await import('../../../scripts/generate_docx_report.js');
    const buffer = await generateInternshipDocx();
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
    recordedBy: 'Dr. Alemu Tadesse',
  },
  {
    id: 'exp-02',
    category: 'Rent',
    amount: 35000,
    description: 'Monthly Pharmacy Facility Rent (Bole Medhanealem Road)',
    paidTo: 'Bole Commercial Property LLC',
    paymentMethod: 'CBE_TRANSFER',
    date: '2026-08-01',
    recordedBy: 'Dr. Alemu Tadesse',
  },
];

financeRouter.get('/expenses', (req, res) => {
  res.json({ success: true, data: inMemoryExpenses });
});

financeRouter.post('/expenses', (req, res) => {
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
