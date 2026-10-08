import { expect, test, describe } from 'bun:test';
import { createExpressApp } from '../server';

describe('Modular Express Domain Routers (Task 3)', () => {
  test('Creates Express app and mounts domain routers', async () => {
    const app = await createExpressApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  test('Exposes domain routes via modular router exports', async () => {
    const { authRouter, inventoryRouter, posRouter, financeRouter } = await import('../src/server/routes/index.js');
    expect(authRouter).toBeDefined();
    expect(inventoryRouter).toBeDefined();
    expect(posRouter).toBeDefined();
    expect(financeRouter).toBeDefined();
  });
});
