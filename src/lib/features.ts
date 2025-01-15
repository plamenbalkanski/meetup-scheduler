export const FEATURES = {
  UNLIMITED_MEETUPS: 'unlimited_meetups',
  EMAIL_INVITES: 'email_invites',
  NO_ADS: 'no_ads',
} as const;

type FeatureId = typeof FEATURES[keyof typeof FEATURES];
type Plan = 'free' | 'pro';

const PLAN_FEATURES: Record<Plan, FeatureId[]> = {
  free: [],
  pro: [FEATURES.UNLIMITED_MEETUPS, FEATURES.EMAIL_INVITES, FEATURES.NO_ADS],
};

export function isFeatureEnabled(featureId: FeatureId, plan: Plan = 'free'): boolean {
  return PLAN_FEATURES[plan].includes(featureId);
} 