import { describe, expect, it } from 'vitest';

import {
  getInternalModules,
  getModuleDependents,
  disableInternalModule,
  validateModuleManifest,
  detectDependencyCycles,
  getSystemHealthOverview,
  InternalModule,
} from '../../src/features/modules/module-manager';

describe('Internal Module Manager Contract & Phase 3 Architecture', () => {
  it('returns valid trusted internal modules list', () => {
    const modules = getInternalModules();
    expect(modules.length).toBeGreaterThan(0);

    for (const mod of modules) {
      expect(mod.id).toBeTruthy();
      expect(mod.name).toBeTruthy();
      expect(mod.technicalName).toBeTruthy();
      expect(mod.version).toBeTruthy();
      expect(mod.permissions.length).toBeGreaterThan(0);
    }
  });

  it('calculates active dependents for core modules correctly', () => {
    const dependentsOfInventory = getModuleDependents('inventory_core');
    expect(dependentsOfInventory.length).toBeGreaterThan(0);
    expect(dependentsOfInventory.some((m) => m.technicalName === 'pos_core')).toBe(true);
  });

  it('prevents disabling module with dependents without rollback confirmation', () => {
    const result = disableInternalModule('inventory_core', false);
    expect(result.success).toBe(false);
    expect(result.dependents.length).toBeGreaterThan(0);
    expect(result.error).toContain('Rollback confirmation required');
  });

  it('allows disabling module with rollback confirmation', () => {
    const result = disableInternalModule('inventory_core', true);
    expect(result.success).toBe(true);
  });

  describe('Phase 3 Manifest Validation & Dependency Cycle Detection', () => {
    it('validates compliant trusted internal module manifests', () => {
      const validModule = getInternalModules()[0];
      const result = validateModuleManifest(validModule);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects manifests with invalid version or missing capabilities', () => {
      const invalidModule: Partial<InternalModule> = {
        id: 'test_mod',
        name: 'Test',
        technicalName: 'test_mod',
        version: 'invalid-semver',
        permissions: [],
        settingsScope: 'InvalidScope',
      };
      const result = validateModuleManifest(invalidModule);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('confirms existing registered modules have no cyclic dependencies', () => {
      const result = detectDependencyCycles(getInternalModules());
      expect(result.hasCycle).toBe(false);
    });

    it('detects cyclic dependencies if present', () => {
      const mockCyclicModules: InternalModule[] = [
        {
          id: 'mod_a',
          name: 'A',
          technicalName: 'mod_a',
          version: '1.0.0',
          compatibility: '>= 1.0.0',
          dependencies: [{ name: 'mod_b', constraint: '>= 1.0.0' }],
          health: 'healthy',
          enabled: true,
          permissions: ['perm.a'],
          settingsScope: 'Organization global',
          migrationsStatus: 'up_to_date',
          installedOn: '2026-08-10',
          description: 'A',
        },
        {
          id: 'mod_b',
          name: 'B',
          technicalName: 'mod_b',
          version: '1.0.0',
          compatibility: '>= 1.0.0',
          dependencies: [{ name: 'mod_a', constraint: '>= 1.0.0' }],
          health: 'healthy',
          enabled: true,
          permissions: ['perm.b'],
          settingsScope: 'Organization global',
          migrationsStatus: 'up_to_date',
          installedOn: '2026-08-10',
          description: 'B',
        },
      ];
      const result = detectDependencyCycles(mockCyclicModules);
      expect(result.hasCycle).toBe(true);
    });

    it('computes system health overview accurately', () => {
      const health = getSystemHealthOverview(getInternalModules());
      expect(health.summary.total).toBeGreaterThan(0);
      expect(health.summary.enabled).toBeGreaterThan(0);
      expect(['healthy', 'degraded', 'critical']).toContain(health.status);
    });
  });
});
