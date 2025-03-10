import { Core as Cachemap } from '@cachemap/core';
import { isFunction, memoize } from 'lodash-es';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { BreadcrumbContext } from './BreadcrumbContext.ts';
import { collateHistory } from './helpers/collateHistory.ts';
import { createBreadcrumbs } from './helpers/createBreadcrumbs.ts';
import { type BreadcrumbEntry, type LabelMapperEntry, type Transforms } from './types.ts';

export type BreadcrumbProviderProps = {
  children: ReactNode;
  /**
   * Name of query params to exclude from href
   * used in the link of each breadcrumb.
   */
  excludeQueryParams?: string[];
  labelMapper: Record<string, LabelMapperEntry>;
  maxHistory?: number;
  pathname: string;
  rootPath?: string;
  search?: string;
  transforms?: Transforms | (() => Transforms);
};

const memoriseTransforms = (transforms: Transforms) => {
  const entries = Object.entries(transforms);

  if (entries.length === 0) {
    return {};
  }

  return Object.fromEntries(entries.map(([key, value]) => [key, memoize(value)]));
};

export const BreadcrumbProvider = ({
  children,
  excludeQueryParams = [],
  labelMapper,
  maxHistory = 10,
  pathname,
  rootPath = '/',
  search,
  transforms = {},
}: BreadcrumbProviderProps) => {
  const cachemap = useRef<Cachemap>(undefined);
  const history = useRef<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);
  const memorisedTransforms = useRef<Transforms>({});
  const [cachemapInitialised, setCachemapInitialised] = useState(false);

  useEffect(() => {
    void (async () => {
      const { init: webStorage } = await import('@cachemap/web-storage');

      cachemap.current = new Cachemap({
        name: 'breadcrumb',
        store: webStorage({ storageType: 'session' }),
        type: 'breadcrumb',
      });

      const cachedHistory = await cachemap.current.get<string[]>('history');

      if (cachedHistory) {
        const lastEntry = cachedHistory.at(-1);

        if (lastEntry && new URL(lastEntry, globalThis.location.origin).pathname === pathname) {
          history.current = cachedHistory;
        } else {
          void cachemap.current.clear();
        }
      }

      memorisedTransforms.current = memoriseTransforms(isFunction(transforms) ? transforms() : transforms);
      setCachemapInitialised(true);
    })();

    // We only want this to run on initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void (async () => {
      if (!cachemapInitialised) {
        return;
      }

      history.current = collateHistory(history.current, { maxHistory, pathname, rootPath, search });
      void cachemap.current?.set('history', history.current);

      setBreadcrumbs(
        await createBreadcrumbs(history.current, labelMapper, excludeQueryParams, memorisedTransforms.current),
      );
    })();
    // We only want to re-execute when pathname or search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search, cachemapInitialised]);

  return <BreadcrumbContext.Provider value={{ breadcrumbs }}>{children}</BreadcrumbContext.Provider>;
};
