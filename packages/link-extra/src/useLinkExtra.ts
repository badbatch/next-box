import { useContext } from 'react';
import { LinkContext, type LinkContextData } from './LinkProvider.tsx';

export const useLinkExtra = (): LinkContextData => {
  return useContext(LinkContext);
};
