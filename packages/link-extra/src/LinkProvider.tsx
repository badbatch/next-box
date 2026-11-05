'use client';

import type NextLink from 'next/link.js';
import {
  type ComponentType,
  type FC,
  type ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type LinkContextData, type OwnLinkProps } from '#types.js';

// Context requires an initial value, but this is set in the provider so casting
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const LinkContext = createContext<LinkContextData>({} as LinkContextData);

export type LinkProviderProps = {
  LoadingComponent: ComponentType;
  NextLink: (typeof NextLink)['default'];
  OwnLink: ComponentType<OwnLinkProps>;
  children: ReactNode | ReactNode[];
  loadingTimeout?: number;
  pathname: string;
};

export const LinkProvider: FC<LinkProviderProps> = ({
  LoadingComponent,
  NextLink,
  OwnLink,
  children,
  loadingTimeout = 500,
  pathname,
}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const onLinkClicked = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Required by timeout
      // eslint-disable-next-line unicorn/no-null
      timeoutRef.current = null;
      setShowLoading(true);
    }, loadingTimeout);
  }, [loadingTimeout]);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      // Required by timeout
      // eslint-disable-next-line unicorn/no-null
      timeoutRef.current = null;
    }

    // This is setting state based on pathname change
    // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect
    setShowLoading(false);
    scroll(0, 0);

    return (): void => {
      if (timeoutRef.current === null) {
        return;
      }

      clearTimeout(timeoutRef.current);
      // Required by timeout
      // eslint-disable-next-line unicorn/no-null
      timeoutRef.current = null;
    };
  }, [pathname]);

  return (
    <LinkContext
      value={{
        // Casting due to issues marrying up prop type and context type

        NextLink,
        OwnLink,
        onLinkClicked: () => {
          onLinkClicked();
        },
      }}
    >
      <>
        {children}
        {showLoading ? <LoadingComponent /> : undefined}
      </>
    </LinkContext>
  );
};
