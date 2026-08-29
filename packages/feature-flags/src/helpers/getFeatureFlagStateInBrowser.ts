import { getFeatureFlagStateFromEnvs } from '#helpers/getFeatureFlagStateFromEnvs.ts';
import { type FeatureFlags } from '#types.ts';

export const getFeatureFlagStateInBrowser = (
  featureFlags: FeatureFlags,
  envs: Record<string, string | undefined>,
): FeatureFlags => ({
  ...getFeatureFlagStateFromEnvs(envs, featureFlags),
});
