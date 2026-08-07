export type CollateHistoryOptions = {
  maxHistory: number;
  pathname: string;
  rootPath: string;
  search?: string;
};

export const collateHistory = (
  history: string[],
  { maxHistory, pathname, rootPath, search }: CollateHistoryOptions,
): string[] => {
  const newHistory = [...history];
  const shouldPathnameExistInHistory = (index: number): boolean => index !== -1;
  const isEntryWithPathnameLastInHistory = (index: number): boolean => index === newHistory.length - 1;
  const hasHistoryReachedMaxEntries = (): boolean => newHistory.length >= maxHistory;

  const shouldHistoryHaveJustOneEntryAndIsNotRoot = (): boolean =>
    newHistory.length === 1 && !!newHistory[0] && new URL(newHistory[0], location.origin).pathname !== rootPath;

  let href = pathname;

  if (search) {
    href += `?${search}`;
  }

  const index = newHistory.findIndex(entry => {
    const url = new URL(entry, location.origin);
    return url.pathname === pathname;
  });

  if (shouldPathnameExistInHistory(index)) {
    if (isEntryWithPathnameLastInHistory(index)) {
      newHistory.splice(index);
      newHistory.push(href);
    } else {
      newHistory.splice(index + 1);
    }
  } else if (hasHistoryReachedMaxEntries()) {
    newHistory.shift();
    newHistory.push(href);
  } else {
    newHistory.push(href);
  }

  if (shouldHistoryHaveJustOneEntryAndIsNotRoot()) {
    newHistory.unshift(rootPath);
  }

  return newHistory;
};
