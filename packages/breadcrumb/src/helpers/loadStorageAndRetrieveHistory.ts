import { Core as Cachemap } from '@cachemap/core';

export const loadStorageAndRetrieveHistory = async (
  currentPathname: string,
  initialHistory?: string[],
): Promise<[cachemap: Cachemap, history: string[]]> => {
  const { init: webStorage } = await import('@cachemap/web-storage');

  const cachemap = new Cachemap({
    name: 'breadcrumb',
    store: webStorage({ storageType: 'session' }),
    type: 'breadcrumb',
  });

  const history = initialHistory ?? (await cachemap.get<string[]>('history'));

  if (!history || history.length === 0) {
    return [cachemap, []];
  }

  // Check above ensures last entry cannot be undefined
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastEntry = history.at(-1)!;

  // This check is to cater for scenario where a user has gone directly to a page,
  // say via a bookmark, invalidating the breadcrumb history.
  if (new URL(lastEntry, location.origin).pathname !== currentPathname) {
    void cachemap.clear();
    return [cachemap, []];
  }

  return [cachemap, history];
};
