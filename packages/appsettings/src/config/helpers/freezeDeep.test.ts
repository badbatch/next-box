import { describe, expect, it } from '@jest/globals';
import { freezeDeep } from './freezeDeep.ts';

describe('freezeDeep', () => {
  it('When given nested plain objects, then it freezes each object and returns the original value', () => {
    // Arrange
    const value = { Api: { Retry: { Count: 3 } } };

    // Act
    const result = freezeDeep(value);

    // Assert
    expect(result).toBe(value);
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.Api)).toBe(true);
    expect(Object.isFrozen(value.Api.Retry)).toBe(true);
  });

  it('When given arrays containing objects, then it freezes the array and its nested objects', () => {
    // Arrange
    const value = { Servers: [{ Host: 'api.example.com' }] };

    // Act
    freezeDeep(value);

    // Assert
    expect(Object.isFrozen(value.Servers)).toBe(true);
    expect(Object.isFrozen(value.Servers[0])).toBe(true);
  });

  it('When given a primitive, then it returns the value unchanged', () => {
    // Arrange
    const value = 'setting';

    // Act
    const result = freezeDeep(value);

    // Assert
    expect(result).toBe(value);
  });
});
