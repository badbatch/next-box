import Cookies from 'js-cookie';
import { getFeatureFlagsFromCookie } from '#helpers/getFeatureFlagsFromCookie.ts';
import { getFeatureFlagsFromEnvs } from '#helpers/getFeatureFlagsFromEnvs.ts';

export const getFeatureFlagsInBrowser = (envs: Record<string, string | undefined>, devMode?: boolean) => ({
  ...getFeatureFlagsFromEnvs(envs),
  ...(devMode ? getFeatureFlagsFromCookie(name => Cookies.get(name)) : undefined),
});
