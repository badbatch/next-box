import { createContext } from 'react';
import { type BreadcrumbEntry } from './types.ts';

export type BreadcrumbConfig = {
  breadcrumbs: BreadcrumbEntry[];
};

export const BreadcrumbContext = createContext<BreadcrumbConfig>({ breadcrumbs: [] });
