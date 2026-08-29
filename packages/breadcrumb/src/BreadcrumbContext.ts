import { createContext } from 'react';
import { type BreadcrumbItem, type OnBreadcrumbLinkClick } from './types.ts';

export type BreadcrumbConfig = {
  breadcrumb: BreadcrumbItem[];
  /**
   * Allows the `BreadcrumbProvider` to know if the
   * change in history was triggered by clicking on
   * one of its own links.
   */
  onBreadcrumbLinkClick?: OnBreadcrumbLinkClick;
};

export const BreadcrumbContext = createContext<BreadcrumbConfig>({ breadcrumb: [] });
