import { type MouseEvent } from 'react';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export interface BreadcrumbRouteRule {
  regex: string;
  resolve: <T extends Record<string, unknown> = Record<string, unknown>>(captured?: T) => string;
  searchParmExclusions?: string[];
}

export type CreateRouteRules<T extends Record<string, unknown> = Record<string, unknown>> = (
  options: T,
) => BreadcrumbRouteRule[];

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
