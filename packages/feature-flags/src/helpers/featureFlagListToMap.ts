import { type FeatureFlag, type FeatureFlags } from '#types.ts';

export const featureFlagListToMap = (featureFlagsList: FeatureFlag[]): FeatureFlags =>
  Object.fromEntries(featureFlagsList.map(flag => [flag.name, flag]));
