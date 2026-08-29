import { type ClientFilter } from '#ClientFilter.ts';

export interface FeatureFlagClientFilter<P extends object> {
  name: string;
  parameters: P;
}

export interface FeatureFlagConditions {
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters: FeatureFlagClientFilter<any>[];
  requirementType?: 'Any' | 'All';
}

export type FeatureFlagContext = {
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters: ClientFilter<any>[];
  flags: FeatureFlags;
};

export interface FeatureFlag {
  conditions?: FeatureFlagConditions;
  enabled: boolean;
  name: string;
}

export type FeatureFlags = Record<string, FeatureFlag>;
