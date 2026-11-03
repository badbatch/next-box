import { describe, expect, it } from '@jest/globals';
import { ConfigReader } from './ConfigReader.ts';

describe('ConfigReader', () => {
  it('When a dotted path points to a leaf, then it returns that value', () => {
    // Arrange
    const reader = new ConfigReader({ Api: { Timeout: 5000 } });

    // Act
    const result = reader.read('Api.Timeout');

    // Assert
    expect(result).toBe(5000);
  });

  it('When a path is missing or traverses a primitive, then it returns undefined and reports no match', () => {
    // Arrange
    const reader = new ConfigReader({ Api: { Timeout: 5000 }, Name: 'App' });

    // Act
    const missing = reader.read('Api.Retry.Count');
    const throughPrimitive = reader.read('Name.Length');

    // Assert
    expect(missing).toBeUndefined();
    expect(throughPrimitive).toBeUndefined();
    expect(reader.has('Api.Missing')).toBe(false);
  });

  it('When a path points to a defined value or section, then it reads and reports it', () => {
    // Arrange
    const reader = new ConfigReader({ Api: { Timeout: 5000 }, Empty: undefined });

    // Act
    const section = reader.getSection('Api');
    const leaf = reader.get('Api.Timeout');

    // Assert
    expect(section).toEqual({ Timeout: 5000 });
    expect(leaf).toBe(5000);
    expect(reader.has('Api')).toBe(true);
    expect(reader.has('Empty')).toBe(false);
  });

  it('When a section is scoped, then the returned reader reads paths relative to that section', () => {
    // Arrange
    const reader = new ConfigReader({ Api: { Timeout: 5000 } });
    const scopedReader = reader.scope('Api');

    // Act
    const result = scopedReader.read('Timeout');

    // Assert
    expect(result).toBe(5000);
  });
});
