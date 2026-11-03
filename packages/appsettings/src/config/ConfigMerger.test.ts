import { describe, expect, it } from '@jest/globals';
import { ConfigMerger } from './ConfigMerger.ts';

describe('ConfigMerger', () => {
  it('When configuration layers contain nested objects, then later values override recursively', () => {
    // Arrange
    const defaults = { Api: { BaseUrl: 'https://default.example.com', Timeout: 1000 }, Enabled: true };
    const overrides = { Api: { Timeout: 5000 } };
    const merger = new ConfigMerger();

    // Act
    const result = merger.merge(defaults, overrides);

    // Assert
    expect(result).toEqual({ Api: { BaseUrl: 'https://default.example.com', Timeout: 5000 }, Enabled: true });
  });

  it('When later layers contain arrays, then they replace earlier arrays without mutating inputs', () => {
    // Arrange
    const defaults = { Values: [1, 2], Api: { Timeout: 1000 } };
    const overrides = { Values: [3] };
    const merger = new ConfigMerger();

    // Act
    const result = merger.merge(defaults, overrides);

    // Assert
    expect(result).toEqual({ Values: [3], Api: { Timeout: 1000 } });
    expect(defaults).toEqual({ Values: [1, 2], Api: { Timeout: 1000 } });
    expect(overrides).toEqual({ Values: [3] });
  });

  it('When there are no override layers, then it returns the first layer', () => {
    // Arrange
    const defaults = { Enabled: true };
    const merger = new ConfigMerger();

    // Act
    const result = merger.merge(defaults);

    // Assert
    expect(result).toBe(defaults);
  });
});
