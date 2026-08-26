import { type BreadcrumbItem, type BreadcrumbRouteRule } from '../types.ts';
import { removeExcludedQueryParams } from './removeExcludedQueryParams.ts';

export const buildBreadcrumb = async (
  routeRules: BreadcrumbRouteRule[],
  history: string[],
): Promise<BreadcrumbItem[]> => {
  const breadcrumbItems: BreadcrumbItem[] = [];

  for (const [index, entry] of history.entries()) {
    // We only apply the first matching rule
    const matchingRule = routeRules.find(rule => new RegExp(rule.regex).test(entry));

    if (!matchingRule) {
      continue;
    }

    const { regex, resolve, searchParmExclusions = [] } = matchingRule;
    const items: BreadcrumbItem[] = [];
    const result = new RegExp(regex).exec(entry);

    items.push({
      href: removeExcludedQueryParams(entry, [...searchParmExclusions]),
      index,
      label: await Promise.resolve(resolve(result?.groups ?? {})),
    });
  }

  return breadcrumbItems;
};
