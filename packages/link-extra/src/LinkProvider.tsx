import type Link from 'next/link.js';
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
import { type LinkContextData, type NextLinkComponent, type OwnLinkProps } from '#types.js';

// Context requires an initial value, but this is set in the provider so casting
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const LinkContext = createContext<LinkContextData>({} as LinkContextData);

export type LinkProviderProps = {
  LoadingComponent: ComponentType;
  NextLink: typeof Link;
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShowLoading(true);
    }, loadingTimeout);
  }, [loadingTimeout]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // This is setting state based on pathname change
    // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect
    setShowLoading(false);
    scroll(0, 0);
  }, [pathname]);

  return (
    <LinkContext
      value={{
        // Casting due to issues marrying up prop type and context type
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        NextLink: NextLink as unknown as NextLinkComponent,
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
