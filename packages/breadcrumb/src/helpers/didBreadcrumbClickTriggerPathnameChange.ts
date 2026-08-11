import { type BreadcrumbItem } from '#types.ts';

export const didBreadcrumbClickTriggerPathnameChange = (
  currentPathname: string,
  activeBreadcrumbItem: BreadcrumbItem | undefined,
): activeBreadcrumbItem is BreadcrumbItem =>
  !!activeBreadcrumbItem?.href && new URL(activeBreadcrumbItem.href, location.origin).pathname === currentPathname;
