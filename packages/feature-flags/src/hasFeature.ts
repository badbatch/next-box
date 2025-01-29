import { type FeatureFlags } from '#types.ts';

export const createHasFeature = (featureFlags: FeatureFlags) => (name: string) => {
  return featureFlags[name] === 'true';
};
