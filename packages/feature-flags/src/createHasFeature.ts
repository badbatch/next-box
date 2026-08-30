import { type ClientFilter } from '#ClientFilter.ts';
import { createIsFeatureOn } from '#helpers/createIsFeatureOn.ts';
import { featureFlagListToMap } from '#helpers/featureFlagListToMap.ts';
import { type FeatureFlag } from '#types.ts';

export type CreateHasFeatureOptions = {
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters?: ClientFilter<any>[];
  featureFlags: FeatureFlag[];
};

export const createHasFeature = ({
  clientFilters = [],
  featureFlags: featureFlagList,
}: CreateHasFeatureOptions): ((feature: string) => boolean) => {
  const featureFlags = featureFlagListToMap(featureFlagList);
  return createIsFeatureOn({ clientFilters, featureFlags });
};
