import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from '@jest/globals';
import { runAppsettingsCli } from './index.ts';

describe('runAppsettingsCli', () => {
  let directory: string | undefined;
  let originalWorkingDirectory: string | undefined;
  let originalArguments: string[] | undefined;

  afterEach(async () => {
    if (originalArguments) {
      process.argv = originalArguments;
      originalArguments = undefined;
    }

    if (originalWorkingDirectory) {
      process.chdir(originalWorkingDirectory);
      originalWorkingDirectory = undefined;
    }

    if (directory) {
      await rm(directory, { force: true, recursive: true });
      directory = undefined;
    }
  });

  it('When invoked with generate-types arguments, then it runs the command and writes the declaration', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-cli-'));
    originalWorkingDirectory = process.cwd();
    originalArguments = process.argv;
    process.chdir(directory);
    process.argv = ['node', 'appsettings', 'generate-types', 'schema.ts', 'generated.d.ts', '--type', 'Settings'];

    // Act
    await runAppsettingsCli();
    const contents = await readFile('generated.d.ts', 'utf8');

    // Assert
    expect(contents).toContain("import type { Settings } from './schema';");
    expect(contents).toContain('interface AppSettingsSchema extends Settings {}');
  });
});
