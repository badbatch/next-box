import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const md = <P extends string>(path: P): P => {
  if (!path) {
    throw new Error('Tagged template expected a path, but received none');
  }

  const fullPath = resolve(process.cwd(), path);
  // @ts-expect-error `md` function runs and build time and its return value
  // replaces the `md` invocation. We are forcing the return type to be the
  // input type to aid type inference when using `createI18n` and its
  // `tt` content resolvers.
  return readFileSync(fullPath, { encoding: 'utf8' }).trim();
};
