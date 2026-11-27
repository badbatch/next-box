import { type MouseEvent } from 'react';
import { type Promisable } from 'type-fest';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export type GetBreadcrumbRouteKey = (url: URL) => string;

export type BreadcrumbDestinations = {
  ancestors: readonly string[];
  parentHref?: string;
};

export interface BreadcrumbRouteRule<T extends object = object> {
  regex: string;
  resolve: (captured: T, existing: BreadcrumbItem) => Promisable<BreadcrumbItem>;
  /**
   * Ancestor hrefs ordered from the outermost route to the immediate parent.
   */
  resolveAncestors?: (url: URL) => readonly string[];
}

// Needs to be as generic as possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CreateRouteRules<T extends object = object> = (options?: T) => BreadcrumbRouteRule<any>[];

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
