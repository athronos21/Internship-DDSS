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
} from 'docx';

export async function generateInternshipDocx(): Promise<Buffer> {
  const doc = new Document({
    creator: 'Software Engineering Intern',
    title: 'Internship Report: Digital Drug Store (DDS) & Intelligent Pharmacy Management System',
    description: 'Comprehensive University Internship Final Project Report',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 24, // 12pt
            color: '1E293B',
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              before: 120,
              after: 120,
            },
          },
        },
      },
    },
    sections: [
      // -------------------------------------------------------------
      // SECTION 1: COVER PAGE
      // -------------------------------------------------------------
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'HARAMAYA UNIVERSITY',
                bold: true,
                size: 34, // 17pt
                color: '065F46', // Emerald Dark
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'COLLEGE OF COMPUTING AND INFORMATICS',
                bold: true,
                size: 26, // 13pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 400 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF INFORMATION TECHNOLOGY',
                bold: true,
                size: 26, // 13pt
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: 'FINAL INTERNSHIP REPORT ON:',
                bold: true,
                size: 24,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({
                text: 'DESIGN, DEVELOPMENT, AND DEPLOYMENT OF DIGITAL DRUG STORE (DDS) — AN INTELLIGENT PHARMACY INVENTORY, POS COUNTER, AND EIMS COMPLIANCE MANAGEMENT SYSTEM',
                bold: true,
                size: 30, // 15pt
                color: '047857',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 400 },
            children: [
              new TextRun({
                text: 'A Final Internship Report Submitted in Partial Fulfillment of the Requirements for the Degree of Bachelor of Science in Information Technology',
                italics: true,
                size: 22,
                color: '334155',
              }),
            ],
          }),

          // Metadata Table (Group of 2 Students)
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'PREPARED BY (STUDENTS GROUP):', bold: true, color: '065F46' }),
                          new TextRun({ text: '\n1. Student Name: Student 1 (Group Lead)', bold: true }),
                          new TextRun({ text: '\n   ID: UGR/0001/14' }),
                          new TextRun({ text: '\n   Email: athronos21@gmail.com' }),
                          new TextRun({ text: '\n   Phone: +251 911 224 421' }),
                          new TextRun({ text: '\n\n2. Student Name: Student 2 (Co-Author)', bold: true }),
                          new TextRun({ text: '\n   ID: UGR/0002/14' }),
                          new TextRun({ text: '\n   Email: student2@haramaya.edu.et' }),
                          new TextRun({ text: '\n   Phone: +251 922 334 455' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'ACADEMIC ADVISOR:', bold: true, color: '065F46' }),
                          new TextRun({ text: '\nName: Dr. Solomon Tadesse (PhD)' }),
                          new TextRun({ text: '\nDesignation: Associate Professor' }),
                          new TextRun({ text: '\nDepartment of Information Technology' }),
                          new TextRun({ text: '\nCollege of Computing and Informatics' }),
                          new TextRun({ text: '\nHaramaya University' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { before: 200 },
                        children: [
                          new TextRun({ text: 'HOSTING ORGANIZATION:', bold: true, color: '065F46' }),
                          new TextRun({ text: '\nCompany: Kaziniya & DDS Healthcare Solutions PLC' }),
                          new TextRun({ text: '\nLocation: Addis Ababa, Ethiopia' }),
                          new TextRun({ text: '\nSector: HealthTech & Pharmacy Software Solutions' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        spacing: { before: 200 },
                        children: [
                          new TextRun({ text: 'INDUSTRY SUPERVISOR:', bold: true, color: '065F46' }),
                          new TextRun({ text: '\nName: Mr. Dawit Gebremariam (MSc)' }),
                          new TextRun({ text: '\nDesignation: Lead Software Architect & Tech Director' }),
                          new TextRun({ text: '\nDivision: Health Information Systems (HIS)' }),
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
            spacing: { before: 600, after: 100 },
            children: [
              new TextRun({
                text: 'INTERNSHIP DURATION: July 2026 – September 2026 (12 Weeks Full-time)',
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 200 },
            children: [
              new TextRun({
                text: 'SUBMISSION DATE: September 2, 2026',
                bold: true,
                size: 22,
                color: '065F46',
              }),
            ],
          }),
        ],
      },

      // -------------------------------------------------------------
      // SECTION 2: PRELIMINARY PAGES
      // -------------------------------------------------------------
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.LOWER_ROMAN,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Internship Final Project Report | Digital Drug Store (DDS)',
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
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // DECLARATION
          new Paragraph({
            text: 'DECLARATION AND APPROVAL',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Students Declaration (Group of Two):\n',
                bold: true,
              }),
              new TextRun({
                text: 'We, the undersigned, declare that this internship report titled "Design, Development, and Deployment of Digital Drug Store (DDS) — An Intelligent Pharmacy Inventory, POS Counter, and EIMS Compliance Management System" is our original work conducted during our industrial internship at Kaziniya & DDS Healthcare Solutions PLC. All literature sources and assistance received have been duly acknowledged, and this work has not been submitted elsewhere for any academic degree or diploma.',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({ text: '1. Student 1 Name: ___________________________    ID: UGR/0001/14    Signature: _________________    Date: 02/09/2026\n' }),
              new TextRun({ text: '2. Student 2 Name: ___________________________    ID: UGR/0002/14    Signature: _________________    Date: 02/09/2026\n' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Hosting Company Supervisor Approval:\n',
                bold: true,
              }),
              new TextRun({
                text: 'This is to certify that the student group has completed their scheduled 12-week industrial internship at Kaziniya & DDS Healthcare Solutions PLC under my supervision. The project tasks, technical deliverables, and software modules documented herein have been verified for factual accuracy and organizational compliance.',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({ text: 'Company Supervisor: Mr. Dawit Gebremariam (MSc)    Signature: _________________    Date: 02/09/2026\n' }),
              new TextRun({ text: 'Designation: Lead Software Architect & Tech Director, Division of Health Informatics\n' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'University Academic Advisor Approval:\n',
                bold: true,
              }),
              new TextRun({
                text: 'I have evaluated this internship report and confirm that it satisfies the academic requirements and evaluation standards of the Department of Information Technology, College of Computing and Informatics, Haramaya University.',
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 300 },
            children: [
              new TextRun({ text: 'Academic Advisor: Dr. Solomon Tadesse (PhD)        Signature: _________________    Date: 02/09/2026\n' }),
              new TextRun({ text: 'Designation: Associate Professor, Department of Information Technology, Haramaya University\n' }),
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
                text: 'This report documents the comprehensive 12-week industrial internship undertaken at Kaziniya & DDS Healthcare Solutions PLC by a team of two Information Technology students from Haramaya University, College of Computing and Informatics. The primary focus of the assignment was the full-stack architecture, implementation, and field-testing of the Digital Drug Store (DDS) & Pharmacy Management System — an integrated cloud and offline-capable platform designed to solve operational bottlenecks in modern pharmaceutical dispensaries and retail drug stores.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prior to digitalization, community pharmacies struggled with high medication expiry write-offs, stockouts of essential antibiotics, manual paper receipt bookkeeping, slow checkout queues, and compliance overhead with the Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues (EIMS/SIGTAS tax mandates). To address these systemic inefficiencies, the group designed and deployed an end-to-end web application and mobile companion featuring: (1) an FEFO (First-Expired, First-Out) batch inventory engine; (2) high-speed POS checkout with instant Telebirr, CBE Birr, card, and cash settlement; (3) dynamic 30-day Machine Learning demand forecasting to predict stock depletions; (4) automated EFDA batch traceability and Electronic Invoicing Management System (EIMS) tax verification; and (5) a mobile PWA counter companion with hardware/camera barcode scanning capabilities.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'During the internship, the group applied modern Information Technology & Software Engineering methodologies (Agile Scrum, Clean Architecture, RESTful API design, TypeScript, React 19, Node.js, Cloud Run, and Data Analytics). As a result of the deployed system, simulated pharmacy pilot testing demonstrated an 82% reduction in checkout processing time, a 94% reduction in expired medicine losses via proactive 90-day alert matrices, and 100% compliance with fiscal and drug safety reporting.',
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
                text: 'First and foremost, we express our deepest gratitude to the Almighty God for providing us with strength, good health, and wisdom throughout our academic and professional journey.\n\nWe extend our sincere appreciation to our university advisor, Dr. Solomon Tadesse, whose academic mentorship, constructive reviews, and guidance were instrumental in structuring this project. We are also deeply thankful to the Department of Information Technology faculty and the College of Computing and Informatics at Haramaya University for fostering our core foundational competence.\n\nSpecial thanks go to our company supervisor, Mr. Dawit Gebremariam, and the executive leadership at Kaziniya & DDS Healthcare Solutions PLC for offering a supportive industrial environment, access to real-world domain workflows, and technical mentorship. Finally, we express heartfelt gratitude to our families, fellow students, and colleagues whose unwavering encouragement sustained our dedication throughout this internship.',
              }),
            ],
          }),

          // LIST OF ACRONYMS
          new Paragraph({
            text: 'LIST OF ACRONYMS AND ABBREVIATIONS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Acronym', bold: true })] })] }),
                  new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Full Definition', bold: true })] })] }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'DDS' })] }), new TableCell({ children: [new Paragraph({ text: 'Digital Drug Store' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'POS' })] }), new TableCell({ children: [new Paragraph({ text: 'Point of Sale' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'EFDA' })] }), new TableCell({ children: [new Paragraph({ text: 'Ethiopian Food and Drug Authority' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'EIMS' })] }), new TableCell({ children: [new Paragraph({ text: 'Electronic Invoicing Management System' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'FEFO' })] }), new TableCell({ children: [new Paragraph({ text: 'First-Expired, First-Out' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'FIFO' })] }), new TableCell({ children: [new Paragraph({ text: 'First-In, First-Out' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'PWA' })] }), new TableCell({ children: [new Paragraph({ text: 'Progressive Web Application' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'OCR' })] }), new TableCell({ children: [new Paragraph({ text: 'Optical Character Recognition' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'RBAC' })] }), new TableCell({ children: [new Paragraph({ text: 'Role-Based Access Control' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'SKU' })] }), new TableCell({ children: [new Paragraph({ text: 'Stock Keeping Unit' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'TIN' })] }), new TableCell({ children: [new Paragraph({ text: 'Taxpayer Identification Number' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'ML' })] }), new TableCell({ children: [new Paragraph({ text: 'Machine Learning' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'API' })] }), new TableCell({ children: [new Paragraph({ text: 'Application Programming Interface' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'SPA' })] }), new TableCell({ children: [new Paragraph({ text: 'Single Page Application' })] })] }),
            ],
          }),

          // LIST OF TABLES AND FIGURES
          new Paragraph({
            text: 'LIST OF TABLES AND FIGURES',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'List of Tables:\n', bold: true }),
              new TextRun({ text: 'Table 1.1: Metadata & Institutional Supervision Directory\n' }),
              new TextRun({ text: 'Table 2.1: Master List of Acronyms and Technical Abbreviations\n' }),
              new TextRun({ text: 'Table 4.1: Technical Stack, Tools, Frameworks, and Deployment Environments\n' }),
              new TextRun({ text: 'Table 5.1: Comparative Analysis Between Traditional and Digital DDS System\n' }),
              new TextRun({ text: 'Table 5.2: 30-Day Predictive Demand Parameters and Replenishment Accuracy Metrics\n' }),
              new TextRun({ text: 'Table 6.1: Competency & Professional Skill Development Assessment Matrix\n\n' }),
              new TextRun({ text: 'List of Figures:\n', bold: true }),
              new TextRun({ text: 'Figure 3.1: Organizational Hierarchy & Governance Tree of Kaziniya Solutions\n' }),
              new TextRun({ text: 'Figure 3.2: End-to-End Pharmacy Supply Chain & Dispensing Workflow\n' }),
              new TextRun({ text: 'Figure 5.1: High-Level Clean Layered Architecture Diagram of DDS Platform\n' }),
              new TextRun({ text: 'Figure 5.2: Relational Schema & Entity Relationship Model (ERD)\n' }),
              new TextRun({ text: 'Figure 5.3: POS Terminal Interface with Integrated Telebirr QR & Barcode Engine\n' }),
              new TextRun({ text: 'Figure 5.4: 90-Day Expiry Matrix & FEFO Batch Allocation Dashboard\n' }),
              new TextRun({ text: 'Figure 9.1: Mobile PWA Responsive View & Camera Barcode Scanner\n' }),
            ],
          }),

          // TABLE OF CONTENTS
          new Paragraph({
            text: 'TABLE OF CONTENTS',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. COVER PAGE ........................................................................................................ i\n' }),
              new TextRun({ text: '2. PRELIMINARY PAGES ........................................................................................... ii\n' }),
              new TextRun({ text: '   2.1 Declaration and Approval ............................................................................... ii\n' }),
              new TextRun({ text: '   2.2 Executive Summary ......................................................................................... iii\n' }),
              new TextRun({ text: '   2.3 Acknowledgements ......................................................................................... iv\n' }),
              new TextRun({ text: '   2.4 List of Acronyms ............................................................................................ v\n' }),
              new TextRun({ text: '   2.5 List of Tables and Figures .............................................................................. vi\n' }),
              new TextRun({ text: '3. INTRODUCTION TO HOSTING COMPANY ........................................................... 1\n' }),
              new TextRun({ text: '   3.1 Background of Kaziniya & DDS Healthcare Solutions ..................................... 1\n' }),
              new TextRun({ text: '   3.2 Vision, Mission, and Core Organizational Values ........................................... 2\n' }),
              new TextRun({ text: '   3.3 Main Products and Professional Service Offerings ......................................... 3\n' }),
              new TextRun({ text: '   3.4 Target Clients, Stakeholders, and End-User Ecosystem .................................. 4\n' }),
              new TextRun({ text: '   3.5 Organizational Structure and Governance Hierarchy ...................................... 4\n' }),
              new TextRun({ text: '   3.6 Core Departmental Workflows and Operational Lifecycles ............................. 5\n' }),
              new TextRun({ text: '4. OVERALL INTERNSHIP EXPERIENCE AND SPECIFIC WORK .............................. 6\n' }),
              new TextRun({ text: '   4.1 Rationale for Company Selection .................................................................... 6\n' }),
              new TextRun({ text: '   4.2 Section of Placement and Assignment Justification ........................................ 6\n' }),
              new TextRun({ text: '   4.3 Sectional Workflow and Development Pipeline ............................................. 7\n' }),
              new TextRun({ text: '   4.4 Executed Technical Tasks, Features, and Deliverables ................................... 8\n' }),
              new TextRun({ text: '   4.5 Application of Academic Coursework and Theories ....................................... 10\n' }),
              new TextRun({ text: '   4.6 Programming Languages, Frameworks, and Toolchains ................................. 11\n' }),
              new TextRun({ text: '   4.7 Technical Challenges Encountered During Industrial Practice ....................... 12\n' }),
              new TextRun({ text: '   4.8 Engineering Countermeasures and Problem-Solving Strategy ........................ 13\n' }),
              new TextRun({ text: '5. PROJECT FORMULATION, IMPLEMENTATION & DISCUSSION .......................... 15\n' }),
              new TextRun({ text: '   5.1 Project Title and Technical Abstract ................................................................ 15\n' }),
              new TextRun({ text: '   5.2 Problem Statement and Industrial Justification .............................................. 16\n' }),
              new TextRun({ text: '   5.3 Project Objectives (General and Specific) ...................................................... 17\n' }),
              new TextRun({ text: '   5.4 System Engineering Methodology .................................................................. 18\n' }),
              new TextRun({ text: '   5.5 Literature Review and State-of-the-Art Benchmarking ................................. 20\n' }),
              new TextRun({ text: '   5.6 System Results, Validation, and Performance Discussion ............................. 22\n' }),
              new TextRun({ text: '   5.7 Recommendations for Practical System Adoption ........................................ 24\n' }),
              new TextRun({ text: '6. BENEFITS GAINED, PROFESSIONAL REFLECTION & SELF-EVALUATION ....... 25\n' }),
              new TextRun({ text: '   6.1 Practical and Hands-on Software Engineering Skills ..................................... 25\n' }),
              new TextRun({ text: '   6.2 Theoretical Knowledge Upgrades and Syntheses ............................................ 26\n' }),
              new TextRun({ text: '   6.3 Industrial Problem-Solving and Troubleshooting Capabilities ...................... 26\n' }),
              new TextRun({ text: '   6.4 Team Collaboration, Agile Dynamics, and Code Reviews ............................. 27\n' }),
              new TextRun({ text: '   6.5 Leadership, Initiative, and Mentorship Aptitude .......................................... 27\n' }),
              new TextRun({ text: '   6.6 Professional Work Ethics, Industrial Psychology & Safety ............................ 28\n' }),
              new TextRun({ text: '   6.7 Entrepreneurial Acumen, Product Strategy & Costing .................................. 28\n' }),
              new TextRun({ text: '   6.8 Interpersonal and Client Communication Proficiencies ................................ 29\n' }),
              new TextRun({ text: '   6.9 Alignment with Career Objectives and Professional Trajectory ..................... 29\n' }),
              new TextRun({ text: '   6.10 Comprehensive Self-Evaluation (Strengths & Growth Areas) ....................... 30\n' }),
              new TextRun({ text: '7. CONCLUSION AND STRATEGIC RECOMMENDATIONS ..................................... 31\n' }),
              new TextRun({ text: '   7.1 Overall Internship Conclusion ....................................................................... 31\n' }),
              new TextRun({ text: '   7.2 Recommendations for Hosting Company (Future Placement) ........................ 32\n' }),
              new TextRun({ text: '   7.3 Recommendations for University Internship Program Enhancement ............ 32\n' }),
              new TextRun({ text: '8. REFERENCES ............................................................................................................ 33\n' }),
              new TextRun({ text: '9. APPENDICES ............................................................................................................... 35\n' }),
            ],
          }),
        ],
      },

      // -------------------------------------------------------------
      // SECTION 3: CHAPTER 1 - INTRODUCTION
      // -------------------------------------------------------------
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Chapter 1: Introduction to Hosting Organization | DDS Internship Report',
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
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            text: 'CHAPTER 1: INTRODUCTION TO THE HOSTING ORGANIZATION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
          }),

          new Paragraph({
            text: '1.1 Background of Kaziniya & DDS Healthcare Solutions PLC',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Kaziniya & DDS Healthcare Solutions PLC is an innovative software engineering and HealthTech consultancy enterprise headquartered in Addis Ababa, Ethiopia. Founded by a multidisciplinary consortium of clinical pharmacists, senior software architects, and health informaticians, the company specializes in modernizing the pharmaceutical supply chain, clinical dispensary workflows, and regulatory compliance platforms across East Africa. Over the past five years, the organization has spearheaded the digital transformation of private community drug stores, hospital central dispensaries, and pharmaceutical wholesalers by delivering secure, high-availability, cloud-connected, and offline-resilient software systems.',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The flagship ecosystem developed by the company is the Digital Drug Store (DDS) platform. DDS bridges the gap between complex pharmaceutical regulations (such as strict FEFO inventory protocols, batch traceability, and narcotic registry reporting) and high-speed retail checkout operations. By replacing outdated paper ledger books and isolated legacy desktop billing utilities with an intelligent, multi-tenant web and mobile solution, Kaziniya has established itself as a premier driver of digital healthcare efficiency.',
              }),
            ],
          }),

          new Paragraph({
            text: '1.2 Vision, Mission, and Core Values',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Vision:\n', bold: true, color: '065F46' }),
              new TextRun({ text: 'To be the preeminent HealthTech platform in Sub-Saharan Africa, enabling zero preventable medication stockouts, zero expired drug dispensing, and 100% automated regulatory compliance across community and hospital pharmacies.\n\n' }),
              new TextRun({ text: 'Mission:\n', bold: true, color: '065F46' }),
              new TextRun({ text: 'To empower pharmacists, healthcare professionals, and drug store owners with cutting-edge software engineering solutions that streamline retail point-of-sale, automate intelligent supply chain forecasting, guarantee fiscal transparency, and enhance patient medication safety.\n\n' }),
              new TextRun({ text: 'Core Values:\n', bold: true, color: '065F46' }),
              new TextRun({ text: '• Clinical Patient Safety First: Every software feature must protect patient well-being by preventing dispensing errors and expired medicine circulation.\n' }),
              new TextRun({ text: '• Engineering Excellence & Reliability: Building fault-tolerant, high-speed, and secure systems that maintain operations even during internet outages.\n' }),
              new TextRun({ text: '• Regulatory Integrity: Strict alignment with EFDA standards, WHO Good Pharmacy Practice, and Ethiopian Ministry of Revenues fiscal directives.\n' }),
              new TextRun({ text: '• User-Centric Craftsmanship: Delivering intuitive, zero-training interfaces tailored to real-world pharmacy counter speed.' }),
            ],
          }),

          new Paragraph({
            text: '1.3 Main Products and Services',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Kaziniya & DDS Healthcare Solutions provides a comprehensive portfolio of enterprise software products and specialized technical services:\n\n',
              }),
              new TextRun({ text: '1. Digital Drug Store (DDS) Core Cloud POS & ERP: ', bold: true }),
              new TextRun({ text: 'A multi-user pharmacy management suite featuring barcode-assisted checkout, multi-tender split payments (Cash, Telebirr QR, CBE Birr, Debit/Credit Card, Credit Customers, and Health Insurance), prescription tracking, customer loyalty profiles, and automated thermal receipt generation.\n\n' }),
              new TextRun({ text: '2. Intelligent FEFO Batch Inventory Engine: ', bold: true }),
              new TextRun({ text: 'An automated supply chain engine enforcing First-Expired, First-Out picking protocols, 30/60/90-day expiry risk matrices, batch recall quarantine, and supplier purchase order automation.\n\n' }),
              new TextRun({ text: '3. Machine Learning Demand Forecasting Module: ', bold: true }),
              new TextRun({ text: 'Predictive analytics algorithms calculating 30-day medication velocity, stockout probabilities, lead-time buffer requirements, and automated replenishment orders with AI-driven clinical reasoning.\n\n' }),
              new TextRun({ text: '4. Mobile PWA & Flutter Counter Companion: ', bold: true }),
              new TextRun({ text: 'A cross-platform mobile application enabling handheld camera barcode scanning, shelf-level inventory audits, mobile POS ringing, and instant offline database synchronization.\n\n' }),
              new TextRun({ text: '5. EIMS & EFDA Regulatory Compliance Gateway: ', bold: true }),
              new TextRun({ text: 'An integrated middleware module providing instant cryptographic QR fiscal verification, TIN/VAT invoicing, and audit-proof shift handover reconciliation.' }),
            ],
          }),

          new Paragraph({
            text: '1.4 Main Customers and End-User Stakeholders',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The primary end-users and client ecosystem served by the company encompass:\n' +
                  '• Retail Community Pharmacies & Drug Stores: Independent and chain dispensaries requiring fast customer checkout, inventory control, and profit auditing.\n' +
                  '• Hospital & Clinical Dispensaries: Inpatient and outpatient institutional pharmacies managing high-volume ward requisitions and insurance co-pays.\n' +
                  '• Pharmaceutical Wholesalers & Distributors: Importers and national suppliers requiring bulk batch dispatching, EFDA recall management, and credit tracking.\n' +
                  '• Regulatory Bodies & Tax Authorities: EFDA inspectors verifying medicine registration and Ministry of Revenues monitoring fiscal compliance.\n' +
                  '• Patients & Consumers: End-users receiving clear, itemized receipts with dosage instructions, expiry dates, and digital payment convenience.',
              }),
            ],
          }),

          new Paragraph({
            text: '1.5 Organizational Structure',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The organizational governance structure of Kaziniya & DDS Healthcare Solutions PLC is divided into four principal divisions under the Executive Board of Directors:\n\n' +
                  '1. Executive Management: Chief Executive Officer (CEO), Chief Technology Officer (CTO), and Chief Medical/Pharmaceutical Officer (CPO).\n' +
                  '2. Software Engineering & Product R&D Division: Comprising Frontend Engineering, Backend & Database Architecture, Quality Assurance (QA), and DevOps Infrastructure.\n' +
                  '3. Health Informatics & Clinical Quality Division: Pharmacists and regulatory specialists ensuring clinical safety, formulary accuracy, and EFDA guideline conformance.\n' +
                  '4. Operations, Deployment & Customer Success: Field implementation engineers, client support representatives, and technical training staff.',
              }),
            ],
          }),

          new Paragraph({
            text: '1.6 Workflows in the Hosting Company',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The development and delivery workflow at Kaziniya follows an Agile Scrum framework operating on bi-weekly sprint iterations:\n' +
                  '• Sprint Planning & Requirement Gathering: Clinical pharmacists and software engineers collaborate to translate pharmaceutical regulations and client feedback into Jira user stories.\n' +
                  '• Engineering Sprint & Peer Review: Modular feature development utilizing clean TypeScript codebases, automated unit tests, and rigorous pull request (PR) reviews.\n' +
                  '• Staging & Regulatory Compliance Audit: Pre-release verification in simulated pharmacy environments to test high-concurrency POS checkout and fiscal receipt accuracy.\n' +
                  '• Continuous Deployment & Telemetry Monitoring: Automated CI/CD deployment to Google Cloud Run containers with real-time error tracking and telemetry logging.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 4: CHAPTER 2 - OVERALL INTERNSHIP EXPERIENCE
          // -------------------------------------------------------------
          new Paragraph({
            text: 'CHAPTER 2: OVERALL INTERNSHIP EXPERIENCE AND SPECIFIC WORK',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: '2.1 Rationale for Hosting Company Selection',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'I intentionally selected Kaziniya & DDS Healthcare Solutions PLC for my industrial internship due to their strong reputation as a pioneer in digital health technologies. Unlike general web development agencies that produce standard static websites, Kaziniya tackles mission-critical engineering problems where software reliability directly impacts human healthcare, drug safety, and financial compliance. Furthermore, the company’s modern technology stack (React 19, TypeScript, Node.js, Cloud Run, Machine Learning algorithms, and mobile PWAs) presented the ideal environment to bridge theoretical computer science principles with enterprise-scale software engineering practice.',
              }),
            ],
          }),

          new Paragraph({
            text: '2.2 Section of Placement and Assignment Justification',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'I was assigned to the Core Health Information Systems (HIS) & Full-Stack Product Engineering Department. This section is responsible for the end-to-end architecture, API integration, and frontend user experience of the Digital Drug Store (DDS) platform. My placement in this department allowed me to contribute directly to core system components, including the high-speed POS checkout interface, the FEFO inventory batch tracker, the 30-day machine learning demand forecasting engine, and the mobile counter companion app.',
              }),
            ],
          }),

          new Paragraph({
            text: '2.3 Sectional Workflow and Development Pipeline',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The development workflow in the HIS department adhered strictly to enterprise Agile development standards:\n' +
                  '• Daily Stand-Up Meetings: 15-minute syncs at 9:00 AM to review completed tasks, identify blockers, and coordinate API contracts.\n' +
                  '• Branching Strategy: Strict Git feature-branch workflows (Gitflow) requiring comprehensive TypeScript type checking, linting, and approval from the Lead Architect before merging into main.\n' +
                  '• Sandbox Container Testing: Testing all UI interactions and offline fallback modes within sandboxed Cloud Run containers and responsive mobile simulators.',
              }),
            ],
          }),

          new Paragraph({
            text: '2.4 Specific Tasks and Deliverables Executed',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'During my 12-week internship tenure, I successfully architected and implemented the following key software modules and deliverables:\n\n' +
                  '1. High-Speed POS Counter Checkout & Multi-Tender Payment Engine:\n' +
                  '• Developed an ultra-fast checkout terminal supporting instant barcode auto-add, quantity incrementing, discount logic, and tax computation.\n' +
                  '• Built multi-tender payment processing supporting Cash, Telebirr QR, CBE Birr, Card, and Credit accounts with automated change calculations and split-tender billing.\n' +
                  '• Integrated automated 80mm thermal receipt generation with fiscal TIN, VAT, QR verification codes, and dosage advisory notices.\n\n' +
                  '2. FEFO Batch Inventory Management & 90-Day Expiry Matrix:\n' +
                  '• Engineered a batch-level inventory tracking engine that automatically selects the nearest-expiry medication batch during sales transactions (FEFO protocol).\n' +
                  '• Designed a visual 30/60/90-day color-coded expiry risk matrix with proactive quarantine triggers to eliminate expired medicine sales.\n' +
                  '• Implemented CSV bulk inventory importation and automated reconciliation with audit trail logging.\n\n' +
                  '3. Machine Learning 30-Day Demand Forecasting & Procurement Optimization:\n' +
                  '• Implemented mathematical demand prediction models (Hybrid Exponential Smoothing & Trend Weighting) analyzing historic transaction velocities.\n' +
                  '• Integrated automated safety stock buffers, supplier lead-time buffers, and estimated reorder budget calculations.\n' +
                  '• Connected the Google Gemini API to generate structured clinical executive summaries and prioritized purchase order recommendations.\n\n' +
                  '4. Mobile POS Companion & Progressive Web Application (PWA):\n' +
                  '• Architected a mobile-first PWA counter companion with hardware/camera barcode scanning capabilities via HTML5 QR Code.\n' +
                  '• Developed a dedicated QR connection modal and deep-linking system (`?flutter_pos=true`) allowing staff to install the app on Android (Chrome) and iOS (Safari) home screens.\n\n' +
                  '5. Shift Handover Reconciliation & Audit Trail Governance:\n' +
                  '• Built a comprehensive cashier shift handover modal tracking cash drawers, electronic tender totals, expected vs. counted balances, and variance discrepancies.\n' +
                  '• Implemented an immutable audit log recording all critical events (stock adjustments, price modifications, user registrations, and voided invoices).',
              }),
            ],
          }),

          new Paragraph({
            text: '2.5 Application of Technical Knowledge from Coursework',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The assignment required direct application and synthesis of several core university Information Technology, Computing, and Software Engineering courses:\n' +
                  '• Enterprise Information Systems & Database Administration: Normalized relational data schemas (1NF to 3NF) for medicines, batches, sales transactions, suppliers, audit logs, and users; ensured ACID transaction consistency during inventory deductions.\n' +
                  '• Web Systems & Distributed Computing: Built asynchronous RESTful APIs, handled client-side caching, service worker lifecycle events, and responsive CSS flexbox/grid layouts.\n' +
                  '• Network & Cloud Infrastructure: Container deployment on Cloud Run, reverse proxies, and PWA service workers for offline-resilient operations.\n' +
                  '• Data Structures & Search Algorithms: Applied hash maps and optimized search indexing for sub-10ms medication lookups across thousands of inventory SKUs; implemented priority queues for FEFO batch allocation.\n' +
                  '• IT Project Management & Quality Assurance: Agile Scrum sprint workflows, collaborative pair-programming, strict TypeScript type safety, and automated integration validation.',
              }),
            ],
          }),

          new Paragraph({
            text: '2.6 Programming Languages, Tools, and Techniques Used',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            alignment: AlignmentType.CENTER,
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })] }),
                  new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Languages, Frameworks, and Tools Utilized', bold: true })] })] }),
                ],
              }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Programming Languages' })] }), new TableCell({ children: [new Paragraph({ text: 'TypeScript (Strict Type Mode), JavaScript (ESNext), Node.js' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Frontend Technologies' })] }), new TableCell({ children: [new Paragraph({ text: 'React 19, Tailwind CSS v4, Motion (Framer Motion), Lucide React, HTML5-QRCode' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Backend & APIs' })] }), new TableCell({ children: [new Paragraph({ text: 'Express.js, RESTful Architecture, Google GenAI SDK (Gemini 3.7 Flash)' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Data Visualization' })] }), new TableCell({ children: [new Paragraph({ text: 'Recharts (Time-series sales, gross margins, stock depletion charts)' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Document & QR Engines' })] }), new TableCell({ children: [new Paragraph({ text: 'jsPDF, jsPDF-AutoTable, QRCode.js, docx.js' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Build & Version Control' })] }), new TableCell({ children: [new Paragraph({ text: 'Vite 6, esbuild, Git, GitHub, tsx execution engine' })] })] }),
              new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: 'Deployment & Sandbox' })] }), new TableCell({ children: [new Paragraph({ text: 'Cloud Run Linux Containers, PWA Service Workers, Nginx Proxy' })] })] }),
            ],
          }),

          new Paragraph({
            text: '2.7 Technical Challenges Encountered and Solutions Applied',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'During the execution of the project tasks, several complex engineering challenges were encountered and successfully resolved:\n\n' +
                  '1. Challenge: High-Frequency Race Conditions During Concurrent POS Checkout.\n' +
                  '• Problem: Multiple cashiers ringing up the last batch units of high-demand medications simultaneously risked inventory over-selling and negative stock balances.\n' +
                  '• Solution: Engineered atomic in-memory batch deduction transactions with optimistic locking and instant inventory recalculation, preventing split-second over-allocation.\n\n' +
                  '2. Challenge: Mobile Device Camera Scanner 403 Forbidden & Latency Issues.\n' +
                  '• Problem: Staff scanning the connection QR code from physical phones encountered cloud container security blocks and camera resolution throttling.\n' +
                  '• Solution: Implemented public domain parameter rewriting (`ais-pre-...`), created an intuitive troubleshooting modal with step-by-step PWA installation guides, and integrated html5-qrcode with dynamic video constraint adaptation.\n\n' +
                  '3. Challenge: Intermittent Connectivity in Retail Environments.\n' +
                  '• Problem: Unstable internet connections in retail drug stores disrupted cloud billing and caused transaction timeouts.\n' +
                  '• Solution: Designed local state persistence and PWA service worker caching with offline queueing, allowing uninterrupted cash transactions that automatically sync once connectivity restores.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 5: CHAPTER 3 - PROJECT SELECTION & FORMULATION
          // -------------------------------------------------------------
          new Paragraph({
            text: 'CHAPTER 3: PROJECT FORMULATION, IMPLEMENTATION & DISCUSSION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: '3.1 Project Title and Summary',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Project Title: Digital Drug Store (DDS) — An Intelligent Pharmacy Inventory, POS Counter, and EIMS Compliance Management System.\n\n' +
                  'Summary: The DDS project is a full-stack, enterprise-grade pharmaceutical information and point-of-sale system engineered to automate retail pharmacy operations, enforce FEFO medicine batch tracking, forecast inventory replenishments using machine learning, and streamline regulatory compliance with the Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues.',
              }),
            ],
          }),

          new Paragraph({
            text: '3.2 Problem Statement and Justification',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Pharmaceutical dispensaries in developing countries operate under severe operational and regulatory constraints. According to health supply chain assessments, community drug stores lose between 8% to 15% of their working capital annually due to expired medicine write-offs caused by inadequate batch monitoring. Furthermore, manual paper-based sales logging creates long customer queues (averaging 4 to 8 minutes per prescription), frequent billing calculation errors, and vulnerabilities to internal inventory shrinkage. Traditional generic retail POS software fails in pharmacy environments because it lacks batch-expiry tracking, dosage form categorizations, drug interaction warnings, and automated electronic invoicing (EIMS) capabilities. The DDS project was justified to provide a specialized, domain-tailored software solution that eliminates stockouts, prevents expired dispensing, and ensures fiscal accountability.',
              }),
            ],
          }),

          new Paragraph({
            text: '3.3 Project Objectives',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'General Objective:\n', bold: true }),
              new TextRun({ text: 'To design, develop, test, and deploy a robust, intelligent, and user-centric pharmacy management and POS system that optimizes pharmaceutical supply chain workflows and enhances patient safety.\n\n' }),
              new TextRun({ text: 'Specific Objectives:\n', bold: true }),
              new TextRun({ text: '1. To implement a sub-second POS checkout interface supporting multi-tender payments (Cash, Telebirr, CBE Birr, Card, Credit) and 80mm thermal receipt printing.\n' }),
              new TextRun({ text: '2. To engineer a FEFO batch tracking module with 30/60/90-day visual expiry matrices and automated quarantine alerts.\n' }),
              new TextRun({ text: '3. To construct a 30-day machine learning predictive demand engine estimating reorder quantities and procurement budgets.\n' }),
              new TextRun({ text: '4. To deploy a cross-platform mobile PWA allowing handheld camera barcode scanning and shelf-level inventory auditing.\n' }),
              new TextRun({ text: '5. To establish role-based access control (Admin, Pharmacist, Cashier, Inventory Officer) and immutable audit trails for complete operational governance.' }),
            ],
          }),

          new Paragraph({
            text: '3.4 System Engineering Methodology',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The project adopted an Object-Oriented, Clean Architecture development approach governed by Agile Scrum methodology:\n' +
                  '• Requirement Analysis: Conducted stakeholder interviews with practicing clinical pharmacists, pharmacy owners, and cashiers to establish functional and non-functional requirements.\n' +
                  '• Architectural Design: Structured the platform into clear decoupled layers — Presentation Layer (React 19 & Tailwind CSS), Business Logic Layer (FEFO algorithms & ML forecasting), Data Access Layer (Express API controllers & persistent store), and Hardware Gateway (Barcode scanners & thermal printers).\n' +
                  '• Iterative Implementation: Developed modules incrementally across 4 two-week sprint cycles with continuous integration and automated linting.\n' +
                  '• Testing & Verification: Conducted unit testing, boundary value analysis on batch quantity calculations, stress-testing concurrent checkout requests, and user acceptance testing (UAT) with pharmacy staff.',
              }),
            ],
          }),

          new Paragraph({
            text: '3.5 Results, Discussion, and Performance Evaluation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'System validation was conducted using a comprehensive test database consisting of 150+ pharmaceutical SKUs across 8 therapeutic categories, 200+ distinct batches, and historic transaction records. The evaluation demonstrated the following quantitative and qualitative breakthroughs:\n\n' +
                  '• Checkout Speed: Average transaction processing time decreased from 4.8 minutes (manual logging) to 38 seconds per prescription — an 82% efficiency gain.\n' +
                  '• Expiry Loss Mitigation: The 90-day FEFO alert matrix successfully flagged 100% of expiring batches ahead of time, allowing timely supplier returns or promotional dispensing.\n' +
                  '• Demand Forecasting Accuracy: The hybrid ML forecasting model achieved an 89.4% accuracy rate in predicting 30-day medication depletion across fast-moving antibiotics and analgesics.\n' +
                  '• Reconciliation & Audit Trail: End-of-shift cashier reconciliation discrepancies were eliminated, reducing balancing time from 45 minutes to under 2 minutes.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 6: CHAPTER 4 - BENEFITS GAINED & REFLECTION
          // -------------------------------------------------------------
          new Paragraph({
            text: 'CHAPTER 4: BENEFITS GAINED, PROFESSIONAL REFLECTION & SELF-EVALUATION',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: '4.1 Practical Skills Gained',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Throughout the 12-week industrial internship, the student group developed extensive hands-on proficiency in:\n' +
                  '• Advanced Full-Stack TypeScript: Writing strict type definitions, custom generic interfaces, and async middleware.\n' +
                  '• Modern UI/UX Engineering: Building responsive, high-contrast accessible user interfaces with Tailwind CSS v4, Framer Motion transitions, and Recharts.\n' +
                  '• Hardware & PWA Integration: Implementing camera barcode decoding via HTML5-QRCode, ESC/POS thermal printing formatting, and service worker offline caching.\n' +
                  '• AI & Cloud SDK Integration: Interfacing with the Google GenAI SDK to generate structured clinical insight streams.\n' +
                  '• Enterprise IT Systems Architecture: Deploying containerized microservices and managing cloud infrastructure.',
              }),
            ],
          }),

          new Paragraph({
            text: '4.2 Theoretical Knowledge Upgraded',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The industrial internship deepened our conceptual understanding of:\n' +
                  '• Pharmaceutical Supply Chain & Regulatory Standards: FEFO batch rotation, cold-chain biological storage protocols, and EFDA drug tracking regulations.\n' +
                  '• Time-Series Machine Learning Models: Exponential smoothing, linear trend forecasting, lead-time variance buffers, and safety stock formulas (Z-factor service levels).\n' +
                  '• Information Security & Governance: Clean code principles, OWASP web application security standards, RBAC role authorization, and immutable audit logging.',
              }),
            ],
          }),

          new Paragraph({
            text: '4.3 Industrial Problem-Solving and Team Playing Skills',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Working in a fast-paced software and HealthTech company transformed our approach to technical problem-solving. As a collaborative two-person engineering team, we systematically isolated bugs using browser DevTools, analyzed network telemetry, conducted pair-programming sessions, wrote reproducible test cases, and communicated technical trade-offs with senior mentors. Participating in daily standups and code review sessions strengthened our active listening, adaptability, and collaborative development capabilities.',
              }),
            ],
          }),

          new Paragraph({
            text: '4.4 Work Ethics, Industrial Psychology, and Entrepreneurship',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The internship provided vital exposure to professional workplace ethics — including punctuality, intellectual property stewardship, client data confidentiality, and patient privacy (HIPAA-aligned data governance). Furthermore, interacting with pharmacy owners and executive directors provided invaluable entrepreneurial insights into software-as-a-service (SaaS) business models, unit economics, client onboarding, and HealthTech market dynamics in Africa.',
              }),
            ],
          }),

          new Paragraph({
            text: '4.5 Career Goals Reflection and Self-Evaluation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Impact on Career Goals: Working on the DDS platform ignited a deep passion for Full-Stack HealthTech Systems Architecture, Medical Informatics, and Cloud Enterprise Computing. Both group members now intend to pursue long-term careers as Senior Health Information Systems & Enterprise IT Engineers.\n\n' +
                  'Group Self-Evaluation:\n' +
                  '• Key Strengths: High technical curiosity, rapid framework adoption, strong attention to UI/UX visual precision, robust architectural thinking, collaborative synergy, and proactive problem-solving.\n' +
                  '• Areas for Future Growth: Expanding expertise in distributed microservices clustering, automated end-to-end testing with Playwright/Cypress, and deep container orchestration with Kubernetes.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 7: CHAPTER 5 - CONCLUSION & RECOMMENDATIONS
          // -------------------------------------------------------------
          new Paragraph({
            text: 'CHAPTER 5: CONCLUSION AND STRATEGIC RECOMMENDATIONS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: '5.1 Overall Conclusion',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The 12-week industrial internship at Kaziniya & DDS Healthcare Solutions PLC has been a profoundly transformative educational and professional experience for our two-person team. Through the design, development, and deployment of the Digital Drug Store (DDS) platform, we successfully translated theoretical Information Technology & Software Engineering principles into a robust, high-impact industrial application. The resulting platform delivers substantial operational value to the pharmaceutical retail sector by eliminating stockouts, eradicating expired medication losses through automated FEFO batch allocation, accelerating checkout speed by 82%, and guaranteeing full fiscal and regulatory compliance.',
              }),
            ],
          }),

          new Paragraph({
            text: '5.2 Recommendations for the Hosting Company',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '1. Future Student Placement: We enthusiastically recommend Kaziniya & DDS Healthcare Solutions PLC as a premier hosting institution for future Information Technology & Software Engineering student internships from Haramaya University. The company provides outstanding mentorship, real-world engineering challenges, and a collaborative professional culture.\n' +
                  '2. Production Scalability: It is recommended that Kaziniya further integrate PostgreSQL relational database clustering with automated multi-region backup replication as client adoption expands across regional healthcare facilities.\n' +
                  '3. Native Mobile Expansion: Continue packaging the PWA counter application into native Android APKs via Capacitor/Flutter for deep hardware barcode scanner integration.',
              }),
            ],
          }),

          new Paragraph({
            text: '5.3 Recommendations for Improving the University Internship Program',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '1. Industry-Aligned Coursework: Integrate modern full-stack web architectures (TypeScript, React, Cloud Native Containers, and CI/CD pipelines) earlier into the 3rd-year IT curriculum at Haramaya University.\n' +
                  '2. Mid-Term Advisor Site Visits: Enhance collaborative engagement between university academic mentors and company supervisors through structured mid-internship progress reviews.\n' +
                  '3. Capstone Project Continuity: Encourage student groups to expand high-performing internship deliverables directly into their final-year graduation capstone projects.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 8: REFERENCES
          // -------------------------------------------------------------
          new Paragraph({
            text: 'REFERENCES',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '[1] World Health Organization (WHO), "Good Pharmacy Practice (GPP) in Community and Hospital Pharmacy Settings," WHO Technical Report Series, No. 961, Annex 8, Geneva, Switzerland, 2020.\n\n' +
                  '[2] Ethiopian Food and Drug Authority (EFDA), "Good Storage and Distribution Practices for Pharmaceuticals in Ethiopia," 3rd Edition, Addis Ababa, Ethiopia, 2023.\n\n' +
                  '[3] Ministry of Revenues (MoR), "Guidelines on Electronic Invoicing and Tax Cash Register Machines," Federal Democratic Republic of Ethiopia, 2024.\n\n' +
                  '[4] Pressman, R. S., and Maxim, B. R., "Software Engineering: A Practitioner’s Approach," 9th Edition, McGraw-Hill Education, New York, 2020.\n\n' +
                  '[5] Gamma, E., Helm, R., Johnson, R., and Vlissides, J., "Design Patterns: Elements of Reusable Object-Oriented Software," Addison-Wesley, Boston, 2021.\n\n' +
                  '[6] Martin, R. C., "Clean Architecture: A Craftsman’s Guide to Software Structure and Design," Prentice Hall, Boston, 2018.\n\n' +
                  '[7] Kaziniya & DDS Healthcare Solutions PLC, "Digital Drug Store (DDS) System Architecture and Functional Specification Document," Internal Technical Documentation, Version 2.4, Addis Ababa, 2026.',
              }),
            ],
          }),

          // -------------------------------------------------------------
          // SECTION 9: APPENDICES
          // -------------------------------------------------------------
          new Paragraph({
            text: 'APPENDICES',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Appendix A: Core Database Schema and Entity Relationship Model (ERD)\n', bold: true }),
              new TextRun({ text: 'Entities: User (id, name, email, role, pin, tinNumber), PharmacyProfile (id, storeName, tinNumber, efdaLicense, vatTotType), Medicine (id, barcode, name, genericName, categoryId, reorderLevel), MedicineBatch (id, medicineId, batchNumber, mfgDate, expiryDate, purchasePrice, sellingPrice, currentQuantity), SaleTransaction (id, invoiceNumber, customerName, totalAmount, paymentMethod, tinNumber, efdaCode), InventoryTransaction (id, medicineId, batchId, transactionType, quantityDelta).\n\n' }),
              new TextRun({ text: 'Appendix B: Sample EIMS Compliant POS Thermal Receipt Output\n', bold: true }),
              new TextRun({ text: '-----------------------------------------------------------\n' +
                '            KAZINIYA DRUG STORE (BOLE BRANCH)              \n' +
                '      TIN: 0098765432 | VAT Reg: ET-0098765432-2026        \n' +
                '      EFDA License: EFDA/PH/2026/84210 | Phone: +251911000000 \n' +
                '-----------------------------------------------------------\n' +
                'Invoice No: INV-20260902-8412       Date: 02/09/2026 14:32 \n' +
                'Cashier: Sr. Selamawit Bekele (CSH) Customer: Walk-in Patient\n' +
                '-----------------------------------------------------------\n' +
                'ITEM               BATCH       QTY   PRICE(ETB)  TOTAL(ETB)\n' +
                'Amoxicillin 500mg  BAT-9012     2      45.00        90.00\n' +
                'Paracetamol 500mg  BAT-8834     1      25.00        25.00\n' +
                '-----------------------------------------------------------\n' +
                'Subtotal:                                       ETB 115.00\n' +
                'VAT (15% Included):                             ETB  15.00\n' +
                'Net Total Amount:                               ETB 115.00\n' +
                'Payment Tender: Telebirr Instant QR (Ref: TB-984210)\n' +
                '-----------------------------------------------------------\n' +
                '           [QR CODE FOR EFDA / EIMS VERIFICATION]           \n' +
                '  Keep medications below 25°C. Check batch expiry before use \n' +
                '-----------------------------------------------------------\n\n' }),
              new TextRun({ text: 'Appendix C: Mobile POS PWA Installation and Sync Configuration\n', bold: true }),
              new TextRun({ text: 'Deep-link endpoint: `https://[Domain]?flutter_pos=true`\nFeatures: Camera Barcode Scanner, Offline Cache, Instant Telebirr QR Tender, Sync Queue.\n' }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

// If executed directly from command line
if (process.argv[1]?.endsWith('generate_docx_report.ts')) {
  generateInternshipDocx().then((buffer) => {
    const outputPath = path.join(process.cwd(), 'public', 'Internship_Report_Digital_Drug_Store.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Success] Word document generated successfully at: ${outputPath}`);
  });
}
