import { useFeatureFlags } from '#useFeatureFlags.ts';

// In this case, use is a more appropriate prefix
// eslint-disable-next-line unicorn/consistent-boolean-name
export const useFeature = (feature: string): boolean => {
  const { flags } = useFeatureFlags();
  return flags[feature] === 'true';
};
