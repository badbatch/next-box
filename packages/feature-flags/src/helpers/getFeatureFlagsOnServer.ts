import process from 'node:process';
import { getFeatureFlagsFromEnvs } from './getFeatureFlagsFromEnvs.ts';

export const getFeatureFlagsOnServer = () => ({
  ...getFeatureFlagsFromEnvs(process.env),
});
