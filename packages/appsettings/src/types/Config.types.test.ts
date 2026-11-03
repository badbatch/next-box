import { describe, expect, it } from '@jest/globals';
import { type SettingPath, type SettingSectionPath, type SettingValue } from './Config.types.ts';

type ExampleSettings = {
  Api: { BaseUrl: string; Timeout: number };
  Features: { DarkMode: boolean };
  Tags: readonly string[];
};

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() =>
  Value extends Right ? 1 : 2
  ? (<Value>() => Value extends Right ? 1 : 2) extends <Value>() => Value extends Left ? 1 : 2
    ? true
    : false
  : false;

const validLeafPaths: Equal<SettingPath<ExampleSettings>, 'Api.BaseUrl' | 'Api.Timeout' | 'Features.DarkMode' | 'Tags'> = true;
const validSectionPaths: Equal<SettingSectionPath<ExampleSettings>, 'Api' | 'Features'> = true;
const validValueType: Equal<SettingValue<ExampleSettings, 'Api.Timeout'>, number> = true;

describe('configuration path types', () => {
  it('When evaluated by TypeScript, then they resolve leaf paths, section paths, and leaf values', () => {
    // Arrange
    const typeChecks = [validLeafPaths, validSectionPaths, validValueType];

    // Act
    const result = typeChecks.every(Boolean);

    // Assert
    expect(result).toBe(true);
  });
});
