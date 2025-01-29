export const removeExcludedQueryParams = (relativeUrl: string, excludeQueryParams: string[]): string => {
  const url = new URL(relativeUrl, globalThis.location.origin);

  for (const entry of excludeQueryParams) {
    url.searchParams.delete(entry);
  }

  return `${url.pathname}${url.search}`;
};
