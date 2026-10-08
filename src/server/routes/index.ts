import type { Express } from 'express';
import { authRouter } from './auth.routes.js';
import { inventoryRouter } from './inventory.routes.js';
import { posRouter } from './pos.routes.js';
import { purchasingRouter } from './purchasing.routes.js';
import { financeRouter } from './finance.routes.js';
import { hrRouter } from './hr.routes.js';
import { adminRouter } from './admin.routes.js';
import { aiRouter } from './ai.routes.js';

export function registerDomainRoutes(app: Express) {
  app.use('/api', authRouter);
  app.use('/api', inventoryRouter);
  app.use('/api', posRouter);
  app.use('/api', purchasingRouter);
  app.use('/api', financeRouter);
  app.use('/api', hrRouter);
  app.use('/api', adminRouter);
  app.use('/api', aiRouter);
}

export {
  authRouter,
  inventoryRouter,
  posRouter,
  purchasingRouter,
  financeRouter,
  hrRouter,
  adminRouter,
  aiRouter,
};
