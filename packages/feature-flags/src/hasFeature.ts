import { getFeatureFlagsOnServer } from '#helpers/getFeatureFlagsOnServer.ts';

export const hasFeature = (feature: string): boolean => {
  const featureFlags = getFeatureFlagsOnServer();
  return featureFlags[feature] === 'true';
};
