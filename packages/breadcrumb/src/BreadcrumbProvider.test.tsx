/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { type Core as Cachemap } from '@cachemap/core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ErrorBoundary } from '#__testUtils__/components/ErrorBoundary.tsx';
import { type BreadcrumbRouteRule } from '#types.ts';
import { useBreadcrumbContext } from './useBreadcrumbContext.ts';

const mockLoadStorageAndRetrieveHistory =
  jest.fn<(currentPathname: string, initialHistory?: string[]) => Promise<[Cachemap, string[]]>>();

jest.unstable_mockModule('#helpers/loadStorageAndRetrieveHistory.ts', () => ({
  loadStorageAndRetrieveHistory: mockLoadStorageAndRetrieveHistory,
}));

const { BreadcrumbProvider } = await import('./BreadcrumbProvider.tsx');

describe('BreadcrumbProvider', () => {
  beforeEach(() => {
    mockLoadStorageAndRetrieveHistory.mockReset();
  });

  it('When the current pathname is present in the initial history, then it provides matching breadcrumb items and reports history', async () => {
    // Arrange
    const rootRule: BreadcrumbRouteRule = {
      regex: '^/$',
      resolve: (_captured, existing) => ({ ...existing, label: 'Home' }),
    };

    const userRule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) => ({ ...existing, label: `User ${captured.id}` }),
    };

    const routeRules = [rootRule, userRule];
    const initialHistory = ['/', '/users/42'];
    const onHistoryChange = jest.fn();
    const cachemap = { set: jest.fn() } as unknown as Cachemap;

    mockLoadStorageAndRetrieveHistory.mockResolvedValue([cachemap, initialHistory]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BreadcrumbProvider
        currentPathname="/users/42"
        initialHistory={initialHistory}
        onHistoryChange={onHistoryChange}
        routeRules={routeRules}
      >
        {children}
      </BreadcrumbProvider>
    );

    // Act
    const { result } = renderHook(() => useBreadcrumbContext(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.breadcrumb).toEqual([
        { href: '/', index: 0, label: 'Home' },
        { href: '/users/42', index: 1, label: 'User 42' },
      ]);

      expect(onHistoryChange).toHaveBeenCalledWith(initialHistory);
    });
  });

  it('When loading initial history fails, then it throws an error for the nearest error boundary', async () => {
    // Arrange
    const routeRules: BreadcrumbRouteRule[] = [];
    const initialHistory = ['/users'];
    const expectedErrorMessage = 'There was a problem loading breadcrumb storage and/or retrieving history';
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockLoadStorageAndRetrieveHistory.mockRejectedValue(new Error('Storage failed'));

    // Act
    try {
      render(
        <ErrorBoundary>
          <BreadcrumbProvider currentPathname="/users" initialHistory={initialHistory} routeRules={routeRules}>
            <div>Breadcrumb content</div>
          </BreadcrumbProvider>
        </ErrorBoundary>,
      );

      // Assert
      await expect(screen.findByText(expectedErrorMessage)).resolves.toBeTruthy();
    } finally {
      consoleError.mockRestore();
    }
  });
});
