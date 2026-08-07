import { type LinkProps } from 'next/link.js';
import { type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

// This needs to be as generic as possible
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OwnLinkProps = Record<string, any> & AnchorHTMLAttributes<HTMLAnchorElement>;

export type NextLinkComponent = ComponentType<
  LinkProps & {
    children: ReactNode;
  }
>;

export type LinkContextData = {
  NextLink: NextLinkComponent;
  OwnLink: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>;
  onLinkClicked: () => void;
};
