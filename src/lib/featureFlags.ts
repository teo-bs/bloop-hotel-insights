// Feature flags configuration
export const featureFlags = {
  integrations: {
    apiEnabled: false, // When true, enables OAuth/API-key flow
    csvEnabled: true,
    templateDownloadEnabled: true,
    backgroundProcessingEnabled: true,
  },
  dashboard: {
    advancedFiltersEnabled: true,
    exportEnabled: true,
    realTimeUpdatesEnabled: false,
  },
  analytics: {
    telemetryEnabled: true,
    detailedLoggingEnabled: true,
    performanceMonitoringEnabled: true,
  },
  ui: {
    darkModeEnabled: true,
    animationsEnabled: true,
    compactModeEnabled: false,
  }
};

export function getFeatureFlag(flagPath: string): boolean {
  const keys = flagPath.split('.');
  let current: any = featureFlags;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return Boolean(current);
}

export function isFeatureEnabled(flagPath: string): boolean {
  return getFeatureFlag(flagPath);
}