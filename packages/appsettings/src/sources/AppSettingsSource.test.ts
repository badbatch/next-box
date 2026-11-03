/** @jest-environment node */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from '@jest/globals';
import { AppSettingsSource } from './AppSettingsSource.ts';

describe('AppSettingsSource', () => {
  let directory: string | undefined;

  afterEach(async () => {
    if (directory) {
      await rm(directory, { force: true, recursive: true });
      directory = undefined;
    }
  });

  it('When base and environment files exist, then the environment file overrides the base recursively', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-source-'));
    await writeFile(join(directory, 'appsettings.json'), JSON.stringify({ Api: { Timeout: 1000, Retry: 3 } }));
    await writeFile(join(directory, 'appsettings.test.json'), JSON.stringify({ Api: { Timeout: 5000 } }));
    const source = new AppSettingsSource({ directory, environment: 'test' });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({ Api: { Timeout: 5000, Retry: 3 } });
    expect(source.name).toBe('appsettings:test');
  });

  it('When the environment file is absent, then it returns the base file', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-source-'));
    await writeFile(join(directory, 'appsettings.json'), JSON.stringify({ App: { Name: 'Example' } }));
    const source = new AppSettingsSource({ directory, environment: 'test', name: 'custom' });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({ App: { Name: 'Example' } });
    expect(source.name).toBe('custom');
  });

  it('When the base file is absent, then loading rejects', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-source-'));
    const source = new AppSettingsSource({ directory, environment: 'test' });

    // Act
    const result = source.load();

    // Assert
    await expect(result).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
