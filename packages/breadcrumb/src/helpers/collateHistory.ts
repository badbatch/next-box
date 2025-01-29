export type CollateHistoryOptions = {
  maxHistory: number;
  pathname: string;
  rootPath: string;
  search?: string;
};

export const collateHistory = (
  history: string[],
  { maxHistory, pathname, rootPath, search }: CollateHistoryOptions,
) => {
  const newHistory = [...history];
  const doesPathnameExistInHistory = (index: number) => index !== -1;
  const isEntryWithPathnameLastInHistory = (index: number) => index === newHistory.length - 1;
  const hasHistoryReachedMaxEntries = () => newHistory.length >= maxHistory;

  const doesHistoryHaveJustOneEntryAndIsNotRoot = () =>
    newHistory.length === 1 &&
    newHistory[0] &&
    new URL(newHistory[0], globalThis.location.origin).pathname !== rootPath;

  let href = pathname;

  if (search) {
    href += `?${search}`;
  }

  const index = newHistory.findIndex(entry => {
    const url = new URL(entry, globalThis.location.origin);
    return url.pathname === pathname;
  });

  if (doesPathnameExistInHistory(index)) {
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

  if (doesHistoryHaveJustOneEntryAndIsNotRoot()) {
    newHistory.unshift(rootPath);
  }

  return newHistory;
};
