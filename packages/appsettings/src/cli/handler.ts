import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';

const createModuleSpecifier = (path: string): string => {
  let specifier = path
    .split(sep)
    .join('/')
    .replace(/\.(?:[cm]?tsx?)$/u, '');

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`;
  }

  return specifier;
};

const isMissingFile = (error: unknown): boolean =>
  !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';

export interface GenerateTypesArguments {
  output: string;
  schema: string;
  type: string;
}

export const handler = async ({ output, schema, type }: GenerateTypesArguments) => {
  const schemaPath = resolve(process.cwd(), schema);
  const outputPath = resolve(process.cwd(), output);
  const schemaImportPath = createModuleSpecifier(relative(dirname(outputPath), schemaPath));

  const contents = [
    `import type { ${type} } from '${schemaImportPath}';`,
    '',
    "declare module '@next-box/appsettings' {",
    `  interface AppSettingsSchema extends ${type} {}`,
    '}',
    '',
    'export {};',
    '',
  ].join('\n');

  let existingContents: string | undefined;

  try {
    existingContents = await readFile(outputPath, 'utf8');
  } catch (error) {
    if (!isMissingFile(error)) {
      throw error;
    }
  }

  if (existingContents !== contents) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, contents, 'utf8');
  }

  process.stdout.write(`Generated ${relative(process.cwd(), outputPath)}\n`);
};
