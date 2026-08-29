import { type FC, type ReactNode } from 'react';
import { createContext } from 'react';
import { type ClientFilter } from '#ClientFilter.ts';
import { getFeatureFlagStateInBrowser } from '#helpers/getFeatureFlagStateInBrowser.ts';
import { type FeatureFlagContext, type FeatureFlags } from '#types.ts';

// Context requires an initial value, but this is set in the provider so casting
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const Context = createContext<FeatureFlagContext>({} as FeatureFlagContext);

export type FeatureFlagProviderProps = {
  children: ReactNode;
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters?: ClientFilter<any>[];
  envs: Record<string, string | undefined>;
  featureFlags: FeatureFlags;
};

export const FeatureFlagProvider: FC<FeatureFlagProviderProps> = ({
  children,
  clientFilters = [],
  envs,
  featureFlags,
}) => {
  const flags = getFeatureFlagStateInBrowser(featureFlags, envs);
  return <Context value={{ clientFilters, flags }}>{children}</Context>;
};
