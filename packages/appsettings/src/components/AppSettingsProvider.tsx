'use client';

import { type ReactElement, type ReactNode, useMemo } from 'react';
import { AppSettingsImplementation } from '#config/AppSettingsImplementation.ts';
import { type ClientAppSettingsSnapshot } from '#types/ClientAppSettings.types.ts';
import { AppSettingsContext } from '../hooks/useAppSettingsContext.ts';

export interface AppSettingsProviderProps<T extends object = object> {
  children: ReactNode;
  settings: ClientAppSettingsSnapshot<T>;
}

export const AppSettingsProvider = <T extends object>({
  children,
  settings,
}: AppSettingsProviderProps<T>): ReactElement => {
  if ('Server' in settings) {
    throw new Error(
      'Server settings cannot be passed to AppSettingsProvider. Call getClientAppSettings on the server before passing settings to a Client Component.',
    );
  }

  const appSettings = useMemo(() => new AppSettingsImplementation(settings), [settings]);
  return <AppSettingsContext value={appSettings}>{children}</AppSettingsContext>;
};
