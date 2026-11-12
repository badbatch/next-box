import { type Get } from 'type-fest';
import { type SettingSectionPath } from '#types/Config.types.ts';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

export const createUseAppSettings = <T extends object>() => {
  return <P extends SettingSectionPath<T>>(path: P): Get<T, P> | undefined => {
    const settings = useAppSettingsContext();
    // Assert the resolved settings type based on the caller-provided schema and path.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return settings.read(path) as Get<T, P> | undefined;
  };
};
