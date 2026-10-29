/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { type BreadcrumbItem } from '#types.ts';
import { didBreadcrumbClickTriggerPathnameChange } from './didBreadcrumbClickTriggerPathnameChange.ts';

describe('didBreadcrumbClickTriggerPathnameChange', () => {
  it('When there is no active breadcrumb item, then it returns false', () => {
    // Arrange
    const currentPathname = '/users';
    const activeBreadcrumbItem = undefined;

    // Act
    const didTrigger = didBreadcrumbClickTriggerPathnameChange(currentPathname, activeBreadcrumbItem);

    // Assert
    expect(didTrigger).toBe(false);
  });

  it('When the active breadcrumb item href has the current pathname, then it returns true', () => {
    // Arrange
    const currentPathname = '/users';

    const activeBreadcrumbItem: BreadcrumbItem = {
      href: 'https://example.com/users?sort=name',
      index: 1,
      label: 'Users',
    };

    // Act
    const didTrigger = didBreadcrumbClickTriggerPathnameChange(currentPathname, activeBreadcrumbItem);

    // Assert
    expect(didTrigger).toBe(true);
  });

  it('When the active breadcrumb item href has a different pathname, then it returns false', () => {
    // Arrange
    const currentPathname = '/users';

    const activeBreadcrumbItem: BreadcrumbItem = {
      href: '/settings',
      index: 1,
      label: 'Settings',
    };

    // Act
    const didTrigger = didBreadcrumbClickTriggerPathnameChange(currentPathname, activeBreadcrumbItem);

    // Assert
    expect(didTrigger).toBe(false);
  });
});
