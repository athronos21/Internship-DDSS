import type { IncomingMessage, ServerResponse } from 'http';

let cachedApp: any = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    process.env.DISABLE_AUTO_START = 'true';
    process.env.VERCEL = '1';

    const matchedPath =
      (req.headers['x-matched-path'] as string) ||
      (req.headers['x-vercel-matched-path'] as string);
    if (matchedPath && req.url !== matchedPath) {
      req.url = matchedPath;
    }

    if (!cachedApp) {
      const { createExpressApp } = await import('../server.ts');
      cachedApp = await createExpressApp();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless /api Error]', err);
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
