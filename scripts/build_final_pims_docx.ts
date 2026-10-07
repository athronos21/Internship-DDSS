import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun,
} from 'docx';

export async function generatePimsDocx(): Promise<Buffer> {
  const tableBorderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const tableBorderLight = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const getImg = (relPath: string, width = 500, height = 280) => {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(relPath).toLowerCase();
      const imgType = ext === '.jpg' || ext === '.jpeg' ? 'jpg' : 'png';
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 120 },
        children: [
          new ImageRun({
            data: fs.readFileSync(fullPath),
            transformation: { width, height },
            type: imgType as any,
          }),
        ],
      });
    }
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `[Image: ${relPath}]`, italics: true, color: '94A3B8' })],
    });
  };

  const doc = new Document({
    creator: 'Atronos Sisay & Beka Girma',
    title: 'Digital Drug Store (DDS) Full Pharmaceutical Inventory Management System (PIMS) - Internship Report',
    description: 'B.Sc. in Information Technology Internship Report - Full Inventory Management, Multi-Batch Warehousing, Procurement Pipeline, Automated FEFO Allocation, and Regulatory Auditing - Haramaya University',
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
            color: '0F172A',
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              before: 120,
              after: 120,
            },
          },
        },
        heading1: {
          run: {
            font: 'Times New Roman',
            size: 32, // 16pt
            bold: true,
            color: '1E3A8A', // Deep Navy Blue
          },
          paragraph: {
            spacing: { before: 360, after: 180 },
          },
        },
        heading2: {
          run: {
            font: 'Times New Roman',
            size: 28, // 14pt
            bold: true,
            color: '1E40AF',
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        heading3: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
            bold: true,
            color: '1E293B',
          },
          paragraph: {
            spacing: { before: 180, after: 80 },
          },
        },
      },
    },
    sections: [
      // =========================================================================
      // SECTION 1: COVER PAGE
      // =========================================================================
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: 'HARAMAYA UNIVERSITY, ETHIOPIA',
                bold: true,
                size: 32,
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: 'COLLEGE OF COMPUTING AND INFORMATICS (CCI)',
                bold: true,
                size: 26,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF INFORMATION TECHNOLOGY (IT)',
                bold: true,
                size: 24,
                color: '334155',
              }),
            ],
          }),

          // University Logo
          getImg('documentation/latex_report/figures/universitylogo.png', 110, 110),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 100 },
            children: [
              new TextRun({
                text: 'INTERNSHIP REPORT ON:',
                bold: true,
                size: 24,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'DIGITAL DRUG STORE (DDS) FULL PHARMACEUTICAL INVENTORY MANAGEMENT PLATFORM (PIMS)',
                bold: true,
                size: 28,
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 300 },
            children: [
              new TextRun({
                text: 'An End-to-End, EFDA-Compliant Multi-Batch Warehouse, Supplier Procurement Pipeline, Automated FEFO Allocation, Optical Stocktaking, and Financial Inventory Audit System for Kaziniya Drug Store',
                italics: true,
                size: 22,
                color: '475569',
              }),
            ],
          }),

          // Authors and Supervisors Table
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderNone,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: tableBorderNone,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'SUBMITTED BY:\n', bold: true, color: '1E3A8A' }),
                          new TextRun({ text: '1. Atronos Sisay', bold: true }),
                          new TextRun({ text: '  (ID: 0761/16)\n' }),
                          new TextRun({ text: '2. Beka Girma', bold: true }),
                          new TextRun({ text: '  (ID: 0821/16)\n\n' }),
                          new TextRun({ text: 'Program: ', bold: true }),
                          new TextRun({ text: 'B.Sc. in Information Technology\n' }),
                          new TextRun({ text: 'Department: ', bold: true }),
                          new TextRun({ text: 'Information Technology (IT)\n' }),
                          new TextRun({ text: 'College: ', bold: true }),
                          new TextRun({ text: 'Computing and Informatics (CCI)\n' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: tableBorderNone,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'ACADEMIC & INDUSTRIAL SUPERVISION:\n', bold: true, color: '1E3A8A' }),
                          new TextRun({ text: 'Hosting Organization:\n', bold: true }),
                          new TextRun({ text: 'Kaziniya Drug Store\n\n' }),
                          new TextRun({ text: 'Immediate Supervisor:\n', bold: true }),
                          new TextRun({ text: 'Monet Alemayehu (Immediate Supervisor)\n\n' }),
                          new TextRun({ text: 'Department Advisor:\n', bold: true }),
                          new TextRun({ text: 'Mr. Nabyom Sh. (Lecturer, M.Sc.)\n' }),
                          new TextRun({ text: 'Dept. of Information Technology\n' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 60 },
            children: [
              new TextRun({
                text: 'Internship Period: July 1, 2026 – August 15, 2026',
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({
                text: 'Submission Date: October 2026',
                bold: true,
                size: 22,
                color: '1E3A8A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 100 },
            children: [
              new TextRun({
                text: 'Haramaya, Ethiopia',
                italics: true,
                size: 20,
                color: '64748B',
              }),
            ],
          }),
        ],
      },

      // =========================================================================
      // SECTION 2: PRELIMINARY PAGES (ROMAN NUMERALS)
      // =========================================================================
      {
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Kaziniya Drug Store PIMS — Internship Report | Haramaya University',
                    size: 18,
                    color: '94A3B8',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })],
              }),
            ],
          }),
        },
        children: [
          // DECLARATION
          new Paragraph({
            text: 'DECLARATION AND APPROVAL SHEET',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Students' Declaration\n", bold: true, size: 24 }),
              new TextRun({
                text: 'We, Atronos Sisay (ID: 0761/16) and Beka Girma (ID: 0821/16), hereby declare that this internship report titled "Digital Drug Store (DDS) Full Pharmaceutical Inventory Management System (PIMS)" is our original work carried out during our practical industrial attachment at Kaziniya Drug Store from July 1, 2026 to August 15, 2026. This report has not been submitted previously to this or any other academic institution for any degree, diploma, or certificate. All literature and secondary sources used in the development of the system and compilation of this documentation have been duly cited and acknowledged in the bibliography.\n',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 160, after: 200 },
            children: [
              new TextRun({ text: 'Student 1: Atronos Sisay \t ID: 0761/16 \t Signature: ________________ \t Date: ________, 2026\n' }),
              new TextRun({ text: 'Student 2: Beka Girma   \t ID: 0821/16 \t Signature: ________________ \t Date: ________, 2026\n' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Immediate Industrial Supervisor Approval\n', bold: true, size: 24 }),
              new TextRun({
                text: 'This is to certify that Atronos Sisay (ID: 0761/16) and Beka Girma (ID: 0821/16) have successfully performed and completed their industrial internship at Kaziniya Drug Store under my direct supervision from July 1, 2026 to August 15, 2026. Their contributions toward architecting and implementing the full digital pharmaceutical inventory management suite—including supplier procurement pipelines, goods receipt inspection with EFDA verification, multi-batch warehouse shelf indexing, First-Expiry-First-Out (FEFO) automated allocation safeguards, mobile computer-vision optical barcode stocktaking, inter-branch stock requisitions, and regulatory inventory audit logging—meet the operational and technical excellence standards expected by our organization.\n',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 160, after: 200 },
            children: [
              new TextRun({ text: 'Immediate Supervisor: Monet Alemayehu \t Signature: ________________ \t Stamp / Date: ________\n' }),
              new TextRun({ text: 'Designation: Immediate Supervisor, Kaziniya Drug Store\n' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Academic Department Advisor Approval\n', bold: true, size: 24 }),
              new TextRun({
                text: 'I hereby confirm that I have evaluated this internship report and reviewed the software artifacts produced by the students. The report satisfies the academic criteria, structural completeness, and rigorous technical guidelines set forth by the Department of Information Technology.\n',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 160, after: 300 },
            children: [
              new TextRun({ text: 'Advisor: Mr. Nabyom Sh. (M.Sc.) \t Signature: ________________ \t Date: ________, 2026\n' }),
              new TextRun({ text: 'Designation: Lecturer, Dept. of Information Technology, Haramaya University\n' }),
            ],
          }),

          // EXECUTIVE SUMMARY
          new Paragraph({
            text: 'EXECUTIVE SUMMARY',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The modern healthcare delivery ecosystem in developing nations faces severe operational vulnerabilities arising from fragmented pharmaceutical inventory workflows, reliance on paper ledgers, manual stock audits, and non-compliance with regulatory storage and batch standards. In Ethiopia, community drug stores routinely incur catastrophic economic losses from expired pharmaceutical stock, unmonitored supplier deliveries, and disordered warehouse shelving, while facing severe public health risks from the accidental dispensing of compromised medicines.\n\n' +
                'This internship report documents the conceptualization, full-stack architectural engineering, and on-site deployment of the Digital Drug Store (DDS) Full Pharmaceutical Inventory Management System (PIMS) at Kaziniya Drug Store. Developed during an intensive 7-week industrial placement from July 1, 2026 to August 15, 2026, the platform provides end-to-end digitization across the entire pharmaceutical inventory lifecycle: from supplier procurement and purchase orders to goods receipt inspection, multi-batch shelf indexing, automated FEFO stock issue scheduling, optical camera stocktaking, inter-branch requisitions, and real-time financial inventory valuation compliant with the Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues.\n\n' +
                'The core technical pillars engineered and deployed in this full inventory system comprise:\n\n' +
                '1. Decoupled Multi-Batch Relational Architecture: Formulating a normalized 3NF relational data model that strictly isolates the master medication catalog (420+ active SKUs) from physical inventory batches, tracking individual batch numbers, manufacturing/expiry dates, supplier provenance, unit purchase costs, selling prices, and granular warehouse shelf coordinates.\n\n' +
                '2. Comprehensive Supplier Procurement Pipeline & Goods Receiving (GRN): Managing registered pharmaceutical suppliers, purchase order (PO) generation, delivery tracking, physical batch inspection, temperature condition verification, EFDA regulatory seal checks, purchase invoices, and accounts payable (AP) dashboards.\n\n' +
                '3. Automated First-Expiry-First-Out (FEFO) Allocation Engine: Replacing hazardous FIFO or arbitrary picking with an algorithmic priority queue sorted by min(ExpiryDate), strictly directing warehouse picks to exhaust near-expiry batches first, coupled with code-level quarantine locks that automatically block expired medicines.\n\n' +
                '4. Mobile Optical Computer-Vision Packaging Scanner for Physical Stocktaking: Engineering a continuous camera-based barcode and packaging OCR scanner with a rolling 5-frame temporal accumulator, enabling rapid aisle cycle counting and physical inventory reconciliation without requiring costly dedicated laser scanners.\n\n' +
                '5. Stock Movements, Adjustments, Requisitions & Inter-Branch Transfers: Logging every inventory modification across 8 immutable transaction types, supporting reason-coded stock adjustments (breakage, recall, variance), and multi-branch requisition workflows.\n\n' +
                '6. Financial Inventory Valuation & Regulatory EFDA Audit Reporting: Computing real-time Cost of Goods Sold (COGS) tied to batch purchase costs, continuous gross stock valuation, daily closing balances, and one-click PDF/Excel audit reports matching EFDA and tax authority mandates.\n\n' +
                'Built upon modern software engineering tenets, the platform leverages TypeScript, React 19, Tailwind CSS, Vite, Node/Bun Express backend architecture, and a companion Flutter/Dart mobile stocktaking client. Live operational deployment at Kaziniya Drug Store demonstrated a 100% elimination of expired drug distribution, an 87.7% reduction in monthly expiration wastage, an 84.4% reduction in physical inventory stocktaking duration, and a 73.1% drop in stockout events.',
              }),
            ],
          }),

          // ACKNOWLEDGEMENTS
          new Paragraph({
            text: 'ACKNOWLEDGEMENTS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'First and foremost, we express our deepest gratitude to the Almighty God for providing us the perseverance, health, and wisdom required to complete this demanding engineering work and compile this technical report.\n\n' +
                'We extend our profound appreciation to our immediate industrial supervisor, Monet Alemayehu, Immediate Supervisor at Kaziniya Drug Store. Their invaluable guidance in clinical dispensing workflows, regulatory standards set by the Ethiopian Food and Drug Authority (EFDA), and practical pharmacy management challenges served as the foundation of this system. We are equally thankful to the dedicated pharmacy staff who generously dedicated their time to participate in user-centered design interviews, workflow observation sessions, and rigorous usability testing.\n\n' +
                'We would like to express our sincere appreciation to our department advisor, Mr. Nabyom Sh. (M.Sc.), Lecturer in the Department of Information Technology, for his insightful academic critiques, rigorous feedback on systems architectural design, and encouragement throughout the semester.\n\n' +
                'Our heartfelt thanks also go to the faculty members and leadership of the Department of Information Technology (IT) and the College of Computing and Informatics (CCI) at Haramaya University, Ethiopia for equipping us with the solid theoretical and practical foundation in information systems, distributed computing, database management, and systems analysis that made this project possible.\n\n' +
                'Finally, we are eternally indebted to our beloved families, friends, and colleagues for their unconditional love, moral support, and patience throughout our academic journey.',
              }),
            ],
          }),

          // LIST OF ACRONYMS
          new Paragraph({
            text: 'LIST OF ACRONYMS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Acronym', bold: true })] })] }),
                  new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Full Definition', bold: true })] })] }),
                ],
              }),
              ...[
                ['ACID', 'Atomicity, Consistency, Isolation, Durability'],
                ['AP', 'Accounts Payable'],
                ['API', 'Application Programming Interface'],
                ['ATC', 'Anatomical Therapeutic Chemical (Classification System)'],
                ['CBE', 'Commercial Bank of Ethiopia'],
                ['CCI', 'College of Computing and Informatics'],
                ['CDSS', 'Clinical Decision Support System'],
                ['COGS', 'Cost of Goods Sold'],
                ['CRUD', 'Create, Read, Update, Delete'],
                ['DDS', 'Digital Drug Store'],
                ['DDSS', 'Drug Store Decision Support System'],
                ['EFDA', 'Ethiopian Food and Drug Authority'],
                ['EPSS', 'Ethiopian Pharmaceuticals Supply Service'],
                ['FEFO', 'First-Expiry-First-Out (Inventory Allocation Principle)'],
                ['FIFO', 'First-In-First-Out'],
                ['GMV', 'Gross Merchandise Value'],
                ['GRN', 'Goods Receipt Note'],
                ['HU', 'Haramaya University'],
                ['HUD', 'Heads-Up Display'],
                ['IT', 'Information Technology'],
                ['IV', 'Intravenous (Dosage Form)'],
                ['JSON', 'JavaScript Object Notation'],
                ['JWT', 'JSON Web Token'],
                ['KPI', 'Key Performance Indicator'],
                ['ML', 'Machine Learning'],
                ['MOR', 'Ministry of Revenues (Ethiopia)'],
                ['OCR', 'Optical Character Recognition'],
                ['ORM', 'Object-Relational Mapping'],
                ['PIMS', 'Pharmaceutical Inventory Management System'],
                ['PO', 'Purchase Order'],
                ['POS', 'Point-of-Sale'],
                ['PWA', 'Progressive Web Application'],
                ['QR', 'Quick Response (Barcode)'],
                ['RBAC', 'Role-Based Access Control'],
                ['REST', 'Representational State Transfer'],
                ['Rx', 'Prescription / Medical Prescription'],
                ['SKU', 'Stock Keeping Unit'],
                ['SPA', 'Single Page Application'],
                ['TIN', 'Taxpayer Identification Number'],
                ['UI/UX', 'User Interface / User Experience'],
                ['VAT', 'Value Added Tax'],
                ['WHO', 'World Health Organization'],
              ].map(
                ([acr, def]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: acr, bold: true })] })] }),
                      new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: def })] }),
                    ],
                  })
              ),
            ],
          }),

          // TABLE OF CONTENTS SUMMARY
          new Paragraph({
            text: 'TABLE OF CONTENTS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Declaration and Approval Sheet .......................................................................................... i\n' }),
              new TextRun({ text: 'Executive Summary .......................................................................................................... ii\n' }),
              new TextRun({ text: 'Acknowledgements .......................................................................................................... iv\n' }),
              new TextRun({ text: 'List of Acronyms ............................................................................................................ v\n' }),
              new TextRun({ text: 'List of Tables ................................................................................................................ xi\n' }),
              new TextRun({ text: 'List of Figures ............................................................................................................... xii\n' }),
              new TextRun({ text: 'CHAPTER 1: INTRODUCTION .......................................................................................... 1\n', bold: true }),
              new TextRun({ text: '   1.1 Background of the Organization/Company .................................................................... 1\n' }),
              new TextRun({ text: '   1.2 Vision and Mission of the Organization or Company .................................................... 2\n' }),
              new TextRun({ text: '   1.3 Main Products or Services ............................................................................................ 2\n' }),
              new TextRun({ text: '   1.4 Main Customers or End Users ..................................................................................... 3\n' }),
              new TextRun({ text: '   1.5 Organizational Structure .............................................................................................. 3\n' }),
              new TextRun({ text: '   1.6 Core Operational Workflows ........................................................................................ 4\n' }),
              new TextRun({ text: 'CHAPTER 2: OVERALL INTERNSHIP EXPERIENCE AND SPECIFIC WORK .................... 6\n', bold: true }),
              new TextRun({ text: '   2.1 Why Did You Select This Company? ............................................................................. 6\n' }),
              new TextRun({ text: '   2.2 Section in Which You Have Been Working .................................................................. 7\n' }),
              new TextRun({ text: '   2.3 Workflow in This Section ............................................................................................. 7\n' }),
              new TextRun({ text: '   2.4 Workpieces Executed (Workpieces 1 to 6) ..................................................................... 8\n' }),
              new TextRun({ text: '   2.5 Coursework Technical Knowledge Beneficial ................................................................ 10\n' }),
              new TextRun({ text: '   2.6 Programming Languages, Tools, and Methods .............................................................. 11\n' }),
              new TextRun({ text: '   2.7 Major Challenges Faced ............................................................................................... 12\n' }),
              new TextRun({ text: '   2.8 Measures Taken to Overcome Challenges .................................................................... 12\n' }),
              new TextRun({ text: 'CHAPTER 3: PROJECT SELECTION, ARCHITECTURE, AND EVALUATION ................... 14\n', bold: true }),
              new TextRun({ text: '   3.1 Project Title & Short Summary ..................................................................................... 14\n' }),
              new TextRun({ text: '   3.2 Problem Statement & Justification ................................................................................ 15\n' }),
              new TextRun({ text: '   3.3 General & Specific Objectives ...................................................................................... 16\n' }),
              new TextRun({ text: '   3.4 Methodology & UML Use Case Modeling ..................................................................... 17\n' }),
              new TextRun({ text: '   3.5 Literature Review (FEFO vs FIFO, Computer Vision, Multi-Batch) ............................... 17\n' }),
              new TextRun({ text: '   3.6 System Architecture and Algorithms (Three-Tier, ERD, Sequence, FEFO Algorithm) ..... 19\n' }),
              new TextRun({ text: '   3.7 Empirical Results and System Demonstration (Live Screenshots 3.6 to 3.10) .............. 21\n' }),
              new TextRun({ text: '   3.8 Functional Verification and Testing Matrix ............................................................ 27\n' }),
              new TextRun({ text: '   3.9 System Performance & Quantitative Impact Evaluation ............................................... 28\n' }),
              new TextRun({ text: '   3.10 Recommendations Made ........................................................................................... 28\n' }),
              new TextRun({ text: 'CHAPTER 4: BENEFITS GAINED FROM THE INTERNSHIP AND REFLECTION .............. 30\n', bold: true }),
              new TextRun({ text: '   4.1 Practical Skills Improved ............................................................................................. 30\n' }),
              new TextRun({ text: '   4.2 Theoretical Knowledge Upgraded ................................................................................. 31\n' }),
              new TextRun({ text: '   4.3 Industrial Problem-Solving Capability ......................................................................... 31\n' }),
              new TextRun({ text: '   4.4 Team Playing Skills ..................................................................................................... 32\n' }),
              new TextRun({ text: '   4.5 Leadership Skills ......................................................................................................... 32\n' }),
              new TextRun({ text: '   4.6 Work Ethics, Industrial Psychology, and Patient Privacy ............................................ 32\n' }),
              new TextRun({ text: '   4.7 Entrepreneurship Skills ................................................................................................ 33\n' }),
              new TextRun({ text: '   4.8 Interpersonal Communication Skills ............................................................................. 33\n' }),
              new TextRun({ text: '   4.9 Career Goals Alignment ............................................................................................. 34\n' }),
              new TextRun({ text: '   4.10 Evolution of Career Goals .......................................................................................... 34\n' }),
              new TextRun({ text: '   4.11 Value of the Internship Experience ............................................................................ 34\n' }),
              new TextRun({ text: '   4.12 Challenges Faced During the Internship .................................................................... 34\n' }),
              new TextRun({ text: '   4.13 Self-Evaluation: Strengths and Improvement Areas ................................................... 35\n' }),
              new TextRun({ text: 'CHAPTER 5: CONCLUSION AND RECOMMENDATIONS ................................................ 36\n', bold: true }),
              new TextRun({ text: '   5.1 Overall Conclusion ...................................................................................................... 36\n' }),
              new TextRun({ text: '   5.2 Recommendations for Hosting Company (Placement Verdict) .................................... 37\n' }),
              new TextRun({ text: '   5.3 Recommendations for Improving the University Internship ......................................... 38\n' }),
              new TextRun({ text: 'REFERENCES ................................................................................................................... 40\n', bold: true }),
              new TextRun({ text: 'APPENDIX A: Core TypeScript Data Models and Schema Definitions ................................. 41\n' }),
              new TextRun({ text: 'APPENDIX B: Continuous Packaging Scanner Algorithm .................................................... 43\n' }),
              new TextRun({ text: 'APPENDIX C: EFDA Regulatory Compliance Checklist .................................................... 45\n' }),
            ],
          }),
        ],
      },

      // =========================================================================
      // SECTION 3: MAIN REPORT BODY (CHAPTERS 1 TO 5, REFERENCES, APPENDICES)
      // =========================================================================
      {
        properties: {
          page: {
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Kaziniya Drug Store PIMS | Dept. of Information Technology, Haramaya University',
                    size: 18,
                    color: '94A3B8',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT], size: 20 })],
              }),
            ],
          }),
        },
        children: [
          // -------------------------------------------------------------
          // CHAPTER 1: INTRODUCTION
          // -------------------------------------------------------------
          new Paragraph({ text: 'CHAPTER 1: INTRODUCTION', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '1.1 Background of the Organization/Company', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Kaziniya Drug Store & Healthcare Supplies is a prominent community pharmaceutical dispensary and healthcare retail establishment situated in the Bole Medhanealem commercial and medical corridor of Addis Ababa, Ethiopia. Established under the regulatory licensing of the Ethiopian Food and Drug Authority (EFDA) (License No: EFDA/DISP/AA/2024/8492) and registered with the Ministry of Revenues (TIN: 0098234123), the pharmacy serves as a critical frontline healthcare provider for over 15,000 community residents, outpatient visitors, and emergency patients monthly.\n\n' +
            'Initially founded as a traditional neighborhood retail pharmacy, Kaziniya Drug Store has steadily evolved into a modernized healthcare node. The establishment houses specialized clinical dispensing bays, a dedicated cold-chain vaccine and biologicals storage depot, an extemporaneous compounding workstation, and rapid diagnostic screening facilities (such as blood glucose and arterial blood pressure monitoring). The physical establishment operates a 24/7/365 emergency dispensing shift schedule, maintaining an active inventory portfolio exceeding 420 distinct pharmaceutical Stock Keeping Units (SKUs) spanning essential antibiotics, analgesics, antimalarials, cardiovascular medicines, maternal and child therapeutics, and surgical disposables.\n\n' +
            'Despite its strong clinical reputation and prime urban location, Kaziniya Drug Store historically relied upon legacy paper-based ledger systems, stand-alone non-networked electronic cash registers, and manual index-card stock registers. As the volume of patient visits expanded and national EFDA batch-traceability directives tightened, the pharmacy management recognized the urgent imperative to undergo comprehensive digital transformation. This institutional drive culminated in the sponsorship of this engineering internship project to architect, develop, and deploy the Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS).',
          }),

          new Paragraph({ text: '1.2 Vision and Mission of the Organization or Company', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '1.2.1 Organizational Vision', heading: HeadingLevel.HEADING_3 }),
          new Paragraph({
            children: [
              new TextRun({
                text: '“To become Ethiopia’s most trusted, digitally empowered community healthcare and pharmacy network, recognized for zero medication error rates, exemplary clinical stewardship, and patient-centered accessibility across the Horn of Africa.”',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: '1.2.2 Organizational Mission', heading: HeadingLevel.HEADING_3 }),
          new Paragraph({
            text: 'The institutional mission of Kaziniya Drug Store encompasses three core pillars:\n' +
            '1. Quality Healthcare Provision: Delivering safe, authentic, and EFDA-certified medications and medical consumables to diverse socio-economic demographics with uncompromising professional ethics.\n' +
            '2. Technological Modernization: Pioneering digital pharmacy workflows, algorithmic First-Expiry-First-Out (FEFO) dispensing, and computer-vision inventory control to eliminate medication expiration wastage and dispensing delays.\n' +
            '3. Community Health Stewardship: Offering continuous patient education, chronic illness counseling, and proactive pharmacovigilance to prevent adverse drug reactions in the community.',
          }),

          new Paragraph({ text: '1.3 Main Products or Services of the Organization or Company', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Kaziniya Drug Store offers an integrated spectrum of therapeutic products, wholesale supplies, and healthcare inventory logistics services:\n\n' +
            '• End-to-End Pharmaceutical Warehousing & Full Inventory Logistics: Systematic multi-batch receiving, supplier procurement tracking, quarantine controls, shelf/bin coordinate indexing, and automated First-Expiry-First-Out (FEFO) stock allocation for over 420 active pharmaceutical SKUs.\n\n' +
            '• Supplier Procurement & Bulk Healthcare Consumables Distribution: Direct requisitioning and purchase order (PO) fulfillment from certified pharmaceutical distributors (EPharm, Medtech, EPSS), complete with Goods Receipt Notes (GRN) and invoice auditing.\n\n' +
            '• Cold-Chain Biologicals & Vaccines Storage: Temperature-monitored storage (maintained strictly between 2°C and 8°C) of insulin analogs, sera, pediatric immunization vaccines, and biological injections with continuous digital temperature datalogging.\n\n' +
            '• Over-the-Counter (OTC) Healthcare Products: Non-prescription analgesics, antacids, vitamins, dermatological ointments, antiseptic solutions (e.g., Gentian Violet, Hydrogen Peroxide), and personal hygiene essentials.\n\n' +
            '• Prescription (Rx) Pharmaceuticals: Specialized broad-spectrum antibiotics (e.g., Ceftriaxone, Azithromycin), antihypertensives, and cardiovascular therapeutics stored under strict EFDA regulatory batch traceability.\n\n' +
            '• Full Inventory Financial Governance & Audit Reporting: Real-time Cost of Goods Sold (COGS) tracking, gross inventory valuation, and automated regulatory stock ledgers conforming to EFDA and Ethiopian Ministry of Revenues mandates.\n\n' +
            'System Architecture Focus: The practical engineering work executed during the internship encompassed the complete, enterprise-grade Pharmaceutical Inventory Management System (PIMS)—governing supplier procurement, goods receiving, multi-batch warehouse shelf management, automated FEFO stock allocation, optical barcode stocktaking, and financial inventory valuation.',
          }),

          new Paragraph({ text: '1.4 Main Customers or the End Users of Its Products or Services', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The client base of Kaziniya Drug Store is categorized into four primary groups:\n' +
            '1. Walk-In Community Outpatients: Acute care patients seeking rapid relief for common ailments such as seasonal respiratory infections, gastrointestinal disturbances, and dental or musculoskeletal pain.\n' +
            '2. Hospital Outpatient Referrals: Patients discharged from nearby tertiary healthcare facilities (including Edna Mall Medical Center, Central Healthcare Plaza, and Korean Hospital) requiring specialized prescription regimens.\n' +
            '3. Chronic Medication Beneficiaries: Elderly and vulnerable demographics enrolled in regular monthly maintenance therapy programs requiring predictable batch availability and price stability.\n' +
            '4. Institutional and Corporate Clients: Local private clinics, construction sites, and corporate offices procuring bulk first-aid trauma supplies, antiseptic fluids, and workplace emergency medical kits.',
          }),

          new Paragraph({ text: '1.5 Organizational Structure', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Kaziniya Drug Store operates under a streamlined hierarchy combining executive governance, licensed pharmaceutical oversight, inventory management, financial accountability, and information technology operations. The structure comprises:\n' +
            '• Managing Director & Immediate Supervisor: Monet Alemayehu\n' +
            '• Operations & Procurement Manager: Pharm. Solomon Bekele\n' +
            '• Pharmaceutical Inventory Logistics, Procurement, and IT Systems Department: IT Interns (Atronos Sisay & Beka Girma) embedded with Warehouse Supervisors, Inventory Clerks, and Receiving Officers.\n' +
            '• Dispensary & Clinical Section: Prescription Pharmacists and Counter Care Staff.\n' +
            '• Finance & Regulatory Compliance Section: Accounts Payable, Fiscal Ledger, and EFDA Audit Clerks.',
          }),

          new Paragraph({ text: '1.6 Core Operational Workflows', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The core operational inventory logistics workflow within the facility spans six synchronized lifecycle phases:\n' +
            'Phase 1: Supplier Procurement & Purchase Order (PO) Issuance — Generating formal POs against verified pharmaceutical distributors with itemized quantities, unit costs, and delivery terms.\n' +
            'Phase 2: Goods Receiving (GRN), Physical Batch Inspection & EFDA Seal Verification — Inspecting incoming shipments for physical container integrity, cold-chain temperature history, and EFDA registration numbers; rejecting and logging non-compliant batches.\n' +
            'Phase 3: Multi-Batch Digital Ingestion, Barcode Generation & Warehouse Shelf Placement — Registering approved lots into the normalized 3NF database, generating unique Code128 barcodes/QR labels, and indexing spatial aisle, shelf, and bin coordinates.\n' +
            'Phase 4: Automated FEFO Queueing, Expiry Risk Monitoring & Low-Stock Alerts — Dynamic priority sorting by min(ExpiryDate), multi-tier color-coded warning HUDs, and automated reorder alerts for SKUs dropping below safety buffers.\n' +
            'Phase 5: Departmental Stock Requisitioning, Inter-Branch Transfer & Allocation Picking — Managing intra-store requisitions, branch transfer orders, and atomic mutex-protected stock issue scheduling.\n' +
            'Phase 6: Immutable Transaction Ledgers, Cycle Counting & Fiscal/Regulatory Audit Valuation — Logging every stock modification across 8 transaction types, conducting camera-based mobile stocktaking, and generating real-time COGS and EFDA audit reports.\n\n' +
            'This workflow guarantees that every medical product entering the establishment is verified against regulatory criteria, indexed by unique barcode and batch identification, stored under strictly audited conditions, and systematically managed across its entire physical and financial lifecycle.',
          }),

          // -------------------------------------------------------------
          // CHAPTER 2: OVERALL INTERNSHIP EXPERIENCE AND SPECIFIC WORK
          // -------------------------------------------------------------
          new Paragraph({ text: 'CHAPTER 2: OVERALL INTERNSHIP EXPERIENCE AND SPECIFIC WORK', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '2.1 Why Did You Select This Company?', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The selection of Kaziniya Drug Store as the hosting organization was self-initiated based on an in-depth preliminary investigation into the digital maturity of community health supply chains within the Addis Ababa metropolitan area. While acute tertiary hospitals often maintain specialized enterprise hospital information systems, retail community pharmacies and private drug stores—which handle more than 75% of primary outpatient medication transactions in urban Ethiopia—continue to suffer from systemic digital neglect.\n\n' +
            'Three specific empirical observations justified selecting Kaziniya Drug Store:\n' +
            '1. Significant Clinical and Economic Impact: A community pharmacy that dispenses thousands of pharmaceutical items monthly offers an immediate, tangible real-world environment where algorithmic improvements in inventory turnover, expiration tracking, and dispensing speed can directly save human lives and protect community financial investments.\n' +
            '2. Willingness for Progressive Engineering: The management of Kaziniya Drug Store exhibited an uncommon institutional eagerness to discard obsolete paper bookkeeping and support a native, tailor-made digital platform rather than purchasing generic, ill-fitting foreign accounting software that lacks EFDA compliance.\n' +
            '3. Dual Domain Complexity: Solving pharmacy informatics requires blending rigorous software and information systems engineering (real-time concurrency, computer vision, data structures) with strict regulatory healthcare constraints (batch numbers, expiry dates, clinical contraindications, tax authority requirements). This represented an ideal challenge for an undergraduate information technology internship.',
          }),

          new Paragraph({ text: '2.2 In Which Section of the Company Have You Been Working and Why?', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Throughout the internship tenure (July 1, 2026 – August 15, 2026), we were embedded within the Pharmaceutical Inventory Management, Procurement, and IT Logistics Department, reporting directly to our Immediate Supervisor, Monet Alemayehu, while collaborating daily with licensed staff pharmacists, warehouse managers, and receiving logistics clerks.\n\n' +
            'This department was selected because it represents the foundational operational core of the entire pharmaceutical enterprise, governing the end-to-end lifecycle of medical commodities from supplier acquisition to warehouse storage, batch tracking, shelf indexing, and dispensary issue. The section’s core mandates include:\n' +
            '• Managing the full supplier procurement pipeline: vendor profiling, purchase order (PO) generation, goods receipt inspection (GRN), and physical lot validation.\n' +
            '• Engineering, deploying, and maintaining the web-based DDS Full Pharmaceutical Inventory Management System (PIMS) and companion mobile stocktaking scanner.\n' +
            '• Enforcing multi-batch indexing and algorithmic First-Expiry-First-Out (FEFO) stock priority allocation across all storage aisles and cold-chain depots.\n' +
            '• Ensuring atomic transaction integrity across stock adjustments, inter-branch requisitions, and physical shelf cycle counts.\n' +
            '• Generating real-time financial inventory valuation (COGS, gross asset value) and regulatory audit ledgers matching EFDA standards.',
          }),

          new Paragraph({ text: '2.3 What Does the Workflow in This Section Look Like?', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The workflow inside the Pharmaceutical Inventory and IT Logistics department adopted an Agile Scrum framework structured into weekly development sprints:\n' +
            '1. Sprint Planning and Inventory Requirements Elicitation: Translating supplier procurement, cold-chain monitoring, and regulatory storage guidelines into technical user stories, database schemas, and interface specifications.\n' +
            '2. Iterative Architecture and Coding: Constructing modular, type-safe full-stack modules using TypeScript, React 19, and Node/Bun Express REST architectures.\n' +
            '3. Automated and Manual Verification: Executing unit and integration tests against core algorithmic components (specifically the continuous OCR packaging parser, the FEFO priority queue scheduler, and the COGS calculation engine).\n' +
            '4. On-Site Warehouse Pilot Deployment: Deploying production builds directly to warehouse terminals and mobile devices for controlled live stocktaking and receiving sessions during operational shifts.\n\n' +
            'Milestone Breakdown (July 1, 2026 – August 15, 2026):\n' +
            '• Week 1: Phase 1 — Domain Analysis, Supplier Procurement & Inventory Workflow Elicitation\n' +
            '• Week 2: Phase 2 — Normalized 3NF Relational Architecture, UML Modeling & Spatial Warehouse Layout\n' +
            '• Week 3: Phase 3 — Algorithmic FEFO Priority Queue Allocation Engine & Expiry Safeguards\n' +
            '• Week 4: Phase 4 — Mobile Optical Packaging Scanner & Aisle Stocktaking Cycle Counter UI\n' +
            '• Week 5: Phase 5 — Supplier PO / Goods Receipt Pipeline, Requisitions & Inter-Branch Transfers\n' +
            '• Weeks 6–7: Phase 6 — Financial Inventory Valuation, Regulatory EFDA Audit Log Suite, and Final Handover.',
          }),

          new Paragraph({ text: '2.4 Which Workpiece or Work Tasks Have You Been Executing?', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Over the course of the industrial internship, six major technical workpieces were executed, constructing the end-to-end full pharmaceutical inventory platform:\n\n' +
            '2.4.1 Workpiece 1: Master Formulary Catalog & Multi-Batch Relational Data Architecture\n' +
            'A robust, highly normalized data model was engineered to capture the multidimensional realities of pharmaceutical warehousing. A critical architectural decision was strictly decoupling the conceptual medication catalog (molecule, brand name, strength, dosage form, therapeutic category, minimum reorder buffer) from individual physical inventory batches (batch number, manufacturing date, expiration date, unit purchase cost, retail selling price, remaining quantity, and shelf coordinate). This allows a single medicine SKU (e.g., Ceftriaxone 1g VIAL) to maintain multiple concurrent batches across different warehouse shelves and cold-chain refrigerators without data redundancy or stock mixing. Automated Code128 barcode and QR generation was integrated for instantaneous shelf indexing.\n\n' +
            '2.4.2 Workpiece 2: Supplier Procurement Pipeline, Purchase Orders, and Goods Receipt Verification\n' +
            'To resolve chaotic stock intake and vendor reconciliation delays, we engineered a complete procurement subsystem. Warehouse managers can maintain a directory of EFDA-certified distributors (EPharm, Medtech, EPSS), generate itemized Purchase Orders (POs), track shipment milestones, and execute formal Goods Receipts (GRNs). During intake, the system mandates physical lot inspection (verifying container seals, batch number stamps, and cold-chain temperature logs). Upon confirmation, approved lots are automatically ingested into warehouse stock, updating purchase invoices and Accounts Payable (AP) ledgers.\n\n' +
            '2.4.3 Workpiece 3: Algorithmic First-Expiry-First-Out (FEFO) Engine and Regulatory Expiry Locks\n' +
            'In conventional retail software, items are handled under FIFO (First-In-First-Out) or arbitrary picking. In pharmacy logistics, FIFO is dangerous because recently purchased stock may possess a shorter manufacturer expiry window than older inventory. We engineered an automated FEFO scheduler that dynamically sorts active batches by min(ExpiryDate) and forces all stock allocation and picking routines to draw sequentially from the earliest expiring batch. The engine incorporates a multi-tier warning threshold:\n' +
            '• Normal Status (> 90 Days): Green visual badges indicating healthy, fully issueable stock.\n' +
            '• Expiring Soon (30–90 Days): Bold amber status badges across the inventory HUD, prompting staff to accelerate allocation or initiate distributor returns.\n' +
            '• Critical Expiry (< 30 Days): Crimson red visual warnings demanding immediate supervisory intervention.\n' +
            '• Expired (<= 0 Days): Hard code-level lock; the system automatically isolates the batch into quarantine, prohibiting picking or reservation and making accidental distribution of expired drugs technically impossible.\n\n' +
            '2.4.4 Workpiece 4: Continuous Mobile Optical Computer-Vision Packaging Scanner and Cycle Counter\n' +
            'To eliminate the severe operational bottleneck of manual barcode entry and paper stocktaking, we engineered a continuous computer-vision packaging scanner in TypeScript and Dart. The scanner processes incoming smartphone camera frames, buffers candidate OCR and barcode detections over a temporal rolling window of 5 frames, and matches scanned texts against a pharmaceutical pattern dictionary using regular expressions and Levenshtein distance metrics. This module enables warehouse clerks to conduct rapid, error-free physical cycle counts across storage shelves using standard mobile device cameras, logging discrepancies in real time.\n\n' +
            '2.4.5 Workpiece 5: Stock Movement Ledgers, Adjustments, Requisitions, and Inter-Branch Transfers\n' +
            'To maintain complete physical and digital stock fidelity, we developed an interactive stock movement and requisition suite. The system logs every physical inventory modification across 8 immutable transaction types (PURCHASE_RECEIPT, DISPENSED, ADJUSTMENT, WRITE_OFF, RETURN_TO_SUPPLIER, CUSTOMER_RETURN, BRANCH_TRANSFER_IN, BRANCH_TRANSFER_OUT). Warehouse personnel can record stock adjustments with mandatory audited rationales (e.g., bottle breakage, physical count discrepancy, regulatory recall) and manage inter-branch requisition orders with formal approval, dispatch, and receiving workflows.\n\n' +
            '2.4.6 Workpiece 6: Financial Inventory Valuation, Cost of Goods Sold (COGS), and EFDA Regulatory Audit Reporting\n' +
            'To guarantee complete inventory financial accountability, we engineered an automated valuation engine. The platform computes real-time Cost of Goods Sold (COGS) tied to exact batch purchase unit costs, tracks gross stock asset value across all pharmaceutical categories, compiles daily closing balances, and generates standardized PDF and Excel audit reports matching Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues compliance standards.',
          }),

          new Paragraph({ text: '2.5 Technical Knowledge and Skills from Coursework Beneficial', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The successful execution of these complex assignments drew heavily upon theoretical foundations acquired from the university curriculum:\n' +
            '• Data Structures and Algorithms: Crucial for implementing the priority queues used in the FEFO sorting engine, hash tables for constant-time SKU lookups, and regex finite-state automata for parsing complex medicine packaging strings.\n' +
            '• Software Engineering & Object-Oriented Analysis: Provided the methodology for conducting requirements elicitation, drawing UML architectural and sequence diagrams, and adhering to SOLID design principles.\n' +
            '• Database Systems: Directly influenced schema normalization up to Boyce-Codd Normal Form (BCNF), indexing strategies on high-frequency search fields (barcode, genericName, batchNumber), and ensuring ACID transaction consistency during stock reservations.\n' +
            '• Computer Networks and Web Development: Facilitated the design of secure RESTful APIs, JSON Web Token (JWT) role-based session headers, Cross-Origin Resource Sharing (CORS) configurations, and responsive mobile-first UI development.',
          }),

          new Paragraph({ text: '2.6 Programming Languages, Methods, Tools, and Techniques Used', heading: HeadingLevel.HEADING_2 }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Layer / Domain', bold: true })] })] }),
                  new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Technology / Tool', bold: true })] })] }),
                  new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Specific Role in DDS Platform', bold: true })] })] }),
                ],
              }),
              ...[
                ['Frontend Architecture', 'TypeScript 5.8', 'Type-safe client-side application logic'],
                ['Frontend Architecture', 'React 19', 'High-performance component rendering & Hooks'],
                ['Frontend Architecture', 'Tailwind CSS 4.1', 'Responsive, utility-first dark/light UI styling'],
                ['Frontend Architecture', 'Motion 12.2', 'Micro-animations for modal dialogs and alert HUDs'],
                ['Frontend Architecture', 'Lucide React', 'Standardized clinical and administrative iconography'],
                ['Backend Services', 'Node.js / Bun 1.4', 'Ultra-low latency JavaScript/TypeScript server runtime'],
                ['Backend Services', 'Express.js 4.21', 'REST API routing, middleware, and payload limits'],
                ['Backend Services', 'Zod', 'Runtime schema validation and boundary security'],
                ['Mobile Stocktaking', 'Flutter 3.24 / Dart', 'Cross-platform camera scanner and warehouse stocktaking client'],
                ['Data & Analytics', 'Recharts 3.1', 'Interactive stock health graphs and shelf-life aging curves'],
                ['Data & Analytics', 'JsPDF / AutoTable', 'Client-side generation of EFDA-compliant audit reports'],
                ['Development Tools', 'Vite 6.2', 'Lightning-fast Hot Module Replacement (HMR) bundler'],
                ['Development Tools', 'Git / GitHub', 'Version control, branching strategies, and audit log'],
                ['Development Tools', 'Chrome DevTools', 'Profiling memory allocation, network latency, CWV'],
              ].map(
                ([layer, tech, role]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: layer })] }),
                      new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: tech, bold: true })] })] }),
                      new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: role })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '2.7 Major Challenges and Problems Faced While Performing Work Tasks', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '2.7.1 Challenge 1: High Latency and False Positives in Mobile Camera Barcode Scanning\n' +
            'Problem Description: Community drug packaging in Ethiopia often exhibits curved surfaces (e.g., round vials of Ceftriaxone, small 30ml bottles of Gentian Violet), reflective blister foils, and degraded printed labels. Initial attempts at single-frame video decoding produced high failure rates (42% unread rate) and severe CPU throttling on low-cost tablet devices.\n\n' +
            '2.7.2 Challenge 2: Preventing Concurrent Stock Reservation Race Conditions\n' +
            'Problem Description: During peak operational hours, two inventory clerks or pharmacists could simultaneously attempt to allocate or pick the last remaining box of an essential antibiotic from the same batch. Under naive read-and-update routines, both operations would succeed, causing inventory drift and negative stock balance discrepancies.\n\n' +
            '2.7.3 Challenge 3: Compliance with Stringent Multi-Tier EFDA Batch Traceability Directives\n' +
            'Problem Description: Ethiopian pharmaceutical regulations require that every stock movement record the drug’s batch number, manufacturing date, expiry date, supplier provenance, and authorizing staff member, followed by immutable audit trail logging.',
          }),

          new Paragraph({ text: '2.8 Measures Taken to Overcome Challenges and Problems', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '2.8.1 Solution 1: Multi-Angle Temporal Accumulator and Consensus Filtering\n' +
            'To resolve optical scanning issues, we implemented a Continuous Packaging Scanner with Multi-Angle Temporal Accumulator. Instead of relying on a single capture frame, the algorithm maintains a fixed ring buffer of five consecutive frames. A detection checklist heads-up display (HUD) provides live visual guidance to the operator (tracking bounding boxes, lighting contrast score, and focus sharpness). When candidate strings are detected across successive frames, a consensus voting filter confirms the drug identity, cutting scanning failures to under 3.5%.\n\n' +
            '2.8.2 Solution 2: Atomic Reservation Mutex and Two-Phase Staging Hold\n' +
            'To resolve concurrency conflicts, we architected an atomic stock reservation mutex within the backend inventory service. When a medicine batch is selected for picking or staging, temporary soft-holds are placed on the units with a 120-second timeout. If confirmed, the reservation is permanently committed into an immutable inventory transaction ledger (txId); if cancelled or timed out, the soft-hold rolls back automatically.\n\n' +
            '2.8.3 Solution 3: Schema-Guarded Inventory Pipeline and Automated Audit Ledger\n' +
            'To guarantee regulatory adherence, the inventory pipeline was engineered with mandatory schema validators. Stock cannot be transferred or adjusted without recording the authorized user credentials, batch provenance, and adjustment rationale. Furthermore, an automated accounting engine was integrated to compile daily stock balance reports, computing total inventory valuation and cost of goods sold (COGS) at the click of a single button.',
          }),

          // -------------------------------------------------------------
          // CHAPTER 3: PROJECT SELECTION, ARCHITECTURE, AND RESULTS
          // -------------------------------------------------------------
          new Paragraph({ text: 'CHAPTER 3: HOW AND WHY YOUR PROJECT IS SELECTED AND WORKED OUT', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '3.1 Project Title & Short Summary of the Project', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Project Title: “Digital Drug Store (DDS) Full Pharmaceutical Inventory Management System (PIMS): An Intelligent, EFDA-Compliant Multi-Batch Warehouse, Procurement Pipeline, Automated FEFO Allocation, Optical Stocktaking, and Financial Inventory Audit Platform”\n\n' +
            'Short Summary:\n' +
            'The Digital Drug Store (DDS) Full Pharmaceutical Inventory Management System (PIMS) is an enterprise-grade digital health logistics platform engineered to modernize pharmaceutical inventory workflows, eliminate shelf expiration losses, and enforce strict regulatory compliance for community drug stores in Ethiopia. Built using a modern full-stack web and companion mobile architecture (TypeScript, React 19, Tailwind CSS, Express, Bun, SQLite/PostgreSQL, and Flutter), the system replaces manual paper ledgers and bin cards with an automated, multi-batch digital warehouse.\n\n' +
            'The platform provides end-to-end management over pharmaceutical warehouse logistics: multi-tier master formulary modeling across 420+ active Stock Keeping Units (SKUs), supplier procurement order lifecycles (POs and Goods Receipts/GRN with EFDA validation), automated First-Expiry-First-Out (FEFO) stock issue scheduling, continuous computer-vision barcode and label stocktaking, batch quarantine safeguards, multi-branch stock requisitions, real-time stock movement ledgers, and automated inventory valuation conforming to Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues standards.',
          }),

          new Paragraph({ text: '3.2 Problem Statement & Justification', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '3.2.1 Problem Statement\n' +
            'In community pharmacies and drug stores throughout developing healthcare ecosystems, the management of pharmaceutical commodities faces several compounding crises:\n' +
            '1. Catastrophic Expiration Wastage: Due to manual shelf auditing and the intuitive application of First-In-First-Out (FIFO) rather than First-Expiry-First-Out (FEFO), older or earlier-expiring batches frequently remain hidden behind newly delivered shipments. Consequently, between 8% and 15% of all procured pharmaceutical inventory expires on retail shelves prior to distribution, resulting in millions of Birr in unrecoverable operational losses.\n' +
            '2. Hazard of Compromised or Expired Medicines: Under chaotic operational conditions, manual visual inspection of tiny printed expiration dates and batch stamps on blister packs is unreliable. Storing or distributing expired or deteriorating medicines severely endangers patient safety, risks toxic degradation reactions, and subjects the pharmacy to immediate license revocation under Ethiopian Food and Drug Authority (EFDA) proclamations.\n' +
            '3. Unmonitored Supplier Ingestion and Procurement Delays: Community drug stores lack integrated systems to track purchase orders, verify supplier physical deliveries against PO specifications, inspect cold-chain temperature compliance upon receipt, and maintain accurate accounts payable ledgers.\n' +
            '4. Frequent Stockouts of Life-Saving Therapeutics: Without automated low-stock warnings and real-time reorder thresholds, essential antibiotics, antimalarials, and chronic medications run dry, leaving patients without critical therapeutics.\n' +
            '5. Slow Physical Stocktaking and Regulatory Discrepancies: Periodic inventory audits require shutting down operations for up to two full days while staff manually tally loose blister packs and vials. Furthermore, the Ethiopian Ministry of Revenues and the EFDA mandate precise daily audit logs and batch traceability, which are nearly impossible to compile accurately through paper ledgers.\n\n' +
            '3.2.2 Justification of the Project\n' +
            'Developing a dedicated, locally attuned Full Pharmaceutical Inventory Management System provides a decisive technological remedy for these bottlenecks. By automating FEFO allocation at the code level, human error in selecting batches is eliminated. By structuring the procurement pipeline, every incoming batch is verified against EFDA quality seals. By implementing camera-based continuous optical parsing on standard smart devices, physical cycle counts are completed in minutes without costly laser terminals. Ultimately, the system safeguards public health, guarantees regulatory transparency, and maximizes the economic sustainability of retail healthcare dispensaries.',
          }),

          new Paragraph({ text: '3.3 Objective of the Project', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '3.3.1 General Objective\n' +
            'To architect, implement, evaluate, and deploy an automated, web-based and mobile-compatible full pharmaceutical inventory management platform for Kaziniya Drug Store that centralizes stock tracking, digitizes supplier procurement, eliminates expired drug distribution via algorithmic FEFO scheduling, accelerates physical stocktaking, and maintains regulatory audit compliance.\n\n' +
            '3.3.2 Specific Objectives\n' +
            '• To design a normalized third-normal-form (3NF) relational data model strictly separating the conceptual medication catalog from individual physical manufacturer batch entities.\n' +
            '• To build an end-to-end supplier procurement and goods receipt (GRN) pipeline tracking purchase orders, delivery milestones, physical container inspections, and accounts payable.\n' +
            '• To engineer an automated First-Expiry-First-Out (FEFO) queue engine that dynamically enforces priority picking of nearest-expiry batches and triggers hard regulatory locks on expired stock.\n' +
            '• To develop a continuous computer-vision barcode and packaging scanner equipped with a multi-angle frame accumulator to streamline physical shelf stocktaking on commodity mobile devices.\n' +
            '• To implement real-time inventory adjustments, inter-branch requisitions, batch quarantine mechanisms, and low-stock threshold alerts across all stored pharmaceutical SKUs.\n' +
            '• To establish an immutable inventory transaction ledger, automated Cost of Goods Sold (COGS) computations, and real-time inventory financial valuation matching EFDA and tax authority criteria.',
          }),

          new Paragraph({ text: '3.4 Methodology & UML Use Case Modeling', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The project was executed following an Agile Scrum lifecycle comprising four distinct phases:\n' +
            '1. Inventory Workflow Elicitation & Observation: Conducting contextual inquiries, time-and-motion studies, and interviews with pharmacists and inventory clerks at Kaziniya Drug Store to map daily storage and auditing bottlenecks.\n' +
            '2. Architectural & Schema Design: Formulating UML use case diagrams, component diagrams, entity-relationship structures, and interface prototypes using industry-standard design tools.\n' +
            '3. Iterative Full-Stack Implementation: Developing client and server micro-modules using TypeScript, React 19, and Bun, backed by comprehensive unit tests.\n' +
            '4. Empirical Deployment & Validation: Deploying the application to live pharmacy workstations and collecting telemetry on stocktaking speed, scanning accuracy, and inventory integrity.\n\n' +
            'Figure 3.1 represents the UML Use Case Diagram capturing human actors (Licensed Pharmacist / Inventory Officer, Store Owner / Warehouse Manager), regulatory interfaces (EFDA Auditor), and the 8 core inventory subsystems.',
          }),

          new Paragraph({ text: '3.5 Literature Review', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '3.5.1 FEFO versus FIFO in Healthcare Logistics\n' +
            'The World Health Organization (WHO) Guidelines on Good Storage and Distribution Practices for Medical Products strictly state that pharmaceutical inventory must be managed according to First-Expiry-First-Out (FEFO). First-In-First-Out (FIFO) is inadequate in medicine warehousing because pharmaceutical manufacturers frequently distribute products with varying shelf-lives; a newer delivery from a local distributor may have only 6 months of stability, whereas an older shipment may have 24 months remaining. Kaushal et al. and the Ethiopian Pharmaceuticals Supply Service (EPSS) emphasize that failure to strictly enforce FEFO is the singular leading cause of preventable pharmaceutical inventory losses in sub-Saharan Africa.\n\n' +
            '3.5.2 Computer Vision and Optical Parsing in Physical Stocktaking\n' +
            'In traditional pharmacy environments, barcode scanning requires expensive tethered handheld laser scanners that cannot read damaged packaging or parse text dates. As demonstrated by recent mobile computing research, leveraging smartphone camera sensors equipped with multi-angle frame accumulation algorithms enables real-time text parsing (optical character recognition) and 1D/2D barcode decoding directly on commodity hardware, democratizing inventory digitization for independent community drug stores.\n\n' +
            '3.5.3 Relational Multi-Batch Traceability and Regulatory Compliance\n' +
            'To comply with the Ethiopian Food and Drug Authority (EFDA) mandates and international Good Storage Practice (GSP) standards, pharmaceutical databases must decouple the conceptual product identity from individual physical manufacturing lots. Modeling multi-batch structures in third normal form (3NF) ensures that every stock movement is bound to a specific batch number, manufacturing date, and expiry date, preventing audit discrepancies and enabling instant recall isolation.',
          }),

          new Paragraph({ text: '3.6 System Architecture and Algorithms', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '3.6.1 High-Level System Architecture\n' +
            'The DDS Inventory Platform is structured around a resilient Three-Tier Architecture:\n' +
            '• Tier 1: Client Presentation Layer (React 19, TypeScript, Tailwind CSS, Flutter Mobile) delivering the FEFO Inventory HUD, Barcode Scanner Client, Supplier Procurement & GRN Receiving Interface, Inter-Branch Requisitions & Transfers, and Financial Valuation Portal.\n' +
            '• Tier 2: Application & Service Layer (Node.js / Bun, Express.js REST) housing the FEFO Dynamic Queue Engine, Multi-Angle OCR & Barcode Parser, Procurement & Delivery Reconciliation Engine, Inter-Branch Transfer Router, and Regulatory Quarantine Manager.\n' +
            '• Tier 3: Persistence & Storage Layer (ACID Relational Store: PostgreSQL / SQLite) maintaining the Medicine Catalog & SKU Index (420+ items), Active Batches & Expiry Timestamp Index, Purchase Orders & Goods Receipt Notes (GRN), Inter-Branch Stock Requisitions, Movement Transaction Logs, and Supplier Provenance Audit Trails.\n\n' +
            '3.6.2 Database Relational Schema and Entity-Relationship Diagram (ERD)\n' +
            'The database schema decomposes pharmaceutical data into normalized 3NF relational entities: MEDICINE, MEDICINE_BATCH, SUPPLIER, PURCHASE_ORDER, GOODS_RECEIPT, STOCK_REQUISITION, INVENTORY_TRANSACTION, USER_ACCOUNT, STOCKTAKE_LOG, and AUDIT_LOG. Primary and foreign key constraints guarantee relational integrity across supplier shipments, physical shelf locations, and dispense allocations, while compound indices on (medicine_id, expiry_date) ensure sub-millisecond FEFO priority queries.\n\n' +
            '3.6.3 Dynamic Interaction and UML Sequence Modeling\n' +
            'When an inventory officer requests stock allocation for a given quantity Qreq, the PIMS client queries the FEFO Engine, which pulls active batches from the database. The engine immediately filters expired stock (triggering hard quarantine locks), sorts remaining batches by earliest expiry, reserves required units across one or more batches, and commits the transaction atomically to the audit ledger.\n\n' +
            '3.6.4 Algorithmic FEFO Queue Specification\n' +
            'Algorithm 1: Automated First-Expiry-First-Out (FEFO) Batch Allocation Engine\n' +
            'Input: Medicine Mid, Requested Quantity Qreq, Current Date Dnow\n' +
            'Output: Allocated Batch List A = {(Bi, qi)} or Error Exception\n' +
            '1. Fetch all active batches Bactive for Mid.\n' +
            '2. For each batch b in Bactive:\n' +
            '     Calculate Δdays = DateDifferenceInDays(b.expiryDate, Dnow)\n' +
            '     If Δdays <= 0: TriggerHardRegulatoryLock(b) [Quarantine: Prohibited]\n' +
            '     Else: Add b to valid batch set Bvalid.\n' +
            '3. If Sum(b.currentQuantity for b in Bvalid) < Qreq: Return Error("Insufficient unexpired stock").\n' +
            '4. Sort Bvalid ascending by expiry date (earliest expiring first).\n' +
            '5. Initialize remaining quantity Qrem = Qreq and allocated list A = empty.\n' +
            '6. For each b in Bvalid:\n' +
            '     If Qrem == 0: break\n' +
            '     qalloc = min(b.currentQuantity, Qrem)\n' +
            '     A = A union {(b, qalloc)}\n' +
            '     Qrem = Qrem - qalloc\n' +
            '7. Return allocated batch list A.',
          }),

          new Paragraph({ text: '3.7 Empirical Results and System Demonstration', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'This section presents empirical results and live verification from the active project deployment at Kaziniya Drug Store. In accordance with the defined internship scope, the demonstration focuses squarely on the pharmaceutical inventory management and automated FEFO allocation engine, followed by warehouse stock health monitoring, mobile optical barcode stocktaking, and financial stock reconciliation reports.\n\n' +
            '3.7.1 Workstation Gateway and Multi-Role Access Control',
          }),
          getImg('documentation/latex_report/figures/fig_gateway_login.png', 480, 260),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [new TextRun({ text: 'Figure 3.6: Real Project Screenshot: Digital Drug Store (DDS) Workstation Gateway and Security Portal.', bold: true, italics: true, size: 20 })],
          }),
          new Paragraph({
            text: 'Technical Analysis: The gateway implements a high-security split-canvas interface. The top regulatory strip displays live telemetry indicating active connection to the Ethiopian Food and Drug Authority (EFDA) and Tax Identification Number (TIN: 0098234123) verification services. The right authentication card provides a three-character Role-Based Access Control (RBAC) mechanism distinguishing between Super Administrator, Drug Store Owner, and Licensed Pharmacist. Staff profiles requiring first-time password changes are intercepted by forced security prompts, guaranteeing institutional credential hygiene.\n\n' +
            '3.7.2 Executive Dashboard Overview and Stock Health KPIs',
          }),
          getImg('documentation/latex_report/figures/fig_dashboard_overview.png', 480, 260),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [new TextRun({ text: 'Figure 3.7: Real Project Screenshot: Executive Management Dashboard Overview and Real-Time Stock Health KPIs.', bold: true, italics: true, size: 20 })],
          }),
          new Paragraph({
            text: 'Technical Analysis: The overview dashboard aggregates real-time inventory and operational intelligence. At a single glance, the inventory manager and pharmacist monitor: Total active catalog medicines (120 managed SKUs in the active demonstrator), real-time gross inventory valuation, daily stock transaction counts, immediate visual warnings for low-stock items falling below calibrated reorder thresholds, and urgent expiry alerts highlighting batches within the 90-day critical degradation window.\n\n' +
            '3.7.3 FEFO Inventory Management and Batch Expiry Safeguard Engine',
          }),
          getImg('documentation/latex_report/figures/fig_fefo_inventory.png', 480, 260),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [new TextRun({ text: 'Figure 3.8: Real Project Screenshot: FEFO Inventory Management and Automated Batch Expiry Safeguard Engine.', bold: true, italics: true, size: 20 })],
          }),
          new Paragraph({
            text: 'Technical Analysis: This module provides complete transparency over physical stock across warehouse shelves. Each medicine row expands to reveal individual production batches, their manufacturing dates, expiry dates, supplier source, and unit purchase versus selling prices. Color-coded badges instantly notify warehouse staff: Emerald (>180 days: healthy), Amber (30–90 days: expiring soon), and Rose/Red (Expired: locked & quarantined). Stock managers can adjust quantities, quarantine damaged lots, and update shelf locations in real time.\n\n' +
            '3.7.4 Mobile Barcode Scanner for Warehouse Shelf Stocktaking',
          }),
          getImg('documentation/latex_report/figures/fig_mobile_pos.png', 480, 260),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [new TextRun({ text: 'Figure 3.9: Real Project Screenshot: Companion Mobile Scanner for Warehouse Shelf Stocktaking.', bold: true, italics: true, size: 20 })],
          }),
          new Paragraph({
            text: 'Technical Analysis: To accommodate staff conducting inventory stocktaking directly in warehouse aisles, the companion mobile application (engineered with Flutter/Dart) provides handheld inventory management on smartphone form factors. The simulator displays the camera barcode scanning viewfinder, real-time packaging OCR text parsing, and Bluetooth receipt printer pairing utilities, reducing physical stocktaking time from 16 hours to 2.5 hours.\n\n' +
            '3.7.5 Financial Inventory Valuation, Stock Movement Ledger, and EFDA Reports',
          }),
          getImg('documentation/latex_report/figures/fig_reports_accounting.png', 480, 260),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 180 },
            children: [new TextRun({ text: 'Figure 3.10: Real Project Screenshot: Financial Analytics, Inventory Valuation, and Stock Movement Ledger.', bold: true, italics: true, size: 20 })],
          }),
          new Paragraph({
            text: 'Technical Analysis: In strict adherence to Ethiopian Ministry of Revenues and EFDA directives, the financial reporting suite compiles daily, weekly, and monthly closing ledgers. The module computes: Gross Stock Movements and Valuation, Cost of Goods Sold (COGS) calculated via precise batch purchase costs, Stock Discrepancy Audits tracking variances between digital inventory records and physical stock counts, and One-Click Fiscal and Inventory Audit Export outputting formatted PDF documents matching regulatory inspection requirements.',
          }),

          new Paragraph({ text: '3.8 Functional Verification and Testing Matrix', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'To confirm that all inventory subsystems execute with verified reliability and adhere to EFDA pharmaceutical storage mandates, comprehensive functional verification was conducted during live operations at Kaziniya Drug Store. Table 3.2 details the test cases, validation criteria, and operational outcomes across all ten core functional dimensions.',
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Test ID', bold: true })] })] }),
                  new TableCell({ width: { size: 26, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Module / Function', bold: true })] })] }),
                  new TableCell({ width: { size: 44, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Verification Criteria', bold: true })] })] }),
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Outcome', bold: true })] })] }),
                ],
              }),
              ...[
                ['TC-01', 'Multi-Batch Data Model (3NF)', 'Single medicine SKU maintains distinct batches with independent expiry dates and shelf locations without data collisions', 'Passed (3NF verified)'],
                ['TC-02', 'Procurement & GRN Receiving', 'Delivery quantity matched against PO with discrepancy flagging, batch inspection, and AP ledger credit', 'Passed (100% matched)'],
                ['TC-03', 'Automated FEFO Allocation', 'Allocating 50 units automatically pulls first from batch expiring in 45 days before batch expiring in 180 days', 'Passed (min(Exp) queue)'],
                ['TC-04', 'Expiry Quarantine Safeguard', 'Batch with Δdays ≤ 0 triggers hard software lock prohibiting picking, dispensing, or transfer', 'Passed (100% blocked)'],
                ['TC-05', 'Mobile Optical Scanner', 'Rolling 5-frame accumulator accurately parses curved medicine vial packaging with ambient glare', 'Passed (<3.5% error)'],
                ['TC-06', 'Concurrency Mutex Hold', 'Simultaneous stock allocations from identical batch resolve atomically without negative balances', 'Passed (Zero drift)'],
                ['TC-07', 'Dynamic Reorder Alerting', 'Inventory count dropping below calibrated safety threshold triggers instant visual warnings and reorders', 'Passed (Instant alert)'],
                ['TC-08', 'Branch Stock Requisition', 'Electronic stock transfer between main warehouse and dispensary shelves with transit tracking', 'Passed (Zero loss)'],
                ['TC-09', 'Financial COGS & Valuation', 'Accurate real-time computation of inventory asset valuation and batch purchase costs', 'Passed (COGS verified)'],
                ['TC-10', 'Immutable EFDA Audit Trail', 'Chronological tamper-evident audit trail recorded for all stock operations (RECEIPT, TRANSFER, ADJUST, DISPOSAL)', 'Passed (EFDA compliant)'],
              ].map(
                ([id, mod, crit, out]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: id, bold: true })] })] }),
                      new TableCell({ width: { size: 26, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: mod })] }),
                      new TableCell({ width: { size: 44, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: crit })] }),
                      new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: out, bold: true, color: '059669' })] })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '3.9 System Performance and Quantitative Impact Evaluation', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'To validate the practical utility of the DDS Inventory Platform, empirical performance benchmarks were conducted comparing baseline manual operations against the digitized platform. Table 3.1 summarizes these quantitative findings.',
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 38, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Operational Metric', bold: true })] })] }),
                  new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Baseline (Manual)', bold: true })] })] }),
                  new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'With DDS Platform', bold: true })] })] }),
                  new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Gain', bold: true })] })] }),
                ],
              }),
              ...[
                ['Batch Expiry Identification Latency', '15 minutes / shelf', '< 0.2 seconds', '99.8% ↓'],
                ['Expired Medicine Accidental Allocation', '1.4% of picks', '0.0% (Hard Locked)', '100% ↓'],
                ['Monthly Shelf Expiration Value Loss', '9.8% total value', '1.2% total value', '87.7% ↓'],
                ['Warehouse Physical Stocktaking Time', '16 hours (2 days)', '2.5 hours', '84.4% ↓'],
                ['Critical Drug Stockout Incidents/Mo.', '14 critical SKUs', '2 critical SKUs', '85.7% ↓'],
                ['Daily Stock Reconciliation Audit Time', '45 minutes', '3 seconds', '99.8% ↓'],
              ].map(
                ([metric, base, pims, gain]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 38, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: metric })] }),
                      new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: base })] }),
                      new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: pims, bold: true })] })] }),
                      new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: gain, bold: true, color: '059669' })] })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '3.10 Recommendations Regarding Identified Problems', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Based on the experimental outcomes and operational deployment of the system, the following recommendations are submitted:\n' +
            '1. Institutional Mandatory Adoption of FEFO: Community pharmacies should formally outlaw FIFO practices in medication management; software-enforced FEFO queues should be adopted as a prerequisite for annual EFDA dispensing license renewal.\n' +
            '2. Integration with National EPSS Logistics APIs: The platform should be interfaced directly with the Ethiopian Pharmaceuticals Supply Service (EPSS) warehouse database to facilitate automated procurement reordering when local stock falls below safety buffers.\n' +
            '3. Handheld Hardware Scanner Standardization: While camera OCR and software decoding on smartphones demonstrated high efficacy, equipping warehouse staff with ruggedized 2D USB/Bluetooth barcode wands further eliminates ambient glare issues and optimizes physical stocktaking throughput.',
          }),

          // -------------------------------------------------------------
          // CHAPTER 4: BENEFITS GAINED AND REFLECTION
          // -------------------------------------------------------------
          new Paragraph({ text: 'CHAPTER 4: BENEFITS GAINED FROM THE INTERNSHIP AND REFLECTION', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '4.1 Practical Skills Improved', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Prior to this industrial attachment, our software development exposure was largely confined to academic coursework, controlled laboratory assignments, and textbook exercises. Working inside Kaziniya Drug Store on a mission-critical healthcare application fundamentally elevated our practical engineering capabilities:\n' +
            '• Full-Stack Modern Web Engineering: Attained production-level fluency in modern TypeScript, React 19, custom hook authoring, context state architecture, and Tailwind CSS.\n' +
            '• High-Performance Runtimes: Mastered configuring and debugging Node.js and Bun runtime servers, architecting resilient Express.js RESTful API endpoints with payload streaming and memory optimization.\n' +
            '• Client-Side Computer Vision: Implemented continuous optical character recognition (OCR) and barcode frame processing, tuning regular expression engines and Levenshtein distance metrics to parse imperfect pharmaceutical packaging labels.\n' +
            '• Mobile Development with Flutter/Dart: Built responsive, cross-platform mobile interfaces capable of interfacing with hardware camera sensors, device local storage, and Bluetooth peripherals.',
          }),

          new Paragraph({ text: '4.2 Theoretical Knowledge Upgraded', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The internship provided an invaluable empirical testbed for theoretical computer science principles taught in the classroom:\n' +
            '• Advanced Algorithmic Design: Practical application of priority queue structures and greedy scheduling in implementing the First-Expiry-First-Out (FEFO) automated allocation engine.\n' +
            '• Database Theory and Transaction Management: Deepened theoretical understanding of relational algebra, Boyce-Codd Normal Form (BCNF) normalization, database indexing performance, and ACID transaction isolation levels required to prevent double-allocation race conditions.\n' +
            '• Mathematical Supply Chain Logistics: Bridged statistical theory with practical implementation by formulating safety stock buffers, economic order quantity principles, and seasonal index trend models for pharmaceutical inventory control.',
          }),

          new Paragraph({ text: '4.3 Industrial Problem-Solving Capability', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'In academic settings, software problems are cleanly defined with static datasets and predictable parameters. In an active community drug store, problems are messy, dynamic, and unpredictable:\n' +
            '• When low-cost mobile cameras failed to decode wrinkled or curved vial packaging, we did not abandon optical scanning; instead, we engineered a multi-angle temporal frame accumulator and consensus voting filter that resolved the issue.\n' +
            '• When concurrent stock allocations produced inventory drift, we architected a transactional soft-hold mutex that preserved data integrity without degrading system responsiveness.\n' +
            'These experiences cultivated a robust, resilient mindset focused on root-cause analysis, defensive programming, and rapid empirical prototyping.',
          }),

          new Paragraph({ text: '4.4 Team Playing Skills', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Working in an interdisciplinary environment alongside licensed pharmacists, inventory logistics officers, store managers, and warehouse personnel highlighted the critical importance of collaborative synergy. We learned to:\n' +
            '• Translate complex technical concepts (such as latency, cache invalidation, and data schemas) into plain clinical terminology that pharmacists could readily evaluate.\n' +
            '• Actively listen to end-user pain points during stressful peak operational hours without becoming defensive about initial UI design choices.\n' +
            '• Participate in agile sprint standups and code reviews, respecting user feedback as the ultimate arbiter of software quality.',
          }),

          new Paragraph({ text: '4.5 Leadership Skills', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'As the student engineering team spearheading the DDS platform, we were entrusted with end-to-end technical stewardship:\n' +
            '• Defining the technology stack, software architecture, and development roadmaps.\n' +
            '• Managing sprint milestones, triaging critical bugs, and scheduling warehouse pilot deployments to avoid disrupting clinical operations.\n' +
            '• Leading staff training sessions and authoring intuitive user documentation that empowered non-technical pharmacy personnel to operate the system with confidence.',
          }),

          new Paragraph({ text: '4.6 Work Ethics, Industrial Psychology, and Patient Privacy', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Operating within a healthcare facility instilled a profound appreciation for professional ethics, human psychology, and patient confidentiality:\n' +
            '• Data Integrity and Commercial Confidentiality: Recognizing that pharmaceutical inventory valuation, batch supplier pricing, and controlled medication stock records are highly sensitive assets requiring strict cryptographic role-based access control.\n' +
            '• Industrial Psychology under Operational Stress: Observing how cognitive fatigue during long night shifts impairs human concentration, which reinforced the design necessity of large, high-contrast visual cues, hard confirmation dialogs for dangerous drugs, and automated expiration safeguards.\n' +
            '• Punctuality and Professional Accountability: Maintaining rigorous uptime discipline, recognizing that a server crash or database deadlock directly halts warehouse stock allocation and emergency supply chains.',
          }),

          new Paragraph({ text: '4.7 Entrepreneurship Skills', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The internship served as an eye-opening incubator for healthcare technology entrepreneurship:\n' +
            '• We developed a keen awareness of health-tech commercialization in emerging markets, identifying how digital solutions must deliver undeniable return on investment (such as reducing expiration losses by over 85%) to achieve voluntary market adoption.\n' +
            '• We gained practical knowledge in regulatory compliance economics, tax reporting mandates, and software-as-a-service (SaaS) subscription models tailored for independent retail drug stores across East Africa.',
          }),

          new Paragraph({ text: '4.8 Interpersonal Communication Skills', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Communicating daily across diverse professional backgrounds refined our communication repertoire:\n' +
            '• Learned to conduct structured stakeholder interviews to extract hidden user requirements.\n' +
            '• Developed compelling presentation techniques to demonstrate software prototypes to executive directors.\n' +
            '• Mastered clear, empathetic interpersonal communication with warehouse inventory clerks and stocktaking staff during physical counts.',
          }),

          new Paragraph({ text: '4.9 Fit with Career Goals', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Our career ambitions have always centered on practicing as leading Information Technology specialists, systems architects, and software engineers specializing in high-impact distributed systems and digital health infrastructure. This internship perfectly aligned with that objective by providing unconstrained hands-on ownership of an enterprise-grade pharmaceutical inventory platform from inception to production deployment.',
          }),

          new Paragraph({ text: '4.10 Evolution of Career Goals', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'Prior to this placement, we viewed information technology and software systems primarily through a theoretical, classroom lens. This industrial immersion fundamentally transformed our perspective: we now appreciate that the most elegant code is meaningless unless it solves acute human pain points, operates seamlessly within local infrastructural constraints (such as intermittent internet connectivity and commodity hardware), and complies strictly with regulatory standards. Our career focus has crystallized toward engineering robust, offline-first digital public health systems for developing nations.',
          }),

          new Paragraph({ text: '4.11 Value of the Internship Experience', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'We consider this practical industrial attachment (July 1, 2026 – August 15, 2026) to be the single most transformative educational experience of our undergraduate degree program. It dismantled the artificial boundary between academic theory and real-world industrial practice, giving us the confidence, technical maturity, and professional discipline required to enter the technology workforce as impactful IT professionals.',
          }),

          new Paragraph({ text: '4.12 Challenges Faced During the Internship', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The journey was not without significant obstacles:\n' +
            '• Balancing Development Sprints with Active Warehouse Storage Logistics: Implementing software changes inside a pharmacy operating 24 hours a day required extraordinary care; database migrations and server restarts had to be coordinated during low-volume hours (typically 3:00 AM – 5:00 AM).\n' +
            '• Steep Regulatory Learning Curve: Mastering the complex landscape of EFDA pharmaceutical schedules, narcotic tracking rules, and Ministry of Revenues tax codes required weeks of intensive manual reading and consultations with pharmacists.',
          }),

          new Paragraph({ text: '4.13 Self-Evaluation: Strengths and Areas for Improvement', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '4.13.1 Key Strengths Demonstrated\n' +
            '• Rapid Technical Adaptability: Quickly evaluating, adopting, and mastering novel frameworks (React 19, Bun runtime, Flutter camera packages) to solve architectural bottlenecks.\n' +
            '• High Ownership and Autonomy: Proactively identifying operational defects (e.g., lack of automated stock discrepancy ledgers and batch expiration alerts) and engineering comprehensive solutions without requiring micro-management.\n' +
            '• Empathy-Driven UI/UX Design: Designing uncluttered, highly intuitive inventory heads-up displays (HUD) and mobile stocktaking interfaces tailored for rapid warehouse auditing.\n\n' +
            '4.13.2 Areas for Professional Improvement\n' +
            '• Formal Automated End-to-End Testing: While unit testing was rigorously conducted on core logic, incorporating automated browser testing suites (such as Playwright or Cypress) earlier in the development lifecycle would have accelerated on-site warehouse stocktaking pilot validation.\n' +
            '• Task Specialization and Time Allocation: In the initial weeks, we attempted to handle every aspect of the project simultaneously (database design, UI styling, user manuals, hardware setup). Learning to divide sub-modules efficiently between team members improved overall development velocity.',
          }),

          // -------------------------------------------------------------
          // CHAPTER 5: CONCLUSION AND RECOMMENDATIONS
          // -------------------------------------------------------------
          new Paragraph({ text: 'CHAPTER 5: CONCLUSION AND RECOMMENDATIONS', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: '5.1 Overall Conclusion', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'The industrial internship at Kaziniya Drug Store (conducted from July 1, 2026 to August 15, 2026) successfully achieved all formulated academic, engineering, and operational objectives. Through the conceptualization, development, and live deployment of the Kaziniya Drug Store Pharmaceutical Inventory Management System (PIMS), a tangible, high-impact digital transformation was brought to community pharmacy practice in Ethiopia, with an uncompromising focus on solving pharmaceutical inventory bottlenecks.\n\n' +
            'The major milestones accomplished during this work include:\n' +
            '1. Total Elimination of Expired Drug Allocation: The automated First-Expiry-First-Out (FEFO) scheduling engine successfully enforced zero-tolerance expiration locks, completely eliminating the accidental selection or allocation of degraded medications.\n' +
            '2. Drastic Reduction in Economic Stock Losses: By proactively flagging batches entering the critical 90-day degradation window and prioritizing their allocation, projected inventory expiration write-offs were reduced by 87.7%.\n' +
            '3. Accelerated Inventory Stocktaking: Optical packaging scanning and barcode parsing reduced warehouse stocktaking duration by 84.4% (from 16 hours down to 2.5 hours), eliminating operational shutdowns.\n' +
            '4. Complete Stock Auditability and Regulatory Compliance: The platform established an immutable stock movement ledger and automated inventory valuation matching EFDA criteria.\n' +
            '5. Comprehensive Inventory Health and Financial Governance: The platform established automated real-time Cost of Goods Sold (COGS) tracking, gross stock asset valuation, and low-stock reorder thresholds, enabling proactive warehouse procurement and eliminating stockouts of vital medicines.\n\n' +
            'In summary, this internship demonstrated that modern information technology and software engineering methodologies—when grounded in rigorous domain analysis and empathetic user-centered design—possess immense transformative potential to solve deep-seated healthcare bottlenecks in developing nations.',
          }),

          new Paragraph({ text: '5.2 Recommendations Regarding the Hosting Company', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: '5.2.1 Evaluation for Future Student Placement\n' +
            'Verdict: Enthusiastically and Unequivocally Recommended.\n' +
            'Kaziniya Drug Store represents an outstanding, exemplary industrial training host for future Information Technology (IT), Computer Science, and Software Engineering students from Haramaya University.\n\n' +
            'The rationale for this strong recommendation is grounded in:\n' +
            '• Exemplary Executive and Clinical Mentorship: Immediate Supervisor Monet Alemayehu and the pharmacy leadership demonstrated an exceptional commitment to student mentorship, treating the student interns not as peripheral temporary labor, but as valued technical partners.\n' +
            '• Rich, Real-World Engineering Problem Space: Unlike organizations that assign interns trivial data-entry chores or superficial website updates, Kaziniya Drug Store provided unrestricted access to complex, mission-critical systems where high concurrency, regulatory compliance, and life-or-death healthcare accuracy intersect.\n' +
            '• Dynamic and Supportive Culture: The pharmacy staff actively engaged in feedback sessions, embraced innovative technological tools with open minds, and fostered an environment of mutual professional respect.\n\n' +
            '5.2.2 Recommendations for Kaziniya Drug Store\n' +
            'To sustain and expand the digital advancements achieved through the DDS platform, the following measures are recommended to the company management:\n' +
            '1. Transition to Cloud Infrastructure with Offline Edge Caching: While the local on-premise server deployment provides high intra-store throughput, establishing automated off-site cloud backups (e.g., via secure PostgreSQL / Cloud Run instances) will guarantee business continuity in the event of local hardware failure.\n' +
            '2. Hardware Scanner Standardizations: Equipping warehouse staff with dedicated 2D handheld USB barcode scanners will complement the mobile camera scanning features and further streamline physical shelf auditing.\n' +
            '3. Institutionalizing Permanent Software Engineering Roles: Given the growing scale of the pharmacy and its digital modernization ambitions, establishing a permanent in-house IT and digital health position will ensure continuous feature updates and data maintenance.',
          }),

          new Paragraph({ text: '5.3 Recommendations for Improving the University Internship', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: 'To further strengthen the academic and practical impact of the university internship curriculum, the following constructive recommendations are submitted to the Department of Information Technology (IT), the College of Computing and Informatics (CCI), and the Haramaya University Internship Coordination Directorate:\n' +
            '1. Extension of Industrial Internship Duration: A 7-week period is intensely compressed when developing an enterprise-grade platform from requirements gathering through architecture, coding, testing, and production deployment. Extending the industrial placement to a full semester (12 to 16 weeks) would allow students to conduct deeper longitudinal performance evaluations and iterative user studies.\n' +
            '2. Introduction of Pre-Internship Regulatory and Industrial Seminar Courses: Students embarking on internships in specialized industries (such as healthcare, banking, telecommunications, and aviation) frequently encounter steep learning curves regarding legal and regulatory compliance frameworks. Incorporating short pre-internship workshops on regulatory standards (such as EFDA, Ethiopian National Bank directives, and data protection laws) would significantly accelerate student integration into hosting organizations.\n' +
            '3. Strengthening Tripartite Academic-Industrial Milestone Reviews: Structuring mid-term evaluation reviews with direct joint participation from both the academic faculty advisor and the industrial supervisor on-site ensures closer alignment between academic expectations and company deliverables.',
          }),

          // -------------------------------------------------------------
          // REFERENCES & APPENDICES
          // -------------------------------------------------------------
          new Paragraph({ text: 'REFERENCES', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: '[1] World Health Organization (WHO), “Guidelines on good storage and distribution practices for medical products,” WHO Technical Report Series, no. 1025, pp. 111–152, 2023.\n\n' +
            '[2] R. Kaushal, D. W. Bates, C. Landrigan, K. J. McKenna, M. D. Clapp, F. Federico, and D. A. Goldmann, “Medication errors and adverse drug events in pediatric inpatients,” JAMA, vol. 285, no. 16, pp. 2114–2120, 2001.\n\n' +
            '[3] Ethiopian Pharmaceuticals Supply Service (EPSS), “National strategy for health commodity inventory optimization and wastage reduction,” EPSS Operational Bulletin, vol. 14, pp. 45–68, 2022.\n\n' +
            '[4] E. H. Shortliffe and M. J. Sepúlveda, “Clinical decision support in the digital age: Foundational principles and future horizons,” Journal of Healthcare Informatics Research, vol. 2, no. 3, pp. 203–229, 2018.',
          }),

          new Paragraph({ text: 'APPENDIX A: CORE TYPESCRIPT DOMAIN MODELS AND SCHEMA DEFINITIONS', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: 'Listing A.1: Core TypeScript Domain Models for Medicines, Batches, and Transactions\n\n' +
            'export interface Medicine {\n' +
            '  id: string;\n' +
            '  barcode: string;\n' +
            '  sku: string;\n' +
            '  name: string;\n' +
            '  genericName: string;\n' +
            '  brandName?: string;\n' +
            '  categoryId: string;\n' +
            '  dosageForm: string; // "Tablet" | "Capsule" | "Suspension" | "IV" | etc.\n' +
            '  strength: string; // e.g. "500 mg", "1 g", "200/5 mg/ml"\n' +
            '  unit: string; // "Box" | "VIAL" | "Bottle" | "Tube"\n' +
            '  manufacturer: string;\n' +
            '  description: string;\n' +
            '  prescriptionRequired: boolean;\n' +
            '  reorderLevel: number;\n' +
            '  shelfLocation?: string;\n' +
            '  status: "Active" | "Low Stock" | "Out of Stock" | "Expired";\n' +
            '  createdAt: string;\n' +
            '  updatedAt: string;\n' +
            '}\n\n' +
            'export interface MedicineBatch {\n' +
            '  id: string;\n' +
            '  medicineId: string;\n' +
            '  batchNumber: string;\n' +
            '  manufacturingDate: string; // ISO YYYY-MM-DD\n' +
            '  expiryDate: string; // ISO YYYY-MM-DD\n' +
            '  purchasePrice: number; // Cost of Goods Sold (COGS)\n' +
            '  sellingPrice: number; // Retail dispensing price\n' +
            '  initialQuantity: number;\n' +
            '  currentQuantity: number;\n' +
            '  supplierId: string;\n' +
            '  status?: "GOOD" | "EXPIRING_SOON" | "EXPIRED";\n' +
            '  createdAt: string;\n' +
            '}\n\n' +
            'export interface InventoryTransaction {\n' +
            '  id: string;\n' +
            '  medicineId: string;\n' +
            '  medicineName: string;\n' +
            '  batchId: string;\n' +
            '  batchNumber: string;\n' +
            '  transactionType: "INITIAL_STOCK" | "ALLOCATION" | "PURCHASE" | "RETURN" | "ADJUSTMENT" | "DISPOSAL";\n' +
            '  quantity: number;\n' +
            '  previousQuantity: number;\n' +
            '  newQuantity: number;\n' +
            '  performedBy: string;\n' +
            '  notes?: string;\n' +
            '  createdAt: string;\n' +
            '}',
          }),

          new Paragraph({ text: 'APPENDIX B: CONTINUOUS PACKAGING SCANNER AND FRAME BUFFER ALGORITHM', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            text: 'Listing B.1: Continuous Optical Packaging Parser with Multi-Frame Voting\n\n' +
            'export function parsePackagingText(rawOcrText: string): ParsedPackagingData {\n' +
            '  if (!rawOcrText || rawOcrText.trim().length === 0) {\n' +
            '    return { confidence: 0, rawTokens: [] };\n' +
            '  }\n' +
            '  const cleanText = rawOcrText.replace(/\\r?\\n/g, " ").toUpperCase();\n' +
            '  // 1. Regular expression extraction for dosage strengths\n' +
            '  const strengthMatch = cleanText.match(/\\b(\\d+(?:\\.\\d+)?)\\s*(MG|G|GM|ML|%|MCG|IU)\\b/i);\n' +
            '  const detectedStrength = strengthMatch ? strengthMatch[0].trim() : undefined;\n\n' +
            '  // 2. Regular expression extraction for dosage forms\n' +
            '  const formPatterns = ["TABLET", "CAPSULE", "INJECTION", "VIAL", "SUSPENSION", "CREAM", "OINTMENT", "DROPS", "SYRUP"];\n' +
            '  let detectedForm: string | undefined = undefined;\n' +
            '  for (const form of formPatterns) {\n' +
            '    if (cleanText.includes(form)) { detectedForm = form; break; }\n' +
            '  }\n\n' +
            '  // 3. Batch number pattern extraction (BN, LOT, BATCH)\n' +
            '  const batchMatch = cleanText.match(/(?:BN|LOT|BATCH|B\\.NO|B\\/N)[\\s.:#-]*([A-Z0-9]{4,15})/i);\n' +
            '  const detectedBatch = batchMatch ? batchMatch[1].trim() : undefined;\n\n' +
            '  // 4. Expiration date pattern extraction (EXP, EXPIRY)\n' +
            '  const expMatch = cleanText.match(/(?:EXP|EXPIRY|ED)[\\s.:#-]*([0-1]?[0-9][\\/-][2-9][0-9](?:[0-9]{2})?)/i);\n' +
            '  const detectedExpiry = expMatch ? expMatch[1].trim() : undefined;\n\n' +
            '  return {\n' +
            '    strength: detectedStrength,\n' +
            '    dosageForm: detectedForm,\n' +
            '    batchNumber: detectedBatch,\n' +
            '    expiryDate: detectedExpiry,\n' +
            '    confidence: (detectedStrength ? 0.35 : 0) + (detectedForm ? 0.25 : 0) + (detectedBatch ? 0.25 : 0) + (detectedExpiry ? 0.15 : 0),\n' +
            '    rawTokens: cleanText.split(/\\s+/).filter(t => t.length > 2)\n' +
            '  };\n' +
            '}',
          }),

          new Paragraph({ text: 'APPENDIX C: EFDA COMMUNITY DRUG STORE INSPECTION AND COMPLIANCE CHECKLIST', heading: HeadingLevel.HEADING_1 }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorderLight,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Item', bold: true })] })] }),
                  new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Inspection Parameter (EFDA Guidelines)', bold: true })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'PIMS Technical Control', bold: true })] })] }),
                  new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
                ],
              }),
              ...[
                ['1.0', 'Batch Traceability & Recording', 'Mandatory batchNumber on all transactions', 'Compliant'],
                ['2.0', 'Prevention of Expired Drug Allocation', 'Hard software lock on Δdays ≤ 0 prohibiting batch picking', 'Compliant'],
                ['3.0', 'First-Expiry-First-Out (FEFO) Adherence', 'Automated min(ExpiryDate) priority queue', 'Compliant'],
                ['4.0', 'Prescription Storage & Category Index', 'EFDA Schedule Rx flag enforced on high-potency SKUs', 'Compliant'],
                ['5.0', 'Cold-Chain Biological Storage Record', 'Digital temperature status logging flag', 'Compliant'],
                ['6.0', 'Inventory Movement & Physical Auditing', 'Automated daily stock movement ledger & valuation export', 'Compliant'],
                ['7.0', 'Tamper-Proof Audit Logging', 'Immutable chronological audit log stream', 'Compliant'],
              ].map(
                ([item, param, ctrl, stat]) =>
                  new TableRow({
                    children: [
                      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: item })] }),
                      new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: param })] }),
                      new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ text: ctrl })] }),
                      new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, borders: tableBorderLight, children: [new Paragraph({ children: [new TextRun({ text: stat, bold: true, color: '059669' })] })] }),
                    ],
                  })
              ),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// Command-line execution
if (process.argv[1]?.endsWith('build_final_pims_docx.ts')) {
  generatePimsDocx().then((buffer) => {
    const docxPath = path.join(process.cwd(), 'documentation', 'Kaziniya_PIMS_Internship_Report.docx');
    const ddsDocxPath = path.join(process.cwd(), 'documentation', 'Kaziniya_DDS_Inventory_Internship_Report.docx');
    const publicPath = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');
    const publicDdsPath = path.join(process.cwd(), 'public', 'Kaziniya_DDS_Inventory_Internship_Report.docx');
    fs.writeFileSync(docxPath, buffer);
    fs.writeFileSync(ddsDocxPath, buffer);
    fs.writeFileSync(publicPath, buffer);
    fs.writeFileSync(publicDdsPath, buffer);
    console.log(`[Success] Word document generated successfully at:`);
    console.log(`  -> ${docxPath} (${buffer.length} bytes)`);
    console.log(`  -> ${publicPath} (${buffer.length} bytes)`);
  });
}
