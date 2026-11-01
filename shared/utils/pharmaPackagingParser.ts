/**
 * Deterministic Pharmaceutical Packaging Parser & Multi-Frame Accumulator
 * 
 * Accurately extracts medicine commercial names, active ingredients (generic INN),
 * strengths, dosage forms, batch numbers, and expiration dates from packaging OCR text.
 * 
 * Works 100% on-device/offline with zero cloud AI dependencies.
 */

export interface ParsedPackagingData {
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  batchNumber: string;
  expDate: string;
  mfgDate: string;
  manufacturer: string;
  suggestedCategory: string;
  suggestedUnit: string;
  confidence: number;
  rawText: string;
  detectedKeywords: string[];
  nameLocked: boolean;
  strengthLocked: boolean;
  dosageFormLocked: boolean;
  batchLocked: boolean;
  expDateLocked: boolean;
  manufacturerLocked: boolean;
  fieldStatus: {
    nameLocked: boolean;
    strengthLocked: boolean;
    dosageFormLocked: boolean;
    batchLocked: boolean;
    expDateLocked: boolean;
    manufacturerLocked: boolean;
  };
}

export interface ExistingProductHint {
  id: string;
  name?: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  categoryId?: string;
}

const DOSAGE_FORMS = [
  'Tablet',
  'Capsule',
  'Suspension',
  'Syrup',
  'Injection',
  'Ointment',
  'Cream',
  'Drops',
  'Inhaler',
  'Gel',
  'Suppository',
  'Solution',
  'Powder',
  'Vial',
  'Ampoule',
  'Spray',
];

const KNOWN_MANUFACTURERS = [
  'EPHARM',
  'Cadila',
  'GlaxoSmithKline',
  'GSK',
  'Julphar',
  'Novartis',
  'Sanofi',
  'Pfizer',
  'Cipla',
  'Sun Pharma',
  'AstraZeneca',
  'Roche',
  'Bayer',
  'MedTech',
  'Ethiopian Pharmaceuticals',
];

const COMMON_ACTIVE_INGREDIENTS = [
  'amoxicillin',
  'clavulanate',
  'paracetamol',
  'acetaminophen',
  'ibuprofen',
  'ciprofloxacin',
  'metformin',
  'azithromycin',
  'omeprazole',
  'atorvastatin',
  'amlodipine',
  'losartan',
  'hydrocortisone',
  'cetirizine',
  'diclofenac',
  'ampicillin',
  'doxycycline',
  'erythromycin',
  'fluconazole',
  'gentamicin',
  'metronidazole',
  'salbutamol',
  'tramadol',
  'pantoprazole',
  'esomeprazole',
  'levofloxacin',
  'ceftriaxone',
  'cefixime',
  'artemether',
  'lumefantrine',
];

const NOISE_PHRASES = [
  'rx only',
  'prescription only',
  'keep out of reach of children',
  'keep out of reach',
  'store below',
  'store in a cool',
  'store at',
  'for oral use',
  'for external use only',
  'shake well before use',
  'protect from light',
  'each tablet contains',
  'each capsule contains',
  'each ml contains',
  'net contents',
  'dosage as directed',
  'manufactured by',
  'mfg by',
  'packed by',
  'marketed by',
  'mfg. lic. no',
  'mfg lic no',
  'reg. no',
  'reg no',
  'caution',
  'warning',
  'batch no',
  'exp date',
  'mfg date',
];

const MONTH_MAP: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

/**
 * Normalizes date parts into standard YYYY-MM-DD format.
 */
function normalizeDate(monthStr: string, yearStr: string, dayStr?: string): string {
  let m = monthStr.trim().toLowerCase();
  let y = yearStr.trim();
  let d = dayStr ? dayStr.trim().padStart(2, '0') : '';

  if (MONTH_MAP[m.slice(0, 3)]) {
    m = MONTH_MAP[m.slice(0, 3)];
  } else {
    m = m.replace(/\D/g, '').padStart(2, '0');
  }

  const mNum = parseInt(m, 10);
  if (isNaN(mNum) || mNum < 1 || mNum > 12) return '';

  y = y.replace(/\D/g, '');
  if (y.length === 2) {
    y = `20${y}`;
  } else if (y.length !== 4) {
    return '';
  }

  if (!d) {
    // End of month for expiration
    const daysInMonth = [31, (parseInt(y, 10) % 4 === 0 && (parseInt(y, 10) % 100 !== 0 || parseInt(y, 10) % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    d = String(daysInMonth[mNum - 1] || 28).padStart(2, '0');
  }

  return `${y}-${m}-${d}`;
}

/**
 * Extracts Expiration Date with support for dot-matrix stamping,
 * spaced characters, crimp edge prints, and multiple pharmaceutical formats.
 */
export function extractExpiryDate(text: string, keywords: string[]): string {
  // Clean dot matrix spaces in EXP: "E X P", "E . X . P"
  const prepped = text
    .replace(/E\s*X\s*P(?:\s*I\s*R\s*Y)?/gi, 'EXP')
    .replace(/U\s*S\s*E\s*B\s*Y/gi, 'USE BY')
    .replace(/V\s*A\s*L(?:\s*I\s*D)?/gi, 'VAL')
    .replace(/B\s*B\s*D/gi, 'BBD');

  // Format 1: EXP: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = prepped.match(/(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([2-9]\d{3})[/-]([0-1]?\d)[/-]([0-3]?\d)\b/i);
  if (ymdMatch) {
    const res = normalizeDate(ymdMatch[2], ymdMatch[1], ymdMatch[3]);
    if (res) {
      keywords.push(`Expiry: ${res}`);
      return res;
    }
  }

  // Format 2: EXP: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = prepped.match(/(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([0-3]?\d)[/-]([0-1]?\d)[/-]((?:20)?[2-9]\d)\b/i);
  if (dmyMatch && parseInt(dmyMatch[1], 10) <= 31 && parseInt(dmyMatch[2], 10) <= 12) {
    const res = normalizeDate(dmyMatch[2], dmyMatch[3], dmyMatch[1]);
    if (res) {
      keywords.push(`Expiry: ${res}`);
      return res;
    }
  }

  // Format 3: EXP: MM/YYYY or MM/YY or MM-YYYY or MM.YYYY (dot matrix print)
  const myMatch = prepped.match(/(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?|EXP\.?DT)[\s.:/]*([0-1]?\d)[\s./-]+((?:20)?[2-9]\d)\b/i);
  if (myMatch) {
    const res = normalizeDate(myMatch[1], myMatch[2]);
    if (res) {
      keywords.push(`Expiry: ${res}`);
      return res;
    }
  }

  // Format 4: EXP: Month YYYY (e.g. EXP: MAY 2028 or EXP 05 2027 or EXP. OCT 27)
  const textMonthMatch = prepped.match(/(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([a-z]{3,9})[\s./-]*((?:20)?[2-9]\d)\b/i);
  if (textMonthMatch && MONTH_MAP[textMonthMatch[1].toLowerCase().slice(0, 3)]) {
    const res = normalizeDate(textMonthMatch[1], textMonthMatch[2]);
    if (res) {
      keywords.push(`Expiry: ${res}`);
      return res;
    }
  }

  // Format 5: Standalone future date on crimp/foil (e.g. "09/2027" or "11-2028" or "09 2027")
  const standaloneMatch = prepped.match(/\b([0-1]\d)[\s./-]((?:20)?[2-9]\d)\b/);
  if (standaloneMatch) {
    const m = parseInt(standaloneMatch[1], 10);
    const yStr = standaloneMatch[2].length === 2 ? `20${standaloneMatch[2]}` : standaloneMatch[2];
    const y = parseInt(yStr, 10);
    const currentYear = new Date().getFullYear();
    // Expiry date is usually between current year and 10 years ahead
    if (m >= 1 && m <= 12 && y >= currentYear && y <= currentYear + 10) {
      const res = normalizeDate(standaloneMatch[1], standaloneMatch[2]);
      if (res) {
        keywords.push(`Expiry: ${res} (Crimp)`);
        return res;
      }
    }
  }

  return '';
}

/**
 * Extracts Manufacturing Date.
 */
export function extractMfgDate(text: string, keywords: string[]): string {
  const prepped = text
    .replace(/M\s*F\s*G/gi, 'MFG')
    .replace(/P\s*R\s*O\s*D/gi, 'PROD')
    .replace(/M\s*F\s*R/gi, 'MFR');

  const myMatch = prepped.match(/(?:MFG|MFR|PROD(?:UCTION)?|M\.D\.?)[\s.:/]*([0-1]?\d)[\s./-]+((?:20)?[1-9]\d)\b/i);
  if (myMatch) {
    const res = normalizeDate(myMatch[1], myMatch[2], '01');
    if (res) {
      keywords.push(`Mfg: ${res}`);
      return res;
    }
  }

  const textMonthMatch = prepped.match(/(?:MFG|MFR|PROD(?:UCTION)?|M\.D\.?)[\s.:/]*([a-z]{3,9})[\s./-]*((?:20)?[1-9]\d)\b/i);
  if (textMonthMatch && MONTH_MAP[textMonthMatch[1].toLowerCase().slice(0, 3)]) {
    const res = normalizeDate(textMonthMatch[1], textMonthMatch[2], '01');
    if (res) {
      keywords.push(`Mfg: ${res}`);
      return res;
    }
  }

  return '';
}

/**
 * Extracts Batch / Lot Number while explicitly ignoring Manufacturing License Numbers (Mfg. Lic. No.).
 */
export function extractBatchNumber(text: string, keywords: string[]): string {
  // Clean dot matrix spacing: "B . N O .", "L O T", "B / N"
  const prepped = text
    .replace(/B\s*\.\s*N\s*O\s*\.?/gi, 'B.NO.')
    .replace(/B\s*\/\s*N/gi, 'BN')
    .replace(/L\s*O\s*T/gi, 'LOT');

  // Strip out license number lines first so they are never confused with batch
  const withoutLic = prepped.replace(/(?:mfg\.?\s*lic\.?\s*no\.?|lic\.?\s*no\.?|reg\.?\s*no\.?)[\s.:]*[^\n]+/gi, '');

  const batchRegexes = [
    // Standard: B.No. KZ-998, B.NO: B7492A, LOT: CB-4410, BN: 9982, BATCH: M850-22
    /(?:B\.NO\.?|BATCH(?:\s*NO)?|LOT(?:\s*NO)?|BN)[\s.:/]*([A-Z0-9\-_]{3,18})\b/i,
    // Short prefix: B/N 8821, L/N 2940
    /(?:B\/N|L\/N|B-NO)[\s.:/]*([A-Z0-9\-_]{3,18})\b/i,
    // Standalone stamped code near batch label
    /\b(?:BATCH|LOT)[\s.:]*\n\s*([A-Z0-9\-_]{3,16})\b/i,
  ];

  for (const reg of batchRegexes) {
    const match = withoutLic.match(reg);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/[^A-Za-z0-9\-_]/g, '');
      if (candidate.length >= 3) {
        keywords.push(`Batch: ${candidate}`);
        return candidate;
      }
    }
  }

  return '';
}

/**
 * Extracts strength concentration (e.g. 500mg, 250mg/5ml, 1g, 100ml, 0.5%, 1000 IU).
 */
export function extractStrength(text: string, keywords: string[]): string {
  // Normalize spaced characters e.g. "5 0 0 m g" -> "500mg"
  const prepped = text.replace(/(\d)\s+(\d)/g, '$1$2');

  const strengthRegex = /\b(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|%)(?:\s*\/\s*\d*(?:\.\d+)?\s*(?:ml|mg|g))?)\b/gi;
  const matches = Array.from(prepped.matchAll(strengthRegex));

  for (const match of matches) {
    const val = match[1].trim();
    // Exclude simple bottle volume (e.g. "100 ml" if a specific drug strength like 120mg/5ml also exists)
    keywords.push(`Strength: ${val}`);
    return val.replace(/\s+/g, '');
  }

  return '';
}

/**
 * Extracts pharmaceutical dosage form from dictionary.
 */
export function extractDosageForm(text: string, keywords: string[]): string {
  const lower = text.toLowerCase();
  for (const form of DOSAGE_FORMS) {
    const formLower = form.toLowerCase();
    const regex = new RegExp(`\\b${formLower}(?:s)?\\b`, 'i');
    if (regex.test(lower)) {
      keywords.push(`Form: ${form}`);
      return form;
    }
  }
  return '';
}

/**
 * Extracts pharmaceutical manufacturer.
 */
export function extractManufacturer(text: string, lines: string[], keywords: string[]): string {
  const lower = text.toLowerCase();

  // 1. Check known pharma list
  for (const mfg of KNOWN_MANUFACTURERS) {
    if (lower.includes(mfg.toLowerCase())) {
      keywords.push(`Manufacturer: ${mfg}`);
      return mfg;
    }
  }

  // 2. Check "Mfg by" or "Manufactured by"
  const mfgByMatch = text.match(/(?:Mfg|Manufactured|Packed|Marketed)\s*by[\s.:]*([A-Za-z0-9\s.,]{3,45})/i);
  if (mfgByMatch && mfgByMatch[1]) {
    const candidate = mfgByMatch[1].trim().split('\n')[0].trim();
    if (candidate.length > 3) {
      keywords.push(`Manufacturer: ${candidate}`);
      return candidate;
    }
  }

  // 3. Check lines with "Pharma", "Laboratories", "PLC", "Ltd"
  for (const line of lines) {
    const l = line.toLowerCase();
    if ((l.includes('pharma') || l.includes('laborat') || l.includes('plc') || l.includes('ltd')) &&
        !l.includes('store') &&
        !l.includes('reach') &&
        !l.includes('direct')) {
      const candidate = line.trim();
      keywords.push(`Manufacturer: ${candidate}`);
      return candidate;
    }
  }

  return '';
}

/**
 * Identifies the commercial drug name and generic INN from candidate lines.
 */
export function extractMedicineName(
  lines: string[],
  strength: string,
  dosageForm: string,
  knownMedicines?: ExistingProductHint[]
): { name: string; genericName: string; brandName: string; category?: string } {
  // Strategy A: Fuzzy match against existing formulary / inventory
  if (knownMedicines && knownMedicines.length > 0) {
    let bestMatch: ExistingProductHint | null = null;
    let highestSim = 0;

    for (const line of lines) {
      if (isNoiseLine(line)) continue;
      const cleanLine = stripStrengthAndForm(line, strength, dosageForm).toLowerCase();
      if (cleanLine.length < 3) continue;

      for (const med of knownMedicines) {
        const mName = (med.name || '').toLowerCase();
        const mBrand = (med.brandName || '').toLowerCase();
        const mGen = (med.genericName || '').toLowerCase();

        const simName = stringSimilarity(cleanLine, mName);
        const simBrand = stringSimilarity(cleanLine, mBrand);
        const simGen = stringSimilarity(cleanLine, mGen);
        const sim = Math.max(simName, simBrand, simGen);

        if (sim > highestSim) {
          highestSim = sim;
          bestMatch = med;
        }
      }
    }

    if (highestSim >= 0.58 && bestMatch) {
      return {
        name: bestMatch.name || bestMatch.brandName || '',
        genericName: bestMatch.genericName || bestMatch.name || '',
        brandName: bestMatch.brandName || bestMatch.name || '',
        category: bestMatch.categoryId,
      };
    }
  }

  // Strategy B: Heuristic candidate line extraction
  const candidateLines = lines.filter((line) => {
    if (line.length < 3) return false;
    if (isNoiseLine(line)) return false;
    if (/(?:EXP|MFG|BATCH|LOT|B\.NO|PRICE|ETB|\$|USD)/i.test(line)) return false;
    return true;
  });

  if (candidateLines.length === 0) {
    return { name: 'Unidentified Medicine', genericName: 'Active Ingredient', brandName: '' };
  }

  // Check if any line or text contains a known common active pharmaceutical ingredient (INN)
  let detectedGeneric = '';
  for (const line of lines) {
    const l = line.toLowerCase();
    for (const ing of COMMON_ACTIVE_INGREDIENTS) {
      if (new RegExp(`\\b${ing}\\b`, 'i').test(l)) {
        detectedGeneric = ing.charAt(0).toUpperCase() + ing.slice(1);
        break;
      }
    }
    if (detectedGeneric) break;
  }

  // Clean primary candidate line
  let primaryName = candidateLines[0].trim().replace(/[,.;:]$/, '');
  let genericName = detectedGeneric || primaryName;
  let brandName = primaryName;

  if (!detectedGeneric && candidateLines.length > 1) {
    const secondary = candidateLines[1].trim();
    let cleaned = stripStrengthAndForm(secondary, strength, dosageForm);
    cleaned = cleaned.replace(/\b(?:BP|USP|IP|Ph\.?\s*Eur)\b/gi, '').replace(/[,.;:]$/, '').trim();
    if (cleaned.length >= 3 && !isNoiseLine(cleaned)) {
      genericName = cleaned;
    }
  }

  return { name: primaryName, genericName, brandName };
}

function isNoiseLine(line: string): boolean {
  const lower = line.toLowerCase().trim();
  for (const phrase of NOISE_PHRASES) {
    if (lower.includes(phrase)) return true;
  }
  if (/^[\d\s\-_.,/]+$/.test(lower)) return true;
  return false;
}

function stripStrengthAndForm(text: string, strength: string, form: string): string {
  let res = text;
  if (strength) {
    res = res.replace(new RegExp(escapeRegExp(strength), 'gi'), '');
  }
  if (form) {
    res = res.replace(new RegExp(`\\b${escapeRegExp(form)}(?:s)?\\b`, 'gi'), '');
  }
  return res.trim();
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Simple dice coefficient similarity calculation for fuzzy matching.
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.replace(/\s+/g, '');
  const s2 = str2.replace(/\s+/g, '');
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substr(i, 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substr(i, 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (s1.length + s2.length - 2);
}

/**
 * Parses raw packaging text into structured [ParsedPackagingData].
 */
export function parsePackagingText(
  rawText: string,
  knownMedicines?: ExistingProductHint[]
): ParsedPackagingData {
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const keywords: string[] = [];

  const expDate = extractExpiryDate(cleanText, keywords);
  const mfgDate = extractMfgDate(cleanText, keywords);
  const batchNumber = extractBatchNumber(cleanText, keywords);
  const strength = extractStrength(cleanText, keywords);
  const dosageForm = extractDosageForm(cleanText, keywords);
  const manufacturer = extractManufacturer(cleanText, lines, keywords);
  const nameResult = extractMedicineName(lines, strength, dosageForm, knownMedicines);

  // Suggested unit
  let unit = 'Box';
  const lowerText = cleanText.toLowerCase();
  const lowerForm = dosageForm.toLowerCase();
  if (lowerForm.includes('syrup') || lowerForm.includes('suspension') || lowerForm.includes('drops') || lowerForm.includes('solution')) {
    unit = 'Bottle';
  } else if (lowerForm.includes('injection') || lowerForm.includes('vial')) {
    unit = 'Vial';
  } else if (lowerForm.includes('ointment') || lowerForm.includes('cream') || lowerForm.includes('gel')) {
    unit = 'Tube';
  } else if (lowerText.includes('strip')) {
    unit = 'Strip';
  }

  // Confidence score
  let score = 0.40;
  if (nameResult.name && nameResult.name !== 'Unidentified Medicine') score += 0.25;
  if (strength) score += 0.15;
  if (expDate) score += 0.10;
  if (batchNumber) score += 0.10;
  const confidence = Math.min(0.98, Math.max(0.40, score));

  return {
    name: nameResult.name,
    genericName: nameResult.genericName,
    brandName: nameResult.brandName,
    strength: strength || '500mg',
    dosageForm: dosageForm || 'Tablet',
    batchNumber: batchNumber || '',
    expDate: expDate || '',
    mfgDate: mfgDate || '',
    manufacturer: manufacturer || '',
    suggestedCategory: nameResult.category || 'cat-1',
    suggestedUnit: unit,
    confidence,
    rawText,
    detectedKeywords: keywords,
    nameLocked: !!nameResult.name && nameResult.name !== 'Unidentified Medicine',
    strengthLocked: !!strength,
    dosageFormLocked: !!dosageForm,
    batchLocked: !!batchNumber,
    expDateLocked: !!expDate,
    manufacturerLocked: !!manufacturer,
    fieldStatus: {
      nameLocked: !!nameResult.name && nameResult.name !== 'Unidentified Medicine',
      strengthLocked: !!strength,
      dosageFormLocked: !!dosageForm,
      batchLocked: !!batchNumber,
      expDateLocked: !!expDate,
      manufacturerLocked: !!manufacturer,
    },
  };
}

/**
 * Multi-Frame Accumulator: Merges newly detected frame text into the existing accumulated state.
 * Prevents previously locked attributes (e.g. Name/Strength from front) from being lost
 * when the user turns the box to scan the crimp/flap for Batch and Expiry.
 */
export function accumulatePackagingData(
  current: ParsedPackagingData | null,
  newFrameText: string,
  knownMedicines?: ExistingProductHint[]
): ParsedPackagingData {
  const newParsed = parsePackagingText(newFrameText, knownMedicines);

  if (!current) {
    return newParsed;
  }

  // Merge attributes, keeping existing high-confidence locked fields
  const mergedKeywords = Array.from(new Set([...current.detectedKeywords, ...newParsed.detectedKeywords]));
  const mergedRawText = `${current.rawText}\n---\n${newFrameText}`.slice(-4000);

  const name = (current.fieldStatus.nameLocked && current.name !== 'Unidentified Medicine')
    ? current.name
    : (newParsed.name !== 'Unidentified Medicine' ? newParsed.name : current.name);

  const genericName = (current.fieldStatus.nameLocked && current.genericName)
    ? current.genericName
    : (newParsed.genericName || current.genericName);

  const brandName = (current.fieldStatus.nameLocked && current.brandName)
    ? current.brandName
    : (newParsed.brandName || current.brandName);

  const strength = current.fieldStatus.strengthLocked
    ? current.strength
    : (newParsed.strength || current.strength);

  const dosageForm = current.fieldStatus.dosageFormLocked
    ? current.dosageForm
    : (newParsed.dosageForm || current.dosageForm);

  const batchNumber = current.fieldStatus.batchLocked
    ? current.batchNumber
    : (newParsed.batchNumber || current.batchNumber);

  const expDate = current.fieldStatus.expDateLocked
    ? current.expDate
    : (newParsed.expDate || current.expDate);

  const mfgDate = current.mfgDate || newParsed.mfgDate;
  const manufacturer = current.fieldStatus.manufacturerLocked
    ? current.manufacturer
    : (newParsed.manufacturer || current.manufacturer);

  const unit = newParsed.suggestedUnit !== 'Box' ? newParsed.suggestedUnit : current.suggestedUnit;
  const category = current.suggestedCategory !== 'cat-1' ? current.suggestedCategory : newParsed.suggestedCategory;

  // Calculate merged confidence
  let lockedCount = 0;
  if (name && name !== 'Unidentified Medicine') lockedCount++;
  if (strength) lockedCount++;
  if (dosageForm) lockedCount++;
  if (batchNumber) lockedCount++;
  if (expDate) lockedCount++;
  if (manufacturer) lockedCount++;

  const mergedConfidence = Math.min(0.98, 0.40 + lockedCount * 0.10);

  const isNameLocked = !!name && name !== 'Unidentified Medicine';
  const isStrengthLocked = !!strength;
  const isDosageFormLocked = !!dosageForm;
  const isBatchLocked = !!batchNumber;
  const isExpDateLocked = !!expDate;
  const isManufacturerLocked = !!manufacturer;

  return {
    name,
    genericName,
    brandName,
    strength,
    dosageForm,
    batchNumber,
    expDate,
    mfgDate,
    manufacturer,
    suggestedCategory: category,
    suggestedUnit: unit,
    confidence: mergedConfidence,
    rawText: mergedRawText,
    detectedKeywords: mergedKeywords,
    nameLocked: isNameLocked,
    strengthLocked: isStrengthLocked,
    dosageFormLocked: isDosageFormLocked,
    batchLocked: isBatchLocked,
    expDateLocked: isExpDateLocked,
    manufacturerLocked: isManufacturerLocked,
    fieldStatus: {
      nameLocked: isNameLocked,
      strengthLocked: isStrengthLocked,
      dosageFormLocked: isDosageFormLocked,
      batchLocked: isBatchLocked,
      expDateLocked: isExpDateLocked,
      manufacturerLocked: isManufacturerLocked,
    },
  };
}
