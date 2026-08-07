import { Core as Cachemap } from '@cachemap/core';
import { isFunction, memoize } from 'lodash-es';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import { BreadcrumbContext } from './BreadcrumbContext.ts';
import { collateHistory } from './helpers/collateHistory.ts';
import { createBreadcrumbs } from './helpers/createBreadcrumbs.ts';
import { type BreadcrumbEntry, type LabelMapperEntry, type TransformCallback, type Transforms } from './types.ts';

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

const memoriseTransforms = (transforms: Transforms): Record<string, TransformCallback & ReturnType<typeof memoize>> => {
  const entries = Object.entries(transforms);

  if (entries.length === 0) {
    return {};
  }

  return Object.fromEntries(entries.map(([key, value]) => [key, memoize(value)]));
};

export const BreadcrumbProvider: FC<BreadcrumbProviderProps> = ({
  children,
  excludeQueryParams = [],
  labelMapper,
  maxHistory = 10,
  pathname,
  rootPath = '/',
  search,
  transforms = {},
}) => {
  const cachemapRef = useRef<Cachemap>(undefined);
  const historyRef = useRef<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([]);
  const memorisedTransformsRef = useRef<Transforms>({});
  const [cachemapInitialised, setCachemapInitialised] = useState(false);

  useEffect(() => {
    void (async (): Promise<void> => {
      const { init: webStorage } = await import('@cachemap/web-storage');

      cachemapRef.current = new Cachemap({
        name: 'breadcrumb',
        store: webStorage({ storageType: 'session' }),
        type: 'breadcrumb',
      });

      const cachedHistory = await cachemapRef.current.get<string[]>('history');

      if (cachedHistory) {
        const lastEntry = cachedHistory.at(-1);

        if (lastEntry && new URL(lastEntry, location.origin).pathname === pathname) {
          historyRef.current = cachedHistory;
        } else {
          void cachemapRef.current.clear();
        }
      }

      memorisedTransformsRef.current = memoriseTransforms(isFunction(transforms) ? transforms() : transforms);
      setCachemapInitialised(true);
    })();

    // We only want this to run on initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, []);

  useEffect(() => {
    void (async (): Promise<void> => {
      if (!cachemapInitialised) {
        return;
      }

      historyRef.current = collateHistory(historyRef.current, { maxHistory, pathname, rootPath, search });
      void cachemapRef.current?.set('history', historyRef.current);

      setBreadcrumbs(
        await createBreadcrumbs(historyRef.current, labelMapper, excludeQueryParams, memorisedTransformsRef.current),
      );
    })();
    // We only want to re-execute when pathname or search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, [pathname, search, cachemapInitialised]);

  return <BreadcrumbContext value={{ breadcrumbs }}>{children}</BreadcrumbContext>;
};
