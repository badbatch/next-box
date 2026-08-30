import { type ClientFilterConfig, type FeatureFlagContext } from '#types.ts';

export const createIsFeatureOn =
  ({ clientFilters, featureFlags }: FeatureFlagContext) =>
  (feature: string): boolean => {
    const flag = featureFlags[feature];

    if (!flag) {
      return false;
    }

    const { conditions, enabled } = flag;

    if (!enabled) {
      return false;
    }

    if (conditions?.clientFilters) {
      const requirementType = conditions.requirementType ?? 'Any';

      // This needs to be kept as permissive as possible.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const areConditionsMet = (filterConfig: ClientFilterConfig<any>): boolean => {
        const clientFilter = clientFilters.find(f => f.name === filterConfig.name);
        return clientFilter?.resolve(filterConfig.parameters) ?? false;
      };

      return requirementType === 'Any'
        ? conditions.clientFilters.some(filterConfig => areConditionsMet(filterConfig))
        : conditions.clientFilters.every(filterConfig => areConditionsMet(filterConfig));
    }

    return true;
  };
