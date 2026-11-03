/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { type ComponentProps, type ComponentType, type ReactElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import { Link } from './Link.tsx';
import { LinkProvider } from './LinkProvider.tsx';
import { shouldUrlAndLocationMatch } from './helpers.ts';
import { type NextLinkComponent, type OwnLinkProps } from './types.ts';

const NextLinkMock: NextLinkComponent = ({ children, href }) => {
  const nextHref = typeof href === 'string' ? href : (href.pathname ?? '');

  return <div data-next-href={nextHref}>{children}</div>;
};

const OwnLink: ComponentType<OwnLinkProps> = ({ children, ...props }) => <a {...props}>{children}</a>;

const Loading = () => <span data-testid="loading">Loading</span>;

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true });

const mount = (element: ReactElement) => {
  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(element);
  });

  return {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
    },
  };
};

const createLink = (props: ComponentProps<typeof Link>) => (
  <LinkProvider
    LoadingComponent={Loading}
    NextLink={NextLinkMock}
    OwnLink={OwnLink}
    loadingTimeout={100}
    pathname="/current"
  >
    <Link {...props} />
  </LinkProvider>
);

afterEach(() => {
  jest.useRealTimers();
  history.replaceState(undefined, '', '/');
});

describe('Link integration', () => {
  it('When a link is clicked and navigation exceeds the timeout, then it displays the loading component', () => {
    // Arrange
    history.replaceState(undefined, '', '/current');
    Object.defineProperty(globalThis, 'scroll', { configurable: true, value: jest.fn() });
    jest.useFakeTimers();

    const { container, unmount } = mount(createLink({ children: 'Next page', href: '/next' }));
    const anchor = container.querySelector('a');

    // Act
    act(() => {
      anchor?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      jest.advanceTimersByTime(100);
    });

    // Assert
    expect(container.querySelector('[data-testid="loading"]')?.textContent).toBe('Loading');
    expect(container.querySelector<HTMLElement>('[data-next-href]')?.dataset.nextHref).toMatch(/^\/next\?y=/);

    unmount();
  });

  it('When a click is prevented, then it does not display the loading component', () => {
    // Arrange
    history.replaceState(undefined, '', '/current');
    Object.defineProperty(globalThis, 'scroll', { configurable: true, value: jest.fn() });
    jest.useFakeTimers();

    const { container, unmount } = mount(
      createLink({
        children: 'Prevented navigation',
        href: '/next',
        onClick: event => {
          event.preventDefault();
        },
      }),
    );

    const anchor = container.querySelector('a');

    // Act
    act(() => {
      anchor?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      jest.advanceTimersByTime(100);
    });

    // Assert
    expect(container.querySelector('[data-testid="loading"]')).toBeNull();

    unmount();
  });

  it('When router cache control is disabled, then it passes the original href to NextLink', () => {
    // Arrange
    history.replaceState(undefined, '', '/current');
    Object.defineProperty(globalThis, 'scroll', { configurable: true, value: jest.fn() });

    const { container, unmount } = mount(
      createLink({ children: 'Current page', disableRouterCache: false, href: '/current' }),
    );

    // Act
    const href = container.querySelector<HTMLElement>('[data-next-href]')?.dataset.nextHref;

    // Assert
    expect(href).toBe('/current');

    unmount();
  });

  it('When a pending navigation timer reaches an unmounted provider, then it has been cleared', () => {
    // Arrange
    history.replaceState(undefined, '', '/current');
    Object.defineProperty(globalThis, 'scroll', { configurable: true, value: jest.fn() });
    jest.useFakeTimers();

    const { container, unmount } = mount(createLink({ children: 'Next page', href: '/next' }));
    const anchor = container.querySelector('a');

    act(() => {
      anchor?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Act
    unmount();

    // Assert
    expect(jest.getTimerCount()).toBe(0);
  });

  it('When query parameters are reordered, then the URL matches the current location', () => {
    // Arrange
    history.replaceState(undefined, '', '/current?alpha=one&bravo=two&y=cache');

    // Act
    const result = shouldUrlAndLocationMatch('/current?bravo=two&alpha=one&y=other');

    // Assert
    expect(result).toBe(true);
  });
});
