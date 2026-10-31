'use client';

import { type ReactElement, type ReactNode, useMemo } from 'react';
import { AppSettingsImplementation } from '#config/AppSettingsImplementation.ts';
import { AppSettingsContext } from '../hooks/useAppSettingsContext.ts';

export interface AppSettingsProviderProps<T extends object = object> {
  children: ReactNode;
  settings: Readonly<T>;
}

export const AppSettingsProvider = <T extends object>({
  children,
  settings,
}: AppSettingsProviderProps<T>): ReactElement => {
  const appSettings = useMemo(() => new AppSettingsImplementation(settings), [settings]);
  return <AppSettingsContext value={appSettings}>{children}</AppSettingsContext>;
};
