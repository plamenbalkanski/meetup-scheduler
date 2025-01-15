export const FEATURES = {
  MAP_ENABLED: true,
  UPGRADE_ENABLED: false,
  UNLIMITED_MEETUPS: 'unlimited_meetups',
  EMAIL_INVITES: 'email_invites',
  NO_ADS: 'no_ads',
} as const;

export type FeatureKey = keyof typeof FEATURES;

type Plan = 'free' | 'pro';

const PLAN_FEATURES: Record<Plan, FeatureKey[]> = {
  free: [],
  pro: [FEATURES.UNLIMITED_MEETUPS, FEATURES.EMAIL_INVITES, FEATURES.NO_ADS],
};

export function isFeatureEnabled(featureId: FeatureKey, plan: Plan = 'free'): boolean {
  return PLAN_FEATURES[plan].includes(featureId);
} 