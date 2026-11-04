import { readFile } from 'node:fs/promises';
import { isPlainObject } from 'remeda';

export function loadJson(path: string, isOptional: false): Promise<Record<string, unknown>>;
export function loadJson(path: string, isOptional: true): Promise<Record<string, unknown> | undefined>;

// Required for overloads
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export async function loadJson(path: string, isOptional: boolean): Promise<Record<string, unknown> | undefined> {
  let contents: string;

  try {
    contents = await readFile(path, 'utf8');
  } catch (error) {
    if (isOptional && typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }

  const value: unknown = JSON.parse(contents);

  if (!isPlainObject(value)) {
    throw new Error(`JSON settings from "${path}" must contain an object at the root.`);
  }

  return value;
}
