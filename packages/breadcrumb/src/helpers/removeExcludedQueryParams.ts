export const removeExcludedQueryParams = (relativeUrl: string, excludeQueryParams: string[]): string => {
  const url = new URL(relativeUrl, location.origin);

  for (const entry of excludeQueryParams) {
    url.searchParams.delete(entry);
  }

  return `${url.pathname}${url.search}`;
};
