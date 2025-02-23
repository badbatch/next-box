'use client';

import { type ReactNode, useEffect } from 'react';
import { createContext } from 'react';
import { getFeatureFlagsInBrowser } from '#helpers/getFeatureFlagsInBrowser.ts';
import { setFeatureFlagsInBrowser } from '#helpers/setFeatureFlagsInBrowser.ts';
import { type FeatureFlags } from '#types.ts';

export type FeatureFlagContext = {
  flags: FeatureFlags;
};

// Context requires an initial value, but this is set in the provider
// so casting to appease React bad typing.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const Context = createContext<FeatureFlagContext>({} as FeatureFlagContext);

export type FeatureFlagProviderProps = {
  children: ReactNode;
  devMode: boolean;
  envs: Record<string, string | undefined>;
};

export const FeatureFlagProvider = ({ children, devMode, envs }: Readonly<FeatureFlagProviderProps>) => {
  const flags = getFeatureFlagsInBrowser(envs, devMode);
  const flagsDepsKey = JSON.stringify(flags);

  useEffect(() => {
    setFeatureFlagsInBrowser(flags, devMode);
    // flagsDepsKey is derived from flags
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flagsDepsKey]);

  return <Context.Provider value={{ flags }}>{children}</Context.Provider>;
};
