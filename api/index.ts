import type { IncomingMessage, ServerResponse } from 'http';
import { createExpressApp } from '../server.js';

process.env.DISABLE_AUTO_START = 'true';
process.env.VERCEL = '1';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const rawUrl = req.url || '';
    const originalUrl =
      (req.headers['x-forwarded-url'] as string) ||
      (req.headers['x-invoke-path'] as string) ||
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string) ||
      (req.headers['x-original-url'] as string) ||
      rawUrl;

    if (originalUrl && originalUrl.startsWith('/api') && originalUrl !== '/api') {
      req.url = originalUrl;
    }

    const app = await getApp();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Gateway Error]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: err?.message || String(err),
        name: err?.name,
        stack: err?.stack,
      })
    );
  }
}
