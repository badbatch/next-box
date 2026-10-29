import { type FC, type ReactNode } from 'react';
import { createContext } from 'react';
import { type ClientFilter } from '#ClientFilter.ts';
import { featureFlagListToMap } from '#helpers/featureFlagListToMap.ts';
import { getFeatureFlagStateFromEnvs } from '#helpers/getFeatureFlagStateFromEnvs.ts';
import { type FeatureFlag, type FeatureFlagContext } from '#types.ts';

// Context requires an initial value, but this is set in the provider so casting
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const Context = createContext<FeatureFlagContext>({} as FeatureFlagContext);

export type FeatureFlagProviderProps = {
  children: ReactNode;
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters?: ClientFilter<any>[];
  envs: Record<string, string | undefined>;
  featureFlags: FeatureFlag[];
};

export const FeatureFlagProvider: FC<FeatureFlagProviderProps> = ({
  children,
  clientFilters = [],
  envs,
  featureFlags: featureFlagList,
}) => {
  const featureFlags = getFeatureFlagStateFromEnvs(envs, featureFlagListToMap(featureFlagList));
  return <Context value={{ clientFilters, featureFlags }}>{children}</Context>;
};
