import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    process.env.DISABLE_AUTO_START = 'true';
    process.env.VERCEL = '1';

    const serverModule = await import('../server.js').catch(() => import('../server.ts'));
    const app = await serverModule.createExpressApp();
    req.url = '/health';
    return app(req, res);
  } catch (err: any) {
    console.error('[Health Check Error]', err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'health_error',
        error: err?.message || String(err),
        name: err?.name,
        stack: err?.stack,
      })
    );
  }
}
