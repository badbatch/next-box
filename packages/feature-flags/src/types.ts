import { type ClientFilter } from '#ClientFilter.ts';

export interface ClientFilterConfig<P extends object> {
  name: string;
  parameters: P;
}

export interface FeatureFlagConditions {
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters: ClientFilterConfig<any>[];
  requirementType?: 'Any' | 'All';
}

export type FeatureFlagContext = {
  // This needs to be kept as permissive as possible.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientFilters: ClientFilter<any>[];
  featureFlags: FeatureFlags;
};

export interface FeatureFlag {
  conditions?: FeatureFlagConditions;
  enabled: boolean;
  name: string;
}

export type FeatureFlags = Record<string, FeatureFlag>;
