import process from 'node:process';
import { getFeatureFlagsFromEnvs } from './getFeatureFlagsFromEnvs.ts';

export const getFeatureFlagsOnServer = (): Record<string, 'true' | 'false'> => ({
  ...getFeatureFlagsFromEnvs(process.env),
});
