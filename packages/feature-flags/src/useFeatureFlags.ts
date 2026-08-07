import { use } from 'react';
import { Context, type FeatureFlagContext } from '#Provider.tsx';

export const useFeatureFlags = (): FeatureFlagContext => {
  return use(Context);
};
