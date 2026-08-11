import { type Core as Cachemap } from '@cachemap/core';
import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { loadStorageAndRetrieveHistory } from '#helpers/loadStorageAndRetrieveHistory.ts';
import { BreadcrumbContext } from './BreadcrumbContext.ts';
import { buildBreadcrumb } from './helpers/buildBreadcrumb.ts';
import { collateHistory } from './helpers/collateHistory.ts';
import { type BreadcrumbItem, type BreadcrumbRouteRule, type OnBreadcrumbLinkClick } from './types.ts';

export type BreadcrumbProviderProps = {
  children: ReactNode;
  currentPathname: string;
  initialHistory?: string[];
  maxHistory?: number;
  rootPath?: string;
  routeRules: BreadcrumbRouteRule[];
  search?: string;
};

export const BreadcrumbProvider: FC<BreadcrumbProviderProps> = ({
  children,
  currentPathname,
  initialHistory,
  maxHistory = 10,
  rootPath = '/',
  routeRules,
  search,
}) => {
  const cachemapRef = useRef<Cachemap>(undefined);
  const historyRef = useRef<string[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [error, setError] = useState<Error | undefined>();
  const [activeBreadcrumbItem, setActiveBreadcrumbItem] = useState<BreadcrumbItem | undefined>();

  if (error) {
    throw error;
  }

  const setCachemapAndInitialHistory = useCallback(async (): Promise<void> => {
    try {
      const [cachemap, history] = await loadStorageAndRetrieveHistory(currentPathname, initialHistory);
      cachemapRef.current = cachemap;
      historyRef.current = history;
    } catch (error_: unknown) {
      setError(
        new Error('There was a problem loading breadcrumb storage and/or retrieving history', { cause: error_ }),
      );
    }

    // We only want to memorize on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
  }, []);

  const setBreadcrumbAndHistory = useCallback(async (): Promise<void> => {
    const history = collateHistory(historyRef.current, {
      activeBreadcrumbItem,
      currentPathname,
      maxHistory,
      rootPath,
      search,
    });

    const breadcrumbEntries = await buildBreadcrumb(routeRules, history);
    historyRef.current = history;
    // setBreadcrumbAndHistory is called below after checking whether
    // cachemapRef.current is defined.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    void cachemapRef.current!.set('history', history);
    setBreadcrumb(breadcrumbEntries);
  }, [activeBreadcrumbItem, currentPathname, maxHistory, rootPath, routeRules, search]);

  const onBreadcrumbLinkClick = useCallback<OnBreadcrumbLinkClick>(
    breadcrumbItem => {
      setActiveBreadcrumbItem(breadcrumbItem);
    },
    [setActiveBreadcrumbItem],
  );

  useEffect(() => {
    // This refers to setting the error into state, which we need to do in
    // order for the error to bubble up to the closest error boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void setCachemapAndInitialHistory();
  }, [setCachemapAndInitialHistory]);

  useEffect(() => {
    void setBreadcrumbAndHistory();
  }, [setBreadcrumbAndHistory]);

  return <BreadcrumbContext value={{ breadcrumb, onBreadcrumbLinkClick }}>{children}</BreadcrumbContext>;
};
