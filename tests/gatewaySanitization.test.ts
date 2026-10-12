import { describe, it, expect } from 'bun:test';
import fs from 'fs';
import path from 'path';

describe('Serverless & Mobile Client Sanitization', () => {
  it('api/index.ts catch block does not return stack trace in client payload', () => {
    const content = fs.readFileSync(path.resolve(process.cwd(), 'api/index.ts'), 'utf-8');
    expect(content).not.toContain('stack: err?.stack');
    expect(content).not.toContain('err?.stack');
    expect(content).toContain("message: 'Internal server error'");
  });

  it('mobile/lib/services/api_service.dart does not contain default x-user-id header', () => {
    const content = fs.readFileSync(
      path.resolve(process.cwd(), 'mobile/lib/services/api_service.dart'),
      'utf-8'
    );
    expect(content).not.toContain("'x-user-id': 'u-2'");
  });
});
