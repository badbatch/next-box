import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { addCacheBusterQueryParam, doUrlAndLocationMatch } from '#helpers.ts';
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
}: LinkProps<T>) => {
  const { NextLink, OwnLink, setLinkClicked } = useLinkExtra();

  if (disableRouterCache) {
    href = addCacheBusterQueryParam(href);
  }

  return (
    // @ts-expect-error Nextjs types wrong for nodenext
    <NextLink href={href} passHref prefetch={prefetch} scroll={scroll}>
      <OwnLink
        onClick={event => {
          if (onClick) {
            onClick(event);
          }

          if (!doUrlAndLocationMatch(href) && !event.defaultPrevented) {
            setLinkClicked(true);
          }
        }}
        {...otherProps}
      >
        {children}
      </OwnLink>
    </NextLink>
  );
};
