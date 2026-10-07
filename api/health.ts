import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    process.env.DISABLE_AUTO_START = 'true';
    process.env.VERCEL = '1';

    const { createExpressApp } = await import('../server.ts');
    const app = await createExpressApp();
    req.url = '/health';
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless /health Error]', err);
    res.statusCode = 200; // Return 200 so we can read error diagnostics in curl/browser
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'error_caught',
        error: err?.message || String(err),
        name: err?.name,
        stack: err?.stack,
      })
    );
  }
}
