import { type Get } from 'type-fest';
import { useAppSettingsContext } from '#hooks/useAppSettingsContext.ts';
import { type SettingPath } from '#types/Config.types.ts';

export const createUseSetting = <T extends object>() => {
  return <P extends SettingPath<T>>(path: P): Get<T, P> | undefined => {
    const settings = useAppSettingsContext();
    // Assert the resolved setting type based on the caller-provided schema and path.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return settings.read(path) as Get<T, P> | undefined;
  };
};

export const createUseSettingOrThrow = <T extends object>() => {
  return <P extends SettingPath<T>>(path: P): Get<T, P> => {
    const settings = useAppSettingsContext();
    // Assert the resolved setting type based on the caller-provided schema and path.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const result = settings.read(path) as Get<T, P> | undefined;

    if (result === undefined) {
      throw new Error(`Setting "${path}" is undefined`);
    }

    return result;
  };
};
