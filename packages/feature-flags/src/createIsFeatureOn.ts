import { type FeatureFlagClientFilter, type FeatureFlagContext } from '#types.ts';

export const createIsFeatureOn =
  ({ clientFilters, flags }: FeatureFlagContext) =>
  (feature: string): boolean => {
    const flag = flags[feature];

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
      const areConditionsMet = (filterConfig: FeatureFlagClientFilter<any>): boolean => {
        const clientFilter = clientFilters.find(f => f.name === filterConfig.name);
        return clientFilter?.resolve(filterConfig.parameters) ?? false;
      };

      return requirementType === 'Any'
        ? conditions.clientFilters.some(filterConfig => areConditionsMet(filterConfig))
        : conditions.clientFilters.every(filterConfig => areConditionsMet(filterConfig));
    }

    return true;
  };
