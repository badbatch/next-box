import { use } from 'react';
import { Context } from '#Provider.tsx';
import { type FeatureFlagContext } from '#types.ts';

export const useFeatureFlags = (): FeatureFlagContext => {
  return use(Context);
};
