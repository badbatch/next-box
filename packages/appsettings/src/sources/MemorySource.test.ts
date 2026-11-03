import { describe, expect, it } from '@jest/globals';
import { MemorySource } from './MemorySource.ts';

describe('MemorySource', () => {
  it('When loaded, then it returns a copy of the supplied values', async () => {
    // Arrange
    const values = { Api: { Timeout: 5000 } };
    const source = new MemorySource({ values });

    // Act
    const result = await source.load();
    result.Additional = true;

    // Assert
    expect(result).not.toBe(values);
    expect(result.Api).not.toBe(values.Api);
    expect(values.Api.Timeout).toBe(5000);
    expect(source.name).toBe('memory');
  });

  it('When a custom name is provided, then it exposes that name', () => {
    // Arrange
    const source = new MemorySource({ name: 'runtime-overrides', values: {} });

    // Act
    const name = source.name;

    // Assert
    expect(name).toBe('runtime-overrides');
  });
});
