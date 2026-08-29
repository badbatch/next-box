import { type MouseEvent } from 'react';
import { type Promisable } from 'type-fest';

export type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};

export interface BreadcrumbRouteRule<T extends object = object> {
  regex: string;
  resolve: (captured: T, existing: BreadcrumbItem) => Promisable<BreadcrumbItem>;
}

export type CreateRouteRules<T extends object = object> = (options: T) => BreadcrumbRouteRule[];

export type OnBreadcrumbLinkClick = (breadcrumbEntry: BreadcrumbItem, event: MouseEvent<HTMLAnchorElement>) => void;
