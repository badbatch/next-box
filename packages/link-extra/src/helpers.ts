import { nanoid } from 'nanoid';

const normalizeSearchParams = (search: string, toOmitCacheBuster = false): string => {
  const entries = new URLSearchParams(search)
    .entries()
    .filter(([key]) => !toOmitCacheBuster || key !== 'y')
    .toArray()
    .toSorted(([keyA, valueA], [keyB, valueB]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB));

  return new URLSearchParams(entries).toString();
};

export const shouldUrlAndLocationMatch = (url: string): boolean => {
  // It is possible for this to be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!globalThis.location) {
    return false;
  }

  const parsedUrl = URL.parse(url, location.origin);

  if (!parsedUrl) {
    return false;
  }

  return (
    parsedUrl.pathname === location.pathname &&
    normalizeSearchParams(parsedUrl.search, true) === normalizeSearchParams(location.search, true)
  );
};

export const addCacheBusterQueryParam = (url: string): string => {
  // It is possible for this to be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!globalThis.location) {
    return url;
  }

  const parsedUrl = URL.parse(url, location.origin);

  if (!parsedUrl) {
    return url;
  }

  const locationSearchParams = new URLSearchParams(location.search);
  const locationCacheBusterSearchParam = locationSearchParams.get('y');

  const { pathname, search } = parsedUrl;
  const searchParams = new URLSearchParams(search);

  if (
    pathname === location.pathname &&
    normalizeSearchParams(search, true) === normalizeSearchParams(location.search, true)
  ) {
    searchParams.set('y', locationCacheBusterSearchParam ?? nanoid());
  } else {
    searchParams.set('y', nanoid());
  }

  return `${pathname}?${searchParams.toString()}`;
};
