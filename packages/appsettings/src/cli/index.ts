import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as generateTypesCommand from './command.ts';

export const runAppsettingsCli = async (): Promise<void> => {
  await yargs(hideBin(process.argv))
    .scriptName('appsettings')
    .command(generateTypesCommand)
    .demandCommand(1, 'Choose a command to run.')
    .strict()
    .help()
    .parseAsync();
};
