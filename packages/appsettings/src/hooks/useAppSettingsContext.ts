import { createContext, use } from 'react';
import { type InternalAppSettings } from '#types/AppSettings.types.ts';
import { type AppSettingsSchema } from '../index.ts';

export const AppSettingsContext = createContext<unknown>(undefined);

export const useAppSettingsContext = <T extends object = AppSettingsSchema>(): InternalAppSettings<T> => {
  const settings = use(AppSettingsContext);

  if (!settings || typeof settings !== 'object') {
    throw new Error('useAppSettingsContext must be used within an <AppSettingsProvider>.');
  }

  // Context is untyped because each provider supplies a different schema.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return settings as InternalAppSettings<T>;
};
