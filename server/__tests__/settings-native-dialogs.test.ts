import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface AreaFixture {
  id: string;
  name: string;
  description: string;
  count: number;
}

async function loadAreaDeletionWorkflow() {
  try {
    return await import('../../src/features/settings/areaDeletion');
  } catch {
    return null;
  }
}

describe('Settings area deletion confirmation', () => {
  it('does not delete an area when the confirmation is only requested', async () => {
    const workflow = await loadAreaDeletionWorkflow();
    expect(workflow).not.toBeNull();

    const indoor: AreaFixture = { id: 'indoor', name: 'Indoor', description: 'Inside', count: 10 };
    const outdoor: AreaFixture = { id: 'outdoor', name: 'Outdoor', description: 'Outside', count: 5 };
    const areas = [indoor, outdoor];
    const requested = workflow!.requestAreaDeletion(areas, 'indoor');

    expect(requested.areaToDelete).toEqual(indoor);
    expect(requested.areas).toEqual([indoor, outdoor]);
  });

  it('deletes only the requested area after confirmation', async () => {
    const workflow = await loadAreaDeletionWorkflow();
    expect(workflow).not.toBeNull();

    const indoor: AreaFixture = { id: 'indoor', name: 'Indoor', description: 'Inside', count: 10 };
    const outdoor: AreaFixture = { id: 'outdoor', name: 'Outdoor', description: 'Outside', count: 5 };
    const requested = workflow!.requestAreaDeletion([indoor, outdoor], 'indoor');

    expect(workflow!.confirmAreaDeletion(requested.areas, requested.areaToDelete)).toEqual([outdoor]);
  });

  it('keeps native alert, confirm, and prompt out of covered deletion workflows', async () => {
    const sources = await Promise.all([
      readFile(path.resolve('app/settings/page.tsx'), 'utf8'),
      readFile(path.resolve('app/inventory/mapping/page.tsx'), 'utf8'),
    ]);

    for (const source of sources) {
      expect(source).not.toMatch(/\b(?:alert|confirm|prompt)\s*\(/);
    }
  });
});
