import { useContext } from 'react';
import { EnvsContext } from './EnvsProvider.tsx';

export const useEnvs = () => {
  return useContext(EnvsContext);
};
