import { describe, expect, it } from '@jest/globals';
import { AppSettingsImplementation } from './AppSettingsImplementation.ts';

describe('AppSettingsImplementation', () => {
  it('When reading configured paths, then it returns leaves, sections, and the complete snapshot', () => {
    // Arrange
    const settings = new AppSettingsImplementation({
      Api: { Retry: undefined, Timeout: 5000 },
      Features: { DarkMode: true },
    });

    // Act
    const leaf = settings.get('Api.Timeout');
    const section = settings.getSection('Api');
    const all = settings.getAll();

    // Assert
    expect(leaf).toBe(5000);
    expect(section).toEqual({ Timeout: 5000 });
    expect(all).toEqual({ Api: { Timeout: 5000 }, Features: { DarkMode: true } });
  });

  it('When a required setting exists or is missing, then it returns the value or throws with its path', () => {
    // Arrange
    const settings = new AppSettingsImplementation({ Api: { Retry: undefined, Timeout: 5000 } });

    // Act
    const value = settings.getOrThrow('Api.Timeout');

    const getMissingValue = () => {
      settings.getOrThrow('Api.Retry');
    };

    // Assert
    expect(value).toBe(5000);
    expect(getMissingValue).toThrow('Required app setting "Api.Retry" is missing.');
  });

  it('When checking paths, then it reports present values and sections but not missing values', () => {
    // Arrange
    const settings = new AppSettingsImplementation({ Api: { Retry: undefined, Timeout: 5000 } });

    // Act
    const hasLeaf = settings.has('Api.Timeout');
    const hasSection = settings.has('Api');
    const hasMissing = settings.has('Api.Retry');

    // Assert
    expect(hasLeaf).toBe(true);
    expect(hasSection).toBe(true);
    expect(hasMissing).toBe(false);
  });

  it('When a plain object section is scoped, then it returns a reader relative to that section', () => {
    // Arrange
    const settings = new AppSettingsImplementation({ Api: { Timeout: 5000 } });

    // Act
    const scoped = settings.scope('Api');

    // Assert
    expect(scoped.get('Timeout')).toBe(5000);
    expect(scoped.getOrThrow('Timeout')).toBe(5000);
  });
});
