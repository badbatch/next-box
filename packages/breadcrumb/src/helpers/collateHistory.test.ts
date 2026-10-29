/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { type BreadcrumbItem } from '#types.ts';
import { type CollateHistoryOptions, collateHistory } from './collateHistory.ts';

describe('collateHistory', () => {
  it('When the current pathname is the root path, then it returns an empty history', () => {
    // Arrange
    const history = ['/', '/users'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/',
      maxHistory: 10,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual([]);
  });

  it('When the current pathname is not in history, then it appends it to history', () => {
    // Arrange
    const history = ['/', '/users'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/users/42',
      maxHistory: 10,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/users', '/users/42']);
  });

  it('When a search string is provided, then it appends it to the current pathname', () => {
    // Arrange
    const history = ['/'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/search',
      maxHistory: 10,
      rootPath: '/',
      search: 'term=books&page=2',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/search?term=books&page=2']);
  });

  it('When history has one non-root entry, then it prepends the root path', () => {
    // Arrange
    const history: string[] = [];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/users/42',
      maxHistory: 10,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/users/42']);
  });

  it('When the current pathname is in history but is not the last entry, then it moves that entry to the end', () => {
    // Arrange
    const history = ['/', '/users/42', '/settings'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/users/42',
      maxHistory: 10,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/settings', '/users/42']);
  });

  it('When the active breadcrumb item matches the current pathname, then it truncates history after that item', () => {
    // Arrange
    const activeBreadcrumbItem: BreadcrumbItem = {
      href: '/users',
      index: 1,
      label: 'Users',
    };

    const history = ['/', '/users', '/users/42'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem,
      currentPathname: '/users',
      maxHistory: 10,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/users']);
  });

  it('When history reaches the maximum length, then it removes entries after the root path to fit the limit', () => {
    // Arrange
    const history = ['/', '/users', '/users/42'];

    const options: CollateHistoryOptions = {
      activeBreadcrumbItem: undefined,
      currentPathname: '/settings',
      maxHistory: 3,
      rootPath: '/',
    };

    // Act
    const result = collateHistory(history, options);

    // Assert
    expect(result).toEqual(['/', '/users/42', '/settings']);
  });
});
