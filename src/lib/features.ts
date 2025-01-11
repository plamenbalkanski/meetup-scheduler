export const FEATURES = {
  TIME_RANGES: 'time_ranges',
  CUSTOM_DURATION: 'custom_duration',
  MULTIPLE_DATES: 'multiple_dates',
} as const;

type FeatureId = typeof FEATURES[keyof typeof FEATURES];
type Plan = 'free' | 'pro';

const PLAN_FEATURES: Record<Plan, FeatureId[]> = {
  free: [FEATURES.MULTIPLE_DATES],
  pro: [FEATURES.TIME_RANGES, FEATURES.CUSTOM_DURATION, FEATURES.MULTIPLE_DATES],
};

export function isFeatureEnabled(featureId: FeatureId, plan: Plan = 'free'): boolean {
  return PLAN_FEATURES[plan].includes(featureId);
} 