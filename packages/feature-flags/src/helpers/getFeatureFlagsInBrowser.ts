import { getFeatureFlagsFromEnvs } from '#helpers/getFeatureFlagsFromEnvs.ts';

export const getFeatureFlagsInBrowser = (envs: Record<string, string | undefined>) => ({
  ...getFeatureFlagsFromEnvs(envs),
});
