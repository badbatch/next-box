/** @jest-environment node */

import { afterEach, describe, expect, it } from '@jest/globals';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadJson } from './loadJson.ts';

describe('loadJson', () => {
  let directory: string | undefined;

  afterEach(async () => {
    if (!directory) {
      return;
    }

    await rm(directory, { force: true, recursive: true });
    directory = undefined;
  });

  it('When the file contains a JSON object, then it returns the parsed object', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-json-'));
    const path = join(directory, 'settings.json');
    await writeFile(path, JSON.stringify({ Api: { Timeout: 5000 } }));

    // Act
    const result = await loadJson(path, false);

    // Assert
    expect(result).toEqual({ Api: { Timeout: 5000 } });
  });

  it('When an optional file does not exist, then it returns undefined', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-json-'));
    const path = join(directory, 'missing.json');

    // Act
    const result = await loadJson(path, true);

    // Assert
    expect(result).toBeUndefined();
  });

  it('When a required file does not exist, then it propagates the filesystem error', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-json-'));
    const path = join(directory, 'missing.json');

    // Act
    const result = loadJson(path, false);

    // Assert
    await expect(result).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('When the file contains malformed JSON or a non-object root, then it rejects', async () => {
    // Arrange
    directory = await mkdtemp(join(tmpdir(), 'appsettings-json-'));
    const malformedPath = join(directory, 'malformed.json');
    const arrayPath = join(directory, 'array.json');
    await writeFile(malformedPath, '{');
    await writeFile(arrayPath, '[]');

    // Act
    const malformed = loadJson(malformedPath, false);
    const array = loadJson(arrayPath, false);

    // Assert
    await expect(malformed).rejects.toBeInstanceOf(SyntaxError);
    await expect(array).rejects.toThrow('must contain an object at the root');
  });
});
