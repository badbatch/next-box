import { describe, expect, it } from '@jest/globals';
import yargs, { type Argv } from 'yargs';
import * as generateTypesCommand from './command.ts';

describe('generate-types command', () => {
  it('When help is requested, then it displays the command usage and options', async () => {
    // @ts-expect-error not important in test
    const argv = generateTypesCommand.builder(yargs([])) as Argv;

    // Arrange
    const parser = argv
      .scriptName('appsettings')
      .usage(`$0 ${generateTypesCommand.command}`, generateTypesCommand.describe)
      .help();

    // Act
    const help = await parser.getHelp();

    // Assert
    expect(help).toMatchInlineSnapshot(`
      "appsettings generate-types <schema> <output>

      Generate a declaration that types appsettings hooks from your schema.

      Positionals:
        schema  TypeScript module that exports the inferred settings type.    [string]
        output  Declaration file to generate.
                                      [string] [default: "appsettings.generated.d.ts"]

      Options:
        --version  Show version number                                       [boolean]
        --type     Exported type name.         [string] [default: "AppSettingsConfig"]
        --help     Show help                                                 [boolean]"
    `);
  });
});
