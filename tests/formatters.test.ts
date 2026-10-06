import { describe, expect, it } from 'bun:test';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getDaysUntilExpiry,
  getExpiryBadgeClass,
} from '../src/utils/formatters';

describe('Formatters and Helpers Suite', () => {
  describe('formatCurrency', () => {
    it('formats amount in ETB by default with commas and decimals', () => {
      expect(formatCurrency(1250.5)).toBe('ETB 1,250.50');
      expect(formatCurrency(0)).toBe('ETB 0.00');
      expect(formatCurrency(1000000)).toBe('ETB 1,000,000.00');
    });

    it('formats amount with custom currency symbol', () => {
      expect(formatCurrency(50.25, 'USD')).toBe('USD 50.25');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings into readable dates', () => {
      const res = formatDate('2026-10-15T12:00:00Z');
      expect(res).toContain('2026');
      expect(res).toContain('Oct');
    });

    it('returns N/A for empty or falsy inputs', () => {
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('')).toBe('N/A');
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime strings into date and time', () => {
      const res = formatDateTime('2026-05-12T14:30:00Z');
      expect(res).toContain('2026');
      expect(res).toContain('May');
    });

    it('returns N/A for empty strings', () => {
      expect(formatDateTime('')).toBe('N/A');
      expect(formatDateTime(undefined)).toBe('N/A');
    });
  });

  describe('getDaysUntilExpiry & getExpiryBadgeClass', () => {
    it('calculates days until expiry correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);
      const futureStr = futureDate.toISOString().split('T')[0];

      const days = getDaysUntilExpiry(futureStr);
      expect(days).toBeGreaterThanOrEqual(44);
      expect(days).toBeLessThanOrEqual(46);
    });

    it('returns EXPIRED badge for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const pastStr = pastDate.toISOString().split('T')[0];

      const badge = getExpiryBadgeClass(pastStr);
      expect(badge.label).toContain('EXPIRED');
      expect(badge.bgClass).toContain('red');
    });

    it('returns critical expiring soon badge for <= 30 days', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 15);
      const soonStr = soonDate.toISOString().split('T')[0];

      const badge = getExpiryBadgeClass(soonStr);
      expect(badge.label).toContain('EXPIRES IN');
      expect(badge.bgClass).toContain('rose');
    });

    it('returns warning expiring soon badge for <= 90 days', () => {
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 60);
      const warningStr = warningDate.toISOString().split('T')[0];

      const badge = getExpiryBadgeClass(warningStr);
      expect(badge.label).toContain('EXPIRING');
      expect(badge.bgClass).toContain('amber');
    });

    it('returns valid badge for dates > 90 days out', () => {
      const validDate = new Date();
      validDate.setDate(validDate.getDate() + 180);
      const validStr = validDate.toISOString().split('T')[0];

      const badge = getExpiryBadgeClass(validStr);
      expect(badge.label).toContain('Valid');
      expect(badge.bgClass).toContain('emerald');
    });
  });
});
