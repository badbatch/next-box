import { type LinkProps } from 'next/link.js';
import { type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

export type NextLinkProps = LinkProps & { children: ReactNode };

// This needs to be as generic as possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OwnLinkProps = Record<string, any> & AnchorHTMLAttributes<HTMLAnchorElement>;

export type LinkContextData = {
  NextLink: ComponentType<NextLinkProps>;
  OwnLink: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>;
  setLinkClicked: (clicked: true) => void;
};
