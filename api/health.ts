process.env.DISABLE_AUTO_START = 'true';
import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server.ts';

let cachedApp: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  req.url = '/health';
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp(req, res);
}
