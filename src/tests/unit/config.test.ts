import { describe, it, expect } from 'vitest';
import { getAppConfig, updateFeatureFlag, resetFeatureFlags } from '../../backend/config.js';

describe('Unit Tests: Centralized Environment Configuration & Feature Flags', () => {
  it('should load default environment configuration', () => {
    const config = getAppConfig();

    expect(config).toBeDefined();
    expect(['development', 'staging', 'production']).toContain(config.env);
    expect(config.port).toBe(3000);
    expect(config.databasePath).toContain('sir_assist');
    expect(config.featureFlags).toBeDefined();
    expect(config.featureFlags.enableMultiAgentAi).toBe(true);
    expect(config.slaThresholds.criticalSlaHours).toBe(12);
  });

  it('should allow toggling feature flags dynamically', () => {
    // Toggle enableSimulatedBloFieldTasks to false
    const updated = updateFeatureFlag('enableSimulatedBloFieldTasks', false);
    expect(updated.enableSimulatedBloFieldTasks).toBe(false);

    const newConfig = getAppConfig();
    expect(newConfig.featureFlags.enableSimulatedBloFieldTasks).toBe(false);

    // Reset back to defaults
    const reset = resetFeatureFlags();
    expect(reset.enableSimulatedBloFieldTasks).toBe(true);
  });
});
