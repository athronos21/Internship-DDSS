import fs from 'fs';
import path from 'path';

const srcDocx = path.join(process.cwd(), 'documentation', 'Internship Report – Digital Drug Store (DDS) Pharmaceutical Inventory Management Platform.docx');
const altDocx = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');

const sourceFile = fs.existsSync(srcDocx) ? srcDocx : altDocx;

if (fs.existsSync(sourceFile)) {
  const dest1 = path.join(process.cwd(), 'public', 'Internship_Report_Digital_Drug_Store.docx');
  const dest2 = path.join(process.cwd(), 'public', 'Kaziniya_PIMS_Internship_Report.docx');
  const dest3 = path.join(process.cwd(), 'public', 'Kaziniya_DDS_Inventory_Internship_Report.docx');

  fs.copyFileSync(sourceFile, dest1);
  fs.copyFileSync(sourceFile, dest2);
  fs.copyFileSync(sourceFile, dest3);

  console.log(`Successfully synced official docx (${fs.statSync(dest1).size} bytes) to public/ destinations.`);
} else {
  console.error('Source report docx file not found.');
}
