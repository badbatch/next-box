import { type MouseEvent } from 'react';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export interface BreadcrumbRouteRule {
  regex: string;
  resolve: (captured?: Record<string, unknown>) => string;
  searchParmExclusions?: string[];
}

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
