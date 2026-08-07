import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig } from '#helpers/loadConfig.ts';

const { NEXT_PUBLIC_LANGUAGE_CODE } = process.env;

export const md = <P extends string>(path: P): P => {
  if (!path) {
    throw new Error('md expected a path, but received none');
  }

  let dir = process.cwd();
  let { markdownDir } = loadConfig();

  if (markdownDir) {
    if (NEXT_PUBLIC_LANGUAGE_CODE) {
      markdownDir = markdownDir.replaceAll('{{NEXT_PUBLIC_LANGUAGE_CODE}}', () => NEXT_PUBLIC_LANGUAGE_CODE);
    }

    dir = resolve(dir, markdownDir);
  }

  const fullPath = resolve(dir, path);
  // @ts-expect-error `md` function runs and build time and its return value
  // replaces the `md` invocation. We are forcing the return type to be the
  // input type to aid type inference when using `createI18n` and its
  // `tt` content resolvers.
  return readFileSync(fullPath, { encoding: 'utf8' }).trim();
};
