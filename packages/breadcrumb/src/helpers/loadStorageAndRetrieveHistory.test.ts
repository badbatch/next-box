/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { beforeEach, describe, expect, it } from '@jest/globals';
import { loadStorageAndRetrieveHistory } from './loadStorageAndRetrieveHistory.ts';

describe('loadStorageAndRetrieveHistory', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('When no initial or stored history is available, then it returns an empty history', async () => {
    // Arrange
    const currentPathname = '/users';

    // Act
    const [cachemap, history] = await loadStorageAndRetrieveHistory(currentPathname);

    // Assert
    expect(history).toEqual([]);
    await cachemap.clear();
  });

  it('When initial history is empty, then it returns an empty history', async () => {
    // Arrange
    const currentPathname = '/users';
    const initialHistory: string[] = [];

    // Act
    const [cachemap, history] = await loadStorageAndRetrieveHistory(currentPathname, initialHistory);

    // Assert
    expect(history).toEqual([]);
    await cachemap.clear();
  });

  it('When the last history entry does not match the current pathname, then it clears storage and returns an empty history', async () => {
    // Arrange
    const currentPathname = '/users';
    const initialHistory = ['/', '/settings'];
    const [seedCachemap] = await loadStorageAndRetrieveHistory(currentPathname, initialHistory);
    await seedCachemap.set('history', initialHistory);

    // Act
    const [cachemap, history] = await loadStorageAndRetrieveHistory(currentPathname);

    // Assert
    expect(history).toEqual([]);
    await expect(cachemap.get('history')).resolves.toBeUndefined();
    await cachemap.clear();
  });

  it('When initial history ends with the current pathname, then it returns that history', async () => {
    // Arrange
    const currentPathname = '/users';
    const initialHistory = ['/', '/users'];

    // Act
    const [cachemap, history] = await loadStorageAndRetrieveHistory(currentPathname, initialHistory);

    // Assert
    expect(history).toEqual(initialHistory);
    await cachemap.clear();
  });

  it('When stored history ends with the current pathname, then it returns the stored history', async () => {
    // Arrange
    const currentPathname = '/users';
    const initialHistory = ['/', '/users'];
    const [cachemap] = await loadStorageAndRetrieveHistory(currentPathname, initialHistory);
    await cachemap.set('history', initialHistory);

    // Act
    const [retrievedCachemap, history] = await loadStorageAndRetrieveHistory(currentPathname);

    // Assert
    expect(history).toEqual(initialHistory);
    await retrievedCachemap.clear();
  });
});
