process.env.DISABLE_AUTO_START = 'true';
import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server.ts';

let cachedApp: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // If Vercel rewrote the URL, recover the real route from headers
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-vercel-matched-path'] as string);
  if (matchedPath && req.url !== matchedPath) {
    req.url = matchedPath;
  }

  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp(req, res);
}
