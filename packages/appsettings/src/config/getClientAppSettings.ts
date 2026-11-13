import { type ClientAppSettingsSnapshot } from '#types/ClientAppSettings.types.ts';
import { freezeDeep } from './helpers/freezeDeep.ts';

/** Call on the server before passing settings to any Client Component. */
export const getClientAppSettings = <T extends object>(settings: Readonly<T>): ClientAppSettingsSnapshot<T> => {
  const clientSettings = Object.fromEntries(Object.entries(settings).filter(([key]) => key !== 'Server'));

  // Object.fromEntries loses the known keys; filtering removes only the reserved Server key.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return freezeDeep(clientSettings) as ClientAppSettingsSnapshot<T>;
};
