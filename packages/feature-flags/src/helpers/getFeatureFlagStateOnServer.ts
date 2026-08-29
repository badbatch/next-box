import process from 'node:process';
import { type FeatureFlags } from '#types.ts';
import { getFeatureFlagStateFromEnvs } from './getFeatureFlagStateFromEnvs.ts';

export const getFeatureFlagStateOnServer = (featureFlags: FeatureFlags): FeatureFlags => ({
  ...getFeatureFlagStateFromEnvs(process.env, featureFlags),
});
