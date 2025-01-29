import process from 'node:process';
import { getFeatureFlagsFromCookie } from './getFeatureFlagsFromCookie.ts';
import { getFeatureFlagsFromEnvs } from './getFeatureFlagsFromEnvs.ts';

export type GetFeatureFlagsOnServerOptions = {
  cookie?: (key: string) => string | undefined;
  devMode: boolean;
};

export const getFeatureFlagsOnServer = ({ cookie, devMode }: GetFeatureFlagsOnServerOptions) => ({
  ...getFeatureFlagsFromEnvs(process.env),
  ...(devMode && cookie ? getFeatureFlagsFromCookie(cookie) : undefined),
});
