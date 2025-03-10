import randomString from 'randomstring';
import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { useLinkExtra } from './useLinkExtra.ts';

export type LinkProps<T extends object> = {
  children: ReactNode;
  disableRouterCache?: boolean;
  href?: string;
  prefetch?: boolean;
  scroll?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement> &
  T;

const doUrlAndLocationPathnamesMatch = (url: string) => {
  // It is possible for this to be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!globalThis.location) {
    return false;
  }

  const parsedUrl = URL.parse(url, globalThis.location.origin);

  if (!parsedUrl) {
    return false;
  }

  const { pathname } = parsedUrl;
  return pathname === globalThis.location.pathname;
};

export const addCacheBusterQueryParam = (url: string): string => {
  // It is possible for this to be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!globalThis.location) {
    return url;
  }

  const parsedUrl = URL.parse(url, globalThis.location.origin);

  if (!parsedUrl) {
    return url;
  }

  const { pathname, search } = parsedUrl;

  if (pathname === globalThis.location.pathname) {
    return url;
  }

  const searchParams = new URLSearchParams(search);
  searchParams.set('y', randomString.generate(15));
  return `${pathname}?${searchParams.toString()}`;
};

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
    <NextLink href={href} legacyBehavior passHref prefetch={prefetch} scroll={scroll}>
      <OwnLink
        onClick={event => {
          if (onClick) {
            onClick(event);
          }

          if (!doUrlAndLocationPathnamesMatch(href) && !event.defaultPrevented) {
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
