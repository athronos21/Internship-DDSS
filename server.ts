import express from 'express';
import path from 'path';
import { registerDomainRoutes } from './src/server/routes/index.js';

export async function createExpressApp() {
  const app = express();

  // Enforce HTTPS and trust reverse proxy (Cloud Run / Nginx / Vercel)
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (proto && proto !== 'https' && process.env.NODE_ENV === 'production') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    // HSTS (HTTP Strict Transport Security) only in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
  });

  // Increase payload limit for base64 image uploads and larger payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health Check Endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Kaziniya Drug Store API',
      timestamp: new Date().toISOString(),
    });
  });

  // Register modular domain routers
  registerDomainRoutes(app);

  // Explicit Service Worker Route with Service-Worker-Allowed Header
  app.get('/sw.js', (req, res) => {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(swPath);
  });

  // Catch-all for unhandled API routes so they return JSON instead of falling through to Vite/SPA HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
}

export async function startServer(portOverride?: number) {
  const PORT = portOverride || (process.env.PORT ? parseInt(process.env.PORT, 10) : 5000);
  const app = await createExpressApp();

  // Vite Middleware in Development Mode
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const HOST = process.env.HOST || '0.0.0.0';
  const server = process.env.HOST
    ? app.listen(PORT, HOST, () => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`\n  🚀 Kaziniya Drug Store is running!`);
          console.log(`  ➜ Local:   http://localhost:${PORT}/`);
          console.log(`  ➜ Network: http://127.0.0.1:${PORT}/\n`);
        }
      })
    : app.listen(PORT, () => {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`\n  🚀 Kaziniya Drug Store is running!`);
          console.log(`  ➜ Local:   http://localhost:${PORT}/`);
          console.log(`  ➜ Network: http://127.0.0.1:${PORT}/\n`);
        }
      });

  return { app, server, port: PORT };
}

const isDirectExecution =
  typeof process !== 'undefined' &&
  Boolean(
    process.argv[1] &&
      (process.argv[1].endsWith('server.ts') ||
        process.argv[1].endsWith('server.js') ||
        process.argv[1].endsWith('server.cjs'))
  );

if (isDirectExecution && !process.env.DISABLE_AUTO_START && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}
