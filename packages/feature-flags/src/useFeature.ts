import { createIsFeatureOn } from '#createIsFeatureOn.ts';
import { useFeatureFlags } from '#useFeatureFlags.ts';

// In this case, use is a more appropriate prefix
// eslint-disable-next-line unicorn/consistent-boolean-name
export const useFeature = (feature: string): boolean => {
  const { clientFilters, flags } = useFeatureFlags();
  const isFeatureOn = createIsFeatureOn({ clientFilters, flags });
  return isFeatureOn(feature);
};
