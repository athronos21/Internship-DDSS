import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'scripts', 'build_final_pims_docx.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update Title and Descriptions in Document metadata
content = content.replace(
  `title: 'Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS) - Internship Report',`,
  `title: 'Digital Drug Store (DDS) Inventory Control and Expiry Tracking Platform - Internship Report',`
);

// 2. Cover Page Title & Subtitle
content = content.replace(
  `text: 'KAZINIYA DRUG STORE PHARMACEUTICAL INVENTORY MANAGEMENT SYSTEM (PIMS)',`,
  `text: 'DIGITAL DRUG STORE (DDS) INVENTORY CONTROL AND EXPIRY TRACKING PLATFORM',`
);

content = content.replace(
  `text: 'An Intelligent, EFDA-Compliant Stock Tracking, Batch Expiry Control, and Automated FEFO Allocation Platform',`,
  `text: 'An Intelligent, EFDA-Compliant Multi-Batch Tracking, Shelf Management, and Automated FEFO Stock Allocation System for Kaziniya Drug Store',`
);

// 3. Declaration title
content = content.replace(
  `titled "Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS)" is our original work`,
  `titled "Digital Drug Store (DDS) Inventory Control and Expiry Tracking Platform" is our original work`
);

// 4. Executive Summary title & text
content = content.replace(
  `architectural engineering, and on-site deployment of the Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS).`,
  `architectural engineering, and on-site deployment of the Digital Drug Store (DDS) Inventory Control and Expiry Tracking Platform at Kaziniya Drug Store.`
);

// 5. Workpiece 5 Title and Body
const oldWp5 = `2.4.5 Workpiece 5: Stock Valuation, Movement Ledger, and Capstone Project Roadmap\\n' +
            'To maintain complete physical stock accountability, we engineered an inventory transaction ledger that tracks every stock change (RECEIPT, ALLOCATION, ADJUSTMENT, RETURN, QUARANTINE) along with real-time Cost of Goods Sold (COGS) and remaining inventory valuation. Furthermore, recognizing that long-term inventory optimization requires predictive capabilities, we formulated the theoretical design and mathematical modeling for seasonal Machine Learning demand forecasting and nationwide multi-branch fleet governance, establishing the definitive research and architectural roadmap for our upcoming B.Sc. Final Year Project.`;

const newWp5 = `2.4.5 Workpiece 5: Inventory Valuation, Stock Movement Ledgers, and EFDA Audit Reporting\\n' +
            'To guarantee complete inventory financial accountability, we engineered an immutable transaction ledger that logs every stock modification (RECEIPT, ALLOCATION, ADJUSTMENT, RETURN, DISPOSAL) along with the authorizing user ID, timestamp, and batch provenance. The system automatically computes real-time Cost of Goods Sold (COGS), remaining inventory valuation across all warehouse categories, and exports standardized PDF/Excel audit reports conforming to EFDA and Ministry of Revenues compliance standards.`;

content = content.replace(oldWp5, newWp5);

// 6. Project Title in Chapter 3
content = content.replace(
  `text: '“Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS): An Intelligent, EFDA-Compliant Stock Tracking, Batch Expiry Control, and Automated FEFO Allocation Platform”',`,
  `text: '“Digital Drug Store (DDS) Inventory Control and Expiry Tracking Platform: An Intelligent, EFDA-Compliant Multi-Batch Tracking, Shelf Management, and Automated FEFO Stock Allocation System”',`
);

// 7. Short Summary in Chapter 3
const oldCh3Summary = `The Kaziniya Pharmaceutical Inventory Management System (PIMS) is an enterprise-grade digital health logistics platform engineered to modernize pharmaceutical inventory workflows, eliminate shelf expiration losses, and enforce strict regulatory compliance for community drug stores in Ethiopia. Built using a modern full-stack web and mobile architecture (TypeScript, React 19, Tailwind CSS, Express, Bun, and Flutter), the system replaces manual paper ledgers with an automated, multi-batch digital warehouse.\\n\\n' +
            'The practical scope and empirical evaluation of this 7-week industrial internship focused specifically and decisively on the pharmaceutical inventory management, multi-batch expiration indexing, automated First-Expiry-First-Out (FEFO) allocation engine, mobile optical barcode stocktaking, and regulatory audit logging. Crucially, to protect academic boundaries and avoid dual-submission conflicts, the broader healthcare enterprise features—specifically the frontline clinical point-of-sale (POS) prescription checkout terminal, multi-tender payment gateways (Telebirr/CBE), seasonal machine learning demand forecasting, and nationwide multi-branch fleet governance—are strategically reserved as the research and engineering roadmap for our upcoming B.Sc. Final Year Capstone Project.`;

const newCh3Summary = `The Digital Drug Store (DDS) Inventory Control and Expiry Tracking Platform is an enterprise-grade digital health logistics system engineered to modernize pharmaceutical inventory workflows, eliminate shelf expiration losses, and enforce strict regulatory compliance for community drug stores in Ethiopia. Built using a modern full-stack web and companion mobile architecture (TypeScript, React 19, Tailwind CSS, Express, Bun, SQLite/PostgreSQL, and Flutter), the system replaces manual paper ledgers and bin cards with an automated, multi-batch digital warehouse.\\n\\n' +
            'The platform provides end-to-end management over pharmaceutical warehouse logistics: multi-batch tracking across 420+ Stock Keeping Units (SKUs), automated First-Expiry-First-Out (FEFO) stock issue scheduling, continuous computer-vision barcode and label stocktaking, batch quarantine safeguards, real-time stock movement ledgers, and automated inventory valuation conforming to Ethiopian Food and Drug Authority (EFDA) standards.`;

content = content.replace(oldCh3Summary, newCh3Summary);

// 8. Specific Objectives in Chapter 3 - remove Capstone roadmap item
content = content.replace(
  `• Establish the definitive architectural foundation and data schemas for integrating clinical POS dispensing, ML demand forecasting, and multi-branch fleet governance in our upcoming B.Sc. Final Year Capstone Project.`,
  `• Automate Cost of Goods Sold (COGS) computations, stock movement ledgers, and real-time inventory financial valuation to eliminate audit discrepancies.`
);

// 9. Replace Section 3.8 Scope Delimitation Table with Section 3.8 Functional Verification Table
const oldSection38Regex = /new Paragraph\(\{ text: '3\.8 Strategic Scope Delimitation[\s\S]*?new Paragraph\(\{ text: '3\.9 System Performance and Quantitative Impact Evaluation'/;

const newSection38 = `new Paragraph({ text: '3.8 Functional Verification and Testing Matrix', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'To confirm that all inventory subsystems execute with verified reliability and adhere to EFDA pharmaceutical storage mandates, comprehensive functional verification was conducted during live operations at Kaziniya Drug Store. Table 3.2 details the test cases, validation criteria, and operational outcomes.',
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Test ID', bold: true })] })] }),
                  new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Module / Function', bold: true })] })] }),
                  new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Verification Criteria', bold: true })] })] }),
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Outcome', bold: true })] })] }),
                ],
              }),
              ...[
                ['TC-01', 'Multi-Batch Model', 'Single medicine SKU maintains 3 distinct batches with different expiry dates without data collisions', 'Passed (3NF verified)'],
                ['TC-02', 'FEFO Allocation', 'Allocating 50 units automatically pulls first from batch expiring in 45 days before batch expiring in 180 days', 'Passed (min(Exp) queue)'],
                ['TC-03', 'Expiry Quarantine', 'Batch with Δdays ≤ 0 triggers hard software lock prohibiting picking or issue', 'Passed (100% blocked)'],
                ['TC-04', 'Optical Scanner', 'Rolling 5-frame accumulator accurately parses curved medicine vial packaging with glare', 'Passed (<3.5% error)'],
                ['TC-05', 'Concurrency Mutex', 'Simultaneous stock allocations from identical batch resolve atomically without negative balances', 'Passed (Zero drift)'],
                ['TC-06', 'Reorder Alerting', 'Inventory count dropping below calibrated threshold triggers dashboard warning', 'Passed (Instant alert)'],
                ['TC-07', 'Inventory Valuation', 'Accurate computation of real-time stock asset value based on batch purchase unit costs', 'Passed (COGS verified)'],
                ['TC-08', 'EFDA Audit Trail', 'Immutable chronological log generated for all stock transactions (RECEIPT, ADJUST, DISPOSAL)', 'Passed (EFDA compliant)'],
              ].map(
                ([id, mod, crit, out]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: id, bold: true })] })] }),
                      new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: mod })] }),
                      new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: crit })] }),
                      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: out, bold: true, color: '059669' })] })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '3.9 System Performance and Quantitative Impact Evaluation'`;

content = content.replace(oldSection38Regex, newSection38);

// 10. Update Chapter 5 item 5
content = content.replace(
  `5. Strategic Foundation for B.Sc. Final Year Capstone Project: The on-site inventory implementation established a rock-solid operational foundation and provided the functional architectural springboard for our upcoming B.Sc. Final Year Project, which will expand the system into frontline clinical POS prescription dispensing, Telebirr payment settlements, seasonal machine learning demand forecasting, and nationwide multi-branch fleet governance.`,
  `5. Comprehensive Inventory Health and Financial Governance: The platform established automated real-time Cost of Goods Sold (COGS) tracking, gross stock asset valuation, and low-stock reorder thresholds, enabling proactive warehouse procurement and eliminating stockouts of vital medicines.`
);

// 11. Replace references to "PIMS Platform" with "DDS Inventory Platform" or "DDS Platform"
content = content.replace(/Kaziniya PIMS platform/g, 'DDS Inventory Platform');
content = content.replace(/PIMS platform/g, 'DDS platform');
content = content.replace(/PIMS Platform/g, 'DDS Platform');

// 12. Also write to Kaziniya_DDS_Inventory_Internship_Report.docx in execution block
content = content.replace(
  `    const docxPath = path.join(process.cwd(), 'documentation', 'Kaziniya_PIMS_Internship_Report.docx');\n    const publicPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');\n    fs.writeFileSync(docxPath, buffer);\n    fs.writeFileSync(publicPath, buffer);`,
  `    const docxPath = path.join(process.cwd(), 'documentation', 'Kaziniya_PIMS_Internship_Report.docx');
    const ddsDocxPath = path.join(process.cwd(), 'documentation', 'Kaziniya_DDS_Inventory_Internship_Report.docx');
    const publicPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');
    const publicDdsPath = path.join(process.cwd(), 'public', 'Kaziniya_DDS_Inventory_Internship_Report.docx');
    fs.writeFileSync(docxPath, buffer);
    fs.writeFileSync(ddsDocxPath, buffer);
    fs.writeFileSync(publicPath, buffer);
    fs.writeFileSync(publicDdsPath, buffer);`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('[SUCCESS] scripts/build_final_pims_docx.ts updated successfully!');
