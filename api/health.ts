import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  let taskFiles: string[] = [];
  try {
    taskFiles = fs.readdirSync(process.cwd());
  } catch (e: any) {
    taskFiles = [e.message];
  }

  let serverJsExists = false;
  let serverTsExists = false;
  try {
    serverJsExists = fs.existsSync(path.join(process.cwd(), 'server.js'));
    serverTsExists = fs.existsSync(path.join(process.cwd(), 'server.ts'));
  } catch {}

  res.end(
    JSON.stringify({
      status: 'diagnostic',
      cwd: process.cwd(),
      taskFiles,
      serverJsExists,
      serverTsExists,
    })
  );
}
