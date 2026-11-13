import { describe, expect, it } from '@jest/globals';
import { assertType } from '../__testUtils__/types.ts';
import { type SettingPath, type SettingSectionPath, type SettingValue } from './Config.types.ts';

type ExampleSettings = {
  Api: { BaseUrl: string; Retry: { Count: number }; Timeout: number };
  Features: { DarkMode: boolean };
  Tags: readonly string[];
};

describe('configuration path types', () => {
  it('When paths are declared, then leaf and section paths accept the appropriate settings paths', () => {
    // Arrange
    const leafPaths: SettingPath<ExampleSettings>[] = [
      'Api.BaseUrl',
      'Api.Retry.Count',
      'Api.Timeout',
      'Features.DarkMode',
      'Tags',
    ];

    const sectionPaths: SettingSectionPath<ExampleSettings>[] = ['Api', 'Api.Retry', 'Features'];
    const timeout: SettingValue<ExampleSettings, 'Api.Timeout'> = 5000;
    const retryCount: SettingValue<ExampleSettings['Api']['Retry'], 'Count'> = 3;

    // Act
    const paths = { leafPaths, retryCount, sectionPaths, timeout };

    // Assert
    assertType<SettingPath<ExampleSettings>[]>(paths.leafPaths);
    assertType<SettingSectionPath<ExampleSettings>[]>(paths.sectionPaths);
    assertType<number>(paths.timeout);

    expect(paths).toEqual({
      leafPaths: ['Api.BaseUrl', 'Api.Retry.Count', 'Api.Timeout', 'Features.DarkMode', 'Tags'],
      retryCount: 3,
      sectionPaths: ['Api', 'Api.Retry', 'Features'],
      timeout: 5000,
    });
  });
});
