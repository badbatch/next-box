import { useBreadcrumbContext } from './useBreadcrumbContext.ts';

export const useBreadcrumbs = () => {
  const { breadcrumbs } = useBreadcrumbContext();
  return breadcrumbs;
};
