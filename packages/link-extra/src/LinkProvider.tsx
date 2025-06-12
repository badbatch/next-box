import Link from 'next/link.js';
import { type ComponentType, type ReactNode, createContext, useEffect, useState } from 'react';
import { type LinkContextData, type OwnLinkProps } from '#types.js';

// Needs to return explicit value
// eslint-disable-next-line unicorn/no-useless-undefined
const NoopComponent = () => undefined;
// This is a noop
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const LinkContext = createContext<LinkContextData>({
  NextLink: Link,
  OwnLink: NoopComponent,
  setLinkClicked: noop,
});

export type LinkProviderProps = {
  LoadingComponent: ComponentType;
  NextLink: typeof Link;
  OwnLink: ComponentType<OwnLinkProps>;
  children: ReactNode | ReactNode[];
  loadingTimeout?: number;
  pathname: string;
};

let timeoutId: NodeJS.Timeout | undefined;

export const LinkProvider = ({
  LoadingComponent,
  NextLink,
  OwnLink,
  children,
  loadingTimeout = 500,
  pathname,
}: LinkProviderProps) => {
  const [linkClicked, setLinkClicked] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);

  useEffect(() => {
    if (linkClicked) {
      timeoutId = setTimeout(() => {
        setShowLoading(true);
      }, loadingTimeout);
    }

    return () => {
      clearTimeout(timeoutId);
    };
    // We only want to re-execute when linkClicked changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkClicked]);

  useEffect(() => {
    if (linkClicked) {
      setLinkClicked(false);
      setShowLoading(false);
      globalThis.scroll(0, 0);
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // We only want to re-execute when pathname changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <LinkContext.Provider
      value={{
        NextLink,
        OwnLink,
        setLinkClicked: clicked => {
          setLinkClicked(clicked);
        },
      }}
    >
      <>
        {children}
        {showLoading ? <LoadingComponent /> : undefined}
      </>
    </LinkContext.Provider>
  );
};
