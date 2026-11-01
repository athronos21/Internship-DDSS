/**
 * Code-128 Barcode Generator Utility
 * Pure TypeScript implementation of standard Code-128 (Subset B)
 * Generates crisp SVG barcodes with check digit calculation & human-readable labels.
 */

// Code-128 Subset B patterns (each element is a 6-character string representing bar & space widths)
// Total module width per character = 11 modules (except stop code which is 13 modules)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (106 = Stop)
];

const START_CODE_B = 104; // Subset B start code value
const STOP_CODE = 106;

/**
 * Encodes ASCII string into Code-128 Subset B value sequence
 */
export function encodeCode128B(text: string): { values: number[]; pattern: string } {
  // Subset B maps ASCII 32-127 (space to DEL) by subtracting 32
  const sanitized = text.replace(/[^\x20-\x7E]/g, '');
  const charValues: number[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i) - 32;
    charValues.push(code >= 0 && code <= 95 ? code : 0);
  }

  // Calculate Checksum: (StartB + Sum(char_val * (position + 1))) % 103
  let checksumTotal = START_CODE_B;
  for (let i = 0; i < charValues.length; i++) {
    checksumTotal += charValues[i] * (i + 1);
  }
  const checkDigit = checksumTotal % 103;

  const allValues = [START_CODE_B, ...charValues, checkDigit, STOP_CODE];

  // Build binary modules pattern (1s = dark bar, 0s = light space)
  let binaryString = '0000000000'; // Leading quiet zone (10 modules)

  allValues.forEach((val) => {
    const charPattern = CODE128_PATTERNS[val] || CODE128_PATTERNS[0];
    let isBar = true;
    for (let j = 0; j < charPattern.length; j++) {
      const width = parseInt(charPattern[j], 10);
      binaryString += (isBar ? '1' : '0').repeat(width);
      isBar = !isBar;
    }
  });

  binaryString += '0000000000'; // Trailing quiet zone (10 modules)

  return {
    values: allValues,
    pattern: binaryString,
  };
}

export interface BarcodeRenderOptions {
  moduleWidth?: number; // width in px of a single 1-module bar
  height?: number; // height in px of the barcode bars
  includeText?: boolean; // display human readable string below
  fontSize?: number;
  textColor?: string;
  barColor?: string;
  bgColor?: string;
  margin?: number;
}

/**
 * Generates an SVG string representation of a Code-128 barcode
 */
export function generateCode128SvgString(
  text: string,
  options: BarcodeRenderOptions = {}
): string {
  const {
    moduleWidth = 2,
    height = 60,
    includeText = true,
    fontSize = 12,
    textColor = '#0f172a',
    barColor = '#000000',
    bgColor = '#ffffff',
    margin = 8,
  } = options;

  const { pattern } = encodeCode128B(text);
  const totalBarcodeWidth = pattern.length * moduleWidth;
  const svgWidth = totalBarcodeWidth + margin * 2;
  const textSpace = includeText ? fontSize + 8 : 0;
  const svgHeight = height + margin * 2 + textSpace;

  let rects = '';
  let currentBarWidth = 0;
  let currentBarX = 0;

  for (let i = 0; i < pattern.length; i++) {
    const isDark = pattern[i] === '1';
    if (isDark) {
      if (currentBarWidth === 0) {
        currentBarX = margin + i * moduleWidth;
      }
      currentBarWidth += moduleWidth;
    } else {
      if (currentBarWidth > 0) {
        rects += `<rect x="${currentBarX}" y="${margin}" width="${currentBarWidth}" height="${height}" fill="${barColor}" />`;
        currentBarWidth = 0;
      }
    }
  }

  // Flush last bar if needed
  if (currentBarWidth > 0) {
    rects += `<rect x="${currentBarX}" y="${margin}" width="${currentBarWidth}" height="${height}" fill="${barColor}" />`;
  }

  const textElement = includeText
    ? `<text x="${svgWidth / 2}" y="${margin + height + fontSize + 2}" font-family="monospace, Courier, sans-serif" font-size="${fontSize}" font-weight="700" fill="${textColor}" text-anchor="middle" letter-spacing="1.5">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: ${bgColor};">
    ${rects}
    ${textElement}
  </svg>`;
}

/**
 * Helper to generate a unique random medicine barcode with a standardized prefix
 */
export function generateUniqueMedicineBarcode(prefix = 'KZN'): string {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestampPart}${randomPart}`;
}

/**
 * Checks if a string is a valid format for Code-128 subset B
 */
export function isValidCode128(text: string): boolean {
  if (!text || text.length === 0) return false;
  // ASCII 32 to 126
  return /^[\x20-\x7E]+$/.test(text);
}
