import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server.ts';

let cachedApp: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp(req, res);
}
