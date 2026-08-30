import { NEXT_PUBLIC_FF } from '../constants.ts';
import { type FeatureFlags } from '../types.ts';

export const getFeatureFlagStateFromEnvs = (
  env: Record<string, string | undefined>,
  featureFlags: FeatureFlags,
): FeatureFlags => {
  const clone = structuredClone(featureFlags);

  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith(NEXT_PUBLIC_FF)) {
      continue;
    }

    const featureFlagName = name.slice(NEXT_PUBLIC_FF.length);

    if (Object.hasOwn(clone, featureFlagName) && clone[featureFlagName] !== undefined) {
      clone[featureFlagName].enabled = value === 'true';
    }
  }

  return clone;
};
