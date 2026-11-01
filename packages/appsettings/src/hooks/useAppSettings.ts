import { type Get } from 'type-fest';
import { type SettingSectionPath } from '#types/Config.types.ts';
import { type AppSettingsSchema } from '../index.ts';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

export function useAppSettings<P extends SettingSectionPath<AppSettingsSchema>>(
  path: P,
): Get<AppSettingsSchema, P> | undefined;

export function useAppSettings<T extends object, P extends SettingSectionPath<T>>(path: P): Get<T, P> | undefined;

// Required for overloads
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function useAppSettings(path: string): unknown {
  const settings = useAppSettingsContext();
  return settings.read(path);
}
