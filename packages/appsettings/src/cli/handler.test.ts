import { afterEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { handler } from './handler.ts';

describe('generate-types handler', () => {
  let directory: string | undefined;
  let originalWorkingDirectory: string | undefined;

  afterEach(async () => {
    if (originalWorkingDirectory) {
      process.chdir(originalWorkingDirectory);
      originalWorkingDirectory = undefined;
    }

    if (directory) {
      await rm(directory, { force: true, recursive: true });
      directory = undefined;
    }
  });

  it('When called with schema and output paths, then it writes a relative type augmentation declaration', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-cli-'));
    originalWorkingDirectory = process.cwd();
    process.chdir(directory);

    const args = {
      output: 'src/types/appsettings.generated.d.ts',
      schema: 'src/appSettings.schema.ts',
      type: 'AppSettingsConfig',
    };

    // Act
    await handler(args);
    const contents = await readFile(args.output, 'utf8');

    // Assert
    expect(contents).toContain("import type { AppSettingsConfig } from '../appSettings.schema';");
    expect(contents).toContain("declare module '@next-box/appsettings'");
    expect(contents).toContain('interface AppSettingsSchema extends AppSettingsConfig {}');
  });

  it('When called again without changing its arguments, then it keeps the generated file contents unchanged', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-cli-'));
    originalWorkingDirectory = process.cwd();
    process.chdir(directory);
    const args = { output: 'generated.d.ts', schema: 'schema.ts', type: 'Settings' };
    await handler(args);
    const firstContents = await readFile(args.output, 'utf8');

    // Act
    await handler(args);
    const secondContents = await readFile(args.output, 'utf8');

    // Assert
    expect(secondContents).toBe(firstContents);
  });
});
