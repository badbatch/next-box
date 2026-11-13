import { type Get } from 'type-fest';
import { type ClientAppSettings } from '#types/ClientAppSettings.types.ts';
import { type SettingSectionPath } from '#types/Config.types.ts';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

export const createUseAppSettings = <T extends object>() => {
  return <P extends SettingSectionPath<ClientAppSettings<T>>>(path: P): Get<ClientAppSettings<T>, P> | undefined => {
    const settings = useAppSettingsContext();
    // Assert the resolved settings type based on the caller-provided schema and path.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return settings.read(path) as Get<ClientAppSettings<T>, P> | undefined;
  };
};

export const createUseAppSettingsOrThrow = <T extends object>() => {
  return <P extends SettingSectionPath<ClientAppSettings<T>>>(path: P): Get<ClientAppSettings<T>, P> => {
    const settings = useAppSettingsContext();
    // Assert the resolved settings type based on the caller-provided schema and path.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const result = settings.read(path) as Get<ClientAppSettings<T>, P> | undefined;

    if (result === undefined) {
      throw new Error(`Setting "${path}" is undefined`);
    }

    return result;
  };
};
