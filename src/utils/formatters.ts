export function formatCurrency(amount: number, currency = 'ETB'): string {
  return `${currency} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateString;
  }
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryBadgeClass(expiryDate: string): { label: string; bgClass: string; textClass: string } {
  const days = getDaysUntilExpiry(expiryDate);

  if (days < 0) {
    return {
      label: `EXPIRED (${Math.abs(days)}d ago)`,
      bgClass: 'bg-red-100 dark:bg-red-950/50',
      textClass: 'text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    };
  }

  if (days <= 30) {
    return {
      label: `EXPIRES IN ${days} DAYS`,
      bgClass: 'bg-rose-100 dark:bg-rose-950/50',
      textClass: 'text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
    };
  }

  if (days <= 90) {
    return {
      label: `EXPIRING (${days} days)`,
      bgClass: 'bg-amber-100 dark:bg-amber-950/50',
      textClass: 'text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    };
  }

  return {
    label: `Valid (${formatDate(expiryDate)})`,
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    textClass: 'text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  };
}
