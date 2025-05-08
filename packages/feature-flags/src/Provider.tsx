import { type ReactNode } from 'react';
import { createContext } from 'react';
import { getFeatureFlagsInBrowser } from '#helpers/getFeatureFlagsInBrowser.ts';
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
  envs: Record<string, string | undefined>;
};

export const FeatureFlagProvider = ({ children, envs }: Readonly<FeatureFlagProviderProps>) => {
  const flags = getFeatureFlagsInBrowser(envs);
  return <Context.Provider value={{ flags }}>{children}</Context.Provider>;
};
