import { type BreadcrumbItem, type GetBreadcrumbRouteKey } from '#types.ts';

const getPathname: GetBreadcrumbRouteKey = url => url.pathname;

export type CollateHistoryOptions = {
  activeBreadcrumbItem: BreadcrumbItem | undefined;
  currentPathname: string;
  getRouteKey?: GetBreadcrumbRouteKey;
  maxHistory: number;
  rootPath: string;
  search?: string;
};

export const collateHistory = (
  history: string[],
  {
    activeBreadcrumbItem,
    currentPathname,
    getRouteKey = getPathname,
    maxHistory,
    rootPath,
    search,
  }: CollateHistoryOptions,
): string[] => {
  const newHistory = [...history];
  const isRouteInHistory = (index: number): boolean => index !== -1;
  const isEntryWithRouteLastInHistory = (index: number): boolean => index === newHistory.length - 1;
  const hasHistoryReachedMaxEntries = (): boolean => newHistory.length >= maxHistory;

  const isHistoryCountOneAndEntryPathnameNotRoot = (): boolean =>
    newHistory.length === 1 && !!newHistory[0] && new URL(newHistory[0], location.origin).pathname !== rootPath;

  let href = currentPathname;

  if (search) {
    href += `?${search}`;
  }

  if (currentPathname === rootPath) {
    return [];
  }

  const getHrefKey = (entry: string): string => getRouteKey(new URL(entry, location.origin));
  const currentKey = getHrefKey(href);
  const indexOfEntryWithCurrentRoute = newHistory.findLastIndex(entry => getHrefKey(entry) === currentKey);

  if (isRouteInHistory(indexOfEntryWithCurrentRoute)) {
    if (activeBreadcrumbItem?.href && getHrefKey(activeBreadcrumbItem.href) === currentKey) {
      // If user has selected breadcrumb link, this node should become
      // the new breadcrumb leaf node.
      newHistory.splice(activeBreadcrumbItem.index + 1);
    } else if (!isEntryWithRouteLastInHistory(indexOfEntryWithCurrentRoute)) {
      newHistory.push(href);
      newHistory.splice(indexOfEntryWithCurrentRoute, 1);
    }
  } else {
    newHistory.push(href);
  }

  // This check is to cater for scenario where a user has gone directly to a page,
  // say via a bookmark, so we give them option to go back to root path.
  if (isHistoryCountOneAndEntryPathnameNotRoot()) {
    newHistory.unshift(rootPath);
  }

  if (hasHistoryReachedMaxEntries()) {
    // This will remove the second entry, because the first
    // entry is the root path.
    newHistory.splice(1, newHistory.length - maxHistory);
  }

  return newHistory;
};
