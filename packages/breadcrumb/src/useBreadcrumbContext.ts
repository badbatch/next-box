import { useContext } from 'react';
import { BreadcrumbContext } from './BreadcrumbContext.ts';

export const useBreadcrumbContext = () => useContext(BreadcrumbContext);
