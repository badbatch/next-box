import { NEXT_PUBLIC_FF } from '../constants.ts';
import { type FeatureFlags } from '../types.ts';

export const getFeatureFlagStateFromEnvs = (
  env: Record<string, string | undefined>,
  featureFlags: FeatureFlags,
): FeatureFlags => {
  for (const [name, value] of Object.entries(env)) {
    // Am okay with this.
    // eslint-disable-next-line unicorn/no-computed-property-existence-check
    if (name.startsWith(NEXT_PUBLIC_FF) && featureFlags[name]) {
      featureFlags[name].enabled = value === 'true';
    }
  }

  return featureFlags;
};
