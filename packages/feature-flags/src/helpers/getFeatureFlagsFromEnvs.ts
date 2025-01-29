import { NEXT_PUBLIC_FF } from '../constants.ts';
import { type FeatureFlags } from '../types.ts';

export const getFeatureFlagsFromEnvs = (env: Record<string, string | undefined>): FeatureFlags => {
  return Object.keys(env).reduce((acc, key) => {
    if (key.startsWith(NEXT_PUBLIC_FF)) {
      return {
        ...acc,
        [key.slice(15)]: env[key],
      };
    }

    return acc;
  }, {});
};
