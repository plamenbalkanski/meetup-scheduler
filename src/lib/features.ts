export const FEATURES = {
  MAP_ENABLED: false,
  UPGRADE_ENABLED: false,
  UNLIMITED_MEETUPS: 'UNLIMITED_MEETUPS',
  EMAIL_INVITES: 'EMAIL_INVITES',
  NO_ADS: 'NO_ADS',
} as const;

export type FeatureKey = keyof typeof FEATURES;

type Plan = 'free' | 'pro';

// Define feature values type
type FeatureValue = boolean | string;

const PLAN_FEATURES: Record<Plan, Array<keyof typeof FEATURES>> = {
  free: [],
  pro: ['UNLIMITED_MEETUPS', 'EMAIL_INVITES', 'NO_ADS'],
};

export function isFeatureEnabled(featureId: FeatureKey, plan: Plan = 'free'): boolean {
  if (typeof FEATURES[featureId] === 'boolean') {
    return FEATURES[featureId] as boolean;
  }
  return PLAN_FEATURES[plan].includes(featureId);
} 