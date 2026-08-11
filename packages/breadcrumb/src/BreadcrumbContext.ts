import { createContext } from 'react';
import { type BreadcrumbItem, type OnBreadcrumbLinkClick } from './types.ts';

export type BreadcrumbConfig = {
  breadcrumb: BreadcrumbItem[];
  onBreadcrumbLinkClick?: OnBreadcrumbLinkClick;
};

export const BreadcrumbContext = createContext<BreadcrumbConfig>({ breadcrumb: [] });
