import type NextLink from 'next/link.js';
import { type AnchorHTMLAttributes, type ComponentType } from 'react';

// This needs to be as generic as possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OwnLinkProps = Record<string, any> & AnchorHTMLAttributes<HTMLAnchorElement>;

export type LinkContextData = {
  NextLink: typeof NextLink;
  OwnLink: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>;
  setLinkClicked: (clicked: true) => void;
};
