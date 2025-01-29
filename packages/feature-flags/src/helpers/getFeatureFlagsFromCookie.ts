import { FFLAGS } from '#constants.ts';
import { type FeatureFlags } from '../types.ts';

export const getFeatureFlagsFromCookie = (cookie?: (key: string) => string | undefined) => {
  const featureFlagsCookie = cookie ? cookie(FFLAGS) : undefined;
  // JSON.parse has any type
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return featureFlagsCookie ? (JSON.parse(featureFlagsCookie) as FeatureFlags) : undefined;
};
