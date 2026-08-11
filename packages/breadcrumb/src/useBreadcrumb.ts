import { type BreadcrumbConfig } from '#BreadcrumbContext.ts';
import { useBreadcrumbContext } from './useBreadcrumbContext.ts';

export const useBreadcrumb = (): BreadcrumbConfig => {
  return useBreadcrumbContext();
};
