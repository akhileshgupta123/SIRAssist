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

function parseBool(val: string | undefined, defaultValue: boolean): boolean {
  if (val === undefined || val === '') return defaultValue;
  return val.toLowerCase() === 'true' || val === '1';
}

function parseIntOrDefault(val: string | undefined, defaultValue: number): number {
  if (!val) return defaultValue;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Global runtime mutable feature flag state (allows live overrides in UI)
let mutableFeatureFlags: FeatureFlags = {
  enableMultiAgentAi: parseBool(process.env.ENABLE_MULTI_AGENT_AI, true),
  enableSoundexPhonetics: parseBool(process.env.ENABLE_SOUNDEX_PHONETICS, true),
  enableDemographicAnomalyRules: parseBool(process.env.ENABLE_DEMOGRAPHIC_ANOMALY_RULES, true),
  enableForm7Purge: parseBool(process.env.ENABLE_FORM7_PURGE, true),
  enableDetailedLogging: parseBool(process.env.ENABLE_DETAILED_LOGGING, true),
  enableSimulatedBloFieldTasks: parseBool(process.env.ENABLE_SIMULATED_BLO_FIELD_TASKS, true),
};

export function getAppConfig(): AppConfig {
  const envRaw = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  const env: AppEnvironment = (['development', 'staging', 'production'].includes(envRaw)
    ? envRaw
    : 'development') as AppEnvironment;

  const port = parseIntOrDefault(process.env.PORT, 3000);
  const defaultDbPath = path.join(process.cwd(), 'data', `sir_assist_${env}.db`);
  const databasePath = process.env.DATABASE_PATH || defaultDbPath;
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;
  const hasGeminiApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  const slaThresholds: SlaThresholds = {
    criticalSlaHours: parseIntOrDefault(process.env.CRITICAL_SLA_HOURS, 12),
    highSlaHours: parseIntOrDefault(process.env.HIGH_SLA_HOURS, 24),
    duplicateThresholdScore: parseIntOrDefault(process.env.DUPLICATE_THRESHOLD_SCORE, 75),
  };

  return {
    env,
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
  mutableFeatureFlags = {
    enableMultiAgentAi: parseBool(process.env.ENABLE_MULTI_AGENT_AI, true),
    enableSoundexPhonetics: parseBool(process.env.ENABLE_SOUNDEX_PHONETICS, true),
    enableDemographicAnomalyRules: parseBool(process.env.ENABLE_DEMOGRAPHIC_ANOMALY_RULES, true),
    enableForm7Purge: parseBool(process.env.ENABLE_FORM7_PURGE, true),
    enableDetailedLogging: parseBool(process.env.ENABLE_DETAILED_LOGGING, true),
    enableSimulatedBloFieldTasks: parseBool(process.env.ENABLE_SIMULATED_BLO_FIELD_TASKS, true),
  };
  return { ...mutableFeatureFlags };
}
