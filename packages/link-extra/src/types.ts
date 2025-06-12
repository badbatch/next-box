import type NextLink from 'next/link.js';
import {
  type AnchorHTMLAttributes,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';

export type OwnLinkForwardRef = ForwardRefExoticComponent<
  PropsWithoutRef<OwnLinkProps> & RefAttributes<HTMLAnchorElement>
>;

export type LinkContextData = {
  NextLink: typeof NextLink;
  OwnLink: OwnLinkForwardRef;
  setLinkClicked: (clicked: true) => void;
};

// This needs to be as generic as possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OwnLinkProps = Record<string, any> & AnchorHTMLAttributes<HTMLAnchorElement>;
