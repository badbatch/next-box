import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG_FILENAME } from '#constants.ts';
import { type MacrosConfig } from '#types.ts';

const cwd = process.cwd();

export const loadConfig = (): Partial<MacrosConfig> => {
  let config: Partial<MacrosConfig> = {};

  try {
    // JSON.parse returns an any time
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    config = JSON.parse(readFileSync(resolve(cwd, CONFIG_FILENAME), { encoding: 'utf8' })) as Partial<MacrosConfig>;
  } catch {
    // no catch
  }

  return config;
};
