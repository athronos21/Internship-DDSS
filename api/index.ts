import type { IncomingMessage, ServerResponse } from 'http';

let cachedApp: any = null;

async function getApp() {
  if (!cachedApp) {
    process.env.DISABLE_AUTO_START = 'true';
    process.env.VERCEL = '1';
    const serverModule = await import('../server.js').catch(() => import('../server.ts'));
    cachedApp = await serverModule.createExpressApp();
  }
  return cachedApp;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const matchedPath =
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string);

    if (matchedPath) {
      req.url = matchedPath;
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
