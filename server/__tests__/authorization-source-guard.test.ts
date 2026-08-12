import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('business route authorization source guard', () => {
  it('does not authorize server routes with literal roles', async () => {
    const routesDirectory = path.resolve('server/routes');
    const routeFiles = (await readdir(routesDirectory)).filter((file) => file.endsWith('.ts'));
    const violations: string[] = [];

    for (const file of routeFiles) {
      const source = await readFile(path.join(routesDirectory, file), 'utf8');
      if (/requireRole\s*\(/.test(source)) violations.push(file);
    }

    expect(violations).toEqual([]);
  });
});
