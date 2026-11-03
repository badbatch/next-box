import { describe, expect, it } from '@jest/globals';
import { ConfigStore } from './ConfigStore.ts';

describe('ConfigStore', () => {
  it('When initialized, then it keeps a stable frozen snapshot detached from the input', () => {
    // Arrange
    const initial = { Api: { Timeout: 5000 } };
    const store = new ConfigStore(initial);

    // Act
    const snapshot = store.getSnapshot();
    initial.Api.Timeout = 100;

    // Assert
    expect(snapshot).toEqual({ Api: { Timeout: 5000 } });
    expect(store.getSnapshot()).toBe(snapshot);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.Api)).toBe(true);
  });

  it('When initialized with arrays, then the snapshot array and its entries are frozen', () => {
    // Arrange
    const store = new ConfigStore({ Servers: [{ Host: 'api.example.com' }] });

    // Act
    const snapshot = store.getSnapshot();

    // Assert
    expect(Object.isFrozen(snapshot.Servers)).toBe(true);
    expect(Object.isFrozen(snapshot.Servers[0])).toBe(true);
  });
});
