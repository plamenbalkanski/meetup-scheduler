export const FEATURES = {
  TIME_RANGES: 'time_ranges',
  CUSTOM_DURATION: 'custom_duration',
  MULTIPLE_DATES: 'multiple_dates',
  // Add more features as needed
} as const;

export type Feature = keyof typeof FEATURES;

export function isFeatureEnabled(feature: Feature, plan: 'free' | 'pro' = 'free'): boolean {
  const featureMap = {
    free: [FEATURES.MULTIPLE_DATES],
    pro: [FEATURES.TIME_RANGES, FEATURES.CUSTOM_DURATION, FEATURES.MULTIPLE_DATES],
  };

  return featureMap[plan].includes(feature);
} 