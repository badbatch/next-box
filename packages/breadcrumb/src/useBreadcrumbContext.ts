import { use } from 'react';
import { type BreadcrumbConfig, BreadcrumbContext } from './BreadcrumbContext.ts';

export const useBreadcrumbContext = (): BreadcrumbConfig => use(BreadcrumbContext);
