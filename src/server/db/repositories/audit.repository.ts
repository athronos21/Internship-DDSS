import { db } from '../../db.js';
import type { AuditLog } from '../types.js';

export const AuditRepository = {
  list(limit = 100): AuditLog[] {
    return db.auditLogs.slice(0, limit);
  },

  log(entry: any): AuditLog {
    const newLog: AuditLog = {
      id: entry.id || `log-${Date.now()}`,
      userId: entry.userId || 'u-1',
      action: entry.action || 'SYSTEM_ACTION',
      entityType: entry.entityType || 'SYSTEM',
      entityId: entry.entityId || 'system',
      oldData: entry.oldData,
      newData: entry.newData,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent || 'system',
      createdAt: new Date().toISOString(),
    };
    db.auditLogs.unshift(newLog);
    return newLog;
  },
};
