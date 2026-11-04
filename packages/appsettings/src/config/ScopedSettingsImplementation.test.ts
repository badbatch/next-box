import { describe, expect, it } from '@jest/globals';
import { ScopedSettingsImplementation } from './ScopedSettingsImplementation.ts';

describe('ScopedSettingsImplementation', () => {
  it('When a path exists within the scope, then it returns the value and scoped data', () => {
    // Arrange
    const section = { Api: { Timeout: 5000 }, Name: 'App', Retry: undefined };
    const settings = new ScopedSettingsImplementation(section, 'Platform.Api');

    // Act
    const value = settings.get('Api.Timeout');
    const all = settings.getAll();

    // Assert
    expect(value).toBe(5000);
    expect(all).toBe(section);
  });

  it('When a required scoped value is missing, then it throws with the full path', () => {
    // Arrange
    const settings = new ScopedSettingsImplementation({ Retry: undefined }, 'Platform.Api');

    // Act
    const getMissingValue = () => {
      settings.getOrThrow('Retry');
    };

    // Assert
    expect(getMissingValue).toThrow('Required app setting "Platform.Api.Retry" is missing.');
  });
});
