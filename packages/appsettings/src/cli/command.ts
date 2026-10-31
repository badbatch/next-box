import { type CommandBuilder } from 'yargs';
import { type GenerateTypesArguments } from '#cli/handler.ts';

export const builder: CommandBuilder<object, GenerateTypesArguments> = yargs =>
  yargs
    .positional('schema', {
      demandOption: true,
      describe: 'TypeScript module that exports the inferred settings type.',
      type: 'string',
    })
    .positional('output', {
      default: 'appsettings.generated.d.ts',
      describe: 'Declaration file to generate.',
      type: 'string',
    })
    .option('type', {
      default: 'AppSettingsConfig',
      describe: 'Exported type name.',
      type: 'string',
    })
    .check(({ type }) => {
      if (!/^[A-Za-z_$][\w$]*$/u.test(type)) {
        throw new Error('--type must be a TypeScript identifier.');
      }

      return true;
    });

export const command = 'generate-types <schema> <output>';

export const describe = 'Generate a declaration that types appsettings hooks from your schema.';

export { handler } from './handler.ts';
