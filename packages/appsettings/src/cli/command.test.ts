import { describe, expect, it } from '@jest/globals';
import { command, describe as commandDescription, builder } from './command.ts';

describe('generate-types command', () => {
  it('When registered with yargs, then it exposes its command, description, and positional arguments', () => {
    // Arrange
    const commandArguments = command;
    const description = commandDescription;
    const configuredBuilder = builder;

    // Act
    const result = { command: commandArguments, description, builder: configuredBuilder };

    // Assert
    expect(result.command).toBe('generate-types <schema> <output>');
    expect(result.description).toBe('Generate a declaration that types appsettings hooks from your schema.');
    expect(result.builder).toEqual(expect.any(Function));
  });
});
