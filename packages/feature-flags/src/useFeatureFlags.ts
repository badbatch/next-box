import { useContext } from 'react';
import { Context } from '#Provider.tsx';

export const useFeatureFlags = () => {
  return useContext(Context);
};
