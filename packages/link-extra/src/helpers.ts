import { nanoid } from 'nanoid';

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

  const { pathname, search } = parsedUrl;
  const urlSearchParams = new URLSearchParams(search);

  if (urlSearchParams.has('y')) {
    urlSearchParams.delete('y');
  }

  const locationSearchParams = new URLSearchParams(location.search);

  if (locationSearchParams.has('y')) {
    locationSearchParams.delete('y');
  }

  return `${pathname}?${urlSearchParams.toString()}` === `${location.pathname}?${locationSearchParams.toString()}`;
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

  if (locationCacheBusterSearchParam) {
    locationSearchParams.delete('y');
  }

  const { pathname, search } = parsedUrl;
  const searchParams = new URLSearchParams(search);

  if (`${pathname}?${search}` === `${location.pathname}?${locationSearchParams.toString()}`) {
    searchParams.set('y', locationCacheBusterSearchParam ?? nanoid());
  } else {
    searchParams.set('y', nanoid());
  }

  return `${pathname}?${searchParams.toString()}`;
};
