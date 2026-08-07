import { type AnchorHTMLAttributes, type JSX, type ReactNode } from 'react';
import { addCacheBusterQueryParam, shouldUrlAndLocationMatch } from '#helpers.ts';
import { useLinkExtra } from './useLinkExtra.ts';

export type LinkProps<T extends object> = {
  children: ReactNode;
  disableRouterCache?: boolean;
  href?: string;
  prefetch?: boolean;
  scroll?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  T;

export const Link = <T extends object>({
  children,
  disableRouterCache = true,
  href = '#',
  onClick,
  prefetch = false,
  scroll = false,
  ...otherProps
}: LinkProps<T>): JSX.Element => {
  // This and the two other disables below are false positives
  // eslint-disable-next-line @eslint-react/static-components
  const { NextLink, OwnLink, onLinkClicked } = useLinkExtra();

  if (disableRouterCache) {
    href = addCacheBusterQueryParam(href);
  }

  return (
    // This needs to remain: https://github.com/vercel/next.js/discussions/76329
    // eslint-disable-next-line @typescript-eslint/no-deprecated, @eslint-react/static-components
    <NextLink href={href} legacyBehavior passHref prefetch={prefetch} scroll={scroll}>
      <OwnLink // eslint-disable-line @eslint-react/static-components
        onClick={event => {
          if (onClick) {
            onClick(event);
          }

          if (!shouldUrlAndLocationMatch(href) && !event.defaultPrevented) {
            onLinkClicked();
          }
        }}
        {...otherProps}
      >
        {children}
      </OwnLink>
    </NextLink>
  );
};
