import { describe, expect, it } from 'bun:test';
import { encodeCode128B } from '../src/utils/code128';

describe('Code-128 Barcode Generation Suite', () => {
  it('encodes standard alphanumeric pharmacy item codes', () => {
    const text = 'MED-AMOX-500';
    const result = encodeCode128B(text);

    expect(result).toBeDefined();
    expect(result.values.length).toBeGreaterThan(text.length);
    // Starts with Start Code B (104)
    expect(result.values[0]).toBe(104);
    // Ends with Stop Code (106)
    expect(result.values[result.values.length - 1]).toBe(106);
    // Contains binary pattern
    expect(typeof result.pattern).toBe('string');
    expect(result.pattern.length).toBeGreaterThan(50);
  });

  it('handles batch codes with numbers and slashes', () => {
    const text = 'BAT2026/09';
    const result = encodeCode128B(text);

    expect(result.values[0]).toBe(104);
    expect(result.pattern).toMatch(/^[01]+$/);
  });

  it('computes valid modulo-103 check digit', () => {
    const text = 'KZ101';
    const result = encodeCode128B(text);

    // Verify the check digit is within valid 0-102 range
    const checkDigit = result.values[result.values.length - 2];
    expect(checkDigit).toBeGreaterThanOrEqual(0);
    expect(checkDigit).toBeLessThanOrEqual(102);
  });
});
