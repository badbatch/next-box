import { type MouseEvent } from 'react';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export interface BreadcrumbRouteRule {
  regex: string;
  resolve: <T extends Record<string, unknown>>(captured?: T) => string;
  searchParmExclusions?: string[];
}

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
