import { useFeatureFlags } from '#useFeatureFlags.ts';

export const useFeature = (feature: string) => {
  const { flags } = useFeatureFlags();
  return flags[feature] === 'true';
};
