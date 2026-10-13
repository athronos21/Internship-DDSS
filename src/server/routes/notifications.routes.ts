import { Router } from 'express';
import { db } from '../db.js';
import { requireRole, AuthenticatedRequest } from '../roleGuard.js';

export const notificationsRouter = Router();

const STAFF_ROLES = ['STORE_OWNER', 'SUPER_ADMIN', 'PHARMACIST', 'SUPPLIER'] as const;

// GET /api/notifications/alerts and /api/alerts (Real-Time Store Alerts)
notificationsRouter.get(
  ['/notifications/alerts', '/alerts'],
  requireRole([...STAFF_ROLES]),
  (req: AuthenticatedRequest, res) => {
    try {
      const alertData = db.getStoreAlerts();
      res.json({
        success: true,
        data: alertData,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch store alerts.',
      });
    }
  }
);

// POST /api/notifications/dismiss (Dismiss single alert or clear all)
notificationsRouter.post(
  '/notifications/dismiss',
  requireRole([...STAFF_ROLES]),
  (req: AuthenticatedRequest, res) => {
    try {
      const { alertId, clearAll } = req.body || {};
      if (clearAll) {
        const current = db.getStoreAlerts();
        current.alerts.forEach((a) => db.dismissStoreAlert(a.id));
      } else if (alertId && typeof alertId === 'string') {
        db.dismissStoreAlert(alertId);
      }
      const updated = db.getStoreAlerts();
      res.json({
        success: true,
        message: clearAll ? 'All active alerts cleared.' : 'Alert dismissed.',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to dismiss alert.',
      });
    }
  }
);

// POST /api/notifications/reset (Reset dismissals for fresh evaluation)
notificationsRouter.post(
  '/notifications/reset',
  requireRole([...STAFF_ROLES]),
  (req: AuthenticatedRequest, res) => {
    try {
      db.clearAllDismissedStoreAlerts();
      const updated = db.getStoreAlerts();
      res.json({
        success: true,
        message: 'All alert dismissals have been reset.',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to reset alert dismissals.',
      });
    }
  }
);
