// Applications extend this interface through declaration merging.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppSettingsSchema {}

export type { ClientAppSettings, ClientAppSettingsSnapshot } from '#types/ClientAppSettings.types.ts';
export { AppSettingsProvider } from '#components/AppSettingsProvider.tsx';
export { Setting } from '#components/Setting.tsx';
export { createUseSetting, createUseSettingOrThrow } from '#hooks/createUseSetting.ts';
export { createUseAppSettings, createUseAppSettingsOrThrow } from '#hooks/createUseAppSettings.ts';
export { useAppSettingsContext } from '#hooks/useAppSettingsContext.ts';
export type { AppSettings, ScopedSettings } from '#types/AppSettings.types.ts';
export type { SettingPath, SettingSectionPath, SettingValue } from '#types/Config.types.ts';
