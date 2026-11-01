export { AppSettingsProvider } from '#components/AppSettingsProvider.tsx';
export { Setting } from '#components/Setting.tsx';
export { useAppSetting } from '#hooks/useAppSetting.ts';
export { useAppSettings } from '#hooks/useAppSettings.ts';
export type { AppSettings, ScopedSettings } from '#types/AppSettings.types.ts';
export type { SettingPath, SettingSectionPath, SettingValue } from '#types/Config.types.ts';

// Consumers can augment this interface through the package's public entry point.
export interface AppSettingsSchema {
  readonly __appSettingsSchema?: never;
}
