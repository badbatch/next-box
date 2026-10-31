import { type Get } from 'type-fest';
import { type AppSettingsSchema, type SettingPath } from '../types/Config.types.ts';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

export function useAppSetting<P extends SettingPath<AppSettingsSchema>>(path: P): Get<AppSettingsSchema, P> | undefined;
export function useAppSetting<T extends object, P extends SettingPath<T>>(path: P): Get<T, P> | undefined;

// Required for overloads
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function useAppSetting(path: string): unknown {
  const settings = useAppSettingsContext();
  return settings.read(path);
}
