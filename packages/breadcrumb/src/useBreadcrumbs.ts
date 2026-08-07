import { type BreadcrumbEntry } from '#types.ts';
import { useBreadcrumbContext } from './useBreadcrumbContext.ts';

export const useBreadcrumbs = (): BreadcrumbEntry[] => {
  const { breadcrumbs } = useBreadcrumbContext();
  return breadcrumbs;
};
