import callsites from 'callsites';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const md = <P extends string>(path: P): P => {
  if (!path) {
    throw new Error('md expected a path, but received none');
  }

  const filename = callsites()[0]?.getFileName();

  if (!filename) {
    throw new Error('md could not derive the filename of the caller');
  }

  const dir = dirname(filename);
  const fullPath = resolve(dir, path);
  // @ts-expect-error `md` function runs and build time and its return value
  // replaces the `md` invocation. We are forcing the return type to be the
  // input type to aid type inference when using `createI18n` and its
  // `tt` content resolvers.
  return readFileSync(fullPath, { encoding: 'utf8' }).trim();
};
