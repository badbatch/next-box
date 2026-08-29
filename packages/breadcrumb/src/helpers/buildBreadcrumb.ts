import { type BreadcrumbItem, type BreadcrumbRouteRule } from '../types.ts';

export const buildBreadcrumb = async (
  routeRules: BreadcrumbRouteRule[],
  history: string[],
): Promise<BreadcrumbItem[]> => {
  const breadcrumbItems: BreadcrumbItem[] = [];

  for (const [index, entry] of history.entries()) {
    // We only apply the first matching rule
    const matchingRules = routeRules.filter(rule => new RegExp(rule.regex).test(entry));

    if (matchingRules.length === 0) {
      continue;
    }

    let item: BreadcrumbItem = {
      href: entry,
      index,
      label: '',
    };

    for (const rule of matchingRules) {
      const result = new RegExp(rule.regex).exec(entry);
      item = await Promise.resolve(rule.resolve(result?.groups ?? {}, item));
    }

    breadcrumbItems.push(item);
  }

  return breadcrumbItems;
};
