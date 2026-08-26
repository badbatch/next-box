import { type MouseEvent } from 'react';
import { type Promisable } from 'type-fest';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export interface BreadcrumbRouteRule {
  regex: string;
  // Need to keep this as permissable as possible
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (captured: Record<string, any>) => Promisable<string>;
  searchParmExclusions?: string[];
}

export type CreateRouteRules<T extends Record<string, unknown> = Record<string, unknown>> = (
  options: T,
) => BreadcrumbRouteRule[];

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
