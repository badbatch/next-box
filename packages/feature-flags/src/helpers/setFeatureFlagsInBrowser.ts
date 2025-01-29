import Cookies from 'js-cookie';
import { FFLAGS } from '../constants.ts';
import { type FeatureFlags } from '../types.ts';

export const setFeatureFlagsToCookie = (featureFlags: FeatureFlags) => {
  Cookies.set(FFLAGS, JSON.stringify(featureFlags));
};

export const setFeatureFlagsInBrowser = (featureFlags: FeatureFlags, devMode?: boolean) => {
  if (devMode) {
    setFeatureFlagsToCookie(featureFlags);
  }
};
