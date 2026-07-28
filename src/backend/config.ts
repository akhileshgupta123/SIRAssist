import path from 'path';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface FeatureFlags {
  enableMultiAgentAi: boolean;
  enableSoundexPhonetics: boolean;
  enableDemographicAnomalyRules: boolean;
  enableForm7Purge: boolean;
  enableDetailedLogging: boolean;
  enableSimulatedBloFieldTasks: boolean;
}

export interface SlaThresholds {
  criticalSlaHours: number;
  highSlaHours: number;
  duplicateThresholdScore: number;
}

export interface AppConfig {
  env: AppEnvironment;
  port: number;
  databasePath: string;
  appUrl: string;
  hasGeminiApiKey: boolean;
  featureFlags: FeatureFlags;
  slaThresholds: SlaThresholds;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableMultiAgentAi: true,
  enableSoundexPhonetics: true,
  enableDemographicAnomalyRules: true,
  enableForm7Purge: true,
  enableDetailedLogging: true,
  enableSimulatedBloFieldTasks: true,
};

let mutableFeatureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

export function getAppConfig(): AppConfig {
  const port = 3000;
  const databasePath = path.join(process.cwd(), 'data', 'sir_assist.db');
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;
  const hasGeminiApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  const slaThresholds: SlaThresholds = {
    criticalSlaHours: 12,
    highSlaHours: 24,
    duplicateThresholdScore: 75,
  };

  return {
    env: 'development',
    port,
    databasePath,
    appUrl,
    hasGeminiApiKey,
    featureFlags: { ...mutableFeatureFlags },
    slaThresholds,
  };
}

export function updateFeatureFlag(key: keyof FeatureFlags, value: boolean): FeatureFlags {
  if (key in mutableFeatureFlags) {
    mutableFeatureFlags[key] = value;
  }
  return { ...mutableFeatureFlags };
}

export function resetFeatureFlags(): FeatureFlags {
  mutableFeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
  return { ...mutableFeatureFlags };
}
