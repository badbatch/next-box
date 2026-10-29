/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { type BreadcrumbRouteRule } from '#types.ts';
import { BreadcrumbProvider } from './BreadcrumbProvider.tsx';
import { useBreadcrumb } from './useBreadcrumb.ts';

describe('useBreadcrumb', () => {
  it('When used within a provider, then it returns the breadcrumb from context', async () => {
    // Arrange
    const rule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) => ({ ...existing, label: `User ${captured.id}` }),
    };

    const routeRules = [rule];
    const initialHistory = ['/', '/users/42'];

    const wrapper = ({ children }: { children: ReactNode }) => (
      <BreadcrumbProvider currentPathname="/users/42" initialHistory={initialHistory} routeRules={routeRules}>
        {children}
      </BreadcrumbProvider>
    );

    // Act
    const { result } = renderHook(() => useBreadcrumb(), { wrapper });

    // Assert
    await waitFor(() => {
      expect(result.current.breadcrumb).toEqual([{ href: '/users/42', index: 1, label: 'User 42' }]);
      expect(result.current.onBreadcrumbLinkClick).toEqual(expect.any(Function));
    });
  });
});
