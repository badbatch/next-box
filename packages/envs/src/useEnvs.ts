import { use } from 'react';
import { EnvsContext, type EnvsContextData } from './EnvsProvider.tsx';

export const useEnvs = (): EnvsContextData => {
  return use(EnvsContext);
};
