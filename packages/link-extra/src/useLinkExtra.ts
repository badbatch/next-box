import { useContext } from 'react';
import { type LinkContextData } from '#types.ts';
import { LinkContext } from './LinkProvider.tsx';

export const useLinkExtra = (): LinkContextData => {
  return useContext(LinkContext);
};
