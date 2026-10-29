/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useBreadcrumbContext } from './useBreadcrumbContext.ts';

describe('useBreadcrumbContext', () => {
  it('When used without a provider, then it returns the default breadcrumb context', () => {
    // Arrange
    const expectedContext = { breadcrumb: [] };

    // Act
    const { result } = renderHook(() => useBreadcrumbContext());

    // Assert
    expect(result.current).toEqual(expectedContext);
  });
});
