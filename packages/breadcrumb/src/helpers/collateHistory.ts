import { didBreadcrumbClickTriggerPathnameChange } from '#helpers/didBreadcrumbClickTriggerPathnameChange.ts';
import { type BreadcrumbItem } from '#types.ts';

export type CollateHistoryOptions = {
  activeBreadcrumbItem: BreadcrumbItem | undefined;
  currentPathname: string;
  maxHistory: number;
  rootPath: string;
  search?: string;
};

export const collateHistory = (
  history: string[],
  { activeBreadcrumbItem, currentPathname, maxHistory, rootPath, search }: CollateHistoryOptions,
): string[] => {
  const newHistory = [...history];
  const isPathnameInHistory = (index: number): boolean => index !== -1;
  const isEntryWithPathnameLastInHistory = (index: number): boolean => index === newHistory.length - 1;
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

  const indexOfEntryWithCurrentPathname = newHistory.findLastIndex(
    entry => new URL(entry, location.origin).pathname === currentPathname,
  );

  if (isPathnameInHistory(indexOfEntryWithCurrentPathname)) {
    if (didBreadcrumbClickTriggerPathnameChange(currentPathname, activeBreadcrumbItem)) {
      // If user has selected breadcrumb link, this node should become
      // the new breadcrumb leaf node.
      newHistory.splice(activeBreadcrumbItem.index);
    } else if (!isEntryWithPathnameLastInHistory(indexOfEntryWithCurrentPathname)) {
      newHistory.push(href);
    }
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
